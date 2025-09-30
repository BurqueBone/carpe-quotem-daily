import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { isLovablePreview } from '@/lib/lovablePreview';

const DebugAuth = () => {
  const { user, session, loading, isAdmin } = useAuth();
  const [localStorageData, setLocalStorageData] = useState<string>('');
  const [sessionData, setSessionData] = useState<any>(null);

  useEffect(() => {
    // Check localStorage
    const storageKey = `sb-aywuwyqscrtavulqijxm-auth-token`;
    const stored = localStorage.getItem(storageKey);
    setLocalStorageData(stored ? 'Session found in localStorage' : 'No session in localStorage');

    // Check session via Supabase
    supabase.auth.getSession().then(({ data, error }) => {
      setSessionData({ data, error });
    });
  }, []);

  const inLovablePreview = isLovablePreview();

  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col">
      <Header />
      <div className="container mx-auto py-8 px-4 flex-1">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Auth Debug Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Environment Detection */}
            <div>
              <h3 className="font-semibold mb-2">Environment</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Hostname:</span>
                  <code className="bg-muted px-2 py-1 rounded text-sm">{window.location.hostname}</code>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">In Lovable Preview:</span>
                  <Badge variant={inLovablePreview ? "default" : "secondary"}>
                    {inLovablePreview ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Has __lovable_token:</span>
                  <Badge variant={window.location.search.includes('__lovable_token=') ? "default" : "secondary"}>
                    {window.location.search.includes('__lovable_token=') ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Auth Context State */}
            <div>
              <h3 className="font-semibold mb-2">Auth Context State</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Loading:</span>
                  <Badge variant={loading ? "default" : "secondary"}>
                    {loading ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">User:</span>
                  <Badge variant={user ? "default" : "secondary"}>
                    {user ? `Logged in (${user.email})` : 'Not logged in'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Session:</span>
                  <Badge variant={session ? "default" : "secondary"}>
                    {session ? 'Active' : 'None'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Is Admin:</span>
                  <Badge variant={isAdmin ? "default" : "secondary"}>
                    {isAdmin ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* localStorage Check */}
            <div>
              <h3 className="font-semibold mb-2">Local Storage</h3>
              <p className="text-sm text-muted-foreground">{localStorageData}</p>
            </div>

            {/* Supabase Session Check */}
            <div>
              <h3 className="font-semibold mb-2">Supabase Session API</h3>
              <pre className="bg-muted p-4 rounded text-xs overflow-auto max-h-96">
                {JSON.stringify(sessionData, null, 2)}
              </pre>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-4 rounded">
              <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">
                Why am I not logged in within Lovable?
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                Modern browsers use <strong>storage partitioning</strong> for iframes. This means the Lovable preview iframe has a separate localStorage from opening the same URL in a new tab.
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                To log in within the Lovable preview, use the <strong>"Email code (OTP)"</strong> or <strong>"Paste magic link"</strong> options on the <a href="/auth" className="underline font-semibold">auth page</a>.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default DebugAuth;
