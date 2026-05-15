import { useDraggable } from '@dnd-kit/core'
import { motion } from 'framer-motion'
import { useSubjectStore } from '../../store/subjectStore'
import { useUIStore } from '../../store/uiStore'
import { useAcademicStore } from '../../store/academicStore'

export default function CalendarTask({ task, isOverlay = false }) {
  const { getSubjectColor } = useSubjectStore()
  const { openEditPanel } = useUIStore()
  const { getTaskScore } = useAcademicStore()
  const score = getTaskScore(task.id)

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  })

  const color = getSubjectColor(task.subject_id)
  const isCompleted = task.status === 'completed'
  const isCritical = task.ai_priority === 'Crítica' && !isCompleted

  const content = (
    <div
      className={`px-2 py-1.5 rounded border text-xs text-left mb-1 transition-all duration-200 group relative
        ${isOverlay ? 'shadow-xl cursor-grabbing' : 'cursor-grab'}
        ${isDragging && !isOverlay ? 'opacity-30 border-dashed' : 'opacity-100'}
        ${isCompleted ? 'opacity-60 saturate-50' : ''}
      `}
      style={{
        backgroundColor: color + '20',
        borderColor: isCritical ? '#8B2E2E' : color + '40',
        borderLeftWidth: '3px',
        borderLeftColor: isCritical ? '#8B2E2E' : color,
      }}
      onClick={(e) => {
        // Prevenir edición si se está arrastrando
        if (isDragging || isOverlay) return
        e.stopPropagation()
        openEditPanel(task)
      }}
      title={task.title}
    >
      <div className="flex items-start justify-between gap-1">
        <span
          className="truncate font-medium flex-1"
          style={{ color: isCompleted ? '#A8A598' : '#C8C5B8', textDecoration: isCompleted ? 'line-through' : 'none' }}
        >
          {task.title}
        </span>
        {!isCompleted && task.ai_priority === 'Crítica' && (
          <span className="w-2 h-2 rounded-full bg-priority-critica mt-1 shrink-0" />
        )}
      </div>

      <div className="flex items-center gap-2 mt-1 text-[10px] text-beige-dark opacity-80">
        <span>{parseFloat(task.duration_hours)}h</span>
        {score > 0 && (
          <span className="bg-white/10 px-1 rounded text-[9px] font-bold text-terracotta">
            Score: {score}
          </span>
        )}
      </div>

      {/* Indicador visual de hover para editar */}
      {!isOverlay && !isDragging && (
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded pointer-events-none" />
      )}
    </div>
  )

  // Si es un overlay (el elemento que flota al arrastrar), no necesitamos los hooks de DndKit aquí,
  // el contenedor padre se encargará de renderizarlo con motion.
  if (isOverlay) {
    return (
      <motion.div
        initial={{ scale: 1, rotate: 0 }}
        animate={{ scale: 1.05, rotate: 2 }}
        className="z-50 pointer-events-none"
      >
        {content}
      </motion.div>
    )
  }

  // Elemento normal en el calendario
  return (
    <div ref={setNodeRef} {...attributes} {...listeners}>
      {content}
    </div>
  )
}
