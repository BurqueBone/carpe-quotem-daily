import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Settings, 
  Mail, 
  LayoutDashboard, 
  ChevronLeft,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    {
      title: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
    },
    {
      title: 'Blog Posts',
      href: '/admin/blog',
      icon: Settings,
    },
    {
      title: 'Categories',
      href: '/admin/categories',
      icon: Settings,
    },
    {
      title: 'Contact Messages',
      href: '/admin/contact',
      icon: Mail,
    },
    {
      title: 'Email Templates',
      href: '/admin/templates',
      icon: Mail,
    },
    {
      title: 'Template Variables',
      href: '/admin/template-variables',
      icon: Settings,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ChevronLeft className="h-4 w-4" />
                Back to Site
              </Button>
            </Link>
            <h1 className="text-xl font-semibold text-foreground">
              Sunday4k Admin
            </h1>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} min-h-screen bg-card border-r border-border transition-all duration-300`}>
          <div className="p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full justify-center mb-4"
            >
              {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </Button>
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} to={item.href}>
                    <Button
                      variant={isActive(item.href) ? "secondary" : "ghost"}
                      className={`w-full gap-2 ${
                        sidebarCollapsed ? 'justify-center px-2' : 'justify-start'
                      } ${
                        isActive(item.href) 
                          ? "bg-accent text-accent-foreground" 
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      title={sidebarCollapsed ? item.title : undefined}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      {!sidebarCollapsed && <span>{item.title}</span>}
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;