import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// ─── CORS ────────────────────────────────────────────────────────
const corsBaseHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

const DEFAULT_ALLOWED_ORIGINS = new Set<string>([
  'https://clerktree.com',
  'https://www.clerktree.com',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://clerktree.netlify.app',
]);

const EXTRA_ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') ?? '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

for (const o of EXTRA_ALLOWED_ORIGINS) DEFAULT_ALLOWED_ORIGINS.add(o);

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true;
  if (DEFAULT_ALLOWED_ORIGINS.has(origin)) return true;
  try {
    const url = new URL(origin);
    if (['localhost', '127.0.0.1', '::1'].includes(url.hostname)) return true;
    return url.protocol === 'https:' && (
      url.hostname === 'clerktree.com' || url.hostname.endsWith('.clerktree.com')
    );
  } catch { return false; }
}

function corsHeadersFor(req: Request): Record<string, string> {
  const origin = req.headers.get('origin');
  const allowedOrigin = origin && isAllowedOrigin(origin) ? origin : 'https://clerktree.com';
  return { ...corsBaseHeaders, 'Access-Control-Allow-Origin': allowedOrigin, 'Vary': 'Origin' };
}

function json(req: Request, status: number, payload: unknown) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeadersFor(req), 'Content-Type': 'application/json' },
  });
}

// ─── Types ───────────────────────────────────────────────────────
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface RequestBody {
  messages: ChatMessage[];
  mode: 'chat' | 'generate';
  documentText?: string;
}

// ─── System prompts ──────────────────────────────────────────────
const CHAT_SYSTEM_PROMPT = `You are an AI configuration assistant helping a business set up their AI call agent on ClerkTree. Your job is to gather the key information needed to configure their agent, then signal when you have enough to generate the configuration.

Guide the conversation through these topics (in order, but naturally):
1. What type of business they run (e.g. medical clinic, law firm, retail store, restaurant, etc.)
2. What callers typically contact them about (common questions, requests, complaints)
3. The tone and persona they want (professional, friendly, formal, casual)
4. Any urgency or escalation criteria (what makes a call high priority)
5. A brief greeting they'd like the agent to use

Keep responses concise — 1-3 sentences max. Ask one question at a time. Be friendly and efficient.

Once you have clear answers for all 5 topics (usually after 5-8 exchanges), end your response with the exact string: [READY_TO_DEPLOY]

Do NOT include [READY_TO_DEPLOY] until you genuinely have enough information to configure the agent well.`;

const GENERATE_SYSTEM_PROMPT = `You are a configuration generator for an AI call agent system. Based on a conversation where a business owner described their needs, you must output a JSON configuration object.

Output ONLY valid JSON — no markdown, no explanation, no code fences. The JSON must match this exact structure:

{
  "systemPrompt": "string — detailed instructions for the AI agent (2-4 paragraphs)",
  "persona": "string — short description of agent personality (1 sentence)",
  "greeting": "string — opening message the agent says to callers",
  "categories": [
    {"id": "string", "name": "string", "color": "string", "description": "string"}
  ],
  "priorityRules": ["string", ...],
  "customInstructions": ["string", ...],
  "responseGuidelines": "string — paragraph of guidelines for how the agent should respond"
}

For categories: use 3-6 categories relevant to the business. For color use one of: blue, green, red, orange, purple, emerald, yellow.
For priorityRules: 3-5 rules about when to escalate or mark calls as high/critical priority.
For customInstructions: 3-5 specific behavioral instructions for this business.

Make everything specific to the business described in the conversation. Do not use generic placeholders.`;

// ─── Groq API call ───────────────────────────────────────────────
async function callGroq(messages: ChatMessage[], groqApiKey: string): Promise<string> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${groqApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error ${response.status}: ${err}`);
  }

  const data = await response.json() as {
    choices: { message: { content: string } }[];
  };
  return data.choices[0]?.message?.content ?? '';
}

// ─── Main handler ────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  if (!isAllowedOrigin(req.headers.get('origin'))) {
    return json(req, 403, { error: 'Origin not allowed' });
  }
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeadersFor(req) });
  }
  if (req.method !== 'POST') {
    return json(req, 405, { error: 'Method not allowed' });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const groqApiKey = Deno.env.get('GROQ_API_KEY');

    // Auth
    const authHeader = req.headers.get('Authorization') ?? '';
    if (!authHeader) return json(req, 401, { error: 'Unauthorized' });

    const anonClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authErr } = await anonClient.auth.getUser();
    if (authErr || !user) return json(req, 401, { error: 'Unauthorized' });

    // Parse body
    const body = await req.json() as RequestBody;
    const { messages = [], mode = 'chat', documentText } = body;

    // If no Groq key, fall back to a sensible default
    if (!groqApiKey) {
      if (mode === 'chat') {
        const isFirst = messages.length === 0;
        return json(req, 200, {
          message: isFirst
            ? "Hi! I'm here to help you configure your AI call agent. What type of business do you run?"
            : "Thanks for that. Could you tell me more about what callers typically contact you about?",
          readyToDeploy: false,
        });
      }
      // Generate mode fallback — return a generic config
      return json(req, 200, {
        type: 'config',
        config: {
          systemPrompt: "You are a professional AI receptionist. Greet callers warmly, identify their needs, and provide helpful assistance. Always be polite, concise, and professional.",
          persona: "Professional, friendly, and efficient AI receptionist",
          greeting: "Hello! Thank you for calling. How can I help you today?",
          categories: [
            { id: "inquiry", name: "General Inquiry", color: "blue", description: "General questions and information requests" },
            { id: "support", name: "Support", color: "orange", description: "Technical or service support" },
            { id: "appointment", name: "Appointment", color: "green", description: "Scheduling and appointments" },
            { id: "complaint", name: "Complaint", color: "red", description: "Issues and complaints" },
          ],
          priorityRules: [
            "Mark as CRITICAL if caller mentions emergency or safety concern",
            "Mark as HIGH if caller is frustrated or has time-sensitive issue",
            "Mark as MEDIUM for standard requests needing follow-up",
            "Mark as LOW for general inquiries",
          ],
          customInstructions: [
            "Always confirm the caller's name early in the conversation",
            "Summarize the issue before ending the call",
            "Offer to schedule a callback if unable to resolve immediately",
          ],
          responseGuidelines: "Keep responses concise and clear. Acknowledge concerns before providing solutions. Use the caller's name when appropriate.",
        },
      });
    }

    if (mode === 'chat') {
      // Build message array with system prompt
      const systemMessage: ChatMessage = {
        role: 'system',
        content: documentText
          ? `${CHAT_SYSTEM_PROMPT}\n\nThe user has also provided this document about their business:\n\n${documentText.substring(0, 8000)}`
          : CHAT_SYSTEM_PROMPT,
      };

      const groqMessages: ChatMessage[] = [systemMessage, ...messages];
      const reply = await callGroq(groqMessages, groqApiKey);

      const readyToDeploy = reply.includes('[READY_TO_DEPLOY]');
      const cleanReply = reply.replace('[READY_TO_DEPLOY]', '').trim();

      return json(req, 200, {
        message: cleanReply,
        readyToDeploy,
      });
    }

    if (mode === 'generate') {
      // Build the conversation context string
      const conversationContext = messages
        .filter(m => m.role !== 'system')
        .map(m => `${m.role === 'user' ? 'Business owner' : 'Assistant'}: ${m.content}`)
        .join('\n');

      const generateMessages: ChatMessage[] = [
        { role: 'system', content: GENERATE_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Based on this conversation, generate the agent configuration:\n\n${conversationContext}${documentText ? `\n\nAdditional business document:\n${documentText.substring(0, 5000)}` : ''}`,
        },
      ];

      const rawConfig = await callGroq(generateMessages, groqApiKey);

      // Extract JSON from the response
      let config: unknown;
      try {
        // Try to parse directly first
        config = JSON.parse(rawConfig.trim());
      } catch {
        // Try to extract JSON block from response
        const jsonMatch = rawConfig.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            config = JSON.parse(jsonMatch[0]);
          } catch {
            throw new Error('Failed to parse generated config as JSON');
          }
        } else {
          throw new Error('No JSON found in generated config');
        }
      }

      return json(req, 200, { type: 'config', config });
    }

    return json(req, 400, { error: 'Invalid mode. Use "chat" or "generate".' });

  } catch (err) {
    console.error('[api-onboarding]', err);
    return json(req, 500, {
      error: err instanceof Error ? err.message : 'Internal server error',
    });
  }
});
