-- Fix security issue: Remove duplicate RLS policies on profiles table
-- and consolidate to secure, single policies

-- Drop the duplicate SELECT policies
DROP POLICY IF EXISTS "Users can only view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Drop the existing UPDATE policy to recreate it properly
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create a single, secure SELECT policy that only allows authenticated users to view their own profile
CREATE POLICY "authenticated_users_own_profile_select" ON public.profiles
  FOR SELECT 
  TO authenticated
  USING (id = auth.uid());

-- Create a secure UPDATE policy that only allows authenticated users to update their own profile
CREATE POLICY "authenticated_users_own_profile_update" ON public.profiles
  FOR UPDATE 
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Ensure the profiles table has RLS enabled (should already be enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;