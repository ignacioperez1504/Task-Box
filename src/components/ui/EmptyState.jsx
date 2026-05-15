export default function EmptyState({ title = 'Sin resultados', message = 'No hay elementos para mostrar.' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="mb-6 opacity-40">
        <circle cx="60" cy="60" r="50" stroke="#C8C5B8" strokeWidth="2" strokeDasharray="6 4" />
        <path d="M45 55 L55 65 L75 45" stroke="#C27A55" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="60" cy="80" r="3" fill="#C8C5B8" />
      </svg>
      <h3 className="font-display text-2xl text-beige mb-2">{title}</h3>
      <p className="text-beige-dark text-sm max-w-xs">{message}</p>
    </div>
  )
}
