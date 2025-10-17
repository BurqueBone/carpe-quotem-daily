import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.1";
import { checkRateLimit, logRequest, getClientIP } from '../shared/rate-limiting.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
  "Permissions-Policy": "geolocation=(), microphone=(), camera=()()",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
};

interface BroadcastRequest {
  action?: "preview";
  subject?: string;
  preheader?: string;
  cta_url?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Rate limiting: 10 requests per hour for email preview generation
    const clientIP = getClientIP(req);
    const rateLimitCheck = await checkRateLimit(supabase, {
      identifier: `broadcast-email:${clientIP}`,
      maxRequests: 10,
      windowMs: 60 * 60 * 1000 // 1 hour
    });

    if (!rateLimitCheck.allowed) {
      console.warn('Rate limit exceeded for broadcast-email:', clientIP);
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': '3600'
          }
        }
      );
    }

    // Log the request
    await logRequest(supabase, 'broadcast-email', clientIP, req.headers.get('user-agent') || undefined);

    const body = (await req.json().catch(() => ({}))) as BroadcastRequest;

    // Get the broadcast email template from database
    const { data: emailTemplate, error: templateError } = await supabase
      .from("email_templates")
      .select("subject, html_content")
      .eq("template_name", "broadcast")
      .eq("is_active", true)
      .maybeSingle();

    if (templateError) {
      console.error("broadcast-email: error fetching template", templateError);
      return new Response(JSON.stringify({ error: "An error occurred processing your request" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get today's quote (same source as daily emails)
    const { data: quote, error: quoteError } = await supabase.rpc("get_random_quote_and_track").single();

    if (quoteError) {
      console.error("broadcast-email: error fetching quote", quoteError);
      return new Response(JSON.stringify({ error: "An error occurred processing your request" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!quote) {
      console.error("broadcast-email: no quote available");
      return new Response(JSON.stringify({ error: "An error occurred processing your request" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const subject = body.subject?.trim() || emailTemplate?.subject || "Your Sunday4k Daily Inspiration";
    const preheader = body.preheader?.trim() || "A gentle nudge toward a more meaningful day";
    const ctaUrl = body.cta_url?.trim() || "https://sunday4k.life";

    let html: string;
    if (emailTemplate) {
      // Use template from database
      html = generateEmailFromTemplate(emailTemplate.html_content, {
        subject,
        preheader,
        ctaUrl,
        quote,
      });
    } else {
      // Fallback to hardcoded template
      console.warn("No broadcast template found, using fallback");
      html = generateBroadcastHTML({
        subject,
        preheader,
        ctaUrl,
        quote,
      });
    }

    return new Response(JSON.stringify({ success: true, subject, html }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("broadcast-email error:", error);
    return new Response(JSON.stringify({ success: false, error: "An error occurred processing your request" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});

function generateEmailFromTemplate(
  template: string,
  data: { subject: string; preheader: string; ctaUrl: string; quote: any },
): string {
  let emailHTML = template;

  // Replace placeholders
  emailHTML = emailHTML.replace(/\{\{subject\}\}/g, escapeHtml(data.subject));
  emailHTML = emailHTML.replace(/\{\{preheader\}\}/g, escapeHtml(data.preheader));
  emailHTML = emailHTML.replace(/\{\{cta_url\}\}/g, escapeAttr(data.ctaUrl));
  emailHTML = emailHTML.replace(/\{\{quote_text\}\}/g, escapeHtml(data.quote.quote));
  emailHTML = emailHTML.replace(/\{\{quote_author\}\}/g, escapeHtml(data.quote.author || "Unknown"));
  emailHTML = emailHTML.replace(/\{\{quote_source\}\}/g, data.quote.source ? `, ${escapeHtml(data.quote.source)}` : "");

  return emailHTML;
}

// Fallback function (kept for backward compatibility)
function generateBroadcastHTML({
  subject,
  preheader,
  ctaUrl,
  quote,
}: {
  subject: string;
  preheader: string;
  ctaUrl: string;
  quote: any;
}) {
  // Brand palette
  const primary = "#9381ff";
  const secondary = "#FFD8BE";
  const accent = "#B8B8FF";
  const canvas = "#F8F7FF";
  const cream = "#FFEEDD";

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
            <div class="tagline">Your life in weeks. Your weeks in focus.</div>
          </div>
          <div class="content">
            <p class="intro">Here's your daily reminder to live fully and meaningfully:</p>
            <div class="quote-wrap">
              <div class="quote">"${escapeHtml(quote.quote)}"</div>
              <p class="author">— ${escapeHtml(quote.author || "Unknown")}${quote.source ? `, ${escapeHtml(quote.source)}` : ""}</p>
            </div>
            <p class="intro">Take a moment to reflect on these words. How might you bring a little more intention, kindness, or courage into today?</p>
            <div class="cta">
              <a href="${escapeAttr(ctaUrl)}" target="_blank" rel="noopener">Explore Sunday4k Resources</a>
            </div>
          </div>
          <div class="divider"></div>
          <div class="footer">
            <p>You're receiving this because you subscribed to Sunday4k daily inspiration.</p>
            <p class="links"><a href="https://sunday4k.life">Visit Sunday4k</a> · <a href="#">Update preferences</a> · <a href="#">Unsubscribe</a></p>
          </div>
        </div>
      </div>
    </body>
  </html>`;
}

function escapeHtml(input: string) {
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(input: string) {
  return escapeHtml(input).replace(/"/g, "&quot;");
}
