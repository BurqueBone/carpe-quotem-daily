-- Add the missing foreign key relationship for notification_settings -> profiles
-- (notification_sends already has its FK and indexes)

ALTER TABLE public.notification_settings
ADD CONSTRAINT notification_settings_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add index to optimize the join
CREATE INDEX IF NOT EXISTS idx_notification_settings_user_id
ON public.notification_settings(user_id);