import { useUIStore } from '../../store/uiStore'
import { useTaskStore } from '../../store/taskStore'
import Modal from '../ui/Modal'
import Button from '../ui/Button'

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
    <Modal
      open={!!deleteModal}
      onClose={closeDeleteModal}
      width={420}
      zIndex={70}
      footer={
        <>
          <Button variant="secondary" className="flex-1" onClick={closeDeleteModal}>
            Cancelar
          </Button>
          <Button variant="danger" className="flex-1" onClick={handleDelete}>
            Eliminar definitivamente
          </Button>
        </>
      }
    >
      <div className="text-center">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(225,82,82,.15)' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-priority-critica)" strokeWidth="2" strokeLinecap="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </div>

        <h3 className="font-display text-xl mb-2" style={{ color: 'var(--fg-primary)' }}>Eliminar tarea</h3>
        <p className="text-sm" style={{ color: 'var(--fg-secondary)' }}>
          ¿Estás seguro de que quieres eliminar{' '}
          <span className="font-medium" style={{ color: 'var(--fg-primary)' }}>"{deleteModal?.task?.title}"</span>?
          <br />
          <span className="text-xs">Esta acción no se puede deshacer.</span>
        </p>
      </div>
    </Modal>
  )
}
