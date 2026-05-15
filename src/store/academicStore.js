import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAcademicStore = create(
  persist(
    (set, get) => ({
      // { [subjectId]: { credits: number, evaluations: [{ id: string, name: string, percentage: number, grade: number | null }] } }
      subjectAcademicData: {},
      
      // { [taskId]: number }
      taskWeights: {},

      // { [taskId]: number }
      taskScores: {},

      // { [taskId]: string }
      studyPlans: {},

      setSubjectCredits: (subjectId, credits) => {
        set((state) => ({
          subjectAcademicData: {
            ...state.subjectAcademicData,
            [subjectId]: {
              ...(state.subjectAcademicData[subjectId] || { evaluations: [] }),
              credits: parseFloat(credits) || 0,
            },
          },
        }))
      },

      setEvaluations: (subjectId, evaluations) => {
        set((state) => ({
          subjectAcademicData: {
            ...state.subjectAcademicData,
            [subjectId]: {
              ...(state.subjectAcademicData[subjectId] || { credits: 0 }),
              evaluations,
            },
          },
        }))
      },

      updateEvaluationGrade: (subjectId, evaluationId, grade) => {
        set((state) => {
          const subject = state.subjectAcademicData[subjectId]
          if (!subject) return state
          
          const newEvaluations = subject.evaluations.map(ev => 
            ev.id === evaluationId ? { ...ev, grade: grade === '' ? null : parseFloat(grade) } : ev
          )
          
          return {
            subjectAcademicData: {
              ...state.subjectAcademicData,
              [subjectId]: {
                ...subject,
                evaluations: newEvaluations
              }
            }
          }
        })
      },

      setTaskWeight: (taskId, weight) => {
        set((state) => ({
          taskWeights: {
            ...state.taskWeights,
            [taskId]: parseFloat(weight) || 0,
          },
        }))
      },

      setTaskScore: (taskId, score) => {
        set((state) => ({
          taskScores: {
            ...state.taskScores,
            [taskId]: parseFloat(score) || 0,
          },
        }))
      },

      getSubjectData: (subjectId) => {
        return get().subjectAcademicData[subjectId] || { credits: 0, evaluations: [] }
      },

      getTaskWeight: (taskId) => {
        return get().taskWeights[taskId] || 0
      },

      getTaskScore: (taskId) => {
        return get().taskScores[taskId] || 0
      },

      setStudyPlan: (taskId, plan) => {
        set((state) => ({
          studyPlans: {
            ...state.studyPlans,
            [taskId]: plan,
          },
        }))
      },

      getStudyPlan: (taskId) => {
        return get().studyPlans[taskId] || ''
      },
      
      calculateCurrentGrade: (subjectId) => {
        const data = get().subjectAcademicData[subjectId]
        if (!data || !data.evaluations || !data.evaluations.length) return { average: 0, currentWeighted: 0, percentageEvaluated: 0 }
        
        let totalWeightedGrade = 0
        let totalPercentageEvaluated = 0
        
        data.evaluations.forEach(ev => {
          if (ev.grade !== null && ev.grade !== undefined) {
            totalWeightedGrade += (ev.grade * (ev.percentage / 100))
            totalPercentageEvaluated += ev.percentage
          }
        })
        
        return {
          average: totalPercentageEvaluated > 0 ? (totalWeightedGrade / (totalPercentageEvaluated / 100)) : 0,
          currentWeighted: totalWeightedGrade,
          percentageEvaluated: totalPercentageEvaluated,
          remainingPercentage: 100 - totalPercentageEvaluated
        }
      }
    }),
    {
      name: 'sf-academic-storage',
    }
  )
)
