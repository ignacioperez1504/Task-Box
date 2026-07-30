import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '../../store/uiStore'
import { useTaskStore } from '../../store/taskStore'
import GlassCard from '../ui/GlassCard'

export default function DeleteModal() {
  const { deleteModal, closeDeleteModal } = useUIStore()
  const { deleteTask } = useTaskStore()

  const handleDelete = async () => {
    if (deleteModal?.task?.id) {
      await deleteTask(deleteModal.task.id)
    }
    closeDeleteModal()
  }

  return (
    <AnimatePresence>
      {deleteModal && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/40"
            onClick={closeDeleteModal}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[71] w-[420px]"
          >
            <GlassCard radius="lg" padding={32} className="text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(225,82,82,.15)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E15252" strokeWidth="2" strokeLinecap="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </div>

              <h3 className="font-display text-xl mb-2" style={{ color: 'var(--fg-primary)' }}>Eliminar tarea</h3>
              <p className="text-sm mb-6" style={{ color: 'var(--fg-secondary)' }}>
                ¿Estás seguro de que quieres eliminar{' '}
                <span className="font-medium" style={{ color: 'var(--fg-primary)' }}>"{deleteModal.task?.title}"</span>?
                <br />
                <span className="text-xs">Esta acción no se puede deshacer.</span>
              </p>

              <div className="flex gap-3">
                <button
                  onClick={closeDeleteModal}
                  className="flex-1 py-3 text-sm rounded-xl hover-surface transition-colors duration-250"
                  style={{ color: 'var(--fg-primary)', border: '1px solid var(--glass-border)' }}
                >
                  Cancelar
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDelete}
                  className="flex-1 py-3 text-sm font-medium rounded-xl transition-colors duration-250"
                  style={{ backgroundColor: '#E15252', color: '#FFF8F4' }}
                >
                  Eliminar definitivamente
                </motion.button>
              </div>
            </GlassCard>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
