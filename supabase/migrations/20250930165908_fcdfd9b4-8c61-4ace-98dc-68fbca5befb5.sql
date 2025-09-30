-- Insert or update the login_code email template
INSERT INTO email_templates (template_name, subject, html_content, description, is_active, created_at, updated_at)
VALUES (
  'login_code',
  'Your Sunday4k Login Code',
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
    .tagline {
      font-size: 14px;
      color: #9381FF;
    }
    .content {
      padding: 10px 30px;
    }
    .message {
      font-size: 16px;
      color: #1F2937;
      margin: 22px 0;
    }
    .code-container {
      text-align: center;
      margin: 30px 0;
    }
    .code-box {
      display: inline-block;
      background: linear-gradient(135deg, #9381FF 0%, #B8B8FF 100%);
      padding: 24px 48px;
      border-radius: 16px;
      box-shadow: 0 8px 24px rgba(147, 129, 255, 0.35);
    }
    .code {
      font-size: 40px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: 12px;
      font-family: ''Courier New'', Courier, monospace;
      margin: 0;
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
      <h1 style="color: #1f2937; font-size: 24px; margin-bottom: 20px; text-align: center;">Your Login Code</h1>
      
      <p class="message" style="text-align: center;">
        Enter this code to complete your sign in to Sunday4k:
      </p>
      
      <div class="code-container">
        <div class="code-box">
          <div class="code">{{code}}</div>
        </div>
      </div>
      
      <p class="message" style="font-size: 14px; color: #6b7280; text-align: center;">
        This code will expire in <strong>5 minutes</strong> for your security.
      </p>
      
      <p class="message" style="font-size: 14px; color: #6b7280; text-align: center;">
        If you didn''t request this code, you can safely ignore this email.
      </p>
    </div>
    <div class="footer">
      <p>Sunday4k - Your life in weeks. Your purpose in focus.</p>
      <p class="links">
        <a href="https://sunday4k.life">Visit Sunday4k</a> ·
        <a href="mailto:info@sunday4k.life">Contact Us</a>
      </p>
    </div>
  </div>
</body>
</html>',
  'Email template for OTP login codes - displays 6-digit verification code',
  true,
  now(),
  now()
)
ON CONFLICT (template_name) 
DO UPDATE SET
  subject = EXCLUDED.subject,
  html_content = EXCLUDED.html_content,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active,
  updated_at = now();