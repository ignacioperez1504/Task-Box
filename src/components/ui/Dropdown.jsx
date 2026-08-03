import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Desplegable único de la app. Antes convivían cuatro implementaciones: una
// solo-hover (filtro de materias), dos sin animación ni chevron (SubjectSelect,
// CustomDatePicker) y una completa (ProgramSelector). Este componente unifica
// el gesto (click), la animación, el chevron y la superficie del panel.

const TRIGGER_VARIANTS = {
  // Se lee como un input: mismo tinte hundido que <Field>.
  field: {
    padding: '12px 16px',
    fontSize: 14,
    background: 'rgba(var(--ink-rgb),.06)',
    border: '1px solid rgba(var(--ink-rgb),.15)',
    borderRadius: 'var(--ds-radius-control)',
  },
  // Se lee como una tarjeta de vidrio: selector de programa en el sidebar.
  surface: {
    padding: '10px 16px',
    fontSize: 14,
    background: 'var(--glass-bg)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--ds-radius-control)',
  },
  // Botón chip de barra de filtros.
  compact: {
    padding: '6px 12px',
    fontSize: 12,
    background: 'transparent',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--ds-radius-sm)',
  },
}

export function Chevron({ open, size = 14 }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      className="shrink-0"
      animate={{ rotate: open ? 180 : 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      <polyline points="6 9 12 15 18 9" />
    </motion.svg>
  )
}

// Superficie flotante compartida por dropdowns, popovers y menús.
export function DropdownPanel({ children, align = 'left', className = '', style }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className={`absolute top-full mt-1.5 z-50 overflow-hidden ${
        align === 'right' ? 'right-0' : 'left-0'
      } ${className}`}
      style={{
        background: 'var(--glass-bg-strong)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--ds-radius-md)',
        backdropFilter: 'blur(var(--blur-glass-strong))',
        WebkitBackdropFilter: 'blur(var(--blur-glass-strong))',
        transform: 'translateZ(0)',
        boxShadow: 'var(--shadow-elevated)',
        ...style,
      }}
    >
      {children}
    </motion.div>
  )
}

// Fila de opción estándar dentro de un panel.
export function DropdownItem({ children, active = false, className = '', style, ...props }) {
  return (
    <button
      type="button"
      className={`w-full text-left flex items-center gap-2 px-4 py-2.5 text-xs transition-colors hover-surface cursor-pointer ${className}`}
      style={{
        color: active ? 'var(--fg-primary)' : 'var(--fg-secondary)',
        fontWeight: active ? 600 : 400,
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  )
}

export default function Dropdown({
  label,
  trigger,                 // contenido del disparador por defecto
  renderTrigger,           // o un disparador propio: ({ open, toggle }) => node
  children,                // contenido del panel; acepta ({ close }) => node
  variant = 'field',
  align = 'left',
  matchTriggerWidth = true,
  panelWidth,
  panelClassName = '',
  panelStyle,
  placeholder = false,     // pinta el disparador como "sin selección"
  className = '',
  triggerStyle,
  disabled = false,
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const toggle = () => !disabled && setOpen((v) => !v)
  const close = () => setOpen(false)

  return (
    <div ref={ref} className={`relative ${className}`}>
      {label && <label className="ds-label mb-2">{label}</label>}

      {renderTrigger ? (
        renderTrigger({ open, toggle, close })
      ) : (
        <button
          type="button"
          onClick={toggle}
          disabled={disabled}
          className="w-full flex items-center justify-between gap-3 text-left transition-colors hover-surface cursor-pointer"
          style={{
            ...TRIGGER_VARIANTS[variant],
            color: placeholder ? 'var(--fg-tertiary)' : 'var(--fg-primary)',
            fontFamily: 'var(--font-body)',
            opacity: disabled ? 0.5 : 1,
            ...triggerStyle,
          }}
        >
          <span className="flex items-center gap-2 truncate min-w-0">{trigger}</span>
          <Chevron open={open} size={variant === 'compact' ? 12 : 14} />
        </button>
      )}

      <AnimatePresence>
        {open && (
          <DropdownPanel
            align={align}
            className={panelClassName}
            style={{
              width: panelWidth ?? (matchTriggerWidth ? '100%' : undefined),
              ...panelStyle,
            }}
          >
            {typeof children === 'function' ? children({ close }) : children}
          </DropdownPanel>
        )}
      </AnimatePresence>
    </div>
  )
}
