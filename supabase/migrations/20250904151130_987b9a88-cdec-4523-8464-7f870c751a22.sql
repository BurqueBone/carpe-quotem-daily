-- Retry migration with corrected date arithmetic
-- 1) Ensure the new column exists
ALTER TABLE public.quotes
ADD COLUMN IF NOT EXISTS display_queue date;

-- 2) Backfill sequential future dates starting tomorrow (cast row_number to integer)
WITH ordered AS (
  SELECT
    id,
    (current_date + (row_number() OVER (ORDER BY created_at, id))::int) AS new_date
  FROM public.quotes
)
UPDATE public.quotes q
SET display_queue = o.new_date
FROM ordered o
WHERE q.id = o.id;

-- 3) Enforce uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS uq_quotes_display_queue
ON public.quotes(display_queue);

-- 4) Make column required
ALTER TABLE public.quotes
ALTER COLUMN display_queue SET NOT NULL;