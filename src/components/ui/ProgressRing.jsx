export default function ProgressRing({ percent = 0, size = 96, stroke = 6, label, color = 'var(--color-terracotta)' }) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.min(100, Math.max(0, percent))
  // Always show a visible nub of the accent color, even at 0% — a ring that
  // fully disappears at zero reads as "broken", not "empty".
  const visiblePct = Math.max(clamped, 4)
  const offset = circumference - (visiblePct / 100) * circumference

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(232,130,91,0.22)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s var(--ds-ease-out)' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: size * 0.28, color: 'var(--fg-primary)' }}>
          {Math.round(percent)}%
        </span>
        {label && (
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-label)', color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)', marginTop: 2 }}>
            {label}
          </span>
        )}
      </div>
    </div>
  )
}
