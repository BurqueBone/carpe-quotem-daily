import { Metadata } from "next";
import { Zap } from "lucide-react";
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

  const [{ data: categories }, { data: resources }] = await Promise.all([
    supabase.from("categories").select("*").order("title"),
    supabase
      .from("resources")
      .select(
        "id, title, description, url, type, s4k_favorite, has_affiliate, affiliate_url, how_resource_helps, category_id"
      )
      .eq("ispublished", true)
      .order("title"),
  ]);

  return (
    <div className="px-6 py-12">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-navy via-brand-navy to-brand-navy/80 px-8 py-12 text-center">
          <div className="absolute right-[10%] top-[10%] h-32 w-32 rounded-full bg-brand-gold/20 blur-3xl" />
          <div className="absolute bottom-[10%] left-[15%] h-24 w-24 rounded-full bg-brand-coral/15 blur-3xl" />
          <div className="relative">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-gold/20">
              <Zap className="h-8 w-8 text-brand-gold" />
            </div>
            <h1 className="text-4xl font-bold text-white md:text-5xl">
              Carpe Diem
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/70">
              Life is finite and precious. These resources will help you seize
              each day and grow across every dimension of your human experience.
              Choose an area to focus on today.
            </p>
            <p className="mt-4 text-sm italic text-white/40">
              Contains affiliate links where we earn commissions to keep these
              resources accessible
            </p>
          </div>
        </div>

        {/* Category accordions */}
        <div className="mt-12">
          <CarpeDiemCategories
            categories={categories || []}
            resources={resources || []}
          />
        </div>
      </div>
    </div>
  );
}
