import { motion } from 'framer-motion'
import { useUIStore } from '../../store/uiStore'

export default function FAB() {
  const { rightPanelOpen, openCreatePanel } = useUIStore()

  if (rightPanelOpen) return null

  return (
    // El FAB comparte forma y relleno con la variante `primary` del botón:
    // píldora (aquí, círculo) y el mismo degradado terracota del sistema Glass.
    <motion.div
      className="glass-button-wrap glass-button-wrap--primary fixed bottom-8 right-8 z-50"
      style={{ animationName: 'pulse-terracotta', animationDuration: '3s', animationIterationCount: 'infinite', animationTimingFunction: 'ease-in-out' }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      <button
        onClick={openCreatePanel}
        title="Nueva tarea"
        className="glass-button relative isolate cursor-pointer w-16 h-16"
      >
        <span className="glass-button-text" style={{ width: 64, height: 64 }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </span>
      </button>
      <div className="glass-button-shadow" aria-hidden="true"></div>
    </motion.div>
  )
}
