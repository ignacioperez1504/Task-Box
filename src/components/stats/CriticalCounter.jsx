import { motion } from 'framer-motion'

export default function CriticalCounter({ count }) {
  const isAlert = count >= 3
  const isZero = count === 0

  return (
    <div className="flex items-center gap-3">
      <motion.div
        className="w-10 h-10 rounded-lg flex items-center justify-center font-display text-xl font-bold"
        style={{
          backgroundColor: isZero ? 'rgba(46,107,94,0.3)' : 'rgba(139,46,46,0.3)',
          color: isZero ? '#2E6B5E' : '#8B2E2E',
        }}
        animate={isAlert ? {
          boxShadow: [
            '0 0 0 0 rgba(139,46,46,0.4)',
            '0 0 0 8px rgba(139,46,46,0)',
          ],
        } : {}}
        transition={isAlert ? { duration: 2, repeat: Infinity } : {}}
      >
        {count}
      </motion.div>
      <div>
        <p className="text-xs text-beige-dark">Críticas</p>
        {isZero && (
          <p className="text-xs text-teal-light flex items-center gap-1">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
            Todo bien
          </p>
        )}
      </div>
    </div>
  )
}
