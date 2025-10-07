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
  affiliate_url?: string;
  has_affiliate: boolean;
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

export const useCarpeDiemData = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await (supabase as any)
          .from('categories')
          .select('*')
          .order('title');

        if (categoriesError) {
          throw categoriesError;
        }

        // Fetch published resources only
        const { data: resourcesData, error: resourcesError } = await (supabase as any)
          .from('resources')
          .select('*')
          .eq('ispublished', true)
          .order('title');

        if (resourcesError) {
          throw resourcesError;
        }

        // Group resources by category
        const resourcesByCategory = resourcesData.reduce((acc: Record<string, Resource[]>, resource: any) => {
          if (!acc[resource.category_id]) {
            acc[resource.category_id] = [];
          }
          acc[resource.category_id].push({
            id: resource.id,
            title: resource.title,
            description: resource.description,
            url: resource.url,
            type: resource.type as 'article' | 'book' | 'app' | 'course' | 'video',
            affiliate_url: resource.affiliate_url,
            has_affiliate: resource.has_affiliate,
          });
          return acc;
        }, {});

        // Combine categories with their resources
        const categoriesWithResources: Category[] = categoriesData.map((category: any) => ({
          id: category.id,
          title: category.title,
          icon: iconMap[category.icon_name] || Globe,
          description: category.description,
          resources: resourcesByCategory[category.id] || [],
        }));

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