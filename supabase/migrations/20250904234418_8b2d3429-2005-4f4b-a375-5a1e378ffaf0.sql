-- Create profiles table to store user email accessible from API
create table if not exists public.profiles (
  id uuid not null primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies: users can view/update their own profile
do $$ begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'Users can view own profile'
  ) then
    create policy "Users can view own profile"
      on public.profiles for select
      to authenticated
      using (id = auth.uid());
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'Users can update own profile'
  ) then
    create policy "Users can update own profile"
      on public.profiles for update
      to authenticated
      using (id = auth.uid());
  end if;
end $$;

-- Trigger to update updated_at
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'update_profiles_updated_at') then
    create trigger update_profiles_updated_at
    before update on public.profiles
    for each row execute function public.update_updated_at_column();
  end if;
end $$;

-- Function to handle new auth users and populate profiles
drop trigger if exists on_auth_user_created on auth.users;
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create notification settings table
create table if not exists public.notification_settings (
  user_id uuid not null primary key references auth.users(id) on delete cascade,
  enabled boolean not null default true,
  period text not null default 'day', -- 'day' | 'week' | 'month'
  quantity integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.notification_settings enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' and tablename = 'notification_settings' and policyname = 'Users can view their own settings'
  ) then
    create policy "Users can view their own settings"
      on public.notification_settings for select
      to authenticated
      using (user_id = auth.uid());
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' and tablename = 'notification_settings' and policyname = 'Users can insert their own settings'
  ) then
    create policy "Users can insert their own settings"
      on public.notification_settings for insert
      to authenticated
      with check (user_id = auth.uid());
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' and tablename = 'notification_settings' and policyname = 'Users can update their own settings'
  ) then
    create policy "Users can update their own settings"
      on public.notification_settings for update
      to authenticated
      using (user_id = auth.uid());
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'update_notification_settings_updated_at') then
    create trigger update_notification_settings_updated_at
    before update on public.notification_settings
    for each row execute function public.update_updated_at_column();
  end if;
end $$;

-- Create a table to track sent emails to enforce quotas
create table if not exists public.notification_sends (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  quote_id uuid references public.quotes(id),
  sent_at timestamptz not null default now()
);

alter table public.notification_sends enable row level security;

create index if not exists idx_notification_sends_user on public.notification_sends(user_id);
create index if not exists idx_notification_sends_sent_at on public.notification_sends(sent_at);

do $$ begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' and tablename = 'notification_sends' and policyname = 'Users can view their own sends'
  ) then
    create policy "Users can view their own sends"
      on public.notification_sends for select
      to authenticated
      using (user_id = auth.uid());
  end if;
end $$;

-- Enable required extensions for scheduling and HTTP calls
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

-- Schedule the edge function to run hourly (the function will decide whom to email)
-- Only create the job if it doesn't already exist
do $$
begin
  if not exists (select 1 from cron.job where jobname = 'send-daily-quotes-every-hour') then
    perform cron.schedule(
      'send-daily-quotes-every-hour',
      '0 * * * *',
      $$
      select net.http_post(
        url:='https://aywuwyqscrtavulqijxm.supabase.co/functions/v1/send-daily-quotes',
        headers:='{"Content-Type": "application/json"}'::jsonb,
        body:=jsonb_build_object('triggered_at', now())
      ) as request_id;
      $$
    );
  end if;
end
$$;