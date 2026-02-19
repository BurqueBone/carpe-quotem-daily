import { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Star } from "lucide-react";
import { createStaticClient } from "@/lib/supabase/static";
import { getIcon } from "@/lib/icons";

export const metadata: Metadata = {
  title: "Carpe Diem — Curated Resources for Every Life Area",
  description:
    "Over 140 hand-picked tools, books, courses, and apps across 12 life areas to help you grow where it matters most.",
};

export const revalidate = 86400; // daily

interface Category {
  id: string;
  title: string;
  icon_name: string;
  description: string;
}

interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  type: string;
  s4k_favorite: boolean;
  has_affiliate: boolean;
  affiliate_url: string | null;
  how_resource_helps: string | null;
  category_id: string;
}

const typeBadgeColors: Record<string, string> = {
  book: "bg-amber-100 text-amber-700",
  app: "bg-blue-100 text-blue-700",
  course: "bg-green-100 text-green-700",
  service: "bg-purple-100 text-purple-700",
  article: "bg-gray-100 text-gray-700",
  product: "bg-pink-100 text-pink-700",
  video: "bg-red-100 text-red-700",
};

export default async function CarpeDiemPage() {
  const supabase = createStaticClient();

  const [{ data: categories }, { data: resources }] = await Promise.all([
    supabase.from("categories").select("*").order("title"),
    supabase
      .from("resources")
      .select("*")
      .eq("ispublished", true)
      .order("title"),
  ]);

  const resourcesByCategory = (resources || []).reduce(
    (acc: Record<string, Resource[]>, r: Resource) => {
      if (!acc[r.category_id]) acc[r.category_id] = [];
      acc[r.category_id].push(r);
      return acc;
    },
    {}
  );

  return (
    <div className="px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-gray-400">
            Curated Resources
          </p>
          <h1 className="mt-2 text-4xl font-bold text-gray-800 md:text-5xl">
            Carpe Diem
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
            Over 140 hand-picked tools, books, courses, and apps across 12 life
            areas to help you grow where it matters most.
          </p>
        </div>

        <div className="mt-16 space-y-16">
          {(categories || []).map((cat: Category) => {
            const Icon = getIcon(cat.icon_name);
            const catResources = resourcesByCategory[cat.id] || [];

            return (
              <section key={cat.id} id={cat.title.toLowerCase()}>
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-purple/10">
                    <Icon className="h-5 w-5 text-brand-purple" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {cat.title}
                    </h2>
                    <p className="text-sm text-gray-500">{cat.description}</p>
                  </div>
                  <span className="ml-auto rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
                    {catResources.length} resources
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {catResources.map((r: Resource) => {
                    const href = r.affiliate_url || r.url;
                    return (
                      <a
                        key={r.id}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-col rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-gray-800 group-hover:text-brand-purple">
                            {r.title}
                          </h3>
                          <div className="flex shrink-0 items-center gap-1">
                            {r.s4k_favorite && (
                              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            )}
                            <ExternalLink className="h-3.5 w-3.5 text-gray-300 group-hover:text-brand-purple" />
                          </div>
                        </div>

                        <p className="mb-3 line-clamp-2 flex-1 text-sm leading-relaxed text-gray-500">
                          {r.description}
                        </p>

                        <span
                          className={`self-start rounded-full px-2.5 py-0.5 text-xs font-medium ${typeBadgeColors[r.type] || typeBadgeColors.article}`}
                        >
                          {r.type}
                        </span>
                      </a>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        {/* Quick nav */}
        <nav className="sticky bottom-6 mt-16 flex justify-center">
          <div className="flex flex-wrap justify-center gap-2 rounded-xl border border-gray-200 bg-white/90 px-4 py-3 shadow-lg backdrop-blur-sm">
            {(categories || []).map((cat: Category) => {
              const Icon = getIcon(cat.icon_name);
              return (
                <Link
                  key={cat.id}
                  href={`#${cat.title.toLowerCase()}`}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-brand-purple/10 hover:text-brand-purple"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {cat.title}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
