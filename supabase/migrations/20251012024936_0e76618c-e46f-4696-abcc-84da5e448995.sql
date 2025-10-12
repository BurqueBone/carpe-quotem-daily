-- Update email template to use correct variable names
UPDATE email_templates 
SET html_content = REPLACE(REPLACE(html_content, '{{base_url}}', '{{custom.app_url}}'), 'sunday4k.com', 'sunday4k.life')
WHERE template_name = 'daily_inspiration';