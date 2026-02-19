"use client";

import { useState, useMemo } from "react";
import { ExternalLink, Star, Search } from "lucide-react";
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

const resourceTypes = [
  "all",
  "book",
  "app",
  "course",
  "service",
  "article",
  "product",
  "video",
];

export default function ResourceFilters({
  categories,
  resources,
}: {
  categories: Category[];
  resources: Resource[];
}) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach((c) => (map[c.id] = c.title));
    return map;
  }, [categories]);

  const filtered = useMemo(() => {
    return resources.filter((r) => {
      if (selectedCategory !== "all" && r.category_id !== selectedCategory)
        return false;
      if (selectedType !== "all" && r.type !== selectedType) return false;
      if (
        search &&
        !r.title.toLowerCase().includes(search.toLowerCase()) &&
        !r.description.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [resources, selectedCategory, selectedType, search]);

  return (
    <>
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search resources..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20"
        />
      </div>

      {/* Filters */}
      <div className="mt-4 flex flex-wrap gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              selectedCategory === "all"
                ? "bg-brand-purple text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All Areas
          </button>
          {categories.map((cat) => {
            const Icon = getIcon(cat.icon_name);
            return (
              <button
                key={cat.id}
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === cat.id ? "all" : cat.id
                  )
                }
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  selectedCategory === cat.id
                    ? "bg-brand-purple text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Icon className="h-3 w-3" />
                {cat.title}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2">
          {resourceTypes.map((type) => (
            <button
              key={type}
              onClick={() =>
                setSelectedType(selectedType === type ? "all" : type)
              }
              className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition ${
                selectedType === type
                  ? "bg-brand-purple text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {type === "all" ? "All Types" : type}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="mt-4 text-sm text-gray-400">
        {filtered.length} resource{filtered.length !== 1 && "s"}
        {selectedCategory !== "all" &&
          ` in ${categoryMap[selectedCategory]}`}
        {selectedType !== "all" && ` (${selectedType})`}
      </p>

      {/* Resource grid */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((r) => {
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

              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${typeBadgeColors[r.type] || typeBadgeColors.article}`}
                >
                  {r.type}
                </span>
                <span className="text-xs text-gray-400">
                  {categoryMap[r.category_id]}
                </span>
              </div>
            </a>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="mt-12 text-center text-gray-400">
          No resources match your filters. Try adjusting your search.
        </p>
      )}
    </>
  );
}
