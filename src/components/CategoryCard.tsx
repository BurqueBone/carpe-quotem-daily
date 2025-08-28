import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface Resource {
  title: string;
  description: string;
  url: string;
  type: 'article' | 'book' | 'app' | 'course' | 'video';
}

interface CategoryCardProps {
  title: string;
  icon: React.ReactNode;
  description: string;
  resources: Resource[];
}

const CategoryCard = ({ title, icon, description, resources }: CategoryCardProps) => {
  const getTypeColor = (type: Resource['type']) => {
    const colors = {
      article: 'bg-blue-100 text-blue-800',
      book: 'bg-green-100 text-green-800', 
      app: 'bg-purple-100 text-purple-800',
      course: 'bg-orange-100 text-orange-800',
      video: 'bg-red-100 text-red-800'
    };
    return colors[type];
  };

  return (
    <Card className="p-6 bg-gradient-subtle shadow-card border-border/50 hover:shadow-warm transition-smooth h-full">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-warm flex items-center justify-center text-white shadow-glow">
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-lg text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        
        <div className="space-y-3">
          {resources.map((resource, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/30 hover:bg-background transition-smooth">
              <div className="flex-1">
                <h4 className="font-medium text-sm text-foreground">{resource.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{resource.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(resource.type)}`}>
                    {resource.type}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    asChild
                    className="h-6 px-2 text-xs hover:bg-primary/10"
                  >
                    <a href={resource.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" />
                      Visit
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default CategoryCard;