import { Card } from "@/components/ui/card";
import { Clock, Heart, Eye, Lightbulb } from "lucide-react";
import React from 'react';
import { Link } from 'react-router-dom';
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
  return <Card className="bg-gradient-to-br from-[#FFEEDD] to-[#B8B8FF] rounded-2xl p-6 border border-[#F8F7FF] shadow-glow hover:shadow-xl transition-smooth text-center">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-gradient from-[#B8B8FF] to-[#FFD8BE] flex items-center justify-center shadow-glow">
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
            Provide your email and Sunday4k will send daily inspirational quotes and resources
          </p>
          <div className="flex justify-center">
            <Link to="/profile" className="inline-flex items-center gap-2 bg-[#FFD8BE] text-black px-6 py-3 rounded-lg font-medium shadow-glow hover:shadow-xl transition-smooth">
              <Lightbulb className="w-4 h-4 mr-2" />
              Get Your Daily Inspiration
            </Link>
          </div>
        </div>
        
      </div>
    </Card>;
};
export default QuoteCard;