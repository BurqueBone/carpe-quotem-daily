-- Fix RLS policies for profiles table to prevent email harvesting

-- First, drop existing policies to recreate them properly
DROP POLICY IF EXISTS "authenticated_users_own_profile_select" ON public.profiles;
DROP POLICY IF EXISTS "authenticated_users_own_profile_update" ON public.profiles;

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create strict policies that only allow users to access their own profile
CREATE POLICY "Users can only view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can only update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (id = auth.uid()) 
WITH CHECK (id = auth.uid());

-- Ensure no INSERT or DELETE access for regular users
-- (only system functions should handle profile creation/deletion)
CREATE POLICY "Prevent user profile insertion" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (false);

CREATE POLICY "Prevent user profile deletion" 
ON public.profiles 
FOR DELETE 
TO authenticated
USING (false);