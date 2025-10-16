import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { RotateCcw, CheckCircle2 } from "lucide-react";

const SimplePriorityCheckIn = () => {
  const [priorities, setPriorities] = useState({
    priority1: '',
    priority2: '',
    priority3: ''
  });
  const [priorityHours, setPriorityHours] = useState({
    priority1Hours: 0,
    priority2Hours: 0,
    priority3Hours: 0
  });
  
  const [isSubmitted, setIsSubmitted] = useState(false);

  const totalPriorityHours = priorityHours.priority1Hours + priorityHours.priority2Hours + priorityHours.priority3Hours;
  const WAKING_HOURS_PER_WEEK = 112;
  const calculatedPercentage = Math.round((totalPriorityHours / WAKING_HOURS_PER_WEEK) * 100);

  const allPrioritiesComplete = 
    priorities.priority1.trim() !== '' && 
    priorities.priority2.trim() !== '' && 
    priorities.priority3.trim() !== '' &&
    priorityHours.priority1Hours !== null &&
    priorityHours.priority2Hours !== null &&
    priorityHours.priority3Hours !== null &&
    Number.isInteger(priorityHours.priority1Hours) &&
    Number.isInteger(priorityHours.priority2Hours) &&
    Number.isInteger(priorityHours.priority3Hours);

  const getStrategicGapMessage = (pct: number) => {
    if (pct >= 0 && pct <= 25) {
      return {
        emoji: '🚨',
        title: 'Critical Misalignment',
        message: `Only ${pct}% of your time aligns with your legacy priorities. To make room, what's one area you can strategically underachieve at this week?`,
        variant: 'destructive' as const
      };
    } else if (pct >= 26 && pct <= 39) {
      return {
        emoji: '⚠️',
        title: 'Significant Gap',
        message: `${pct}% alignment with your priorities. What's one area you can strategically underachieve at this week to increase this?`,
        variant: 'default' as const
      };
    } else if (pct >= 40 && pct <= 59) {
      return {
        emoji: '📊',
        title: 'Moderate Alignment',
        message: `${pct}% of your time goes to what matters. Could you push this higher by underachieving in one low-value area?`,
        variant: 'default' as const
      };
    } else if (pct >= 60 && pct <= 79) {
      return {
        emoji: '✅',
        title: 'Good Alignment',
        message: `${pct}% aligned with your priorities. Consider: Is there still one area where strategic underachievement would help?`,
        variant: 'default' as const
      };
    } else {
      return {
        emoji: '🎯',
        title: 'Excellent Alignment',
        message: `${pct}% of your time aligns with your legacy! You're living intentionally.`,
        variant: 'default' as const
      };
    }
  };

  const strategicGap = getStrategicGapMessage(calculatedPercentage);
  const needsUnderachieveField = calculatedPercentage < 80;

  const handleSubmit = () => {
    if (!allPrioritiesComplete) return;
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setPriorities({ priority1: '', priority2: '', priority3: '' });
    setPriorityHours({ priority1Hours: 0, priority2Hours: 0, priority3Hours: 0 });
    setIsSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl flex-1">
        <div className="space-y-8">
          {/* Page Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-warm bg-clip-text text-transparent">
              Simple Priority Check-in
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed italic">
              "Imagine you're 90, reflecting on a life well-lived. What did you spend your precious time on? 
              What truly mattered in the end?"
            </p>
          </div>

          {!isSubmitted ? (
            <Card>
              <CardHeader>
                <CardTitle>Your Top 3 Priorities This Week</CardTitle>
                <CardDescription>
                  What are the three most important things you want to focus on to create a life worth celebrating?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start">
                    <div className="flex-1 space-y-2 w-full">
                      <Label htmlFor="priority1">Priority 1</Label>
                      <Textarea
                        id="priority1"
                        placeholder="e.g., Deepening connections with my children"
                        value={priorities.priority1}
                        onChange={(e) => setPriorities(prev => ({ ...prev, priority1: e.target.value }))}
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2 w-full md:w-32">
                      <Label htmlFor="priority1Hours" className="whitespace-nowrap">
                        Hours/Week
                      </Label>
                      <Input
                        id="priority1Hours"
                        type="number"
                        min="0"
                        max="112"
                        value={priorityHours.priority1Hours || ''}
                        onChange={(e) => setPriorityHours(prev => ({ 
                          ...prev, 
                          priority1Hours: Math.min(112, Math.max(0, parseInt(e.target.value) || 0))
                        }))}
                        placeholder="0"
                        className="text-center"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start">
                    <div className="flex-1 space-y-2 w-full">
                      <Label htmlFor="priority2">Priority 2</Label>
                      <Textarea
                        id="priority2"
                        placeholder="e.g., Building physical vitality through movement"
                        value={priorities.priority2}
                        onChange={(e) => setPriorities(prev => ({ ...prev, priority2: e.target.value }))}
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2 w-full md:w-32">
                      <Label htmlFor="priority2Hours" className="whitespace-nowrap">
                        Hours/Week
                      </Label>
                      <Input
                        id="priority2Hours"
                        type="number"
                        min="0"
                        max="112"
                        value={priorityHours.priority2Hours || ''}
                        onChange={(e) => setPriorityHours(prev => ({ 
                          ...prev, 
                          priority2Hours: Math.min(112, Math.max(0, parseInt(e.target.value) || 0))
                        }))}
                        placeholder="0"
                        className="text-center"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start">
                    <div className="flex-1 space-y-2 w-full">
                      <Label htmlFor="priority3">Priority 3</Label>
                      <Textarea
                        id="priority3"
                        placeholder="e.g., Creating meaningful work that serves others"
                        value={priorities.priority3}
                        onChange={(e) => setPriorities(prev => ({ ...prev, priority3: e.target.value }))}
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2 w-full md:w-32">
                      <Label htmlFor="priority3Hours" className="whitespace-nowrap">
                        Hours/Week
                      </Label>
                      <Input
                        id="priority3Hours"
                        type="number"
                        min="0"
                        max="112"
                        value={priorityHours.priority3Hours || ''}
                        onChange={(e) => setPriorityHours(prev => ({ 
                          ...prev, 
                          priority3Hours: Math.min(112, Math.max(0, parseInt(e.target.value) || 0))
                        }))}
                        placeholder="0"
                        className="text-center"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-center pt-6">
                  <Button
                    onClick={handleSubmit}
                    size="lg"
                    disabled={!allPrioritiesComplete}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    View My Summary
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Your Priority Check-in Summary</CardTitle>
                <CardDescription>
                  A snapshot of what matters most this week and your commitment to living intentionally
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Your Top Priorities:</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-2 flex-1">
                          <span className="text-primary font-bold">1.</span>
                          <span>{priorities.priority1}</span>
                        </div>
                        <div className="text-sm font-semibold text-primary whitespace-nowrap">
                          {priorityHours.priority1Hours} hrs/week
                        </div>
                      </li>
                      <li className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-2 flex-1">
                          <span className="text-primary font-bold">2.</span>
                          <span>{priorities.priority2}</span>
                        </div>
                        <div className="text-sm font-semibold text-primary whitespace-nowrap">
                          {priorityHours.priority2Hours} hrs/week
                        </div>
                      </li>
                      <li className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-2 flex-1">
                          <span className="text-primary font-bold">3.</span>
                          <span>{priorities.priority3}</span>
                        </div>
                        <div className="text-sm font-semibold text-primary whitespace-nowrap">
                          {priorityHours.priority3Hours} hrs/week
                        </div>
                      </li>
                    </ul>
                  </div>

                  <Separator />

                  <div>
                    <div className="bg-gradient-subtle rounded-lg p-4 text-center">
                      <div className="text-4xl font-bold text-primary mb-2">
                        {calculatedPercentage}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        of your waking week aligned with priorities
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        {totalPriorityHours} ÷ {WAKING_HOURS_PER_WEEK} waking hours/week
                      </div>
                    </div>
                  </div>

                  <Alert variant={strategicGap.variant}>
                    <div className="text-2xl mb-2">{strategicGap.emoji}</div>
                    <AlertTitle>{strategicGap.title}</AlertTitle>
                    <AlertDescription className="mt-2">
                      {strategicGap.message}
                    </AlertDescription>
                  </Alert>

                  <Separator />

                  <div className="bg-gradient-warm/10 rounded-lg p-6 text-center space-y-4">
                    <p className="text-muted-foreground italic">
                      "The question is not whether you will die, but how you will live."
                    </p>
                    <Button onClick={() => window.location.href = '/carpe-diem'} size="lg" className="mt-4">
                      Explore Carpe Diem Resources
                    </Button>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button onClick={handleReset} variant="outline">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Start Over
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

export default SimplePriorityCheckIn;
