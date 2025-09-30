import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0';
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
const hookSecret = Deno.env.get('SUPABASE_AUTH_WEBHOOK_SECRET') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload = await req.text();
    const headers = Object.fromEntries(req.headers);

    // Verify webhook signature if secret is configured
    if (hookSecret) {
      const wh = new Webhook(hookSecret);
      try {
        wh.verify(payload, headers);
      } catch (error) {
        console.error('Webhook verification failed:', error);
        return new Response('Unauthorized', { status: 401, headers: corsHeaders });
      }
    }

    const webhookData = JSON.parse(payload);
    console.log('Auth webhook received:', webhookData);

    const {
      user,
      email_data: { 
        token, 
        token_hash, 
        redirect_to, 
        email_action_type,
        site_url 
      }
    } = webhookData;

    if (!user?.email) {
      throw new Error('No user email found in webhook data');
    }

    // Detect if this is an OTP code (6-digit token) vs magic link
    const isOtpCode = token && /^\d{6}$/.test(token);
    
    // Map email action types to template names
    let templateName: string;
    switch (email_action_type) {
      case 'signup':
        templateName = 'signup';
        break;
      case 'recovery':
        templateName = 'password_reset';
        break;
      case 'invite':
        templateName = 'invite';
        break;
      case 'magiclink':
      case 'magic_link':
        // Use login_code template for OTP codes, magic_link for actual links
        templateName = isOtpCode ? 'login_code' : 'magic_link';
        break;
      default:
        // Fallback to a generic template or use signup
        templateName = 'signup';
    }

    // Get the email template from database
    const { data: emailTemplate, error: templateError } = await supabase
      .from('email_templates')
      .select('subject, html_content')
      .eq('template_name', templateName)
      .eq('is_active', true)
      .maybeSingle();

    if (templateError) {
      console.error('Error fetching email template:', templateError);
      throw templateError;
    }

    let subject: string;
    let html: string;

    if (emailTemplate) {
      // Use template from database
      subject = emailTemplate.subject;
      html = generateEmailFromTemplate(
        emailTemplate.html_content, 
        token, 
        token_hash, 
        redirect_to, 
        site_url, 
        email_action_type
      );
    } else {
      // Fallback to hardcoded templates if not found
      console.warn(`No template found for ${templateName}, using fallback`);
      if (templateName === 'login_code') {
        subject = 'Your Sunday4k Login Code';
        html = generateLoginCodeEmailHTML(token);
      } else {
        switch (email_action_type) {
          case 'signup':
            subject = 'Welcome to Sunday4k - Confirm Your Email';
            html = generateSignupEmailHTML(token, token_hash, redirect_to, site_url);
            break;
          case 'recovery':
            subject = 'Reset Your Sunday4k Password';
            html = generatePasswordResetEmailHTML(token, token_hash, redirect_to, site_url);
            break;
          case 'invite':
            subject = 'You\'re Invited to Join Sunday4k';
            html = generateInviteEmailHTML(token, token_hash, redirect_to, site_url);
            break;
          case 'magiclink':
          case 'magic_link':
            subject = 'Your Sunday4k Magic Link';
            html = generateMagicLinkEmailHTML(token, token_hash, redirect_to, site_url);
            break;
          default:
            subject = 'Sunday4k Authentication';
            html = generateGenericAuthEmailHTML(token, token_hash, redirect_to, site_url, email_action_type);
        }
      }
    }

    const { error } = await resend.emails.send({
      from: "Sunday4k <info@sunday4k.life>",
      reply_to: "info@sunday4k.life",
      to: [user.email],
      subject,
      html,
    });

    if (error) {
      throw error;
    }

    console.log(`Auth email sent successfully to ${user.email.charAt(0)}***@${user.email.split('@')[1]?.charAt(0)}*** for ${email_action_type}`);

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in send-auth-email function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: (error as Error).message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function generateEmailFromTemplate(
  template: string, 
  token: string, 
  token_hash: string, 
  redirect_to: string, 
  site_url: string, 
  email_action_type: string
): string {
  const authBase = site_url.includes('/auth/v1') ? site_url.replace(/\/$/, '') : `${site_url.replace(/\/$/, '')}/auth/v1`;
  
  let actionUrl: string;
  switch (email_action_type) {
    case 'signup':
      actionUrl = `${authBase}/verify?token=${token_hash}&type=signup&redirect_to=${encodeURIComponent(redirect_to)}`;
      break;
    case 'recovery':
      actionUrl = `${authBase}/verify?token=${token_hash}&type=recovery&redirect_to=${encodeURIComponent(redirect_to)}`;
      break;
    case 'invite':
      actionUrl = `${authBase}/verify?token=${token_hash}&type=invite&redirect_to=${encodeURIComponent(redirect_to)}`;
      break;
    case 'magiclink':
    case 'magic_link':
      actionUrl = `${authBase}/verify?token=${token_hash}&type=magiclink&redirect_to=${encodeURIComponent(redirect_to)}`;
      break;
    default:
      actionUrl = `${authBase}/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${encodeURIComponent(redirect_to)}`;
  }

  let emailHTML = template;
  
  // Replace common placeholders
  emailHTML = emailHTML.replace(/\{\{confirmation_url\}\}/g, actionUrl);
  emailHTML = emailHTML.replace(/\{\{reset_password_url\}\}/g, actionUrl);
  emailHTML = emailHTML.replace(/\{\{login_url\}\}/g, actionUrl);
  emailHTML = emailHTML.replace(/\{\{invite_url\}\}/g, actionUrl);
  emailHTML = emailHTML.replace(/\{\{action_url\}\}/g, actionUrl);
  emailHTML = emailHTML.replace(/\{\{code\}\}/g, token);
  emailHTML = emailHTML.replace(/\{\{token\}\}/g, token);
  
  return emailHTML;
}

// Fallback functions (kept for backward compatibility)
function generateLoginCodeEmailHTML(token: string): string {
  return `
    ${getEmailHeader()}
    <div class="content">
      <h1 style="color: #1f2937; font-size: 24px; margin-bottom: 20px;">Your Sunday4k Login Code</h1>
      
      <p class="message">
        Use the code below to complete your sign in:
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <div style="display: inline-block; background: linear-gradient(135deg, #9381FF 0%, #B8B8FF 100%); padding: 20px 40px; border-radius: 12px; box-shadow: 0 4px 16px rgba(147, 129, 255, 0.3);">
          <div style="font-size: 36px; font-weight: 800; color: #ffffff; letter-spacing: 8px; font-family: 'Courier New', monospace;">
            ${token}
          </div>
        </div>
      </div>
      
      <p class="message" style="font-size: 14px; color: #6b7280; text-align: center;">
        This code will expire in 5 minutes for security reasons.
      </p>
      
      <p class="message" style="font-size: 14px; color: #6b7280; text-align: center;">
        If you didn't request this code, you can safely ignore this email.
      </p>
    </div>
    ${getEmailFooter()}
  `;
}

function generateSignupEmailHTML(token: string, token_hash: string, redirect_to: string, site_url: string): string {
  const authBase = site_url.includes('/auth/v1') ? site_url.replace(/\/$/, '') : `${site_url.replace(/\/$/, '')}/auth/v1`;
  const confirmUrl = `${authBase}/verify?token=${token_hash}&type=signup&redirect_to=${encodeURIComponent(redirect_to)}`;
  
  return `
    ${getEmailHeader()}
    <div class="content">
      <h1 style="color: #1f2937; font-size: 24px; margin-bottom: 20px;">Welcome to Sunday4k!</h1>
      
      <p class="message">
        Thank you for joining our community of people living meaningfully. We're excited to have you on this journey.
      </p>
      
      <p class="message">
        To complete your registration and start receiving daily inspiration, please confirm your email address:
      </p>
      
      <div class="cta">
        <a href="${confirmUrl}" class="cta-button">Confirm Your Email</a>
      </div>
      
      <p class="message" style="font-size: 14px; color: #6b7280;">
        This link will expire in 1 hour for security reasons.
      </p>
      
      <p class="message" style="font-size: 14px; color: #6b7280;">
        Or copy and paste this link into your browser:<br>
        <a href="${confirmUrl}" style="color: #9381ff; word-break: break-all;">${confirmUrl}</a>
      </p>
    </div>
    ${getEmailFooter()}
  `;
}

function generatePasswordResetEmailHTML(token: string, token_hash: string, redirect_to: string, site_url: string): string {
  const authBase = site_url.includes('/auth/v1') ? site_url.replace(/\/$/, '') : `${site_url.replace(/\/$/, '')}/auth/v1`;
  const resetUrl = `${authBase}/verify?token=${token_hash}&type=recovery&redirect_to=${encodeURIComponent(redirect_to)}`;
  
  return `
    ${getEmailHeader()}
    <div class="content">
      <h1 style="color: #1f2937; font-size: 24px; margin-bottom: 20px;">Reset Your Sunday4k Password</h1>
      
      <p class="message">
        We received a request to reset your password for your Sunday4k account.
      </p>
      
      <p class="message">
        Click the button below to create a new password:
      </p>
      
      <div class="cta">
        <a href="${resetUrl}" class="cta-button">Reset Password</a>
      </div>
      
      <p class="message" style="font-size: 14px; color: #6b7280;">
        This link will expire in 1 hour for security reasons.
      </p>
      
      <p class="message" style="font-size: 14px; color: #6b7280;">
        If you didn't request this password reset, you can safely ignore this email.
      </p>
      
      <p class="message" style="font-size: 14px; color: #6b7280;">
        Or copy and paste this link into your browser:<br>
        <a href="${resetUrl}" style="color: #9381ff; word-break: break-all;">${resetUrl}</a>
      </p>
    </div>
    ${getEmailFooter()}
  `;
}

function generateMagicLinkEmailHTML(token: string, token_hash: string, redirect_to: string, site_url: string): string {
  const authBase = site_url.includes('/auth/v1') ? site_url.replace(/\/$/, '') : `${site_url.replace(/\/$/, '')}/auth/v1`;
  const loginUrl = `${authBase}/verify?token=${token_hash}&type=magiclink&redirect_to=${encodeURIComponent(redirect_to)}`;
  
  return `
    ${getEmailHeader()}
    <div class="content">
      <h1 style="color: #1f2937; font-size: 24px; margin-bottom: 20px;">Your Sunday4k Login Link</h1>
      
      <p class="message">
        Click the button below to securely log in to your Sunday4k account:
      </p>
      
      <div class="cta">
        <a href="${loginUrl}" class="cta-button">Log In to Sunday4k</a>
      </div>
      
      <p class="message" style="font-size: 14px; color: #6b7280;">
        This link will expire in 1 hour for security reasons.
      </p>
      
      <p class="message" style="font-size: 14px; color: #6b7280;">
        Or copy and paste this link into your browser:<br>
        <a href="${loginUrl}" style="color: #9381ff; word-break: break-all;">${loginUrl}</a>
      </p>
    </div>
    ${getEmailFooter()}
  `;
}

function generateInviteEmailHTML(token: string, token_hash: string, redirect_to: string, site_url: string): string {
  const authBase = site_url.includes('/auth/v1') ? site_url.replace(/\/$/, '') : `${site_url.replace(/\/$/, '')}/auth/v1`;
  const inviteUrl = `${authBase}/verify?token=${token_hash}&type=invite&redirect_to=${encodeURIComponent(redirect_to)}`;
  
  return `
    ${getEmailHeader()}
    <div class="content">
      <h1 style="color: #1f2937; font-size: 24px; margin-bottom: 20px;">You're Invited to Sunday4k</h1>
      
      <p class="message">
        You've been invited to join Sunday4k, a community dedicated to meaningful living and daily inspiration.
      </p>
      
      <p class="message">
        Accept your invitation to start receiving daily quotes and access resources for personal growth:
      </p>
      
      <div class="cta">
        <a href="${inviteUrl}" class="cta-button">Accept Invitation</a>
      </div>
      
      <p class="message" style="font-size: 14px; color: #6b7280;">
        This invitation will expire in 24 hours for security reasons.
      </p>
      
      <p class="message" style="font-size: 14px; color: #6b7280;">
        Or copy and paste this link into your browser:<br>
        <a href="${inviteUrl}" style="color: #9381ff; word-break: break-all;">${inviteUrl}</a>
      </p>
    </div>
    ${getEmailFooter()}
  `;
}

function generateGenericAuthEmailHTML(token: string, token_hash: string, redirect_to: string, site_url: string, action_type: string): string {
  const authBase = site_url.includes('/auth/v1') ? site_url.replace(/\/$/, '') : `${site_url.replace(/\/$/, '')}/auth/v1`;
  const actionUrl = `${authBase}/verify?token=${token_hash}&type=${action_type}&redirect_to=${encodeURIComponent(redirect_to)}`;
  
  return `
    ${getEmailHeader()}
    <div class="content">
      <h1 style="color: #1f2937; font-size: 24px; margin-bottom: 20px;">Sunday4k Authentication</h1>
      
      <p class="message">
        Please click the button below to continue with your authentication:
      </p>
      
      <div class="cta">
        <a href="${actionUrl}" class="cta-button">Continue</a>
      </div>
      
      <p class="message" style="font-size: 14px; color: #6b7280;">
        This link will expire in 1 hour for security reasons.
      </p>
      
      <p class="message" style="font-size: 14px; color: #6b7280;">
        Or copy and paste this link into your browser:<br>
        <a href="${actionUrl}" style="color: #9381ff; word-break: break-all;">${actionUrl}</a>
      </p>
    </div>
    ${getEmailFooter()}
  `;
}

function getEmailHeader(): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Sunday4k</title>
      <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #2d3748;
            margin: 0;
            padding: 0;
            background-color: #F8F7FF;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #F8F7FF;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(147, 129, 255, 0.15);
        }

        .header {
            background-color: #F8F7FF;
            padding: 40px 30px;
            text-align: center;
            color: #9381FF;
        }

        .logo {
            font-size: 28px;
            font-weight: 800;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }

        .content {
            padding: 10px 30px;
        }

        .message {
            font-size: 16px;
            color: #1F2937;
            margin: 22px 0;
        }

        .cta {
            text-align: center;
            margin: 30px 0;
        }

        .cta-button {
            display: inline-block;
            background-color: #FFD8BE;
            color: #ffffff;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 10px;
            font-weight: 700;
            font-size: 16px;
            box-shadow: 0 6px 16px rgba(147, 129, 255, 0.25);
        }

        .footer {
            background-color: #FFEEDD;
            padding: 24px 30px;
            text-align: center;
            font-size: 13px;
            color: #5b5b5b;
        }

        .links a {
            color: #9381ff;
            text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Sunday4k</div>
          <div class="tagline">Daily inspiration for meaningful living</div>
        </div>
  `;
}

function getEmailFooter(): string {
  return `
        <div class="footer">
          <p>Sunday4k - Inspiring meaningful living, one Sunday at a time.</p>
          <p class="links">
            <a href="https://sunday4k.life">Visit Sunday4k</a> ·
            <a href="mailto:info@sunday4k.life">Contact Us</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}