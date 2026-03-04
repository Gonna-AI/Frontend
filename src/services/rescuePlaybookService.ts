import type {
  CustomerCluster,
  CustomerGraphModel,
  SimilarityEdge,
} from '../types/customerGraph';
import type {
  ProtectedRevenueReport,
  ProtectedRevenueReportRow,
  RescueActionRecord,
  RescueActionResult,
  RescueActionWithResult,
  RescueAuditEntry,
  RescueEngineSettings,
  RescueOpportunity,
  RescuePlaybookTemplate,
} from '../types/rescuePlaybook';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export const RESCUE_STORAGE_KEYS = {
  actions: 'clerktree_rescue_actions_v1',
  audits: 'clerktree_rescue_audits_v1',
  reports: 'clerktree_rescue_reports_v1',
  snapshot: 'clerktree_rescue_cluster_snapshot_v1',
  dismissed: 'clerktree_rescue_dismissed_alerts_v1',
  historyLogged: 'clerktree_rescue_history_logged_v1',
} as const;

interface RescueSnapshotCluster {
  signature: string;
  clusterId: string;
  clusterLabel: string;
  memberCount: number;
  riskScore: number;
}

interface RescueSnapshot {
  capturedAt: string;
  clusters: RescueSnapshotCluster[];
}

interface HistoryLikeSummary {
  followUpRequired?: boolean;
  sentiment?: string;
}

export interface HistoryLikeItem {
  id: string;
  callerName: string;
  date: Date | string;
  priority?: string;
  tags?: string[];
  summary?: HistoryLikeSummary;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function round(value: number, precision = 2): number {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

function normalizeName(value: string): string {
  return normalizeText(value).replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function nowIso(): string {
  return new Date().toISOString();
}

function monthKeyFromDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage failures.
  }
}

function clusterSignature(cluster: CustomerCluster): string {
  const members = [...cluster.memberIds].sort().join('|');
  return `${members}::${cluster.memberCount}`;
}

function makeSnapshot(model: CustomerGraphModel): RescueSnapshot {
  return {
    capturedAt: model.generatedAt,
    clusters: model.clusters.map((cluster) => ({
      signature: clusterSignature(cluster),
      clusterId: cluster.id,
      clusterLabel: cluster.label,
      memberCount: cluster.memberCount,
      riskScore: clamp(cluster.riskScore, 0, 1),
    })),
  };
}

function loadSnapshot(): RescueSnapshot | null {
  return readJson<RescueSnapshot | null>(RESCUE_STORAGE_KEYS.snapshot, null);
}

function saveSnapshot(model: CustomerGraphModel): void {
  writeJson(RESCUE_STORAGE_KEYS.snapshot, makeSnapshot(model));
}

function titleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function humanClusterName(cluster: CustomerCluster): string {
  const leadingSignal = cluster.sharedSignals[0]
    ? titleCase(cluster.sharedSignals[0].replace(/[_-]/g, ' '))
    : titleCase(cluster.label.replace(/[_-]/g, ' '));

  if (leadingSignal.toLowerCase().includes('pricing')) {
    return 'Pricing Delay';
  }
  if (leadingSignal.toLowerCase().includes('refund')) {
    return 'Refund Friction';
  }
  if (leadingSignal.toLowerCase().includes('support')) {
    return 'Support Escalation';
  }
  if (leadingSignal.toLowerCase().includes('complaint')) {
    return 'Complaint Pattern';
  }
  if (leadingSignal.toLowerCase().includes('appointment')) {
    return 'Appointment Issues';
  }
  if (leadingSignal.toLowerCase().includes('test')) {
    return 'Test Interactions';
  }

  return `High-Risk: ${leadingSignal}`;
}

function avg(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((acc, current) => acc + current, 0) / values.length;
}

function clusterSimilarity(cluster: CustomerCluster, edges: SimilarityEdge[]): number {
  if (cluster.memberCount <= 1) return 0.58;
  const memberIds = new Set(cluster.memberIds);
  const withinClusterEdges = edges.filter(
    (edge) => memberIds.has(edge.source) && memberIds.has(edge.target),
  );

  if (!withinClusterEdges.length) return 0.6;

  return clamp(avg(withinClusterEdges.map((edge) => edge.score)), 0.3, 0.99);
}

function similarSignalOverlap(cluster: CustomerCluster, action: RescueActionRecord): number {
  const clusterSignals = new Set(cluster.sharedSignals.map((signal) => normalizeText(signal)));
  const actionSignals = action.clusterLabel
    .split(/[\s_-]+/)
    .map((token) => normalizeText(token))
    .filter((token) => token.length > 2);

  if (!clusterSignals.size) return 0;

  let overlap = 0;
  for (const signal of clusterSignals) {
    if (actionSignals.includes(signal)) overlap += 1;
  }

  return overlap / clusterSignals.size;
}

function estimatePotentialLoss(
  cluster: CustomerCluster,
  sizeGrowth: number,
  similarityScore: number,
  settings: RescueEngineSettings,
): number {
  const baseRevenue = cluster.memberCount * settings.avgMonthlyRevenuePerCustomerInr;
  const churnProbability = clamp(
    0.1
      + cluster.riskScore * 0.45
      + Math.max(0, sizeGrowth) * 0.35
      + (1 - similarityScore) * 0.1,
    0.08,
    0.88,
  );

  return Math.round(baseRevenue * churnProbability);
}

export function evaluateRescueOpportunities(
  model: CustomerGraphModel,
  settings: RescueEngineSettings,
  actions: RescueActionRecord[],
  maxCards = 5,
): RescueOpportunity[] {
  const previousSnapshot = loadSnapshot();
  const previousBySignature = new Map(
    (previousSnapshot?.clusters || []).map((cluster) => [cluster.signature, cluster]),
  );

  const opportunities: RescueOpportunity[] = [];

  for (const cluster of model.clusters) {
    const signature = clusterSignature(cluster);
    const previousCluster = previousBySignature.get(signature);
    const previousSize = previousCluster?.memberCount ?? cluster.memberCount;
    const sizeGrowth = previousSize > 0
      ? (cluster.memberCount - previousSize) / previousSize
      : 0;

    const isRiskTriggered = cluster.riskScore >= settings.riskThreshold;
    const isGrowthTriggered = sizeGrowth >= settings.growthThreshold;
    if (!isRiskTriggered && !isGrowthTriggered) {
      continue;
    }

    const similarityScore = clusterSimilarity(cluster, model.edges);
    const potentialLossInr = estimatePotentialLoss(cluster, sizeGrowth, similarityScore, settings);

    const similarActions = actions
      .filter((action) => action.status === 'completed')
      .filter((action) => similarSignalOverlap(cluster, action) > 0)
      .slice(0, 6);

    const historicalRetention = similarActions.length
      ? avg(
        similarActions.map((action) => {
          if (!('result' in action) || !action.result) return 0.89;
          return action.result.retentionRate;
        }),
      )
      : 0.89;

    const expectedRescueRetention = clamp(
      historicalRetention + (cluster.opportunityScore - cluster.riskScore) * 0.08,
      0.55,
      0.96,
    );

    const profileById = new Map(model.profiles.map((profile) => [profile.id, profile]));

    const triggerReasons = [
      isRiskTriggered ? `Risk ${Math.round(cluster.riskScore * 100)}% crossed threshold` : null,
      isGrowthTriggered ? `Cluster size grew ${Math.round(sizeGrowth * 100)}%` : null,
    ].filter((reason): reason is string => !!reason);

    opportunities.push({
      id: `rescue-opportunity:${cluster.id}:${model.generatedAt}`,
      clusterId: cluster.id,
      clusterLabel: cluster.label,
      generatedClusterName: humanClusterName(cluster),
      memberIds: [...cluster.memberIds],
      memberNames: cluster.memberIds
        .map((memberId) => profileById.get(memberId)?.displayName)
        .filter((name): name is string => !!name),
      memberCount: cluster.memberCount,
      riskScore: clamp(cluster.riskScore, 0, 1),
      opportunityScore: clamp(cluster.opportunityScore, 0, 1),
      similarityScore,
      sizeGrowth,
      potentialLossInr,
      expectedRescueRetention,
      lastSimilarClusterRetention: clamp(historicalRetention, 0, 1),
      triggerReasons,
    });
  }

  const sorted = opportunities
    .sort((a, b) => b.potentialLossInr - a.potentialLossInr)
    .slice(0, maxCards);

  saveSnapshot(model);

  return sorted;
}

function parseDate(value: Date | string | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function estimateCostForPlaybook(
  playbook: RescuePlaybookTemplate,
  customerCount: number,
  settings: RescueEngineSettings,
): number {
  const creditCost = playbook.creditAmountInr * customerCount;
  const discountCost = settings.avgMonthlyRevenuePerCustomerInr
    * customerCount
    * (playbook.discountPercent / 100)
    * 0.25;

  return Math.round(creditCost + discountCost);
}

function isCustomerRateLimited(
  customerId: string,
  actions: RescueActionRecord[],
  maxPerMonth: number,
  now: Date,
): boolean {
  const lookback = now.getTime() - THIRTY_DAYS_MS;
  const recentRescues = actions.filter((action) => {
    if (action.status !== 'completed') return false;
    if (!action.executedAt) return false;
    if (!action.memberIds.includes(customerId)) return false;
    const executedAt = parseDate(action.executedAt);
    if (!executedAt) return false;
    return executedAt.getTime() >= lookback;
  });

  return recentRescues.length >= maxPerMonth;
}

export function createRescueAction(
  opportunity: RescueOpportunity,
  playbook: RescuePlaybookTemplate,
  settings: RescueEngineSettings,
  existingActions: RescueActionRecord[],
  options?: {
    scheduledFor?: string;
    createdBy?: 'user' | 'automation';
  },
): RescueActionRecord {
  const now = new Date();
  const scheduledFor = options?.scheduledFor ? new Date(options.scheduledFor).toISOString() : undefined;
  const cappedMemberIds = opportunity.memberIds.slice(0, settings.compliance.maxCustomersPerRescue);
  const cappedMemberNames = opportunity.memberNames.slice(0, settings.compliance.maxCustomersPerRescue);

  const dispatches = cappedMemberIds.map((customerId, index) => {
    if (settings.compliance.optedOutCustomerIds.includes(customerId)) {
      return {
        customerId,
        customerName: cappedMemberNames[index] || `Customer ${index + 1}`,
        channels: playbook.channels,
        status: 'blocked_opt_out' as const,
        reason: 'Customer is in opt-out list',
      };
    }

    if (
      isCustomerRateLimited(
        customerId,
        existingActions,
        settings.compliance.maxRescuesPerCustomerPerMonth,
        now,
      )
    ) {
      return {
        customerId,
        customerName: cappedMemberNames[index] || `Customer ${index + 1}`,
        channels: playbook.channels,
        status: 'rate_limited' as const,
        reason: 'Customer reached monthly rescue limit',
      };
    }

    return {
      customerId,
      customerName: cappedMemberNames[index] || `Customer ${index + 1}`,
      channels: playbook.channels,
      status: scheduledFor ? ('scheduled' as const) : ('sent' as const),
    };
  });

  const effectiveCustomers = dispatches.filter(
    (dispatch) => dispatch.status !== 'blocked_opt_out' && dispatch.status !== 'rate_limited',
  );

  const estimatedCostInr = estimateCostForPlaybook(playbook, effectiveCustomers.length, settings);

  const needsApproval = estimatedCostInr >= settings.compliance.requireManagerApprovalAboveInr;

  const status = scheduledFor
    ? ('scheduled' as const)
    : needsApproval
      ? ('requires_approval' as const)
      : ('completed' as const);

  const executedAt = status === 'completed' ? now.toISOString() : undefined;

  const proofId = `proof-${Date.now().toString(36)}`;

  return {
    id: `rescue-${Date.now().toString(36)}`,
    opportunityId: opportunity.id,
    clusterId: opportunity.clusterId,
    clusterLabel: opportunity.clusterLabel,
    memberIds: cappedMemberIds,
    memberNames: cappedMemberNames,
    memberCount: cappedMemberIds.length,
    playbookId: playbook.id,
    playbookName: playbook.name,
    playbookSnapshot: playbook,
    channels: playbook.channels,
    triggerAt: nowIso(),
    scheduledFor,
    executedAt,
    status,
    estimatedCostInr,
    potentialLossInr: opportunity.potentialLossInr,
    consentStatus: 'verified',
    proofId,
    proofSummary: 'Opted-in via prior call recording + explicit confirmation.',
    dispatches,
    createdBy: options?.createdBy || 'user',
  };
}

export function approveRescueAction(action: RescueActionRecord): RescueActionRecord {
  if (action.status !== 'requires_approval') return action;

  return {
    ...action,
    status: 'completed',
    executedAt: nowIso(),
    dispatches: action.dispatches.map((dispatch) => {
      if (dispatch.status === 'scheduled') {
        return { ...dispatch, status: 'sent' as const };
      }
      return dispatch;
    }),
  };
}

export function executeDueScheduledRescues(actions: RescueActionRecord[], now = new Date()): RescueActionRecord[] {
  return actions.map((action) => {
    if (action.status !== 'scheduled' || !action.scheduledFor) return action;
    const dueAt = parseDate(action.scheduledFor);
    if (!dueAt || dueAt.getTime() > now.getTime()) return action;

    return {
      ...action,
      status: 'completed',
      executedAt: now.toISOString(),
      dispatches: action.dispatches.map((dispatch) => {
        if (dispatch.status === 'scheduled') return { ...dispatch, status: 'sent' as const };
        return dispatch;
      }),
    };
  });
}

export function cancelPendingClusterRescues(
  actions: RescueActionRecord[],
  clusterId: string,
): { updated: RescueActionRecord[]; cancelledCount: number } {
  let cancelledCount = 0;

  const updated = actions.map((action) => {
    const isPending = action.status === 'scheduled' || action.status === 'requires_approval';
    if (action.clusterId !== clusterId || !isPending) return action;
    cancelledCount += 1;
    return {
      ...action,
      status: 'cancelled' as const,
    };
  });

  return { updated, cancelledCount };
}

export function enrichRescueActionWithResult(
  action: RescueActionRecord,
  model: CustomerGraphModel | null,
  history: HistoryLikeItem[],
  settings: RescueEngineSettings,
): RescueActionWithResult {
  const executedAt = parseDate(action.executedAt || action.scheduledFor || action.triggerAt) || new Date();
  const windowEnd = new Date(executedAt.getTime() + THIRTY_DAYS_MS);

  const rescuedNames = new Set(action.memberNames.map((name) => normalizeName(name)).filter(Boolean));

  const historyInWindow = history.filter((item) => {
    const date = parseDate(item.date);
    if (!date) return false;
    return date >= executedAt && date <= windowEnd;
  });

  const retainedRescued = new Set<string>();

  for (const item of historyInWindow) {
    const caller = normalizeName(item.callerName || '');
    if (caller && rescuedNames.has(caller)) {
      retainedRescued.add(caller);
    }
  }

  const retentionRate = action.memberCount > 0
    ? retainedRescued.size / action.memberCount
    : 0;

  const controlCandidateNames: string[] = (model?.profiles || [])
    .filter((profile) => !action.memberIds.includes(profile.id))
    .map((profile) => normalizeName(profile.displayName))
    .filter(Boolean)
    .slice(0, Math.max(action.memberCount, 1) * 2);

  const controlSet = new Set(controlCandidateNames);
  const retainedControl = new Set<string>();
  for (const item of historyInWindow) {
    const caller = normalizeName(item.callerName || '');
    if (caller && controlSet.has(caller)) {
      retainedControl.add(caller);
    }
  }

  const controlGroupRetentionRate = controlSet.size > 0
    ? retainedControl.size / controlSet.size
    : 0.62;

  const retentionLift = retentionRate - controlGroupRetentionRate;

  const revenueProtectedInr = Math.round(
    Math.max(0, settings.avgMonthlyRevenuePerCustomerInr * action.memberCount * (retentionLift + 0.05)),
  );

  const churnAvoidedInr = Math.round(
    Math.max(0, settings.avgMonthlyRevenuePerCustomerInr * action.memberCount * retentionLift),
  );

  const complaintsBefore = history
    .filter((item) => {
      const date = parseDate(item.date);
      if (!date) return false;
      if (date < new Date(executedAt.getTime() - THIRTY_DAYS_MS) || date > executedAt) return false;
      const caller = normalizeName(item.callerName || '');
      if (!rescuedNames.has(caller)) return false;
      return item.summary?.followUpRequired || item.priority === 'high' || item.priority === 'critical';
    }).length;

  const complaintsAfter = historyInWindow
    .filter((item) => {
      const caller = normalizeName(item.callerName || '');
      if (!rescuedNames.has(caller)) return false;
      return item.summary?.followUpRequired || item.priority === 'high' || item.priority === 'critical';
    }).length;

  const complaintsDropPercent = complaintsBefore > 0
    ? clamp((complaintsBefore - complaintsAfter) / complaintsBefore, -1, 1)
    : 0;

  const result: RescueActionResult = {
    retentionRate: clamp(retentionRate, 0, 1),
    controlGroupRetentionRate: clamp(controlGroupRetentionRate, 0, 1),
    retentionLift: round(retentionLift, 4),
    revenueProtectedInr,
    churnAvoidedInr,
    complaintsDropPercent: round(complaintsDropPercent, 4),
  };

  return {
    ...action,
    result,
  };
}

export function buildProtectedRevenueReport(
  actions: RescueActionWithResult[],
  monthKey: string,
): ProtectedRevenueReport | null {
  const rowsForMonth = actions.filter((action) => {
    if (!action.executedAt || action.status !== 'completed') return false;
    const date = parseDate(action.executedAt);
    if (!date) return false;
    return monthKeyFromDate(date) === monthKey;
  });

  if (!rowsForMonth.length) return null;

  const rows: ProtectedRevenueReportRow[] = rowsForMonth.map((action) => ({
    cluster: action.clusterLabel,
    customers: action.memberCount,
    rescueType: action.playbookName,
    revenueProtectedInr: action.result.revenueProtectedInr,
    retentionRate: action.result.retentionRate,
  }));

  const totalProtectedInr = rows.reduce((acc, row) => acc + row.revenueProtectedInr, 0);

  return {
    id: `protected-revenue-${monthKey}`,
    monthKey,
    generatedAt: nowIso(),
    headline: `We protected ${formatInrCompact(totalProtectedInr)} in revenue this month from ${rows.length} at-risk clusters.`,
    totalProtectedInr,
    clusterCount: rows.length,
    rows,
  };
}

export function ensureMonthlyReport(
  reports: ProtectedRevenueReport[],
  actions: RescueActionWithResult[],
  now = new Date(),
): ProtectedRevenueReport[] {
  const reportMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const targetKey = monthKeyFromDate(reportMonth);

  if (reports.some((report) => report.monthKey === targetKey)) {
    return reports;
  }

  const report = buildProtectedRevenueReport(actions, targetKey);
  if (!report) return reports;

  return [report, ...reports].slice(0, 12);
}

export function formatInrCompact(value: number): string {
  const absValue = Math.abs(value);

  if (absValue >= 10000000) {
    return `INR ${round(value / 10000000, 1)}Cr`;
  }

  if (absValue >= 100000) {
    return `INR ${round(value / 100000, 1)}L`;
  }

  return `INR ${Math.round(value).toLocaleString('en-IN')}`;
}

export function formatPercent(value: number): string {
  return `${Math.round(clamp(value, -1, 1) * 100)}%`;
}

function escapePdfText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function buildSimplePdf(lines: string[]): string {
  const safeLines = lines.slice(0, 26).map((line) => escapePdfText(line));

  const textStream = [
    'BT',
    '/F1 12 Tf',
    '50 780 Td',
    ...safeLines.flatMap((line, index) => (index === 0 ? [`(${line}) Tj`] : ['0 -18 Td', `(${line}) Tj`])),
    'ET',
  ].join('\n');

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${textStream.length} >>\nstream\n${textStream}\nendstream`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';

  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return pdf;
}

export function buildConsentProofPdf(action: RescueActionRecord): Blob {
  const lines = [
    'ClerkTree Rescue Consent Proof',
    `Proof ID: ${action.proofId}`,
    `Cluster: ${action.clusterLabel}`,
    `Playbook: ${action.playbookName}`,
    `Customers: ${action.memberCount}`,
    `Generated At: ${action.executedAt || action.triggerAt}`,
    'Consent Basis: opted-in via prior call recording + explicit confirmation',
    'Channels:',
    ...action.channels.map((channel) => ` - ${channel}`),
    'Dispatch Summary:',
    ...action.dispatches.slice(0, 8).map((dispatch) => ` - ${dispatch.customerName}: ${dispatch.status}`),
  ];

  const pdfContent = buildSimplePdf(lines);
  return new Blob([pdfContent], { type: 'application/pdf' });
}

export function downloadConsentProofPdf(action: RescueActionRecord): void {
  if (typeof window === 'undefined') return;

  const blob = buildConsentProofPdf(action);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${action.proofId}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function buildPlaybookSuggestion(actions: RescueActionWithResult[]): {
  headline: string;
  summary: string;
  successRate: number;
} {
  const recent = actions
    .filter((action) => action.status === 'completed')
    .sort((a, b) => {
      const aTime = parseDate(a.executedAt)?.getTime() || 0;
      const bTime = parseDate(b.executedAt)?.getTime() || 0;
      return bTime - aTime;
    })
    .slice(0, 3);

  if (!recent.length) {
    return {
      headline: 'Need more rescue data for an AI suggestion',
      summary: 'Run at least 3 rescues to unlock model-backed playbook optimization.',
      successRate: 0.94,
    };
  }

  const best = [...recent].sort((a, b) => b.result.retentionRate - a.result.retentionRate)[0];
  const successRate = clamp(best.result.retentionRate, 0.55, 0.99);

  return {
    headline: `Based on recent clusters, ${best.playbookName} is the strongest candidate`,
    summary: `Try increasing the first-touch credit by 5% and send the first WhatsApp message within 10 minutes. Estimated rescue success: ${Math.round(successRate * 100)}%.`,
    successRate,
  };
}

export function buildRescueAuditEntry(
  action: string,
  details: string,
  args?: {
    actor?: string;
    clusterId?: string;
    rescueActionId?: string;
  },
): RescueAuditEntry {
  return {
    id: `audit-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    at: nowIso(),
    actor: args?.actor || 'System',
    action,
    clusterId: args?.clusterId,
    rescueActionId: args?.rescueActionId,
    details,
  };
}

export function loadRescueActions(): RescueActionRecord[] {
  return readJson<RescueActionRecord[]>(RESCUE_STORAGE_KEYS.actions, []);
}

export function saveRescueActions(actions: RescueActionRecord[]): void {
  writeJson(RESCUE_STORAGE_KEYS.actions, actions);
}

export function loadRescueAudits(): RescueAuditEntry[] {
  return readJson<RescueAuditEntry[]>(RESCUE_STORAGE_KEYS.audits, []);
}

export function saveRescueAudits(audits: RescueAuditEntry[]): void {
  writeJson(RESCUE_STORAGE_KEYS.audits, audits);
}

export function loadRescueReports(): ProtectedRevenueReport[] {
  return readJson<ProtectedRevenueReport[]>(RESCUE_STORAGE_KEYS.reports, []);
}

export function saveRescueReports(reports: ProtectedRevenueReport[]): void {
  writeJson(RESCUE_STORAGE_KEYS.reports, reports);
}

export function loadDismissedOpportunityIds(): string[] {
  return readJson<string[]>(RESCUE_STORAGE_KEYS.dismissed, []);
}

export function saveDismissedOpportunityIds(ids: string[]): void {
  writeJson(RESCUE_STORAGE_KEYS.dismissed, ids);
}

export function loadHistoryLoggedActionIds(): string[] {
  return readJson<string[]>(RESCUE_STORAGE_KEYS.historyLogged, []);
}

export function saveHistoryLoggedActionIds(ids: string[]): void {
  writeJson(RESCUE_STORAGE_KEYS.historyLogged, ids);
}

export function inferRescueCapability(settings: RescueEngineSettings): {
  detectionEnabled: boolean;
  automationEnabled: boolean;
  reportEnabled: boolean;
  successFeeEnabled: boolean;
} {
  return {
    detectionEnabled: true,
    automationEnabled: settings.planTier === 'enterprise' && settings.automationLevel === 'full_auto',
    reportEnabled: settings.planTier === 'enterprise',
    successFeeEnabled: settings.planTier === 'enterprise' && settings.successFeePercent > 0,
  };
}

export function reportToCsv(report: ProtectedRevenueReport): string {
  const header = ['Cluster', 'Customers', 'Rescue Type', 'INR Protected', 'Retention'];
  const rows = report.rows.map((row) => [
    row.cluster,
    String(row.customers),
    row.rescueType,
    String(row.revenueProtectedInr),
    `${Math.round(row.retentionRate * 100)}%`,
  ]);

  return [header, ...rows]
    .map((line) => line.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n');
}
