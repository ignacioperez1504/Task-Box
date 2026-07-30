import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useProgramStore } from '../../store/programStore'

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

export default function ProgramModal({ program, onClose }) {
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
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: '-50%', x: '-50%' }}
        animate={{ opacity: 1, scale: 1, y: '-50%', x: '-50%' }}
        exit={{ opacity: 0, scale: 0.95, y: '-45%', x: '-50%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="fixed top-1/2 left-1/2 z-[71] w-[500px] max-w-[92vw] rounded-2xl p-6 md:p-8 flex flex-col transform -translate-x-1/2 -translate-y-1/2"
        style={{
          background: 'var(--glass-bg-strong)',
          border: '1px solid var(--glass-border)',
          backdropFilter: 'blur(var(--blur-glass-strong))',
          WebkitBackdropFilter: 'blur(var(--blur-glass-strong))',
          boxShadow: 'var(--shadow-elevated)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4" style={{ borderBottom: '1px solid var(--divider-soft)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-terracotta/20 flex items-center justify-center border border-terracotta/30">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8825B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
            <div>
              <h3 className="font-display text-2xl leading-none" style={{ color: 'var(--fg-primary)' }}>
                {isEdit ? 'Editar Programa' : 'Nuevo Programa'}
              </h3>
              <p className="text-[11px] font-mono uppercase tracking-widest mt-1" style={{ color: 'var(--fg-tertiary)' }}>
                Workspace Académico
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover-surface transition-colors"
            style={{ color: 'var(--fg-secondary)' }}
            title="Cerrar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl text-xs mb-4" style={{ background: 'rgba(225,82,82,.12)', border: '1px solid rgba(225,82,82,.25)', color: '#C23B3B' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs uppercase tracking-widest block mb-2 font-medium" style={{ color: 'var(--fg-tertiary)' }}>
              Nombre del Programa / Carrera
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Ingeniería de Sistemas"
              className="w-full px-4 py-2.5 rounded-xl outline-none focus:border-terracotta transition-colors text-sm"
              style={{ background: 'rgba(var(--ink-rgb),.05)', color: 'var(--fg-primary)', border: '1px solid rgba(var(--ink-rgb),.15)' }}
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest block mb-2 font-medium" style={{ color: 'var(--fg-tertiary)' }}>
              Universidad / Institución
            </label>
            <input
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="Ej: Universidad Nacional"
              className="w-full px-4 py-2.5 rounded-xl outline-none focus:border-terracotta transition-colors text-sm"
              style={{ background: 'rgba(var(--ink-rgb),.05)', color: 'var(--fg-primary)', border: '1px solid rgba(var(--ink-rgb),.15)' }}
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest block mb-2 font-medium" style={{ color: 'var(--fg-tertiary)' }}>
              Color Distintivo
            </label>
            <div className="flex flex-wrap gap-2.5">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColorHex(c)}
                  className="w-8 h-8 rounded-full border-2 transition-all cursor-pointer relative"
                  style={{
                    backgroundColor: c,
                    borderColor: colorHex === c ? 'var(--fg-primary)' : 'transparent',
                    boxShadow: colorHex === c ? `0 0 10px ${c}` : 'none',
                    transform: colorHex === c ? 'scale(1.1)' : 'scale(1)'
                  }}
                >
                  {colorHex === c && (
                    <span className="absolute inset-0 flex items-center justify-center text-white text-[10px]">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-5 mt-6" style={{ borderTop: '1px solid var(--divider-soft)' }}>
            {isEdit && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-3 text-sm rounded-xl transition-colors disabled:opacity-50"
                style={{ color: '#C23B3B', border: '1px solid rgba(225,82,82,.3)' }}
              >
                Eliminar
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 text-sm rounded-xl hover-surface transition-colors"
              style={{ color: 'var(--fg-primary)', border: '1px solid var(--glass-border)' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 py-3 bg-terracotta font-semibold rounded-xl hover:bg-terracotta-light shadow-md transition-colors disabled:opacity-50"
              style={{ color: '#FFF8F4' }}
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </motion.div>
    </>
  )
}
