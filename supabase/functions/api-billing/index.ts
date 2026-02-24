import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

// Test Keys (Injected via Supabase Secrets)
const RZP_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID') ?? '';
const RZP_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET') ?? '';

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

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const action = url.pathname.split('/').pop() || '';

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (req.method === 'GET' && action === 'balance') {
      const { data, error } = await adminClient
        .from('user_settings')
        .select('credits_balance')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return new Response(JSON.stringify({ balance: data ? data.credits_balance : 50.0 }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'POST' && action === 'redeem') {
      const { code } = await req.json();
      if (!code) throw new Error('Code is required');

      const { data, error } = await adminClient.rpc('redeem_credit_code', {
        p_user_id: user.id,
        p_code: code.toUpperCase()
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.message);

      return new Response(JSON.stringify({ message: data.message, added_amount: data.added_amount }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'POST' && action === 'create-order') {
      const { plan } = await req.json();

      // Calculate amount in USD cents
      const amountUSD = plan === 'monthly' ? 4900 : (39 * 12 * 100);

      const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(RZP_KEY_ID + ':' + RZP_KEY_SECRET)
        },
        body: JSON.stringify({
          amount: amountUSD,
          currency: "USD",
          receipt: `rcpt_${user.id.substring(0, 8)}_${Date.now()}`
        })
      });

      const order = await rzpRes.json();
      if (!rzpRes.ok) throw new Error(order.error?.description || 'Failed to create order');

      return new Response(JSON.stringify(order), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (req.method === 'POST' && action === 'verify-payment') {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = await req.json();

      const isValid = await verifyRazorpaySignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        RZP_KEY_SECRET
      );

      if (!isValid) {
        return new Response(JSON.stringify({ error: 'Invalid signature. Payment could not be verified.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Add actual credits to user account
      const creditsToAdd = plan === 'monthly' ? 500 : 500 * 12;

      const { data, error } = await adminClient.rpc('add_user_credits', {
        p_user_id: user.id,
        p_amount: creditsToAdd
      });

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, balance: data.balance }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
