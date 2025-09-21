import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthContext';
import { useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import BlogPostForm from '@/components/BlogPostForm';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminBlogNew = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/');
    }
  }, [user, isAdmin, authLoading, navigate]);

  const handleSave = () => {
    navigate('/admin/blog');
  };

  const handleCancel = () => {
    navigate('/admin/blog');
  };

  if (authLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/blog')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Create New Post</h1>
            <p className="text-muted-foreground">Write a new blog post</p>
          </div>
        </div>

        <BlogPostForm onSave={handleSave} onCancel={handleCancel} />
      </div>
    </AdminLayout>
  );
};

export default AdminBlogNew;