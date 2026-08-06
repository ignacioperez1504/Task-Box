import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTaskStore } from '../../store/taskStore'
import { useSubjectStore } from '../../store/subjectStore'
import { useUIStore } from '../../store/uiStore'
import { useAcademicStore } from '../../store/academicStore'
import { useHabitStore } from '../../store/habitStore'
import { useReminderStore } from '../../store/reminderStore'
import { useNotificationStore } from '../../store/notificationStore'
import { classifyTask, hasApiKey } from '../../lib/aiService'
import SubjectSelect from './SubjectSelect'
import CustomDatePicker from './CustomDatePicker'
import DurationSelector from './DurationSelector'
import ImportanceSelector from './ImportanceSelector'
import TagInput from './TagInput'
import AIProcessing from './AIProcessing'
import AIResult from './AIResult'
import Button from '../ui/Button'

export default function TaskForm({ task = null }) {
  const { createTask, updateTask } = useTaskStore()
  const { getSubjectById } = useSubjectStore()
  const { closeRightPanel, showApiKeyWarning, pendingNotification } = useUIStore()
  const { markConfirmed } = useNotificationStore()
  const isEditing = !!task

  // Si venimos desde una notificación de correo, los campos que se pueden
  // prellenar arrancan con los valores extraídos por classifyEmailAsTask.
  // subject_id / user_priority NO se prellenan porque son decisión del usuario
  // (materia real de la app y su prioridad subjetiva).
  const prefill = pendingNotification

  const [title, setTitle] = useState(task?.title || prefill?.extracted_title || '')
  const [subjectId, setSubjectId] = useState(task?.subject_id || '')
  const [description, setDescription] = useState(task?.description || prefill?.extracted_description || '')
  const [dueDate, setDueDate] = useState(task?.due_date || prefill?.extracted_due_date || '')
  const [duration, setDuration] = useState(
    task?.duration_hours
      ? parseFloat(task.duration_hours)
      : prefill?.extracted_duration_hours
        ? parseFloat(prefill.extracted_duration_hours)
        : null
  )
  const [importance, setImportance] = useState(task?.user_priority || '')
  const [tags, setTags] = useState(task?.tags || (prefill ? ['correo'] : []))
  const { getTaskWeight, setTaskWeight, calculateCurrentGrade, getSubjectData, setTaskScore, setStudyPlan } = useAcademicStore()
  const [percentage, setPercentage] = useState(task ? getTaskWeight(task.id) : 0)

  // AI classification state
  const [phase, setPhase] = useState('form') // 'form' | 'processing' | 'result' | 'adjust'
  const [aiResult, setAiResult] = useState(null)
  const [error, setError] = useState('')

  // Manual adjustments
  const [manualPriority, setManualPriority] = useState('')
  const [manualCategory, setManualCategory] = useState('')



  const isValid = title.trim() && subjectId && dueDate && duration && importance


  const handleClassify = async () => {
    if (!isValid) return
    if (!hasApiKey()) {
      showApiKeyWarning()
      return
    }

    setPhase('processing')
    setError('')

    try {
      const subject = getSubjectById(subjectId)
      const academicStats = calculateCurrentGrade(subjectId)
      const academicData = getSubjectData(subjectId)
      const habitStats = useHabitStore.getState().getTodaysStats()
      const dayReminders = useReminderStore.getState().getRemindersByDate(dueDate)

      const result = await classifyTask({
        title,
        description,
        subject: subject?.name || '',
        dueDate,
        duration,
        importance,
        tags,
        academicContext: {
          averageGrade: academicStats.average,
          credits: academicData.credits,
          remainingPercentage: academicStats.remainingPercentage,
          taskWeight: percentage
        },
        habitContext: {
          completedHabits: habitStats.completed,
          totalHabits: habitStats.total,
          isToday: dueDate === new Date().toISOString().split('T')[0]
        },
        eventsContext: {
          reminders: dayReminders.map(r => r.title),
          count: dayReminders.length
        }
      })
      setAiResult(result)
      setManualPriority(result.priority)
      setManualCategory(result.category)
      setPhase('result')
    } catch (err) {
      setError(err.message === 'NO_API_KEY' ? 'Configura tu API Key primero' : err.message)
      setPhase('form')
    }
  }

  const handleConfirm = async () => {
    const taskData = {
      title: title.trim(),
      description: description.trim() || null,
      subject_id: subjectId,
      due_date: dueDate,
      duration_hours: duration,
      user_priority: importance,
      ai_priority: aiResult?.priority || manualPriority,
      ai_category: aiResult?.category || manualCategory,
      ai_recommendation: aiResult?.recommendation || '',
      ai_suggested_hours: aiResult?.suggestedHours || duration,
      tags: tags.length > 0 ? tags : null,
      status: task?.status || 'pending',
    }

    if (isEditing) {
      const updated = await updateTask(task.id, taskData)
      if (updated) {
        setTaskWeight(updated.id, percentage)
        if (aiResult?.priorityScore) setTaskScore(updated.id, aiResult.priorityScore)
        if (aiResult?.studyPlan) setStudyPlan(updated.id, aiResult.studyPlan)
      }
    } else {
      const created = await createTask(taskData)
      if (created) {
        setTaskWeight(created.id, percentage)
        if (aiResult?.priorityScore) setTaskScore(created.id, aiResult.priorityScore)
        if (aiResult?.studyPlan) setStudyPlan(created.id, aiResult.studyPlan)
        // Si venimos de una notificación de correo, marcarla como confirmada
        // ahora que la tarea existe realmente.
        if (prefill?.id) await markConfirmed(prefill.id, created.id)
      }
    }


    closeRightPanel()
  }

  const handleSaveWithoutAI = async () => {
    const taskData = {
      title: title.trim(),
      description: description.trim() || null,
      subject_id: subjectId,
      due_date: dueDate,
      duration_hours: duration,
      user_priority: importance,
      ai_priority: manualPriority || task?.ai_priority || 'Media',
      ai_category: manualCategory || task?.ai_category || 'Otro',
      ai_recommendation: task?.ai_recommendation || '',
      ai_suggested_hours: task?.ai_suggested_hours || duration,
      tags: tags.length > 0 ? tags : null,
      status: task?.status || 'pending',
    }

    if (isEditing) {
      const updated = await updateTask(task.id, taskData)
      if (updated) setTaskWeight(updated.id, percentage)
    } else {
      const created = await createTask(taskData)
      if (created) {
        setTaskWeight(created.id, percentage)
        if (prefill?.id) await markConfirmed(prefill.id, created.id)
      }
    }
    closeRightPanel()
  }

  const handleAdjust = () => {
    setPhase('adjust')
  }

  // --- RENDER ---

  if (phase === 'processing') return <AIProcessing />

  if (phase === 'result' && aiResult) {
    return (
      <AIResult
        result={aiResult}
        onConfirm={handleConfirm}
        onAdjust={handleAdjust}
      />
    )
  }

  const PRIORITY_OPTIONS = ['Crítica', 'Alta', 'Media', 'Baja']
  const CATEGORY_OPTIONS = ['Examen', 'Proyecto', 'Tarea corta', 'Lectura', 'Investigación', 'Laboratorio', 'Otro']

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
      {/* Title */}
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="¿Qué tienes que hacer?"
          className="w-full bg-transparent font-display text-2xl border-b-2 pb-2 outline-none focus:border-terracotta transition-colors duration-250"
          style={{ color: 'var(--fg-primary)', borderColor: 'rgba(var(--ink-rgb),.2)' }}
        />
      </div>

      {/* Subject */}
      <SubjectSelect value={subjectId} onChange={setSubjectId} />

      {/* Description */}
      <div>
        <label className="ds-label mb-2">Descripción</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe la tarea con el mayor detalle posible. Esto ayuda a la IA a clasificarla mejor."
          rows={3}
          className="w-full text-sm px-4 py-3 rounded-xl outline-none focus:border-terracotta transition-colors resize-none"
          style={{ minHeight: '80px', background: 'rgba(var(--ink-rgb),.05)', color: 'var(--fg-primary)', border: '1px solid rgba(var(--ink-rgb),.15)' }}
          onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px' }}
        />
      </div>

      {/* Date */}
      <CustomDatePicker value={dueDate} onChange={setDueDate} />

      {/* Duration */}
      <DurationSelector value={duration} onChange={setDuration} />

      {/* Importance */}
      <ImportanceSelector value={importance} onChange={setImportance} />

      {/* Percentage Weight */}
      <div>
        <label className="ds-label mb-2">¿Cuánto vale esta tarea? (%)</label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={percentage || ''}
            onChange={(e) => setPercentage(parseFloat(e.target.value) || 0)}
            placeholder="0"
            className="w-24 text-sm px-4 py-3 rounded-xl outline-none focus:border-terracotta transition-colors"
            style={{ background: 'rgba(var(--ink-rgb),.05)', color: 'var(--fg-primary)', border: '1px solid rgba(var(--ink-rgb),.15)' }}
          />
          <span className="text-xs" style={{ color: 'var(--fg-secondary)' }}>del total de la materia</span>
        </div>
      </div>

      {/* Tags */}
      <TagInput tags={tags} onChange={setTags} />

      {/* Manual adjustments (only in adjust phase) */}
      {phase === 'adjust' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4 p-4 rounded-xl border border-terracotta/30 bg-terracotta/5"
        >
          <p className="text-xs text-terracotta font-medium uppercase tracking-wider">Ajuste manual de clasificación</p>
          <div>
            <label className="text-xs block mb-1" style={{ color: 'var(--fg-tertiary)' }}>Prioridad</label>
            <div className="flex gap-2">
              {PRIORITY_OPTIONS.map((p) => (
                <button
                  key={p} type="button"
                  onClick={() => setManualPriority(p)}
                  className="px-3 py-1.5 rounded-lg text-xs transition-all duration-250"
                  style={{
                    borderRadius: 'var(--ds-radius-sm)',
                    background: manualPriority === p ? 'var(--color-terracotta)' : 'rgba(var(--ink-rgb),.06)',
                    color: manualPriority === p ? 'var(--fg-on-accent)' : 'var(--fg-secondary)',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs block mb-1" style={{ color: 'var(--fg-tertiary)' }}>Categoría</label>
            <div className="flex gap-2 flex-wrap">
              {CATEGORY_OPTIONS.map((c) => (
                <button
                  key={c} type="button"
                  onClick={() => setManualCategory(c)}
                  className="px-3 py-1.5 rounded-lg text-xs transition-all duration-250"
                  style={{
                    borderRadius: 'var(--ds-radius-sm)',
                    background: manualCategory === c ? 'var(--color-terracotta)' : 'rgba(var(--ink-rgb),.06)',
                    color: manualCategory === c ? 'var(--fg-on-accent)' : 'var(--fg-secondary)',
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Error */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-priority-critica bg-priority-critica/10 px-4 py-2 rounded-lg"
        >
          {error}
        </motion.p>
      )}

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        {phase === 'adjust' ? (
          <Button type="button" size="lg" className="flex-1" onClick={handleConfirm}>
            Guardar con ajustes
          </Button>
        ) : (
          <>
            <Button
              type="button"
              size="lg"
              className="flex-1"
              onClick={handleClassify}
              disabled={!isValid}
              pulse={isValid}
            >
              {isEditing ? 'Re-clasificar con IA' : 'Clasificar y Crear'}
            </Button>
            {isEditing && (
              <Button type="button" size="lg" variant="secondary" onClick={handleSaveWithoutAI}>
                Guardar sin IA
              </Button>
            )}
          </>
        )}
      </div>
    </form>
  )
}
