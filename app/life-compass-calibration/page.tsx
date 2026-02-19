import { Metadata } from "next";
import Link from "next/link";
import { Target, Compass, ChevronRight, Navigation } from "lucide-react";
import LifespanVisualizer from "@/components/lifespan-visualizer";

export const metadata: Metadata = {
  title: "Life Compass Calibration — Sunday4K",
  description:
    "Navigate your finite time with clarity. Visualize your lifespan, prioritize what matters, and assess your life balance.",
};

export default function LifeCompassPage() {
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

        {/* Lifespan Visualizer */}
        <LifespanVisualizer />

        {/* Assessment Tool Cards */}
        <div>
          <h2 className="mb-4 text-center text-2xl font-bold text-gray-900">
            Choose Your Assessment Tool
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Link
              href="/life-compass-calibration/simple-priority-check-in"
              className="group flex items-center gap-4 rounded-xl border border-brand-gold/30 bg-gradient-to-br from-brand-gold/10 to-brand-orange/10 p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-gold/20">
                <Target className="h-6 w-6 text-brand-orange" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">
                  Simple Priority Check-in
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Identify what truly matters this week and where to
                  strategically underachieve
                </p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-gray-400 transition group-hover:text-brand-navy" />
            </Link>

            <Link
              href="/life-compass-calibration/wheel-of-life-assessment"
              className="group flex items-center gap-4 rounded-xl border border-brand-navy/20 bg-gradient-to-br from-brand-navy/5 to-brand-cream/20 p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-navy/10">
                <Compass className="h-6 w-6 text-brand-navy" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">
                  Wheel of Life Assessment
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Assess your life balance across 12 key areas and design your
                  ideal week
                </p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-gray-400 transition group-hover:text-brand-navy" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
