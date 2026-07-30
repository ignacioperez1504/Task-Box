export default function EmptyState({ title = 'Sin resultados', message = 'No hay elementos para mostrar.' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="mb-6 opacity-50">
        <circle cx="60" cy="60" r="50" stroke="var(--fg-tertiary)" strokeWidth="2" strokeDasharray="6 4" />
        <path d="M45 55 L55 65 L75 45" stroke="var(--color-terracotta)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="60" cy="80" r="3" fill="var(--fg-tertiary)" />
      </svg>
      <h3 className="font-display text-2xl mb-2" style={{ color: 'var(--fg-primary)' }}>{title}</h3>
      <p className="text-sm max-w-xs" style={{ color: 'var(--fg-secondary)' }}>{message}</p>
    </div>
  )
}
