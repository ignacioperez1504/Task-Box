import { motion, AnimatePresence } from 'framer-motion'
import { useSubjectStore } from '../../store/subjectStore'
import Dropdown, { DropdownItem } from '../ui/Dropdown'
import SegmentedTabs from '../ui/SegmentedTabs'
import { GlassLayers, glassSurfaceVariants } from '../ui/GlassSurface'

const PRIORITIES = [
  { label: 'Crítica', color: '#E15252' },
  { label: 'Alta', color: '#E8825B' },
  { label: 'Media', color: '#E8C468' },
  { label: 'Baja', color: '#4FAE8C' },
]

const STATUS_OPTIONS = [
  { label: 'Pendientes', value: 'pending' },
  { label: 'Completadas', value: 'completed' },
  { label: 'Todas', value: 'all' },
]

const FILTER_ICON = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
)

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
      <SegmentedTabs
        options={STATUS_OPTIONS}
        value={filters.status}
        onChange={(status) => onChange({ ...filters, status })}
      />

      {/* Priority toggles */}
      <div className="flex gap-2">
        {PRIORITIES.map((p) => {
          const active = (filters.priorities || []).includes(p.label)
          return (
            <button
              key={p.label}
              onClick={() => togglePriority(p.label)}
              className={`px-3 py-1.5 text-xs font-medium cursor-pointer ${glassSurfaceVariants(
                { radius: 'sm', interactive: true }
              )}`}
              style={{
                // El chip activo se tiñe con el color de su prioridad; el
                // inactivo queda como vidrio neutro.
                '--gs-bg': active ? p.color + '30' : 'var(--glass-bg)',
                '--gs-border': active ? p.color + '60' : 'var(--glass-border-soft)',
                color: active ? p.color : 'var(--fg-tertiary)',
              }}
            >
              <GlassLayers />
              {p.label}
            </button>
          )
        })}

        {/* Subject dropdown */}
        <Dropdown
          className="ml-auto"
          variant="compact"
          align="right"
          matchTriggerWidth={false}
          panelWidth={208}
          trigger={<>{FILTER_ICON} Materias</>}
          triggerStyle={{ color: 'var(--fg-secondary)' }}
          panelClassName="max-h-64 overflow-y-auto custom-scrollbar py-1"
        >
          {subjects.length === 0 ? (
            <p className="px-4 py-3 text-xs text-center italic" style={{ color: 'var(--fg-tertiary)' }}>
              No hay materias creadas
            </p>
          ) : (
            subjects.map((s) => {
              const active = (filters.subjects || []).includes(s.id)
              return (
                <DropdownItem
                  key={s.id}
                  active={active}
                  onClick={() => toggleSubject(s.id)}
                  style={active ? { color: 'var(--color-terracotta)' } : undefined}
                >
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color_hex }} />
                  <span className="truncate">{s.name}</span>
                  {active && <span className="ml-auto">✓</span>}
                </DropdownItem>
              )
            })
          )}
        </Dropdown>
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
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs" style={{ background: 'rgba(232,130,91,0.18)', color: 'var(--color-terracotta)' }}>
                {filters.status === 'pending' ? 'Pendientes' : 'Completadas'}
                <button onClick={() => removeFilter('status')} className="hover:opacity-70">×</button>
              </span>
            )}
            {(filters.priorities || []).map((p) => (
              <span key={p} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                style={{ backgroundColor: (PRIORITIES.find((x) => x.label === p)?.color || '#94A3B8') + '25', color: PRIORITIES.find((x) => x.label === p)?.color }}>
                {p}
                <button onClick={() => removeFilter('priority', p)} className="hover:opacity-70">×</button>
              </span>
            ))}
            {(filters.subjects || []).map((id) => {
              const s = subjects.find((x) => x.id === id)
              if (!s) return null
              return (
                <span key={id} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                  style={{ backgroundColor: s.color_hex + '25', color: s.color_hex }}>
                  {s.name}
                  <button onClick={() => removeFilter('subject', id)} className="hover:opacity-70">×</button>
                </span>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
