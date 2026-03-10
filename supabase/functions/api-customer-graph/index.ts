import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { buildGraphModel } from "./logic.ts";

const corsBaseHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
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

function jsonResponse(data: unknown, status: number, cors: Record<string, string>) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !anonKey) {
      console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
      return jsonResponse({ error: 'Server configuration error' }, 500, corsHeaders);
    }

    const supabaseClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: req.headers.get('Authorization')! } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return jsonResponse({ error: 'Unauthorized' }, 401, corsHeaders);
    }

    let body: Record<string, unknown> = {};
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ error: 'Invalid JSON body' }, 400, corsHeaders);
    }

    const { filters, enrichWithAI = false } = body;

    // Fetch user's call history from database
    const { data: callHistoryData, error: fetchError } = await supabaseClient
      .from('call_history')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(1000);

    if (fetchError) {
      console.error('call_history fetch error:', fetchError);

      // Distinguish between "table doesn't exist" and other errors
      if (fetchError.message?.includes('does not exist') || fetchError.code === '42P01') {
        return jsonResponse({
          error: 'Call history table not found. Please ensure your database is set up correctly.',
          code: 'TABLE_NOT_FOUND',
        }, 500, corsHeaders);
      }

      return jsonResponse({
        error: `Failed to fetch call history: ${fetchError.message}`,
      }, 500, corsHeaders);
    }

    const callHistory = callHistoryData || [];

    // Return empty model if no call history exists
    if (callHistory.length === 0) {
      return jsonResponse({
        generatedAt: new Date().toISOString(),
        profiles: [],
        edges: [],
        clusters: [],
        stats: {
          totalCustomers: 0,
          totalEdges: 0,
          totalClusters: 0,
          highRiskClusters: 0,
          opportunityClusters: 0,
        },
        _meta: { source: 'empty', callHistoryCount: 0 },
      }, 200, corsHeaders);
    }

    // Provide default filters if not passed
    const activeFilters = {
      interactionType: 'all',
      minSimilarity: 0.58,
      anonymize: false,
      startDate: null,
      endDate: null,
      ...(filters || {}),
    };

    const groqApiKey = Deno.env.get('GROQ_API_KEY');

    const graphModel = await buildGraphModel(
      callHistory,
      activeFilters,
      enrichWithAI === true,
      groqApiKey,
    );

    return jsonResponse({
      ...graphModel,
      _meta: {
        source: 'database',
        callHistoryCount: callHistory.length,
        enrichedWithAI: enrichWithAI === true && !!groqApiKey,
      },
    }, 200, corsHeaders);

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('Error generating graph:', error);
    return jsonResponse({ error: message }, 500, corsHeaders);
  }
});
