import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar, ArrowLeft, Tag } from 'lucide-react';
import { format } from 'date-fns';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { MarkdownPreview } from '@/components/MarkdownPreview';
import { formatBlogFocus, getBlogFocusColor, BlogFocus } from '@/utils/blogHelpers';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  published_at: string;
  meta_title: string;
  meta_description: string;
  blog_focus?: BlogFocus;
  featured_image_url?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    if (!slug) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (error) throw error;
      setPost(data);
      
      // Fetch categories for this post
      const { data: categoryData, error: categoryError } = await supabase
        .from('blog_post_categories')
        .select(`
          blog_categories (
            id,
            name,
            slug
          )
        `)
        .eq('blog_post_id', data.id);

      if (categoryError) throw categoryError;
      setCategories(categoryData?.map(item => item.blog_categories).filter(Boolean) as Category[] || []);
      
    } catch (error: any) {
      toast({
        title: "Error fetching post",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (post) {
      // Update document title and meta description for SEO
      document.title = post.meta_title || post.title;
      
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', post.meta_description || post.excerpt || '');
      } else {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = post.meta_description || post.excerpt || '';
        document.head.appendChild(meta);
      }

      return () => {
        document.title = 'Sunday4k - Daily Inspiration for Meaningful Living';
      };
    }
  }, [post]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-foreground mb-4">Post Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The blog post you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/blog">
              <Button className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link to="/blog" className="inline-block mb-6">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Button>
          </Link>

          {/* Featured Image */}
          {post.featured_image_url && (
            <div className="mb-8 rounded-lg overflow-hidden shadow-lg">
              <img 
                src={post.featured_image_url} 
                alt={post.title}
                className="w-full h-auto object-cover max-h-[500px]"
              />
            </div>
          )}

          {/* Article Header */}
          <header className="mb-8">
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <Calendar className="h-4 w-4" />
              <time dateTime={post.published_at}>
                {format(new Date(post.published_at), 'MMMM dd, yyyy')}
              </time>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
              {post.title}
            </h1>
            
            {post.excerpt && (
              <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
                {post.excerpt}
              </p>
            )}

            {/* Categories and Blog Focus */}
            <div className="flex items-center gap-3 flex-wrap">
              {post.blog_focus && (
                <Badge className={getBlogFocusColor(post.blog_focus)}>
                  {formatBlogFocus(post.blog_focus)}
                </Badge>
              )}
              {categories.length > 0 && (
                <>
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  {categories.map(category => (
                    <Badge key={category.id} variant="secondary">
                      {category.name}
                    </Badge>
                  ))}
                </>
              )}
            </div>
          </header>

          {/* Article Content */}
          <Card>
            <CardContent className="p-8">
              <MarkdownPreview content={post.content} />
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="mt-8 text-center">
            <Link to="/blog">
              <Button className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to All Posts
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPost;