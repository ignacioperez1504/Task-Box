import { useState } from 'react'
import { motion } from 'framer-motion'
import { useSubjectStore } from '../../store/subjectStore'

export default function GoalForm({ onSave, onCancel, initial = null }) {
  const { subjects } = useSubjectStore()
  const [title, setTitle] = useState(initial?.title || '')
  const [type, setType] = useState(initial?.type || 'complete_tasks')
  const [targetValue, setTargetValue] = useState(initial?.target_value || '')
  const [subjectId, setSubjectId] = useState(initial?.subject_id || '')
  const [weekStart, setWeekStart] = useState(initial?.week_start || '')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title || !targetValue) return
    onSave({
      title,
      type,
      target_value: parseFloat(targetValue),
      subject_id: type === 'dedicate_hours' && subjectId ? subjectId : null,
      week_start: weekStart || null,
    })
  }

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      onSubmit={handleSubmit}
      className="space-y-3 p-3 rounded-xl bg-teal-darker/50 border border-beige/10"
    >
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Nombre de la meta"
        className="w-full bg-transparent border-b border-beige/20 py-1.5 text-sm text-beige placeholder:text-beige-dark focus:border-terracotta outline-none transition-colors"
      />

      <div className="flex gap-2">
        {['complete_tasks', 'dedicate_hours'].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className="flex-1 py-1.5 text-xs rounded-lg transition-all duration-250"
            style={{
              background: type === t ? 'rgba(232,130,91,0.3)' : 'rgba(27,58,53,0.3)',
              color: type === t ? '#E8825B' : '#C8C5B8',
              border: `1px solid ${type === t ? 'rgba(232,130,91,0.4)' : 'rgba(200,197,184,0.1)'}`,
            }}
          >
            {t === 'complete_tasks' ? 'Completar tareas' : 'Dedicar horas'}
          </button>
        ))}
      </div>

      <input
        type="number"
        value={targetValue}
        onChange={(e) => setTargetValue(e.target.value)}
        placeholder={type === 'complete_tasks' ? 'Nº de tareas' : 'Nº de horas'}
        min="1"
        step="0.5"
        className="w-full bg-transparent border-b border-beige/20 py-1.5 text-sm text-beige placeholder:text-beige-dark focus:border-terracotta outline-none transition-colors"
      />

      {type === 'dedicate_hours' && (
        <select
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          className="w-full bg-teal-darker text-beige text-sm py-1.5 rounded border border-beige/20 outline-none"
        >
          <option value="">Cualquier materia</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      )}

      <input
        type="date"
        value={weekStart}
        onChange={(e) => setWeekStart(e.target.value)}
        className="w-full bg-teal-darker text-beige text-sm py-1.5 rounded border border-beige/20 outline-none"
      />

      <div className="flex gap-2">
        <button type="submit" className="flex-1 bg-terracotta text-black text-sm font-medium py-2 rounded-lg hover:bg-terracotta-light transition-colors">
          {initial ? 'Guardar' : 'Crear meta'}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-beige-dark border border-beige/20 rounded-lg hover:bg-beige/10 transition-colors">
          Cancelar
        </button>
      </div>
    </motion.form>
  )
}
