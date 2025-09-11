import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      console.log('🔄 AuthCallback: Processing auth callback...');
      
      try {
        // Get the current session - Supabase should have processed the URL automatically
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('📋 AuthCallback session check:', { 
          hasSession: !!session,
          userEmail: session?.user?.email,
          error: error?.message 
        });
        
        if (error) {
          console.error('❌ AuthCallback error:', error);
        }
        
        // Clean the URL and redirect to home
        console.log('🏠 AuthCallback: Redirecting to home...');
        navigate('/', { replace: true });
        
      } catch (err) {
        console.error('💥 AuthCallback error:', err);
        navigate('/', { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;