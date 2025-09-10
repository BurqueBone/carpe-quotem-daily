import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()()',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
};

interface BroadcastRequest {
  action?: 'preview';
  subject?: string;
  preheader?: string;
  cta_url?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = (await req.json().catch(() => ({}))) as BroadcastRequest;

    // 1) Get today's quote (same source as daily emails)
    const { data: quote, error: quoteError } = await supabase
      .rpc('get_random_quote_and_track')
      .single();

    if (quoteError) {
      console.error('broadcast-email: error fetching quote', quoteError);
      return new Response(JSON.stringify({ error: 'Failed to fetch quote' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (!quote) {
      return new Response(JSON.stringify({ error: 'No quote found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const subject = body.subject?.trim() || 'Your Sunday4k Daily Inspiration';
    const preheader = body.preheader?.trim() || 'A gentle nudge toward a more meaningful day';
    const ctaUrl = body.cta_url?.trim() || 'https://sunday4k.life';

    const html = generateBroadcastHTML({
      subject,
      preheader,
      ctaUrl,
      quote,
    });

    return new Response(
      JSON.stringify({ success: true, subject, html }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error('broadcast-email error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message || 'Unknown error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});

function generateBroadcastHTML({ subject, preheader, ctaUrl, quote }: { subject: string; preheader: string; ctaUrl: string; quote: any }) {
  // Brand palette
  const primary = '#9381ff';
  const secondary = '#FFD8BE';
  const accent = '#B8B8FF';
  const canvas = '#F8F7FF';
  const cream = '#FFEEDD';

  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${escapeHtml(subject)}</title>
      <meta name="color-scheme" content="light only" />
      <style>
        body { margin:0; padding:0; background:${canvas}; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif; color:#1f2937; }
        .container { width:100%; background:${canvas}; padding:24px 0; }
        .card { max-width:640px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow: 0 6px 24px rgba(147,129,255,0.18); }
        .header { background: linear-gradient(135deg, ${primary}, ${accent}); padding: 40px 30px; text-align:center; color:#fff; }
        .logo { font-size:28px; font-weight:800; letter-spacing:0.2px; }
        .tagline { opacity:0.95; font-size:14px; margin-top:6px; }
        .preheader { display:none !important; visibility:hidden; opacity:0; color:transparent; height:0; width:0; }
        .content { padding: 36px 30px; }
        .intro { font-size:16px; color:#374151; margin: 0 0 16px; }
        .quote-wrap { background:${cream}; border-left:4px solid ${primary}; padding:22px; border-radius:10px; margin: 20px 0; }
        .quote { font-size:22px; line-height:1.5; font-style: italic; color:#111827; margin:0 0 10px; }
        .author { font-size:14px; color:#4b5563; text-align:right; margin:0; }
        .cta { text-align:center; margin: 28px 0 6px; }
        .cta a { display:inline-block; text-decoration:none; font-weight:700; color:#fff; background: linear-gradient(135deg, ${primary}, ${accent}); padding: 14px 26px; border-radius:10px; box-shadow:0 8px 18px rgba(147,129,255,0.28); }
        .divider { height:1px; background: ${secondary}; opacity:0.65; margin: 8px 30px; }
        .footer { background:${secondary}; padding: 22px 30px; text-align:center; color:#5b5b5b; font-size:13px; }
        .links a { color:${primary}; text-decoration:none; }
      </style>
    </head>
    <body>
      <span class="preheader">${escapeHtml(preheader)}</span>
      <div class="container">
        <div class="card">
          <div class="header">
            <div class="logo">Sunday4k</div>
            <div class="tagline">Daily inspiration for meaningful living</div>
          </div>
          <div class="content">
            <p class="intro">Here's your daily reminder to live fully and meaningfully:</p>
            <div class="quote-wrap">
              <div class="quote">“${escapeHtml(quote.quote)}”</div>
              <p class="author">— ${escapeHtml(quote.author || 'Unknown')}${quote.source ? `, ${escapeHtml(quote.source)}` : ''}</p>
            </div>
            <p class="intro">Take a moment to reflect on these words. How might you bring a little more intention, kindness, or courage into today?</p>
            <div class="cta">
              <a href="${escapeAttr(ctaUrl)}" target="_blank" rel="noopener">Explore Sunday4k Resources</a>
            </div>
          </div>
          <div class="divider"></div>
          <div class="footer">
            <p>You’re receiving this because you subscribed to Sunday4k daily inspiration.</p>
            <p class="links"><a href="https://sunday4k.life">Visit Sunday4k</a> · <a href="#">Update preferences</a> · <a href="#">Unsubscribe</a></p>
          </div>
        </div>
      </div>
    </body>
  </html>`;
}

function escapeHtml(input: string) {
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(input: string) {
  return escapeHtml(input).replace(/"/g, '&quot;');
}
