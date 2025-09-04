// HubSpot Email Template Sender
// Sends branded Sunday4k emails using HubSpot's single-send API

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const HUBSPOT_API_KEY = Deno.env.get("HUBSPOT_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface EmailRequest {
  emailId: string; // HubSpot email template ID
  message: {
    to: string;
    from?: string;
    replyTo?: string;
  };
  customProperties: {
    daily_quote?: string;
    quote_author?: string;
    app_url?: string;
    website_url?: string;
    support_email?: string;
    preference_center?: string;
  };
  contactProperties?: {
    firstname?: string;
    lastname?: string;
    email?: string;
  };
}

interface QuoteOfDay {
  quote: string;
  author: string;
}

async function getTodaysQuote(): Promise<QuoteOfDay> {
  try {
    const { data, error } = await supabase
      .rpc('get_random_quote_and_track')
      .single();
    
    if (error) throw error;
    
    return {
      quote: data.quote || "Life is what happens to you while you're busy making other plans.",
      author: data.author || "John Lennon"
    };
  } catch (error) {
    console.error("Error fetching quote:", error);
    // Fallback quote
    return {
      quote: "The only way to do great work is to love what you do.",
      author: "Steve Jobs"
    };
  }
}

async function sendHubSpotEmail(emailRequest: EmailRequest) {
  if (!HUBSPOT_API_KEY) {
    throw new Error("HubSpot API key not configured");
  }

  const response = await fetch(`https://api.hubapi.com/marketing/v3/emails/single-send`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${HUBSPOT_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(emailRequest),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HubSpot API error: ${response.status} - ${errorText}`);
  }

  return await response.json();
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
        { status: 405, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { 
      emailId, 
      recipientEmail, 
      recipientName, 
      customQuote,
      customAuthor 
    } = await req.json();

    if (!emailId || !recipientEmail) {
      return new Response(
        JSON.stringify({ error: "emailId and recipientEmail are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get today's quote or use custom quote
    let quote: QuoteOfDay;
    if (customQuote && customAuthor) {
      quote = { quote: customQuote, author: customAuthor };
    } else {
      quote = await getTodaysQuote();
    }

    // Prepare email request
    const emailRequest: EmailRequest = {
      emailId: emailId,
      message: {
        to: recipientEmail,
        from: "hello@sunday4k.com", // Replace with your actual from email
        replyTo: "hello@sunday4k.com",
      },
      customProperties: {
        daily_quote: quote.quote,
        quote_author: quote.author,
        app_url: "https://sunday4k.com", // Replace with your actual app URL
        website_url: "https://sunday4k.com",
        support_email: "mailto:hello@sunday4k.com",
        preference_center: "https://sunday4k.com/preferences",
      },
      contactProperties: {
        email: recipientEmail,
        firstname: recipientName || "Friend",
      },
    };

    console.log("Sending HubSpot email:", {
      emailId,
      to: recipientEmail,
      quote: quote.quote.substring(0, 50) + "...",
    });

    const result = await sendHubSpotEmail(emailRequest);

    return new Response(
      JSON.stringify({ 
        success: true, 
        result,
        quoteSent: {
          quote: quote.quote,
          author: quote.author
        }
      }),
      { 
        status: 200, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );

  } catch (error) {
    console.error("Error in send-hubspot-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  }
});