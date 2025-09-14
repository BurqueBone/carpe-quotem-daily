import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

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

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipientEmail, quote, author, source }: ShareQuoteRequest = await req.json();

    console.log('Sending quote email to:', recipientEmail);

    // Generate email HTML content
    const emailHTML = `
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
                  "${quote}"
                </blockquote>
                <footer style="margin-top: 20px; text-align: right; color: #666; font-size: 16px;">
                  — <strong>${author}</strong>${source ? `, ${source}` : ''}
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

    const emailResponse = await resend.emails.send({
      from: "Sunday4K <quotes@sunday4k.life>",
      to: [recipientEmail],
      subject: "A friend shared this inspiring quote with you",
      html: emailHTML,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in share-quote-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);