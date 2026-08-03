// Selector segmentado. La app tenía dos lenguajes para lo mismo: la píldora
// terracota sólida de Configuración y el wash translúcido de los filtros de
// tareas. Este componente deja uno solo (wash + texto de acento), que se
// sostiene mejor en ambos temas que el sólido.
export default function SegmentedTabs({ options, value, onChange, size = 'md', className = '' }) {
  const isSm = size === 'sm'

  return (
    <div
      className={`flex gap-1 p-1 ${className}`}
      style={{
        background: 'rgba(var(--ink-rgb),.06)',
        borderRadius: 'var(--ds-radius-control)',
      }}
    >
      {options.map((opt) => {
        const active = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="flex-1 font-medium transition-colors cursor-pointer"
            style={{
              padding: isSm ? '6px 10px' : '8px 12px',
              fontSize: isSm ? 12 : 13,
              borderRadius: 'var(--ds-radius-sm)',
              background: active ? 'rgba(232,130,91,.22)' : 'transparent',
              color: active ? 'var(--color-terracotta)' : 'var(--fg-tertiary)',
              transitionDuration: 'var(--ds-duration-base)',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
