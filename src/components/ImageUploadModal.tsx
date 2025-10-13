import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload, Link } from 'lucide-react';
import { uploadBlogImage } from '@/utils/imageUpload';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadModalProps {
  open: boolean;
  onClose: () => void;
  onInsert: (markdown: string) => void;
}

export const ImageUploadModal = ({ open, onClose, onInsert }: ImageUploadModalProps) => {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const { url, error } = await uploadBlogImage(file, 'content');
    setUploading(false);

    if (error) {
      toast({
        title: 'Upload failed',
        description: error,
        variant: 'destructive'
      });
      return;
    }

    setPreviewUrl(url);
    setImageUrl(url);
  };

  const handleUrlChange = (url: string) => {
    setImageUrl(url);
    setPreviewUrl(url);
  };

  const handleInsert = () => {
    if (!imageUrl) {
      toast({
        title: 'No image',
        description: 'Please upload an image or enter a URL',
        variant: 'destructive'
      });
      return;
    }

    const markdown = `![${altText || 'Image'}](${imageUrl})`;
    onInsert(markdown);
    
    // Reset state
    setImageUrl('');
    setAltText('');
    setPreviewUrl('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Insert Image</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="url">URL</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Choose Image</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="file-upload"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.gif"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Max file size: 5MB. Formats: JPG, PNG, WEBP, GIF
              </p>
            </div>
          </TabsContent>

          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image-url">Image URL</Label>
              <div className="flex items-center gap-2">
                <Link className="h-5 w-5 text-muted-foreground" />
                <Input
                  id="image-url"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-2">
          <Label htmlFor="alt-text">Alt Text (Optional)</Label>
          <Input
            id="alt-text"
            placeholder="Describe the image"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
          />
        </div>

        {previewUrl && (
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="border rounded-lg overflow-hidden">
              <img
                src={previewUrl}
                alt={altText || 'Preview'}
                className="w-full h-auto max-h-[300px] object-contain"
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleInsert} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Insert Image'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
