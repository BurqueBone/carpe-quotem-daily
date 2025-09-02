import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Bell, User, LogOut } from "lucide-react";
import { useAuth } from "@/components/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Navigate } from "react-router-dom";
import Header from "@/components/Header";

const Profile = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  
  const [period, setPeriod] = useState("day");
  const [quantity, setQuantity] = useState("1");
  const [enabled, setEnabled] = useState(true);

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const getMaxQuantity = (selectedPeriod: string): number => {
    switch (selectedPeriod) {
      case "day": return 3;
      case "week": return 21;
      case "month": return 90;
      default: return 3;
    }
  };

  const getQuantityOptions = (selectedPeriod: string): string[] => {
    const max = getMaxQuantity(selectedPeriod);
    return Array.from({ length: max }, (_, i) => (i + 1).toString());
  };

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your notification preferences have been updated.",
    });
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
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
                <Switch
                  checked={enabled}
                  onCheckedChange={setEnabled}
                />
              </div>

              {enabled && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Frequency</label>
                    <Select value={period} onValueChange={setPeriod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">Per Day</SelectItem>
                        <SelectItem value="week">Per Week</SelectItem>
                        <SelectItem value="month">Per Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Number of Notifications
                    </label>
                    <Select 
                      value={quantity} 
                      onValueChange={setQuantity}
                      key={period} // Force re-render when period changes
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select quantity" />
                      </SelectTrigger>
                      <SelectContent>
                        {getQuantityOptions(period).map((num) => (
                          <SelectItem key={num} value={num}>
                            {num} {period === "day" ? (num === "1" ? "notification" : "notifications") : 
                                 period === "week" ? (num === "1" ? "notification" : "notifications") :
                                 (num === "1" ? "notification" : "notifications")} per {period}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Maximum: {getMaxQuantity(period)} per {period}
                    </p>
                  </div>
                </>
              )}

              <Button onClick={handleSave} className="w-full">
                Save Settings
              </Button>
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
    </div>
  );
};

export default Profile;