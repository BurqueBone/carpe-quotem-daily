-- Fix storage RLS policies for blog-images bucket to prevent recursive RLS checks
-- and make bucket private for better security

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can upload blog images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update blog images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete blog images" ON storage.objects;

-- Make blog-images bucket private to prevent enumeration
UPDATE storage.buckets SET public = false WHERE id = 'blog-images';

-- Recreate policies using has_role() function to prevent recursive RLS
CREATE POLICY "Admins can upload blog images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'blog-images' 
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update blog images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'blog-images'
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete blog images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'blog-images'
  AND public.has_role(auth.uid(), 'admin'::app_role)
);