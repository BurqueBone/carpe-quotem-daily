import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()()',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const hubspotApiKey = Deno.env.get('HUBSPOT_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!hubspotApiKey) {
      console.error('HubSpot API key not configured');
      throw new Error('Service configuration error');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Get user from token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('User authentication failed:', userError);
      throw new Error('Invalid user token');
    }

    // Rate limiting: 3 requests per minute for HubSpot sync
    const clientIP = getClientIP(req);
    const rateLimitCheck = await checkRateLimit(supabase, {
      identifier: `sync-hubspot:${user.id}:${clientIP}`,
      maxRequests: 3,
      windowMs: 60 * 1000 // 1 minute
    });

    if (!rateLimitCheck.allowed) {
      console.warn('Rate limit exceeded for sync-hubspot:', user.id, clientIP);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Too many requests. Please try again later.' 
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': '60'
          }
        }
      );
    }

    // Log the request
    await logRequest(supabase, 'sync-hubspot', clientIP, req.headers.get('user-agent') || undefined);

    const { action, additionalData } = await req.json();

    // Prepare contact data for HubSpot
    const contactData = {
      email: user.email,
      userid: user.id,
      createdate: user.created_at,
      lastmodifieddate: new Date().toISOString(),
      ...additionalData
    };

    let hubspotResponse;

    if (action === 'create_or_update') {
      // Create or update contact in HubSpot
      hubspotResponse = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/batch/upsert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${hubspotApiKey}`,
        },
        body: JSON.stringify({
          inputs: [{
            idProperty: 'email',
            id: user.email,
            properties: contactData
          }]
        }),
      });
    } else if (action === 'add_to_list') {
      const { listId } = additionalData;
      
      // First ensure contact exists
      const createResponse = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/batch/upsert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${hubspotApiKey}`,
        },
        body: JSON.stringify({
          inputs: [{
            idProperty: 'email',
            id: user.email,
            properties: contactData
          }]
        }),
      });

      if (!createResponse.ok) {
        throw new Error(`Failed to create/update contact: ${await createResponse.text()}`);
      }

      const contactResult = await createResponse.json();
      const contactId = contactResult.results[0].id;

      // Add to list
      hubspotResponse = await fetch(`https://api.hubapi.com/contacts/v1/lists/${listId}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${hubspotApiKey}`,
        },
        body: JSON.stringify({
          emails: [user.email]
        }),
      });
    }

    if (!hubspotResponse?.ok) {
      const errorText = await hubspotResponse?.text();
      console.error('HubSpot API error:', errorText);
      throw new Error(`HubSpot API error: ${errorText}`);
    }

    const result = await hubspotResponse.json();
    console.log('HubSpot sync successful:', result);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User synced to HubSpot successfully',
        hubspotResult: result 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error syncing to HubSpot:', error);
    
    // Return generic error message to client, detailed logs server-side
    const errorMessage = (error as Error).message;
    const status = errorMessage?.includes('authorization') || errorMessage?.includes('Invalid user token') ? 401 : 500;
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: status === 401 ? 'Authentication failed' : 'An error occurred processing your request'
      }),
      {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});