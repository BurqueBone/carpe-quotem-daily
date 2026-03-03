"use client";

import { useState } from "react";
import Link from "next/link";
import { Navigation, RotateCcw, ArrowLeft } from "lucide-react";
import AssessmentResults from "@/components/assessment-results";

interface Assessment {
  id: string;
  satisfaction_scores: Record<string, number>;
  importance_scores: Record<string, number>;
  focus_areas: string[];
  created_at: string;
}

export default function AssessmentResultsPage({
  assessments,
}: {
  assessments: Assessment[];
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selected = assessments[selectedIndex];
  const previous = assessments[selectedIndex + 1] ?? null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-navy via-brand-navy to-brand-navy/80 px-6 py-6">
        <div className="absolute right-[10%] top-[10%] h-20 w-20 rounded-full bg-brand-gold/20 blur-3xl" />
        <div className="absolute bottom-[10%] left-[15%] h-16 w-16 rounded-full bg-brand-coral/15 blur-3xl" />
        <div className="relative flex flex-col items-center gap-3 text-center md:flex-row md:gap-5 md:text-left">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-gold/20">
            <Navigation className="h-6 w-6 text-brand-gold" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white md:text-3xl">
              Your Assessment Results
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-white/70">
              Review your Life Compass scores and track your progress over time.
            </p>
          </div>
        </div>
      </div>

      {/* History selector (only show when >1 assessment) */}
      {assessments.length > 1 && (
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="mb-3 text-xs font-medium text-gray-500">
            Assessment History ({assessments.length} total)
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {assessments.map((a, i) => {
              const date = new Date(a.created_at);
              const isSelected = i === selectedIndex;
              return (
                <button
                  key={a.id}
                  onClick={() => setSelectedIndex(i)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                    isSelected
                      ? "bg-brand-navy text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Results */}
      <AssessmentResults
        satisfactionScores={selected.satisfaction_scores}
        importanceScores={selected.importance_scores}
        focusAreas={selected.focus_areas}
        previousAssessment={
          previous
            ? {
                satisfaction_scores: previous.satisfaction_scores,
                created_at: previous.created_at,
              }
            : null
        }
      />

      {/* Navigation */}
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/life-compass-calibration"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Life Compass
        </Link>
        <Link
          href="/life-compass-calibration/wheel-of-life-assessment"
          className="inline-flex items-center gap-2 rounded-full border border-brand-navy px-6 py-2.5 text-sm font-semibold text-brand-navy transition hover:bg-brand-navy/5"
        >
          <RotateCcw className="h-4 w-4" />
          Take New Assessment
        </Link>
      </div>
    </div>
  );
}
