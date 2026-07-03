"""THD GmbH predictive-maintenance showcase API.

End-to-end pipeline: a background simulator streams physics-shaped turbine
telemetry, an IsolationForest scores every sample for anomalies, and a
gradient-boosted regressor predicts remaining useful life (RUL) on demand.

Runs as a systemd service on the ClerkTree Oracle VPS (port 8100) and is
consumed by clerktree.com/thd through a Netlify proxy.
"""

from __future__ import annotations

import asyncio
import time
from collections import deque
from contextlib import asynccontextmanager

import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models import (
    FEATURE_NAMES,
    HEALTHY_MEAN,
    HEALTHY_STD,
    train_anomaly_detector,
    train_rul_regressor,
)

TICK_SECONDS = 2.0
BUFFER_SAMPLES = 600  # ~20 minutes of history per turbine
FAULT_DURATION_S = 90.0
TOTAL_LIFE_H = 4200.0

FAULT_PROFILES = {
    # feature deltas at full severity: temp, vib, load, rpm, oil
    "bearing_overheat": np.array([26.0, 3.2, 0.0, -40.0, -0.3]),
    "rotor_imbalance": np.array([6.0, 5.5, -8.0, -120.0, 0.0]),
    "oil_leak": np.array([9.0, 1.1, 0.0, 0.0, -1.6]),
}


class Turbine:
    def __init__(self, turbine_id: str, name: str, wear: float, rng_seed: int):
        self.id = turbine_id
        self.name = name
        self.wear = wear
        self.rng = np.random.default_rng(rng_seed)
        self.buffer: deque[dict] = deque(maxlen=BUFFER_SAMPLES)
        self.fault: dict | None = None

    def fault_severity(self, now: float) -> float:
        if not self.fault:
            return 0.0
        elapsed = now - self.fault["started_at"]
        if elapsed > FAULT_DURATION_S:
            self.fault = None
            return 0.0
        # ramp up fast, decay slow
        return float(np.clip(elapsed / 8.0, 0.0, 1.0) * (1.0 - elapsed / FAULT_DURATION_S) ** 0.4)

    def sample(self, now: float) -> np.ndarray:
        base = self.rng.normal(HEALTHY_MEAN, HEALTHY_STD * 0.6)
        # wear pushes the same directions the RUL model was trained on
        wear_delta = np.array(
            [34.0 * self.wear**1.6, 6.5 * self.wear**2.0, 0.0, -90.0 * self.wear, -1.9 * self.wear**1.3]
        )
        severity = self.fault_severity(now)
        fault_delta = FAULT_PROFILES[self.fault["type"]] * severity if self.fault else 0.0
        return base + wear_delta + fault_delta


FLEET = [
    Turbine("thd-01", "Turbine A1 — Deggendorf North", wear=0.08, rng_seed=101),
    Turbine("thd-02", "Turbine A2 — Deggendorf North", wear=0.31, rng_seed=202),
    Turbine("thd-03", "Turbine B1 — Plattling Riverside", wear=0.64, rng_seed=303),
    Turbine("thd-04", "Turbine B2 — Plattling Riverside", wear=0.22, rng_seed=404),
]

STATE: dict = {"anomalies": deque(maxlen=200), "started_at": None, "ticks": 0}


def _score_and_store(turbine: Turbine, features: np.ndarray, now: float) -> None:
    raw = float(STATE["anomaly_model"].decision_function(features.reshape(1, -1))[0])
    is_anomaly = raw < 0.0
    record = {
        "t": round(now, 1),
        **{name: round(float(v), 2) for name, v in zip(FEATURE_NAMES, features)},
        "anomaly_score": round(raw, 4),
        "is_anomaly": is_anomaly,
    }
    turbine.buffer.append(record)
    if is_anomaly:
        STATE["anomalies"].appendleft(
            {
                "turbine_id": turbine.id,
                "turbine_name": turbine.name,
                "t": round(now, 1),
                "score": round(raw, 4),
                "fault_type": turbine.fault["type"] if turbine.fault else "drift",
                "snapshot": {name: round(float(v), 2) for name, v in zip(FEATURE_NAMES, features)},
            }
        )


async def _simulator_loop() -> None:
    while True:
        now = time.time()
        for turbine in FLEET:
            turbine.wear = min(0.98, turbine.wear + 1e-6)  # slow ageing
            _score_and_store(turbine, turbine.sample(now), now)
        STATE["ticks"] += 1
        await asyncio.sleep(TICK_SECONDS)


@asynccontextmanager
async def lifespan(app: FastAPI):
    STATE["anomaly_model"] = train_anomaly_detector()
    STATE["rul_model"] = train_rul_regressor()
    STATE["started_at"] = time.time()
    # pre-fill buffers so the dashboard has history at first paint
    backfill_start = time.time() - BUFFER_SAMPLES * TICK_SECONDS
    for i in range(120):
        t = backfill_start + i * TICK_SECONDS
        for turbine in FLEET:
            _score_and_store(turbine, turbine.sample(t), t)
    task = asyncio.create_task(_simulator_loop())
    yield
    task.cancel()


app = FastAPI(title="THD Predictive Maintenance API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def _get_turbine(turbine_id: str) -> Turbine:
    for turbine in FLEET:
        if turbine.id == turbine_id:
            return turbine
    raise HTTPException(status_code=404, detail=f"unknown turbine {turbine_id}")


def _predict(turbine: Turbine) -> dict:
    if not turbine.buffer:
        raise HTTPException(status_code=503, detail="simulator warming up")
    recent = list(turbine.buffer)[-15:]
    mean_features = np.array([[r[name] for name in FEATURE_NAMES] for r in recent]).mean(axis=0)
    rul_h = float(STATE["rul_model"].predict(mean_features.reshape(1, -1))[0])
    rul_h = max(0.0, min(TOTAL_LIFE_H, rul_h))
    anomaly_rate = sum(r["is_anomaly"] for r in recent) / len(recent)
    health = max(0.0, min(1.0, (rul_h / TOTAL_LIFE_H) * (1.0 - 0.6 * anomaly_rate)))
    # simple attribution: which feature deviates most from healthy, in sigmas
    sigmas = (mean_features - HEALTHY_MEAN) / HEALTHY_STD
    driver_idx = int(np.argmax(np.abs(sigmas)))
    return {
        "turbine_id": turbine.id,
        "rul_hours": round(rul_h, 1),
        "rul_days": round(rul_h / 24.0, 1),
        "health_score": round(health, 3),
        "anomaly_rate_recent": round(anomaly_rate, 3),
        "failure_risk_90d": round(float(np.clip(1.0 - rul_h / (90 * 24), 0.0, 1.0)), 3),
        "primary_driver": FEATURE_NAMES[driver_idx],
        "driver_deviation_sigma": round(float(sigmas[driver_idx]), 2),
        "recommendation": (
            "Schedule bearing inspection within 2 weeks"
            if rul_h < 900
            else "Plan maintenance at next service window"
            if rul_h < 2200
            else "No action required"
        ),
    }


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "uptime_s": round(time.time() - STATE["started_at"], 1) if STATE["started_at"] else 0,
        "ticks": STATE["ticks"],
        "models": ["isolation_forest_v1", "gbrt_rul_v1"],
    }


@app.get("/api/turbines")
def turbines() -> dict:
    fleet = []
    for turbine in FLEET:
        prediction = _predict(turbine)
        last = turbine.buffer[-1]
        fleet.append(
            {
                "id": turbine.id,
                "name": turbine.name,
                "active_fault": turbine.fault["type"] if turbine.fault else None,
                "last_sample": last,
                **prediction,
            }
        )
    return {"fleet": fleet, "generated_at": round(time.time(), 1)}


@app.get("/api/telemetry/{turbine_id}")
def telemetry(turbine_id: str, window: int = 150) -> dict:
    turbine = _get_turbine(turbine_id)
    samples = list(turbine.buffer)[-max(10, min(window, BUFFER_SAMPLES)) :]
    return {"turbine_id": turbine.id, "name": turbine.name, "samples": samples}


@app.get("/api/predict/{turbine_id}")
def predict(turbine_id: str) -> dict:
    return _predict(_get_turbine(turbine_id))


@app.get("/api/anomalies")
def anomalies(limit: int = 25) -> dict:
    return {"events": list(STATE["anomalies"])[: max(1, min(limit, 200))]}


@app.post("/api/fault/{turbine_id}")
def inject_fault(turbine_id: str, fault_type: str = "bearing_overheat") -> dict:
    if fault_type not in FAULT_PROFILES:
        raise HTTPException(status_code=422, detail=f"fault_type must be one of {list(FAULT_PROFILES)}")
    turbine = _get_turbine(turbine_id)
    turbine.fault = {"type": fault_type, "started_at": time.time()}
    return {"injected": fault_type, "turbine_id": turbine.id, "duration_s": FAULT_DURATION_S}
