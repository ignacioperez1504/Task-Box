-- Migración: panel de confirmación de tareas detectadas desde correo
-- Cómo aplicarla: pegar este archivo en el SQL Editor de tu proyecto Supabase
-- (https://app.supabase.com -> tu proyecto -> SQL Editor) y ejecutar.
-- O, si usás la CLI de Supabase: supabase db push
--
-- Cambio de flujo: hasta ahora `email-task-sync` insertaba directo en `tasks`
-- cuando `classifyEmailAsTask` devolvía `is_task: true`. Ahora inserta acá,
-- en `email_task_notifications`, con status='pending'. El usuario decide en el
-- panel de notificaciones si confirma (abre TaskForm prellenado y la tarea
-- entra al pipeline normal con classifyTask + contexto académico) o rechaza.

create table if not exists email_task_notifications (
  id uuid primary key default gen_random_uuid(),
  email_account_id uuid not null references email_accounts(id) on delete cascade,
  source_message_id text not null,

  -- Datos crudos del correo, para dar contexto al usuario en el panel
  subject text,
  sender text,
  received_at timestamptz,

  -- Extracción de classifyEmailAsTask (prefill del TaskForm al confirmar,
  -- NO se usan para crear la tarea directamente)
  extracted_title text,
  extracted_description text,
  extracted_due_date date,
  extracted_duration_hours numeric(4,1),
  extracted_importance text check (extracted_importance in ('Alta', 'Media', 'Baja')),

  -- Estado y trazabilidad
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'rejected')),
  task_id uuid references tasks(id) on delete set null,

  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

-- Un mismo correo nunca debe producir dos notificaciones para la misma cuenta,
-- incluso si el sync corre varias veces sobre el mismo mensaje.
create unique index if not exists email_task_notifications_message_unique
  on email_task_notifications (email_account_id, source_message_id);

-- Índice de trabajo típico: contar/listar pendientes ordenadas por fecha
create index if not exists email_task_notifications_pending_idx
  on email_task_notifications (status, received_at desc)
  where status = 'pending';

-- Realtime: para que el badge del panel se actualice sin refrescar
alter publication supabase_realtime add table email_task_notifications;

-- Acceso desde el frontend: no hay auth de usuarios en la app todavía, así que
-- seguimos el mismo patrón "Allow all" que ya usan `tasks`, `goals`, etc.
alter table email_task_notifications enable row level security;
create policy "Allow all on email_task_notifications"
  on email_task_notifications for all
  using (true) with check (true);
