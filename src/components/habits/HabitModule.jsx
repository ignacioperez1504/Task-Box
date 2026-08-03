import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useHabitStore } from '../../store/habitStore'
import GlassCard from '../ui/GlassCard'
import PageHeader from '../ui/PageHeader'
import Field from '../ui/Field'
import Button from '../ui/Button'

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
      <PageHeader
        title="Rastreador de Hábitos"
        subtitle="Construye constancia y disciplina diaria."
        actions={
          <>
            <div className="text-right">
              <p className="ds-label !mb-1">Semanal</p>
              <p className="text-2xl font-display text-terracotta">{weeklyPercentage}%</p>
            </div>
            <div className="text-right">
              <p className="ds-label !mb-1">Mensual</p>
              <p className="text-2xl font-display" style={{ color: 'var(--fg-primary)' }}>{monthlyPercentage}%</p>
            </div>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Habit List */}
        <div className="lg:col-span-8 space-y-6">
          <GlassCard radius="lg" padding={24}>
            <div className="flex justify-between items-center mb-6">
              <div className="flex p-1 rounded-xl" style={{ background: 'rgba(var(--ink-rgb),.06)', border: '1px solid rgba(var(--ink-rgb),.1)' }}>
                {last7Days.map(date => {
                  const isSelected = selectedDate === date
                  const d = new Date(date + 'T12:00:00')
                  const dayName = d.toLocaleDateString('es-ES', { weekday: 'short' })
                  const dayNum = d.getDate()

                  return (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className="px-3 py-2 rounded-lg transition-all duration-300 flex flex-col items-center min-w-[50px]"
                      style={isSelected
                        ? { background: 'var(--color-terracotta)', color: 'var(--fg-on-accent)' }
                        : { color: 'var(--fg-secondary)' }
                      }
                    >
                      <span className="text-[10px] uppercase font-bold">{dayName}</span>
                      <span className="text-sm font-display">{dayNum}</span>
                    </button>
                  )
                })}
              </div>
              <p className="text-xs font-medium" style={{ color: 'var(--fg-secondary)' }}>
                {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-ES', { dateStyle: 'long' })}
              </p>
            </div>

            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {habits.length === 0 ? (
                  <div className="py-12 text-center opacity-60 italic" style={{ color: 'var(--fg-secondary)' }}>
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
                      className="group flex items-center justify-between p-4 transition-all"
                      style={{ background: 'rgba(var(--ink-rgb),.03)', border: '1px solid rgba(var(--ink-rgb),.07)', borderRadius: 'var(--ds-radius-md)' }}
                    >
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => toggleHabit(habit.id, selectedDate)}
                          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 border-2"
                          style={getHabitStatus(habit.id, selectedDate)
                            ? { background: 'var(--color-terracotta)', borderColor: 'var(--color-terracotta)', color: 'var(--fg-on-accent)' }
                            : { background: 'transparent', borderColor: 'rgba(var(--ink-rgb),.2)', color: 'transparent' }
                          }
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </button>
                        <div>
                          <h4
                            className={`font-medium transition-all ${getHabitStatus(habit.id, selectedDate) ? 'line-through' : ''}`}
                            style={{ color: getHabitStatus(habit.id, selectedDate) ? 'var(--fg-tertiary)' : 'var(--fg-primary)' }}
                          >
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
                        className="opacity-0 group-hover:opacity-100 p-2 hover:text-priority-critica transition-all"
                        style={{ color: 'var(--fg-tertiary)' }}
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
          </GlassCard>
        </div>

        {/* Right: Add Habit */}
        <div className="lg:col-span-4 space-y-6">
          <GlassCard radius="lg" padding={24}>
            <h3 className="text-lg font-display mb-4" style={{ color: 'var(--fg-primary)' }}>Nuevo Hábito</h3>
            <form onSubmit={handleAddHabit} className="space-y-4">
              <Field
                label="¿Qué quieres lograr?"
                type="text"
                value={newHabitTitle}
                onChange={(e) => setNewHabitTitle(e.target.value)}
                placeholder="Ej: Meditar 10 min"
              />
              <Button type="submit" fullWidth disabled={!newHabitTitle.trim()}>
                Agregar Hábito
              </Button>
            </form>
          </GlassCard>

          <GlassCard radius="lg" padding={24}>
            <h3 className="ds-label !mb-4">Consejo de Productividad</h3>
            <div className="p-4" style={{ background: 'rgba(232,130,91,.08)', border: '1px solid rgba(232,130,91,.2)', borderRadius: 'var(--ds-radius-md)' }}>
              <p className="text-sm leading-relaxed italic" style={{ color: 'var(--fg-secondary)' }}>
                "La constancia es más importante que la intensidad. Es mejor hacer 5 minutos cada día que 2 horas una vez a la semana."
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
