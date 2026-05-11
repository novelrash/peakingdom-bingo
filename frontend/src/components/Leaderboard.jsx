import { useState } from 'react'
import { Link } from 'react-router-dom'

const RANK_STYLES = [
  { border: 'border-l-yellow-400',  bg: 'bg-yellow-500/5',  text: 'text-yellow-300', num: 'text-yellow-400' },
  { border: 'border-l-slate-300',   bg: 'bg-slate-400/4',   text: 'text-slate-300',  num: 'text-slate-400' },
  { border: 'border-l-amber-600',   bg: 'bg-amber-700/6',   text: 'text-amber-500',  num: 'text-amber-600' },
]

export default function Leaderboard({ teams, players }) {
  const [tab, setTab] = useState('teams')
  const [expandedTeams, setExpandedTeams] = useState(new Set())

  const playersByTeam = {}
  for (const p of players) {
    if (p.team?.id) {
      if (!playersByTeam[p.team.id]) playersByTeam[p.team.id] = []
      playersByTeam[p.team.id].push(p)
    }
  }

  function toggleTeam(id) {
    setExpandedTeams(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div>
      <div className="flex gap-4 border-b border-white/10 mb-5">
        {['teams', 'players'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-2 capitalize font-medium text-sm transition-colors ${
              tab === t
                ? 'border-b-2 border-osrs-gold text-osrs-gold'
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'teams' && (
        <ol className="space-y-2">
          {teams.length === 0 && <li className="text-white/30 text-sm py-4 text-center">No scores yet.</li>}
          {teams.map((team, i) => {
            const ranked = i < 3
            const rs = RANK_STYLES[i] ?? null
            const isExpanded = expandedTeams.has(team.id)
            const members = (playersByTeam[team.id] || []).slice().sort((a, b) => b.points - a.points)
            return (
              <li key={team.id}>
                <div className={[
                  'rounded-lg border-l-4 border border-white/5 overflow-hidden',
                  ranked ? `${rs.border} ${rs.bg}` : 'border-l-white/10 bg-white/3',
                ].join(' ')}>
                  <div className="flex items-center">
                    <Link
                      to={`/team/${team.id}`}
                      className={[
                        'flex flex-1 items-center gap-3 px-4 transition-all cursor-pointer group',
                        ranked ? 'py-3.5 hover:brightness-110' : 'py-2.5 hover:bg-white/4',
                      ].join(' ')}
                    >
                      <span className={`font-cinzel font-bold flex-shrink-0 ${ranked ? `text-lg ${rs.num}` : 'text-sm text-white/30'}`}>
                        {i + 1}
                      </span>
                      <span className={`flex-1 font-semibold group-hover:underline underline-offset-2 transition-colors ${ranked ? 'text-base text-white' : 'text-sm text-white/80'}`}>
                        {team.name}
                      </span>
                      <span className={`font-bold ${ranked ? `text-base ${rs.text}` : 'text-sm text-osrs-gold/80'}`}>
                        {team.points} pts
                      </span>
                    </Link>
                    <button
                      onClick={() => toggleTeam(team.id)}
                      className="px-3 py-2 text-white/30 hover:text-white/70 transition-colors flex-shrink-0 self-stretch flex items-center border-l border-white/5"
                    >
                      <span className={`text-base leading-none transition-transform duration-150 inline-block ${isExpanded ? 'rotate-180' : ''}`}>▾</span>
                    </button>
                  </div>
                  {isExpanded && (
                    <div className="border-t border-white/10 bg-black/20 divide-y divide-white/5">
                      {members.length === 0
                        ? <p className="text-xs text-white/30 px-4 py-2 text-center">No members</p>
                        : members.map(m => (
                          <Link
                            key={m.id}
                            to={`/team/${team.id}`}
                            state={{ playerId: m.id }}
                            className="flex items-center justify-between px-6 py-2 hover:bg-white/5 transition-colors group"
                          >
                            <span className="text-sm text-white/65 group-hover:text-white/90 transition-colors">{m.username}</span>
                            <span className="text-sm font-medium text-osrs-gold/60">{m.points} pts</span>
                          </Link>
                        ))
                      }
                    </div>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      )}

      {tab === 'players' && (
        <ol className="space-y-1">
          {players.length === 0 && <li className="text-white/30 text-sm py-4 text-center">No scores yet.</li>}
          {players.map((player, i) => (
            <li key={player.id} className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
              <span className="w-6 text-center text-xs font-bold text-white/30 flex-shrink-0">{i + 1}</span>
              <div className="flex-1">
                {player.team ? (
                  <Link
                    to={`/team/${player.team.id}`}
                    state={{ playerId: player.id }}
                    className="font-medium text-white/90 hover:text-osrs-gold hover:underline underline-offset-2 transition-colors"
                  >
                    {player.username}
                  </Link>
                ) : (
                  <p className="font-medium text-white/90">{player.username}</p>
                )}
                {player.team && (
                  <Link
                    to={`/team/${player.team.id}`}
                    className="text-xs text-white/35 hover:text-osrs-gold/70 hover:underline underline-offset-2 transition-colors"
                  >
                    {player.team.name}
                  </Link>
                )}
              </div>
              <span className="font-bold text-osrs-gold text-sm">{player.points} pts</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
