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
    
    // Immediate URL check
    const url = new URL(window.location.href);
    console.log('🔗 Full URL breakdown:', {
      origin: url.origin,
      pathname: url.pathname,
      search: url.search,
      searchParams: Object.fromEntries(url.searchParams),
      hash: url.hash
    });
    
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    
    console.log('🔑 Auth code check:', { code: code ? code.substring(0, 8) + '...' : null, error });
    
    if (error) {
      console.error('🚨 Auth Error from URL:', error, url.searchParams.get('error_description'));
    }
    
    // Test Supabase client
    console.log('🧪 Testing Supabase client:', supabase ? 'exists' : 'missing');
    
    // Set up auth state listener
    console.log('👂 Setting up auth state listener...');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔄 Auth state change:', { event, userEmail: session?.user?.email, hasAccessToken: !!session?.access_token });
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ Successfully signed in:', session.user.email);
          // Clean URL
          if (window.location.search.includes('code=')) {
            console.log('🧹 Cleaning URL...');
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }
      }
    );

    // Get current session
    console.log('📋 Getting current session...');
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        console.log('📋 Session result:', { 
          hasSession: !!session, 
          userEmail: session?.user?.email, 
          error: error?.message 
        });
        
        if (!session && code) {
          console.log('🔄 No session but have code, exchanging for session...');
          // Exchange the auth code for a session
          return supabase.auth.exchangeCodeForSession(code);
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      })
      .then((result) => {
        if (result && 'data' in result) {
          const { data: { session }, error } = result;
          console.log('🔄 Code exchange result:', { 
            hasSession: !!session, 
            userEmail: session?.user?.email, 
            error: error?.message 
          });
          if (session) {
            setSession(session);
            setUser(session.user);
            setLoading(false);
            // Clean URL after successful auth
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }
      })
      .catch(err => {
        console.error('💥 Error getting/exchanging session:', err);
        setLoading(false);
      });

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