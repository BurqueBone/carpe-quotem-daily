import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Sparkles, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
interface TodaysResourceCardProps {
  resource: {
    id: string;
    title: string;
    description: string;
    url: string;
    type: string;
    affiliate_url?: string;
    has_affiliate: boolean;
    how_resource_helps?: string;
    upvote_count: number;
    category_name?: string;
  };
}
const TodaysResourceCard = ({
  resource
}: TodaysResourceCardProps) => {
  const resourceUrl = resource.has_affiliate && resource.affiliate_url ? resource.affiliate_url : resource.url;
  return <Card className="relative overflow-hidden bg-gradient-to-br from-warm/10 via-background to-accent/10 border-2 border-warm/30 shadow-lg">
      <div className="absolute top-0 right-0 w-32 h-32 bg-warm/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-accent/5 rounded-full blur-3xl" />
      
      <div className="relative p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-warm animate-pulse" />
          <h2 className="font-bold bg-gradient-to-r from-warm to-accent bg-clip-text text-[#9381ff] text-xl">
            Today's Featured Resource
          </h2>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
            <div className="space-y-1.5 flex-1 w-full sm:w-auto">
              <div className="flex flex-col gap-1.5">
                <h3 className="text-xl sm:text-2xl font-bold text-foreground leading-tight break-words">
                  {resource.title} <span className="text-muted-foreground font-normal">—</span> <span className="text-sm text-muted-foreground font-normal">{resource.description}</span>
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="capitalize">
                  {resource.type}
                </Badge>
                {resource.category_name && <Badge variant="outline">
                    {resource.category_name}
                  </Badge>}
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-0.5 bg-background/50 backdrop-blur-sm rounded-lg p-2 border border-warm/20">
              <ChevronUp className="h-5 w-5 text-warm" />
              <span className="text-base font-bold text-foreground">{resource.upvote_count}</span>
              <span className="text-xs text-muted-foreground">votes</span>
            </div>
          </div>

          {resource.how_resource_helps && <div className="bg-warm/5 backdrop-blur-sm rounded-lg p-3 border border-warm/20">
              <p className="text-xs font-semibold text-warm-foreground mb-0.5">How this helps:</p>
              <p className="text-xs text-foreground">{resource.how_resource_helps}</p>
            </div>}

          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <Button asChild size="default" className="flex-1 group w-full sm:w-auto">
              <a href={resourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                Explore Resource
                <ExternalLink className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </Button>
            <Button asChild variant="outline" size="default">
              <Link to="#resources-list">
                View All Resources
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Card>;
};
export default TodaysResourceCard;