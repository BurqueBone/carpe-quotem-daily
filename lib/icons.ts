import {
  Briefcase,
  Globe,
  Palette,
  Heart,
  Leaf,
  Users,
  DollarSign,
  BookOpen,
  Brain,
  Dumbbell,
  MessageCircle,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Briefcase,
  Globe,
  Palette,
  Heart,
  Leaf,
  Users,
  DollarSign,
  BookOpen,
  Brain,
  Dumbbell,
  MessageCircle,
  Sparkles,
};

export function getIcon(name: string): LucideIcon {
  return iconMap[name] || Sparkles;
}
