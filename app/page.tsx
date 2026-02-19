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
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#042647] px-6 py-32 text-center md:py-44">
        {/* Layered warm gradient — deep navy to golden horizon */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#042647] via-[#083D77] to-[#8B6914]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#052E5A]/60 via-transparent to-[#7A5C10]/40" />
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#EE964B]/40 to-transparent" />
          {/* Soft warm glows */}
          <div className="absolute left-[10%] top-[20%] h-64 w-96 rounded-full bg-[#F4D35E]/10 blur-3xl" />
          <div className="absolute right-[5%] top-[30%] h-48 w-72 rounded-full bg-[#EE964B]/10 blur-3xl" />
          <div className="absolute bottom-[10%] left-[30%] h-40 w-80 rounded-full bg-[#F4D35E]/15 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-3xl">
          <h1 className="text-5xl font-bold leading-[1.15] tracking-tight text-white drop-shadow-lg md:text-6xl lg:text-7xl">
            You have
            <br />
            <span className="text-brand-gold">4,000 Sundays</span>
            <br />
            in your life.
          </h1>
          <p className="mt-5 text-2xl font-light tracking-wide text-white/80 md:text-3xl">
            Make them count.
          </p>
          <Link
            href="/life-compass-calibration"
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-brand-navy px-10 py-4 text-base font-semibold text-white shadow-xl shadow-brand-navy/30 transition hover:bg-brand-navy/90 hover:shadow-2xl"
          >
            <Compass className="h-5 w-5" />
            Calibrate Your Compass
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white px-6 py-24">
        <div className="mx-auto max-w-[960px]">
          <p className="text-center text-sm font-medium uppercase tracking-widest text-brand-navy/60">
            How Sunday4K Works
          </p>
          <h2 className="mt-3 text-center text-3xl font-bold text-gray-900 md:text-4xl">
            See your life clearly. Plan your weeks intentionally.
          </h2>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.number}
                className="group rounded-2xl border border-gray-100 bg-brand-off-white p-8 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-brand-navy/10">
                  <step.icon className="h-7 w-7 text-brand-navy" />
                </div>
                <span className="text-sm font-bold uppercase tracking-wider text-brand-navy/50">
                  Step {step.number}
                </span>
                <h3 className="mt-2 text-xl font-bold text-gray-900">
                  {step.title}
                </h3>
                <p className="mt-3 leading-relaxed text-gray-500">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Daily Quote */}
      <section className="border-y border-gray-100 bg-brand-off-white px-6 py-20">
        <div className="mx-auto max-w-2xl">
          <p className="mb-8 text-center text-sm font-medium uppercase tracking-widest text-brand-navy/60">
            Daily Inspiration
          </p>
          <DailyQuote />
        </div>
      </section>

      {/* Carpe Diem Teaser */}
      <section className="bg-white px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-brand-navy/60">
            Curated Resources
          </p>
          <h2 className="mt-3 text-3xl font-bold text-gray-900 md:text-4xl">
            Carpe Diem
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-gray-500">
            Over 140 hand-picked tools, books, courses, and apps across 12 life
            areas to help you grow where it matters most.
          </p>
          <Link
            href="/carpe-diem"
            className="mt-10 inline-block rounded-full border-2 border-brand-navy px-10 py-3.5 text-sm font-semibold text-brand-navy transition hover:bg-brand-navy hover:text-white"
          >
            Explore Resources
          </Link>
        </div>
      </section>
    </>
  );
}
