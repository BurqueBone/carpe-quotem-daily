import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
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
