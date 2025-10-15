import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface LifespanVisualizerProps {
  maxLifespan?: number;
}

interface LifeData {
  currentAge: number;
  monthsLived: number;
  monthsRemaining: number;
  totalMonths: number;
  yearsLived: number;
  yearsRemaining: number;
  totalYears: number;
  currentMonthIndex: number;
  currentYearIndex: number;
}

const calculateLifeData = (dob: Date, maxLifespan: number): LifeData => {
  const now = new Date();
  const birthDate = new Date(dob);
  
  const ageInMs = now.getTime() - birthDate.getTime();
  const ageInYears = ageInMs / (1000 * 60 * 60 * 24 * 365.25);
  const currentAge = Math.floor(ageInYears);
  
  const monthsLived = Math.floor(ageInYears * 12);
  const totalMonths = maxLifespan * 12;
  const monthsRemaining = Math.max(0, totalMonths - monthsLived);
  
  const yearsLived = currentAge;
  const totalYears = maxLifespan;
  const yearsRemaining = Math.max(0, totalYears - yearsLived);
  
  const currentMonthIndex = monthsLived;
  const currentYearIndex = yearsLived;
  
  return {
    currentAge,
    monthsLived,
    monthsRemaining,
    totalMonths,
    yearsLived,
    yearsRemaining,
    totalYears,
    currentMonthIndex,
    currentYearIndex
  };
};

const LifespanVisualizer = ({ maxLifespan = 80 }: LifespanVisualizerProps) => {
  const [dateOfBirth, setDateOfBirth] = useState<string>("");
  const [error, setError] = useState<string>("");
  const isMobile = useIsMobile();
  
  useEffect(() => {
    const saved = localStorage.getItem('sunday4k_lifespan_dob');
    if (saved) {
      try {
        const date = new Date(saved);
        if (!isNaN(date.getTime())) {
          setDateOfBirth(date.toISOString().split('T')[0]);
        }
      } catch (e) {
        console.error('Error loading saved date:', e);
      }
    }
  }, []);
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setDateOfBirth(newDate);
    setError("");
    
    if (newDate) {
      const date = new Date(newDate);
      const now = new Date();
      
      if (date > now) {
        setError("Date of birth cannot be in the future");
        return;
      }
      
      const ageInYears = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      if (ageInYears > 120) {
        setError("Please enter a valid date of birth");
        return;
      }
      
      localStorage.setItem('sunday4k_lifespan_dob', date.toISOString());
    } else {
      localStorage.removeItem('sunday4k_lifespan_dob');
    }
  };
  
  const lifeData = dateOfBirth && !error ? calculateLifeData(new Date(dateOfBirth), maxLifespan) : null;
  const viewMode = isMobile ? 'years' : 'months';
  
  const renderGrid = () => {
    if (!lifeData) {
      return (
        <div className="flex items-center justify-center h-48 text-muted-foreground text-center px-4">
          <p>Enter your date of birth to visualize your life's finite nature</p>
        </div>
      );
    }
    
    if (viewMode === 'months') {
      const squares = Array.from({ length: lifeData.totalMonths }, (_, i) => {
        const isPast = i < lifeData.currentMonthIndex;
        const isCurrent = i === lifeData.currentMonthIndex;
        const isFuture = i > lifeData.currentMonthIndex;
        
        let colorClass = "bg-gray-300/80";
        if (isCurrent) colorClass = "bg-primary animate-pulse ring-2 ring-primary/50";
        else if (isFuture) colorClass = "bg-blue-100";
        
        const ageAtSquare = Math.floor(i / 12);
        const monthInYear = (i % 12) + 1;
        const tooltipText = isPast || isCurrent
          ? `Age ${ageAtSquare}, Month ${i + 1}`
          : `Estimated Age ${ageAtSquare}, Month ${i + 1}`;
        
        return (
          <TooltipProvider key={i}>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <div
                  className={`w-4 h-4 rounded-sm ${colorClass} transition-smooth cursor-default`}
                  aria-label={tooltipText}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{tooltipText}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      });
      
      return (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(16px,1fr))] gap-0.5 max-w-full">
          {squares}
        </div>
      );
    } else {
      const squares = Array.from({ length: lifeData.totalYears }, (_, i) => {
        const isPast = i < lifeData.currentYearIndex;
        const isCurrent = i === lifeData.currentYearIndex;
        const isFuture = i > lifeData.currentYearIndex;
        
        let colorClass = "bg-gray-300/80";
        if (isCurrent) colorClass = "bg-primary animate-pulse ring-2 ring-primary/50";
        else if (isFuture) colorClass = "bg-blue-100";
        
        const tooltipText = isPast || isCurrent
          ? `Age ${i}, Year ${i + 1}`
          : `Estimated Age ${i}`;
        
        return (
          <div
            key={i}
            className={`w-8 h-8 rounded-sm ${colorClass} transition-smooth`}
            aria-label={tooltipText}
          />
        );
      });
      
      return (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(32px,1fr))] gap-1 max-w-full">
          {squares}
        </div>
      );
    }
  };
  
  return (
    <Card className="border-border/50 shadow-card">
      <CardHeader>
        <CardTitle className="text-2xl">Your Life in {isMobile ? 'Years' : 'Weeks'}</CardTitle>
        <CardDescription className="text-base">
          A visual reminder of life's finite nature—not to induce despair, but to inspire intentional living.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="dob" className="text-base">Date of Birth</Label>
          <Input
            id="dob"
            type="date"
            value={dateOfBirth}
            onChange={handleDateChange}
            max={new Date().toISOString().split('T')[0]}
            className="max-w-xs"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        
        <div className="p-6 bg-gradient-subtle rounded-lg">
          {renderGrid()}
        </div>
        
        {lifeData && !error && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border/50">
            <div className="text-center space-y-1">
              <p className="text-2xl font-bold text-primary">{lifeData.currentAge}</p>
              <p className="text-sm text-muted-foreground">Current Age</p>
            </div>
            <div className="text-center space-y-1">
              <p className="text-2xl font-bold text-gray-500">
                {viewMode === 'months' ? lifeData.monthsLived : lifeData.yearsLived}
              </p>
              <p className="text-sm text-muted-foreground">
                {viewMode === 'months' ? 'Months' : 'Years'} Lived
              </p>
            </div>
            <div className="text-center space-y-1">
              <p className="text-2xl font-bold text-blue-500">
                {viewMode === 'months' ? lifeData.monthsRemaining : lifeData.yearsRemaining}
              </p>
              <p className="text-sm text-muted-foreground">
                {viewMode === 'months' ? 'Months' : 'Years'} Remaining
              </p>
            </div>
            <div className="text-center space-y-1">
              <p className="text-2xl font-bold text-foreground">
                {lifeData.yearsRemaining > 0 
                  ? maxLifespan 
                  : `${maxLifespan}+`
                }
              </p>
              <p className="text-sm text-muted-foreground">Lifespan Goal</p>
            </div>
          </div>
        )}
        
        {lifeData && lifeData.currentAge > maxLifespan && (
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg text-center">
            <p className="text-sm text-foreground font-medium">
              🎉 You've surpassed the average! Every day is a gift.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LifespanVisualizer;
