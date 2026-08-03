import { useState, useEffect } from 'react'
import { useProgramStore } from '../../store/programStore'
import Modal from '../ui/Modal'
import Field, { Label } from '../ui/Field'
import Button from '../ui/Button'

const PRESET_COLORS = [
  '#E8825B', // Terracotta
  '#4FAE8C', // Forest Green
  '#E8C468', // Warm Gold
  '#8B6F5E', // Warm Gray-Brown
  '#5E8B7A', // Muted Teal
  '#CB6B45', // Rust
  '#A78BFA', // Violet
  '#60A5FA', // Sky Blue
]

const PROGRAM_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
)

export default function ProgramModal({ open, program, onClose }) {
  const { createProgram, updateProgram, deleteProgram } = useProgramStore()
  const [name, setName] = useState('')
  const [institution, setInstitution] = useState('')
  const [colorHex, setColorHex] = useState(PRESET_COLORS[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const isEdit = !!program

  useEffect(() => {
    if (program) {
      setName(program.name || '')
      setInstitution(program.institution || '')
      setColorHex(program.color_hex || PRESET_COLORS[0])
    }
  }, [program])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    setError(null)
    try {
      if (isEdit) {
        await updateProgram(program.id, { name, institution, color_hex: colorHex })
      } else {
        await createProgram(name, institution, colorHex)
      }
      onClose()
    } catch (err) {
      console.error(err)
      setError('Ocurrió un error al guardar el programa académico.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!program) return
    if (!window.confirm(`¿Estás seguro de que deseas eliminar el programa "${program.name}"? Se perderá la vinculación de sus materias.`)) {
      return
    }

    setLoading(true)
    setError(null)
    try {
      const success = await deleteProgram(program.id)
      if (success) {
        onClose()
      } else {
        setError('No se pudo eliminar el programa académico.')
      }
    } catch (err) {
      console.error(err)
      setError('Ocurrió un error al eliminar el programa académico.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar Programa' : 'Nuevo Programa'}
      eyebrow="Workspace Académico"
      icon={PROGRAM_ICON}
      width={520}
      zIndex={70}
      footer={
        <>
          {isEdit && (
            <Button variant="danger-outline" disabled={loading} onClick={handleDelete}>
              Eliminar
            </Button>
          )}
          <Button variant="secondary" className="flex-1" disabled={loading} onClick={onClose}>
            Cancelar
          </Button>
          <Button className="flex-1" disabled={loading || !name.trim()} onClick={handleSubmit}>
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>
        </>
      }
    >
      {error && (
        <div
          className="p-3 text-xs mb-4"
          style={{
            background: 'rgba(225,82,82,.12)',
            border: '1px solid rgba(225,82,82,.25)',
            borderRadius: 'var(--ds-radius-control)',
            color: 'var(--color-priority-critica)',
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Field
          label="Nombre del Programa / Carrera"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Ingeniería de Sistemas"
        />

        <Field
          label="Universidad / Institución"
          type="text"
          value={institution}
          onChange={(e) => setInstitution(e.target.value)}
          placeholder="Ej: Universidad Nacional"
        />

        <div>
          <Label>Color Distintivo</Label>
          <div className="flex flex-wrap gap-2.5">
            {PRESET_COLORS.map((c) => {
              const active = colorHex === c
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColorHex(c)}
                  className="w-8 h-8 rounded-full border-2 transition-all cursor-pointer relative"
                  style={{
                    backgroundColor: c,
                    borderColor: active ? 'var(--fg-primary)' : 'transparent',
                    boxShadow: active ? `0 0 10px ${c}` : 'none',
                    transform: active ? 'scale(1.1)' : 'scale(1)',
                    transitionDuration: 'var(--ds-duration-base)',
                  }}
                >
                  {active && (
                    <span className="absolute inset-0 flex items-center justify-center text-[10px]" style={{ color: 'var(--fg-on-accent)' }}>
                      ✓
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </form>
    </Modal>
  )
}
