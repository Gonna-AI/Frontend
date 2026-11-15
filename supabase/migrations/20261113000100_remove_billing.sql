-- Billing (Razorpay) has been removed from ClerkTree. The api-billing edge function
-- is deleted; drop its payment ledger (verified empty in production before this ran).
DROP TABLE IF EXISTS public.payment_history;
