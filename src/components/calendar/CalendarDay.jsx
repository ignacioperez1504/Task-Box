import { useDroppable } from '@dnd-kit/core'
import { motion } from 'framer-motion'
import { useUIStore } from '../../store/uiStore'
import CalendarTask from './CalendarTask'

const LOAD_COLORS = {
  0: '#2E6B5E', // Low
  1: '#1B3A35', // Base teal
  2: '#C9A96E', // Medium yellow
  4: '#C27A55', // High terracotta
  6: '#8B2E2E', // Critical red
}

function getLoadColor(count) {
  if (count === 0) return LOAD_COLORS[0]
  if (count === 1) return LOAD_COLORS[1]
  if (count <= 3) return LOAD_COLORS[2]
  if (count <= 5) return LOAD_COLORS[4]
  return LOAD_COLORS[6]
}

export default function CalendarDay({ date, isCurrentMonth, tasks }) {
  const { setSelectedDate, setActiveSection } = useUIStore()
  
  const dateStr = date.toISOString().split('T')[0]
  const todayStr = new Date().toISOString().split('T')[0]
  const isToday = dateStr === todayStr

  // DndKit droppable setup
  const { setNodeRef, isOver } = useDroppable({
    id: dateStr,
    data: { dateStr },
  })

  // Color load indicator line
  const loadColor = getLoadColor(tasks.length)

  const handleDayClick = (e) => {
    // Si se hizo click en un task, no abrir la vista de día
    if (e.target.closest('[role="button"]') || e.target.closest('.cursor-grab')) return
    setSelectedDate(dateStr)
    setActiveSection('dayTasks')
  }

  return (
    <div
      ref={setNodeRef}
      onClick={handleDayClick}
      className={`relative min-h-[120px] p-2 border-r border-b border-beige/10 transition-colors duration-200 cursor-pointer
        ${!isCurrentMonth ? 'opacity-30 bg-black/20' : 'hover:bg-teal-darker/20'}
        ${isOver ? 'bg-beige/5' : ''}
      `}
      style={{
        backgroundColor: isOver ? 'rgba(200,197,184,0.05)' : 'transparent',
      }}
    >
      {/* Top indicator bar based on load */}
      {isCurrentMonth && tasks.length > 0 && (
        <div 
          className="absolute top-0 left-0 right-0 h-0.5 opacity-50"
          style={{ backgroundColor: loadColor }}
        />
      )}

      {/* Date header */}
      <div className="flex items-start justify-between mb-2">
        <span
          className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium
            ${isToday ? 'bg-terracotta text-black' : 'text-beige-dark'}
          `}
        >
          {date.getDate()}
        </span>
        
        {tasks.length > 0 && (
          <span 
            className="text-[10px] px-1.5 py-0.5 rounded font-medium"
            style={{ 
              backgroundColor: loadColor + '30', 
              color: loadColor === '#1B3A35' ? '#C8C5B8' : loadColor 
            }}
          >
            {tasks.length}
          </span>
        )}
      </div>

      {/* Tasks list */}
      <div className="space-y-1">
        {/* Mostramos solo las primeras 3 tareas para no desbordar el grid */}
        {tasks.slice(0, 3).map((task) => (
          <CalendarTask key={task.id} task={task} />
        ))}
        
        {tasks.length > 3 && (
          <div className="text-[10px] text-beige-dark text-center mt-1 py-1 bg-black/20 rounded">
            + {tasks.length - 3} más
          </div>
        )}
      </div>

      {/* Overlay highlight when dragging over */}
      {isOver && (
        <div className="absolute inset-0 border-2 border-dashed border-beige/30 rounded pointer-events-none" />
      )}
    </div>
  )
}
