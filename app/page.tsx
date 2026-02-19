import Link from "next/link";
import { Compass, CalendarDays, Lightbulb } from "lucide-react";
import DailyQuote from "@/components/daily-quote";

const steps = [
  {
    number: "01",
    icon: Compass,
    title: "Calibrate Your Compass",
    description:
      "Rate where you are across 12 life areas — health, career, relationships, creativity, and more. Takes 5 minutes.",
  },
  {
    number: "02",
    icon: CalendarDays,
    title: "See Your Weeks",
    description:
      "Visualize your life in weeks. See where you've been, where you are, and how many Sundays you have left to make count.",
  },
  {
    number: "03",
    icon: Lightbulb,
    title: "Get Matched Resources",
    description:
      "Receive curated tools, books, and frameworks tailored to the life areas where you want to grow most.",
  },
];

export const revalidate = 3600;

export default function HomePage() {
  return (
    <>
      {/* Hero with painted sky background */}
      <section className="relative overflow-hidden px-6 py-28 text-center md:py-40">
        {/* Background gradient that simulates the painted sky feel */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-[#4a3a6b] via-[#8b6b5a] to-[#d4a574]"
          style={{
            backgroundImage: `
              radial-gradient(ellipse at 20% 50%, rgba(74, 58, 107, 0.8) 0%, transparent 60%),
              radial-gradient(ellipse at 80% 30%, rgba(180, 140, 110, 0.6) 0%, transparent 50%),
              radial-gradient(ellipse at 50% 80%, rgba(212, 165, 116, 0.7) 0%, transparent 40%),
              linear-gradient(to bottom, #4a3a6b, #6b5a7a, #9b7a6a, #c4956a, #d4a574)
            `,
          }}
        />
        <div className="absolute inset-0 bg-black/15" />
        <div className="relative mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
            You have
            <br />
            4,000 Sundays
            <br />
            in your life.
          </h1>
          <p className="mt-4 text-xl font-medium text-white/90 md:text-2xl">
            Make them count.
          </p>
          <Link
            href="/life-compass-calibration"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-purple px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-purple/90"
          >
            <Compass className="h-4 w-4" />
            Calibrate Your Compass
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-[960px]">
          <p className="text-center text-sm font-medium uppercase tracking-widest text-gray-400">
            How Sunday4K Works
          </p>
          <h2 className="mt-2 text-center text-3xl font-bold text-gray-800 md:text-4xl">
            See your life clearly. Plan your weeks intentionally.
          </h2>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.number}
                className="group rounded-xl bg-white p-8 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <step.icon className="mb-4 h-8 w-8 text-brand-purple" />
                <span className="text-4xl font-bold text-brand-purple">
                  {step.number}
                </span>
                <h3 className="mt-3 text-xl font-semibold text-gray-800">
                  {step.title}
                </h3>
                <p className="mt-2 leading-relaxed text-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/life-compass-calibration"
              className="inline-block rounded-full bg-brand-purple px-8 py-3 text-sm font-semibold text-white transition hover:bg-brand-purple/90"
            >
              Start Your Compass
            </Link>
          </div>
        </div>
      </section>

      {/* Daily Quote */}
      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-2xl">
          <p className="mb-8 text-center text-sm font-medium uppercase tracking-widest text-gray-400">
            Daily Inspiration
          </p>
          <DailyQuote />
        </div>
      </section>

      {/* Carpe Diem Teaser */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-gray-400">
            Curated Resources
          </p>
          <h2 className="mt-2 text-3xl font-bold text-gray-800 md:text-4xl">
            Carpe Diem
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-gray-600">
            Over 140 hand-picked tools, books, courses, and apps across 12 life
            areas to help you grow where it matters most.
          </p>
          <Link
            href="/carpe-diem"
            className="mt-8 inline-block rounded-full border-2 border-brand-purple px-8 py-3 text-sm font-semibold text-brand-purple transition hover:bg-brand-purple hover:text-white"
          >
            Explore Resources
          </Link>
        </div>
      </section>
    </>
  );
}
