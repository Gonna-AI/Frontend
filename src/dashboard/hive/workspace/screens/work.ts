import { CalendarClock, CheckCheck, ClipboardCheck, ContactRound, Hammer, Headset, Leaf, ListTodo, NotebookPen, Play, ScanBarcode } from 'lucide-react-dash';

import { col, count, is, make, now, res, sum, today } from '../def';
import type { Screen } from '../types';

export const maintenance: Screen = {
  id: 'maintenance',
  title: 'Maintenance plans',
  about: 'Preventive and condition-based plans: what is due, on which machine, and what each visit needs.',
  icon: CalendarClock,
  keywords: 'preventive maintenance plan schedule pm intervals condition based',
  spec: 'BIZ-PM · BIZ-WO',
  views: [
    {
      id: 'plans',
      title: 'Plans',
      statusKey: 'status',
      resource: res('maintenance_plan', '/v1/maintenance-plans', 'BIZ-PM', 'maintenance_plan_list', [
        { id: 'mpl_01m71xxmpl0000000000000a', name: 'Spindle bearing inspection', asset: 'CNC-07', trigger: 'Every 2,000 spindle hours or BPFO finding', next_due: 'Now (finding)', last_done: '14 Mar', status: 'due', duration_h: 3 },
        { id: 'mpl_01m71xxmpl0000000000000b', name: 'Coolant change and filter', asset: 'Line 2', trigger: 'Every 6 weeks', next_due: '28 Nov', last_done: '17 Oct', status: 'scheduled', duration_h: 2 },
        { id: 'mpl_01m71xxmpl0000000000000c', name: 'Hydraulic oil analysis', asset: 'PR-01', trigger: 'Every 1,000 h', next_due: 'Overdue 3 d', last_done: '02 Aug', status: 'overdue', duration_h: 1 },
        { id: 'mpl_01m71xxmpl0000000000000d', name: 'Compressor service', asset: 'Compressor K-1', trigger: 'Every 4,000 h (vendor)', next_due: '09 Dec', last_done: '11 Jun', status: 'scheduled', duration_h: 4 },
        { id: 'mpl_01m71xxmpl0000000000000e', name: 'Tool changer calibration', asset: 'CNC-09', trigger: 'Quarterly', next_due: '02 Jan', last_done: '01 Oct', status: 'scheduled', duration_h: 2 },
      ]),
      columns: [col.title('name', 'Plan'), col.text('asset', 'Asset'), col.muted('trigger', 'Trigger'), col.text('next_due', 'Next due'), col.muted('last_done', 'Last done', false), col.num('duration_h', 'Duration', 'h'), col.status('status')],
      kpis: [count('Due now', is('status', 'due'), 'Ready for a work order'), count('Overdue', is('status', 'overdue'), 'Past their interval', true), { label: 'PM compliance', value: () => '94 %', sub: 'Done on time, last 90 days' }],
      actions: [{ label: 'Create work order', icon: Play, operation: 'maintenance_plan_generate', when: is('status', 'due', 'overdue'), apply: () => ({ status: 'scheduled', next_due: 'Work order created' }), done: 'Work order drafted for approval' }],
      create: { label: 'New plan', operation: 'maintenance_plan_create', fields: [{ key: 'name', label: 'Name', required: true }, { key: 'asset', label: 'Asset', required: true }, { key: 'trigger', label: 'Trigger', placeholder: 'Every 500 h' }], make: (v) => make('mpl', { ...v, next_due: '—', last_done: '—', status: 'scheduled', duration_h: 1 }), done: 'Plan created' },
    },
    {
      id: 'templates',
      title: 'Task templates',
      resource: res('task_template', '/v1/task-templates', 'BIZ-TASK', 'task_template_list', [
        { id: 'ttp_01m71xxttp0000000000000a', name: 'Replace spindle bearing 6205-2RS', steps: 14, qualification: 'Spindle work', parts: '6205-2RS × 2, grease', lockout: 'yes' },
        { id: 'ttp_01m71xxttp0000000000000b', name: 'Coolant concentration check', steps: 5, qualification: '—', parts: 'Refractometer', lockout: 'no' },
        { id: 'ttp_01m71xxttp0000000000000c', name: 'Hydraulic hose inspection', steps: 9, qualification: 'Hydraulics', parts: '—', lockout: 'yes' },
      ]),
      columns: [col.title('name', 'Template'), col.num('steps', 'Steps'), col.text('qualification', 'Qualification'), col.muted('parts', 'Parts and tools'), col.text('lockout', 'Lockout')],
    },
  ],
};

export const shift: Screen = {
  id: 'shift',
  title: 'Shift log',
  about: 'The logbook of each shift and the handover the next shift reads first.',
  icon: NotebookPen,
  keywords: 'shift handover logbook schicht übergabe notes',
  spec: 'BIZ-SHIFT',
  views: [
    {
      id: 'handovers',
      title: 'Handovers',
      statusKey: 'status',
      resource: res('handover_summary', '/v1/handover-summaries', 'BIZ-SHIFT', 'handover_summary_list', [
        { id: 'hos_01m71xxhos0000000000000a', shift: 'A · today', area: 'Halle 1', summary: 'CNC-07 vibration critical since 10:41; WO-2291 waiting for approval. Line 1 normal.', open_items: 3, status: 'draft', author: 'Miriam Huber' },
        { id: 'hos_01m71xxhos0000000000000b', shift: 'C · last night', area: 'Halle 1', summary: 'Quiet night. CNC-09 tool change alarm cleared by setter.', open_items: 0, status: 'acknowledged', author: 'Night shift lead' },
        { id: 'hos_01m71xxhos0000000000000c', shift: 'C · last night', area: 'Halle 2', summary: 'IM-02 mould heater zone 3 slow to reach temperature.', open_items: 1, status: 'acknowledged', author: 'Night shift lead' },
      ]),
      columns: [col.text('shift', 'Shift'), col.text('area', 'Area'), col.title('summary', 'Summary'), col.num('open_items', 'Open items'), col.text('author', 'Author'), col.status('status')],
      titleKey: 'summary',
      actions: [{ label: 'Hand over', icon: CheckCheck, operation: 'handover_summary_publish', when: is('status', 'draft'), apply: () => ({ status: 'sent' }), done: 'Handover sent to shift B' }],
    },
    {
      id: 'logbook',
      title: 'Logbook',
      statusKey: 'kind',
      resource: res('logbook_entry', '/v1/logbook-entries', 'BIZ-SHIFT', 'logbook_entry_list', [
        { id: 'lbe_01m71xxlbe0000000000000a', at: '10:45', kind: 'fault', asset: 'CNC-07', text: 'Audible noise from spindle at 2,400 1/min.', author: 'Miriam Huber' },
        { id: 'lbe_01m71xxlbe0000000000000b', at: '09:30', kind: 'quality', asset: 'TQ-40', text: 'Two torque results at upper limit, station re-zeroed.', author: 'Aylin Demir' },
        { id: 'lbe_01m71xxlbe0000000000000c', at: '07:10', kind: 'note', asset: 'Line 2', text: 'Material lot L-2311-04 started on CNC-07.', author: 'Miriam Huber' },
      ]),
      columns: [col.muted('at', 'Time', false), col.status('kind', 'Kind'), col.text('asset', 'Asset'), col.title('text', 'Entry'), col.text('author', 'By')],
      titleKey: 'text',
      create: { label: 'Add entry', operation: 'logbook_entry_create', fields: [{ key: 'asset', label: 'Asset', required: true }, { key: 'kind', label: 'Kind', type: 'select', options: ['note', 'fault', 'quality', 'safety'] }, { key: 'text', label: 'Entry', type: 'textarea', required: true }], make: (v) => make('lbe', { ...v, at: now(), author: 'You' }), done: 'Entry added' },
    },
  ],
};

export const traceability: Screen = {
  id: 'traceability',
  title: 'Traceability',
  about: 'From a lot or serial number to the machines, programs, process values and people that touched it.',
  icon: ScanBarcode,
  keywords: 'traceability lot batch serial genealogy recall',
  spec: 'BIZ-TRACE',
  views: [
    {
      id: 'lots',
      title: 'Lots',
      statusKey: 'status',
      resource: res('lot', '/v1/lots', 'BIZ-TRACE', 'lot_list', [
        { id: 'lot_01m71xxlot0000000000000a', number: 'L-2311-04', material: 'Housing 4471, AlMg4.5', order: 'PO-88412', machines: 'CNC-07 → TQ-40', parts: 420, status: 'in_progress', program: 'P-4471-OP20' },
        { id: 'lot_01m71xxlot0000000000000b', number: 'L-2311-03', material: 'Housing 4471, AlMg4.5', order: 'PO-88412', machines: 'CNC-07 → TQ-40', parts: 600, status: 'released', program: 'P-4471-OP20' },
        { id: 'lot_01m71xxlot0000000000000c', number: 'L-2310-19', material: 'Flange 2210, 42CrMo4', order: 'PO-88207', machines: 'CNC-02 → CNC-09', parts: 1200, status: 'quarantined', program: 'P-2210-OP10' },
      ]),
      columns: [col.id('number', 'Lot'), col.title('material', 'Material'), col.text('order', 'Order'), col.muted('machines', 'Route'), col.num('parts', 'Parts'), col.status('status')],
      detail: [{ key: 'program', label: 'NC program' }],
      kpis: [count('Lots in progress', is('status', 'in_progress')), count('Quarantined', is('status', 'quarantined'), 'Blocked pending review', true), { label: 'Trace time', value: () => '0.8 s', sub: 'Part to process values, p95' }],
      actions: [{ label: 'Release', icon: CheckCheck, operation: 'lot_release', when: is('status', 'quarantined'), apply: () => ({ status: 'released' }), done: 'Lot released', confirm: 'Released parts can ship to the customer.' }],
    },
  ],
};

export const tools: Screen = {
  id: 'tools',
  title: 'Tools and calibration',
  about: 'Cutting tools, gauges and test equipment with their life, location and calibration due dates.',
  icon: Hammer,
  keywords: 'tools tooling gauges calibration measurement equipment life',
  spec: 'BIZ-TOOL',
  views: [
    {
      id: 'calibrations',
      title: 'Calibrations',
      statusKey: 'status',
      resource: res('calibration', '/v1/calibrations', 'BIZ-TOOL', 'calibration_list', [
        { id: 'cal_01m71xxcal0000000000000a', item: 'Torque transducer TQ-40', due: '22 Nov', last: '22 May', interval: '6 months', lab: 'DAkkS lab Stuttgart', status: 'due' },
        { id: 'cal_01m71xxcal0000000000000b', item: 'Micrometer 0–25 mm #M-114', due: '04 Jan', last: '04 Jul', interval: '6 months', lab: 'In house', status: 'valid' },
        { id: 'cal_01m71xxcal0000000000000c', item: 'Bore gauge #B-031', due: 'Overdue 6 d', last: '06 May', interval: '6 months', lab: 'In house', status: 'overdue' },
        { id: 'cal_01m71xxcal0000000000000d', item: 'CMM Zeiss Contura', due: '15 Mar', last: '15 Sep', interval: '6 months', lab: 'Vendor', status: 'valid' },
      ]),
      columns: [col.title('item', 'Equipment'), col.text('due', 'Due'), col.muted('last', 'Last', false), col.muted('interval', 'Interval'), col.muted('lab', 'Calibrated by'), col.status('status')],
      kpis: [count('Due this month', is('status', 'due')), count('Overdue', is('status', 'overdue'), 'Must not be used for release', true), count('Valid', is('status', 'valid'))],
      actions: [{ label: 'Record calibration', icon: CheckCheck, operation: 'calibration_record', when: is('status', 'due', 'overdue'), apply: () => ({ status: 'valid', last: today(), due: 'In 6 months' }), done: 'Calibration recorded' }],
    },
    {
      id: 'tools',
      title: 'Cutting tools',
      statusKey: 'status',
      resource: res('tool', '/v1/tools', 'BIZ-TOOL', 'tool_list', [
        { id: 'tol_01m71xxtol0000000000000a', name: 'End mill Ø10 HPC', machine: 'CNC-07 T12', life: 82, unit_count: '410 of 500 parts', status: 'active' },
        { id: 'tol_01m71xxtol0000000000000b', name: 'Drill Ø6.8 carbide', machine: 'CNC-07 T04', life: 96, unit_count: '1,920 of 2,000 holes', status: 'expiring' },
        { id: 'tol_01m71xxtol0000000000000c', name: 'Face mill Ø63', machine: 'CNC-09 T01', life: 35, unit_count: '7 of 20 h', status: 'active' },
      ]),
      columns: [col.title('name', 'Tool'), col.text('machine', 'Machine and pocket'), col.pct('life', 'Life used'), col.muted('unit_count', 'Usage'), col.status('status')],
    },
  ],
};

export const service: Screen = {
  id: 'service',
  title: 'Service',
  about: 'Installed machines at customers and the service cases against them (for machine builders).',
  icon: Headset,
  keywords: 'service cases installed base field service oem customer machines',
  spec: 'BIZ-SERVICE · BIZ-SHARE',
  views: [
    {
      id: 'cases',
      title: 'Cases',
      statusKey: 'status',
      resource: res('service_case', '/v1/service-cases', 'BIZ-SERVICE', 'service_case_list', [
        { id: 'svc_01m71xxsvc0000000000000a', title: 'KM 500 spindle noise', customer: 'Musterwerk Esslingen', machine: 'CNC-07 (KM500-190412)', priority: 'high', status: 'open', opened: 'Today 10:50', sla: '4 h response' },
        { id: 'svc_01m71xxsvc0000000000000b', title: 'Tool changer misalignment', customer: 'Musterwerk Esslingen', machine: 'CNC-09', priority: 'medium', status: 'in_progress', opened: 'Mon', sla: '1 d response' },
        { id: 'svc_01m71xxsvc0000000000000c', title: 'Retrofit firmware update', customer: 'Musterwerk Zwickau', machine: 'IO-Link master', priority: 'low', status: 'resolved', opened: 'Last week', sla: '—' },
      ]),
      columns: [col.title('title', 'Case'), col.text('customer', 'Customer'), col.muted('machine', 'Machine'), col.status('priority', 'Priority'), col.status('status'), col.muted('sla', 'SLA')],
      actions: [{ label: 'Resolve', icon: CheckCheck, operation: 'service_case_update', when: is('status', 'open', 'in_progress'), apply: () => ({ status: 'resolved' }), done: 'Case resolved' }],
    },
    {
      id: 'installed',
      title: 'Installed base',
      statusKey: 'contract',
      resource: res('installed_machine', '/v1/installed-machines', 'BIZ-SERVICE', 'installed_machine_list', [
        { id: 'inm_01m71xxinm0000000000000a', serial: 'KM500-190412', model: 'Kessler KM 500', customer: 'Musterwerk Esslingen', installed: '2019', contract: 'active', shared: 'Spindle signals, alarms' },
        { id: 'inm_01m71xxinm0000000000000b', serial: 'KM500-200077', model: 'Kessler KM 500', customer: 'Musterwerk Esslingen', installed: '2020', contract: 'active', shared: 'Alarms' },
        { id: 'inm_01m71xxinm0000000000000c', serial: 'KM300-180903', model: 'Kessler KM 300', customer: 'Musterwerk Zwickau', installed: '2018', contract: 'expired', shared: '—' },
      ]),
      columns: [col.id('serial', 'Serial'), col.title('model', 'Model'), col.text('customer', 'Customer'), col.muted('installed', 'Installed', false), col.muted('shared', 'Shared with builder'), col.status('contract', 'Contract')],
    },
  ],
};

export const customers: Screen = {
  id: 'customers',
  title: 'Customers',
  about: 'Accounts, contacts and opportunities, connected to the orders and parts they are about.',
  icon: ContactRound,
  keywords: 'crm customers accounts contacts opportunities sales pipeline',
  spec: 'BIZ-CRM',
  views: [
    {
      id: 'opportunities',
      title: 'Opportunities',
      statusKey: 'stage',
      resource: res('opportunity', '/v1/opportunities', 'BIZ-CRM', 'opportunity_list', [
        { id: 'opp_01m71xxopp0000000000000a', name: 'Housing 4471 annual volume 2027', account: 'Autozulieferer Süd AG', value: 840000, stage: 'proposal', close: 'Dec', owner: 'Sales' },
        { id: 'opp_01m71xxopp0000000000000b', name: 'Flange 2210 second source', account: 'Pumpenbau Neckar GmbH', value: 210000, stage: 'qualified', close: 'Jan', owner: 'Sales' },
        { id: 'opp_01m71xxopp0000000000000c', name: 'Prototype series 12 parts', account: 'MedTech Reutlingen', value: 18000, stage: 'won', close: 'Nov', owner: 'Sales' },
      ]),
      columns: [col.title('name', 'Opportunity'), col.text('account', 'Account'), col.num('value', 'Value', '€'), col.status('stage', 'Stage'), col.muted('close', 'Close', false)],
      kpis: [sum('Pipeline', 'value', '€'), count('Open', is('stage', 'proposal', 'qualified')), { label: 'Win rate', value: () => '38 %', sub: 'Last 12 months' }],
      breakdown: { title: 'Pipeline by stage', by: 'stage', sum: 'value', unit: '€' },
    },
    {
      id: 'accounts',
      title: 'Accounts',
      resource: res('account', '/v1/accounts', 'BIZ-CRM', 'account_list', [
        { id: 'acc_01m71xxacc0000000000000a', name: 'Autozulieferer Süd AG', city: 'Stuttgart', parts: 'Housing 4471', contacts: 3, revenue_ytd: 1240000 },
        { id: 'acc_01m71xxacc0000000000000b', name: 'Pumpenbau Neckar GmbH', city: 'Heilbronn', parts: 'Flange 2210', contacts: 2, revenue_ytd: 380000 },
        { id: 'acc_01m71xxacc0000000000000c', name: 'MedTech Reutlingen', city: 'Reutlingen', parts: 'Prototypes', contacts: 1, revenue_ytd: 42000 },
      ]),
      columns: [col.title('name', 'Account'), col.text('city', 'City'), col.muted('parts', 'Parts'), col.num('contacts', 'Contacts'), col.num('revenue_ytd', 'Revenue YTD', '€')],
    },
  ],
};

export const energy: Screen = {
  id: 'energy',
  title: 'Energy',
  about: 'Consumption by line and machine against its baseline, energy per good part and where the waste is.',
  icon: Leaf,
  keywords: 'energy consumption kwh baseline iso 50001 co2 compressed air',
  spec: 'BIZ-ENERGY · CMP-ESG',
  views: [
    {
      id: 'baselines',
      title: 'Consumers',
      statusKey: 'status',
      resource: res('energy_baseline', '/v1/energy-baselines', 'BIZ-ENERGY', 'energy_baseline_list', [
        { id: 'enb_01m71xxenb0000000000000a', consumer: 'Line 2 · milling', today_kwh: 1840, baseline_kwh: 1720, per_part: '0.41 kWh', status: 'warning' },
        { id: 'enb_01m71xxenb0000000000000b', consumer: 'Line 1 · turning', today_kwh: 1210, baseline_kwh: 1260, per_part: '0.18 kWh', status: 'normal' },
        { id: 'enb_01m71xxenb0000000000000c', consumer: 'Press line', today_kwh: 2950, baseline_kwh: 3010, per_part: '0.09 kWh', status: 'normal' },
        { id: 'enb_01m71xxenb0000000000000d', consumer: 'Compressed air (K-1, K-2)', today_kwh: 1460, baseline_kwh: 1100, per_part: '—', status: 'breached' },
        { id: 'enb_01m71xxenb0000000000000e', consumer: 'Injection moulding', today_kwh: 2210, baseline_kwh: 2300, per_part: '0.22 kWh', status: 'normal' },
      ]),
      columns: [col.title('consumer', 'Consumer'), col.num('today_kwh', 'Today', 'kWh'), col.num('baseline_kwh', 'Baseline', 'kWh'), col.text('per_part', 'Per good part'), col.status('status')],
      kpis: [sum('Plant today', 'today_kwh', 'kWh'), { label: 'CO₂ today', value: (r) => `${Math.round(r.reduce((n, x) => n + Number(x.today_kwh), 0) * 0.38).toLocaleString()} kg`, sub: 'Grid factor 0.38 kg/kWh' }, count('Above baseline', is('status', 'breached', 'warning'), 'Look at compressed air first', true)],
      breakdown: { title: 'Consumption today', by: 'consumer', sum: 'today_kwh', unit: 'kWh' },
    },
  ],
};

export const tasks: Screen = {
  id: 'tasks',
  title: 'Tasks',
  about: 'Small jobs that are not work orders: checks, follow-ups and to-dos with an owner and a date.',
  icon: ListTodo,
  keywords: 'tasks todo checklist follow up assignments',
  spec: 'BIZ-TASK',
  views: [
    {
      id: 'tasks',
      title: 'Tasks',
      statusKey: 'status',
      resource: res('task', '/v1/tasks', 'BIZ-TASK', 'task_list', [
        { id: 'tsk_01m71xxtsk0000000000000a', title: 'Check CNC-09 bearing (same model as CNC-07)', assignee: 'Miriam Huber', due: 'Today', asset: 'CNC-09', status: 'open' },
        { id: 'tsk_01m71xxtsk0000000000000b', title: 'Confirm torque re-zero on TQ-40', assignee: 'Aylin Demir', due: 'Today', asset: 'TQ-40', status: 'done' },
        { id: 'tsk_01m71xxtsk0000000000000c', title: 'Ask Wälzlager Nord for faster delivery', assignee: 'Stefan Köhler', due: 'Tomorrow', asset: '—', status: 'open' },
        { id: 'tsk_01m71xxtsk0000000000000d', title: 'Review IM-02 heater zone 3 data', assignee: 'Jonas Weber', due: 'Fri', asset: 'IM-02', status: 'in_progress' },
      ]),
      columns: [col.title('title', 'Task'), col.text('assignee', 'Assignee'), col.text('asset', 'Asset'), col.text('due', 'Due'), col.status('status')],
      kpis: [count('Open', is('status', 'open', 'in_progress')), count('Due today', (r) => r.due === 'Today' && r.status !== 'done', undefined, true), count('Done', is('status', 'done'))],
      actions: [{ label: 'Mark done', icon: ClipboardCheck, operation: 'task_complete', when: is('status', 'open', 'in_progress'), apply: () => ({ status: 'done' }), done: 'Task done' }],
      create: { label: 'New task', operation: 'task_create', fields: [{ key: 'title', label: 'Task', required: true }, { key: 'assignee', label: 'Assignee' }, { key: 'asset', label: 'Asset' }, { key: 'due', label: 'Due', placeholder: 'Today' }], make: (v) => make('tsk', { ...v, status: 'open' }), done: 'Task created' },
    },
  ],
};

export const WORK = [maintenance, shift, traceability, tools, service, customers, energy, tasks];
