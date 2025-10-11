import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.1";
import { processTemplateVariables, buildTemplateContext } from "../shared/template-processor.ts";
import { maskEmail } from '../shared/email-masking.ts';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ShareQuoteRequest {
  recipientEmail: string;
  quote: string;
  author: string;
  source?: string;
}

interface RateLimitRecord {
  user_id: string;
  action: string;
  attempts: number;
  window_start: string;
}

// Enhanced email validation
const validateEmail = (email: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!email.trim()) {
    errors.push('Email is required');
  } else if (!emailRegex.test(email)) {
    errors.push('Please enter a valid email address');
  } else if (email.length > 254) {
    errors.push('Email address is too long');
  }
  
  if (email.includes('..') || email.startsWith('.') || email.endsWith('.')) {
    errors.push('Email format is invalid');
  }
  
  return { isValid: errors.length === 0, errors };
};

// Input sanitization
const sanitizeInput = (input: string): string => {
  return input
    .replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script>/gi, '')
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=\s*/gi, '')
    .replace(/url\((.*?)\)/gi, 'url()')
    .replace(/['"`]/g, '')
    .trim();
};

// Rate limiting check
const checkRateLimit = async (supabase: any, userId: string): Promise<boolean> => {
  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxAttempts = 5;
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowMs);

  try {
    // Check current attempts in the window
    const { data: rateLimitData, error } = await supabase
      .from('security_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('action', 'SHARE_QUOTE')
      .gte('timestamp', windowStart.toISOString())
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Rate limit check error:', error);
      return true; // Allow on error to avoid blocking legitimate users
    }

    const attemptCount = rateLimitData?.length || 0;
    return attemptCount < maxAttempts;
  } catch (error) {
    console.error('Rate limit check failed:', error);
    return true; // Allow on error
  }
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    // Get user from authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization required' }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Invalid authorization' }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { recipientEmail, quote, author, source }: ShareQuoteRequest = await req.json();

    // Validate and sanitize inputs
    const emailValidation = validateEmail(recipientEmail);
    if (!emailValidation.isValid) {
      return new Response(JSON.stringify({ error: emailValidation.errors[0] }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Check rate limits
    const rateLimitPassed = await checkRateLimit(supabase, user.id);
    if (!rateLimitPassed) {
      // Log rate limit violation
      await supabase.from('security_logs').insert({
        user_id: user.id,
        action: 'SHARE_QUOTE_BLOCKED',
        table_name: 'rate_limit',
        target_user_id: null,
        timestamp: new Date().toISOString()
      });

      return new Response(JSON.stringify({ error: 'Too many share attempts. Please wait before trying again.' }), {
        status: 429,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Sanitize inputs
    const sanitizedQuote = sanitizeInput(quote);
    const sanitizedAuthor = sanitizeInput(author);
    const sanitizedSource = source ? sanitizeInput(source) : undefined;
    const sanitizedEmail = sanitizeInput(recipientEmail);

    console.log('Sending quote email to:', maskEmail(sanitizedEmail));

    // Log the share attempt
    await supabase.from('security_logs').insert({
      user_id: user.id,
      action: 'SHARE_QUOTE',
      table_name: 'email_share',
      target_user_id: null,
      timestamp: new Date().toISOString()
    });

    // Get a random resource from the database to include in the email
    const { data: randomResource } = await supabase
      .from('resources')
      .select('id, title, description, url, type, how_resource_helps, category_id')
      .eq('ispublished', true)
      .limit(1)
      .single();

    let resourceWithCategory = null;
    if (randomResource) {
      // Get the category title for the resource
      const { data: category } = await supabase
        .from('categories')
        .select('title, icon_name')
        .eq('id', randomResource.category_id)
        .single();

      resourceWithCategory = {
        ...randomResource,
        category: { 
          title: category?.title || '',
          icon_name: category?.icon_name || null
        }
      };
    }

    // Get the share quote email template from database
    const { data: emailTemplate, error: templateError } = await supabase
      .from('email_templates')
      .select('subject, html_content')
      .eq('template_name', 'share_quote')
      .eq('is_active', true)
      .maybeSingle();

    // Fetch template variables
    const { data: templateVariables } = await supabase
      .from('template_variables')
      .select('*')
      .eq('is_active', true);

    let emailHTML: string;
    let subject: string;

    if (emailTemplate) {
      // Use template from database with proper variable processing
      subject = emailTemplate.subject;
      
      // Build template context with nested structure
      const context = buildTemplateContext(
        {
          quote: sanitizedQuote,
          author: sanitizedAuthor,
          source: sanitizedSource
        },
        resourceWithCategory,
        sanitizedEmail
      );
      
      // Process template variables
      emailHTML = processTemplateVariables(
        emailTemplate.html_content,
        context,
        templateVariables || []
      );
    } else {
      // Fallback to hardcoded template
      console.warn('No share_quote template found, using fallback');
      subject = "A friend shared this inspiring quote with you";
      emailHTML = generateFallbackEmailHTML(sanitizedQuote, sanitizedAuthor, sanitizedSource);
    }

    const emailResponse = await resend.emails.send({
      from: "Sunday4K <quotes@sunday4k.life>",
      to: [sanitizedEmail],
      subject,
      html: emailHTML,
    });

    console.log("Email sent successfully");

    // Log successful share
    await supabase.from('security_logs').insert({
      user_id: user.id,
      action: 'SHARE_QUOTE_SUCCESS',
      table_name: 'email_share',
      target_user_id: null,
      timestamp: new Date().toISOString()
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in share-quote-email function:", error);
    
    // Log error for security monitoring
    try {
      await supabase.from('security_logs').insert({
        user_id: null,
        action: 'SHARE_QUOTE_ERROR',
        table_name: 'email_share',
        target_user_id: null,
        timestamp: new Date().toISOString()
      });
    } catch (logError) {
      console.error("Failed to log error:", logError);
    }

    return new Response(
      JSON.stringify({ error: 'Failed to send email. Please try again later.' }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

// Legacy function - no longer used, kept for reference
// Template processing now handled by shared/template-processor.ts

// Fallback function (kept for backward compatibility)
function generateFallbackEmailHTML(sanitizedQuote: string, sanitizedAuthor: string, sanitizedSource?: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>A Friend Shared This Inspiring Quote</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background-color: #f8f9fa;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #9381ff, #b8b8ff); padding: 40px 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Sunday4K</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">A friend thought you'd love this quote</p>
          </div>
          
          <!-- Quote Content -->
          <div style="padding: 40px 30px;">
            <div style="background-color: #f8f7ff; border-left: 4px solid #9381ff; padding: 30px; margin: 20px 0; border-radius: 8px;">
              <blockquote style="margin: 0; font-size: 20px; line-height: 1.6; color: #333; font-style: italic;">
                "${sanitizedQuote}"
              </blockquote>
              <footer style="margin-top: 20px; text-align: right; color: #666; font-size: 16px;">
                — <strong>${sanitizedAuthor}</strong>${sanitizedSource ? `, ${sanitizedSource}` : ''}
              </footer>
            </div>
            
            <!-- Call to Action -->
            <div style="text-align: center; margin: 40px 0;">
              <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
                Get daily inspiration like this delivered to your inbox
              </p>
              <a href="https://sunday4k.life/auth" 
                 style="display: inline-block; background: linear-gradient(135deg, #9381ff, #b8b8ff); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; font-size: 16px;">
                Start Your Daily Inspiration
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 14px; margin: 0;">
              This quote was shared from <a href="https://sunday4k.life" style="color: #9381ff; text-decoration: none;">Sunday4K</a> - Daily inspiration for meaningful living
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

serve(handler);