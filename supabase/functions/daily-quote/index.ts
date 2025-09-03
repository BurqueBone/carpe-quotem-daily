import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    console.log('Quote fetched successfully:', quote.id);

    return new Response(
      JSON.stringify({
        success: true,
        quote: {
          id: quote.id,
          quote: quote.quote,
          author: quote.author,
          source: quote.source,
          display_count: quote.display_count,
          last_displayed_at: quote.last_displayed_at
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
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});