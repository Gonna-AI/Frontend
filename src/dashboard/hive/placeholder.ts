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
};
