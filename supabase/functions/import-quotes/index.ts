// deno-lint-ignore-file no-explicit-any
// Import Quotes Edge Function
// Fetches a public JSON dataset of inspirational quotes and inserts up to 1000
// quotes with known authors into public.quotes, assigning sequential future
// display_queue dates without gaps.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Public dataset (~1000+ quotes) with author fields
const DATASET_URL =
  "https://raw.githubusercontent.com/AtaGowani/daily-motivation/master/src/data/quotes.json";

function isUnknownAuthor(author: string | null | undefined) {
  if (!author) return true;
  const a = author.trim().toLowerCase();
  return a === "unknown" || a === "anonymous" || a === "n/a" || a.length === 0;
}

async function getMaxDisplayDate(): Promise<string> {
  const { data, error } = await supabase
    .from("quotes")
    .select("display_queue")
    .order("display_queue", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data || !data.display_queue) {
    const d = new Date();
    d.setDate(d.getDate() + 0); // today; we will add +1 for first item
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
  }
  return data.display_queue as unknown as string; // already YYYY-MM-DD
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

async function getExistingQuoteSet(): Promise<Set<string>> {
  // Fetch existing quotes' text to avoid duplicates
  const existing = new Set<string>();
  let from = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase
      .from("quotes")
      .select("quote")
      .range(from, from + pageSize - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    for (const row of data) existing.add((row as any).quote.trim());
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return existing;
}

async function insertInBatches(rows: any[], batchSize = 200) {
  for (let i = 0; i < rows.length; i += batchSize) {
    const chunk = rows.slice(i, i + batchSize);
    const { error } = await supabase.from("quotes").insert(chunk);
    if (error) throw error;
  }
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    // Verify JWT is required by config; no extra checks needed here

    // Fetch dataset
    const resp = await fetch(DATASET_URL);
    if (!resp.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch dataset", status: resp.status }),
        { status: 502, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }
    const dataset: Array<{ quote: string; author?: string }> = await resp.json();

    // Prepare filtering: known author only, non-empty quote
    const existing = await getExistingQuoteSet();

    const filtered = dataset
      .filter((q) => q.quote && q.quote.trim().length > 0 && !isUnknownAuthor(q.author))
      .filter((q) => !existing.has(q.quote.trim()));

    // Limit to 1000 new items as requested
    const limit = Math.min(1000, filtered.length);

    // Determine start display date
    const maxDisplayDate = await getMaxDisplayDate();

    // Build rows with sequential future dates starting +1 day after max
    const rows = [] as any[];
    for (let i = 0; i < limit; i++) {
      const q = filtered[i];
      const displayDate = addDays(maxDisplayDate, i + 1);
      rows.push({
        quote: q.quote.trim(),
        author: q.author?.trim() ?? "",
        source: "daily-motivation dataset (GitHub)",
        is_published: true,
        display_queue: displayDate, // satisfies NOT NULL + unique index
      });
    }

    if (rows.length === 0) {
      return new Response(
        JSON.stringify({ inserted: 0, message: "No new quotes to insert after filtering." }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    await insertInBatches(rows, 200);

    return new Response(
      JSON.stringify({ inserted: rows.length, start_date_after: maxDisplayDate, last_display_date: rows[rows.length - 1].display_queue }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  } catch (err) {
    console.error("import-quotes error", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message ?? "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }
});
