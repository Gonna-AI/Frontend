import type {
  CustomerCluster,
  CustomerGraphAlert,
  CustomerGraphModel,
} from '../types/customerGraph';

interface ClusterAlertSnapshot {
  signature: string;
  clusterId: string;
  label: string;
  riskScore: number;
  opportunityScore: number;
  memberCount: number;
}

interface GraphAlertSnapshot {
  capturedAt: string;
  clusters: ClusterAlertSnapshot[];
}

interface GraphAlertOptions {
  riskSpikeThreshold?: number;
  highOpportunityThreshold?: number;
  maxAlerts?: number;
}

const ALERT_SNAPSHOT_STORAGE_KEY = 'clerktree_customer_graph_alert_snapshot_v1';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function clusterSignature(cluster: CustomerCluster): string {
  const members = [...cluster.memberIds].sort().join('|');
  return `${members}::${cluster.memberCount}`;
}

function toSnapshotCluster(cluster: CustomerCluster): ClusterAlertSnapshot {
  return {
    signature: clusterSignature(cluster),
    clusterId: cluster.id,
    label: cluster.label,
    riskScore: clamp(cluster.riskScore, 0, 1),
    opportunityScore: clamp(cluster.opportunityScore, 0, 1),
    memberCount: cluster.memberCount,
  };
}

export function buildGraphAlertSnapshot(model: CustomerGraphModel): GraphAlertSnapshot {
  return {
    capturedAt: model.generatedAt,
    clusters: model.clusters.map(toSnapshotCluster),
  };
}

function loadSnapshot(): GraphAlertSnapshot | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(ALERT_SNAPSHOT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GraphAlertSnapshot;
    if (!parsed || !Array.isArray(parsed.clusters)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveSnapshot(snapshot: GraphAlertSnapshot): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(ALERT_SNAPSHOT_STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // Ignore storage failures.
  }
}

export function clearRealtimeGraphAlertSnapshot(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(ALERT_SNAPSHOT_STORAGE_KEY);
  } catch {
    // Ignore storage failures.
  }
}

export function detectRealtimeGraphAlerts(
  currentModel: CustomerGraphModel,
  previousSnapshot: GraphAlertSnapshot | null,
  options: GraphAlertOptions = {},
): CustomerGraphAlert[] {
  if (!previousSnapshot) return [];

  const riskSpikeThreshold = options.riskSpikeThreshold ?? 0.18;
  const highOpportunityThreshold = options.highOpportunityThreshold ?? 0.7;
  const maxAlerts = options.maxAlerts ?? 5;
  const generatedAt = currentModel.generatedAt;

  const previousBySignature = new Map(previousSnapshot.clusters.map((cluster) => [cluster.signature, cluster]));
  const alerts: CustomerGraphAlert[] = [];

  for (const cluster of currentModel.clusters) {
    const signature = clusterSignature(cluster);
    const previous = previousBySignature.get(signature);

    if (previous) {
      const riskDelta = clamp(cluster.riskScore, 0, 1) - previous.riskScore;
      if (riskDelta >= riskSpikeThreshold) {
        alerts.push({
          id: `risk-spike:${cluster.id}:${generatedAt}`,
          type: 'risk_spike',
          severity: cluster.riskScore >= 0.75 ? 'critical' : 'warning',
          clusterId: cluster.id,
          clusterLabel: cluster.label,
          generatedAt,
          delta: riskDelta,
          currentValue: clamp(cluster.riskScore, 0, 1),
          previousValue: previous.riskScore,
        });
      }
    }

    const crossedOpportunityThreshold = previous
      ? previous.opportunityScore < highOpportunityThreshold && cluster.opportunityScore >= highOpportunityThreshold
      : cluster.opportunityScore >= highOpportunityThreshold;

    if (crossedOpportunityThreshold && cluster.memberCount >= 2) {
      alerts.push({
        id: `new-opportunity:${cluster.id}:${generatedAt}`,
        type: 'new_high_opportunity_segment',
        severity: 'positive',
        clusterId: cluster.id,
        clusterLabel: cluster.label,
        generatedAt,
        delta: Math.max(0, clamp(cluster.opportunityScore, 0, 1) - (previous?.opportunityScore ?? 0)),
        currentValue: clamp(cluster.opportunityScore, 0, 1),
        previousValue: previous?.opportunityScore ?? 0,
      });
    }
  }

  return alerts
    .sort((a, b) => {
      const severityWeight = (severity: CustomerGraphAlert['severity']): number => {
        if (severity === 'critical') return 3;
        if (severity === 'warning') return 2;
        return 1;
      };
      const severityDelta = severityWeight(b.severity) - severityWeight(a.severity);
      if (severityDelta !== 0) return severityDelta;
      return b.delta - a.delta;
    })
    .slice(0, maxAlerts);
}

export function evaluateRealtimeGraphAlerts(
  currentModel: CustomerGraphModel,
  options: GraphAlertOptions = {},
): CustomerGraphAlert[] {
  const previous = loadSnapshot();
  const alerts = detectRealtimeGraphAlerts(currentModel, previous, options);
  saveSnapshot(buildGraphAlertSnapshot(currentModel));
  return alerts;
}
