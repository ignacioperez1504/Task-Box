import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useHabitStore } from '../../store/habitStore'

export default function HabitModule() {
  const { 
    habits, 
    addHabit, 
    removeHabit, 
    toggleHabit, 
    getHabitStatus, 
    getStreak, 
    getWeeklyCompletion,
    getMonthlyCompletion 
  } = useHabitStore()

  const [newHabitTitle, setNewHabitTitle] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  const handleAddHabit = (e) => {
    e.preventDefault()
    if (!newHabitTitle.trim()) return
    addHabit(newHabitTitle.trim())
    setNewHabitTitle('')
  }

  // Get last 7 days for the date selector
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i)
    return d.toISOString().split('T')[0]
  }).reverse()

  const weeklyPercentage = getWeeklyCompletion()
  const monthlyPercentage = getMonthlyCompletion()

  return (
    <div className="p-8 h-full overflow-y-auto custom-scrollbar">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="font-display text-4xl text-beige mb-2">Rastreador de Hábitos</h2>
          <p className="text-beige-dark">Construye constancia y disciplina diaria.</p>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <p className="text-[10px] text-beige-dark uppercase tracking-widest mb-1">Semanal</p>
            <p className="text-2xl font-display text-terracotta">{weeklyPercentage}%</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-beige-dark uppercase tracking-widest mb-1">Mensual</p>
            <p className="text-2xl font-display text-beige">{monthlyPercentage}%</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Habit List */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-dark p-6 rounded-3xl border border-beige/5">
            <div className="flex justify-between items-center mb-6">
              <div className="flex bg-teal-darker/40 p-1 rounded-xl border border-beige/10">
                {last7Days.map(date => {
                  const isSelected = selectedDate === date
                  const d = new Date(date + 'T12:00:00')
                  const dayName = d.toLocaleDateString('es-ES', { weekday: 'short' })
                  const dayNum = d.getDate()
                  
                  return (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`px-3 py-2 rounded-lg transition-all duration-300 flex flex-col items-center min-w-[50px] ${
                        isSelected ? 'bg-terracotta text-black' : 'text-beige-dark hover:text-beige'
                      }`}
                    >
                      <span className="text-[10px] uppercase font-bold">{dayName}</span>
                      <span className="text-sm font-display">{dayNum}</span>
                    </button>
                  )
                })}
              </div>
              <p className="text-xs text-beige-dark font-medium">
                {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-ES', { dateStyle: 'long' })}
              </p>
            </div>

            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {habits.length === 0 ? (
                  <div className="py-12 text-center text-beige-dark opacity-50 italic">
                    No tienes hábitos registrados aún.
                  </div>
                ) : (
                  habits.map(habit => (
                    <motion.div
                      key={habit.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="group flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => toggleHabit(habit.id, selectedDate)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 border-2 ${
                            getHabitStatus(habit.id, selectedDate)
                              ? 'bg-terracotta border-terracotta text-black'
                              : 'bg-transparent border-beige/20 text-transparent hover:border-terracotta/50'
                          }`}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </button>
                        <div>
                          <h4 className={`font-medium transition-all ${getHabitStatus(habit.id, selectedDate) ? 'text-beige/50 line-through' : 'text-beige'}`}>
                            {habit.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1 text-[10px] text-terracotta font-bold uppercase">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                              Racha: {getStreak(habit.id)} días
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeHabit(habit.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-beige-dark hover:text-priority-critica transition-all"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right: Add Habit */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-dark p-6 rounded-3xl border border-beige/5">
            <h3 className="text-lg text-beige font-display mb-4">Nuevo Hábito</h3>
            <form onSubmit={handleAddHabit} className="space-y-4">
              <div>
                <label className="text-xs text-beige-dark uppercase tracking-widest block mb-2">¿Qué quieres lograr?</label>
                <input
                  type="text"
                  value={newHabitTitle}
                  onChange={(e) => setNewHabitTitle(e.target.value)}
                  placeholder="Ej: Meditar 10 min"
                  className="w-full bg-teal-darker/40 text-beige px-4 py-3 rounded-xl border border-beige/15 outline-none focus:border-terracotta transition-colors text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={!newHabitTitle.trim()}
                className="w-full bg-terracotta text-black font-bold py-3 rounded-xl hover:bg-terracotta-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase tracking-wider"
              >
                Agregar Hábito
              </button>
            </form>
          </div>

          <div className="glass-dark p-6 rounded-3xl border border-beige/5">
            <h3 className="text-xs text-beige-dark uppercase tracking-widest mb-4">Consejo de Productividad</h3>
            <div className="p-4 bg-terracotta/5 rounded-2xl border border-terracotta/20">
              <p className="text-sm text-beige leading-relaxed italic">
                "La constancia es más importante que la intensidad. Es mejor hacer 5 minutos cada día que 2 horas una vez a la semana."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
