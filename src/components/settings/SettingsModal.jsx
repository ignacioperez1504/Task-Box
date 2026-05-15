import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '../../store/uiStore'
import { saveConfig } from '../../lib/aiService'

export default function SettingsModal() {
  const { settingsOpen, closeSettings } = useUIStore()
  const [apiKey, setApiKey] = useState(localStorage.getItem('sf_api_key') || '')
  const [endpoint, setEndpoint] = useState(localStorage.getItem('sf_api_endpoint') || 'https://generativelanguage.googleapis.com/v1beta')
  const [model, setModel] = useState(localStorage.getItem('sf_api_model') || 'gemini-2.0-flash')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50"
            onClick={closeSettings}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[61] w-[480px] glass-dark rounded-2xl p-8"
          >
            <h2 className="font-display text-2xl text-beige mb-6">Configuración</h2>

            <div className="space-y-5">
              <div>
                <label className="text-xs text-beige-dark uppercase tracking-wider block mb-2">API Key de Gemini</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIza..."
                  className="w-full bg-teal-darker/60 text-beige px-4 py-3 rounded-xl border border-beige/15 outline-none focus:border-terracotta transition-colors text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-beige-dark uppercase tracking-wider block mb-2">Endpoint Base</label>
                <input
                  type="text"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  className="w-full bg-teal-darker/60 text-beige px-4 py-3 rounded-xl border border-beige/15 outline-none focus:border-terracotta transition-colors text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-beige-dark uppercase tracking-wider block mb-2">Modelo</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-teal-darker/60 text-beige px-4 py-3 rounded-xl border border-beige/15 outline-none focus:border-terracotta transition-colors text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={handleSave}
                className="flex-1 bg-terracotta text-black font-medium py-3 rounded-xl hover:bg-terracotta-light transition-colors text-sm"
              >
                {saved ? '✓ Guardado' : 'Guardar configuración'}
              </button>
              <button
                onClick={closeSettings}
                className="px-6 py-3 text-sm text-beige border border-beige/20 rounded-xl hover:bg-beige/10 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
