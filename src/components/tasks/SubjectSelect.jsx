import { useState, useRef, useEffect } from 'react'
import { useSubjectStore } from '../../store/subjectStore'

export default function SubjectSelect({ value, onChange }) {
  const { subjects, createSubject } = useSubjectStore()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef(null)

  const selected = subjects.find((s) => s.id === value)
  const filtered = subjects.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  )
  const canCreate = search.trim() && !subjects.some(
    (s) => s.name.toLowerCase() === search.toLowerCase()
  )

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleCreate = async () => {
    const newSubject = await createSubject(search.trim())
    if (newSubject) {
      onChange(newSubject.id)
      setSearch('')
      setOpen(false)
    }
  }

  return (
    <div ref={ref} className="relative">
      <label className="text-xs uppercase tracking-wider block mb-2" style={{ color: 'var(--fg-tertiary)' }}>
        Materia
      </label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full text-left px-4 py-3 rounded-xl text-sm transition-colors focus:border-terracotta flex items-center gap-2"
        style={{ border: '1px solid rgba(var(--ink-rgb),.15)', background: 'rgba(var(--ink-rgb),.05)', color: selected ? 'var(--fg-primary)' : 'var(--fg-tertiary)' }}
      >
        {selected && (
          <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: selected.color_hex }} />
        )}
        {selected?.name || 'Selecciona una materia'}
      </button>

      {open && (
        <div
          className="absolute top-full left-0 right-0 mt-1 z-30 rounded-xl overflow-hidden max-h-60 overflow-y-auto"
          style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', backdropFilter: 'blur(var(--blur-glass))', WebkitBackdropFilter: 'blur(var(--blur-glass))', boxShadow: 'var(--shadow-card), var(--shadow-inset-highlight)' }}
        >
          <div className="p-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar o crear materia..."
              className="w-full text-sm px-3 py-2 rounded-lg outline-none transition-colors focus:border-terracotta"
              style={{ background: 'rgba(var(--ink-rgb),.06)', color: 'var(--fg-primary)', border: '1px solid rgba(var(--ink-rgb),.12)' }}
              autoFocus
            />
          </div>

          {filtered.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => { onChange(s.id); setSearch(''); setOpen(false) }}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-terracotta/15 transition-colors flex items-center gap-2"
              style={{ color: 'var(--fg-primary)' }}
            >
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color_hex }} />
              {s.name}
            </button>
          ))}

          {canCreate && (
            <button
              type="button"
              onClick={handleCreate}
              className="w-full text-left px-4 py-2.5 text-sm text-terracotta hover:bg-terracotta/15 transition-colors"
              style={{ borderTop: '1px solid rgba(var(--ink-rgb),.1)' }}
            >
              + Crear "{search.trim()}"
            </button>
          )}
        </div>
      )}
    </div>
  )
}
