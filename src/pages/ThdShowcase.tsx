import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// Dev hits the VPS directly (API allows CORS); production goes through the
// Netlify proxy so everything stays on the HTTPS origin.
const API_BASE = import.meta.env.DEV ? 'http://140.238.254.77:8100' : '/thd-api';

const ACCENT = '#ff4d00';
const POLL_MS = 3000;

interface Prediction {
  id: string;
  name: string;
  rul_hours: number;
  rul_days: number;
  health_score: number;
  failure_risk_90d: number;
  primary_driver: string;
  driver_deviation_sigma: number;
  recommendation: string;
  active_fault: string | null;
}

interface Sample {
  t: number;
  bearing_temp_c: number;
  vibration_rms: number;
  load_pct: number;
  rpm: number;
  oil_pressure_bar: number;
  anomaly_score: number;
  is_anomaly: boolean;
}

interface AnomalyEvent {
  turbine_id: string;
  turbine_name: string;
  t: number;
  score: number;
  fault_type: string;
}

const FAULTS = [
  { key: 'bearing_overheat', label: 'Bearing overheat' },
  { key: 'rotor_imbalance', label: 'Rotor imbalance' },
  { key: 'oil_leak', label: 'Oil leak' },
] as const;

const DRIVER_LABELS: Record<string, string> = {
  bearing_temp_c: 'Bearing temperature',
  vibration_rms: 'Vibration (RMS)',
  load_pct: 'Load',
  rpm: 'Rotor speed',
  oil_pressure_bar: 'Oil pressure',
};

function healthColor(score: number): string {
  if (score > 0.6) return '#3ddc84';
  if (score > 0.35) return '#ffb020';
  return ACCENT;
}

function useFleet() {
  const [fleet, setFleet] = useState<Prediction[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyEvent[]>([]);
  const [online, setOnline] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        const [fleetRes, anomalyRes] = await Promise.all([
          fetch(`${API_BASE}/api/turbines`),
          fetch(`${API_BASE}/api/anomalies?limit=12`),
        ]);
        if (!fleetRes.ok || !anomalyRes.ok) throw new Error('api error');
        const fleetJson = await fleetRes.json();
        const anomalyJson = await anomalyRes.json();
        if (cancelled) return;
        setFleet(fleetJson.fleet);
        setAnomalies(anomalyJson.events);
        setOnline(true);
      } catch {
        if (!cancelled) setOnline(false);
      }
    };
    poll();
    const timer = window.setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  return { fleet, anomalies, online };
}

function useTelemetry(turbineId: string) {
  const [samples, setSamples] = useState<Sample[]>([]);

  useEffect(() => {
    let cancelled = false;
    setSamples([]);
    const poll = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/telemetry/${turbineId}?window=150`);
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled) setSamples(json.samples);
      } catch {
        /* transient network errors surface via the fleet online flag */
      }
    };
    poll();
    const timer = window.setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [turbineId]);

  return samples;
}

function HealthRing({ score }: { score: number }) {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const color = healthColor(score);
  return (
    <svg height="64" viewBox="0 0 64 64" width="64">
      <circle cx="32" cy="32" fill="none" r={radius} stroke="rgba(255,255,255,0.12)" strokeWidth="5" />
      <circle
        cx="32"
        cy="32"
        fill="none"
        r={radius}
        stroke={color}
        strokeDasharray={`${circumference * score} ${circumference}`}
        strokeLinecap="round"
        strokeWidth="5"
        transform="rotate(-90 32 32)"
      />
      <text fill="#fff" fontSize="14" fontWeight="700" textAnchor="middle" x="32" y="37">
        {Math.round(score * 100)}
      </text>
    </svg>
  );
}

export default function ThdShowcase() {
  const { fleet, anomalies, online } = useFleet();
  const [selectedId, setSelectedId] = useState('thd-03');
  const [injecting, setInjecting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const noticeTimer = useRef<number>();
  const samples = useTelemetry(selectedId);

  const selected = fleet.find((t) => t.id === selectedId);

  const chartData = useMemo(
    () =>
      samples.map((s) => ({
        ...s,
        time: new Date(s.t * 1000).toLocaleTimeString('en-GB', {
          minute: '2-digit',
          second: '2-digit',
        }),
      })),
    [samples],
  );

  const injectFault = useCallback(
    async (faultType: string) => {
      setInjecting(true);
      try {
        const res = await fetch(`${API_BASE}/api/fault/${selectedId}?fault_type=${faultType}`, {
          method: 'POST',
        });
        if (!res.ok) throw new Error('inject failed');
        setNotice(`${faultType.replace('_', ' ')} injected — watch the vibration channel`);
      } catch {
        setNotice('Fault injection failed — API unreachable');
      } finally {
        setInjecting(false);
        window.clearTimeout(noticeTimer.current);
        noticeTimer.current = window.setTimeout(() => setNotice(null), 6000);
      }
    },
    [selectedId],
  );

  return (
    <main className="min-h-screen bg-[#0b0b0b] px-4 pb-20 pt-10 text-white sm:px-8" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 border-b border-white/10 pb-8">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-white/50">
            ClerkTree × THD GmbH — live pipeline demo
          </p>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Turbine Fleet <span style={{ color: ACCENT }}>Command</span>
            </h1>
            <div className="flex items-center gap-2 font-mono text-xs text-white/60">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: online === false ? ACCENT : '#3ddc84' }}
              />
              {online === null ? 'connecting…' : online ? 'models online — Oracle Cloud Mumbai' : 'API offline'}
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/60">
            Real telemetry stream, real inference: an isolation forest flags fault signatures while a
            gradient-boosted model predicts remaining useful life for every unit — end to end from our
            Oracle VPS to this page.
          </p>
        </header>

        <section aria-label="Fleet overview" className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(fleet.length ? fleet : Array.from({ length: 4 })).map((t, i) => {
            const turbine = t as Prediction | undefined;
            if (!turbine?.id) {
              return <div key={i} className="h-40 animate-pulse rounded-2xl border border-white/10 bg-white/5" />;
            }
            const isSelected = turbine.id === selectedId;
            return (
              <button
                key={turbine.id}
                className="rounded-2xl border p-4 text-left transition-colors"
                onClick={() => setSelectedId(turbine.id)}
                style={{
                  background: isSelected ? 'rgba(255,77,0,0.08)' : 'rgba(255,255,255,0.03)',
                  borderColor: isSelected ? ACCENT : 'rgba(255,255,255,0.1)',
                }}
                type="button"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-white/45">{turbine.id}</p>
                    <p className="mt-1 text-sm font-semibold leading-tight">{turbine.name}</p>
                  </div>
                  <HealthRing score={turbine.health_score} />
                </div>
                <div className="mt-3 flex items-center justify-between font-mono text-xs text-white/60">
                  <span>RUL {turbine.rul_days}d</span>
                  <span>risk {(turbine.failure_risk_90d * 100).toFixed(0)}%</span>
                </div>
                {turbine.active_fault && (
                  <p className="mt-2 inline-block rounded-full px-2 py-0.5 font-mono text-[10px] uppercase" style={{ background: 'rgba(255,77,0,0.18)', color: ACCENT }}>
                    fault: {turbine.active_fault.replace('_', ' ')}
                  </p>
                )}
              </button>
            );
          })}
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
          <section aria-label="Live telemetry" className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-white/45">live telemetry — 2s cadence</p>
                <h2 className="text-lg font-semibold">{selected?.name ?? '—'}</h2>
              </div>
              <div className="flex gap-2">
                {FAULTS.map((f) => (
                  <button
                    key={f.key}
                    className="rounded-full border border-white/15 px-3 py-1.5 font-mono text-[11px] text-white/80 transition-colors hover:border-[#ff4d00] hover:text-white disabled:opacity-40"
                    disabled={injecting}
                    onClick={() => injectFault(f.key)}
                    type="button"
                  >
                    ⚡ {f.label}
                  </button>
                ))}
              </div>
            </div>
            {notice && (
              <p className="mb-3 rounded-lg px-3 py-2 font-mono text-xs" style={{ background: 'rgba(255,77,0,0.12)', color: '#ffb499' }}>
                {notice}
              </p>
            )}
            <div className="h-64">
              <ResponsiveContainer height="100%" width="100%">
                <LineChart data={chartData} margin={{ top: 6, right: 8, bottom: 0, left: -18 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="time" minTickGap={48} stroke="rgba(255,255,255,0.35)" tick={{ fontSize: 10 }} />
                  <YAxis stroke="rgba(255,255,255,0.35)" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ background: '#161616', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, fontSize: 12 }}
                    labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
                  />
                  <Line dataKey="vibration_rms" dot={false} isAnimationActive={false} name="Vibration RMS" stroke={ACCENT} strokeWidth={2} />
                  <Line dataKey="oil_pressure_bar" dot={false} isAnimationActive={false} name="Oil pressure" stroke="#3ddc84" strokeWidth={1.5} />
                  {chartData.filter((d) => d.is_anomaly).map((d) => (
                    <ReferenceDot key={d.t} fill={ACCENT} r={4} stroke="#fff" strokeWidth={1} x={d.time} y={d.vibration_rms} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 h-40">
              <ResponsiveContainer height="100%" width="100%">
                <LineChart data={chartData} margin={{ top: 6, right: 8, bottom: 0, left: -18 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="time" minTickGap={48} stroke="rgba(255,255,255,0.35)" tick={{ fontSize: 10 }} />
                  <YAxis domain={['auto', 'auto']} stroke="rgba(255,255,255,0.35)" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ background: '#161616', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, fontSize: 12 }}
                    labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
                  />
                  <Line dataKey="bearing_temp_c" dot={false} isAnimationActive={false} name="Bearing °C" stroke="#ffb020" strokeWidth={1.5} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <div className="flex flex-col gap-6">
            {selected && (
              <section aria-label="Model prediction" className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-white/45">gbrt rul model — live inference</p>
                <p className="mt-3 text-4xl font-bold" style={{ color: healthColor(selected.health_score) }}>
                  {selected.rul_days}<span className="ml-1 text-base font-medium text-white/50">days RUL</span>
                </p>
                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <dt className="text-white/55">90-day failure risk</dt>
                    <dd className="font-mono">{(selected.failure_risk_90d * 100).toFixed(1)}%</dd>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <dt className="text-white/55">Primary driver</dt>
                    <dd className="font-mono">{DRIVER_LABELS[selected.primary_driver] ?? selected.primary_driver}</dd>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <dt className="text-white/55">Deviation</dt>
                    <dd className="font-mono">{selected.driver_deviation_sigma}σ</dd>
                  </div>
                </dl>
                <p className="mt-4 rounded-lg bg-white/5 px-3 py-2 text-xs leading-relaxed text-white/70">
                  {selected.recommendation}
                </p>
              </section>
            )}

            <section aria-label="Anomaly feed" className="flex-1 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-white/45">
                isolation forest — anomaly feed
              </p>
              {anomalies.length === 0 ? (
                <p className="text-sm text-white/40">No fault signatures detected. Inject one to see the pipeline react.</p>
              ) : (
                <ul className="space-y-2">
                  {anomalies.slice(0, 8).map((event) => (
                    <li key={`${event.turbine_id}-${event.t}`} className="rounded-lg border border-white/8 bg-black/30 px-3 py-2">
                      <div className="flex items-center justify-between font-mono text-[11px]">
                        <span style={{ color: ACCENT }}>{event.fault_type.replace('_', ' ')}</span>
                        <span className="text-white/40">
                          {new Date(event.t * 1000).toLocaleTimeString('en-GB')}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-white/65">
                        {event.turbine_name} — score {event.score}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>

        <footer className="mt-10 border-t border-white/10 pt-6 text-center font-mono text-[11px] text-white/35">
          FastAPI · scikit-learn · Oracle Cloud (ap-mumbai-1) · Netlify edge proxy — a ClerkTree industrial AI showcase
        </footer>
      </div>
    </main>
  );
}
