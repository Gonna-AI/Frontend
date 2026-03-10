export type RescueChannel = 'whatsapp' | 'voice' | 'email' | 'in_app';

export type RescueAutomationLevel = 'manual' | 'semi_auto' | 'full_auto';

export type RescuePlanTier = 'free' | 'pro' | 'enterprise';

export type RescueActionStatus = 'scheduled' | 'requires_approval' | 'completed' | 'cancelled';

export interface RescuePlaybookVersion {
  id: string;
  createdAt: string;
  messageTemplate: string;
  creditAmountInr: number;
  discountPercent: number;
  successCriteria: string;
  note?: string;
}

export interface RescuePlaybookTemplate {
  id: string;
  name: string;
  description: string;
  channels: RescueChannel[];
  messageTemplate: string;
  voiceScript: string;
  creditAmountInr: number;
  discountPercent: number;
  successCriteria: string;
  enabled: boolean;
  versions: RescuePlaybookVersion[];
  abTestEnabled: boolean;
}

export interface RescueComplianceSettings {
  maxCustomersPerRescue: number;
  maxRescuesPerCustomerPerMonth: number;
  requireManagerApprovalAboveInr: number;
  optedOutCustomerIds: string[];
}

export interface RescueEngineSettings {
  riskThreshold: number;
  growthThreshold: number;
  automationLevel: RescueAutomationLevel;
  planTier: RescuePlanTier;
  avgMonthlyRevenuePerCustomerInr: number;
  autoRescueMaxPotentialLossInr: number;
  successFeePercent: number;
  rescueInsuranceEnabled: boolean;
  compliance: RescueComplianceSettings;
}

export interface RescueOpportunity {
  id: string;
  clusterId: string;
  clusterLabel: string;
  generatedClusterName: string;
  memberIds: string[];
  memberNames: string[];
  memberCount: number;
  riskScore: number;
  opportunityScore: number;
  similarityScore: number;
  sizeGrowth: number;
  potentialLossInr: number;
  expectedRescueRetention: number;
  lastSimilarClusterRetention: number;
  triggerReasons: string[];
}

export type RescueDispatchStatus = 'sent' | 'scheduled' | 'blocked_opt_out' | 'rate_limited';

export interface RescueDispatchRecord {
  customerId: string;
  customerName: string;
  channels: RescueChannel[];
  status: RescueDispatchStatus;
  reason?: string;
}

export interface RescueActionResult {
  retentionRate: number;
  controlGroupRetentionRate: number;
  retentionLift: number;
  revenueProtectedInr: number;
  churnAvoidedInr: number;
  complaintsDropPercent: number;
}

export interface RescueActionRecord {
  id: string;
  opportunityId: string;
  clusterId: string;
  clusterLabel: string;
  memberIds: string[];
  memberNames: string[];
  memberCount: number;
  playbookId: string;
  playbookName: string;
  playbookSnapshot: RescuePlaybookTemplate;
  channels: RescueChannel[];
  triggerAt: string;
  scheduledFor?: string;
  executedAt?: string;
  status: RescueActionStatus;
  estimatedCostInr: number;
  potentialLossInr: number;
  consentStatus: 'verified' | 'pending';
  proofId: string;
  proofSummary: string;
  dispatches: RescueDispatchRecord[];
  createdBy: 'user' | 'automation';
}

export interface RescueActionWithResult extends RescueActionRecord {
  result: RescueActionResult;
}

export interface RescueAuditEntry {
  id: string;
  at: string;
  actor: string;
  action: string;
  clusterId?: string;
  rescueActionId?: string;
  details: string;
}

export interface ProtectedRevenueReportRow {
  cluster: string;
  customers: number;
  rescueType: string;
  revenueProtectedInr: number;
  retentionRate: number;
}

export interface ProtectedRevenueReport {
  id: string;
  monthKey: string;
  generatedAt: string;
  headline: string;
  totalProtectedInr: number;
  clusterCount: number;
  rows: ProtectedRevenueReportRow[];
}

export const DEFAULT_RESCUE_PLAYBOOKS: RescuePlaybookTemplate[] = [
  {
    id: 'priority-callback',
    name: 'Priority Callback',
    description: 'Schedule a priority callback for at-risk customers to resolve their issues directly.',
    channels: ['voice'],
    messageTemplate: 'Follow up with {{customer_name}} via priority callback. Address their concerns and document resolution.',
    voiceScript: 'Hello {{customer_name}}, we noticed you may have had a less-than-ideal experience. We want to make things right — how can we help?',
    creditAmountInr: 0,
    discountPercent: 0,
    successCriteria: 'Customer issue resolved and follow-up documented within 7 days.',
    enabled: true,
    abTestEnabled: false,
    versions: [
      {
        id: 'v1',
        createdAt: new Date('2026-02-01T00:00:00.000Z').toISOString(),
        messageTemplate: 'Follow up with {{customer_name}} via priority callback. Address their concerns and document resolution.',
        creditAmountInr: 0,
        discountPercent: 0,
        successCriteria: 'Customer issue resolved and follow-up documented within 7 days.',
        note: 'Initial version',
      },
    ],
  },
  {
    id: 'email-outreach',
    name: 'Personal Email Outreach',
    description: 'Send a personal follow-up email addressing specific customer concerns.',
    channels: ['email'],
    messageTemplate: 'Send personal email to {{customer_name}} addressing their recent experience. Reference specific issues from their interaction history.',
    voiceScript: '',
    creditAmountInr: 0,
    discountPercent: 0,
    successCriteria: 'Customer responds or returns for a new interaction within 14 days.',
    enabled: true,
    abTestEnabled: false,
    versions: [
      {
        id: 'v1',
        createdAt: new Date('2026-02-01T00:00:00.000Z').toISOString(),
        messageTemplate: 'Send personal email to {{customer_name}} addressing their recent experience. Reference specific issues from their interaction history.',
        creditAmountInr: 0,
        discountPercent: 0,
        successCriteria: 'Customer responds or returns for a new interaction within 14 days.',
      },
    ],
  },
  {
    id: 'internal-escalation',
    name: 'Internal Escalation',
    description: 'Flag this cluster for team review and create an internal action item.',
    channels: ['in_app'],
    messageTemplate: 'Escalate cluster containing {{customer_name}} for internal review. Document risk factors and assign follow-up owner.',
    voiceScript: '',
    creditAmountInr: 0,
    discountPercent: 0,
    successCriteria: 'Team reviews cluster within 48 hours and assigns action owner.',
    enabled: true,
    abTestEnabled: false,
    versions: [
      {
        id: 'v1',
        createdAt: new Date('2026-02-01T00:00:00.000Z').toISOString(),
        messageTemplate: 'Escalate cluster containing {{customer_name}} for internal review. Document risk factors and assign follow-up owner.',
        creditAmountInr: 0,
        discountPercent: 0,
        successCriteria: 'Team reviews cluster within 48 hours and assigns action owner.',
      },
    ],
  },
];

export const DEFAULT_RESCUE_SETTINGS: RescueEngineSettings = {
  riskThreshold: 0.5,
  growthThreshold: 0.2,
  automationLevel: 'manual',
  planTier: 'pro',
  avgMonthlyRevenuePerCustomerInr: 12000,
  autoRescueMaxPotentialLossInr: 200000,
  successFeePercent: 10,
  rescueInsuranceEnabled: false,
  compliance: {
    maxCustomersPerRescue: 500,
    maxRescuesPerCustomerPerMonth: 2,
    requireManagerApprovalAboveInr: 500000,
    optedOutCustomerIds: [],
  },
};
