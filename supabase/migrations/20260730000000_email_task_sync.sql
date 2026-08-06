-- Migración: soporte para importar tareas automáticamente desde Gmail/Outlook
-- Cómo aplicarla: pegar este archivo en el SQL Editor de tu proyecto Supabase
-- (https://app.supabase.com -> tu proyecto -> SQL Editor) y ejecutar.
-- O, si usás la CLI de Supabase: supabase db push

-- 1) Cuentas de correo conectadas (Gmail / Outlook)
--    Guarda solo el refresh token cifrado por Supabase Vault (no en texto plano).
create table if not exists email_accounts (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('gmail', 'outlook')),
  email_address text not null,
  refresh_token text not null,          -- se guarda cifrado (ver nota abajo)
  access_token text,                    -- token de corta duración, se refresca en cada sync
  access_token_expires_at timestamptz,
  history_id text,                      -- Gmail: cursor de sincronización incremental
  delta_link text,                      -- Outlook: cursor de sincronización incremental
  last_synced_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (provider, email_address)
);

-- 2) Extensiones a la tabla tasks existente para rastrear el origen
--    y evitar insertar la misma tarea dos veces si el correo se re-procesa.
alter table tasks
  add column if not exists source text not null default 'manual'
    check (source in ('manual', 'email')),
  add column if not exists source_email_account_id uuid references email_accounts(id) on delete set null,
  add column if not exists source_message_id text;

-- Un mismo correo nunca debe generar dos tareas duplicadas
create unique index if not exists tasks_source_message_unique
  on tasks (source_email_account_id, source_message_id)
  where source_message_id is not null;

-- 3) Tabla de log para depurar el sync (qué corrió, cuántos correos, errores)
create table if not exists email_sync_logs (
  id uuid primary key default gen_random_uuid(),
  email_account_id uuid references email_accounts(id) on delete cascade,
  ran_at timestamptz not null default now(),
  emails_scanned int not null default 0,
  tasks_created int not null default 0,
  error text
);

-- 4) Vista pública (sin tokens) para que el frontend pueda mostrar qué
--    cuentas están conectadas, sin exponer refresh_token/access_token.
create or replace view email_accounts_status as
  select id, provider, email_address, is_active, last_synced_at, created_at
  from email_accounts;

grant select on email_accounts_status to anon, authenticated;

-- NOTA DE SEGURIDAD:
-- refresh_token queda en texto plano en esta versión simple. Antes de tener
-- datos reales conectados, conviene cifrarlo con pgsodium/Vault de Supabase,
-- o al menos restringir esta tabla con Row Level Security para que ningún
-- rol público pueda leerla (la Edge Function usa la service_role key, que
-- ignora RLS).
alter table email_accounts enable row level security;
-- Sin políticas = nadie con la anon key puede leer/escribir esta tabla.
-- Solo la Edge Function (con SUPABASE_SERVICE_ROLE_KEY) podrá acceder.
