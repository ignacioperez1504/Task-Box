import { useState } from 'react'
import Dropdown from '../ui/Dropdown'

const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DAYS_ES = ['Lu','Ma','Mi','Ju','Vi','Sá','Do']

export default function CustomDatePicker({ value, onChange }) {
  const today = new Date()
  const selected = value ? new Date(value + 'T12:00:00') : null
  const [viewMonth, setViewMonth] = useState(selected?.getMonth() ?? today.getMonth())
  const [viewYear, setViewYear] = useState(selected?.getFullYear() ?? today.getFullYear())

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

  const countdownColor =
    daysLeft === null ? undefined
      : daysLeft < 0 ? 'var(--color-priority-critica)'
      : daysLeft <= 2 ? 'var(--color-terracotta)'
      : 'var(--fg-tertiary)'

  return (
    <Dropdown
      label="Fecha de entrega"
      placeholder={!value}
      trigger={
        <>
          <span className="truncate">{value || 'Selecciona una fecha'}</span>
          {daysLeft !== null && (
            <span className="text-xs shrink-0" style={{ color: countdownColor }}>
              {daysLeft === 0 ? '— Vence hoy' : daysLeft > 0 ? `— Faltan ${daysLeft} días` : `— Vencida hace ${Math.abs(daysLeft)} días`}
            </span>
          )}
        </>
      }
      panelStyle={{ padding: 16 }}
    >
      {({ close }) => (
        <>
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={prevMonth}
              className="w-8 h-8 flex items-center justify-center hover-surface transition-colors cursor-pointer"
              style={{ borderRadius: 'var(--ds-radius-sm)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--fg-secondary)" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span className="font-display text-lg" style={{ color: 'var(--fg-primary)' }}>
              {MONTHS_ES[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="w-8 h-8 flex items-center justify-center hover-surface transition-colors cursor-pointer"
              style={{ borderRadius: 'var(--ds-radius-sm)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--fg-secondary)" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAYS_ES.map((d) => (
              <div key={d} className="ds-label text-center py-1 !mb-0">{d}</div>
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
                  onClick={() => { onChange(dateStr); close() }}
                  className="w-8 h-8 text-sm flex items-center justify-center transition-all cursor-pointer"
                  style={{
                    borderRadius: 'var(--ds-radius-sm)',
                    background: isSelected ? 'var(--color-terracotta)' : isToday ? 'rgba(232,130,91,0.2)' : 'transparent',
                    color: isSelected ? 'var(--fg-on-accent)' : 'var(--fg-primary)',
                    fontWeight: isSelected || isToday ? 600 : 400,
                    border: isToday && !isSelected ? '1px solid rgba(232,130,91,0.5)' : '1px solid transparent',
                    transitionDuration: 'var(--ds-duration-fast)',
                  }}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </>
      )}
    </Dropdown>
  )
}
