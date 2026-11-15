import { Info, KeyRound, Plus, ShieldCheck, Wifi } from 'lucide-react-dash';
import { useState } from 'react';

import { Chips, DataTable, Field, includes, Note, PageCard, Pill, SearchBox, SecretDialog, StatRow, usePhone } from './common';
import type { AdminConnection } from './placeholder';
import { useHive } from './store';

export const ADMIN_AREAS = [
  { id: 'tenant', label: 'Tenant' },
  { id: 'access', label: 'Access' },
  { id: 'connections', label: 'Connections' },
  { id: 'gateways', label: 'Gateways' },
  { id: 'policies', label: 'Policies' },
  { id: 'audit', label: 'Audit' },
  { id: 'integrations', label: 'Integrations' },
] as const;

type AreaId = (typeof ADMIN_AREAS)[number]['id'];

const randomToken = (prefix: string) => `${prefix}_${Array.from(crypto.getRandomValues(new Uint8Array(18)), (b) => b.toString(36).padStart(2, '0')).join('').slice(0, 28)}`;

const CONN_TONE = { Healthy: 'green', Degraded: 'amber', Disabled: 'gray', 'Not tested': 'gray' } as const;

/* ---------- areas ---------- */

function TenantArea() {
  const { data, apiState } = useHive();
  return (
    <>
      <StatRow items={[{ label: 'Machines', value: String(data.machines.length), tone: 'orange' }, { label: 'Users', value: String(data.users.length) }, { label: 'Gateways', value: String(data.gatewayFleet.length) }, { label: 'Connections', value: String(data.connections.length) }]} />
      <PageCard title="Tenant" subtitle="Settings and entitlements (placeholder values)">
        <Field k="Name" v={data.plant.name} />
        <Field k="Region" v="EU (placeholder)" />
        <Field k="API version" v="v1" />
        <Field k="Hive API" v={apiState === 'online' ? 'Online' : apiState === 'offline' ? 'Configured but not reachable' : apiState === 'checking' ? 'Checking…' : 'Not configured'} />
        <h4 className="hd-subhead">Entitlements</h4>
        <Field k="Assistant" v={<Pill tone="green">Enabled</Pill>} />
        <Field k="Machine control" v={<Pill tone="gray">Not enabled</Pill>} />
        <Field k="Customer-managed keys" v={<Pill tone="gray">Off</Pill>} />
      </PageCard>
    </>
  );
}

function AccessArea() {
  const { data, mutate, notify } = useHive();
  const [q, setQ] = useState('');
  const users = data.users.filter((u) => includes(q, u.name, u.email, u.roles, u.status));
  return (
    <>
      <PageCard
        title="Users"
        subtitle="Reading person data is logged"
        actions={
          <>
            <SearchBox value={q} onChange={setQ} label="Search users" />
            <button
              type="button"
              className="hd-btn is-dark hd-btn-sm"
              onClick={() => mutate((d) => ({ ...d, users: [...d.users, { id: `usr_${d.users.length + 1}`, name: 'Invited colleague', email: `invite${d.users.length + 1}@musterwerk.example`, status: 'Invited', signIn: 'Company SSO', roles: 'Operator' }] }), 'Invitation created')}
            >
              <Plus size={14} /> Invite
            </button>
          </>
        }
      >
        <DataTable
          rows={users}
          onOpen={() => undefined}
          empty="No users match."
          card={(r) => ({ icon: KeyRound, title: r.name, sub: r.email, pill: <Pill tone={r.status === 'Active' ? 'green' : r.status === 'Invited' ? 'amber' : 'gray'}>{r.status}</Pill>, meta: r.roles })}
          cols={[
            { header: 'User', render: (r) => <span className="hd-strong">{r.name}<small className="hd-sub-line">{r.email}</small></span> },
            { header: 'Status', render: (r) => <Pill tone={r.status === 'Active' ? 'green' : r.status === 'Invited' ? 'amber' : 'gray'}>{r.status}</Pill> },
            { header: 'Sign-in', render: (r) => r.signIn },
            { header: 'Roles', render: (r) => r.roles },
            { header: '', render: (r) => (
              <button
                type="button"
                className="hd-ghost"
                onClick={(e) => { e.stopPropagation(); mutate((d) => ({ ...d, users: d.users.map((u) => (u.id === r.id ? { ...u, status: u.status === 'Suspended' ? 'Active' : 'Suspended' } : u)) }), r.status === 'Suspended' ? 'User reactivated' : 'User suspended'); }}
              >
                {r.status === 'Suspended' ? 'Reactivate' : 'Suspend'}
              </button>
            ) },
          ]}
        />
      </PageCard>
      <PageCard title="Role grants" subtitle="A role, a principal and a scope. The scope covers everything below it in the asset tree." actions={<button type="button" className="hd-btn is-light hd-btn-sm" onClick={() => notify('Creating grants needs the access API (placeholder)')}>Grant role</button>}>
        <DataTable
          rows={data.grants}
          onOpen={() => undefined}
          empty="No grants."
          card={(r) => ({ icon: ShieldCheck, title: r.role, sub: r.principal, meta: r.coverage })}
          cols={[
            { header: 'Principal', render: (r) => r.principal },
            { header: 'Role', render: (r) => <span className="hd-strong">{r.role}</span> },
            { header: 'Scope', render: (r) => r.scope },
            { header: 'Effective coverage', render: (r) => r.coverage },
          ]}
        />
        <Note icon={Info}>Who may approve which kind of action is set by the approval policy and the server’s role matrix, not by a tenant administrator role alone.</Note>
      </PageCard>
    </>
  );
}

function ConnectionsArea() {
  const { data, mutate } = useHive();
  const set = (id: string, patch: Partial<AdminConnection>, msg: string) => mutate((d) => ({ ...d, connections: d.connections.map((c) => (c.id === id ? { ...c, ...patch } : c)) }), msg);
  return (
    <PageCard title="Connections" subtitle="Machines and business systems that feed HIVE. A connection is enabled only after a successful test.">
      <DataTable
        rows={data.connections}
        onOpen={() => undefined}
        empty="No connections."
        card={(r) => ({ icon: Wifi, title: r.name, sub: `${r.connector} · ${r.kind}`, pill: <Pill tone={CONN_TONE[r.state]}>{r.state}</Pill>, meta: r.write })}
        cols={[
          { header: 'Connection', render: (r) => <span className="hd-strong">{r.name}<small className="hd-sub-line">{r.connector} · {r.kind}</small></span> },
          { header: 'State', render: (r) => <Pill tone={CONN_TONE[r.state]}>{r.state}</Pill> },
          { header: 'Writes', render: (r) => r.write },
          { header: 'Last success', render: (r) => r.lastOk },
          { header: '', render: (r) => (
            <span className="hd-approval-actions">
              <button type="button" className="hd-ghost" onClick={(e) => { e.stopPropagation(); set(r.id, { state: r.state === 'Disabled' ? 'Disabled' : 'Healthy', lastOk: 'just now' }, `${r.name} test passed`); }}>Test</button>
              <button type="button" className="hd-ghost" disabled={r.state === 'Not tested'} onClick={(e) => { e.stopPropagation(); set(r.id, { state: r.state === 'Disabled' ? 'Healthy' : 'Disabled' }, r.state === 'Disabled' ? `${r.name} enabled` : `${r.name} disabled`); }}>{r.state === 'Disabled' ? 'Enable' : 'Disable'}</button>
            </span>
          ) },
        ]}
      />
      <p className="hd-muted hd-fine">Credentials are write-only: once set they show only as “set on a date”, never as a value.</p>
    </PageCard>
  );
}

function GatewaysArea() {
  const { data } = useHive();
  const [secret, setSecret] = useState<string | null>(null);
  const LINK = { Online: 'green', Buffering: 'amber', Offline: 'red' } as const;
  return (
    <>
      <PageCard
        title="Gateways"
        subtitle="Edge gateways reading your machines; data is buffered when the link drops"
        actions={
          <button type="button" className="hd-btn is-dark hd-btn-sm" onClick={() => setSecret(randomToken('hct'))}>
            <Plus size={14} /> Claim token
          </button>
        }
      >
        <DataTable
          rows={data.gatewayFleet}
          onOpen={() => undefined}
          empty="No gateways."
          card={(r) => ({ icon: Wifi, title: r.id, sub: `${r.site} · ${r.drivers}`, pill: <Pill tone={LINK[r.link]}>{r.link}</Pill>, meta: `buffer ${r.bufferPct}% · v${r.version}` })}
          cols={[
            { header: 'Gateway', render: (r) => <span className="hd-strong">{r.id}</span> },
            { header: 'Site', sort: (a, b) => a.site.localeCompare(b.site), render: (r) => r.site },
            { header: 'Link', render: (r) => <Pill tone={LINK[r.link]}>{r.link}</Pill> },
            { header: 'Buffer', sort: (a, b) => a.bufferPct - b.bufferPct, render: (r) => <span className="hd-meter"><i style={{ width: `${r.bufferPct}%` }} /><b>{r.bufferPct}%</b></span> },
            { header: 'Drivers', render: (r) => r.drivers },
            { header: 'Version', render: (r) => r.version },
            { header: 'Uptime', render: (r) => r.uptime },
          ]}
        />
      </PageCard>
      {secret && <SecretDialog title="Gateway claim token" secret={secret} hint="Run the enrolment command on the gateway with this token. It works once. (Placeholder token: nothing is registered.)" onClose={() => setSecret(null)} />}
    </>
  );
}

function PoliciesArea() {
  const { data } = useHive();
  return (
    <PageCard title="Approval policies" subtitle="Minimums per tier cannot be lowered by a tenant">
      <DataTable
        rows={data.policies.map((p) => ({ ...p, id: p.tier }))}
        onOpen={() => undefined}
        empty="No policies."
        card={(r) => ({ icon: ShieldCheck, title: r.tier, sub: r.approvals, pill: <Pill tone={r.automation === 'Cannot be automated' ? 'red' : 'green'}>{r.automation}</Pill>, meta: `Step-up: ${r.stepUp}` })}
        cols={[
          { header: 'Tier', render: (r) => <span className="hd-strong">{r.tier}</span> },
          { header: 'Approvals', render: (r) => r.approvals },
          { header: 'Step-up', render: (r) => r.stepUp },
          { header: 'Automation', render: (r) => <Pill tone={r.automation === 'Cannot be automated' ? 'red' : 'green'}>{r.automation}</Pill> },
        ]}
      />
      <Note icon={Info}>T3 and T4 can never be automated and no setting enables it. An assistant or agent never approves or runs a T3 or T4 action.</Note>
    </PageCard>
  );
}

function AuditArea() {
  const { data } = useHive();
  const [q, setQ] = useState('');
  const rows = data.audit.filter((a) => includes(q, a.action, a.resource, a.actorKind));
  return (
    <PageCard title="Audit" subtitle="Who or what did what, and when. Entries show the kind of actor." actions={<SearchBox value={q} onChange={setQ} label="Search audit entries" />}>
      <DataTable
        rows={rows}
        onOpen={() => undefined}
        empty="No entries match."
        card={(r) => ({ icon: ShieldCheck, title: r.action, sub: r.resource, pill: <Pill tone="gray">{r.actorKind}</Pill>, meta: r.at })}
        cols={[
          { header: 'When', render: (r) => r.at },
          { header: 'Action', render: (r) => <span className="hd-strong">{r.action}</span> },
          { header: 'Resource', render: (r) => r.resource },
          { header: 'Actor', render: (r) => <Pill tone="gray">{r.actorKind}</Pill> },
        ]}
      />
    </PageCard>
  );
}

function IntegrationsArea() {
  const { data, mutate } = useHive();
  const [secret, setSecret] = useState<string | null>(null);
  return (
    <>
      <PageCard
        title="API keys"
        subtitle="Keys are listed as metadata only; the secret is shown once when created"
        actions={
          <button
            type="button"
            className="hd-btn is-dark hd-btn-sm"
            onClick={() => {
              const s = randomToken('hk_test');
              setSecret(s);
              mutate((d) => ({ ...d, apiKeys: [...d.apiKeys, { id: `key_${d.apiKeys.length + 1}`, name: 'New key', prefix: s.slice(0, 12), scopes: 'asset.read', created: 'today', lastUsed: 'never', status: 'Active' }] }));
            }}
          >
            <Plus size={14} /> Create key
          </button>
        }
      >
        <DataTable
          rows={data.apiKeys}
          onOpen={() => undefined}
          empty="No keys."
          card={(r) => ({ icon: KeyRound, title: r.name, sub: `${r.prefix}… · ${r.scopes}`, pill: <Pill tone={r.status === 'Active' ? 'green' : 'gray'}>{r.status}</Pill>, meta: `last used ${r.lastUsed}` })}
          cols={[
            { header: 'Name', render: (r) => <span className="hd-strong">{r.name}</span> },
            { header: 'Prefix', render: (r) => <code>{r.prefix}…</code> },
            { header: 'Scopes', render: (r) => r.scopes },
            { header: 'Created', render: (r) => r.created },
            { header: 'Last used', render: (r) => r.lastUsed },
            { header: 'Status', render: (r) => <Pill tone={r.status === 'Active' ? 'green' : 'gray'}>{r.status}</Pill> },
            { header: '', render: (r) => (
              <button type="button" className="hd-ghost" disabled={r.status === 'Revoked'} onClick={(e) => { e.stopPropagation(); mutate((d) => ({ ...d, apiKeys: d.apiKeys.map((k) => (k.id === r.id ? { ...k, status: 'Revoked' } : k)) }), `${r.name} revoked`); }}>Revoke</button>
            ) },
          ]}
        />
      </PageCard>
      <PageCard title="Webhooks and usage" subtitle="Outgoing events and API usage">
        <Field k="Webhook endpoints" v="None configured" />
        <Field k="API requests, last 24 h" v="1,284 (placeholder)" />
      </PageCard>
      {secret && <SecretDialog title="New API key" secret={secret} hint="Placeholder key: it does not work against any API." onClose={() => setSecret(null)} />}
    </>
  );
}

export function AdminView({ area, go }: { area: string; go: (section: string) => void }) {
  const phone = usePhone();
  const current = (ADMIN_AREAS.find((a) => a.id === area)?.id ?? 'tenant') as AreaId;
  const body =
    current === 'tenant' ? <TenantArea /> :
    current === 'access' ? <AccessArea /> :
    current === 'connections' ? <ConnectionsArea /> :
    current === 'gateways' ? <GatewaysArea /> :
    current === 'policies' ? <PoliciesArea /> :
    current === 'audit' ? <AuditArea /> : <IntegrationsArea />;
  return (
    <>
      {phone ? (
        <div className="hd-scrollchips">
          <Chips options={ADMIN_AREAS.map((a) => a.id)} value={current} onChange={(v) => go(`admin/${v}`)} labels={Object.fromEntries(ADMIN_AREAS.map((a) => [a.id, a.label]))} />
        </div>
      ) : (
        <Chips options={ADMIN_AREAS.map((a) => a.id)} value={current} onChange={(v) => go(`admin/${v}`)} labels={Object.fromEntries(ADMIN_AREAS.map((a) => [a.id, a.label]))} />
      )}
      <div className="hd-admin-body">{body}</div>
    </>
  );
}

/* ---------- personal settings ---------- */

function Toggle({ label, hint, on, onChange }: { label: string; hint?: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="hd-toggle">
      <span>
        <b>{label}</b>
        {hint && <small>{hint}</small>}
      </span>
      <input type="checkbox" role="switch" checked={on} onChange={(e) => onChange(e.target.checked)} />
      <i aria-hidden="true" />
    </label>
  );
}

export function SettingsView({ dark, setDark, compact, setCompact }: { dark: boolean; setDark: (v: boolean) => void; compact: boolean; setCompact: (v: boolean) => void }) {
  const { apiState, notify } = useHive();
  const [email, setEmail] = useState(true);
  const [push, setPush] = useState(false);
  const apiText = { unconfigured: 'Not configured: showing placeholder data', checking: 'Checking…', online: 'Online', offline: 'Configured but not reachable' } as const;
  return (
    <>
      <PageCard title="Settings" subtitle="Display preferences are saved in this browser only">
        <div className="hd-settings">
          <Toggle label="Dark theme" hint="Switches the whole Hive dashboard" on={dark} onChange={setDark} />
          <Toggle label="Compact tables" hint="Tighter rows, more on screen" on={compact} onChange={setCompact} />
          <label className="hd-toggle">
            <span><b>Language</b><small>German texts are not translated yet</small></span>
            <select className="hd-lang" defaultValue="en" aria-label="Language" onChange={(e) => { if (e.target.value === 'de') { notify('German is not available yet (placeholder)'); e.target.value = 'en'; } }}>
              <option value="en">English</option>
              <option value="de">Deutsch</option>
            </select>
          </label>
          <Toggle label="Alarm emails" hint="Placeholder: needs the notification API" on={email} onChange={(v) => { setEmail(v); notify('Saved on this page only (placeholder)'); }} />
          <Toggle label="Push notifications" hint="Placeholder: mobile app not connected" on={push} onChange={(v) => { setPush(v); notify('Saved on this page only (placeholder)'); }} />
        </div>
      </PageCard>
      <PageCard title="Diagnostics" subtitle="Nothing here contains plant data or tokens">
        <Field k="Hive API" v={apiText[apiState]} />
        <Field k="Dashboard" v="Hive dashboard · placeholder build" />
        <Field k="Browser time" v={new Date().toLocaleTimeString('en-GB')} />
      </PageCard>
    </>
  );
}
