import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useReminderStore } from '../../store/reminderStore'
import GlassCard from '../ui/GlassCard'
import PageHeader from '../ui/PageHeader'
import Field from '../ui/Field'
import Button from '../ui/Button'

export default function ReminderModule() {
  const { reminders, addReminder, removeReminder, toggleReminder } = useReminderStore()
  const [newReminderTitle, setNewReminderTitle] = useState('')
  const [newReminderDate, setNewReminderDate] = useState(new Date().toISOString().split('T')[0])

  const handleAdd = (e) => {
    e.preventDefault()
    if (!newReminderTitle.trim() || !newReminderDate) return
    addReminder(newReminderTitle.trim(), newReminderDate)
    setNewReminderTitle('')
  }

  // Group reminders by date
  const grouped = reminders.reduce((acc, r) => {
    if (!acc[r.date]) acc[r.date] = []
    acc[r.date].push(r)
    return acc
  }, {})

  const sortedDates = Object.keys(grouped).sort()

  return (
    <div className="p-8 h-full overflow-y-auto custom-scrollbar">
      <PageHeader
        title="Recordatorios"
        subtitle="Pendientes personales y eventos rápidos."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form */}
        <div className="lg:col-span-4">
          <GlassCard radius="lg" padding={24} className="sticky top-0">
            <h3 className="text-lg font-display mb-6" style={{ color: 'var(--fg-primary)' }}>Nuevo Recordatorio</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <Field
                label="¿Qué recordar?"
                type="text"
                value={newReminderTitle}
                onChange={(e) => setNewReminderTitle(e.target.value)}
                placeholder="Ej: Llamar a mamá"
              />
              <Field
                label="Fecha"
                type="date"
                value={newReminderDate}
                onChange={(e) => setNewReminderDate(e.target.value)}
              />
              <Button type="submit" fullWidth disabled={!newReminderTitle.trim()}>
                Guardar
              </Button>
            </form>
          </GlassCard>
        </div>

        {/* List */}
        <div className="lg:col-span-8 space-y-8">
          {sortedDates.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center opacity-60 border-2 border-dashed rounded-3xl" style={{ color: 'var(--fg-secondary)', borderColor: 'rgba(var(--ink-rgb),.15)' }}>
              <p>No tienes recordatorios guardados.</p>
            </div>
          ) : (
            sortedDates.map(date => (
              <div key={date}>
                <h4 className="ds-label !mb-4 flex items-center gap-3" style={{ color: 'var(--color-terracotta)' }}>
                  {new Date(date + 'T12:00:00').toLocaleDateString('es-ES', { dateStyle: 'full' })}
                  <div className="h-px flex-1 bg-terracotta/20" />
                </h4>
                <div className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {grouped[date].map(reminder => (
                      <motion.div
                        key={reminder.id}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="group flex items-center justify-between p-4 transition-all"
                        style={{ background: 'rgba(var(--ink-rgb),.03)', border: '1px solid rgba(var(--ink-rgb),.07)', borderRadius: 'var(--ds-radius-md)' }}
                      >
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => toggleReminder(reminder.id)}
                            className="w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all"
                            style={reminder.completed
                              ? { background: 'var(--color-terracotta)', borderColor: 'var(--color-terracotta)', color: 'var(--fg-on-accent)' }
                              : { background: 'transparent', borderColor: 'rgba(var(--ink-rgb),.2)', color: 'transparent' }
                            }
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </button>
                          <span
                            className={`text-sm transition-all ${reminder.completed ? 'line-through' : ''}`}
                            style={{ color: reminder.completed ? 'var(--fg-tertiary)' : 'var(--fg-primary)' }}
                          >
                            {reminder.title}
                          </span>
                        </div>
                        <button
                          onClick={() => removeReminder(reminder.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 hover:text-priority-critica transition-all"
                          style={{ color: 'var(--fg-tertiary)' }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
