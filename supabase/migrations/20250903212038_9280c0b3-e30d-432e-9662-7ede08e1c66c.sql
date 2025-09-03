-- Fix the function search path security issue
CREATE OR REPLACE FUNCTION public.get_random_quote_and_track()
RETURNS TABLE (
  id uuid,
  quote text,
  author text,
  source text,
  display_count integer,
  last_displayed_at timestamp with time zone
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  selected_quote_id uuid;
BEGIN
  -- Select a random published quote
  SELECT q.id INTO selected_quote_id
  FROM public.quotes q
  WHERE q.is_published = true
  ORDER BY random()
  LIMIT 1;
  
  -- Update the display count and timestamp
  UPDATE public.quotes 
  SET 
    display_count = COALESCE(display_count, 0) + 1,
    last_displayed_at = now()
  WHERE quotes.id = selected_quote_id;
  
  -- Return the updated quote
  RETURN QUERY
  SELECT 
    q.id,
    q.quote,
    q.author,
    q.source,
    q.display_count,
    q.last_displayed_at
  FROM public.quotes q
  WHERE q.id = selected_quote_id;
END;
$function$;