-- Create a restricted view for wrappers_fdw_stats to limit exposure
CREATE OR REPLACE VIEW public.wrappers_stats_safe AS
SELECT 
  fdw_name,
  created_at,
  updated_at
FROM wrappers_fdw_stats
WHERE false; -- Make view return no rows by default

-- Enable RLS on the view
ALTER VIEW public.wrappers_stats_safe SET (security_invoker = true);

-- Hide the original table from PostgREST by moving it to extensions schema
-- First create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move the table to extensions schema to remove it from public API
ALTER TABLE public.wrappers_fdw_stats SET SCHEMA extensions;