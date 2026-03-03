"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Save,
  RotateCcw,
  ArrowRight,
  Check,
  ExternalLink,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { lifeAreas, RadarChart } from "@/lib/life-areas";
import type { LifeArea } from "@/lib/life-areas";

/* ------------------------------------------------------------------ */
/*  Shared types & helpers                                             */
/* ------------------------------------------------------------------ */

export interface FocusResource {
  id: string;
  title: string;
  url: string;
  type: string;
  affiliate_url: string | null;
  category_id: string;
}

export const typeBadgeColors: Record<string, string> = {
  book: "bg-amber-100 text-amber-700",
  app: "bg-blue-100 text-blue-700",
  course: "bg-green-100 text-green-700",
  service: "bg-purple-100 text-purple-700",
  article: "bg-gray-100 text-gray-700",
  product: "bg-pink-100 text-pink-700",
  video: "bg-red-100 text-red-700",
};

/* ------------------------------------------------------------------ */
/*  Priority Matrix                                                    */
/* ------------------------------------------------------------------ */

interface Quadrant {
  key: string;
  title: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const quadrants: Quadrant[] = [
  {
    key: "act_now",
    title: "Act Now",
    color: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  {
    key: "maintain",
    title: "Maintain",
    color: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  {
    key: "consider",
    title: "Consider",
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
  },
  {
    key: "rebalance",
    title: "Rebalance?",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
];

export function getQuadrant(satisfaction: number, importance: number): string {
  const highImp = importance > 5;
  const highSat = satisfaction > 5;
  if (highImp && !highSat) return "act_now";
  if (highImp && highSat) return "maintain";
  if (!highImp && !highSat) return "consider";
  return "rebalance";
}

export function PriorityMatrix({
  satisfactionScores,
  importanceScores,
}: {
  satisfactionScores: Record<string, number | null>;
  importanceScores: Record<string, number | null>;
}) {
  const grouped: Record<string, LifeArea[]> = {
    act_now: [],
    maintain: [],
    consider: [],
    rebalance: [],
  };

  lifeAreas.forEach((area) => {
    const sat = satisfactionScores[area.key] ?? 5;
    const imp = importanceScores[area.key] ?? 5;
    const q = getQuadrant(sat, imp);
    grouped[q].push(area);
  });

  return (
    <div className="grid grid-cols-2 gap-3">
      {quadrants.map((q) => (
        <div
          key={q.key}
          className={`rounded-xl border p-4 ${q.bgColor} ${q.borderColor}`}
        >
          <h4 className={`text-sm font-semibold ${q.color}`}>{q.title}</h4>
          <p className="mb-2 text-[10px] text-gray-400">
            {q.key === "act_now" && "High importance, low satisfaction"}
            {q.key === "maintain" && "High importance, high satisfaction"}
            {q.key === "consider" && "Low importance, low satisfaction"}
            {q.key === "rebalance" && "Low importance, high satisfaction"}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {grouped[q.key].length === 0 && (
              <span className="text-xs italic text-gray-400">None</span>
            )}
            {grouped[q.key].map((area) => {
              const Icon = area.icon;
              return (
                <span
                  key={area.key}
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-medium ${q.borderColor} ${q.color}`}
                >
                  <Icon className="h-3 w-3" />
                  {area.label}
                </span>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  AssessmentResults component                                        */
/* ------------------------------------------------------------------ */

export interface AssessmentResultsProps {
  satisfactionScores: Record<string, number>;
  importanceScores: Record<string, number>;
  focusAreas: string[];
  previousAssessment?: {
    satisfaction_scores: Record<string, number>;
    created_at: string;
  } | null;
  showSaveButton?: boolean;
  onSave?: () => void;
  saving?: boolean;
  saved?: boolean;
  onRetake?: () => void;
}

export default function AssessmentResults({
  satisfactionScores,
  importanceScores,
  focusAreas,
  previousAssessment,
  showSaveButton = false,
  onSave,
  saving = false,
  saved = false,
  onRetake,
}: AssessmentResultsProps) {
  const [focusResources, setFocusResources] = useState<
    Record<string, FocusResource[]>
  >({});

  const focusAreasSet = new Set(focusAreas);

  // Average satisfaction
  const setScores = lifeAreas
    .map((a) => satisfactionScores[a.key])
    .filter((v): v is number => v != null);
  const average =
    setScores.length > 0
      ? setScores.reduce((a, b) => a + b, 0) / setScores.length
      : 0;

  // Fetch top resources for focus areas
  useEffect(() => {
    if (focusAreas.length === 0) return;

    const supabase = createClient();

    async function fetchResources() {
      const { data: cats } = await supabase
        .from("categories")
        .select("id, title");
      if (!cats) return;

      const titleToId: Record<string, string> = {};
      cats.forEach((c: { id: string; title: string }) => {
        titleToId[c.title] = c.id;
      });

      const selectedAreas = lifeAreas.filter((a) => focusAreas.includes(a.key));
      const allCategoryIds = new Set<string>();
      selectedAreas.forEach((area) => {
        area.resourceCategoryTitles.forEach((title) => {
          const id = titleToId[title];
          if (id) allCategoryIds.add(id);
        });
      });

      if (allCategoryIds.size === 0) return;

      const [{ data: resources }, { data: voteCounts }] = await Promise.all([
        supabase
          .from("resources")
          .select("id, title, url, type, affiliate_url, category_id")
          .eq("ispublished", true)
          .in("category_id", Array.from(allCategoryIds)),
        supabase.rpc("get_resource_vote_counts"),
      ]);

      const voteMap: Record<string, number> = {};
      (voteCounts || []).forEach(
        (v: { resource_id: string; votes: number }) => {
          voteMap[v.resource_id] = v.votes;
        }
      );

      const result: Record<string, FocusResource[]> = {};
      selectedAreas.forEach((area) => {
        const catIds = area.resourceCategoryTitles
          .map((t) => titleToId[t])
          .filter(Boolean);

        const areaResources = (resources || [])
          .filter((r) => catIds.includes(r.category_id))
          .sort((a, b) => (voteMap[b.id] || 0) - (voteMap[a.id] || 0))
          .slice(0, 4);

        result[area.key] = areaResources;
      });

      setFocusResources(result);
    }

    fetchResources();
  }, [focusAreas]);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
      <h2 className="text-center text-2xl font-bold text-gray-800">
        Your Life Compass Results
      </h2>
      <p className="mt-2 text-center text-gray-500">
        Here&apos;s your personalized analysis with actionable insights
      </p>

      {/* Overall score */}
      <div className="mt-6 text-center">
        <p className="text-5xl font-bold text-brand-navy">
          {average.toFixed(1)}
          <span className="text-lg font-normal text-gray-400"> / 10</span>
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Overall life satisfaction
        </p>
      </div>

      {/* Radar chart with previous comparison */}
      <div className="mx-auto mt-6 max-w-xs">
        <h3 className="mb-2 text-center font-semibold text-gray-800">
          Your Life Wheel
        </h3>
        <RadarChart
          scores={satisfactionScores}
          previousScores={previousAssessment?.satisfaction_scores}
        />
        {previousAssessment && (
          <p className="mt-1 text-center text-xs text-gray-400">
            Dashed line = previous assessment
          </p>
        )}
      </div>

      {/* Priority Matrix */}
      <div className="mt-8">
        <h3 className="mb-3 text-center font-semibold text-gray-800">
          Priority Matrix
        </h3>
        <p className="mb-4 text-center text-sm text-gray-500">
          Where each area falls based on satisfaction vs. importance
        </p>
        <PriorityMatrix
          satisfactionScores={satisfactionScores}
          importanceScores={importanceScores}
        />
      </div>

      {/* Score breakdown */}
      <div className="mt-8 space-y-3">
        <h3 className="font-semibold text-gray-800">Score Breakdown</h3>
        {[...lifeAreas]
          .sort(
            (a, b) =>
              (satisfactionScores[b.key] ?? 5) -
              (satisfactionScores[a.key] ?? 5)
          )
          .map((area) => {
            const Icon = area.icon;
            const sat = satisfactionScores[area.key] ?? 5;
            const imp = importanceScores[area.key] ?? 5;
            const isFocus = focusAreasSet.has(area.key);
            const prevSat =
              previousAssessment?.satisfaction_scores[area.key];
            const delta =
              prevSat !== undefined ? sat - prevSat : null;

            return (
              <div key={area.key} className="flex items-center gap-3">
                <Icon className="h-4 w-4 shrink-0 text-gray-400" />
                <span className="w-28 shrink-0 text-sm font-medium text-gray-600">
                  {area.label}
                </span>
                <div className="flex-1">
                  <div className="h-6 rounded-full bg-gray-100">
                    <div
                      className="flex h-6 items-center justify-end rounded-full px-2 text-xs font-semibold text-white transition-all duration-500"
                      style={{
                        width: `${sat * 10}%`,
                        backgroundColor:
                          sat <= 3
                            ? "#ef4444"
                            : sat <= 6
                              ? "#f59e0b"
                              : "#22c55e",
                      }}
                    >
                      {sat}
                    </div>
                  </div>
                </div>
                <span className="w-8 shrink-0 text-center text-[10px] text-gray-400">
                  imp:{imp}
                </span>
                {delta !== null && delta !== 0 && (
                  <span
                    className={`shrink-0 text-xs font-medium ${delta > 0 ? "text-green-600" : "text-red-500"}`}
                  >
                    {delta > 0 ? "+" : ""}
                    {delta}
                  </span>
                )}
                {isFocus && (
                  <span className="shrink-0 rounded-full bg-brand-navy/10 px-2 py-0.5 text-[10px] font-medium text-brand-navy">
                    Focus
                  </span>
                )}
              </div>
            );
          })}
      </div>

      {/* Focus areas with top resources */}
      {focusAreas.length > 0 && (
        <div className="mt-8 rounded-xl border border-brand-navy/10 bg-brand-navy/5 p-5">
          <h3 className="font-semibold text-gray-800">
            Your Priority Focus Areas
          </h3>
          <div className="mt-3 space-y-4">
            {focusAreas.map((key) => {
              const area = lifeAreas.find((a) => a.key === key);
              if (!area) return null;
              const Icon = area.icon;
              const resources = focusResources[key] || [];
              return (
                <div key={key} className="rounded-lg bg-white p-4">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-brand-navy" />
                    <span className="font-medium text-gray-800">
                      {area.label}
                    </span>
                  </div>
                  {resources.length > 0 ? (
                    <div className="mt-3 space-y-2">
                      {resources.map((r) => (
                        <a
                          key={r.id}
                          href={r.affiliate_url || r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded-md border border-gray-100 px-3 py-2 text-sm transition hover:border-brand-navy/20 hover:bg-brand-navy/[0.02]"
                        >
                          <span className="flex-1 font-medium text-gray-700">
                            {r.title}
                          </span>
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${typeBadgeColors[r.type] || "bg-gray-100 text-gray-700"}`}
                          >
                            {r.type}
                          </span>
                          <ExternalLink className="h-3 w-3 shrink-0 text-gray-300" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-3 flex gap-2">
                      {[1, 2, 3].map((n) => (
                        <div
                          key={n}
                          className="h-8 flex-1 animate-pulse rounded-md bg-gray-100"
                        />
                      ))}
                    </div>
                  )}
                  <div className="mt-3 flex flex-wrap gap-3">
                    {area.resourceCategoryTitles.map((cat) => (
                      <Link
                        key={cat}
                        href={`/resource-collection?category=${encodeURIComponent(cat)}`}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-navy transition hover:text-brand-navy/70"
                      >
                        See all {cat} resources
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/carpe-diem"
          className="inline-flex items-center gap-2 rounded-full bg-brand-navy px-8 py-3 text-sm font-semibold text-white transition hover:bg-brand-navy/90"
        >
          Explore Resources for Growth
          <ArrowRight className="h-4 w-4" />
        </Link>
        {showSaveButton && !saved && (
          <button
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full border border-brand-navy px-8 py-3 text-sm font-semibold text-brand-navy transition hover:bg-brand-navy/5"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Results"}
          </button>
        )}
        {saved && (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600">
            <Check className="h-4 w-4" />
            Saved
          </span>
        )}
        {onRetake && (
          <button
            onClick={onRetake}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-8 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            <RotateCcw className="h-4 w-4" />
            Retake Assessment
          </button>
        )}
      </div>
    </div>
  );
}
