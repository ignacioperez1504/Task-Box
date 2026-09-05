import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { useProgramStore } from './programStore'

const PALETTE = [
  '#C27A55', '#2E6B5E', '#C9A96E', '#8B6F5E', '#5E8B7A',
  '#A5633F', '#6B8E7B', '#D4956F', '#7A9E8C', '#B8856A',
]

export const useSubjectStore = create((set, get) => ({
  subjects: [],
  loading: false,

  fetchSubjects: async () => {
    set({ loading: true })
    const activeProgram = useProgramStore.getState().activeProgram
    
    let query = supabase.from('subjects').select('*')
    
    if (activeProgram) {
      query = query.eq('program_id', activeProgram.id)
    }
    
    const { data, error } = await query.order('name')
    if (!error) set({ subjects: data || [] })
    set({ loading: false })
  },

  createSubject: async (name) => {
    const existing = get().subjects
    const colorIndex = existing.length % PALETTE.length
    const activeProgram = useProgramStore.getState().activeProgram
    
    const insertData = { 
      name, 
      color_hex: PALETTE[colorIndex] 
    }
    
    if (activeProgram) {
      insertData.program_id = activeProgram.id
    }
    
    const { data, error } = await supabase
      .from('subjects')
      .insert(insertData)
      .select()
      .single()
    if (!error && data) {
      set({ subjects: [...existing, data] })
      return data
    }
    return null
  },

  // La FK subject_id de tasks es ON DELETE SET NULL: las tareas asociadas
  // sobreviven al borrado, solo quedan sin materia asignada.
  deleteSubject: async (id) => {
    const { error } = await supabase.from('subjects').delete().eq('id', id)
    if (error) return false
    set({ subjects: get().subjects.filter((s) => s.id !== id) })
    return true
  },

  getSubjectById: (id) => {
    return get().subjects.find((s) => s.id === id) || null
  },

  getSubjectColor: (id) => {
    const s = get().subjects.find((s) => s.id === id)
    return s?.color_hex || '#C27A55'
  },
}))

// Auto-refetch subjects when active program changes
useProgramStore.subscribe((state, prevState) => {
  const activeId = state.activeProgram?.id
  const prevActiveId = prevState?.activeProgram?.id
  if (activeId !== prevActiveId) {
    useSubjectStore.getState().fetchSubjects()
  }
})
