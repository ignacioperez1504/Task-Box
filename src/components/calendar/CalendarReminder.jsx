import { useReminderStore } from '../../store/reminderStore'
import { motion } from 'framer-motion'

export default function CalendarReminder({ reminder }) {
  const { toggleReminder } = useReminderStore()
  const isCompleted = reminder.completed

  return (
    <div
      className={`px-2 py-1 rounded border text-[11px] text-left mb-1 transition-all duration-200 group relative flex items-center gap-1.5
        ${isCompleted ? 'opacity-50 grayscale' : 'opacity-100'}
      `}
      style={{
        backgroundColor: 'rgba(232, 130, 91, 0.18)', // Terracotta with low opacity
        borderColor: 'rgba(232, 130, 91, 0.35)',
        borderLeftWidth: '3px',
        borderLeftColor: 'var(--color-terracotta)',
      }}
      title={reminder.title}
    >
      <button
        onClick={(e) => {
          e.stopPropagation()
          toggleReminder(reminder.id)
        }}
        className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-all shrink-0 ${
          isCompleted
            ? 'bg-terracotta border-terracotta'
            : 'bg-transparent text-transparent hover:border-terracotta/50'
        }`}
        style={isCompleted
          ? { color: 'var(--fg-on-accent)' }
          : { borderColor: 'rgba(var(--ink-rgb),.25)' }}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </button>

      <span
        className="truncate font-medium flex-1"
        style={{
          color: isCompleted ? 'var(--fg-tertiary)' : 'var(--fg-primary)',
          textDecoration: isCompleted ? 'line-through' : 'none'
        }}
      >
        {reminder.title}
      </span>

      {/* Hover effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded pointer-events-none" style={{ background: 'rgba(var(--ink-rgb),.04)' }} />
    </div>
  )
}
