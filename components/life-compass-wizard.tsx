"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Check,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { lifeAreas, AREA_COUNT, RadarChart } from "@/lib/life-areas";
import AssessmentResults from "@/components/assessment-results";
const AREAS_PER_PAGE = 1;
const TOTAL_PAGES = AREA_COUNT / AREAS_PER_PAGE; // 8

interface PreviousAssessment {
  satisfaction_scores: Record<string, number>;
  importance_scores: Record<string, number>;
  focus_areas: string[];
  created_at: string;
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
        <AssessmentResults
          satisfactionScores={
            Object.fromEntries(
              lifeAreas.map((a) => [a.key, satisfactionScores[a.key] ?? 5])
            )
          }
          importanceScores={
            Object.fromEntries(
              lifeAreas.map((a) => [a.key, importanceScores[a.key] ?? 5])
            )
          }
          focusAreas={Array.from(focusAreas)}
          previousAssessment={previousAssessment}
          showSaveButton={!!userId && !saved}
          onSave={saveAssessment}
          saving={saving}
          saved={saved}
          onRetake={resetAssessment}
        />
      )}
    </div>
  );
}
