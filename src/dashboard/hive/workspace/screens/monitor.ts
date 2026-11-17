import { Activity, BellRing, CheckCheck, Flame, GitBranch, Pause, Play, Siren, Waves } from 'lucide-react-dash';

import { col, count, is, make, now, res } from '../def';
import type { Screen } from '../types';

export const signals: Screen = {
  id: 'signals',
  title: 'Signals',
  about: 'Every measured value, its last reading, quality and the machine state derived from it.',
  icon: Waves,
  keywords: 'telemetry signals tags values sensors state historian timeseries',
  spec: 'GRAPH-SIG · TEL-INGEST · TEL-QUERY · TEL-STATE · TEL-CALC',
  views: [
    {
      id: 'signals',
      title: 'Signals',
      statusKey: 'quality',
      note: 'Values older than their expected interval are marked stale and are never shown as current.',
      resource: res('signal', '/v1/signals', 'GRAPH-SIG', 'signal_list', [
        { id: 'sig_01m71xxsp1nvib0rms000000a', key: 'spindle.vibration.rms', name: 'Spindle vibration RMS, drive end', asset: 'CNC-07', value: 4.8, unit: 'mm/s', limit: '4.5', quality: 'good', age: '1 s', source: 'Accelerometer 2 kHz' },
        { id: 'sig_01m71xxsp1ntemp00000000b', key: 'spindle.temperature', name: 'Spindle bearing temperature', asset: 'CNC-07', value: 63.2, unit: '°C', limit: '70', quality: 'good', age: '2 s', source: 'OPC UA' },
        { id: 'sig_01m71xxsp1nspeed0000000c', key: 'spindle.speed', name: 'Spindle speed', asset: 'CNC-07', value: 2460, unit: '1/min', limit: '—', quality: 'good', age: '1 s', source: 'OPC UA' },
        { id: 'sig_01m71xxsp1nload00000000d', key: 'spindle.load', name: 'Spindle load', asset: 'CNC-07', value: 38, unit: '%', limit: '90', quality: 'good', age: '1 s', source: 'OPC UA' },
        { id: 'sig_01m71xxcoolpress0000000e', key: 'coolant.pressure', name: 'Coolant pressure', asset: 'CNC-07', value: 5.1, unit: 'bar', limit: '4.0 min', quality: 'good', age: '3 s', source: 'OPC UA' },
        { id: 'sig_01m71xxcnc08curr0000000f', key: 'spindle.current', name: 'Spindle current (retrofit clamp)', asset: 'CNC-08', value: 12.4, unit: 'A', limit: '—', quality: 'estimated', age: '5 s', source: 'IO-Link via MQTT' },
        { id: 'sig_01m71xxpr01press000000g0', key: 'hydraulic.pressure', name: 'Hydraulic pressure', asset: 'PR-01', value: 182, unit: 'bar', limit: '210', quality: 'good', age: '2 s', source: 'S7 (read only)' },
        { id: 'sig_01m71xxk1press00000000h0', key: 'outlet.pressure', name: 'Outlet pressure', asset: 'Compressor K-1', value: 7.4, unit: 'bar', limit: '8.0', quality: 'good', age: '4 s', source: 'Modbus TCP' },
        { id: 'sig_01m71xxem00main0000000j0', key: 'power.active', name: 'Plant active power', asset: 'EM-MAIN', value: 1284, unit: 'kW', limit: '—', quality: 'stale', age: '14 min', source: 'M-Bus gateway' },
        { id: 'sig_01m71xxtq40torq0000000k0', key: 'torque.final', name: 'Final torque', asset: 'TQ-40', value: 24.6, unit: 'Nm', limit: '25 ± 1', quality: 'good', age: '40 s', source: 'Modbus TCP' },
      ]),
      columns: [col.title('name', 'Signal'), col.id('key', 'Key'), col.text('asset', 'Asset'), col.num('value', 'Value'), col.text('unit', 'Unit'), col.muted('limit', 'Limit'), col.status('quality', 'Quality'), col.muted('age', 'Age', false)],
      detail: [{ key: 'source', label: 'Source' }],
      kpis: [count('Signals', undefined, 'Across 14 machines'), count('Stale', is('quality', 'stale'), 'Older than their interval', true), count('Estimated', is('quality', 'estimated'), 'Retrofit or derived'), { label: 'Ingest rate', value: () => '2,940/s', sub: 'Samples per second, last 5 min' }],
      breakdown: { title: 'Signals by asset', by: 'asset' },
    },
    {
      id: 'states',
      title: 'Machine states',
      statusKey: 'state',
      resource: res('state_profile', '/v1/state-profiles', 'TEL-STATE', 'state_profile_list', [
        { id: 'stp_01m71xxcnc07state000000a', asset: 'CNC-07', state: 'producing', since: '06:12', rule: 'spindle.load > 5 % and program running', today_producing: 71, today_down: 6 },
        { id: 'stp_01m71xxcnc08state000000b', asset: 'CNC-08', state: 'idle', since: '09:40', rule: 'spindle.current < 2 A for 2 min', today_producing: 58, today_down: 0 },
        { id: 'stp_01m71xxcnc09state000000c', asset: 'CNC-09', state: 'setup', since: '10:05', rule: 'door open and no program', today_producing: 64, today_down: 2 },
        { id: 'stp_01m71xxpr01state0000000d', asset: 'PR-01', state: 'producing', since: '06:00', rule: 'stroke counter rising', today_producing: 88, today_down: 1 },
        { id: 'stp_01m71xxim02state0000000e', asset: 'IM-02', state: 'down', since: '10:32', rule: 'EUROMAP 77 machine mode = fault', today_producing: 49, today_down: 18 },
        { id: 'stp_01m71xxk1state000000000f', asset: 'Compressor K-1', state: 'unknown', since: '10:51', rule: 'No data for 5 min: never shown as off', today_producing: 0, today_down: 0 },
      ]),
      columns: [col.title('asset', 'Asset'), col.status('state', 'State'), col.text('since', 'Since'), col.pct('today_producing', 'Producing today'), col.num('today_down', 'Down today', '%'), col.muted('rule', 'Derived from')],
      kpis: [count('Producing', is('state', 'producing')), count('Down', is('state', 'down'), 'Needs a look', true), count('Unknown', is('state', 'unknown'), 'No data: not shown as off')],
    },
    {
      id: 'calculations',
      title: 'Calculated signals',
      statusKey: 'status',
      resource: res('derivation', '/v1/derivations', 'TEL-CALC', 'derivation_list', [
        { id: 'drv_01m71xxbpfo0000000000000a', name: 'Bearing outer race energy (BPFO band)', expression: 'band_energy(spectrum, 3.58 × speed/60 ± 3 Hz)', inputs: 'spindle.vibration.spectrum, spindle.speed', asset: 'CNC-07', status: 'active' },
        { id: 'drv_01m71xxenergypart0000000b', name: 'Energy per good part', expression: 'Δ energy / Δ good parts per hour', inputs: 'power.active, part.counter', asset: 'Line 2', status: 'active' },
        { id: 'drv_01m71xxairleak000000000c', name: 'Compressed air leakage estimate', expression: 'load at no demand, nights and weekends', inputs: 'outlet.pressure, power.active', asset: 'Compressor K-1', status: 'draft' },
      ]),
      columns: [col.title('name', 'Calculation'), col.text('asset', 'Asset'), col.id('expression', 'Expression'), col.muted('inputs', 'Inputs'), col.status('status')],
      actions: [{ label: 'Activate', icon: Play, operation: 'derivation_update', when: is('status', 'draft'), apply: () => ({ status: 'active' }), done: 'Calculation activated' }],
    },
  ],
};

export const events: Screen = {
  id: 'events',
  title: 'Events',
  about: 'The event stream: every change in HIVE as a CloudEvent, filterable by type and asset.',
  icon: Activity,
  keywords: 'event stream cloudevents log changes bus',
  spec: 'TEL-EVENT · API-RT · API-WHK',
  views: [
    {
      id: 'stream',
      title: 'Stream',
      statusKey: 'category',
      resource: res('event', '/v1/events', 'TEL-EVENT', 'event_list', [
        { id: 'evt_01m71xxe000000000000000a', type: 'com.clerktree.hive.alarm.raised.v1', category: 'alarm', subject: 'alm · CNC-07 spindle vibration', at: '10:41:07', actor: 'rule Spindle vibration' },
        { id: 'evt_01m71xxe000000000000000b', type: 'com.clerktree.hive.finding.created.v1', category: 'ml', subject: 'fnd · BPFO energy rising', at: '10:41:12', actor: 'model vib-anomaly v3' },
        { id: 'evt_01m71xxe000000000000000c', type: 'com.clerktree.hive.agent_run.awaiting_approval.v1', category: 'ai', subject: 'run · draft WO-2291', at: '10:42:30', actor: 'agent Maintenance planner' },
        { id: 'evt_01m71xxe000000000000000d', type: 'com.clerktree.hive.work_order.created.v1', category: 'work', subject: 'WO-2291 replace bearing', at: '10:44:02', actor: 'Tobias Lang' },
        { id: 'evt_01m71xxe000000000000000e', type: 'com.clerktree.hive.reservation.created.v1', category: 'parts', subject: '6205-2RS × 1', at: '10:44:05', actor: 'Tobias Lang' },
        { id: 'evt_01m71xxe000000000000000f', type: 'com.clerktree.hive.gateway.buffering.v1', category: 'edge', subject: 'hive-gw-es-01 link lost', at: '09:58:44', actor: 'gateway' },
        { id: 'evt_01m71xxe000000000000000g', type: 'com.clerktree.hive.asset.updated.v1', category: 'asset', subject: 'CNC-07 serial number', at: '09:12:10', actor: 'Jonas Weber' },
        { id: 'evt_01m71xxe000000000000000h', type: 'com.clerktree.hive.api_key.rotated.v1', category: 'security', subject: 'key · erp-sync', at: '08:30:00', actor: 'Ralf Maier' },
      ]),
      columns: [col.text('at', 'Time'), col.id('type', 'Type'), col.title('subject', 'Subject'), col.status('category', 'Category'), col.muted('actor', 'By')],
      kpis: [{ label: 'Events today', value: () => '18,402' }, { label: 'Event types in use', value: () => '74', sub: 'Of 518 in the catalog' }, { label: 'Webhook deliveries', value: () => '99.97 %', sub: 'Delivered within 60 s' }],
      breakdown: { title: 'Events by category', by: 'category' },
    },
  ],
};

export const incidents: Screen = {
  id: 'incidents',
  title: 'Incidents',
  about: 'Related alarms rolled up into one incident, with a timeline and an owner.',
  icon: Siren,
  keywords: 'incident alarm flood root cause timeline war room',
  spec: 'TEL-INCIDENT · TEL-ALARM',
  views: [
    {
      id: 'incidents',
      title: 'Incidents',
      statusKey: 'status',
      resource: res('incident', '/v1/incidents', 'TEL-INCIDENT', 'incident_list', [
        { id: 'inc_01m71xxinc0000000000000a', title: 'Line 2 spindle degradation', status: 'open', severity: 'high', alarms: 3, assets: 'CNC-07, CNC-09', owner: 'Tobias Lang', opened: '10:41', impact: 'Line 2 at 71 % OEE' },
        { id: 'inc_01m71xxinc0000000000000b', title: 'Halle 2 connectivity loss', status: 'mitigated', severity: 'medium', alarms: 12, assets: 'PR-01, PR-02, IM-01, IM-02', owner: 'Jonas Weber', opened: '09:58', impact: 'Data buffered on gateway, no loss' },
        { id: 'inc_01m71xxinc0000000000000c', title: 'IM-02 mould temperature fault', status: 'investigating', severity: 'medium', alarms: 2, assets: 'IM-02', owner: 'Aylin Demir', opened: '10:32', impact: 'IM-02 down 18 % of shift' },
        { id: 'inc_01m71xxinc0000000000000d', title: 'Compressor K-2 pressure dip', status: 'resolved', severity: 'low', alarms: 1, assets: 'Compressor K-2', owner: 'Miriam Huber', opened: 'Yesterday', impact: 'None' },
      ]),
      columns: [col.title('title', 'Incident'), col.status('status'), col.status('severity', 'Severity'), col.num('alarms', 'Alarms'), col.muted('assets', 'Assets'), col.text('owner', 'Owner'), col.muted('opened', 'Opened', false)],
      detail: [{ key: 'impact', label: 'Impact' }],
      kpis: [count('Open', is('status', 'open', 'investigating'), 'Needs an owner on it', true), count('Mitigated', is('status', 'mitigated')), { label: 'Mean time to resolve', value: () => '2.4 h', sub: 'Last 30 days' }],
      actions: [
        { label: 'Mark mitigated', icon: CheckCheck, operation: 'incident_update', when: is('status', 'open', 'investigating'), apply: () => ({ status: 'mitigated' }), done: 'Incident marked mitigated' },
        { label: 'Resolve', icon: CheckCheck, operation: 'incident_update', when: is('status', 'mitigated'), apply: () => ({ status: 'resolved' }), done: 'Incident resolved' },
      ],
      create: { label: 'Open incident', operation: 'incident_create', fields: [{ key: 'title', label: 'Title', required: true }, { key: 'severity', label: 'Severity', type: 'select', options: ['high', 'medium', 'low'] }, { key: 'assets', label: 'Assets' }], make: (v) => make('inc', { ...v, status: 'open', alarms: 0, owner: 'You', opened: now(), impact: '—' }), done: 'Incident opened' },
    },
  ],
};

export const rules: Screen = {
  id: 'rules',
  title: 'Rules',
  about: 'Alarm definitions and rules: what is watched, the limits, and what happens when they are crossed.',
  icon: Flame,
  keywords: 'rules alarm definitions limits thresholds conditions',
  spec: 'TEL-RULE · TEL-ALARM',
  views: [
    {
      id: 'definitions',
      title: 'Alarm definitions',
      statusKey: 'status',
      resource: res('alarm_definition', '/v1/alarm-definitions', 'TEL-ALARM', 'alarm_definition_list', [
        { id: 'ald_01m71xxald0000000000000a', name: 'Spindle vibration high', condition: 'spindle.vibration.rms > 4.5 mm/s for 60 s', warning: '3.5 mm/s', priority: 'critical', scope: 'All Kessler KM 500', status: 'approved', raised_30d: 4 },
        { id: 'ald_01m71xxald0000000000000b', name: 'Spindle temperature high', condition: 'spindle.temperature > 70 °C', warning: '65 °C', priority: 'high', scope: 'Line 2', status: 'approved', raised_30d: 2 },
        { id: 'ald_01m71xxald0000000000000c', name: 'Coolant pressure low', condition: 'coolant.pressure < 4.0 bar for 30 s', warning: '4.5 bar', priority: 'medium', scope: 'Line 2', status: 'approved', raised_30d: 7 },
        { id: 'ald_01m71xxald0000000000000d', name: 'Torque out of tolerance', condition: '|torque.final − 25| > 1 Nm', warning: '0.8 Nm', priority: 'high', scope: 'TQ-40', status: 'review', raised_30d: 0 },
        { id: 'ald_01m71xxald0000000000000e', name: 'Gateway buffering', condition: 'edge link lost > 2 min', warning: '—', priority: 'medium', scope: 'All gateways', status: 'approved', raised_30d: 3 },
      ]),
      columns: [col.title('name', 'Definition'), col.id('condition', 'Condition'), col.status('priority', 'Priority'), col.muted('scope', 'Scope'), col.num('raised_30d', 'Raised 30 d'), col.status('status')],
      detail: [{ key: 'warning', label: 'Warning at' }],
      kpis: [count('Approved', is('status', 'approved')), count('In review', is('status', 'review'), 'A second person approves limits'), { label: 'Alarm load', value: () => '1.2 / h', sub: 'Per operator, ISA-18.2 target < 6' }],
      actions: [{ label: 'Approve', icon: CheckCheck, operation: 'alarm_definition_approve', when: is('status', 'review'), apply: () => ({ status: 'approved' }), done: 'Definition approved', confirm: 'Limits take effect on every machine in scope.' }],
    },
    {
      id: 'rules',
      title: 'Rules',
      statusKey: 'status',
      resource: res('rule', '/v1/rules', 'TEL-RULE', 'rule_list', [
        { id: 'rul_01m71xxrul0000000000000a', name: 'Bearing wear trend to finding', trigger: 'BPFO energy rising 3 days', then: 'Create finding, notify planner', status: 'active', fired_7d: 1 },
        { id: 'rul_01m71xxrul0000000000000b', name: 'Scrap spike to quality', trigger: 'Scrap rate > 2 % per hour', then: 'Open nonconformity draft', status: 'active', fired_7d: 0 },
        { id: 'rul_01m71xxrul0000000000000c', name: 'Night air leak check', trigger: 'Compressor load > 20 % with no shift', then: 'Notify energy owner', status: 'paused', fired_7d: 3 },
      ]),
      columns: [col.title('name', 'Rule'), col.text('trigger', 'When'), col.text('then', 'Then'), col.num('fired_7d', 'Fired 7 d'), col.status('status')],
      actions: [
        { label: 'Pause', icon: Pause, operation: 'rule_update', when: is('status', 'active'), apply: () => ({ status: 'paused' }), done: 'Rule paused' },
        { label: 'Resume', icon: Play, operation: 'rule_update', when: is('status', 'paused'), apply: () => ({ status: 'active' }), done: 'Rule resumed' },
      ],
    },
  ],
};

export const workflows: Screen = {
  id: 'workflows',
  title: 'Workflows',
  about: 'Multi-step flows that react to events: each run with its steps, waits and outcome.',
  icon: GitBranch,
  keywords: 'workflow flow orchestration runs steps',
  spec: 'TEL-FLOW',
  views: [
    {
      id: 'runs',
      title: 'Runs',
      statusKey: 'status',
      resource: res('workflow_run', '/v1/workflow-runs', 'TEL-FLOW', 'workflow_run_list', [
        { id: 'wfr_01m71xxwfr0000000000000a', workflow: 'Spindle alarm response', trigger: 'Alarm CNC-07 vibration', step: 'Waiting for approval of WO-2291', progress: 60, status: 'waiting', started: '10:41' },
        { id: 'wfr_01m71xxwfr0000000000000b', workflow: 'Shift handover', trigger: 'Shift B starts', step: 'Summary sent to Teams', progress: 100, status: 'completed', started: '13:55' },
        { id: 'wfr_01m71xxwfr0000000000000c', workflow: 'Gateway reconnect', trigger: 'hive-gw-es-01 link restored', step: 'Backfill 42 min of data', progress: 85, status: 'running', started: '10:39' },
        { id: 'wfr_01m71xxwfr0000000000000d', workflow: 'Low stock reorder', trigger: '6205-2RS below minimum', step: 'ERP write rejected: vendor blocked', progress: 40, status: 'failed', started: '08:12' },
      ]),
      columns: [col.title('workflow', 'Workflow'), col.text('trigger', 'Trigger'), col.text('step', 'Current step'), col.pct('progress', 'Progress'), col.status('status'), col.muted('started', 'Started', false)],
      kpis: [count('Running', is('status', 'running', 'waiting')), count('Failed', is('status', 'failed'), 'Retry or fix', true), { label: 'Runs this week', value: () => '312' }],
      actions: [{ label: 'Retry', icon: Play, operation: 'workflow_run_retry', when: is('status', 'failed'), apply: () => ({ status: 'running', progress: 10, step: 'Retrying' }), done: 'Run restarted' }],
    },
  ],
};

export const notifications: Screen = {
  id: 'notifications',
  title: 'Notifications',
  about: 'Who is told what, on which channel, and the escalation when nobody answers.',
  icon: BellRing,
  keywords: 'notification policy escalation teams email sms on call',
  spec: 'TEL-NOTIFY',
  views: [
    {
      id: 'policies',
      title: 'Policies',
      statusKey: 'status',
      resource: res('notification_policy', '/v1/notification-policies', 'TEL-NOTIFY', 'notification_policy_list', [
        { id: 'ntp_01m71xxntp0000000000000a', name: 'Critical alarms Halle 1', match: 'priority = critical, Halle 1', channels: ['Teams', 'SMS'], escalation: 'Shift lead after 10 min, plant manager after 30 min', status: 'active' },
        { id: 'ntp_01m71xxntp0000000000000b', name: 'Approvals waiting', match: 'approval_request.created', channels: ['Email', 'Push'], escalation: 'Reminder after 2 h', status: 'active' },
        { id: 'ntp_01m71xxntp0000000000000c', name: 'Gateway offline', match: 'gateway.offline', channels: ['Email'], escalation: 'Jonas Weber after 15 min', status: 'active' },
        { id: 'ntp_01m71xxntp0000000000000d', name: 'Weekly OEE summary', match: 'schedule Mon 07:00', channels: ['Email'], escalation: '—', status: 'paused' },
      ]),
      columns: [col.title('name', 'Policy'), col.muted('match', 'Matches'), col.tags('channels', 'Channels'), col.muted('escalation', 'Escalation'), col.status('status')],
    },
    {
      id: 'sent',
      title: 'Sent',
      statusKey: 'status',
      resource: res('notification', '/v1/notifications', 'TEL-NOTIFY', 'notification_list', [
        { id: 'ntf_01m71xxntf0000000000000a', subject: 'CNC-07 spindle vibration critical', to: 'Miriam Huber', channel: 'Teams', status: 'delivered', at: '10:41' },
        { id: 'ntf_01m71xxntf0000000000000b', subject: 'Approval: WO-2291', to: 'Tobias Lang', channel: 'Email', status: 'delivered', at: '10:42' },
        { id: 'ntf_01m71xxntf0000000000000c', subject: 'Escalation: CNC-07 unacknowledged', to: 'Dr. Elke Brandt', channel: 'SMS', status: 'sent', at: '10:51' },
        { id: 'ntf_01m71xxntf0000000000000d', subject: 'hive-gw-es-01 offline', to: 'Jonas Weber', channel: 'Email', status: 'failed', at: '09:59' },
      ]),
      columns: [col.title('subject', 'Subject'), col.text('to', 'To'), col.text('channel', 'Channel'), col.status('status'), col.muted('at', 'At', false)],
    },
  ],
};

export const MONITOR = [signals, events, incidents, rules, workflows, notifications];
