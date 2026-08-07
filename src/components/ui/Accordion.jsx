import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Chevron } from './Dropdown'
import { GlassLayers, glassSurfaceVariants } from './GlassSurface'

// Sección plegable del sistema. Comparte iconografía y curva de movimiento con
// <Dropdown> (mismo chevron, misma ease), de forma que abrir un acordeón y
// abrir un desplegable se sientan como el mismo gesto.
export default function Accordion({
  title,
  icon,
  defaultOpen = false,
  variant = 'panel',   // 'panel' = caja con borde | 'inline' = solo el disparador
  badge,
  children,
  className = '',
}) {
  const [open, setOpen] = useState(defaultOpen)
  const isPanel = variant === 'panel'

  return (
    <div
      className={
        isPanel
          ? `${glassSurfaceVariants({ elevation: 'sunken', radius: 'md', clip: true })} ${className}`
          : `overflow-hidden ${className}`
      }
    >
      {isPanel && <GlassLayers />}

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between gap-3 transition-colors focus:outline-none cursor-pointer ${
          isPanel ? 'px-6 py-4 hover-surface' : 'py-1'
        }`}
        style={{ color: isPanel ? 'var(--fg-primary)' : 'var(--fg-tertiary)' }}
      >
        <span className="flex items-center gap-3 min-w-0">
          {icon && <span className="flex shrink-0" style={{ color: 'var(--color-terracotta)' }}>{icon}</span>}
          <span
            className="truncate"
            style={{
              fontSize: isPanel ? 14 : 12,
              fontWeight: isPanel ? 600 : 500,
              letterSpacing: isPanel ? '.01em' : 'normal',
            }}
          >
            {title}
          </span>
          {badge}
        </span>
        <Chevron open={open} size={isPanel ? 18 : 12} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            style={isPanel ? {
              borderTop: '1px solid rgba(var(--ink-rgb),.08)',
              background: 'rgba(var(--ink-rgb),.015)',
            } : undefined}
          >
            <div className={isPanel ? 'p-6' : 'pt-2'}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
