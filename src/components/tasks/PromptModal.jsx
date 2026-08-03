import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { generateTaskPrompt } from '../../lib/aiService'
import { useAcademicStore } from '../../store/academicStore'
import { useSubjectStore } from '../../store/subjectStore'
import Modal from '../ui/Modal'
import Button from '../ui/Button'

const FORGE_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
)

export default function PromptModal({ open = true, task, onClose }) {
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
  }

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
    <Modal
      open={open}
      onClose={onClose}
      title="Copilot Forger"
      eyebrow="Generador de Prompt Experto"
      icon={FORGE_ICON}
      width={620}
      zIndex={70}
      footer={!loading && !error ? (
        <>
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cerrar
          </Button>
          <Button
            variant={copied ? 'success' : 'primary'}
            className="flex-[2]"
            onClick={handleCopy}
            style={copied ? { boxShadow: '0 0 15px rgba(79,174,140,0.35)' } : undefined}
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
          </Button>
        </>
      ) : null}
    >
      <div className="min-h-[220px] flex flex-col justify-center">
        {loading && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="relative w-16 h-16 mb-4">
              <motion.div
                animate={{ rotate: [0, -30, 0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 flex items-center justify-center text-3xl"
              >
                🔨
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-full border-2 border-dashed border-terracotta"
              />
            </div>
            <h4 className="font-display text-lg mb-1" style={{ color: 'var(--fg-primary)' }}>Forjando prompt experto...</h4>
            <p className="text-xs max-w-sm" style={{ color: 'var(--fg-secondary)' }}>
              Groq está destilando la rúbrica, definiendo el rol ideal y preparando las instrucciones de nivel académico.
            </p>
          </div>
        )}

        {error && (
          <div className="py-4 text-center">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(225,82,82,.15)', border: '1px solid rgba(225,82,82,.3)' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-priority-critica)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <h4 className="font-display text-lg mb-2" style={{ color: 'var(--fg-primary)' }}>Error al forjar prompt</h4>
            <div
              className="ds-technical p-4 mb-4 text-xs text-left max-h-[140px] overflow-y-auto custom-scrollbar"
              style={{
                background: 'rgba(var(--ink-rgb),.05)',
                border: '1px solid rgba(225,82,82,.2)',
                borderRadius: 'var(--ds-radius-control)',
                color: 'var(--color-priority-critica)',
              }}
            >
              {error}
            </div>
            <div className="flex gap-3 justify-center">
              <Button variant="secondary" size="sm" onClick={onClose}>Cerrar</Button>
              <Button size="sm" onClick={handleGenerate}>Reintentar</Button>
            </div>
          </div>
        )}

        {!loading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col h-full"
          >
            <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--fg-secondary)' }}>
              ¡Prompt generado con éxito! Copia el contenido a continuación y pégalo directamente en tu IA externa favorita (Claude, ChatGPT, Gemini, etc.).
            </p>

            <div className="relative flex-1 group">
              <textarea
                ref={textareaRef}
                readOnly
                value={promptText}
                className="ds-technical w-full h-[280px] p-4 text-xs leading-relaxed resize-none focus:outline-none focus:border-terracotta overflow-y-auto custom-scrollbar select-all"
                style={{
                  background: 'rgba(var(--ink-rgb),.05)',
                  border: '1px solid rgba(var(--ink-rgb),.15)',
                  borderRadius: 'var(--ds-radius-control)',
                  color: 'var(--fg-primary)',
                }}
                placeholder="Aquí aparecerá el prompt generado..."
              />
              <div
                className="ds-technical absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-[10px] px-2 py-1"
                style={{
                  background: 'rgba(var(--ink-rgb),.12)',
                  borderRadius: 'var(--ds-radius-sm)',
                  color: 'var(--fg-secondary)',
                }}
              >
                {promptText.length} caract.
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </Modal>
  )
}
