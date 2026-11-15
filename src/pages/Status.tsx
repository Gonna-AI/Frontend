import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

import { PageHero, Footer } from '../components/Landing/SiteChrome';
import { UptimeBar, type UptimeDay } from '../components/ui/knowns/uptime-bar/uptime-bar';
import { dayRange } from '../components/ui/knowns/uptime-bar/uptime-bar-utils';
import SEO from '../components/SEO';
import './LandingFramer.css';
import './legal/Legal.css';
import './Status.css';

/** Public Atlassian Statuspage page. The summary endpoint is CORS-open and cacheable. */
const STATUS_PAGE_URL = 'https://clerktree1.statuspage.io';
const SUMMARY_URL = `${STATUS_PAGE_URL}/api/v2/summary.json`;
const REFRESH_MS = 60_000;

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
  description: string | null;
  group: boolean;
  group_id: string | null;
  position: number;
}

interface SpUpdate { id: string; status: string; body: string; created_at: string }
interface SpIncident {
  id: string;
  name: string;
  status: string;
  impact: string;
  shortlink: string;
  updated_at: string;
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

const STATE_TONE: Record<string, string> = {
  none: 'ok',
  minor: 'warn',
  major: 'bad',
  critical: 'bad',
  maintenance: 'info',
};

// Statuspage ships sample components in new pages; never show them to customers.
const isPlaceholder = (name: string) => /\(example\)$/i.test(name.trim());

const stamp = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Europe/Berlin',
});
const formatTime = (iso: string) => `${stamp.format(new Date(iso))} (Berlin)`;

function useSummary() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch(SUMMARY_URL, { signal, headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error(`Status feed returned ${response.status}`);
      setSummary((await response.json()) as Summary);
      setFailed(false);
    } catch (error) {
      if ((error as Error).name !== 'AbortError') setFailed(true);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    const timer = window.setInterval(() => void load(controller.signal), REFRESH_MS);
    return () => {
      controller.abort();
      window.clearInterval(timer);
    };
  }, [load]);

  return { summary, failed };
}

const HISTORY_DAYS = 90;

/**
 * Placeholder history: every past day reads as up, and today follows the live status.
 * Replace with real per-day data (incident feed or a status database) when it exists.
 */
function buildDays(status: ComponentStatus): UptimeDay[] {
  const dates = dayRange(new Date(), HISTORY_DAYS);
  const today: UptimeDay['status'] =
    status === 'operational' ? 'up' : status === 'degraded_performance' || status === 'under_maintenance' ? 'degraded' : 'down';
  return dates.map((date, i) => ({ date, status: i === dates.length - 1 ? today : 'up' }));
}

function StatusPill({ status }: { status: ComponentStatus }) {
  return <span className={`st-pill is-${status}`}>{STATUS_LABEL[status] ?? status}</span>;
}

export default function Status() {
  const { summary, failed } = useSummary();

  const groups = useMemo(() => {
    if (!summary) return [];
    const real = summary.components.filter((c) => !isPlaceholder(c.name));
    const byPosition = (a: SpComponent, b: SpComponent) => a.position - b.position;
    const headers = real.filter((c) => c.group).sort(byPosition);
    const items = real.filter((c) => !c.group);
    const grouped = headers.map((group) => ({
      id: group.id,
      name: group.name,
      components: items.filter((c) => c.group_id === group.id).sort(byPosition),
    }));
    const loose = items.filter((c) => !c.group_id).sort(byPosition);
    return loose.length ? [...grouped, { id: 'other', name: 'Other', components: loose }] : grouped;
  }, [summary]);

  const visible = summary?.components.filter((c) => !c.group && !isPlaceholder(c.name)) ?? [];
  const impacted = visible.filter((c) => c.status !== 'operational').length;
  const indicator = summary?.status.indicator ?? 'none';
  const headline = !summary
    ? failed
      ? 'Live status unavailable'
      : 'Checking systems…'
    : impacted === 0 && indicator === 'none'
      ? 'All systems operational'
      : summary.status.description;
  const tone = !summary ? (failed ? 'warn' : 'idle') : impacted === 0 && indicator === 'none' ? 'ok' : (STATE_TONE[indicator] ?? 'warn');

  return (
    <div className="ct-works" id="ct-works">
      <SEO
        title="System Status"
        description="Live status of ClerkTree and HIVE: API, alarms, commands, ingestion, gateways, assistant, documents, webhooks and sign-in."
        canonical="https://clerktree.com/status"
      />
      <PageHero
        eyebrow="Status"
        title="System status"
        description="Live availability of ClerkTree and HIVE. Incidents and planned maintenance appear here first."
        titleId="status-page-title"
      />

      <div className="ct-legal-page-container">
        <main className="ct-legal-content-wrap" id="main-content">
          <div className="ct-legal-card st-card">
            <div className={`st-banner is-${tone}`} role="status" aria-live="polite">
              <span className="st-dot" aria-hidden="true" />
              <div>
                <strong>{headline}</strong>
                {summary && <span>Updated {formatTime(summary.page.updated_at)}</span>}
                {failed && !summary && (
                  <span>
                    We could not reach the status feed. Check <a href={STATUS_PAGE_URL}>our status provider</a> directly.
                  </span>
                )}
              </div>
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
                <h2 id="st-maintenance">Planned maintenance</h2>
                {summary.scheduled_maintenances.map((item) => (
                  <article className="st-notice is-maintenance" key={item.id}>
                    <h3><a href={item.shortlink} rel="noopener noreferrer">{item.name}</a></h3>
                    <p className="st-meta">
                      {formatTime(item.scheduled_for)} to {formatTime(item.scheduled_until)}
                    </p>
                    {item.incident_updates[0] && <p>{item.incident_updates[0].body}</p>}
                  </article>
                ))}
              </section>
            )}

            <section className="st-section" aria-labelledby="st-components">
              <h2 id="st-components">Components</h2>
              {!summary && !failed && <p className="st-muted">Loading component status…</p>}
              {groups.map((group) => (
                <div className="st-group" key={group.id}>
                  <h3>{group.name}</h3>
                  <ul>
                    {group.components.map((component) => (
                      <li key={component.id}>
                        <UptimeBar
                          label={component.name}
                          days={buildDays(component.status)}
                          startLabel={`${HISTORY_DAYS} days ago`}
                          endLabel="Today"
                        />
                        <div className="st-row-foot">
                          {component.description && <span className="st-desc">{component.description}</span>}
                          {component.status !== 'operational' && <StatusPill status={component.status} />}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>

            <section className="st-section st-actions" aria-label="Status resources">
              <a href={STATUS_PAGE_URL} rel="noopener noreferrer" target="_blank">
                <span><strong>Subscribe to updates</strong><span>Email, SMS and webhooks for incidents and maintenance</span></span>
                <ArrowUpRight aria-hidden="true" size={18} />
              </a>
              <a href={`${STATUS_PAGE_URL}/history`} rel="noopener noreferrer" target="_blank">
                <span><strong>Incident history</strong><span>Past incidents and post-incident summaries</span></span>
                <ArrowUpRight aria-hidden="true" size={18} />
              </a>
              <a href={`${STATUS_PAGE_URL}/history.atom`} rel="noopener noreferrer" target="_blank">
                <span><strong>Atom and RSS feeds</strong><span>Machine-readable incident feed</span></span>
                <ArrowUpRight aria-hidden="true" size={18} />
              </a>
            </section>

            <p className="st-foot">
              Status is checked by ClerkTree and published through an independent provider, so this page keeps working
              when our own platform does not. Suspect an issue we have not reported? Write to{' '}
              <a href="mailto:support@clerktree.com">support@clerktree.com</a>. For security matters see{' '}
              <a href="/responsible-disclosure">responsible disclosure</a> and the <a href="/trust">Trust Center</a>.
            </p>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
