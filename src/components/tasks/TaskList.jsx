import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useTaskStore } from '../../store/taskStore'
import TaskCard from './TaskCard'
import TaskFilters from './TaskFilters'
import EmptyState from '../ui/EmptyState'
import { CardSkeleton } from '../ui/LoadingSkeleton'

export default function TaskList() {
  const { loading, getFilteredTasks } = useTaskStore()
  const [filters, setFilters] = useState({
    status: 'pending',
    priorities: [],
    subjects: [],
  })

  const tasks = getFilteredTasks(filters)

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-3xl" style={{ color: 'var(--fg-primary)' }}>Tareas</h2>
        <span className="text-sm" style={{ color: 'var(--fg-secondary)' }}>{tasks.length} tarea{tasks.length !== 1 ? 's' : ''}</span>
      </div>

      <TaskFilters filters={filters} onChange={setFilters} />

      {tasks.length === 0 ? (
        <EmptyState
          title="Sin tareas"
          message={filters.status === 'completed'
            ? 'No has completado ninguna tarea aún. ¡A trabajar!'
            : 'No hay tareas que coincidan con los filtros. Crea una nueva tarea con el botón +'}
        />
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
  )
}
