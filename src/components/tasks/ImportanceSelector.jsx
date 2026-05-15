const OPTIONS = [
  {
    label: 'Baja',
    value: 'Baja',
    color: '#2E6B5E',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 15 12 9 18 15"/></svg>
    ),
  },
  {
    label: 'Media',
    value: 'Media',
    color: '#C9A96E',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>
    ),
  },
  {
    label: 'Alta',
    value: 'Alta',
    color: '#C27A55',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"/><polyline points="18 9 12 3 6 9"/></svg>
    ),
  },
]

export default function ImportanceSelector({ value, onChange }) {
  return (
    <div>
      <label className="text-xs text-beige-dark uppercase tracking-wider block mb-2">
        Importancia percibida
      </label>
      <div className="grid grid-cols-3 gap-3">
        {OPTIONS.map((opt) => {
          const isActive = value === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className="flex flex-col items-center gap-2 py-4 rounded-xl transition-all duration-250"
              style={{
                background: isActive ? `${opt.color}22` : 'rgba(27,58,53,0.3)',
                border: `1px solid ${isActive ? opt.color : 'rgba(200,197,184,0.1)'}`,
                color: isActive ? opt.color : '#C8C5B8',
                boxShadow: isActive ? `0 0 12px ${opt.color}33` : 'none',
              }}
            >
              {opt.icon}
              <span className="text-xs font-medium">{opt.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
