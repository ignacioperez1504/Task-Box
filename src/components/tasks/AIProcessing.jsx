import { motion } from 'framer-motion'

export default function AIProcessing() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8">
      {/* Scanner effect */}
      <div
        className="relative w-full h-40 overflow-hidden mb-8"
        style={{ background: 'rgba(var(--ink-rgb),.05)', border: '1px solid rgba(var(--ink-rgb),.1)', borderRadius: 'var(--ds-radius-md)' }}
      >
        <motion.div
          className="absolute left-0 right-0 h-0.5"
          style={{
            background: 'linear-gradient(90deg, transparent, #E8825B, transparent)',
            boxShadow: '0 0 20px rgba(232,130,91,0.5)',
          }}
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
        />

        {/* Terminal-style lines */}
        <div className="p-4 space-y-2">
          {[
            'Analizando título y descripción...',
            'Evaluando carga cognitiva de la materia...',
            'Calculando proximidad de la fecha...',
            'Determinando nivel de prioridad...',
          ].map((text, i) => (
            <motion.p
              key={i}
              className="ds-technical text-xs"
              style={{ color: 'var(--fg-secondary)' }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.6, duration: 0.3 }}
            >
              <span className="text-terracotta">›</span> {text}
            </motion.p>
          ))}
        </div>
      </div>

      {/* Loading text */}
      <motion.p
        className="font-display text-xl"
        style={{ color: 'var(--fg-primary)' }}
        animate={{ opacity: [1, 0.5, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        Analizando tarea con IA
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >...</motion.span>
      </motion.p>
    </div>
  )
}
