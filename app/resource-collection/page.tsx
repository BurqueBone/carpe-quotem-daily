import { Metadata } from "next";
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

  const [{ data: categories }, { data: resources }] = await Promise.all([
    supabase.from("categories").select("id, title, icon_name").order("title"),
    supabase
      .from("resources")
      .select(
        "id, title, description, url, type, s4k_favorite, has_affiliate, affiliate_url, how_resource_helps, category_id"
      )
      .eq("ispublished", true)
      .order("title"),
  ]);

  return (
    <div className="px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold text-brand-purple/60 md:text-3xl">
          Resource Collection
        </h1>
        <p className="mt-2 text-gray-500">
          Discover and upvote resources to help you live life to the fullest
        </p>
        <p className="mt-1 text-sm italic text-gray-400">
          **Contains affiliate links where we earn commissions to keep these
          resources accessible**
        </p>

        <div className="mt-8">
          <ResourceList
            categories={categories || []}
            resources={resources || []}
          />
        </div>
      </div>
    </div>
  );
}
