import { useCallback, useEffect, useMemo, useState } from 'react';
import { siStatuspage } from 'simple-icons';

import { Footer, PageHero } from '../components/Landing/SiteChrome';
import SEO from '../components/SEO';
import { UptimeBar, type UptimeDay } from '../components/ui/knowns/uptime-bar/uptime-bar';
import { dayRange } from '../components/ui/knowns/uptime-bar/uptime-bar-utils';
import './LandingFramer.css';
import './legal/Legal.css';
import './Status.css';

/** Public Atlassian Statuspage page. Its JSON feeds are CORS-open. */
const STATUS_PAGE_URL = 'https://clerktree1.statuspage.io';
const SUMMARY_URL = `${STATUS_PAGE_URL}/api/v2/summary.json`;
const INCIDENTS_URL = `${STATUS_PAGE_URL}/api/v2/incidents.json`;
const REFRESH_MS = 60_000;
const HISTORY_DAYS = 90;
const PAST_DAYS = 7;

/** On status.clerktree.com every header and footer link goes to the main site, never to a page on this host. */
const MAIN_SITE = 'https://clerktree.com';
const onStatusHost = typeof window !== 'undefined' && window.location.hostname === 'status.clerktree.com';
const linkBase = onStatusHost ? MAIN_SITE : '';

type ComponentStatus =
  | 'operational'
  | 'degraded_performance'
  | 'partial_outage'
  | 'major_outage'
  | 'under_maintenance';

interface SpComponent {
  id: string;
  name: string;
  status: ComponentStatus;
  group: boolean;
  position: number;
}

interface SpUpdate { id: string; status: string; body: string; created_at: string }
interface SpIncident {
  id: string;
  name: string;
  status: string;
  impact: string;
  shortlink: string;
  created_at: string;
  updated_at: string;
  components?: { id: string }[];
  incident_updates: SpUpdate[];
}
interface SpMaintenance extends SpIncident { scheduled_for: string; scheduled_until: string }

interface Summary {
  page: { updated_at: string };
  status: { indicator: 'none' | 'minor' | 'major' | 'critical' | 'maintenance'; description: string };
  components: SpComponent[];
  incidents: SpIncident[];
  scheduled_maintenances: SpMaintenance[];
}

const STATUS_LABEL: Record<ComponentStatus, string> = {
  operational: 'Operational',
  degraded_performance: 'Degraded performance',
  partial_outage: 'Partial outage',
  major_outage: 'Major outage',
  under_maintenance: 'Under maintenance',
};

const STATE_TONE: Record<string, string> = { none: 'ok', minor: 'warn', major: 'bad', critical: 'bad', maintenance: 'info' };

// Statuspage ships sample components in new pages; never show them to customers.
const isPlaceholder = (name: string) => /\(example\)$/i.test(name.trim());

const dateTime = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Berlin' });
const dayLabel = new Intl.DateTimeFormat('en-GB', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const formatTime = (iso: string) => `${dateTime.format(new Date(iso))} (Berlin)`;

function useFeed<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch(url, { signal, headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error(`Status feed returned ${response.status}`);
      setData((await response.json()) as T);
      setFailed(false);
    } catch (error) {
      if ((error as Error).name !== 'AbortError') setFailed(true);
    }
  }, [url]);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    const timer = window.setInterval(() => void load(controller.signal), REFRESH_MS);
    return () => {
      controller.abort();
      window.clearInterval(timer);
    };
  }, [load]);

  return { data, failed };
}

/**
 * Placeholder history: every past day reads as up, and today follows the live status.
 * Replace with real per-day data when it exists.
 */
function buildDays(status: ComponentStatus): UptimeDay[] {
  const dates = dayRange(new Date(), HISTORY_DAYS);
  const today: UptimeDay['status'] =
    status === 'operational' ? 'up' : status === 'degraded_performance' || status === 'under_maintenance' ? 'degraded' : 'down';
  return dates.map((date, i) => ({ date, status: i === dates.length - 1 ? today : 'up' }));
}

export default function Status() {
  const { data: summary, failed } = useFeed<Summary>(SUMMARY_URL);
  const { data: history } = useFeed<{ incidents: SpIncident[] }>(INCIDENTS_URL);

  const components = useMemo(
    () => (summary?.components ?? []).filter((c) => !c.group && !isPlaceholder(c.name)).sort((a, b) => a.position - b.position),
    [summary],
  );

  // Last few days, newest first, each with the incidents that started that day (UTC).
  const pastDays = useMemo(() => {
    const days = dayRange(new Date(), PAST_DAYS).reverse();
    const real = (history?.incidents ?? []).filter((i) => (i.components?.length ?? 0) > 0 || i.impact !== 'none');
    return days.map((date) => ({ date, incidents: real.filter((i) => i.created_at.slice(0, 10) === date) }));
  }, [history]);

  const impacted = components.filter((c) => c.status !== 'operational').length;
  const indicator = summary?.status.indicator ?? 'none';
  const allGood = impacted === 0 && indicator === 'none';
  const headline = !summary ? (failed ? 'Live status unavailable' : 'Checking systems…') : allGood ? 'All systems operational' : summary.status.description;
  const tone = !summary ? (failed ? 'warn' : 'idle') : allGood ? 'ok' : (STATE_TONE[indicator] ?? 'warn');

  return (
    <div className="ct-works" id="ct-works">
      <SEO
        title="System Status"
        description="Live status of ClerkTree and the Hive API."
        canonical="https://clerktree.com/status"
      />
      <PageHero eyebrow="Status" title="System status" titleId="status-page-title" linkBase={linkBase} />

      <div className="ct-legal-page-container">
        <main id="main-content">
          <div className="ct-legal-card st-card">
            <div className={`st-banner is-${tone}`} role="status" aria-live="polite">
              <span className="st-dot" aria-hidden="true" />
              <div>
                <strong>{headline}</strong>
                {summary && <span>Updated {formatTime(summary.page.updated_at)}</span>}
                {failed && !summary && <span>We could not reach the status feed. Try again shortly.</span>}
              </div>
              <a className="st-subscribe" href={STATUS_PAGE_URL} rel="noopener noreferrer" target="_blank">
                Subscribe to updates
              </a>
            </div>

            {summary && summary.incidents.length > 0 && (
              <section className="st-section" aria-labelledby="st-incidents">
                <h2 id="st-incidents">Active incidents</h2>
                {summary.incidents.map((incident) => (
                  <article className={`st-notice is-${incident.impact}`} key={incident.id}>
                    <h3><a href={incident.shortlink} rel="noopener noreferrer">{incident.name}</a></h3>
                    <p className="st-meta">{incident.status.replace(/_/g, ' ')} · {formatTime(incident.updated_at)}</p>
                    {incident.incident_updates[0] && <p>{incident.incident_updates[0].body}</p>}
                  </article>
                ))}
              </section>
            )}

            {summary && summary.scheduled_maintenances.length > 0 && (
              <section className="st-section" aria-labelledby="st-maintenance">
                <h2 id="st-maintenance">Scheduled maintenance</h2>
                {summary.scheduled_maintenances.map((item) => (
                  <article className="st-notice is-maintenance" key={item.id}>
                    <h3><a href={item.shortlink} rel="noopener noreferrer">{item.name}</a></h3>
                    <p className="st-meta">{formatTime(item.scheduled_for)} to {formatTime(item.scheduled_until)}</p>
                    {item.incident_updates[0] && <p>{item.incident_updates[0].body}</p>}
                  </article>
                ))}
              </section>
            )}

            <section className="st-section" aria-label="Components">
              <ul className="st-list">
                {components.map((component) => (
                  <li key={component.id}>
                    <UptimeBar
                      label={component.name}
                      days={buildDays(component.status)}
                      startLabel={`${HISTORY_DAYS} days ago`}
                      endLabel="Today"
                    />
                    {component.status !== 'operational' && (
                      <span className={`st-pill is-${component.status}`}>{STATUS_LABEL[component.status]}</span>
                    )}
                  </li>
                ))}
              </ul>
            </section>

            <section className="st-section" aria-labelledby="st-past">
              <h2 id="st-past">Past incidents</h2>
              {pastDays.map((day) => (
                <div className="st-day" key={day.date}>
                  <h3>{dayLabel.format(new Date(`${day.date}T12:00:00Z`))}</h3>
                  {day.incidents.length === 0 ? (
                    <p className="st-muted">No incidents reported.</p>
                  ) : (
                    day.incidents.map((incident) => (
                      <article className={`st-notice is-${incident.impact}`} key={incident.id}>
                        <h4><a href={incident.shortlink} rel="noopener noreferrer">{incident.name}</a></h4>
                        <p className="st-meta">{incident.status.replace(/_/g, ' ')}</p>
                        {incident.incident_updates[0] && <p>{incident.incident_updates[0].body}</p>}
                      </article>
                    ))
                  )}
                </div>
              ))}
              <a className="st-history" href={`${STATUS_PAGE_URL}/history`} rel="noopener noreferrer" target="_blank">
                View full history
              </a>
            </section>

            <p className="st-powered">
              <a href="https://www.atlassian.com/software/statuspage" rel="noopener noreferrer" target="_blank">
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d={siStatuspage.path} /></svg>
                Powered by Atlassian Statuspage
              </a>
            </p>
          </div>
        </main>
      </div>

      <Footer linkBase={linkBase} />
    </div>
  );
}
