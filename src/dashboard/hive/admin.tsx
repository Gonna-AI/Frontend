import { Info, KeyRound, Plus, ShieldCheck, Wifi } from 'lucide-react-dash';
import { useState } from 'react';

import { Chips, DataTable, Field, includes, Note, PageCard, Pill, SearchBox, SecretDialog, StatRow, usePhone } from './common';
import { BrandingArea, DisplaysArea, EmbedArea } from './adminExtra';
import { useBrand } from './branding';
import { localize, useLang } from './i18n';
import type { AdminConnection } from './placeholder';
import { useHive } from './store';
import { useT } from './i18n';

export const ADMIN_AREAS = [
  { id: 'tenant', label: 'Tenant' },
  { id: 'access', label: 'Access' },
  { id: 'connections', label: 'Connections' },
  { id: 'gateways', label: 'Gateways' },
  { id: 'policies', label: 'Policies' },
  { id: 'audit', label: 'Audit' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'displays', label: 'Displays' },
  { id: 'embed', label: 'Embed' },
  { id: 'branding', label: 'Branding' },
] as const;

type AreaId = (typeof ADMIN_AREAS)[number]['id'];

const randomToken = (prefix: string) => `${prefix}_${Array.from(crypto.getRandomValues(new Uint8Array(18)), (b) => b.toString(36).padStart(2, '0')).join('').slice(0, 28)}`;

const CONN_TONE = { Healthy: 'green', Degraded: 'amber', Disabled: 'gray', 'Not tested': 'gray' } as const;

/* ---------- areas ---------- */

function TenantArea() {
  const t = useT();
  const ent = useBrand();
  const { data, apiState } = useHive();
  return (
    <>
      <StatRow items={[{ label: t('Machines'), value: String(data.machines.length), tone: 'orange' }, { label: t('Users'), value: String(data.users.length) }, { label: t('Gateways'), value: String(data.gatewayFleet.length) }, { label: t('Connections'), value: String(data.connections.length) }]} />
      <PageCard title={t('Tenant')} subtitle={t('Settings and entitlements (placeholder values)')}>
        <Field k={t('Name')} v={data.plant.name} />
        <Field k={t('Region')} v="EU (placeholder)" />
        <Field k={t('API version')} v="v1" />
        <Field k={t('Hive API')} v={apiState === 'online' ? t('Online') : apiState === 'offline' ? t('Configured but not reachable') : apiState === 'checking' ? t('Checking…') : t('Not configured')} />
        <h4 className="hd-subhead">{t('Entitlements')}</h4>
        <Field k={t('Assistant')} v={<Pill tone="green">{t('Enabled')}</Pill>} />
        <Field k={t('Machine control')} v={<Pill tone="gray">{t('Not enabled')}</Pill>} />
        <Field k={t('Customer-managed keys')} v={<Pill tone="gray">{t('Off')}</Pill>} />
        <label className="hd-toggle">
          <span><b>embed.enabled</b><small>{t('Embeddable components (demo switch: turn off to see the feature_not_entitled state)')}</small></span>
          <input type="checkbox" role="switch" checked={ent.entitlements.embed} onChange={(e) => ent.setEntitlements({ ...ent.entitlements, embed: e.target.checked })} />
          <i aria-hidden="true" />
        </label>
        <label className="hd-toggle">
          <span><b>branding.white_label</b><small>{t('White-label branding (demo switch)')}</small></span>
          <input type="checkbox" role="switch" checked={ent.entitlements.whiteLabel} onChange={(e) => ent.setEntitlements({ ...ent.entitlements, whiteLabel: e.target.checked })} />
          <i aria-hidden="true" />
        </label>
      </PageCard>
    </>
  );
}

function AccessArea() {
  const t = useT();
  const { data, mutate, notify } = useHive();
  const [q, setQ] = useState('');
  const users = data.users.filter((u) => includes(q, u.name, u.email, u.roles, u.status));
  return (
    <>
      <PageCard
        title={t('Users')}
        subtitle={t('Reading person data is logged')}
        actions={
          <>
            <SearchBox value={q} onChange={setQ} label={t('Search users')} />
            <button
              type="button"
              className="hd-btn is-dark hd-btn-sm"
              onClick={() => mutate((d) => ({ ...d, users: [...d.users, { id: `usr_${d.users.length + 1}`, name: 'Invited colleague', email: `invite${d.users.length + 1}@musterwerk.example`, status: 'Invited', signIn: 'Company SSO', roles: 'Operator' }] }), t('Invitation created'))}
            >
              <Plus size={14} /> {t('Invite')}
            </button>
          </>
        }
      >
        <DataTable
          rows={users}
          onOpen={() => undefined}
          empty={t('No users match.')}
          card={(r) => ({ icon: KeyRound, title: r.name, sub: r.email, pill: <Pill tone={r.status === 'Active' ? 'green' : r.status === 'Invited' ? 'amber' : 'gray'}>{r.status}</Pill>, meta: r.roles })}
          cols={[
            { header: t('User'), render: (r) => <span className="hd-strong">{r.name}<small className="hd-sub-line">{r.email}</small></span> },
            { header: t('Status'), render: (r) => <Pill tone={r.status === 'Active' ? 'green' : r.status === 'Invited' ? 'amber' : 'gray'}>{r.status}</Pill> },
            { header: t('Sign-in'), render: (r) => r.signIn },
            { header: t('Roles'), render: (r) => r.roles },
            { header: '', render: (r) => (
              <button
                type="button"
                className="hd-ghost"
                onClick={(e) => { e.stopPropagation(); mutate((d) => ({ ...d, users: d.users.map((u) => (u.id === r.id ? { ...u, status: u.status === 'Suspended' ? 'Active' : 'Suspended' } : u)) }), r.status === 'Suspended' ? t('User reactivated') : t('User suspended')); }}
              >
                {r.status === 'Suspended' ? t('Reactivate') : t('Suspend')}
              </button>
            ) },
          ]}
        />
      </PageCard>
      <PageCard title={t('Role grants')} subtitle={t('A role, a principal and a scope. The scope covers everything below it in the asset tree.')} actions={<button type="button" className="hd-btn is-light hd-btn-sm" onClick={() => notify(t('Creating grants needs the access API (placeholder)'))}>{t('Grant role')}</button>}>
        <DataTable
          rows={data.grants}
          onOpen={() => undefined}
          empty={t('No grants.')}
          card={(r) => ({ icon: ShieldCheck, title: r.role, sub: r.principal, meta: r.coverage })}
          cols={[
            { header: t('Principal'), render: (r) => r.principal },
            { header: t('Role'), render: (r) => <span className="hd-strong">{r.role}</span> },
            { header: t('Scope'), render: (r) => t(r.scope) },
            { header: t('Effective coverage'), render: (r) => r.coverage },
          ]}
        />
        <Note icon={Info}>{t('Who may approve which kind of action is set by the approval policy and the server’s role matrix, not by a tenant administrator role alone.')}</Note>
      </PageCard>
    </>
  );
}

function ConnectionsArea() {
  const t = useT();
  const { data, mutate } = useHive();
  const set = (id: string, patch: Partial<AdminConnection>, msg: string) => mutate((d) => ({ ...d, connections: d.connections.map((c) => (c.id === id ? { ...c, ...patch } : c)) }), msg);
  return (
    <PageCard title={t('Connections')} subtitle={t('Machines and business systems that feed HIVE. A connection is enabled only after a successful test.')}>
      <DataTable
        rows={data.connections}
        onOpen={() => undefined}
        empty={t('No connections.')}
        card={(r) => ({ icon: Wifi, title: r.name, sub: `${r.connector} · ${r.kind}`, pill: <Pill tone={CONN_TONE[r.state]}>{r.state}</Pill>, meta: r.write })}
        cols={[
          { header: t('Connection'), render: (r) => <span className="hd-strong">{r.name}<small className="hd-sub-line">{r.connector} · {r.kind}</small></span> },
          { header: t('State'), render: (r) => <Pill tone={CONN_TONE[r.state]}>{r.state}</Pill> },
          { header: t('Writes'), render: (r) => r.write },
          { header: t('Last success'), render: (r) => r.lastOk },
          { header: '', render: (r) => (
            <span className="hd-approval-actions">
              <button type="button" className="hd-ghost" onClick={(e) => { e.stopPropagation(); set(r.id, { state: r.state === 'Disabled' ? 'Disabled' : 'Healthy', lastOk: 'just now' }, t('{name} test passed', { name: r.name })); }}>{t('Test')}</button>
              <button type="button" className="hd-ghost" disabled={r.state === 'Not tested'} onClick={(e) => { e.stopPropagation(); set(r.id, { state: r.state === 'Disabled' ? 'Healthy' : 'Disabled' }, r.state === 'Disabled' ? t('{name} enabled', { name: r.name }) : t('{name} disabled', { name: r.name })); }}>{r.state === 'Disabled' ? t('Enable') : t('Disable')}</button>
            </span>
          ) },
        ]}
      />
      <p className="hd-muted hd-fine">{t('Credentials are write-only: once set they show only as “set on a date”, never as a value.')}</p>
    </PageCard>
  );
}

function GatewaysArea() {
  const t = useT();
  const { data } = useHive();
  const [secret, setSecret] = useState<string | null>(null);
  const LINK = { Online: 'green', Buffering: 'amber', Offline: 'red' } as const;
  return (
    <>
      <PageCard
        title={t('Gateways')}
        subtitle={t('Edge gateways reading your machines; data is buffered when the link drops')}
        actions={
          <button type="button" className="hd-btn is-dark hd-btn-sm" onClick={() => setSecret(randomToken('hct'))}>
            <Plus size={14} /> {t('Claim token')}
          </button>
        }
      >
        <DataTable
          rows={data.gatewayFleet}
          onOpen={() => undefined}
          empty={t('No gateways.')}
          card={(r) => ({ icon: Wifi, title: r.id, sub: `${r.site} · ${r.drivers}`, pill: <Pill tone={LINK[r.link]}>{r.link}</Pill>, meta: `${t('Buffer')} ${r.bufferPct} % · v${r.version}` })}
          cols={[
            { header: t('Gateway'), render: (r) => <span className="hd-strong">{r.id}</span> },
            { header: t('Site'), sort: (a, b) => a.site.localeCompare(b.site), render: (r) => r.site },
            { header: t('Link'), render: (r) => <Pill tone={LINK[r.link]}>{r.link}</Pill> },
            { header: t('Buffer'), sort: (a, b) => a.bufferPct - b.bufferPct, render: (r) => <span className="hd-meter"><i style={{ width: `${r.bufferPct}%` }} /><b>{r.bufferPct}%</b></span> },
            { header: t('Drivers'), render: (r) => r.drivers },
            { header: t('Version'), render: (r) => r.version },
            { header: t('Uptime'), render: (r) => r.uptime },
          ]}
        />
      </PageCard>
      {secret && <SecretDialog title={t('Gateway claim token')} secret={secret} hint={t('Run the enrolment command on the gateway with this token. It works once. (Placeholder token: nothing is registered.)')} onClose={() => setSecret(null)} />}
    </>
  );
}

function PoliciesArea() {
  const t = useT();
  const { data } = useHive();
  return (
    <PageCard title={t('Approval policies')} subtitle={t('Minimums per tier cannot be lowered by a tenant')}>
      <DataTable
        rows={data.policies.map((p) => ({ ...p, id: p.tier }))}
        onOpen={() => undefined}
        empty={t('No policies.')}
        card={(r) => ({ icon: ShieldCheck, title: r.tier, sub: r.approvals, pill: <Pill tone={r.automation === 'Cannot be automated' ? 'red' : 'green'}>{r.automation}</Pill>, meta: `${t('Step-up')}: ${t(r.stepUp)}` })}
        cols={[
          { header: t('Tier'), render: (r) => <span className="hd-strong">{r.tier}</span> },
          { header: t('Approvals'), render: (r) => r.approvals },
          { header: t('Step-up'), render: (r) => r.stepUp },
          { header: t('Automation'), render: (r) => <Pill tone={r.automation === 'Cannot be automated' ? 'red' : 'green'}>{r.automation}</Pill> },
        ]}
      />
      <Note icon={Info}>{t('T3 and T4 can never be automated and no setting enables it. An assistant or agent never approves or runs a T3 or T4 action.')}</Note>
    </PageCard>
  );
}

function AuditArea() {
  const t = useT();
  const { data } = useHive();
  const [q, setQ] = useState('');
  const rows = data.audit.filter((a) => includes(q, a.action, a.resource, a.actorKind));
  return (
    <PageCard title={t('Audit')} subtitle={t('Who or what did what, and when. Entries show the kind of actor.')} actions={<SearchBox value={q} onChange={setQ} label={t('Search audit entries')} />}>
      <DataTable
        rows={rows}
        onOpen={() => undefined}
        empty={t('No entries match.')}
        card={(r) => ({ icon: ShieldCheck, title: r.action, sub: r.resource, pill: <Pill tone="gray">{r.actorKind}</Pill>, meta: r.at })}
        cols={[
          { header: t('When'), render: (r) => r.at },
          { header: t('Action'), render: (r) => <span className="hd-strong">{r.action}</span> },
          { header: t('Resource'), render: (r) => r.resource },
          { header: t('Actor'), render: (r) => <Pill tone="gray">{r.actorKind}</Pill> },
        ]}
      />
    </PageCard>
  );
}

function IntegrationsArea() {
  const t = useT();
  const { data, mutate } = useHive();
  const [secret, setSecret] = useState<string | null>(null);
  return (
    <>
      <PageCard
        title={t('API keys')}
        subtitle={t('Keys are listed as metadata only; the secret is shown once when created')}
        actions={
          <button
            type="button"
            className="hd-btn is-dark hd-btn-sm"
            onClick={() => {
              const s = randomToken('hk_test');
              setSecret(s);
              mutate((d) => ({ ...d, apiKeys: [...d.apiKeys, { id: `key_${d.apiKeys.length + 1}`, name: 'New key', prefix: s.slice(0, 12), scopes: 'asset.read', created: 'today', lastUsed: 'never', status: 'Active' }] }), t('API key created'));
            }}
          >
            <Plus size={14} /> {t('Create key')}
          </button>
        }
      >
        <DataTable
          rows={data.apiKeys}
          onOpen={() => undefined}
          empty={t('No keys.')}
          card={(r) => ({ icon: KeyRound, title: r.name, sub: `${r.prefix}… · ${r.scopes}`, pill: <Pill tone={r.status === 'Active' ? 'green' : 'gray'}>{r.status}</Pill>, meta: t('last used {when}', { when: localize(r.lastUsed) }) })}
          cols={[
            { header: t('Name'), render: (r) => <span className="hd-strong">{r.name}</span> },
            { header: t('Prefix'), render: (r) => <code>{r.prefix}…</code> },
            { header: t('Scopes'), render: (r) => r.scopes },
            { header: t('Created'), render: (r) => r.created },
            { header: t('Last used'), render: (r) => r.lastUsed },
            { header: t('Status'), render: (r) => <Pill tone={r.status === 'Active' ? 'green' : 'gray'}>{r.status}</Pill> },
            { header: '', render: (r) => (
              <button type="button" className="hd-ghost" disabled={r.status === 'Revoked'} onClick={(e) => { e.stopPropagation(); mutate((d) => ({ ...d, apiKeys: d.apiKeys.map((k) => (k.id === r.id ? { ...k, status: 'Revoked' } : k)) }), t('{name} revoked', { name: r.name })); }}>{t('Revoke')}</button>
            ) },
          ]}
        />
      </PageCard>
      <PageCard title={t('Webhooks and usage')} subtitle={t('Outgoing events and API usage')}>
        <Field k={t('Webhook endpoints')} v={t('None configured')} />
        <Field k={t('API requests, last 24 h')} v="1,284 (placeholder)" />
      </PageCard>
      {secret && <SecretDialog title={t('New API key')} secret={secret} hint={t('Placeholder key: it does not work against any API.')} onClose={() => setSecret(null)} />}
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
    current === 'audit' ? <AuditArea /> :
    current === 'displays' ? <DisplaysArea /> :
    current === 'embed' ? <EmbedArea /> :
    current === 'branding' ? <BrandingArea /> : <IntegrationsArea />;
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
  const t = useT();
  const { lang, setLang } = useLang();
  const { apiState, notify } = useHive();
  const [email, setEmail] = useState(true);
  const [push, setPush] = useState(false);
  const apiText = { unconfigured: 'Not configured: showing placeholder data', checking: 'Checking…', online: 'Online', offline: 'Configured but not reachable' } as const;
  return (
    <>
      <PageCard title={t('Settings')} subtitle={t('Display preferences are saved in this browser only')}>
        <div className="hd-settings">
          <Toggle label={t('Dark theme')} hint={t('Switches the whole Hive dashboard')} on={dark} onChange={setDark} />
          <Toggle label={t('Compact tables')} hint={t('Tighter rows, more on screen')} on={compact} onChange={setCompact} />
          <label className="hd-toggle">
            <span><b>{t('Language')}</b><small>{t('Saved in this browser; sent to the API as Accept-Language')}</small></span>
            <select className="hd-lang" value={lang} aria-label={t('Language')} onChange={(e) => setLang(e.target.value as 'de' | 'en')}>
              <option value="de">Deutsch</option>
              <option value="en">English</option>
            </select>
          </label>
          <Toggle label={t('Alarm emails')} hint={t('Placeholder: needs the notification API')} on={email} onChange={(v) => { setEmail(v); notify(t('Saved on this page only (placeholder)')); }} />
          <Toggle label={t('Push notifications')} hint={t('Placeholder: mobile app not connected')} on={push} onChange={(v) => { setPush(v); notify(t('Saved on this page only (placeholder)')); }} />
        </div>
      </PageCard>
      <PageCard title={t('Diagnostics')} subtitle={t('Nothing here contains plant data or tokens')}>
        <Field k={t('Hive API')} v={t(apiText[apiState])} />
        <Field k={t('Dashboard')} v={t('Hive dashboard · placeholder build')} />
        <Field k={t('Browser time')} v={new Date().toLocaleTimeString('en-GB')} />
      </PageCard>
    </>
  );
}
