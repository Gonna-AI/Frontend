import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { buildGraphModel } from '../services/customerGraphService';
import {
  buildPlaybookSuggestion,
  buildRescueAuditEntry,
  cancelPendingClusterRescues,
  createRescueAction,
  downloadConsentProofPdf,
  enrichRescueActionWithResult,
  ensureMonthlyReport,
  evaluateRescueOpportunities,
  executeDueScheduledRescues,
  inferRescueCapability,
  loadDismissedOpportunityIds,
  loadHistoryLoggedActionIds,
  reportToCsv,
  saveDismissedOpportunityIds,
  saveHistoryLoggedActionIds,
} from '../services/rescuePlaybookService';
import {
  fetchPlaybooks,
  syncPlaybooks,
  fetchSettings,
  saveSettings as apiSaveSettings,
  fetchActions,
  saveAction as apiSaveAction,
  updateAction as apiUpdateAction,
  fetchAudits,
  saveAudit as apiSaveAudit,
  fetchReports,
  saveReport as apiSaveReport,
} from '../services/rescuePlaybookApiService';
import type { CustomerGraphModel } from '../types/customerGraph';
import type {
  ProtectedRevenueReport,
  RescueActionRecord,
  RescueActionWithResult,
  RescueAuditEntry,
  RescueEngineSettings,
  RescueOpportunity,
  RescuePlaybookTemplate,
} from '../types/rescuePlaybook';
import {
  DEFAULT_RESCUE_PLAYBOOKS,
  DEFAULT_RESCUE_SETTINGS,
} from '../types/rescuePlaybook';
import type { CallHistoryItem } from './DemoCallContext';
import { useDemoCall } from './DemoCallContext';

interface RescueCenterContextValue {
  scanLoading: boolean;
  scanError: string | null;
  graphModel: CustomerGraphModel | null;
  opportunities: RescueOpportunity[];
  visibleBannerOpportunities: RescueOpportunity[];
  playbooks: RescuePlaybookTemplate[];
  settings: RescueEngineSettings;
  actions: RescueActionRecord[];
  actionsWithResults: RescueActionWithResult[];
  audits: RescueAuditEntry[];
  reports: ProtectedRevenueReport[];
  dismissedOpportunityIds: string[];
  capability: ReturnType<typeof inferRescueCapability>;
  suggestion: ReturnType<typeof buildPlaybookSuggestion>;
  dataLoading: boolean;
  setGraphModelFromView: (model: CustomerGraphModel | null) => void;
  setPlaybooks: (next: RescuePlaybookTemplate[]) => void;
  setSettings: (next: RescueEngineSettings) => void;
  dismissOpportunity: (opportunityId: string) => void;
  clearDismissedOpportunities: () => void;
  runRescueAction: (args: {
    opportunityId: string;
    playbookId: string;
    scheduledFor?: string;
    createdBy?: 'user' | 'automation';
  }) => { ok: boolean; message: string; action?: RescueActionRecord };
  approveRescueAction: (actionId: string) => { ok: boolean; message: string };
  cancelPendingClusterActions: (clusterId: string) => { ok: boolean; message: string };
  downloadConsentProof: (actionId: string) => void;
  exportReportCsv: (reportId: string) => void;
  exportReportPdf: (reportId: string) => void;
  forwardReportByEmail: (reportId: string, email?: string) => void;
}

const RescueCenterContext = createContext<RescueCenterContextValue | undefined>(undefined);

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function formatInr(value: number): string {
  return `INR ${Math.round(value).toLocaleString('en-IN')}`;
}

function buildHistoryLog(action: RescueActionRecord): CallHistoryItem {
  const now = new Date(action.executedAt || action.triggerAt);
  const summaryText = `Rescue Action: ${action.playbookName} executed for ${action.memberCount} customers in ${action.clusterLabel}.`;

  return {
    id: `history-rescue-${action.id}`,
    callerName: 'Rescue Engine',
    date: now,
    duration: 0,
    type: 'text',
    messages: [
      {
        id: `msg-rescue-${action.id}`,
        speaker: 'agent',
        text: summaryText,
        timestamp: now,
      },
    ],
    extractedFields: [],
    category: {
      id: 'rescue_action',
      name: 'Rescue Action',
      color: 'emerald',
      description: 'Automated cluster rescue execution log',
    },
    priority: 'medium',
    tags: ['rescue_action', action.clusterId, action.playbookId],
    summary: {
      mainPoints: [summaryText],
      sentiment: 'positive',
      actionItems: [],
      followUpRequired: false,
      notes: summaryText,
      summaryText,
      topics: ['rescue', 'retention'],
      suggestions: [
        `Estimated cost ${formatInr(action.estimatedCostInr)}`,
        `Potential loss addressed ${formatInr(action.potentialLossInr)}`,
      ],
    },
  };
}

function buildReportPdf(report: ProtectedRevenueReport): Blob {
  const lines = [
    'ClerkTree Protected Revenue Report',
    report.headline,
    `Generated at: ${new Date(report.generatedAt).toLocaleString()}`,
    `Total protected: ${formatInr(report.totalProtectedInr)}`,
    `Clusters rescued: ${report.clusterCount}`,
    '',
    'Breakdown',
    ...report.rows.map(
      (row) => `${row.cluster} | ${row.customers} customers | ${row.rescueType} | ${formatInr(row.revenueProtectedInr)} | ${Math.round(row.retentionRate * 100)}% retained`,
    ),
  ].join('\n');

  return new Blob([lines], { type: 'application/pdf' });
}

export function RescueCenterProvider({ children }: { children: ReactNode }) {
  const {
    callHistory,
    addToCallHistory,
    knowledgeBase,
    updateKnowledgeBase,
  } = useDemoCall();

  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [graphModel, setGraphModel] = useState<CustomerGraphModel | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  const [playbooks, setPlaybooksState] = useState<RescuePlaybookTemplate[]>(() => {
    return knowledgeBase.rescuePlaybooks || DEFAULT_RESCUE_PLAYBOOKS;
  });
  const [settings, setSettingsState] = useState<RescueEngineSettings>(() => {
    return knowledgeBase.rescueSettings || DEFAULT_RESCUE_SETTINGS;
  });
  const [actions, setActions] = useState<RescueActionRecord[]>([]);
  const [audits, setAudits] = useState<RescueAuditEntry[]>([]);
  const [reports, setReports] = useState<ProtectedRevenueReport[]>([]);
  const [dismissedOpportunityIds, setDismissedOpportunityIds] = useState<string[]>(() => loadDismissedOpportunityIds());
  const [historyLoggedActionIds, setHistoryLoggedActionIds] = useState<string[]>(() => loadHistoryLoggedActionIds());
  const [opportunities, setOpportunities] = useState<RescueOpportunity[]>([]);

  const initialLoadDone = useRef(false);

  const capability = useMemo(() => inferRescueCapability(settings), [settings]);

  // ────── Load all data from API on mount ──────
  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;

    let isMounted = true;

    const loadAll = async () => {
      setDataLoading(true);
      try {
        const [
          loadedPlaybooks,
          loadedSettings,
          loadedActions,
          loadedAudits,
          loadedReports,
        ] = await Promise.all([
          fetchPlaybooks().catch((e) => { console.warn('Failed to load playbooks:', e); return null; }),
          fetchSettings().catch((e) => { console.warn('Failed to load settings:', e); return null; }),
          fetchActions().catch((e) => { console.warn('Failed to load actions:', e); return []; }),
          fetchAudits().catch((e) => { console.warn('Failed to load audits:', e); return []; }),
          fetchReports().catch((e) => { console.warn('Failed to load reports:', e); return []; }),
        ]);

        if (!isMounted) return;

        if (loadedPlaybooks && loadedPlaybooks.length > 0) {
          setPlaybooksState(loadedPlaybooks);
        }
        if (loadedSettings) {
          setSettingsState(loadedSettings);
        }
        if (Array.isArray(loadedActions)) {
          setActions(loadedActions);
        }
        if (Array.isArray(loadedAudits)) {
          setAudits(loadedAudits);
        }
        if (Array.isArray(loadedReports)) {
          setReports(loadedReports);
        }
      } catch (err) {
        console.warn('Failed to load rescue data from API, using defaults:', err);
      } finally {
        if (isMounted) setDataLoading(false);
      }
    };

    loadAll();

    return () => {
      isMounted = false;
    };
  }, []);

  // Persist dismissed opportunity IDs locally (UX preference, not critical data)
  useEffect(() => {
    saveDismissedOpportunityIds(dismissedOpportunityIds);
  }, [dismissedOpportunityIds]);

  useEffect(() => {
    saveHistoryLoggedActionIds(historyLoggedActionIds);
  }, [historyLoggedActionIds]);

  // ────── Build graph model from call history ──────
  useEffect(() => {
    let isMounted = true;

    if (callHistory.length === 0) {
      setGraphModel(null);
      setScanError(null);
      setScanLoading(false);
      return;
    }

    const run = async () => {
      setScanLoading(true);
      setScanError(null);

      try {
        const model = await buildGraphModel(
          callHistory,
          {
            interactionType: 'all',
            minSimilarity: 0.58,
            anonymize: false,
            startDate: null,
            endDate: null,
          },
          {
            semanticEnabled: true,
            minScore: 0.58,
            cacheMode: 'default',
            maxNeighbors: 4,
            semanticTimeoutMs: 3200,
            cacheTtlMs: 120000,
          },
        );

        if (!isMounted) return;
        setGraphModel(model);
      } catch (error: unknown) {
        if (!isMounted) return;
        const message = error instanceof Error
          ? error.message
          : 'Unable to evaluate rescue opportunities right now.';
        setScanError(message);
      } finally {
        if (isMounted) setScanLoading(false);
      }
    };

    const timer = window.setTimeout(run, 350);

    return () => {
      isMounted = false;
      window.clearTimeout(timer);
    };
  }, [callHistory]);

  // ────── Evaluate opportunities from graph ──────
  useEffect(() => {
    if (!graphModel) {
      setOpportunities([]);
      return;
    }

    const next = evaluateRescueOpportunities(graphModel, settings, actions, 5);
    setOpportunities(next);
  }, [actions, graphModel, settings]);

  const actionsWithResults = useMemo(() => {
    return actions.map((action) => enrichRescueActionWithResult(action, graphModel, callHistory, settings));
  }, [actions, callHistory, graphModel, settings]);

  const suggestion = useMemo(() => {
    return buildPlaybookSuggestion(actionsWithResults);
  }, [actionsWithResults]);

  // ────── Auto-generate monthly reports ──────
  useEffect(() => {
    const previousReports = reports;
    const next = ensureMonthlyReport(previousReports, actionsWithResults);
    if (next.length === previousReports.length && next.every((report, index) => report.id === previousReports[index]?.id)) {
      return;
    }
    setReports(next);
    // Persist new reports to API
    const newReports = next.filter(
      (report) => !previousReports.some((prev) => prev.id === report.id)
    );
    for (const report of newReports) {
      apiSaveReport(report).catch(console.warn);
    }
  }, [actionsWithResults]);

  // ────── Auto-rescue automation ──────
  useEffect(() => {
    if (settings.automationLevel === 'manual') return;
    if (!playbooks.length) return;

    const defaultPlaybook = playbooks.find((playbook) => playbook.enabled);
    if (!defaultPlaybook) return;

    const now = Date.now();
    const recentClusterIds = new Set(
      actions
        .filter((action) => {
          const executedAt = action.executedAt || action.triggerAt;
          const parsed = new Date(executedAt);
          return parsed.getTime() >= now - 30 * 24 * 60 * 60 * 1000;
        })
        .map((action) => action.clusterId),
    );

    const candidates = opportunities.filter((opportunity) => {
      if (recentClusterIds.has(opportunity.clusterId)) return false;
      if (settings.automationLevel === 'semi_auto') {
        return opportunity.potentialLossInr <= settings.autoRescueMaxPotentialLossInr;
      }
      return true;
    });

    if (!candidates.length) return;

    const actionsToAdd = candidates.slice(0, 2).map((opportunity) =>
      createRescueAction(opportunity, defaultPlaybook, settings, actions, {
        createdBy: 'automation',
      }),
    );

    setActions((prev) => [...actionsToAdd, ...prev]);

    // Persist to API
    for (const action of actionsToAdd) {
      apiSaveAction(action).catch(console.warn);
    }

    const newAudits = actionsToAdd.map((action) =>
      buildRescueAuditEntry(
        'auto_rescue_triggered',
        `Auto rescue executed for cluster ${action.clusterLabel} using ${action.playbookName}.`,
        { actor: 'Automation Engine', clusterId: action.clusterId, rescueActionId: action.id },
      ),
    );
    setAudits((prev) => [...newAudits, ...prev]);
    for (const audit of newAudits) {
      apiSaveAudit(audit).catch(console.warn);
    }
  }, [actions, opportunities, playbooks, settings]);

  const appendHistoryLogIfNeeded = useCallback((action: RescueActionRecord) => {
    if (action.status !== 'completed') return;
    if (historyLoggedActionIds.includes(action.id)) return;

    addToCallHistory(buildHistoryLog(action));
    setHistoryLoggedActionIds((prev) => [...prev, action.id]);
  }, [addToCallHistory, historyLoggedActionIds]);

  // ────── Execute due scheduled rescues ──────
  useEffect(() => {
    const timer = window.setInterval(() => {
      setActions((previous) => {
        const next = executeDueScheduledRescues(previous);
        const changedIds = next
          .filter((action) => {
            const before = previous.find((candidate) => candidate.id === action.id);
            if (!before) return false;
            return before.status !== 'completed' && action.status === 'completed';
          })
          .map((action) => action.id);

        if (!changedIds.length) return previous;

        const completedActions = next.filter((action) => changedIds.includes(action.id));
        completedActions.forEach((action) => {
          appendHistoryLogIfNeeded(action);
          // Persist status change to API
          apiUpdateAction(action).catch(console.warn);
        });

        const newAudits = completedActions.map((action) =>
          buildRescueAuditEntry(
            'scheduled_rescue_executed',
            `Scheduled rescue executed for ${action.clusterLabel}.`,
            { actor: 'Scheduler', clusterId: action.clusterId, rescueActionId: action.id },
          ),
        );
        setAudits((prev) => [...newAudits, ...prev]);
        for (const audit of newAudits) {
          apiSaveAudit(audit).catch(console.warn);
        }

        return next;
      });
    }, 30 * 1000);

    return () => window.clearInterval(timer);
  }, [appendHistoryLogIfNeeded]);

  const setGraphModelFromView = useCallback((model: CustomerGraphModel | null) => {
    if (!model) return;
    setGraphModel(model);
  }, []);

  const setPlaybooks = useCallback((next: RescuePlaybookTemplate[]) => {
    setPlaybooksState(next);
    updateKnowledgeBase({ rescuePlaybooks: next });
    // Persist to API
    syncPlaybooks(next).catch(console.warn);
  }, [updateKnowledgeBase]);

  const setSettings = useCallback((next: RescueEngineSettings) => {
    const normalized = {
      ...next,
      automationLevel: next.planTier === 'enterprise'
        ? next.automationLevel
        : (next.automationLevel === 'full_auto' ? 'manual' : next.automationLevel),
      riskThreshold: clamp(next.riskThreshold, 0.3, 0.95),
      growthThreshold: clamp(next.growthThreshold, 0.05, 1),
      autoRescueMaxPotentialLossInr: Math.max(50000, next.autoRescueMaxPotentialLossInr),
      compliance: {
        ...next.compliance,
        maxCustomersPerRescue: clamp(next.compliance.maxCustomersPerRescue, 1, 500),
        maxRescuesPerCustomerPerMonth: clamp(next.compliance.maxRescuesPerCustomerPerMonth, 1, 10),
      },
    } satisfies RescueEngineSettings;

    setSettingsState(normalized);
    updateKnowledgeBase({ rescueSettings: normalized });
    // Persist to API
    apiSaveSettings(normalized).catch(console.warn);
  }, [updateKnowledgeBase]);

  const dismissOpportunity = useCallback((opportunityId: string) => {
    setDismissedOpportunityIds((previous) => {
      if (previous.includes(opportunityId)) return previous;
      return [...previous, opportunityId];
    });
  }, []);

  const clearDismissedOpportunities = useCallback(() => {
    setDismissedOpportunityIds([]);
  }, []);

  const runRescueAction = useCallback((args: {
    opportunityId: string;
    playbookId: string;
    scheduledFor?: string;
    createdBy?: 'user' | 'automation';
  }) => {
    const opportunity = opportunities.find((item) => item.id === args.opportunityId);
    if (!opportunity) {
      return { ok: false, message: 'Opportunity no longer available.' };
    }

    const playbook = playbooks.find((item) => item.id === args.playbookId);
    if (!playbook) {
      return { ok: false, message: 'Selected playbook was not found.' };
    }

    const action = createRescueAction(opportunity, playbook, settings, actions, {
      scheduledFor: args.scheduledFor,
      createdBy: args.createdBy || 'user',
    });

    setActions((previous) => [action, ...previous]);

    // Persist action to API
    apiSaveAction(action).catch(console.warn);

    const auditEntry = buildRescueAuditEntry(
      'rescue_triggered',
      `Rescue started for ${opportunity.generatedClusterName} using ${playbook.name}.`,
      { actor: action.createdBy === 'automation' ? 'Automation Engine' : 'Operator', clusterId: action.clusterId, rescueActionId: action.id },
    );
    setAudits((previous) => [auditEntry, ...previous]);
    apiSaveAudit(auditEntry).catch(console.warn);

    appendHistoryLogIfNeeded(action);

    const message = action.status === 'completed'
      ? 'Rescue executed successfully.'
      : action.status === 'scheduled'
        ? 'Rescue scheduled successfully.'
        : 'Rescue created and waiting for manager approval.';

    return { ok: true, message, action };
  }, [actions, appendHistoryLogIfNeeded, opportunities, playbooks, settings]);

  const approveRescueAction = useCallback((actionId: string) => {
    const target = actions.find((action) => action.id === actionId);
    if (!target) return { ok: false, message: 'Rescue action not found.' };
    if (target.status !== 'requires_approval') {
      return { ok: false, message: 'This rescue action does not need approval.' };
    }

    const approved = {
      ...target,
      status: 'completed' as const,
      executedAt: new Date().toISOString(),
      dispatches: target.dispatches.map((dispatch) => {
        if (dispatch.status === 'scheduled') return { ...dispatch, status: 'sent' as const };
        return dispatch;
      }),
    };

    setActions((previous) => previous.map((action) => (action.id === actionId ? approved : action)));

    // Persist to API
    apiUpdateAction(approved).catch(console.warn);

    const auditEntry = buildRescueAuditEntry(
      'rescue_approved',
      `Manager approved rescue ${approved.id}.`,
      { actor: 'Manager', clusterId: approved.clusterId, rescueActionId: approved.id },
    );
    setAudits((previous) => [auditEntry, ...previous]);
    apiSaveAudit(auditEntry).catch(console.warn);

    appendHistoryLogIfNeeded(approved);

    return { ok: true, message: 'Rescue approved and executed.' };
  }, [actions, appendHistoryLogIfNeeded]);

  const cancelPendingClusterActions = useCallback((clusterId: string) => {
    const { updated, cancelledCount } = cancelPendingClusterRescues(actions, clusterId);
    if (cancelledCount === 0) {
      return { ok: false, message: 'No pending rescues found for this cluster.' };
    }

    setActions(updated);

    // Persist cancelled actions to API
    const cancelledActions = updated.filter(
      (action) => action.clusterId === clusterId && action.status === 'cancelled'
    );
    for (const action of cancelledActions) {
      apiUpdateAction(action).catch(console.warn);
    }

    const auditEntry = buildRescueAuditEntry(
      'pending_rescues_cancelled',
      `Cancelled ${cancelledCount} pending rescues for cluster ${clusterId}.`,
      { actor: 'Operator', clusterId },
    );
    setAudits((previous) => [auditEntry, ...previous]);
    apiSaveAudit(auditEntry).catch(console.warn);

    return { ok: true, message: `Cancelled ${cancelledCount} pending rescue actions.` };
  }, [actions]);

  const downloadConsentProof = useCallback((actionId: string) => {
    const action = actions.find((entry) => entry.id === actionId);
    if (!action) return;
    downloadConsentProofPdf(action);
  }, [actions]);

  const exportReportCsv = useCallback((reportId: string) => {
    const report = reports.find((item) => item.id === reportId);
    if (!report) return;

    const csv = reportToCsv(report);
    const url = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.id}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [reports]);

  const exportReportPdf = useCallback((reportId: string) => {
    const report = reports.find((item) => item.id === reportId);
    if (!report) return;

    const blob = buildReportPdf(report);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [reports]);

  const forwardReportByEmail = useCallback((reportId: string, email?: string) => {
    const report = reports.find((item) => item.id === reportId);
    if (!report) return;

    const subject = encodeURIComponent(`Protected Revenue Report - ${report.monthKey}`);
    const lines = [
      report.headline,
      '',
      ...report.rows.map((row) => `${row.cluster}: ${formatInr(row.revenueProtectedInr)} protected, ${Math.round(row.retentionRate * 100)}% retained.`),
    ];

    const body = encodeURIComponent(lines.join('\n'));
    window.location.href = `mailto:${email || ''}?subject=${subject}&body=${body}`;
  }, [reports]);

  const visibleBannerOpportunities = useMemo(() => {
    return opportunities
      .filter((opportunity) => !dismissedOpportunityIds.includes(opportunity.id))
      .slice(0, 2);
  }, [dismissedOpportunityIds, opportunities]);

  const value: RescueCenterContextValue = {
    scanLoading,
    scanError,
    graphModel,
    opportunities,
    visibleBannerOpportunities,
    playbooks,
    settings,
    actions,
    actionsWithResults,
    audits,
    reports,
    dismissedOpportunityIds,
    capability,
    suggestion,
    dataLoading,
    setGraphModelFromView,
    setPlaybooks,
    setSettings,
    dismissOpportunity,
    clearDismissedOpportunities,
    runRescueAction,
    approveRescueAction,
    cancelPendingClusterActions,
    downloadConsentProof,
    exportReportCsv,
    exportReportPdf,
    forwardReportByEmail,
  };

  return (
    <RescueCenterContext.Provider value={value}>
      {children}
    </RescueCenterContext.Provider>
  );
}

export function useRescueCenter() {
  const context = useContext(RescueCenterContext);
  if (!context) {
    throw new Error('useRescueCenter must be used within RescueCenterProvider');
  }
  return context;
}
