-- Insert missing email templates for edge functions

-- Daily inspiration template for send-daily-quotes function
INSERT INTO public.email_templates (
  template_name,
  subject,
  description,
  html_content,
  is_active
) VALUES (
  'daily_inspiration',
  'Your Daily Inspiration from Sunday4k',
  'Template for daily quote emails sent to subscribers',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Daily Inspiration</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; background-color: #ffffff; margin: 0; padding: 12px; }
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
        Here''s your daily inspiration:
      </div>
      
      <div class="quote-container">
        <div class="quote">"{{quote_text}}"</div>
        <div class="author">— {{quote_author}}{{quote_source}}</div>
      </div>
      
      <div class="message">
        Take a moment to reflect on these words. How can you apply this wisdom to create more meaning in your day?
      </div>
      
      {{resource_section}}
      
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
</html>',
  true
);

-- Magic link template for send-auth-email function
INSERT INTO public.email_templates (
  template_name,
  subject,
  description,
  html_content,
  is_active
) VALUES (
  'magic_link',
  'Your Sunday4k Login Link',
  'Template for magic link authentication emails',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sunday4k</title>
  <style>
    body {
        font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif;
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
    <div class="content">
      <h1 style="color: #1f2937; font-size: 24px; margin-bottom: 20px;">Your Sunday4k Login Link</h1>
      
      <p class="message">
        Click the button below to securely log in to your Sunday4k account:
      </p>
      
      <div class="cta">
        <a href="{{login_url}}" class="cta-button">Log In to Sunday4k</a>
      </div>
      
      <p class="message" style="font-size: 14px; color: #6b7280;">
        This link will expire in 1 hour for security reasons.
      </p>
      
      <p class="message" style="font-size: 14px; color: #6b7280;">
        Or copy and paste this link into your browser:<br>
        <a href="{{login_url}}" style="color: #9381ff; word-break: break-all;">{{login_url}}</a>
      </p>
    </div>
    <div class="footer">
      <p>Sunday4k - Inspiring meaningful living, one Sunday at a time.</p>
      <p class="links">
        <a href="https://sunday4k.life">Visit Sunday4k</a> ·
        <a href="mailto:info@sunday4k.life">Contact Us</a>
      </p>
    </div>
  </div>
</body>
</html>',
  true
);

-- Invite template for send-auth-email function
INSERT INTO public.email_templates (
  template_name,
  subject,
  description,
  html_content,
  is_active
) VALUES (
  'invite',
  'You''re Invited to Join Sunday4k',
  'Template for user invitation emails',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sunday4k</title>
  <style>
    body {
        font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif;
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
    <div class="content">
      <h1 style="color: #1f2937; font-size: 24px; margin-bottom: 20px;">You''re Invited to Sunday4k</h1>
      
      <p class="message">
        You''ve been invited to join Sunday4k, a community dedicated to meaningful living and daily inspiration.
      </p>
      
      <p class="message">
        Accept your invitation to start receiving daily quotes and access resources for personal growth:
      </p>
      
      <div class="cta">
        <a href="{{invite_url}}" class="cta-button">Accept Invitation</a>
      </div>
      
      <p class="message" style="font-size: 14px; color: #6b7280;">
        This invitation will expire in 24 hours for security reasons.
      </p>
      
      <p class="message" style="font-size: 14px; color: #6b7280;">
        Or copy and paste this link into your browser:<br>
        <a href="{{invite_url}}" style="color: #9381ff; word-break: break-all;">{{invite_url}}</a>
      </p>
    </div>
    <div class="footer">
      <p>Sunday4k - Inspiring meaningful living, one Sunday at a time.</p>
      <p class="links">
        <a href="https://sunday4k.life">Visit Sunday4k</a> ·
        <a href="mailto:info@sunday4k.life">Contact Us</a>
      </p>
    </div>
  </div>
</body>
</html>',
  true
);

-- Broadcast template for broadcast-email function
INSERT INTO public.email_templates (
  template_name,
  subject,
  description,
  html_content,
  is_active
) VALUES (
  'broadcast',
  'Your Sunday4k Daily Inspiration',
  'Template for broadcast emails with customizable content',
  '<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{{subject}}</title>
    <meta name="color-scheme" content="light only" />
    <style>
      body { margin:0; padding:0; background:#F8F7FF; font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,Arial,sans-serif; color:#1f2937; }
      .container { width:100%; background:#F8F7FF; padding:24px 0; }
      .card { max-width:640px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow: 0 6px 24px rgba(147,129,255,0.18); }
      .header { background: linear-gradient(135deg, #9381ff, #B8B8FF); padding: 40px 30px; text-align:center; color:#fff; }
      .logo { font-size:28px; font-weight:800; letter-spacing:0.2px; }
      .tagline { opacity:0.95; font-size:14px; margin-top:6px; }
      .preheader { display:none !important; visibility:hidden; opacity:0; color:transparent; height:0; width:0; }
      .content { padding: 36px 30px; }
      .intro { font-size:16px; color:#374151; margin: 0 0 16px; }
      .quote-wrap { background:#FFEEDD; border-left:4px solid #9381ff; padding:22px; border-radius:10px; margin: 20px 0; }
      .quote { font-size:22px; line-height:1.5; font-style: italic; color:#111827; margin:0 0 10px; }
      .author { font-size:14px; color:#4b5563; text-align:right; margin:0; }
      .cta { text-align:center; margin: 28px 0 6px; }
      .cta a { display:inline-block; text-decoration:none; font-weight:700; color:#fff; background: linear-gradient(135deg, #9381ff, #B8B8FF); padding: 14px 26px; border-radius:10px; box-shadow:0 8px 18px rgba(147,129,255,0.28); }
      .divider { height:1px; background: #FFD8BE; opacity:0.65; margin: 8px 30px; }
      .footer { background:#FFD8BE; padding: 22px 30px; text-align:center; color:#5b5b5b; font-size:13px; }
      .links a { color:#9381ff; text-decoration:none; }
    </style>
  </head>
  <body>
    <span class="preheader">{{preheader}}</span>
    <div class="container">
      <div class="card">
        <div class="header">
          <div class="logo">Sunday4k</div>
          <div class="tagline">Daily inspiration for meaningful living</div>
        </div>
        <div class="content">
          <p class="intro">Here''s your daily reminder to live fully and meaningfully:</p>
          <div class="quote-wrap">
            <div class="quote">"{{quote_text}}"</div>
            <p class="author">— {{quote_author}}{{quote_source}}</p>
          </div>
          <p class="intro">Take a moment to reflect on these words. How might you bring a little more intention, kindness, or courage into today?</p>
          <div class="cta">
            <a href="{{cta_url}}" target="_blank" rel="noopener">Explore Sunday4k Resources</a>
          </div>
        </div>
        <div class="divider"></div>
        <div class="footer">
          <p>You''re receiving this because you subscribed to Sunday4k daily inspiration.</p>
          <p class="links"><a href="https://sunday4k.life">Visit Sunday4k</a> · <a href="#">Update preferences</a> · <a href="#">Unsubscribe</a></p>
        </div>
      </div>
    </div>
  </body>
</html>',
  true
);

-- Share quote template for share-quote-email function
INSERT INTO public.email_templates (
  template_name,
  subject,
  description,
  html_content,
  is_active
) VALUES (
  'share_quote',
  'A friend shared this inspiring quote with you',
  'Template for sharing quotes via email',
  '<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>A Friend Shared This Inspiring Quote</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background-color: #f8f9fa;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #9381ff, #b8b8ff); padding: 40px 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Sunday4K</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">A friend thought you''d love this quote</p>
      </div>
      
      <!-- Quote Content -->
      <div style="padding: 40px 30px;">
        <div style="background-color: #f8f7ff; border-left: 4px solid #9381ff; padding: 30px; margin: 20px 0; border-radius: 8px;">
          <blockquote style="margin: 0; font-size: 20px; line-height: 1.6; color: #333; font-style: italic;">
            "{{quote_text}}"
          </blockquote>
          <footer style="margin-top: 20px; text-align: right; color: #666; font-size: 16px;">
            — <strong>{{quote_author}}</strong>{{quote_source}}
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
</html>',
  true
);