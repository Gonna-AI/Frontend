import { BadgeCheck, BrainCircuit, CheckCheck, FlaskConical, Gauge, Landmark, MessageSquareText, ScanEye, Shield, Database, X, Boxes, Tags } from 'lucide-react-dash';

import { col, count, is, res, sum } from '../def';
import type { Screen } from '../types';

export const agentRuns: Screen = {
  id: 'agent-runs',
  title: 'Agent runs',
  about: 'Every run of every agent: what it was asked, the tools it called, what it cost and how it ended.',
  icon: BrainCircuit,
  keywords: 'agent runs traces tools steps cost tokens',
  spec: 'AI-RUN · AI-TOOLS · AI-GW',
  views: [
    {
      id: 'runs',
      title: 'Runs',
      statusKey: 'status',
      resource: res('agent_run', '/v1/agent-runs', 'AI-RUN', 'agent_run_list', [
        { id: 'run_01m71xxrun0000000000000a', agent: 'Maintenance planner', goal: 'Respond to CNC-07 spindle alarm', tools: 9, cost_eur: 0.42, duration: '48 s', status: 'awaiting_approval', started: '10:41' },
        { id: 'run_01m71xxrun0000000000000b', agent: 'Shift summariser', goal: 'Handover shift A Halle 1', tools: 4, cost_eur: 0.08, duration: '12 s', status: 'completed', started: '13:50' },
        { id: 'run_01m71xxrun0000000000000c', agent: 'Quality investigator', goal: 'Torque results at upper limit TQ-40', tools: 6, cost_eur: 0.21, duration: '31 s', status: 'completed', started: '09:32' },
        { id: 'run_01m71xxrun0000000000000d', agent: 'Purchasing assistant', goal: 'Compare RFQ replies 6205-2RS', tools: 3, cost_eur: 0.05, duration: '9 s', status: 'failed', started: '08:15' },
      ]),
      columns: [col.title('goal', 'Goal'), col.text('agent', 'Agent'), col.num('tools', 'Tool calls'), col.num('cost_eur', 'Cost', '€'), col.muted('duration', 'Duration', false), col.status('status')],
      kpis: [count('Runs today', undefined), count('Waiting for a person', is('status', 'awaiting_approval'), 'Agents never approve their own actions', true), sum('Cost today', 'cost_eur', '€')],
    },
  ],
};

export const review: Screen = {
  id: 'review',
  title: 'Review queue',
  about: 'What agents proposed and a person must decide: drafts, actions and low-confidence answers.',
  icon: ScanEye,
  keywords: 'human in the loop review approve agent proposals hitl',
  spec: 'AI-HITL · AI-AUTO',
  views: [
    {
      id: 'items',
      title: 'Waiting',
      statusKey: 'status',
      resource: res('review_item', '/v1/review-items', 'AI-HITL', 'review_item_list', [
        { id: 'rvi_01m71xxrvi0000000000000a', proposal: 'Work order WO-2291: replace drive-end bearing CNC-07', agent: 'Maintenance planner', evidence: '3 sources: finding, manual p.112, history', confidence: 'high', status: 'pending' },
        { id: 'rvi_01m71xxrvi0000000000000b', proposal: 'Command: spindle override 80 % on CNC-07', agent: 'Maintenance planner', evidence: 'Vibration trend, bearing spec', confidence: 'medium', status: 'pending' },
        { id: 'rvi_01m71xxrvi0000000000000c', proposal: 'Purchase requisition 2 × 6205-2RS', agent: 'Purchasing assistant', evidence: 'Stock 1 of min 2', confidence: 'high', status: 'accepted' },
      ]),
      columns: [col.title('proposal', 'Proposal'), col.text('agent', 'Agent'), col.muted('evidence', 'Evidence'), col.status('confidence', 'Confidence'), col.status('status')],
      actions: [
        { label: 'Accept', icon: CheckCheck, operation: 'review_item_decide', when: is('status', 'pending'), apply: () => ({ status: 'accepted' }), done: 'Accepted and recorded with your name' },
        { label: 'Reject', icon: X, operation: 'review_item_decide', when: is('status', 'pending'), apply: () => ({ status: 'rejected' }), done: 'Rejected; the agent is told why', danger: true },
      ],
    },
  ],
};

export const evaluations: Screen = {
  id: 'evaluations',
  title: 'Evaluations',
  about: 'Test sets every agent and prompt version must pass before release, and their scores over time.',
  icon: FlaskConical,
  keywords: 'evaluation eval sets scores regression benchmark release gate',
  spec: 'AI-EVAL',
  views: [
    {
      id: 'runs',
      title: 'Eval runs',
      statusKey: 'status',
      resource: res('eval_run', '/v1/eval-runs', 'AI-EVAL', 'eval_run_list', [
        { id: 'evr_01m71xxevr0000000000000a', set: 'Spindle alarm story (golden)', subject: 'Maintenance planner v14', cases: 120, score: 96, threshold: 95, status: 'passed' },
        { id: 'evr_01m71xxevr0000000000000b', set: 'Abstain on unknown topics', subject: 'Assistant v22', cases: 80, score: 99, threshold: 98, status: 'passed' },
        { id: 'evr_01m71xxevr0000000000000c', set: 'German maintenance language', subject: 'Assistant v23 (candidate)', cases: 150, score: 91, threshold: 93, status: 'failed' },
        { id: 'evr_01m71xxevr0000000000000d', set: 'Tool misuse and injection', subject: 'All agents', cases: 64, score: 100, threshold: 100, status: 'passed' },
      ]),
      columns: [col.title('set', 'Eval set'), col.text('subject', 'Subject'), col.num('cases', 'Cases'), col.pct('score', 'Score'), col.num('threshold', 'Gate', '%'), col.status('status')],
      kpis: [count('Passed', is('status', 'passed')), count('Blocked releases', is('status', 'failed'), 'Below their gate', true)],
    },
  ],
};

export const guardrails: Screen = {
  id: 'guardrails',
  title: 'Guardrails',
  about: 'Policies that check every model input and output, and the events where they stepped in.',
  icon: Shield,
  keywords: 'guardrails guard policy injection pii filter safety',
  spec: 'AI-GUARD',
  views: [
    {
      id: 'events',
      title: 'Events',
      statusKey: 'action',
      resource: res('guard_event', '/v1/guard-events', 'AI-GUARD', 'guard_event_list', [
        { id: 'gde_01m71xxgde0000000000000a', policy: 'Prompt injection in documents', where: 'Manual upload KM500_service.pdf p.88', action: 'blocked', at: '09:14' },
        { id: 'gde_01m71xxgde0000000000000b', policy: 'Personal data in answers', where: 'Assistant thread · shift question', action: 'redacted', at: '08:52' },
        { id: 'gde_01m71xxgde0000000000000c', policy: 'Machine write without approval', where: 'Agent Maintenance planner', action: 'blocked', at: '10:42' },
      ]),
      columns: [col.title('policy', 'Policy'), col.muted('where', 'Where'), { key: 'action', label: 'Action', kind: 'status', tones: { blocked: 'red', redacted: 'amber', flagged: 'gray' } }, col.muted('at', 'At', false)],
    },
    {
      id: 'policies',
      title: 'Policies',
      statusKey: 'status',
      resource: res('guard_policy', '/v1/guard-policies', 'AI-GUARD', 'guard_policy_list', [
        { id: 'gdp_01m71xxgdp0000000000000a', name: 'Prompt injection in retrieved text', applies: 'All agents', mode: 'block', status: 'active' },
        { id: 'gdp_01m71xxgdp0000000000000b', name: 'Personal data in outputs', applies: 'Assistant, reports', mode: 'redact', status: 'active' },
        { id: 'gdp_01m71xxgdp0000000000000c', name: 'Performance of a named person', applies: 'All', mode: 'block', status: 'active' },
      ]),
      columns: [col.title('name', 'Policy'), col.text('applies', 'Applies to'), col.text('mode', 'Mode'), col.status('status')],
    },
  ],
};

export const prompts: Screen = {
  id: 'prompts',
  title: 'Prompts',
  about: 'Versioned prompts and the tenant overlays that adapt them, each tied to the evaluation that released it.',
  icon: MessageSquareText,
  keywords: 'prompts versions overlays templates system prompt',
  spec: 'AI-PROMPT',
  views: [
    {
      id: 'prompts',
      title: 'Prompts',
      statusKey: 'status',
      resource: res('prompt_artefact', '/v1/prompt-artefacts', 'AI-PROMPT', 'prompt_artefact_list', [
        { id: 'pra_01m71xxpra0000000000000a', name: 'maintenance-planner/system', version: 'v14', eval: 'Spindle alarm story 96 %', overlay: 'Musterwerk terms (de)', status: 'released' },
        { id: 'pra_01m71xxpra0000000000000b', name: 'assistant/answer-with-sources', version: 'v23', eval: 'German maintenance 91 %', overlay: '—', status: 'blocked' },
        { id: 'pra_01m71xxpra0000000000000c', name: 'shift-summariser/handover', version: 'v6', eval: 'Handover set 97 %', overlay: 'Teams format', status: 'released' },
      ]),
      columns: [col.id('name', 'Prompt'), col.text('version', 'Version'), col.muted('eval', 'Release evaluation'), col.muted('overlay', 'Tenant overlay'), col.status('status')],
    },
  ],
};

export const aiUsage: Screen = {
  id: 'ai-usage',
  title: 'AI usage',
  about: 'Model calls, tokens and cost by agent and model, against the budgets you set.',
  icon: Gauge,
  keywords: 'ai usage cost tokens budget model gateway spend',
  spec: 'AI-OBS · AI-GW',
  views: [
    {
      id: 'budgets',
      title: 'Budgets',
      statusKey: 'status',
      resource: res('ai_budget', '/v1/ai/budgets', 'AI-OBS', 'ai_budget_list', [
        { id: 'bgt_01m71xxbgt0000000000000a', scope: 'Whole tenant', used_eur: 184, limit_eur: 400, used_pct: 46, period: 'November', status: 'ok' },
        { id: 'bgt_01m71xxbgt0000000000000b', scope: 'Maintenance planner', used_eur: 71, limit_eur: 80, used_pct: 89, period: 'November', status: 'warning' },
        { id: 'bgt_01m71xxbgt0000000000000c', scope: 'Assistant', used_eur: 96, limit_eur: 250, used_pct: 38, period: 'November', status: 'ok' },
      ]),
      columns: [col.title('scope', 'Scope'), col.num('used_eur', 'Used', '€'), col.num('limit_eur', 'Budget', '€'), col.pct('used_pct', 'Used'), col.status('status')],
    },
    {
      id: 'models',
      title: 'By model',
      resource: res('ai_usage', '/v1/ai/usage', 'AI-OBS', 'ai_usage_list', [
        { id: 'aiu_01m71xxaiu0000000000000a', model: 'Claude (EU region)', calls: 4210, tokens_m: 18.4, cost_eur: 152, p95: '2.1 s' },
        { id: 'aiu_01m71xxaiu0000000000000b', model: 'Embedding model (EU)', calls: 22800, tokens_m: 41.2, cost_eur: 12, p95: '0.2 s' },
        { id: 'aiu_01m71xxaiu0000000000000c', model: 'Speech to text (EU)', calls: 140, tokens_m: 0.3, cost_eur: 20, p95: '1.4 s' },
      ]),
      columns: [col.title('model', 'Model'), col.num('calls', 'Calls'), col.num('tokens_m', 'Tokens', 'M'), col.num('cost_eur', 'Cost', '€'), col.muted('p95', 'Latency p95', false)],
      breakdown: { title: 'Cost by model', by: 'model', sum: 'cost_eur', unit: '€' },
    },
  ],
};

export const aiGovernance: Screen = {
  id: 'ai-governance',
  title: 'AI governance',
  about: 'The register of AI systems, their EU AI Act risk class, human oversight and the records that prove it.',
  icon: Landmark,
  keywords: 'ai act governance risk classification inventory oversight register',
  spec: 'AI-GOV',
  views: [
    {
      id: 'systems',
      title: 'AI systems',
      statusKey: 'risk',
      resource: res('ai_system', '/v1/ai/systems', 'AI-GOV', 'ai_system_list', [
        { id: 'ais_01m71xxais0000000000000a', name: 'Maintenance planner agent', purpose: 'Drafts work orders and commands for approval', risk: 'limited', oversight: 'Every action approved by a person', status: 'enabled' },
        { id: 'ais_01m71xxais0000000000000b', name: 'Vibration anomaly model', purpose: 'Flags bearing wear', risk: 'minimal', oversight: 'Findings reviewed', status: 'enabled' },
        { id: 'ais_01m71xxais0000000000000c', name: 'Assistant', purpose: 'Answers with sources', risk: 'limited', oversight: 'Transparency notice shown', status: 'enabled' },
        { id: 'ais_01m71xxais0000000000000d', name: 'Shift scheduler (proposal)', purpose: 'Proposes shift plans', risk: 'high', oversight: 'Not enabled: works council review', status: 'disabled' },
      ]),
      columns: [col.title('name', 'System'), col.muted('purpose', 'Purpose'), { key: 'risk', label: 'Risk class', kind: 'status', tones: { minimal: 'green', limited: 'amber', high: 'red' } }, col.muted('oversight', 'Human oversight'), col.status('status')],
      kpis: [count('Registered', undefined), count('High risk', is('risk', 'high'), 'Needs a conformity path', true)],
    },
  ],
};

export const models: Screen = {
  id: 'models',
  title: 'Models',
  about: 'Machine learning models, their versions, where each is deployed and how well it performs.',
  icon: Boxes,
  keywords: 'ml models versions deployment anomaly forecasting rul serving',
  spec: 'ML-PLAT · ML-SERVE · ML-API · ML-TENANT',
  views: [
    {
      id: 'models',
      title: 'Models',
      statusKey: 'status',
      resource: res('model', '/v1/models', 'ML-PLAT', 'model_list', [
        { id: 'mdl_01m71xxmdl0000000000000a', name: 'vib-anomaly', task: 'Anomaly detection', version: 'v3', assets: 'CNC-07, CNC-09', precision: 92, status: 'live' },
        { id: 'mdl_01m71xxmdl0000000000000b', name: 'bearing-rul', task: 'Remaining useful life', version: 'v1', assets: 'KM 500 spindles', precision: 78, status: 'shadow' },
        { id: 'mdl_01m71xxmdl0000000000000c', name: 'energy-forecast', task: 'Forecast', version: 'v2', assets: 'Plant', precision: 88, status: 'live' },
        { id: 'mdl_01m71xxmdl0000000000000d', name: 'scrap-predictor', task: 'Classification', version: 'v1', assets: 'IM-01, IM-02', precision: 64, status: 'retired' },
      ]),
      columns: [col.title('name', 'Model'), col.text('task', 'Task'), col.id('version', 'Version'), col.muted('assets', 'Assets'), col.pct('precision', 'Precision'), col.status('status')],
      actions: [{ label: 'Promote to live', icon: BadgeCheck, operation: 'model_assignment_update', when: is('status', 'shadow'), apply: () => ({ status: 'live' }), done: 'Model promoted', confirm: 'Findings from this model will reach people.' }],
    },
  ],
};

export const datasets: Screen = {
  id: 'datasets',
  title: 'Datasets and labels',
  about: 'Training data with its lineage and the labelling work that turns findings into ground truth.',
  icon: Database,
  keywords: 'datasets labels labelling training data lineage benchmark',
  spec: 'ML-DATA · ML-LABEL',
  views: [
    {
      id: 'datasets',
      title: 'Datasets',
      resource: res('dataset', '/v1/datasets', 'ML-DATA', 'dataset_list', [
        { id: 'dst_01m71xxdst0000000000000a', name: 'KM 500 spindle vibration 2023–2026', rows_m: 412, signals: 6, labels: 38, consent: 'Tenant only' },
        { id: 'dst_01m71xxdst0000000000000b', name: 'Plant energy 15 min', rows_m: 3.1, signals: 24, labels: 0, consent: 'Tenant only' },
      ]),
      columns: [col.title('name', 'Dataset'), col.num('rows_m', 'Rows', 'M'), col.num('signals', 'Signals'), col.num('labels', 'Labels'), col.muted('consent', 'Sharing')],
    },
    {
      id: 'labels',
      title: 'Label sets',
      statusKey: 'status',
      resource: res('label_set', '/v1/label-sets', 'ML-LABEL', 'label_set_list', [
        { id: 'lbs_01m71xxlbs0000000000000a', name: 'Bearing failure events', labelled: 38, todo: 6, reviewers: 'Miriam Huber, Jonas Weber', status: 'in_progress' },
        { id: 'lbs_01m71xxlbs0000000000000b', name: 'Scrap images IM-02', labelled: 1200, todo: 0, reviewers: 'Aylin Demir', status: 'completed' },
      ]),
      columns: [col.title('name', 'Label set'), col.num('labelled', 'Labelled'), col.num('todo', 'To do'), col.muted('reviewers', 'Reviewers'), col.status('status')],
    },
  ],
};

export const vision: Screen = {
  id: 'vision',
  title: 'Vision',
  about: 'Camera inspection tasks, their results and the images a person still has to review.',
  icon: Tags,
  keywords: 'vision camera inspection images defect detection review',
  spec: 'ML-VISION',
  views: [
    {
      id: 'tasks',
      title: 'Inspection tasks',
      statusKey: 'status',
      resource: res('vision_task', '/v1/vision-tasks', 'ML-VISION', 'vision_task_list', [
        { id: 'vst_01m71xxvst0000000000000a', name: 'Short shot detection', camera: 'IM-02 cam 1', images_today: 3840, defects: 41, to_review: 7, status: 'active' },
        { id: 'vst_01m71xxvst0000000000000b', name: 'Burr check housing 4471', camera: 'Line 2 exit', images_today: 410, defects: 3, to_review: 1, status: 'active' },
      ]),
      columns: [col.title('name', 'Task'), col.text('camera', 'Camera'), col.num('images_today', 'Images today'), col.num('defects', 'Defects'), col.num('to_review', 'To review'), col.status('status')],
    },
  ],
};

export const AI = [agentRuns, review, evaluations, guardrails, prompts, aiUsage, aiGovernance];
export const MODELS = [models, datasets, vision];
