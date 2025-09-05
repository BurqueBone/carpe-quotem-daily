import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Bell, Clock, Hash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Settings = () => {
  const [period, setPeriod] = useState("day");
  const [quantity, setQuantity] = useState("1");
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const getMaxQuantity = (selectedPeriod: string) => {
    switch (selectedPeriod) {
      case "day": return 1;
      case "week": return 7;
      case "month": return 30;
      default: return 1;
    }
  };

  const getQuantityOptions = (selectedPeriod: string) => {
    const max = getMaxQuantity(selectedPeriod);
    return Array.from({ length: max }, (_, i) => (i + 1).toString());
  };

  // Load user settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('notification_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading settings:', error);
          return;
        }

        if (data) {
          setEnabled(data.enabled);
          setPeriod(data.period);
          setQuantity(data.quantity.toString());
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save settings.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('notification_settings')
        .upsert({
          user_id: user.id,
          enabled,
          period,
          quantity: parseInt(quantity),
        });

      if (error) throw error;

      toast({
        title: "Settings saved!",
        description: "Your notification preferences have been updated.",
      });

      // Best-effort sync to Resend contacts when notifications are enabled
      if (enabled && user?.email) {
        try {
          await supabase.functions.invoke('sync-resend-contacts', {
            body: { action: 'sync_user', email: user.email },
          });
        } catch (e) {
          console.warn('Resend contact sync skipped/failed:', e);
        }
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleSendTest = async () => {
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-daily-quotes');
      if (error) throw error as any;
      toast({
        title: "Test send triggered",
        description: `Emails sent: ${data?.emailsSent ?? 0}. Errors: ${data?.errors?.length ?? 0}`,
      });
    } catch (error: any) {
      console.error('Error triggering test send:', error);
      toast({
        title: "Error",
        description: error?.message ?? "Failed to trigger send. Check Edge Function logs.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl flex-1">
        <div className="space-y-6">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-gradient-warm flex items-center justify-center shadow-glow mx-auto">
              <Bell className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-warm bg-clip-text text-transparent">
              Notification Settings
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Customize how often you'd like to receive gentle reminders about life's preciousness
            </p>
          </div>

          <div className="grid gap-6 max-w-2xl mx-auto">
            <Card className="p-6 bg-gradient-subtle shadow-card border-border/50">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Enable Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive daily reminders to live meaningfully
                    </p>
                  </div>
                  <Switch checked={enabled} onCheckedChange={setEnabled} />
                </div>

                {enabled && (
                  <>
                    <div className="space-y-3">
                      <Label className="text-base font-medium flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Time Period
                      </Label>
                      <Select value={period} onValueChange={(value) => {
                        setPeriod(value);
                        setQuantity("1"); // Reset quantity when period changes
                      }}>
                        <SelectTrigger className="bg-background border-border/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="day">Per Day</SelectItem>
                          <SelectItem value="week">Per Week</SelectItem>
                          <SelectItem value="month">Per Month</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-base font-medium flex items-center gap-2">
                        <Hash className="w-4 h-4" />
                        Number of Notifications
                      </Label>
                      <Select value={quantity} onValueChange={setQuantity}>
                        <SelectTrigger className="bg-background border-border/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {getQuantityOptions(period).map((num) => (
                            <SelectItem key={num} value={num}>
                              {num} {period === "day" ? "per day" : period === "week" ? "per week" : "per month"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        We recommend once a day to start. Alerts are sent at random intervals.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </Card>

            <Button
              onClick={handleSendTest}
              disabled={sending || !user}
              variant="outline"
              className="w-full"
              size="sm"
              aria-label="Send today's daily quote email to all enabled users now"
            >
              {sending ? "Sending..." : "Send Today's Quote"}
            </Button>

            <Card className="p-6 bg-gradient-subtle shadow-card border-border/50">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">About Notifications</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    Our notifications are designed to gently remind you of life's finite nature - not to cause anxiety, 
                    but to inspire you to live more fully and appreciate each moment.
                  </p>
                  <p>
                    Each notification contains a carefully selected quote about the meaningfulness of life, 
                    encouraging reflection and positive action.
                  </p>
                  <p className="text-primary font-medium">
                    "The goal isn't to live forever, but to create something that will." - Andy Warhol
                  </p>
                </div>
              </div>
            </Card>

            <Button 
              onClick={handleSave}
              disabled={saving || loading || !user}
              className="w-full bg-gradient-warm hover:opacity-90 text-white shadow-glow transition-smooth"
              size="lg"
            >
              {saving ? "Saving..." : "Save Settings"}
            </Button>
            
            {!user && (
              <p className="text-sm text-muted-foreground text-center mt-2">
                Please log in to save your notification preferences.
              </p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Settings;