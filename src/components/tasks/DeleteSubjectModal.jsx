import Modal from '../ui/Modal'
import Button from '../ui/Button'

// Mismo chrome que DeleteModal (tacho en círculo rojo, título display, aviso de
// irreversibilidad); solo cambia el cuerpo, porque borrar una materia no borra
// sus tareas: las deja sin materia asignada.
// Los botones llevan type="button" porque este modal se renderiza dentro del
// <form> de TaskForm y el default de <button> es submit.
export default function DeleteSubjectModal({ open, subject, onClose, onConfirm }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      width={420}
      zIndex={70}
      footer={
        <>
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" variant="danger" className="flex-1" onClick={onConfirm}>
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

        <h3 className="font-display text-xl mb-2" style={{ color: 'var(--fg-primary)' }}>Eliminar materia</h3>
        <p className="text-sm" style={{ color: 'var(--fg-secondary)' }}>
          Eliminar la materia{' '}
          <span className="font-medium" style={{ color: 'var(--fg-primary)' }}>"{subject?.name}"</span>{' '}
          no eliminará las tareas asociadas, pero quedarán sin materia asignada.
          <br />
          <span className="text-xs">Esta acción no se puede deshacer.</span>
        </p>
      </div>
    </Modal>
  )
}
