import { supabase } from '@/integrations/supabase/client';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const SIGNED_URL_EXPIRY = 31536000; // 1 year in seconds

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

  // Get signed URL (bucket is private for security)
  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from('blog-images')
    .createSignedUrl(data.path, SIGNED_URL_EXPIRY);

  if (signedUrlError) {
    console.error('Signed URL error:', signedUrlError);
    return { url: '', error: signedUrlError.message };
  }

  return { url: signedUrlData.signedUrl };
};

export const deleteBlogImage = async (url: string): Promise<void> => {
  try {
    // Extract path from signed or public URL
    const urlObj = new URL(url);
    
    // Handle both signed URLs and direct paths
    let path: string | null = null;
    
    // Try to extract from signed URL (contains /sign/ in path)
    const signedMatch = urlObj.pathname.match(/\/storage\/v1\/object\/sign\/blog-images\/(.+)/);
    if (signedMatch) {
      path = signedMatch[1].split('?')[0]; // Remove query params
    } else {
      // Try public URL format (legacy)
      const publicMatch = urlObj.pathname.match(/\/storage\/v1\/object\/public\/blog-images\/(.+)/);
      if (publicMatch) {
        path = publicMatch[1];
      }
    }
    
    if (!path) {
      console.error('Invalid blog image URL');
      return;
    }

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
