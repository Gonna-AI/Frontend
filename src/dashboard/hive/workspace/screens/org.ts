import { Archive, CreditCard, Eye, HeartPulse, ShieldHalf, StickyNote, Users } from 'lucide-react-dash';

import { col, count, is, make, now, res, sum } from '../def';
import type { Screen } from '../types';

export const people: Screen = {
  id: 'people',
  title: 'People and shifts',
  about: 'Who works where and when, and the qualifications a job needs. Never a ranking of people.',
  icon: Users,
  keywords: 'people shifts qualifications skills roster schicht',
  spec: 'GRAPH-PEOPLE',
  views: [
    {
      id: 'shifts',
      title: 'Shifts',
      resource: res('shift', '/v1/shifts', 'GRAPH-PEOPLE', 'shift_list', [
        { id: 'shf_01m71xxshf0000000000000a', name: 'A', hours: '06:00–14:00', days: 'Mon–Sat', area: 'Halle 1, Halle 2', on_shift: 18 },
        { id: 'shf_01m71xxshf0000000000000b', name: 'B', hours: '14:00–22:00', days: 'Mon–Fri', area: 'Halle 1, Halle 2', on_shift: 15 },
        { id: 'shf_01m71xxshf0000000000000c', name: 'C', hours: '22:00–06:00', days: 'Mon–Fri', area: 'Halle 1', on_shift: 7 },
      ]),
      columns: [col.title('name', 'Shift'), col.text('hours', 'Hours'), col.text('days', 'Days'), col.muted('area', 'Areas'), col.num('on_shift', 'People')],
    },
    {
      id: 'qualifications',
      title: 'Qualifications',
      statusKey: 'status',
      resource: res('person_qualification', '/v1/person-qualifications', 'GRAPH-PEOPLE', 'person_qualification_list', [
        { id: 'pqu_01m71xxpqu0000000000000a', person: 'Miriam Huber', qualification: 'Spindle work', valid_until: '2027-02', status: 'valid' },
        { id: 'pqu_01m71xxpqu0000000000000b', person: 'Miriam Huber', qualification: 'Electrical lockout (LOTO)', valid_until: '2026-12', status: 'expiring' },
        { id: 'pqu_01m71xxpqu0000000000000c', person: 'Jonas Weber', qualification: 'Hydraulics', valid_until: '2027-05', status: 'valid' },
        { id: 'pqu_01m71xxpqu0000000000000d', person: 'Aylin Demir', qualification: 'CMM operator', valid_until: '2026-09', status: 'expired' },
      ]),
      columns: [col.title('person', 'Person'), col.text('qualification', 'Qualification'), col.text('valid_until', 'Valid until'), col.status('status')],
      note: 'Qualifications decide who may take a job. HIVE does not score or rank people (works council agreement).',
    },
  ],
};

export const security: Screen = {
  id: 'security',
  title: 'Security',
  about: 'Your security posture: advisories that affect you, open vulnerabilities, incidents and customer-managed keys.',
  icon: ShieldHalf,
  keywords: 'security advisories vulnerabilities cve incidents keys byok egress',
  spec: 'SEC-CUST · SEC-VULN · SEC-IR · SEC-NET · SEC-KEYS',
  views: [
    {
      id: 'advisories',
      title: 'Advisories',
      statusKey: 'status',
      resource: res('security_advisory', '/v1/security-advisories', 'SEC-VULN', 'security_advisory_list', [
        { id: 'sad_01m71xxsad0000000000000a', title: 'OpenSSL 3.x timing issue in gateway image', severity: 'medium', affects: 'Gateway runtime < 1.8.2', status: 'fixed', published: '04 Nov' },
        { id: 'sad_01m71xxsad0000000000000b', title: 'OPC UA stack denial of service (vendor)', severity: 'high', affects: 'IM-02 controller firmware', status: 'mitigated', published: '29 Oct' },
        { id: 'sad_01m71xxsad0000000000000c', title: 'Browser library prototype pollution', severity: 'low', affects: 'Not used at runtime', status: 'not_affected', published: '21 Oct' },
      ]),
      columns: [col.title('title', 'Advisory'), col.status('severity', 'Severity'), col.muted('affects', 'Affects'), col.status('status'), col.muted('published', 'Published', false)],
      kpis: [count('Open', is('status', 'open', 'mitigated'), 'Affecting you', true), count('Fixed', is('status', 'fixed')), { label: 'Patch time (critical)', value: () => '2.1 d', sub: 'Median, last 12 months' }],
    },
    {
      id: 'keys',
      title: 'Keys',
      statusKey: 'status',
      resource: res('security_key', '/v1/security/keys', 'SEC-CUST', 'security_key_list', [
        { id: 'skey_01m71xxsky00000000000000a', purpose: 'Tenant data encryption', type: 'Customer managed (AWS KMS eu-central-1)', rotated: '01 Oct', status: 'active' },
        { id: 'skey_01m71xxsky00000000000000b', purpose: 'Audit log signing', type: 'HIVE managed', rotated: '01 Nov', status: 'active' },
      ]),
      columns: [col.title('purpose', 'Purpose'), col.text('type', 'Type'), col.muted('rotated', 'Rotated', false), col.status('status')],
    },
    {
      id: 'egress',
      title: 'Egress addresses',
      resource: res('egress_address', '/v1/egress-addresses', 'SEC-NET', 'egress_address_list', [
        { id: 'egr_01m71xxegr0000000000000a', address: '3.120.44.18/32', region: 'eu-central-1', used_for: 'Webhooks, ERP connectors' },
        { id: 'egr_01m71xxegr0000000000000b', address: '3.120.44.19/32', region: 'eu-central-1', used_for: 'Webhooks, ERP connectors' },
      ]),
      columns: [col.id('address', 'Address'), col.text('region', 'Region'), col.muted('used_for', 'Used for')],
      note: 'Allow these addresses in your firewall for traffic from HIVE. They change only with 30 days notice.',
    },
  ],
};

export const privacy: Screen = {
  id: 'privacy',
  title: 'Privacy',
  about: 'What personal data HIVE holds, for which purpose, who looked at it, and requests from data subjects.',
  icon: Eye,
  keywords: 'privacy gdpr personal data purposes access log subject requests dsgvo',
  spec: 'SEC-PRIV · CMP-GDPR',
  views: [
    {
      id: 'purposes',
      title: 'Purposes',
      resource: res('privacy_purpose', '/v1/privacy/purposes', 'SEC-PRIV', 'privacy_purpose_list', [
        { id: 'ppu_01m71xxppu0000000000000a', purpose: 'Maintenance coordination', data: 'Name, shift, qualifications', legal_basis: 'Art. 6(1)(b), works agreement', retention: 'Employment + 1 year' },
        { id: 'ppu_01m71xxppu0000000000000b', purpose: 'Audit of machine writes', data: 'Name, approvals, timestamps', legal_basis: 'Art. 6(1)(c)', retention: '10 years' },
        { id: 'ppu_01m71xxppu0000000000000c', purpose: 'Assistant conversations', data: 'Questions, answers', legal_basis: 'Art. 6(1)(f)', retention: '90 days' },
      ]),
      columns: [col.title('purpose', 'Purpose'), col.muted('data', 'Personal data'), col.text('legal_basis', 'Legal basis'), col.muted('retention', 'Kept for')],
    },
    {
      id: 'requests',
      title: 'Subject requests',
      statusKey: 'status',
      resource: res('data_subject_request', '/v1/data-subject-requests', 'CMP-GDPR', 'data_subject_request_list', [
        { id: 'dsr_01m71xxdsq0000000000000a', type: 'Access', subject: 'Former employee', received: '12 Nov', due: '12 Dec', status: 'in_progress' },
        { id: 'dsr_01m71xxdsq0000000000000b', type: 'Erasure', subject: 'Contractor (Fremdfirma)', received: '02 Nov', due: '02 Dec', status: 'completed' },
      ]),
      columns: [col.title('type', 'Type'), col.text('subject', 'Subject'), col.muted('received', 'Received', false), col.text('due', 'Due'), col.status('status')],
    },
    {
      id: 'access-log',
      title: 'Access log',
      resource: res('privacy_access_log', '/v1/privacy/access-log', 'SEC-PRIV', 'privacy_access_log_list', [
        { id: 'pal_01m71xxpal0000000000000a', who: 'Tobias Lang', what: 'Qualifications of Miriam Huber', why: 'Assign WO-2291', at: '10:44' },
        { id: 'pal_01m71xxpal0000000000000b', who: 'HIVE support (grant SG-14)', what: 'Audit entries, no personal fields', why: 'Ticket 8812', at: 'Yesterday' },
      ]),
      columns: [col.title('who', 'Who'), col.text('what', 'What'), col.muted('why', 'Why'), col.muted('at', 'At', false)],
    },
  ],
};

export const data: Screen = {
  id: 'data',
  title: 'Data lifecycle',
  about: 'Retention, legal holds, erasure, backups and data quality: how long data lives and that it can come back.',
  icon: Archive,
  keywords: 'retention legal hold erasure backup restore data quality deletion certificate',
  spec: 'DATA-LIFE · DATA-BACKUP · DATA-QUAL',
  views: [
    {
      id: 'retention',
      title: 'Retention',
      statusKey: 'status',
      resource: res('retention_policy', '/v1/retention-policies', 'DATA-LIFE', 'retention_policy_list', [
        { id: 'rtp_01m71xxrtp0000000000000a', data: 'Raw signals (1 s)', keep: '13 months', then: 'Downsample to 1 min', next_run: 'Tonight 02:00', status: 'active' },
        { id: 'rtp_01m71xxrtp0000000000000b', data: 'Downsampled signals', keep: '10 years', then: 'Delete', next_run: 'Sun', status: 'active' },
        { id: 'rtp_01m71xxrtp0000000000000c', data: 'Assistant threads', keep: '90 days', then: 'Delete with certificate', next_run: 'Tonight 02:00', status: 'active' },
        { id: 'rtp_01m71xxrtp0000000000000d', data: 'Audit log', keep: '10 years', then: 'Archive (WORM)', next_run: '—', status: 'active' },
      ]),
      columns: [col.title('data', 'Data'), col.text('keep', 'Kept for'), col.muted('then', 'Then'), col.muted('next_run', 'Next run'), col.status('status')],
    },
    {
      id: 'holds',
      title: 'Legal holds',
      statusKey: 'status',
      resource: res('legal_hold', '/v1/legal-holds', 'DATA-LIFE', 'legal_hold_list', [
        { id: 'lgh_01m71xxlgh0000000000000a', name: 'Customer claim housing 4471', scope: 'Lots L-2310-*, process values Line 2', since: '03 Nov', owner: 'Legal', status: 'active' },
      ]),
      columns: [col.title('name', 'Hold'), col.muted('scope', 'Scope'), col.text('since', 'Since'), col.text('owner', 'Owner'), col.status('status')],
      note: 'Data under a hold is never deleted by a retention run.',
    },
    {
      id: 'backups',
      title: 'Backups',
      statusKey: 'status',
      resource: res('restore_point', '/v1/restore-points', 'DATA-BACKUP', 'restore_point_list', [
        { id: 'rsp_01m71xxrsp0000000000000a', at: 'Today 02:00', type: 'Full', region: 'eu-central-1 + eu-west-1', size: '84 GB', verified: 'Restore test passed', status: 'completed' },
        { id: 'rsp_01m71xxrsp0000000000000b', at: 'Today 10:00', type: 'Incremental', region: 'eu-central-1 + eu-west-1', size: '1.2 GB', verified: 'Checksum', status: 'completed' },
      ]),
      columns: [col.title('at', 'Point in time'), col.text('type', 'Type'), col.muted('region', 'Copies'), col.text('size', 'Size'), col.muted('verified', 'Verified'), col.status('status')],
      kpis: [{ label: 'Recovery point', value: () => '≤ 5 min', sub: 'Continuous log shipping' }, { label: 'Last restore test', value: () => 'Today', sub: 'Full restore into a scratch cell' }],
    },
    {
      id: 'quality',
      title: 'Data quality',
      statusKey: 'status',
      resource: res('quality_profile', '/v1/quality-profiles', 'DATA-QUAL', 'quality_profile_list', [
        { id: 'qpr_01m71xxqpr0000000000000a', dataset: 'CNC-07 signals', completeness: 99.8, timeliness: '1 s p95', issues: 0, status: 'ok' },
        { id: 'qpr_01m71xxqpr0000000000000b', dataset: 'Halle 2 signals', completeness: 91.2, timeliness: 'Backfilling', issues: 3, status: 'degraded' },
        { id: 'qpr_01m71xxqpr0000000000000c', dataset: 'Energy meters', completeness: 96.0, timeliness: '15 min', issues: 1, status: 'warning' },
      ]),
      columns: [col.title('dataset', 'Data'), col.pct('completeness', 'Complete'), col.muted('timeliness', 'Timeliness'), col.num('issues', 'Issues'), col.status('status')],
    },
  ],
};

export const billing: Screen = {
  id: 'billing',
  title: 'Billing',
  about: 'Your plan, what you used this month and your invoices.',
  icon: CreditCard,
  keywords: 'billing plan contract usage invoices metering entitlements',
  spec: 'BILL-PLAN · BILL-METER · BILL-INV · TEN-ENT',
  views: [
    {
      id: 'usage',
      title: 'Usage',
      resource: res('usage_summary', '/v1/usage-summary', 'BILL-METER', 'usage_summary_get', [
        { id: 'usg_01m71xxusg0000000000000a', meter: 'Connected machines', used: 14, included: 25, used_pct: 56, unit: 'machines' },
        { id: 'usg_01m71xxusg0000000000000b', meter: 'Signals', used: 940, included: 2500, used_pct: 38, unit: 'signals' },
        { id: 'usg_01m71xxusg0000000000000c', meter: 'AI usage', used: 184, included: 400, used_pct: 46, unit: '€' },
        { id: 'usg_01m71xxusg0000000000000d', meter: 'Document storage', used: 38, included: 100, used_pct: 38, unit: 'GB' },
        { id: 'usg_01m71xxusg0000000000000e', meter: 'Users', used: 46, included: 50, used_pct: 92, unit: 'users' },
      ]),
      columns: [col.title('meter', 'Meter'), col.num('used', 'Used'), col.num('included', 'Included'), col.text('unit', 'Unit'), col.pct('used_pct', 'Used')],
      kpis: [{ label: 'Plan', value: () => 'Plant', sub: 'Annual contract, renews 01 Mar' }, { label: 'This month so far', value: () => '4,860 €', sub: 'No overage' }, { label: 'Nearest limit', value: () => 'Users 92 %', hot: () => true }],
    },
    {
      id: 'invoices',
      title: 'Invoices',
      statusKey: 'status',
      resource: res('invoice', '/v1/invoices', 'BILL-INV', 'invoice_list', [
        { id: 'inv_01m71xxinv0000000000000a', number: 'HIVE-2026-1011', period: 'October', amount: 4980, status: 'paid', due: '15 Nov' },
        { id: 'inv_01m71xxinv0000000000000b', number: 'HIVE-2026-0911', period: 'September', amount: 4790, status: 'paid', due: '15 Oct' },
        { id: 'inv_01m71xxinv0000000000000c', number: 'HIVE-2026-1111', period: 'November', amount: 4860, status: 'draft', due: '15 Dec' },
      ]),
      columns: [col.id('number', 'Invoice'), col.text('period', 'Period'), col.num('amount', 'Amount', '€'), col.text('due', 'Due'), col.status('status')],
      kpis: [sum('Billed this year', 'amount', '€')],
    },
  ],
};

export const status: Screen = {
  id: 'status',
  title: 'Service status',
  about: 'HIVE platform health, maintenance windows and the incidents we had, with their reviews.',
  icon: HeartPulse,
  keywords: 'status uptime sla maintenance platform incidents postmortem dr',
  spec: 'OPS-STATUS · OPS-INC · OPS-DR · OPS-SLO',
  views: [
    {
      id: 'components',
      title: 'Components',
      statusKey: 'status',
      resource: res('status', '/v1/status', 'OPS-STATUS', 'status_get', [
        { id: 'sts_01m71xxsts0000000000000a', component: 'API', region: 'eu-central-1', uptime_30d: 99.98, status: 'operational' },
        { id: 'sts_01m71xxsts0000000000000b', component: 'Telemetry ingest', region: 'eu-central-1', uptime_30d: 99.99, status: 'operational' },
        { id: 'sts_01m71xxsts0000000000000c', component: 'Assistant and agents', region: 'eu-central-1', uptime_30d: 99.91, status: 'operational' },
        { id: 'sts_01m71xxsts0000000000000d', component: 'Webhooks', region: 'eu-central-1', uptime_30d: 99.97, status: 'operational' },
        { id: 'sts_01m71xxsts0000000000000e', component: 'Documentation', region: 'Global', uptime_30d: 100, status: 'operational' },
      ]),
      columns: [col.title('component', 'Component'), col.text('region', 'Region'), col.num('uptime_30d', 'Uptime 30 d', '%'), { key: 'status', label: 'Status', kind: 'status', tones: { operational: 'green', degraded: 'amber', outage: 'red' } }],
      kpis: [{ label: 'SLA this month', value: () => '99.98 %', sub: 'Target 99.9 %' }, { label: 'Next maintenance', value: () => 'Sat 06:00', sub: '30 min, no downtime expected' }],
    },
    {
      id: 'incidents',
      title: 'Platform incidents',
      statusKey: 'status',
      resource: res('platform_incident', '/v1/platform-incidents', 'OPS-INC', 'platform_incident_list', [
        { id: 'pin_01m71xxpin0000000000000a', title: 'Delayed webhook deliveries', impact: 'Up to 4 min delay', duration: '38 min', review: 'Published', status: 'resolved', at: '06 Nov' },
        { id: 'pin_01m71xxpin0000000000000b', title: 'Assistant slow answers', impact: 'p95 9 s', duration: '1 h 12 min', review: 'Published', status: 'resolved', at: '19 Oct' },
      ]),
      columns: [col.title('title', 'Incident'), col.muted('impact', 'Impact'), col.text('duration', 'Duration'), col.muted('review', 'Review'), col.status('status'), col.muted('at', 'At', false)],
    },
  ],
};

export const notes: Screen = {
  id: 'notes',
  title: 'Notes',
  about: 'What people know that no manual says: notes on machines and parts, findable by everyone and by the assistant.',
  icon: StickyNote,
  keywords: 'notes tribal knowledge tips machine notes',
  spec: 'DOC-NOTES',
  views: [
    {
      id: 'notes',
      title: 'Notes',
      resource: res('note', '/v1/notes', 'DOC-NOTES', 'note_list', [
        { id: 'not_01m71xxnot0000000000000a', text: 'CNC-07: after a bearing change run the spindle warm-up program P-9001 for 20 min before production.', asset: 'CNC-07', author: 'Miriam Huber', at: '14 Mar', used_by_assistant: 6 },
        { id: 'not_01m71xxnot0000000000000b', text: 'IM-02 heater zone 3 needs 10 min longer after a weekend.', asset: 'IM-02', author: 'Night shift lead', at: '02 Nov', used_by_assistant: 2 },
        { id: 'not_01m71xxnot0000000000000c', text: 'Wälzlager Nord delivers 6205-2RS in 2 days if ordered before 11:00.', asset: '6205-2RS', author: 'Stefan Köhler', at: '20 Sep', used_by_assistant: 4 },
      ]),
      columns: [col.title('text', 'Note'), col.text('asset', 'About'), col.text('author', 'Author'), col.muted('at', 'Written', false), col.num('used_by_assistant', 'Cited')],
      titleKey: 'text',
      create: { label: 'Add note', operation: 'note_create', fields: [{ key: 'asset', label: 'About (machine or part)', required: true }, { key: 'text', label: 'Note', type: 'textarea', required: true }], make: (v) => make('not', { ...v, author: 'You', at: now(), used_by_assistant: 0 }), done: 'Note saved' },
    },
  ],
};

export const ORG = [people, security, privacy, data, billing, status];
export const KNOWLEDGE = [notes];
