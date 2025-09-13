-- Step 2: Create secure, consolidated RLS policies for profiles table

-- Create a single, secure SELECT policy that only allows authenticated users to view their own profile
CREATE POLICY "authenticated_users_own_profile_select" ON public.profiles
  FOR SELECT 
  TO authenticated
  USING (id = auth.uid());

-- Recreate the UPDATE policy with proper security (drop existing first)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "authenticated_users_own_profile_update" ON public.profiles
  FOR UPDATE 
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());