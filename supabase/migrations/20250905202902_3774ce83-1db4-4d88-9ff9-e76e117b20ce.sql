-- CRITICAL SECURITY FIX: Remove ability to view other users' profiles
-- This prevents email harvesting attacks

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create secure policy that only allows users to view their own profile
CREATE POLICY "Users can only view their own profile" 
ON public.profiles 
FOR SELECT 
USING (id = auth.uid());

-- Add security audit logging function
CREATE OR REPLACE FUNCTION public.log_profile_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log any attempt to access profile data
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
    NOW()
  );
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create security logs table for monitoring
CREATE TABLE IF NOT EXISTS public.security_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  target_user_id UUID,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Enable RLS on security logs
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

-- Only allow system/admin access to security logs
CREATE POLICY "Only system can access security logs"
ON public.security_logs
FOR ALL
USING (false);

-- Add audit trigger to profiles table
CREATE TRIGGER profile_access_audit
  AFTER SELECT, INSERT, UPDATE, DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.log_profile_access();

-- Strengthen notification_settings security
-- Ensure users can only see/modify their own notification settings
DROP POLICY IF EXISTS "Users can view their own settings" ON public.notification_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON public.notification_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON public.notification_settings;

CREATE POLICY "Users can only access their own notification settings"
ON public.notification_settings
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());