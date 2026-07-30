export default function GradientBar({ value = 0, max = 100, height = 6, showMarker = true }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height,
        borderRadius: 999,
        background: 'var(--gradient-load)',
        opacity: 0.9,
      }}
    >
      {showMarker && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: `${pct}%`,
            width: height + 6,
            height: height + 6,
            borderRadius: '50%',
            background: '#fff',
            border: '2px solid var(--navy-900)',
            transform: 'translate(-50%,-50%)',
            boxShadow: '0 2px 6px rgba(0,0,0,.4)',
            transition: 'left var(--ds-duration-slow) var(--ds-ease-out)',
          }}
        />
      )}
    </div>
  )
}
