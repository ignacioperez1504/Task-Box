import { motion } from 'framer-motion'

const PRIORITY_COLORS = {
  'Crítica': '#8B2E2E',
  'Alta': '#C27A55',
  'Media': '#C9A96E',
  'Baja': '#2E6B5E',
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
  const color = PRIORITY_COLORS[result.priority] || '#C8C5B8'
  const icon = CATEGORY_ICONS[result.category] || '📌'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="py-6 px-2"
    >
      <p className="text-xs text-beige-dark uppercase tracking-widest mb-6 text-center">
        Resultado de la clasificación
      </p>

      {/* Priority */}
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring' }}
        className="text-center mb-6"
      >
        <p className="text-xs text-beige-dark mb-1">Prioridad</p>
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
          className="glass rounded-xl p-4 text-center"
        >
          <p className="text-2xl mb-1">{icon}</p>
          <p className="text-xs text-beige-dark">Categoría</p>
          <p className="text-sm text-beige font-medium">{result.category}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-xl p-4 text-center"
        >
          <p className="text-2xl mb-1">⏱️</p>
          <p className="text-xs text-beige-dark">Tiempo sugerido</p>
          <p className="text-sm text-beige font-medium">{result.suggestedHours}h</p>
        </motion.div>
      </div>

      {/* Recommendation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl p-4 mb-4"
        style={{
          background: 'rgba(194,122,85,0.08)',
          border: '1px solid rgba(194,122,85,0.3)',
        }}
      >
        <p className="text-xs text-terracotta mb-1 font-medium">Recomendación</p>
        <p className="text-sm text-beige italic leading-relaxed">{result.recommendation}</p>
      </motion.div>

      {/* Study Plan */}
      {result.studyPlan && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl p-4 mb-8 bg-teal-darker/30 border border-beige/10"
        >
          <p className="text-xs text-beige-dark mb-2 font-medium uppercase tracking-widest">Plan de Estudio</p>
          <p className="text-sm text-beige leading-relaxed">{result.studyPlan}</p>
        </motion.div>
      )}

      {/* Buttons */}
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onConfirm}
          className="flex-1 bg-terracotta text-black font-medium py-3.5 rounded-xl text-sm hover:bg-terracotta-light transition-colors"
        >
          Confirmar y guardar
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAdjust}
          className="px-5 py-3.5 text-sm text-beige border border-beige/20 rounded-xl hover:bg-beige/10 transition-colors"
        >
          Ajustar
        </motion.button>
      </div>
    </motion.div>
  )
}
