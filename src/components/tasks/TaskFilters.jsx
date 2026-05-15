import { motion, AnimatePresence } from 'framer-motion'
import { useSubjectStore } from '../../store/subjectStore'

const PRIORITIES = [
  { label: 'Crítica', color: '#8B2E2E' },
  { label: 'Alta', color: '#C27A55' },
  { label: 'Media', color: '#C9A96E' },
  { label: 'Baja', color: '#2E6B5E' },
]

const STATUS_OPTIONS = [
  { label: 'Pendientes', value: 'pending' },
  { label: 'Completadas', value: 'completed' },
  { label: 'Todas', value: 'all' },
]

export default function TaskFilters({ filters, onChange }) {
  const { subjects } = useSubjectStore()

  const togglePriority = (p) => {
    const current = filters.priorities || []
    const next = current.includes(p)
      ? current.filter((x) => x !== p)
      : [...current, p]
    onChange({ ...filters, priorities: next })
  }

  const toggleSubject = (id) => {
    const current = filters.subjects || []
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id]
    onChange({ ...filters, subjects: next })
  }

  const removeFilter = (type, value) => {
    if (type === 'priority') {
      onChange({ ...filters, priorities: (filters.priorities || []).filter((p) => p !== value) })
    } else if (type === 'subject') {
      onChange({ ...filters, subjects: (filters.subjects || []).filter((s) => s !== value) })
    } else if (type === 'status') {
      onChange({ ...filters, status: 'all' })
    }
  }

  const hasActiveFilters = (filters.priorities?.length > 0) ||
    (filters.subjects?.length > 0) ||
    (filters.status !== 'all')

  return (
    <div className="mb-6 space-y-3">
      {/* Status tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-teal-darker/50">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange({ ...filters, status: opt.value })}
            className="flex-1 py-2 text-xs font-medium rounded-lg transition-all duration-250"
            style={{
              background: filters.status === opt.value ? 'rgba(194,122,85,0.25)' : 'transparent',
              color: filters.status === opt.value ? '#C27A55' : '#A8A598',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Priority toggles */}
      <div className="flex gap-2">
        {PRIORITIES.map((p) => {
          const active = (filters.priorities || []).includes(p.label)
          return (
            <button
              key={p.label}
              onClick={() => togglePriority(p.label)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-250"
              style={{
                background: active ? p.color + '30' : 'rgba(27,58,53,0.3)',
                color: active ? p.color : '#A8A598',
                border: `1px solid ${active ? p.color + '60' : 'rgba(200,197,184,0.08)'}`,
              }}
            >
              {p.label}
            </button>
          )
        })}

        {/* Subject dropdown */}
        <div className="relative ml-auto group">
          <button className="px-3 py-1.5 rounded-lg text-xs text-beige-dark border border-beige/10 hover:border-beige/25 transition-colors flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            Materias
          </button>
          <div className="absolute right-0 top-full mt-1 w-52 glass rounded-xl overflow-hidden z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
            {subjects.map((s) => {
              const active = (filters.subjects || []).includes(s.id)
              return (
                <button
                  key={s.id}
                  onClick={() => toggleSubject(s.id)}
                  className="w-full text-left px-4 py-2 text-xs flex items-center gap-2 hover:bg-beige/10 transition-colors"
                  style={{ color: active ? '#C27A55' : '#C8C5B8' }}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color_hex }} />
                  {s.name}
                  {active && <span className="ml-auto">✓</span>}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Active filter chips */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-1.5"
          >
            {filters.status !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-teal-light/20 text-beige">
                {filters.status === 'pending' ? 'Pendientes' : 'Completadas'}
                <button onClick={() => removeFilter('status')} className="hover:text-terracotta">×</button>
              </span>
            )}
            {(filters.priorities || []).map((p) => (
              <span key={p} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                style={{ backgroundColor: (PRIORITIES.find((x) => x.label === p)?.color || '#C8C5B8') + '20', color: PRIORITIES.find((x) => x.label === p)?.color }}>
                {p}
                <button onClick={() => removeFilter('priority', p)} className="hover:text-white">×</button>
              </span>
            ))}
            {(filters.subjects || []).map((id) => {
              const s = subjects.find((x) => x.id === id)
              if (!s) return null
              return (
                <span key={id} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                  style={{ backgroundColor: s.color_hex + '20', color: s.color_hex }}>
                  {s.name}
                  <button onClick={() => removeFilter('subject', id)} className="hover:text-white">×</button>
                </span>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
