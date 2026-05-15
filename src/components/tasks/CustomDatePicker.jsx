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
      <label className="text-xs text-beige-dark uppercase tracking-wider block mb-2">Fecha de entrega</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left px-4 py-3 rounded-xl border border-beige/15 bg-teal-darker/40 text-sm transition-colors focus:border-terracotta"
        style={{ color: value ? '#C8C5B8' : '#A8A598' }}
      >
        {value || 'Selecciona una fecha'}
        {daysLeft !== null && (
          <span className={`ml-2 text-xs ${daysLeft < 0 ? 'text-priority-critica' : daysLeft <= 2 ? 'text-terracotta' : 'text-beige-dark'}`}>
            {daysLeft === 0 ? '— Vence hoy' : daysLeft > 0 ? `— Faltan ${daysLeft} días` : `— Vencida hace ${Math.abs(daysLeft)} días`}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="mt-2 glass rounded-xl p-4 z-20 relative">
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={prevMonth} className="p-1 hover:bg-beige/10 rounded transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C8C5B8" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span className="font-display text-lg text-beige">{MONTHS_ES[viewMonth]} {viewYear}</span>
            <button type="button" onClick={nextMonth} className="p-1 hover:bg-beige/10 rounded transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C8C5B8" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAYS_ES.map((d) => (
              <div key={d} className="text-center text-[10px] text-beige-dark tracking-widest py-1">{d}</div>
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
                    background: isSelected ? '#C27A55' : isToday ? 'rgba(194,122,85,0.2)' : 'transparent',
                    color: isSelected ? '#0A0A0A' : '#C8C5B8',
                    fontWeight: isSelected || isToday ? '600' : '400',
                    border: isToday && !isSelected ? '1px solid rgba(194,122,85,0.5)' : 'none',
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
