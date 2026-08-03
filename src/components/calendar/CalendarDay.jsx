import { useDroppable } from '@dnd-kit/core'
import { motion } from 'framer-motion'
import { useUIStore } from '../../store/uiStore'
import CalendarTask from './CalendarTask'
import CalendarReminder from './CalendarReminder'

const GRID_LINE = 'var(--grid-line)'

// Hex literals (not var()) so the alpha-suffix trick below is reliable
// regardless of color-mix() browser support.
const LOAD_COLORS = {
  0: '#3F6180',
  1: '#4A90E2',
  2: '#4FAE8C',
  4: '#E8825B',
  6: '#E15252',
}

function getLoadColor(count) {
  if (count === 0) return LOAD_COLORS[0]
  if (count === 1) return LOAD_COLORS[1]
  if (count <= 3) return LOAD_COLORS[2]
  if (count <= 5) return LOAD_COLORS[4]
  return LOAD_COLORS[6]
}

export default function CalendarDay({ date, isCurrentMonth, tasks, reminders = [] }) {
  const { setSelectedDate, setActiveSection } = useUIStore()

  const dateStr = date.toISOString().split('T')[0]
  const todayStr = new Date().toISOString().split('T')[0]
  const isToday = dateStr === todayStr

  // DndKit droppable setup
  const { setNodeRef, isOver } = useDroppable({
    id: dateStr,
    data: { dateStr },
  })

  // Color load indicator line (still based on tasks as they represent academic load)
  const loadColor = getLoadColor(tasks.length)

  const handleDayClick = (e) => {
    // Si se hizo click en un task o reminder, no abrir la vista de día
    if (e.target.closest('[role="button"]') || e.target.closest('.cursor-grab')) return
    setSelectedDate(dateStr)
    setActiveSection('dayTasks')
  }

  const allItems = [
    ...tasks.map(t => ({ type: 'task', data: t })),
    ...reminders.map(r => ({ type: 'reminder', data: r }))
  ]

  const totalCount = allItems.length

  return (
    <div
      ref={setNodeRef}
      onClick={handleDayClick}
      className={`relative min-h-[96px] p-2 transition-colors duration-200 cursor-pointer
        ${!isCurrentMonth ? 'opacity-30' : 'hover-surface'}
      `}
      style={{
        borderRight: `1px solid ${GRID_LINE}`,
        borderBottom: `1px solid ${GRID_LINE}`,
        backgroundColor: isOver ? 'rgba(232,130,91,0.12)' : 'transparent',
      }}
    >
      {/* Top indicator bar based on load */}
      {isCurrentMonth && tasks.length > 0 && (
        <div
          className="absolute top-0 left-0 right-0 h-0.5 opacity-70"
          style={{ backgroundColor: loadColor }}
        />
      )}

      {/* Date header */}
      <div className="flex items-start justify-between mb-2">
        <span
          className="rounded-full flex items-center justify-center"
          style={{
            width: 26, height: 26, fontSize: 13, fontWeight: 600,
            background: isToday ? 'var(--color-terracotta)' : 'transparent',
            color: isToday ? 'var(--fg-on-accent)' : 'var(--fg-primary)',
          }}
        >
          {date.getDate()}
        </span>

        {totalCount > 0 && (
          <span
            className="rounded-md"
            style={{
              fontSize: 10, fontWeight: 600, padding: '2px 6px',
              background: loadColor + '73',
              color: tasks.length > 0 ? loadColor : 'var(--color-terracotta)',
            }}
          >
            {totalCount}
          </span>
        )}
      </div>

      {/* Items list (Tasks + Reminders) */}
      <div className="space-y-1">
        {allItems.slice(0, 3).map((item) => (
          item.type === 'task'
            ? <CalendarTask key={item.data.id} task={item.data} />
            : <CalendarReminder key={item.data.id} reminder={item.data} />
        ))}

        {totalCount > 3 && (
          <div className="text-[10px] text-center mt-1 py-1 rounded" style={{ color: 'var(--fg-secondary)', background: 'rgba(var(--ink-rgb),.05)' }}>
            + {totalCount - 3} más
          </div>
        )}
      </div>

      {/* Overlay highlight when dragging over */}
      {isOver && (
        <div className="absolute inset-0 border-2 border-dashed rounded pointer-events-none" style={{ borderColor: 'rgba(232,130,91,.5)' }} />
      )}
    </div>
  )
}
