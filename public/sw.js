const CACHE_NAME = 'studyforge-v1'

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
  if (!event.data) return

  try {
    const data = event.data.json()
    const options = {
      body: data.body || '',
      icon: '/vite.svg',
      badge: '/vite.svg',
      vibrate: [200, 100, 200],
      data: {
        url: data.url || '/',
      },
    }

    event.waitUntil(
      self.registration.showNotification(data.title || 'StudyForge', options)
    )
  } catch (err) {
    // Si el payload no es JSON, mostrarlo como texto
    event.waitUntil(
      self.registration.showNotification('StudyForge', {
        body: event.data.text(),
        icon: '/vite.svg',
      })
    )
  }
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const urlToOpen = event.notification.data.url || '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus()
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen)
      }
    })
  )
})
