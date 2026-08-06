import { create } from 'zustand'

export const useUIStore = create((set) => ({
  // Sección activa del panel central
  activeSection: 'calendar', // 'calendar' | 'tasks' | 'dayTasks' | 'academic' | 'habits' | 'reminders'
  setActiveSection: (section) => set({ activeSection: section }),

  // Día seleccionado en el calendario
  selectedDate: null,
  setSelectedDate: (date) => set({ selectedDate: date }),

  // Panel derecho (formulario crear/editar)
  rightPanelOpen: false,
  editingTask: null, // null = crear nueva, objeto = editar existente
  // Cuando el usuario confirma una notificación de correo, guardamos acá los
  // datos extraídos para que TaskForm los use como valores iniciales. El id
  // de la notificación se conserva para marcarla como 'confirmed' cuando la
  // tarea se cree realmente.
  pendingNotification: null,
  openCreatePanel: () => set({ rightPanelOpen: true, editingTask: null, pendingNotification: null }),
  openEditPanel: (task) => set({ rightPanelOpen: true, editingTask: task, pendingNotification: null }),
  openCreateFromNotification: (notification) =>
    set({ rightPanelOpen: true, editingTask: null, pendingNotification: notification }),
  closeRightPanel: () => set({ rightPanelOpen: false, editingTask: null, pendingNotification: null }),

  // Panel de notificaciones de correo (bandeja de posibles tareas)
  notificationsOpen: false,
  openNotifications: () => set({ notificationsOpen: true }),
  closeNotifications: () => set({ notificationsOpen: false }),

  // Modal de confirmación de eliminación
  deleteModal: null, // null = cerrado, { task } = abierto
  openDeleteModal: (task) => set({ deleteModal: { task } }),
  closeDeleteModal: () => set({ deleteModal: null }),

  // Modal de configuración (API Key)
  settingsOpen: false,
  openSettings: () => set({ settingsOpen: true }),
  closeSettings: () => set({ settingsOpen: false }),

  // Modal de advertencia sin API Key
  apiKeyWarning: false,
  showApiKeyWarning: () => set({ apiKeyWarning: true }),
  hideApiKeyWarning: () => set({ apiKeyWarning: false }),
}))
