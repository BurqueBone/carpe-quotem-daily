import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Sunday4K helps you see your life in weeks and make each one count. Learn about our mission and the philosophy behind the 4,000 Sundays concept.",
};

export default function AboutPage() {
  return (
    <div className="px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold text-gray-800">About Sunday4K</h1>

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
