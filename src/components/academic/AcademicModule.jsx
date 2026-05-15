import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSubjectStore } from '../../store/subjectStore'
import { useAcademicStore } from '../../store/academicStore'

export default function AcademicModule() {
  const { subjects } = useSubjectStore()
  const { 
    getSubjectData, 
    setSubjectCredits, 
    setEvaluations, 
    updateEvaluationGrade,
    calculateCurrentGrade 
  } = useAcademicStore()

  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '')

  const currentSubject = subjects.find(s => s.id === selectedSubjectId)
  const academicData = getSubjectData(selectedSubjectId)
  const stats = calculateCurrentGrade(selectedSubjectId)

  const handleAddEvaluation = () => {
    const newEv = {
      id: crypto.randomUUID(),
      name: '',
      percentage: 0,
      grade: null
    }
    setEvaluations(selectedSubjectId, [...academicData.evaluations, newEv])
  }

  const handleUpdateEv = (id, field, value) => {
    const newEvs = academicData.evaluations.map(ev => {
      if (ev.id === id) {
        return { ...ev, [field]: field === 'percentage' ? parseFloat(value) || 0 : value }
      }
      return ev
    })
    setEvaluations(selectedSubjectId, newEvs)
  }

  const handleRemoveEv = (id) => {
    setEvaluations(selectedSubjectId, academicData.evaluations.filter(ev => ev.id !== id))
  }

  const totalPercentage = academicData.evaluations.reduce((sum, ev) => sum + ev.percentage, 0)

  return (
    <div className="p-8 h-full overflow-y-auto custom-scrollbar">
      <header className="mb-8">
        <h2 className="font-display text-4xl text-beige mb-2">Notas Académicas</h2>
        <p className="text-beige-dark">Gestiona tus materias, créditos y estructura de evaluación.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Subject List & Basic Info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-dark p-6 rounded-2xl border border-beige/5">
            <label className="text-xs text-beige-dark uppercase tracking-widest block mb-4">Seleccionar Materia</label>
            <div className="space-y-2">
              {subjects.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSubjectId(s.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-300 ${
                    selectedSubjectId === s.id 
                      ? 'bg-terracotta/20 border-l-4 border-terracotta text-white' 
                      : 'bg-white/5 hover:bg-white/10 text-beige-dark border-l-4 border-transparent'
                  }`}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color_hex }} />
                  <span className="font-medium truncate">{s.name}</span>
                </button>
              ))}
            </div>
          </div>

          {selectedSubjectId && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-dark p-6 rounded-2xl border border-beige/5 space-y-6"
            >
              <div>
                <label className="text-xs text-beige-dark uppercase tracking-widest block mb-2">Créditos (Intensidad)</label>
                <input
                  type="number"
                  value={academicData.credits || ''}
                  onChange={(e) => setSubjectCredits(selectedSubjectId, e.target.value)}
                  placeholder="Ej: 4"
                  className="w-full bg-teal-darker/40 text-beige text-lg px-4 py-3 rounded-xl border border-beige/15 outline-none focus:border-terracotta transition-colors"
                />
                <p className="text-[10px] text-beige-dark/60 mt-2 italic">
                  Más créditos = Mayor prioridad automática en tareas.
                </p>
              </div>

              <div className="pt-4 border-t border-white/5">
                <p className="text-xs text-beige-dark uppercase tracking-widest mb-4">Resumen Actual</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-[10px] text-beige-dark uppercase mb-1">Promedio</p>
                    <p className="text-2xl font-display text-terracotta">{stats.average.toFixed(2)}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-[10px] text-beige-dark uppercase mb-1">Evaluado</p>
                    <p className="text-2xl font-display text-beige">{stats.percentageEvaluated}%</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right: Evaluation Structure */}
        <div className="lg:col-span-8">
          {!selectedSubjectId ? (
            <div className="h-64 flex flex-col items-center justify-center text-beige-dark opacity-50 border-2 border-dashed border-beige/10 rounded-3xl">
              <p>Selecciona una materia para ver su estructura</p>
            </div>
          ) : (
            <motion.div 
              key={selectedSubjectId}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-dark p-8 rounded-3xl border border-beige/5 min-h-[500px]"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-xl text-beige font-display">{currentSubject?.name}</h3>
                  <p className="text-sm text-beige-dark">Estructura de evaluación del semestre</p>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-xs font-medium ${totalPercentage === 100 ? 'bg-green-500/20 text-green-400' : 'bg-terracotta/20 text-terracotta'}`}>
                  Total: {totalPercentage}%
                </div>
              </div>

              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {academicData.evaluations.map((ev, index) => (
                    <motion.div
                      key={ev.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="grid grid-cols-12 gap-4 items-end bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-colors"
                    >
                      <div className="col-span-5">
                        <label className="text-[10px] text-beige-dark uppercase mb-1.5 block">Nombre del corte / parcial</label>
                        <input
                          type="text"
                          value={ev.name}
                          onChange={(e) => handleUpdateEv(ev.id, 'name', e.target.value)}
                          placeholder="Ej: Parcial 1"
                          className="w-full bg-teal-darker/60 text-beige px-3 py-2 rounded-lg border border-beige/10 outline-none focus:border-terracotta text-sm"
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="text-[10px] text-beige-dark uppercase mb-1.5 block">Porcentaje (%)</label>
                        <input
                          type="number"
                          value={ev.percentage || ''}
                          onChange={(e) => handleUpdateEv(ev.id, 'percentage', e.target.value)}
                          placeholder="30"
                          className="w-full bg-teal-darker/60 text-beige px-3 py-2 rounded-lg border border-beige/10 outline-none focus:border-terracotta text-sm"
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="text-[10px] text-beige-dark uppercase mb-1.5 block">Nota Obtenida</label>
                        <input
                          type="number"
                          step="0.1"
                          value={ev.grade === null ? '' : ev.grade}
                          onChange={(e) => updateEvaluationGrade(selectedSubjectId, ev.id, e.target.value)}
                          placeholder="0.0"
                          className="w-full bg-terracotta/10 text-terracotta px-3 py-2 rounded-lg border border-terracotta/20 outline-none focus:border-terracotta text-sm font-bold"
                        />
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <button 
                          onClick={() => handleRemoveEv(ev.id)}
                          className="p-2 text-beige-dark hover:text-priority-critica transition-colors"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <button
                  onClick={handleAddEvaluation}
                  className="w-full py-4 border-2 border-dashed border-beige/10 rounded-2xl text-beige-dark hover:text-beige hover:border-beige/30 transition-all flex items-center justify-center gap-2 group"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:rotate-90 transition-transform duration-300">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span className="text-sm font-medium">Agregar corte / parcial</span>
                </button>
              </div>

              {totalPercentage > 100 && (
                <p className="mt-4 text-xs text-priority-critica flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  ¡Cuidado! El total de porcentajes supera el 100% ({totalPercentage}%)
                </p>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
