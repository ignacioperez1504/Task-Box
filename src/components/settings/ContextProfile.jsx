import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useContextStore } from '../../store/contextStore'
import { clearClassificationCache } from '../../lib/aiService'
import Field, { Label } from '../ui/Field'
import Button from '../ui/Button'

// ─── Internal chip-tag input ──────────────────────────────────────────────────

function ChipInput({ label, hint, items, onChange, max = 6, placeholder }) {
  const [input, setInput] = useState('')

  const addItem = () => {
    const val = input.trim()
    if (val && items.length < max && !items.includes(val)) {
      onChange([...items, val])
    }
    setInput('')
  }

  const removeItem = (idx) => onChange(items.filter((_, i) => i !== idx))

  return (
    <div>
      <Label hint={hint}>{label}</Label>

      {items.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {items.map((item, i) => (
            <motion.span
              key={item + i}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs"
              style={{ background: 'rgba(232,130,91,.12)', color: 'var(--fg-primary)', border: '1px solid rgba(232,130,91,.25)' }}
            >
              {item}
              <button
                type="button"
                onClick={() => removeItem(i)}
                className="hover:text-terracotta transition-colors ml-0.5 leading-none"
              >
                ×
              </button>
            </motion.span>
          ))}
        </div>
      )}

      {items.length < max && (
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addItem()
            }
          }}
          onBlur={addItem}
          placeholder={placeholder}
          className="w-full bg-transparent border-b py-2 text-sm outline-none focus:border-terracotta transition-colors"
          style={{ borderColor: 'rgba(var(--ink-rgb),.2)', color: 'var(--fg-primary)' }}
        />
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ContextProfile({ onCancel }) {
  const { profile, setProfile, resetProfile } = useContextStore()

  const [careers, setCareers] = useState([...profile.careers])
  const [workSchedule, setWorkSchedule] = useState(profile.workSchedule)
  const [weakSubjects, setWeakSubjects] = useState([...profile.weakSubjects])
  const [strongSubjects, setStrongSubjects] = useState([...profile.strongSubjects])
  const [studyStyle, setStudyStyle] = useState(profile.studyStyle)
  const [saved, setSaved] = useState(false)

  const profileFilled =
    careers.length || workSchedule || weakSubjects.length || strongSubjects.length || studyStyle

  const handleSave = () => {
    setProfile({ careers, workSchedule, weakSubjects, strongSubjects, studyStyle })
    clearClassificationCache()
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      onCancel?.()
    }, 1200)
  }

  const handleReset = () => {
    resetProfile()
    setCareers([])
    setWorkSchedule('')
    setWeakSubjects([])
    setStrongSubjects([])
    setStudyStyle('')
    clearClassificationCache()
  }

  return (
    <div className="space-y-5">
      <p className="text-xs leading-relaxed" style={{ color: 'var(--fg-secondary)' }}>
        Tu perfil personaliza cómo la IA clasifica y prioriza tus tareas. Cuanto más completo,
        mejores recomendaciones.
      </p>

      {/* Carreras */}
      <ChipInput
        label="Carreras / Programas"
        hint="(máx. 6 · Enter para agregar)"
        items={careers}
        onChange={setCareers}
        max={6}
        placeholder="Ej: Ingeniería de Sistemas, Física..."
      />

      {/* Horario */}
      <Field
        label="Horario de Trabajo"
        type="text"
        value={workSchedule}
        onChange={(e) => setWorkSchedule(e.target.value)}
        placeholder="Ej: Trabajo 4h diarias en las mañanas"
      />

      {/* Materias débiles */}
      <ChipInput
        label="Materias con Dificultad"
        hint="(máx. 8)"
        items={weakSubjects}
        onChange={setWeakSubjects}
        max={8}
        placeholder="Ej: Cálculo, Física, Termodinámica..."
      />

      {/* Materias fuertes */}
      <ChipInput
        label="Materias Fuertes"
        hint="(máx. 8)"
        items={strongSubjects}
        onChange={setStrongSubjects}
        max={8}
        placeholder="Ej: Programación, Estadística..."
      />

      {/* Estilo de aprendizaje */}
      <Field
        as="textarea"
        label="Estilo de Aprendizaje"
        value={studyStyle}
        onChange={(e) => setStudyStyle(e.target.value)}
        placeholder="Ej: Aprendo mejor con ejemplos prácticos. Necesito repasar conceptos antes de resolver ejercicios."
        rows={3}
      />

      {/* Active profile badge */}
      <AnimatePresence>
        {profileFilled && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center justify-between px-3 py-2"
            style={{
              background: 'rgba(79,174,140,.12)',
              border: '1px solid rgba(79,174,140,.25)',
              borderRadius: 'var(--ds-radius-sm)',
            }}
          >
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#4FAE8C' }} />
              <span className="text-xs" style={{ color: 'var(--fg-secondary)' }}>
                Perfil activo · la IA usará este contexto
              </span>
            </div>
            <button
              onClick={handleReset}
              className="text-xs hover:text-terracotta transition-colors"
              style={{ color: 'var(--fg-tertiary)' }}
            >
              Limpiar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="flex gap-3 pt-1">
        <Button onClick={handleSave} className="flex-1">
          {saved ? '✓ Perfil guardado' : 'Guardar perfil'}
        </Button>
        {onCancel && (
          <Button variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </div>
  )
}
