import { supabase } from '@/integrations/supabase/client';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

export const uploadBlogImage = async (
  file: File,
  folder: 'content' | 'featured'
): Promise<{ url: string; error?: string }> => {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return { url: '', error: 'File size must be less than 5MB' };
  }

  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { url: '', error: 'File type must be JPG, PNG, WEBP, or GIF' };
  }

  // Generate unique filename
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 9);
  const extension = file.name.split('.').pop();
  const filename = `${folder}/${timestamp}-${randomId}.${extension}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('blog-images')
    .upload(filename, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Upload error:', error);
    return { url: '', error: error.message };
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('blog-images')
    .getPublicUrl(data.path);

  return { url: publicUrl };
};

export const deleteBlogImage = async (url: string): Promise<void> => {
  try {
    // Extract path from URL
    const urlObj = new URL(url);
    const pathMatch = urlObj.pathname.match(/\/storage\/v1\/object\/public\/blog-images\/(.+)/);
    
    if (!pathMatch) {
      console.error('Invalid blog image URL');
      return;
    }

    const path = pathMatch[1];

    // Delete from Supabase Storage
    const { error } = await supabase.storage
      .from('blog-images')
      .remove([path]);

    if (error) {
      console.error('Delete error:', error);
    }
  } catch (err) {
    console.error('Error parsing URL:', err);
  }
};
