export default function LoadingSkeleton({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="animate-shimmer rounded-lg h-4"
          style={{ width: `${85 - i * 15}%` }}
        />
      ))}
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="glass rounded-xl p-5 space-y-3">
      <div className="animate-shimmer rounded h-6 w-3/4" />
      <div className="flex gap-2">
        <div className="animate-shimmer rounded-full h-5 w-16" />
        <div className="animate-shimmer rounded-full h-5 w-20" />
      </div>
      <div className="animate-shimmer rounded h-4 w-full" />
      <div className="animate-shimmer rounded h-4 w-2/3" />
    </div>
  )
}
