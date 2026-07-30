import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Tooltip({ children, content, className = '' }) {
  const [show, setShow] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const ref = useRef(null)

  const handleEnter = () => {
    if (!content) return
    const rect = ref.current?.getBoundingClientRect()
    if (rect) {
      setPos({ x: rect.left + rect.width / 2, y: rect.top - 8 })
    }
    setShow(true)
  }

  return (
    <div
      ref={ref}
      onMouseEnter={handleEnter}
      onMouseLeave={() => setShow(false)}
      className={`relative inline-block ${className}`}
    >
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-[100] pointer-events-none"
          >
            <div
              className="px-3 py-2 rounded-lg text-sm whitespace-nowrap max-w-[280px] text-center"
              style={{
                whiteSpace: 'pre-wrap',
                background: 'var(--glass-bg-strong)',
                border: '1px solid var(--glass-border)',
                backdropFilter: 'blur(var(--blur-glass))',
                WebkitBackdropFilter: 'blur(var(--blur-glass))',
                boxShadow: 'var(--shadow-elevated)',
                color: 'var(--fg-primary)',
              }}
            >
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
