import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LifespanVisualizer from "@/components/LifeCompass/LifespanVisualizer";
import NavigationCard from "@/components/LifeCompass/NavigationCard";
import { Target, Compass } from "lucide-react";

const LifeCompassCalibration = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-6xl flex-1">
        <div className="space-y-8">
          {/* Page Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-warm bg-clip-text text-transparent">
              Life Compass Calibration
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Navigate your finite time with clarity. Visualize your lifespan, prioritize what matters, 
              and assess your life balance.
            </p>
          </div>

          {/* Lifespan Visualizer - Interactive Feature */}
          <LifespanVisualizer />

          {/* Navigation Cards Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-center text-foreground">
              Choose Your Assessment Tool
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <NavigationCard
                title="Simple Priority Check-in"
                description="Identify what truly matters this week and where to strategically underachieve"
                icon={Target}
                href="/life-compass-calibration/simple-priority-check-in"
                gradient="from-[#9381ff] to-[#B8B8FF]"
              />
              <NavigationCard
                title="Wheel of Life Assessment"
                description="Assess your life balance across 12 key areas and design your ideal week"
                icon={Compass}
                href="/life-compass-calibration/wheel-of-life-assessment"
                gradient="from-[#FFD8BE] to-[#FFEEDD]"
              />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LifeCompassCalibration;
