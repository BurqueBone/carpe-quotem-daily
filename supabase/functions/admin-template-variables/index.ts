import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.1";

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
      throw new Error('Admin access required');
    }

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

      case 'POST':
        // Create new template variable
        // Validate required fields
        if (!requestBody.variable_name || !requestBody.display_name) {
          throw new Error('variable_name and display_name are required');
        }

        // Validate variable_name format (alphanumeric, dots, underscores only)
        if (!/^[a-zA-Z0-9._]+$/.test(requestBody.variable_name)) {
          throw new Error('variable_name can only contain letters, numbers, dots, and underscores');
        }

        const { data, error: createError } = await supabase
          .from('template_variables')
          .insert([{
            variable_name: requestBody.variable_name,
            display_name: requestBody.display_name,
            description: requestBody.description,
            category: requestBody.category || 'custom',
            data_type: requestBody.data_type || 'text',
            default_value: requestBody.default_value,
            is_system: false, // User-created variables are never system variables
            is_active: requestBody.is_active !== undefined ? requestBody.is_active : true
          }])
          .select()
          .single();
        
        if (createError) throw createError;
        
        return new Response(JSON.stringify(data), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'PUT':
        // Update existing template variable
        if (!id) {
          throw new Error('ID is required for updates');
        }
        
        // Validate variable_name format if provided
        if (requestBody.variable_name && !/^[a-zA-Z0-9._]+$/.test(requestBody.variable_name)) {
          throw new Error('variable_name can only contain letters, numbers, dots, and underscores');
        }

        // Don't allow updating system variables' core properties
        const { data: existingVar } = await supabase
          .from('template_variables')
          .select('is_system')
          .eq('id', id)
          .single();

        if (existingVar?.is_system) {
          // Only allow updating description and is_active for system variables
          const allowedUpdates: any = {};
          if (requestBody.description !== undefined) allowedUpdates.description = requestBody.description;
          if (requestBody.is_active !== undefined) allowedUpdates.is_active = requestBody.is_active;
          
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
          // Allow full updates for custom variables
          const { data, error: updateError2 } = await supabase
            .from('template_variables')
            .update({
              variable_name: requestBody.variable_name,
              display_name: requestBody.display_name,
              description: requestBody.description,
              category: requestBody.category,
              data_type: requestBody.data_type,
              default_value: requestBody.default_value,
              is_active: requestBody.is_active
            })
            .eq('id', id)
            .select()
            .single();
          
          if (updateError2) throw updateError2;
          
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
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
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: error.message.includes('Unauthorized') || error.message.includes('Admin access required') ? 401 : 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});