import CategoryCard from "@/components/CategoryCard";
import { carpeDiemCategories } from "@/data/carpeDiemResources";
import { Zap, ArrowRight } from "lucide-react";

const CarpeDiem = () => {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-gradient-warm flex items-center justify-center shadow-glow mx-auto">
          <Zap className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-warm bg-clip-text text-transparent">
          Carpe Diem
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Life is finite and precious. These resources will help you seize each day and grow across 
          every dimension of your human experience. Choose an area to focus on today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {carpeDiemCategories.map((category, index) => (
          <CategoryCard
            key={index}
            title={category.title}
            icon={<category.icon className="w-5 h-5" />}
            description={category.description}
            resources={category.resources}
          />
        ))}
      </div>

      <div className="bg-gradient-subtle rounded-xl p-8 border border-border/50 shadow-card text-center">
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-primary">
            <ArrowRight className="w-5 h-5" />
            <span className="font-semibold">Start Today</span>
          </div>
          <h3 className="text-xl font-semibold text-foreground">
            "The best time to plant a tree was 20 years ago. The second best time is now."
          </h3>
          <p className="text-muted-foreground">
            Pick one resource from any category above and take action today. 
            Small steps compound into extraordinary transformations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CarpeDiem;