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
  openCreatePanel: () => set({ rightPanelOpen: true, editingTask: null }),
  openEditPanel: (task) => set({ rightPanelOpen: true, editingTask: task }),
  closeRightPanel: () => set({ rightPanelOpen: false, editingTask: null }),

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
