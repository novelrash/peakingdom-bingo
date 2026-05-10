import { NavLink } from 'react-router-dom'

const PLAYER_NAME_KEY = 'osrs_bingo_player_name'
const PLAYER_TEAM_KEY = 'osrs_bingo_player_team'
const EVENT_NAME_KEY  = 'osrs_bingo_event_name'

export default function Nav({ eventName }) {
  const displayName = eventName || localStorage.getItem(EVENT_NAME_KEY) || 'OSRS Bingo'
  if (eventName) localStorage.setItem(EVENT_NAME_KEY, eventName)
  const playerName = localStorage.getItem(PLAYER_NAME_KEY)
  const playerTeam = (() => {
    try { return JSON.parse(localStorage.getItem(PLAYER_TEAM_KEY)) } catch { return null }
  })()

  const linkClass = ({ isActive }) =>
    `px-3 py-1 rounded text-sm font-medium transition-colors ${
      isActive
        ? 'bg-osrs-gold/10 text-osrs-gold'
        : 'text-white/60 hover:text-osrs-gold hover:bg-osrs-gold/10'
    }`

  return (
    <nav className="bg-surface-base border-b border-osrs-gold/25">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <NavLink to="/home" className="text-osrs-gold font-bold tracking-tight text-lg">
          {displayName}
        </NavLink>

        <div className="flex items-center gap-1">
          <NavLink to="/home" className={linkClass}>Home</NavLink>
          <NavLink to="/tiles" className={linkClass}>Tiles</NavLink>
          <NavLink to="/leaderboard" className={linkClass}>Leaderboard</NavLink>
        </div>

        <div className="flex items-center gap-2 text-sm min-w-32 justify-end">
          {playerName ? (
            <>
              <span className="text-osrs-gold/90">{playerName}</span>
              {playerTeam && (
                <NavLink
                  to={`/team/${playerTeam.id}`}
                  className="flex items-center gap-1 text-white/40 hover:text-white/80 transition-colors"
                  title={playerTeam.name}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: playerTeam.color }} />
                  <span className="text-xs">My Team</span>
                </NavLink>
              )}
            </>
          ) : (
            <NavLink to="/home" className="text-white/40 hover:text-white/70 transition-colors">
              not signed in
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  )
}
