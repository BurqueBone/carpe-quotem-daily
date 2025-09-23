import React from 'react';
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface LifeArea {
  id: string;
  name: string;
  icon: React.ReactNode;
  rating: number;
  color: string;
  description?: string;
}

interface PriorityBlockProps {
  area: LifeArea;
  isDragging?: boolean;
  isPlaced?: boolean;
  onRemove?: () => void;
  className?: string;
}

const getColorClasses = (areaId: string) => {
  const colorMap: Record<string, string> = {
    career: 'bg-life-area-career border-life-area-career text-white',
    health: 'bg-life-area-health border-life-area-health text-white',
    finances: 'bg-life-area-finances border-life-area-finances text-white',
    relationships: 'bg-life-area-relationships border-life-area-relationships text-white',
    growth: 'bg-life-area-growth border-life-area-growth text-white',
    social: 'bg-life-area-social border-life-area-social text-white',
    hobbies: 'bg-life-area-hobbies border-life-area-hobbies text-white',
    contribution: 'bg-life-area-contribution border-life-area-contribution text-white',
  };
  return colorMap[areaId] || 'bg-muted border-border text-foreground';
};

const getTooltipContent = (area: LifeArea) => {
  const descriptions: Record<string, string> = {
    career: "Time dedicated to your professional growth, work projects, and career development activities.",
    health: "Physical exercise, medical appointments, meal prep, and activities that support your well-being.",
    finances: "Budget planning, investments, financial education, and money management tasks.",
    relationships: "Quality time with family, friends, partner, and meaningful social connections.",
    growth: "Learning new skills, reading, self-reflection, therapy, and personal development.",
    social: "Social events, parties, networking, community activities, and fun gatherings.",
    hobbies: "Creative pursuits, entertainment, sports, games, and activities you enjoy for fun.",
    contribution: "Volunteering, mentoring, charitable work, and making a positive impact on others."
  };
  return descriptions[area.id] || area.description || `Time allocated for ${area.name.toLowerCase()}.`;
};

const PriorityBlock: React.FC<PriorityBlockProps> = ({ 
  area, 
  isDragging = false, 
  isPlaced = false,
  onRemove,
  className 
}) => {
  const colorClasses = getColorClasses(area.id);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card 
            className={cn(
              "p-3 cursor-move hover:shadow-md transition-all duration-200",
              "border-2 relative group",
              colorClasses,
              isDragging && "opacity-50 rotate-3 scale-105",
              isPlaced && "cursor-default",
              className
            )}
            draggable={!isPlaced}
            onDragStart={(e) => {
              if (!isPlaced) {
                e.dataTransfer.setData('text/plain', JSON.stringify(area));
                e.currentTarget.style.opacity = '0.5';
              }
            }}
            onDragEnd={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  {area.icon}
                </div>
                <span className="text-sm font-medium truncate">{area.name}</span>
              </div>
              {isPlaced && onRemove && (
                <button
                  onClick={onRemove}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-black/10 rounded-full"
                  aria-label="Remove block"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </Card>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs">
          <p className="text-sm">{getTooltipContent(area)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default PriorityBlock;