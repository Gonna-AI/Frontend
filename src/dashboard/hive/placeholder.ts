/**
 * Placeholder content for the Hive dashboard.
 *
 * Nothing here is real plant data. The Hive API only exposes a health endpoint today, so every
 * figure on the page comes from this file until the owning API modules exist. Each block names the
 * resource that will replace it (see hiveApi.ts). Names follow the public reference scenario:
 * a fictional plant, "Musterwerk GmbH". There is no per-person data anywhere: people appear only
 * as user accounts in the admin area, never in performance, alarm or activity data.
 */

/* ---------- vocabulary ---------- */

export type MachineState = 'producing' | 'idle' | 'setup' | 'planned_stop' | 'unplanned_stop' | 'fault' | 'off' | 'unknown';
export const MACHINE_STATES: MachineState[] = ['producing', 'idle', 'setup', 'planned_stop', 'unplanned_stop', 'fault', 'off', 'unknown'];
export const STATE_LABEL: Record<MachineState, string> = {
  producing: 'Producing',
  idle: 'Idle',
  setup: 'Setup',
  planned_stop: 'Planned stop',
  unplanned_stop: 'Unplanned stop',
  fault: 'Fault',
  off: 'Off',
  unknown: 'Unknown',
};

export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type AlarmState = 'Open' | 'Acknowledged' | 'Resolved';
export type WorkOrderState = 'Draft' | 'Submitted' | 'In progress' | 'Done';
export type ApprovalState = 'Pending' | 'Approved' | 'Rejected';
export type Applicability = 'applies' | 'does_not_apply' | 'unknown';

/* ---------- machines ---------- */

export interface HiveSignal {
  key: string;
  label: string;
  unit: string;
  value: number;
  /** Limit comes from the alarm definition, never typed into the client. */
  limit?: number;
  decimals: number;
  quality: 'good' | 'estimated' | 'stale';
  ageS: number;
}

export interface HiveMachine {
  id: string;
  key: string;
  name: string;
  type: string;
  site: string;
  area: string;
  line: string;
  /** Stable identifier of the line (never translated). */
  lineId: string;
  state: MachineState;
  stateAgeS: number;
  oee: number;
  openAlarms: number;
  signals: HiveSignal[];
}

/* ---------- operations ---------- */

export interface HiveAlarm {
  id: string;
  title: string;
  machineId: string;
  machine: string;
  component?: string;
  severity: Severity;
  state: AlarmState;
  raisedAt: string;
  time: string;
  detail: string;
  value?: string;
  limit?: string;
}

export interface HiveWorkOrder {
  id: string;
  title: string;
  machineId: string;
  machine: string;
  priority: Severity;
  state: WorkOrderState;
  due: string;
  target: 'ERP' | 'CMMS';
  parts: string[];
  evidence: string[];
}

export interface HiveEvidence {
  label: string;
  locator: string;
  applicability: Applicability;
  reason?: string;
  observed: string;
}

export interface HiveApproval {
  id: string;
  kind: 'work_order' | 'purchase_requisition';
  title: string;
  machine: string;
  source: string;
  tier: 'T1';
  state: ApprovalState;
  requestedAt: string;
  summary: string;
  fields: { k: string; v: string }[];
  evidence: HiveEvidence[];
  rejectReason?: string;
}

export interface HiveNotification {
  id: string;
  text: string;
  at: string;
  read: boolean;
  to: { section: string; id?: string };
}

export interface HiveFinding {
  id: string;
  kind: 'Finding' | 'Prediction';
  title: string;
  machine: string;
  confidence: number;
  model: string;
  ageS: number;
  evidence: HiveEvidence[];
  status: 'Awaiting confirmation' | 'Confirmed' | 'Rejected';
  reason?: string;
}

export interface HiveDocument {
  id: string;
  name: string;
  kind: 'Manual' | 'Drawing' | 'SOP' | 'Report';
  machine: string;
  pages: number;
  updated: string;
  revision: string;
  applicability: Applicability;
  passages: { text: string; page: number; applicability: Applicability; reason?: string }[];
}

export interface HivePart {
  id: string;
  number: string;
  name: string;
  machine: string;
  onHand: number;
  min: number;
  location: string;
  syncedDaysAgo: number;
  reserved: number;
}

export interface HiveVendor {
  id: string;
  name: string;
  category: string;
  country: string;
  leadTimeDays: number;
}

export interface HiveRfq {
  id: string;
  part: string;
  status: 'Open' | 'Replies in' | 'Closed';
  replies: { vendor: string; price: string; leadTime: string; specMatch: 'Match' | 'Partial' | 'No match'; raw: string }[];
}

export interface HiveRequisition {
  id: string;
  part: string;
  vendor: string;
  total: string;
  state: 'Draft' | 'Pending approval' | 'Approved' | 'Rejected';
}

export interface HiveFeedItem {
  id: string;
  kind: 'alarm' | 'work_order' | 'gateway' | 'document' | 'approval';
  text: string;
  at: string;
  day: string;
}

export interface HiveEvent {
  id: string;
  activity: string;
  asset: string;
  status: 'Resolved' | 'Open' | 'Acknowledged';
  at: string;
  kind: 'thermal' | 'link' | 'quality' | 'maintenance' | 'stock';
}

export interface HiveSite {
  id: string;
  name: string;
  oee: string;
  signals: string;
  state: 'Active' | 'Inactive';
}

export interface HiveGatewayRow {
  id: string;
  site: string;
  version: string;
  uptime: string;
  link: 'Online' | 'Buffering' | 'Offline';
  bufferPct: number;
  drivers: string;
}

/* ---------- assistant ---------- */

export interface AssistantCitation {
  label: string;
  locator: string;
  applicability: Applicability;
  reason?: string;
}
export interface AssistantMessage {
  id: string;
  from: 'user' | 'assistant';
  /** Seed (demo) message: translated for display, unlike text a person typed. */
  seed?: boolean;
  text: string;
  citations?: AssistantCitation[];
  abstained?: boolean;
}
export interface AssistantThread {
  id: string;
  title: string;
  /** True when the title is the user's own text (never translated). */
  userTitle?: boolean;
  context: string;
  at: string;
  messages: AssistantMessage[];
}

/* ---------- graph ---------- */

export interface GraphNode {
  id: string;
  label: string;
  kind: 'Machine' | 'Component' | 'Document' | 'Work order' | 'Vendor' | 'Part';
  x: number;
  y: number;
  detail: string;
}
export interface GraphEdge {
  from: string;
  to: string;
  rel: string;
}

/* ---------- admin ---------- */

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  status: 'Active' | 'Invited' | 'Suspended';
  signIn: 'Company SSO' | 'Passkey' | 'Password';
  roles: string;
}
export interface AdminGrant {
  id: string;
  principal: string;
  role: string;
  scope: string;
  coverage: string;
}
export interface AdminConnection {
  id: string;
  name: string;
  connector: string;
  kind: 'OT' | 'IT';
  state: 'Healthy' | 'Degraded' | 'Disabled' | 'Not tested';
  write: 'Read only' | 'Catalogued writes';
  lastOk: string;
}
export interface AdminApiKey {
  id: string;
  name: string;
  prefix: string;
  scopes: string;
  created: string;
  lastUsed: string;
  status: 'Active' | 'Revoked';
}
export interface AdminAudit {
  id: string;
  at: string;
  action: string;
  resource: string;
  actorKind: 'Person' | 'Service account' | 'Agent' | 'System';
}
export interface AdminPolicy {
  tier: 'T1' | 'T2' | 'T3' | 'T4';
  approvals: string;
  stepUp: string;
  automation: string;
}

/* ---------- the dataset ---------- */

export interface HiveOverview {
  plant: { name: string; availability: string; delta: string; deltaUp: boolean };
  tiles: { key: 'signals' | 'alarms' | 'assets' | 'workOrders'; label: string; value: string; delta: string; up: boolean }[];
  sites: HiveSite[];
  bufferUsedGb: number;
  bufferTotalGb: number;
  gateways: { id: string; version: string; uptime: string; state: 'Active' | 'Inactive' }[];
  alarmVolume: { label: string; raised: number; resolved: number }[];
  events: HiveEvent[];
  machines: HiveMachine[];
  alarms: HiveAlarm[];
  workOrders: HiveWorkOrder[];
  approvals: HiveApproval[];
  notifications: HiveNotification[];
  findings: HiveFinding[];
  documents: HiveDocument[];
  parts: HivePart[];
  vendors: HiveVendor[];
  rfqs: HiveRfq[];
  requisitions: HiveRequisition[];
  feed: HiveFeedItem[];
  gatewayFleet: HiveGatewayRow[];
  oeeTrend: { label: string; hall1: number; hall2: number; store: number }[];
  kpis: { scope: 'Site' | 'Line' | 'Machine'; name: string; oee: number; availability: number; performance: number; quality: number; downtimeMin: number }[];
  threads: AssistantThread[];
  graph: { nodes: GraphNode[]; edges: GraphEdge[] };
  users: AdminUser[];
  grants: AdminGrant[];
  connections: AdminConnection[];
  apiKeys: AdminApiKey[];
  audit: AdminAudit[];
  policies: AdminPolicy[];
}

const sig = (key: string, label: string, unit: string, value: number, decimals: number, limit?: number, quality: HiveSignal['quality'] = 'good', ageS = 1): HiveSignal => ({ key, label, unit, value, decimals, limit, quality, ageS });

const cncEvidence: HiveEvidence[] = [
  { label: 'Spindle bearing temperature', locator: 'signal · last 3 min', applicability: 'applies', observed: '15 Nov 03:45 PM' },
  { label: 'CNC-07 operating manual', locator: 'p. 118, bearing service', applicability: 'applies', observed: 'rev. C' },
  { label: 'CNC-09 service note', locator: 'p. 2', applicability: 'does_not_apply', reason: 'other model variant', observed: 'rev. A' },
];

export const placeholderOverview: HiveOverview = {
  plant: { name: 'Musterwerk GmbH', availability: '94.8%', delta: '2%', deltaUp: true },
  tiles: [
    { key: 'signals', label: 'Live signals', value: '12,480', delta: '7%', up: true },
    { key: 'alarms', label: 'Open alarms', value: '2', delta: '5%', up: false },
    { key: 'assets', label: 'Machines online', value: '7 of 8', delta: '8%', up: true },
    { key: 'workOrders', label: 'Work orders', value: '27', delta: '4%', up: true },
  ],
  sites: [
    { id: 'hall1', name: 'Halle 1', oee: '86.4%', signals: '4,920 signals', state: 'Active' },
    { id: 'hall2', name: 'Halle 2', oee: '81.0%', signals: '3,610 signals', state: 'Active' },
    { id: 'store', name: 'Lager', oee: '73.2%', signals: '1,140 signals', state: 'Inactive' },
  ],
  bufferUsedGb: 1.4,
  bufferTotalGb: 5.5,
  gateways: [
    { id: 'gw_01HZX4 · 6782', version: '1.4.2', uptime: '41 d', state: 'Active' },
    { id: 'gw_01HZX9 · 4356', version: '1.4.2', uptime: '12 d', state: 'Active' },
  ],
  alarmVolume: [
    { label: 'W1', raised: 22, resolved: 16 },
    { label: 'W2', raised: 41, resolved: 30 },
    { label: 'W3', raised: 29, resolved: 21 },
    { label: 'W4', raised: 34, resolved: 28 },
    { label: 'W5', raised: 39, resolved: 25 },
    { label: 'W6', raised: 47, resolved: 33 },
    { label: 'W7', raised: 36, resolved: 31 },
    { label: 'W8', raised: 31, resolved: 19 },
  ],
  events: [
    { id: 'EVT_000076', activity: 'Spindle temperature high', asset: 'CNC-07', status: 'Resolved', at: '15 Nov, 2026 03:45 PM', kind: 'thermal' },
    { id: 'EVT_000075', activity: 'Gateway link lost', asset: 'Halle 2', status: 'Open', at: '15 Nov, 2026 11:30 AM', kind: 'link' },
    { id: 'EVT_000074', activity: 'Scrap rate above limit', asset: 'Press 03', status: 'Resolved', at: '14 Nov, 2026 12:00 PM', kind: 'quality' },
    { id: 'EVT_000073', activity: 'Maintenance window due', asset: 'CNC-07', status: 'Acknowledged', at: '14 Nov, 2026 09:15 PM', kind: 'maintenance' },
    { id: 'EVT_000072', activity: 'Spare part below minimum', asset: 'Lager', status: 'Resolved', at: '10 Nov, 2026 06:00 AM', kind: 'stock' },
  ],
  machines: [
    {
      id: 'ast_cnc07', key: 'CNC-07', name: 'CNC machining centre 07', type: 'CNC machining centre', site: 'Halle 1', area: 'Machining', line: 'Line 2', lineId: 'line-2', state: 'fault', stateAgeS: 1260, oee: 71.2, openAlarms: 2,
      signals: [
        sig('spindle_temp', 'Spindle temperature', '°C', 87.4, 1, 80),
        sig('spindle_load', 'Spindle load', '%', 62, 0, 95),
        sig('vib_rms', 'Vibration RMS', 'mm/s', 7.8, 1, 7.1),
        sig('coolant_p', 'Coolant pressure', 'bar', 5.9, 1, undefined, 'good', 2),
        sig('feed', 'Feed rate', 'mm/min', 0, 0, undefined, 'good', 3),
        sig('tool_life', 'Tool life used', '%', 74, 0, undefined, 'estimated', 12),
      ],
    },
    {
      id: 'ast_cnc08', key: 'CNC-08', name: 'CNC machining centre 08', type: 'CNC machining centre', site: 'Halle 1', area: 'Machining', line: 'Line 2', lineId: 'line-2', state: 'producing', stateAgeS: 5400, oee: 88.9, openAlarms: 0,
      signals: [sig('spindle_temp', 'Spindle temperature', '°C', 61.2, 1, 80), sig('spindle_load', 'Spindle load', '%', 71, 0, 95), sig('vib_rms', 'Vibration RMS', 'mm/s', 2.4, 1, 7.1), sig('feed', 'Feed rate', 'mm/min', 1800, 0)],
    },
    {
      id: 'ast_press03', key: 'Press 03', name: 'Hydraulic press 03', type: 'Hydraulic press', site: 'Halle 1', area: 'Forming', line: 'Line 1', lineId: 'line-1', state: 'producing', stateAgeS: 2200, oee: 84.1, openAlarms: 0,
      signals: [sig('oil_temp', 'Oil temperature', '°C', 48.1, 1, 70), sig('press_force', 'Press force', 'kN', 412, 0, 500), sig('cycle', 'Cycle time', 's', 6.4, 1)],
    },
    {
      id: 'ast_comp02', key: 'Compressor 02', name: 'Compressor 02', type: 'Compressed air', site: 'Halle 2', area: 'Utilities', line: 'Utilities', lineId: 'utilities', state: 'producing', stateAgeS: 86400, oee: 92.6, openAlarms: 0,
      signals: [sig('supply_p', 'Supply pressure', 'bar', 6.5, 1), sig('motor_temp', 'Motor temperature', '°C', 66.0, 1, 90)],
    },
    {
      id: 'ast_conv_a', key: 'Conveyor A', name: 'Conveyor line A', type: 'Conveyor line', site: 'Halle 2', area: 'Logistics', line: 'Line 3', lineId: 'line-3', state: 'idle', stateAgeS: 540, oee: 64.0, openAlarms: 0,
      signals: [sig('belt_speed', 'Belt speed', 'm/s', 0, 2), sig('motor_current', 'Motor current', 'A', 0.4, 1)],
    },
    {
      id: 'ast_robot1', key: 'Robot cell 1', name: 'Handling robot cell 1', type: 'Handling robot', site: 'Halle 2', area: 'Assembly', line: 'Line 3', lineId: 'line-3', state: 'setup', stateAgeS: 900, oee: 90.3, openAlarms: 0,
      signals: [sig('cycle', 'Cycle time', 's', 11.2, 1), sig('gripper_p', 'Gripper pressure', 'bar', 4.8, 1)],
    },
    {
      id: 'ast_lift1', key: 'Hoist 1', name: 'Overhead hoist 1', type: 'Overhead hoist', site: 'Lager', area: 'Warehouse', line: 'Warehouse', lineId: 'warehouse', state: 'unknown', stateAgeS: 7200, oee: 0, openAlarms: 0,
      signals: [sig('load', 'Load', 'kg', 0, 0, undefined, 'stale', 7200)],
    },
    {
      id: 'ast_oven2', key: 'Curing oven 2', name: 'Curing oven 2', type: 'Industrial oven', site: 'Halle 2', area: 'Finishing', line: 'Line 3', lineId: 'line-3', state: 'planned_stop', stateAgeS: 3600, oee: 79.5, openAlarms: 0,
      signals: [sig('chamber_temp', 'Chamber temperature', '°C', 42.0, 1, 220), sig('fan', 'Fan speed', 'rpm', 0, 0)],
    },
  ],
  alarms: [
    { id: 'ALM_0412', title: 'Spindle temperature high', machineId: 'ast_cnc07', machine: 'CNC-07', component: 'Spindle unit', severity: 'critical', state: 'Open', raisedAt: '15 Nov, 2026 03:45 PM', time: '3:45 PM', detail: 'Spindle bearing temperature above the high limit for 3 minutes.', value: '87.4 °C', limit: '80 °C' },
    { id: 'ALM_0411', title: 'Gateway link lost', machineId: 'ast_conv_a', machine: 'Halle 2', component: 'Gateway', severity: 'high', state: 'Open', raisedAt: '15 Nov, 2026 11:30 AM', time: '11:30 AM', detail: 'The gateway in Halle 2 has not reported for 6 minutes. Data is buffered on the gateway and replays when the link returns.' },
    { id: 'ALM_0409', title: 'Vibration trending up', machineId: 'ast_cnc07', machine: 'CNC-07', component: 'Drive-end bearing', severity: 'high', state: 'Acknowledged', raisedAt: '15 Nov, 2026 09:12 AM', time: '9:12 AM', detail: 'Axis vibration RMS rose 18% over the last 24 hours.', value: '7.8 mm/s', limit: '7.1 mm/s' },
    { id: 'ALM_0407', title: 'Scrap rate above limit', machineId: 'ast_press03', machine: 'Press 03', severity: 'medium', state: 'Resolved', raisedAt: '14 Nov, 2026 12:00 PM', time: '12:00 PM', detail: 'Scrap rate exceeded 3% for one shift. Cleared after a tool change.' },
    { id: 'ALM_0405', title: 'Air pressure low', machineId: 'ast_comp02', machine: 'Compressor 02', severity: 'medium', state: 'Acknowledged', raisedAt: '14 Nov, 2026 07:40 AM', time: '7:40 AM', detail: 'Supply pressure dipped below 6.2 bar twice.' },
    { id: 'ALM_0402', title: 'Door sensor stuck', machineId: 'ast_robot1', machine: 'Robot cell 1', severity: 'low', state: 'Resolved', raisedAt: '13 Nov, 2026 04:05 PM', time: '4:05 PM', detail: 'A sensor reported an unchanged value for 10 minutes. Monitoring only.' },
  ],
  workOrders: [
    { id: 'WO_1042', title: 'Inspect spindle bearing', machineId: 'ast_cnc07', machine: 'CNC-07', priority: 'high', state: 'Submitted', due: '17 Nov, 2026', target: 'CMMS', parts: ['Bearing 6205-2RS'], evidence: ['Spindle bearing temperature', 'CNC-07 operating manual p. 118'] },
    { id: 'WO_1041', title: 'Replace hydraulic filter', machineId: 'ast_press03', machine: 'Press 03', priority: 'medium', state: 'In progress', due: '18 Nov, 2026', target: 'ERP', parts: ['Hydraulic filter HF-20'], evidence: ['Maintenance plan'] },
    { id: 'WO_1039', title: 'Check gateway power supply', machineId: 'ast_conv_a', machine: 'Halle 2', priority: 'high', state: 'Draft', due: '16 Nov, 2026', target: 'CMMS', parts: [], evidence: ['Alarm ALM_0411'] },
    { id: 'WO_1036', title: 'Quarterly oven calibration', machineId: 'ast_oven2', machine: 'Curing oven 2', priority: 'low', state: 'Draft', due: '28 Nov, 2026', target: 'ERP', parts: [], evidence: ['Maintenance plan'] },
    { id: 'WO_1031', title: 'Lubricate conveyor drive', machineId: 'ast_conv_a', machine: 'Conveyor A', priority: 'low', state: 'Done', due: '12 Nov, 2026', target: 'CMMS', parts: ['Grease cartridge'], evidence: [] },
  ],
  approvals: [
    { id: 'APR_0207', kind: 'work_order', title: 'Create work order: inspect spindle bearing', machine: 'CNC-07', source: 'Assistant recommendation', tier: 'T1', state: 'Pending', requestedAt: '15 Nov, 2026 03:52 PM', summary: 'Writes one work order to the maintenance system. Nothing is sent to the machine.', fields: [{ k: 'Priority', v: 'High' }, { k: 'Due', v: '17 Nov, 2026' }, { k: 'Part', v: 'Bearing 6205-2RS × 1' }, { k: 'Written to', v: 'Maintenance system' }], evidence: cncEvidence },
    { id: 'APR_0206', kind: 'work_order', title: 'Create work order: check gateway power supply', machine: 'Halle 2', source: 'Alarm ALM_0411', tier: 'T1', state: 'Pending', requestedAt: '15 Nov, 2026 11:41 AM', summary: 'Writes one work order to the maintenance system. Nothing is sent to the machine.', fields: [{ k: 'Priority', v: 'High' }, { k: 'Due', v: '16 Nov, 2026' }, { k: 'Written to', v: 'Maintenance system' }], evidence: [{ label: 'Gateway link state', locator: 'signal · last 10 min', applicability: 'applies', observed: '15 Nov 11:30 AM' }] },
    { id: 'APR_0205', kind: 'purchase_requisition', title: 'Purchase requisition: bearing 6205-2RS × 2', machine: 'CNC-07', source: 'Parts below minimum', tier: 'T1', state: 'Pending', requestedAt: '14 Nov, 2026 04:10 PM', summary: 'Creates one purchase requisition in the ERP for approval there. No order is placed from here.', fields: [{ k: 'Vendor', v: 'Wälzlager Nord GmbH' }, { k: 'Total', v: '€ 38.40' }, { k: 'Lead time', v: '3 days' }], evidence: [{ label: 'Stock position', locator: 'part 6205-2RS', applicability: 'applies', observed: '2 days ago' }] },
    { id: 'APR_0203', kind: 'work_order', title: 'Create work order: replace hydraulic filter', machine: 'Press 03', source: 'Maintenance plan', tier: 'T1', state: 'Approved', requestedAt: '13 Nov, 2026 08:20 AM', summary: 'Writes one work order to the ERP.', fields: [{ k: 'Priority', v: 'Medium' }, { k: 'Due', v: '18 Nov, 2026' }], evidence: [] },
  ],
  notifications: [
    { id: 'n1', text: 'Critical alarm on CNC-07: spindle temperature high', at: '3:45 PM', read: false, to: { section: 'alarms', id: 'ALM_0412' } },
    { id: 'n2', text: 'Approval waiting: inspect spindle bearing', at: '3:52 PM', read: false, to: { section: 'inbox', id: 'APR_0207' } },
    { id: 'n3', text: 'Gateway in Halle 2 lost its link', at: '11:30 AM', read: true, to: { section: 'alarms', id: 'ALM_0411' } },
    { id: 'n4', text: 'Finding awaiting confirmation on CNC-07', at: '10:05 AM', read: true, to: { section: 'findings' } },
  ],
  findings: [
    { id: 'FND_0031', kind: 'Finding', title: 'Drive-end bearing wear signature', machine: 'CNC-07', confidence: 0.82, model: 'bearing-anomaly v1.3', ageS: 7200, evidence: cncEvidence.slice(0, 2), status: 'Awaiting confirmation' },
    { id: 'FND_0030', kind: 'Prediction', title: 'Hydraulic filter clogging within 9 days', machine: 'Press 03', confidence: 0.71, model: 'filter-forecast v0.9', ageS: 86400, evidence: [{ label: 'Differential pressure trend', locator: 'signal · 14 d', applicability: 'applies', observed: '14 Nov' }], status: 'Confirmed' },
    { id: 'FND_0028', kind: 'Finding', title: 'Compressor short-cycling at night', machine: 'Compressor 02', confidence: 0.55, model: 'cycling-detect v1.0', ageS: 259200, evidence: [{ label: 'Motor current', locator: 'signal · 3 nights', applicability: 'unknown', reason: 'no variant data', observed: '12 Nov' }], status: 'Awaiting confirmation' },
  ],
  documents: [
    { id: 'DOC_311', name: 'CNC-07 operating manual', kind: 'Manual', machine: 'CNC-07', pages: 212, updated: '02 Nov, 2026', revision: 'C', applicability: 'applies', passages: [{ text: 'Spindle bearing service interval: inspect every 2,000 operating hours; replace on measured wear.', page: 118, applicability: 'applies' }, { text: 'Coolant concentration limits for the 24 kW spindle variant.', page: 131, applicability: 'unknown', reason: 'variant not recorded' }, { text: 'Alternate spindle (40 kW) torque table.', page: 140, applicability: 'does_not_apply', reason: 'different spindle variant' }] },
    { id: 'DOC_310', name: 'Spindle assembly drawing', kind: 'Drawing', machine: 'CNC-07', pages: 4, updated: '28 Oct, 2026', revision: 'B', applicability: 'applies', passages: [{ text: 'Drive-end bearing 6205-2RS, press fit, see detail B.', page: 2, applicability: 'applies' }] },
    { id: 'DOC_298', name: 'Press 03 lubrication SOP', kind: 'SOP', machine: 'Press 03', pages: 9, updated: '19 Oct, 2026', revision: 'A', applicability: 'applies', passages: [{ text: 'Lubricate guide rails every 40 hours with grade 2 grease.', page: 3, applicability: 'applies' }] },
    { id: 'DOC_287', name: 'Compressor 02 service report', kind: 'Report', machine: 'Compressor 02', pages: 6, updated: '07 Oct, 2026', revision: 'A', applicability: 'applies', passages: [{ text: 'Oil separator replaced; next service in 4,000 hours.', page: 2, applicability: 'applies' }] },
    { id: 'DOC_275', name: 'Robot cell 1 safety manual', kind: 'Manual', machine: 'Robot cell 1', pages: 88, updated: '30 Sep, 2026', revision: 'D', applicability: 'unknown', passages: [{ text: 'Safety function descriptions belong to the machine builder; HIVE is not a safety function.', page: 12, applicability: 'unknown', reason: 'no variant data' }] },
  ],
  parts: [
    { id: 'PRT_01', number: '6205-2RS', name: 'Deep-groove ball bearing', machine: 'CNC-07', onHand: 1, min: 2, location: 'Lager A-12', syncedDaysAgo: 2, reserved: 0 },
    { id: 'PRT_02', number: 'HF-20', name: 'Hydraulic filter', machine: 'Press 03', onHand: 4, min: 2, location: 'Lager B-03', syncedDaysAgo: 1, reserved: 1 },
    { id: 'PRT_03', number: 'GR-400', name: 'Grease cartridge', machine: 'Conveyor A', onHand: 12, min: 6, location: 'Lager C-01', syncedDaysAgo: 9, reserved: 0 },
    { id: 'PRT_04', number: 'SEP-77', name: 'Oil separator', machine: 'Compressor 02', onHand: 0, min: 1, location: 'Lager B-09', syncedDaysAgo: 12, reserved: 0 },
  ],
  vendors: [
    { id: 'VND_01', name: 'Wälzlager Nord GmbH', category: 'Bearings', country: 'DE', leadTimeDays: 3 },
    { id: 'VND_02', name: 'Hydrotech Süd', category: 'Hydraulics', country: 'DE', leadTimeDays: 5 },
    { id: 'VND_03', name: 'Kompressor Service AG', category: 'Compressed air', country: 'AT', leadTimeDays: 8 },
  ],
  rfqs: [
    {
      id: 'RFQ_0091', part: 'Bearing 6205-2RS × 2', status: 'Replies in',
      replies: [
        { vendor: 'Wälzlager Nord GmbH', price: '€ 38.40', leadTime: '3 days', specMatch: 'Match', raw: 'Preis 19,20 pro Stück, lieferbar in 3 Tagen, Original-Hersteller.' },
        { vendor: 'Hydrotech Süd', price: '€ 41.00', leadTime: '5 days', specMatch: 'Partial', raw: 'Equivalent type, sealed variant, delivery in 5 days.' },
      ],
    },
    { id: 'RFQ_0088', part: 'Oil separator SEP-77', status: 'Open', replies: [] },
  ],
  requisitions: [
    { id: 'PR_0412', part: 'Bearing 6205-2RS × 2', vendor: 'Wälzlager Nord GmbH', total: '€ 38.40', state: 'Pending approval' },
    { id: 'PR_0409', part: 'Hydraulic filter HF-20 × 4', vendor: 'Hydrotech Süd', total: '€ 164.00', state: 'Approved' },
  ],
  feed: [
    { id: 'f1', kind: 'alarm', text: 'Alarm ALM_0412 raised on CNC-07: spindle temperature high', at: '03:45 PM', day: 'Today' },
    { id: 'f2', kind: 'approval', text: 'Approval APR_0207 requested for a CNC-07 work order', at: '03:52 PM', day: 'Today' },
    { id: 'f3', kind: 'gateway', text: 'Gateway in Halle 2 lost its link, buffering locally', at: '11:30 AM', day: 'Today' },
    { id: 'f4', kind: 'alarm', text: 'Alarm ALM_0409 acknowledged on CNC-07', at: '09:30 AM', day: 'Today' },
    { id: 'f5', kind: 'work_order', text: 'Work order WO_1041 moved to In progress', at: '04:10 PM', day: 'Yesterday' },
    { id: 'f6', kind: 'alarm', text: 'Alarm ALM_0407 resolved on Press 03', at: '01:20 PM', day: 'Yesterday' },
    { id: 'f7', kind: 'document', text: 'Document CNC-07 operating manual re-indexed', at: '10:05 AM', day: 'Yesterday' },
    { id: 'f8', kind: 'approval', text: 'Approval APR_0203 approved for a Press 03 work order', at: '09:00 AM', day: 'Yesterday' },
  ],
  gatewayFleet: [
    { id: 'gw_01HZX4', site: 'Halle 1', version: '1.4.2', uptime: '41 d', link: 'Online', bufferPct: 2, drivers: 'OPC UA, Modbus' },
    { id: 'gw_01HZX9', site: 'Halle 2', version: '1.4.2', uptime: '12 d', link: 'Buffering', bufferPct: 14, drivers: 'OPC UA, MQTT' },
    { id: 'gw_01J0A2', site: 'Lager', version: '1.4.1', uptime: '3 d', link: 'Offline', bufferPct: 31, drivers: 'Modbus' },
  ],
  oeeTrend: [
    { label: 'W1', hall1: 82, hall2: 78, store: 70 },
    { label: 'W2', hall1: 84, hall2: 79, store: 71 },
    { label: 'W3', hall1: 83, hall2: 81, store: 72 },
    { label: 'W4', hall1: 85, hall2: 80, store: 70 },
    { label: 'W5', hall1: 87, hall2: 82, store: 74 },
    { label: 'W6', hall1: 86, hall2: 83, store: 73 },
    { label: 'W7', hall1: 85, hall2: 81, store: 72 },
    { label: 'W8', hall1: 86, hall2: 81, store: 73 },
  ],
  kpis: [
    { scope: 'Site', name: 'Halle 1', oee: 86.4, availability: 93.1, performance: 94.0, quality: 98.8, downtimeMin: 212 },
    { scope: 'Site', name: 'Halle 2', oee: 81.0, availability: 90.2, performance: 91.5, quality: 98.1, downtimeMin: 305 },
    { scope: 'Site', name: 'Lager', oee: 73.2, availability: 85.0, performance: 88.0, quality: 97.9, downtimeMin: 96 },
    { scope: 'Line', name: 'Line 1', oee: 84.1, availability: 92.0, performance: 93.0, quality: 98.2, downtimeMin: 120 },
    { scope: 'Line', name: 'Line 2', oee: 80.5, availability: 88.1, performance: 92.6, quality: 98.7, downtimeMin: 340 },
    { scope: 'Line', name: 'Line 3', oee: 77.9, availability: 87.3, performance: 90.0, quality: 99.0, downtimeMin: 188 },
    { scope: 'Machine', name: 'CNC-07', oee: 71.2, availability: 78.0, performance: 93.0, quality: 98.0, downtimeMin: 210 },
    { scope: 'Machine', name: 'CNC-08', oee: 88.9, availability: 95.0, performance: 95.0, quality: 98.5, downtimeMin: 40 },
    { scope: 'Machine', name: 'Press 03', oee: 84.1, availability: 92.0, performance: 93.0, quality: 98.2, downtimeMin: 120 },
  ],
  threads: [
    {
      id: 'thr_1', title: 'Why did CNC-07 raise an alarm at 3:45 PM?', context: 'CNC-07', at: '15 Nov', messages: [
        { id: 'm1', from: 'user', seed: true, text: 'Why did CNC-07 raise an alarm at 3:45 PM?' },
        {
          id: 'm2', from: 'assistant',
          text: 'The spindle bearing temperature rose above its 80 °C limit for three minutes and reached 87.4 °C. Vibration on the drive-end bearing has also trended up 18% over 24 hours. The manual recommends inspecting the bearing when both occur.',
          citations: [
            { label: 'Spindle bearing temperature', locator: 'signal · last 3 min', applicability: 'applies' },
            { label: 'CNC-07 operating manual', locator: 'p. 118', applicability: 'applies' },
            { label: 'CNC-09 service note', locator: 'p. 2', applicability: 'does_not_apply', reason: 'other model variant' },
          ],
        },
      ],
    },
    { id: 'thr_2', title: 'Spare bearings for CNC-07', context: 'CNC-07', at: '14 Nov', messages: [] },
  ],
  graph: {
    nodes: [
      { id: 'n_cnc07', label: 'CNC-07', kind: 'Machine', x: 360, y: 190, detail: 'CNC machining centre 07, Halle 1, Line 2.' },
      { id: 'n_spindle', label: 'Spindle unit', kind: 'Component', x: 190, y: 90, detail: 'Spindle unit of CNC-07.' },
      { id: 'n_bearing', label: 'Bearing 6205-2RS', kind: 'Component', x: 90, y: 220, detail: 'Drive-end bearing. Same type is installed in CNC-09.' },
      { id: 'n_manual', label: 'Manual p. 118', kind: 'Document', x: 330, y: 50, detail: 'Operating manual passage on bearing service.' },
      { id: 'n_wo', label: 'WO_1042', kind: 'Work order', x: 540, y: 80, detail: 'Inspect spindle bearing. Submitted.' },
      { id: 'n_cnc09', label: 'CNC-09', kind: 'Machine', x: 190, y: 340, detail: 'Same bearing type installed here.' },
      { id: 'n_vendor', label: 'Wälzlager Nord', kind: 'Vendor', x: 440, y: 330, detail: 'Can deliver bearing 6205-2RS in 3 days.' },
    ],
    edges: [
      { from: 'n_cnc07', to: 'n_spindle', rel: 'has part' },
      { from: 'n_spindle', to: 'n_bearing', rel: 'has part' },
      { from: 'n_bearing', to: 'n_manual', rel: 'documented in' },
      { from: 'n_cnc07', to: 'n_wo', rel: 'has work order' },
      { from: 'n_bearing', to: 'n_cnc09', rel: 'same type as' },
      { from: 'n_bearing', to: 'n_vendor', rel: 'supplied by' },
    ],
  },
  users: [
    { id: 'usr_01', name: 'Planner (role account)', email: 'planner@musterwerk.example', status: 'Active', signIn: 'Company SSO', roles: 'Maintenance planner' },
    { id: 'usr_02', name: 'Site manager (role account)', email: 'site.manager@musterwerk.example', status: 'Active', signIn: 'Company SSO', roles: 'Site manager' },
    { id: 'usr_03', name: 'Technician (role account)', email: 'technician@musterwerk.example', status: 'Active', signIn: 'Passkey', roles: 'Technician' },
    { id: 'usr_04', name: 'New colleague', email: 'new.colleague@musterwerk.example', status: 'Invited', signIn: 'Company SSO', roles: 'Operator' },
  ],
  grants: [
    { id: 'grt_1', principal: 'Maintenance planner', role: 'maintenance_planner', scope: 'Halle 1', coverage: 'Halle 1 and everything below it' },
    { id: 'grt_2', principal: 'Site manager', role: 'site_manager', scope: 'Musterwerk GmbH', coverage: 'The whole tenant' },
    { id: 'grt_3', principal: 'Technician', role: 'technician', scope: 'Line 2', coverage: 'Line 2 and everything below it' },
  ],
  connections: [
    { id: 'con_1', name: 'Halle 1 OPC UA', connector: 'OPC UA', kind: 'OT', state: 'Healthy', write: 'Read only', lastOk: '2 s ago' },
    { id: 'con_2', name: 'Halle 2 Modbus', connector: 'Modbus', kind: 'OT', state: 'Degraded', write: 'Read only', lastOk: '6 min ago' },
    { id: 'con_3', name: 'Maintenance system', connector: 'CMMS', kind: 'IT', state: 'Healthy', write: 'Catalogued writes', lastOk: '1 min ago' },
    { id: 'con_4', name: 'ERP', connector: 'SAP', kind: 'IT', state: 'Not tested', write: 'Catalogued writes', lastOk: 'never' },
  ],
  apiKeys: [
    { id: 'key_1', name: 'BI export', prefix: 'hk_live_7Fq2', scopes: 'telemetry.read', created: '02 Oct, 2026', lastUsed: 'today', status: 'Active' },
    { id: 'key_2', name: 'Old integration', prefix: 'hk_live_a91X', scopes: 'asset.read', created: '11 Mar, 2026', lastUsed: '40 d ago', status: 'Revoked' },
  ],
  audit: [
    { id: 'aud_9', at: '15 Nov, 2026 03:52 PM', action: 'draft_review.requested', resource: 'APR_0207', actorKind: 'Agent' },
    { id: 'aud_8', at: '15 Nov, 2026 03:46 PM', action: 'alarm.raised', resource: 'ALM_0412', actorKind: 'System' },
    { id: 'aud_7', at: '15 Nov, 2026 09:30 AM', action: 'alarm.acknowledged', resource: 'ALM_0409', actorKind: 'Person' },
    { id: 'aud_6', at: '14 Nov, 2026 04:10 PM', action: 'api_key.created', resource: 'key_1', actorKind: 'Person' },
    { id: 'aud_5', at: '14 Nov, 2026 09:00 AM', action: 'approval.approved', resource: 'APR_0203', actorKind: 'Person' },
  ],
  policies: [
    { tier: 'T1', approvals: 'Per approval policy', stepUp: 'Per policy', automation: 'Allowed with review' },
    { tier: 'T2', approvals: 'Per approval policy', stepUp: 'Per policy', automation: 'Allowed with review' },
    { tier: 'T3', approvals: '1 approval, requester excluded', stepUp: 'Required', automation: 'Cannot be automated' },
    { tier: 'T4', approvals: '2 distinct people', stepUp: 'Required', automation: 'Cannot be automated' },
  ],
};
