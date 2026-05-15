import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '../../store/uiStore'
import { useTaskStore } from '../../store/taskStore'
import TaskCard from '../tasks/TaskCard'
import EmptyState from '../ui/EmptyState'

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
    <div className="h-full flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveSection('calendar')}
            className="w-10 h-10 rounded-xl glass flex items-center justify-center hover:bg-beige/10 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C8C5B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <div>
            <h2 className="font-display text-3xl text-beige">{formattedDate}</h2>
            <p className="text-sm text-beige-dark">{tasks.length} tarea{tasks.length !== 1 ? 's' : ''} programada{tasks.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        
        <button
          onClick={openCreatePanel}
          className="bg-terracotta text-black px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-terracotta-light transition-colors shadow-elevated"
        >
          + Nueva tarea este día
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pr-2">
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
