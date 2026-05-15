import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DndContext, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { useTaskStore } from '../../store/taskStore'
import CalendarDay from './CalendarDay'
import CalendarTask from './CalendarTask'
import { CardSkeleton } from '../ui/LoadingSkeleton'

const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DAYS_ES = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo']

export default function Calendar() {
  const { tasks, loading, moveTaskToDate } = useTaskStore()
  
  const today = new Date()
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [activeDragTask, setActiveDragTask] = useState(null)
  const [shakeDay, setShakeDay] = useState(null)

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
          <div className="w-48 h-10 bg-beige/10 rounded-xl animate-shimmer" />
          <div className="w-32 h-10 bg-beige/10 rounded-xl animate-shimmer" />
        </div>
        <div className="grid grid-cols-7 gap-px flex-1 bg-beige/5 rounded-2xl overflow-hidden border border-beige/10">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="bg-teal-darker/50 p-2 border-r border-b border-beige/10">
              <div className="w-6 h-6 rounded-full bg-beige/10 animate-shimmer mb-2" />
              {i % 3 === 0 && <div className="w-full h-12 bg-beige/5 rounded animate-shimmer" />}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col pt-10 px-6 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="font-display text-4xl text-beige min-w-[200px]">
            {MONTHS_ES[viewMonth]} <span className="text-terracotta">{viewYear}</span>
          </h2>
          
          <div className="flex gap-1 glass rounded-xl p-1">
            <button onClick={prevMonth} className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-beige/10 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C8C5B8" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button onClick={goToToday} className="px-4 h-10 rounded-lg text-sm text-beige font-medium hover:bg-beige/10 transition-colors">
              Hoy
            </button>
            <button onClick={nextMonth} className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-beige/10 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C8C5B8" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 flex flex-col glass rounded-2xl overflow-hidden border border-beige/10 shadow-lg relative bg-teal-darker/30 mt-4">
          
          {/* Days of week */}
          <div className="grid grid-cols-7 border-b border-beige/10 bg-black/20">
            {DAYS_ES.map(day => (
              <div key={day} className="py-3 text-center text-xs text-beige-dark font-medium uppercase tracking-widest border-r border-beige/10">
                {day.substring(0, 3)}
              </div>
            ))}
          </div>
          
          {/* Calendar body */}
          <div className="flex-1 grid grid-cols-7 auto-rows-fr mt-4">
            {calendarDays.map(({ date, isCurrentMonth }, i) => {
              const dateStr = date.toISOString().split('T')[0]
              const dayTasks = tasks.filter(t => t.due_date === dateStr)
              
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
                  />
                </motion.div>
              )
            })}
          </div>
        </div>

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
