import { Metadata } from "next";
import { Library } from "lucide-react";
import { createStaticClient } from "@/lib/supabase/static";
import ResourceList from "@/components/resource-list";

export const metadata: Metadata = {
  title: "Resource Collection",
  description:
    "Discover and upvote resources to help you live life to the fullest. Browse 140+ curated self-improvement resources.",
};

export const revalidate = 86400;

export default async function ResourceCollectionPage() {
  const supabase = createStaticClient();

  const [{ data: categories }, { data: resources }, { data: voteCounts }] =
    await Promise.all([
      supabase.from("categories").select("id, title, icon_name").order("title"),
      supabase
        .from("resources")
        .select(
          "id, title, description, url, type, s4k_favorite, has_affiliate, affiliate_url, how_resource_helps, category_id"
        )
        .eq("ispublished", true),
      supabase.rpc("get_resource_vote_counts"),
    ]);

  // Merge vote counts into resources and sort by votes desc
  const voteMap: Record<string, number> = {};
  (voteCounts || []).forEach(
    (v: { resource_id: string; votes: number }) =>
      (voteMap[v.resource_id] = v.votes)
  );

  const resourcesWithVotes = (resources || [])
    .map((r) => ({ ...r, vote_count: voteMap[r.id] || 0 }))
    .sort((a, b) => b.vote_count - a.vote_count || a.title.localeCompare(b.title));

  // Rotate featured resource daily among s4k_favorites
  const favorites = resourcesWithVotes.filter((r) => r.s4k_favorite);
  const today = new Date();
  const dayIndex = Math.floor(today.getTime() / 86400000);
  const featuredIndex = favorites.length > 0 ? dayIndex % favorites.length : -1;
  const featuredId = featuredIndex >= 0 ? favorites[featuredIndex].id : null;

  return (
    <div className="px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-navy via-brand-navy to-brand-navy/80 px-6 py-6">
          <div className="absolute right-[10%] top-[10%] h-20 w-20 rounded-full bg-brand-gold/20 blur-3xl" />
          <div className="absolute bottom-[10%] left-[15%] h-16 w-16 rounded-full bg-brand-coral/15 blur-3xl" />
          <div className="relative flex flex-col items-center gap-3 text-center md:flex-row md:gap-5 md:text-left">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-gold/20">
              <Library className="h-6 w-6 text-brand-gold" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white md:text-3xl">
                Resource Collection
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-white/70">
                Discover and upvote resources to help you live life to the fullest
              </p>
              <p className="mt-1 text-xs italic text-white/40">
                Contains affiliate links where we earn commissions to keep these
                resources accessible
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <ResourceList
            categories={categories || []}
            resources={resourcesWithVotes}
            featuredId={featuredId}
          />
        </div>
      </div>
    </div>
  );
}
