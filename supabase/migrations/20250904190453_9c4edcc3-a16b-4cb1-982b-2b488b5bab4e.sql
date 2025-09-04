-- Enable RLS on app tables (safe changes)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Ensure read policies exist (create only if missing)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'categories' AND policyname = 'Categories are viewable by everyone'
  ) THEN
    CREATE POLICY "Categories are viewable by everyone"
    ON public.categories
    FOR SELECT
    USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'quotes' AND policyname = 'Published quotes are viewable by everyone'
  ) THEN
    CREATE POLICY "Published quotes are viewable by everyone"
    ON public.quotes
    FOR SELECT
    USING (is_published = true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'resources' AND policyname = 'Published resources are viewable by everyone'
  ) THEN
    CREATE POLICY "Published resources are viewable by everyone"
    ON public.resources
    FOR SELECT
    USING (ispublished = true);
  END IF;
END $$;