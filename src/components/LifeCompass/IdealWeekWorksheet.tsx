import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

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

interface IdealWeekWorksheetProps {
  placedBlocks: PlacedBlock[];
}

const IdealWeekWorksheet: React.FC<IdealWeekWorksheetProps> = ({ placedBlocks }) => {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeSlots = Array.from({ length: 17 }, (_, i) => {
    const hour = i + 6; // 6 AM to 10 PM
    return hour <= 12 ? `${hour}:00 AM` : `${hour - 12}:00 PM`;
  });

  const getBlockForSlot = (day: string, hourIndex: number) => {
    return placedBlocks.find(block => 
      block.day === day && block.hour === hourIndex + 6
    );
  };

  return (
    <div className="print-worksheet">
      {/* Header - clean and professional for print */}
      <div className="text-center mb-8 print:mb-6">
        <h1 className="text-3xl font-bold mb-2 print:text-2xl text-foreground print:text-black">
          My Ideal Week Worksheet
        </h1>
        <p className="text-muted-foreground print:text-gray-700 text-lg print:text-base">
          Your personalized time blocks for achieving life balance
        </p>
        <div className="w-24 h-1 bg-primary print:bg-black mx-auto mt-4 print:mt-3"></div>
      </div>

      {/* Summary section - optimized for print */}
      <div className="mb-8 print:mb-6">
        <h2 className="text-xl font-semibold mb-4 print:text-lg print:text-black border-b pb-2 print:border-black">
          Weekly Overview
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 print:gap-4 text-center">
          <div className="bg-card print:bg-transparent p-4 print:p-2 rounded-lg print:rounded-none border print:border-gray-300">
            <div className="text-2xl print:text-xl font-bold text-primary print:text-black">
              {placedBlocks.length}
            </div>
            <div className="text-sm print:text-xs text-muted-foreground print:text-gray-600 font-medium">
              Total Time Blocks
            </div>
          </div>
          <div className="bg-card print:bg-transparent p-4 print:p-2 rounded-lg print:rounded-none border print:border-gray-300">
            <div className="text-2xl print:text-xl font-bold text-primary print:text-black">
              {placedBlocks.length}
            </div>
            <div className="text-sm print:text-xs text-muted-foreground print:text-gray-600 font-medium">
              Weekly Hours
            </div>
          </div>
          <div className="bg-card print:bg-transparent p-4 print:p-2 rounded-lg print:rounded-none border print:border-gray-300">
            <div className="text-2xl print:text-xl font-bold text-primary print:text-black">
              {new Set(placedBlocks.map(block => block.area.id)).size}
            </div>
            <div className="text-sm print:text-xs text-muted-foreground print:text-gray-600 font-medium">
              Life Areas Covered
            </div>
          </div>
          <div className="bg-card print:bg-transparent p-4 print:p-2 rounded-lg print:rounded-none border print:border-gray-300">
            <div className="text-2xl print:text-xl font-bold text-primary print:text-black">
              {(placedBlocks.length / 7).toFixed(1)}
            </div>
            <div className="text-sm print:text-xs text-muted-foreground print:text-gray-600 font-medium">
              Average per Day
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid - optimized for print layout */}
      <div className="mb-8 print:mb-6">
        <h2 className="text-xl font-semibold mb-4 print:text-lg print:text-black border-b pb-2 print:border-black">
          Weekly Schedule
        </h2>
        <ScrollArea className="w-full print:overflow-visible">
          <table className="w-full border-collapse border-2 border-border print:border-black bg-background print:bg-white min-w-[700px]">
            <thead>
              <tr>
                <th className="border border-border print:border-black p-3 print:p-2 bg-muted print:bg-gray-50 text-sm print:text-xs font-bold print:text-black min-w-[80px] print:min-w-[60px]">
                  TIME
                </th>
                {daysOfWeek.map(day => (
                  <th key={day} className="border border-border print:border-black p-3 print:p-2 bg-muted print:bg-gray-50 text-sm print:text-xs font-bold print:text-black min-w-[100px] print:min-w-[70px]">
                    {day.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((time, hourIndex) => (
                <tr key={time} className="print:break-inside-avoid">
                  <td className="border border-border print:border-black p-3 print:p-2 text-xs print:text-xs font-semibold bg-muted/30 print:bg-gray-25 print:text-black text-center">
                    {time}
                  </td>
                  {daysOfWeek.map(day => {
                    const block = getBlockForSlot(day, hourIndex);
                    return (
                      <td key={day} className="border border-border print:border-black p-2 print:p-1 h-10 print:h-8 text-center">
                        {block ? (
                          <div className="text-xs print:text-xs font-semibold text-foreground print:text-black bg-primary/10 print:bg-gray-100 p-1 print:p-0.5 rounded print:rounded-none border print:border-gray-400">
                            {block.area.name}
                          </div>
                        ) : (
                          <div className="h-full bg-background print:bg-white"></div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <ScrollBar orientation="horizontal" className="print:hidden" />
        </ScrollArea>
      </div>

      {/* Life Areas Summary - print-optimized */}
      {placedBlocks.length > 0 && (
        <div className="mb-8 print:mb-4">
          <h2 className="text-xl font-semibold mb-4 print:text-lg print:text-black border-b pb-2 print:border-black">
            Life Areas Summary
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 print:gap-3 print:grid-cols-3">
            {Array.from(new Set(placedBlocks.map(block => block.area.id)))
              .sort((a, b) => {
                const countA = placedBlocks.filter(block => block.area.id === a).length;
                const countB = placedBlocks.filter(block => block.area.id === b).length;
                return countB - countA; // Sort by most hours first
              })
              .map(areaId => {
                const area = placedBlocks.find(block => block.area.id === areaId)?.area;
                const count = placedBlocks.filter(block => block.area.id === areaId).length;
                if (!area) return null;
                
                return (
                  <div key={areaId} className="bg-card print:bg-transparent p-4 print:p-3 rounded-lg print:rounded-none border print:border-gray-300 text-center">
                    <div className="print:hidden mb-2 flex justify-center" style={{ color: `hsl(var(--${area.color}))` }}>
                      {area.icon}
                    </div>
                    <div className="font-bold text-lg print:text-base print:text-black mb-1">
                      {count} hour{count !== 1 ? 's' : ''}
                    </div>
                    <div className="text-sm print:text-xs text-muted-foreground print:text-gray-600 font-medium">
                      {area.name}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {placedBlocks.length === 0 && (
        <div className="text-center py-12 print:py-8 text-muted-foreground print:text-gray-500">
          <div className="text-6xl print:text-4xl mb-4 print:hidden">📅</div>
          <h3 className="text-xl print:text-lg font-semibold mb-2 print:text-black">No Schedule Created</h3>
          <p className="print:text-black">No time blocks have been placed yet.</p>
          <p className="text-sm mt-2 print:text-xs print:text-gray-600">Go back to the Ideal Week Designer to create your schedule.</p>
        </div>
      )}

      {/* Print instructions - hidden when printing */}
      <div className="mt-8 p-6 bg-muted/50 print:bg-transparent rounded-lg print:rounded-none print:hidden border print:border-none">
        <h3 className="font-semibold text-lg mb-3">📄 Print Instructions</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div>
            <h4 className="font-semibold text-foreground mb-2">Recommended Settings:</h4>
            <ul className="space-y-1">
              <li>• <strong>Orientation:</strong> Portrait (recommended) or Landscape</li>
              <li>• <strong>Paper:</strong> Letter (8.5" × 11") or A4</li>
              <li>• <strong>Margins:</strong> Normal (1 inch)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Print Quality:</h4>
            <ul className="space-y-1">
              <li>• Black & white printing recommended</li>
              <li>• Ensure "Print backgrounds" is enabled</li>
              <li>• Use "More settings" → "Print as image" if needed</li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
};

export default IdealWeekWorksheet;