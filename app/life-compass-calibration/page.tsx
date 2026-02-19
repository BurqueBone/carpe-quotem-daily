import { Metadata } from "next";
import LifeCompassWizard from "@/components/life-compass-wizard";

export const metadata: Metadata = {
  title: "Life Compass Calibration — Wheel of Life Assessment",
  description:
    "Assess your current life balance across 12 key areas and design an ideal week that aligns with your true priorities. Discover insights that empower meaningful change.",
};

export default function LifeCompassPage() {
  return (
    <div className="px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-brand-purple/60 md:text-5xl">
            Wheel of Life Assessment
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
            Assess your current life balance across 12 key areas and design an
            ideal week that aligns with your true priorities. Discover insights
            that empower meaningful change.
          </p>
        </div>

        <LifeCompassWizard />
      </div>
    </div>
  );
}
