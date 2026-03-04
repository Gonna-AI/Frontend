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
    id: 'goodwill-credit-whatsapp',
    name: '15% Goodwill Credit + WhatsApp Apology',
    description: 'Fast trust recovery with instant credit and an apology message.',
    channels: ['whatsapp', 'email'],
    messageTemplate: 'Hi {{customer_name}}, we are sorry about your recent experience. We have added a {{credit_percent}}% goodwill credit to your account. Reply here for priority help from a specialist.',
    voiceScript: 'Hello {{customer_name}}, we are sorry for the inconvenience. We have issued your goodwill credit and assigned your case to a priority specialist.',
    creditAmountInr: 1500,
    discountPercent: 15,
    successCriteria: 'Customer responds positively or completes another paid interaction within 14 days.',
    enabled: true,
    abTestEnabled: false,
    versions: [
      {
        id: 'v1',
        createdAt: new Date('2026-02-01T00:00:00.000Z').toISOString(),
        messageTemplate: 'Hi {{customer_name}}, we are sorry about your recent experience. We have added a {{credit_percent}}% goodwill credit to your account. Reply here for priority help from a specialist.',
        creditAmountInr: 1500,
        discountPercent: 15,
        successCriteria: 'Customer responds positively or completes another paid interaction within 14 days.',
        note: 'Base launch version',
      },
    ],
  },
  {
    id: 'priority-callback-slot',
    name: 'Priority Voice Callback Slot Booked',
    description: 'Escalates high-friction issues with a pre-booked specialist callback.',
    channels: ['voice', 'whatsapp', 'email'],
    messageTemplate: 'Hi {{customer_name}}, your priority callback has been booked for {{callback_slot}}. Please reply YES to confirm and we will call you first.',
    voiceScript: 'Hi {{customer_name}}, this is a priority callback from support. We reserved a dedicated slot to resolve your issue today.',
    creditAmountInr: 500,
    discountPercent: 0,
    successCriteria: 'Callback completed and issue marked resolved in one touch.',
    enabled: true,
    abTestEnabled: false,
    versions: [
      {
        id: 'v1',
        createdAt: new Date('2026-02-01T00:00:00.000Z').toISOString(),
        messageTemplate: 'Hi {{customer_name}}, your priority callback has been booked for {{callback_slot}}. Please reply YES to confirm and we will call you first.',
        creditAmountInr: 500,
        discountPercent: 0,
        successCriteria: 'Callback completed and issue marked resolved in one touch.',
      },
    ],
  },
  {
    id: 'free-upgrade-human-followup',
    name: 'Free Upgrade + Human Follow-up',
    description: 'Proactive upgrade for high-value accounts plus human ownership.',
    channels: ['whatsapp', 'email', 'in_app'],
    messageTemplate: 'Hi {{customer_name}}, we have upgraded your plan at no cost for this cycle and assigned a human success manager for personal follow-up.',
    voiceScript: 'Hello {{customer_name}}, we upgraded your account for this cycle and assigned a success manager for your follow-up.',
    creditAmountInr: 2500,
    discountPercent: 20,
    successCriteria: 'Customer remains active and submits no new severe complaints in 30 days.',
    enabled: true,
    abTestEnabled: false,
    versions: [
      {
        id: 'v1',
        createdAt: new Date('2026-02-01T00:00:00.000Z').toISOString(),
        messageTemplate: 'Hi {{customer_name}}, we have upgraded your plan at no cost for this cycle and assigned a human success manager for personal follow-up.',
        creditAmountInr: 2500,
        discountPercent: 20,
        successCriteria: 'Customer remains active and submits no new severe complaints in 30 days.',
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
