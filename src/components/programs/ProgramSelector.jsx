import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProgramStore } from '../../store/programStore'
import ProgramModal from './ProgramModal'

export default function ProgramSelector() {
  const { programs, activeProgram, fetchPrograms, setActiveProgram } = useProgramStore()
  const [isOpen, setIsOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProgram, setEditingProgram] = useState(null)
  const containerRef = useRef(null)

  useEffect(() => {
    fetchPrograms()
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const handleSelect = (id) => {
    setActiveProgram(id)
    setIsOpen(false)
  }

  const handleOpenCreateModal = (e) => {
    e.stopPropagation()
    setEditingProgram(null)
    setIsModalOpen(true)
    setIsOpen(false)
  }

  const handleOpenEditModal = (e, prog) => {
    e.stopPropagation()
    setEditingProgram(prog)
    setIsModalOpen(true)
    setIsOpen(false)
  }

  return (
    <div className="relative px-3 mb-2" ref={containerRef}>
      {/* Selector Trigger Button */}
      <div className="flex items-center gap-1.5 w-full">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex-1 flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-300 bg-white/5 hover:bg-white/10 text-beige border border-beige/10 shadow-sm cursor-pointer"
        >
          <div className="flex items-center gap-2.5 truncate">
            <div 
              className="w-2.5 h-2.5 rounded-full shrink-0" 
              style={{ backgroundColor: activeProgram?.color_hex || '#C27A55' }}
            />
            <span className="font-semibold truncate">
              {activeProgram ? activeProgram.name : 'Todos los programas'}
            </span>
          </div>
          <svg 
            width="14" 
            height="14" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5"
            className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {/* Quick Add Button */}
        <button
          onClick={handleOpenCreateModal}
          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-beige-dark hover:text-beige border border-beige/10 transition-colors cursor-pointer"
          title="Agregar Programa Académico"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-3 right-3 z-50 mt-1.5 glass-dark rounded-xl border border-beige/10 shadow-elevated py-1 max-h-[220px] overflow-y-auto custom-scrollbar"
          >
            {/* View All Option */}
            <button
              onClick={() => handleSelect(null)}
              className={`w-full flex items-center justify-between px-4 py-2 text-xs transition-colors hover:bg-white/5 ${
                !activeProgram ? 'text-white font-semibold' : 'text-beige-dark'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-beige" />
                <span>Ver todos los programas</span>
              </div>
              {!activeProgram && <span>✓</span>}
            </button>

            {programs.length > 0 && <div className="h-px bg-beige/10 my-1" />}

            {/* Program List */}
            {programs.map((prog) => (
              <div
                key={prog.id}
                className={`group/item w-full flex items-center justify-between px-4 py-2 text-xs transition-colors hover:bg-white/5 ${
                  activeProgram?.id === prog.id ? 'text-white font-semibold' : 'text-beige-dark'
                }`}
              >
                <button
                  onClick={() => handleSelect(prog.id)}
                  className="flex-1 flex items-center gap-2 truncate text-left cursor-pointer"
                >
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: prog.color_hex }} />
                  <div className="truncate">
                    <p className="truncate font-medium">{prog.name}</p>
                    {prog.institution && (
                      <p className="text-[9px] text-beige-dark/50 truncate font-normal mt-0.5">
                        {prog.institution}
                      </p>
                    )}
                  </div>
                </button>
                <div className="flex items-center gap-1.5 pl-2">
                  {activeProgram?.id === prog.id && <span className="text-white">✓</span>}
                  <button
                    onClick={(e) => handleOpenEditModal(e, prog)}
                    className="opacity-0 group-hover/item:opacity-100 p-1 hover:text-beige transition-opacity cursor-pointer text-beige-dark"
                    title="Editar programa"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}

            {programs.length === 0 && (
              <p className="px-4 py-3 text-[10px] text-beige-dark/50 text-center italic">
                No hay programas creados
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Program Create/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <ProgramModal
            program={editingProgram}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
