import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';
import { Resend } from 'npm:resend@2.0.0';
import { maskEmail } from '../shared/email-masking.ts';
import { checkRateLimit, logRequest, getClientIP } from '../shared/rate-limiting.ts';
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const payloadSchema = z.object({
  record: z.object({
    id: z.string().uuid(),
    email: z.string().email().max(320),
    created_at: z.string().optional(),
  }),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (!supabaseUrl || !supabaseServiceKey || !resendApiKey) {
      console.error('Missing server configuration');
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Rate limiting: 5 calls per hour per IP
    const clientIP = getClientIP(req);
    const { allowed } = await checkRateLimit(supabase, {
      maxRequests: 5,
      windowMs: 60 * 60 * 1000, // 1 hour
      identifier: clientIP,
    });

    if (!allowed) {
      console.warn(`Rate limited notify-admin-new-user from IP: ${clientIP}`);
      return new Response(JSON.stringify({ error: 'Too many requests' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Log the request for rate limiting tracking
    await logRequest(supabase, 'notify-admin-new-user', clientIP, req.headers.get('user-agent') || undefined);

    // Validate input
    const body = await req.json();
    const parsed = payloadSchema.safeParse(body);

    if (!parsed.success) {
      console.error('Invalid payload:', parsed.error.errors.map(e => e.message));
      return new Response(JSON.stringify({ error: 'Invalid request' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const newUserEmail = parsed.data.record.email;
    const newUserId = parsed.data.record.id;

    // Verify this user actually exists in auth (prevents spoofed requests)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', newUserId)
      .eq('email', newUserEmail)
      .maybeSingle();

    if (profileError || !profile) {
      console.warn(`Unverified new-user notification attempt for: ${maskEmail(newUserEmail)}`);
      // Return success to avoid leaking info about whether a user exists
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Processing new user notification for: ${maskEmail(newUserEmail)}`);

    // Fetch admin user IDs
    const { data: adminRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin');

    if (rolesError || !adminRoles?.length) {
      console.log('No admin users found to notify');
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const adminUserIds = adminRoles.map((role: { user_id: string }) => role.user_id);

    const { data: adminProfiles, error: adminProfilesError } = await supabase
      .from('profiles')
      .select('email')
      .in('id', adminUserIds);

    if (adminProfilesError || !adminProfiles?.length) {
      console.log('No admin email addresses found');
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
      timeZoneName: 'short',
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
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Admin notification sent successfully for new user: ${maskEmail(newUserEmail)}`);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Unexpected error in notify-admin-new-user:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
