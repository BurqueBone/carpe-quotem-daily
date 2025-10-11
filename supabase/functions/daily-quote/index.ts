import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';
import { checkRateLimit, logRequest, getClientIP } from '../shared/rate-limiting.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get client IP for rate limiting
    const clientIP = getClientIP(req);
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Rate limit: 30 requests per minute per IP
    const rateLimitCheck = await checkRateLimit(supabase, {
      identifier: clientIP,
      maxRequests: 30,
      windowMs: 60 * 1000 // 1 minute
    });

    if (!rateLimitCheck.allowed) {
      console.log(`Rate limit exceeded for daily-quote from IP: ${clientIP}`);
      
      await logRequest(supabase, 'daily_quote_rate_limited', clientIP, userAgent);
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Too many requests. Please try again in a moment.'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 429,
        }
      );
    }

    // Log the request
    await logRequest(supabase, 'daily_quote_request', clientIP, userAgent);

    console.log('Fetching random quote...');

    // Call the database function to get a random quote and update tracking
    const { data: quote, error } = await supabase
      .rpc('get_random_quote_and_track')
      .single();

    if (error) {
      console.error('Error fetching quote:', error);
      throw error;
    }

    if (!quote) {
      throw new Error('No quote found');
    }

    console.log('Quote fetched successfully:', (quote as any).id);

    return new Response(
      JSON.stringify({
        success: true,
        quote: {
          id: (quote as any).id,
          quote: (quote as any).quote,
          author: (quote as any).author,
          source: (quote as any).source,
          display_count: (quote as any).display_count,
          last_displayed_at: (quote as any).last_displayed_at
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in daily-quote function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: (error as Error).message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});