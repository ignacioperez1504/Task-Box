import { useUIStore } from '../../store/uiStore'
import { useTaskStore } from '../../store/taskStore'
import WeeklyProgress from '../stats/WeeklyProgress'
import CriticalCounter from '../stats/CriticalCounter'
import PendingTime from '../stats/PendingTime'
import WeeklyHeatmap from '../stats/WeeklyHeatmap'
import ProductivityStreak from '../stats/ProductivityStreak'
import SubjectDistribution from '../stats/SubjectDistribution'
import GoalList from '../goals/GoalList'

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

export default function Sidebar() {
  const { activeSection, setActiveSection, openSettings } = useUIStore()
  const {
    getCompletedThisWeek,
    getTasksThisWeek,
    getCriticalPendingCount,
    getTotalPendingHours,
    getProductivityStreak,
  } = useTaskStore()

  return (
    <aside
      className="w-[280px] min-w-[280px] h-screen flex flex-col overflow-y-auto border-r border-beige/8 gap-4"
      style={{
        background: 'linear-gradient(180deg, #152E2A 0%, #0D1E1B 100%)',
      }}
    >
      {/* Logo */}
      <div className="px-6 pt-6 pb-4">
        <h1 className="font-display text-3xl font-bold text-beige tracking-tight">
          Study<span className="text-terracotta">Forge</span>
        </h1>
        <p className="text-[10px] text-beige-dark mt-0.5 tracking-[0.2em] uppercase">
          Academic Task Manager
        </p>
      </div>

      {/* Navegación */}
      <nav className="px-3 mb-4">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-250 mb-1"
            style={{
              background: activeSection === item.id ? 'rgba(194,122,85,0.2)' : 'transparent',
              color: activeSection === item.id ? '#fff' : '#C8C5B8',
              borderLeft: activeSection === item.id ? '3px solid #C27A55' : '3px solid transparent',
            }}
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="h-px mx-6 bg-beige/10" />

      {/* Estadísticas */}
      <div className="px-5 py-4 flex-1 space-y-5">
        <p className="text-[10px] text-beige-dark uppercase tracking-[0.2em]">Estadísticas</p>

        <WeeklyProgress
          completed={getCompletedThisWeek()}
          total={Math.max(getTasksThisWeek(), 1)}
        />

        <CriticalCounter count={getCriticalPendingCount()} />
        <PendingTime hours={getTotalPendingHours()} />
        <WeeklyHeatmap />
        <ProductivityStreak days={getProductivityStreak()} />
        <SubjectDistribution />

        <div className="h-px bg-beige/10" />

        <GoalList />
      </div>

      {/* Config button */}
      <div className="px-5 py-4 border-t border-beige/8 mt-auto">
        <button
          onClick={openSettings}
          className="flex items-center gap-2 text-sm text-beige-dark hover:text-beige transition-colors duration-250"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          Configuración
        </button>
      </div>
    </aside>
  )
}
