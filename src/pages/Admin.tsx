import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthContext';
import { useAdminStats } from '@/hooks/useAdminStats';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Users, Settings, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();
  const { stats, loading: statsLoading, error: statsError } = useAdminStats();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/');
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading || statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const dashboardStats = [
    {
      title: "Active Templates",
      value: formatNumber(stats.activeTemplates),
      description: "Email templates in use",
      icon: Mail,
      color: "text-blue-600"
    },
    {
      title: "Total Users", 
      value: formatNumber(stats.totalUsers),
      description: "Registered users",
      icon: Users,
      color: "text-green-600"
    },
    {
      title: "Emails Sent",
      value: formatNumber(stats.emailsSentThisMonth),
      description: "This month",
      icon: TrendingUp,
      color: "text-purple-600"
    }
  ];

  if (statsError) {
    console.error('Stats error:', statsError);
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your Sunday4k application settings and content.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dashboardStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Templates
              </CardTitle>
              <CardDescription>
                Manage your email templates and content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Create, edit, and manage email templates for signup confirmations, 
                daily quotes, and password resets.
              </p>
              <Link to="/admin/templates">
                <Button>Manage Templates</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Settings
              </CardTitle>
              <CardDescription>
                Configure application settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Manage application-wide settings, user roles, and system configuration.
              </p>
              <Button variant="outline" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Admin;