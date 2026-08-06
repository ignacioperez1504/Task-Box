-- Programa la ejecución automática de la Edge Function email-task-sync
-- cada 10 minutos, usando pg_cron + pg_net (ambas extensiones vienen
-- habilitadas en Supabase, solo hay que activarlas).
--
-- IMPORTANTE: reemplazá los placeholders <TU_PROYECTO> y <CRON_SECRET>
-- antes de ejecutar este archivo, o hacelo desde el SQL Editor con los
-- valores reales. <CRON_SECRET> debe ser el mismo valor que configuraste
-- con `supabase secrets set CRON_SECRET=...` para la función.

create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'email-task-sync-every-10-min',
  '*/10 * * * *',
  $$
  select net.http_post(
    url := 'https://<TU_PROYECTO>.supabase.co/functions/v1/email-task-sync',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', '<CRON_SECRET>'
    ),
    body := '{}'::jsonb
  );
  $$
);

-- Para revisar los jobs programados:
--   select * from cron.job;
-- Para desactivar este job:
--   select cron.unschedule('email-task-sync-every-10-min');
