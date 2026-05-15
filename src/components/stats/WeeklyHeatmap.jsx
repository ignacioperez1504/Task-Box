import Tooltip from '../ui/Tooltip'
import { useTaskStore } from '../../store/taskStore'

const LOAD_COLORS = {
  0: '#2E6B5E',
  1: '#1B3A35',
  2: '#C9A96E',
  4: '#C27A55',
  6: '#8B2E2E',
}

function getLoadColor(count) {
  if (count === 0) return LOAD_COLORS[0]
  if (count === 1) return LOAD_COLORS[1]
  if (count <= 3) return LOAD_COLORS[2]
  if (count <= 5) return LOAD_COLORS[4]
  return LOAD_COLORS[6]
}

const DAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

export default function WeeklyHeatmap() {
  const { tasks } = useTaskStore()

  const today = new Date()
  const dayOfWeek = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7))

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const dateStr = d.toISOString().split('T')[0]
    const count = tasks.filter((t) => t.due_date === dateStr).length
    return { label: DAY_LABELS[i], dateStr, count }
  })

  return (
    <div>
      <p className="text-xs text-beige-dark mb-2">Carga semanal</p>
      <div className="flex gap-1.5">
        {days.map((day) => (
          <Tooltip key={day.dateStr} content={`${day.count} tarea${day.count !== 1 ? 's' : ''}`}>
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-medium transition-colors duration-300"
              style={{
                backgroundColor: getLoadColor(day.count),
                color: day.count <= 1 ? '#C8C5B8' : '#0A0A0A',
              }}
            >
              {day.label}
            </div>
          </Tooltip>
        ))}
      </div>
    </div>
  )
}
