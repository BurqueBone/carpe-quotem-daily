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
  const timeSlots = Array.from({ length: 16 }, (_, i) => i + 6); // 6 AM to 10 PM

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
    <Card className="p-2 sm:p-4 bg-card">
      <ScrollArea className="w-full">
        <div className="min-w-[600px] sm:min-w-[800px]">
        <div className="grid grid-cols-8 gap-0.5 sm:gap-1 text-xs">
          {/* Header row */}
          <div className="p-1 sm:p-3 font-medium text-center text-muted-foreground text-[10px] sm:text-xs">Time</div>
          {days.map(day => (
            <div key={day} className="p-1 sm:p-3 text-center font-semibold bg-muted/30 rounded-md text-[10px] sm:text-xs">
              <div className="hidden sm:block">{day.slice(0, 3)}</div>
              <div className="sm:hidden">{day.slice(0, 2)}</div>
            </div>
          ))}
          
          {/* Time slots */}
          {timeSlots.map(hour => (
            <React.Fragment key={hour}>
              <div className="p-1 sm:p-3 text-right text-muted-foreground font-medium bg-muted/20 rounded-md flex items-center justify-end text-[10px] sm:text-xs">
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
                      "p-0.5 sm:p-1 border border-border/30 min-h-[40px] sm:min-h-[50px] rounded-sm transition-colors relative",
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
                        className="h-full min-h-[36px] sm:min-h-[46px] m-0"
                        isPriority={selectedPriorities.includes(placedBlock.area.id)}
                        iconOnly={true}
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-[10px] sm:text-xs text-muted-foreground/50 opacity-0 hover:opacity-100 transition-opacity">
                        Drop
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