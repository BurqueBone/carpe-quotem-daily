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

const TodaysResourceCard = ({ resource }: TodaysResourceCardProps) => {
  const resourceUrl = resource.has_affiliate && resource.affiliate_url 
    ? resource.affiliate_url 
    : resource.url;

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 border-2 border-primary/20 shadow-lg">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-secondary/5 rounded-full blur-3xl" />
      
      <div className="relative p-8 space-y-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary animate-pulse" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Today's Featured Resource
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="space-y-2 flex-1 w-full sm:w-auto">
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight break-words">
                {resource.title}
              </h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="capitalize">
                  {resource.type}
                </Badge>
                {resource.category_name && (
                  <Badge variant="outline">
                    {resource.category_name}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-1 bg-background/50 backdrop-blur-sm rounded-lg p-3 border">
              <ChevronUp className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold text-foreground">{resource.upvote_count}</span>
              <span className="text-xs text-muted-foreground">votes</span>
            </div>
          </div>

          <p className="text-lg text-muted-foreground leading-relaxed">
            {resource.description}
          </p>

          {resource.how_resource_helps && (
            <div className="bg-background/50 backdrop-blur-sm rounded-lg p-4 border border-primary/10">
              <p className="text-sm font-semibold text-primary mb-1">How this helps:</p>
              <p className="text-sm text-foreground">{resource.how_resource_helps}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button asChild size="lg" className="flex-1 group w-full sm:w-auto">
              <a 
                href={resourceUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                Explore Resource
                <ExternalLink className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="#resources-list">
                View All Resources
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TodaysResourceCard;
