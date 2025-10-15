import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, BarChart3, AlertTriangle, Target } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface StrategicGapMessage {
  emoji: string;
  icon: any;
  title: string;
  message: string;
  variant: 'destructive' | 'default';
}

const getStrategicGapMessage = (pct: number): StrategicGapMessage => {
  if (pct >= 0 && pct <= 25) {
    return {
      emoji: '🚨',
      icon: AlertCircle,
      title: 'Critical Misalignment',
      message: `Only ${pct}% of your time aligns with your legacy priorities. To make room, what's one area you can strategically underachieve at this week?`,
      variant: 'destructive'
    };
  } else if (pct >= 26 && pct <= 39) {
    return {
      emoji: '⚠️',
      icon: AlertTriangle,
      title: 'Significant Gap',
      message: `${pct}% alignment with your priorities. What's one area you can strategically underachieve at this week to increase this?`,
      variant: 'default'
    };
  } else if (pct >= 40 && pct <= 59) {
    return {
      emoji: '📊',
      icon: BarChart3,
      title: 'Moderate Alignment',
      message: `${pct}% of your time goes to what matters. Could you push this higher by underachieving in one low-value area?`,
      variant: 'default'
    };
  } else if (pct >= 60 && pct <= 79) {
    return {
      emoji: '✅',
      icon: CheckCircle2,
      title: 'Good Alignment',
      message: `${pct}% aligned with your priorities. Consider: Is there still one area where strategic underachievement would help?`,
      variant: 'default'
    };
  } else {
    return {
      emoji: '🎯',
      icon: Target,
      title: 'Excellent Alignment',
      message: `${pct}% of your time aligns with your legacy! You're living intentionally.`,
      variant: 'default'
    };
  }
};

const PriorityCheckIn = () => {
  const [priorities, setPriorities] = useState({
    priority1: '',
    priority2: '',
    priority3: ''
  });
  const [percentage, setPercentage] = useState<number>(0);
  const [underachieveArea, setUnderachieveArea] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handlePriorityChange = (key: keyof typeof priorities, value: string) => {
    setPriorities(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (!priorities.priority1 && !priorities.priority2 && !priorities.priority3) {
      return;
    }
    if (percentage < 80 && !underachieveArea.trim()) {
      return;
    }
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setPriorities({ priority1: '', priority2: '', priority3: '' });
    setPercentage(0);
    setUnderachieveArea('');
    setIsSubmitted(false);
  };

  const hasAnyPriority = priorities.priority1 || priorities.priority2 || priorities.priority3;
  const strategicGap = getStrategicGapMessage(percentage);
  const IconComponent = strategicGap.icon;

  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl flex-1">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-warm bg-clip-text text-transparent">
              Simple 3 Priority Check-in
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Imagine you're 90, reflecting on a life well-lived. What three things from your 
              planned week ahead will truly matter?
            </p>
          </div>

          {!isSubmitted ? (
            <Card className="border-border/50 shadow-card">
              <CardHeader>
                <CardTitle>Your Three Legacy Priorities</CardTitle>
                <CardDescription>
                  What matters most when you look back on this week from the end of your life?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Priority Inputs */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority1" className="text-base">Priority 1</Label>
                    <Textarea
                      id="priority1"
                      placeholder="e.g., Deep connection with my children"
                      value={priorities.priority1}
                      onChange={(e) => handlePriorityChange('priority1', e.target.value)}
                      rows={2}
                      className="resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority2" className="text-base">Priority 2</Label>
                    <Textarea
                      id="priority2"
                      placeholder="e.g., Making progress on my book"
                      value={priorities.priority2}
                      onChange={(e) => handlePriorityChange('priority2', e.target.value)}
                      rows={2}
                      className="resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority3" className="text-base">Priority 3</Label>
                    <Textarea
                      id="priority3"
                      placeholder="e.g., A challenging, meaningful conversation with a colleague"
                      value={priorities.priority3}
                      onChange={(e) => handlePriorityChange('priority3', e.target.value)}
                      rows={2}
                      className="resize-none"
                    />
                  </div>
                </div>

                {/* Percentage Assessment */}
                {hasAnyPriority && (
                  <div className="space-y-4 pt-4 border-t border-border/50">
                    <div className="space-y-3">
                      <Label htmlFor="percentage" className="text-base font-semibold">
                        Current Allocation
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        What percentage of your planned week (awake hours) is dedicated to these three things?
                      </p>
                      <div className="flex items-center gap-4">
                        <Slider
                          id="percentage"
                          min={0}
                          max={100}
                          step={5}
                          value={[percentage]}
                          onValueChange={(value) => setPercentage(value[0])}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={percentage}
                          onChange={(e) => setPercentage(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                          className="w-20 text-center"
                        />
                        <span className="text-sm font-medium">%</span>
                      </div>
                    </div>

                    {/* Strategic Gap Message */}
                    {percentage >= 0 && (
                      <Alert variant={strategicGap.variant} className="border-2">
                        <IconComponent className="h-5 w-5" />
                        <AlertTitle className="text-base font-semibold flex items-center gap-2">
                          {strategicGap.emoji} {strategicGap.title}
                        </AlertTitle>
                        <AlertDescription className="text-sm leading-relaxed mt-2">
                          {strategicGap.message}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Underachieve Input */}
                    {percentage < 80 && (
                      <div className="space-y-2 pt-2">
                        <Label htmlFor="underachieve" className="text-base font-semibold">
                          Strategic Underachievement
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          What's one area you can strategically underachieve at this week?
                        </p>
                        <Textarea
                          id="underachieve"
                          placeholder="e.g., Responding to non-urgent emails right away, Having a spotless house, etc."
                          value={underachieveArea}
                          onChange={(e) => setUnderachieveArea(e.target.value)}
                          rows={3}
                          className="resize-none"
                        />
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex justify-end pt-4">
                      <Button
                        onClick={handleSubmit}
                        disabled={!hasAnyPriority || (percentage < 80 && !underachieveArea.trim())}
                        size="lg"
                      >
                        Review My Check-in
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            /* Summary Card */
            <Card className="border-border/50 shadow-card bg-gradient-to-br from-background to-primary/5">
              <CardHeader>
                <CardTitle className="text-2xl">Your Weekly Commitment</CardTitle>
                <CardDescription>
                  A snapshot of what matters most and your plan to make room for it
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-foreground">Your Legacy Priorities:</h3>
                    <ul className="space-y-2">
                      {priorities.priority1 && (
                        <li className="flex items-start gap-2">
                          <span className="text-primary font-bold">1.</span>
                          <span className="text-muted-foreground">{priorities.priority1}</span>
                        </li>
                      )}
                      {priorities.priority2 && (
                        <li className="flex items-start gap-2">
                          <span className="text-primary font-bold">2.</span>
                          <span className="text-muted-foreground">{priorities.priority2}</span>
                        </li>
                      )}
                      {priorities.priority3 && (
                        <li className="flex items-start gap-2">
                          <span className="text-primary font-bold">3.</span>
                          <span className="text-muted-foreground">{priorities.priority3}</span>
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="p-4 bg-background/80 rounded-lg border border-border/50">
                    <p className="text-sm text-muted-foreground mb-1">Current Time Allocation</p>
                    <p className="text-3xl font-bold text-primary">{percentage}%</p>
                    <p className="text-xs text-muted-foreground mt-1">of your week dedicated to what matters</p>
                  </div>

                  {underachieveArea && (
                    <div className="p-4 bg-background/80 rounded-lg border border-border/50">
                      <p className="text-sm font-semibold text-foreground mb-2">
                        Strategic Underachievement:
                      </p>
                      <p className="text-muted-foreground">{underachieveArea}</p>
                    </div>
                  )}

                  <Alert className="bg-primary/10 border-primary/20">
                    <Target className="h-5 w-5" />
                    <AlertTitle className="font-semibold">Remember</AlertTitle>
                    <AlertDescription className="text-sm leading-relaxed">
                      This isn't about doing more—it's about doing less of the wrong things to make room 
                      for what truly matters. Strategic underachievement is your permission slip for 
                      intentional non-perfectionism.
                    </AlertDescription>
                  </Alert>
                </div>

                <div className="flex gap-3 pt-4 border-t border-border/50">
                  <Button onClick={handleReset} variant="outline" className="flex-1">
                    Start Over
                  </Button>
                  <Button onClick={() => window.print()} variant="default" className="flex-1">
                    Print This Check-in
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PriorityCheckIn;
