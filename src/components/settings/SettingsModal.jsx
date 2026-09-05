import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '../../store/uiStore'
import { saveConfig } from '../../lib/aiService'
import ContextProfile from './ContextProfile'
import EmailAccountsSettings from './EmailAccountsSettings'
import Modal from '../ui/Modal'
import SegmentedTabs from '../ui/SegmentedTabs'
import Field from '../ui/Field'
import Button from '../ui/Button'

const TABS = [
  { value: 'api', label: 'API & Modelo' },
  { value: 'profile', label: 'Mi Perfil IA' },
  { value: 'email', label: 'Correo' },
]

const SETTINGS_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
)

// Cada pestaña entra con el mismo desplazamiento lateral; el sentido depende de
// si avanzás o retrocedés en la fila de tabs.
const tabTransition = { duration: 0.18, ease: [0.16, 1, 0.3, 1] }

export default function SettingsModal() {
  const { settingsOpen, closeSettings } = useUIStore()
  const [activeTab, setActiveTab] = useState('api')
  const [apiKey, setApiKey] = useState(localStorage.getItem('sf_api_key') || '')
  const [endpoint, setEndpoint] = useState(
    localStorage.getItem('sf_api_endpoint') || 'https://api.groq.com/openai/v1'
  )
  const [model, setModel] = useState(
    localStorage.getItem('sf_api_model') || 'openai/gpt-oss-20b'
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
    <Modal
      open={settingsOpen}
      onClose={closeSettings}
      title="Configuración"
      eyebrow="Preferencias de UneedT"
      icon={SETTINGS_ICON}
      width={540}
      scrollable
      headerExtra={
        <SegmentedTabs options={TABS} value={activeTab} onChange={setActiveTab} />
      }
    >
      <AnimatePresence mode="wait">
        {activeTab === 'api' ? (
          <motion.div
            key="api"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={tabTransition}
            className="space-y-5"
          >
            <Field
              label="API Key de Gemini"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIza..."
            />

            <Field
              label="Endpoint Base"
              type="text"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
            />

            <Field
              label="Modelo"
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />

            <div className="flex gap-3 pt-2">
              <Button onClick={handleSaveApi} className="flex-1">
                {saved ? '✓ Guardado' : 'Guardar configuración'}
              </Button>
              <Button variant="secondary" onClick={closeSettings}>
                Cancelar
              </Button>
            </div>
          </motion.div>
        ) : activeTab === 'profile' ? (
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={tabTransition}
          >
            <ContextProfile onCancel={closeSettings} />
          </motion.div>
        ) : (
          <motion.div
            key="email"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={tabTransition}
          >
            <EmailAccountsSettings />
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  )
}
