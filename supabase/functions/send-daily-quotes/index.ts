import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UserToEmail {
  user_id: string;
  email: string;
  period: string;
  quantity: number;
}

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

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

    // Get users who should receive emails based on their settings and send history
    const { data: usersToEmail, error: usersError } = await supabase
      .from('notification_settings')
      .select(`
        user_id,
        period,
        quantity,
        profiles!inner(email)
      `)
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
        const userEmail = (userSetting.profiles as any).email;
        
        // Check if user should receive email based on their quota and recent sends
        const shouldSend = await checkUserQuota(supabase, userSetting.user_id, userSetting.period, userSetting.quantity);
        
        if (!shouldSend) {
          console.log(`Skipping user ${userSetting.user_id} - quota reached or not time yet`);
          continue;
        }

        // Send email using Resend
        const emailResponse = await resend.emails.send({
          from: "Sunday4k <noreply@resend.dev>",
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

async function checkUserQuota(supabase: any, userId: string, period: string, quantity: number): Promise<boolean> {
  const now = new Date();
  let startDate: Date;

  // Calculate the start date based on period
  switch (period) {
    case 'day':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      const dayOfWeek = now.getDay();
      startDate = new Date(now.getTime() - (dayOfWeek * 24 * 60 * 60 * 1000));
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  // Count emails sent to this user in the current period
  const { data: sends, error } = await supabase
    .from('notification_sends')
    .select('id')
    .eq('user_id', userId)
    .gte('sent_at', startDate.toISOString());

  if (error) {
    console.error('Error checking user quota:', error);
    return false;
  }

  const sentCount = sends?.length || 0;
  console.log(`User ${userId}: sent ${sentCount}/${quantity} emails in current ${period}`);

  // Check if user has reached their quota
  if (sentCount >= quantity) {
    return false;
  }

  // For multiple emails per period, add some randomization to avoid sending all at once
  if (quantity > 1) {
    const randomFactor = Math.random();
    // Increase chance of sending as we get closer to the end of the period
    const periodProgress = getPeriodProgress(period, now);
    const shouldSendProbability = Math.min(0.8, 0.1 + (periodProgress * 0.7));
    
    return randomFactor < shouldSendProbability;
  }

  return true;
}

function getPeriodProgress(period: string, now: Date): number {
  switch (period) {
    case 'day':
      return now.getHours() / 24;
    case 'week':
      return now.getDay() / 7;
    case 'month':
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      return now.getDate() / daysInMonth;
    default:
      return 0.5;
  }
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
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #9381ff, #b8b8ff); padding: 40px 30px; text-align: center; color: white; }
        .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        .tagline { font-size: 16px; opacity: 0.9; }
        .content { padding: 40px 30px; }
        .quote-container { background: #f8f7ff; border-left: 4px solid #9381ff; padding: 25px; margin: 25px 0; border-radius: 8px; }
        .quote { font-size: 20px; font-style: italic; margin-bottom: 15px; color: #2d3748; }
        .author { font-size: 16px; color: #666; text-align: right; }
        .message { font-size: 16px; color: #4a5568; margin: 25px 0; }
        .cta { text-align: center; margin: 30px 0; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #9381ff, #b8b8ff); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; }
        .footer { background: #f7fafc; padding: 30px; text-align: center; font-size: 14px; color: #666; }
        .unsubscribe { color: #9381ff; text-decoration: none; }
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
            <a href="https://aywuwyqscrtavulqijxm.supabase.co" class="cta-button">Explore More Resources</a>
          </div>
        </div>
        
        <div class="footer">
          <p>You're receiving this because you've subscribed to Sunday4k daily inspiration.</p>
          <p><a href="#" class="unsubscribe">Update your preferences</a> | <a href="#" class="unsubscribe">Unsubscribe</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}