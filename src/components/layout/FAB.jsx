import { motion } from 'framer-motion'
import { useUIStore } from '../../store/uiStore'

export default function FAB() {
  const { rightPanelOpen, openCreatePanel } = useUIStore()

  if (rightPanelOpen) return null

  return (
    <motion.button
      onClick={openCreatePanel}
      className="fixed bottom-8 right-8 z-50 w-16 h-16 rounded-full bg-terracotta flex items-center justify-center shadow-elevated"
      style={{ animationName: 'pulse-terracotta', animationDuration: '3s', animationIterationCount: 'infinite', animationTimingFunction: 'ease-in-out' }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--fg-on-accent)" strokeWidth="2.5" strokeLinecap="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </motion.button>
  )
}
