// Edge Function: email-oauth-start
// La app llama a esta URL cuando el usuario hace click en "Conectar Gmail"
// o "Conectar Outlook". Redirige al usuario a la pantalla de consentimiento
// del proveedor.
//
// Uso desde el frontend:
//   window.location.href = `${SUPABASE_URL}/functions/v1/email-oauth-start?provider=gmail&key=${APP_CONNECT_SECRET}`
//
// El parámetro `key` es un secreto simple para que no cualquiera pueda
// disparar este flujo y conectar correos ajenos a tu app. Configuralo con
// `supabase secrets set APP_CONNECT_SECRET=algo-largo-y-random` y ponelo
// también como variable en tu frontend (no es información sensible en sí,
// solo evita clicks accidentales/de terceros).

Deno.serve((req: Request) => {
  const url = new URL(req.url)
  const provider = url.searchParams.get('provider')
  const key = url.searchParams.get('key')

  const expectedKey = Deno.env.get('APP_CONNECT_SECRET')
  if (expectedKey && key !== expectedKey) {
    return new Response('Unauthorized', { status: 401 })
  }

  // IMPORTANTE: la redirect_uri NO lleva query params (?provider=...).
  // Tiene que ser un match exacto, carácter por carácter, con la URI que
  // registraste en Azure/Google Cloud. Por eso el proveedor se manda en el
  // parámetro `state`, que Google/Microsoft nos devuelven intacto en el callback.
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const redirectUri = `${supabaseUrl}/functions/v1/email-oauth-callback`

  if (provider === 'gmail') {
    const params = new URLSearchParams({
      client_id: Deno.env.get('GOOGLE_CLIENT_ID')!,
      redirect_uri: redirectUri,
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent', // fuerza a que siempre devuelva refresh_token
      scope: 'https://www.googleapis.com/auth/gmail.readonly',
      state: 'gmail',
    })
    return Response.redirect(
      `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
      302
    )
  }

  if (provider === 'outlook') {
    const params = new URLSearchParams({
      client_id: Deno.env.get('MS_CLIENT_ID')!,
      redirect_uri: redirectUri,
      response_type: 'code',
      response_mode: 'query',
      scope: 'offline_access https://graph.microsoft.com/Mail.Read',
      state: 'outlook',
    })
    return Response.redirect(
      `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`,
      302
    )
  }

  return new Response('provider debe ser "gmail" u "outlook"', { status: 400 })
})
