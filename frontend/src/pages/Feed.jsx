import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav'
import Leaderboard from '../components/Leaderboard'

const API = import.meta.env.VITE_API_URL || ''
const REFRESH_INTERVAL = 30_000
const PAGE_SIZE = 5

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function tierBorderClass(points) {
  if (points >= 100) return 'tile-elite'
  if (points >= 50)  return 'border-purple-500/60'
  if (points >= 30)  return 'border-blue-500/60'
  return 'border-emerald-500/50'
}

export default function Feed() {
  const [completions, setCompletions] = useState([])
  const [settings, setSettings] = useState(null)
  const [teamLeaderboard, setTeamLeaderboard] = useState([])
  const [playerLeaderboard, setPlayerLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [newIds, setNewIds] = useState(new Set())
  const [page, setPage] = useState(0)
  const prevIdsRef = useRef(new Set())

  async function fetchData(isRefresh = false) {
    const [s, co, teams, players] = await Promise.all([
      fetch(`${API}/api/settings`).then(r => r.json()),
      fetch(`${API}/api/completions`).then(r => r.json()),
      fetch(`${API}/api/leaderboard/teams`).then(r => r.json()),
      fetch(`${API}/api/leaderboard/players`).then(r => r.json()),
    ])
    setSettings(s)
    setTeamLeaderboard(teams)
    setPlayerLeaderboard(players)

    const approved = co
      .filter(c => c.status === 'approved')
      .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at))

    if (isRefresh) {
      const incoming = new Set(approved.map(c => c.id))
      const fresh = new Set([...incoming].filter(id => !prevIdsRef.current.has(id)))
      if (fresh.size > 0) {
        setNewIds(fresh)
        setPage(0)
        setTimeout(() => setNewIds(new Set()), 3000)
      }
    }

    prevIdsRef.current = new Set(approved.map(c => c.id))
    setCompletions(approved)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
    const id = setInterval(() => fetchData(true), REFRESH_INTERVAL)
    return () => clearInterval(id)
  }, [])

  const totalPages = Math.ceil(completions.length / PAGE_SIZE)
  const paged = completions.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <div className="min-h-screen page-bg text-white">
      <Nav eventName={settings?.event_name} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* Leaderboard */}
          <section>
            <h2 className="text-2xl font-cinzel font-bold text-osrs-gold mb-5">Leaderboard</h2>
            {loading ? (
              <div className="text-center py-12 text-white/30">Loading…</div>
            ) : (
              <div className="bg-surface-raised border border-osrs-gold/10 rounded-xl shadow-gold-sm p-5">
                <Leaderboard teams={teamLeaderboard} players={playerLeaderboard} />
              </div>
            )}
          </section>

          {/* Feed */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-cinzel font-bold text-osrs-gold">Live Feed</h2>
              <div className="flex items-center gap-2 text-xs text-white/30">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Refreshes every 30s
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12 text-white/30">Loading feed…</div>
            ) : completions.length === 0 ? (
              <div className="text-center py-12 text-white/30">No completions yet — check back soon.</div>
            ) : (
              <>
                <div className="space-y-3">
                  {paged.map(c => {
                    const pts = c.tiles?.points || 0
                    const isNew = newIds.has(c.id)
                    const isDink = c.source === 'dink'

                    return (
                      <div
                        key={c.id}
                        className={[
                          'border-2 rounded-xl overflow-hidden transition-all duration-300',
                          tierBorderClass(pts),
                          isNew ? 'ring-2 ring-osrs-gold/40' : '',
                        ].join(' ')}
                      >
                        {c.image_url && (
                          <Link
                            to={`/team/${c.team_id}`}
                            state={{ playerId: c.player_id }}
                          >
                            <img
                              src={c.image_url}
                              alt="Completion screenshot"
                              className="w-full max-h-72 object-cover hover:opacity-90 transition-opacity cursor-pointer"
                            />
                          </Link>
                        )}

                        <div className="flex items-center gap-3 px-4 py-3 bg-surface-raised">
                          <span
                            className={`text-sm flex-shrink-0 ${isDink ? 'text-sky-400' : 'text-green-400'}`}
                            title={isDink ? 'Auto-verified via Dink' : 'Admin approved'}
                          >
                            {isDink ? '⚡' : '✓'}
                          </span>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white/90 leading-snug">
                              <Link
                                to={`/team/${c.team_id}`}
                                state={{ playerId: c.player_id }}
                                className="font-semibold text-osrs-gold hover:text-osrs-gold-bright hover:underline underline-offset-2 transition-colors"
                              >
                                {c.players?.username}
                              </Link>
                              {' completed '}
                              <span className="font-medium text-white">{c.tiles?.title}</span>
                            </p>
                            {c.teams?.name && (
                              <Link
                                to={`/team/${c.team_id}`}
                                state={{ playerId: c.player_id }}
                                className="text-xs text-white/35 hover:text-osrs-gold/70 hover:underline underline-offset-2 transition-colors"
                              >
                                {c.teams.name}
                              </Link>
                            )}
                          </div>

                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-bold text-osrs-gold">{pts} pts</p>
                            <p className="text-xs text-white/25">{timeAgo(c.submitted_at)}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 text-sm">
                    <button
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="px-4 py-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      ← Previous
                    </button>
                    <span className="text-white/30">
                      Page {page + 1} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                      className="px-4 py-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </section>

        </div>
      </div>
    </div>
  )
}
