import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsBaseHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

const DEFAULT_ALLOWED_ORIGINS = new Set<string>([
  'https://clerktree.com',
  'https://www.clerktree.com',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://clerktree.netlify.app',
]);

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin');
  const allowedOrigin = origin && DEFAULT_ALLOWED_ORIGINS.has(origin)
    ? origin
    : 'https://clerktree.com';
  return {
    ...corsBaseHeaders,
    'Access-Control-Allow-Origin': allowedOrigin,
  };
}

function jsonResponse(data: unknown, status: number, corsHeaders: Record<string, string>) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}


Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: req.headers.get('Authorization')! } },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return jsonResponse({ error: 'Unauthorized' }, 401, corsHeaders);
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    // Expected paths: /api-rescue-playbooks/{resource}
    // resource: playbooks, settings, actions, audits, reports, seed
    const resource = pathParts[pathParts.length - 1] || '';

    // ────── PLAYBOOKS ──────
    if (resource === 'playbooks') {
      if (req.method === 'GET') {
        const { data, error } = await supabaseClient
          .from('rescue_playbooks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        if (error) return jsonResponse({ error: error.message }, 500, corsHeaders);

        return jsonResponse({ playbooks: (data || []).map(mapPlaybookFromDb) }, 200, corsHeaders);
      }

      if (req.method === 'POST') {
        const body = await req.json();
        const playbook = body.playbook;
        if (!playbook || !playbook.id || !playbook.name) {
          return jsonResponse({ error: 'Missing playbook data' }, 400, corsHeaders);
        }

        const row = mapPlaybookToDb(playbook, user.id);
        const { data, error } = await supabaseClient
          .from('rescue_playbooks')
          .upsert(row, { onConflict: 'id' })
          .select()
          .single();

        if (error) return jsonResponse({ error: error.message }, 500, corsHeaders);
        return jsonResponse({ playbook: mapPlaybookFromDb(data) }, 200, corsHeaders);
      }

      if (req.method === 'PUT') {
        const body = await req.json();
        const playbooks = body.playbooks;
        if (!Array.isArray(playbooks)) {
          return jsonResponse({ error: 'Expected playbooks array' }, 400, corsHeaders);
        }

        // Delete existing and re-insert (bulk sync)
        await supabaseClient.from('rescue_playbooks').delete().eq('user_id', user.id);

        const rows = playbooks.map((pb: any) => mapPlaybookToDb(pb, user.id));
        const { data, error } = await supabaseClient
          .from('rescue_playbooks')
          .insert(rows)
          .select();

        if (error) return jsonResponse({ error: error.message }, 500, corsHeaders);
        return jsonResponse({ playbooks: (data || []).map(mapPlaybookFromDb) }, 200, corsHeaders);
      }

      if (req.method === 'DELETE') {
        const body = await req.json();
        const playbookId = body.id;
        if (!playbookId) return jsonResponse({ error: 'Missing id' }, 400, corsHeaders);

        const { error } = await supabaseClient
          .from('rescue_playbooks')
          .delete()
          .eq('id', playbookId)
          .eq('user_id', user.id);

        if (error) return jsonResponse({ error: error.message }, 500, corsHeaders);
        return jsonResponse({ ok: true }, 200, corsHeaders);
      }
    }

    // ────── SETTINGS ──────
    if (resource === 'settings') {
      if (req.method === 'GET') {
        const { data, error } = await supabaseClient
          .from('rescue_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) return jsonResponse({ error: error.message }, 500, corsHeaders);

        if (!data) {
          // Seed default settings
          const defaultRow = {
            user_id: user.id,
            risk_threshold: 0.5,
            growth_threshold: 0.2,
            automation_level: 'manual',
            plan_tier: 'pro',
            avg_monthly_revenue_per_customer_inr: 12000,
            auto_rescue_max_potential_loss_inr: 200000,
            success_fee_percent: 10,
            rescue_insurance_enabled: false,
            compliance: { maxCustomersPerRescue: 500, maxRescuesPerCustomerPerMonth: 2, requireManagerApprovalAboveInr: 500000, optedOutCustomerIds: [] },
          };

          const { data: insertedData, error: insertError } = await supabaseClient
            .from('rescue_settings')
            .insert(defaultRow)
            .select()
            .single();

          if (insertError) return jsonResponse({ error: insertError.message }, 500, corsHeaders);
          return jsonResponse({ settings: mapSettingsFromDb(insertedData) }, 200, corsHeaders);
        }

        return jsonResponse({ settings: mapSettingsFromDb(data) }, 200, corsHeaders);
      }

      if (req.method === 'PUT') {
        const body = await req.json();
        const settings = body.settings;
        if (!settings) return jsonResponse({ error: 'Missing settings' }, 400, corsHeaders);

        const row = mapSettingsToDb(settings, user.id);
        const { data, error } = await supabaseClient
          .from('rescue_settings')
          .upsert(row, { onConflict: 'user_id' })
          .select()
          .single();

        if (error) return jsonResponse({ error: error.message }, 500, corsHeaders);
        return jsonResponse({ settings: mapSettingsFromDb(data) }, 200, corsHeaders);
      }
    }

    // ────── ACTIONS ──────
    if (resource === 'actions') {
      if (req.method === 'GET') {
        const { data, error } = await supabaseClient
          .from('rescue_actions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(200);

        if (error) return jsonResponse({ error: error.message }, 500, corsHeaders);
        return jsonResponse({ actions: (data || []).map(mapActionFromDb) }, 200, corsHeaders);
      }

      if (req.method === 'POST') {
        const body = await req.json();
        const action = body.action;
        if (!action || !action.id) return jsonResponse({ error: 'Missing action data' }, 400, corsHeaders);

        const row = mapActionToDb(action, user.id);
        const { data, error } = await supabaseClient
          .from('rescue_actions')
          .upsert(row, { onConflict: 'id' })
          .select()
          .single();

        if (error) return jsonResponse({ error: error.message }, 500, corsHeaders);
        return jsonResponse({ action: mapActionFromDb(data) }, 200, corsHeaders);
      }

      if (req.method === 'PUT') {
        const body = await req.json();
        const action = body.action;
        if (!action || !action.id) return jsonResponse({ error: 'Missing action data' }, 400, corsHeaders);

        const row = mapActionToDb(action, user.id);
        const { data, error } = await supabaseClient
          .from('rescue_actions')
          .update(row)
          .eq('id', action.id)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) return jsonResponse({ error: error.message }, 500, corsHeaders);
        return jsonResponse({ action: mapActionFromDb(data) }, 200, corsHeaders);
      }
    }

    // ────── AUDITS ──────
    if (resource === 'audits') {
      if (req.method === 'GET') {
        const limit = parseInt(url.searchParams.get('limit') || '100');
        const { data, error } = await supabaseClient
          .from('rescue_audit_log')
          .select('*')
          .eq('user_id', user.id)
          .order('at', { ascending: false })
          .limit(limit);

        if (error) return jsonResponse({ error: error.message }, 500, corsHeaders);
        return jsonResponse({ audits: (data || []).map(mapAuditFromDb) }, 200, corsHeaders);
      }

      if (req.method === 'POST') {
        const body = await req.json();
        const audit = body.audit;
        if (!audit || !audit.id) return jsonResponse({ error: 'Missing audit data' }, 400, corsHeaders);

        const row = {
          id: audit.id,
          user_id: user.id,
          at: audit.at || new Date().toISOString(),
          actor: audit.actor || 'System',
          action: audit.action,
          cluster_id: audit.clusterId || null,
          rescue_action_id: audit.rescueActionId || null,
          details: audit.details || '',
        };

        const { data, error } = await supabaseClient
          .from('rescue_audit_log')
          .insert(row)
          .select()
          .single();

        if (error) return jsonResponse({ error: error.message }, 500, corsHeaders);
        return jsonResponse({ audit: mapAuditFromDb(data) }, 200, corsHeaders);
      }
    }

    // ────── REPORTS ──────
    if (resource === 'reports') {
      if (req.method === 'GET') {
        const { data, error } = await supabaseClient
          .from('rescue_reports')
          .select('*')
          .eq('user_id', user.id)
          .order('generated_at', { ascending: false })
          .limit(24);

        if (error) return jsonResponse({ error: error.message }, 500, corsHeaders);
        return jsonResponse({ reports: (data || []).map(mapReportFromDb) }, 200, corsHeaders);
      }

      if (req.method === 'POST') {
        const body = await req.json();
        const report = body.report;
        if (!report || !report.id) return jsonResponse({ error: 'Missing report data' }, 400, corsHeaders);

        const row = {
          id: report.id,
          user_id: user.id,
          month_key: report.monthKey,
          generated_at: report.generatedAt || new Date().toISOString(),
          headline: report.headline || '',
          total_protected_inr: report.totalProtectedInr || 0,
          cluster_count: report.clusterCount || 0,
          rows: report.rows || [],
        };

        const { data, error } = await supabaseClient
          .from('rescue_reports')
          .upsert(row, { onConflict: 'id' })
          .select()
          .single();

        if (error) return jsonResponse({ error: error.message }, 500, corsHeaders);
        return jsonResponse({ report: mapReportFromDb(data) }, 200, corsHeaders);
      }
    }

    return jsonResponse({ error: `Unknown resource: ${resource}` }, 404, corsHeaders);
  } catch (error: any) {
    console.error('Rescue playbooks API error:', error);
    return jsonResponse(
      { error: error.message || 'Internal Server Error' },
      500,
      getCorsHeaders(req)
    );
  }
});

// ────── DB <-> Frontend type mappers ──────

function mapPlaybookFromDb(row: any) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    channels: row.channels || [],
    messageTemplate: row.message_template,
    voiceScript: row.voice_script,
    creditAmountInr: Number(row.credit_amount_inr),
    discountPercent: Number(row.discount_percent),
    successCriteria: row.success_criteria,
    enabled: row.enabled,
    abTestEnabled: row.ab_test_enabled,
    versions: row.versions || [],
  };
}

function mapPlaybookToDb(pb: any, userId: string) {
  return {
    id: pb.id,
    user_id: userId,
    name: pb.name,
    description: pb.description || '',
    channels: pb.channels || [],
    message_template: pb.messageTemplate || '',
    voice_script: pb.voiceScript || '',
    credit_amount_inr: pb.creditAmountInr || 0,
    discount_percent: pb.discountPercent || 0,
    success_criteria: pb.successCriteria || '',
    enabled: pb.enabled ?? true,
    ab_test_enabled: pb.abTestEnabled ?? false,
    versions: pb.versions || [],
    updated_at: new Date().toISOString(),
  };
}

function mapSettingsFromDb(row: any) {
  return {
    riskThreshold: Number(row.risk_threshold),
    growthThreshold: Number(row.growth_threshold),
    automationLevel: row.automation_level,
    planTier: row.plan_tier,
    avgMonthlyRevenuePerCustomerInr: Number(row.avg_monthly_revenue_per_customer_inr),
    autoRescueMaxPotentialLossInr: Number(row.auto_rescue_max_potential_loss_inr),
    successFeePercent: Number(row.success_fee_percent),
    rescueInsuranceEnabled: row.rescue_insurance_enabled,
    compliance: row.compliance || {
      maxCustomersPerRescue: 500,
      maxRescuesPerCustomerPerMonth: 2,
      requireManagerApprovalAboveInr: 500000,
      optedOutCustomerIds: [],
    },
  };
}

function mapSettingsToDb(settings: any, userId: string) {
  return {
    user_id: userId,
    risk_threshold: settings.riskThreshold,
    growth_threshold: settings.growthThreshold,
    automation_level: settings.automationLevel,
    plan_tier: settings.planTier,
    avg_monthly_revenue_per_customer_inr: settings.avgMonthlyRevenuePerCustomerInr,
    auto_rescue_max_potential_loss_inr: settings.autoRescueMaxPotentialLossInr,
    success_fee_percent: settings.successFeePercent,
    rescue_insurance_enabled: settings.rescueInsuranceEnabled,
    compliance: settings.compliance || {},
    updated_at: new Date().toISOString(),
  };
}

function mapActionFromDb(row: any) {
  return {
    id: row.id,
    opportunityId: row.opportunity_id,
    clusterId: row.cluster_id,
    clusterLabel: row.cluster_label,
    memberIds: row.member_ids || [],
    memberNames: row.member_names || [],
    memberCount: row.member_count,
    playbookId: row.playbook_id,
    playbookName: row.playbook_name,
    playbookSnapshot: row.playbook_snapshot || {},
    channels: row.channels || [],
    triggerAt: row.trigger_at,
    scheduledFor: row.scheduled_for || undefined,
    executedAt: row.executed_at || undefined,
    status: row.status,
    estimatedCostInr: Number(row.estimated_cost_inr),
    potentialLossInr: Number(row.potential_loss_inr),
    consentStatus: row.consent_status,
    proofId: row.proof_id,
    proofSummary: row.proof_summary,
    dispatches: row.dispatches || [],
    createdBy: row.created_by,
  };
}

function mapActionToDb(action: any, userId: string) {
  return {
    id: action.id,
    user_id: userId,
    opportunity_id: action.opportunityId,
    cluster_id: action.clusterId,
    cluster_label: action.clusterLabel || '',
    member_ids: action.memberIds || [],
    member_names: action.memberNames || [],
    member_count: action.memberCount || 0,
    playbook_id: action.playbookId,
    playbook_name: action.playbookName || '',
    playbook_snapshot: action.playbookSnapshot || {},
    channels: action.channels || [],
    trigger_at: action.triggerAt || new Date().toISOString(),
    scheduled_for: action.scheduledFor || null,
    executed_at: action.executedAt || null,
    status: action.status,
    estimated_cost_inr: action.estimatedCostInr || 0,
    potential_loss_inr: action.potentialLossInr || 0,
    consent_status: action.consentStatus || 'pending',
    proof_id: action.proofId || '',
    proof_summary: action.proofSummary || '',
    dispatches: action.dispatches || [],
    created_by: action.createdBy || 'user',
  };
}

function mapAuditFromDb(row: any) {
  return {
    id: row.id,
    at: row.at,
    actor: row.actor,
    action: row.action,
    clusterId: row.cluster_id || undefined,
    rescueActionId: row.rescue_action_id || undefined,
    details: row.details,
  };
}

function mapReportFromDb(row: any) {
  return {
    id: row.id,
    monthKey: row.month_key,
    generatedAt: row.generated_at,
    headline: row.headline,
    totalProtectedInr: Number(row.total_protected_inr),
    clusterCount: row.cluster_count,
    rows: row.rows || [],
  };
}
