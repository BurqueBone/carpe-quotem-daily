import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminStats {
  activeTemplates: number;
  totalUsers: number;
  emailsSentThisMonth: number;
  newUsersThisWeek: number;
}

export const useAdminStats = () => {
  const [stats, setStats] = useState<AdminStats>({
    activeTemplates: 0,
    totalUsers: 0,
    emailsSentThisMonth: 0,
    newUsersThisWeek: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get active templates count
        const { count: templatesCount, error: templatesError } = await supabase
          .from('email_templates')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);

        if (templatesError) throw templatesError;

        // Get total users count
        const { count: usersCount, error: usersError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        if (usersError) throw usersError;

        // Get emails sent this month
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const { count: emailsCount, error: emailsError } = await supabase
          .from('notification_sends')
          .select('*', { count: 'exact', head: true })
          .gte('sent_at', firstDayOfMonth.toISOString());

        if (emailsError) throw emailsError;

        // Get new users this week
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        
        const { count: newUsersCount, error: newUsersError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startOfWeek.toISOString());

        if (newUsersError) throw newUsersError;

        setStats({
          activeTemplates: templatesCount || 0,
          totalUsers: usersCount || 0,
          emailsSentThisMonth: emailsCount || 0,
          newUsersThisWeek: newUsersCount || 0,
        });
      } catch (err) {
        console.error('Error fetching admin stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
};