import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useReminderStore } from '../../store/reminderStore'

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
      <header className="mb-8">
        <h2 className="font-display text-4xl text-beige mb-2">Recordatorios</h2>
        <p className="text-beige-dark">Pendientes personales y eventos rápidos.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form */}
        <div className="lg:col-span-4">
          <div className="glass-dark p-6 rounded-3xl border border-beige/5 sticky top-0">
            <h3 className="text-lg text-beige font-display mb-6">Nuevo Recordatorio</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-xs text-beige-dark uppercase tracking-widest block mb-2">¿Qué recordar?</label>
                <input
                  type="text"
                  value={newReminderTitle}
                  onChange={(e) => setNewReminderTitle(e.target.value)}
                  placeholder="Ej: Llamar a mamá"
                  className="w-full bg-teal-darker/40 text-beige px-4 py-3 rounded-xl border border-beige/15 outline-none focus:border-terracotta transition-colors text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-beige-dark uppercase tracking-widest block mb-2">Fecha</label>
                <input
                  type="date"
                  value={newReminderDate}
                  onChange={(e) => setNewReminderDate(e.target.value)}
                  className="w-full bg-teal-darker/40 text-beige px-4 py-3 rounded-xl border border-beige/15 outline-none focus:border-terracotta transition-colors text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={!newReminderTitle.trim()}
                className="w-full bg-terracotta text-black font-bold py-3 rounded-xl hover:bg-terracotta-light transition-colors disabled:opacity-50 text-sm uppercase tracking-wider"
              >
                Guardar
              </button>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-8 space-y-8">
          {sortedDates.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-beige-dark opacity-50 border-2 border-dashed border-beige/10 rounded-3xl">
              <p>No tienes recordatorios guardados.</p>
            </div>
          ) : (
            sortedDates.map(date => (
              <div key={date}>
                <h4 className="text-xs text-terracotta font-bold uppercase tracking-widest mb-4 flex items-center gap-3">
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
                        className="group flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => toggleReminder(reminder.id)}
                            className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all ${
                              reminder.completed 
                                ? 'bg-terracotta border-terracotta text-black' 
                                : 'bg-transparent border-beige/20 text-transparent hover:border-terracotta/50'
                            }`}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </button>
                          <span className={`text-sm transition-all ${reminder.completed ? 'text-beige/40 line-through' : 'text-beige'}`}>
                            {reminder.title}
                          </span>
                        </div>
                        <button
                          onClick={() => removeReminder(reminder.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-beige-dark hover:text-priority-critica transition-all"
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
