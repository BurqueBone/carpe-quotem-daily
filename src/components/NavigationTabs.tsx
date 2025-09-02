import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart } from "lucide-react";

interface NavigationTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

const NavigationTabs = ({ activeTab, onTabChange }: NavigationTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-1 bg-gradient-subtle border border-border/50 shadow-card">
        <TabsTrigger 
          value="home" 
          className="flex items-center gap-2 data-[state=active]:bg-gradient-warm data-[state=active]:text-white data-[state=active]:shadow-glow transition-spring"
        >
          <Heart className="w-4 h-4" />
          <span className="hidden sm:inline">Today</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default NavigationTabs;