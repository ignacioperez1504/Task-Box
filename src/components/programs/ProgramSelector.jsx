import { useState, useEffect } from 'react'
import { useProgramStore } from '../../store/programStore'
import ProgramModal from './ProgramModal'
import Dropdown, { DropdownItem } from '../ui/Dropdown'

export default function ProgramSelector() {
  const { programs, activeProgram, fetchPrograms, setActiveProgram } = useProgramStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProgram, setEditingProgram] = useState(null)

  useEffect(() => {
    fetchPrograms()
  }, [])

  return (
    <div className="px-3 mb-2">
      <div className="flex items-center gap-1.5 w-full">
        <Dropdown
          className="flex-1"
          variant="surface"
          trigger={
            <>
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: activeProgram?.color_hex || 'var(--color-terracotta)' }}
              />
              <span className="font-semibold truncate">
                {activeProgram ? activeProgram.name : 'Todos los programas'}
              </span>
            </>
          }
          panelClassName="max-h-[220px] overflow-y-auto custom-scrollbar py-1"
        >
          {({ close }) => (
            <>
              <DropdownItem
                active={!activeProgram}
                onClick={() => { setActiveProgram(null); close() }}
              >
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: 'var(--fg-tertiary)' }} />
                <span>Ver todos los programas</span>
                {!activeProgram && <span className="ml-auto">✓</span>}
              </DropdownItem>

              {programs.length > 0 && (
                <div className="h-px my-1" style={{ background: 'var(--divider-soft)' }} />
              )}

              {programs.map((prog) => {
                const active = activeProgram?.id === prog.id
                return (
                  <div
                    key={prog.id}
                    className="group/item w-full flex items-center"
                  >
                    <DropdownItem
                      active={active}
                      className="flex-1 min-w-0"
                      onClick={() => { setActiveProgram(prog.id); close() }}
                    >
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: prog.color_hex }} />
                      <div className="truncate">
                        <p className="truncate font-medium">{prog.name}</p>
                        {prog.institution && (
                          <p className="text-[9px] truncate font-normal mt-0.5" style={{ color: 'var(--fg-tertiary)' }}>
                            {prog.institution}
                          </p>
                        )}
                      </div>
                    </DropdownItem>

                    <div className="flex items-center gap-1.5 pr-3 shrink-0">
                      {active && <span style={{ color: 'var(--fg-primary)' }}>✓</span>}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingProgram(prog)
                          setIsModalOpen(true)
                          close()
                        }}
                        className="opacity-0 group-hover/item:opacity-100 p-1 transition-opacity cursor-pointer"
                        style={{ color: 'var(--fg-tertiary)' }}
                        title="Editar programa"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )
              })}

              {programs.length === 0 && (
                <p className="px-4 py-3 text-[10px] text-center italic" style={{ color: 'var(--fg-tertiary)' }}>
                  No hay programas creados
                </p>
              )}
            </>
          )}
        </Dropdown>

        {/* Quick Add */}
        <button
          onClick={() => { setEditingProgram(null); setIsModalOpen(true) }}
          className="p-2.5 hover-surface transition-colors cursor-pointer shrink-0"
          style={{
            borderRadius: 'var(--ds-radius-control)',
            background: 'var(--glass-bg)',
            color: 'var(--fg-secondary)',
            border: '1px solid var(--glass-border)',
          }}
          title="Agregar Programa Académico"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      <ProgramModal
        open={isModalOpen}
        program={editingProgram}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
