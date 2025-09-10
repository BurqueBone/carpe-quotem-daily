import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell, User, LogOut, Mail, Lock, Send } from "lucide-react";
import { useAuth } from "@/components/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSecurityValidation } from "@/hooks/useSecurityValidation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { maskEmail } from "@/lib/utils";
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
    validatePassword,
    sanitizeInput
  } = useSecurityValidation();
  const [enabled, setEnabled] = useState(true);

  // Account settings state
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [sending, setSending] = useState(false);

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
  const handlePasswordUpdate = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all password fields.",
        variant: "destructive"
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive"
      });
      return;
    }

    // Enhanced password validation
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      toast({
        title: "Weak Password",
        description: passwordValidation.errors[0],
        variant: "destructive"
      });
      return;
    }
    setIsUpdating(true);
    try {
      const {
        error
      } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
      toast({
        title: "Password updated",
        description: "Your password has been successfully updated with enhanced security."
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error('Password update error:', error);
      toast({
        title: "Error updating password",
        description: error.message || "Failed to update password. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendNow = async () => {
    try {
      setSending(true);
      const { data, error } = await supabase.functions.invoke('send-daily-quotes');
      if (error) throw error;
      toast({
        title: "Daily quote email triggered",
        description: "Emails have been queued successfully.",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Failed to send",
        description: err?.message ?? "Unexpected error triggering send.",
      });
    } finally {
      setSending(false);
    }
  };
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
                <Button onClick={handleSendNow} disabled={sending} className="w-full gap-2">
                  <Send className="h-4 w-4" />
                  {sending ? "Sending..." : "Send daily quote now"}
                </Button>
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
    </div>;
};
export default Profile;