// Scenes used only by the homepage solutions grid (none repeat the rest of the page):
// connector hub, week planner, plant floor map, manual extraction.
import { type CSSProperties } from 'react';
import { CalendarRange, FileSearch, Map as MapIcon, Plug } from 'lucide-react';
import { siAbb, siBosch, siMitsubishi, siSchneiderelectric, siSiemens, type SimpleIcon } from 'simple-icons';
import { useLanguage } from '../../contexts/LanguageContext';
import ClerkTreeLogo from '../../components/Brand/ClerkTreeLogo';
import { Seed, TYPE_MS, at, useLoop } from '../home/StoryScenes';

export function BrandMark({ icon, size = 14 }: { icon: SimpleIcon; size?: number }) {
  return (
    <svg className="cs-brand" viewBox="0 0 24 24" width={size} height={size} role="img" aria-label={icon.title}>
      <path d={icon.path} fill="currentColor" />
    </svg>
  );
}

const useDe = () => useLanguage().language === 'de';

/* ---------- Connector hub ---------- */

const MACHINES: [SimpleIcon, string, string][] = [
  [siSiemens, 'S7-1500 PLC', 'PROFINET'],
  [siAbb, 'IRB 6700 robot', 'OPC UA'],
  [siBosch, 'Rexroth IndraDrive', 'Modbus TCP'],
  [siMitsubishi, 'MELSEC iQ-R', 'OPC UA'],
  [siSchneiderelectric, 'Modicon M580', 'MQTT'],
];

export function ConnectorHubScene() {
  const de = useDe();
  const seed = de ? 'Linie 2 verbinden' : 'Connect Line 2';
  const total = 9000;
  const [ms, ref] = useLoop(total);
  const start = seed.length * TYPE_MS + 250;
  const linked = Math.floor((ms - start) / 520);
  const done = linked >= MACHINES.length;
  const tags = Math.round(1284 * at(ms, start, MACHINES.length * 520 + 800));
  return (
    <div className="hs-crt hs-scene" ref={ref}>
      <Seed icon={<Plug size={14} strokeWidth={1.75} />} text={seed} ms={ms}
        slot={done ? (de ? `${tags.toLocaleString('de-DE')} Tags live` : `${tags.toLocaleString('en-US')} tags live`) : (de ? '5 Maschinen zuordnen' : 'Mapping 5 machines')}
        slotState={done ? 'is-done' : ''} />
      <div className="cs-hub">
        <div className="cs-hub-rows">
          {MACHINES.map(([icon, model, proto], i) => (
            <div className={`cs-hub-row${i < linked ? ' is-on' : ''}`} key={model} style={{ '--i': i } as CSSProperties}>
              <span className="cs-hub-logo"><BrandMark icon={icon} size={15} /></span>
              <span className="cs-hub-name"><strong>{icon.title}</strong><small>{model}</small></span>
              <span className="cs-hub-proto">{proto}</span>
              <span className="cs-hub-wire"><i /></span>
            </div>
          ))}
        </div>
        <div className={`cs-hub-core${done ? ' is-done' : ''}`}>
          <span className="cs-hub-mark"><ClerkTreeLogo markClassName="cs-hub-svg" labelClassName="sr-only" /></span>
          <strong>{tags.toLocaleString(de ? 'de-DE' : 'en-US')}</strong>
          <small>{de ? 'Signale / min' : 'signals / min'}</small>
        </div>
      </div>
    </div>
  );
}

/* ---------- Week planner ---------- */

type Job = { row: number; day: number; len: number; label: string; hot?: boolean; moveTo?: [number, number] };
const JOBS: Job[] = [
  { row: 0, day: 0, len: 1, label: 'Press PM' },
  { row: 1, day: 1, len: 2, label: 'Robot cell audit' },
  { row: 2, day: 3, len: 2, label: 'Coolant change' },
  { row: 0, day: 2, len: 2, label: 'CNC-07 bearing', hot: true, moveTo: [0, 1] },
  { row: 2, day: 0, len: 2, label: 'Line 2 calibration' },
];

export function WeekPlannerScene() {
  const de = useDe();
  const seed = de ? 'Wartung KW 46 planen' : 'Plan maintenance, week 46';
  const total = 9500;
  const [ms, ref] = useLoop(total);
  const start = seed.length * TYPE_MS + 250;
  const placed = Math.floor((ms - start) / 480);
  const conflictAt = start + 3 * 480 + 200;
  const resolved = ms > conflictAt + 1500;
  const synced = ms > conflictAt + 2300;
  const days = de ? ['Mo', 'Di', 'Mi', 'Do', 'Fr'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const people = ['M. Huber', 'S. Klein', 'J. Wolf'];
  return (
    <div className="hs-crt hs-scene" ref={ref}>
      <Seed icon={<CalendarRange size={14} strokeWidth={1.75} />} text={seed} ms={ms}
        slot={synced ? (de ? 'Mit SAP PM synchronisiert' : 'Synced to SAP PM') : (de ? 'Plant 5 Aufträge' : 'Scheduling 5 jobs')}
        slotState={synced ? 'is-done' : ''} />
      <div className="cs-week">
        <div className="cs-week-head"><span />{days.map((d) => <span key={d}>{d}</span>)}</div>
        {people.map((p, r) => (
          <div className="cs-week-row" key={p}>
            <span className="cs-week-who"><i>{p.split(' ')[1][0]}</i>{p}</span>
            <div className="cs-week-track">
              {JOBS.map((j, i) => {
                if (j.row !== r && !(j.moveTo && resolved && j.moveTo[0] === r)) return null;
                const day = j.moveTo && resolved ? j.moveTo[1] : j.day;
                const clash = j.hot && !resolved && ms > conflictAt;
                return (
                  <span
                    className={`cs-job${i < placed ? ' is-in' : ''}${j.hot ? ' is-hot' : ''}${clash ? ' is-clash' : ''}`}
                    key={j.label}
                    style={{ left: `${day * 20}%`, width: `calc(${j.len * 20}% - 4px)` }}
                  >
                    {j.label}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className={`hs-sig-finding${resolved ? ' is-in' : ''}`}>
        <CalendarRange size={14} strokeWidth={1.75} />
        {de ? 'Konflikt mit Pressen-Wartung gelöst: CNC-07 auf Di 06:00 verschoben.' : 'Clash with the press PM resolved: CNC-07 moved to Tue 06:00.'}
      </div>
    </div>
  );
}

/* ---------- Plant floor map ---------- */

const FLOOR = Array.from({ length: 24 }, (_, i) => ({ id: `M${String(i + 1).padStart(2, '0')}`, state: i === 9 ? 'crit' : i === 15 || i === 4 ? 'watch' : 'ok' }));

export function FloorMapScene() {
  const de = useDe();
  const seed = de ? 'Werk Straubing, Halle B' : 'Plant Straubing, Hall B';
  const total = 8800;
  const [ms, ref] = useLoop(total);
  const start = seed.length * TYPE_MS + 250;
  const sweep = at(ms, start, 2600);
  const done = sweep >= 1;
  return (
    <div className="hs-crt hs-scene" ref={ref}>
      <Seed icon={<MapIcon size={14} strokeWidth={1.75} />} text={seed} ms={ms}
        slot={done ? (de ? '1 Anlage kritisch' : '1 asset critical') : (de ? 'Prüft 24 Anlagen' : 'Scanning 24 assets')}
        slotState={done ? 'is-hot' : ''} />
      <div className="cs-floor">
        <div className="cs-floor-grid" style={{ '--sweep': sweep } as CSSProperties}>
          {FLOOR.map((m, i) => {
            const seen = sweep > ((i % 6) + 0.5) / 6;
            return (
              <span className={`cs-tile${seen ? ` is-${m.state}` : ''}`} key={m.id}>
                <i />{m.id}
              </span>
            );
          })}
          <span className="cs-floor-scan" aria-hidden="true" />
        </div>
        <dl className="cs-floor-stats">
          <div><dt>{done ? '94%' : '—'}</dt><dd>{de ? 'Flottenzustand' : 'Fleet health'}</dd></div>
          <div><dt>22</dt><dd>{de ? 'Normal' : 'Healthy'}</dd></div>
          <div className="is-watch"><dt>{done ? 2 : 0}</dt><dd>{de ? 'Beobachten' : 'Watch'}</dd></div>
          <div className="is-crit"><dt>{done ? 1 : 0}</dt><dd>{de ? 'Kritisch' : 'Critical'}</dd></div>
        </dl>
      </div>
    </div>
  );
}

/* ---------- Manual extraction ---------- */

const PARAMS: [string, string, string, string, number][] = [
  ['Part number', 'Teilenummer', '6205-2RS', 'p. 87', 2],
  ['Torque', 'Drehmoment', '45 Nm', 'p. 112', 5],
  ['Tolerance', 'Toleranz', '± 0.02 mm', 'p. 113', 8],
  ['Interval', 'Intervall', '2,000 h', 'p. 154', 11],
];

export function ManualExtractScene() {
  const de = useDe();
  const seed = de ? 'Handbuch CNC-07 lesen, 214 Seiten' : 'Read CNC-07 manual, 214 pages';
  const total = 9200;
  const [ms, ref] = useLoop(total);
  const start = seed.length * TYPE_MS + 250;
  const scan = at(ms, start, 3400);
  const found = PARAMS.filter((p) => scan > (p[4] + 0.5) / 14).length;
  const done = found === PARAMS.length && ms > start + 3600;
  return (
    <div className="hs-crt hs-scene" ref={ref}>
      <Seed icon={<FileSearch size={14} strokeWidth={1.75} />} text={seed} ms={ms}
        slot={done ? (de ? '4 Werte belegt' : '4 values cited') : (de ? 'Extrahiert Parameter' : 'Extracting parameters')}
        slotState={done ? 'is-done' : ''} />
      <div className="cs-extract">
        <div className="cs-paper" style={{ '--scan': scan } as CSSProperties}>
          <b>§4.3 {de ? 'Lagerwechsel' : 'Bearing replacement'}</b>
          {Array.from({ length: 14 }, (_, i) => {
            const hit = PARAMS.find((p) => p[4] === i);
            return <span className={`cs-paper-line${hit && scan > (i + 0.5) / 14 ? ' is-hit' : ''}`} key={i} style={{ width: `${62 + ((i * 37) % 34)}%` }} />;
          })}
          <i className="cs-paper-scan" />
        </div>
        <div className="cs-params">
          {PARAMS.map(([en, deLabel, value, page], i) => (
            <div className={`cs-param${i < found ? ' is-in' : ''}`} key={en}>
              <span>{de ? deLabel : en}</span>
              <strong>{value}</strong>
              <em>{page}</em>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
