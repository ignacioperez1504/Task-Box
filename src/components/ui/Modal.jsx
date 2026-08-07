import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassLayers, glassSurfaceVariants } from './GlassSurface'

// Modal único de la app. Antes cada modal repetía su propio backdrop, su propia
// superficie de vidrio y su propio header: SettingsModal no tenía bloque de
// icono ni divisores, mientras ProgramModal y PromptModal sí. Aquí el chrome es
// el mismo para todos y solo cambia el contenido.
export default function Modal({
  open,
  onClose,
  title,
  eyebrow,
  icon,
  width = 500,
  zIndex = 60,
  headerExtra,          // p. ej. el selector de pestañas de Configuración
  footer,
  scrollable = false,   // el cuerpo scrollea y el header/footer quedan fijos
  children,
}) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  const hasHeader = !!(title || icon || headerExtra)

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 backdrop-blur-sm"
            style={{ zIndex, background: 'rgba(6,11,18,.45)' }}
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col max-h-[88vh] ${glassSurfaceVariants(
              { elevation: 'raised', radius: 'lg' }
            )}`}
            style={{
              zIndex: zIndex + 1,
              width,
              maxWidth: '92vw',
            }}
          >
            <GlassLayers />

            {hasHeader && (
              <div
                className="px-8 pt-7 pb-5 shrink-0"
                style={{ borderBottom: '1px solid var(--divider-soft)' }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {icon && (
                      <div
                        className="w-10 h-10 flex items-center justify-center shrink-0"
                        style={{
                          borderRadius: 'var(--ds-radius-control)',
                          background: 'rgba(232,130,91,.2)',
                          border: '1px solid rgba(232,130,91,.3)',
                          color: 'var(--color-terracotta)',
                        }}
                      >
                        {icon}
                      </div>
                    )}
                    <div className="min-w-0">
                      {title && (
                        <h3
                          className="font-display text-2xl leading-none truncate"
                          style={{ color: 'var(--fg-primary)' }}
                        >
                          {title}
                        </h3>
                      )}
                      {eyebrow && <p className="ds-label mt-1.5">{eyebrow}</p>}
                    </div>
                  </div>

                  <button
                    onClick={onClose}
                    title="Cerrar"
                    className="w-8 h-8 flex items-center justify-center hover-surface transition-colors shrink-0 cursor-pointer"
                    style={{ borderRadius: 'var(--ds-radius-sm)', color: 'var(--fg-secondary)' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                {headerExtra && <div className="mt-5">{headerExtra}</div>}
              </div>
            )}

            <div
              className={`px-8 ${hasHeader ? 'py-6' : 'py-8'} ${
                scrollable ? 'flex-1 overflow-y-auto custom-scrollbar min-h-0' : ''
              }`}
            >
              {children}
            </div>

            {footer && (
              <div
                className="flex gap-3 px-8 py-5 shrink-0"
                style={{ borderTop: '1px solid var(--divider-soft)' }}
              >
                {footer}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
