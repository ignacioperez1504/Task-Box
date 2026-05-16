import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { useAcademicStore } from './academicStore'

const PRIORITY_ORDER = { 'Crítica': 0, 'Alta': 1, 'Media': 2, 'Baja': 3 }

export const useTaskStore = create((set, get) => ({
  tasks: [],
  loading: false,

  fetchTasks: async () => {
    set({ loading: true })
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching tasks:', error)
      } else {
        set({ tasks: data || [] })
      }
    } catch (err) {
      console.error('Unexpected error fetching tasks:', err)
    } finally {
      set({ loading: false })
    }
  },

  createTask: async (taskData) => {
    const { data, error } = await supabase
      .from('tasks')
      .insert(taskData)
      .select()
      .single()
    if (!error && data) {
      set((state) => ({ tasks: [data, ...state.tasks] }))
      return data
    }
    return null
  },

  updateTask: async (id, updates) => {
    // Optimistic update
    const previousTasks = get().tasks
    set({
      tasks: previousTasks.map((t) => (t.id === id ? { ...t, ...updates } : t))
    })

    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating task:', error)
        set({ tasks: previousTasks })
        return null
      }

      if (data) {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? data : t))
        }))
      }
      return data
    } catch (err) {
      console.error('Unexpected error updating task:', err)
      set({ tasks: previousTasks })
      return null
    }
  },

  deleteTask: async (id) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (!error) {
      set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }))
    }
  },

  completeTask: async (id) => {
    const task = get().tasks.find((t) => t.id === id)
    if (!task) return
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    const updates = {
      status: newStatus,
      completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
    }
    await get().updateTask(id, updates)
  },

  moveTaskToDate: async (taskId, newDate) => {
    await get().updateTask(taskId, { due_date: newDate })
  },

  // Selectores
  getTasksByDate: (dateStr) => {
    return get().tasks.filter((t) => t.due_date === dateStr)
  },

  getTaskCountByDate: (dateStr) => {
    return get().tasks.filter((t) => t.due_date === dateStr).length
  },

  getSortedTasks: () => {
    return [...get().tasks].sort((a, b) => {
      const pa = PRIORITY_ORDER[a.ai_priority] ?? 4
      const pb = PRIORITY_ORDER[b.ai_priority] ?? 4
      if (pa !== pb) return pa - pb

      const academicStore = useAcademicStore.getState()
      const sa = academicStore.getTaskScore(a.id)
      const sb = academicStore.getTaskScore(b.id)
      if (sa !== sb) return sb - sa

      return new Date(a.due_date) - new Date(b.due_date)
    })
  },

  getFilteredTasks: (filters) => {
    let tasks = get().getSortedTasks()
    if (filters.status === 'pending') {
      tasks = tasks.filter((t) => t.status === 'pending')
    } else if (filters.status === 'completed') {
      tasks = tasks.filter((t) => t.status === 'completed')
    }
    if (filters.priorities?.length) {
      tasks = tasks.filter((t) => filters.priorities.includes(t.ai_priority))
    }
    if (filters.subjects?.length) {
      tasks = tasks.filter((t) => filters.subjects.includes(t.subject_id))
    }
    return tasks
  },

  getCriticalPendingCount: () => {
    return get().tasks.filter(
      (t) => t.ai_priority === 'Crítica' && t.status === 'pending'
    ).length
  },

  getTotalPendingHours: () => {
    return get()
      .tasks.filter((t) => t.status === 'pending')
      .reduce((sum, t) => sum + (parseFloat(t.duration_hours) || 0), 0)
  },

  getCompletedThisWeek: () => {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay() + 1)
    startOfWeek.setHours(0, 0, 0, 0)
    return get().tasks.filter(
      (t) =>
        t.status === 'completed' &&
        t.completed_at &&
        new Date(t.completed_at) >= startOfWeek
    ).length
  },

  getTasksThisWeek: () => {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay() + 1)
    startOfWeek.setHours(0, 0, 0, 0)
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)
    return get().tasks.filter((t) => {
      const d = new Date(t.due_date + 'T12:00:00')
      return d >= startOfWeek && d <= endOfWeek
    }).length
  },

  getProductivityStreak: () => {
    const completed = get().tasks.filter((t) => t.completed_at)
    if (!completed.length) return 0
    const days = new Set(
      completed.map((t) => new Date(t.completed_at).toISOString().split('T')[0])
    )
    let streak = 0
    const today = new Date()
    for (let i = 0; i < 365; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const key = d.toISOString().split('T')[0]
      if (days.has(key)) {
        streak++
      } else if (i > 0) {
        break
      }
    }
    return streak
  },

  // Suscripción Realtime optimizada
  subscribeToChanges: () => {
    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload

          set((state) => {
            const currentTasks = [...state.tasks]
            
            if (eventType === 'INSERT') {
              if (currentTasks.some(t => t.id === newRecord.id)) return state
              return { tasks: [newRecord, ...currentTasks] }
            }
            
            if (eventType === 'UPDATE') {
              return {
                tasks: currentTasks.map(t => t.id === newRecord.id ? newRecord : t)
              }
            }
            
            if (eventType === 'DELETE') {
              return {
                tasks: currentTasks.filter(t => t.id !== oldRecord.id)
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
