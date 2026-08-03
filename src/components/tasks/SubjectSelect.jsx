import { useState } from 'react'
import { useSubjectStore } from '../../store/subjectStore'
import Dropdown, { DropdownItem } from '../ui/Dropdown'
import { Input } from '../ui/Field'

export default function SubjectSelect({ value, onChange }) {
  const { subjects, createSubject } = useSubjectStore()
  const [search, setSearch] = useState('')

  const selected = subjects.find((s) => s.id === value)
  const filtered = subjects.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  )
  const canCreate = search.trim() && !subjects.some(
    (s) => s.name.toLowerCase() === search.toLowerCase()
  )

  return (
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
            <DropdownItem
              key={s.id}
              active={s.id === value}
              className="!text-sm !py-2.5"
              onClick={() => { onChange(s.id); setSearch(''); close() }}
            >
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: s.color_hex }} />
              <span className="truncate">{s.name}</span>
              {s.id === value && <span className="ml-auto">✓</span>}
            </DropdownItem>
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
  )
}
