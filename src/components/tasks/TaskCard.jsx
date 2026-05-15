import { motion } from 'framer-motion'
import { useSubjectStore } from '../../store/subjectStore'
import { useUIStore } from '../../store/uiStore'
import { useTaskStore } from '../../store/taskStore'
import { useAcademicStore } from '../../store/academicStore'

const PRIORITY_COLORS = {
  'Crítica': '#8B2E2E',
  'Alta': '#C27A55',
  'Media': '#C9A96E',
  'Baja': '#2E6B5E',
}

const CATEGORY_ICONS = {
  'Examen': '📝', 'Proyecto': '📐', 'Tarea corta': '✏️',
  'Lectura': '📖', 'Investigación': '🔬', 'Laboratorio': '🧪', 'Otro': '📌',
}

export default function TaskCard({ task, index = 0 }) {
  const { getSubjectById } = useSubjectStore()
  const { openEditPanel, openDeleteModal } = useUIStore()
  const { completeTask, updateTask } = useTaskStore()
  const { getTaskScore, getStudyPlan } = useAcademicStore()
  const score = getTaskScore(task.id)

  const subject = getSubjectById(task.subject_id)
  const isCompleted = task.status === 'completed'
  const isCritical = task.ai_priority === 'Crítica' && !isCompleted
  const progress = task.progress || 0
  const isInProgress = !isCompleted && progress > 0 && progress < 100

  // Countdown
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(task.due_date + 'T00:00:00')
  const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24))
  const isOverdue = diffDays < 0 && !isCompleted

  let countdownText = ''
  let countdownColor = '#C8C5B8'
  if (diffDays === 0) { countdownText = 'Vence hoy'; countdownColor = '#C27A55' }
  else if (diffDays === 1) { countdownText = 'Vence mañana'; countdownColor = '#C27A55' }
  else if (diffDays > 1) { countdownText = `Faltan ${diffDays} días` }
  else { countdownText = `Vencida hace ${Math.abs(diffDays)} día${Math.abs(diffDays) > 1 ? 's' : ''}`; countdownColor = '#8B2E2E' }

  const handleProgressChange = (e) => {
    const newProgress = parseInt(e.target.value)
    updateTask(task.id, { progress: newProgress })
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
      whileHover={{ y: -4 }}
      className={`group glass rounded-xl p-5 relative transition-all duration-300
        ${isInProgress ? 'border-r-2 border-beige/20 shadow-[0_0_15px_rgba(201,169,110,0.1)]' : ''}
      `}
      style={{
        borderLeft: isCritical ? '4px solid #8B2E2E' : (isInProgress ? '4px solid #C9A96E' : '4px solid transparent'),
        filter: isCompleted ? 'saturate(0.3) brightness(0.85)' : 'none',
        animation: isCritical ? 'pulse-terracotta 4s ease-in-out infinite' : 'none',
      }}
    >
      {/* Top row: title + actions */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {isInProgress && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta px-1.5 py-0.5 bg-terracotta/10 rounded border border-terracotta/20 animate-pulse">
                En curso
              </span>
            )}
            {isCompleted && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal px-1.5 py-0.5 bg-teal/10 rounded border border-teal/20">
                Finalizada
              </span>
            )}
          </div>
          <h3
            className="font-display text-xl text-beige leading-tight relative inline-block"
            style={{ textDecoration: isCompleted ? 'none' : 'none' }}
          >
            {task.title}
            {isCompleted && (
              <motion.span
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.5 }}
                className="absolute left-0 top-1/2 h-0.5 bg-beige-dark"
              />
            )}
          </h3>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {/* Complete */}
          <button
            onClick={() => completeTask(task.id)}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-beige/10 transition-colors"
            title={isCompleted ? 'Marcar pendiente' : 'Completar'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke={isCompleted ? '#2E6B5E' : '#C8C5B8'} strokeWidth="2" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </button>

          {/* Edit */}
          <button
            onClick={() => openEditPanel(task)}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-beige/10 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8C5B8" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>

          {/* Delete */}
          <button
            onClick={() => openDeleteModal(task)}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-priority-critica/20 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B2E2E" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Progress Slider */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-beige-dark uppercase tracking-widest font-medium">Progreso</span>
          <span className="text-[10px] font-bold text-beige">{progress}%</span>
        </div>
        <div className="relative h-1.5 w-full bg-black/20 rounded-full overflow-hidden group/slider">
          <div 
            className="absolute top-0 left-0 h-full transition-all duration-500 rounded-full"
            style={{ 
              width: `${progress}%`,
              backgroundColor: isCompleted ? '#2E6B5E' : (progress > 80 ? '#2E6B5E' : (progress > 40 ? '#C9A96E' : '#C27A55'))
            }}
          />
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={progress}
            disabled={isCompleted}
            onChange={handleProgressChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-default"
          />
        </div>
      </div>

      {/* Badges row */}
      <div className="flex flex-wrap gap-2 mb-3">
        {/* Subject */}
        {subject && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
            style={{ backgroundColor: subject.color_hex + '25', color: subject.color_hex, border: `1px solid ${subject.color_hex}40` }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: subject.color_hex }} />
            {subject.name}
          </span>
        )}

        {/* AI Priority */}
        {task.ai_priority && (
          <span className="px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5"
            style={{ backgroundColor: (PRIORITY_COLORS[task.ai_priority] || '#C8C5B8') + '25', color: PRIORITY_COLORS[task.ai_priority] || '#C8C5B8' }}>
            {task.ai_priority}
            {score > 0 && (
              <span className="bg-white/10 px-1.5 rounded font-bold text-[10px]">
                {score}
              </span>
            )}
          </span>
        )}

        {/* Category */}
        {task.ai_category && (
          <span className="px-2.5 py-1 rounded-full text-xs bg-teal-darker/50 text-beige-dark">
            {CATEGORY_ICONS[task.ai_category] || '📌'} {task.ai_category}
          </span>
        )}
      </div>

      {/* Info row */}
      <div className="flex items-center gap-4 text-xs text-beige-dark mb-2">
        {/* Countdown */}
        <span className="flex items-center gap-1" style={{ color: countdownColor }}>
          {isOverdue && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )}
          {countdownText}
        </span>

        {/* Duration */}
        <span className="flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
          {parseFloat(task.duration_hours)}h
        </span>

        {/* AI suggested */}
        {task.ai_suggested_hours && parseFloat(task.ai_suggested_hours) !== parseFloat(task.duration_hours) && (
          <span className="text-terracotta">IA: {parseFloat(task.ai_suggested_hours)}h</span>
        )}
      </div>

      {/* AI Recommendation */}
      {task.ai_recommendation && (
        <p className="text-xs italic text-beige-dark/70 leading-relaxed mt-2 border-l-2 border-terracotta/30 pl-3">
          {task.ai_recommendation}
        </p>
      )}

      {/* AI Study Plan */}
      {getStudyPlan(task.id) && (
        <div className="mt-3 p-3 rounded-lg bg-teal-darker/30 border border-beige/5 text-xs text-beige-dark leading-relaxed">
          <p className="text-[9px] uppercase tracking-widest text-beige/50 mb-1 font-bold">Plan de Acción IA</p>
          {getStudyPlan(task.id)}
        </div>
      )}
    </motion.div>
  )
}
