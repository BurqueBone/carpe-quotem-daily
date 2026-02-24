"use client";

import { useState, useEffect } from "react";
import { Mail, CheckCircle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface NewsletterSignupProps {
  variant?: "inline" | "section";
}

export default function NewsletterSignup({
  variant = "section",
}: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    setMessage("");

    try {
      const body: Record<string, string> = { email: email.trim() };
      if (userId) body.user_id = userId;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/subscribe-newsletter`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          },
          body: JSON.stringify(body),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
        return;
      }

      setStatus("success");
      setMessage(data.message || "You're subscribed!");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  if (variant === "inline") {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 text-brand-navy">
          <Mail className="h-5 w-5" />
          <h3 className="text-lg font-bold">The Sunday Reset</h3>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Weekly insights on intentional living. No spam, unsubscribe anytime.
        </p>

        {status === "success" ? (
          <div className="mt-4 flex items-center gap-2 text-sm font-medium text-emerald-600">
            <CheckCircle className="h-4 w-4" />
            {message}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/20"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-navy px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-navy/90 disabled:opacity-60"
            >
              {status === "loading" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Subscribe"
              )}
            </button>
          </form>
        )}

        {status === "error" && (
          <p className="mt-2 text-xs text-red-500">{message}</p>
        )}
      </div>
    );
  }

  // Section variant (full-width with brand styling)
  return (
    <section className="bg-brand-navy px-6 py-12 md:py-16">
      <div className="mx-auto max-w-xl text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-gold/20">
          <Mail className="h-6 w-6 text-brand-gold" />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-white md:text-3xl">
          The Sunday Reset
        </h2>
        <p className="mt-3 text-base text-white/70">
          One email each week with fresh guides, curated resources, and a nudge
          to live more intentionally. Join free.
        </p>

        {status === "success" ? (
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-5 py-2.5 text-sm font-medium text-emerald-300">
            <CheckCircle className="h-4 w-4" />
            {message}
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="rounded-full border-2 border-white/20 bg-white/10 px-5 py-3 text-sm text-white placeholder-white/40 outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30 sm:w-72"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-gold px-6 py-3 text-sm font-bold text-brand-navy transition hover:bg-brand-gold/90 disabled:opacity-60"
            >
              {status === "loading" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  Subscribe Free
                </>
              )}
            </button>
          </form>
        )}

        {status === "error" && (
          <p className="mt-3 text-xs text-red-300">{message}</p>
        )}

        <p className="mt-4 text-xs text-white/40">
          No spam. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}
