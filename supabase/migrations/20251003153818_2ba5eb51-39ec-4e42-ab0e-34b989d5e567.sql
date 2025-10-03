-- Drop the existing function first
DROP FUNCTION IF EXISTS public.get_scheduled_resource();

-- Recreate get_scheduled_resource function with how_resource_helps field
CREATE OR REPLACE FUNCTION public.get_scheduled_resource()
 RETURNS TABLE(id uuid, title text, description text, url text, type text, category_id uuid, affiliate_url text, has_affiliate boolean, how_resource_helps text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  selected_resource_id uuid;
BEGIN
  -- Select the resource with date_display_reference matching today's date
  SELECT r.id INTO selected_resource_id
  FROM public.resources r
  WHERE r.ispublished = true 
    AND r.date_display_reference = current_date
  LIMIT 1;
  
  -- If no resource found for today, fallback to the earliest future date
  IF selected_resource_id IS NULL THEN
    SELECT r.id INTO selected_resource_id
    FROM public.resources r
    WHERE r.ispublished = true 
      AND r.date_display_reference > current_date
    ORDER BY r.date_display_reference ASC
    LIMIT 1;
  END IF;
  
  -- If still no resource found, get any published resource (fallback)
  IF selected_resource_id IS NULL THEN
    SELECT r.id INTO selected_resource_id
    FROM public.resources r
    WHERE r.ispublished = true
    ORDER BY RANDOM()
    LIMIT 1;
  END IF;
  
  -- Return the selected resource with how_resource_helps field
  RETURN QUERY
  SELECT 
    r.id,
    r.title,
    r.description,
    r.url,
    r.type,
    r.category_id,
    r.affiliate_url,
    r.has_affiliate,
    r.how_resource_helps
  FROM public.resources r
  WHERE r.id = selected_resource_id;
END;
$function$;