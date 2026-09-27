create table if not exists public.internal_cron_tokens (name text primary key, token text not null);
grant all on public.internal_cron_tokens to service_role;
alter table public.internal_cron_tokens enable row level security;
insert into public.internal_cron_tokens(name, token) values ('health-reminders', encode(extensions.gen_random_bytes(32),'hex')) on conflict (name) do nothing;