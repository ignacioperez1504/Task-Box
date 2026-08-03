import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useGoalStore } from '../../store/goalStore'
import GoalCard from './GoalCard'
import GoalForm from './GoalForm'
import Confetti from './Confetti'
import Accordion from '../ui/Accordion'

export default function GoalList() {
  const { createGoal, updateGoal, deleteGoal, getActiveGoals, getCompletedGoals } = useGoalStore()
  const [showForm, setShowForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
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
    <div>
      {celebrate && <Confetti active={true} onComplete={() => setCelebrate(false)} />}

      <div className="flex items-center justify-between mb-3">
        <p className="ds-label">Metas</p>
        {!showForm && (
          <button
            onClick={() => { setEditingGoal(null); setShowForm(true) }}
            className="hover:opacity-80 transition-colors"
            style={{ fontSize: 11, color: 'var(--color-terracotta)', fontWeight: 600, cursor: 'pointer' }}
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
        <Accordion
          variant="inline"
          title={`Metas logradas (${completedGoals.length})`}
          className="mt-3"
        >
          <div className="space-y-2">
            {completedGoals.map((g) => (
              <GoalCard key={g.id} goal={g} onEdit={handleEdit} onDelete={deleteGoal} />
            ))}
          </div>
        </Accordion>
      )}
    </div>
  )
}
