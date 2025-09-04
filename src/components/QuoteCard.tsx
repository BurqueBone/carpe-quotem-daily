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
  return <Card className="bg-gradient-warm rounded-2xl p-6 border border-primary/20 shadow-glow hover:shadow-xl transition-smooth text-center">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-gradient-warm flex items-center justify-center shadow-glow">
            <Heart className="w-8 h-8 text-white" fill="currentColor" />
          </div>
        </div>
        
        <blockquote className="text-xl md:text-2xl font-medium leading-relaxed text-white">
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