// Helpers mínimos para leer Gmail vía REST API (sin librería de Google,
// para mantener el bundle de la Edge Function liviano).

export interface GmailAccount {
  id: string
  refresh_token: string
  last_synced_at: string | null
}

export interface RawEmail {
  id: string
  subject: string
  from: string
  receivedAt: string
  bodyText: string
}

// Intercambia el refresh_token por un access_token nuevo (expira en ~1h)
export async function refreshGmailAccessToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string
): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })
  if (!res.ok) throw new Error(`Gmail token refresh falló: ${await res.text()}`)
  const data = await res.json()
  return data.access_token
}

// Lista IDs de mensajes recibidos después de `sinceDate` (o últimas 24h si es null)
async function listMessageIds(accessToken: string, sinceDate: string | null): Promise<string[]> {
  const sinceEpoch = Math.floor(
    (sinceDate ? new Date(sinceDate).getTime() : Date.now() - 24 * 60 * 60 * 1000) / 1000
  )
  const q = encodeURIComponent(`after:${sinceEpoch} category:primary`)
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${q}&maxResults=25`

  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } })
  if (!res.ok) throw new Error(`Gmail list falló: ${await res.text()}`)
  const data = await res.json()
  return (data.messages || []).map((m: { id: string }) => m.id)
}

function decodeBase64Url(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/')
  try {
    return decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    )
  } catch {
    return atob(base64)
  }
}

function extractPlainText(payload: any): string {
  if (!payload) return ''
  if (payload.mimeType === 'text/plain' && payload.body?.data) {
    return decodeBase64Url(payload.body.data)
  }
  if (payload.parts) {
    for (const part of payload.parts) {
      const text = extractPlainText(part)
      if (text) return text
    }
  }
  if (payload.body?.data) return decodeBase64Url(payload.body.data)
  return ''
}

function getHeader(headers: { name: string; value: string }[], name: string): string {
  return headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || ''
}

async function getMessage(accessToken: string, id: string): Promise<RawEmail> {
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } })
  if (!res.ok) throw new Error(`Gmail get message falló: ${await res.text()}`)
  const data = await res.json()
  const headers = data.payload?.headers || []

  return {
    id: data.id,
    subject: getHeader(headers, 'Subject'),
    from: getHeader(headers, 'From'),
    receivedAt: new Date(Number(data.internalDate)).toISOString(),
    bodyText: extractPlainText(data.payload) || data.snippet || '',
  }
}

// Punto de entrada: devuelve los correos nuevos desde la última sincronización
export async function fetchNewGmailMessages(
  accessToken: string,
  lastSyncedAt: string | null
): Promise<RawEmail[]> {
  const ids = await listMessageIds(accessToken, lastSyncedAt)
  const emails: RawEmail[] = []
  for (const id of ids) {
    try {
      emails.push(await getMessage(accessToken, id))
    } catch (err) {
      console.error(`Error leyendo mensaje Gmail ${id}:`, err)
    }
  }
  return emails
}
