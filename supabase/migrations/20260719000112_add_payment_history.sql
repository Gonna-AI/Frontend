-- Payment history table for tracking Razorpay transactions
CREATE TABLE IF NOT EXISTS public.payment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    order_id TEXT NOT NULL,
    payment_id TEXT,
    plan TEXT NOT NULL CHECK (plan IN ('monthly', 'yearly')),
    amount_cents INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    status TEXT NOT NULL CHECK (status IN ('completed', 'failed', 'pending')),
    credits_added INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookups by user
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON public.payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_created_at ON public.payment_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_history_order_id ON public.payment_history(order_id);

-- Enable RLS
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- Users can only read their own payment history
CREATE POLICY "Users can view own payment history"
    ON public.payment_history
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Only service role can insert/update (edge functions use service role)
CREATE POLICY "Service role can insert payment history"
    ON public.payment_history
    FOR INSERT
    TO service_role
    WITH CHECK (true);

CREATE POLICY "Service role can update payment history"
    ON public.payment_history
    FOR UPDATE
    TO service_role
    USING (true)
    WITH CHECK (true);
