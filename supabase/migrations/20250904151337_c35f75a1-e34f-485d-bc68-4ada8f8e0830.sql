-- Update the get_random_quote_and_track function to use display_queue date matching
CREATE OR REPLACE FUNCTION public.get_random_quote_and_track()
 RETURNS TABLE(id uuid, quote text, author text, source text, display_count integer, last_displayed_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  selected_quote_id uuid;
BEGIN
  -- Select the quote with display_queue matching today's date
  SELECT q.id INTO selected_quote_id
  FROM public.quotes q
  WHERE q.is_published = true 
    AND q.display_queue = current_date
  LIMIT 1;
  
  -- If no quote found for today, fallback to the earliest future date
  IF selected_quote_id IS NULL THEN
    SELECT q.id INTO selected_quote_id
    FROM public.quotes q
    WHERE q.is_published = true 
      AND q.display_queue > current_date
    ORDER BY q.display_queue ASC
    LIMIT 1;
  END IF;
  
  -- Return the selected quote
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
$function$