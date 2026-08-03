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
            // El marcador se apoya siempre sobre el gradiente saturado, no sobre
            // el fondo de la app, así que su relleno y su anillo son constantes
            // en ambos temas (el anillo antes era --navy-900, que desaparecía
            // sobre el fondo oscuro).
            background: '#FFFFFF',
            border: '2px solid rgba(6,11,18,.55)',
            transform: 'translate(-50%,-50%)',
            boxShadow: '0 2px 6px rgba(0,0,0,.35)',
            transition: 'left var(--ds-duration-slow) var(--ds-ease-out)',
          }}
        />
      )}
    </div>
  )
}
