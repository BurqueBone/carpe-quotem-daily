import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';
import { Resend } from 'npm:resend@2.0.0';
import { maskEmail } from '../shared/email-masking.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { record } = await req.json();
    const newUserEmail = record?.email;
    
    if (!newUserEmail) {
      console.error('No email provided in record');
      return new Response(JSON.stringify({ error: 'No email provided' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Processing new user notification for: ${maskEmail(newUserEmail)}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase configuration');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return new Response(JSON.stringify({ error: 'Email service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch admin user IDs
    const { data: adminRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin');

    if (rolesError) {
      console.error('Error fetching admin roles:', rolesError);
      return new Response(JSON.stringify({ error: 'Failed to fetch admin roles' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!adminRoles?.length) {
      console.log('No admin users found to notify');
      return new Response(JSON.stringify({ success: true, message: 'No admins to notify' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const adminUserIds = adminRoles.map((role: { user_id: string }) => role.user_id);

    // Get admin emails from profiles
    const { data: adminProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('email')
      .in('id', adminUserIds);

    if (profilesError) {
      console.error('Error fetching admin profiles:', profilesError);
      return new Response(JSON.stringify({ error: 'Failed to fetch admin profiles' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!adminProfiles?.length) {
      console.log('No admin email addresses found');
      return new Response(JSON.stringify({ success: true, message: 'No admin emails found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const adminEmails = adminProfiles.map((p: { email: string }) => p.email);
    console.log(`Sending notification to ${adminEmails.length} admin(s)`);

    const signupDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    const resend = new Resend(resendApiKey);

    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #9381ff; margin: 0; font-size: 24px;">🎉 New User Registration</h1>
        </div>
        
        <div style="background-color: #f8f7ff; padding: 24px; border-radius: 12px; border-left: 4px solid #9381ff;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: 500;">Email:</td>
              <td style="padding: 8px 0; color: #333;">${newUserEmail}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: 500;">Signed up:</td>
              <td style="padding: 8px 0; color: #333;">${signupDate}</td>
            </tr>
          </table>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
            This notification was sent because you are an admin on Sunday4k.
          </p>
        </div>
      </div>
    `;

    const { error: emailError } = await resend.emails.send({
      from: 'Sunday4k <info@sunday4k.life>',
      to: adminEmails,
      subject: `New User Signup: ${newUserEmail}`,
      html: emailHtml,
    });

    if (emailError) {
      console.error('Failed to send email:', emailError);
      return new Response(JSON.stringify({ error: 'Failed to send notification email' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Admin notification sent successfully for new user: ${maskEmail(newUserEmail)}`);
    
    return new Response(JSON.stringify({ success: true, notifiedAdmins: adminEmails.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Unexpected error in notify-admin-new-user:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
