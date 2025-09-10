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

  useEffect(() => {
    console.log('🔧 AuthContext: Setting up auth state listener');
    
    // Check for auth callback code in URL (from magic link)
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');
    
    if (error) {
      console.error('🚨 Auth Error from URL:', error, errorDescription);
    }
    
    if (code) {
      console.log('🔑 AuthContext: Found auth code in URL, exchanging for session...');
      // Manually exchange the code for a session
      supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
        if (error) {
          console.error('❌ AuthContext: Code exchange failed:', error);
        } else {
          console.log('✅ AuthContext: Code exchange successful:', data.session?.user?.email);
          setSession(data.session);
          setUser(data.session?.user ?? null);
          setLoading(false);
          
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      });
    }

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 AuthContext: Auth state change event:', event, {
          hasSession: !!session,
          userEmail: session?.user?.email,
          accessToken: session?.access_token ? 'present' : 'missing'
        });
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Handle successful magic link authentication
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ AuthContext: User successfully signed in:', session.user.email);
          
          // Clear any auth error from URL
          if (window.location.search.includes('error=') || window.location.search.includes('code=')) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }
        
        if (event === 'SIGNED_OUT') {
          console.log('👋 AuthContext: User signed out');
        }
      }
    );

    // Check for existing session (only if no code to exchange)
    if (!code) {
      const checkSession = async () => {
        console.log('🔍 AuthContext: Checking for existing session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ AuthContext: Error getting session:', error);
        } else {
          console.log('📋 AuthContext: Initial session check:', {
            hasSession: !!session,
            userEmail: session?.user?.email,
            accessToken: session?.access_token ? 'present' : 'missing'
          });
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      };
      
      checkSession();
    }

    return () => {
      console.log('🧹 AuthContext: Cleaning up auth listener');
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