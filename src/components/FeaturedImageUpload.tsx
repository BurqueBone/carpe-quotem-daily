import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, ImageIcon } from 'lucide-react';
import { uploadBlogImage, deleteBlogImage } from '@/utils/imageUpload';
import { useToast } from '@/hooks/use-toast';

interface FeaturedImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
}

export const FeaturedImageUpload = ({ value, onChange }: FeaturedImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const { url, error } = await uploadBlogImage(file, 'featured');
    setUploading(false);

    if (error) {
      toast({
        title: 'Upload failed',
        description: error,
        variant: 'destructive'
      });
      return;
    }

    // Delete old image if exists
    if (value) {
      await deleteBlogImage(value);
    }

    onChange(url);
    toast({
      title: 'Success',
      description: 'Featured image uploaded successfully'
    });
  };

  const handleRemove = async () => {
    if (value) {
      await deleteBlogImage(value);
      onChange('');
      toast({
        title: 'Removed',
        description: 'Featured image removed'
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Featured Image</h3>
        <p className="text-xs text-muted-foreground">Recommended: 16:9 aspect ratio</p>
      </div>

      {value ? (
        <div className="relative group rounded-lg overflow-hidden border">
          <img
            src={value}
            alt="Featured"
            className="w-full h-auto max-h-[300px] object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-4">
            Upload a featured image for your blog post
          </p>
          <div className="flex justify-center">
            <Button variant="outline" disabled={uploading} asChild>
              <label className="cursor-pointer gap-2">
                <Upload className="h-4 w-4" />
                {uploading ? 'Uploading...' : 'Choose Image'}
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.gif"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Max 5MB • JPG, PNG, WEBP, GIF
          </p>
        </div>
      )}
    </div>
  );
};
