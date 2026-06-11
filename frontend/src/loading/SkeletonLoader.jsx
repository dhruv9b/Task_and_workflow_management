export default function SkeletonLoader({ className = "", lines = 3 }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-zinc-800 rounded animate-pulse"
          style={{
            width: `${Math.random() * 40 + 60}%`,
            animationDelay: `${i * 0.1}s`
          }}
        />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
      <div className="h-6 bg-zinc-800 rounded w-3/4 animate-pulse" />
      <div className="space-y-2">
        <div className="h-4 bg-zinc-800 rounded animate-pulse" />
        <div className="h-4 bg-zinc-800 rounded w-5/6 animate-pulse" />
      </div>
      <div className="flex gap-2 pt-4">
        <div className="h-8 bg-zinc-800 rounded w-20 animate-pulse" />
        <div className="h-8 bg-zinc-800 rounded w-20 animate-pulse" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
      <div className="border-b border-zinc-800 p-4">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="h-4 bg-zinc-800 rounded animate-pulse" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-zinc-800">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div
                  key={colIndex}
                  className="h-4 bg-zinc-800 rounded animate-pulse"
                  style={{ animationDelay: `${(rowIndex * columns + colIndex) * 0.05}s` }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
