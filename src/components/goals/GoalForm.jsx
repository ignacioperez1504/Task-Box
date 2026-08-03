import { useState } from 'react'
import { motion } from 'framer-motion'
import { useSubjectStore } from '../../store/subjectStore'
import { Input, Label } from '../ui/Field'
import Button from '../ui/Button'

const TYPE_OPTIONS = [
  { value: 'complete_tasks', label: 'Completar tareas' },
  { value: 'dedicate_hours', label: 'Dedicar horas' },
]

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
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      onSubmit={handleSubmit}
      className="space-y-3 p-3"
      style={{
        background: 'rgba(var(--ink-rgb),.04)',
        border: '1px solid rgba(var(--ink-rgb),.1)',
        borderRadius: 'var(--ds-radius-md)',
      }}
    >
      <Input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Nombre de la meta"
        className="!px-3 !py-2"
      />

      <div className="flex gap-2">
        {TYPE_OPTIONS.map((opt) => {
          const active = type === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setType(opt.value)}
              className="flex-1 py-1.5 text-xs transition-colors cursor-pointer"
              style={{
                borderRadius: 'var(--ds-radius-sm)',
                background: active ? 'rgba(232,130,91,.22)' : 'rgba(var(--ink-rgb),.05)',
                color: active ? 'var(--color-terracotta)' : 'var(--fg-secondary)',
                border: `1px solid ${active ? 'rgba(232,130,91,.4)' : 'rgba(var(--ink-rgb),.1)'}`,
                transitionDuration: 'var(--ds-duration-base)',
              }}
            >
              {opt.label}
            </button>
          )
        })}
      </div>

      <Input
        type="number"
        value={targetValue}
        onChange={(e) => setTargetValue(e.target.value)}
        placeholder={type === 'complete_tasks' ? 'Nº de tareas' : 'Nº de horas'}
        min="1"
        step="0.5"
        className="!px-3 !py-2"
      />

      {type === 'dedicate_hours' && (
        <div>
          <Label>Materia</Label>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="w-full text-sm px-3 py-2 outline-none focus:border-terracotta cursor-pointer"
            style={{
              background: 'rgba(var(--ink-rgb),.06)',
              border: '1px solid rgba(var(--ink-rgb),.15)',
              borderRadius: 'var(--ds-radius-control)',
              color: 'var(--fg-primary)',
              fontFamily: 'var(--font-body)',
            }}
          >
            <option value="">Cualquier materia</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <Label>Semana de inicio</Label>
        <Input
          type="date"
          value={weekStart}
          onChange={(e) => setWeekStart(e.target.value)}
          className="!px-3 !py-2"
        />
      </div>

      <div className="flex gap-2 pt-1">
        <Button type="submit" size="sm" className="flex-1">
          {initial ? 'Guardar' : 'Crear meta'}
        </Button>
        <Button type="button" size="sm" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </motion.form>
  )
}
