import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Handles magic link / OAuth codes on ANY route and cleans the URL
const AuthUrlHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const url = new URL(window.location.href);
    const hasCode = url.searchParams.has("code");
    const hasError = url.searchParams.has("error") || url.searchParams.has("error_description");
    const hasHashTokens = url.hash && /(access_token|refresh_token|type)/.test(url.hash);

    if (!hasCode && !hasError && !hasHashTokens) return;

    const exchangeAndClean = async () => {
      console.log("🔐 AuthUrlHandler: Detected auth params. Exchanging code for session...");
      try {
        if (hasCode) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);
          if (error) {
            console.error("❌ AuthUrlHandler: exchangeCodeForSession error:", error);
          } else {
            console.log("✅ AuthUrlHandler: Session established for:", data.session?.user?.email);
          }
        } else {
          // Magic link implicit flow: tokens in URL hash are auto-processed by Supabase
          await supabase.auth.getSession();
          console.log("✅ AuthUrlHandler: Session processed from URL hash.");
        }
      } catch (e) {
        console.error("💥 AuthUrlHandler: Unexpected error during exchange:", e);
      } finally {
        // Clean query and hash from URL (remove auth params only, keep others)
        const current = new URL(window.location.href);
        const params = new URLSearchParams(current.search);
        ["code", "state", "error", "error_description", "type", "provider"].forEach((p) =>
          params.delete(p)
        );
        const newSearch = params.toString();
        const cleanPath = newSearch ? `${current.pathname}?${newSearch}` : current.pathname;

        // Remove hash entirely
        window.history.replaceState({}, "", cleanPath);
        navigate(cleanPath, { replace: true });
        console.log("🧹 AuthUrlHandler: Cleaned URL and navigated to:", cleanPath);
      }
    };

    exchangeAndClean();
    // re-run when location changes (e.g. after redirect)
  }, [location.key, navigate]);

  return null;
};

export default AuthUrlHandler;
