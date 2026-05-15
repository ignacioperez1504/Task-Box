import { useSubjectStore } from '../../store/subjectStore'
import { useTaskStore } from '../../store/taskStore'

export default function SubjectDistribution() {
  const { subjects } = useSubjectStore()
  const { tasks } = useTaskStore()

  const pending = tasks.filter((t) => t.status === 'pending')

  const distribution = subjects
    .map((s) => ({
      ...s,
      count: pending.filter((t) => t.subject_id === s.id).length,
    }))
    .filter((s) => s.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 4)

  const maxCount = Math.max(...distribution.map((s) => s.count), 1)

  if (!distribution.length) return null

  return (
    <div>
      <p className="text-xs text-beige-dark mb-3">Por materia</p>
      <div className="space-y-2">
        {distribution.map((s) => (
          <div key={s.id} className="flex items-center gap-2">
            <span className="text-xs text-beige truncate w-16" title={s.name}>
              {s.name.length > 8 ? s.name.slice(0, 8) + '…' : s.name}
            </span>
            <div className="flex-1 h-2 bg-teal-darker rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(s.count / maxCount) * 100}%`,
                  backgroundColor: s.color_hex,
                }}
              />
            </div>
            <span className="text-xs text-beige-dark w-4 text-right">{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
