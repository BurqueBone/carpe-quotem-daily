import { Metadata } from "next";
import Link from "next/link";
import { Zap, ArrowRight } from "lucide-react";
import { createStaticClient } from "@/lib/supabase/static";
import CarpeDiemCategories from "@/components/carpe-diem-categories";

export const metadata: Metadata = {
  title: "Carpe Diem — Curated Resources for Every Life Area",
  description:
    "Over 140 hand-picked tools, books, courses, and apps across 12 life areas to help you grow where it matters most.",
};

export const revalidate = 86400;

export default async function CarpeDiemPage() {
  const supabase = createStaticClient();

  const [{ data: categories }, { data: resources }, { data: votes }] =
    await Promise.all([
      supabase.from("categories").select("*").order("title"),
      supabase
        .from("resources")
        .select(
          "id, title, description, url, type, s4k_favorite, has_affiliate, affiliate_url, category_id"
        )
        .eq("ispublished", true)
        .order("title"),
      supabase
        .from("resource_upvotes")
        .select("resource_id"),
    ]);

  // Count votes per resource
  const voteCounts: Record<string, number> = {};
  (votes || []).forEach((v: { resource_id: string }) => {
    voteCounts[v.resource_id] = (voteCounts[v.resource_id] || 0) + 1;
  });

  return (
    <div className="px-6 py-12">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-navy via-brand-navy to-brand-navy/80 px-6 py-6">
          <div className="absolute right-[10%] top-[10%] h-20 w-20 rounded-full bg-brand-gold/20 blur-3xl" />
          <div className="absolute bottom-[10%] left-[15%] h-16 w-16 rounded-full bg-brand-coral/15 blur-3xl" />
          <div className="relative flex flex-col items-center gap-3 text-center md:flex-row md:gap-5 md:text-left">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-gold/20">
              <Zap className="h-6 w-6 text-brand-gold" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white md:text-3xl">
                Carpe Diem
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-white/70">
                Curated tools, books, courses, and apps across 12 life areas.
                Choose an area to focus on today.
              </p>
              <p className="mt-1 text-xs italic text-white/40">
                Contains affiliate links where we earn commissions to keep these
                resources accessible
              </p>
            </div>
          </div>
        </div>

        {/* Category accordions */}
        <div className="mt-12">
          <CarpeDiemCategories
            categories={categories || []}
            resources={resources || []}
            voteCounts={voteCounts}
          />
        </div>

        {/* View All Resources */}
        <div className="mt-10 text-center">
          <Link
            href="/resource-collection"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-navy px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-navy/90"
          >
            View All Resources
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
