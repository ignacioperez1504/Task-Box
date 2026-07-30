export default function GlassCard({ children, variant = 'light', padding = 20, radius = 'lg', className = '', style }) {
  const base = variant === 'dark'
    ? { background: 'var(--glass-bg-dark)', border: '1px solid var(--glass-border-soft)' }
    : { background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }

  return (
    <div
      className={className}
      style={{
        padding,
        borderRadius: `var(--ds-radius-${radius})`,
        backdropFilter: 'blur(var(--blur-glass))',
        WebkitBackdropFilter: 'blur(var(--blur-glass))',
        transform: 'translateZ(0)',
        boxShadow: variant === 'dark' ? 'var(--shadow-card)' : 'var(--shadow-card), var(--shadow-inset-highlight)',
        ...base,
        ...style,
      }}
    >
      {children}
    </div>
  )
}
