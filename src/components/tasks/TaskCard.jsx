import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useSubjectStore } from '../../store/subjectStore'
import { useUIStore } from '../../store/uiStore'
import { useTaskStore } from '../../store/taskStore'
import { useAcademicStore } from '../../store/academicStore'
import PromptModal from './PromptModal'
import Badge from '../ui/Badge'
import { GlassLayers, glassSurfaceVariants } from '../ui/GlassSurface'

const PRIORITY_COLORS = {
  'Crítica': '#E15252',
  'Alta': '#E8825B',
  'Media': '#E8C468',
  'Baja': '#4FAE8C',
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
  
  // Local state for the slider to avoid rapid DB calls
  const [localProgress, setLocalProgress] = useState(task.progress || 0)
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false)
  const lastSyncedProgress = useRef(task.progress || 0)

  // Sync local state when task prop changes (from external updates)
  useEffect(() => {
    if (task.progress !== lastSyncedProgress.current) {
      setLocalProgress(task.progress || 0)
      lastSyncedProgress.current = task.progress || 0
    }
  }, [task.progress])

  // Debounced effect to update the store
  useEffect(() => {
    if (localProgress === lastSyncedProgress.current) return

    const timer = setTimeout(() => {
      updateTask(task.id, { progress: localProgress })
      lastSyncedProgress.current = localProgress
    }, 500)

    return () => clearTimeout(timer)
  }, [localProgress, task.id, updateTask])

  const isInProgress = !isCompleted && localProgress > 0 && localProgress < 100
  const accentColor = isCritical
    ? 'var(--color-priority-critica)'
    : isInProgress
      ? 'var(--color-priority-media)'
      : null

  // Countdown
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(task.due_date + 'T00:00:00')
  const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24))
  const isOverdue = diffDays < 0 && !isCompleted

  let countdownText = ''
  let countdownColor = 'var(--fg-secondary)'
  if (diffDays === 0) { countdownText = 'Vence hoy'; countdownColor = 'var(--color-terracotta)' }
  else if (diffDays === 1) { countdownText = 'Vence mañana'; countdownColor = 'var(--color-terracotta)' }
  else if (diffDays > 1) { countdownText = `Faltan ${diffDays} días` }
  else { countdownText = `Vencida hace ${Math.abs(diffDays)} día${Math.abs(diffDays) > 1 ? 's' : ''}`; countdownColor = 'var(--color-priority-critica)' }

  const handleProgressChange = (e) => {
    setLocalProgress(parseInt(e.target.value))
  }

  return (
    <>
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
      whileHover={{ y: -4 }}
      className={`group p-5 ${glassSurfaceVariants({ radius: 'lg', interactive: true })}`}
      style={{
        // El borde ya no se pinta aquí sino en la capa de vidrio, así que el
        // estado de la tarea se expresa retintando la custom property.
        '--gs-border': isCritical
          ? 'rgba(225,82,82,.45)'
          : isInProgress
            ? 'rgba(232,196,104,.5)'
            : 'var(--glass-border)',
        opacity: isCompleted ? 0.55 : 1,
        filter: isCompleted ? 'saturate(0.5)' : 'none',
        animation: isCritical ? 'pulse-terracotta 4s ease-in-out infinite' : 'none',
      }}
    >
      <GlassLayers />

      {/* Franja de estado. Va como hijo normal y no como borderLeft del
          elemento: las capas de vidrio se pintan por encima del borde propio
          de la caja y lo taparían. */}
      {accentColor && (
        <span
          aria-hidden="true"
          className="absolute left-0 top-0 bottom-0 w-[3px]"
          style={{ background: accentColor, borderRadius: '3px 0 0 3px' }}
        />
      )}

      {/* Top row: title + actions */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {isInProgress && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta px-1.5 py-0.5 bg-terracotta/10 rounded border border-terracotta/20 animate-pulse">
                En curso
              </span>
            )}
            {isCompleted && <Badge color="#4FAE8C">Finalizada</Badge>}
          </div>
          <h3
            className="font-display text-xl leading-tight relative inline-block"
            style={{ fontWeight: 500, color: 'var(--fg-primary)', textDecoration: isCompleted ? 'none' : 'none' }}
          >
            {task.title}
            {isCompleted && (
              <motion.span
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.5 }}
                className="absolute left-0 top-1/2 h-0.5"
                style={{ background: 'var(--fg-tertiary)' }}
              />
            )}
          </h3>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {/* Complete */}
          <button
            onClick={() => completeTask(task.id)}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover-surface transition-colors"
            title={isCompleted ? 'Marcar pendiente' : 'Completar'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke={isCompleted ? 'var(--color-priority-baja)' : 'var(--fg-secondary)'} strokeWidth="2" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </button>

          {/* Generar Prompt */}
          <button
            onClick={() => setIsPromptModalOpen(true)}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-terracotta/10 transition-colors group/promptbtn"
            title="Generar Prompt Experto con IA"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--fg-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover/promptbtn:stroke-terracotta group-hover/promptbtn:scale-115 transition-all">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            </svg>
          </button>

          {/* Edit */}
          <button
            onClick={() => openEditPanel(task)}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover-surface transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--fg-secondary)" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>

          {/* Delete */}
          <button
            onClick={() => openDeleteModal(task)}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-priority-critica/20 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-priority-critica)" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Progress Slider */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="ds-label !mb-0">Progreso</span>
          <span className="text-[10px] font-bold" style={{ color: 'var(--fg-primary)' }}>{localProgress}%</span>
        </div>
        <div className="relative h-1.5 w-full rounded-full overflow-hidden group/slider" style={{ background: 'rgba(var(--ink-rgb),.25)' }}>
          <div
            className="absolute top-0 left-0 h-full transition-all duration-500 rounded-full"
            style={{
              width: `${localProgress}%`,
              backgroundColor: isCompleted ? '#4FAE8C' : (localProgress > 80 ? '#4FAE8C' : (localProgress > 40 ? '#E8C468' : '#E8825B'))
            }}
          />
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={localProgress}
            disabled={isCompleted}
            onChange={handleProgressChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-default"
          />
        </div>
      </div>

      {/* Badges row */}
      <div className="flex flex-wrap gap-2" style={{ marginBottom: 10 }}>
        {/* Subject */}
        {subject && (
          <Badge color={subject.color_hex} dot>{subject.name}</Badge>
        )}

        {/* AI Priority */}
        {task.ai_priority && (
          <Badge color={PRIORITY_COLORS[task.ai_priority] || '#94A3B8'}>
            {task.ai_priority}
            {score > 0 && (
              <span className="px-1.5 rounded font-bold text-[10px]" style={{ background: 'rgba(var(--ink-rgb),.12)' }}>
                {score}
              </span>
            )}
          </Badge>
        )}

        {/* Category */}
        {task.ai_category && (
          <span className="px-2.5 py-1 rounded-full text-xs" style={{ background: 'rgba(var(--ink-rgb),.08)', color: 'var(--fg-secondary)' }}>
            {CATEGORY_ICONS[task.ai_category] || '📌'} {task.ai_category}
          </span>
        )}
      </div>

      {/* Info row */}
      <div className="flex items-center gap-4 text-xs mb-2" style={{ color: 'var(--fg-secondary)' }}>
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
        <p className="text-xs italic leading-relaxed mt-2 border-l-2 border-terracotta/30 pl-3" style={{ color: 'var(--fg-secondary)' }}>
          {task.ai_recommendation}
        </p>
      )}

      {/* AI Study Plan */}
      {getStudyPlan(task.id) && (
        <div className="mt-3 p-3 text-xs leading-relaxed" style={{ background: 'rgba(var(--ink-rgb),.06)', border: '1px solid rgba(var(--ink-rgb),.06)', borderRadius: 'var(--ds-radius-sm)', color: 'var(--fg-secondary)' }}>
          <p className="ds-label mb-1">Plan de Acción IA</p>
          {getStudyPlan(task.id)}
        </div>
      )}

    </motion.div>

    {/* Prompt Modal Overlay — se monta solo al abrirse, para no disparar la
        generación del prompt en cada tarjeta de la lista. Va fuera de la
        tarjeta: el sistema Glass le da a la caja un contexto de apilamiento
        propio, y desde dentro este modal `fixed` quedaría por debajo de las
        tarjetas siguientes de la lista. */}
    {isPromptModalOpen && (
      <PromptModal
        task={task}
        onClose={() => setIsPromptModalOpen(false)}
      />
    )}
    </>
  )
}
