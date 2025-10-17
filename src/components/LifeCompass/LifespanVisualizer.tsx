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
  { name: "Childhood", startMonth: 0, endMonth: 60, color: "hsl(var(--primary) / 0.05)" },      // 0-5 years
  { name: "Schooling", startMonth: 60, endMonth: 288, color: "hsl(var(--secondary) / 0.05)" },      // 5-24 years
  { name: "Career Growth", startMonth: 288, endMonth: 600, color: "hsl(var(--accent) / 0.05)" }, // 24-50 years
  { name: "Career Peak", startMonth: 600, endMonth: 780, color: "hsl(220, 80%, 95%)" }, // 50-65 years
  { name: "Retirement", startMonth: 780, endMonth: 1080, color: "hsl(30, 80%, 95%)" }  // 65-90 years
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
        <div className="text-center py-12 text-muted-foreground">Enter your date of birth to visualize your life</div>
      );
    }

    const total = lifeData.totalMonths;
    const lived = lifeData.monthsLived;
    const currentIndex = lifeData.currentMonthIndex;

    const squares = [];

    for (let i = 0; i < total; i++) {
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

      squares.push(
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
        </Tooltip>,
      );
    }

    return (
      <div className="relative space-y-3">
        {/* Milestone Labels */}
        <div className="flex justify-between text-xs font-medium text-muted-foreground px-1">
          {LIFE_MILESTONES.map((milestone) => (
            <div
              key={milestone.name}
              className="text-center"
              style={{
                width: `${((milestone.endMonth - milestone.startMonth) / total) * 100}%`,
              }}
            >
              {milestone.name}
            </div>
          ))}
        </div>

        {/* Grid with Background Sections and Markers */}
        <div className="relative">
          {/* Milestone Background Sections */}
          {LIFE_MILESTONES.map((milestone) => (
            <div
              key={`bg-${milestone.name}`}
              className="absolute top-0 h-full"
              style={{
                left: `${(milestone.startMonth / total) * 100}%`,
                width: `${((milestone.endMonth - milestone.startMonth) / total) * 100}%`,
                backgroundColor: milestone.color,
              }}
            />
          ))}

          {/* Milestone Separator Lines */}
          {LIFE_MILESTONES.slice(1).map((milestone) => (
            <div
              key={`separator-${milestone.name}`}
              className="absolute top-0 h-full border-l-2 border-border/50"
              style={{
                left: `${(milestone.startMonth / total) * 100}%`,
              }}
            />
          ))}

          {/* 4K Weeks Marker at 80 years (960 months) */}
          <div
            className="absolute top-0 h-full flex flex-col items-center"
            style={{
              left: `${(FOUR_K_WEEKS_MARKER / total) * 100}%`,
            }}
          >
            <div className="border-l-4 border-primary h-full" />
            <div className="absolute -top-6 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded whitespace-nowrap">
              4K Weeks
            </div>
          </div>

          {/* Month Squares Grid */}
          <div className="relative grid gap-1 grid-cols-[repeat(auto-fill,minmax(16px,1fr))]">
            {squares}
          </div>
        </div>
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
