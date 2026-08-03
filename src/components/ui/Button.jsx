import { motion } from 'framer-motion'

// Un único lenguaje de botón para toda la app. Antes cada pantalla repetía su
// propio `bg-terracotta ... rounded-xl` con paddings y colores ligeramente
// distintos.
const VARIANTS = {
  primary: {
    background: 'var(--color-terracotta)',
    color: 'var(--fg-on-accent)',
    border: '1px solid transparent',
  },
  secondary: {
    background: 'transparent',
    color: 'var(--fg-primary)',
    border: '1px solid var(--glass-border)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--fg-secondary)',
    border: '1px solid transparent',
  },
  danger: {
    background: 'var(--color-priority-critica)',
    color: 'var(--fg-on-accent)',
    border: '1px solid transparent',
  },
  'danger-outline': {
    background: 'transparent',
    color: 'var(--color-priority-critica)',
    border: '1px solid rgba(225,82,82,.3)',
  },
  success: {
    background: 'var(--color-priority-baja)',
    color: 'var(--fg-on-accent)',
    border: '1px solid transparent',
  },
}

const SIZES = {
  sm: { padding: '8px 16px', fontSize: 12 },
  md: { padding: '12px 20px', fontSize: 14 },
  lg: { padding: '14px 24px', fontSize: 14 },
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  pulse = false,
  className = '',
  style,
  ...props
}) {
  const isInteractive = !disabled
  const hoverable = variant === 'secondary' || variant === 'ghost'

  return (
    <motion.button
      whileHover={isInteractive ? { scale: 1.02 } : undefined}
      whileTap={isInteractive ? { scale: 0.98 } : undefined}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 font-medium transition-colors
        ${hoverable ? 'hover-surface' : ''}
        ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      style={{
        borderRadius: 'var(--ds-radius-control)',
        fontFamily: 'var(--font-body)',
        width: fullWidth ? '100%' : undefined,
        opacity: disabled ? 0.5 : 1,
        animation: pulse && isInteractive ? 'pulse-terracotta 3s ease-in-out infinite' : 'none',
        transitionDuration: 'var(--ds-duration-base)',
        ...SIZES[size],
        ...VARIANTS[variant],
        ...style,
      }}
      {...props}
    >
      {children}
    </motion.button>
  )
}
