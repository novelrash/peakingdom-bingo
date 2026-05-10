import { useState } from 'react'
import { Link } from 'react-router-dom'

function RankBadge({ rank }) {
  const base = 'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0'
  if (rank === 1) return (
    <span className={base} style={{ background: 'radial-gradient(circle, #ffd700, #ffed4e)', color: '#0a0a0a' }}>1</span>
  )
  if (rank === 2) return (
    <span className={base} style={{ background: 'radial-gradient(circle, #c0c0c0, #e5e5e5)', color: '#0a0a0a' }}>2</span>
  )
  if (rank === 3) return (
    <span className={base} style={{ background: 'radial-gradient(circle, #cd7f32, #daa520)', color: '#fff' }}>3</span>
  )
  return (
    <span className={`${base} bg-white/10 text-white/40`}>{rank}</span>
  )
}

export default function Leaderboard({ teams, players }) {
  const [tab, setTab] = useState('teams')

  return (
    <div>
      <div className="flex gap-4 border-b border-white/10 mb-4">
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
        <ol className="space-y-1">
          {teams.length === 0 && <li className="text-white/30 text-sm py-4 text-center">No scores yet.</li>}
          {teams.map((team, i) => (
            <li key={team.id}>
              <Link
                to={`/team/${team.id}`}
                className="flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-lg border border-transparent hover:bg-white/5 hover:border-white/10 transition-all group"
              >
                <RankBadge rank={i + 1} />
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: team.color }} />
                <span className="flex-1 font-medium text-white/90 group-hover:text-osrs-gold transition-colors">
                  {team.name}
                </span>
                <span className="font-bold text-osrs-gold">{team.points} pts</span>
                <span className="text-white/20 text-xs group-hover:text-white/40 transition-colors">→</span>
              </Link>
            </li>
          ))}
        </ol>
      )}

      {tab === 'players' && (
        <ol className="space-y-1">
          {players.length === 0 && <li className="text-white/30 text-sm py-4 text-center">No scores yet.</li>}
          {players.map((player, i) => (
            <li key={player.id} className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
              <RankBadge rank={i + 1} />
              <div className="flex-1">
                <p className="font-medium text-white/90">{player.username}</p>
                {player.team && (
                  <Link
                    to={`/team/${player.team.id || ''}`}
                    className="text-xs text-white/35 hover:text-osrs-gold/70 transition-colors"
                  >
                    {player.team.name}
                  </Link>
                )}
              </div>
              <span className="font-bold text-osrs-gold">{player.points} pts</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
