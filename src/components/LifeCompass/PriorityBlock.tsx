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
  isPriority?: boolean;
  iconOnly?: boolean;
}

const getColorClasses = (areaId: string, isPriority: boolean = false) => {
  if (!isPriority) {
    return 'bg-muted border-border text-foreground';
  }
  
  const colorMap: Record<string, string> = {
    physical: 'bg-life-area-physical border-life-area-physical text-white',
    mental: 'bg-life-area-mental border-life-area-mental text-white',
    emotional: 'bg-life-area-emotional border-life-area-emotional text-white',
    family: 'bg-life-area-family border-life-area-family text-white',
    financial: 'bg-life-area-financial border-life-area-financial text-white',
    career: 'bg-life-area-career border-life-area-career text-white',
    learning: 'bg-life-area-learning border-life-area-learning text-white',
    creative: 'bg-life-area-creative border-life-area-creative text-white',
    social: 'bg-life-area-social border-life-area-social text-white',
    spiritual: 'bg-life-area-spiritual border-life-area-spiritual text-white',
    environment: 'bg-life-area-environment border-life-area-environment text-white',
    community: 'bg-life-area-community border-life-area-community text-white',
  };
  return colorMap[areaId] || 'bg-primary border-primary text-primary-foreground';
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
  className,
  isPriority = false,
  iconOnly = false
}) => {
  const colorClasses = getColorClasses(area.id, isPriority);

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
            {iconOnly ? (
              <div className="flex items-center justify-center">
                <div className="flex-shrink-0">
                  {area.icon}
                </div>
                {isPlaced && onRemove && (
                  <button
                    onClick={onRemove}
                    className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-black/10 rounded-full bg-background border border-border"
                    aria-label="Remove block"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ) : (
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
            )}
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