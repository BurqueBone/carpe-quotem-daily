-- Invoke updated import-quotes again
select
  net.http_post(
    url := 'https://aywuwyqscrtavulqijxm.supabase.co/functions/v1/import-quotes',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;