import { Metadata } from "next";
import LifeCompassForm from "@/components/life-compass-form";

export const metadata: Metadata = {
  title: "Life Compass Calibration",
  description:
    "Rate where you are across 12 life areas — health, career, relationships, creativity, and more. See your strengths and where to focus next.",
};

export default function LifeCompassPage() {
  return (
    <div className="px-6 py-16">
      <div className="mx-auto max-w-2xl">
        <div className="mb-12 text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-gray-400">
            Life Compass
          </p>
          <h1 className="mt-2 text-4xl font-bold text-gray-800 md:text-5xl">
            Calibrate Your Compass
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-lg text-gray-500">
            Rate where you are across 12 life areas. Takes about 2 minutes.
            See your strengths and where to focus your next week.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <LifeCompassForm />
        </div>
      </div>
    </div>
  );
}
