-- Add thumbnail_url column to resources table
ALTER TABLE public.resources 
ADD COLUMN thumbnail_url TEXT;

-- Create storage bucket for resource thumbnails
INSERT INTO storage.buckets (id, name, public) 
VALUES ('resource-thumbnails', 'resource-thumbnails', true);

-- Create RLS policies for resource-thumbnails bucket
CREATE POLICY "Public can view resource thumbnails"
ON storage.objects FOR SELECT
USING (bucket_id = 'resource-thumbnails');

CREATE POLICY "Admins can upload resource thumbnails"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'resource-thumbnails' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update resource thumbnails"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'resource-thumbnails' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete resource thumbnails"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'resource-thumbnails' 
  AND has_role(auth.uid(), 'admin'::app_role)
);