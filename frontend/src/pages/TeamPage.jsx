import { useEffect, useState } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
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

export default function TeamPage() {
  const { teamId } = useParams()
  const location = useLocation()
  const [team, setTeam] = useState(null)
  const [members, setMembers] = useState([])
  const [completions, setCompletions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPlayerId, setSelectedPlayerId] = useState(location.state?.playerId || null)

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/leaderboard/teams`).then(r => r.json()),
      fetch(`${API}/api/players`).then(r => r.json()),
      fetch(`${API}/api/completions`).then(r => r.json()),
    ]).then(([teams, players, allCompletions]) => {
      const teamIndex = teams.findIndex(t => t.id === teamId)
      const teamInfo = teamIndex >= 0 ? { ...teams[teamIndex], rank: teamIndex + 1 } : null
      setTeam(teamInfo)

      const teamPlayers = players.filter(p => p.team_id === teamId)
      const approved = allCompletions.filter(
        c => c.team_id === teamId && c.status === 'approved'
      )

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
    <div className="min-h-screen page-bg text-white">
      <Nav />
      <div className="text-center py-20 text-white/30">Loading…</div>
    </div>
  )

  if (!team) return (
    <div className="min-h-screen page-bg text-white">
      <Nav />
      <div className="text-center py-20 text-white/30">
        Team not found. <Link to="/leaderboard" className="text-osrs-gold/70 hover:text-osrs-gold">← Back</Link>
      </div>
    </div>
  )

  const visibleCompletions = selectedPlayerId
    ? completions.filter(c => c.player_id === selectedPlayerId)
    : completions.slice(0, 10)

  const selectedMember = members.find(m => m.id === selectedPlayerId)
  const totalTiles = completions.length

  return (
    <div className="min-h-screen page-bg text-white">
      <Nav />

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Team header */}
        <div
          className="rounded-xl border border-white/8 p-6 mb-8 relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${team.color}18 0%, transparent 60%), #0e0e1e` }}
        >
          <div
            className="absolute inset-0 opacity-5 rounded-xl"
            style={{ background: `radial-gradient(ellipse 60% 80% at 15% 50%, ${team.color}, transparent)` }}
          />
          <div className="relative flex items-center gap-5">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-cinzel font-bold text-white truncate">
                {team.name}
                {team.rank && (
                  <span className="ml-3 text-lg font-cinzel text-osrs-gold/60">#{team.rank}</span>
                )}
              </h1>
              <p className="text-white/45 text-sm mt-1">
                <span className="text-osrs-gold font-bold">{team.points} pts</span>
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Members */}
          <section>
            <h2 className="text-xs font-cinzel font-semibold text-white/40 uppercase tracking-widest mb-3">
              Members
              <span className="ml-2 text-white/20 normal-case font-sans font-normal">(click to filter)</span>
            </h2>
            <div className="space-y-2">
              {members.length === 0 && (
                <p className="text-white/30 text-sm">No members on this team.</p>
              )}
              {members.map((m, i) => {
                const isSelected = selectedPlayerId === m.id
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedPlayerId(isSelected ? null : m.id)}
                    className={[
                      'w-full flex items-center gap-3 rounded-lg px-4 py-3 border transition-all text-left cursor-pointer',
                      isSelected
                        ? 'bg-osrs-gold/10 border-osrs-gold/30 ring-1 ring-osrs-gold/20'
                        : 'bg-white/5 border-white/8 hover:bg-white/8 hover:border-white/15',
                    ].join(' ')}
                  >
                    <span className="w-5 text-center text-xs font-bold text-white/30 flex-shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${isSelected ? 'text-osrs-gold' : 'text-white/90'}`}>
                        {m.username}
                      </p>
                      <p className="text-xs text-white/35">{m.tilesCompleted} tiles</p>
                    </div>
                    <span className={`font-bold text-sm flex-shrink-0 ${isSelected ? 'text-osrs-gold' : 'text-osrs-gold/70'}`}>
                      {m.points} pts
                    </span>
                  </button>
                )
              })}
            </div>
          </section>

          {/* Completions */}
          <section>
            <h2 className="text-xs font-cinzel font-semibold text-white/40 uppercase tracking-widest mb-3 flex items-center gap-2">
              {selectedMember ? (
                <>
                  <span>{selectedMember.username}'s Tiles</span>
                  <button
                    onClick={() => setSelectedPlayerId(null)}
                    className="text-white/25 hover:text-white/60 normal-case font-sans font-normal transition-colors"
                    title="Clear filter"
                  >
                    ✕
                  </button>
                </>
              ) : 'Recent Completions'}
            </h2>
            <div className="space-y-2">
              {visibleCompletions.length === 0 && (
                <p className="text-white/30 text-sm">Nothing completed yet.</p>
              )}
              {visibleCompletions.map(c => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 bg-white/5 border border-white/8 rounded-lg px-3 py-2.5"
                >
                  {c.image_url && (
                    <a href={c.image_url} target="_blank" rel="noreferrer" className="flex-shrink-0">
                      <img src={c.image_url} className="w-10 h-10 rounded object-cover hover:opacity-80 transition-opacity" />
                    </a>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/90 truncate">{c.tiles?.title}</p>
                    {!selectedPlayerId && (
                      <p className="text-xs text-white/35">{c.players?.username}</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-osrs-gold">{c.tiles?.points} pts</p>
                    <p className="text-xs text-white/25">{timeAgo(c.submitted_at)}</p>
                  </div>
                </div>
              ))}
              {!selectedPlayerId && completions.length > 10 && (
                <p className="text-xs text-white/25 text-center pt-1">
                  Click a member to see all their completions
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
