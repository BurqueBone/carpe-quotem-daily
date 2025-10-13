import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, Calendar, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { formatBlogFocus, getBlogFocusColor, BlogFocus } from '@/utils/blogHelpers';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
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

const Blog = () => {
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedFocus, setSelectedFocus] = useState<BlogFocus | ''>('');

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, published_at, meta_title, meta_description, blog_focus, featured_image_url')
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching posts",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchPostsByCategory = async (categoryId: string) => {
    setLoading(true);
    try {
      let query = supabase
        .from('blog_posts')
        .select(`
          id, title, slug, excerpt, published_at, meta_title, meta_description,
          blog_post_categories!inner(category_id)
        `)
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (categoryId) {
        query = query.eq('blog_post_categories.category_id', categoryId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPosts(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching posts",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryFilter = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (categoryId) {
      fetchPostsByCategory(categoryId);
    } else {
      fetchPosts();
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFocus = !selectedFocus || post.blog_focus === selectedFocus;
    return matchesSearch && matchesFocus;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Sunday4k Blog
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Inspiring stories, meaningful reflections, and resources for living a more intentional life.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-col gap-3">
            <div className="flex gap-2 flex-wrap items-center">
              <span className="text-sm text-muted-foreground font-medium">Categories:</span>
              <Button
                variant={selectedCategory === '' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleCategoryFilter('')}
              >
                All Posts
              </Button>
              {categories.map(category => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleCategoryFilter(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>

            <div className="flex gap-2 flex-wrap items-center">
              <span className="text-sm text-muted-foreground font-medium">Blog Focus:</span>
              <Button
                variant={selectedFocus === '' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setSelectedFocus('')}
              >
                All
              </Button>
              <Button
                variant={selectedFocus === 'resource_review' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setSelectedFocus('resource_review')}
              >
                Resource Review
              </Button>
              <Button
                variant={selectedFocus === 'memento_mori_research' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setSelectedFocus('memento_mori_research')}
              >
                Memento Mori Research
              </Button>
              <Button
                variant={selectedFocus === 'meaningful_life' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setSelectedFocus('meaningful_life')}
              >
                Meaningful Life
              </Button>
            </div>
          </div>
        </div>

        {/* Blog Posts */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {searchQuery || selectedCategory 
                ? 'No posts found matching your criteria.' 
                : 'No blog posts published yet.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="h-full hover:shadow-lg transition-shadow overflow-hidden">
                {post.featured_image_url && (
                  <div className="aspect-video w-full overflow-hidden">
                    <img 
                      src={post.featured_image_url}
                      alt={post.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(post.published_at), 'MMM dd, yyyy')}
                  </div>
                  {post.blog_focus && (
                    <Badge variant="outline" className={`mb-2 ${getBlogFocusColor(post.blog_focus)} text-xs`}>
                      {formatBlogFocus(post.blog_focus)}
                    </Badge>
                  )}
                  <CardTitle className="text-xl mb-3 line-clamp-2">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col justify-between flex-1">
                  <div>
                    {post.excerpt && (
                      <p className="text-muted-foreground mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                  <Link 
                    to={`/blog/${post.slug}`}
                    className="inline-flex items-center text-primary hover:text-primary/80 font-medium gap-2 mt-auto"
                  >
                    Read More 
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Blog;