export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('Este navegador no soporta notificaciones de escritorio.')
    return false
  }
  
  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  return false
}

export function sendNotification(title, options = {}) {
  if (!('Notification' in window)) return
  if (Notification.permission !== 'granted') return

  const defaultOptions = {
    icon: '/vite.svg', // Idealmente reemplazar con logo de StudyForge
    badge: '/vite.svg',
    vibrate: [200, 100, 200],
  }

  try {
    // Intentar usar Service Worker si está activo (para notificaciones móviles/background)
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, { ...defaultOptions, ...options })
    }).catch(() => {
      // Fallback a Notification API tradicional
      new Notification(title, { ...defaultOptions, ...options })
    })
  } catch (error) {
    new Notification(title, { ...defaultOptions, ...options })
  }
}

export function checkUpcomingTasks(tasks) {
  if (Notification.permission !== 'granted') return

  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  // Tareas críticas para hoy
  const criticalToday = tasks.filter(t => 
    t.due_date === todayStr && 
    t.status === 'pending' && 
    t.ai_priority === 'Crítica'
  )

  if (criticalToday.length > 0) {
    sendNotification('¡Tareas Críticas Hoy!', {
      body: `Tienes ${criticalToday.length} tarea(s) crítica(s) que vencen hoy.`,
      tag: 'critical-today',
    })
  }

  // Tareas que vencen mañana (aviso de 24h)
  const dueTomorrow = tasks.filter(t => 
    t.due_date === tomorrowStr && 
    t.status === 'pending'
  )

  if (dueTomorrow.length > 0) {
    sendNotification('Vencimientos mañana', {
      body: `Tienes ${dueTomorrow.length} tarea(s) que entregar mañana.`,
      tag: 'due-tomorrow',
    })
  }
}

export function notifyGoalCompleted(goalTitle) {
  sendNotification('¡Meta Completada! 🏆', {
    body: `¡Felicidades! Has completado la meta: ${goalTitle}. Sigue así.`,
    tag: 'goal-completed',
  })
}
