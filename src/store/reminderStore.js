import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useReminderStore = create(
  persist(
    (set, get) => ({
      // Array of { id: string, title: string, date: string, completed: boolean }
      reminders: [],

      addReminder: (title, date) => {
        const newReminder = {
          id: crypto.randomUUID(),
          title,
          date, // YYYY-MM-DD
          completed: false,
          created_at: new Date().toISOString()
        }
        set((state) => ({ reminders: [...state.reminders, newReminder] }))
      },

      removeReminder: (id) => {
        set((state) => ({
          reminders: state.reminders.filter(r => r.id !== id)
        }))
      },

      toggleReminder: (id) => {
        set((state) => ({
          reminders: state.reminders.map(r => 
            r.id === id ? { ...r, completed: !r.completed } : r
          )
        }))
      },

      getRemindersByDate: (dateStr) => {
        return get().reminders.filter(r => r.date === dateStr)
      },

      getPendingCountByDate: (dateStr) => {
        return get().reminders.filter(r => r.date === dateStr && !r.completed).length
      }
    }),
    {
      name: 'sf-reminder-storage',
    }
  )
)
