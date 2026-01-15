-- Ensure pg_net extension is available for async HTTP calls
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create trigger function to notify admins on new user signup
CREATE OR REPLACE FUNCTION public.notify_admin_on_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Make async HTTP POST to the edge function
  PERFORM extensions.http_post(
    url := 'https://aywuwyqscrtavulqijxm.supabase.co/functions/v1/notify-admin-new-user',
    headers := jsonb_build_object(
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object('record', jsonb_build_object('id', NEW.id, 'email', NEW.email, 'created_at', NEW.created_at))
  );
  RETURN NEW;
END;
$$;

-- Create trigger on profiles table to fire after new user insert
CREATE TRIGGER on_new_user_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_on_new_user();