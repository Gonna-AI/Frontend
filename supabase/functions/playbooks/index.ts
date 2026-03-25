import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { insertNotification } from "../_shared/notify.ts";

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
    // Prepare call transcripts for analysis
    const callSummaries = calls
      .slice(0, 20)  // Last 20 calls
      .map(call => ({
        duration: call.duration,
        category: call.category,
        priority: call.priority,
        sentiment: call.summary?.sentiment,
        mainPoints: call.summary?.mainPoints || [],
        topics: call.summary?.topics || [],
      }));

    const prompt = `Analyze these ${callSummaries.length} call records and identify patterns that could become reusable playbook templates:

${JSON.stringify(callSummaries, null, 2)}

For each distinct pattern you identify, create a playbook template with:
1. name: short, descriptive name for the playbook
2. description: what situations trigger this playbook
3. trigger_keywords: array of words/phrases that indicate this scenario
4. recommended_actions: array of suggested actions to take
5. success_indicators: array of metrics/outcomes that show success

Return a JSON array of 3-5 templates. Only return valid JSON, no other text.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2000,
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

      // Fetch user's calls in date range
      const { data: calls, error: callsError } = await adminClient
        .from('call_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });

      if (callsError) throw callsError;

      if (!calls || calls.length === 0) {
        return jsonResponse(req, 400, { error: 'No calls found in date range' });
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

      await insertNotification(adminClient, user.id, {
        type: 'success',
        title: 'Playbooks generated',
        message: `${saved?.length ?? templates.length} playbook${(saved?.length ?? templates.length) !== 1 ? 's' : ''} generated from your call history.`,
        category: 'system',
        action_url: '/dashboard?tab=playbooks',
      });

      return jsonResponse(req, 201, { templates: saved });
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
