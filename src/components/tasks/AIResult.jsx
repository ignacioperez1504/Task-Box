import { motion } from 'framer-motion'
import GlassCard from '../ui/GlassCard'
import Button from '../ui/Button'

const PRIORITY_COLORS = {
  'Crítica': '#E15252',
  'Alta': '#E8825B',
  'Media': '#E8C468',
  'Baja': '#4FAE8C',
}

const CATEGORY_ICONS = {
  'Examen': '📝',
  'Proyecto': '📐',
  'Tarea corta': '✏️',
  'Lectura': '📖',
  'Investigación': '🔬',
  'Laboratorio': '🧪',
  'Otro': '📌',
}

export default function AIResult({ result, onConfirm, onAdjust }) {
  const color = PRIORITY_COLORS[result.priority] || '#94A3B8'
  const icon = CATEGORY_ICONS[result.category] || '📌'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="py-6 px-2"
    >
      <p className="ds-label text-center !mb-6">
        Resultado de la clasificación
      </p>

      {/* Priority */}
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring' }}
        className="text-center mb-6"
      >
        <p className="text-xs mb-1" style={{ color: 'var(--fg-secondary)' }}>Prioridad</p>
        <p
          className="font-display text-4xl font-bold"
          style={{ color }}
        >
          {result.priority}
        </p>
      </motion.div>

      {/* Category and time */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard radius="md" padding={16} className="text-center">
            <p className="text-2xl mb-1">{icon}</p>
            <p className="text-xs" style={{ color: 'var(--fg-secondary)' }}>Categoría</p>
            <p className="text-sm font-medium" style={{ color: 'var(--fg-primary)' }}>{result.category}</p>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard radius="md" padding={16} className="text-center">
            <p className="text-2xl mb-1">⏱️</p>
            <p className="text-xs" style={{ color: 'var(--fg-secondary)' }}>Tiempo sugerido</p>
            <p className="text-sm font-medium" style={{ color: 'var(--fg-primary)' }}>{result.suggestedHours}h</p>
          </GlassCard>
        </motion.div>
      </div>

      {/* Recommendation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl p-4 mb-4"
        style={{
          background: 'rgba(232,130,91,0.1)',
          border: '1px solid rgba(232,130,91,0.3)',
        }}
      >
        <p className="text-xs text-terracotta mb-1 font-medium">Recomendación</p>
        <p className="text-sm italic leading-relaxed" style={{ color: 'var(--fg-primary)' }}>{result.recommendation}</p>
      </motion.div>

      {/* Study Plan */}
      {result.studyPlan && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl p-4 mb-8"
          style={{ background: 'rgba(var(--ink-rgb),.05)', border: '1px solid rgba(var(--ink-rgb),.1)' }}
        >
          <p className="ds-label !mb-2">Plan de Estudio</p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--fg-secondary)' }}>{result.studyPlan}</p>
        </motion.div>
      )}

      {/* Buttons */}
      <div className="flex gap-3">
        <Button size="lg" className="flex-1" onClick={onConfirm}>
          Confirmar y guardar
        </Button>
        <Button size="lg" variant="secondary" onClick={onAdjust}>
          Ajustar
        </Button>
      </div>
    </motion.div>
  )
}
