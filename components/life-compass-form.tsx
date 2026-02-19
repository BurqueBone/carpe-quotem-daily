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
  question: string;
}

const lifeAreas: LifeArea[] = [
  {
    key: "physical",
    label: "Physical",
    icon: Dumbbell,
    question: "How satisfied are you with your physical health, energy, and fitness?",
  },
  {
    key: "emotional",
    label: "Emotional",
    icon: Heart,
    question: "How well are you managing stress, processing feelings, and practicing self-care?",
  },
  {
    key: "mental",
    label: "Mental",
    icon: Brain,
    question: "How sharp, focused, and clear-headed do you feel?",
  },
  {
    key: "spiritual",
    label: "Spiritual",
    icon: Sparkles,
    question: "How connected do you feel to your purpose, meaning, or something greater?",
  },
  {
    key: "career",
    label: "Career",
    icon: Briefcase,
    question: "How fulfilled and challenged are you in your professional life?",
  },
  {
    key: "financial",
    label: "Financial",
    icon: DollarSign,
    question: "How secure and in control do you feel about your finances?",
  },
  {
    key: "learning",
    label: "Learning",
    icon: BookOpen,
    question: "How actively are you growing, learning new skills, and expanding your mind?",
  },
  {
    key: "creative",
    label: "Creative",
    icon: Palette,
    question: "How much are you expressing yourself creatively and pursuing hobbies?",
  },
  {
    key: "family",
    label: "Family",
    icon: Users,
    question: "How strong and nurturing are your relationships with family?",
  },
  {
    key: "social",
    label: "Social",
    icon: MessageCircle,
    question: "How connected do you feel to friends and your social community?",
  },
  {
    key: "community",
    label: "Community",
    icon: Globe,
    question: "How much are you contributing to and engaged with your broader community?",
  },
  {
    key: "environment",
    label: "Environment",
    icon: Leaf,
    question: "How well do your living and working spaces support the life you want?",
  },
];

export default function LifeCompassForm() {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const allAnswered = Object.keys(scores).length === lifeAreas.length;
  const current = lifeAreas[currentIndex];

  function handleScore(value: number) {
    const updated = { ...scores, [current.key]: value };
    setScores(updated);

    if (currentIndex < lifeAreas.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setShowResults(true);
    }
  }

  function reset() {
    setScores({});
    setCurrentIndex(0);
    setShowResults(false);
  }

  if (showResults && allAnswered) {
    const sorted = [...lifeAreas].sort(
      (a, b) => (scores[a.key] || 0) - (scores[b.key] || 0)
    );
    const average =
      Object.values(scores).reduce((a, b) => a + b, 0) / lifeAreas.length;
    const lowest = sorted.slice(0, 3);
    const highest = sorted.slice(-3).reverse();

    return (
      <div>
        <div className="mb-8 text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-gray-400">
            Your Results
          </p>
          <p className="mt-2 text-4xl font-bold text-brand-purple">
            {average.toFixed(1)}
            <span className="text-lg font-normal text-gray-400"> / 10</span>
          </p>
          <p className="mt-1 text-sm text-gray-500">Overall life satisfaction</p>
        </div>

        {/* Wheel visualization (bar chart) */}
        <div className="mb-10 space-y-3">
          {lifeAreas.map((area) => {
            const score = scores[area.key] || 0;
            const Icon = area.icon;
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
              </div>
            );
          })}
        </div>

        {/* Focus areas */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-red-100 bg-red-50/50 p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-red-600">
              Areas to Focus On
            </h3>
            <ul className="space-y-2">
              {lowest.map((area) => {
                const Icon = area.icon;
                return (
                  <li key={area.key} className="flex items-center gap-2 text-sm text-gray-700">
                    <Icon className="h-4 w-4 text-red-400" />
                    <span className="font-medium">{area.label}</span>
                    <span className="ml-auto text-red-600 font-semibold">
                      {scores[area.key]}/10
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-xl border border-green-100 bg-green-50/50 p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-green-600">
              Your Strengths
            </h3>
            <ul className="space-y-2">
              {highest.map((area) => {
                const Icon = area.icon;
                return (
                  <li key={area.key} className="flex items-center gap-2 text-sm text-gray-700">
                    <Icon className="h-4 w-4 text-green-500" />
                    <span className="font-medium">{area.label}</span>
                    <span className="ml-auto text-green-600 font-semibold">
                      {scores[area.key]}/10
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <a
            href="/carpe-diem"
            className="rounded-lg bg-brand-purple px-8 py-3 text-sm font-semibold text-white transition hover:bg-brand-purple/90"
          >
            Explore Resources for Growth
          </a>
          <button
            onClick={reset}
            className="rounded-lg border border-gray-200 px-8 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            Retake Assessment
          </button>
        </div>
      </div>
    );
  }

  // Assessment form
  const progress = (Object.keys(scores).length / lifeAreas.length) * 100;
  const Icon = current.icon;

  return (
    <div>
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>
            {Object.keys(scores).length} of {lifeAreas.length}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="mt-1 h-2 rounded-full bg-gray-100">
          <div
            className="h-2 rounded-full bg-brand-purple transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Current question */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-purple/10">
          <Icon className="h-8 w-8 text-brand-purple" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">{current.label}</h2>
        <p className="mx-auto mt-2 max-w-md text-gray-500">
          {current.question}
        </p>
      </div>

      {/* Score buttons */}
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((value) => (
          <button
            key={value}
            onClick={() => handleScore(value)}
            className={`flex h-12 w-12 items-center justify-center rounded-xl text-sm font-semibold transition ${
              scores[current.key] === value
                ? "bg-brand-purple text-white shadow-md"
                : "bg-white text-gray-600 shadow-sm hover:bg-brand-purple/10 hover:text-brand-purple"
            }`}
          >
            {value}
          </button>
        ))}
      </div>
      <div className="mt-2 flex justify-between px-1 text-xs text-gray-400">
        <span>Not at all</span>
        <span>Completely</span>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <button
          onClick={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)}
          disabled={currentIndex === 0}
          className="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 transition hover:text-gray-800 disabled:opacity-30"
        >
          &larr; Back
        </button>

        {/* Category dots */}
        <div className="flex items-center gap-1">
          {lifeAreas.map((area, i) => (
            <button
              key={area.key}
              onClick={() => setCurrentIndex(i)}
              className={`h-2 w-2 rounded-full transition ${
                i === currentIndex
                  ? "bg-brand-purple"
                  : scores[area.key] !== undefined
                    ? "bg-brand-purple/40"
                    : "bg-gray-200"
              }`}
              aria-label={area.label}
            />
          ))}
        </div>

        <button
          onClick={() => {
            if (allAnswered) setShowResults(true);
            else if (currentIndex < lifeAreas.length - 1)
              setCurrentIndex(currentIndex + 1);
          }}
          className="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 transition hover:text-gray-800"
        >
          {allAnswered ? "See Results" : "Skip \u2192"}
        </button>
      </div>
    </div>
  );
}
