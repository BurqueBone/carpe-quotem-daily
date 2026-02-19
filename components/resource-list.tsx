"use client";

import { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Sparkles,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { getIcon } from "@/lib/icons";

interface Category {
  id: string;
  title: string;
  icon_name: string;
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

export default function ResourceList({
  categories,
  resources,
}: {
  categories: Category[];
  resources: Resource[];
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [expandedResources, setExpandedResources] = useState<Set<string>>(
    new Set()
  );

  const categoryMap = useMemo(() => {
    const map: Record<string, Category> = {};
    categories.forEach((c) => (map[c.id] = c));
    return map;
  }, [categories]);

  const types = useMemo(() => {
    const set = new Set(resources.map((r) => r.type));
    return Array.from(set).sort();
  }, [resources]);

  const filtered = useMemo(() => {
    return resources.filter((r) => {
      if (selectedCategory && r.category_id !== selectedCategory) return false;
      if (selectedType && r.type !== selectedType) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [resources, selectedCategory, selectedType, searchQuery]);

  // Pick a "featured" resource (s4k_favorite)
  const featured = resources.find((r) => r.s4k_favorite);

  function toggleExpand(id: string) {
    setExpandedResources((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const hasActiveFilters = selectedCategory || selectedType || searchQuery;

  return (
    <div>
      {/* Featured Resource */}
      {featured && (
        <div className="mb-8 rounded-xl border border-brand-peach/30 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-brand-peach">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-semibold">
              Today&apos;s Featured Resource
            </span>
          </div>
          <h3 className="text-xl font-bold text-gray-800">{featured.title}</h3>
          <span className="mt-1 text-sm text-gray-500">
            {featured.description}
          </span>
          <div className="mt-2 flex flex-wrap gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${typeBadgeColors[featured.type] || typeBadgeColors.article}`}
            >
              {featured.type}
            </span>
            {categoryMap[featured.category_id] && (
              <span className="rounded-full border border-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                {categoryMap[featured.category_id].title}
              </span>
            )}
          </div>
          {featured.how_resource_helps && (
            <div className="mt-3 rounded-md bg-brand-purple/5 p-3 text-sm text-gray-600">
              <span className="font-medium text-brand-purple">
                How this helps:
              </span>{" "}
              {featured.how_resource_helps}
            </div>
          )}
          <a
            href={featured.affiliate_url || featured.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-brand-purple px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-purple/90"
          >
            Seize This Resource
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      )}

      {/* Filters toggle */}
      <div className="mb-6">
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="flex items-center gap-2 text-sm font-semibold text-gray-700"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters &amp; Sort
          <ChevronDown
            className={`h-4 w-4 transition-transform ${filtersOpen ? "rotate-180" : ""}`}
          />
        </button>

        {hasActiveFilters && (
          <button
            onClick={() => {
              setSelectedCategory(null);
              setSelectedType(null);
              setSearchQuery("");
            }}
            className="ml-4 text-xs text-gray-400 hover:text-brand-purple"
          >
            Clear All
          </button>
        )}

        {filtersOpen && (
          <div className="mt-4 space-y-4 rounded-lg border border-gray-100 bg-white p-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search resources..."
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:border-brand-purple focus:outline-none focus:ring-1 focus:ring-brand-purple"
            />

            <div>
              <p className="mb-2 text-xs font-medium uppercase text-gray-400">
                Category
              </p>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const Icon = getIcon(cat.icon_name);
                  const active = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() =>
                        setSelectedCategory(active ? null : cat.id)
                      }
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                        active
                          ? "bg-brand-purple text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-brand-purple/10"
                      }`}
                    >
                      <Icon className="h-3 w-3" />
                      {cat.title}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium uppercase text-gray-400">
                Type
              </p>
              <div className="flex flex-wrap gap-2">
                {types.map((t) => {
                  const active = selectedType === t;
                  return (
                    <button
                      key={t}
                      onClick={() => setSelectedType(active ? null : t)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition ${
                        active
                          ? "bg-brand-purple text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-brand-purple/10"
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Resource count */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">All Resources</h2>
        <span className="text-sm text-gray-400">
          {filtered.length} total resources
        </span>
      </div>

      {/* Resource list */}
      <div className="space-y-4">
        {filtered.map((r) => {
          const cat = categoryMap[r.category_id];
          const Icon = cat ? getIcon(cat.icon_name) : null;
          const isExpanded = expandedResources.has(r.id);
          const href = r.affiliate_url || r.url;

          return (
            <div
              key={r.id}
              className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                {Icon && (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-purple/10">
                    <Icon className="h-5 w-5 text-brand-purple" />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-gray-800 hover:text-brand-purple"
                    >
                      {r.title}
                    </a>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-brand-purple"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>

                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {cat && (
                      <span className="rounded-full border border-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                        {cat.title}
                      </span>
                    )}
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${typeBadgeColors[r.type] || typeBadgeColors.article}`}
                    >
                      {r.type}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-gray-500">{r.description}</p>

                  {r.how_resource_helps && (
                    <>
                      {isExpanded && (
                        <div className="mt-2 rounded-md bg-brand-purple/5 p-3 text-sm text-gray-600">
                          <span className="font-medium text-brand-purple">
                            How this helps:
                          </span>{" "}
                          {r.how_resource_helps}
                        </div>
                      )}
                      <button
                        onClick={() => toggleExpand(r.id)}
                        className="mt-2 text-xs font-medium text-brand-purple hover:underline"
                      >
                        {isExpanded ? "Show less" : "How this helps..."}
                      </button>
                    </>
                  )}
                </div>

                {/* Vote placeholder */}
                <div className="flex shrink-0 flex-col items-center gap-0.5">
                  <button className="text-gray-300 hover:text-brand-purple">
                    <ChevronUp className="h-5 w-5" />
                  </button>
                  <span className="text-sm font-semibold text-gray-400">
                    {r.s4k_favorite ? 1 : 0}
                  </span>
                  <span className="text-[10px] text-gray-400">votes</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
