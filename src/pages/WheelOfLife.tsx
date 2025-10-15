import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  Dumbbell, Brain, Heart, Users, DollarSign, Briefcase, 
  BookOpen, Palette, MessageCircle, Sparkles, Leaf, Globe 
} from "lucide-react";
import PriorityBlock from "@/components/LifeCompass/PriorityBlock";
import CalendarGrid from "@/components/LifeCompass/CalendarGrid";
import IdealWeekProfiles from "@/components/LifeCompass/IdealWeekProfiles";
import IdealWeekWorksheet from "@/components/LifeCompass/IdealWeekWorksheet";
import { useCarpeDiemData } from "@/hooks/useCarpeDiemData";

interface LifeArea {
  id: string;
  name: string;
  icon: any;
  rating: number;
  color: string;
}

interface PlacedBlock {
  id: string;
  area: LifeArea;
  day: string;
  hour: number;
}

type Step = 'assessment' | 'priorities' | 'designer' | 'results';

const WheelOfLife = () => {
  const [currentStep, setCurrentStep] = useState<Step>('assessment');
  const [lifeAreas, setLifeAreas] = useState<LifeArea[]>([
    { id: 'physical', name: 'Physical Health', icon: Dumbbell, rating: 5, color: 'bg-red-500' },
    { id: 'mental', name: 'Mental Health', icon: Brain, rating: 5, color: 'bg-purple-500' },
    { id: 'emotional', name: 'Emotional Well-being', icon: Heart, rating: 5, color: 'bg-pink-500' },
    { id: 'relationships', name: 'Relationships', icon: Users, rating: 5, color: 'bg-blue-500' },
    { id: 'financial', name: 'Financial Security', icon: DollarSign, rating: 5, color: 'bg-green-500' },
    { id: 'career', name: 'Career & Purpose', icon: Briefcase, rating: 5, color: 'bg-indigo-500' },
    { id: 'learning', name: 'Learning & Growth', icon: BookOpen, rating: 5, color: 'bg-yellow-500' },
    { id: 'creativity', name: 'Creativity & Fun', icon: Palette, rating: 5, color: 'bg-orange-500' },
    { id: 'social', name: 'Social Life', icon: MessageCircle, rating: 5, color: 'bg-cyan-500' },
    { id: 'spirituality', name: 'Spirituality', icon: Sparkles, rating: 5, color: 'bg-violet-500' },
    { id: 'environment', name: 'Environment', icon: Leaf, rating: 5, color: 'bg-emerald-500' },
    { id: 'contribution', name: 'Contribution', icon: Globe, rating: 5, color: 'bg-teal-500' },
  ]);

  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [placedBlocks, setPlacedBlocks] = useState<PlacedBlock[]>([]);
  const [nextBlockId, setNextBlockId] = useState(0);

  const { categories } = useCarpeDiemData();

  const updateRating = (id: string, rating: number) => {
    setLifeAreas(areas => 
      areas.map(area => area.id === id ? { ...area, rating } : area)
    );
  };

  const handleBlockPlaced = (areaId: string, day: string, hour: number) => {
    const area = lifeAreas.find(a => a.id === areaId);
    if (!area) return;
    
    const newBlock: PlacedBlock = {
      id: `block-${nextBlockId}`,
      area,
      day,
      hour
    };
    setPlacedBlocks([...placedBlocks, newBlock]);
    setNextBlockId(nextBlockId + 1);
  };

  const handleBlockRemoved = (blockId: string) => {
    setPlacedBlocks(placedBlocks.filter(block => block.id !== blockId));
  };

  const handleProfileSelected = (blocks: Array<{ areaId: string; day: string; hour: number }>) => {
    const newBlocks = blocks.map((block, index) => {
      const area = lifeAreas.find(a => a.id === block.areaId);
      if (!area) return null;
      return {
        id: `block-${nextBlockId + index}`,
        area,
        day: block.day,
        hour: block.hour
      };
    }).filter((block): block is PlacedBlock => block !== null);
    
    setPlacedBlocks(newBlocks);
    setNextBlockId(nextBlockId + blocks.length);
  };

  const getPrioritySelectionStep = () => {
    const lowestRated = [...lifeAreas]
      .sort((a, b) => a.rating - b.rating)
      .slice(0, 5);

    return (
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-foreground">Select Your Priority Areas</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Based on your ratings, these areas might need the most attention. 
            Select 3 areas you want to focus on improving in your ideal week.
          </p>
        </div>

        <Card className="border-border/50 shadow-card">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lowestRated.map(area => {
                const IconComponent = area.icon;
                const isSelected = selectedPriorities.includes(area.id);
                
                return (
                  <button
                    key={area.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedPriorities(selectedPriorities.filter(id => id !== area.id));
                      } else if (selectedPriorities.length < 3) {
                        setSelectedPriorities([...selectedPriorities, area.id]);
                      }
                    }}
                    disabled={!isSelected && selectedPriorities.length >= 3}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      isSelected 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50 bg-background'
                    } ${!isSelected && selectedPriorities.length >= 3 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${area.color} flex items-center justify-center text-white`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{area.name}</h3>
                        <p className="text-sm text-muted-foreground">Rating: {area.rating}/10</p>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white">
                          ✓
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Selected: {selectedPriorities.length}/3 priorities
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setCurrentStep('assessment')}>
                  Back
                </Button>
                <Button 
                  onClick={() => setCurrentStep('designer')}
                  disabled={selectedPriorities.length !== 3}
                >
                  Design My Week
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const getWheelAnalysis = () => {
    const averageRating = lifeAreas.reduce((sum, area) => sum + area.rating, 0) / lifeAreas.length;
    const variance = lifeAreas.reduce((sum, area) => sum + Math.pow(area.rating - averageRating, 2), 0) / lifeAreas.length;
    
    let analysis = "";
    if (averageRating >= 8) {
      analysis = "Your life appears well-balanced with high satisfaction across most areas. Focus on maintaining this balance.";
    } else if (averageRating >= 6) {
      analysis = "You're doing well overall, but there's room for growth in several areas. Identify where small improvements could make a big difference.";
    } else if (averageRating >= 4) {
      analysis = "Several life areas need attention. Prioritizing 2-3 key areas for improvement could significantly enhance your overall well-being.";
    } else {
      analysis = "Multiple areas require immediate attention. Consider starting with the most impactful changes and seeking support where needed.";
    }

    if (variance > 6) {
      analysis += " There's significant imbalance between your life areas—bringing up the lowest-rated areas could create more harmony.";
    }

    return analysis;
  };

  const WheelVisualization = () => {
    const centerX = 200;
    const centerY = 200;
    const maxRadius = 180;
    const numAreas = lifeAreas.length;
    const angleStep = (2 * Math.PI) / numAreas;

    const points = lifeAreas.map((area, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const radius = (area.rating / 10) * maxRadius;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      return { x, y, area };
    });

    const pathData = points.map((point, index) => 
      `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ') + ' Z';

    return (
      <div className="relative">
        <svg viewBox="0 0 400 400" className="w-full max-w-md mx-auto">
          {[2, 4, 6, 8, 10].map(level => {
            const r = (level / 10) * maxRadius;
            return (
              <circle
                key={level}
                cx={centerX}
                cy={centerY}
                r={r}
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="text-border"
                opacity="0.3"
              />
            );
          })}

          {lifeAreas.map((area, index) => {
            const angle = index * angleStep - Math.PI / 2;
            const x2 = centerX + maxRadius * Math.cos(angle);
            const y2 = centerY + maxRadius * Math.sin(angle);
            return (
              <line
                key={area.id}
                x1={centerX}
                y1={centerY}
                x2={x2}
                y2={y2}
                stroke="currentColor"
                strokeWidth="1"
                className="text-border"
                opacity="0.3"
              />
            );
          })}

          <path
            d={pathData}
            fill="hsl(var(--primary))"
            fillOpacity="0.3"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
          />

          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="6"
              fill="hsl(var(--primary))"
              stroke="white"
              strokeWidth="2"
            />
          ))}

          {lifeAreas.map((area, index) => {
            const angle = index * angleStep - Math.PI / 2;
            const labelRadius = maxRadius + 30;
            const x = centerX + labelRadius * Math.cos(angle);
            const y = centerY + labelRadius * Math.sin(angle);
            
            return (
              <text
                key={area.id}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs fill-current text-foreground font-medium"
              >
                {area.name}
              </text>
            );
          })}
        </svg>
      </div>
    );
  };

  const IdealWeekDesigner = () => {
    const priorityAreas = lifeAreas.filter(area => selectedPriorities.includes(area.id));
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-foreground">Design Your Ideal Week</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Drag and drop priority blocks onto your weekly calendar to visualize how you want to spend your time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Quick Start</CardTitle>
              </CardHeader>
              <CardContent>
                <IdealWeekProfiles onProfileSelected={handleProfileSelected} lifeAreas={lifeAreas} />
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Your Priority Areas</CardTitle>
                <CardDescription>Drag these onto your calendar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {priorityAreas.map(area => (
                  <PriorityBlock key={area.id} area={area} />
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Your Week</CardTitle>
                <CardDescription>
                  {placedBlocks.length === 0 
                    ? "Start by dragging priority blocks onto the calendar"
                    : `${placedBlocks.length} block${placedBlocks.length !== 1 ? 's' : ''} placed`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CalendarGrid
                  placedBlocks={placedBlocks}
                  onBlockPlaced={handleBlockPlaced}
                  onBlockRemoved={handleBlockRemoved}
                  selectedPriorities={selectedPriorities}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setCurrentStep('priorities')}>
            Back to Priorities
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setPlacedBlocks([])}>
              Clear Calendar
            </Button>
            <Button onClick={() => setCurrentStep('results')}>
              See My Results
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const getGrowthAreas = () => {
    return [...lifeAreas]
      .sort((a, b) => a.rating - b.rating)
      .slice(0, 3);
  };

  const getIdealWeekInsights = () => {
    if (placedBlocks.length === 0) {
      return "You haven't designed your ideal week yet. This is a great opportunity to be intentional about your time.";
    }

    const blocksByArea = placedBlocks.reduce((acc, block) => {
      const areaName = block.area.name;
      acc[areaName] = (acc[areaName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostAllocated = Object.entries(blocksByArea)
      .sort(([, a], [, b]) => b - a)[0];

    return `You've allocated ${placedBlocks.length} time blocks across your week. 
            ${mostAllocated ? `Your top focus is ${mostAllocated[0]} with ${mostAllocated[1]} blocks.` : ''} 
            This intentional planning helps ensure your time aligns with your priorities.`;
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-7xl flex-1">
        <div className="mb-8 space-y-4">
          <h1 className="text-4xl font-bold text-center bg-gradient-warm bg-clip-text text-transparent">
            Wheel of Life Assessment
          </h1>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto">
            Assess your life balance across 12 key areas and design your ideal week
          </p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-center gap-2">
            {(['assessment', 'priorities', 'designer', 'results'] as Step[]).map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep === step 
                    ? 'bg-primary text-white' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {index + 1}
                </div>
                {index < 3 && (
                  <div className={`w-12 h-0.5 mx-2 ${
                    ['priorities', 'designer', 'results'].indexOf(currentStep) > index - 1
                      ? 'bg-primary' 
                      : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {currentStep === 'assessment' && (
          <div className="space-y-8">
            <Card className="border-border/50 shadow-card">
              <CardHeader>
                <CardTitle className="text-2xl">Rate Your Life Areas</CardTitle>
                <CardDescription className="text-base">
                  Honestly assess each area of your life from 1 (needs immediate attention) to 10 (thriving)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {lifeAreas.map(area => {
                  const IconComponent = area.icon;
                  return (
                    <div key={area.id} className="space-y-3 p-4 rounded-lg bg-gradient-subtle">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg ${area.color} flex items-center justify-center text-white`}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <span className="font-semibold text-foreground">{area.name}</span>
                        </div>
                        <span className="text-2xl font-bold text-primary">{area.rating}</span>
                      </div>
                      <Slider
                        value={[area.rating]}
                        onValueChange={(value) => updateRating(area.id, value[0])}
                        min={1}
                        max={10}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Your Wheel of Life</CardTitle>
                  <CardDescription>Visual representation of your life balance</CardDescription>
                </CardHeader>
                <CardContent>
                  <WheelVisualization />
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Analysis</CardTitle>
                  <CardDescription>Insights from your ratings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">{getWheelAnalysis()}</p>
                  <Button onClick={() => setCurrentStep('priorities')} className="w-full">
                    Continue to Priority Selection
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {currentStep === 'priorities' && getPrioritySelectionStep()}

        {currentStep === 'designer' && <IdealWeekDesigner />}

        {currentStep === 'results' && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-foreground">Your Life Compass Results</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Here's your complete assessment and designed week
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Your Wheel of Life</CardTitle>
                </CardHeader>
                <CardContent>
                  <WheelVisualization />
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Priority Growth Areas</CardTitle>
                  <CardDescription>Areas that need your attention most</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {getGrowthAreas().map(area => {
                    const IconComponent = area.icon;
                    return (
                      <div key={area.id} className="flex items-center gap-3 p-3 rounded-lg bg-gradient-subtle">
                        <div className={`w-10 h-10 rounded-lg ${area.color} flex items-center justify-center text-white`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{area.name}</h3>
                          <p className="text-sm text-muted-foreground">Current rating: {area.rating}/10</p>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Your Ideal Week Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{getIdealWeekInsights()}</p>
              </CardContent>
            </Card>

            <IdealWeekWorksheet 
              placedBlocks={placedBlocks}
            />

            {categories.length > 0 && (
              <Card className="border-border/50 bg-gradient-to-br from-background to-primary/5">
                <CardHeader>
                  <CardTitle>Recommended Resources</CardTitle>
                  <CardDescription>
                    Based on your priority areas, explore these curated resources
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {categories.slice(0, 3).map(category => {
                    const IconComponent = category.icon;
                    return (
                      <div key={category.id} className="p-4 rounded-lg bg-background border border-border/50">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-warm flex items-center justify-center text-white">
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{category.title}</h3>
                            <p className="text-sm text-muted-foreground">{category.description}</p>
                          </div>
                        </div>
                        {category.resources.length > 0 && (
                          <div className="space-y-2">
                            {category.resources.slice(0, 2).map((resource, idx) => (
                              <a
                                key={idx}
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-sm text-primary hover:underline"
                              >
                                → {resource.title}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <Button asChild variant="outline" className="w-full">
                    <a href="/carpe-diem">View All Resources</a>
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep('assessment')}>
                Start Over
              </Button>
              <Button onClick={() => window.print()}>
                Print My Results
              </Button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default WheelOfLife;
