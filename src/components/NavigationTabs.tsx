import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart } from "lucide-react";
interface NavigationTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}
const NavigationTabs = ({
  activeTab,
  onTabChange
}: NavigationTabsProps) => {
  return <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      
    </Tabs>;
};
export default NavigationTabs;