import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
    <Card className="print:shadow-none print:border-2 print:border-black">
      <CardHeader className="text-center">
        <CardTitle className="print:text-xl">My Ideal Week Worksheet</CardTitle>
        <CardDescription className="print:text-base print:text-black">
          Your personalized time blocks for achieving life balance
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Summary section */}
        <div className="mb-6 print:mb-4">
          <h3 className="font-semibold mb-3 print:text-lg">Weekly Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-2">
            <div className="space-y-2">
              <p className="text-sm print:text-base">
                <strong>Total Time Blocks:</strong> {placedBlocks.length}
              </p>
              <p className="text-sm print:text-base">
                <strong>Total Weekly Hours:</strong> {placedBlocks.length} hours
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm print:text-base">
                <strong>Life Areas Covered:</strong> {new Set(placedBlocks.map(block => block.area.id)).size}
              </p>
              <p className="text-sm print:text-base">
                <strong>Average per Day:</strong> {(placedBlocks.length / 7).toFixed(1)} hours
              </p>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 print:border-2 print:border-black">
            <thead>
              <tr>
                <th className="border border-gray-300 print:border-black p-2 bg-muted print:bg-gray-100 text-sm font-semibold">
                  Time
                </th>
                {daysOfWeek.map(day => (
                  <th key={day} className="border border-gray-300 print:border-black p-2 bg-muted print:bg-gray-100 text-sm font-semibold">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((time, hourIndex) => (
                <tr key={time}>
                  <td className="border border-gray-300 print:border-black p-2 text-xs print:text-sm font-medium bg-muted/50 print:bg-gray-50">
                    {time}
                  </td>
                  {daysOfWeek.map(day => {
                    const block = getBlockForSlot(day, hourIndex);
                    return (
                      <td key={day} className="border border-gray-300 print:border-black p-1 h-12 print:h-8">
                        {block ? (
                          <div className="text-xs print:text-sm font-medium text-center p-1 rounded print:bg-gray-200">
                            {block.area.name}
                          </div>
                        ) : (
                          <div className="h-full"></div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        {placedBlocks.length > 0 && (
          <div className="mt-6 print:mt-4">
            <h3 className="font-semibold mb-3 print:text-lg">Life Areas in Your Week</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 print:gap-2">
              {Array.from(new Set(placedBlocks.map(block => block.area.id)))
                .map(areaId => {
                  const area = placedBlocks.find(block => block.area.id === areaId)?.area;
                  const count = placedBlocks.filter(block => block.area.id === areaId).length;
                  if (!area) return null;
                  
                  return (
                    <div key={areaId} className="flex items-center gap-2 p-2 rounded-lg border print:border-black">
                      <div className="print:hidden" style={{ color: `hsl(var(--${area.color}))` }}>
                        {area.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm print:text-base">{area.name}</div>
                        <div className="text-xs print:text-sm text-muted-foreground print:text-black">
                          {count} hour{count !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {placedBlocks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No time blocks have been placed yet.</p>
            <p className="text-sm mt-2">Go back to the Ideal Week Designer to create your schedule.</p>
          </div>
        )}

        {/* Print instructions */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg print:hidden">
          <h4 className="font-semibold mb-2">Print Instructions:</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Click "Print This Worksheet" to generate a clean, printable version</li>
            <li>• Use landscape orientation for better formatting</li>
            <li>• Consider printing in black & white to save ink</li>
            <li>• The worksheet is designed to fit on a single page</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default IdealWeekWorksheet;