// Public contact endpoint: the contact page, the home page form and the data request form post here.
// It needs no sign-in (verify_jwt = false), so it validates everything itself and stores the message
// with the service role. This file mirrors the version deployed to production.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const allowedOrigins = new Set([
  'https://clerktree.com',
  'https://www.clerktree.com',
  'https://clerktree.netlify.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]);

function corsHeaders(req: Request) {
  const origin = req.headers.get('origin');
  return {
    'Access-Control-Allow-Headers': 'content-type, apikey, x-client-info',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Origin': origin && allowedOrigins.has(origin) ? origin : 'https://clerktree.com',
    'Content-Type': 'application/json',
    'Vary': 'Origin',
  };
}

function json(req: Request, status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders(req) });
}

const fields = ['fullName', 'companyName', 'email', 'phone', 'interest', 'employeeCount', 'message'] as const;

// Seven fields of at most 5,000 characters each fit comfortably; anything larger is not a contact form.
const MAX_BODY_BYTES = 64 * 1024;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(req) });
  const origin = req.headers.get('origin');
  if (origin && !allowedOrigins.has(origin)) return json(req, 403, { error: 'Origin not allowed' });
  if (req.method !== 'POST') return json(req, 405, { error: 'Method not allowed' });
  if (Number(req.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) return json(req, 413, { error: 'Request too large' });

  try {
    const body = await req.json().catch(() => null);
    if (!body) return json(req, 400, { error: 'Invalid request body' });

    const values = Object.fromEntries(
      fields.map((field) => [field, typeof body[field] === 'string' ? body[field].trim() : '']),
    ) as Record<(typeof fields)[number], string>;

    if (fields.some((field) => !values[field])) return json(req, 400, { error: 'All contact fields are required' });
    if (!/^\S+@\S+\.\S+$/.test(values.email) || values.email.length > 320) return json(req, 400, { error: 'A valid email is required' });
    if (Object.values(values).some((value) => value.length > 5000)) return json(req, 400, { error: 'One or more fields are too long' });

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { error } = await supabase.from('contacts').insert({
      full_name: values.fullName,
      company_name: values.companyName,
      email: values.email,
      phone: values.phone,
      interest: values.interest,
      employee_count: values.employeeCount,
      message: values.message,
    });
    if (error) throw error;

    return json(req, 201, { success: true });
  } catch (error) {
    console.error('[api-contacts]', error);
    return json(req, 500, { error: 'Unable to submit your message right now' });
  }
});
