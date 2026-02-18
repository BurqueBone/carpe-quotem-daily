"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Quote {
  quote: string;
  author: string;
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
        setQuote({ quote: data[0].quote, author: data[0].author });
      }
      setLoading(false);
    }
    fetchQuote();
  }, []);

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-purple border-t-transparent" />
      </div>
    );
  }

  if (!quote) return null;

  return (
    <blockquote className="text-center">
      <p className="text-xl font-medium leading-relaxed text-gray-700 md:text-2xl">
        &ldquo;{quote.quote}&rdquo;
      </p>
      <cite className="mt-4 block text-sm font-medium text-brand-purple not-italic">
        — {quote.author}
      </cite>
    </blockquote>
  );
}
