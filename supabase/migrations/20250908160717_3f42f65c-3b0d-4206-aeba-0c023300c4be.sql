-- Add relationship so PostgREST can embed profiles from notification_settings
-- and optimize quota checks for notification_sends

-- 1) Foreign key: notification_settings.user_id -> profiles.id
ALTER TABLE public.notification_settings
ADD CONSTRAINT notification_settings_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Helpful index for joins
CREATE INDEX IF NOT EXISTS idx_notification_settings_user_id
ON public.notification_settings(user_id);

-- 2) Foreign key: notification_sends.user_id -> profiles.id
ALTER TABLE public.notification_sends
ADD CONSTRAINT notification_sends_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Indexes for quota checks (user_id and time range)
CREATE INDEX IF NOT EXISTS idx_notification_sends_user_id
ON public.notification_sends(user_id);

CREATE INDEX IF NOT EXISTS idx_notification_sends_user_id_sent_at
ON public.notification_sends(user_id, sent_at);
