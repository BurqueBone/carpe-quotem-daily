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

export const revalidate = 3600; // revalidate every hour

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-purple via-brand-purple to-brand-light-purple px-6 py-24 text-center text-white md:py-36">
        <div className="mx-auto max-w-3xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-brand-peach">
            Your life in weeks
          </p>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
            You have 4,000 Sundays in your life.{" "}
            <span className="text-brand-peach">Make them count.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-white/80">
            Sunday4K helps you see your life clearly and plan your weeks
            intentionally with curated resources for every area of your life.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/life-compass-calibration"
              className="rounded-lg bg-white px-8 py-3 text-sm font-semibold text-brand-purple shadow-lg transition hover:bg-brand-cream"
            >
              Start Your Compass
            </Link>
            <Link
              href="/blog"
              className="rounded-lg border border-white/30 px-8 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Read the Blog
            </Link>
          </div>
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
              className="inline-block rounded-lg bg-brand-purple px-8 py-3 text-sm font-semibold text-white transition hover:bg-brand-purple/90"
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
            className="mt-8 inline-block rounded-lg border-2 border-brand-purple px-8 py-3 text-sm font-semibold text-brand-purple transition hover:bg-brand-purple hover:text-white"
          >
            Explore Resources
          </Link>
        </div>
      </section>
    </>
  );
}
