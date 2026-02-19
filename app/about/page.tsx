import { Metadata } from "next";
import { Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description:
    "Sunday4K helps you see your life in weeks and make each one count. Learn about our mission and the philosophy behind the 4,000 Sundays concept.",
};

export default function AboutPage() {
  return (
    <div className="px-6 py-10">
      <div className="mx-auto max-w-3xl">
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

        <div className="prose prose-lg prose-gray mt-8 max-w-none prose-headings:text-gray-800">
          <p>
            The average person lives about 4,000 weeks. That&apos;s roughly
            4,000 Sundays to reset, reflect, and plan the week ahead.
          </p>
          <p>
            Sunday4K was built on a simple idea:{" "}
            <strong>
              when you can see your life in weeks, you plan them differently.
            </strong>
          </p>
          <p>
            We&apos;re not a productivity app. We&apos;re not here to help you
            do more, faster. We&apos;re here to help you do what{" "}
            <em>matters</em> — across every area of your life.
          </p>

          <h2>What We Offer</h2>
          <ul>
            <li>
              <strong>Life Compass Calibration</strong> — Rate where you are
              across 12 life areas and see where your time actually goes versus
              where you want it to go.
            </li>
            <li>
              <strong>Carpe Diem Resources</strong> — Over 140 hand-picked
              tools, books, courses, and apps curated for each life area.
            </li>
            <li>
              <strong>Weekly Inspiration</strong> — Daily quotes about life's
              meaningfulness to keep you grounded and motivated.
            </li>
            <li>
              <strong>Blog</strong> — Guides on intentional living, weekly
              planning, and reviews of the best tools for personal growth.
            </li>
          </ul>

          <h2>Our Philosophy</h2>
          <p>
            Most productivity advice optimizes for output. We optimize for{" "}
            <strong>meaning</strong>. The question isn&apos;t &ldquo;How do I
            get more done?&rdquo; — it&apos;s &ldquo;Am I spending my weeks on
            what truly matters to me?&rdquo;
          </p>
          <p>
            This isn&apos;t about anxiety or counting down. It&apos;s about
            counting <em>up</em> — making every Sunday a fresh start to live
            more intentionally.
          </p>
        </div>
      </div>
    </div>
  );
}
