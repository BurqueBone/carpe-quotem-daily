import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.1";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { checkRateLimit, logRequest, getClientIP } from '../shared/rate-limiting.ts';

const variableCreateSchema = z.object({
  variable_name: z.string().trim().min(1).max(100).regex(/^[a-zA-Z0-9._]+$/, 'variable_name can only contain letters, numbers, dots, and underscores'),
  display_name: z.string().trim().min(1).max(100),
  description: z.string().max(500).nullish(),
  category: z.enum(['system', 'user', 'content', 'custom']).optional().default('custom'),
  data_type: z.enum(['text', 'url', 'date', 'boolean', 'number']).optional().default('text'),
  default_value: z.string().max(1000).nullish(),
  is_active: z.boolean().optional().default(true),
});

const variableUpdateSchema = variableCreateSchema.partial();

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
    // Create client for auth check with anon key
    const anonClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Create service role client for admin operations (bypasses RLS)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Get the current user using the JWT token directly
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await anonClient.auth.getUser(token);
    if (userError || !user) {
      console.error('Auth error:', userError);
      throw new Error('Unauthorized');
    }

    // Check if user is admin using service role client
    const { data: adminCheck, error: adminError } = await supabase
      .rpc('has_role', { _user_id: user.id, _role: 'admin' });
    
    if (adminError || !adminCheck) {
      console.error('Admin check failed for user:', user.id, adminError);
      throw new Error('Admin access required');
    }

    // Rate limiting: 5 requests per minute for admin operations
    const clientIP = getClientIP(req);
    const rateLimitCheck = await checkRateLimit(supabase, {
      identifier: `admin-template-variables:${user.id}:${clientIP}`,
      maxRequests: 5,
      windowMs: 60 * 1000 // 1 minute
    });

    if (!rateLimitCheck.allowed) {
      console.warn('Rate limit exceeded for admin-template-variables:', user.id, clientIP);
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
    await logRequest(supabase, 'admin-template-variables', clientIP, req.headers.get('user-agent') || undefined);

    // Get request body to determine method and parameters
    const requestBody = await req.json();
    const method = requestBody.method || 'GET';
    const id = requestBody.id;

    switch (method) {
      case 'GET':
        if (id) {
          // Get specific template variable
          const { data, error: fetchError } = await supabase
            .from('template_variables')
            .select('*')
            .eq('id', id)
            .single();
          
          if (fetchError) throw fetchError;
          
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          // List all template variables
          const { data, error: listError } = await supabase
            .from('template_variables')
            .select('*')
            .order('category', { ascending: true })
            .order('display_name', { ascending: true });
          
          if (listError) throw listError;
          
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

      case 'POST': {
        // Validate with Zod
        const createParsed = variableCreateSchema.safeParse(requestBody);
        if (!createParsed.success) {
          return new Response(
            JSON.stringify({ error: 'Validation failed', details: createParsed.error.errors.map(e => e.message) }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data, error: createError } = await supabase
          .from('template_variables')
          .insert([{
            ...createParsed.data,
            is_system: false, // User-created variables are never system variables
          }])
          .select()
          .single();
        
        if (createError) throw createError;
        
        return new Response(JSON.stringify(data), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'PUT': {
        if (!id) {
          throw new Error('ID is required for updates');
        }

        // Validate with Zod
        const updateParsed = variableUpdateSchema.safeParse(requestBody);
        if (!updateParsed.success) {
          return new Response(
            JSON.stringify({ error: 'Validation failed', details: updateParsed.error.errors.map(e => e.message) }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Don't allow updating system variables' core properties
        const { data: existingVar } = await supabase
          .from('template_variables')
          .select('is_system')
          .eq('id', id)
          .single();

        if (existingVar?.is_system) {
          const allowedUpdates: any = {};
          if (updateParsed.data.description !== undefined) allowedUpdates.description = updateParsed.data.description;
          if (updateParsed.data.is_active !== undefined) allowedUpdates.is_active = updateParsed.data.is_active;
          
          const { data, error: updateError1 } = await supabase
            .from('template_variables')
            .update(allowedUpdates)
            .eq('id', id)
            .select()
            .single();
          
          if (updateError1) throw updateError1;
          
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          const { data, error: updateError2 } = await supabase
            .from('template_variables')
            .update(updateParsed.data)
            .eq('id', id)
            .select()
            .single();
          
          if (updateError2) throw updateError2;
          
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      case 'DELETE':
        // Delete template variable
        if (!id) {
          throw new Error('ID is required for deletion');
        }

        // Don't allow deleting system variables
        const { data: varToDelete } = await supabase
          .from('template_variables')
          .select('is_system')
          .eq('id', id)
          .single();

        if (varToDelete?.is_system) {
          throw new Error('Cannot delete system variables');
        }

        const { error: deleteError } = await supabase
          .from('template_variables')
          .delete()
          .eq('id', id);
        
        if (deleteError) throw deleteError;
        
        return new Response(null, {
          status: 204,
          headers: corsHeaders,
        });

      default:
        throw new Error(`Method ${method} not allowed`);
    }
  } catch (error: any) {
    console.error('Error in admin-template-variables function:', error);
    
    // Return generic error message to client, detailed logs server-side
    const status = error.message?.includes('Unauthorized') || error.message?.includes('Admin access required') ? 401 : 500;
    return new Response(
      JSON.stringify({ error: status === 401 ? 'Authentication failed' : 'An error occurred processing your request' }),
      {
        status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});