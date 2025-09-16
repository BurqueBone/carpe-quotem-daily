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
  return <Card className="bg-gradient-to-br from-#FFEEDD to-#B8B8FF rounded-2xl p-6 border border-primary/20 shadow-glow hover:shadow-xl transition-smooth text-center">
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
          {source && <p className="text-sm italic text-white">{source}</p>}
        </div>
        
        <div className="space-y-4 mt-6">
          <p className="text-sm text-muted-foreground text-center px-4">
            If you would like join us in using reminders of death as inspiration, provide your email and Sunday4k will send daily inspirational quotes
          </p>
          <div className="flex justify-center">
            <a href="/auth" className="inline-flex items-center gap-2 bg-secondary text-black px-6 py-3 rounded-lg font-medium shadow-glow hover:shadow-xl transition-smooth">
              <div className="flex items-center justify-center gap-2 font-semibold text-black">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Start Your Inspiration
              </div>
            </a>
          </div>
        </div>
        
      </div>
    </Card>;
};
export default QuoteCard;