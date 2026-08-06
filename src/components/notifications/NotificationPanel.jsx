import { useNotificationStore } from '../../store/notificationStore'
import { useUIStore } from '../../store/uiStore'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import EmptyState from '../ui/EmptyState'

const INBOX_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12h-6l-2 3h-4l-2-3H2" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
)

// Paleta reutilizada del sidebar/badges de la app: verde para "Baja" (=Alta
// prioridad en el correo lo dejamos con el color terracota de la marca).
const IMPORTANCE_COLOR = {
  Alta: '#E15252', // priority-critica hex literal (Badge no acepta var())
  Media: '#E8825B', // terracotta
  Baja: '#4FAE8C', // priority-baja
}

function formatReceived(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleString(undefined, {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function NotificationRow({ notification, onReject, onConfirm }) {
  return (
    <li
      className="px-4 py-4"
      style={{
        background: 'rgba(var(--ink-rgb),.05)',
        border: '1px solid rgba(var(--ink-rgb),.1)',
        borderRadius: 'var(--ds-radius-control)',
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <p
            className="text-sm font-medium truncate"
            style={{ color: 'var(--fg-primary)' }}
          >
            {notification.extracted_title || notification.subject || 'Sin título'}
          </p>
          <p
            className="text-xs mt-0.5 truncate"
            style={{ color: 'var(--fg-tertiary)' }}
          >
            {notification.subject || '—'} · {notification.sender || 'remitente desconocido'}
          </p>
        </div>
        {notification.extracted_importance && (
          <Badge color={IMPORTANCE_COLOR[notification.extracted_importance] || '#E8825B'} dot>
            {notification.extracted_importance}
          </Badge>
        )}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs mb-3" style={{ color: 'var(--fg-secondary)' }}>
        {notification.extracted_due_date && (
          <span>
            <strong style={{ color: 'var(--fg-primary)' }}>Entrega:</strong>{' '}
            {notification.extracted_due_date}
          </span>
        )}
        {notification.extracted_duration_hours != null && (
          <span>
            <strong style={{ color: 'var(--fg-primary)' }}>Duración:</strong>{' '}
            {parseFloat(notification.extracted_duration_hours)}h
          </span>
        )}
        {notification.received_at && (
          <span>
            <strong style={{ color: 'var(--fg-primary)' }}>Recibido:</strong>{' '}
            {formatReceived(notification.received_at)}
          </span>
        )}
      </div>

      <div className="flex gap-2 justify-end">
        <Button size="sm" variant="ghost" onClick={() => onReject(notification.id)}>
          Rechazar
        </Button>
        <Button size="sm" onClick={() => onConfirm(notification)}>
          Confirmar
        </Button>
      </div>
    </li>
  )
}

export default function NotificationPanel() {
  const { notificationsOpen, closeNotifications, openCreateFromNotification } = useUIStore()
  const notifications = useNotificationStore((s) => s.notifications)
  const loading = useNotificationStore((s) => s.loading)
  const rejectNotification = useNotificationStore((s) => s.rejectNotification)

  const handleConfirm = (notification) => {
    // El resto del flujo (crear tarea, marcar la notificación como confirmed
    // con task_id) sucede en TaskForm cuando el usuario guarda.
    closeNotifications()
    openCreateFromNotification(notification)
  }

  return (
    <Modal
      open={notificationsOpen}
      onClose={closeNotifications}
      title="Tareas sugeridas"
      eyebrow="Detectadas en tu correo"
      icon={INBOX_ICON}
      width={560}
      scrollable
    >
      {loading ? (
        <p className="text-sm" style={{ color: 'var(--fg-tertiary)' }}>Cargando...</p>
      ) : notifications.length === 0 ? (
        <EmptyState
          title="Todo al día"
          message="No hay tareas sugeridas desde tu correo por ahora. Cuando llegue una que parezca tarea, aparecerá acá para que la confirmes o rechaces."
        />
      ) : (
        <ul className="space-y-3">
          {notifications.map((n) => (
            <NotificationRow
              key={n.id}
              notification={n}
              onReject={rejectNotification}
              onConfirm={handleConfirm}
            />
          ))}
        </ul>
      )}
    </Modal>
  )
}
