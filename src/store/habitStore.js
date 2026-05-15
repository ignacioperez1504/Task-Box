import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useHabitStore = create(
  persist(
    (set, get) => ({
      // Array of { id: string, title: string, color: string, created_at: string }
      habits: [],
      
      // { [dateStr]: { [habitId]: boolean } }
      logs: {},

      addHabit: (title, color = '#C27A55') => {
        const newHabit = {
          id: crypto.randomUUID(),
          title,
          color,
          created_at: new Date().toISOString()
        }
        set((state) => ({ habits: [...state.habits, newHabit] }))
      },

      removeHabit: (id) => {
        set((state) => ({
          habits: state.habits.filter(h => h.id !== id),
          // We keep logs for history, or we could clean them up
        }))
      },

      toggleHabit: (id, dateStr) => {
        set((state) => {
          const dayLogs = state.logs[dateStr] || {}
          return {
            logs: {
              ...state.logs,
              [dateStr]: {
                ...dayLogs,
                [id]: !dayLogs[id]
              }
            }
          }
        })
      },

      getHabitStatus: (id, dateStr) => {
        return get().logs[dateStr]?.[id] || false
      },

      getStreak: (habitId) => {
        const { logs } = get()
        let streak = 0
        const today = new Date()
        
        for (let i = 0; i < 365; i++) {
          const d = new Date(today)
          d.setDate(today.getDate() - i)
          const dateStr = d.toISOString().split('T')[0]
          
          if (logs[dateStr]?.[habitId]) {
            streak++
          } else {
            // If it's today and not checked yet, we don't break the streak immediately
            // unless yesterday was also not checked.
            if (i === 0) continue 
            break
          }
        }
        return streak
      },

      getWeeklyCompletion: () => {
        const { habits, logs } = get()
        if (habits.length === 0) return 0
        
        const now = new Date()
        let completed = 0
        let total = habits.length * 7
        
        for (let i = 0; i < 7; i++) {
          const d = new Date(now)
          d.setDate(now.getDate() - i)
          const dateStr = d.toISOString().split('T')[0]
          const dayLogs = logs[dateStr] || {}
          habits.forEach(h => {
            if (dayLogs[h.id]) completed++
          })
        }
        
        return Math.round((completed / total) * 100)
      },

      getMonthlyCompletion: () => {
        const { habits, logs } = get()
        if (habits.length === 0) return 0
        
        const now = new Date()
        let completed = 0
        let total = habits.length * 30
        
        for (let i = 0; i < 30; i++) {
          const d = new Date(now)
          d.setDate(now.getDate() - i)
          const dateStr = d.toISOString().split('T')[0]
          const dayLogs = logs[dateStr] || {}
          habits.forEach(h => {
            if (dayLogs[h.id]) completed++
          })
        }
        
        return Math.round((completed / total) * 100)
      },

      getTodaysStats: () => {
        const { habits, logs } = get()
        const todayStr = new Date().toISOString().split('T')[0]
        const dayLogs = logs[todayStr] || {}
        const completed = habits.filter(h => dayLogs[h.id]).length
        return {
          completed,
          total: habits.length,
          percentage: habits.length > 0 ? Math.round((completed / habits.length) * 100) : 0
        }
      }
    }),
    {
      name: 'sf-habit-storage',
    }
  )
)
