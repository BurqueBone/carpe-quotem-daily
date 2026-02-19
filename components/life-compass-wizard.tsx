"use client";

import { useState } from "react";
import {
  Briefcase,
  Globe,
  Palette,
  Heart,
  Leaf,
  Users,
  DollarSign,
  BookOpen,
  Brain,
  Dumbbell,
  MessageCircle,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

interface LifeArea {
  key: string;
  label: string;
  icon: LucideIcon;
}

const lifeAreas: LifeArea[] = [
  { key: "physical", label: "Physical", icon: Dumbbell },
  { key: "mental", label: "Mental", icon: Brain },
  { key: "emotional", label: "Emotional", icon: Heart },
  { key: "family", label: "Family", icon: Users },
  { key: "financial", label: "Financial", icon: DollarSign },
  { key: "career", label: "Career", icon: Briefcase },
  { key: "learning", label: "Learning", icon: BookOpen },
  { key: "creative", label: "Creative", icon: Palette },
  { key: "social", label: "Social", icon: MessageCircle },
  { key: "spiritual", label: "Spiritual", icon: Sparkles },
  { key: "community", label: "Community", icon: Globe },
  { key: "environment", label: "Environment", icon: Leaf },
];

function RadarChart({ scores }: { scores: Record<string, number> }) {
  const size = 300;
  const center = size / 2;
  const maxRadius = center - 40;

  const points = lifeAreas.map((area, i) => {
    const angle = (Math.PI * 2 * i) / lifeAreas.length - Math.PI / 2;
    const value = scores[area.key] || 5;
    const r = (value / 10) * maxRadius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
      labelX: center + (maxRadius + 25) * Math.cos(angle),
      labelY: center + (maxRadius + 25) * Math.sin(angle),
      label: area.label,
    };
  });

  const pathData = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  // Grid circles
  const circles = [2, 4, 6, 8, 10].map((val) => (val / 10) * maxRadius);

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto w-full max-w-[280px]">
      {/* Grid */}
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
        const angle = (Math.PI * 2 * i) / lifeAreas.length - Math.PI / 2;
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

      {/* Data area */}
      <path d={pathData} fill="rgba(8, 61, 119, 0.15)" stroke="#083D77" strokeWidth={2} />

      {/* Data points */}
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
          className="fill-gray-500 text-[9px]"
        >
          {p.label}
        </text>
      ))}
    </svg>
  );
}

export default function LifeCompassWizard() {
  const [step, setStep] = useState(1);
  const [scores, setScores] = useState<Record<string, number>>(
    Object.fromEntries(lifeAreas.map((a) => [a.key, 5]))
  );
  const [focusAreas, setFocusAreas] = useState<Set<string>>(new Set());

  function handleSlider(key: string, value: number) {
    setScores((prev) => ({ ...prev, [key]: value }));
  }

  function toggleFocusArea(key: string) {
    setFocusAreas((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  // Compute lowest-scoring areas for step 2
  const sortedAreas = [...lifeAreas].sort(
    (a, b) => (scores[a.key] || 5) - (scores[b.key] || 5)
  );
  const suggestedFocus = sortedAreas.slice(0, 4);

  const average =
    Object.values(scores).reduce((a, b) => a + b, 0) / lifeAreas.length;

  return (
    <div>
      {/* Step indicator */}
      <div className="mb-10 flex items-center justify-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <button
              onClick={() => setStep(s)}
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition ${
                step === s
                  ? "bg-brand-navy text-white"
                  : step > s
                    ? "bg-brand-navy/20 text-brand-navy"
                    : "bg-gray-100 text-gray-400"
              }`}
            >
              {s}
            </button>
            {s < 3 && (
              <div
                className={`h-0.5 w-10 ${step > s ? "bg-brand-navy/30" : "bg-gray-200"}`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Wheel of Life Assessment */}
      {step === 1 && (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-center text-2xl font-bold text-gray-800">
            The Wheel of Life Assessment
          </h2>
          <p className="mt-2 text-center text-gray-500">
            Rate your current satisfaction with each area of your life on a
            scale of 1 to 10. Watch as your wheel takes shape!
          </p>

          <div className="mt-8 grid gap-8 md:grid-cols-2">
            {/* Radar chart */}
            <div className="flex items-center justify-center">
              <RadarChart scores={scores} />
            </div>

            {/* Sliders */}
            <div className="space-y-4">
              {lifeAreas.map((area) => {
                const Icon = area.icon;
                const value = scores[area.key] || 5;
                return (
                  <div key={area.key} className="flex items-center gap-3">
                    <Icon className="h-4 w-4 shrink-0 text-brand-navy" />
                    <span className="w-24 shrink-0 text-sm font-medium text-gray-700">
                      {area.label}
                    </span>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={value}
                      onChange={(e) =>
                        handleSlider(area.key, parseInt(e.target.value))
                      }
                      className="flex-1 accent-brand-navy"
                    />
                    <span className="w-6 text-right text-sm font-bold text-brand-navy">
                      {value}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 rounded-lg bg-brand-off-white p-4 text-center">
            <h3 className="font-semibold text-gray-800">
              Your Wheel Analysis
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Your Life Wheel shows some areas for growth. The gaps you see
              represent opportunities to create more balance and fulfillment.
            </p>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => setStep(2)}
              className="rounded-full bg-brand-navy px-8 py-3 text-sm font-semibold text-white transition hover:bg-brand-navy/90"
            >
              Choose Priority Areas &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Focus Areas for Growth */}
      {step === 2 && (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-center text-2xl font-bold text-gray-800">
            Focus Areas for Growth
          </h2>
          <p className="mt-2 text-center text-gray-500">
            Based on your ratings, these are the areas where you scored lowest.
            Select which ones you&apos;d like to prioritize improving in your
            ideal week.
          </p>

          <div className="mt-8 space-y-3">
            {suggestedFocus.map((area) => {
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
                  <div>
                    <span className="font-semibold text-gray-800">
                      {area.label}
                    </span>
                    <span className="ml-2 text-sm text-gray-400">
                      Current rating: {scores[area.key]}/10
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={() => setStep(1)}
              className="text-sm font-medium text-gray-500 hover:text-gray-800"
            >
              &larr; Back to Assessment
            </button>
            <button
              onClick={() => setStep(3)}
              className="rounded-full bg-brand-navy px-8 py-3 text-sm font-semibold text-white transition hover:bg-brand-navy/90"
            >
              View Results &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Results */}
      {step === 3 && (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-center text-2xl font-bold text-gray-800">
            Your Life Compass Results
          </h2>
          <p className="mt-2 text-center text-gray-500">
            Here&apos;s your personalized analysis and actionable insights
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

          {/* Radar chart */}
          <div className="mx-auto mt-6 max-w-xs">
            <h3 className="mb-2 text-center font-semibold text-gray-800">
              Your Current Wheel
            </h3>
            <RadarChart scores={scores} />
          </div>

          {/* Score breakdown */}
          <div className="mt-8 space-y-3">
            {[...lifeAreas]
              .sort(
                (a, b) => (scores[b.key] || 5) - (scores[a.key] || 5)
              )
              .map((area) => {
                const Icon = area.icon;
                const score = scores[area.key] || 5;
                const isFocus = focusAreas.has(area.key);
                return (
                  <div key={area.key} className="flex items-center gap-3">
                    <Icon className="h-4 w-4 shrink-0 text-gray-400" />
                    <span className="w-24 shrink-0 text-sm font-medium text-gray-600">
                      {area.label}
                    </span>
                    <div className="flex-1">
                      <div className="h-6 rounded-full bg-gray-100">
                        <div
                          className="flex h-6 items-center justify-end rounded-full px-2 text-xs font-semibold text-white transition-all duration-500"
                          style={{
                            width: `${score * 10}%`,
                            backgroundColor:
                              score <= 3
                                ? "#ef4444"
                                : score <= 6
                                  ? "#f59e0b"
                                  : "#22c55e",
                          }}
                        >
                          {score}
                        </div>
                      </div>
                    </div>
                    {isFocus && (
                      <span className="shrink-0 rounded-full bg-brand-navy/10 px-2 py-0.5 text-[10px] font-medium text-brand-navy">
                        Focus
                      </span>
                    )}
                  </div>
                );
              })}
          </div>

          {/* Focus areas summary */}
          {focusAreas.size > 0 && (
            <div className="mt-8 rounded-xl border border-brand-navy/10 bg-brand-navy/5 p-5">
              <h3 className="font-semibold text-gray-800">
                Your Priority Focus Areas
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {Array.from(focusAreas).map((key) => {
                  const area = lifeAreas.find((a) => a.key === key);
                  if (!area) return null;
                  const Icon = area.icon;
                  return (
                    <span
                      key={key}
                      className="inline-flex items-center gap-1.5 rounded-full bg-brand-navy px-3 py-1.5 text-xs font-medium text-white"
                    >
                      <Icon className="h-3 w-3" />
                      {area.label}
                    </span>
                  );
                })}
              </div>
              <p className="mt-3 text-sm text-gray-600">
                Focus your energy this week on these areas for maximum growth.
                Visit our{" "}
                <a
                  href="/carpe-diem"
                  className="font-medium text-brand-navy hover:underline"
                >
                  Carpe Diem resources
                </a>{" "}
                for tools and recommendations in each area.
              </p>
            </div>
          )}

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a
              href="/carpe-diem"
              className="rounded-full bg-brand-navy px-8 py-3 text-sm font-semibold text-white transition hover:bg-brand-navy/90"
            >
              Explore Resources for Growth
            </a>
            <button
              onClick={() => {
                setStep(1);
                setScores(
                  Object.fromEntries(lifeAreas.map((a) => [a.key, 5]))
                );
                setFocusAreas(new Set());
              }}
              className="rounded-full border border-gray-200 px-8 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              Retake Assessment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
