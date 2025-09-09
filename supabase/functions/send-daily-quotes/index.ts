import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
          html: generateEmailHTML(quote),
        });

        console.log('Email sent successfully to:', userEmail, emailResponse);

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

function generateEmailHTML(quote: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Daily Inspiration</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #2d3748; margin: 0; padding: 0; background-color: #F8F7FF; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(147,129,255,0.15); }
        .header { background: linear-gradient(135deg, #9381ff, #b8b8ff); padding: 40px 30px; text-align: center; color: #ffffff; }
        .logo { font-size: 28px; font-weight: 800; letter-spacing: 0.5px; margin-bottom: 8px; }
        .tagline { font-size: 14px; opacity: 0.95; }
        .content { padding: 36px 30px; }
        .quote-container { background: #FFEEDD; border-left: 4px solid #9381ff; padding: 20px; margin: 24px 0; border-radius: 8px; }
        .quote { font-size: 20px; font-style: italic; margin-bottom: 12px; color: #1f2937; }
        .author { font-size: 15px; color: #4b5563; text-align: right; }
        .message { font-size: 16px; color: #374151; margin: 22px 0; }
        .cta { text-align: center; margin: 30px 0; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #9381ff, #b8b8ff); color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 16px; box-shadow: 0 6px 16px rgba(147,129,255,0.25); }
        .footer { background: #FFD8BE; padding: 24px 30px; text-align: center; font-size: 13px; color: #5b5b5b; }
        .links a { color: #9381ff; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Sunday4k</div>
          <div class="tagline">Daily inspiration for meaningful living</div>
        </div>
        
        <div class="content">
          <div class="message">
            Here's your daily reminder to live fully and meaningfully:
          </div>
          
          <div class="quote-container">
            <div class="quote">"${quote.quote}"</div>
            <div class="author">— ${quote.author}${quote.source ? `, ${quote.source}` : ''}</div>
          </div>
          
          <div class="message">
            Take a moment to reflect on these words. How can you apply this wisdom to create more meaning in your day?
          </div>
          
          <div class="cta">
            <a href="https://sunday4k.life" class="cta-button">Explore More Resources</a>
          </div>
        </div>
        
        <div class="footer">
          <p>You're receiving this because you've subscribed to Sunday4k daily inspiration.</p>
          <p class="links"><a href="https://sunday4k.life">Visit Sunday4k</a> · <a href="#">Update preferences</a> · <a href="#">Unsubscribe</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}