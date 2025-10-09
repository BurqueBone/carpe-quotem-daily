import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronUp, ExternalLink, Book, Video, Podcast, FileText, Link as LinkIcon } from "lucide-react";
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
    thumbnail_url?: string;
    upvote_count: number;
    user_has_upvoted: boolean;
  };
  onUpvoteToggle: (resourceId: string, currentlyUpvoted: boolean) => Promise<void>;
}

const ResourceListItem = ({ resource, onUpvoteToggle }: ResourceListItemProps) => {
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

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

  const getTypeIcon = () => {
    switch (resource.type.toLowerCase()) {
      case 'book':
        return <Book className="h-6 w-6" />;
      case 'video':
        return <Video className="h-6 w-6" />;
      case 'podcast':
        return <Podcast className="h-6 w-6" />;
      case 'article':
        return <FileText className="h-6 w-6" />;
      default:
        return <LinkIcon className="h-6 w-6" />;
    }
  };

  return (
    <Card className="group hover:shadow-md transition-all duration-200">
      <div className="flex items-start gap-4 p-4">
        {/* Thumbnail on the left */}
        <div className="flex-shrink-0">
          {resource.thumbnail_url && !imageError ? (
            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted">
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <img
                src={resource.thumbnail_url}
                alt={resource.title}
                className={cn(
                  "w-full h-full object-cover transition-opacity",
                  imageLoading ? "opacity-0" : "opacity-100"
                )}
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageError(true);
                  setImageLoading(false);
                }}
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              {getTypeIcon()}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="space-y-2">
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

          {/* Always show description */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {resource.description}
          </p>
          
          {/* Show how_resource_helps if available */}
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

        {/* Upvote Button on the right */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
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
      </div>
    </Card>
  );
};

export default ResourceListItem;
