import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsBaseHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

type BillingPlan = 'monthly' | 'yearly';

const BILLING_PLANS: Record<BillingPlan, { amountCents: number; credits: number }> = {
  monthly: { amountCents: 4900, credits: 500 },
  yearly: { amountCents: 39 * 12 * 100, credits: 500 * 12 },
};

const AMOUNT_TO_PLAN = new Map<number, BillingPlan>(
  Object.entries(BILLING_PLANS).map(([plan, config]) => [config.amountCents, plan as BillingPlan]),
);

const DEFAULT_ALLOWED_ORIGINS = new Set<string>([
  'https://clerktree.com',
  'https://www.clerktree.com',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]);

const EXTRA_ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

for (const origin of EXTRA_ALLOWED_ORIGINS) {
  DEFAULT_ALLOWED_ORIGINS.add(origin);
}

interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  status: 'created' | 'attempted' | 'paid' | string;
  notes?: Record<string, string>;
}

interface RazorpayPayment {
  id: string;
  amount: number;
  currency: string;
  status: 'created' | 'authorized' | 'captured' | 'failed' | string;
  order_id: string;
}

function getRequiredEnv(name: string): string {
  const value = Deno.env.get(name)?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function parsePlan(value: unknown): BillingPlan | null {
  return value === 'monthly' || value === 'yearly' ? value : null;
}

function asNonEmptyString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true;
  if (DEFAULT_ALLOWED_ORIGINS.has(origin)) return true;

  try {
    const url = new URL(origin);
    const isLocalhost = ['localhost', '127.0.0.1', '::1'].includes(url.hostname);
    if (isLocalhost) return true;

    return url.protocol === 'https:' && (
      url.hostname === 'clerktree.com' ||
      url.hostname.endsWith('.clerktree.com')
    );
  } catch {
    return false;
  }
}

function corsHeadersFor(req: Request): Record<string, string> {
  const requestOrigin = req.headers.get('Origin');
  const allowedOrigin = requestOrigin && isAllowedOrigin(requestOrigin)
    ? requestOrigin
    : 'https://clerktree.com';

  return {
    ...corsBaseHeaders,
    'Access-Control-Allow-Origin': allowedOrigin,
    'Vary': 'Origin',
  };
}

function jsonResponse(req: Request, status: number, payload: Record<string, unknown>) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeadersFor(req), 'Content-Type': 'application/json' },
  });
}

async function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string, secret: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(orderId + "|" + paymentId);
  const keyInfo = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign('HMAC', keyInfo, data);
  const signatureHex = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return signatureHex === signature;
}

async function razorpayRequest<T>(
  path: string,
  keyId: string,
  keySecret: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`https://api.razorpay.com/v1/${path}`, {
    ...init,
    headers: {
      'Authorization': 'Basic ' + btoa(`${keyId}:${keySecret}`),
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = typeof data === 'object' && data && 'error' in data
      ? (data as { error?: { description?: string } }).error?.description
      : null;
    throw new Error(message || `Razorpay request failed (${response.status})`);
  }

  return data as T;
}

Deno.serve(async (req: Request) => {
  if (!isAllowedOrigin(req.headers.get('Origin'))) {
    return jsonResponse(req, 403, { error: 'Origin not allowed' });
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeadersFor(req) });
  }

  try {
    const supabaseUrl = getRequiredEnv('SUPABASE_URL');
    const supabaseAnonKey = getRequiredEnv('SUPABASE_ANON_KEY');
    const supabaseServiceRoleKey = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY');
    const razorpayKeyId = getRequiredEnv('RAZORPAY_KEY_ID');
    const razorpayKeySecret = getRequiredEnv('RAZORPAY_KEY_SECRET');

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse(req, 401, { error: 'Unauthorized' });
    }

    const supabaseClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return jsonResponse(req, 401, { error: 'Unauthorized' });
    }

    const url = new URL(req.url);
    const action = url.pathname.replace(/\/+$/, '').split('/').pop() || '';

    const adminClient = createClient(
      supabaseUrl,
      supabaseServiceRoleKey,
    );

    if (req.method === 'GET' && action === 'balance') {
      const { data, error } = await adminClient
        .from('user_settings')
        .select('credits_balance')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return jsonResponse(req, 200, { balance: data ? data.credits_balance : 50.0 });
    }

    if (req.method === 'POST' && action === 'redeem') {
      const body = await req.json().catch(() => null);
      const code = asNonEmptyString((body as Record<string, unknown> | null)?.code);
      if (!code) throw new Error('Code is required');

      const { data, error } = await adminClient.rpc('redeem_credit_code', {
        p_user_id: user.id,
        p_code: code.toUpperCase()
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.message);

      return jsonResponse(req, 200, { message: data.message, added_amount: data.added_amount });
    }

    if (req.method === 'POST' && action === 'create-order') {
      const body = await req.json().catch(() => null);
      const plan = parsePlan((body as Record<string, unknown> | null)?.plan);

      if (!plan) {
        return jsonResponse(req, 400, { error: 'Invalid plan.' });
      }

      const amountUSD = BILLING_PLANS[plan].amountCents;

      const order = await razorpayRequest<RazorpayOrder>('orders', razorpayKeyId, razorpayKeySecret, {
        method: 'POST',
        body: JSON.stringify({
          amount: amountUSD,
          currency: "USD",
          receipt: `rcpt_${crypto.randomUUID().replace(/-/g, '').slice(0, 24)}`,
          notes: {
            user_id: user.id,
            plan,
          },
        }),
      });

      return jsonResponse(req, 200, {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      });
    }

    if (req.method === 'POST' && action === 'verify-payment') {
      const body = await req.json().catch(() => null) as Record<string, unknown> | null;
      const orderId = asNonEmptyString(body?.razorpay_order_id);
      const paymentId = asNonEmptyString(body?.razorpay_payment_id);
      const signature = asNonEmptyString(body?.razorpay_signature);
      const claimedPlan = parsePlan(body?.plan);

      if (!orderId || !paymentId || !signature) {
        return jsonResponse(req, 400, { error: 'Missing required payment fields.' });
      }

      const isValid = await verifyRazorpaySignature(
        orderId,
        paymentId,
        signature,
        razorpayKeySecret,
      );

      if (!isValid) {
        return jsonResponse(req, 400, { error: 'Invalid signature. Payment could not be verified.' });
      }

      const order = await razorpayRequest<RazorpayOrder>(`orders/${encodeURIComponent(orderId)}`, razorpayKeyId, razorpayKeySecret);
      const payment = await razorpayRequest<RazorpayPayment>(`payments/${encodeURIComponent(paymentId)}`, razorpayKeyId, razorpayKeySecret);

      if (payment.order_id !== order.id) {
        return jsonResponse(req, 400, { error: 'Payment does not match order.' });
      }

      if (order.notes?.user_id && order.notes.user_id !== user.id) {
        return jsonResponse(req, 403, { error: 'Order does not belong to authenticated user.' });
      }

      if (order.status !== 'paid' || payment.status !== 'captured') {
        return jsonResponse(req, 400, { error: 'Payment not captured yet.' });
      }

      if (order.currency !== 'USD' || payment.currency !== 'USD') {
        return jsonResponse(req, 400, { error: 'Unexpected payment currency.' });
      }

      if (payment.amount !== order.amount) {
        return jsonResponse(req, 400, { error: 'Amount mismatch between order and payment.' });
      }

      const derivedPlan = AMOUNT_TO_PLAN.get(order.amount);
      if (!derivedPlan) {
        return jsonResponse(req, 400, { error: 'Unsupported payment amount.' });
      }

      if (claimedPlan && claimedPlan !== derivedPlan) {
        return jsonResponse(req, 400, { error: 'Plan mismatch for payment verification.' });
      }

      const creditsToAdd = BILLING_PLANS[derivedPlan].credits;

      const { data, error } = await adminClient.rpc('add_user_credits', {
        p_user_id: user.id,
        p_amount: creditsToAdd,
      });

      if (error) throw error;

      const newBalance = typeof data === 'object' && data !== null && 'balance' in data
        ? (data as { balance: number }).balance
        : null;

      return jsonResponse(req, 200, {
        success: true,
        plan: derivedPlan,
        credits_added: creditsToAdd,
        balance: newBalance,
      });
    }

    return jsonResponse(req, 404, { error: 'Not found' });

  } catch (error) {
    console.error('[api-billing] unexpected error:', error);
    return jsonResponse(req, 500, { error: 'Internal server error' });
  }
});
