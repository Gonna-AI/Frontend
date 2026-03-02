import { useCallback, useEffect, useMemo, useRef, useState, type ComponentType, type ReactNode } from 'react';
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  Brain,
  Loader2,
  LocateFixed,
  Network,
  RefreshCcw,
  Repeat2,
  ShieldAlert,
  Sparkles,
  UserRound,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from 'd3-force';
import { cn } from '../../utils/cn';
import { useLanguage } from '../../contexts/LanguageContext';
import { useDemoCall } from '../../contexts/DemoCallContext';
import { evaluateRealtimeGraphAlerts } from '../../services/customerGraphAlertService';
import { buildGraphModel } from '../../services/customerGraphService';
import type {
  ClusterCopilotAction,
  CustomerGraphAlert,
  CustomerCluster,
  CustomerGraphFilters,
  CustomerGraphModel,
  CustomerProfile,
  SimilarityEdge,
} from '../../types/customerGraph';

interface CustomerGraphViewProps {
  isDark?: boolean;
}

interface VisualNode extends SimulationNodeDatum {
  id: string;
  profile: CustomerProfile;
  label: string;
  size: number;
  color: string;
}

interface VisualLink extends SimulationLinkDatum<VisualNode> {
  id: string;
  source: string | VisualNode;
  target: string | VisualNode;
  score: number;
  evidence: string[];
}

interface ClusterOutline {
  id: string;
  label: string;
  color: string;
  x: number;
  y: number;
  radius: number;
  memberCount: number;
}

const CLUSTER_COLORS = [
  '#22d3ee',
  '#60a5fa',
  '#a78bfa',
  '#f472b6',
  '#f59e0b',
  '#34d399',
  '#f97316',
  '#fb7185',
  '#10b981',
  '#c084fc',
];

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const GRAPH_WIDTH = 1240;
const GRAPH_HEIGHT = 660;

const RANGE_OPTIONS = ['7d', '30d', '90d', 'all'] as const;
const TYPE_OPTIONS = ['all', 'voice', 'text'] as const;

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function formatDate(value: Date): string {
  return value.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function safeNode(endpoint: string | VisualNode): VisualNode | null {
  return typeof endpoint === 'string' ? null : endpoint;
}

function clampScale(scale: number): number {
  if (Number.isNaN(scale)) return 1;
  if (scale < 0.25) return 0.25;
  if (scale > 2.6) return 2.6;
  return scale;
}

function formatLift(value: number): string {
  return `+${Math.round(value * 100)}%`;
}

function formatSignedPercent(value: number): string {
  const rounded = Math.round(value * 100);
  if (rounded === 0) return '0%';
  return `${rounded > 0 ? '+' : ''}${rounded}%`;
}

export default function CustomerGraphView({ isDark = true }: CustomerGraphViewProps) {
  const { t } = useLanguage();
  const { callHistory } = useDemoCall();

  const [dateRangePreset, setDateRangePreset] = useState<(typeof RANGE_OPTIONS)[number]>('30d');
  const [interactionType, setInteractionType] = useState<(typeof TYPE_OPTIONS)[number]>('all');
  const [minSimilarity, setMinSimilarity] = useState(0.58);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [aiInsightsLoading, setAiInsightsLoading] = useState(false);
  const [aiInsightsProgress, setAiInsightsProgress] = useState({ completed: 0, total: 0 });
  const [aiInsightsError, setAiInsightsError] = useState<string | null>(null);
  const [aiInsightsGeneratedAt, setAiInsightsGeneratedAt] = useState<string | null>(null);
  const [realtimeAlerts, setRealtimeAlerts] = useState<CustomerGraphAlert[]>([]);

  const [model, setModel] = useState<CustomerGraphModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null);
  const [hoveredProfileId, setHoveredProfileId] = useState<string | null>(null);

  const [renderedNodes, setRenderedNodes] = useState<VisualNode[]>([]);
  const [renderedLinks, setRenderedLinks] = useState<VisualLink[]>([]);

  const [viewScale, setViewScale] = useState(1);
  const [viewX, setViewX] = useState(0);
  const [viewY, setViewY] = useState(0);

  const panState = useRef<{ panning: boolean; lastX: number; lastY: number }>({
    panning: false,
    lastX: 0,
    lastY: 0,
  });
  const autoFitKeyRef = useRef<string>('');

  const startDate = useMemo(() => {
    if (dateRangePreset === 'all') return null;
    const days = dateRangePreset === '7d' ? 7 : dateRangePreset === '30d' ? 30 : 90;
    return new Date(Date.now() - days * DAY_IN_MS);
  }, [dateRangePreset]);

  const filters: CustomerGraphFilters = useMemo(
    () => ({
      startDate,
      endDate: null,
      interactionType,
      minSimilarity,
      anonymize: false,
    }),
    [interactionType, minSimilarity, startDate],
  );

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const graphModel = await buildGraphModel(callHistory, filters, {
          semanticEnabled: true,
          minScore: minSimilarity,
          cacheMode: refreshNonce > 0 ? 'refresh' : 'default',
          maxNeighbors: 4,
          semanticTimeoutMs: 3500,
          cacheTtlMs: 4 * 60 * 1000,
        });

        if (!isMounted) return;
        setModel(graphModel);
      } catch (loadError: unknown) {
        if (!isMounted) return;
        const message = loadError instanceof Error
          ? loadError.message
          : 'Unable to build customer graph. Please try again.';
        setError(message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    run();

    return () => {
      isMounted = false;
    };
  }, [callHistory, filters, minSimilarity, refreshNonce]);

  useEffect(() => {
    if (!model) return;

    if (!model.profiles.find((profile) => profile.id === selectedProfileId)) {
      setSelectedProfileId(model.profiles[0]?.id || null);
    }

    if (selectedClusterId && !model.clusters.find((cluster) => cluster.id === selectedClusterId)) {
      setSelectedClusterId(null);
    }
  }, [model, selectedClusterId, selectedProfileId]);

  useEffect(() => {
    if (!model) {
      setRealtimeAlerts([]);
      return;
    }

    const alerts = evaluateRealtimeGraphAlerts(model, {
      riskSpikeThreshold: 0.18,
      highOpportunityThreshold: 0.7,
      maxAlerts: 4,
    });

    setRealtimeAlerts(alerts);
  }, [model]);

  const profileById = useMemo(() => {
    if (!model) return new Map<string, CustomerProfile>();
    return new Map(model.profiles.map((profile) => [profile.id, profile]));
  }, [model]);

  const clusterByMember = useMemo(() => {
    const map = new Map<string, CustomerCluster>();
    if (!model) return map;
    for (const cluster of model.clusters) {
      for (const memberId of cluster.memberIds) {
        map.set(memberId, cluster);
      }
    }
    return map;
  }, [model]);

  const clusterIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    if (!model) return map;
    model.clusters.forEach((cluster, clusterIndex) => {
      for (const memberId of cluster.memberIds) {
        map.set(memberId, clusterIndex);
      }
    });
    return map;
  }, [model]);

  const getLabel = (profile: CustomerProfile): string => {
    return profile.displayName;
  };

  useEffect(() => {
    if (!model || !model.profiles.length) {
      setRenderedNodes([]);
      setRenderedLinks([]);
      return;
    }

    const nodes: VisualNode[] = model.profiles.map((profile) => {
      const clusterIndex = clusterIndexMap.get(profile.id) || 0;
      return {
        id: profile.id,
        profile,
        label: getLabel(profile),
        size: Math.max(9, Math.min(22, 8 + Math.log2(profile.interactionCount + 1) * 4.6)),
        color: CLUSTER_COLORS[clusterIndex % CLUSTER_COLORS.length],
        x: GRAPH_WIDTH / 2 + (Math.random() - 0.5) * 280,
        y: GRAPH_HEIGHT / 2 + (Math.random() - 0.5) * 220,
      };
    });

    const links: VisualLink[] = model.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      score: edge.score,
      evidence: edge.evidence,
    }));

    const simulation = forceSimulation<VisualNode>(nodes)
      .force('link', forceLink<VisualNode, VisualLink>(links).id((node) => node.id).distance((link) => 196 - link.score * 95).strength(0.18))
      .force('charge', forceManyBody().strength(-205))
      .force('center', forceCenter(GRAPH_WIDTH / 2, GRAPH_HEIGHT / 2))
      .force('collision', forceCollide<VisualNode>().radius((node) => node.size + 14))
      .alphaDecay(0.038)
      .velocityDecay(0.32);

    let rafId = 0;

    simulation.on('tick', () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        setRenderedNodes([...nodes]);
        setRenderedLinks([...links]);
        rafId = 0;
      });
    });

    return () => {
      simulation.stop();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [clusterIndexMap, model]);

  const selectedProfile = selectedProfileId ? profileById.get(selectedProfileId) || null : null;
  const selectedCluster = selectedClusterId
    ? model?.clusters.find((cluster) => cluster.id === selectedClusterId) || null
    : null;
  const selectedCopilot = selectedCluster?.copilot || null;

  const copilotActionMeta = useMemo<Record<ClusterCopilotAction, {
    label: string;
    icon: ComponentType<{ className?: string }>;
    activeClassName: string;
    subtleClassName: string;
  }>>(() => ({
    save_at_risk: {
      label: t('customerGraph.copilot.action.saveAtRisk'),
      icon: ShieldAlert,
      activeClassName: isDark
        ? 'border-rose-500/35 bg-rose-500/12 text-rose-300'
        : 'border-rose-200 bg-rose-50 text-rose-700',
      subtleClassName: isDark
        ? 'bg-rose-500/8 text-rose-300'
        : 'bg-rose-100 text-rose-700',
    },
    upsell: {
      label: t('customerGraph.copilot.action.upsell'),
      icon: ArrowUpRight,
      activeClassName: isDark
        ? 'border-emerald-500/35 bg-emerald-500/12 text-emerald-300'
        : 'border-emerald-200 bg-emerald-50 text-emerald-700',
      subtleClassName: isDark
        ? 'bg-emerald-500/8 text-emerald-300'
        : 'bg-emerald-100 text-emerald-700',
    },
    re_engage: {
      label: t('customerGraph.copilot.action.reengage'),
      icon: Repeat2,
      activeClassName: isDark
        ? 'border-cyan-500/35 bg-cyan-500/12 text-cyan-300'
        : 'border-cyan-200 bg-cyan-50 text-cyan-700',
      subtleClassName: isDark
        ? 'bg-cyan-500/8 text-cyan-300'
        : 'bg-cyan-100 text-cyan-700',
    },
    nurture: {
      label: t('customerGraph.copilot.action.nurture'),
      icon: Activity,
      activeClassName: isDark
        ? 'border-white/20 bg-white/10 text-white/85'
        : 'border-black/15 bg-black/5 text-black/75',
      subtleClassName: isDark
        ? 'bg-white/8 text-white/75'
        : 'bg-black/8 text-black/70',
    },
  }), [isDark, t]);

  const selectedProfileEdges: SimilarityEdge[] = useMemo(() => {
    if (!model || !selectedProfile) return [];
    return model.edges
      .filter((edge) => edge.source === selectedProfile.id || edge.target === selectedProfile.id)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [model, selectedProfile]);

  const selectedClusterMembers = useMemo(() => {
    if (!selectedCluster) return [];
    return selectedCluster.memberIds
      .map((id) => profileById.get(id))
      .filter((profile): profile is CustomerProfile => !!profile)
      .sort((a, b) => b.interactionCount - a.interactionCount);
  }, [profileById, selectedCluster]);
  const selectedCopilotMeta = selectedCopilot
    ? copilotActionMeta[selectedCopilot.primaryAction]
    : null;
  const selectedCopilotScoreRows = selectedCopilot
    ? (Object.entries(selectedCopilot.scoreCard) as Array<[ClusterCopilotAction, number]>)
      .sort((a, b) => b[1] - a[1])
    : [];
  const selectedClusterMemberIdSet = useMemo(() => {
    if (!selectedCluster) return new Set<string>();
    return new Set(selectedCluster.memberIds);
  }, [selectedCluster]);
  const hasSelectedCluster = selectedClusterMemberIdSet.size > 0;

  const focusedNodeId = hoveredProfileId || selectedProfileId;

  const focusedEdgeIds = useMemo(() => {
    const ids = new Set<string>();
    if (!focusedNodeId || !model) return ids;

    for (const edge of model.edges) {
      if (edge.source === focusedNodeId || edge.target === focusedNodeId) {
        ids.add(edge.id);
      }
    }

    return ids;
  }, [focusedNodeId, model]);
  const selectedClusterEdgeIds = useMemo(() => {
    const ids = new Set<string>();
    if (!model || !hasSelectedCluster) return ids;

    for (const edge of model.edges) {
      if (selectedClusterMemberIdSet.has(edge.source) && selectedClusterMemberIdSet.has(edge.target)) {
        ids.add(edge.id);
      }
    }

    return ids;
  }, [hasSelectedCluster, model, selectedClusterMemberIdSet]);
  const alertMeta = useMemo<Record<CustomerGraphAlert['type'], {
    title: string;
    icon: ComponentType<{ className?: string }>;
    chipClassName: string;
  }>>(() => ({
    risk_spike: {
      title: t('customerGraph.alerts.riskSpikeTitle'),
      icon: ShieldAlert,
      chipClassName: isDark
        ? 'border-rose-500/30 bg-rose-500/12 text-rose-300'
        : 'border-rose-200 bg-rose-50 text-rose-700',
    },
    new_high_opportunity_segment: {
      title: t('customerGraph.alerts.newOpportunityTitle'),
      icon: ArrowUpRight,
      chipClassName: isDark
        ? 'border-emerald-500/30 bg-emerald-500/12 text-emerald-300'
        : 'border-emerald-200 bg-emerald-50 text-emerald-700',
    },
  }), [isDark, t]);

  const getAlertBody = useCallback((alert: CustomerGraphAlert): string => {
    if (alert.type === 'risk_spike') {
      return `${t('customerGraph.alerts.riskSpikeBody')} ${formatPercent(alert.previousValue)} → ${formatPercent(alert.currentValue)} (${formatSignedPercent(alert.delta)}).`;
    }

    return `${t('customerGraph.alerts.newOpportunityBody')} ${formatPercent(alert.currentValue)} (${formatSignedPercent(alert.delta)}).`;
  }, [t]);
  const clusterOutlines = useMemo<ClusterOutline[]>(() => {
    if (!model || renderedNodes.length === 0) return [];

    const nodeById = new Map(renderedNodes.map((node) => [node.id, node]));

    return model.clusters
      .map((cluster, clusterIndex) => {
        const positionedMembers = cluster.memberIds
          .map((memberId) => nodeById.get(memberId))
          .filter((node): node is VisualNode => !!node && typeof node.x === 'number' && typeof node.y === 'number');

        if (!positionedMembers.length) return null;

        const x = positionedMembers.reduce((acc, node) => acc + (node.x as number), 0) / positionedMembers.length;
        const y = positionedMembers.reduce((acc, node) => acc + (node.y as number), 0) / positionedMembers.length;

        const measuredRadius = positionedMembers.reduce((max, node) => {
          const dx = (node.x as number) - x;
          const dy = (node.y as number) - y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          return Math.max(max, distance + node.size + 18);
        }, 0);

        return {
          id: cluster.id,
          label: cluster.label || t('customerGraph.clusterLabel'),
          color: CLUSTER_COLORS[clusterIndex % CLUSTER_COLORS.length],
          x,
          y,
          radius: Math.max(measuredRadius, cluster.memberCount > 1 ? 62 : 42),
          memberCount: cluster.memberCount,
        };
      })
      .filter((outline): outline is ClusterOutline => !!outline)
      .sort((a, b) => b.radius - a.radius);
  }, [model, renderedNodes, t]);

  const handleWheelZoom = (event: React.WheelEvent<SVGSVGElement>) => {
    event.preventDefault();
    const nextScale = clampScale(viewScale - event.deltaY * 0.0012);
    setViewScale(nextScale);
  };

  const handlePointerDown = (event: React.MouseEvent<SVGSVGElement>) => {
    if ((event.target as HTMLElement).closest('[data-node="true"]')) return;
    panState.current = {
      panning: true,
      lastX: event.clientX,
      lastY: event.clientY,
    };
  };

  const handlePointerMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!panState.current.panning) return;

    const dx = event.clientX - panState.current.lastX;
    const dy = event.clientY - panState.current.lastY;

    setViewX((prev) => prev + dx);
    setViewY((prev) => prev + dy);

    panState.current.lastX = event.clientX;
    panState.current.lastY = event.clientY;
  };

  const stopPanning = () => {
    panState.current.panning = false;
  };

  const fitToNodes = useCallback((nodesToFit: VisualNode[]) => {
    const positionedNodes = nodesToFit.filter(
      (node) => typeof node.x === 'number' && typeof node.y === 'number',
    );
    if (!positionedNodes.length) {
      setViewScale(1);
      setViewX(0);
      setViewY(0);
      return;
    }

    const xValues = positionedNodes.map((node) => node.x as number);
    const yValues = positionedNodes.map((node) => node.y as number);
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);

    const width = Math.max(maxX - minX, 80);
    const height = Math.max(maxY - minY, 80);
    const centerX = minX + width / 2;
    const centerY = minY + height / 2;
    const targetScale = clampScale(
      Math.min((GRAPH_WIDTH - 180) / width, (GRAPH_HEIGHT - 180) / height),
    );

    setViewScale(targetScale);
    setViewX(GRAPH_WIDTH / 2 - centerX * targetScale);
    setViewY(GRAPH_HEIGHT / 2 - centerY * targetScale);
  }, []);

  const fitToNodeIds = useCallback((nodeIds: string[]) => {
    if (nodeIds.length === 0) return;
    const memberIds = new Set(nodeIds);
    fitToNodes(renderedNodes.filter((node) => memberIds.has(node.id)));
  }, [fitToNodes, renderedNodes]);

  const fitToAllNodes = useCallback(() => {
    fitToNodes(renderedNodes);
  }, [fitToNodes, renderedNodes]);

  const resetViewport = () => {
    fitToAllNodes();
  };

  const handleZoomStep = (direction: 'in' | 'out') => {
    setViewScale((prev) => clampScale(prev + (direction === 'in' ? 0.16 : -0.16)));
  };

  const handleClusterSelect = (cluster: CustomerCluster) => {
    setSelectedClusterId(cluster.id);
    const primaryMemberId = cluster.memberIds.find((id) => profileById.has(id)) || null;
    setSelectedProfileId(primaryMemberId);
    fitToNodeIds(cluster.memberIds);
  };

  const handleGenerateAIInsights = useCallback(async () => {
    setAiInsightsLoading(true);
    setAiInsightsError(null);
    setAiInsightsProgress({ completed: 0, total: 0 });

    try {
      const enrichedModel = await buildGraphModel(callHistory, filters, {
        semanticEnabled: true,
        minScore: minSimilarity,
        cacheMode: 'refresh',
        maxNeighbors: 4,
        semanticTimeoutMs: 3500,
        cacheTtlMs: 4 * 60 * 1000,
        enrichWithAI: true,
      });

      setModel(enrichedModel);
      if (!selectedProfileId && enrichedModel.profiles[0]) {
        setSelectedProfileId(enrichedModel.profiles[0].id);
      }

      setAiInsightsGeneratedAt(new Date().toISOString());

      if (selectedClusterId && !enrichedModel.clusters.find((cluster) => cluster.id === selectedClusterId)) {
        setSelectedClusterId(enrichedModel.clusters[0]?.id || null);
      }
      if (!selectedClusterId) {
        const firstCluster = enrichedModel.clusters[0];
        setSelectedClusterId(firstCluster?.id || null);
        const firstMemberId = firstCluster?.memberIds[0] || null;
        if (firstMemberId) setSelectedProfileId(firstMemberId);
      }
    } catch (loadError: unknown) {
      const message = loadError instanceof Error
        ? loadError.message
        : t('customerGraph.copilot.generateError');
      setAiInsightsError(message);
    } finally {
      setAiInsightsLoading(false);
    }
  }, [callHistory, filters, minSimilarity, selectedClusterId, selectedProfileId, t]);

  useEffect(() => {
    if (!model || renderedNodes.length === 0) return;

    const key = [
      model.generatedAt,
      model.stats.totalCustomers,
      model.stats.totalEdges,
      dateRangePreset,
      interactionType,
      minSimilarity.toFixed(2),
      refreshNonce,
    ].join(':');
    if (autoFitKeyRef.current === key) return;

    autoFitKeyRef.current = key;
    fitToAllNodes();
  }, [
    dateRangePreset,
    fitToAllNodes,
    interactionType,
    minSimilarity,
    model,
    refreshNonce,
    renderedNodes.length,
  ]);

  const hasRenderableData = !!model && model.profiles.length > 0;
  const noEdgesAtThreshold = !!model && model.profiles.length > 1 && model.edges.length === 0;

  return (
    <div className="space-y-6 max-w-[1700px] mx-auto pb-10">
      <section
        className={cn(
          'relative overflow-hidden rounded-2xl border p-6 md:p-7',
          isDark ? 'bg-[#09090B] border-white/10' : 'bg-white border-black/10',
        )}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className={cn('absolute -top-24 left-0 w-80 h-64 rounded-full blur-3xl opacity-10', isDark ? 'bg-cyan-500' : 'bg-cyan-300')} />
        </div>

        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className={cn('text-2xl font-bold tracking-tight', isDark ? 'text-white' : 'text-black')}>
              {t('customerGraph.title')}
            </h1>
            <p className={cn('text-sm mt-1.5 max-w-2xl', isDark ? 'text-white/65' : 'text-black/60')}>
              {t('customerGraph.subtitle')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleGenerateAIInsights}
              disabled={aiInsightsLoading || loading}
              className={cn(
                'inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border text-sm font-medium transition-all',
                aiInsightsLoading
                  ? (isDark
                    ? 'bg-cyan-500/12 border-cyan-500/25 text-cyan-300'
                    : 'bg-cyan-50 border-cyan-200 text-cyan-700')
                  : (isDark
                    ? 'bg-cyan-500/10 border-cyan-500/25 text-cyan-200 hover:bg-cyan-500/15'
                    : 'bg-cyan-50 border-cyan-200 text-cyan-700 hover:bg-cyan-100'),
                (aiInsightsLoading || loading) && 'cursor-not-allowed opacity-90',
              )}
            >
              {aiInsightsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
              {aiInsightsLoading
                ? `${t('customerGraph.controls.generatingInsights')} ${aiInsightsProgress.completed}/${aiInsightsProgress.total || model?.clusters.length || 0}`
                : t('customerGraph.controls.generateInsights')}
            </button>

            <button
              onClick={() => setRefreshNonce((prev) => prev + 1)}
              className={cn(
                'inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border text-sm font-medium transition-all',
                isDark
                  ? 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20'
                  : 'bg-black/5 border-black/10 text-black hover:bg-black/10 hover:border-black/20',
              )}
            >
              <RefreshCcw className="w-4 h-4" />
              {t('customerGraph.controls.recalculate')}
            </button>

            <button
              onClick={resetViewport}
              className={cn(
                'inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border text-sm font-medium transition-all',
                isDark
                  ? 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20'
                  : 'bg-black/5 border-black/10 text-black hover:bg-black/10 hover:border-black/20',
              )}
            >
              <LocateFixed className="w-4 h-4" />
              {t('customerGraph.controls.resetView')}
            </button>
          </div>
        </div>

        <div className="relative z-10 mt-3 min-h-5">
          {aiInsightsError && (
            <p className={cn('text-xs', isDark ? 'text-rose-300' : 'text-rose-700')}>
              {aiInsightsError}
            </p>
          )}
          {!aiInsightsError && aiInsightsGeneratedAt && (
            <p className={cn('text-xs', isDark ? 'text-white/55' : 'text-black/55')}>
              {t('customerGraph.copilot.generatedAt')} {new Date(aiInsightsGeneratedAt).toLocaleTimeString()}
            </p>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        <MetricCard
          title={t('customerGraph.kpi.customers')}
          value={model?.stats.totalCustomers ?? 0}
          icon={<UserRound className="w-4 h-4" />}
          color="cyan"
          isDark={isDark}
        />
        <MetricCard
          title={t('customerGraph.kpi.clusters')}
          value={model?.stats.totalClusters ?? 0}
          icon={<Network className="w-4 h-4" />}
          color="blue"
          isDark={isDark}
        />
        <MetricCard
          title={t('customerGraph.kpi.edges')}
          value={model?.stats.totalEdges ?? 0}
          icon={<Sparkles className="w-4 h-4" />}
          color="purple"
          isDark={isDark}
        />
        <MetricCard
          title={t('customerGraph.kpi.risk')}
          value={model?.stats.highRiskClusters ?? 0}
          icon={<ShieldAlert className="w-4 h-4" />}
          color="orange"
          isDark={isDark}
        />
        <MetricCard
          title={t('customerGraph.kpi.opportunity')}
          value={model?.stats.opportunityClusters ?? 0}
          icon={<Brain className="w-4 h-4" />}
          color="emerald"
          isDark={isDark}
        />
      </div>

      <section className={cn(
        'rounded-2xl border p-4 md:p-5',
        isDark ? 'bg-[#09090B] border-white/10' : 'bg-white border-black/10',
      )}>
        <div className="flex items-center justify-between gap-3">
          <h3 className={cn('text-sm font-semibold tracking-wide', isDark ? 'text-white' : 'text-black')}>
            {t('customerGraph.alerts.title')}
          </h3>
          <span className={cn(
            'text-[11px] px-2 py-1 rounded-full border',
            isDark ? 'border-white/10 bg-white/5 text-white/65' : 'border-black/10 bg-black/5 text-black/60',
          )}>
            {realtimeAlerts.length}
          </span>
        </div>

        {realtimeAlerts.length === 0 ? (
          <p className={cn('text-sm mt-2', isDark ? 'text-white/55' : 'text-black/55')}>
            {t('customerGraph.alerts.empty')}
          </p>
        ) : (
          <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-3">
            {realtimeAlerts.map((alert) => {
              const meta = alertMeta[alert.type];
              const AlertIcon = meta.icon;

              return (
                <button
                  key={alert.id}
                  onClick={() => {
                    setSelectedClusterId(alert.clusterId);
                    const cluster = model?.clusters.find((candidate) => candidate.id === alert.clusterId);
                    const focusMember = cluster?.memberIds.find((memberId) => profileById.has(memberId)) || null;
                    if (focusMember) setSelectedProfileId(focusMember);
                    if (cluster) fitToNodeIds(cluster.memberIds);
                  }}
                  className={cn(
                    'rounded-xl border p-3 text-left transition-colors',
                    isDark ? 'border-white/10 bg-white/[0.03] hover:bg-white/8' : 'border-black/10 bg-black/[0.03] hover:bg-black/8',
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn(
                      'inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-full border',
                      meta.chipClassName,
                    )}>
                      <AlertIcon className="w-3.5 h-3.5" />
                      {meta.title}
                    </span>
                    <span className={cn('text-xs font-semibold', isDark ? 'text-white/80' : 'text-black/80')}>
                      {formatSignedPercent(alert.delta)}
                    </span>
                  </div>

                  <p className={cn('text-sm font-medium mt-2', isDark ? 'text-white' : 'text-black')}>
                    {alert.clusterLabel}
                  </p>
                  <p className={cn('text-xs mt-1 leading-relaxed', isDark ? 'text-white/68' : 'text-black/70')}>
                    {getAlertBody(alert)}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section
        className={cn(
          'rounded-2xl border p-4 md:p-5 space-y-4',
          isDark ? 'bg-[#09090B] border-white/10' : 'bg-white border-black/10',
        )}
      >
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 xl:gap-6 items-end">
          <div className="space-y-1.5">
            <p className={cn('text-[11px] uppercase tracking-wider', isDark ? 'text-white/50' : 'text-black/45')}>
              {t('customerGraph.controls.dateRange')}
            </p>
            <SegmentedControl
              isDark={isDark}
              value={dateRangePreset}
              onChange={(value) => setDateRangePreset(value as (typeof RANGE_OPTIONS)[number])}
              columns={4}
              items={[
                { value: '7d', label: t('customerGraph.range.7d') },
                { value: '30d', label: t('customerGraph.range.30d') },
                { value: '90d', label: t('customerGraph.range.90d') },
                { value: 'all', label: t('customerGraph.range.all') },
              ]}
            />
          </div>

          <div className="space-y-1.5">
            <p className={cn('text-[11px] uppercase tracking-wider', isDark ? 'text-white/50' : 'text-black/45')}>
              {t('customerGraph.controls.interactionType')}
            </p>
            <SegmentedControl
              isDark={isDark}
              value={interactionType}
              onChange={(value) => setInteractionType(value as (typeof TYPE_OPTIONS)[number])}
              columns={3}
              items={[
                { value: 'all', label: t('customerGraph.type.all') },
                { value: 'voice', label: t('customerGraph.type.voice') },
                { value: 'text', label: t('customerGraph.type.text') },
              ]}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className={cn('text-[11px] uppercase tracking-wider', isDark ? 'text-white/50' : 'text-black/45')}>
                {t('customerGraph.controls.minSimilarity')}
              </p>
              <span className={cn('text-xs font-semibold', isDark ? 'text-white/80' : 'text-black/70')}>
                {Math.round(minSimilarity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0.45}
              max={0.8}
              step={0.01}
              value={minSimilarity}
              onChange={(event) => setMinSimilarity(Number(event.target.value))}
              className={cn(
                'w-full accent-cyan-500',
                isDark ? '[&::-webkit-slider-runnable-track]:bg-white/10' : '[&::-webkit-slider-runnable-track]:bg-black/10',
              )}
            />
          </div>
        </div>
      </section>

      {error && (
        <div className={cn(
          'rounded-xl border p-4 text-sm flex items-center gap-3',
          isDark ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-700',
        )}>
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className={cn(
          'rounded-2xl border p-12 text-center text-sm',
          isDark ? 'bg-[#09090B] border-white/10 text-white/70' : 'bg-white border-black/10 text-black/70',
        )}>
          {t('customerGraph.loading')}
        </div>
      )}

      {!loading && !hasRenderableData && (
        <EmptyState
          title={t('customerGraph.empty.noDataTitle')}
          description={t('customerGraph.empty.noDataBody')}
          isDark={isDark}
        />
      )}

      {!loading && hasRenderableData && (
        <>
          {noEdgesAtThreshold && (
            <EmptyState
              title={t('customerGraph.empty.noEdgesTitle')}
              description={t('customerGraph.empty.noEdgesBody')}
              isDark={isDark}
            />
          )}

          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(380px,430px)] gap-5 xl:gap-6 items-start">
            <section
              className={cn(
                'rounded-2xl border overflow-hidden',
                isDark ? 'bg-[#09090B] border-white/10' : 'bg-white border-black/10',
              )}
            >
              <div className={cn(
                'px-4 py-3 border-b flex items-center justify-between gap-2',
                isDark ? 'border-white/10' : 'border-black/10',
              )}>
                <p className={cn('text-sm', isDark ? 'text-white/70' : 'text-black/65')}>
                  {t('customerGraph.canvasHint')}
                </p>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleZoomStep('out')}
                    aria-label={t('customerGraph.controls.zoomOut')}
                    title={t('customerGraph.controls.zoomOut')}
                    className={cn(
                      'inline-flex items-center justify-center w-8 h-8 rounded-md border transition-colors',
                      isDark
                        ? 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10'
                        : 'border-black/10 bg-black/5 text-black/80 hover:bg-black/10',
                    )}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleZoomStep('in')}
                    aria-label={t('customerGraph.controls.zoomIn')}
                    title={t('customerGraph.controls.zoomIn')}
                    className={cn(
                      'inline-flex items-center justify-center w-8 h-8 rounded-md border transition-colors',
                      isDark
                        ? 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10'
                        : 'border-black/10 bg-black/5 text-black/80 hover:bg-black/10',
                    )}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={fitToAllNodes}
                    aria-label={t('customerGraph.controls.fitGraph')}
                    title={t('customerGraph.controls.fitGraph')}
                    className={cn(
                      'inline-flex items-center justify-center w-8 h-8 rounded-md border transition-colors',
                      isDark
                        ? 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10'
                        : 'border-black/10 bg-black/5 text-black/80 hover:bg-black/10',
                    )}
                  >
                    <LocateFixed className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="h-[660px] relative overflow-hidden">
                <div
                  className={cn(
                    'absolute inset-0 pointer-events-none',
                    isDark
                      ? 'bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.04),transparent_48%)]'
                      : 'bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.05),transparent_48%)]',
                  )}
                />
                <div
                  className="absolute inset-0 opacity-35 pointer-events-none"
                  style={{
                    backgroundImage: `
                      linear-gradient(to right, rgba(148, 163, 184, 0.06) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(148, 163, 184, 0.06) 1px, transparent 1px)
                    `,
                    backgroundSize: '38px 38px',
                  }}
                />

                <svg
                  className={cn('w-full h-full relative z-10 select-none', panState.current.panning ? 'cursor-grabbing' : 'cursor-grab')}
                  viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
                  onWheel={handleWheelZoom}
                  onMouseDown={handlePointerDown}
                  onMouseMove={handlePointerMove}
                  onMouseUp={stopPanning}
                  onMouseLeave={() => {
                    stopPanning();
                    setHoveredProfileId(null);
                  }}
                >
                  <g transform={`translate(${viewX} ${viewY}) scale(${viewScale})`}>
                    {clusterOutlines.map((outline) => {
                      const isSelected = selectedClusterId === outline.id;
                      const dimByCluster = hasSelectedCluster && !isSelected;

                      return (
                        <g key={`outline-${outline.id}`} className="pointer-events-none">
                          <circle
                            cx={outline.x}
                            cy={outline.y}
                            r={outline.radius}
                            fill={outline.color}
                            fillOpacity={dimByCluster ? 0.015 : (isSelected ? 0.08 : 0.04)}
                            stroke={outline.color}
                            strokeOpacity={dimByCluster ? 0.14 : (isSelected ? 0.68 : 0.36)}
                            strokeWidth={isSelected ? 2.2 : 1.4}
                            strokeDasharray="7 6"
                          />
                          <text
                            x={outline.x}
                            y={outline.y - outline.radius - 9}
                            textAnchor="middle"
                            fontSize={11}
                            fontWeight={600}
                            fill={dimByCluster ? (isDark ? '#a1a1aa' : '#6b7280') : (isDark ? '#e4e4e7' : '#1f2937')}
                            stroke={isDark ? 'rgba(9,9,11,0.92)' : 'rgba(255,255,255,0.9)'}
                            strokeWidth={3}
                            paintOrder="stroke"
                          >
                            {outline.label}
                          </text>
                        </g>
                      );
                    })}

                    {renderedLinks.map((link) => {
                      const source = safeNode(link.source);
                      const target = safeNode(link.target);
                      if (!source || !target || source.x === undefined || source.y === undefined || target.x === undefined || target.y === undefined) {
                        return null;
                      }

                      const isFocused = focusedEdgeIds.has(link.id);
                      const isClusterEdge = hasSelectedCluster && selectedClusterEdgeIds.has(link.id);
                      const dimByCluster = hasSelectedCluster && !isClusterEdge;
                      const baseOpacity = dimByCluster
                        ? 0.08
                        : (isFocused ? 0.88 : (isClusterEdge ? 0.66 : (isDark ? 0.3 : 0.26)));
                      const strokeColor = isFocused
                        ? '#22d3ee'
                        : (isClusterEdge
                          ? '#38bdf8'
                          : (isDark ? 'rgba(148,163,184,0.45)' : 'rgba(71,85,105,0.35)'));

                      return (
                        <line
                          key={link.id}
                          x1={source.x}
                          y1={source.y}
                          x2={target.x}
                          y2={target.y}
                          stroke={strokeColor}
                          strokeOpacity={baseOpacity}
                          strokeWidth={Math.max(0.9, link.score * 3.5 + (isClusterEdge ? 0.25 : 0))}
                        />
                      );
                    })}

                    {renderedNodes.map((node) => {
                      if (node.x === undefined || node.y === undefined) return null;

                      const isSelected = selectedProfileId === node.id;
                      const isHovered = hoveredProfileId === node.id;
                      const inSelectedCluster = hasSelectedCluster && selectedClusterMemberIdSet.has(node.id);
                      const dimByCluster = hasSelectedCluster && !inSelectedCluster;
                      const showLabel = isSelected || isHovered || (inSelectedCluster && viewScale > 0.92) || viewScale > 1.35;

                      return (
                        <g
                          key={node.id}
                          transform={`translate(${node.x}, ${node.y})`}
                          data-node="true"
                          onMouseEnter={() => setHoveredProfileId(node.id)}
                          onMouseLeave={() => setHoveredProfileId((prev) => (prev === node.id ? null : prev))}
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedProfileId(node.id);
                            setSelectedClusterId(clusterByMember.get(node.id)?.id || null);
                          }}
                          className="cursor-pointer"
                        >
                          <circle
                            r={node.size + 8}
                            fill={node.color}
                            opacity={isSelected ? 0.2 : (inSelectedCluster ? 0.14 : (dimByCluster ? 0.05 : 0.1))}
                          />

                          <circle
                            r={node.size + 3.5}
                            fill="transparent"
                            stroke={isSelected ? '#f97316' : (isHovered ? '#22d3ee' : (inSelectedCluster ? node.color : 'transparent'))}
                            strokeWidth={isSelected || isHovered ? 2 : 1.3}
                            opacity={dimByCluster ? 0.38 : 1}
                          />

                          <circle
                            r={node.size}
                            fill={node.color}
                            opacity={dimByCluster ? 0.35 : (isDark ? 0.94 : 0.9)}
                            stroke={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}
                            strokeWidth={1.2}
                          />

                          {showLabel && (
                            <text
                              x={node.size + 7}
                              y={4}
                              fontSize={11}
                              fontWeight={500}
                              fill={dimByCluster ? (isDark ? '#a1a1aa' : '#6b7280') : (isDark ? '#e4e4e7' : '#1f2937')}
                              stroke={isDark ? 'rgba(9,9,11,0.9)' : 'rgba(255,255,255,0.85)'}
                              strokeWidth={2.2}
                              paintOrder="stroke"
                            >
                              {getLabel(node.profile)}
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </g>
                </svg>
              </div>
            </section>

            <section
              className={cn(
                'rounded-2xl border p-4 space-y-4 sticky top-24 xl:ml-1',
                isDark ? 'bg-[#09090B] border-white/10' : 'bg-white border-black/10',
              )}
            >
              <h3 className={cn('text-sm font-semibold tracking-wide', isDark ? 'text-white' : 'text-black')}>
                {t('customerGraph.details.title')}
              </h3>

              {selectedProfile ? (
                <div className="space-y-4">
                  <div className={cn('rounded-xl border p-3.5', isDark ? 'border-white/10 bg-white/[0.03]' : 'border-black/10 bg-black/[0.03]')}>
                    <p className={cn('text-sm font-semibold', isDark ? 'text-white' : 'text-black')}>
                      {getLabel(selectedProfile)}
                    </p>
                    <div className={cn('grid grid-cols-2 gap-2 mt-2 text-[11px]', isDark ? 'text-white/60' : 'text-black/60')}>
                      <div>
                        <p>{t('customerGraph.details.interactions')}</p>
                        <p className={cn('font-semibold text-sm mt-0.5', isDark ? 'text-white' : 'text-black')}>{selectedProfile.interactionCount}</p>
                      </div>
                      <div>
                        <p>{t('customerGraph.details.lastSeen')}</p>
                        <p className={cn('font-semibold text-sm mt-0.5', isDark ? 'text-white' : 'text-black')}>{formatDate(selectedProfile.lastSeen)}</p>
                      </div>
                    </div>
                  </div>

                  {selectedCluster && (
                    <>
                      {selectedCopilot && selectedCopilotMeta ? (
                        <div className={cn(
                          'rounded-xl border p-3.5 space-y-3',
                          isDark ? 'border-white/10 bg-white/[0.03]' : 'border-black/10 bg-black/[0.03]',
                        )}>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className={cn('text-[11px] uppercase tracking-wider', isDark ? 'text-white/45' : 'text-black/45')}>
                                {t('customerGraph.copilot.title')}
                              </p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span
                                  className={cn(
                                    'inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-full border',
                                    selectedCopilotMeta.activeClassName,
                                  )}
                                >
                                  <selectedCopilotMeta.icon className="w-3.5 h-3.5" />
                                  {selectedCopilotMeta.label}
                                </span>
                                <span className={cn(
                                  'text-[11px] font-semibold px-2 py-1 rounded-full border',
                                  isDark ? 'border-white/10 bg-white/5 text-white/80' : 'border-black/10 bg-black/5 text-black/75',
                                )}>
                                  {Math.round(selectedCopilot.confidence * 100)}% {t('customerGraph.copilot.confidence')}
                                </span>
                              </div>
                            </div>

                            <div className={cn(
                              'text-right text-[11px] px-2 py-1 rounded-lg border',
                              isDark ? 'border-white/10 bg-white/5 text-white/80' : 'border-black/10 bg-black/5 text-black/75',
                            )}>
                              <p className={isDark ? 'text-white/45' : 'text-black/45'}>
                                {t(`customerGraph.copilot.metric.${selectedCopilot.expectedOutcome.metric}`)}
                              </p>
                              <p className={cn('font-semibold text-sm mt-0.5', isDark ? 'text-cyan-300' : 'text-cyan-700')}>
                                {formatLift(selectedCopilot.expectedOutcome.lift)}
                              </p>
                            </div>
                          </div>

                          <p className={cn('text-xs leading-relaxed', isDark ? 'text-white/70' : 'text-black/70')}>
                            {selectedCopilot.summary}
                          </p>

                          <div className="space-y-1.5">
                            {selectedCopilotScoreRows.map(([action, score]) => {
                              const meta = copilotActionMeta[action];
                              return (
                                <div key={action} className="flex items-center gap-2">
                                  <span className={cn('text-[11px] w-[98px] truncate', isDark ? 'text-white/55' : 'text-black/55')}>
                                    {meta.label}
                                  </span>
                                  <div className={cn(
                                    'h-1.5 rounded-full flex-1 overflow-hidden',
                                    isDark ? 'bg-white/10' : 'bg-black/10',
                                  )}>
                                    <div
                                      className={cn(
                                        'h-full rounded-full',
                                        action === selectedCopilot.primaryAction
                                          ? (isDark ? 'bg-cyan-400' : 'bg-cyan-500')
                                          : (isDark ? 'bg-white/40' : 'bg-black/35'),
                                      )}
                                      style={{ width: `${Math.max(4, Math.round(score * 100))}%` }}
                                    />
                                  </div>
                                  <span className={cn('text-[11px] font-medium w-8 text-right', isDark ? 'text-white/65' : 'text-black/65')}>
                                    {Math.round(score * 100)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                          <div>
                            <p className={cn('text-[11px] uppercase tracking-wider mb-1.5', isDark ? 'text-white/45' : 'text-black/45')}>
                              {t('customerGraph.copilot.why')}
                            </p>
                            <div className="space-y-1.5">
                              {selectedCopilot.rationale.map((line, index) => (
                                <p key={`${selectedCopilot.clusterId}-why-${index}`} className={cn('text-[11px] leading-relaxed', isDark ? 'text-white/70' : 'text-black/70')}>
                                  {line}
                                </p>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className={cn('text-[11px] uppercase tracking-wider mb-1.5', isDark ? 'text-white/45' : 'text-black/45')}>
                              {t('customerGraph.copilot.playbook')}
                            </p>
                            <div className="space-y-1.5">
                              {selectedCopilot.playbook.map((step, stepIndex) => (
                                <div key={`${selectedCopilot.clusterId}-step-${stepIndex}`} className="flex items-start gap-2">
                                  <span className={cn(
                                    'inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-semibold mt-0.5',
                                    selectedCopilotMeta.subtleClassName,
                                  )}>
                                    {stepIndex + 1}
                                  </span>
                                  <p className={cn('text-[11px] leading-relaxed', isDark ? 'text-white/70' : 'text-black/70')}>
                                    {step}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className={cn(
                          'rounded-xl border p-3.5 space-y-3',
                          isDark ? 'border-white/10 bg-white/[0.03]' : 'border-black/10 bg-black/[0.03]',
                        )}>
                          <p className={cn('text-[11px] uppercase tracking-wider', isDark ? 'text-white/45' : 'text-black/45')}>
                            {t('customerGraph.copilot.title')}
                          </p>
                          <p className={cn('text-xs leading-relaxed', isDark ? 'text-white/70' : 'text-black/70')}>
                            {t('customerGraph.copilot.emptyPrompt')}
                          </p>
                          <button
                            onClick={handleGenerateAIInsights}
                            disabled={aiInsightsLoading}
                            className={cn(
                              'inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all',
                              isDark
                                ? 'border-cyan-500/25 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/15'
                                : 'border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100',
                              aiInsightsLoading && 'cursor-not-allowed opacity-85',
                            )}
                          >
                            {aiInsightsLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Brain className="w-3.5 h-3.5" />}
                            {aiInsightsLoading ? t('customerGraph.controls.generatingInsights') : t('customerGraph.controls.generateInsights')}
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  <div>
                    <p className={cn('text-[11px] uppercase tracking-wider mb-2', isDark ? 'text-white/45' : 'text-black/45')}>
                      {t('customerGraph.details.topSignals')}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {Array.from(new Set([...selectedProfile.signal.topics.slice(0, 3), ...selectedProfile.signal.tags.slice(0, 3)])).map((signal, index) => (
                        <span
                          key={`${signal}-${index}`}
                          className={cn(
                            'text-[11px] px-2 py-1 rounded-full border',
                            isDark ? 'border-white/10 text-white/80 bg-white/5' : 'border-black/10 text-black/75 bg-black/5',
                          )}
                        >
                          {signal}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className={cn('text-[11px] uppercase tracking-wider mb-2', isDark ? 'text-white/45' : 'text-black/45')}>
                      {t('customerGraph.details.connections')}
                    </p>

                    <div className="space-y-2">
                      {selectedProfileEdges.length === 0 && (
                        <p className={cn('text-xs', isDark ? 'text-white/55' : 'text-black/55')}>
                          {t('customerGraph.details.noConnections')}
                        </p>
                      )}

                      {selectedProfileEdges.map((edge) => {
                        const otherId = edge.source === selectedProfile.id ? edge.target : edge.source;
                        const other = profileById.get(otherId);
                        if (!other) return null;

                        return (
                          <button
                            key={edge.id}
                            className={cn(
                              'w-full text-left rounded-lg border px-2.5 py-2 transition-colors',
                              isDark ? 'border-white/10 bg-white/5 hover:bg-white/10' : 'border-black/10 bg-black/5 hover:bg-black/10',
                            )}
                            onClick={() => {
                              setSelectedProfileId(other.id);
                              setSelectedClusterId(clusterByMember.get(other.id)?.id || null);
                            }}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <p className={cn('text-xs font-medium', isDark ? 'text-white' : 'text-black')}>
                                {getLabel(other)}
                              </p>
                              <p className={cn('text-[11px] font-semibold', isDark ? 'text-cyan-300' : 'text-cyan-700')}>
                                {formatPercent(edge.score)}
                              </p>
                            </div>
                            <p className={cn('text-[11px] mt-1 line-clamp-2', isDark ? 'text-white/55' : 'text-black/55')}>
                              {edge.evidence[0] || t('customerGraph.details.defaultEvidence')}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <p className={cn('text-sm', isDark ? 'text-white/55' : 'text-black/55')}>
                  {t('customerGraph.details.selectPrompt')}
                </p>
              )}
            </section>
          </div>

          <section className={cn(
            'rounded-2xl border overflow-hidden',
            isDark ? 'bg-[#09090B] border-white/10' : 'bg-white border-black/10',
          )}>
            <div className={cn('px-4 py-3 border-b', isDark ? 'border-white/10' : 'border-black/10')}>
              <h3 className={cn('text-sm font-semibold', isDark ? 'text-white' : 'text-black')}>
                {t('customerGraph.clusterTable.title')}
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className={cn('text-[11px] uppercase tracking-wider', isDark ? 'text-white/55 bg-white/5' : 'text-black/55 bg-black/5')}>
                  <tr>
                    <th className="px-4 py-3 text-left">{t('customerGraph.clusterTable.cluster')}</th>
                    <th className="px-4 py-3 text-left">{t('customerGraph.clusterTable.members')}</th>
                    <th className="px-4 py-3 text-left">{t('customerGraph.clusterTable.risk')}</th>
                    <th className="px-4 py-3 text-left">{t('customerGraph.clusterTable.opportunity')}</th>
                    <th className="px-4 py-3 text-left">{t('customerGraph.clusterTable.nextAction')}</th>
                    <th className="px-4 py-3 text-left">{t('customerGraph.clusterTable.signals')}</th>
                  </tr>
                </thead>
                <tbody>
                  {(model?.clusters || []).map((cluster, index) => (
                    <tr
                      key={cluster.id}
                      className={cn(
                        'border-t cursor-pointer transition-colors',
                        isDark ? 'border-white/10 hover:bg-white/5' : 'border-black/10 hover:bg-black/5',
                        selectedClusterId === cluster.id && (isDark ? 'bg-white/5' : 'bg-black/5'),
                      )}
                      onClick={() => handleClusterSelect(cluster)}
                    >
                      <td className="px-4 py-3">
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-full mr-2 align-middle"
                          style={{ backgroundColor: CLUSTER_COLORS[index % CLUSTER_COLORS.length] }}
                        />
                        {cluster.label}
                      </td>
                      <td className="px-4 py-3">{cluster.memberCount}</td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          'text-xs font-semibold px-2 py-1 rounded-full border',
                          cluster.riskScore >= 0.65
                            ? (isDark ? 'border-rose-500/30 bg-rose-500/10 text-rose-300' : 'border-rose-200 bg-rose-50 text-rose-700')
                            : (isDark ? 'border-white/10 bg-white/5 text-white/70' : 'border-black/10 bg-black/5 text-black/70'),
                        )}>
                          {formatPercent(cluster.riskScore)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          'text-xs font-semibold px-2 py-1 rounded-full border',
                          cluster.opportunityScore >= 0.65
                            ? (isDark ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-emerald-200 bg-emerald-50 text-emerald-700')
                            : (isDark ? 'border-white/10 bg-white/5 text-white/70' : 'border-black/10 bg-black/5 text-black/70'),
                        )}>
                          {formatPercent(cluster.opportunityScore)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {cluster.copilot ? (
                          <div className="flex flex-col gap-1">
                            <span className={cn(
                              'inline-flex items-center gap-1.5 w-fit text-[11px] px-2 py-1 rounded-full border',
                              copilotActionMeta[cluster.copilot.primaryAction].activeClassName,
                            )}>
                              {(() => {
                                const ActionIcon = copilotActionMeta[cluster.copilot.primaryAction].icon;
                                return <ActionIcon className="w-3.5 h-3.5" />;
                              })()}
                              {copilotActionMeta[cluster.copilot.primaryAction].label}
                            </span>
                            <span className={cn('text-[11px]', isDark ? 'text-white/55' : 'text-black/55')}>
                              {Math.round(cluster.copilot.confidence * 100)}% {t('customerGraph.copilot.confidence')}
                            </span>
                          </div>
                        ) : (
                          <span className={isDark ? 'text-white/45' : 'text-black/45'}>-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {cluster.sharedSignals.length === 0 ? (
                            <span className={isDark ? 'text-white/45' : 'text-black/45'}>-</span>
                          ) : (
                            cluster.sharedSignals.map((signal) => (
                              <span
                                key={`${cluster.id}-${signal}`}
                                className={cn(
                                  'text-[11px] px-1.5 py-0.5 rounded-full border',
                                  isDark ? 'border-white/10 bg-white/5 text-white/70' : 'border-black/10 bg-black/5 text-black/70',
                                )}
                              >
                                {signal}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedCluster && (
              <div className={cn(
                'border-t px-4 py-4',
                isDark ? 'border-white/10 bg-white/[0.02]' : 'border-black/10 bg-black/[0.02]',
              )}>
                <p className={cn('text-sm font-semibold mb-2', isDark ? 'text-white' : 'text-black')}>
                  {t('customerGraph.clusterTable.membersPreview')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedClusterMembers.slice(0, 12).map((profile) => (
                    <button
                      key={profile.id}
                      onClick={() => setSelectedProfileId(profile.id)}
                      className={cn(
                        'text-xs px-2 py-1 rounded-full border transition-colors',
                        isDark ? 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10' : 'border-black/10 bg-black/5 text-black/80 hover:bg-black/10',
                      )}
                    >
                      {getLabel(profile)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon,
  color,
  isDark,
}: {
  title: string;
  value: number;
  icon: ReactNode;
  color: 'cyan' | 'blue' | 'purple' | 'orange' | 'emerald';
  isDark: boolean;
}) {
  return (
    <div className={cn(
      'relative overflow-hidden rounded-xl border p-4',
      isDark ? 'bg-[#09090B] border-white/10' : 'bg-white border-black/10',
    )}>
      <div className={cn(
        'absolute -right-10 -top-10 w-24 h-24 rounded-full blur-2xl opacity-10 pointer-events-none',
        color === 'cyan' && 'bg-cyan-500',
        color === 'blue' && 'bg-blue-500',
        color === 'purple' && 'bg-purple-500',
        color === 'orange' && 'bg-orange-500',
        color === 'emerald' && 'bg-emerald-500',
      )} />

      <div className="relative z-10">
        <div className={cn('flex items-center justify-between text-xs uppercase tracking-wider', isDark ? 'text-white/55' : 'text-black/55')}>
          <span>{title}</span>
          <span className={cn(
            'p-1.5 rounded-md border',
            isDark ? 'bg-white/5 border-white/10 text-white/70' : 'bg-black/5 border-black/10 text-black/70',
          )}>
            {icon}
          </span>
        </div>

        <p className={cn('text-3xl font-semibold mt-2', isDark ? 'text-white' : 'text-black')}>
          {value}
        </p>
      </div>
    </div>
  );
}

function SegmentedControl({
  items,
  value,
  onChange,
  isDark,
  columns = 3,
}: {
  items: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
  isDark: boolean;
  columns?: number;
}) {
  return (
    <div className={cn(
      'grid p-1 rounded-xl border gap-1 w-full',
      isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10',
    )} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {items.map((item) => {
        const active = value === item.value;

        return (
          <button
            key={item.value}
            onClick={() => onChange(item.value)}
            className={cn(
              'px-2 py-1.5 rounded-lg text-xs font-medium transition-all text-center leading-tight',
              active
                ? (isDark ? 'bg-white/15 text-white' : 'bg-white text-black shadow-sm')
                : (isDark ? 'text-white/60 hover:text-white hover:bg-white/10' : 'text-black/55 hover:text-black hover:bg-black/10'),
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function EmptyState({
  title,
  description,
  isDark,
}: {
  title: string;
  description: string;
  isDark: boolean;
}) {
  return (
    <div className={cn(
      'rounded-2xl border px-6 py-12 text-center',
      isDark ? 'bg-[#09090B] border-white/10' : 'bg-white border-black/10',
    )}>
      <h3 className={cn('text-lg font-semibold', isDark ? 'text-white' : 'text-black')}>
        {title}
      </h3>
      <p className={cn('text-sm mt-1.5 max-w-xl mx-auto', isDark ? 'text-white/60' : 'text-black/60')}>
        {description}
      </p>
    </div>
  );
}
