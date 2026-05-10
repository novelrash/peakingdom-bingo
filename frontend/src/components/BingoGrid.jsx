function tierBorderClass(points, status) {
  if (status === 'approved') return 'border-green-500/25'
  if (status === 'pending')  return 'border-osrs-gold/35'
  if (points >= 100) return 'tile-elite'
  if (points >= 50)  return 'border-purple-500/60'
  if (points >= 30)  return 'border-blue-500/60'
  return 'border-emerald-500/50'
}

export default function BingoGrid({ tiles, completions, playerId, onSubmit }) {
  // Prefer active (pending/approved) completion over rejected for each tile
  const byTile = {}
  for (const c of completions) {
    const existing = byTile[c.tile_id]
    if (!existing || existing.status === 'rejected') byTile[c.tile_id] = c
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
      {tiles.map(tile => {
        const completion = byTile[tile.id]
        const status = completion?.status ?? 'none'
        const isDone = status === 'approved'
        const isPending = status === 'pending'
        const isAvailable = (status === 'none' || status === 'rejected') && !!playerId

        return (
          <button
            key={tile.id}
            onClick={() => isAvailable && onSubmit(tile)}
            disabled={!isAvailable}
            className={[
              'relative border-2 rounded-lg p-2 text-left transition-all duration-150',
              tierBorderClass(tile.points, status),
              isDone    && 'bg-green-900/20 opacity-60 cursor-not-allowed',
              isPending && 'bg-osrs-gold/5 cursor-not-allowed',
              isAvailable  && 'bg-white/5 hover:bg-white/10 cursor-pointer',
              (!isAvailable && !isDone && !isPending) && 'bg-white/5 cursor-default',
            ].filter(Boolean).join(' ')}
          >
            <p className={`text-xs font-semibold leading-tight line-clamp-3 ${isDone ? 'line-through text-white/30' : 'text-white/90'}`}>
              {tile.title}
            </p>
            <p className={`text-xs mt-1 ${isDone ? 'text-white/25' : 'text-white/40'}`}>
              {tile.points} pts
            </p>

            {isDone && (
              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-green-900/10">
                <span className="text-green-400 text-lg font-bold">✓</span>
              </div>
            )}
            {isPending && (
              <p className="text-xs font-semibold text-osrs-gold mt-1">⏳ Pending</p>
            )}
          </button>
        )
      })}
    </div>
  )
}
