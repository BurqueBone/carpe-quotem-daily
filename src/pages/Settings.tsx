import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Bell, Clock, Hash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Settings = () => {
  const [period, setPeriod] = useState("day");
  const [quantity, setQuantity] = useState("1");
  const [enabled, setEnabled] = useState(true);
  const { toast } = useToast();

  const getMaxQuantity = (selectedPeriod: string) => {
    switch (selectedPeriod) {
      case "day": return 3;
      case "week": return 21;
      case "month": return 90;
      default: return 1;
    }
  };

  const getQuantityOptions = (selectedPeriod: string) => {
    const max = getMaxQuantity(selectedPeriod);
    return Array.from({ length: max }, (_, i) => (i + 1).toString());
  };

  const handleSave = () => {
    toast({
      title: "Settings saved!",
      description: "Your notification preferences have been updated.",
    });
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
              className="w-full bg-gradient-warm hover:opacity-90 text-white shadow-glow transition-smooth"
              size="lg"
            >
              Save Settings
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Settings;