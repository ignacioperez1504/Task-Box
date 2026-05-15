import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useGoalStore = create((set, get) => ({
  goals: [],
  loading: false,

  fetchGoals: async () => {
    set({ loading: true })
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) set({ goals: data || [] })
    set({ loading: false })
  },

  createGoal: async (goalData) => {
    const { data, error } = await supabase
      .from('goals')
      .insert(goalData)
      .select()
      .single()
    if (!error && data) {
      set({ goals: [data, ...get().goals] })
      return data
    }
    return null
  },

  updateGoal: async (id, updates) => {
    const { data, error } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (!error && data) {
      set({ goals: get().goals.map((g) => (g.id === id ? data : g)) })
    }
  },

  deleteGoal: async (id) => {
    const { error } = await supabase.from('goals').delete().eq('id', id)
    if (!error) {
      set({ goals: get().goals.filter((g) => g.id !== id) })
    }
  },

  updateGoalProgress: async (id, currentValue) => {
    const goal = get().goals.find((g) => g.id === id)
    if (!goal) return
    const isCompleted = currentValue >= parseFloat(goal.target_value)
    await get().updateGoal(id, {
      current_value: currentValue,
      is_completed: isCompleted,
    })
    return isCompleted && !goal.is_completed // returns true if just completed
  },

  getActiveGoals: () => get().goals.filter((g) => !g.is_completed),
  getCompletedGoals: () => get().goals.filter((g) => g.is_completed),

  // Recalcular progreso de metas basándose en tareas
  recalculateGoals: (tasks) => {
    const goals = get().goals
    const now = new Date()

    goals.forEach(async (goal) => {
      let currentValue = 0

      if (goal.type === 'complete_tasks') {
        const weekStart = goal.week_start ? new Date(goal.week_start + 'T00:00:00') : null
        const weekEnd = weekStart ? new Date(weekStart) : null
        if (weekEnd) weekEnd.setDate(weekEnd.getDate() + 6)

        currentValue = tasks.filter((t) => {
          if (t.status !== 'completed' || !t.completed_at) return false
          if (!weekStart) return true
          const comp = new Date(t.completed_at)
          return comp >= weekStart && comp <= weekEnd
        }).length
      } else if (goal.type === 'dedicate_hours') {
        currentValue = tasks
          .filter((t) => {
            if (t.status !== 'completed') return false
            if (goal.subject_id && t.subject_id !== goal.subject_id) return false
            return true
          })
          .reduce((sum, t) => sum + (parseFloat(t.duration_hours) || 0), 0)
      }

      if (currentValue !== parseFloat(goal.current_value)) {
        await get().updateGoal(goal.id, {
          current_value: currentValue,
          is_completed: currentValue >= parseFloat(goal.target_value),
        })
      }
    })
  },

  subscribeToChanges: () => {
    const channel = supabase
      .channel('goals-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'goals' },
        () => {
          get().fetchGoals()
        }
      )
      .subscribe()
    return () => supabase.removeChannel(channel)
  },
}))
