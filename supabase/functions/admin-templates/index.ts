import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';
import { checkRateLimit, logRequest, getClientIP } from '../shared/rate-limiting.ts';

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
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is admin
    const { data: adminRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!adminRole) {
      console.error('Admin check failed for user:', user.id);
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Rate limiting: 5 requests per minute for admin operations
    const clientIP = getClientIP(req);
    const rateLimitCheck = await checkRateLimit(supabase, {
      identifier: `admin-templates:${user.id}:${clientIP}`,
      maxRequests: 5,
      windowMs: 60 * 1000 // 1 minute
    });

    if (!rateLimitCheck.allowed) {
      console.warn('Rate limit exceeded for admin-templates:', user.id, clientIP);
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
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
    await logRequest(supabase, 'admin-templates', clientIP, req.headers.get('user-agent') || undefined);

    const url = new URL(req.url);
    const method = req.method;

    // GET /admin-templates - List all templates
    if (method === 'GET') {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /admin-templates - Create new template
    if (method === 'POST') {
      const body = await req.json();
      
      const { data, error } = await supabase
        .from('email_templates')
        .insert([body])
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // PUT /admin-templates/:id - Update template
    if (method === 'PUT') {
      const templateId = url.pathname.split('/').pop();
      const body = await req.json();

      const { data, error } = await supabase
        .from('email_templates')
        .update(body)
        .eq('id', templateId)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // DELETE /admin-templates/:id - Delete template
    if (method === 'DELETE') {
      const templateId = url.pathname.split('/').pop();

      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Error in admin-templates function:', error);
    
    // Return generic error message to client, detailed logs server-side
    const status = error.message?.includes('authorization') || error.message?.includes('Unauthorized') ? 401 : 500;
    return new Response(
      JSON.stringify({ error: 'An error occurred processing your request' }),
      {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});