export default function ProductivityStreak({ days }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-teal-darker text-lg">
        🔥
      </div>
      <div>
        <p className="font-display text-lg text-beige">{days}</p>
        <p className="text-xs text-beige-dark">días seguidos</p>
      </div>
    </div>
  )
}
