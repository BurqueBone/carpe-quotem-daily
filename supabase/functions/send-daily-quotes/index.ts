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

    // Get the email template for daily inspiration
    const { data: emailTemplate, error: templateError } = await supabase
      .from('email_templates')
      .select('subject, html_content')
      .eq('template_name', 'daily_inspiration')
      .eq('is_active', true)
      .maybeSingle();

    if (templateError) {
      console.error('Error fetching email template:', templateError);
      throw templateError;
    }

    if (!emailTemplate) {
      console.error('No daily_inspiration email template found');
      throw new Error('Email template not found');
    }

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

        // Generate email HTML using template
        const emailHTML = generateEmailFromTemplate(emailTemplate.html_content, quote, randomResource);

        // Send email using Resend
        const emailResponse = await resend.emails.send({
          from: "Sunday4k <info@sunday4k.life>",
          reply_to: "info@sunday4k.life",
          to: [userEmail],
          subject: emailTemplate.subject,
          html: emailHTML,
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

function generateEmailFromTemplate(template: string, quote: any, resource: any = null): string {
  let emailHTML = template;
  
  // Replace quote placeholders
  emailHTML = emailHTML.replace(/\{\{quote_text\}\}/g, quote.quote || '');
  emailHTML = emailHTML.replace(/\{\{quote_author\}\}/g, quote.author || '');
  emailHTML = emailHTML.replace(/\{\{quote_source\}\}/g, quote.source ? `, ${quote.source}` : '');
  
  // Handle resource section
  if (resource) {
    const resourceSection = `
      <div class="resource-container">
        <div class="resource-header">💡 Seize the Day Suggestion</div>
        <div class="resource-category">${resource.categories?.title || 'Personal Growth'} • ${resource.type || 'Resource'}</div>
        <div class="resource-title">${resource.title}</div>
        <div class="resource-description">${resource.description}</div>
        <a href="${resource.url}" class="resource-link" target="_blank">Learn More</a>
      </div>
    `;
    emailHTML = emailHTML.replace(/\{\{resource_section\}\}/g, resourceSection);
  } else {
    emailHTML = emailHTML.replace(/\{\{resource_section\}\}/g, '');
  }
  
  return emailHTML;
}