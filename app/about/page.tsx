import { Metadata } from "next";
import Link from "next/link";
import {
  Heart,
  Navigation,
  Zap,
  Newspaper,
  CalendarDays,
  Compass,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description:
    "Sunday4K helps you see your life in weeks and make each one count. Learn about our mission and the philosophy behind the 4,000 Sundays concept.",
};

const features = [
  {
    icon: Navigation,
    title: "Life Compass Calibration",
    description:
      "Rate where you are across 12 life areas and see where your time actually goes versus where you want it to go.",
    href: "/life-compass-calibration",
    accent: "bg-brand-coral/10 text-brand-coral",
  },
  {
    icon: Zap,
    title: "Carpe Diem Resources",
    description:
      "Over 140 hand-picked tools, books, courses, and apps curated for each life area.",
    href: "/carpe-diem",
    accent: "bg-brand-gold/15 text-amber-600",
  },
  {
    icon: CalendarDays,
    title: "Weekly Inspiration",
    description:
      "Daily quotes about life's meaningfulness to keep you grounded and motivated.",
    href: "/",
    accent: "bg-brand-navy/10 text-brand-navy",
  },
  {
    icon: Newspaper,
    title: "Blog",
    description:
      "Guides on intentional living, weekly planning, and reviews of the best tools for personal growth.",
    href: "/blog",
    accent: "bg-brand-orange/10 text-brand-orange",
  },
];

export default function AboutPage() {
  return (
    <div className="px-6 py-10">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-navy via-brand-navy to-brand-navy/80 px-6 py-6">
          <div className="absolute right-[10%] top-[10%] h-20 w-20 rounded-full bg-brand-gold/20 blur-3xl" />
          <div className="absolute bottom-[10%] left-[15%] h-16 w-16 rounded-full bg-brand-coral/15 blur-3xl" />
          <div className="relative flex flex-col items-center gap-3 text-center md:flex-row md:gap-5 md:text-left">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-gold/20">
              <Heart className="h-6 w-6 text-brand-gold" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white md:text-3xl">
                About Sunday4K
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-white/70">
                See your life in weeks and make each one count.
              </p>
            </div>
          </div>
        </div>

        {/* Mission */}
        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <p className="text-lg leading-relaxed text-gray-700">
            The average person lives about 4,000 weeks. That&apos;s roughly
            4,000 Sundays to reset, reflect, and plan the week ahead.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-gray-700">
            Sunday4K was built on a simple idea:{" "}
            <strong className="text-brand-navy">
              when you can see your life in weeks, you plan them differently.
            </strong>
          </p>
          <p className="mt-4 text-lg leading-relaxed text-gray-700">
            We&apos;re not a productivity app. We&apos;re not here to help you
            do more, faster. We&apos;re here to help you do what{" "}
            <em>matters</em> — across every area of your life.
          </p>
        </div>

        {/* Quote highlight */}
        <div className="mt-6 rounded-xl border-l-4 border-brand-gold bg-brand-gold/5 px-6 py-5">
          <p className="text-lg italic text-gray-700">
            &ldquo;The question isn&apos;t &lsquo;How do I get more
            done?&rsquo; — it&apos;s &lsquo;Am I spending my weeks on what
            truly matters to me?&rsquo;&rdquo;
          </p>
        </div>

        {/* What We Offer */}
        <h2 className="mb-4 mt-10 text-center text-2xl font-bold text-gray-900">
          What We Offer
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((f) => (
            <Link
              key={f.title}
              href={f.href}
              className="group flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${f.accent}`}
              >
                <f.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 group-hover:text-brand-navy">
                  {f.title}
                </h3>
                <p className="mt-1 text-sm text-gray-500">{f.description}</p>
              </div>
              <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-brand-navy" />
            </Link>
          ))}
        </div>

        {/* Philosophy */}
        <div className="mt-10 rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-xl font-bold text-gray-900">Our Philosophy</h2>
          <p className="mt-3 leading-relaxed text-gray-700">
            Most productivity advice optimizes for output. We optimize for{" "}
            <strong className="text-brand-navy">meaning</strong>. This
            isn&apos;t about anxiety or counting down. It&apos;s about counting{" "}
            <em>up</em> — making every Sunday a fresh start to live more
            intentionally.
          </p>

          <div className="mt-6 flex justify-center">
            <Link
              href="/life-compass-calibration"
              className="inline-flex items-center gap-2 rounded-full bg-brand-navy px-8 py-3 text-sm font-semibold text-white transition hover:bg-brand-navy/90"
            >
              <Compass className="h-4 w-4" />
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
