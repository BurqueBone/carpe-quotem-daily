import { Metadata } from "next";
import LifeCompassHub from "@/components/life-compass-hub";

export const metadata: Metadata = {
  title: "Life Compass Calibration — Sunday4K",
  description:
    "Navigate your finite time with clarity. Visualize your lifespan, prioritize what matters, and assess your life balance.",
};

export default function LifeCompassPage() {
  return <LifeCompassHub />;
}
