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
    <div className="px-6 py-16">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-brand-purple/10">
            <Zap className="h-10 w-10 text-brand-purple" />
          </div>
          <h1 className="text-4xl font-bold text-brand-purple/60 md:text-5xl">
            Carpe Diem
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
            Life is finite and precious. These resources will help you seize
            each day and grow across every dimension of your human experience.
            Choose an area to focus on today.
          </p>
          <p className="mt-4 text-sm italic text-gray-400">
            **Contains affiliate links where we earn commissions to keep these
            resources accessible**
          </p>
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
