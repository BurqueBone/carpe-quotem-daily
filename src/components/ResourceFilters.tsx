import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ResourceFiltersProps {
  categories: Array<{ id: string; title: string }>;
  selectedCategories: string[];
  selectedTypes: string[];
  sortBy: string;
  onCategoryChange: (categories: string[]) => void;
  onTypeChange: (types: string[]) => void;
  onSortChange: (sort: string) => void;
}

const RESOURCE_TYPES = [
  { value: "article", label: "Article" },
  { value: "book", label: "Book" },
  { value: "app", label: "App" },
  { value: "course", label: "Course" },
  { value: "video", label: "Video" },
];

const SORT_OPTIONS = [
  { value: "upvotes-desc", label: "Most Upvotes" },
  { value: "upvotes-asc", label: "Least Upvotes" },
  { value: "title-asc", label: "Title (A-Z)" },
  { value: "title-desc", label: "Title (Z-A)" },
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
];

const ResourceFilters = ({
  categories,
  selectedCategories,
  selectedTypes,
  sortBy,
  onCategoryChange,
  onTypeChange,
  onSortChange,
}: ResourceFiltersProps) => {
  const toggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      onCategoryChange(selectedCategories.filter(id => id !== categoryId));
    } else {
      onCategoryChange([...selectedCategories, categoryId]);
    }
  };

  const toggleType = (type: string) => {
    if (selectedTypes.includes(type)) {
      onTypeChange(selectedTypes.filter(t => t !== type));
    } else {
      onTypeChange([...selectedTypes, type]);
    }
  };

  const clearAllFilters = () => {
    onCategoryChange([]);
    onTypeChange([]);
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedTypes.length > 0;

  return (
    <div className="space-y-4 bg-card border rounded-lg p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filters & Sort</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Category Filter */}
        <div className="space-y-2">
          <Label>Category</Label>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const isSelected = selectedCategories.includes(category.id);
              return (
                <Badge
                  key={category.id}
                  variant={isSelected ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/90 transition-colors"
                  onClick={() => toggleCategory(category.id)}
                >
                  {category.title}
                  {isSelected && (
                    <X className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Type Filter */}
        <div className="space-y-2">
          <Label>Type</Label>
          <div className="flex flex-wrap gap-2">
            {RESOURCE_TYPES.map((type) => {
              const isSelected = selectedTypes.includes(type.value);
              return (
                <Badge
                  key={type.value}
                  variant={isSelected ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/90 transition-colors capitalize"
                  onClick={() => toggleType(type.value)}
                >
                  {type.label}
                  {isSelected && (
                    <X className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Sort By */}
        <div className="space-y-2">
          <Label>Sort By</Label>
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default ResourceFilters;
