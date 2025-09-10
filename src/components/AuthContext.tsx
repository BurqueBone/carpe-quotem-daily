import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithMagicLink: (email: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Immediate logging to check if component renders
  console.log('🚀 AuthProvider: Component rendered/re-rendered');
  console.log('🌐 Current URL:', window.location.href);
  console.log('📊 Current state:', { hasUser: !!user, hasSession: !!session, loading });

  useEffect(() => {
    console.log('🔧 AuthContext: useEffect triggered');
    
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    
    console.log('🔗 URL analysis:', {
      hasCode: !!code,
      hasError: !!error,
      fullURL: window.location.href
    });
    
    if (error) {
      console.error('🚨 Auth Error from URL:', error);
      setLoading(false);
      return;
    }
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change:', { 
          event, 
          hasSession: !!session,
          userEmail: session?.user?.email 
        });
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ Successfully signed in:', session.user.email);
          // Clean URL after successful login
          if (window.location.search.includes('code=')) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }
      }
    );

    // Initialize auth state
    const initAuth = async () => {
      try {
        console.log('🔍 Initializing auth state...');
        
        // If we have a code parameter, Supabase should handle it automatically
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log('📋 Initial session check:', { 
          hasSession: !!session,
          userEmail: session?.user?.email,
          error: sessionError?.message,
          hasCodeInURL: !!code
        });
        
        if (!session && !sessionError) {
          console.log('ℹ️ No active session found');
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
      } catch (err) {
        console.error('💥 Auth initialization error:', err);
        setLoading(false);
      }
    };

    initAuth();

    return () => {
      console.log('🧹 Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signInWithMagicLink = async (email: string) => {
    const redirectUrl = `${window.location.origin}/`;
    console.log('📧 AuthContext: Sending magic link to:', email, 'with redirect:', redirectUrl);
    
    // Enforce email format validation before hitting auth
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { error: new Error('Invalid email format') };
    }
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    
    if (error) {
      console.error('❌ AuthContext: Magic link error:', error);
    } else {
      console.log('✉️ AuthContext: Magic link sent successfully');
    }
    
    return { error };
  };

  const signOut = async () => {
    console.log('👋 AuthContext: Signing out...');
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    signInWithMagicLink,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};