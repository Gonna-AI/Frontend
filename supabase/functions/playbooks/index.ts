import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsBaseHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

function corsHeadersFor(req: Request): Record<string, string> {
  const requestOrigin = req.headers.get('Origin');
  const allowedOrigin = requestOrigin?.includes('localhost') || requestOrigin?.includes('127.0.0.1')
    ? requestOrigin
    : 'https://clerktree.com';
  return {
    ...corsBaseHeaders,
    'Access-Control-Allow-Origin': allowedOrigin,
  };
}

function jsonResponse(req: Request, status: number, payload: Record<string, unknown>) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeadersFor(req), 'Content-Type': 'application/json' },
  });
}

async function analyzeCallHistoryWithAI(
  calls: any[],
  apiKey: string
): Promise<{ templates: any[]; error?: string }> {
  try {
    const callSummaries = calls
      .slice(0, 30)
      .map(call => ({
        duration: call.duration,
        category: typeof call.category === 'object' ? call.category?.name || call.category : call.category,
        priority: call.priority,
        sentiment: call.sentiment || call.summary?.sentiment,
        tags: call.tags || [],
        mainPoints: call.summary?.mainPoints || [],
        topics: call.summary?.topics || [],
        followUpRequired: call.follow_up_required,
      }));

    const prompt = `You are a customer success analyst. Analyze ${callSummaries.length} support call records and identify recurring patterns that should become reusable rescue playbook templates.

Call data:
${JSON.stringify(callSummaries, null, 2)}

Instructions:
- Look for recurring issue types, sentiment clusters, high-priority patterns, and common topics
- Generate 3-5 actionable playbook templates
- Each template must have:
  1. name: concise, action-oriented name (e.g. "Billing Dispute Fast-Track")
  2. description: 1-2 sentences describing when and why to use this playbook
  3. trigger_keywords: 4-8 keywords/phrases that signal this scenario
  4. recommended_actions: 3-6 concrete steps the support team should take
  5. success_indicators: 2-4 measurable outcomes that confirm success

Return ONLY a valid JSON array, no markdown, no explanation:
[{"name":"...","description":"...","trigger_keywords":[...],"recommended_actions":[...],"success_indicators":[...]}]`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Groq API error: ${error}`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;
    if (!content) throw new Error('No response from AI');

    // Parse JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('Could not extract JSON from AI response');

    const templates = JSON.parse(jsonMatch[0]);
    return { templates };
  } catch (error) {
    return {
      templates: [],
      error: error instanceof Error ? error.message : 'AI analysis failed',
    };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeadersFor(req) });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const groqApiKey = Deno.env.get('GROQ_API_KEY')!;

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse(req, 401, { error: 'Unauthorized' });
    }

    // Authenticate user
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return jsonResponse(req, 401, { error: 'Unauthorized' });
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);

    // ─── POST: Generate playbooks from call history ─────────────────
    if (req.method === 'POST') {
      const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
      const startDate = body.start_date as string;
      const endDate = body.end_date as string;

      if (!startDate || !endDate) {
        return jsonResponse(req, 400, { error: 'start_date and end_date required' });
      }

      // Fetch user's calls in date range from call_history
      const { data: calls, error: callsError } = await adminClient
        .from('call_history')
        .select('duration, category, priority, sentiment, tags, summary, follow_up_required, created_at')
        .eq('user_id', user.id)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false })
        .limit(100);

      if (callsError) throw callsError;

      if (!calls || calls.length === 0) {
        return jsonResponse(req, 400, { error: 'No calls found in the selected date range. Try a wider range.' });
      }

      // Call AI to analyze and generate templates
      const { templates, error: aiError } = await analyzeCallHistoryWithAI(calls, groqApiKey);

      if (aiError) {
        return jsonResponse(req, 500, { error: aiError });
      }

      // Save templates to database
      const templateRecords = templates.map((t: any) => ({
        user_id: user.id,
        name: t.name,
        description: t.description,
        trigger_keywords: t.trigger_keywords,
        recommended_actions: t.recommended_actions,
        success_indicators: t.success_indicators,
        source: 'ai_generated',
        call_analysis_date_range: `["${startDate}","${endDate}"]`,
        confidence_score: 0.8,
      }));

      const { data: saved, error: saveError } = await adminClient
        .from('playbook_templates')
        .insert(templateRecords)
        .select();

      if (saveError) throw saveError;

      return jsonResponse(req, 201, { playbooks: saved, call_count: calls.length });
    }

    // ─── GET: List playbooks ───────────────────────────────────────
    if (req.method === 'GET') {
      const { data, error } = await adminClient
        .from('playbook_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return jsonResponse(req, 200, { playbooks: data });
    }

    // ─── DELETE: Remove playbook ────────────────────────────────────
    if (req.method === 'DELETE') {
      const url = new URL(req.url);
      const id = url.searchParams.get('id');
      if (!id) {
        return jsonResponse(req, 400, { error: 'Missing id' });
      }

      const { error } = await adminClient
        .from('playbook_templates')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      return jsonResponse(req, 200, { success: true });
    }

    return jsonResponse(req, 404, { error: 'Not found' });
  } catch (error) {
    console.error('[playbooks] error:', error);
    return jsonResponse(req, 500, {
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});
