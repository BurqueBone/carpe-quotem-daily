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

export default function CarpeDiemCategories({
  categories,
  resources,
}: {
  categories: Category[];
  resources: Resource[];
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
      {categories.map((cat) => {
        const Icon = getIcon(cat.icon_name);
        const isOpen = openCategories.has(cat.id);
        const catResources = resourcesByCategory[cat.id] || [];

        return (
          <div
            key={cat.id}
            className={`rounded-xl border transition-all ${
              isOpen
                ? "col-span-1 border-brand-navy/20 bg-white shadow-md sm:col-span-2"
                : "border-gray-100 bg-gradient-to-br from-white to-brand-off-white hover:border-brand-navy/20 hover:shadow-sm"
            }`}
          >
            <button
              onClick={() => toggleCategory(cat.id)}
              className="flex w-full items-center gap-4 p-5 text-left"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-navy/15 to-brand-gold/20">
                <Icon className="h-5 w-5 text-brand-navy" />
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
                <div className="mt-4 space-y-3">
                  {catResources.map((r) => {
                    const href = r.affiliate_url || r.url;
                    return (
                      <a
                        key={r.id}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block rounded-lg border border-gray-50 bg-brand-off-white/50 p-4 transition hover:border-brand-navy/20 hover:bg-white"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-gray-800 group-hover:text-brand-navy">
                                {r.title}
                              </h4>
                              {r.s4k_favorite && (
                                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                              )}
                              <ExternalLink className="h-3.5 w-3.5 text-gray-300 group-hover:text-brand-navy" />
                            </div>
                            <p className="mt-1 text-sm text-gray-500">
                              {r.description}
                            </p>
                            {r.how_resource_helps && (
                              <div className="mt-2 rounded-md bg-brand-navy/5 p-3 text-sm text-gray-600">
                                <span className="font-medium text-brand-navy">
                                  How this helps:
                                </span>{" "}
                                {r.how_resource_helps}
                              </div>
                            )}
                          </div>
                          <span
                            className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${typeBadgeColors[r.type] || typeBadgeColors.article}`}
                          >
                            {r.type}
                          </span>
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
