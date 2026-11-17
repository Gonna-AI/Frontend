import { ArrowLeftRight, CheckCheck, Network, Play, PlugZap, RefreshCcw, Router, ScanSearch, Server, Share2 } from 'lucide-react-dash';

import { col, count, is, make, res } from '../def';
import type { Screen } from '../types';

export const gateways: Screen = {
  id: 'gateways',
  title: 'Gateways',
  about: 'The HIVE gateways on the plant floor: link state, buffer, version and the machines behind each.',
  icon: Router,
  keywords: 'gateway edge enrol link buffer ha store and forward dmz',
  spec: 'EDGE-ENROLL · EDGE-LINK · EDGE-BUF · EDGE-HA · EDGE-OBS',
  views: [
    {
      id: 'gateways',
      title: 'Gateways',
      statusKey: 'link',
      resource: res('gateway', '/v1/gateways', 'EDGE-ENROLL', 'gateway_list', [
        { id: 'gwy_01m71xxgwy0000000000000a', hostname: 'hive-gw-es-01', site: 'Musterwerk Esslingen', link: 'online', buffer: '0 MB', version: '1.8.2', connections: 11, ha: 'Primary', last_seen: 'now' },
        { id: 'gwy_01m71xxgwy0000000000000b', hostname: 'hive-gw-es-02', site: 'Musterwerk Esslingen', link: 'online', buffer: '0 MB', version: '1.8.2', connections: 11, ha: 'Standby', last_seen: 'now' },
        { id: 'gwy_01m71xxgwy0000000000000c', hostname: 'hive-gw-es-h2', site: 'Musterwerk Esslingen · Halle 2', link: 'buffering', buffer: '182 MB', version: '1.8.1', connections: 4, ha: '—', last_seen: '42 min' },
        { id: 'gwy_01m71xxgwy0000000000000d', hostname: 'hive-gw-zw-01', site: 'Musterwerk Zwickau', link: 'online', buffer: '0 MB', version: '1.7.9', connections: 6, ha: '—', last_seen: 'now' },
      ]),
      columns: [col.id('hostname', 'Gateway'), col.text('site', 'Site'), col.status('link', 'Link'), col.text('buffer', 'Buffer'), col.text('version', 'Version'), col.num('connections', 'Connections'), col.muted('ha', 'HA role'), col.muted('last_seen', 'Last seen', false)],
      kpis: [count('Online', is('link', 'online')), count('Buffering', is('link', 'buffering'), 'Data is kept, nothing lost', true), { label: 'Data in buffers', value: () => '182 MB', sub: 'Backfills when the link returns' }],
      create: { label: 'Enrol gateway', operation: 'gateway_enroll', fields: [{ key: 'hostname', label: 'Hostname', required: true, placeholder: 'hive-gw-es-03' }, { key: 'site', label: 'Site', required: true }], make: (v) => make('gwy', { ...v, link: 'pending', buffer: '—', version: '—', connections: 0, ha: '—', last_seen: 'never' }), done: 'Enrolment token created: valid for 24 h' },
    },
  ],
};

export const fleet: Screen = {
  id: 'fleet',
  title: 'Fleet',
  about: 'Software rollouts to every gateway, the policies they follow and who is out of compliance.',
  icon: Server,
  keywords: 'fleet rollout update firmware policy compliance canary',
  spec: 'EDGE-FLEET · EDGE-UPDATE',
  views: [
    {
      id: 'rollouts',
      title: 'Rollouts',
      statusKey: 'status',
      resource: res('fleet_rollout', '/v1/fleet/rollouts', 'EDGE-FLEET', 'fleet_rollout_list', [
        { id: 'flr_01m71xxflr0000000000000a', component: 'Gateway runtime 1.8.2', ring: 'Esslingen', progress: 66, done: '2 of 3', status: 'in_progress', window: 'Sat 06:00–08:00' },
        { id: 'flr_01m71xxflr0000000000000b', component: 'OPC UA driver 2.4.0', ring: 'Canary', progress: 100, done: '1 of 1', status: 'completed', window: 'Any time' },
        { id: 'flr_01m71xxflr0000000000000c', component: 'Modbus driver 1.3.1', ring: 'All', progress: 0, done: '0 of 4', status: 'paused', window: 'Sat 06:00–08:00' },
      ]),
      columns: [col.title('component', 'Component'), col.text('ring', 'Ring'), col.pct('progress', 'Progress'), col.text('done', 'Gateways'), col.muted('window', 'Window'), col.status('status')],
      actions: [{ label: 'Resume', icon: Play, operation: 'fleet_rollout_resume', when: is('status', 'paused'), apply: () => ({ status: 'in_progress' }), done: 'Rollout resumed' }],
    },
    {
      id: 'compliance',
      title: 'Compliance',
      statusKey: 'status',
      resource: res('fleet_compliance', '/v1/fleet/compliance', 'EDGE-FLEET', 'fleet_compliance_get', [
        { id: 'flc_01m71xxflc0000000000000a', gateway: 'hive-gw-es-h2', rule: 'Runtime ≥ 1.8.2', actual: '1.8.1', status: 'non_compliant' },
        { id: 'flc_01m71xxflc0000000000000b', gateway: 'hive-gw-zw-01', rule: 'Runtime ≥ 1.8.2', actual: '1.7.9', status: 'non_compliant' },
        { id: 'flc_01m71xxflc0000000000000c', gateway: 'hive-gw-es-01', rule: 'Disk encryption on', actual: 'on', status: 'compliant' },
      ]),
      columns: [col.id('gateway', 'Gateway'), col.title('rule', 'Rule'), col.text('actual', 'Actual'), col.status('status')],
    },
  ],
};

export const connections: Screen = {
  id: 'connections',
  title: 'Connections',
  about: 'Every connection to a machine, controller or system, with its connector, credentials and data quality.',
  icon: PlugZap,
  keywords: 'connections connectors opc ua modbus mqtt s7 credentials certificates',
  spec: 'CONN-MODEL · CONN-CRED · OT-OPCUA · OT-MODBUS · OT-MQTT · OT-S7',
  views: [
    {
      id: 'connections',
      title: 'Connections',
      statusKey: 'status',
      resource: res('connection', '/v1/connections', 'CONN-MODEL', 'connection_list', [
        { id: 'con_01m71xxcon0000000000000a', name: 'CNC-07 SINUMERIK', protocol: 'OPC UA', endpoint: 'opc.tcp://10.20.2.17:4840', security: 'SignAndEncrypt', gateway: 'hive-gw-es-01', signals: 48, status: 'connected' },
        { id: 'con_01m71xxcon0000000000000b', name: 'CNC-08 retrofit', protocol: 'MQTT', endpoint: 'mqtts://10.20.2.30:8883', security: 'TLS client cert', gateway: 'hive-gw-es-01', signals: 6, status: 'connected' },
        { id: 'con_01m71xxcon0000000000000c', name: 'PR-01 S7-300', protocol: 'S7', endpoint: '10.20.3.11 rack 0 slot 2', security: 'Read only', gateway: 'hive-gw-es-h2', signals: 22, status: 'degraded' },
        { id: 'con_01m71xxcon0000000000000d', name: 'TQ-40 torque', protocol: 'Modbus TCP', endpoint: '10.20.2.44:502', security: 'Network segment', gateway: 'hive-gw-es-01', signals: 9, status: 'connected' },
        { id: 'con_01m71xxcon0000000000000e', name: 'IM-02 EUROMAP 77', protocol: 'OPC UA', endpoint: 'opc.tcp://10.20.3.22:4840', security: 'SignAndEncrypt', gateway: 'hive-gw-es-h2', signals: 64, status: 'error' },
        { id: 'con_01m71xxcon0000000000000f', name: 'Plant UNS broker', protocol: 'MQTT', endpoint: 'mqtts://uns.musterwerk.local', security: 'TLS + user', gateway: 'hive-gw-es-01', signals: 310, status: 'connected' },
      ]),
      columns: [col.title('name', 'Connection'), col.text('protocol', 'Protocol'), col.id('endpoint', 'Endpoint'), col.muted('security', 'Security'), col.muted('gateway', 'Gateway'), col.num('signals', 'Signals'), col.status('status')],
      kpis: [count('Connected', is('status', 'connected')), count('Problems', is('status', 'error', 'degraded'), 'Check certificate or network', true), { label: 'Signals ingested', value: (r) => r.reduce((n, x) => n + Number(x.signals), 0) }],
      breakdown: { title: 'Signals by protocol', by: 'protocol', sum: 'signals' },
      actions: [{ label: 'Reconnect', icon: RefreshCcw, operation: 'connection_reconnect', when: is('status', 'error', 'degraded'), apply: () => ({ status: 'connected' }), done: 'Reconnect requested' }],
    },
    {
      id: 'certificates',
      title: 'Certificates',
      statusKey: 'status',
      resource: res('trusted_certificate', '/v1/trusted-certificates', 'CONN-CRED', 'trusted_certificate_list', [
        { id: 'tcr_01m71xxtcr0000000000000a', subject: 'CN=SINUMERIK CNC-07', issuer: 'Siemens', expires: '2027-03-01', used_by: 'CNC-07 SINUMERIK', status: 'valid' },
        { id: 'tcr_01m71xxtcr0000000000000b', subject: 'CN=IM-02 OPC UA', issuer: 'Self-signed', expires: '2026-11-20', used_by: 'IM-02 EUROMAP 77', status: 'expiring' },
        { id: 'tcr_01m71xxtcr0000000000000c', subject: 'CN=uns.musterwerk.local', issuer: 'Musterwerk CA', expires: '2027-06-30', used_by: 'Plant UNS broker', status: 'valid' },
      ]),
      columns: [col.title('subject', 'Subject'), col.muted('issuer', 'Issuer'), col.text('expires', 'Expires'), col.muted('used_by', 'Used by'), col.status('status')],
    },
  ],
};

export const discovery: Screen = {
  id: 'discovery',
  title: 'Discovery',
  about: 'Find devices on the plant network and browse their address space before connecting anything.',
  icon: ScanSearch,
  keywords: 'discovery scan browse network devices address space',
  spec: 'EDGE-DISC · GRAPH-BOOT',
  views: [
    {
      id: 'runs',
      title: 'Discovery runs',
      statusKey: 'status',
      resource: res('discovery_run', '/v1/discovery-runs', 'EDGE-DISC', 'discovery_run_list', [
        { id: 'dsr_01m71xxdsr0000000000000a', network: '10.20.2.0/24 (Line 2)', gateway: 'hive-gw-es-01', found: 14, new: 2, status: 'completed', at: 'Today 07:30' },
        { id: 'dsr_01m71xxdsr0000000000000b', network: '10.20.3.0/24 (Halle 2)', gateway: 'hive-gw-es-h2', found: 0, new: 0, status: 'failed', at: 'Today 09:58' },
      ]),
      columns: [col.text('network', 'Network'), col.muted('gateway', 'Gateway'), col.num('found', 'Devices'), col.num('new', 'New'), col.status('status'), col.muted('at', 'At', false)],
      titleKey: 'network',
      create: { label: 'Scan network', operation: 'discovery_run_create', fields: [{ key: 'network', label: 'Network (CIDR)', required: true, placeholder: '10.20.4.0/24' }, { key: 'gateway', label: 'Gateway', type: 'select', options: ['hive-gw-es-01', 'hive-gw-es-02', 'hive-gw-es-h2'] }], make: (v) => make('dsr', { ...v, found: 0, new: 0, status: 'running', at: 'now' }), done: 'Scan started (passive, read only)' },
    },
    {
      id: 'suggestions',
      title: 'Plant model suggestions',
      statusKey: 'status',
      resource: res('plant_model_suggestion', '/v1/plant-model-suggestions', 'GRAPH-BOOT', 'plant_model_suggestion_list', [
        { id: 'pms_01m71xxpms0000000000000a', suggestion: 'Create machine CNC-10 under Line 2', evidence: 'New OPC UA server 10.20.2.19 (SINUMERIK)', confidence: 'high', status: 'proposed' },
        { id: 'pms_01m71xxpms0000000000000b', suggestion: 'Map 6 UNS topics to Compressor K-2', evidence: 'Topic names musterwerk/util/k2/*', confidence: 'medium', status: 'proposed' },
      ]),
      columns: [col.title('suggestion', 'Suggestion'), col.muted('evidence', 'Evidence'), col.status('confidence', 'Confidence'), col.status('status')],
      actions: [{ label: 'Accept', icon: CheckCheck, operation: 'plant_model_suggestion_accept', when: is('status', 'proposed'), apply: () => ({ status: 'accepted' }), done: 'Added to the plant model' }],
    },
  ],
};

export const itSync: Screen = {
  id: 'it-sync',
  title: 'IT sync',
  about: 'Synchronisation with ERP, MES and CMMS: mappings, runs, conflicts and records that could not be delivered.',
  icon: ArrowLeftRight,
  keywords: 'erp mes cmms sap sync mapping conflicts dead letter integration',
  spec: 'IT-PATTERN · IT-SAP · IT-MES',
  views: [
    {
      id: 'runs',
      title: 'Sync runs',
      statusKey: 'status',
      resource: res('sync_run', '/v1/sync-runs', 'IT-PATTERN', 'sync_run_list', [
        { id: 'syr_01m71xxsyr0000000000000a', system: 'SAP S/4HANA', object: 'Stock positions', direction: 'ERP → HIVE', records: 1840, conflicts: 0, status: 'completed', at: '10:30' },
        { id: 'syr_01m71xxsyr0000000000000b', system: 'SAP PM', object: 'Maintenance orders', direction: 'HIVE → ERP', records: 3, conflicts: 1, status: 'partial', at: '10:45' },
        { id: 'syr_01m71xxsyr0000000000000c', system: 'MES', object: 'Production feedback', direction: 'MES → HIVE', records: 412, conflicts: 0, status: 'completed', at: '10:40' },
        { id: 'syr_01m71xxsyr0000000000000d', system: 'SharePoint', object: 'Documents', direction: '→ HIVE', records: 26, conflicts: 0, status: 'running', at: '10:50' },
      ]),
      columns: [col.title('system', 'System'), col.text('object', 'Object'), col.muted('direction', 'Direction'), col.num('records', 'Records'), col.num('conflicts', 'Conflicts'), col.status('status'), col.muted('at', 'At', false)],
      kpis: [count('Runs today', undefined), { label: 'Conflicts open', value: (r) => r.reduce((n, x) => n + Number(x.conflicts), 0), hot: (r) => r.some((x) => Number(x.conflicts) > 0) }, { label: 'Dead letters', value: () => 2, sub: 'Waiting for a person' }],
    },
    {
      id: 'conflicts',
      title: 'Conflicts',
      statusKey: 'status',
      resource: res('sync_conflict', '/v1/sync-conflicts', 'IT-PATTERN', 'sync_conflict_list', [
        { id: 'syc_01m71xxsyc0000000000000a', record: 'Maintenance order 4000812 (WO-2291)', field: 'planned_start', hive: '18 Nov 14:00', erp: '19 Nov 06:00', status: 'open' },
        { id: 'syc_01m71xxsyc0000000000000b', record: 'Material 6205-2RS', field: 'minimum stock', hive: '2', erp: '3', status: 'resolved' },
      ]),
      columns: [col.title('record', 'Record'), col.id('field', 'Field'), col.text('hive', 'HIVE'), col.text('erp', 'ERP'), col.status('status')],
      actions: [
        { label: 'Keep HIVE value', icon: CheckCheck, operation: 'sync_conflict_resolve', when: is('status', 'open'), apply: () => ({ status: 'resolved' }), done: 'Resolved: HIVE value written to ERP' },
        { label: 'Take ERP value', icon: CheckCheck, operation: 'sync_conflict_resolve', when: is('status', 'open'), apply: (r) => ({ status: 'resolved', hive: r.erp }), done: 'Resolved: ERP value kept' },
      ],
    },
  ],
};

export const plantModel: Screen = {
  id: 'plant-model',
  title: 'Plant model',
  about: 'Asset types, relationships and the merging of duplicate identities from different systems.',
  icon: Share2,
  keywords: 'asset types templates relationships identity resolution aas digital twin',
  spec: 'GRAPH-TYPE · GRAPH-REL · GRAPH-IDRES · GRAPH-AAS',
  views: [
    {
      id: 'types',
      title: 'Asset types',
      statusKey: 'status',
      resource: res('asset_type', '/v1/asset-types', 'GRAPH-TYPE', 'asset_type_list', [
        { id: 'aty_01m71xxaty0000000000000a', name: 'Kessler KM 500', kind: 'machine', version: 3, signals: 48, assets: 2, status: 'released' },
        { id: 'aty_01m71xxaty0000000000000b', name: 'Spindle unit', kind: 'component', version: 2, signals: 12, assets: 3, status: 'released' },
        { id: 'aty_01m71xxaty0000000000000c', name: 'Screw compressor', kind: 'machine', version: 1, signals: 14, assets: 2, status: 'draft' },
      ]),
      columns: [col.title('name', 'Type'), col.text('kind', 'Kind'), col.num('version', 'Version'), col.num('signals', 'Signals'), col.num('assets', 'Assets'), col.status('status')],
    },
    {
      id: 'identities',
      title: 'Duplicate identities',
      statusKey: 'status',
      resource: res('identity_candidate', '/v1/identity-candidates', 'GRAPH-IDRES', 'identity_candidate_list', [
        { id: 'idc_01m71xxidc0000000000000a', hive: 'CNC-07', other: 'SAP equipment 10004711', system: 'SAP PM', score: 98, status: 'proposed' },
        { id: 'idc_01m71xxidc0000000000000b', hive: 'Compressor K-1', other: 'UNS musterwerk/util/k1', system: 'MQTT', score: 87, status: 'proposed' },
        { id: 'idc_01m71xxidc0000000000000c', hive: 'CNC-09', other: 'SAP equipment 10004788', system: 'SAP PM', score: 99, status: 'accepted' },
      ]),
      columns: [col.title('hive', 'HIVE asset'), col.text('other', 'Other record'), col.muted('system', 'System'), col.pct('score', 'Match'), col.status('status')],
      actions: [{ label: 'Merge', icon: Network, operation: 'identity_merge_create', when: is('status', 'proposed'), apply: () => ({ status: 'accepted' }), done: 'Identities merged' }],
    },
  ],
};

export const CONNECTIVITY = [gateways, fleet, connections, discovery, itSync, plantModel];
