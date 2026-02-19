"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lightbulb } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Quote {
  quote: string;
  author: string;
  source: string | null;
}

export default function DailyQuote() {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuote() {
      const supabase = createClient();
      const { data, error } = await supabase.rpc(
        "get_random_quote_and_track"
      );

      if (!error && data && data.length > 0) {
        setQuote({
          quote: data[0].quote,
          author: data[0].author,
          source: data[0].source || null,
        });
      }
      setLoading(false);
    }
    fetchQuote();
  }, []);

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-navy border-t-transparent" />
      </div>
    );
  }

  if (!quote) return null;

  return (
    <div className="text-center">
      <blockquote>
        <p className="text-xl font-medium leading-relaxed text-gray-700 md:text-2xl">
          &ldquo;{quote.quote}&rdquo;
        </p>
        <cite className="mt-4 block text-sm font-medium text-brand-navy not-italic">
          — {quote.author}
        </cite>
        {quote.source && (
          <p className="mt-2 text-xs italic text-gray-400">
            {quote.source}
          </p>
        )}
      </blockquote>

      <p className="mt-6 text-sm text-gray-500">
        Provide your email and Sunday4K will send daily inspirational quotes and resources
      </p>
      <Link
        href="/auth/login"
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-gold px-8 py-3 text-sm font-semibold text-brand-navy transition hover:bg-brand-gold/80"
      >
        <Lightbulb className="h-4 w-4" />
        Get Your Daily Inspiration
      </Link>
    </div>
  );
}
