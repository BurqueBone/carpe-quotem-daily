"use client";

import { useState } from "react";
import Link from "next/link";
import { RotateCcw, CheckCircle2, Zap } from "lucide-react";

const WAKING_HOURS_PER_WEEK = 112;

const placeholders = [
  "e.g., Deepening connections with my children",
  "e.g., Building physical vitality through movement",
  "e.g., Creating meaningful work that serves others",
];

function getStrategicGap(pct: number) {
  if (pct <= 25) {
    return {
      title: "Critical Misalignment",
      message: `Only ${pct}% of your time aligns with your legacy priorities. To make room, what's one area you can strategically underachieve at this week?`,
      color: "border-brand-coral bg-brand-coral/5 text-brand-coral",
    };
  }
  if (pct <= 39) {
    return {
      title: "Significant Gap",
      message: `${pct}% alignment with your priorities. What's one area you can strategically underachieve at this week to increase this?`,
      color: "border-brand-orange bg-brand-orange/5 text-brand-orange",
    };
  }
  if (pct <= 59) {
    return {
      title: "Moderate Alignment",
      message: `${pct}% of your time goes to what matters. Could you push this higher by underachieving in one low-value area?`,
      color: "border-brand-gold bg-brand-gold/5 text-amber-700",
    };
  }
  if (pct <= 79) {
    return {
      title: "Good Alignment",
      message: `${pct}% aligned with your priorities. Consider: Is there still one area where strategic underachievement would help?`,
      color: "border-brand-navy bg-brand-navy/5 text-brand-navy",
    };
  }
  return {
    title: "Excellent Alignment",
    message: `${pct}% of your time aligns with your legacy! You're living intentionally.`,
    color: "border-green-500 bg-green-50 text-green-700",
  };
}

export default function PriorityCheckIn() {
  const [texts, setTexts] = useState(["", "", ""]);
  const [hours, setHours] = useState([0, 0, 0]);
  const [submitted, setSubmitted] = useState(false);

  const totalHours = hours[0] + hours[1] + hours[2];
  const pct = Math.round((totalHours / WAKING_HOURS_PER_WEEK) * 100);
  const gap = getStrategicGap(pct);

  const allComplete =
    texts.every((t) => t.trim() !== "") &&
    hours.every((h) => h > 0);

  function updateText(i: number, v: string) {
    setTexts((prev) => prev.map((t, idx) => (idx === i ? v : t)));
  }

  function updateHours(i: number, v: string) {
    const n = Math.min(112, Math.max(0, parseInt(v) || 0));
    setHours((prev) => prev.map((h, idx) => (idx === i ? n : h)));
  }

  function reset() {
    setTexts(["", "", ""]);
    setHours([0, 0, 0]);
    setSubmitted(false);
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">
          Your Priority Check-in Summary
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          A snapshot of what matters most this week and your commitment to living
          intentionally
        </p>

        {/* Priority list */}
        <ul className="mt-6 space-y-3">
          {texts.map((t, i) => (
            <li key={i} className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-2">
                <span className="font-bold text-brand-navy">{i + 1}.</span>
                <span className="text-gray-800">{t}</span>
              </div>
              <span className="shrink-0 text-sm font-semibold text-brand-navy">
                {hours[i]} hrs/week
              </span>
            </li>
          ))}
        </ul>

        {/* Percentage */}
        <div className="mt-6 rounded-lg bg-brand-off-white p-5 text-center">
          <div className="text-4xl font-bold text-brand-navy">{pct}%</div>
          <div className="mt-1 text-sm text-gray-500">
            of your waking week aligned with priorities
          </div>
          <div className="mt-1 text-xs text-gray-400">
            {totalHours} ÷ {WAKING_HOURS_PER_WEEK} waking hours/week
          </div>
        </div>

        {/* Strategic gap message */}
        <div className={`mt-5 rounded-lg border-l-4 p-4 ${gap.color}`}>
          <h3 className="font-semibold">{gap.title}</h3>
          <p className="mt-1 text-sm text-gray-600">{gap.message}</p>
        </div>

        {/* Quote + CTA */}
        <div className="mt-6 rounded-lg bg-brand-off-white p-6 text-center">
          <p className="italic text-gray-500">
            &ldquo;The question is not whether you will die, but how you will
            live.&rdquo;
          </p>
          <Link
            href="/carpe-diem"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-navy px-8 py-3 text-sm font-semibold text-white transition hover:bg-brand-navy/90"
          >
            <Zap className="h-4 w-4" />
            Explore Carpe Diem Resources
          </Link>
        </div>

        {/* Reset */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <RotateCcw className="h-4 w-4" />
            Start Over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900">
        Your Top 3 Priorities This Week
      </h2>
      <p className="mt-1 text-sm text-gray-500">
        What are the three most important things you want to focus on to create a
        life worth celebrating?
      </p>

      <div className="mt-6 space-y-5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex flex-col gap-3 md:flex-row md:items-start md:gap-5"
          >
            <div className="flex-1 space-y-1.5">
              <label
                htmlFor={`priority-${i}`}
                className="text-sm font-medium text-gray-700"
              >
                Priority {i + 1}
              </label>
              <textarea
                id={`priority-${i}`}
                rows={2}
                placeholder={placeholders[i]}
                value={texts[i]}
                onChange={(e) => updateText(i, e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
              />
            </div>
            <div className="w-full space-y-1.5 md:w-28">
              <label
                htmlFor={`hours-${i}`}
                className="text-sm font-medium text-gray-700"
              >
                Hours/Week
              </label>
              <input
                id={`hours-${i}`}
                type="number"
                min="0"
                max="112"
                value={hours[i] || ""}
                onChange={(e) => updateHours(i, e.target.value)}
                placeholder="0"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-center text-sm text-gray-700 focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <button
          onClick={() => allComplete && setSubmitted(true)}
          disabled={!allComplete}
          className="inline-flex items-center gap-2 rounded-full bg-brand-navy px-8 py-3 text-sm font-semibold text-white transition hover:bg-brand-navy/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <CheckCircle2 className="h-4 w-4" />
          View My Summary
        </button>
      </div>
    </div>
  );
}
