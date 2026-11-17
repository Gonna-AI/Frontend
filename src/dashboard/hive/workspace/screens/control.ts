import { CheckCheck, OctagonX, Power, ScrollText, ShieldAlert, SquareTerminal, X } from 'lucide-react-dash';

import { col, count, is, res } from '../def';
import type { Screen } from '../types';

const TIER = { T0: 'gray', T1: 'gray', T2: 'amber', T3: 'orange', T4: 'red' } as const;

export const commands: Screen = {
  id: 'commands',
  title: 'Commands',
  about: 'The only way HIVE writes to a machine: a catalog of approved commands, each with its risk tier, interlocks and approvals.',
  icon: SquareTerminal,
  keywords: 'commands control write setpoint plc catalog tier approval interlock',
  spec: 'CMD-MODEL · CMD-CAT · CMD-APPROVE · CMD-EXEC',
  views: [
    {
      id: 'requests',
      title: 'Requests',
      statusKey: 'status',
      note: 'T3 and T4 commands always need a person to approve, T4 a second person. An AI agent can propose but never approve or execute them. Nothing queued during an outage runs afterwards.',
      resource: res('command', '/v1/commands', 'CMD-MODEL', 'command_list', [
        { id: 'cmd_01m71xxcmd0000000000000a', command: 'Reduce spindle speed override to 80 %', asset: 'CNC-07', tier: 'T3', requested_by: 'Agent · Maintenance planner', approvals: '0 of 1', status: 'awaiting_approval', reason: 'Limit bearing load until WO-2291' },
        { id: 'cmd_01m71xxcmd0000000000000b', command: 'Set coolant concentration target 7 %', asset: 'Line 2', tier: 'T2', requested_by: 'Jonas Weber', approvals: '1 of 1', status: 'completed', reason: 'Seasonal adjustment' },
        { id: 'cmd_01m71xxcmd0000000000000c', command: 'Load recipe IM-4471 rev C', asset: 'IM-02', tier: 'T4', requested_by: 'Aylin Demir', approvals: '1 of 2', status: 'awaiting_approval', reason: 'New mould insert' },
        { id: 'cmd_01m71xxcmd0000000000000d', command: 'Acknowledge control alarm 21612', asset: 'CNC-09', tier: 'T1', requested_by: 'Miriam Huber', approvals: 'not needed', status: 'completed', reason: 'Door switch reseated' },
        { id: 'cmd_01m71xxcmd0000000000000e', command: 'Start compressor K-2', asset: 'Compressor K-2', tier: 'T3', requested_by: 'Miriam Huber', approvals: '1 of 1', status: 'rejected', reason: 'Interlock: maintenance lockout active' },
      ]),
      columns: [col.title('command', 'Command'), col.text('asset', 'Asset'), { key: 'tier', label: 'Tier', kind: 'status', tones: TIER }, col.muted('requested_by', 'Requested by'), col.text('approvals', 'Approvals'), col.status('status')],
      detail: [{ key: 'reason', label: 'Reason' }],
      kpis: [count('Waiting for approval', is('status', 'awaiting_approval'), 'Only people can approve', true), count('Completed today', is('status', 'completed')), count('Blocked by interlock', is('status', 'rejected'))],
      actions: [
        { label: 'Approve', icon: CheckCheck, operation: 'approval_request_decide', when: is('status', 'awaiting_approval'), apply: (r) => ({ approvals: String(r.tier) === 'T4' && String(r.approvals).startsWith('0') ? '1 of 2' : 'approved', status: String(r.tier) === 'T4' && String(r.approvals).startsWith('0') ? 'awaiting_approval' : 'approved' }), done: 'Approval recorded with your step-up confirmation', confirm: 'You are approving a write to a machine. The approval is signed with your identity and audited.' },
        { label: 'Reject', icon: X, operation: 'approval_request_decide', when: is('status', 'awaiting_approval'), apply: () => ({ status: 'rejected' }), done: 'Command rejected', danger: true },
      ],
    },
    {
      id: 'catalog',
      title: 'Catalog',
      statusKey: 'status',
      resource: res('command_definition', '/v1/command-definitions', 'CMD-CAT', 'command_definition_list', [
        { id: 'cmdd_01m71xxcdf000000000000a', name: 'Spindle speed override', protocol: 'OPC UA write', range: '50–100 %', tier: 'T3', bound_to: 'CNC-07, CNC-09', interlocks: 'Door closed, no program change', status: 'released' },
        { id: 'cmdd_01m71xxcdf000000000000b', name: 'Coolant concentration target', protocol: 'OPC UA write', range: '5–9 %', tier: 'T2', bound_to: 'Line 2', interlocks: '—', status: 'released' },
        { id: 'cmdd_01m71xxcdf000000000000c', name: 'Load recipe', protocol: 'EUROMAP 77 method', range: 'Released recipes only', tier: 'T4', bound_to: 'IM-01, IM-02', interlocks: 'Machine in setup mode', status: 'released' },
        { id: 'cmdd_01m71xxcdf000000000000d', name: 'Compressor start/stop', protocol: 'Modbus TCP coil', range: 'start | stop', tier: 'T3', bound_to: 'K-1, K-2', interlocks: 'No lockout, pressure < 8 bar', status: 'review' },
        { id: 'cmdd_01m71xxcdf000000000000e', name: 'Press stroke parameters', protocol: 'S7', range: '—', tier: 'T4', bound_to: 'PR-01', interlocks: 'Read only machine', status: 'draft' },
      ]),
      columns: [col.title('name', 'Command'), col.text('protocol', 'Protocol'), col.muted('range', 'Allowed range'), { key: 'tier', label: 'Tier', kind: 'status', tones: TIER }, col.muted('bound_to', 'Bound to'), col.status('status')],
      detail: [{ key: 'interlocks', label: 'Interlocks' }],
      breakdown: { title: 'Commands by risk tier', by: 'tier' },
    },
    {
      id: 'policies',
      title: 'Approval policies',
      resource: res('approval_policy', '/v1/approval-policies', 'CMD-APPROVE', 'approval_policy_list', [
        { id: 'apl_01m71xxapl0000000000000a', name: 'T3 on Line 2', tiers: 'T3', approvers: 'maintenance_planner or site_manager', count: 1, step_up: 'yes', expires: '15 min' },
        { id: 'apl_01m71xxapl0000000000000b', name: 'T4 anywhere', tiers: 'T4', approvers: 'site_manager + one other qualified person', count: 2, step_up: 'yes', expires: '10 min' },
        { id: 'apl_01m71xxapl0000000000000c', name: 'T2 coolant', tiers: 'T2', approvers: 'integration_engineer', count: 1, step_up: 'no', expires: '1 h' },
      ]),
      columns: [col.title('name', 'Policy'), col.text('tiers', 'Tiers'), col.muted('approvers', 'Approvers'), col.num('count', 'People'), col.text('step_up', 'Step-up'), col.muted('expires', 'Approval valid')],
    },
  ],
};

export const recipes: Screen = {
  id: 'recipes',
  title: 'Recipes',
  about: 'Machine recipes and NC programs under version control: who released which revision, and where it runs.',
  icon: ScrollText,
  keywords: 'recipe program nc parameters version release',
  spec: 'CMD-RECIPE',
  views: [
    {
      id: 'recipes',
      title: 'Recipes',
      statusKey: 'status',
      resource: res('recipe', '/v1/recipes', 'CMD-RECIPE', 'recipe_list', [
        { id: 'rcp_01m71xxrcp0000000000000a', name: 'IM-4471 housing cover', revision: 'C', machines: 'IM-01, IM-02', parameters: 42, released_by: 'Aylin Demir', status: 'review' },
        { id: 'rcp_01m71xxrcp0000000000000b', name: 'IM-4471 housing cover', revision: 'B', machines: 'IM-01, IM-02', parameters: 42, released_by: 'Aylin Demir', status: 'released' },
        { id: 'rcp_01m71xxrcp0000000000000c', name: 'P-4471-OP20 milling', revision: '7', machines: 'CNC-07, CNC-09', parameters: 18, released_by: 'Jonas Weber', status: 'released' },
        { id: 'rcp_01m71xxrcp0000000000000d', name: 'PR-01 deep draw 2210', revision: '3', machines: 'PR-01', parameters: 11, released_by: 'Jonas Weber', status: 'superseded' },
      ]),
      columns: [col.title('name', 'Recipe'), col.id('revision', 'Rev'), col.muted('machines', 'Machines'), col.num('parameters', 'Parameters'), col.text('released_by', 'Released by'), col.status('status')],
      actions: [{ label: 'Release', icon: CheckCheck, operation: 'recipe_version_release', when: is('status', 'review'), apply: () => ({ status: 'released' }), done: 'Revision released', confirm: 'The previous revision is superseded; loading it needs a T4 command.' }],
    },
  ],
};

export const safety: Screen = {
  id: 'safety',
  title: 'Safety',
  about: 'The kill switch for all machine writes, automation policies and their reviews.',
  icon: ShieldAlert,
  keywords: 'kill switch emergency stop writes automation policy safety case',
  spec: 'CMD-KILL · CMD-AUTO · CMD-SAFE',
  views: [
    {
      id: 'kill-switch',
      title: 'Kill switch',
      statusKey: 'state',
      note: 'Engaging a switch stops every machine write in its scope at once, including approved commands. Reads continue.',
      resource: res('control_kill_switch', '/v1/control/kill-switches', 'CMD-KILL', 'control_kill_switch_list', [
        { id: 'kil_01m71xxkil0000000000000a', scope: 'Whole tenant', state: 'armed', last_change: '01 Nov · Dr. Elke Brandt', writes_24h: 14 },
        { id: 'kil_01m71xxkil0000000000000b', scope: 'Halle 1', state: 'armed', last_change: '—', writes_24h: 9 },
        { id: 'kil_01m71xxkil0000000000000c', scope: 'Halle 2', state: 'armed', last_change: '—', writes_24h: 5 },
        { id: 'kil_01m71xxkil0000000000000d', scope: 'AI agents', state: 'armed', last_change: 'Drill · 12 Oct', writes_24h: 0 },
      ]),
      columns: [col.title('scope', 'Scope'), col.status('state', 'State'), col.num('writes_24h', 'Writes 24 h'), col.muted('last_change', 'Last change')],
      actions: [
        { label: 'Engage', icon: OctagonX, operation: 'control_kill_switch_engage', when: is('state', 'armed'), apply: () => ({ state: 'engaged', last_change: 'Now · you' }), done: 'Kill switch engaged: writes stopped', danger: true, confirm: 'All machine writes in this scope stop immediately.' },
        { label: 'Release', icon: Power, operation: 'control_kill_switch_release', when: is('state', 'engaged'), apply: () => ({ state: 'armed', last_change: 'Now · you' }), done: 'Kill switch released', confirm: 'Writes resume. Nothing that was stopped runs again by itself.' },
      ],
    },
    {
      id: 'automation',
      title: 'Automation policies',
      statusKey: 'status',
      resource: res('automation_policy', '/v1/automation-policies', 'CMD-AUTO', 'automation_policy_list', [
        { id: 'aup_01m71xxaup0000000000000a', name: 'Coolant top-up without approval', command: 'Coolant concentration target', bounds: '6.5–7.5 %, max 2 per shift', review: 'Every 30 days', status: 'approved' },
        { id: 'aup_01m71xxaup0000000000000b', name: 'Night compressor sequencing', command: 'Compressor start/stop', bounds: 'K-2 only, 22:00–06:00', review: 'Every 30 days', status: 'tripped' },
        { id: 'aup_01m71xxaup0000000000000c', name: 'Spindle derate on vibration', command: 'Spindle speed override', bounds: '80–100 %', review: '—', status: 'proposed' },
      ]),
      columns: [col.title('name', 'Policy'), col.text('command', 'Command'), col.muted('bounds', 'Bounds'), col.muted('review', 'Review'), col.status('status')],
      kpis: [count('Approved', is('status', 'approved')), count('Tripped', is('status', 'tripped'), 'Stopped itself; needs review', true), count('Proposed', is('status', 'proposed'))],
    },
  ],
};

export const CONTROL = [commands, recipes, safety];
