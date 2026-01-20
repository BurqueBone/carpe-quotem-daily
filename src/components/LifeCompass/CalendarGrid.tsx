import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import PriorityBlock from './PriorityBlock';
import { cn } from "@/lib/utils";

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

interface CalendarGridProps {
  placedBlocks: PlacedBlock[];
  onBlockPlaced: (areaId: string, day: string, hour: number) => void;
  onBlockRemoved: (blockId: string) => void;
  selectedPriorities: string[];
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  placedBlocks,
  onBlockPlaced,
  onBlockRemoved,
  selectedPriorities
}) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeSlots = Array.from({ length: 13 }, (_, i) => i + 7); // 7 AM to 7 PM (compact)

  const [draggedOver, setDraggedOver] = useState<string | null>(null);

  const getBlockForSlot = (day: string, hour: number) => {
    return placedBlocks.find(block => block.day === day && block.hour === hour);
  };

  const handleDrop = (e: React.DragEvent, day: string, hour: number) => {
    e.preventDefault();
    setDraggedOver(null);
    
    // Check if slot is already occupied
    if (getBlockForSlot(day, hour)) {
      return;
    }

    const areaId = e.dataTransfer.getData('text/plain');
    if (areaId) {
      onBlockPlaced(areaId, day, hour);
    }
  };

  const handleDragOver = (e: React.DragEvent, day: string, hour: number) => {
    e.preventDefault();
    const slotKey = `${day}-${hour}`;
    if (!getBlockForSlot(day, hour)) {
      setDraggedOver(slotKey);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedOver(null);
  };

  const formatTime = (hour: number) => {
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    const period = hour >= 12 ? 'PM' : 'AM';
    return `${displayHour}${period}`;
  };

  return (
    <Card className="p-1.5 sm:p-3 bg-card">
      <ScrollArea className="w-full">
        <div className="min-w-[550px] sm:min-w-[700px]">
        <div className="grid grid-cols-8 gap-px text-xs">
          {/* Header row */}
          <div className="p-0.5 sm:p-2 font-medium text-center text-muted-foreground text-[9px] sm:text-xs">Time</div>
          {days.map(day => (
            <div key={day} className="p-0.5 sm:p-2 text-center font-semibold bg-muted/30 rounded-sm text-[9px] sm:text-xs">
              <div className="hidden sm:block">{day.slice(0, 3)}</div>
              <div className="sm:hidden">{day.slice(0, 2)}</div>
            </div>
          ))}
          
          {/* Time slots */}
          {timeSlots.map(hour => (
            <React.Fragment key={hour}>
              <div className="p-0.5 sm:p-2 text-right text-muted-foreground font-medium bg-muted/20 rounded-sm flex items-center justify-end text-[9px] sm:text-xs">
                {formatTime(hour)}
              </div>
              {days.map(day => {
                const placedBlock = getBlockForSlot(day, hour);
                const slotKey = `${day}-${hour}`;
                const isDraggedOver = draggedOver === slotKey;
                return (
                  <div
                    key={`${day}-${hour}`}
                    className={cn(
                      "p-px border border-border/30 min-h-[32px] sm:min-h-[38px] rounded-sm transition-colors relative",
                      placedBlock 
                        ? "bg-background" 
                        : isDraggedOver 
                          ? "bg-primary/20 border-primary" 
                          : "hover:bg-accent/30"
                    )}
                    onDrop={(e) => handleDrop(e, day, hour)}
                    onDragOver={(e) => handleDragOver(e, day, hour)}
                    onDragLeave={handleDragLeave}
                  >
                    {placedBlock ? (
                      <PriorityBlock
                        area={placedBlock.area}
                        isPlaced={true}
                        onRemove={() => onBlockRemoved(placedBlock.id)}
                        className="h-full min-h-[30px] sm:min-h-[36px] m-0"
                        isPriority={selectedPriorities.includes(placedBlock.area.id)}
                        iconOnly={true}
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-[9px] sm:text-[10px] text-muted-foreground/50 opacity-0 hover:opacity-100 transition-opacity">
                        +
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </Card>
  );
};

export default CalendarGrid;