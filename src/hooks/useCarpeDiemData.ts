import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Dumbbell, Brain, Heart, Users, DollarSign, Briefcase, 
  BookOpen, Palette, MessageCircle, Sparkles, Leaf, Globe 
} from "lucide-react";

export interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  type: 'article' | 'book' | 'app' | 'course' | 'video';
}

export interface Category {
  id: string;
  title: string;
  icon: any;
  description: string;
  resources: Resource[];
}

const iconMap: Record<string, any> = {
  'Dumbbell': Dumbbell,
  'Brain': Brain,
  'Heart': Heart,
  'Users': Users,
  'DollarSign': DollarSign,
  'Briefcase': Briefcase,
  'BookOpen': BookOpen,
  'Palette': Palette,
  'MessageCircle': MessageCircle,
  'Sparkles': Sparkles,
  'Leaf': Leaf,
  'Globe': Globe,
};

interface DatabaseCategory {
  id: string;
  title: string;
  icon_name: string;
  description: string;
}

interface DatabaseResource {
  id: string;
  category_id: string;
  title: string;
  description: string;
  url: string;
  type: 'article' | 'book' | 'app' | 'course' | 'video';
}

export const useCarpeDiemData = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('title');

        if (categoriesError) {
          throw categoriesError;
        }

        // Fetch resources
        const { data: resourcesData, error: resourcesError } = await supabase
          .from('resources')
          .select('*')
          .order('title');

        if (resourcesError) {
          throw resourcesError;
        }

        // Group resources by category
        const resourcesByCategory = resourcesData?.reduce((acc, resource) => {
          const resourceData = resource as DatabaseResource;
          if (!acc[resourceData.category_id]) {
            acc[resourceData.category_id] = [];
          }
          acc[resourceData.category_id].push({
            id: resourceData.id,
            title: resourceData.title,
            description: resourceData.description,
            url: resourceData.url,
            type: resourceData.type as 'article' | 'book' | 'app' | 'course' | 'video',
          });
          return acc;
        }, {} as Record<string, Resource[]>) || {};

        // Combine categories with their resources
        const categoriesWithResources: Category[] = categoriesData?.map((category: DatabaseCategory) => ({
          id: category.id,
          title: category.title,
          icon: iconMap[category.icon_name] || Globe,
          description: category.description,
          resources: resourcesByCategory[category.id] || [],
        })) || [];

        setCategories(categoriesWithResources);
        setError(null);
      } catch (err) {
        console.error('Error fetching Carpe Diem data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { categories, loading, error };
};