-- Drop existing policies to recreate them with stronger security
DROP POLICY IF EXISTS "Admins can view contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Anyone can create contact submissions" ON public.contact_submissions;

-- Create a more secure admin-only SELECT policy with explicit authentication check
CREATE POLICY "Only authenticated admins can view contact submissions" 
ON public.contact_submissions 
FOR SELECT 
TO authenticated
USING (
  auth.uid() IS NOT NULL AND 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Recreate the public INSERT policy for contact form submissions
CREATE POLICY "Anyone can create contact submissions" 
ON public.contact_submissions 
FOR INSERT 
TO public
WITH CHECK (true);

-- Add explicit DELETE policy for admins only
CREATE POLICY "Only authenticated admins can delete contact submissions"
ON public.contact_submissions
FOR DELETE
TO authenticated
USING (
  auth.uid() IS NOT NULL AND 
  has_role(auth.uid(), 'admin'::app_role)
);