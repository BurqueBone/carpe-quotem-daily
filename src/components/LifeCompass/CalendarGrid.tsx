import React from 'react';
import { Card } from "@/components/ui/card";
import PriorityBlock from './PriorityBlock';

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
  onBlockPlaced: (area: LifeArea, day: string, hour: number) => void;
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

  const getBlockForSlot = (day: string, hour: number) => {
    return placedBlocks.find(block => block.day === day && block.hour === hour);
  };

  const handleDrop = (e: React.DragEvent, day: string, hour: number) => {
    e.preventDefault();
    
    // Check if slot is already occupied
    if (getBlockForSlot(day, hour)) {
      return;
    }

    try {
      const areaData = JSON.parse(e.dataTransfer.getData('text/plain'));
      onBlockPlaced(areaData, day, hour);
    } catch (error) {
      console.error('Error parsing dropped data:', error);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const formatTime = (hour: number) => {
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    const period = hour >= 12 ? 'PM' : 'AM';
    return `${displayHour}${period}`;
  };

  return (
    <Card className="p-4 bg-card overflow-x-auto">
      <div className="min-w-[800px]">
        <div className="grid grid-cols-8 gap-1 text-xs">
          {/* Header row */}
          <div className="p-3 font-medium text-center text-muted-foreground">Time</div>
          {days.map(day => (
            <div key={day} className="p-3 text-center font-semibold bg-muted/30 rounded-md">
              <div className="hidden md:block">{day}</div>
              <div className="md:hidden">{day.slice(0, 3)}</div>
            </div>
          ))}
          
          {/* Time slots */}
          {timeSlots.map(hour => (
            <React.Fragment key={hour}>
              <div className="p-3 text-right text-muted-foreground font-medium bg-muted/20 rounded-md flex items-center justify-end">
                {formatTime(hour)}
              </div>
              {days.map(day => {
                const placedBlock = getBlockForSlot(day, hour);
                return (
                  <div
                    key={`${day}-${hour}`}
                    className="p-1 border border-border/30 min-h-[50px] rounded-sm hover:bg-accent/30 transition-colors relative"
                    onDrop={(e) => handleDrop(e, day, hour)}
                    onDragOver={handleDragOver}
                  >
                    {placedBlock ? (
                      <PriorityBlock
                        area={placedBlock.area}
                        isPlaced={true}
                        onRemove={() => onBlockRemoved(placedBlock.id)}
                        className="h-full min-h-[46px] m-0"
                        isPriority={selectedPriorities.includes(placedBlock.area.id)}
                        iconOnly={true}
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-muted-foreground/50 opacity-0 hover:opacity-100 transition-opacity">
                        Drop here
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default CalendarGrid;