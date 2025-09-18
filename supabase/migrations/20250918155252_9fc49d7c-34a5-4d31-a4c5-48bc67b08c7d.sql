-- Create admin role system
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create email templates table
CREATE TABLE public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on email_templates
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_roles (admin-only access)
CREATE POLICY "Only admins can manage user roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS policies for email_templates (admin-only CRUD, public read for active templates)
CREATE POLICY "Admins can manage email templates"
ON public.email_templates
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public can read active email templates"
ON public.email_templates
FOR SELECT
TO authenticated
USING (is_active = true);

-- Add trigger for updated_at on user_roles
CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for updated_at on email_templates  
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default email templates from current hardcoded templates
INSERT INTO public.email_templates (template_name, subject, html_content, description) VALUES
('signup', 'Welcome to Sunday4k - Confirm Your Account', '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Welcome to Sunday4k</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8f7ff; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', ''Roboto'', ''Oxygen'', ''Ubuntu'', ''Cantarell'', ''Fira Sans'', ''Droid Sans'', ''Helvetica Neue'', sans-serif;">
  <table cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8f7ff;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center;">
              <h1 style="color: #9381ff; font-size: 24px; margin: 0 0 20px 0; font-weight: bold;">Welcome to Sunday4k</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <p style="color: #333; font-size: 16px; line-height: 1.5; margin: 0 0 20px 0;">Thank you for signing up! Please confirm your email address to get started with daily inspiration.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{confirmation_url}}" style="background-color: #9381ff; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 4px; display: inline-block; font-weight: bold;">Confirm Your Email</a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px; background-color: #f8f7ff; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="color: #666; font-size: 12px; margin: 0;">© 2024 Sunday4k. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>', 'Email template for user signup confirmation'),

('password_reset', 'Reset Your Sunday4k Password', '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8f7ff; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', ''Roboto'', ''Oxygen'', ''Ubuntu'', ''Cantarell'', ''Fira Sans'', ''Droid Sans'', ''Helvetica Neue'', sans-serif;">
  <table cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8f7ff;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center;">
              <h1 style="color: #9381ff; font-size: 24px; margin: 0 0 20px 0; font-weight: bold;">Reset Your Password</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <p style="color: #333; font-size: 16px; line-height: 1.5; margin: 0 0 20px 0;">We received a request to reset your password. Click the button below to create a new password.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{reset_password_url}}" style="background-color: #9381ff; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 4px; display: inline-block; font-weight: bold;">Reset Password</a>
              </div>
              <p style="color: #666; font-size: 14px; line-height: 1.5; margin: 20px 0 0 0;">If you didn''t request this, you can safely ignore this email.</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px; background-color: #f8f7ff; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="color: #666; font-size: 12px; margin: 0;">© 2024 Sunday4k. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>', 'Email template for password reset requests'),

('daily_quotes', 'Your Daily Inspiration from Sunday4k', '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Daily Inspiration</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8f7ff; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', ''Roboto'', ''Oxygen'', ''Ubuntu'', ''Cantarell'', ''Fira Sans'', ''Droid Sans'', ''Helvetica Neue'', sans-serif;">
  <table cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8f7ff;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center;">
              <h1 style="color: #9381ff; font-size: 24px; margin: 0 0 20px 0; font-weight: bold;">Your Daily Inspiration</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <blockquote style="font-size: 18px; font-style: italic; color: #333; margin: 0 0 20px 0; padding: 20px; background-color: #f8f7ff; border-left: 4px solid #9381ff; border-radius: 4px;">
                "{{quote}}"
              </blockquote>
              <p style="color: #666; font-size: 16px; margin: 0 0 30px 0; text-align: right;">— {{author}}</p>
              
              {{#if resource}}
              <div style="background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <h3 style="color: #9381ff; font-size: 18px; margin: 0 0 10px 0;">Seize the Day Suggestion</h3>
                <p style="color: #666; font-size: 12px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">{{resource.category}} • {{resource.type}}</p>
                <h4 style="color: #333; font-size: 16px; margin: 0 0 10px 0;">{{resource.title}}</h4>
                <p style="color: #666; font-size: 14px; line-height: 1.5; margin: 0 0 15px 0;">{{resource.description}}</p>
                <a href="{{resource.url}}" style="color: #9381ff; text-decoration: none; font-weight: bold;">Learn More →</a>
              </div>
              {{/if}}
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{base_url}}/carpe-diem" style="background-color: #9381ff; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 4px; display: inline-block; font-weight: bold;">Explore More Resources</a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px; background-color: #f8f7ff; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="color: #666; font-size: 12px; margin: 0 0 10px 0;">
                <a href="{{base_url}}/profile" style="color: #9381ff; text-decoration: none;">Update Preferences</a> | 
                <a href="https://resend.com/unsubscribe/{{unsubscribe_token}}" style="color: #9381ff; text-decoration: none;">Unsubscribe</a>
              </p>
              <p style="color: #666; font-size: 12px; margin: 0;">© 2024 Sunday4k. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>', 'Email template for daily quote notifications with resource suggestions');