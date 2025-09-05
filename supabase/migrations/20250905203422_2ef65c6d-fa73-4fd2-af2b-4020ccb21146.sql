-- Simple security fix - just remove the overly permissive policy
-- The "Users can only view their own profile" policy must already exist

-- Remove any overly permissive policies
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create security audit table for monitoring
CREATE TABLE IF NOT EXISTS public.security_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  target_user_id UUID,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT
);

-- Secure the audit table
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

-- Only allow system access to security logs
CREATE POLICY "Deny all access to security logs"
ON public.security_logs
FOR ALL
USING (false);