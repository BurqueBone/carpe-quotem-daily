import { useState, useEffect, lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
const MarkdownEditor = lazy(() => import('./MarkdownEditor').then(m => ({ default: m.MarkdownEditor })));
import { MarkdownPreview } from './MarkdownPreview';
import { FeaturedImageUpload } from './FeaturedImageUpload';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Eye, EyeOff } from 'lucide-react';
import { BlogFocus } from '@/utils/blogHelpers';
import { z } from 'zod';

interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  meta_title: string;
  meta_description: string;
  is_published: boolean;
  published_at?: string;
  blog_focus?: BlogFocus;
  featured_image_url?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface BlogPostFormProps {
  post?: BlogPost;
  onSave: () => void;
  onCancel: () => void;
}

// Validation schema for blog post content
const contentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  slug: z.string().min(1, 'Slug is required').max(200, 'Slug must be less than 200 characters'),
  content: z.string()
    .min(1, 'Content is required')
    .max(100000, 'Content must be less than 100KB')
    .refine((val) => {
      // Block dangerous patterns
      const dangerousPatterns = [
        /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi, // event handlers like onclick=
        /data:text\/html/gi,
      ];
      return !dangerousPatterns.some(pattern => pattern.test(val));
    }, 'Content contains potentially dangerous code patterns'),
  excerpt: z.string().max(500, 'Excerpt must be less than 500 characters').optional(),
  meta_title: z.string().max(200, 'Meta title must be less than 200 characters').optional(),
  meta_description: z.string().max(500, 'Meta description must be less than 500 characters').optional(),
});

const BlogPostForm = ({ post, onSave, onCancel }: BlogPostFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(() => {
    const stored = localStorage.getItem('blog-editor-preview-open');
    return stored ? JSON.parse(stored) : true;
  });
  
  const [formData, setFormData] = useState<BlogPost>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    meta_title: '',
    meta_description: '',
    is_published: false,
    blog_focus: undefined,
    featured_image_url: '',
    ...post
  });

  useEffect(() => {
    fetchCategories();
    if (post?.id) {
      fetchPostCategories(post.id);
    }
  }, [post?.id]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('blog_categories')
      .select('*')
      .order('name');
    
    if (error) {
      toast({
        title: "Error fetching categories",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setCategories(data || []);
    }
  };

  const fetchPostCategories = async (postId: string) => {
    const { data, error } = await supabase
      .from('blog_post_categories')
      .select('category_id')
      .eq('blog_post_id', postId);
    
    if (error) {
      toast({
        title: "Error fetching post categories",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setSelectedCategories(data?.map(item => item.category_id) || []);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: post?.id ? prev.slug : generateSlug(title),
      meta_title: prev.meta_title || title
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate content
      const validationResult = contentSchema.safeParse(formData);
      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        throw new Error(firstError.message);
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const postData = {
        ...formData,
        author_id: user.id,
        published_at: formData.is_published ? (post?.published_at || new Date().toISOString()) : null
      };

      let result;
      if (post?.id) {
        result = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', post.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('blog_posts')
          .insert([postData])
          .select()
          .single();
      }

      if (result.error) throw result.error;

      // Update categories
      if (result.data) {
        await supabase
          .from('blog_post_categories')
          .delete()
          .eq('blog_post_id', result.data.id);

        if (selectedCategories.length > 0) {
          const categoryInserts = selectedCategories.map(categoryId => ({
            blog_post_id: result.data.id,
            category_id: categoryId
          }));

          await supabase
            .from('blog_post_categories')
            .insert(categoryInserts);
        }
      }

      toast({
        title: post?.id ? "Post updated" : "Post created",
        description: "Blog post saved successfully"
      });

      onSave();
    } catch (error: any) {
      toast({
        title: "Error saving post",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const togglePreview = () => {
    const newValue = !showPreview;
    setShowPreview(newValue);
    localStorage.setItem('blog-editor-preview-open', JSON.stringify(newValue));
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault();
        togglePreview();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showPreview]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{post?.id ? 'Edit Post' : 'Create New Post'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="blog_focus">Blog Focus (Optional)</Label>
            <Select 
              value={formData.blog_focus || ''} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, blog_focus: value as BlogFocus || undefined }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select blog focus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="resource_review">Resource Review</SelectItem>
                <SelectItem value="memento_mori_research">Memento Mori Research</SelectItem>
                <SelectItem value="meaningful_life">Meaningful Life</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              required
            />
          </div>

          <FeaturedImageUpload
            value={formData.featured_image_url}
            onChange={(url) => setFormData(prev => ({ ...prev, featured_image_url: url }))}
          />

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <Label>Content (Markdown)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={togglePreview}
                className="gap-2"
              >
                {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showPreview ? 'Hide' : 'Show'} Preview
              </Button>
            </div>
            <div className="border rounded-lg overflow-hidden min-h-[500px]">
              <ResizablePanelGroup direction="horizontal" className="min-h-[500px]">
                <ResizablePanel defaultSize={showPreview ? 60 : 100} minSize={40}>
                  <div className="h-full">
                    <Suspense fallback={<div className="p-4 text-muted-foreground">Loading editor...</div>}>
                      <MarkdownEditor
                        value={formData.content}
                        onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                      />
                    </Suspense>
                  </div>
                </ResizablePanel>
                
                {showPreview && (
                  <>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={40} minSize={30}>
                      <div className="h-full overflow-auto p-6 bg-muted/20">
                        <div className="text-sm text-muted-foreground mb-4 font-medium">Preview</div>
                        <MarkdownPreview content={formData.content} />
                      </div>
                    </ResizablePanel>
                  </>
                )}
              </ResizablePanelGroup>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="meta_title">Meta Title</Label>
            <Input
              id="meta_title"
              value={formData.meta_title}
              onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meta_description">Meta Description</Label>
            <Textarea
              id="meta_description"
              value={formData.meta_description}
              onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <Label>Categories</Label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map(category => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={category.id}
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={() => toggleCategory(category.id)}
                  />
                  <Label htmlFor={category.id} className="text-sm">
                    {category.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_published"
              checked={formData.is_published}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_published: checked }))}
            />
            <Label htmlFor="is_published">Published</Label>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (post?.id ? 'Update Post' : 'Create Post')}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default BlogPostForm;