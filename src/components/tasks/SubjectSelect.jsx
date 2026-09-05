import { useState } from 'react'
import { useSubjectStore } from '../../store/subjectStore'
import Dropdown, { DropdownItem } from '../ui/Dropdown'
import { Input } from '../ui/Field'
import DeleteSubjectModal from './DeleteSubjectModal'

export default function SubjectSelect({ value, onChange }) {
  const { subjects, createSubject, deleteSubject } = useSubjectStore()
  const [search, setSearch] = useState('')
  // Materia a la espera de confirmación de borrado (null = modal cerrado).
  const [pendingDelete, setPendingDelete] = useState(null)

  const selected = subjects.find((s) => s.id === value)
  const filtered = subjects.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  )
  const canCreate = search.trim() && !subjects.some(
    (s) => s.name.toLowerCase() === search.toLowerCase()
  )

  const handleDelete = async () => {
    if (!pendingDelete) return
    const ok = await deleteSubject(pendingDelete.id)
    // Si borramos la materia elegida en el formulario, queda sin selección.
    if (ok && value === pendingDelete.id) onChange(null)
    setPendingDelete(null)
  }

  return (
    <>
      <Dropdown
        label="Materia"
        placeholder={!selected}
        trigger={
          <>
            {selected && (
              <span
                className="w-3 h-3 rounded-full inline-block shrink-0"
                style={{ backgroundColor: selected.color_hex }}
              />
            )}
            <span className="truncate">{selected?.name || 'Selecciona una materia'}</span>
          </>
        }
        panelClassName="max-h-60 overflow-y-auto custom-scrollbar"
      >
        {({ close }) => (
          <>
            <div className="p-2">
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar o crear materia..."
                className="!px-3 !py-2"
                autoFocus
              />
            </div>

            {filtered.map((s) => (
              <div key={s.id} className="group/item w-full flex items-center">
                <DropdownItem
                  active={s.id === value}
                  className="flex-1 min-w-0 !text-sm !py-2.5"
                  onClick={() => { onChange(s.id); setSearch(''); close() }}
                >
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: s.color_hex }} />
                  <span className="truncate">{s.name}</span>
                </DropdownItem>

                <div className="flex items-center gap-1.5 pr-2 shrink-0">
                  {s.id === value && <span style={{ color: 'var(--fg-primary)' }}>✓</span>}
                  {/* El borrado no debe seleccionar la materia ni cerrar el panel. */}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setPendingDelete(s) }}
                    className="opacity-0 group-hover/item:opacity-100 focus-visible:opacity-100 w-7 h-7 flex items-center justify-center hover:bg-priority-critica/20 transition-all cursor-pointer"
                    style={{ borderRadius: 'var(--ds-radius-sm)' }}
                    title="Eliminar materia"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-priority-critica)" strokeWidth="2" strokeLinecap="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}

            {canCreate && (
              <DropdownItem
                className="!text-sm !py-2.5"
                style={{ color: 'var(--color-terracotta)', borderTop: '1px solid rgba(var(--ink-rgb),.1)' }}
                onClick={async () => {
                  const newSubject = await createSubject(search.trim())
                  if (newSubject) {
                    onChange(newSubject.id)
                    setSearch('')
                    close()
                  }
                }}
              >
                + Crear "{search.trim()}"
              </DropdownItem>
            )}

            {filtered.length === 0 && !canCreate && (
              <p className="px-4 py-3 text-xs text-center italic" style={{ color: 'var(--fg-tertiary)' }}>
                No hay materias que coincidan
              </p>
            )}
          </>
        )}
      </Dropdown>

      <DeleteSubjectModal
        open={!!pendingDelete}
        subject={pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
      />
    </>
  )
}
