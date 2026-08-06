import { useNotificationStore } from '../../store/notificationStore'
import { useUIStore } from '../../store/uiStore'

// Ícono de campana con contador. Se coloca en el Sidebar junto a los otros
// controles (Configuración, Tema, Fullscreen), respetando su tipografía y
// paleta. El contador aparece solo cuando hay al menos una notificación
// pendiente.
export default function NotificationBell() {
  const notifications = useNotificationStore((s) => s.notifications)
  const openNotifications = useUIStore((s) => s.openNotifications)

  const count = notifications.length
  const hasCount = count > 0
  // El diseño del sidebar prefiere números legibles: si son muchos, cap a 9+.
  const label = count > 9 ? '9+' : String(count)

  return (
    <button
      onClick={openNotifications}
      title={
        hasCount
          ? `${count} tarea${count !== 1 ? 's' : ''} sugerida${count !== 1 ? 's' : ''} desde tu correo`
          : 'Sin notificaciones'
      }
      className="flex items-center gap-2 text-sm transition-colors duration-250 cursor-pointer relative"
      style={{ color: 'var(--fg-secondary)', fontFamily: 'var(--font-body)' }}
    >
      <span className="relative inline-flex">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {hasCount && (
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: -6,
              right: -8,
              minWidth: 16,
              height: 16,
              padding: '0 4px',
              borderRadius: 999,
              background: 'var(--color-terracotta)',
              color: 'var(--fg-on-accent)',
              fontSize: 10,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
              fontFamily: 'var(--font-body)',
            }}
          >
            {label}
          </span>
        )}
      </span>
      Notificaciones
    </button>
  )
}
