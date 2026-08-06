// Edge Function: email-oauth-callback
// El proveedor (Google/Microsoft) redirige acá después de que el usuario
// da permiso. Intercambia el "code" por tokens y guarda la cuenta en
// `email_accounts` para que email-task-sync pueda usarla.

import { createClient } from 'jsr:@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

function html(message: string) {
  return new Response(
    `<html><body style="font-family:sans-serif;padding:40px;text-align:center">
      <h2>${message}</h2>
      <p>Podés cerrar esta pestaña.</p>
    </body></html>`,
    { headers: { 'Content-Type': 'text/html' } }
  )
}

Deno.serve(async (req: Request) => {
  const url = new URL(req.url)
  // El proveedor viene en `state` (ver email-oauth-start), no como query param
  // propio, porque la redirect_uri tiene que ser idéntica a la registrada en
  // Azure/Google Cloud (sin parámetros extra).
  const provider = url.searchParams.get('state')
  const code = url.searchParams.get('code')
  const errorParam = url.searchParams.get('error')

  if (errorParam) {
    return html(`El proveedor devolvió un error: ${errorParam}`)
  }
  if (!code || !provider) {
    return new Response('Faltan parámetros (code/state)', { status: 400 })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const redirectUri = `${supabaseUrl}/functions/v1/email-oauth-callback`

  try {
    if (provider === 'gmail') {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: Deno.env.get('GOOGLE_CLIENT_ID')!,
          client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET')!,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      })
      const tokens = await tokenRes.json()
      if (!tokenRes.ok || !tokens.refresh_token) {
        console.error('Gmail token exchange falló:', tokens)
        return html(
          'No se recibió refresh_token. Revocá el acceso en ' +
            'myaccount.google.com/permissions y volvé a intentar (asegurate ' +
            'de que la pantalla de consentimiento pida "prompt=consent").'
        )
      }

      const profileRes = await fetch(
        'https://gmail.googleapis.com/gmail/v1/users/me/profile',
        { headers: { Authorization: `Bearer ${tokens.access_token}` } }
      )
      const profile = await profileRes.json()

      await supabase.from('email_accounts').upsert(
        {
          provider: 'gmail',
          email_address: profile.emailAddress,
          refresh_token: tokens.refresh_token,
          access_token: tokens.access_token,
          access_token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
          is_active: true,
        },
        { onConflict: 'provider,email_address' }
      )

      return html(`Cuenta de Gmail conectada: ${profile.emailAddress}`)
    }

    if (provider === 'outlook') {
      const tokenRes = await fetch(
        'https://login.microsoftonline.com/common/oauth2/v2.0/token',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code,
            client_id: Deno.env.get('MS_CLIENT_ID')!,
            client_secret: Deno.env.get('MS_CLIENT_SECRET')!,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
            scope: 'offline_access https://graph.microsoft.com/Mail.Read',
          }),
        }
      )
      const tokens = await tokenRes.json()
      if (!tokenRes.ok || !tokens.refresh_token) {
        console.error('Outlook token exchange falló:', tokens)
        return html('No se recibió refresh_token de Microsoft. Volvé a intentar.')
      }

      const meRes = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      })
      const me = await meRes.json()
      const emailAddress = me.mail || me.userPrincipalName

      await supabase.from('email_accounts').upsert(
        {
          provider: 'outlook',
          email_address: emailAddress,
          refresh_token: tokens.refresh_token,
          access_token: tokens.access_token,
          access_token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
          is_active: true,
        },
        { onConflict: 'provider,email_address' }
      )

      return html(`Cuenta de Outlook conectada: ${emailAddress}`)
    }

    return new Response('provider desconocido', { status: 400 })
  } catch (err) {
    console.error('Error en oauth callback:', err)
    return html('Ocurrió un error conectando la cuenta. Revisá los logs de la función.')
  }
})
