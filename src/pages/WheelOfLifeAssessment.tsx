import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PriorityBlock from "@/components/LifeCompass/PriorityBlock";
import CalendarGrid from "@/components/LifeCompass/CalendarGrid";
import IdealWeekProfiles from "@/components/LifeCompass/IdealWeekProfiles";
import IdealWeekWorksheet from "@/components/LifeCompass/IdealWeekWorksheet";
import { useCarpeDiemData } from "@/hooks/useCarpeDiemData";
import { 
  Briefcase, 
  Heart, 
  DollarSign, 
  Users, 
  Brain, 
  Palette, 
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Sparkles,
  Dumbbell,
  BookOpen,
  MessageCircle,
  Leaf,
  Globe,
  CheckCircle2,
  ExternalLink
} from "lucide-react";

interface LifeArea {
  id: string;
  name: string;
  icon: React.ReactNode;
  rating: number;
  color: string;
}

interface PlacedBlock {
  id: string;
  area: LifeArea;
  day: string;
  hour: number;
}

const WheelOfLifeAssessment = () => {
  const [currentStep, setCurrentStep] = useState<'assessment' | 'priorities' | 'designer' | 'results'>('assessment');
  const [placedBlocks, setPlacedBlocks] = useState<PlacedBlock[]>([]);
  const [nextBlockId, setNextBlockId] = useState(1);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const { categories, loading: resourcesLoading } = useCarpeDiemData();
  
  // Map life compass areas to category titles in the resources database
  const categoryMapping: { [key: string]: string } = {
    'physical': 'Physical',
    'mental': 'Mental', 
    'emotional': 'Emotional',
    'family': 'Family',
    'financial': 'Financial',
    'career': 'Career',
    'learning': 'Learning',
    'creative': 'Creative',
    'social': 'Social',
    'spiritual': 'Spiritual',
    'environment': 'Environment',
    'community': 'Community'
  };

  // Get relevant resources for selected priority areas
  const getRelevantResources = () => {
    if (resourcesLoading || !categories.length || !selectedPriorities.length) {
      return [];
    }

    const relevantResources: any[] = [];
    
    selectedPriorities.forEach(priorityId => {
      const categoryTitle = categoryMapping[priorityId];
      if (categoryTitle) {
        const category = categories.find(cat => cat.title === categoryTitle);
        if (category && category.resources.length > 0) {
          // Add first resource from this category
          relevantResources.push({
            ...category.resources[0],
            categoryTitle: category.title,
            areaId: priorityId
          });
        }
      }
    });

    // If we have less than 3 resources, fill with additional resources from priority categories
    if (relevantResources.length < 3) {
      selectedPriorities.forEach(priorityId => {
        const categoryTitle = categoryMapping[priorityId];
        if (categoryTitle) {
          const category = categories.find(cat => cat.title === categoryTitle);
          if (category && category.resources.length > 1) {
            // Add second resource from this category if not already included
            const secondResource = category.resources[1];
            if (!relevantResources.find(r => r.id === secondResource.id)) {
              relevantResources.push({
                ...secondResource,
                categoryTitle: category.title,
                areaId: priorityId
              });
            }
          }
        }
      });
    }

    // Return first 3 resources
    return relevantResources.slice(0, 3);
  };
  
  const [lifeAreas, setLifeAreas] = useState<LifeArea[]>([
    { id: 'physical', name: 'Physical', icon: <Dumbbell className="w-5 h-5" />, rating: 5, color: 'life-area-physical' },
    { id: 'mental', name: 'Mental', icon: <Brain className="w-5 h-5" />, rating: 5, color: 'life-area-mental' },
    { id: 'emotional', name: 'Emotional', icon: <Heart className="w-5 h-5" />, rating: 5, color: 'life-area-emotional' },
    { id: 'family', name: 'Family', icon: <Users className="w-5 h-5" />, rating: 5, color: 'life-area-family' },
    { id: 'financial', name: 'Financial', icon: <DollarSign className="w-5 h-5" />, rating: 5, color: 'life-area-financial' },
    { id: 'career', name: 'Career', icon: <Briefcase className="w-5 h-5" />, rating: 5, color: 'life-area-career' },
    { id: 'learning', name: 'Learning', icon: <BookOpen className="w-5 h-5" />, rating: 5, color: 'life-area-learning' },
    { id: 'creative', name: 'Creative', icon: <Palette className="w-5 h-5" />, rating: 5, color: 'life-area-creative' },
    { id: 'social', name: 'Social', icon: <MessageCircle className="w-5 h-5" />, rating: 5, color: 'life-area-social' },
    { id: 'spiritual', name: 'Spiritual', icon: <Sparkles className="w-5 h-5" />, rating: 5, color: 'life-area-spiritual' },
    { id: 'environment', name: 'Environment', icon: <Leaf className="w-5 h-5" />, rating: 5, color: 'life-area-environment' },
    { id: 'community', name: 'Community', icon: <Globe className="w-5 h-5" />, rating: 5, color: 'life-area-community' }
  ]);

  const updateRating = (id: string, rating: number) => {
    setLifeAreas(prev => prev.map(area => 
      area.id === id ? { ...area, rating } : area
    ));
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
    setPlacedBlocks(prev => [...prev, newBlock]);
    setNextBlockId(prev => prev + 1);
  };

  const handleBlockRemoved = (blockId: string) => {
    setPlacedBlocks(prev => prev.filter(block => block.id !== blockId));
  };

  const handleProfileSelected = (blocks: Array<{ areaId: string; day: string; hour: number }>) => {
    const newBlocks: PlacedBlock[] = blocks.map((block, index) => {
      const area = lifeAreas.find(a => a.id === block.areaId);
      if (!area) return null;
      
      return {
        id: `profile-block-${nextBlockId + index}`,
        area,
        day: block.day,
        hour: block.hour
      };
    }).filter(Boolean) as PlacedBlock[];
    
    setPlacedBlocks(newBlocks);
    setNextBlockId(prev => prev + newBlocks.length);
  };

  const clearCalendar = () => {
    setPlacedBlocks([]);
  };

  const getPrioritySelectionStep = () => {
    const lowestRated = lifeAreas
      .sort((a, b) => a.rating - b.rating)
      .slice(0, 4);

    const togglePriority = (areaId: string) => {
      setSelectedPriorities(prev => 
        prev.includes(areaId) 
          ? prev.filter(id => id !== areaId)
          : [...prev, areaId]
      );
    };

    return (
      <div className="space-y-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle>Focus Areas for Growth</CardTitle>
            <CardDescription>
              Based on your ratings, these are the areas where you scored lowest. 
              Select which ones you'd like to prioritize improving in your ideal week.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {lowestRated.map(area => (
                <div 
                  key={area.id}
                  onClick={() => togglePriority(area.id)}
                  className={`p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedPriorities.includes(area.id)
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div style={{ color: `hsl(var(--${area.color}))` }} className="flex-shrink-0">
                      {area.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm sm:text-base">{area.name}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        Current rating: {area.rating}/10
                      </div>
                    </div>
                    {selectedPriorities.includes(area.id) && (
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            <div className="bg-gradient-subtle rounded-xl p-6 text-center space-y-4">
              <h3 className="text-lg font-semibold">Ready to Design Your Week?</h3>
              <p className="text-muted-foreground">
                {selectedPriorities.length > 0 
                  ? `You've selected ${selectedPriorities.length} area${selectedPriorities.length > 1 ? 's' : ''} to focus on. Let's design a week that supports your growth!`
                  : "You can proceed without selecting any priorities, or choose areas you'd like to focus on improving."
                }
              </p>
              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={() => setCurrentStep('assessment')} size="lg">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back to Assessment
                </Button>
                <Button onClick={() => setCurrentStep('designer')} size="lg">
                  Design Your Ideal Week
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
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
    const centerX = 180;
    const centerY = 180;
    const maxRadius = 100;
    
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
      <div className="flex justify-center mb-4">
        <svg width="100%" height="auto" viewBox="0 0 360 360" className="drop-shadow-md max-w-[320px] w-full">
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
            const labelRadius = maxRadius + 55;
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
                  className="text-[10px] sm:text-xs font-medium fill-foreground"
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
    return (
      <div className="space-y-4">
        {/* Compact Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-lg font-semibold">Design Your Ideal Week</h2>
          <p className="text-sm text-muted-foreground">Drag blocks onto your calendar</p>
        </div>

        {/* Collapsible Ideal Week Profiles */}
        <IdealWeekProfiles 
          lifeAreas={lifeAreas}
          onProfileSelected={handleProfileSelected}
        />

        {/* Horizontal Priority Blocks */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm">Priority Blocks</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearCalendar}
              className="text-xs h-7"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Clear
            </Button>
          </div>
          <ScrollArea className="w-full">
            <div className="flex gap-1.5 pb-2">
              {lifeAreas.map(area => (
                <PriorityBlock 
                  key={area.id} 
                  area={area} 
                  isPriority={selectedPriorities.includes(area.id)}
                  className="flex-shrink-0"
                />
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Calendar Grid */}
        <CalendarGrid
          placedBlocks={placedBlocks}
          onBlockPlaced={handleBlockPlaced}
          onBlockRemoved={handleBlockRemoved}
          selectedPriorities={selectedPriorities}
        />

        {/* Sticky Footer */}
        <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t py-3 -mx-6 px-6 -mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">
              {placedBlocks.length} blocks placed
            </span>
          </div>
          {placedBlocks.length > 0 ? (
            <Button onClick={() => setCurrentStep('results')} size="sm">
              Generate Analysis
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">Drag blocks to continue</span>
          )}
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
          <div className="text-center space-y-4 px-2">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-warm bg-clip-text text-transparent">
              Wheel of Life Assessment
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Assess your current life balance across 12 key areas and design an ideal week 
              that aligns with your true priorities. Discover insights that empower meaningful change.
            </p>
          </div>

          {/* Progress indicator */}
          <div className="flex justify-center overflow-x-auto pb-4">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-min px-4">
              <div className={`flex items-center space-x-1 sm:space-x-2 ${currentStep === 'assessment' ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 text-sm sm:text-base ${currentStep === 'assessment' ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'}`}>
                  1
                </div>
                <span className="font-medium text-xs sm:text-sm whitespace-nowrap hidden xs:inline">Life Wheel</span>
              </div>
              <div className="w-4 sm:w-8 h-px bg-border"></div>
              <div className={`flex items-center space-x-1 sm:space-x-2 ${currentStep === 'priorities' ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 text-sm sm:text-base ${currentStep === 'priorities' ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'}`}>
                  2
                </div>
                <span className="font-medium text-xs sm:text-sm whitespace-nowrap hidden xs:inline">Priorities</span>
              </div>
              <div className="w-4 sm:w-8 h-px bg-border"></div>
              <div className={`flex items-center space-x-1 sm:space-x-2 ${currentStep === 'designer' ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 text-sm sm:text-base ${currentStep === 'designer' ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'}`}>
                  3
                </div>
                <span className="font-medium text-xs sm:text-sm whitespace-nowrap hidden xs:inline">Ideal Week</span>
              </div>
              <div className="w-4 sm:w-8 h-px bg-border"></div>
              <div className={`flex items-center space-x-1 sm:space-x-2 ${currentStep === 'results' ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 text-sm sm:text-base ${currentStep === 'results' ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'}`}>
                  4
                </div>
                <span className="font-medium text-xs sm:text-sm whitespace-nowrap hidden xs:inline">Results</span>
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
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Wheel visualization - smaller on desktop */}
                    <div className="flex justify-center lg:sticky lg:top-4">
                      <div className="w-full max-w-[280px] lg:max-w-[320px]">
                        <WheelVisualization />
                      </div>
                    </div>
                    
                    {/* Sliders in scrollable container */}
                    <div className="space-y-3">
                      <ScrollArea className="h-[320px] lg:h-[380px] pr-4">
                        <div className="space-y-4">
                          {lifeAreas.map(area => (
                            <div key={area.id} className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                <div style={{ color: area.color }} className="flex-shrink-0 w-5 h-5">
                                  {area.icon}
                                </div>
                                <span className="font-medium text-sm">{area.name}</span>
                                <span className="ml-auto text-lg font-bold text-primary">
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
                      </ScrollArea>
                    </div>
                  </div>

                  <Separator />

                  <div className="bg-gradient-subtle rounded-xl p-4 sm:p-6 text-center space-y-3">
                    <h3 className="text-base sm:text-lg font-semibold">Your Wheel Analysis</h3>
                    <p className="text-muted-foreground text-sm">{getWheelAnalysis()}</p>
                    <Button onClick={() => setCurrentStep('priorities')} size="lg">
                      Choose Priority Areas
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {currentStep === 'priorities' && getPrioritySelectionStep()}

          {currentStep === 'designer' && (
            <Card className="max-w-7xl mx-auto">
              <CardContent className="p-6">
                <div className="mb-4">
                  <Button variant="outline" onClick={() => setCurrentStep('priorities')} size="sm">
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back to Priorities
                  </Button>
                </div>
                <IdealWeekDesigner />
              </CardContent>
            </Card>
          )}

          {currentStep === 'results' && (
            <div className="space-y-8">
              <Card className="max-w-6xl mx-auto">
                <CardHeader className="text-center px-4 sm:px-6">
                  <CardTitle className="text-xl sm:text-2xl">Your Life Compass Results</CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Here's your personalized analysis and actionable insights
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 sm:space-y-8 px-4 sm:px-6">
                  <div className="grid grid-cols-1 gap-6 sm:gap-8">
                    <div>
                      <h3 className="font-semibold mb-4 text-sm sm:text-base">Your Current Wheel</h3>
                      <WheelVisualization />
                    </div>
                    
                    <div className="space-y-4 sm:space-y-6">
                      {/* What you're doing well */}
                      <div>
                        <h3 className="font-semibold mb-3 text-green-600 text-sm sm:text-base">🌟 What You're Excelling At</h3>
                        <div className="space-y-2">
                          {lifeAreas
                            .filter(area => area.rating >= 7)
                            .sort((a, b) => b.rating - a.rating)
                            .slice(0, 3)
                            .map(area => (
                              <div key={area.id} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-green-50 border border-green-200">
                                <div style={{ color: `hsl(var(--${area.color}))` }} className="flex-shrink-0">
                                  {area.icon}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-medium text-green-800 text-xs sm:text-sm">{area.name}</div>
                                  <div className="text-xs text-green-600">Rating: {area.rating}/10 - Keep up the great work!</div>
                                </div>
                              </div>
                            ))}
                          {lifeAreas.filter(area => area.rating >= 7).length === 0 && (
                            <p className="text-muted-foreground italic text-xs sm:text-sm">Every area has room for growth - that's the beauty of continuous improvement!</p>
                          )}
                        </div>
                      </div>

                      {/* Areas to work on */}
                      <div>
                        <h3 className="font-semibold mb-3 text-orange-600 text-sm sm:text-base">🎯 Your Priority Growth Areas</h3>
                        <div className="space-y-2">
                          {selectedPriorities.length > 0 ? (
                            selectedPriorities.map(priorityId => {
                              const area = lifeAreas.find(a => a.id === priorityId);
                              if (!area) return null;
                              return (
                                <div key={area.id} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-orange-50 border border-orange-200">
                                  <div style={{ color: `hsl(var(--${area.color}))` }} className="flex-shrink-0">
                                    {area.icon}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-medium text-orange-800 text-xs sm:text-sm">{area.name}</div>
                                    <div className="text-xs text-orange-600">Current: {area.rating}/10 - You chose to focus here</div>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <p className="text-muted-foreground italic text-xs sm:text-sm">You didn't select specific areas to prioritize, which means you're taking a balanced approach to growth.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Ideal Week Analysis */}
                  <div>
                    <h3 className="font-semibold mb-4 text-blue-600 text-sm sm:text-base">📅 Your Ideal Week Insights</h3>
                    <div className="bg-blue-50 rounded-lg p-4 sm:p-6 space-y-3 sm:space-y-4">
                      <p className="text-blue-800 font-medium text-sm sm:text-base">
                        You placed {placedBlocks.length} priority blocks in your ideal week.
                      </p>
                      
                      {selectedPriorities.length > 0 && placedBlocks.length > 0 && (
                        <div className="space-y-2 sm:space-y-3">
                          <p className="text-blue-700 text-xs sm:text-sm">
                            <strong>Growth Focus Analysis:</strong> Let's see how well your ideal week supports your priority areas:
                          </p>
                          {selectedPriorities.map(priorityId => {
                            const area = lifeAreas.find(a => a.id === priorityId);
                            const blocksForThisArea = placedBlocks.filter(block => block.area.id === priorityId).length;
                            if (!area) return null;
                            
                            return (
                              <div key={priorityId} className="flex items-center justify-between p-2 bg-white rounded border text-xs sm:text-sm">
                                <div className="flex items-center gap-2">
                                  <div style={{ color: `hsl(var(--${area.color}))` }} className="flex-shrink-0">
                                    {area.icon}
                                  </div>
                                  <span className="font-medium">{area.name}</span>
                                </div>
                                <div className="text-xs sm:text-sm">
                                  {blocksForThisArea > 0 
                                    ? `${blocksForThisArea} blocks ✅`
                                    : "No blocks ⚠️"
                                  }
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      
                      {placedBlocks.length === 0 && (
                        <p className="text-blue-700 text-xs sm:text-sm">
                          You haven't scheduled any priority blocks yet. Consider going back to design your ideal week with activities that support your growth areas.
                        </p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Printable Ideal Week Worksheet */}
                  <div>
                    <div className="flex items-center justify-between mb-4 px-2">
                      <h3 className="font-semibold text-indigo-600 text-sm sm:text-base">📋 Your Ideal Week Worksheet</h3>
                      <Button 
                        onClick={() => window.print()}
                        variant="outline"
                        size="sm"
                        className="print:hidden text-xs sm:text-sm"
                      >
                        Print
                      </Button>
                    </div>
                    <IdealWeekWorksheet placedBlocks={placedBlocks} />
                  </div>

                  <Separator />
                  {selectedPriorities.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-4 text-purple-600 text-sm sm:text-base px-2">📚 Recommended Resources for Your Growth</h3>
                      
                      {/* Display 3 relevant resources */}
                      {getRelevantResources().length > 0 && (
                        <div className="mb-6 px-2">
                          <h4 className="text-xs sm:text-sm font-medium text-purple-700 mb-3">Featured Resources:</h4>
                          <div className="space-y-3">
                            {getRelevantResources().map((resource) => (
                              <div key={resource.id} className="flex items-center justify-between p-2 sm:p-3 bg-white rounded-lg border border-purple-200 hover:border-purple-300 transition-colors gap-2">
                                <div className="flex-1 min-w-0">
                                  <h5 className="font-medium text-purple-900 truncate text-xs sm:text-sm">{resource.title}</h5>
                                  <p className="text-xs text-purple-700 truncate">{resource.description}</p>
                                  <span className="text-[10px] sm:text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full inline-block mt-1">
                                    {resource.categoryTitle}
                                  </span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(resource.url, '_blank')}
                                  className="text-purple-700 hover:text-purple-900 flex-shrink-0"
                                >
                                  <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 gap-3 sm:gap-4 px-2">
                        {selectedPriorities.slice(0, 4).map(priorityId => {
                          const area = lifeAreas.find(a => a.id === priorityId);
                          if (!area) return null;
                          
                          return (
                            <div key={priorityId} className="p-3 sm:p-4 rounded-lg border bg-purple-50 border-purple-200">
                              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                                <div style={{ color: `hsl(var(--${area.color}))` }} className="flex-shrink-0">
                                  {area.icon}
                                </div>
                                <h4 className="font-semibold text-purple-800 text-xs sm:text-sm">{area.name}</h4>
                              </div>
                              <p className="text-xs text-purple-700 mb-2 sm:mb-3">
                                Since you want to improve in this area, check out our curated resources in the{' '}
                                <strong>{categoryMapping[area.id] || area.name}</strong> category.
                              </p>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => window.open('/carpe-diem', '_blank')}
                                className="text-purple-700 border-purple-300 hover:bg-purple-100 text-xs w-full sm:w-auto"
                              >
                                View Resources
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div className="bg-gradient-subtle rounded-xl p-4 sm:p-6 text-center space-y-3 sm:space-y-4 mx-2">
                    <h3 className="text-base sm:text-lg font-semibold">🚀 Your Next Steps</h3>
                    <p className="text-muted-foreground text-xs sm:text-sm">
                      {selectedPriorities.length > 0 
                        ? `You've identified ${selectedPriorities.length} area${selectedPriorities.length > 1 ? 's' : ''} for growth. Start with just one small action this week in your highest priority area. Small, consistent steps create lasting transformation.`
                        : "Focus on maintaining your strengths while being open to growth opportunities. Sometimes the best growth comes from doubling down on what you're already good at."
                      }
                    </p>
                    <div className="flex justify-center gap-2 sm:gap-4 flex-wrap">
                      <Button onClick={() => setCurrentStep('assessment')} variant="outline" size="sm" className="text-xs sm:text-sm">
                        <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Retake
                      </Button>
                      <Button onClick={() => setCurrentStep('designer')} variant="outline" size="sm" className="text-xs sm:text-sm">
                        Redesign Week
                      </Button>
                      <Button onClick={() => window.print()} size="sm" className="text-xs sm:text-sm">
                        Save Results
                      </Button>
                      <Button onClick={() => window.open('/carpe-diem', '_blank')} size="sm" className="text-xs sm:text-sm">
                        Resources
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

export default WheelOfLifeAssessment;