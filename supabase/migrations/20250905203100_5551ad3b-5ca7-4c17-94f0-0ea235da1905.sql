-- SECURITY HARDENING MIGRATION (fixed policy creation)

-- Ensure only self-select on profiles
DROP POLICY IF EXISTS "Users can only view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Users can only view their own profile"
ON public.profiles
FOR SELECT
USING (id = auth.uid());

-- Security logs table
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

-- Lock down logs access
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Only system can access security logs" ON public.security_logs;
CREATE POLICY "Only system can access security logs"
ON public.security_logs
FOR ALL
USING (false);

-- Audit function
CREATE OR REPLACE FUNCTION public.log_profile_access()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.security_logs (
    user_id, action, table_name, target_user_id, timestamp
  ) VALUES (
    auth.uid(), TG_OP, 'profiles', COALESCE(NEW.id, OLD.id), now()
  );
  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers
DROP TRIGGER IF EXISTS profile_access_audit ON public.profiles;
DROP TRIGGER IF EXISTS profile_audit_insert ON public.profiles;
DROP TRIGGER IF EXISTS profile_audit_update ON public.profiles;
DROP TRIGGER IF EXISTS profile_audit_delete ON public.profiles;

CREATE TRIGGER profile_audit_insert
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.log_profile_access();

CREATE TRIGGER profile_audit_update
AFTER UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.log_profile_access();

CREATE TRIGGER profile_audit_delete
AFTER DELETE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.log_profile_access();

-- Consolidate notification_settings RLS
DROP POLICY IF EXISTS "Users can view their own settings" ON public.notification_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON public.notification_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON public.notification_settings;
CREATE POLICY "Users can only access their own notification settings"
ON public.notification_settings
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());