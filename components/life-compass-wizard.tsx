"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Briefcase,
  Globe,
  Palette,
  Heart,
  Users,
  DollarSign,
  Brain,
  Dumbbell,
  Save,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Check,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/* ------------------------------------------------------------------ */
/*  Types & Data                                                       */
/* ------------------------------------------------------------------ */

interface LifeArea {
  key: string;
  label: string;
  icon: LucideIcon;
  resourceCategoryTitles: string[];
}

const lifeAreas: LifeArea[] = [
  {
    key: "physical",
    label: "Physical",
    icon: Dumbbell,
    resourceCategoryTitles: ["Physical"],
  },
  {
    key: "mind_growth",
    label: "Mind & Growth",
    icon: Brain,
    resourceCategoryTitles: ["Mental", "Learning"],
  },
  {
    key: "emotional",
    label: "Emotional",
    icon: Heart,
    resourceCategoryTitles: ["Emotional"],
  },
  {
    key: "relationships",
    label: "Relationships",
    icon: Users,
    resourceCategoryTitles: ["Family", "Social"],
  },
  {
    key: "financial",
    label: "Financial",
    icon: DollarSign,
    resourceCategoryTitles: ["Financial"],
  },
  {
    key: "career",
    label: "Career",
    icon: Briefcase,
    resourceCategoryTitles: ["Career"],
  },
  {
    key: "creative_spiritual",
    label: "Creative & Spiritual",
    icon: Palette,
    resourceCategoryTitles: ["Creative", "Spiritual"],
  },
  {
    key: "community_environment",
    label: "Community & Environment",
    icon: Globe,
    resourceCategoryTitles: ["Community", "Environment"],
  },
];

const AREA_COUNT = lifeAreas.length; // 8
const AREAS_PER_PAGE = 1;
const TOTAL_PAGES = AREA_COUNT / AREAS_PER_PAGE; // 8

interface PreviousAssessment {
  satisfaction_scores: Record<string, number>;
  importance_scores: Record<string, number>;
  focus_areas: string[];
  created_at: string;
}

/* ------------------------------------------------------------------ */
/*  Radar Chart                                                        */
/* ------------------------------------------------------------------ */

function RadarChart({
  scores,
  previousScores,
}: {
  scores: Record<string, number | null>;
  previousScores?: Record<string, number> | null;
}) {
  const size = 300;
  const center = size / 2;
  const maxRadius = center - 40;

  function getPoints(vals: Record<string, number | null>) {
    return lifeAreas.map((area, i) => {
      const angle = (Math.PI * 2 * i) / AREA_COUNT - Math.PI / 2;
      const value = vals[area.key] ?? 0;
      const r = (value / 10) * maxRadius;
      return {
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
        labelX: center + (maxRadius + 25) * Math.cos(angle),
        labelY: center + (maxRadius + 25) * Math.sin(angle),
        label: area.label,
      };
    });
  }

  const points = getPoints(scores);
  const prevPoints = previousScores ? getPoints(previousScores) : null;

  const pathData =
    points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") +
    " Z";
  const prevPathData = prevPoints
    ? prevPoints
        .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
        .join(" ") + " Z"
    : null;

  const circles = [2, 4, 6, 8, 10].map((val) => (val / 10) * maxRadius);

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="mx-auto w-full max-w-[260px]"
    >
      {/* Grid circles */}
      {circles.map((r, i) => (
        <circle
          key={i}
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={0.5}
        />
      ))}

      {/* Axis lines */}
      {lifeAreas.map((_, i) => {
        const angle = (Math.PI * 2 * i) / AREA_COUNT - Math.PI / 2;
        const x2 = center + maxRadius * Math.cos(angle);
        const y2 = center + maxRadius * Math.sin(angle);
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={x2}
            y2={y2}
            stroke="#e5e7eb"
            strokeWidth={0.5}
          />
        );
      })}

      {/* Previous assessment area (if available) */}
      {prevPathData && (
        <path
          d={prevPathData}
          fill="rgba(8, 61, 119, 0.06)"
          stroke="#083D77"
          strokeWidth={1}
          strokeDasharray="4 3"
        />
      )}

      {/* Current data area */}
      <path
        d={pathData}
        fill="rgba(8, 61, 119, 0.15)"
        stroke="#083D77"
        strokeWidth={2}
      />

      {/* Current data points */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} fill="#083D77" />
      ))}

      {/* Labels */}
      {points.map((p, i) => (
        <text
          key={i}
          x={p.labelX}
          y={p.labelY}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-gray-500 text-[8px]"
        >
          {p.label}
        </text>
      ))}
    </svg>
  );
}

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

const quadrants: Quadrant[] = [
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

function getQuadrant(satisfaction: number, importance: number): string {
  const highImp = importance > 5;
  const highSat = satisfaction > 5;
  if (highImp && !highSat) return "act_now";
  if (highImp && highSat) return "maintain";
  if (!highImp && !highSat) return "consider";
  return "rebalance";
}

function PriorityMatrix({
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
/*  Tappable Score Input                                               */
/* ------------------------------------------------------------------ */

function TappableScore({
  value,
  onChange,
  label,
  anchors,
  selectedColor,
}: {
  value: number | null;
  onChange: (v: number) => void;
  label: string;
  anchors: [string, string, string];
  selectedColor: string;
}) {
  return (
    <div>
      <span className="text-xs font-medium text-gray-500">{label}</span>
      <div className="mt-1.5 flex gap-[3px]">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
          const isSelected = value === n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className={`flex h-9 flex-1 items-center justify-center rounded-lg text-xs font-semibold transition-all ${
                isSelected
                  ? `${selectedColor} text-white shadow-sm`
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200 active:bg-gray-300"
              }`}
            >
              {n}
            </button>
          );
        })}
      </div>
      <div className="mt-1 flex justify-between px-1 text-[9px] text-gray-400">
        <span>{anchors[0]}</span>
        <span>{anchors[1]}</span>
        <span>{anchors[2]}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function LifeCompassWizard() {
  const [step, setStep] = useState(1);
  const [assessmentPage, setAssessmentPage] = useState(0); // 0-3 within step 1
  const [satisfactionScores, setSatisfactionScores] = useState<
    Record<string, number | null>
  >(Object.fromEntries(lifeAreas.map((a) => [a.key, null])));
  const [importanceScores, setImportanceScores] = useState<
    Record<string, number | null>
  >(Object.fromEntries(lifeAreas.map((a) => [a.key, null])));
  const [focusAreas, setFocusAreas] = useState<Set<string>>(new Set());

  // Auth & persistence state
  const [userId, setUserId] = useState<string | null>(null);
  const [previousAssessment, setPreviousAssessment] =
    useState<PreviousAssessment | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Check auth and load previous assessment
  useEffect(() => {
    const supabase = createClient();

    async function loadUserData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data } = await supabase
        .from("life_assessments")
        .select(
          "satisfaction_scores, importance_scores, focus_areas, created_at"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setPreviousAssessment(data as PreviousAssessment);
      }
    }

    loadUserData();
  }, []);

  // Score setters
  function handleSatisfaction(key: string, value: number) {
    setSatisfactionScores((prev) => ({ ...prev, [key]: value }));
  }

  function handleImportance(key: string, value: number) {
    setImportanceScores((prev) => ({ ...prev, [key]: value }));
  }

  function toggleFocusArea(key: string) {
    setFocusAreas((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  // Current page areas (2 at a time)
  const pageStart = assessmentPage * AREAS_PER_PAGE;
  const currentPageAreas = lifeAreas.slice(
    pageStart,
    pageStart + AREAS_PER_PAGE
  );

  // Check if current page is complete (both areas have both scores)
  const currentPageComplete = currentPageAreas.every(
    (a) =>
      satisfactionScores[a.key] !== null && importanceScores[a.key] !== null
  );

  // Validation: all scores must be set before proceeding to step 2
  const allScoresSet = lifeAreas.every(
    (a) =>
      satisfactionScores[a.key] !== null && importanceScores[a.key] !== null
  );
  const scoresSetCount = lifeAreas.filter(
    (a) =>
      satisfactionScores[a.key] !== null && importanceScores[a.key] !== null
  ).length;

  // Gap-based sorting for focus area suggestions
  const gapSorted = [...lifeAreas]
    .map((area) => ({
      ...area,
      gap:
        (importanceScores[area.key] ?? 5) -
        (satisfactionScores[area.key] ?? 5),
      satisfaction: satisfactionScores[area.key] ?? 5,
      importance: importanceScores[area.key] ?? 5,
    }))
    .sort((a, b) => b.gap - a.gap);

  const suggestedFocus = gapSorted.filter((a) => a.gap > 0).slice(0, 4);
  const displayedSuggestions =
    suggestedFocus.length >= 2 ? suggestedFocus : gapSorted.slice(0, 4);

  // Average satisfaction
  const setScores = lifeAreas
    .map((a) => satisfactionScores[a.key])
    .filter((v): v is number => v !== null);
  const average =
    setScores.length > 0
      ? setScores.reduce((a, b) => a + b, 0) / setScores.length
      : 0;

  // Save assessment
  const saveAssessment = useCallback(async () => {
    if (!userId) return;
    setSaving(true);
    const supabase = createClient();

    const satScores: Record<string, number> = {};
    const impScores: Record<string, number> = {};
    lifeAreas.forEach((a) => {
      satScores[a.key] = satisfactionScores[a.key] ?? 5;
      impScores[a.key] = importanceScores[a.key] ?? 5;
    });

    const { error } = await supabase.from("life_assessments").insert({
      user_id: userId,
      satisfaction_scores: satScores,
      importance_scores: impScores,
      focus_areas: Array.from(focusAreas),
    });

    setSaving(false);
    if (!error) {
      setSaved(true);
      setPreviousAssessment({
        satisfaction_scores: satScores,
        importance_scores: impScores,
        focus_areas: Array.from(focusAreas),
        created_at: new Date().toISOString(),
      });
    }
  }, [userId, satisfactionScores, importanceScores, focusAreas]);

  // Reset
  function resetAssessment() {
    setStep(1);
    setAssessmentPage(0);
    setSatisfactionScores(
      Object.fromEntries(lifeAreas.map((a) => [a.key, null]))
    );
    setImportanceScores(
      Object.fromEntries(lifeAreas.map((a) => [a.key, null]))
    );
    setFocusAreas(new Set());
    setSaved(false);
  }

  // Navigate assessment pages
  function nextPage() {
    if (assessmentPage < TOTAL_PAGES - 1) {
      setAssessmentPage((p) => p + 1);
    } else {
      // All pages done, go to step 2
      setStep(2);
    }
  }

  function prevPage() {
    if (assessmentPage > 0) {
      setAssessmentPage((p) => p - 1);
    }
  }

  return (
    <div>
      {/* Step indicator */}
      <div className="mb-10 flex items-center justify-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <button
              onClick={() => {
                if (s === 1) {
                  setStep(1);
                } else if (s >= 2 && allScoresSet) {
                  setStep(s);
                }
              }}
              disabled={s > 1 && !allScoresSet}
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition ${
                step === s
                  ? "bg-brand-navy text-white"
                  : step > s
                    ? "bg-brand-navy/20 text-brand-navy"
                    : "bg-gray-100 text-gray-400"
              } ${s > 1 && !allScoresSet ? "cursor-not-allowed" : ""}`}
            >
              {step > s ? <Check className="h-4 w-4" /> : s}
            </button>
            {s < 3 && (
              <div
                className={`h-0.5 w-10 ${step > s ? "bg-brand-navy/30" : "bg-gray-200"}`}
              />
            )}
          </div>
        ))}
      </div>

      {/* ============================================================ */}
      {/*  Step 1: Dual-Axis Assessment (2 areas at a time)             */}
      {/* ============================================================ */}
      {step === 1 && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6 md:p-8">
          <h2 className="text-center text-2xl font-bold text-gray-800">
            The Wheel of Life Assessment
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-center text-sm text-gray-500">
            For each life area, rate both how <strong>satisfied</strong> you are
            today and how <strong>important</strong> it is to you.
          </p>

          {/* Sub-page progress dots */}
          <div className="mt-5 flex items-center justify-center gap-3">
            {Array.from({ length: TOTAL_PAGES }, (_, i) => {
              const pageAreas = lifeAreas.slice(
                i * AREAS_PER_PAGE,
                i * AREAS_PER_PAGE + AREAS_PER_PAGE
              );
              const pageComplete = pageAreas.every(
                (a) =>
                  satisfactionScores[a.key] !== null &&
                  importanceScores[a.key] !== null
              );
              return (
                <button
                  key={i}
                  onClick={() => setAssessmentPage(i)}
                  className={`flex h-2.5 w-8 rounded-full transition-all ${
                    i === assessmentPage
                      ? "bg-brand-navy"
                      : pageComplete
                        ? "bg-brand-navy/30"
                        : "bg-gray-200"
                  }`}
                />
              );
            })}
          </div>
          <p className="mt-2 text-center text-xs text-gray-400">
            {scoresSetCount} of {AREA_COUNT} areas rated
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-[auto_1fr]">
            {/* Radar chart (left on desktop, top on mobile) */}
            <div className="flex items-start justify-center md:sticky md:top-4">
              <RadarChart
                scores={satisfactionScores}
                previousScores={previousAssessment?.satisfaction_scores}
              />
            </div>

            {/* Current 2 areas */}
            <div className="space-y-6">
              {currentPageAreas.map((area) => {
                const Icon = area.icon;
                const satSet = satisfactionScores[area.key] !== null;
                const impSet = importanceScores[area.key] !== null;
                const bothSet = satSet && impSet;
                return (
                  <div
                    key={area.key}
                    className={`rounded-2xl border-2 p-5 shadow-md transition sm:p-6 ${
                      bothSet
                        ? "border-brand-navy/30 bg-brand-navy/[0.02] shadow-brand-navy/10"
                        : "border-brand-navy/15 bg-white"
                    }`}
                  >
                    <div className="mb-4 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-navy/10">
                        <Icon className="h-4 w-4 text-brand-navy" />
                      </div>
                      <span className="text-base font-semibold text-gray-800">
                        {area.label}
                      </span>
                      {bothSet && (
                        <Check className="ml-auto h-5 w-5 text-green-500" />
                      )}
                    </div>
                    <div className="space-y-4">
                      <TappableScore
                        value={satisfactionScores[area.key]}
                        onChange={(v) => handleSatisfaction(area.key, v)}
                        label="How satisfied are you?"
                        anchors={["Struggling", "Okay", "Thriving"]}
                        selectedColor="bg-brand-navy"
                      />
                      <TappableScore
                        value={importanceScores[area.key]}
                        onChange={(v) => handleImportance(area.key, v)}
                        label="How important is this to you?"
                        anchors={["Not important", "Somewhat", "Essential"]}
                        selectedColor="bg-brand-orange"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {previousAssessment && assessmentPage === 0 && (
            <div className="mt-6 rounded-lg bg-brand-off-white p-3 text-center">
              <p className="text-xs text-gray-500">
                Dashed outline on chart = your previous assessment from{" "}
                {new Date(previousAssessment.created_at).toLocaleDateString(
                  "en-US",
                  { month: "long", day: "numeric", year: "numeric" }
                )}
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={prevPage}
              disabled={assessmentPage === 0}
              className={`inline-flex items-center gap-1 text-sm font-medium transition ${
                assessmentPage === 0
                  ? "cursor-not-allowed text-gray-300"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </button>
            <span className="text-xs text-gray-400">
              {assessmentPage + 1} / {TOTAL_PAGES}
            </span>
            <button
              onClick={nextPage}
              disabled={!currentPageComplete}
              className={`inline-flex items-center gap-1 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition ${
                currentPageComplete
                  ? "bg-brand-navy hover:bg-brand-navy/90"
                  : "cursor-not-allowed bg-gray-300"
              }`}
            >
              {assessmentPage < TOTAL_PAGES - 1 ? "Next" : "Choose Priorities"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/*  Step 2: Focus Areas for Growth                               */}
      {/* ============================================================ */}
      {step === 2 && (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-center text-2xl font-bold text-gray-800">
            Focus Areas for Growth
          </h2>
          <p className="mt-2 text-center text-gray-500">
            These areas have the biggest gap between how important they are to
            you and how satisfied you feel. Select which ones you&apos;d like to
            prioritize.
          </p>

          <div className="mt-8 space-y-3">
            {displayedSuggestions.map((area) => {
              const Icon = area.icon;
              const selected = focusAreas.has(area.key);
              return (
                <button
                  key={area.key}
                  onClick={() => toggleFocusArea(area.key)}
                  className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
                    selected
                      ? "border-brand-navy bg-brand-navy/5"
                      : "border-gray-100 bg-white hover:border-gray-200"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${selected ? "text-brand-navy" : "text-gray-400"}`}
                  />
                  <div className="flex-1">
                    <span className="font-semibold text-gray-800">
                      {area.label}
                    </span>
                    <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-sm text-gray-400">
                      <span>Satisfaction: {area.satisfaction}/10</span>
                      <span>Importance: {area.importance}/10</span>
                      <span className="font-medium text-brand-coral">
                        Gap: {area.gap > 0 ? "+" : ""}
                        {area.gap}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
                      selected
                        ? "border-brand-navy bg-brand-navy"
                        : "border-gray-300"
                    }`}
                  >
                    {selected && <Check className="h-3.5 w-3.5 text-white" />}
                  </div>
                </button>
              );
            })}

            {/* Show remaining areas if user wants to pick others */}
            {gapSorted.filter(
              (a) => !displayedSuggestions.some((s) => s.key === a.key)
            ).length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-600">
                  Show all areas
                </summary>
                <div className="mt-2 space-y-3">
                  {gapSorted
                    .filter(
                      (a) =>
                        !displayedSuggestions.some((s) => s.key === a.key)
                    )
                    .map((area) => {
                      const Icon = area.icon;
                      const selected = focusAreas.has(area.key);
                      return (
                        <button
                          key={area.key}
                          onClick={() => toggleFocusArea(area.key)}
                          className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
                            selected
                              ? "border-brand-navy bg-brand-navy/5"
                              : "border-gray-100 bg-white hover:border-gray-200"
                          }`}
                        >
                          <Icon
                            className={`h-5 w-5 ${selected ? "text-brand-navy" : "text-gray-400"}`}
                          />
                          <div className="flex-1">
                            <span className="font-semibold text-gray-800">
                              {area.label}
                            </span>
                            <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-sm text-gray-400">
                              <span>
                                Satisfaction: {area.satisfaction}/10
                              </span>
                              <span>Importance: {area.importance}/10</span>
                              <span
                                className={`font-medium ${area.gap > 0 ? "text-brand-coral" : "text-green-600"}`}
                              >
                                Gap: {area.gap > 0 ? "+" : ""}
                                {area.gap}
                              </span>
                            </div>
                          </div>
                          <div
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
                              selected
                                ? "border-brand-navy bg-brand-navy"
                                : "border-gray-300"
                            }`}
                          >
                            {selected && (
                              <Check className="h-3.5 w-3.5 text-white" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                </div>
              </details>
            )}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-1 rounded-full bg-brand-navy px-8 py-3 text-sm font-semibold text-white transition hover:bg-brand-navy/90"
            >
              View Results
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/*  Step 3: Results                                              */}
      {/* ============================================================ */}
      {step === 3 && (
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
                const isFocus = focusAreas.has(area.key);
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

          {/* Focus areas with resource links */}
          {focusAreas.size > 0 && (
            <div className="mt-8 rounded-xl border border-brand-navy/10 bg-brand-navy/5 p-5">
              <h3 className="font-semibold text-gray-800">
                Your Priority Focus Areas
              </h3>
              <div className="mt-3 space-y-2">
                {Array.from(focusAreas).map((key) => {
                  const area = lifeAreas.find((a) => a.key === key);
                  if (!area) return null;
                  const Icon = area.icon;
                  return (
                    <div
                      key={key}
                      className="flex items-center gap-3 rounded-lg bg-white p-3"
                    >
                      <Icon className="h-5 w-5 text-brand-navy" />
                      <div className="flex-1">
                        <span className="font-medium text-gray-800">
                          {area.label}
                        </span>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {area.resourceCategoryTitles.map((cat) => (
                            <Link
                              key={cat}
                              href="/carpe-diem"
                              className="inline-flex items-center gap-1 rounded-full bg-brand-navy/10 px-2.5 py-0.5 text-[11px] font-medium text-brand-navy transition hover:bg-brand-navy/20"
                            >
                              {cat} resources
                              <ArrowRight className="h-3 w-3" />
                            </Link>
                          ))}
                        </div>
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
            {userId && !saved && (
              <button
                onClick={saveAssessment}
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
            <button
              onClick={resetAssessment}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-8 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              <RotateCcw className="h-4 w-4" />
              Retake Assessment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
