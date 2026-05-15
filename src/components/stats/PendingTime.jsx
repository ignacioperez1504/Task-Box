export default function PendingTime({ hours }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-teal-darker">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8C5B8" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </div>
      <div>
        <p className="font-display text-lg text-beige">{hours.toFixed(1)}h</p>
        <p className="text-xs text-beige-dark">pendientes</p>
      </div>
    </div>
  )
}
