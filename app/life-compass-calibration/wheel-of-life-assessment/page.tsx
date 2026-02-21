import { Metadata } from "next";
import { Compass } from "lucide-react";
import LifeCompassWizard from "@/components/life-compass-wizard";

export const metadata: Metadata = {
  title: "Wheel of Life Assessment — Sunday4K",
  description:
    "Rate your satisfaction and importance across 8 life areas. Discover where your priorities and reality are misaligned, then find resources to close the gap.",
};

export default function WheelOfLifePage() {
  return (
    <div className="px-6 py-12">
      <div className="mx-auto max-w-4xl space-y-10">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-navy via-brand-navy to-brand-navy/80 px-6 py-6">
          <div className="absolute right-[10%] top-[10%] h-20 w-20 rounded-full bg-brand-gold/20 blur-3xl" />
          <div className="absolute bottom-[10%] left-[15%] h-16 w-16 rounded-full bg-brand-coral/15 blur-3xl" />
          <div className="relative flex flex-col items-center gap-3 text-center md:flex-row md:gap-5 md:text-left">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-gold/20">
              <Compass className="h-6 w-6 text-brand-gold" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white md:text-3xl">
                Wheel of Life Assessment
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-white/70">
                Rate your satisfaction and importance across 8 life areas.
                Discover where your priorities and reality are misaligned, then
                find resources to close the gap.
              </p>
            </div>
          </div>
        </div>

        <LifeCompassWizard />
      </div>
    </div>
  );
}
