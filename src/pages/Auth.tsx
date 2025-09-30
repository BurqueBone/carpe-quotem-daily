import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/components/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useSecurityValidation } from '@/hooks/useSecurityValidation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { maskEmail } from '@/lib/utils';
import { Mail, Link as LinkIcon, KeyRound } from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [magicLinkUrl, setMagicLinkUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  
  const { user, signInWithMagicLink, requestEmailOtp, verifyEmailOtp } = useAuth();
  const { toast } = useToast();
  const { validateEmail, checkRateLimit, sanitizeInput } = useSecurityValidation();

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const sanitizedEmail = sanitizeInput(email);
    const emailValidation = validateEmail(sanitizedEmail);
    
    if (!emailValidation.isValid) {
      setError(emailValidation.errors[0]);
      setLoading(false);
      return;
    }

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
          description: "Check your email and use the 'Paste magic link' tab to sign in within Lovable.",
        });
      }
    } catch (err) {
      console.error('Magic link error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const sanitizedEmail = sanitizeInput(email);
    const emailValidation = validateEmail(sanitizedEmail);
    
    if (!emailValidation.isValid) {
      setError(emailValidation.errors[0]);
      setLoading(false);
      return;
    }

    try {
      const { error } = await requestEmailOtp(sanitizedEmail);
      if (error) {
        setError(error.message);
      } else {
        setOtpSent(true);
        toast({
          title: "Verification code sent!",
          description: "Check your email for a 6-digit code.",
        });
      }
    } catch (err) {
      console.error('OTP request error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (otpToken.length !== 6) {
      setError('Please enter a 6-digit code');
      setLoading(false);
      return;
    }

    try {
      const { error } = await verifyEmailOtp(email, otpToken);
      if (error) {
        setError(error.message);
      } else {
        toast({
          title: "Success!",
          description: "You're now signed in.",
        });
      }
    } catch (err) {
      console.error('OTP verify error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasteMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!magicLinkUrl.includes('access_token') && !magicLinkUrl.includes('code=')) {
      setError('This doesn\'t look like a valid magic link');
      setLoading(false);
      return;
    }

    try {
      // Navigate to the magic link URL within the same window context
      window.location.assign(magicLinkUrl);
    } catch (err) {
      console.error('Paste magic link error:', err);
      setError('Invalid magic link URL');
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
              Sign In
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Choose your preferred sign-in method
            </p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="magic-link" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="magic-link" className="text-xs">
                  <Mail className="h-3 w-3 mr-1" />
                  Magic Link
                </TabsTrigger>
                <TabsTrigger value="otp" className="text-xs">
                  <KeyRound className="h-3 w-3 mr-1" />
                  Email Code
                </TabsTrigger>
                <TabsTrigger value="paste" className="text-xs">
                  <LinkIcon className="h-3 w-3 mr-1" />
                  Paste Link
                </TabsTrigger>
              </TabsList>

              {/* Magic Link Tab */}
              <TabsContent value="magic-link" className="space-y-4">
                {emailSent ? (
                  <div className="text-center space-y-4 py-4">
                    <p className="text-muted-foreground">
                      We've sent a magic link to <strong>{maskEmail(email)}</strong>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Click the link in your email, then use the "Paste Link" tab to sign in within Lovable.
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
                  <form onSubmit={handleMagicLinkSubmit} className="space-y-4 pt-4">
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="magic-email">Email</Label>
                      <Input
                        id="magic-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        We'll send you a secure link - no password needed!
                      </p>
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Sending...' : 'Send magic link'}
                    </Button>
                  </form>
                )}
              </TabsContent>

              {/* OTP Tab */}
              <TabsContent value="otp" className="space-y-4">
                {!otpSent ? (
                  <form onSubmit={handleOtpRequest} className="space-y-4 pt-4">
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="otp-email">Email</Label>
                      <Input
                        id="otp-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        We'll send you a 6-digit verification code
                      </p>
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Sending...' : 'Send verification code'}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleOtpVerify} className="space-y-4 pt-4">
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="text-sm text-muted-foreground mb-4">
                      Code sent to <strong>{maskEmail(email)}</strong>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="otp-token">6-Digit Code</Label>
                      <Input
                        id="otp-token"
                        type="text"
                        value={otpToken}
                        onChange={(e) => setOtpToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="000000"
                        maxLength={6}
                        required
                      />
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Verifying...' : 'Verify code'}
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setOtpSent(false);
                        setOtpToken('');
                        setError('');
                      }}
                      className="w-full"
                    >
                      Use a different email
                    </Button>
                  </form>
                )}
              </TabsContent>

              {/* Paste Magic Link Tab */}
              <TabsContent value="paste" className="space-y-4">
                <form onSubmit={handlePasteMagicLink} className="space-y-4 pt-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-3 rounded text-sm">
                    <p className="text-blue-900 dark:text-blue-100 font-medium mb-2">
                      For Lovable Preview Users:
                    </p>
                    <ol className="text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside text-xs">
                      <li>Request a magic link in the "Magic Link" tab</li>
                      <li>Open your email and copy the full magic link URL</li>
                      <li>Paste it below and click "Sign In"</li>
                    </ol>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="paste-link">Paste Magic Link URL</Label>
                    <Input
                      id="paste-link"
                      type="url"
                      value={magicLinkUrl}
                      onChange={(e) => setMagicLinkUrl(e.target.value)}
                      placeholder="https://..."
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="text-center text-sm text-muted-foreground mt-6">
              By signing in, you agree to our{' '}
              <Link to="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Auth;
