-- 1) Add the new date column to quotes
ALTER TABLE public.quotes
ADD COLUMN IF NOT EXISTS display_queue date;

-- 2) Backfill: assign unique sequential future dates starting from tomorrow
-- Ensures: no duplicates, no gaps, no past dates
WITH ordered AS (
  SELECT
    id,
    (current_date + row_number() OVER (ORDER BY created_at, id))::date AS new_date
  FROM public.quotes
)
UPDATE public.quotes q
SET display_queue = o.new_date
FROM ordered o
WHERE q.id = o.id;

-- 3) Enforce uniqueness of display_queue dates (prevents duplicates)
CREATE UNIQUE INDEX IF NOT EXISTS uq_quotes_display_queue
ON public.quotes(display_queue);

-- 4) Ensure the column is required
ALTER TABLE public.quotes
ALTER COLUMN display_queue SET NOT NULL;