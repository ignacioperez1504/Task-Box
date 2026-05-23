import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useProgramStore } from '../../store/programStore'

const PRESET_COLORS = [
  '#C27A55', // Terracotta
  '#2E6B5E', // Forest Green
  '#C9A96E', // Warm Gold
  '#8B6F5E', // Warm Gray-Brown
  '#5E8B7A', // Muted Teal
  '#A5633F', // Rust
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
        className="fixed inset-0 z-[70] bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: '-50%', x: '-50%' }}
        animate={{ opacity: 1, scale: 1, y: '-50%', x: '-50%' }}
        exit={{ opacity: 0, scale: 0.95, y: '-45%', x: '-50%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="fixed top-1/2 left-1/2 z-[71] w-[500px] max-w-[92vw] glass-dark rounded-2xl p-6 md:p-8 flex flex-col shadow-elevated border border-beige/10 transform -translate-x-1/2 -translate-y-1/2"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 border-b border-beige/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-terracotta/20 flex items-center justify-center border border-terracotta/30">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C27A55" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
            <div>
              <h3 className="font-display text-2xl text-beige leading-none">
                {isEdit ? 'Editar Programa' : 'Nuevo Programa'}
              </h3>
              <p className="text-[11px] text-beige-dark font-mono uppercase tracking-widest mt-1">
                Workspace Académico
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-beige/10 transition-colors text-beige-dark hover:text-beige"
            title="Cerrar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs text-beige-dark uppercase tracking-widest block mb-2 font-medium">
              Nombre del Programa / Carrera
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Ingeniería de Sistemas"
              className="w-full bg-teal-darker/40 text-beige px-4 py-2.5 rounded-xl border border-beige/15 outline-none focus:border-terracotta transition-colors text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-beige-dark uppercase tracking-widest block mb-2 font-medium">
              Universidad / Institución
            </label>
            <input
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="Ej: Universidad Nacional"
              className="w-full bg-teal-darker/40 text-beige px-4 py-2.5 rounded-xl border border-beige/15 outline-none focus:border-terracotta transition-colors text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-beige-dark uppercase tracking-widest block mb-2 font-medium">
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
                    borderColor: colorHex === c ? '#white' : 'transparent',
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

          <div className="flex gap-3 border-t border-beige/10 pt-5 mt-6">
            {isEdit && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-3 text-sm text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/10 transition-colors disabled:opacity-50"
              >
                Eliminar
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 text-sm text-beige border border-beige/20 rounded-xl hover:bg-beige/10 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 py-3 bg-terracotta text-black font-semibold rounded-xl hover:bg-terracotta-light shadow-md transition-colors disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </motion.div>
    </>
  )
}
