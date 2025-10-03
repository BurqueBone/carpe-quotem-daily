import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronUp, ChevronDown, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResourceListItemProps {
  resource: {
    id: string;
    title: string;
    description: string;
    url: string;
    type: string;
    category_name?: string;
    affiliate_url?: string;
    has_affiliate: boolean;
    how_resource_helps?: string;
    upvote_count: number;
    user_has_upvoted: boolean;
  };
  onUpvoteToggle: (resourceId: string, currentlyUpvoted: boolean) => Promise<void>;
}

const ResourceListItem = ({ resource, onUpvoteToggle }: ResourceListItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUpvoting, setIsUpvoting] = useState(false);

  const resourceUrl = resource.has_affiliate && resource.affiliate_url 
    ? resource.affiliate_url 
    : resource.url;

  const handleUpvote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isUpvoting) return;
    
    setIsUpvoting(true);
    try {
      await onUpvoteToggle(resource.id, resource.user_has_upvoted);
    } finally {
      setIsUpvoting(false);
    }
  };

  return (
    <Card className="group hover:shadow-md transition-all duration-200">
      <div className="flex items-start gap-4 p-4">
        {/* Upvote Button */}
        <div className="flex flex-col items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUpvote}
            disabled={isUpvoting}
            className={cn(
              "h-10 w-10 p-0 rounded-lg transition-all",
              resource.user_has_upvoted 
                ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                : "hover:bg-primary/10"
            )}
          >
            <ChevronUp className={cn(
              "h-5 w-5",
              resource.user_has_upvoted && "fill-current"
            )} />
          </Button>
          <span className={cn(
            "text-sm font-semibold min-w-[2ch] text-center",
            resource.user_has_upvoted && "text-primary"
          )}>
            {resource.upvote_count}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-3">
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <a
                href={resourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group/link flex items-center gap-2 hover:text-primary transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold leading-tight break-words">
                  {resource.title}
                </h3>
                <ExternalLink className="h-4 w-4 flex-shrink-0 opacity-60 group-hover/link:opacity-100 transition-opacity" />
              </a>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="ml-2 flex-shrink-0"
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {resource.category_name && (
                <Badge variant="outline" className="text-xs">
                  {resource.category_name}
                </Badge>
              )}
              <Badge variant="secondary" className="text-xs capitalize">
                {resource.type}
              </Badge>
            </div>
          </div>

          {/* Expanded Content */}
          {isExpanded && (
            <div className="space-y-3 pt-2 border-t animate-in fade-in slide-in-from-top-2 duration-200">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {resource.description}
              </p>
              
              {resource.how_resource_helps && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-primary mb-1">
                    How this helps:
                  </p>
                  <p className="text-sm text-foreground">
                    {resource.how_resource_helps}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ResourceListItem;
