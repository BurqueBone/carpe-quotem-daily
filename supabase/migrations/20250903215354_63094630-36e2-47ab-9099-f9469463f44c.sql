-- Update the function to get the quote with the latest last_displayed_at value
CREATE OR REPLACE FUNCTION public.get_random_quote_and_track()
 RETURNS TABLE(id uuid, quote text, author text, source text, display_count integer, last_displayed_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  selected_quote_id uuid;
BEGIN
  -- Select the quote with the latest last_displayed_at (most recently displayed)
  SELECT q.id INTO selected_quote_id
  FROM public.quotes q
  WHERE q.is_published = true
  ORDER BY q.last_displayed_at DESC NULLS LAST, q.created_at DESC
  LIMIT 1;
  
  -- Return the selected quote without updating it
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