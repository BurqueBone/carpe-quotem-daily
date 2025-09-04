-- Re-invoke import-quotes with correct Authorization (anon key)
select
  net.http_post(
    url := 'https://aywuwyqscrtavulqijxm.supabase.co/functions/v1/import-quotes',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5d3V3eXFzY3J0YXZ1bHFpanhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1MDE3OTIsImV4cCI6MjA3MjA3Nzc5Mn0.jjayPtPMhrAhrtSfCZYCi6xVJIyUA6wMFTK60dyp6G0"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;