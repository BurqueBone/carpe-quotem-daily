"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Compass, ChevronRight, Navigation, RotateCcw, BarChart3 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import LifespanVisualizer from "@/components/lifespan-visualizer";
import { lifeAreas, RadarChart } from "@/lib/life-areas";

interface PreviousAssessment {
  satisfaction_scores: Record<string, number>;
  importance_scores: Record<string, number>;
  focus_areas: string[];
  created_at: string;
}

export default function LifeCompassHub() {
  const [profileBirthdate, setProfileBirthdate] = useState<string | null>(null);
  const [birthdateReady, setBirthdateReady] = useState(false);
  const [previousAssessment, setPreviousAssessment] =
    useState<PreviousAssessment | null>(null);
  const [assessmentLoaded, setAssessmentLoaded] = useState(false);

  // Fetch birthdate and previous assessment for logged-in users
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        setAssessmentLoaded(true);
        return;
      }

      // Fetch birthdate and assessment in parallel
      Promise.all([
        supabase
          .from("profiles")
          .select("birthdate")
          .eq("id", user.id)
          .single(),
        supabase
          .from("life_assessments")
          .select(
            "satisfaction_scores, importance_scores, focus_areas, created_at"
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single(),
      ]).then(([profileResult, assessmentResult]) => {
        if (profileResult.data?.birthdate) {
          setProfileBirthdate(profileResult.data.birthdate);
          setBirthdateReady(true);
        }
        if (assessmentResult.data) {
          setPreviousAssessment(assessmentResult.data as PreviousAssessment);
        }
        setAssessmentLoaded(true);
      });
    });
  }, []);

  const handleBirthdateSet = useCallback(() => {
    setBirthdateReady(true);
  }, []);

  // Compute overall score from previous assessment
  const overallScore = previousAssessment
    ? (() => {
        const scores = Object.values(previousAssessment.satisfaction_scores);
        return scores.length > 0
          ? scores.reduce((a, b) => a + b, 0) / scores.length
          : 0;
      })()
    : 0;

  // Map focus area keys to labels
  const focusAreaLabels = previousAssessment?.focus_areas
    ?.map((key) => lifeAreas.find((a) => a.key === key)?.label)
    .filter(Boolean) as string[] | undefined;

  return (
    <div className="px-6 py-12">
      <div className="mx-auto max-w-5xl space-y-10">
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
                Life Compass Calibration
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-white/70">
                Navigate your finite time with clarity. Visualize your lifespan,
                prioritize what matters, and assess your life balance.
              </p>
            </div>
          </div>
        </div>

        {/* Assessment Summary Card (returning user) OR First-time CTA */}
        {assessmentLoaded && previousAssessment ? (
          <div className="rounded-xl border bg-white shadow-sm">
            <div className="flex flex-col items-center gap-6 p-6 md:flex-row md:items-start">
              {/* Compact Radar Chart */}
              <div className="w-[200px] shrink-0">
                <RadarChart
                  scores={previousAssessment.satisfaction_scores}
                  size={200}
                />
              </div>

              {/* Score + details */}
              <div className="flex flex-1 flex-col items-center text-center md:items-start md:text-left">
                <p className="text-4xl font-bold text-brand-navy">
                  {overallScore.toFixed(1)}
                  <span className="text-base font-normal text-gray-400">
                    {" "}
                    / 10
                  </span>
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Overall life satisfaction
                </p>
                <p className="mt-2 text-xs text-gray-400">
                  Last taken{" "}
                  {new Date(previousAssessment.created_at).toLocaleDateString(
                    "en-US",
                    { month: "short", day: "numeric", year: "numeric" }
                  )}
                </p>

                {/* Focus area pills */}
                {focusAreaLabels && focusAreaLabels.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {focusAreaLabels.map((label) => (
                      <span
                        key={label}
                        className="rounded-full bg-brand-navy/10 px-3 py-1 text-xs font-medium text-brand-navy"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                )}

                {/* Retake button */}
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <Link
                    href="/life-compass-calibration/wheel-of-life-assessment"
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-coral to-brand-orange px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:shadow-lg hover:brightness-105"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Retake Assessment
                  </Link>
                  <Link
                    href="/life-compass-calibration/results"
                    className="inline-flex items-center gap-2 rounded-full border border-brand-navy px-6 py-2.5 text-sm font-semibold text-brand-navy transition hover:bg-brand-navy/5"
                  >
                    <BarChart3 className="h-4 w-4" />
                    View Full Results
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          birthdateReady && (
            <Link
              href="/life-compass-calibration/wheel-of-life-assessment"
              className="group flex items-center gap-4 rounded-xl bg-gradient-to-r from-brand-coral to-brand-orange p-5 shadow-md transition hover:shadow-lg hover:brightness-105"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20">
                <Compass className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white">
                  Take the Wheel of Life Assessment
                </h3>
                <p className="mt-0.5 text-sm text-white/80">
                  Rate 8 life areas and discover where to focus your energy
                </p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-white/60 transition group-hover:text-white" />
            </Link>
          )
        )}

        {/* Lifespan Visualizer */}
        <LifespanVisualizer
          initialBirthdate={profileBirthdate}
          onBirthdateSet={handleBirthdateSet}
        />
      </div>
    </div>
  );
}
