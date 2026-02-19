"use client";

import { useState } from "react";
import { ChevronDown, ExternalLink, Star } from "lucide-react";
import { getIcon } from "@/lib/icons";

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
  category_id: string;
}

const categoryAccents = [
  { icon: "bg-brand-navy/15 text-brand-navy", border: "border-brand-navy/30", card: "bg-white border-brand-navy/15" },
  { icon: "bg-brand-gold/25 text-amber-700", border: "border-brand-gold/40", card: "bg-white border-brand-gold/20" },
  { icon: "bg-brand-coral/15 text-brand-coral", border: "border-brand-coral/30", card: "bg-white border-brand-coral/20" },
  { icon: "bg-brand-orange/20 text-brand-orange", border: "border-brand-orange/30", card: "bg-white border-brand-orange/20" },
  { icon: "bg-blue-100 text-blue-600", border: "border-blue-200", card: "bg-white border-blue-100" },
];

const typeBadgeColors: Record<string, string> = {
  book: "bg-amber-100 text-amber-700",
  app: "bg-blue-100 text-blue-700",
  course: "bg-green-100 text-green-700",
  service: "bg-purple-100 text-purple-700",
  article: "bg-gray-100 text-gray-700",
  product: "bg-pink-100 text-pink-700",
  video: "bg-red-100 text-red-700",
};

export default function CarpeDiemCategories({
  categories,
  resources,
  voteCounts,
}: {
  categories: Category[];
  resources: Resource[];
  voteCounts: Record<string, number>;
}) {
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());

  const resourcesByCategory = resources.reduce(
    (acc: Record<string, Resource[]>, r) => {
      if (!acc[r.category_id]) acc[r.category_id] = [];
      acc[r.category_id].push(r);
      return acc;
    },
    {}
  );

  function toggleCategory(id: string) {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {categories.map((cat, idx) => {
        const Icon = getIcon(cat.icon_name);
        const isOpen = openCategories.has(cat.id);
        const accent = categoryAccents[idx % categoryAccents.length];

        // Sort by votes (desc), then s4k_favorite, take top 4
        const catResources = (resourcesByCategory[cat.id] || [])
          .slice()
          .sort((a, b) => {
            const aVotes = voteCounts[a.id] || 0;
            const bVotes = voteCounts[b.id] || 0;
            if (bVotes !== aVotes) return bVotes - aVotes;
            if (a.s4k_favorite !== b.s4k_favorite) return a.s4k_favorite ? -1 : 1;
            return 0;
          })
          .slice(0, 4);

        return (
          <div
            key={cat.id}
            className={`rounded-xl border transition-all ${
              isOpen
                ? `col-span-1 ${accent.border} bg-white shadow-md sm:col-span-2`
                : `${accent.card} shadow-sm hover:shadow-md`
            }`}
          >
            <button
              onClick={() => toggleCategory(cat.id)}
              className="flex w-full items-center gap-4 p-5 text-left"
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${accent.icon}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{cat.title}</h3>
                <p className="text-sm text-gray-500">{cat.description}</p>
              </div>
              <ChevronDown
                className={`h-5 w-5 shrink-0 text-gray-400 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isOpen && catResources.length > 0 && (
              <div className="border-t border-gray-100 px-5 pb-5">
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {catResources.map((r) => {
                    const href = r.affiliate_url || r.url;
                    const votes = voteCounts[r.id] || 0;

                    return (
                      <a
                        key={r.id}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-col rounded-lg border border-gray-100 bg-brand-off-white/50 p-4 transition hover:border-brand-navy/20 hover:bg-white"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-semibold text-gray-800 group-hover:text-brand-navy">
                            {r.title}
                          </h4>
                          <ExternalLink className="h-3.5 w-3.5 shrink-0 text-gray-300 group-hover:text-brand-navy" />
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-500">
                          {r.description}
                        </p>
                        <div className="mt-auto flex items-center gap-2 pt-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${typeBadgeColors[r.type] || typeBadgeColors.article}`}
                          >
                            {r.type}
                          </span>
                          {r.s4k_favorite && (
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          )}
                          {votes > 0 && (
                            <span className="ml-auto text-[10px] font-medium text-gray-400">
                              {votes} {votes === 1 ? "vote" : "votes"}
                            </span>
                          )}
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
