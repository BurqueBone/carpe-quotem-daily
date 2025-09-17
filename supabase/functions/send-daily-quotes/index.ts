import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';
import { Resend } from "npm:resend@4.0.0";

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

interface UserToEmail {
  user_id: string;
  email: string;
}

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

// Ensure an audience exists in Resend and return its ID
async function getOrCreateAudience(name: string): Promise<string> {
  // Prefer explicit audience via env to avoid SDK capability differences
  const envId = Deno.env.get('RESEND_AUDIENCE_ID');
  if (envId) {
    return envId;
  }
  // Guard if audiences API is not available in this SDK/runtime
  // @ts-ignore
  const hasAudiences = typeof (resend as any)?.audiences?.list === 'function' && typeof (resend as any)?.audiences?.create === 'function';
  if (!hasAudiences) {
    console.log('Resend audiences API not available; skipping audience creation.');
    return '';
  }
  try {
    // @ts-ignore
    const listed = await (resend as any).audiences.list();
    const arr: any[] = listed?.data?.data || listed?.data || [];
    const existing = arr.find((a: any) => a?.name === name);
    if (existing?.id) return existing.id as string;
  } catch (e) {
    console.log('audiences.list error:', e);
  }
  try {
    // @ts-ignore
    const created = await (resend as any).audiences.create({ name });
    // @ts-ignore
    return created?.data?.id || created?.id || '';
  } catch (e) {
    console.error('audiences.create error:', e);
    return '';
  }
}

// Create contact if not present, ignore "already exists" errors
async function ensureContactInAudience(email: string, audienceId: string): Promise<void> {
  if (!email || !audienceId) return;
  try {
    // @ts-ignore
    const res = await resend.contacts.create({ audienceId, email });
    // If SDK returns an error object, handle gracefully
    // @ts-ignore
    if (res?.error && String(res.error.message || '').toLowerCase().includes('already')) {
      return;
    }
  } catch (e: any) {
    const msg = String(e?.message || '').toLowerCase();
    if (msg.includes('already')) return;
    console.warn('ensureContactInAudience failed:', e);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting daily quote sending process...');

    // Get today's quote from the database
    const { data: quote, error: quoteError } = await supabase
      .rpc('get_random_quote_and_track')
      .single();

    if (quoteError) {
      console.error('Error fetching quote:', quoteError);
      throw quoteError;
    }

    if (!quote) {
      throw new Error('No quote found');
    }

    console.log('Got quote:', quote.id);

    // Get a random resource to include as a "seize the day" suggestion
    const { data: resource, error: resourceError } = await supabase
      .from('resources')
      .select('title, description, url, type, categories(title)')
      .eq('ispublished', true)
      .order('id', { ascending: false }) // Use a simple order to make it deterministic
      .limit(10);

    let randomResource = null;
    if (!resourceError && resource && resource.length > 0) {
      // Pick a random resource from the first 10
      const randomIndex = Math.floor(Math.random() * resource.length);
      randomResource = resource[randomIndex];
      console.log('Got resource:', randomResource.title);
    } else {
      console.warn('No resources found or error fetching resources:', resourceError);
    }

    // Ensure Resend audience exists and get its ID
    const audienceId = await getOrCreateAudience('Sunday4k Subscribers');

    // Get users who should receive emails (enabled notifications only)
    const { data: usersToEmail, error: usersError } = await supabase
      .from('notification_settings')
      .select('user_id')
      .eq('enabled', true);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw usersError;
    }

    console.log(`Found ${usersToEmail?.length || 0} users with notifications enabled`);

    let emailsSent = 0;
    const errors: string[] = [];

    for (const userSetting of usersToEmail || []) {
      try {
        // Fetch user's email from public.profiles (auth schema is not exposed via PostgREST)
        const { data: userProfile, error: userFetchError } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', userSetting.user_id)
          .maybeSingle();
        if (userFetchError || !userProfile?.email) {
          console.warn(`No email found for user ${userSetting.user_id}`, userFetchError);
          continue;
        }
        const userEmail = userProfile.email as string;
        
        // Check if user should receive an email today
        const shouldSend = await checkUserQuota(supabase, userSetting.user_id);
        
        if (!shouldSend) {
          console.log(`Skipping user ${userSetting.user_id} - quota reached or not time yet`);
          continue;
        }

        // Ensure contact exists in Resend audience
        await ensureContactInAudience(userEmail, audienceId);

        // Send email using Resend
        const emailResponse = await resend.emails.send({
          from: "Sunday4k <info@sunday4k.life>",
          reply_to: "info@sunday4k.life",
          to: [userEmail],
          subject: "Your Daily Inspiration from Sunday4k",
          html: generateEmailHTML(quote, randomResource),
        });

        console.log('Email sent successfully to:', `${userEmail.charAt(0)}***@${userEmail.split('@')[1]?.charAt(0)}***`, emailResponse);

        // Track the email send
        await supabase
          .from('notification_sends')
          .insert({
            user_id: userSetting.user_id,
            quote_id: quote.id,
          });

        emailsSent++;
      } catch (error) {
        console.error(`Error sending email to user ${userSetting.user_id}:`, error);
        errors.push(`User ${userSetting.user_id}: ${error.message}`);
      }
    }

    console.log(`Process completed. Emails sent: ${emailsSent}, Errors: ${errors.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        emailsSent,
        errors,
        quote: {
          id: quote.id,
          text: quote.quote,
          author: quote.author,
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in send-daily-quotes function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

// Check if user should receive email today (simplified to once daily)
async function checkUserQuota(supabase: any, userId: string): Promise<boolean> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Count emails sent today
  const { data: sends, error } = await supabase
    .from('notification_sends')
    .select('sent_at')
    .eq('user_id', userId)
    .gte('sent_at', today.toISOString());
    
  if (error) {
    console.error('Error checking user quota:', error);
    return false;
  }
  
  // Return true if no email sent today
  return !sends || sends.length === 0;
}

function generateEmailHTML(quote: any, resource: any = null): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Daily Inspiration</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; background-color: #ffffff; margin: 0; padding: 12px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { padding: 40px 0; text-align: center; }
        .logo { color: #333; font-size: 24px; font-weight: bold; margin-bottom: 14px; }
        .tagline { color: #898989; font-size: 12px; line-height: 22px; margin-top: 12px; margin-bottom: 24px; }
        .content { padding: 0 12px; }
        .greeting { color: #333; font-size: 24px; font-weight: bold; margin: 40px 0; padding: 0; }
        .quote-container { background-color: #f4f4f4; border-radius: 5px; border: 1px solid #eee; padding: 16px 4.5%; width: 90.5%; margin: 24px 0; display: inline-block; }
        .quote { font-size: 18px; font-style: italic; color: #333; margin-bottom: 15px; line-height: 1.5; }
        .author { font-size: 14px; color: #333; text-align: right; }
        .message { font-size: 14px; color: #333; margin: 24px 0; line-height: 1.6; }
        .resource-container { background-color: #ffffff; border: 1px solid #eee; padding: 25px; border-radius: 5px; margin: 30px 0; }
        .resource-header { color: #333; font-size: 16px; margin-bottom: 15px; font-weight: 600; }
        .resource-category { font-size: 12px; color: #898989; margin-bottom: 5px; }
        .resource-type { font-size: 12px; color: #9381ff; font-weight: 500; }
        .resource-title { font-size: 16px; font-weight: 600; color: #333; margin-bottom: 8px; }
        .resource-description { font-size: 14px; color: #333; margin-bottom: 12px; }
        .resource-link { display: inline-block; background: #9381ff; color: #ffffff; padding: 10px 20px; text-decoration: underline; border-radius: 5px; font-weight: 600; font-size: 14px; }
        .cta { text-align: center; margin: 40px 0; }
        .cta-button { display: inline-block; background: #9381ff; color: #ffffff; text-decoration: underline; padding: 16px 32px; border-radius: 5px; font-weight: 600; font-size: 14px; }
        .footer { padding: 30px 12px; text-align: center; }
        .footer-text { color: #898989; font-size: 12px; line-height: 22px; margin-top: 12px; margin-bottom: 24px; }
        .links a { color: #9381ff; text-decoration: underline; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Sunday4k</div>
          <div class="tagline">Daily inspiration for meaningful living</div>
        </div>
        
        <div class="content">
          <div class="greeting">
            Here's your daily inspiration:
          </div>
          
          <div class="quote-container">
            <div class="quote">"${quote.quote}"</div>
            <div class="author">— ${quote.author}${quote.source ? `, ${quote.source}` : ''}</div>
          </div>
          
          <div class="message">
            Take a moment to reflect on these words. How can you apply this wisdom to create more meaning in your day?
          </div>
          
          ${resource ? `
          <div class="resource-container">
            <div class="resource-header">💡 Seize the Day Suggestion</div>
            <div class="resource-category">${resource.categories?.title || 'Personal Growth'} • ${resource.type || 'Resource'}</div>
            <div class="resource-title">${resource.title}</div>
            <div class="resource-description">${resource.description}</div>
            <a href="${resource.url}" class="resource-link" target="_blank">Learn More</a>
          </div>
          ` : ''}
          
          <div class="cta">
            <a href="https://sunday4k.life/carpe-diem" class="cta-button">Explore More Resources</a>
          </div>
        </div>
        
        <div class="footer">
          <div class="footer-text">
            Sunday4k - Inspiring positive action and reflection
          </div>
          <p class="links">
            <a href="https://sunday4k.life">Visit Sunday4k</a> · 
            <a href="https://sunday4k.life/profile">Update preferences</a> · 
            <a href="https://resend.com/unsubscribe">Unsubscribe</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}