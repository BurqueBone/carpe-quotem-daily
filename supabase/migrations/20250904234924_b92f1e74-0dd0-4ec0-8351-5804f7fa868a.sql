-- Schedule the edge function to run hourly to send daily quotes
-- The function will decide which users to email based on their settings and quotas
do $$
begin
  if not exists (select 1 from cron.job where jobname = 'send-daily-quotes-hourly') then
    perform cron.schedule(
      'send-daily-quotes-hourly',
      '0 * * * *',
      'select net.http_post(url:=''https://aywuwyqscrtavulqijxm.supabase.co/functions/v1/send-daily-quotes'', headers:=''{}'') as request_id;'
    );
  end if;
end
$$;