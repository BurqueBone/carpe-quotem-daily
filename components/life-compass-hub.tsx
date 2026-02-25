"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Compass, ChevronRight, Navigation } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import LifespanVisualizer from "@/components/lifespan-visualizer";

export default function LifeCompassHub() {
  const [profileBirthdate, setProfileBirthdate] = useState<string | null>(null);
  const [birthdateReady, setBirthdateReady] = useState(false);

  // Fetch birthdate from profile for logged-in users
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("profiles")
        .select("birthdate")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data?.birthdate) {
            setProfileBirthdate(data.birthdate);
            setBirthdateReady(true);
          }
        });
    });
  }, []);

  const handleBirthdateSet = useCallback(() => {
    setBirthdateReady(true);
  }, []);

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

        {/* Wheel of Life CTA - shows after birthdate is set */}
        {birthdateReady && (
          <Link
            href="/life-compass-calibration/wheel-of-life-assessment"
            className="group flex items-center gap-4 rounded-xl bg-brand-navy p-5 text-white shadow-md transition hover:bg-brand-navy/90 hover:shadow-lg"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10">
              <Compass className="h-6 w-6 text-brand-gold" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold">
                Take the Wheel of Life Assessment
              </h3>
              <p className="mt-0.5 text-sm text-white/70">
                Rate 8 life areas and discover where to focus your energy
              </p>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-white/50 transition group-hover:text-white" />
          </Link>
        )}

        {/* Lifespan Visualizer */}
        <LifespanVisualizer
          initialBirthdate={profileBirthdate}
          onBirthdateSet={handleBirthdateSet}
        />
      </div>
    </div>
  );
}
