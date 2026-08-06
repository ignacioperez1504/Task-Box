import { create } from 'zustand'
import { supabase } from '../lib/supabase'

// Store para las notificaciones de posibles tareas detectadas por email-task-sync.
// El flujo es: la Edge Function inserta una fila con status='pending' -> este
// store la trae vía fetch + realtime -> el usuario la ve en NotificationPanel
// -> confirma (crea tarea real vía TaskForm) o rechaza (status='rejected').
export const useNotificationStore = create((set, get) => ({
  notifications: [],
  loading: false,

  fetchNotifications: async () => {
    set({ loading: true })
    try {
      const { data, error } = await supabase
        .from('email_task_notifications')
        .select('*')
        .eq('status', 'pending')
        .order('received_at', { ascending: false })

      if (error) {
        console.error('Error fetching notifications:', error)
      } else {
        set({ notifications: data || [] })
      }
    } catch (err) {
      console.error('Unexpected error fetching notifications:', err)
    } finally {
      set({ loading: false })
    }
  },

  // Rechazar: se marca como 'rejected'. No se crea ninguna tarea.
  // Se conserva la fila para que el mismo correo no vuelva a aparecer si
  // llega otra vez por el sync (el UNIQUE INDEX por message_id lo cubre).
  rejectNotification: async (id) => {
    const previous = get().notifications
    set({ notifications: previous.filter((n) => n.id !== id) })

    const { error } = await supabase
      .from('email_task_notifications')
      .update({ status: 'rejected', resolved_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      console.error('Error rejecting notification:', error)
      set({ notifications: previous }) // rollback optimista
    }
  },

  // Confirmar: se llama DESPUÉS de que TaskForm creó la tarea real. Marca
  // la notificación como 'confirmed' y vincula el task_id creado para
  // trazabilidad.
  markConfirmed: async (id, taskId) => {
    const previous = get().notifications
    set({ notifications: previous.filter((n) => n.id !== id) })

    const { error } = await supabase
      .from('email_task_notifications')
      .update({
        status: 'confirmed',
        task_id: taskId,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      console.error('Error marking notification confirmed:', error)
      set({ notifications: previous })
    }
  },

  getPendingCount: () => get().notifications.length,

  // Realtime: nuevas notificaciones aparecen sin refrescar; cambios de status
  // también (por si otra pestaña confirma/rechaza).
  subscribeToChanges: () => {
    const channel = supabase
      .channel('email-task-notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'email_task_notifications',
        },
        (payload) => {
          const { eventType, new: newRow, old: oldRow } = payload
          set((state) => {
            const current = [...state.notifications]

            if (eventType === 'INSERT') {
              if (newRow.status !== 'pending') return state
              if (current.some((n) => n.id === newRow.id)) return state
              return { notifications: [newRow, ...current] }
            }

            if (eventType === 'UPDATE') {
              // Si dejó de estar pendiente, sacala de la lista
              if (newRow.status !== 'pending') {
                return {
                  notifications: current.filter((n) => n.id !== newRow.id),
                }
              }
              return {
                notifications: current.map((n) =>
                  n.id === newRow.id ? newRow : n
                ),
              }
            }

            if (eventType === 'DELETE') {
              return {
                notifications: current.filter((n) => n.id !== oldRow.id),
              }
            }

            return state
          })
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  },
}))
