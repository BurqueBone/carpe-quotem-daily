import { Metadata } from "next";
import LifeCompassWizard from "@/components/life-compass-wizard";

export const metadata: Metadata = {
  title: "Wheel of Life Assessment — Sunday4K",
  description:
    "Rate your satisfaction and importance across 8 life areas. Discover where your priorities and reality are misaligned, then find resources to close the gap.",
};

export default function WheelOfLifePage() {
  return (
    <div className="px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-brand-navy md:text-5xl">
            Wheel of Life Assessment
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
            Rate your satisfaction and importance across 8 life areas. Discover
            where your priorities and reality are misaligned, then find
            resources to close the gap.
          </p>
        </div>
        <LifeCompassWizard />
      </div>
    </div>
  );
}
