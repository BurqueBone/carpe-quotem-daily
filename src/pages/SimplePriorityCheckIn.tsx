import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
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
  const [percentage, setPercentage] = useState<number>(0);
  const [underachieveArea, setUnderachieveArea] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const hasAtLeastOnePriority = priorities.priority1 || priorities.priority2 || priorities.priority3;

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

  const strategicGap = getStrategicGapMessage(percentage);
  const needsUnderachieveField = percentage < 80;

  const handleSubmit = () => {
    if (!hasAtLeastOnePriority) return;
    if (needsUnderachieveField && !underachieveArea.trim()) return;
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setPriorities({ priority1: '', priority2: '', priority3: '' });
    setPercentage(0);
    setUnderachieveArea('');
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
                  <div className="space-y-2">
                    <Label htmlFor="priority1">Priority 1</Label>
                    <Textarea
                      id="priority1"
                      placeholder="e.g., Deepening connections with my children"
                      value={priorities.priority1}
                      onChange={(e) => setPriorities(prev => ({ ...prev, priority1: e.target.value }))}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority2">Priority 2</Label>
                    <Textarea
                      id="priority2"
                      placeholder="e.g., Building physical vitality through movement"
                      value={priorities.priority2}
                      onChange={(e) => setPriorities(prev => ({ ...prev, priority2: e.target.value }))}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority3">Priority 3</Label>
                    <Textarea
                      id="priority3"
                      placeholder="e.g., Creating meaningful work that serves others"
                      value={priorities.priority3}
                      onChange={(e) => setPriorities(prev => ({ ...prev, priority3: e.target.value }))}
                      rows={2}
                    />
                  </div>
                </div>

                {hasAtLeastOnePriority && (
                  <>
                    <Separator />

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="percentage">
                          What percentage of your time this week actually goes to these priorities?
                        </Label>
                        <div className="flex items-center gap-4">
                          <Slider
                            id="percentage"
                            value={[percentage]}
                            onValueChange={(value) => setPercentage(value[0])}
                            max={100}
                            step={5}
                            className="flex-1"
                          />
                          <div className="text-2xl font-bold text-primary min-w-[4rem] text-right">
                            {percentage}%
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

                      {needsUnderachieveField && (
                        <div className="space-y-2">
                          <Label htmlFor="underachieve">
                            Where can you strategically underachieve this week?
                          </Label>
                          <Textarea
                            id="underachieve"
                            placeholder="e.g., Letting household organization be 'good enough' instead of perfect, so I can spend evenings with family"
                            value={underachieveArea}
                            onChange={(e) => setUnderachieveArea(e.target.value)}
                            rows={3}
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex justify-center pt-4">
                      <Button
                        onClick={handleSubmit}
                        size="lg"
                        disabled={needsUnderachieveField && !underachieveArea.trim()}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        View My Summary
                      </Button>
                    </div>
                  </>
                )}
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
                    <ul className="space-y-2">
                      {priorities.priority1 && (
                        <li className="flex items-start gap-2">
                          <span className="text-primary font-bold">1.</span>
                          <span>{priorities.priority1}</span>
                        </li>
                      )}
                      {priorities.priority2 && (
                        <li className="flex items-start gap-2">
                          <span className="text-primary font-bold">2.</span>
                          <span>{priorities.priority2}</span>
                        </li>
                      )}
                      {priorities.priority3 && (
                        <li className="flex items-start gap-2">
                          <span className="text-primary font-bold">3.</span>
                          <span>{priorities.priority3}</span>
                        </li>
                      )}
                    </ul>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold text-lg mb-2">Time Alignment:</h3>
                    <div className="bg-gradient-subtle rounded-lg p-4">
                      <div className="text-3xl font-bold text-primary mb-1">{percentage}%</div>
                      <div className="text-sm text-muted-foreground">
                        of your time this week goes to what truly matters
                      </div>
                    </div>
                  </div>

                  {underachieveArea && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Strategic Underachievement:</h3>
                        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                          <p className="text-foreground">{underachieveArea}</p>
                        </div>
                      </div>
                    </>
                  )}

                  <Separator />

                  <div className="bg-gradient-warm/10 rounded-lg p-6 text-center">
                    <p className="text-muted-foreground italic">
                      "The question is not whether you will die, but how you will live."
                    </p>
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
