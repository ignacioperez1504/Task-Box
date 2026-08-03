import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Label } from '../ui/Field'
import Button from '../ui/Button'
import Badge from '../ui/Badge'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

function startOAuth(provider) {
  // Si configuraste APP_CONNECT_SECRET en la Edge Function, agregá también
  // VITE_APP_CONNECT_SECRET a tu .env y descomentá la línea de abajo.
  // const key = import.meta.env.VITE_APP_CONNECT_SECRET
  const url = `${SUPABASE_URL}/functions/v1/email-oauth-start?provider=${provider}`
  window.open(url, '_blank', 'width=500,height=650')
}

export default function EmailAccountsSettings() {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)

  const loadAccounts = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('email_accounts_status')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setAccounts(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadAccounts()
    // Recarga al volver el foco (por si el usuario acaba de conectar una cuenta
    // en la ventana emergente de OAuth)
    const onFocus = () => loadAccounts()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [])

  return (
    <div className="space-y-5">
      <div>
        <Label>Importar tareas desde tu correo</Label>
        <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--fg-secondary)' }}>
          Conectá tu correo para que los correos que parezcan tareas (entregas,
          recordatorios con fecha límite) se agreguen solos a tu lista.
          Requiere haber desplegado las Edge Functions del proyecto.
        </p>

        <div className="flex gap-3 mb-5">
          <Button variant="secondary" className="flex-1" onClick={() => startOAuth('gmail')}>
            Conectar Gmail
          </Button>
          <Button variant="secondary" className="flex-1" onClick={() => startOAuth('outlook')}>
            Conectar Outlook
          </Button>
        </div>

        {loading ? (
          <p className="text-sm" style={{ color: 'var(--fg-tertiary)' }}>Cargando...</p>
        ) : accounts.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--fg-tertiary)' }}>
            Todavía no conectaste ninguna cuenta.
          </p>
        ) : (
          <ul className="space-y-2">
            {accounts.map((acc) => (
              <li
                key={acc.id}
                className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                style={{
                  background: 'rgba(var(--ink-rgb),.05)',
                  border: '1px solid rgba(var(--ink-rgb),.1)',
                  borderRadius: 'var(--ds-radius-control)',
                }}
              >
                <div className="min-w-0">
                  <div className="truncate" style={{ color: 'var(--fg-primary)' }}>{acc.email_address}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--fg-tertiary)' }}>
                    {acc.provider === 'gmail' ? 'Gmail' : 'Outlook'} ·{' '}
                    {acc.last_synced_at
                      ? `última sync ${new Date(acc.last_synced_at).toLocaleString()}`
                      : 'aún sin sincronizar'}
                  </div>
                </div>
                {/* Mismos colores de estado que el resto de la app: verde de
                    prioridad "Baja" para activo, gris neutro para pausado. */}
                <Badge color={acc.is_active ? '#4FAE8C' : '#94A3B8'} dot>
                  {acc.is_active ? 'Activa' : 'Pausada'}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
