import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DndContext, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { useTaskStore } from '../../store/taskStore'
import { useReminderStore } from '../../store/reminderStore'
import { getDailyRecommendation, hasApiKey } from '../../lib/aiService'
import CalendarDay from './CalendarDay'
import CalendarTask from './CalendarTask'
import { CardSkeleton } from '../ui/LoadingSkeleton'
import GlassCard from '../ui/GlassCard'

const GRID_LINE = '#959da4'

const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DAYS_ES = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo']

function AIRecommendationPanel({ tasks, reminders }) {
  const [recommendation, setRecommendation] = useState(null)
  const [loading, setLoading] = useState(false)
  const apiConfigured = hasApiKey()

  useEffect(() => {
    async function fetchRecommendation() {
      // Only fetch if we have an API key and at least one task
      if (!apiConfigured || tasks.length === 0) {
        if (tasks.length === 0) setRecommendation(null)
        return
      }
      
      setLoading(true)
      try {
        const rec = await getDailyRecommendation(tasks.slice(0, 3), reminders)
        setRecommendation(rec)
      } catch (err) {
        console.error('AI Panel Error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchRecommendation()
  }, [apiConfigured, tasks, reminders.length]) // Added tasks and reminders.length as dependencies

  // If no API key, don't show anything
  if (!apiConfigured) return null
  
  // If no tasks and not loading, we can show a placeholder or nothing
  // But let's show it if we are loading or if we have a recommendation
  if (tasks.length === 0 && !loading && !recommendation) return null

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 p-5 glass-dark border border-terracotta/20 rounded-2xl relative overflow-hidden group min-h-[100px]"
    >
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#E8825B" strokeWidth="1.5">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      </div>

      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-terracotta/20 flex items-center justify-center shrink-0 border border-terracotta/30">
          <span className="text-xl">✨</span>
        </div>
        <div className="flex-1">
          <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta mb-1">Recomendación de hoy</h4>
          {loading ? (
            <div className="space-y-2 mt-2">
              <div className="h-3 bg-beige/10 rounded w-3/4 animate-pulse" />
              <div className="h-3 bg-beige/10 rounded w-1/2 animate-pulse" />
            </div>
          ) : (
            <p className="text-sm text-beige leading-relaxed italic">
              {recommendation || (tasks.length > 0 ? "Analizando tus tareas para darte el mejor consejo..." : "No hay tareas pendientes para analizar.")}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function Calendar() {
  const { tasks, loading, moveTaskToDate, getSortedTasks } = useTaskStore()
  const { reminders } = useReminderStore()
  
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [activeDragTask, setActiveDragTask] = useState(null)
  const [shakeDay, setShakeDay] = useState(null)

  const sortedPendingTasks = useMemo(() => {
    return getSortedTasks().filter(t => t.status !== 'completed')
  }, [tasks, getSortedTasks])

  const todayReminders = useMemo(() => {
    return reminders.filter(r => r.date === todayStr)
  }, [reminders, todayStr])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement before drag starts
      },
    })
  )

  const calendarDays = useMemo(() => {
    const days = []
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1)
    const lastDayOfMonth = new Date(viewYear, viewMonth + 1, 0)
    
    // Padding from previous month
    let firstDayOfWeek = firstDayOfMonth.getDay() - 1
    if (firstDayOfWeek === -1) firstDayOfWeek = 6 // Sunday
    
    for (let i = firstDayOfWeek; i > 0; i--) {
      const d = new Date(viewYear, viewMonth, 1 - i)
      days.push({ date: d, isCurrentMonth: false })
    }
    
    // Current month days
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const d = new Date(viewYear, viewMonth, i)
      days.push({ date: d, isCurrentMonth: true })
    }
    
    // Padding for next month
    const totalDays = days.length
    const remainingDays = Math.ceil(totalDays / 7) * 7 - totalDays
    
    for (let i = 1; i <= remainingDays; i++) {
      const d = new Date(viewYear, viewMonth + 1, i)
      days.push({ date: d, isCurrentMonth: false })
    }
    
    return days
  }, [viewMonth, viewYear])

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1) }
    else setViewMonth(viewMonth - 1)
  }
  
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1) }
    else setViewMonth(viewMonth + 1)
  }
  
  const goToToday = () => {
    setViewMonth(today.getMonth())
    setViewYear(today.getFullYear())
  }

  // Drag and Drop handlers
  const handleDragStart = (event) => {
    const { active } = event
    setActiveDragTask(active.data.current.task)
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    setActiveDragTask(null)

    if (!over) return

    const task = active.data.current.task
    const newDateStr = over.id
    
    // Verify if it's dropping on a past date
    const dropDate = new Date(newDateStr + 'T23:59:59')
    const now = new Date()
    
    if (dropDate < now && newDateStr !== now.toISOString().split('T')[0]) {
      // It's a past date (not today), show error shake
      setShakeDay(newDateStr)
      setTimeout(() => setShakeDay(null), 500)
      return
    }

    // Only update if date actually changed
    if (task.due_date !== newDateStr) {
      moveTaskToDate(task.id, newDateStr)
    }
  }

  if (loading) {
    return (
      <div className="p-6 h-full flex flex-col">
        <div className="flex justify-between mb-6">
          <div className="w-48 h-10 rounded-xl animate-shimmer" style={{ background: 'rgba(var(--ink-rgb),.08)' }} />
          <div className="w-32 h-10 rounded-xl animate-shimmer" style={{ background: 'rgba(var(--ink-rgb),.08)' }} />
        </div>
        <div className="grid grid-cols-7 gap-px flex-1 rounded-3xl overflow-hidden" style={{ background: 'rgba(var(--ink-rgb),.08)', border: '1px solid var(--glass-border)' }}>
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="p-2" style={{ background: 'var(--glass-bg)', borderRight: `1px solid ${GRID_LINE}`, borderBottom: `1px solid ${GRID_LINE}` }}>
              <div className="w-6 h-6 rounded-full animate-shimmer mb-2" style={{ background: 'rgba(var(--ink-rgb),.1)' }} />
              {i % 3 === 0 && <div className="w-full h-12 rounded animate-shimmer" style={{ background: 'rgba(var(--ink-rgb),.06)' }} />}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto custom-scrollbar" style={{ padding: '40px 32px 32px' }}>
      {/* Header */}
      <div className="flex items-center shrink-0" style={{ gap: 20, marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 36, color: 'var(--fg-primary)', minWidth: 220 }}>
          {MONTHS_ES[viewMonth]} <span style={{ color: 'var(--color-terracotta)' }}>{viewYear}</span>
        </h2>

        <div
          className="flex rounded-full"
          style={{ gap: 4, padding: 4, background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', backdropFilter: 'blur(var(--blur-glass))', WebkitBackdropFilter: 'blur(var(--blur-glass))' }}
        >
          <button onClick={prevMonth} className="w-10 h-10 rounded-full flex items-center justify-center hover-surface transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--fg-secondary)" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button onClick={goToToday} className="h-10 rounded-full hover-surface transition-colors" style={{ width: 'auto', padding: '0 18px', fontSize: 13, color: 'var(--fg-primary)', fontWeight: 500, fontFamily: 'var(--font-body)' }}>
            Hoy
          </button>
          <button onClick={nextMonth} className="w-10 h-10 rounded-full flex items-center justify-center hover-surface transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--fg-secondary)" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>

      {/* AI Recommendation Panel */}
      <AIRecommendationPanel tasks={sortedPendingTasks} reminders={todayReminders} />

      {/* Calendar Grid */}
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <GlassCard radius="lg" padding={0} className="flex-1 flex flex-col overflow-hidden relative min-h-[560px]">

          {/* Days of week */}
          <div className="grid grid-cols-7 shrink-0" style={{ borderBottom: `1px solid ${GRID_LINE}`, background: 'rgba(var(--ink-rgb),0.15)' }}>
            {DAYS_ES.map(day => (
              <div key={day} className="text-center font-semibold" style={{ padding: '12px 0', fontSize: 10, color: 'var(--fg-secondary)', letterSpacing: '.15em', textTransform: 'uppercase' }}>
                {day.substring(0, 3)}
              </div>
            ))}
          </div>

          {/* Calendar body */}
          <div className="flex-1 grid grid-cols-7 auto-rows-fr">
            {calendarDays.map(({ date, isCurrentMonth }, i) => {
              const dateStr = date.toISOString().split('T')[0]
              const dayTasks = tasks.filter(t => t.due_date === dateStr)
              const dayReminders = reminders.filter(r => r.date === dateStr)
              
              return (
                <motion.div
                  key={`${dateStr}-${i}`}
                  animate={shakeDay === dateStr ? { x: [-5, 5, -5, 5, 0] } : {}}
                  transition={{ duration: 0.4 }}
                  className="h-full"
                >
                  <CalendarDay 
                    date={date} 
                    isCurrentMonth={isCurrentMonth} 
                    tasks={dayTasks}
                    reminders={dayReminders}
                  />
                </motion.div>
              )
            })}
          </div>
        </GlassCard>

        {/* Drag Overlay */}
        <DragOverlay dropAnimation={{ duration: 250, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
          {activeDragTask ? (
            <CalendarTask task={activeDragTask} isOverlay={true} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
