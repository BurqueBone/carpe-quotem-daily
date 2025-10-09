import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthContext";
import { toast } from "@/hooks/use-toast";

interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  type: string;
  category_id: string;
  category_name?: string;
  affiliate_url?: string;
  has_affiliate: boolean;
  how_resource_helps?: string;
  thumbnail_url?: string;
  created_at: string;
  upvote_count: number;
  user_has_upvoted: boolean;
}

export const useResourceCollection = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [todaysResource, setTodaysResource] = useState<Resource | null>(null);
  const [categories, setCategories] = useState<Array<{ id: string; title: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("upvotes-desc");
  const [showOnlyUpvoted, setShowOnlyUpvoted] = useState(false);

  // Fetch categories
  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("id, title")
      .order("title");

    if (error) {
      console.error("Error fetching categories:", error);
      return;
    }

    setCategories(data || []);
  };

  // Fetch today's resource
  const fetchTodaysResource = async () => {
    const { data, error } = await supabase.rpc("get_scheduled_resource");

    if (error) {
      console.error("Error fetching today's resource:", error);
      return;
    }

    if (data && data.length > 0) {
      const resource = data[0];
      
      // Get upvote count and user status
      const { data: upvoteData } = await supabase
        .rpc("get_resources_with_upvotes", { user_id_param: user?.id || null });

      const resourceWithUpvotes = upvoteData?.find((r: any) => r.id === resource.id);
      
      // Get category name
      const { data: categoryData } = await supabase
        .from("categories")
        .select("title")
        .eq("id", resource.category_id)
        .single();

      setTodaysResource({
        ...resource,
        category_name: categoryData?.title,
        upvote_count: resourceWithUpvotes?.upvote_count || 0,
        user_has_upvoted: resourceWithUpvotes?.user_has_upvoted || false,
        created_at: new Date().toISOString(),
      });
    }
  };

  // Fetch all resources with upvotes
  const fetchResources = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc("get_resources_with_upvotes", {
        user_id_param: user?.id || null,
      });

      if (error) throw error;

      // Fetch category names
      const categoryIds = [...new Set(data?.map((r: any) => r.category_id))];
      const { data: categoryData } = await supabase
        .from("categories")
        .select("id, title")
        .in("id", categoryIds);

      const categoryMap = new Map(
        categoryData?.map((c) => [c.id, c.title]) || []
      );

      const resourcesWithCategories = data?.map((resource: any) => ({
        ...resource,
        category_name: categoryMap.get(resource.category_id),
      })) || [];

      setResources(resourcesWithCategories);
      setFilteredResources(resourcesWithCategories);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error loading resources",
        description: "Failed to fetch resources. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Toggle upvote
  const toggleUpvote = async (resourceId: string, currentlyUpvoted: boolean) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to upvote resources.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (currentlyUpvoted) {
        // Remove upvote
        const { error } = await supabase
          .from("resource_upvotes")
          .delete()
          .eq("user_id", user.id)
          .eq("resource_id", resourceId);

        if (error) throw error;
      } else {
        // Add upvote
        const { error } = await supabase
          .from("resource_upvotes")
          .insert({ user_id: user.id, resource_id: resourceId });

        if (error) throw error;
      }

      // Optimistically update UI
      setResources((prev) =>
        prev.map((r) =>
          r.id === resourceId
            ? {
                ...r,
                upvote_count: currentlyUpvoted ? r.upvote_count - 1 : r.upvote_count + 1,
                user_has_upvoted: !currentlyUpvoted,
              }
            : r
        )
      );

      setFilteredResources((prev) =>
        prev.map((r) =>
          r.id === resourceId
            ? {
                ...r,
                upvote_count: currentlyUpvoted ? r.upvote_count - 1 : r.upvote_count + 1,
                user_has_upvoted: !currentlyUpvoted,
              }
            : r
        )
      );

      // Update today's resource if it matches
      if (todaysResource?.id === resourceId) {
        setTodaysResource({
          ...todaysResource,
          upvote_count: currentlyUpvoted 
            ? todaysResource.upvote_count - 1 
            : todaysResource.upvote_count + 1,
          user_has_upvoted: !currentlyUpvoted,
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to update upvote. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...resources];

    // Filter by upvoted status
    if (showOnlyUpvoted) {
      filtered = filtered.filter((r) => r.user_has_upvoted);
    }

    // Filter by categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((r) => selectedCategories.includes(r.category_id));
    }

    // Filter by types
    if (selectedTypes.length > 0) {
      filtered = filtered.filter((r) => selectedTypes.includes(r.type));
    }

    // Sort
    switch (sortBy) {
      case "upvotes-desc":
        filtered.sort((a, b) => b.upvote_count - a.upvote_count);
        break;
      case "upvotes-asc":
        filtered.sort((a, b) => a.upvote_count - b.upvote_count);
        break;
      case "title-asc":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "title-desc":
        filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "newest":
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
    }

    setFilteredResources(filtered);
  }, [resources, selectedCategories, selectedTypes, sortBy, showOnlyUpvoted]);

  // Initial data fetch
  useEffect(() => {
    fetchCategories();
    fetchTodaysResource();
    fetchResources();
  }, [user]);

  return {
    resources: filteredResources,
    todaysResource,
    categories,
    loading,
    error,
    toggleUpvote,
    selectedCategories,
    setSelectedCategories,
    selectedTypes,
    setSelectedTypes,
    sortBy,
    setSortBy,
    showOnlyUpvoted,
    setShowOnlyUpvoted,
    refetch: fetchResources,
  };
};
