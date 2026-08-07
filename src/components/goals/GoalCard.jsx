import { motion } from 'framer-motion'
import GradientBar from '../ui/GradientBar'
import { GlassLayers, glassSurfaceVariants } from '../ui/GlassSurface'

export default function GoalCard({ goal, onEdit, onDelete }) {
  const pct = goal.target_value > 0
    ? Math.min(100, Math.round((parseFloat(goal.current_value) / parseFloat(goal.target_value)) * 100))
    : 0
  const isCompleted = goal.is_completed

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`p-4 ${glassSurfaceVariants({ radius: 'md', interactive: true })}`}
      style={{
        // Objetivo cumplido: el vidrio se tiñe de terracota en vez de cambiar
        // de componente.
        '--gs-bg': isCompleted ? 'rgba(232,130,91,0.18)' : 'var(--glass-bg)',
        '--gs-border': isCompleted ? 'rgba(232,130,91,0.4)' : 'var(--glass-border-soft)',
      }}
    >
      <GlassLayers />
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {isCompleted && <span className="text-sm">🏆</span>}
          <h4 className="font-medium" style={{ fontSize: 13, color: 'var(--fg-primary)' }}>{goal.title}</h4>
        </div>
        <div className="flex gap-1">
          {!isCompleted && (
            <button onClick={() => onEdit(goal)} className="p-1 rounded transition-colors hover-surface">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--fg-secondary)" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
          )}
          <button onClick={() => onDelete(goal.id)} className="p-1 rounded transition-colors hover-surface">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--fg-secondary)" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-1.5">
        <GradientBar value={parseFloat(goal.current_value)} max={parseFloat(goal.target_value) || 1} height={5} />
      </div>

      <div className="flex justify-between text-xs" style={{ color: 'var(--fg-secondary)' }}>
        <span>{parseFloat(goal.current_value)} de {parseFloat(goal.target_value)} {goal.type === 'complete_tasks' ? 'tareas' : 'horas'}</span>
        <span className={isCompleted ? 'text-terracotta font-medium' : ''}>{pct}%</span>
      </div>
    </motion.div>
  )
}
