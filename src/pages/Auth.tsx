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
import { Mail, KeyRound } from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [otpToken, setOtpToken] = useState('');
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
          description: "Check your email and click the link to sign in.",
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
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="magic-link" className="text-xs">
                  <Mail className="h-3 w-3 mr-1" />
                  Magic Link
                </TabsTrigger>
                <TabsTrigger value="otp" className="text-xs">
                  <KeyRound className="h-3 w-3 mr-1" />
                  Email Code
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
                      Click the link in your email to sign in.
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
