-- Call the import-quotes edge function using pg_net to import 1000 quotes
select
  net.http_post(
    url := 'https://aywuwyqscrtavulqijxm.supabase.co/functions/v1/import-quotes',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5d3V3eXFzY3J0YXZ1bHFpanhtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjUwMTc5MiwiZXhwIjoyMDcyMDc3NzkyfQ.VdHBOBPDIUAGXyaHD6mAUEkJcFZfBPT0P5dDFGLIZM8"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;