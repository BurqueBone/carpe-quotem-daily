import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthContext";
import { useResourceCollection } from "@/hooks/useResourceCollection";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TodaysResourceCard from "@/components/TodaysResourceCard";
import ResourceListItem from "@/components/ResourceListItem";
import ResourceFilters from "@/components/ResourceFilters";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
const ResourceCollection = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const {
    resources,
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
    refetch,
  } = useResourceCollection();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Skeleton className="h-64 w-full" />
        </main>
        <Footer />
      </div>
    );
  }
  if (!user) {
    return null;
  }
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden w-full">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Page Header */}
        <div className="space-y-2">
          <p className="text-lg text-muted-foreground">
            Discover and upvote resources to help you live life to the fullest
          </p>
          <p className="text-sm text-muted-foreground">
            **Contains affiliate links where we earn commissions to keep these resources accessible**
          </p>
        </div>

        {/* Today's Resource */}
        {todaysResource && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <TodaysResourceCard resource={todaysResource} />
          </div>
        )}

        {/* Filters */}
        <div id="resources-list" className="scroll-mt-8">
          <ResourceFilters
            categories={categories}
            selectedCategories={selectedCategories}
            selectedTypes={selectedTypes}
            sortBy={sortBy}
            showOnlyUpvoted={showOnlyUpvoted}
            onCategoryChange={setSelectedCategories}
            onTypeChange={setSelectedTypes}
            onSortChange={setSortBy}
            onShowOnlyUpvotedChange={setShowOnlyUpvoted}
          />
        </div>

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={refetch}>
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        )}

        {/* Resources List */}
        {!loading && !error && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">All Resources</h2>
            </div>

            {resources.length === 0 ? (
              <Alert>
                <AlertDescription>
                  No resources found matching your filters. Try adjusting your selection.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-3">
                {resources.map((resource) => (
                  <ResourceListItem key={resource.id} resource={resource} onUpvoteToggle={toggleUpvote} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
export default ResourceCollection;
