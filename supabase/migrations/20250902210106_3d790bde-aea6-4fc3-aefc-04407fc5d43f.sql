-- Restrict public access on resources to published items only
-- Ensures unpublished resources are not publicly visible

-- 1) Make sure RLS is enabled (safe if already enabled)
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- 2) Replace overly-permissive SELECT policy with a restrictive one
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'resources' AND policyname = 'Resources are viewable by everyone'
  ) THEN
    DROP POLICY "Resources are viewable by everyone" ON public.resources;
  END IF;
END$$;

CREATE POLICY "Published resources are viewable by everyone"
ON public.resources
FOR SELECT
USING (ispublished = true);
