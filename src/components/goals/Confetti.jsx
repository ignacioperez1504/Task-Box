import { useEffect, useCallback } from 'react'

export default function Confetti({ active, onComplete }) {
  const createParticles = useCallback(() => {
    if (!active) return
    const container = document.createElement('div')
    container.style.cssText = 'position:fixed;inset:0;z-index:99998;pointer-events:none;overflow:hidden;'
    document.body.appendChild(container)

    const colors = ['#C27A55', '#1B3A35', '#C8C5B8', '#D4956F', '#2E6B5E']

    for (let i = 0; i < 40; i++) {
      const particle = document.createElement('div')
      const size = Math.random() * 8 + 4
      const color = colors[Math.floor(Math.random() * colors.length)]
      const left = Math.random() * 100
      const delay = Math.random() * 0.5
      const duration = Math.random() * 1.5 + 1.5

      particle.style.cssText = `
        position:absolute;top:-10px;left:${left}%;
        width:${size}px;height:${size}px;
        background:${color};border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
        animation:confetti-fall ${duration}s ease-in ${delay}s forwards;
        opacity:0.9;
      `
      container.appendChild(particle)
    }

    // Add keyframes if not already added
    if (!document.getElementById('confetti-styles')) {
      const style = document.createElement('style')
      style.id = 'confetti-styles'
      style.textContent = `
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `
      document.head.appendChild(style)
    }

    setTimeout(() => {
      container.remove()
      onComplete?.()
    }, 3000)
  }, [active, onComplete])

  useEffect(() => {
    createParticles()
  }, [createParticles])

  return null
}
