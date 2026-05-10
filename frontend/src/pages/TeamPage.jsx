import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Nav from '../components/Nav'

const API = import.meta.env.VITE_API_URL || ''

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function RankNum({ rank }) {
  const base = 'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0'
  if (rank === 1) return <span className={base} style={{ background: 'radial-gradient(circle, #ffd700, #ffed4e)', color: '#0a0a0a' }}>1</span>
  if (rank === 2) return <span className={base} style={{ background: 'radial-gradient(circle, #c0c0c0, #e5e5e5)', color: '#0a0a0a' }}>2</span>
  if (rank === 3) return <span className={base} style={{ background: 'radial-gradient(circle, #cd7f32, #daa520)', color: '#fff' }}>3</span>
  return <span className={`${base} bg-white/10 text-white/40`}>{rank}</span>
}

export default function TeamPage() {
  const { teamId } = useParams()
  const [team, setTeam] = useState(null)
  const [members, setMembers] = useState([])
  const [completions, setCompletions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/leaderboard/teams`).then(r => r.json()),
      fetch(`${API}/api/players`).then(r => r.json()),
      fetch(`${API}/api/completions`).then(r => r.json()),
    ]).then(([teams, players, allCompletions]) => {
      const teamInfo = teams.find(t => t.id === teamId) || null
      setTeam(teamInfo)

      const teamPlayers = players.filter(p => p.team_id === teamId)
      const approved = allCompletions.filter(
        c => c.team_id === teamId && c.status === 'approved'
      )

      // Per-player points and tile count
      const byPlayer = {}
      for (const c of approved) {
        if (!byPlayer[c.player_id]) byPlayer[c.player_id] = { points: 0, count: 0 }
        byPlayer[c.player_id].points += c.tiles?.points || 0
        byPlayer[c.player_id].count += 1
      }

      setMembers(
        teamPlayers
          .map(p => ({ ...p, points: byPlayer[p.id]?.points || 0, tilesCompleted: byPlayer[p.id]?.count || 0 }))
          .sort((a, b) => b.points - a.points)
      )

      setCompletions(
        approved.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at))
      )
      setLoading(false)
    })
  }, [teamId])

  if (loading) return (
    <div className="min-h-screen bg-surface-base text-white">
      <Nav />
      <div className="text-center py-20 text-white/30">Loading…</div>
    </div>
  )

  if (!team) return (
    <div className="min-h-screen bg-surface-base text-white">
      <Nav />
      <div className="text-center py-20 text-white/30">
        Team not found. <Link to="/leaderboard" className="text-osrs-gold/70 hover:text-osrs-gold">← Back</Link>
      </div>
    </div>
  )

  const recent = completions.slice(0, 10)
  const totalTiles = completions.length

  return (
    <div className="min-h-screen bg-surface-base text-white">
      <Nav />

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Team header */}
        <div className="flex items-center gap-4 mb-8">
          <div
            className="w-14 h-14 rounded-full flex-shrink-0 border-2 border-white/10"
            style={{ backgroundColor: team.color }}
          />
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-white truncate">{team.name}</h1>
            <p className="text-white/40 text-sm mt-0.5">
              <span className="text-osrs-gold font-semibold">{team.points} pts</span>
              {' · '}
              {members.length} members
              {' · '}
              {totalTiles} tiles completed
            </p>
          </div>
          <Link
            to="/leaderboard"
            className="text-sm text-white/30 hover:text-white/60 transition-colors flex-shrink-0"
          >
            ← Leaderboard
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Members */}
          <section>
            <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Members</h2>
            <div className="space-y-2">
              {members.length === 0 && (
                <p className="text-white/30 text-sm">No members on this team.</p>
              )}
              {members.map((m, i) => (
                <div
                  key={m.id}
                  className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg px-4 py-3"
                >
                  <RankNum rank={i + 1} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white/90 truncate">{m.username}</p>
                    <p className="text-xs text-white/35">{m.tilesCompleted} tiles</p>
                  </div>
                  <span className="font-bold text-osrs-gold text-sm">{m.points} pts</span>
                </div>
              ))}
            </div>
          </section>

          {/* Recent completions */}
          <section>
            <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Recent Completions</h2>
            <div className="space-y-2">
              {recent.length === 0 && (
                <p className="text-white/30 text-sm">Nothing completed yet.</p>
              )}
              {recent.map(c => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg px-4 py-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/90 truncate">{c.tiles?.title}</p>
                    <p className="text-xs text-white/35">{c.players?.username}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-osrs-gold">{c.tiles?.points} pts</p>
                    <p className="text-xs text-white/25">{timeAgo(c.submitted_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* All completions */}
        {completions.length > 10 && (
          <details className="mt-8 border-t border-white/5 pt-6">
            <summary className="cursor-pointer select-none text-sm text-white/35 hover:text-white/60 transition-colors">
              All completions ({completions.length})
            </summary>
            <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {completions.map(c => (
                <li
                  key={c.id}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/3 border border-white/5"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-green-400 text-xs flex-shrink-0">✓</span>
                    <span className="text-xs text-white/60 truncate">{c.tiles?.title}</span>
                  </div>
                  <span className="text-xs text-osrs-gold/70 flex-shrink-0 ml-2">{c.tiles?.points} pts</span>
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </div>
  )
}
