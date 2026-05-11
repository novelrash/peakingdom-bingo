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
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-1.5">
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
              'relative aspect-square border-2 rounded-lg overflow-hidden text-left transition-all duration-150',
              tierBorderClass(tile.points, status),
              isDone      && 'bg-green-900/20 opacity-60 cursor-not-allowed',
              isPending   && 'bg-osrs-gold/5 cursor-not-allowed',
              isAvailable && 'bg-white/5 hover:bg-white/10 cursor-pointer',
              (!isAvailable && !isDone && !isPending) && 'bg-white/5 cursor-default',
            ].filter(Boolean).join(' ')}
          >
            {/* Centered item icon */}
            {tile.trigger_data?.item_id && (
              <img
                src={`https://static.runelite.net/cache/item/icon/${tile.trigger_data.item_id}.png`}
                alt=""
                className={`absolute inset-0 m-auto w-10 h-10 object-contain pointer-events-none select-none transition-opacity ${isDone ? 'opacity-20' : 'opacity-55'}`}
                style={{ imageRendering: 'pixelated' }}
              />
            )}

            {/* Bottom gradient overlay with title + points */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-2 pt-6 pb-1.5">
              <p className={`text-xs font-semibold leading-tight line-clamp-2 ${isDone ? 'line-through text-white/30' : 'text-white/90'}`}>
                {tile.title}
              </p>
              <div className={`flex items-center gap-1 mt-0.5 ${isDone ? 'text-white/25' : 'text-white/40'}`}>
                <span className="text-xs">{tile.points} pts</span>
                {tile.trigger_data && (
                  <span className="text-sky-400 text-xs leading-none" title="Auto-completes via Dink">⚡</span>
                )}
              </div>
            </div>

            {/* Completed checkmark */}
            {isDone && (
              <div className="absolute inset-0 flex items-center justify-center bg-green-900/10">
                <span className="text-green-400 text-2xl font-bold">✓</span>
              </div>
            )}

            {/* Pending badge */}
            {isPending && (
              <div className="absolute top-1.5 left-1.5">
                <span className="text-osrs-gold text-xs">⏳</span>
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
