-- SECURITY HARDENING: Fix critical email harvesting vulnerability
-- Remove overly permissive profile access and add audit logging

-- 1) Fix profiles table RLS - only allow users to see their own profile
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create strict policy for profile access
CREATE POLICY "Users can only view their own profile"
ON public.profiles
FOR SELECT
USING (id = auth.uid());

-- 2) Create security audit logging infrastructure
CREATE TABLE IF NOT EXISTS public.security_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  target_user_id UUID,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT
);

-- Enable RLS on security logs and deny direct client access
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Security logs are system only"
ON public.security_logs
FOR ALL
USING (false);

-- 3) Create audit function for profile changes
CREATE OR REPLACE FUNCTION public.log_profile_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.security_logs (
    user_id,
    action,
    table_name,
    target_user_id,
    timestamp
  ) VALUES (
    auth.uid(),
    TG_OP,
    'profiles',
    COALESCE(NEW.id, OLD.id),
    now()
  );
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4) Add audit triggers for profile modifications
DROP TRIGGER IF EXISTS profile_audit_insert ON public.profiles;
DROP TRIGGER IF EXISTS profile_audit_update ON public.profiles;
DROP TRIGGER IF EXISTS profile_audit_delete ON public.profiles;

CREATE TRIGGER profile_audit_insert
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.log_profile_changes();

CREATE TRIGGER profile_audit_update
  AFTER UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.log_profile_changes();

CREATE TRIGGER profile_audit_delete
  AFTER DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.log_profile_changes();

-- 5) Consolidate notification_settings RLS policies
DROP POLICY IF EXISTS "Users can view their own settings" ON public.notification_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON public.notification_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON public.notification_settings;

CREATE POLICY "Strict notification settings access"
ON public.notification_settings
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());