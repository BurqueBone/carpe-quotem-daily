-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the daily quote function to run every morning at 8 AM UTC
SELECT cron.schedule(
  'send-daily-quotes',
  '0 8 * * *', -- Every day at 8 AM UTC
  $$
  SELECT
    net.http_post(
      url:='https://aywuwyqscrtavulqijxm.supabase.co/functions/v1/send-daily-quotes',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5d3V3eXFzY3J0YXZ1bHFpanhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1MDE3OTIsImV4cCI6MjA3MjA3Nzc5Mn0.jjayPtPMhrAhrtSfCZYCi6xVJIyUA6wMFTK60dyp6G0"}'::jsonb,
      body:='{"trigger": "cron"}'::jsonb
    ) as request_id;
  $$
);