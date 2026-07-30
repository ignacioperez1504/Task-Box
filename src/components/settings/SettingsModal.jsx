import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '../../store/uiStore'
import { saveConfig } from '../../lib/aiService'
import ContextProfile from './ContextProfile'

const TABS = [
  { id: 'api', label: 'API & Modelo' },
  { id: 'profile', label: 'Mi Perfil IA' },
]

export default function SettingsModal() {
  const { settingsOpen, closeSettings } = useUIStore()
  const [activeTab, setActiveTab] = useState('api')
  const [apiKey, setApiKey] = useState(localStorage.getItem('sf_api_key') || '')
  const [endpoint, setEndpoint] = useState(
    localStorage.getItem('sf_api_endpoint') || 'https://api.groq.com/openai/v1'
  )
  const [model, setModel] = useState(
    localStorage.getItem('sf_api_model') || 'llama-3.1-8b-instant'
  )
  const [saved, setSaved] = useState(false)

  const handleSaveApi = () => {
    saveConfig(apiKey, endpoint, model)
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      closeSettings()
    }, 1200)
  }

  return (
    <AnimatePresence>
      {settingsOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/40"
            onClick={closeSettings}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[61]
                       w-[500px] rounded-2xl flex flex-col max-h-[88vh]"
            style={{
              background: 'var(--glass-bg-strong)',
              border: '1px solid var(--glass-border)',
              backdropFilter: 'blur(var(--blur-glass-strong))',
              WebkitBackdropFilter: 'blur(var(--blur-glass-strong))',
              boxShadow: 'var(--shadow-elevated)',
            }}
          >
            {/* ── Header ────────────────────────────────────── */}
            <div className="px-8 pt-8 pb-5 shrink-0">
              <h2 className="font-display text-2xl mb-5" style={{ color: 'var(--fg-primary)' }}>Configuración</h2>

              {/* Tab switcher */}
              <div className="flex gap-1 rounded-xl p-1" style={{ background: 'rgba(var(--ink-rgb),.06)' }}>
                {TABS.map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={activeTab === id
                      ? { background: 'var(--color-terracotta)', color: '#FFF8F4' }
                      : { color: 'var(--fg-secondary)' }
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Scrollable content ────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-8 pb-8 min-h-0">
              <AnimatePresence mode="wait">
                {activeTab === 'api' ? (
                  <motion.div
                    key="api"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-5"
                  >
                    <div>
                      <label className="text-xs uppercase tracking-wider block mb-2" style={{ color: 'var(--fg-tertiary)' }}>
                        API Key de Gemini
                      </label>
                      <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="AIza..."
                        className="w-full px-4 py-3 rounded-xl outline-none focus:border-terracotta transition-colors text-sm"
                        style={{ background: 'rgba(var(--ink-rgb),.05)', color: 'var(--fg-primary)', border: '1px solid rgba(var(--ink-rgb),.15)' }}
                      />
                    </div>

                    <div>
                      <label className="text-xs uppercase tracking-wider block mb-2" style={{ color: 'var(--fg-tertiary)' }}>
                        Endpoint Base
                      </label>
                      <input
                        type="text"
                        value={endpoint}
                        onChange={(e) => setEndpoint(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl outline-none focus:border-terracotta transition-colors text-sm"
                        style={{ background: 'rgba(var(--ink-rgb),.05)', color: 'var(--fg-primary)', border: '1px solid rgba(var(--ink-rgb),.15)' }}
                      />
                    </div>

                    <div>
                      <label className="text-xs uppercase tracking-wider block mb-2" style={{ color: 'var(--fg-tertiary)' }}>
                        Modelo
                      </label>
                      <input
                        type="text"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl outline-none focus:border-terracotta transition-colors text-sm"
                        style={{ background: 'rgba(var(--ink-rgb),.05)', color: 'var(--fg-primary)', border: '1px solid rgba(var(--ink-rgb),.15)' }}
                      />
                    </div>

                    <div className="flex gap-3 pt-3">
                      <button
                        onClick={handleSaveApi}
                        className="flex-1 bg-terracotta font-medium py-3 rounded-xl hover:bg-terracotta-light transition-colors text-sm"
                        style={{ color: '#FFF8F4' }}
                      >
                        {saved ? '✓ Guardado' : 'Guardar configuración'}
                      </button>
                      <button
                        onClick={closeSettings}
                        className="px-6 py-3 text-sm rounded-xl hover-surface transition-colors"
                        style={{ color: 'var(--fg-primary)', border: '1px solid var(--glass-border)' }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.15 }}
                  >
                    <ContextProfile onCancel={closeSettings} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
