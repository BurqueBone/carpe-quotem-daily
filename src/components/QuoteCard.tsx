import { Card } from "@/components/ui/card";
import { Clock, Heart, Eye } from "lucide-react";
interface QuoteCardProps {
  quote: string;
  author: string;
  source?: string;
  displayCount?: number;
  lastDisplayedAt?: string;
}
const QuoteCard = ({
  quote,
  author,
  source,
  displayCount,
  lastDisplayedAt
}: QuoteCardProps) => {
  return <Card className="p-8 bg-gradient-subtle shadow-card border-border/50 hover:shadow-warm transition-smooth">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-gradient-warm flex items-center justify-center shadow-glow">
            <Heart className="w-8 h-8 text-white" fill="currentColor" />
          </div>
        </div>
        
        <blockquote className="text-xl md:text-2xl font-medium leading-relaxed text-foreground">
          "{quote}"
        </blockquote>
        
        <div className="space-y-2">
          <p className="text-lg font-semibold text-primary">— {author}</p>
          {source && <p className="text-sm text-muted-foreground italic">{source}</p>}
        </div>
        
      </div>
    </Card>;
};
export default QuoteCard;