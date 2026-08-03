const OPTIONS = [
  { label: '30 min', value: 0.5 },
  { label: '1 hora', value: 1 },
  { label: '2 horas', value: 2 },
  { label: '3 horas', value: 3 },
  { label: '4+ horas', value: 4 },
]

export default function DurationSelector({ value, onChange }) {
  return (
    <div>
      <label className="ds-label mb-2">
        Duración aproximada
      </label>
      <div className="flex gap-2 flex-wrap">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-250"
            style={{
              background: value === opt.value ? '#E8825B' : 'rgba(var(--ink-rgb),.06)',
              color: value === opt.value ? '#FFF8F4' : 'var(--fg-secondary)',
              border: `1px solid ${value === opt.value ? '#E8825B' : 'rgba(var(--ink-rgb),.12)'}`,
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
