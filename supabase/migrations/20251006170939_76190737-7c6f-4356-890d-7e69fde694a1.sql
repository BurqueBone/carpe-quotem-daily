-- Create a small deduplication table to prevent duplicate auth emails from the Send Email Hook
-- Stores token_hash values seen from Supabase auth webhooks
CREATE TABLE IF NOT EXISTS public.email_webhook_dedup (
  token_hash text PRIMARY KEY,
  email_action_type text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security (service role in Edge Functions bypasses RLS)
ALTER TABLE public.email_webhook_dedup ENABLE ROW LEVEL SECURITY;

-- No public policies are created; regular clients cannot read or write this table.
