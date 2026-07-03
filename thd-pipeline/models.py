"""Model training for the THD predictive-maintenance pipeline.

Both models are trained on synthetic-but-physical degradation data at
service startup (seeded, deterministic) so the VPS needs no model
artifacts on disk and no external data dependencies.
"""

from __future__ import annotations

import numpy as np
from sklearn.ensemble import GradientBoostingRegressor, IsolationForest

RNG_SEED = 42

# Healthy operating envelope per feature:
# bearing_temp_c, vibration_rms, load_pct, rpm, oil_pressure_bar
HEALTHY_MEAN = np.array([62.0, 2.1, 71.0, 1480.0, 4.6])
HEALTHY_STD = np.array([4.5, 0.45, 9.0, 55.0, 0.28])

FEATURE_NAMES = ["bearing_temp_c", "vibration_rms", "load_pct", "rpm", "oil_pressure_bar"]


def _healthy_samples(rng: np.random.Generator, n: int) -> np.ndarray:
    return rng.normal(HEALTHY_MEAN, HEALTHY_STD, size=(n, len(HEALTHY_MEAN)))


def _wear_deltas(wear: np.ndarray) -> np.ndarray:
    """Feature shift caused by normal degradation (same curve the simulator uses)."""
    return np.column_stack(
        [
            34.0 * wear**1.6,
            6.5 * wear**2.0,
            np.zeros_like(wear),
            -90.0 * wear,
            -1.9 * wear**1.3,
        ]
    )


def train_anomaly_detector() -> IsolationForest:
    """Anomaly = fault signature, not ordinary ageing.

    The training distribution spans the normal degradation envelope (wear up
    to 0.8), so a worn-but-stable turbine scores normal while fault spikes
    (overheat, imbalance, oil loss) land outside the learned support.
    """
    rng = np.random.default_rng(RNG_SEED)
    n = 8000
    wear = rng.uniform(0.0, 0.8, n)
    X = _healthy_samples(rng, n) + _wear_deltas(wear)
    model = IsolationForest(n_estimators=200, contamination=0.01, random_state=RNG_SEED)
    model.fit(X)
    return model


def train_rul_regressor() -> GradientBoostingRegressor:
    """RUL model: hours of remaining useful life from degradation features.

    Synthetic ground truth follows an exponential wear curve — bearing temp
    and vibration rise while oil pressure falls as a component approaches
    end of life, which mirrors how real turbine bearing failures present.
    """
    rng = np.random.default_rng(RNG_SEED)
    n = 8000
    # wear in [0, 1]: 0 = new, 1 = failure
    wear = rng.uniform(0.0, 1.0, n)
    temp = 62.0 + 34.0 * wear**1.6 + rng.normal(0, 2.5, n)
    vib = 2.1 + 6.5 * wear**2.0 + rng.normal(0, 0.3, n)
    load = rng.normal(71.0, 9.0, n)
    rpm = 1480.0 - 90.0 * wear + rng.normal(0, 40.0, n)
    oil = 4.6 - 1.9 * wear**1.3 + rng.normal(0, 0.15, n)

    X = np.column_stack([temp, vib, load, rpm, oil])
    total_life_h = 4200.0
    y = total_life_h * (1.0 - wear) + rng.normal(0, 60.0, n)
    y = np.clip(y, 0.0, total_life_h)

    model = GradientBoostingRegressor(
        n_estimators=300, max_depth=3, learning_rate=0.06, random_state=RNG_SEED
    )
    model.fit(X, y)
    return model
