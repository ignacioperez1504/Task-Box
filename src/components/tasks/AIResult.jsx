import { motion } from 'framer-motion'
import GlassCard from '../ui/GlassCard'

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
      <p className="text-xs uppercase tracking-widest mb-6 text-center" style={{ color: 'var(--fg-tertiary)' }}>
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
          <p className="text-xs mb-2 font-medium uppercase tracking-widest" style={{ color: 'var(--fg-tertiary)' }}>Plan de Estudio</p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--fg-secondary)' }}>{result.studyPlan}</p>
        </motion.div>
      )}

      {/* Buttons */}
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onConfirm}
          className="flex-1 bg-terracotta font-medium py-3.5 rounded-xl text-sm hover:bg-terracotta-light transition-colors"
          style={{ color: '#FFF8F4' }}
        >
          Confirmar y guardar
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAdjust}
          className="px-5 py-3.5 text-sm rounded-xl hover-surface transition-colors"
          style={{ color: 'var(--fg-primary)', border: '1px solid var(--glass-border)' }}
        >
          Ajustar
        </motion.button>
      </div>
    </motion.div>
  )
}
