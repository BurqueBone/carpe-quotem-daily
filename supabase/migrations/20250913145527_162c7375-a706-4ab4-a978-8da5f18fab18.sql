-- Step 1: Drop duplicate SELECT policies one by one to avoid deadlocks
DROP POLICY IF EXISTS "Users can only view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;