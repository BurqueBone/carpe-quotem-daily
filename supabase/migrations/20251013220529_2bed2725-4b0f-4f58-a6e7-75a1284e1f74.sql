-- Create enum type for blog focus
CREATE TYPE blog_focus_type AS ENUM (
  'resource_review',
  'memento_mori_research', 
  'meaningful_life'
);

-- Add blog_focus and featured_image_url columns to blog_posts
ALTER TABLE blog_posts 
ADD COLUMN blog_focus blog_focus_type,
ADD COLUMN featured_image_url text;

-- Add comments for clarity
COMMENT ON COLUMN blog_posts.blog_focus IS 'Type of blog post content focus';
COMMENT ON COLUMN blog_posts.featured_image_url IS 'URL of the featured image for the post';

-- Create public storage bucket for blog images
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true);

-- RLS Policy: Allow public to view images
CREATE POLICY "Public can view blog images"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-images');

-- RLS Policy: Only admins can upload images
CREATE POLICY "Admins can upload blog images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'blog-images' 
  AND auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'admin'
  )
);

-- RLS Policy: Only admins can update images
CREATE POLICY "Admins can update blog images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'blog-images'
  AND auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'admin'
  )
);

-- RLS Policy: Only admins can delete images
CREATE POLICY "Admins can delete blog images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'blog-images'
  AND auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'admin'
  )
);