import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useGoalStore } from '../../store/goalStore'
import GoalCard from './GoalCard'
import GoalForm from './GoalForm'
import Confetti from './Confetti'

export default function GoalList() {
  const { createGoal, updateGoal, deleteGoal, getActiveGoals, getCompletedGoals } = useGoalStore()
  const [showForm, setShowForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [showCompleted, setShowCompleted] = useState(false)
  const [celebrate, setCelebrate] = useState(false)

  const activeGoals = getActiveGoals()
  const completedGoals = getCompletedGoals()

  const handleSave = async (data) => {
    if (editingGoal) {
      await updateGoal(editingGoal.id, data)
    } else {
      await createGoal(data)
    }
    setShowForm(false)
    setEditingGoal(null)
  }

  const handleEdit = (goal) => {
    setEditingGoal(goal)
    setShowForm(true)
  }

  return (
    <div className="mt-4">
      {celebrate && <Confetti active={true} onComplete={() => setCelebrate(false)} />}

      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-beige-dark uppercase tracking-widest">Metas</p>
        {!showForm && (
          <button
            onClick={() => { setEditingGoal(null); setShowForm(true) }}
            className="text-xs text-terracotta hover:text-terracotta-light transition-colors"
          >
            + Nueva
          </button>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <GoalForm
            initial={editingGoal}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditingGoal(null) }}
          />
        )}
      </AnimatePresence>

      <div className="space-y-2 mt-2">
        <AnimatePresence>
          {activeGoals.map((g) => (
            <GoalCard key={g.id} goal={g} onEdit={handleEdit} onDelete={deleteGoal} />
          ))}
        </AnimatePresence>
      </div>

      {completedGoals.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="text-xs text-beige-dark hover:text-beige transition-colors flex items-center gap-1"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              style={{ transform: showCompleted ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
              <polyline points="9 18 15 12 9 6" />
            </svg>
            Metas logradas ({completedGoals.length})
          </button>
          {showCompleted && (
            <div className="space-y-2 mt-2">
              {completedGoals.map((g) => (
                <GoalCard key={g.id} goal={g} onEdit={handleEdit} onDelete={deleteGoal} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
