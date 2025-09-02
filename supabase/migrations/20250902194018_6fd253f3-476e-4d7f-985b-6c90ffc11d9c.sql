-- Create shared quotes table
CREATE TABLE IF NOT EXISTS public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote TEXT NOT NULL,
  author TEXT NOT NULL,
  source TEXT,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- Policy: only published quotes are viewable by everyone
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'quotes' AND policyname = 'Published quotes are viewable by everyone'
  ) THEN
    CREATE POLICY "Published quotes are viewable by everyone"
    ON public.quotes
    FOR SELECT
    USING (is_published = true);
  END IF;
END$$;

-- Trigger to keep updated_at fresh
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_quotes_updated_at'
  ) THEN
    CREATE TRIGGER update_quotes_updated_at
    BEFORE UPDATE ON public.quotes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END$$;

-- Helpful indexes
CREATE UNIQUE INDEX IF NOT EXISTS quotes_unique_quote_author ON public.quotes (quote, author);
CREATE INDEX IF NOT EXISTS idx_quotes_is_published ON public.quotes (is_published);
