// deno-lint-ignore-file no-explicit-any
// Import Quotes Edge Function (enhanced diagnostics)
// Fetches a public JSON dataset of inspirational quotes and inserts up to 1000
// quotes with known authors into public.quotes, assigning sequential future
// display_queue dates without gaps.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
  "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!SUPABASE_URL) {
  console.error("import-quotes: Missing SUPABASE_URL secret");
}
if (!SERVICE_ROLE_KEY) {
  console.error("import-quotes: Missing SUPABASE_SERVICE_ROLE_KEY secret");
}

const supabase = createClient(SUPABASE_URL || "", SERVICE_ROLE_KEY || "");

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
    d.setDate(d.getDate()); // today; we will add +1 for first item
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
  }
  return (data as any).display_queue as string; // YYYY-MM-DD
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

async function getExistingQuoteSet(): Promise<Set<string>> {
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
    for (const row of data) existing.add(((row as any).quote || "").trim());
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return existing;
}

async function insertInBatches(rows: any[], batchSize = 100) {
  for (let i = 0; i < rows.length; i += batchSize) {
    const chunk = rows.slice(i, i + batchSize);
    const { error } = await supabase.from("quotes").insert(chunk);
    if (error) throw error;
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
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

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing Supabase secrets on server", haveUrl: !!SUPABASE_URL, haveServiceRole: !!SERVICE_ROLE_KEY }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    // Fetch dataset
    const resp = await fetch(DATASET_URL);
    if (!resp.ok) {
      console.error("import-quotes: dataset fetch failed", { status: resp.status, statusText: resp.statusText });
      return new Response(
        JSON.stringify({ error: "Failed to fetch dataset", status: resp.status }),
        { status: 502, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const dataset: Array<{ quote: string; author?: string }> = await resp.json();
    console.log("import-quotes: dataset length", dataset?.length);

    // Prepare filtering: known author only, non-empty quote, dedupe within dataset
    const existing = await getExistingQuoteSet();
    console.log("import-quotes: existing quotes in DB", existing.size);

    const seen = new Set<string>();
    const filtered = [] as Array<{ quote: string; author?: string }>;
    for (const q of dataset) {
      const qt = (q.quote || "").trim();
      if (!qt) continue;
      if (isUnknownAuthor(q.author)) continue;
      if (existing.has(qt)) continue;
      if (seen.has(qt)) continue; // dedupe within dataset
      seen.add(qt);
      filtered.push({ quote: qt, author: q.author?.trim() });
    }

    const limit = Math.min(1000, filtered.length);
    console.log("import-quotes: filtered count", filtered.length, "limit", limit);

    if (limit === 0) {
      return new Response(
        JSON.stringify({ inserted: 0, message: "No new quotes to insert after filtering." }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const maxDisplayDate = await getMaxDisplayDate();
    console.log("import-quotes: max display date", maxDisplayDate);

    const rows = [] as any[];
    for (let i = 0; i < limit; i++) {
      const q = filtered[i];
      const displayDate = addDays(maxDisplayDate, i + 1);
      rows.push({
        quote: q.quote,
        author: q.author ?? "",
        source: "daily-motivation dataset (GitHub)",
        is_published: true,
        display_queue: displayDate,
      });
    }

    await insertInBatches(rows, 100);

    console.log("import-quotes: inserted rows", rows.length);
    return new Response(
      JSON.stringify({ inserted: rows.length, start_after: maxDisplayDate, last_date: rows[rows.length - 1].display_queue }),
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
