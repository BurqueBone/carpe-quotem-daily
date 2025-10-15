import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, LucideIcon } from "lucide-react";

interface NavigationCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  gradient?: string;
}

const NavigationCard = ({ 
  title, 
  description, 
  icon: Icon, 
  href,
  gradient = "from-primary to-primary/80"
}: NavigationCardProps) => {
  return (
    <Link to={href} className="block h-full">
      <Card className="h-full hover:shadow-warm transition-smooth cursor-pointer group border-border/50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-glow group-hover:scale-110 transition-transform flex-shrink-0`}>
              <Icon className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default NavigationCard;
