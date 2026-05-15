import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTaskStore } from '../../store/taskStore'
import { useSubjectStore } from '../../store/subjectStore'
import { useUIStore } from '../../store/uiStore'
import { useAcademicStore } from '../../store/academicStore'
import { useHabitStore } from '../../store/habitStore'
import { useReminderStore } from '../../store/reminderStore'
import { classifyTask, hasApiKey } from '../../lib/aiService'
import SubjectSelect from './SubjectSelect'
import CustomDatePicker from './CustomDatePicker'
import DurationSelector from './DurationSelector'
import ImportanceSelector from './ImportanceSelector'
import TagInput from './TagInput'
import AIProcessing from './AIProcessing'
import AIResult from './AIResult'

export default function TaskForm({ task = null }) {
  const { createTask, updateTask } = useTaskStore()
  const { getSubjectById } = useSubjectStore()
  const { closeRightPanel, showApiKeyWarning } = useUIStore()
  const isEditing = !!task

  const [title, setTitle] = useState(task?.title || '')
  const [subjectId, setSubjectId] = useState(task?.subject_id || '')
  const [description, setDescription] = useState(task?.description || '')
  const [dueDate, setDueDate] = useState(task?.due_date || '')
  const [duration, setDuration] = useState(task?.duration_hours ? parseFloat(task.duration_hours) : null)
  const [importance, setImportance] = useState(task?.user_priority || '')
  const [tags, setTags] = useState(task?.tags || [])
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
      if (created) setTaskWeight(created.id, percentage)
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
          className="w-full bg-transparent text-beige font-display text-2xl border-b-2 border-beige/20 pb-2 outline-none focus:border-terracotta transition-colors duration-250 placeholder:text-beige-dark/50"
        />
      </div>

      {/* Subject */}
      <SubjectSelect value={subjectId} onChange={setSubjectId} />

      {/* Description */}
      <div>
        <label className="text-xs text-beige-dark uppercase tracking-wider block mb-2">Descripción</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe la tarea con el mayor detalle posible. Esto ayuda a la IA a clasificarla mejor."
          rows={3}
          className="w-full bg-teal-darker/40 text-beige text-sm px-4 py-3 rounded-xl border border-beige/15 outline-none focus:border-terracotta transition-colors resize-none"
          style={{ minHeight: '80px' }}
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
        <label className="text-xs text-beige-dark uppercase tracking-wider block mb-2">¿Cuánto vale esta tarea? (%)</label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={percentage || ''}
            onChange={(e) => setPercentage(parseFloat(e.target.value) || 0)}
            placeholder="0"
            className="w-24 bg-teal-darker/40 text-beige text-sm px-4 py-3 rounded-xl border border-beige/15 outline-none focus:border-terracotta transition-colors"
          />
          <span className="text-xs text-beige-dark">del total de la materia</span>
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
            <label className="text-xs text-beige-dark block mb-1">Prioridad</label>
            <div className="flex gap-2">
              {PRIORITY_OPTIONS.map((p) => (
                <button
                  key={p} type="button"
                  onClick={() => setManualPriority(p)}
                  className="px-3 py-1.5 rounded-lg text-xs transition-all duration-250"
                  style={{
                    background: manualPriority === p ? '#C27A55' : 'rgba(27,58,53,0.4)',
                    color: manualPriority === p ? '#0A0A0A' : '#C8C5B8',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-beige-dark block mb-1">Categoría</label>
            <div className="flex gap-2 flex-wrap">
              {CATEGORY_OPTIONS.map((c) => (
                <button
                  key={c} type="button"
                  onClick={() => setManualCategory(c)}
                  className="px-3 py-1.5 rounded-lg text-xs transition-all duration-250"
                  style={{
                    background: manualCategory === c ? '#C27A55' : 'rgba(27,58,53,0.4)',
                    color: manualCategory === c ? '#0A0A0A' : '#C8C5B8',
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
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleConfirm}
            className="flex-1 bg-terracotta text-black font-medium py-3.5 rounded-xl text-sm uppercase tracking-wider hover:bg-terracotta-light transition-colors"
          >
            Guardar con ajustes
          </motion.button>
        ) : (
          <>
            <motion.button
              whileHover={isValid ? { scale: 1.02 } : {}}
              whileTap={isValid ? { scale: 0.98 } : {}}
              type="button"
              onClick={handleClassify}
              disabled={!isValid}
              className="flex-1 font-medium py-3.5 rounded-xl text-sm uppercase tracking-wider transition-all duration-300"
              style={{
                backgroundColor: isValid ? '#C27A55' : 'rgba(194,122,85,0.3)',
                color: isValid ? '#0A0A0A' : '#A8A598',
                opacity: isValid ? 1 : 0.6,
                animation: isValid ? 'pulse-terracotta 3s ease-in-out infinite' : 'none',
              }}
            >
              {isEditing ? 'Re-clasificar con IA' : 'Clasificar y Crear'}
            </motion.button>
            {isEditing && (
              <button
                type="button"
                onClick={handleSaveWithoutAI}
                className="px-5 py-3.5 text-sm text-beige border border-beige/20 rounded-xl hover:bg-beige/10 transition-colors"
              >
                Guardar sin IA
              </button>
            )}
          </>
        )}
      </div>
    </form>
  )
}
