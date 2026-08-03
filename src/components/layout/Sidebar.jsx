import { useState, useEffect } from 'react'
import { useUIStore } from '../../store/uiStore'
import { useTaskStore } from '../../store/taskStore'
import ProgramSelector from '../programs/ProgramSelector'
import GoalList from '../goals/GoalList'
import SubjectDistribution from '../stats/SubjectDistribution'
import GlassCard from '../ui/GlassCard'
import ProgressRing from '../ui/ProgressRing'
import ThemeToggle from '../ui/ThemeToggle'

const NAV_ITEMS = [
  {
    id: 'calendar',
    label: 'Calendario',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    id: 'tasks',
    label: 'Tareas',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    id: 'academic',
    label: 'Notas Académicas',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
  },
  {
    id: 'habits',
    label: 'Hábitos',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
  {
    id: 'reminders',
    label: 'Recordatorios',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
  },
]

const DAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

// Hex literals (not var()) so the alpha-suffix trick below is reliable
// regardless of color-mix() browser support.
function loadColor(n) {
  if (!n) return '#3F6180'
  if (n === 1) return '#4A90E2'
  if (n <= 3) return '#4FAE8C'
  if (n <= 5) return '#E8825B'
  return '#E15252'
}

function NavRow({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 14px', borderRadius: 'var(--ds-radius-md)', cursor: 'pointer',
        background: active ? 'var(--glass-bg-strong)' : 'var(--nav-inactive-bg)',
        border: '1px solid var(--glass-border)',
        backdropFilter: 'blur(var(--blur-glass))', WebkitBackdropFilter: 'blur(var(--blur-glass))', transform: 'translateZ(0)',
        boxShadow: active ? 'var(--shadow-card), var(--shadow-inset-highlight)' : 'var(--shadow-inset-highlight)',
        fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: active ? 600 : 500,
        color: active ? 'var(--fg-primary)' : 'var(--fg-secondary)', transition: 'all var(--ds-duration-base) var(--ds-ease-out)',
      }}
    >
      <span style={{ display: 'flex', color: active ? 'var(--color-terracotta)' : 'var(--fg-tertiary)' }}>{icon}</span>
      {label}
    </button>
  )
}

export default function Sidebar() {
  const { activeSection, setActiveSection, openSettings } = useUIStore()
  const {
    tasks,
    getCompletedThisWeek,
    getTasksThisWeek,
    getCriticalPendingCount,
    getTotalPendingHours,
    getProductivityStreak,
  } = useTaskStore()

  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    const checkSupport = () => {
      if (typeof document === 'undefined') return false
      const docEl = document.documentElement
      return !!(
        docEl.requestFullscreen ||
        docEl.mozRequestFullScreen ||
        docEl.webkitRequestFullscreen ||
        docEl.msRequestFullscreen
      )
    }

    setIsSupported(checkSupport())

    const handleFullscreenChange = () => {
      const activeEl = (
        document.fullscreenElement ||
        document.mozFullScreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement
      )
      setIsFullscreen(!!activeEl)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('MSFullscreenChange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
    }
  }, [])

  const toggleFullscreen = () => {
    const docEl = document.documentElement
    const activeEl = (
      document.fullscreenElement ||
      document.mozFullScreenElement ||
      document.webkitFullscreenElement ||
      document.msFullscreenElement
    )

    if (!activeEl) {
      const req = (
        docEl.requestFullscreen ||
        docEl.mozRequestFullScreen ||
        docEl.webkitRequestFullscreen ||
        docEl.msRequestFullscreen
      )
      if (req) req.call(docEl)
    } else {
      const exit = (
        document.exitFullscreen ||
        document.mozCancelFullScreen ||
        document.webkitExitFullscreen ||
        document.msExitFullscreen
      )
      if (exit) exit.call(document)
    }
  }

  const completed = getCompletedThisWeek()
  const totalThisWeek = Math.max(getTasksThisWeek(), 1)
  const weeklyPct = Math.round((completed / totalThisWeek) * 100)
  const criticalCount = getCriticalPendingCount()
  const pendingHours = getTotalPendingHours()
  const streak = getProductivityStreak()

  const today = new Date()
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7))
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const dateStr = d.toISOString().split('T')[0]
    const count = tasks.filter((t) => t.due_date === dateStr).length
    return { label: DAY_LABELS[i], dateStr, count }
  })

  return (
    <aside
      className="w-[280px] min-w-[280px] h-screen flex flex-col overflow-y-auto"
      style={{
        gap: 28,
        borderRight: '1px solid var(--glass-border)',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        transform: 'translateZ(0)',
      }}
    >
      {/* Logo */}
      <div style={{ padding: '32px 24px 0' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 44, color: 'var(--fg-primary)', letterSpacing: '0.1em' }}>
          <span style={{ color: 'var(--color-terracotta)' }}>U</span>need<span style={{ color: 'var(--color-terracotta)' }}>T</span>
        </h1>
        <p style={{ marginTop: 4 }}>
          <span style={{ color: 'var(--fg-tertiary)', fontStyle: 'italic', fontSize: 12 }}>Academic Task Manager</span>
        </p>
      </div>

      {/* Program Selector */}
      <ProgramSelector />

      {/* Navegación */}
      <nav style={{ padding: '0 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {NAV_ITEMS.map((item) => (
          <NavRow
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={activeSection === item.id}
            onClick={() => setActiveSection(item.id)}
          />
        ))}
      </nav>

      <div className="h-px mx-6" style={{ background: 'var(--divider)' }} />

      {/* Estadísticas */}
      <div style={{ padding: '0 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <GlassCard radius="md" padding={16} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <ProgressRing percent={weeklyPct} size={72} stroke={5} />
          <p className="ds-label" style={{ lineHeight: 1.5 }}>
            Completado<br />esta semana
          </p>
        </GlassCard>

        <GlassCard radius="md" padding={16} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: 22, color: criticalCount > 0 ? 'var(--color-priority-critica)' : 'var(--fg-primary)' }}>{criticalCount}</p>
            <p className="ds-label">Críticas</p>
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: 22, color: 'var(--fg-primary)' }}>{pendingHours.toFixed(1)}h</p>
            <p className="ds-label">Pendientes</p>
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: 22, color: 'var(--fg-primary)' }}>{streak}</p>
            <p className="ds-label">Racha</p>
          </div>
        </GlassCard>

        <GlassCard radius="md" padding={16}>
          <p className="ds-label" style={{ marginBottom: 10 }}>Carga semanal</p>
          <div style={{ display: 'flex', gap: 5 }}>
            {weekDays.map((day) => (
              <div
                key={day.dateStr}
                title={`${day.count} tarea${day.count !== 1 ? 's' : ''}`}
                style={{
                  width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 600, color: 'var(--fg-primary)',
                  background: loadColor(day.count) + '61',
                }}
              >
                {day.label}
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard radius="md" padding={16}>
          <SubjectDistribution />
        </GlassCard>

        <GlassCard radius="md" padding={16}>
          <GoalList />
        </GlassCard>
      </div>

      {/* Config & Fullscreen buttons */}
      <div className="flex flex-col gap-3" style={{ padding: '18px 24px', borderTop: '1px solid var(--divider-soft)' }}>
        {isSupported && (
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
            className="flex items-center gap-2 text-sm transition-colors duration-250 cursor-pointer"
            style={{ color: 'var(--fg-secondary)', fontFamily: 'var(--font-body)' }}
          >
            {isFullscreen ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  filter: 'drop-shadow(0 0 4px rgba(79, 174, 140, 0.6))',
                  color: 'var(--color-priority-baja)',
                }}
              >
                <polyline points="4 14 10 14 10 20" />
                <polyline points="20 10 14 10 14 4" />
                <line x1="14" y1="10" x2="21" y2="3" />
                <line x1="10" y1="14" x2="3" y2="21" />
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 3 21 3 21 9" />
                <polyline points="9 21 3 21 3 15" />
                <line x1="21" y1="3" x2="14" y2="10" />
                <line x1="3" y1="21" x2="10" y2="14" />
              </svg>
            )}
            {isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
          </button>
        )}
        <button
          onClick={openSettings}
          className="flex items-center gap-2 text-sm transition-colors duration-250 cursor-pointer"
          style={{ color: 'var(--fg-secondary)', fontFamily: 'var(--font-body)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          Configuración
        </button>
        <ThemeToggle />
      </div>
    </aside>
  )
}
