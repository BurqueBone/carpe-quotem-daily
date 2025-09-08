-- Just add the missing index for notification_settings joins
-- (Foreign key already exists)

CREATE INDEX IF NOT EXISTS idx_notification_settings_user_id
ON public.notification_settings(user_id);