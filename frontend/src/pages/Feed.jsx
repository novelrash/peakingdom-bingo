import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav'

const API = import.meta.env.VITE_API_URL || ''
const REFRESH_INTERVAL = 30_000

const RANK_STYLES = [
  { bg: 'bg-yellow-500/8', text: 'text-yellow-300', num: 'text-yellow-400' },
  { bg: 'bg-slate-400/5',  text: 'text-slate-300',  num: 'text-slate-400' },
  { bg: 'bg-amber-700/8',  text: 'text-amber-500',  num: 'text-amber-600' },
]

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function InfoRow({ c, compact = false }) {
  const pts = c.tiles?.points || 0
  const isDink = c.source === 'dink'
  return (
    <div className={`flex items-center gap-3 px-3 ${compact ? 'py-2' : 'py-3'} bg-surface-raised`}>
      <span className={`flex-shrink-0 ${isDink ? 'text-sky-400' : 'text-green-400'} ${compact ? 'text-xs' : 'text-sm'}`}>
        {isDink ? '⚡' : '✓'}
      </span>
      <div className="flex-1 min-w-0">
        <p className={`${compact ? 'text-xs' : 'text-sm'} text-white/90 leading-snug`}>
          <Link
            to={`/team/${c.team_id}`}
            state={{ playerId: c.player_id }}
            className="font-semibold text-osrs-gold hover:text-osrs-gold-bright hover:underline underline-offset-2 transition-colors"
          >
            {c.players?.username}
          </Link>
          {' '}
          <span className="font-medium text-white">{c.tiles?.title}</span>
        </p>
        {c.teams?.name && (
          <Link
            to={`/team/${c.team_id}`}
            className="text-xs text-white/35 hover:text-osrs-gold/70 hover:underline underline-offset-2 transition-colors"
          >
            {c.teams.name}
          </Link>
        )}
      </div>
      <div className="text-right flex-shrink-0">
        <p className={`font-bold text-osrs-gold ${compact ? 'text-xs' : 'text-sm'}`}>{pts} pts</p>
        <p className="text-xs text-white/25">{timeAgo(c.submitted_at)}</p>
      </div>
    </div>
  )
}

export default function Feed() {
  const [completions, setCompletions] = useState([])
  const [settings, setSettings] = useState(null)
  const [teamLeaderboard, setTeamLeaderboard] = useState([])
  const [playerLeaderboard, setPlayerLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [newIds, setNewIds] = useState(new Set())
  const [expanded, setExpanded] = useState(null)
  const [thumbPage, setThumbPage] = useState(0)
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

  const expandedIndex = expanded ? completions.findIndex(c => c.id === expanded.id) : -1

  useEffect(() => {
    if (!expanded) return
    function onKey(e) {
      if (e.key === 'ArrowLeft'  && expandedIndex > 0)                    setExpanded(completions[expandedIndex - 1])
      if (e.key === 'ArrowRight' && expandedIndex < completions.length - 1) setExpanded(completions[expandedIndex + 1])
      if (e.key === 'Escape') setExpanded(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [expanded, expandedIndex, completions])

  const featured    = completions[0] ?? null
  const thumbStart  = 1 + thumbPage * 4
  const thumbs      = completions.slice(thumbStart, thumbStart + 4)
  const maxThumbPage = Math.min(2, Math.ceil(Math.max(completions.length - 1, 0) / 4))
  const isSeAllPage  = thumbPage >= maxThumbPage && completions.length > 1

  return (
    <div className="min-h-screen page-bg text-white">
      <Nav eventName={settings?.event_name} />

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">

        {/* Compact leaderboard widgets */}
        <div className="grid grid-cols-2 gap-4">

          {/* Team Rankings — top 3 */}
          <div>
            <h2 className="text-sm font-cinzel font-semibold text-osrs-gold text-center mb-1.5">Teams</h2>
            <div className="bg-surface-raised border border-osrs-gold/10 rounded-xl shadow-gold-sm px-2 py-2">
              {loading ? (
                <p className="text-white/30 text-xs py-1 text-center">Loading…</p>
              ) : (
                <ol>
                  {teamLeaderboard.slice(0, 3).map((team, i) => {
                    const rs = RANK_STYLES[i]
                    return (
                      <li key={team.id}>
                        <Link
                          to={`/team/${team.id}`}
                          className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors group ${rs.bg}`}
                        >
                          <span className={`w-4 text-center text-xs font-bold flex-shrink-0 ${rs.num}`}>{i + 1}</span>
                          <span className="flex-1 text-sm font-semibold text-white truncate group-hover:underline underline-offset-2">{team.name}</span>
                          <span className={`text-xs font-bold flex-shrink-0 ${rs.text}`}>{team.points} pts</span>
                        </Link>
                      </li>
                    )
                  })}
                  {teamLeaderboard.length === 0 && (
                    <li className="text-white/30 text-xs text-center py-1">No scores yet.</li>
                  )}
                </ol>
              )}
            </div>
          </div>

          {/* Player Rankings — top 3 */}
          <div>
            <h2 className="text-sm font-cinzel font-semibold text-osrs-gold text-center mb-1.5">Players</h2>
            <div className="bg-surface-raised border border-osrs-gold/10 rounded-xl shadow-gold-sm px-2 py-2">
              {loading ? (
                <p className="text-white/30 text-xs py-1 text-center">Loading…</p>
              ) : (
                <ol>
                  {playerLeaderboard.slice(0, 3).map((player, i) => {
                    const rs = RANK_STYLES[i]
                    const row = (
                      <>
                        <span className={`w-4 text-center text-xs font-bold flex-shrink-0 ${rs.num}`}>{i + 1}</span>
                        <span className="flex-1 text-sm font-semibold text-white truncate group-hover:underline underline-offset-2">{player.username}</span>
                        <span className={`text-xs font-bold flex-shrink-0 ${rs.text}`}>{player.points} pts</span>
                      </>
                    )
                    const cls = `flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors group ${rs.bg}`
                    return (
                      <li key={player.id}>
                        {player.team
                          ? <Link to={`/team/${player.team.id}`} state={{ playerId: player.id }} className={cls}>{row}</Link>
                          : <div className={cls}>{row}</div>}
                      </li>
                    )
                  })}
                  {playerLeaderboard.length === 0 && (
                    <li className="text-white/30 text-xs text-center py-1">No scores yet.</li>
                  )}
                </ol>
              )}
            </div>
          </div>
        </div>

        {/* View full rankings link */}
        <div className="text-right">
          <Link to="/leaderboard" className="text-xs text-white/30 hover:text-white/60 transition-colors">
            View full rankings →
          </Link>
        </div>

        {/* Live feed */}
        <section>
          <div className="flex items-center justify-between mb-4">
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
            <div className="space-y-3">

              {/* Featured */}
              {featured && (
                <div className="border-2 border-osrs-gold/50 rounded-xl overflow-hidden shadow-gold-md ring-1 ring-osrs-gold/20">
                  <div className="relative">
                    <span className="absolute top-2 left-2 z-10 bg-osrs-gold text-surface-base text-xs font-bold px-2 py-0.5 rounded-full tracking-wide">
                      Latest
                    </span>
                    {featured.image_url && (
                      <button onClick={() => setExpanded(featured)} className="w-full block">
                        <img
                          src={featured.image_url}
                          alt="Completion screenshot"
                          className="w-full max-h-96 object-cover hover:opacity-90 transition-opacity cursor-pointer"
                        />
                      </button>
                    )}
                  </div>
                  <InfoRow c={featured} />
                </div>
              )}

              {/* Paginated thumbnails */}
              {completions.length > 1 && (
                isSeAllPage ? (
                  <Link
                    to="/gallery"
                    className="block text-center py-8 rounded-xl border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20 transition-colors text-sm"
                  >
                    See all tile completions →
                  </Link>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setThumbPage(p => Math.max(0, p - 1))}
                      disabled={thumbPage === 0}
                      className="flex-shrink-0 text-4xl text-white/40 hover:text-white/90 disabled:opacity-10 disabled:cursor-not-allowed transition-colors leading-none select-none px-1"
                    >‹</button>

                    <div className="grid grid-cols-2 gap-3 flex-1">
                      {thumbs.map(c => (
                        <div
                          key={c.id}
                          className={[
                            'border rounded-xl overflow-hidden transition-all duration-300',
                            newIds.has(c.id) ? 'border-osrs-gold/40' : 'border-white/10',
                          ].join(' ')}
                        >
                          {c.image_url && (
                            <button onClick={() => setExpanded(c)} className="w-full block">
                              <img
                                src={c.image_url}
                                alt="Completion screenshot"
                                className="w-full max-h-40 object-cover hover:opacity-90 transition-opacity cursor-pointer"
                              />
                            </button>
                          )}
                          <InfoRow c={c} compact />
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => setThumbPage(p => Math.min(maxThumbPage, p + 1))}
                      disabled={thumbPage >= maxThumbPage}
                      className="flex-shrink-0 text-4xl text-white/40 hover:text-white/90 disabled:opacity-10 disabled:cursor-not-allowed transition-colors leading-none select-none px-1"
                    >›</button>
                  </div>
                )
              )}

              {!isSeAllPage && (
                <Link
                  to="/gallery"
                  className="block text-center py-2.5 rounded-lg border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20 transition-colors text-sm"
                >
                  See all tile completions →
                </Link>
              )}
            </div>
          )}
        </section>

      </div>

      {/* Lightbox */}
      {expanded && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4"
          onClick={() => setExpanded(null)}
        >
          <div className="flex items-center gap-4 w-full max-w-3xl" onClick={e => e.stopPropagation()}>

            <button
              onClick={() => expandedIndex > 0 && setExpanded(completions[expandedIndex - 1])}
              disabled={expandedIndex <= 0}
              className="flex-shrink-0 text-5xl text-white/50 hover:text-white disabled:opacity-10 disabled:cursor-not-allowed transition-colors leading-none select-none"
            >‹</button>

            <div className="flex-1 bg-surface-raised rounded-xl overflow-hidden border border-white/10">
              {expanded.image_url && (
                <img src={expanded.image_url} alt="Completion" className="w-full max-h-[70vh] object-contain" />
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
                  {expanded.teams?.name && <p className="text-xs text-white/35">{expanded.teams.name}</p>}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-osrs-gold">{expanded.tiles?.points} pts</p>
                  <p className="text-xs text-white/25">{timeAgo(expanded.submitted_at)}</p>
                </div>
                <button onClick={() => setExpanded(null)} className="text-white/40 hover:text-white/80 transition-colors ml-2 flex-shrink-0">✕</button>
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
