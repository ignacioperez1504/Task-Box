import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const DEFAULT_PROFILE = {
  careers: [],
  workSchedule: '',
  weakSubjects: [],
  strongSubjects: [],
  studyStyle: '',
}

export const useContextStore = create(
  persist(
    (set, get) => ({
      profile: { ...DEFAULT_PROFILE },

      setProfile: (updates) =>
        set((state) => ({
          profile: { ...state.profile, ...updates },
        })),

      resetProfile: () => set({ profile: { ...DEFAULT_PROFILE } }),

      hasProfile: () => {
        const { careers, workSchedule, weakSubjects, strongSubjects, studyStyle } = get().profile
        return (
          careers.length > 0 ||
          !!workSchedule ||
          weakSubjects.length > 0 ||
          strongSubjects.length > 0 ||
          !!studyStyle
        )
      },

      /**
       * Returns a formatted multi-line context block for AI prompts,
       * or null if the profile is empty.
       */
      buildContextBlock: () => {
        const { careers, workSchedule, weakSubjects, strongSubjects, studyStyle } =
          get().profile
        const lines = []
        if (careers.length)
          lines.push(`- Carreras: ${careers.join(', ')}`)
        if (workSchedule)
          lines.push(`- Horario laboral: ${workSchedule}`)
        if (weakSubjects.length)
          lines.push(`- Materias con dificultad: ${weakSubjects.join(', ')}`)
        if (strongSubjects.length)
          lines.push(`- Materias fuertes: ${strongSubjects.join(', ')}`)
        if (studyStyle)
          lines.push(`- Estilo de aprendizaje: ${studyStyle}`)
        return lines.length ? lines.join('\n') : null
      },
    }),
    {
      name: 'sf-context-profile',
    }
  )
)
