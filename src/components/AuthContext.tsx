import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithMagicLink: (email: string) => Promise<{ error: any }>;
  requestEmailOtp: (email: string) => Promise<{ error: any }>;
  verifyEmailOtp: (email: string, token: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false); // Immediate logging to check if component renders

  console.log("🚀 AuthProvider: Component rendered/re-rendered");
  console.log("🌐 Current URL:", window.location.href);
  console.log("📊 Current state:", { hasUser: !!user, hasSession: !!session, loading });

  useEffect(() => {
    console.log("🔧 AuthContext: useEffect triggered"); // Set up auth state listener first (must be synchronous)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔄 Auth state change:", {
        event,
        hasSession: !!session,
        userEmail: session?.user?.email,
      });
      setSession(session);
      setUser(session?.user ?? null); // Check admin role when user changes
      if (session?.user) {
        checkAdminRole(session.user.id);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
      if (event === "SIGNED_IN" && session?.user) {
        console.log("✅ Successfully signed in:", session.user.email);
      }
    }); // Initialize auth state

    const initAuth = async () => {
      try {
        console.log("🔍 Initializing auth state..."); // Check for existing session - Supabase will automatically handle URL tokens
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        console.log("📋 Initial session check:", {
          hasSession: !!session,
          userEmail: session?.user?.email,
          error: sessionError?.message,
        }); // Set initial state
        setSession(session);
        setUser(session?.user ?? null); // Check admin role for initial session
        if (session?.user) {
          checkAdminRole(session.user.id);
        }
        setLoading(false);
      } catch (err) {
        console.error("💥 Auth initialization error:", err);
        setLoading(false);
      }
    };

    const checkAdminRole = async (userId: string) => {
      try {
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .eq("role", "admin")
          .maybeSingle();
        setIsAdmin(!!data);
      } catch (error) {
        console.error("Error checking admin role:", error);
        setIsAdmin(false);
      }
    };

    initAuth();

    return () => {
      console.log("🧹 Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, []);

  const signInWithMagicLink = async (email: string) => {
    const redirectUrl = `${window.location.origin}/auth/callback?flow=magic`;
    console.log("📧 AuthContext: Sending magic link to:", email, "with redirect:", redirectUrl); // Enforce email format validation before hitting auth
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { error: new Error("Invalid email format") };
    }
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });
    if (error) {
      console.error("❌ AuthContext: Magic link error:", error);
    } else {
      console.log("✉️ AuthContext: Magic link sent successfully");
    }
    return { error };
  };

  const requestEmailOtp = async (email: string) => {
    console.log("📧 AuthContext: Requesting email OTP for:", email);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { error: new Error("Invalid email format") };
    } // FIX: Removed the invalid 'emailActionType'.
    // The correct way to request an OTP code for email is to OMIT emailRedirectTo.
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });
    if (error) {
      console.error("❌ AuthContext: Email OTP error:", error);
    } else {
      console.log("✉️ AuthContext: Email OTP sent successfully");
    }
    return { error };
  };

  const verifyEmailOtp = async (email: string, token: string) => {
    console.log("🔑 AuthContext: Verifying email OTP..."); // The type must be 'email' (or 'signup') to successfully verify a code sent
    // via email when emailRedirectTo was omitted in signInWithOtp.
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });
    if (error) {
      console.error("❌ AuthContext: OTP verification error:", error);
    } else {
      console.log("✅ AuthContext: OTP verified successfully");
    }
    return { error };
  };

  const signOut = async () => {
    console.log("👋 AuthContext: Signing out...");
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    isAdmin,
    signInWithMagicLink,
    requestEmailOtp,
    verifyEmailOtp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
