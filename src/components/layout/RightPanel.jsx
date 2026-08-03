import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '../../store/uiStore'
import TaskForm from '../tasks/TaskForm'

export default function RightPanel() {
  const { rightPanelOpen, editingTask, closeRightPanel } = useUIStore()

  return (
    <AnimatePresence>
      {rightPanelOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 backdrop-blur-sm"
            style={{ background: 'rgba(6,11,18,.45)' }}
            onClick={closeRightPanel}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-[35%] min-w-[420px] z-50 overflow-y-auto custom-scrollbar"
            style={{
              background: 'var(--glass-bg-strong)',
              backdropFilter: 'blur(var(--blur-glass-strong))',
              WebkitBackdropFilter: 'blur(var(--blur-glass-strong))',
              borderLeft: '1px solid var(--glass-border)',
              boxShadow: 'var(--shadow-elevated)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid var(--divider-soft)' }}>
              <h2 className="font-display text-2xl" style={{ color: 'var(--fg-primary)' }}>
                {editingTask ? 'Editando tarea' : 'Nueva tarea'}
              </h2>
              <button
                onClick={closeRightPanel}
                className="w-9 h-9 rounded-full flex items-center justify-center hover-surface transition-colors duration-250"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--fg-secondary)" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Formulario */}
            <div className="p-6">
              <TaskForm task={editingTask} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
