-- Create resource_upvotes table
CREATE TABLE public.resource_upvotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id uuid NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, resource_id)
);

-- Enable RLS
ALTER TABLE public.resource_upvotes ENABLE ROW LEVEL SECURITY;

-- Anyone can view upvotes
CREATE POLICY "Anyone can view upvotes"
  ON public.resource_upvotes FOR SELECT
  USING (true);

-- Users can only insert their own upvotes
CREATE POLICY "Users can upvote resources"
  ON public.resource_upvotes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own upvotes
CREATE POLICY "Users can remove their own upvotes"
  ON public.resource_upvotes FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_resource_upvotes_resource_id ON public.resource_upvotes(resource_id);
CREATE INDEX idx_resource_upvotes_user_id ON public.resource_upvotes(user_id);

-- Create function to get resources with upvote counts
CREATE OR REPLACE FUNCTION public.get_resources_with_upvotes(user_id_param uuid DEFAULT NULL)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  url text,
  type text,
  category_id uuid,
  affiliate_url text,
  has_affiliate boolean,
  how_resource_helps text,
  ispublished boolean,
  created_at timestamp with time zone,
  upvote_count bigint,
  user_has_upvoted boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    r.id,
    r.title,
    r.description,
    r.url,
    r.type,
    r.category_id,
    r.affiliate_url,
    r.has_affiliate,
    r.how_resource_helps,
    r.ispublished,
    r.created_at,
    COALESCE(COUNT(DISTINCT ru.id), 0) AS upvote_count,
    COALESCE(
      (SELECT COUNT(*) > 0 
       FROM resource_upvotes 
       WHERE resource_id = r.id 
         AND user_id = user_id_param),
      false
    ) AS user_has_upvoted
  FROM public.resources r
  LEFT JOIN public.resource_upvotes ru ON r.id = ru.resource_id
  WHERE r.ispublished = true
  GROUP BY r.id, r.title, r.description, r.url, r.type, 
           r.category_id, r.affiliate_url, r.has_affiliate, 
           r.how_resource_helps, r.ispublished, r.created_at
  ORDER BY upvote_count DESC, r.title ASC;
$$;