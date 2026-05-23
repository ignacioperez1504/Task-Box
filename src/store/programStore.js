import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useProgramStore = create((set, get) => ({
  programs: [],
  activeProgram: null,
  loading: false,

  fetchPrograms: async () => {
    set({ loading: true })
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .order('name')
    if (!error) {
      set({ programs: data || [] })
      // Keep activeProgram in sync with the fetched list
      const active = get().activeProgram
      if (active) {
        const found = data.find(p => p.id === active.id)
        set({ activeProgram: found || null })
      }
    }
    set({ loading: false })
  },

  createProgram: async (name, institution, color_hex) => {
    const { data, error } = await supabase
      .from('programs')
      .insert({ name, institution, color_hex })
      .select()
      .single()
    if (!error && data) {
      set((state) => ({ programs: [...state.programs, data] }))
      return data
    }
    return null
  },

  updateProgram: async (id, updates) => {
    const { data, error } = await supabase
      .from('programs')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (!error && data) {
      set((state) => {
        const newPrograms = state.programs.map((p) => (p.id === id ? data : p))
        const newActive = state.activeProgram?.id === id ? data : state.activeProgram
        return {
          programs: newPrograms,
          activeProgram: newActive
        }
      })
      return data
    }
    return null
  },

  deleteProgram: async (id) => {
    const { error } = await supabase
      .from('programs')
      .delete()
      .eq('id', id)
    if (!error) {
      set((state) => {
        const newPrograms = state.programs.filter((p) => p.id !== id)
        const newActive = state.activeProgram?.id === id ? null : state.activeProgram
        return {
          programs: newPrograms,
          activeProgram: newActive
        }
      })
      return true
    }
    return false
  },

  getProgramById: (id) => {
    return get().programs.find((p) => p.id === id) || null
  },

  setActiveProgram: (id) => {
    if (id === null || id === undefined || id === 'all') {
      set({ activeProgram: null })
    } else {
      const prog = get().programs.find(p => p.id === id) || null
      set({ activeProgram: prog })
    }
  }
}))
