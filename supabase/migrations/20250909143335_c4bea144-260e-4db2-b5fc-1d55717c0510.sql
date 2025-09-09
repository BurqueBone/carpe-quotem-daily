-- Ensure trigger exists to populate profiles and notification_settings on new user signup
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    DROP TRIGGER on_auth_user_created ON auth.users;
  END IF;
END $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Backfill profiles for existing users
INSERT INTO public.profiles (id, email)
SELECT au.id, au.email
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL;

-- Backfill notification_settings for existing users (enabled by default)
INSERT INTO public.notification_settings (user_id, enabled)
SELECT au.id, true
FROM auth.users au
LEFT JOIN public.notification_settings ns ON ns.user_id = au.id
WHERE ns.user_id IS NULL;