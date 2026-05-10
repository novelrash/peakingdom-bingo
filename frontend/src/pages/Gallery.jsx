import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav'

const API = import.meta.env.VITE_API_URL || ''
const PAGE_SIZE = 21

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function Gallery() {
  const [completions, setCompletions] = useState([])
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/settings`).then(r => r.json()),
      fetch(`${API}/api/completions`).then(r => r.json()),
    ]).then(([s, co]) => {
      setSettings(s)
      const approved = co
        .filter(c => c.status === 'approved')
        .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at))
      setCompletions(approved)
      setLoading(false)
    })
  }, [])

  const expandedIndex = expanded ? completions.findIndex(c => c.id === expanded.id) : -1

  useEffect(() => {
    if (!expanded) return
    function onKey(e) {
      if (e.key === 'ArrowLeft'  && expandedIndex > 0)                      setExpanded(completions[expandedIndex - 1])
      if (e.key === 'ArrowRight' && expandedIndex < completions.length - 1) setExpanded(completions[expandedIndex + 1])
      if (e.key === 'Escape') setExpanded(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [expanded, expandedIndex, completions])

  const totalPages = Math.ceil(completions.length / PAGE_SIZE)
  const paged = completions.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <div className="min-h-screen page-bg text-white">
      <Nav eventName={settings?.event_name} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/feed" className="text-white/30 hover:text-white/60 transition-colors text-sm">← Back</Link>
          <h1 className="text-2xl font-cinzel font-bold text-osrs-gold">All Completions</h1>
          {!loading && (
            <span className="text-white/30 text-sm ml-auto">{completions.length} total</span>
          )}
        </div>

        {loading ? (
          <div className="text-center py-20 text-white/30">Loading…</div>
        ) : completions.length === 0 ? (
          <div className="text-center py-20 text-white/30">No completions yet.</div>
        ) : (
          <>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-2">
              {paged.map(c => (
                <button
                  key={c.id}
                  onClick={() => setExpanded(c)}
                  className="aspect-square rounded-lg overflow-hidden border border-white/10 hover:border-osrs-gold/40 transition-all cursor-pointer group relative bg-surface-raised"
                >
                  {c.image_url ? (
                    <img
                      src={c.image_url}
                      alt={c.tiles?.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-2 gap-1">
                      <p className="text-xs text-white/50 text-center line-clamp-3 leading-tight">{c.tiles?.title}</p>
                      <p className="text-xs text-osrs-gold/60">{c.tiles?.points} pts</p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-1.5">
                    <p className="text-[10px] text-osrs-gold font-semibold leading-tight truncate">{c.players?.username}</p>
                    <p className="text-xs text-white font-medium line-clamp-2 leading-tight">{c.tiles?.title}</p>
                  </div>
                </button>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-8 text-sm">
                <button
                  onClick={() => { setPage(p => Math.max(0, p - 1)); window.scrollTo(0, 0) }}
                  disabled={page === 0}
                  className="px-4 py-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  ← Previous
                </button>
                <span className="text-white/30">Page {page + 1} of {totalPages}</span>
                <button
                  onClick={() => { setPage(p => Math.min(totalPages - 1, p + 1)); window.scrollTo(0, 0) }}
                  disabled={page >= totalPages - 1}
                  className="px-4 py-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Lightbox */}
      {expanded && (
        <div
          className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 px-4"
          onClick={() => setExpanded(null)}
        >
          <div
            className="flex items-center gap-4 w-full max-w-3xl"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => expandedIndex > 0 && setExpanded(completions[expandedIndex - 1])}
              disabled={expandedIndex <= 0}
              className="flex-shrink-0 text-5xl text-white/50 hover:text-white disabled:opacity-10 disabled:cursor-not-allowed transition-colors leading-none select-none"
            >‹</button>

            <div className="flex-1 bg-surface-raised rounded-xl overflow-hidden border border-white/10 shadow-2xl">
              {expanded.image_url && (
                <img
                  src={expanded.image_url}
                  alt="Completion"
                  className="w-full max-h-[70vh] object-contain"
                />
              )}
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/90">
                    <Link
                      to={`/team/${expanded.team_id}`}
                      state={{ playerId: expanded.player_id }}
                      className="font-semibold text-osrs-gold hover:underline"
                      onClick={() => setExpanded(null)}
                    >
                      {expanded.players?.username}
                    </Link>
                    {' completed '}
                    <span className="font-medium text-white">{expanded.tiles?.title}</span>
                  </p>
                  {expanded.teams?.name && (
                    <p className="text-xs text-white/35">{expanded.teams.name}</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-osrs-gold">{expanded.tiles?.points} pts</p>
                  <p className="text-xs text-white/25">{timeAgo(expanded.submitted_at)}</p>
                </div>
                <button
                  onClick={() => setExpanded(null)}
                  className="text-white/40 hover:text-white/80 transition-colors ml-2 flex-shrink-0"
                >✕</button>
              </div>
            </div>

            <button
              onClick={() => expandedIndex < completions.length - 1 && setExpanded(completions[expandedIndex + 1])}
              disabled={expandedIndex >= completions.length - 1}
              className="flex-shrink-0 text-5xl text-white/50 hover:text-white disabled:opacity-10 disabled:cursor-not-allowed transition-colors leading-none select-none"
            >›</button>
          </div>
        </div>
      )}
    </div>
  )
}
