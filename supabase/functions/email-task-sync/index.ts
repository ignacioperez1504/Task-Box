// Edge Function: email-task-sync
// Se ejecuta periódicamente (cron). Por cada cuenta de correo activa en
// `email_accounts`, busca correos nuevos, le pregunta a Groq si cada uno
// describe una tarea, y si sí, inserta una NOTIFICACIÓN en
// `email_task_notifications` (status='pending'). La tarea real se crea
// después, cuando el usuario confirma desde el panel de notificaciones y
// pasa por TaskForm + classifyTask con contexto académico completo.
//
// Variables de entorno requeridas (configurar con `supabase secrets set`):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  (ya las provee Supabase automáticamente)
//   GROQ_API_KEY
//   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
//   MS_CLIENT_ID, MS_CLIENT_SECRET

import { createClient } from 'jsr:@supabase/supabase-js@2'
import { classifyEmailAsTask, type EmailInput } from '../_shared/groq.ts'
import { fetchNewGmailMessages, refreshGmailAccessToken } from '../_shared/gmail.ts'
import { fetchNewOutlookMessages, refreshOutlookAccessToken } from '../_shared/outlook.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY')!

Deno.serve(async (req: Request) => {
  // Protección simple: solo se puede llamar con el service role key o el
  // secreto compartido definido en CRON_SECRET (ver supabase/functions/README.md)
  const cronSecret = Deno.env.get('CRON_SECRET')
  if (cronSecret) {
    const provided = req.headers.get('x-cron-secret')
    if (provided !== cronSecret) {
      return new Response('Unauthorized', { status: 401 })
    }
  }

  const { data: accounts, error } = await supabase
    .from('email_accounts')
    .select('*')
    .eq('is_active', true)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  const results = []
  for (const account of accounts || []) {
    results.push(await syncAccount(account))
  }

  return new Response(JSON.stringify({ results }), {
    headers: { 'Content-Type': 'application/json' },
  })
})

async function syncAccount(account: any) {
  let emailsScanned = 0
  let tasksCreated = 0
  let syncError: string | null = null

  try {
    const accessToken =
      account.provider === 'gmail'
        ? await refreshGmailAccessToken(
            account.refresh_token,
            Deno.env.get('GOOGLE_CLIENT_ID')!,
            Deno.env.get('GOOGLE_CLIENT_SECRET')!
          )
        : await refreshOutlookAccessToken(
            account.refresh_token,
            Deno.env.get('MS_CLIENT_ID')!,
            Deno.env.get('MS_CLIENT_SECRET')!
          )

    const emails =
      account.provider === 'gmail'
        ? await fetchNewGmailMessages(accessToken, account.last_synced_at)
        : await fetchNewOutlookMessages(accessToken, account.last_synced_at)

    emailsScanned = emails.length

    for (const email of emails) {
      // Evitar reprocesar un correo que ya generó una notificación (o una
      // tarea confirmada, porque la notificación se conserva con status
      // 'confirmed' y su UNIQUE INDEX cubre ese caso).
      const { data: existing } = await supabase
        .from('email_task_notifications')
        .select('id')
        .eq('email_account_id', account.id)
        .eq('source_message_id', email.id)
        .maybeSingle()

      if (existing) continue

      const input: EmailInput = {
        subject: email.subject,
        from: email.from,
        receivedAt: email.receivedAt,
        bodyText: email.bodyText,
      }

      const extraction = await classifyEmailAsTask(input, GROQ_API_KEY)
      if (!extraction.isTask) continue

      // A diferencia del flujo anterior, NO insertamos en `tasks`. Guardamos
      // la extracción en `email_task_notifications` con status 'pending' para
      // que el usuario confirme/rechace desde el panel de notificaciones. Si
      // confirma, el frontend abre TaskForm prellenado y la tarea entra por
      // el mismo camino que una tarea manual (classifyTask + contexto).
      const { error: insertError } = await supabase
        .from('email_task_notifications')
        .insert({
          email_account_id: account.id,
          source_message_id: email.id,
          subject: email.subject,
          sender: email.from,
          received_at: email.receivedAt,
          extracted_title: extraction.title || email.subject || 'Tarea desde correo',
          extracted_description:
            extraction.description || email.bodyText.slice(0, 500),
          extracted_due_date: extraction.dueDate || null,
          extracted_duration_hours: extraction.durationHours || null,
          extracted_importance:
            extraction.importance === 'Alta' ? 'Alta' : extraction.importance === 'Baja' ? 'Baja' : 'Media',
          status: 'pending',
        })

      if (insertError) {
        console.error(
          'Error insertando notificación desde correo:',
          insertError
        )
        continue
      }
      tasksCreated++ // acá "tasksCreated" ahora significa notificaciones creadas
    }

    await supabase
      .from('email_accounts')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('id', account.id)
  } catch (err) {
    syncError = err instanceof Error ? err.message : String(err)
    console.error(`Error sincronizando cuenta ${account.email_address}:`, err)
  }

  await supabase.from('email_sync_logs').insert({
    email_account_id: account.id,
    emails_scanned: emailsScanned,
    tasks_created: tasksCreated,
    error: syncError,
  })

  return {
    account: account.email_address,
    provider: account.provider,
    emailsScanned,
    tasksCreated,
    error: syncError,
  }
}
