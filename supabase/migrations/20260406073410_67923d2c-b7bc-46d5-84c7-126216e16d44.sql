
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Morning notification at 8:00 Paris time (6:00 UTC in summer, 7:00 UTC in winter)
-- Using 7:00 UTC as a reasonable default
SELECT cron.schedule(
  'push-morning',
  '0 7 * * *',
  $$
  SELECT extensions.http_post(
    url := 'https://mpadkxqomykztvqrnmfv.supabase.co/functions/v1/send-push-notifications',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := '{"type":"morning"}'
  );
  $$
);

-- Evening notification at 21:00 Paris time (19:00 UTC summer, 20:00 UTC winter)
-- Using 19:00 UTC as a reasonable default
SELECT cron.schedule(
  'push-evening',
  '0 19 * * *',
  $$
  SELECT extensions.http_post(
    url := 'https://mpadkxqomykztvqrnmfv.supabase.co/functions/v1/send-push-notifications',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := '{"type":"evening"}'
  );
  $$
);
