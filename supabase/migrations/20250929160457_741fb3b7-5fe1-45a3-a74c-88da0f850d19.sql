-- Create enums for template variables
CREATE TYPE public.template_variable_category AS ENUM ('system', 'user', 'content', 'custom');
CREATE TYPE public.template_variable_data_type AS ENUM ('text', 'url', 'date', 'boolean', 'number');

-- Create template_variables table
CREATE TABLE public.template_variables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  variable_name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  category template_variable_category NOT NULL DEFAULT 'custom',
  data_type template_variable_data_type NOT NULL DEFAULT 'text',
  default_value TEXT,
  is_system BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.template_variables ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage template variables" 
ON public.template_variables 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can read active template variables" 
ON public.template_variables 
FOR SELECT 
TO public
USING (is_active = true);

-- Add trigger for updated_at
CREATE TRIGGER update_template_variables_updated_at
BEFORE UPDATE ON public.template_variables
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed with existing system variables
INSERT INTO public.template_variables (variable_name, display_name, description, category, data_type, is_system, is_active) VALUES
('quote.quote', 'Quote Text', 'The main quote text', 'content', 'text', true, true),
('quote.author', 'Quote Author', 'The author of the quote', 'content', 'text', true, true),
('quote.source', 'Quote Source', 'The source/book of the quote', 'content', 'text', true, true),
('resource.title', 'Resource Title', 'The title of the featured resource', 'content', 'text', true, true),
('resource.description', 'Resource Description', 'Description of the featured resource', 'content', 'text', true, true),
('resource.url', 'Resource URL', 'Link to the featured resource', 'content', 'url', true, true),
('user.email', 'User Email', 'The email address of the recipient', 'user', 'text', true, true),
('current_date', 'Current Date', 'Today''s date', 'system', 'date', true, true),
('unsubscribe_url', 'Unsubscribe URL', 'Link to unsubscribe from emails', 'system', 'url', true, true);