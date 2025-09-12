import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/components/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useSecurityValidation } from '@/hooks/useSecurityValidation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { maskEmail } from '@/lib/utils';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  
  const { user, signInWithMagicLink } = useAuth();
  const { toast } = useToast();
  const { validateEmail, checkRateLimit, sanitizeInput } = useSecurityValidation();

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Enhanced security validation
    const sanitizedEmail = sanitizeInput(email);
    const emailValidation = validateEmail(sanitizedEmail);
    
    if (!emailValidation.isValid) {
      setError(emailValidation.errors[0]);
      setLoading(false);
      return;
    }

    // Rate limiting check
    if (!checkRateLimit(`magic-link-${sanitizedEmail}`, 3, 10 * 60 * 1000)) {
      setLoading(false);
      return;
    }

    try {
      const { error } = await signInWithMagicLink(sanitizedEmail);
      if (error) {
        setError(error.message);
      } else {
        setEmailSent(true);
        toast({
          title: "Magic link sent!",
          description: "Please check your email and click the link to sign in.",
        });
      }
    } catch (err) {
      console.error('Magic link error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col">
      <Header />
      <div className="flex items-center justify-center p-4 flex-1" style={{ minHeight: 'calc(100vh - 80px)' }}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl bg-gradient-warm bg-clip-text text-transparent">
            {emailSent ? 'Check Your Email' : 'Sign In with Magic Link'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {emailSent ? (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                We've sent a magic link to <strong>{maskEmail(email)}</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                Click the link in your email to sign in. You can close this tab.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setEmailSent(false);
                  setEmail('');
                }}
                className="w-full"
              >
                Send to a different email
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  We'll send you a secure link to sign in - no password needed!
                </p>
              </div>
              
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Sending magic link...' : 'Send magic link'}
              </Button>

              <div className="text-center text-sm text-muted-foreground mt-4">
                By signing in, you agree to our{' '}
                <Link to="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Auth;