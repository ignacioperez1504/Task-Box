import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '../../store/uiStore'
import { useTaskStore } from '../../store/taskStore'
import TaskCard from '../tasks/TaskCard'
import EmptyState from '../ui/EmptyState'
import PageHeader from '../ui/PageHeader'
import Button from '../ui/Button'
import { GlassLayers, glassSurfaceVariants } from '../ui/GlassSurface'

export default function DayTasksView() {
  const { selectedDate, setActiveSection, openCreatePanel } = useUIStore()
  const { getTasksByDate } = useTaskStore()

  if (!selectedDate) {
    setActiveSection('calendar')
    return null
  }

  const tasks = getTasksByDate(selectedDate)
  
  // Format date for display
  const dateObj = new Date(selectedDate + 'T12:00:00')
  const dateStr = dateObj.toLocaleDateString('es-ES', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
  
  // Capitalize first letter
  const formattedDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1)

  return (
    <div className="h-full flex flex-col p-8">
      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <button
          onClick={() => setActiveSection('calendar')}
          className={`w-10 h-10 flex items-center justify-center shrink-0 cursor-pointer mt-1 ${glassSurfaceVariants(
            { radius: 'control', interactive: true }
          )}`}
        >
          <GlassLayers />
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--fg-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>

        <PageHeader
          className="flex-1 !mb-0"
          title={formattedDate}
          subtitle={`${tasks.length} tarea${tasks.length !== 1 ? 's' : ''} programada${tasks.length !== 1 ? 's' : ''}`}
          actions={
            <Button onClick={openCreatePanel}>+ Nueva tarea este día</Button>
          }
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        {tasks.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <EmptyState 
              title="Día libre" 
              message="No tienes tareas programadas para esta fecha. Disfruta tu tiempo o adelanta trabajo creando una nueva." 
            />
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {tasks.map((task, i) => (
                <TaskCard key={task.id} task={task} index={i} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
