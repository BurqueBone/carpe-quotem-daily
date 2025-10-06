-- Add an explicit deny-all policy to satisfy linter while keeping table restricted
DROP POLICY IF EXISTS "No access" ON public.email_webhook_dedup;
CREATE POLICY "No access"
ON public.email_webhook_dedup
FOR ALL
USING (false)
WITH CHECK (false);