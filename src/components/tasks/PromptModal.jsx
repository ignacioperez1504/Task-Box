import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { generateTaskPrompt } from '../../lib/aiService'
import { useAcademicStore } from '../../store/academicStore'
import { useSubjectStore } from '../../store/subjectStore'

export default function PromptModal({ task, onClose }) {
  const [loading, setLoading] = useState(true)
  const [promptText, setPromptText] = useState('')
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const textareaRef = useRef(null)

  const { calculateCurrentGrade, getSubjectData, getTaskWeight, getTaskScore } = useAcademicStore()
  const { getSubjectById } = useSubjectStore()

  // Retrieve academic context to provide to the AI
  const subject = getSubjectById(task.subject_id)
  const subjectName = subject ? subject.name : 'la materia correspondiente'

  const academicData = calculateCurrentGrade(task.subject_id)
  const subjectData = getSubjectData(task.subject_id)
  const taskWeight = getTaskWeight(task.id)
  const taskScore = getTaskScore(task.id)

  const academicContext = {
    subjectName,
    currentGrade: academicData?.average,
    credits: subjectData?.credits,
    taskWeight,
    taskScore
  }

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    try {
      const generated = await generateTaskPrompt(task, academicContext)
      setPromptText(generated)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Error desconocido al conectar con Groq.')
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    handleGenerate()
  }, [task.id])

  const handleCopy = async () => {
    if (!promptText) return
    try {
      await navigator.clipboard.writeText(promptText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Error al copiar al portapapeles:', err)
      if (textareaRef.current) {
        textareaRef.current.select()
        document.execCommand('copy')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
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
        initial={{ opacity: 0, scale: 0.95, y: 30, x: '-50%', y: '-50%' }}
        animate={{ opacity: 1, scale: 1, y: '-50%', x: '-50%' }}
        exit={{ opacity: 0, scale: 0.95, y: 10, x: '-50%', y: '-50%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="fixed top-1/2 left-1/2 z-[71] w-[620px] max-w-[92vw] glass-dark rounded-2xl p-6 md:p-8 flex flex-col max-h-[85vh] shadow-elevated border border-beige/10"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5 border-b border-beige/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-terracotta/20 flex items-center justify-center border border-terracotta/30">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C27A55" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>
            <div>
              <h3 className="font-display text-2xl text-beige leading-none">Copilot Forger</h3>
              <p className="text-[11px] text-beige-dark font-mono uppercase tracking-widest mt-1">Generador de Prompt Experto</p>
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

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto mb-6 pr-1 custom-scrollbar min-h-[220px] flex flex-col justify-center">
          {loading && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="relative w-16 h-16 mb-4">
                {/* Forge Hammer Animation */}
                <motion.div
                  animate={{ rotate: [0, -30, 0, 10, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 flex items-center justify-center text-3xl"
                >
                  🔨
                </motion.div>
                {/* Glowing Outer Rings */}
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 rounded-full border-2 border-dashed border-terracotta"
                />
              </div>
              <h4 className="font-display text-lg text-beige mb-1">Forjando prompt experto...</h4>
              <p className="text-xs text-beige-dark max-w-sm">
                Groq está destilando la rúbrica, definiendo el rol ideal y preparando las instrucciones de nivel académico.
              </p>
            </div>
          )}

          {error && (
            <div className="py-4 text-center">
              <div className="w-14 h-14 rounded-full bg-priority-critica/20 flex items-center justify-center mx-auto mb-4 border border-priority-critica/30">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8B2E2E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <h4 className="font-display text-lg text-beige mb-2">Error al forjar prompt</h4>
              <div className="bg-black/30 border border-priority-critica/20 rounded-xl p-4 mb-4 text-xs text-priority-critica font-mono text-left max-h-[140px] overflow-y-auto">
                {error}
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 text-xs text-beige border border-beige/20 rounded-lg hover:bg-beige/10 transition-colors"
                >
                  Cerrar
                </button>
                <button
                  onClick={handleGenerate}
                  className="px-5 py-2.5 text-xs bg-terracotta text-black font-semibold rounded-lg hover:bg-terracotta-light transition-colors"
                >
                  Reintentar
                </button>
              </div>
            </div>
          )}

          {!loading && !error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col h-full"
            >
              <div className="mb-3">
                <p className="text-xs text-beige-dark leading-relaxed">
                  ¡Prompt generado con éxito! Copia el contenido a continuación y pégalo directamente en tu IA externa favorita (Claude, ChatGPT, Gemini, etc.).
                </p>
              </div>

              <div className="relative flex-1 group">
                <textarea
                  ref={textareaRef}
                  readOnly
                  value={promptText}
                  className="w-full h-[280px] bg-black/45 border border-beige/10 rounded-xl p-4 text-xs text-beige font-mono leading-relaxed resize-none focus:outline-none focus:border-terracotta/40 overflow-y-auto custom-scrollbar select-all"
                  placeholder="Aquí aparecerá el prompt generado..."
                />
                <div className="absolute right-3 bottom-3 opacity-30 group-hover:opacity-85 transition-opacity pointer-events-none text-[10px] text-beige-dark font-mono bg-black/60 px-2 py-1 rounded">
                  {promptText.length} caract.
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer Actions */}
        {!loading && !error && (
          <div className="flex gap-3 border-t border-beige/10 pt-4 mt-auto">
            <button
              onClick={onClose}
              className="flex-1 py-3 text-sm text-beige border border-beige/20 rounded-xl hover:bg-beige/10 transition-colors duration-200"
            >
              Cerrar
            </button>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleCopy}
              className={`flex-2 py-3 px-6 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                copied
                  ? 'bg-teal-light text-beige shadow-[0_0_15px_rgba(46,107,94,0.3)]'
                  : 'bg-terracotta text-black hover:bg-terracotta-light shadow-md'
              }`}
            >
              {copied ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>¡Copiado con éxito!</span>
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  <span>Copiar al portapapeles</span>
                </>
              )}
            </motion.button>
          </div>
        )}
      </motion.div>
    </>
  )
}
