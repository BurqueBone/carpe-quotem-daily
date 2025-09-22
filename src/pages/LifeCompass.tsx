import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  Briefcase, 
  Heart, 
  DollarSign, 
  Users, 
  Brain, 
  PartyPopper, 
  Palette, 
  Sprout,
  ChevronRight,
  RotateCcw
} from "lucide-react";

interface LifeArea {
  id: string;
  name: string;
  icon: React.ReactNode;
  rating: number;
  color: string;
}

const LifeCompass = () => {
  const [currentStep, setCurrentStep] = useState<'assessment' | 'designer' | 'results'>('assessment');
  const [lifeAreas, setLifeAreas] = useState<LifeArea[]>([
    { id: 'career', name: 'Work & Career', icon: <Briefcase className="w-5 h-5" />, rating: 5, color: 'hsl(var(--chart-1))' },
    { id: 'health', name: 'Health & Wellness', icon: <Heart className="w-5 h-5" />, rating: 5, color: 'hsl(var(--chart-2))' },
    { id: 'finances', name: 'Finances', icon: <DollarSign className="w-5 h-5" />, rating: 5, color: 'hsl(var(--chart-3))' },
    { id: 'relationships', name: 'Relationships', icon: <Users className="w-5 h-5" />, rating: 5, color: 'hsl(var(--chart-4))' },
    { id: 'growth', name: 'Personal Growth', icon: <Brain className="w-5 h-5" />, rating: 5, color: 'hsl(var(--chart-5))' },
    { id: 'social', name: 'Social Life', icon: <PartyPopper className="w-5 h-5" />, rating: 5, color: 'hsl(var(--destructive))' },
    { id: 'hobbies', name: 'Hobbies & Fun', icon: <Palette className="w-5 h-5" />, rating: 5, color: 'hsl(var(--warning))' },
    { id: 'contribution', name: 'Contribution', icon: <Sprout className="w-5 h-5" />, rating: 5, color: 'hsl(var(--success))' }
  ]);

  const updateRating = (id: string, rating: number) => {
    setLifeAreas(prev => prev.map(area => 
      area.id === id ? { ...area, rating } : area
    ));
  };

  const getWheelAnalysis = () => {
    const average = lifeAreas.reduce((sum, area) => sum + area.rating, 0) / lifeAreas.length;
    const variance = Math.sqrt(lifeAreas.reduce((sum, area) => sum + Math.pow(area.rating - average, 2), 0) / lifeAreas.length);
    
    if (variance < 1.5 && average >= 7) {
      return "Your Life Wheel is beautifully balanced! You're thriving across most areas of your life.";
    } else if (variance > 3) {
      return "Your Life Wheel is currently quite wobbly! Notice the areas where you're feeling a pull. This is where your attention may be most needed to create a smoother ride.";
    } else {
      return "Your Life Wheel shows some areas for growth. The gaps you see represent opportunities to create more balance and fulfillment.";
    }
  };

  const WheelVisualization = () => {
    const centerX = 150;
    const centerY = 150;
    const maxRadius = 120;
    
    const points = lifeAreas.map((area, index) => {
      const angle = (index * 2 * Math.PI) / lifeAreas.length - Math.PI / 2;
      const radius = (area.rating / 10) * maxRadius;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      return { x, y, area };
    });

    const pathD = points.reduce((path, point, index) => {
      return path + (index === 0 ? `M ${point.x} ${point.y}` : ` L ${point.x} ${point.y}`);
    }, '') + ' Z';

    return (
      <div className="flex justify-center mb-6">
        <svg width="300" height="300" className="drop-shadow-md">
          {/* Grid lines */}
          {[2, 4, 6, 8, 10].map(level => (
            <circle
              key={level}
              cx={centerX}
              cy={centerY}
              r={(level / 10) * maxRadius}
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="1"
              opacity="0.3"
            />
          ))}
          
          {/* Axis lines */}
          {lifeAreas.map((_, index) => {
            const angle = (index * 2 * Math.PI) / lifeAreas.length - Math.PI / 2;
            const endX = centerX + maxRadius * Math.cos(angle);
            const endY = centerY + maxRadius * Math.sin(angle);
            return (
              <line
                key={index}
                x1={centerX}
                y1={centerY}
                x2={endX}
                y2={endY}
                stroke="hsl(var(--border))"
                strokeWidth="1"
                opacity="0.3"
              />
            );
          })}
          
          {/* Life areas polygon */}
          <path
            d={pathD}
            fill="hsl(var(--primary))"
            fillOpacity="0.3"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
          />
          
          {/* Area labels */}
          {points.map((point, index) => {
            const angle = (index * 2 * Math.PI) / lifeAreas.length - Math.PI / 2;
            const labelRadius = maxRadius + 20;
            const labelX = centerX + labelRadius * Math.cos(angle);
            const labelY = centerY + labelRadius * Math.sin(angle);
            
            return (
              <g key={point.area.id}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill={point.area.color}
                />
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs font-medium fill-foreground"
                >
                  {point.area.name.split(' ')[0]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  const IdealWeekDesigner = () => {
    const [selectedBlocks, setSelectedBlocks] = useState<any[]>([]);
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const timeSlots = Array.from({ length: 16 }, (_, i) => i + 6); // 6 AM to 10 PM

    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Design Your Ideal Week</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Now, let's design your ideal week. If you had complete control of your time, what would it look like?
            Drag priority blocks onto your calendar to create your perfect week.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Priority Blocks */}
          <div className="space-y-4">
            <h3 className="font-semibold">Priority Blocks</h3>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
              {lifeAreas.map(area => (
                <Card key={area.id} className="p-3 cursor-move hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2">
                    <div style={{ color: area.color }}>
                      {area.icon}
                    </div>
                    <span className="text-sm font-medium">{area.name}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="lg:col-span-3">
            <div className="border rounded-lg p-4 bg-card">
              <div className="grid grid-cols-8 gap-1 text-xs">
                <div className="p-2"></div>
                {days.map(day => (
                  <div key={day} className="p-2 text-center font-medium">
                    {day.slice(0, 3)}
                  </div>
                ))}
                
                {timeSlots.map(hour => (
                  <>
                    <div key={hour} className="p-2 text-right text-muted-foreground">
                      {hour % 12 === 0 ? 12 : hour % 12}{hour >= 12 ? 'PM' : 'AM'}
                    </div>
                    {days.map(day => (
                      <div
                        key={`${day}-${hour}`}
                        className="p-1 border border-border/30 min-h-[40px] hover:bg-accent/50 transition-colors"
                      >
                        {/* Droppable area for blocks */}
                      </div>
                    ))}
                  </>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Button onClick={() => setCurrentStep('results')} size="lg">
            Generate My Analysis
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl flex-1">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-warm bg-clip-text text-transparent">
              Life Compass
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              A two-part interactive tool to assess your current life balance and design a future 
              that aligns with your true priorities. Discover insights that empower meaningful change.
            </p>
          </div>

          {/* Progress indicator */}
          <div className="flex justify-center">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 ${currentStep === 'assessment' ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep === 'assessment' ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'}`}>
                  1
                </div>
                <span className="font-medium">Life Wheel</span>
              </div>
              <div className="w-8 h-px bg-border"></div>
              <div className={`flex items-center space-x-2 ${currentStep === 'designer' ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep === 'designer' ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'}`}>
                  2
                </div>
                <span className="font-medium">Ideal Week</span>
              </div>
              <div className="w-8 h-px bg-border"></div>
              <div className={`flex items-center space-x-2 ${currentStep === 'results' ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep === 'results' ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'}`}>
                  3
                </div>
                <span className="font-medium">Results</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          {currentStep === 'assessment' && (
            <div className="space-y-8">
              <Card className="max-w-4xl mx-auto">
                <CardHeader className="text-center">
                  <CardTitle>The Wheel of Life Assessment</CardTitle>
                  <CardDescription>
                    Rate your current satisfaction with each area of your life on a scale of 1 to 10.
                    Watch as your wheel takes shape!
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <WheelVisualization />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {lifeAreas.map(area => (
                      <div key={area.id} className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div style={{ color: area.color }}>
                            {area.icon}
                          </div>
                          <span className="font-medium">{area.name}</span>
                          <span className="ml-auto text-2xl font-bold text-primary">
                            {area.rating}
                          </span>
                        </div>
                        <Slider
                          value={[area.rating]}
                          onValueChange={(value) => updateRating(area.id, value[0])}
                          max={10}
                          min={1}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="bg-gradient-subtle rounded-xl p-6 text-center space-y-4">
                    <h3 className="text-lg font-semibold">Your Wheel Analysis</h3>
                    <p className="text-muted-foreground">{getWheelAnalysis()}</p>
                    <Button onClick={() => setCurrentStep('designer')} size="lg">
                      Design Your Ideal Week
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {currentStep === 'designer' && (
            <Card className="max-w-7xl mx-auto">
              <CardContent className="p-6">
                <IdealWeekDesigner />
              </CardContent>
            </Card>
          )}

          {currentStep === 'results' && (
            <div className="space-y-8">
              <Card className="max-w-4xl mx-auto">
                <CardHeader className="text-center">
                  <CardTitle>Your Life Compass Results</CardTitle>
                  <CardDescription>
                    Here's your personalized analysis and next steps
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-4">Your Current Wheel</h3>
                      <WheelVisualization />
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-semibold">Key Insights</h3>
                      <div className="space-y-3">
                        {lifeAreas
                          .sort((a, b) => a.rating - b.rating)
                          .slice(0, 3)
                          .map(area => (
                            <div key={area.id} className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
                              <div style={{ color: area.color }}>
                                {area.icon}
                              </div>
                              <div>
                                <div className="font-medium">{area.name}</div>
                                <div className="text-sm text-muted-foreground">Current rating: {area.rating}/10</div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="bg-gradient-subtle rounded-xl p-6 text-center space-y-4">
                    <h3 className="text-lg font-semibold">What's one small step you can take this week?</h3>
                    <p className="text-muted-foreground">
                      Look at the areas where you rated yourself lowest. What's one small action you could take 
                      this week to move the needle? Remember, small steps compound into extraordinary transformations.
                    </p>
                    <div className="flex justify-center gap-4">
                      <Button onClick={() => setCurrentStep('assessment')} variant="outline">
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Retake Assessment
                      </Button>
                      <Button onClick={() => window.print()}>
                        Save Results
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default LifeCompass;