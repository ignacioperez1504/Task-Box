import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function WeeklyProgress({ completed, total }) {
  const [animatedPct, setAnimatedPct] = useState(0)
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0
  const radius = 36
  const circumference = 2 * Math.PI * radius

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedPct(pct), 200)
    return () => clearTimeout(timer)
  }, [pct])

  const offset = circumference - (animatedPct / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
          <circle cx="48" cy="48" r={radius} fill="none" stroke="#122824" strokeWidth="6" />
          <motion.circle
            cx="48" cy="48" r={radius}
            fill="none" stroke="#C27A55" strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-2xl text-beige">{animatedPct}%</span>
        </div>
      </div>
      <p className="text-xs text-beige-dark mt-2">{completed}/{total} esta semana</p>
    </div>
  )
}
