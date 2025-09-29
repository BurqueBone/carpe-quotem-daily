import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell, User, LogOut, Mail, Lock, Copy, Heart, Calendar as CalendarIcon, Sparkles } from "lucide-react";
import { useAuth } from "@/components/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSecurityValidation } from "@/hooks/useSecurityValidation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { maskEmail, cn } from "@/lib/utils";
import { useQuoteOfTheDay } from "@/hooks/useQuoteOfTheDay";
import { format, differenceInDays, eachDayOfInterval, getDay } from "date-fns";
const Profile = () => {
  const {
    user,
    signOut
  } = useAuth();
  const {
    toast
  } = useToast();
  const {
    validateEmail,
    sanitizeInput
  } = useSecurityValidation();
  const [enabled, setEnabled] = useState(true);

  // Account settings state
  const [newEmail, setNewEmail] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [sending, setSending] = useState(false);
  
  // Email share modal state
  const [emailShareOpen, setEmailShareOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  
  // Sunday counter state
  const [birthdate, setBirthdate] = useState<Date>();
  
  // Get today's quote for sharing
  const { quote, loading: quoteLoading } = useQuoteOfTheDay();

  // Load existing notification setting for the current user
  useEffect(() => {
    const loadSettings = async () => {
      if (!user?.id) return;
      const { data, error } = await supabase
        .from('notification_settings')
        .select('enabled')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) {
        console.warn('Failed to load notification settings:', error);
        return;
      }
      if (data) {
        setEnabled(!!data.enabled);
      }
    };
    loadSettings();
  }, [user?.id]);

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('notification_settings')
        .upsert({ user_id: user.id, enabled }, { onConflict: 'user_id' });
      if (error) throw error;
      toast({
        title: "Settings saved",
        description: "Your notification preferences have been updated.",
      });
    } catch (e: any) {
      console.error('Save settings error:', e);
      toast({
        title: "Failed to save",
        description: e?.message ?? "Unexpected error saving settings.",
        variant: "destructive",
      });
    }
  };
  const handleSignOut = async () => {
    await signOut();
  };
  const handleEmailUpdate = async () => {
    const sanitizedEmail = sanitizeInput(newEmail);
    const emailValidation = validateEmail(sanitizedEmail);
    if (!emailValidation.isValid) {
      toast({
        title: "Invalid Email",
        description: emailValidation.errors[0],
        variant: "destructive"
      });
      return;
    }
    setIsUpdating(true);
    try {
      const {
        error
      } = await supabase.auth.updateUser({
        email: sanitizedEmail
      });
      if (error) throw error;
      toast({
        title: "Email update initiated",
        description: "Please check your new email address for a confirmation link."
      });
      setNewEmail("");
    } catch (error: any) {
      console.error('Email update error:', error);
      toast({
        title: "Error updating email",
        description: error.message || "Failed to update email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };
  const handleShareQuote = async (method: 'copy' | 'email') => {
    if (!quote) {
      toast({
        title: "No quote available",
        description: "Please wait for today's quote to load.",
        variant: "destructive"
      });
      return;
    }

    const shareText = `"${quote.quote}" - ${quote.author}${quote.source ? `, ${quote.source}` : ''}\n\nShared from Sunday4k - Daily inspiration for meaningful living\nhttps://sunday4k.life`;

    try {
      switch (method) {
        case 'copy':
          await navigator.clipboard.writeText(shareText);
          toast({
            title: "Quote copied!",
            description: "The quote has been copied to your clipboard.",
          });
          break;
        
        case 'email':
          setEmailShareOpen(true);
          break;
      }
    } catch (error) {
      console.error('Share error:', error);
      toast({
        title: "Share failed",
        description: "Unable to share the quote. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSendEmail = async () => {
    const emailValidation = validateEmail(recipientEmail);
    if (!emailValidation.isValid) {
      toast({
        title: "Invalid Email",
        description: emailValidation.errors[0],
        variant: "destructive"
      });
      return;
    }

    setSendingEmail(true);
    try {
      const { error } = await supabase.functions.invoke('share-quote-email', {
        body: {
          recipientEmail,
          quote: quote?.quote,
          author: quote?.author,
          source: quote?.source
        }
      });

      if (error) throw error;

      toast({
        title: "Quote shared!",
        description: `Daily quote sent to ${recipientEmail}`,
      });
      
      setEmailShareOpen(false);
      setRecipientEmail("");
    } catch (error: any) {
      console.error('Email send error:', error);
      toast({
        title: "Failed to send",
        description: error.message || "Unable to send the quote. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSendingEmail(false);
    }
  };

  // Calculate Sundays experienced
  const calculateSundays = () => {
    if (!birthdate) return null;
    
    const today = new Date();
    const allDays = eachDayOfInterval({ start: birthdate, end: today });
    const sundays = allDays.filter(day => getDay(day) === 0); // Sunday is 0
    const sundaysExperienced = sundays.length;
    const sundaysRemaining = Math.max(0, 4000 - sundaysExperienced);
    
    return {
      experienced: sundaysExperienced,
      remaining: sundaysRemaining,
      isOver4000: sundaysExperienced >= 4000
    };
  };

  const sundayData = calculateSundays();
  return <div className="min-h-screen bg-gradient-subtle flex flex-col">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-2xl flex-1">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <User className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Profile</h1>
          </div>
          <Button variant="outline" onClick={handleSignOut} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        <div className="space-y-6">
          <Card className="border-border/50 shadow-card bg-gradient-subtle">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle>Notification Settings</CardTitle>
              </div>
              <CardDescription>
                Configure how often you'd like to receive gentle reminders about life's preciousness
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium text-foreground">
                    Enable Notifications
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Receive daily inspiration and gentle reminders
                  </p>
                </div>
                <Switch checked={enabled} onCheckedChange={setEnabled} />
              </div>

              {enabled && (
                <p className="text-sm text-muted-foreground">
                  You'll receive one inspiring quote each morning to start your day with purpose.
                </p>
              )}

              <Button onClick={handleSave} className="w-full">
                Save Settings
              </Button>
              
              <div className="pt-4 border-t border-border/50">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Heart className="h-4 w-4 text-primary" />
                    Share Today's Inspiration
                  </h3>
                  
                  {quoteLoading ? (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      Loading today's quote...
                    </div>
                  ) : quote ? (
                    <>
                      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                        <p className="text-sm italic text-foreground">"{quote.quote}"</p>
                        <p className="text-xs text-muted-foreground text-right">
                          — {quote.author}{quote.source ? `, ${quote.source}` : ''}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleShareQuote('copy')}
                          className="flex items-center gap-2"
                        >
                          <Copy className="h-4 w-4" />
                          Copy
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleShareQuote('email')}
                          className="flex items-center gap-2"
                        >
                          <Mail className="h-4 w-4" />
                          Email
                        </Button>
                      </div>
                      
                      <p className="text-xs text-muted-foreground text-center">
                        Spread positivity by sharing this inspiring quote with a friend
                      </p>
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      No quote available today
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-card bg-gradient-subtle">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                <CardTitle>Your Sunday Counter</CardTitle>
              </div>
              <CardDescription>
                Track your Sundays experienced and celebrate the gift of time
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Your Birthdate</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !birthdate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {birthdate ? format(birthdate, "PPP") : "Select your birthdate"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={birthdate}
                        onSelect={setBirthdate}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {sundayData && (
                  <div className="space-y-4 pt-4 border-t border-border/50">
                    {sundayData.isOver4000 ? (
                      <div className="text-center space-y-3">
                        <div className="flex items-center justify-center gap-2">
                          <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                          <h3 className="text-lg font-semibold text-foreground">Congratulations!</h3>
                          <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                        </div>
                        <div className="bg-primary/10 rounded-lg p-6 space-y-2">
                          <p className="text-3xl font-bold text-primary">
                            {sundayData.experienced.toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground">Sundays experienced</p>
                          <p className="text-foreground font-medium">
                            You've experienced more Sundays than the typical 4,000! 
                            You're living a beautifully full life. 🎉
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                            <p className="text-2xl font-bold text-primary">
                              {sundayData.experienced.toLocaleString()}
                            </p>
                            <p className="text-sm text-muted-foreground">Sundays experienced</p>
                          </div>
                          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                            <p className="text-2xl font-bold text-accent">
                              {sundayData.remaining.toLocaleString()}
                            </p>
                            <p className="text-sm text-muted-foreground">Sundays remaining</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="w-full bg-muted rounded-full h-3">
                            <div 
                              className="h-3 bg-gradient-primary rounded-full transition-all duration-500"
                              style={{ width: `${Math.min((sundayData.experienced / 4000) * 100, 100)}%` }}
                            />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {((sundayData.experienced / 4000) * 100).toFixed(1)}% of 4,000 Sundays
                          </p>
                        </div>
                        <p className="text-sm text-foreground">
                          Each Sunday is a gift. Make them count. ✨
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-card bg-gradient-subtle">
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle>Account Settings</CardTitle>
              </div>
              <CardDescription>
                Update your email address and password
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Update Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-medium text-foreground">Change Email</h3>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="current-email">Current Email</Label>
                  <Input id="current-email" type="email" value={user?.email ? maskEmail(user.email) : ""} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-email">New Email</Label>
                  <Input id="new-email" type="email" placeholder="Enter new email address" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
                </div>
                <Button onClick={handleEmailUpdate} disabled={isUpdating || !newEmail.trim()} className="w-full">
                  {isUpdating ? "Updating..." : "Update Email"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  You'll need to confirm your new email address before the change takes effect.
                </p>
              </div>

              {/* Password Update Section */}
              
            </CardContent>
          </Card>


          <Card className="border-border/50 shadow-card bg-gradient-subtle">
            <CardHeader>
              <CardTitle>About Sunday4K</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Sunday4K sends gentle reminders about life's preciousness to inspire meaningful action. 
                Our notifications are designed to uplift and motivate, not to create anxiety. Each message 
                is carefully chosen to help you appreciate the present moment and live with intention.
              </p>
            </CardContent>
          </Card>
        </div>

        
      </div>
      <Footer />
      
      {/* Email Share Modal */}
      <Dialog open={emailShareOpen} onOpenChange={setEmailShareOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Today's Quote</DialogTitle>
            <DialogDescription>
              Send today's inspiring quote to a friend via email
            </DialogDescription>
          </DialogHeader>
          
          {quote && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2 mb-4">
              <p className="text-sm italic text-foreground">"{quote.quote}"</p>
              <p className="text-xs text-muted-foreground text-right">
                — {quote.author}{quote.source ? `, ${quote.source}` : ''}
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="recipient-email">Recipient Email</Label>
            <Input
              id="recipient-email"
              type="email"
              placeholder="friend@example.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
            />
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setEmailShareOpen(false)}
              disabled={sendingEmail}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSendEmail}
              disabled={sendingEmail || !recipientEmail.trim()}
            >
              {sendingEmail ? "Sending..." : "Send Quote"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
};
export default Profile;