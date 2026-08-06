// Helpers mínimos para leer Outlook/Microsoft 365 vía Microsoft Graph REST API.

export interface RawEmail {
  id: string
  subject: string
  from: string
  receivedAt: string
  bodyText: string
}

// Intercambia el refresh_token por un access_token nuevo
export async function refreshOutlookAccessToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string
): Promise<string> {
  const res = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
      scope: 'https://graph.microsoft.com/Mail.Read offline_access',
    }),
  })
  if (!res.ok) throw new Error(`Outlook token refresh falló: ${await res.text()}`)
  const data = await res.json()
  return data.access_token
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Devuelve los correos recibidos después de `sinceDate` (o últimas 24h si es null)
export async function fetchNewOutlookMessages(
  accessToken: string,
  lastSyncedAt: string | null
): Promise<RawEmail[]> {
  const since = lastSyncedAt || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const filter = encodeURIComponent(`receivedDateTime ge ${since}`)
  const url = `https://graph.microsoft.com/v1.0/me/messages?$filter=${filter}&$orderby=receivedDateTime desc&$top=25&$select=id,subject,from,receivedDateTime,body,bodyPreview`

  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } })
  if (!res.ok) throw new Error(`Outlook list falló: ${await res.text()}`)
  const data = await res.json()

  return (data.value || []).map((m: any) => ({
    id: m.id,
    subject: m.subject || '',
    from: m.from?.emailAddress?.address || '',
    receivedAt: m.receivedDateTime,
    bodyText: m.body?.contentType === 'html' ? stripHtml(m.body.content) : (m.body?.content || m.bodyPreview || ''),
  }))
}
