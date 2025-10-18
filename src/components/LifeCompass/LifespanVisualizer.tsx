import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { format, differenceInWeeks } from "date-fns";

interface LifespanVisualizerProps {
  maxLifespan?: number;
}

// Life milestone definitions
const LIFE_MILESTONES = [
  { name: "Childhood", startMonth: 0, endMonth: 60, color: "hsl(280, 80%, 97%)" },      // 0-5 years (Light purple)
  { name: "Schooling", startMonth: 60, endMonth: 288, color: "hsl(210, 80%, 97%)" },      // 5-24 years (Light blue)
  { name: "Career Growth", startMonth: 288, endMonth: 600, color: "hsl(150, 80%, 97%)" }, // 24-50 years (Light green)
  { name: "Career Peak", startMonth: 600, endMonth: 780, color: "hsl(45, 80%, 97%)" }, // 50-65 years (Light yellow)
  { name: "Retirement", startMonth: 780, endMonth: 1080, color: "hsl(25, 80%, 97%)" }  // 65-90 years (Light orange)
];

const FOUR_K_WEEKS_MARKER = 960; // 80 years * 12 months = 4K weeks

const LifespanVisualizer = ({ maxLifespan = 90 }: LifespanVisualizerProps) => {
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [birthdate, setBirthdate] = useState<Date | undefined>(undefined);
  const isMobile = useIsMobile();

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("sunday4k_lifespan_dob");
    if (saved) {
      const date = new Date(saved);
      if (!isNaN(date.getTime())) {
        setBirthdate(date);
        setSelectedMonth(date.getMonth().toString());
        setSelectedDay(date.getDate().toString());
        setSelectedYear(date.getFullYear().toString());
      }
    }
  }, []);

  // Update birthdate when all three selectors have values
  useEffect(() => {
    if (selectedDay && selectedMonth && selectedYear) {
      const date = new Date(parseInt(selectedYear), parseInt(selectedMonth), parseInt(selectedDay));
      if (!isNaN(date.getTime())) {
        setBirthdate(date);
        localStorage.setItem("sunday4k_lifespan_dob", format(date, "yyyy-MM-dd"));
      }
    } else {
      setBirthdate(undefined);
      if (!selectedDay && !selectedMonth && !selectedYear) {
        localStorage.removeItem("sunday4k_lifespan_dob");
      }
    }
  }, [selectedDay, selectedMonth, selectedYear]);

  const calculateLifeData = (dob: Date | undefined) => {
    if (!dob) return null;

    const now = new Date();
    const birthDate = dob;

    // Validate date is in the past
    if (birthDate > now) return null;

    // Age calculation
    const ageInMs = now.getTime() - birthDate.getTime();
    const ageInYears = ageInMs / (1000 * 60 * 60 * 24 * 365.25);
    const currentAge = Math.floor(ageInYears);

    // Month calculations
    const monthsLived = Math.floor(ageInYears * 12);
    const totalMonths = maxLifespan * 12;
    const monthsRemaining = Math.max(0, totalMonths - monthsLived);

    // Precise weeks calculation
    const weeksLived = differenceInWeeks(now, birthDate);
    const totalWeeks = maxLifespan * 52; // Approximate
    const weeksRemaining = Math.max(0, totalWeeks - weeksLived);

    // Current period index (0-based)
    const currentMonthIndex = monthsLived;

    return {
      currentAge,
      monthsLived,
      monthsRemaining,
      totalMonths,
      weeksLived,
      weeksRemaining,
      totalWeeks,
      currentMonthIndex,
      birthDate,
    };
  };

  const lifeData = calculateLifeData(birthdate);

  // Generate arrays for dropdowns
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  const months = [
    { value: "0", label: "January" },
    { value: "1", label: "February" },
    { value: "2", label: "March" },
    { value: "3", label: "April" },
    { value: "4", label: "May" },
    { value: "5", label: "June" },
    { value: "6", label: "July" },
    { value: "7", label: "August" },
    { value: "8", label: "September" },
    { value: "9", label: "October" },
    { value: "10", label: "November" },
    { value: "11", label: "December" },
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => (currentYear - i).toString());

  const renderGrid = () => {
    if (!lifeData) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          Enter your date of birth to visualize your life
        </div>
      );
    }

    const lived = lifeData.monthsLived;
    const currentIndex = lifeData.currentMonthIndex;

    return (
      <div className="space-y-4">
        {LIFE_MILESTONES.map((milestone) => {
          const monthsInMilestone = [];
          
          // Generate month blocks for this milestone
          for (let i = milestone.startMonth; i < milestone.endMonth; i++) {
            const isPast = i < lived;
            const isCurrent = i === currentIndex;
            const isFuture = i > lived;
            
            let bgColor = "bg-gray-300/80";
            let extraClasses = "";
            
            if (isCurrent) {
              bgColor = "bg-primary";
              extraClasses = "animate-pulse ring-2 ring-primary/50";
            } else if (isFuture) {
              bgColor = "bg-blue-100";
            }
            
            const age = Math.floor(i / 12);
            const label = isPast
              ? `Month ${i}, Age ${age}, Lived`
              : `Month ${i}, Estimated Age ${age}`;
            
            monthsInMilestone.push(
              <Tooltip key={i}>
                <TooltipTrigger asChild>
                  <div
                    className={`${bgColor} ${extraClasses} w-4 h-4 rounded-sm transition-all duration-200 hover:scale-110 cursor-pointer`}
                    aria-label={label}
                  />
                </TooltipTrigger>
                {!isMobile && (
                  <TooltipContent>
                    <p className="text-xs">{label}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            );
          }
          
          return (
            <div 
              key={milestone.name}
              className="border rounded-lg p-4"
              style={{ backgroundColor: milestone.color }}
            >
              <div className="flex items-start gap-4">
                {/* Milestone Label on Left */}
                <div className="flex-shrink-0 w-32 md:w-40">
                  <h3 className="text-sm font-semibold text-foreground">
                    {milestone.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.floor(milestone.startMonth / 12)}-{Math.floor(milestone.endMonth / 12)} years
                  </p>
                </div>
                
                {/* Month Blocks Grid */}
                <div className="flex-1 min-w-0">
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(16px,1fr))] gap-1">
                    {monthsInMilestone}
                  </div>
                </div>
              </div>
              
              {/* Add 4K Weeks marker if it falls in this milestone */}
              {milestone.startMonth <= FOUR_K_WEEKS_MARKER && 
               milestone.endMonth > FOUR_K_WEEKS_MARKER && (
                <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-primary">
                  <div className="w-1 h-4 bg-primary" />
                  <span>4K Weeks Milestone (80 years)</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Life in Months</CardTitle>
        <CardDescription>A visual of your life experienced so far.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label>Date of Birth</Label>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger>
                  <SelectValue placeholder="Day" />
                </SelectTrigger>
                <SelectContent>
                  {days.map((day) => (
                    <SelectItem key={day} value={day}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {birthdate && (
            <p className="text-sm text-muted-foreground text-center">
              {format(birthdate, "MMMM d, yyyy")}
            </p>
          )}
        </div>

        {renderGrid()}

        {lifeData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{lifeData.currentAge}</div>
              <div className="text-sm text-muted-foreground">Current Age</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{lifeData.monthsLived}</div>
              <div className="text-sm text-muted-foreground">Months Lived</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{lifeData.weeksLived}</div>
              <div className="text-sm text-muted-foreground">Weeks Lived</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{lifeData.weeksRemaining}</div>
              <div className="text-sm text-muted-foreground">Weeks Remaining</div>
            </div>
          </div>
        )}

        {lifeData && lifeData.currentAge > maxLifespan && (
          <div className="text-center p-4 bg-primary/10 rounded-lg">
            <p className="text-sm text-foreground font-medium">🎉 You've surpassed the average! Every day is a gift.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LifespanVisualizer;
