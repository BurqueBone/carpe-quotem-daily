import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { Resend } from 'npm:resend@2.0.0';
import { maskEmail } from '../shared/email-masking.ts';
import { checkRateLimit, logRequest, getClientIP } from '../shared/rate-limiting.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Zod schema for contact form validation
const contactSchema = z.object({
  name: z.string()
    .trim()
    .min(1, { message: "Name cannot be empty" })
    .max(100, { message: "Name must be less than 100 characters" })
    .regex(/^[a-zA-Z\s'-]+$/, { message: "Name contains invalid characters" }),
  email: z.string()
    .trim()
    .email({ message: "Invalid email address" })
    .max(254, { message: "Email must be less than 254 characters" }),
  message: z.string()
    .trim()
    .min(10, { message: "Message must be at least 10 characters" })
    .max(2000, { message: "Message must be less than 2000 characters" })
});

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

    // Check rate limit: 5 submissions per 15 minutes per IP
    const rateLimitCheck = await checkRateLimit(supabase, {
      identifier: clientIP,
      maxRequests: 5,
      windowMs: 15 * 60 * 1000 // 15 minutes
    });

    if (!rateLimitCheck.allowed) {
      console.log(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ 
          error: 'Too many requests. Please try again later.',
          retryAfter: 900 // 15 minutes in seconds
        }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = contactSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(e => e.message).join(', ');
      console.log(`Validation failed for ${maskEmail(body.email || 'unknown')}: ${errors}`);
      
      return new Response(
        JSON.stringify({ 
          error: 'Validation failed',
          details: errors
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const validatedData = validationResult.data;

    // Additional sanitization - remove any HTML tags
    const sanitize = (str: string) => str.replace(/<[^>]*>/g, '');
    const sanitizedData = {
      name: sanitize(validatedData.name),
      email: sanitize(validatedData.email),
      message: sanitize(validatedData.message)
    };

    // Log the request attempt
    await logRequest(supabase, 'contact_submission_attempt', clientIP, userAgent);

    // Insert into database
    const { data, error } = await supabase
      .from('contact_submissions')
      .insert([sanitizedData])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw new Error('Failed to submit contact form');
    }

    // Log successful submission
    await logRequest(supabase, 'contact_submission_success', clientIP, userAgent);

    console.log(`Contact form submitted successfully from ${maskEmail(sanitizedData.email)}`);

    // Send notification emails to admin users
    try {
      await sendAdminNotifications(supabase, sanitizedData);
    } catch (notificationError: any) {
      // Log the error but don't fail the contact submission
      console.error('Failed to send admin notifications:', notificationError);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Your message has been sent successfully'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error in submit-contact function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'An error occurred while submitting your message. Please try again later.',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function sendAdminNotifications(supabase: any, contactData: { name: string; email: string; message: string }) {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) {
    console.error('RESEND_API_KEY not configured');
    return;
  }

  const resend = new Resend(resendApiKey);

  // Get all admin users
  const { data: adminRoles, error: rolesError } = await supabase
    .from('user_roles')
    .select('user_id')
    .eq('role', 'admin');

  if (rolesError) {
    console.error('Error fetching admin roles:', rolesError);
    return;
  }

  if (!adminRoles || adminRoles.length === 0) {
    console.log('No admin users found to notify');
    return;
  }

  const adminUserIds = adminRoles.map((role: any) => role.user_id);

  // Get admin emails from profiles
  const { data: adminProfiles, error: profilesError } = await supabase
    .from('profiles')
    .select('email')
    .in('id', adminUserIds);

  if (profilesError) {
    console.error('Error fetching admin profiles:', profilesError);
    return;
  }

  if (!adminProfiles || adminProfiles.length === 0) {
    console.log('No admin email addresses found');
    return;
  }

  const adminEmails = adminProfiles.map((profile: any) => profile.email);

  // Send email to all admins
  const emailHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #9381ff;">New Contact Form Submission</h2>
      <div style="background-color: #f8f7ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>From:</strong> ${contactData.name}</p>
        <p><strong>Email:</strong> ${contactData.email}</p>
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap;">${contactData.message}</p>
      </div>
      <p style="color: #666; font-size: 12px;">
        This notification was sent because you are an admin on Sunday4k.
      </p>
    </div>
  `;

  try {
    const { error: sendError } = await resend.emails.send({
      from: 'Sunday4k <onboarding@resend.dev>',
      to: adminEmails,
      subject: `New Contact Form: ${contactData.name}`,
      html: emailHtml,
    });

    if (sendError) {
      console.error('Error sending admin notification emails:', sendError);
    } else {
      console.log(`Admin notification emails sent to ${adminEmails.length} admin(s)`);
    }
  } catch (error) {
    console.error('Exception sending admin emails:', error);
  }
}
