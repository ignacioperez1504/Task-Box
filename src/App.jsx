import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTaskStore } from './store/taskStore'
import { useGoalStore } from './store/goalStore'
import { useSubjectStore } from './store/subjectStore'
import { useUIStore } from './store/uiStore'
import { requestNotificationPermission, checkUpcomingTasks } from './lib/notifications'

// Components
import Sidebar from './components/layout/Sidebar'
import RightPanel from './components/layout/RightPanel'
import FAB from './components/layout/FAB'
import SettingsModal from './components/settings/SettingsModal'
import DeleteModal from './components/tasks/DeleteModal'
import Calendar from './components/calendar/Calendar'
import DayTasksView from './components/calendar/DayTasksView'
import TaskList from './components/tasks/TaskList'
import AcademicModule from './components/academic/AcademicModule'
import HabitModule from './components/habits/HabitModule'
import ReminderModule from './components/reminders/ReminderModule'
import CustomCursor from './components/ui/CustomCursor'
import Button from './components/ui/Button'

export default function App() {
  const { fetchTasks, subscribeToChanges: subscribeTasks, tasks } = useTaskStore()
  const { fetchGoals, subscribeToChanges: subscribeGoals, recalculateGoals } = useGoalStore()
  const { fetchSubjects } = useSubjectStore()
  const { activeSection, apiKeyWarning, hideApiKeyWarning, openSettings } = useUIStore()

  const [isReady, setIsReady] = useState(false)

  // Initialization
  useEffect(() => {
    const initApp = async () => {
      // 1. Fetch initial data
      await Promise.all([
        fetchSubjects(),
        fetchTasks(),
        fetchGoals(),
      ])

      // 2. Setup Realtime subscriptions
      const unsubTasks = subscribeTasks()
      const unsubGoals = subscribeGoals()

      // 3. Setup notifications and check for upcoming deadlines
      const hasPermission = await requestNotificationPermission()
      if (hasPermission) {
        checkUpcomingTasks(useTaskStore.getState().tasks)
      }

      // 4. Register Service Worker
      if ('serviceWorker' in navigator) {
        try {
          await navigator.serviceWorker.register('/sw.js')
        } catch (error) {
          console.warn('Service Worker registration failed:', error)
        }
      }

      setIsReady(true)

      return () => {
        unsubTasks()
        unsubGoals()
      }
    }

    initApp()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Recalculate goals when tasks change
  useEffect(() => {
    if (isReady) {
      recalculateGoals(tasks)
    }
  }, [tasks, isReady, recalculateGoals])

  if (!isReady) {
    return (
      <div
        className="h-screen w-screen flex flex-col items-center justify-center"
        style={{ background: 'var(--bg-app)' }}
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-16 h-16 rounded-full bg-terracotta/20 flex items-center justify-center mb-6"
        >
          <div className="w-8 h-8 rounded-full bg-terracotta" />
        </motion.div>
        <h1
          className="font-display mb-2"
          style={{ fontSize: 'var(--text-display-lg)', letterSpacing: '.08em', color: 'var(--fg-primary)' }}
        >
          <span className="text-terracotta">U</span>need<span className="text-terracotta">T</span>
        </h1>
        <p className="ds-technical text-sm animate-pulse" style={{ color: 'var(--fg-tertiary)' }}>
          Inicializando...
        </p>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen flex overflow-hidden" style={{ background: 'var(--bg-app)', color: 'var(--fg-primary)' }}>
      <CustomCursor />
      {/* Modals & Overlays */}
      <DeleteModal />
      <SettingsModal />
      
      {/* API Key Warning Toast */}
      <AnimatePresence>
        {apiKeyWarning && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-6 left-1/2 z-[100] glass-strong px-6 py-4 flex items-center gap-4"
            style={{ borderRadius: 'var(--ds-radius-md)', borderColor: 'rgba(232,130,91,.35)' }}
          >
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--fg-primary)' }}>API Key necesaria</p>
              <p className="text-xs" style={{ color: 'var(--fg-secondary)' }}>Para clasificar tareas con IA, configura tu llave de Gemini.</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => { hideApiKeyWarning(); openSettings() }}>
                Configurar
              </Button>
              <Button size="sm" variant="secondary" onClick={hideApiKeyWarning}>
                Cerrar
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Layout - 3 Columns */}
      <Sidebar />
      
      <main className="flex-1 relative flex flex-col min-w-0">
        {/* Dynamic Center Panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex-1 h-full w-full relative"
          >
            {activeSection === 'calendar' && <Calendar />}
            {activeSection === 'tasks' && <TaskList />}
            {activeSection === 'dayTasks' && <DayTasksView />}
            {activeSection === 'academic' && <AcademicModule />}
            {activeSection === 'habits' && <HabitModule />}
            {activeSection === 'reminders' && <ReminderModule />}
          </motion.div>
        </AnimatePresence>

        <FAB />
      </main>
      
      {/* Slide-in Right Panel */}
      <RightPanel />
    </div>
  )
}
