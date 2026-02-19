import { Metadata } from "next";
import { createStaticClient } from "@/lib/supabase/static";
import ResourceFilters from "@/components/resource-filters";

export const metadata: Metadata = {
  title: "Resource Collection",
  description:
    "Browse and filter 140+ curated self-improvement resources — books, apps, courses, and services across 12 life areas.",
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
    <div className="px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold text-gray-800">
          Resource Collection
        </h1>
        <p className="mt-3 text-lg text-gray-500">
          Browse and filter 140+ curated tools, books, courses, and apps to help
          you grow in every life area.
        </p>

        <div className="mt-10">
          <ResourceFilters
            categories={categories || []}
            resources={resources || []}
          />
        </div>
      </div>
    </div>
  );
}
