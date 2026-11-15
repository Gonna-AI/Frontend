/**
 * Placeholder content for the Hive dashboard.
 *
 * Nothing here is real plant data. The Hive API only exposes a health endpoint today, so every
 * figure on the page comes from this file until the owning API modules exist. Each block names the
 * resource that will replace it, so wiring it up later is a one-file change (see hiveApi.ts).
 * Names follow the public reference scenario: a fictional plant, "Musterwerk GmbH".
 */

export interface HiveSite {
  id: string;
  name: string;
  oee: string;
  signals: string;
  state: 'Active' | 'Inactive';
}

export interface HiveGateway {
  id: string;
  version: string;
  uptime: string;
  state: 'Active' | 'Inactive';
}

export interface HiveEvent {
  id: string;
  activity: string;
  asset: string;
  status: 'Resolved' | 'Open' | 'Acknowledged';
  at: string;
  kind: 'thermal' | 'link' | 'quality' | 'maintenance' | 'stock';
}

export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type AssetStatus = 'Running' | 'Idle' | 'Fault' | 'Offline';
export type AlarmState = 'Open' | 'Acknowledged' | 'Resolved';
export type WorkOrderState = 'Draft' | 'Submitted' | 'In progress' | 'Done';
export type ApprovalState = 'Pending' | 'Approved' | 'Rejected';

export interface HiveAsset {
  id: string;
  name: string;
  type: string;
  site: string;
  status: AssetStatus;
  oee: number;
  lastSignal: string;
  signals: number;
}

export interface HiveAlarm {
  id: string;
  title: string;
  asset: string;
  severity: Severity;
  state: AlarmState;
  raisedAt: string;
  detail: string;
}

export interface HiveWorkOrder {
  id: string;
  title: string;
  asset: string;
  priority: Severity;
  state: WorkOrderState;
  due: string;
  target: 'ERP' | 'CMMS';
}

export interface HiveApproval {
  id: string;
  title: string;
  asset: string;
  source: string;
  tier: 'T1';
  state: ApprovalState;
  requestedAt: string;
}

export interface HiveDocument {
  id: string;
  name: string;
  kind: 'Manual' | 'Drawing' | 'SOP' | 'Report';
  asset: string;
  pages: number;
  updated: string;
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

export interface HiveFeedItem {
  id: string;
  kind: 'alarm' | 'work_order' | 'gateway' | 'document' | 'approval';
  text: string;
  at: string;
  day: string;
}

export interface HiveOverview {
  plant: { name: string; availability: string; delta: string; deltaUp: boolean };
  tiles: { key: 'signals' | 'alarms' | 'assets' | 'workOrders'; label: string; value: string; delta: string; up: boolean }[];
  sites: HiveSite[];
  bufferUsedGb: number;
  bufferTotalGb: number;
  gateways: HiveGateway[];
  /** Weekly alarm volume: raised and resolved. */
  alarmVolume: { label: string; raised: number; resolved: number }[];
  events: HiveEvent[];
  assets: HiveAsset[];
  alarms: HiveAlarm[];
  workOrders: HiveWorkOrder[];
  approvals: HiveApproval[];
  documents: HiveDocument[];
  feed: HiveFeedItem[];
  gatewayFleet: HiveGatewayRow[];
  /** Weekly OEE per site, last eight weeks. */
  oeeTrend: { label: string; hall1: number; hall2: number; store: number }[];
}

export const placeholderOverview: HiveOverview = {
  plant: { name: 'Musterwerk GmbH', availability: '94.8%', delta: '2%', deltaUp: true },
  tiles: [
    { key: 'signals', label: 'Live signals', value: '12,480', delta: '7%', up: true },
    { key: 'alarms', label: 'Open alarms', value: '14', delta: '5%', up: false },
    { key: 'assets', label: 'Assets online', value: '312', delta: '8%', up: true },
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
  assets: [
    { id: 'ast_cnc07', name: 'CNC-07', type: 'CNC machining centre', site: 'Halle 1', status: 'Fault', oee: 71.2, lastSignal: '2 s ago', signals: 214 },
    { id: 'ast_cnc08', name: 'CNC-08', type: 'CNC machining centre', site: 'Halle 1', status: 'Running', oee: 88.9, lastSignal: '1 s ago', signals: 209 },
    { id: 'ast_press03', name: 'Press 03', type: 'Hydraulic press', site: 'Halle 1', status: 'Running', oee: 84.1, lastSignal: '3 s ago', signals: 96 },
    { id: 'ast_comp02', name: 'Compressor 02', type: 'Compressed air', site: 'Halle 2', status: 'Running', oee: 92.6, lastSignal: '1 s ago', signals: 58 },
    { id: 'ast_conv_a', name: 'Conveyor A', type: 'Conveyor line', site: 'Halle 2', status: 'Idle', oee: 64.0, lastSignal: '12 s ago', signals: 41 },
    { id: 'ast_robot1', name: 'Robot cell 1', type: 'Handling robot', site: 'Halle 2', status: 'Running', oee: 90.3, lastSignal: '2 s ago', signals: 122 },
    { id: 'ast_lift1', name: 'Hoist 1', type: 'Overhead hoist', site: 'Lager', status: 'Offline', oee: 0, lastSignal: '2 h ago', signals: 12 },
    { id: 'ast_oven2', name: 'Curing oven 2', type: 'Industrial oven', site: 'Halle 2', status: 'Running', oee: 79.5, lastSignal: '4 s ago', signals: 67 },
  ],
  alarms: [
    { id: 'ALM_0412', title: 'Spindle temperature high', asset: 'CNC-07', severity: 'critical', state: 'Open', raisedAt: '15 Nov, 2026 03:45 PM', detail: 'Spindle bearing temperature above the high limit for 3 minutes. Signal value 87.4 °C, limit 80 °C.' },
    { id: 'ALM_0411', title: 'Gateway link lost', asset: 'Halle 2', severity: 'high', state: 'Open', raisedAt: '15 Nov, 2026 11:30 AM', detail: 'The gateway in Halle 2 has not reported for 6 minutes. Data is buffered on the gateway and will replay on reconnect.' },
    { id: 'ALM_0409', title: 'Vibration trending up', asset: 'CNC-07', severity: 'high', state: 'Acknowledged', raisedAt: '15 Nov, 2026 09:12 AM', detail: 'Axis vibration RMS rose 18% over the last 24 hours.' },
    { id: 'ALM_0407', title: 'Scrap rate above limit', asset: 'Press 03', severity: 'medium', state: 'Resolved', raisedAt: '14 Nov, 2026 12:00 PM', detail: 'Scrap rate exceeded 3% for one shift. Cleared after a tool change.' },
    { id: 'ALM_0405', title: 'Air pressure low', asset: 'Compressor 02', severity: 'medium', state: 'Acknowledged', raisedAt: '14 Nov, 2026 07:40 AM', detail: 'Supply pressure dipped below 6.2 bar twice.' },
    { id: 'ALM_0402', title: 'Door sensor stuck', asset: 'Robot cell 1', severity: 'low', state: 'Resolved', raisedAt: '13 Nov, 2026 04:05 PM', detail: 'Safety door sensor reported an unchanged value for 10 minutes. Monitoring only.' },
  ],
  workOrders: [
    { id: 'WO_1042', title: 'Inspect spindle bearing', asset: 'CNC-07', priority: 'high', state: 'Submitted', due: '17 Nov, 2026', target: 'CMMS' },
    { id: 'WO_1041', title: 'Replace hydraulic filter', asset: 'Press 03', priority: 'medium', state: 'In progress', due: '18 Nov, 2026', target: 'ERP' },
    { id: 'WO_1039', title: 'Check gateway power supply', asset: 'Halle 2', priority: 'high', state: 'Draft', due: '16 Nov, 2026', target: 'CMMS' },
    { id: 'WO_1036', title: 'Quarterly oven calibration', asset: 'Curing oven 2', priority: 'low', state: 'Draft', due: '28 Nov, 2026', target: 'ERP' },
    { id: 'WO_1031', title: 'Lubricate conveyor drive', asset: 'Conveyor A', priority: 'low', state: 'Done', due: '12 Nov, 2026', target: 'CMMS' },
  ],
  approvals: [
    { id: 'APR_0207', title: 'Create work order: inspect spindle bearing', asset: 'CNC-07', source: 'Assistant recommendation', tier: 'T1', state: 'Pending', requestedAt: '15 Nov, 2026 03:52 PM' },
    { id: 'APR_0206', title: 'Create work order: check gateway power supply', asset: 'Halle 2', source: 'Alarm ALM_0411', tier: 'T1', state: 'Pending', requestedAt: '15 Nov, 2026 11:41 AM' },
    { id: 'APR_0203', title: 'Create work order: replace hydraulic filter', asset: 'Press 03', source: 'Maintenance plan', tier: 'T1', state: 'Approved', requestedAt: '13 Nov, 2026 08:20 AM' },
  ],
  documents: [
    { id: 'DOC_311', name: 'CNC-07 operating manual', kind: 'Manual', asset: 'CNC-07', pages: 212, updated: '02 Nov, 2026' },
    { id: 'DOC_310', name: 'Spindle assembly drawing', kind: 'Drawing', asset: 'CNC-07', pages: 4, updated: '28 Oct, 2026' },
    { id: 'DOC_298', name: 'Press 03 lubrication SOP', kind: 'SOP', asset: 'Press 03', pages: 9, updated: '19 Oct, 2026' },
    { id: 'DOC_287', name: 'Compressor 02 service report', kind: 'Report', asset: 'Compressor 02', pages: 6, updated: '07 Oct, 2026' },
    { id: 'DOC_275', name: 'Robot cell 1 safety manual', kind: 'Manual', asset: 'Robot cell 1', pages: 88, updated: '30 Sep, 2026' },
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
};
