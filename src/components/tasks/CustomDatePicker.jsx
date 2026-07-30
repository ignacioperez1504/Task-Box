import { useState } from 'react'

const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DAYS_ES = ['Lu','Ma','Mi','Ju','Vi','Sá','Do']

export default function CustomDatePicker({ value, onChange }) {
  const today = new Date()
  const selected = value ? new Date(value + 'T12:00:00') : null
  const [viewMonth, setViewMonth] = useState(selected?.getMonth() ?? today.getMonth())
  const [viewYear, setViewYear] = useState(selected?.getFullYear() ?? today.getFullYear())
  const [isOpen, setIsOpen] = useState(false)

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDayOfWeek = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7
  const todayStr = today.toISOString().split('T')[0]

  const daysLeft = value
    ? Math.ceil((new Date(value + 'T23:59:59') - today) / (1000 * 60 * 60 * 24))
    : null

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1) }
    else setViewMonth(viewMonth - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1) }
    else setViewMonth(viewMonth + 1)
  }

  const handleSelect = (day) => {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    onChange(dateStr)
    setIsOpen(false)
  }

  return (
    <div>
      <label className="text-xs uppercase tracking-wider block mb-2" style={{ color: 'var(--fg-tertiary)' }}>Fecha de entrega</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left px-4 py-3 rounded-xl text-sm transition-colors focus:border-terracotta"
        style={{ border: '1px solid rgba(var(--ink-rgb),.15)', background: 'rgba(var(--ink-rgb),.05)', color: value ? 'var(--fg-primary)' : 'var(--fg-tertiary)' }}
      >
        {value || 'Selecciona una fecha'}
        {daysLeft !== null && (
          <span className={`ml-2 text-xs ${daysLeft < 0 ? 'text-priority-critica' : daysLeft <= 2 ? 'text-terracotta' : ''}`} style={daysLeft >= 0 && daysLeft > 2 ? { color: 'var(--fg-tertiary)' } : undefined}>
            {daysLeft === 0 ? '— Vence hoy' : daysLeft > 0 ? `— Faltan ${daysLeft} días` : `— Vencida hace ${Math.abs(daysLeft)} días`}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="mt-2 rounded-xl p-4 z-20 relative"
          style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', backdropFilter: 'blur(var(--blur-glass))', WebkitBackdropFilter: 'blur(var(--blur-glass))', boxShadow: 'var(--shadow-card), var(--shadow-inset-highlight)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={prevMonth} className="p-1 rounded hover-surface transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--fg-secondary)" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span className="font-display text-lg" style={{ color: 'var(--fg-primary)' }}>{MONTHS_ES[viewMonth]} {viewYear}</span>
            <button type="button" onClick={nextMonth} className="p-1 rounded hover-surface transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--fg-secondary)" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAYS_ES.map((d) => (
              <div key={d} className="text-center text-[10px] tracking-widest py-1" style={{ color: 'var(--fg-tertiary)' }}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`e-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1
              const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const isToday = dateStr === todayStr
              const isSelected = dateStr === value
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelect(day)}
                  className="w-8 h-8 rounded-lg text-sm flex items-center justify-center transition-all duration-200"
                  style={{
                    background: isSelected ? '#E8825B' : isToday ? 'rgba(232,130,91,0.2)' : 'transparent',
                    color: isSelected ? '#FFF8F4' : 'var(--fg-primary)',
                    fontWeight: isSelected || isToday ? '600' : '400',
                    border: isToday && !isSelected ? '1px solid rgba(232,130,91,0.5)' : 'none',
                  }}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
