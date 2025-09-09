-- Update the handle_new_user function to also create notification settings
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
begin
  -- Insert into profiles table
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  
  -- Insert into notification_settings table with notifications enabled by default
  insert into public.notification_settings (user_id, enabled)
  values (new.id, true)
  on conflict (user_id) do update set enabled = excluded.enabled;
  
  return new;
end;
$$;