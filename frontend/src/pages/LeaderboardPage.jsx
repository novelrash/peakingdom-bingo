import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav'

const API = import.meta.env.VITE_API_URL || ''
const PAGE_SIZE = 10

const RANK_STYLES = [
  { border: 'border-l-yellow-400', bg: 'bg-yellow-500/5', text: 'text-yellow-300', num: 'text-yellow-400' },
  { border: 'border-l-slate-300',  bg: 'bg-slate-400/4',  text: 'text-slate-300',  num: 'text-slate-400' },
  { border: 'border-l-amber-600',  bg: 'bg-amber-700/6',  text: 'text-amber-500',  num: 'text-amber-600' },
]

function Pager({ page, total, onPage }) {
  if (total <= 1) return null
  return (
    <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5 text-sm">
      <button
        onClick={() => onPage(p => Math.max(0, p - 1))}
        disabled={page === 0}
        className="px-3 py-1.5 rounded border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >← Prev</button>
      <span className="text-white/30 text-xs">{page + 1} / {total}</span>
      <button
        onClick={() => onPage(p => Math.min(total - 1, p + 1))}
        disabled={page >= total - 1}
        className="px-3 py-1.5 rounded border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >Next →</button>
    </div>
  )
}

export default function LeaderboardPage() {
  const [settings, setSettings] = useState(null)
  const [teams, setTeams] = useState([])
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [teamPage, setTeamPage] = useState(0)
  const [playerPage, setPlayerPage] = useState(0)

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/settings`).then(r => r.json()),
      fetch(`${API}/api/leaderboard/teams`).then(r => r.json()),
      fetch(`${API}/api/leaderboard/players`).then(r => r.json()),
    ]).then(([s, t, p]) => {
      setSettings(s)
      setTeams(t)
      setPlayers(p)
      setLoading(false)
    })
  }, [])

  const totalTeamPages   = Math.ceil(teams.length / PAGE_SIZE)
  const totalPlayerPages = Math.ceil(players.length / PAGE_SIZE)
  const pagedTeams   = teams.slice(teamPage * PAGE_SIZE, (teamPage + 1) * PAGE_SIZE)
  const pagedPlayers = players.slice(playerPage * PAGE_SIZE, (playerPage + 1) * PAGE_SIZE)

  return (
    <div className="min-h-screen page-bg text-white">
      <Nav eventName={settings?.event_name} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/feed" className="text-white/30 hover:text-white/60 transition-colors text-sm">← Back</Link>
          <h1 className="text-2xl font-cinzel font-bold text-osrs-gold">Full Rankings</h1>
        </div>

        {loading ? (
          <div className="text-center py-20 text-white/30">Loading…</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Teams */}
            <section>
              <h2 className="text-xs font-cinzel font-semibold text-white/40 uppercase tracking-widest mb-3">Team Rankings</h2>
              <div className="bg-surface-raised border border-osrs-gold/10 rounded-xl shadow-gold-sm overflow-hidden">
                <ol className="divide-y divide-white/10">
                  {pagedTeams.length === 0 && <li className="text-white/30 text-sm py-4 text-center px-4">No scores yet.</li>}
                  {pagedTeams.map((team, i) => {
                    const rank = teamPage * PAGE_SIZE + i
                    const ranked = rank < 3
                    const rs = RANK_STYLES[rank] ?? null
                    return (
                      <li key={team.id}>
                        <Link
                          to={`/team/${team.id}`}
                          className={[
                            'flex items-center gap-3 border-l-4 px-4 transition-all group',
                            ranked ? `${rs.border} ${rs.bg} py-3 hover:brightness-110` : 'border-l-white/10 py-2.5 hover:bg-white/4',
                          ].join(' ')}
                        >
                          <span className={`font-cinzel font-bold flex-shrink-0 ${ranked ? `text-lg ${rs.num}` : 'text-sm text-white/30'}`}>{rank + 1}</span>
                          <span className={`flex-1 font-semibold group-hover:underline underline-offset-2 ${ranked ? 'text-base text-white' : 'text-sm text-white/80'}`}>{team.name}</span>
                          <span className={`font-bold ${ranked ? `text-base ${rs.text}` : 'text-sm text-osrs-gold/80'}`}>{team.points} pts</span>
                          <span className="text-white/30 text-sm group-hover:text-white/60 group-hover:translate-x-0.5 transition-all">→</span>
                        </Link>
                      </li>
                    )
                  })}
                </ol>
                <div className="px-4 pb-4">
                  <Pager page={teamPage} total={totalTeamPages} onPage={setTeamPage} />
                </div>
              </div>

            </section>

            {/* Players */}
            <section>
              <h2 className="text-xs font-cinzel font-semibold text-white/40 uppercase tracking-widest mb-3">Player Rankings</h2>
              <div className="bg-surface-raised border border-osrs-gold/10 rounded-xl shadow-gold-sm overflow-hidden">
                <ol className="divide-y divide-white/10">
                  {pagedPlayers.length === 0 && <li className="text-white/30 text-sm py-4 text-center px-4">No scores yet.</li>}
                  {pagedPlayers.map((player, i) => {
                    const rank = playerPage * PAGE_SIZE + i
                    const ranked = rank < 3
                    const rs = RANK_STYLES[rank] ?? null
                    const inner = (
                      <>
                        <span className={`font-cinzel font-bold flex-shrink-0 ${ranked ? `text-lg ${rs.num}` : 'text-sm text-white/30'}`}>{rank + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold truncate group-hover:underline underline-offset-2 ${ranked ? 'text-base text-white' : 'text-sm text-white/80'}`}>{player.username}</p>
                          {player.team && <p className={`text-xs truncate ${ranked ? rs.text + '/70' : 'text-white/35'}`}>{player.team.name}</p>}
                        </div>
                        <span className={`font-bold flex-shrink-0 ${ranked ? `text-base ${rs.text}` : 'text-sm text-osrs-gold/80'}`}>{player.points} pts</span>
                        <span className="text-white/30 text-sm group-hover:text-white/60 group-hover:translate-x-0.5 transition-all">→</span>
                      </>
                    )
                    const cls = [
                      'flex items-center gap-3 border-l-4 px-4 transition-all group',
                      ranked ? `${rs.border} ${rs.bg} py-3 hover:brightness-110` : 'border-l-white/10 py-2.5 hover:bg-white/4',
                    ].join(' ')
                    return (
                      <li key={player.id}>
                        {player.team
                          ? <Link to={`/team/${player.team.id}`} state={{ playerId: player.id }} className={cls}>{inner}</Link>
                          : <div className={cls}>{inner}</div>}
                      </li>
                    )
                  })}
                </ol>
                <div className="px-4 pb-4">
                  <Pager page={playerPage} total={totalPlayerPages} onPage={setPlayerPage} />
                </div>
              </div>
            </section>

          </div>
        )}
      </div>
    </div>
  )
}
