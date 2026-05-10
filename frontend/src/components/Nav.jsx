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
    <nav className="sticky top-0 z-40 bg-surface-base/90 backdrop-blur-md border-b border-osrs-gold/20 shadow-[0_2px_24px_rgba(255,176,0,0.07)]">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <NavLink
          to="/home"
          className="text-osrs-gold hover:text-osrs-gold-bright transition-colors"
          title="Home"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
            <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
          </svg>
        </NavLink>

        <div className="flex items-center gap-1">
          <NavLink to="/feed" className={linkClass}>Feed</NavLink>
          <NavLink to="/tiles" className={linkClass}>Tiles</NavLink>
        </div>

        <div className="flex items-center gap-2 text-sm min-w-32 justify-end">
          {playerName ? (
            <>
              <span className="text-osrs-gold/90 font-medium">{playerName}</span>
              {playerTeam && (
                <NavLink
                  to={`/team/${playerTeam.id}`}
                  className="text-white/40 hover:text-white/80 transition-colors text-xs"
                >
                  My Team
                </NavLink>
              )}
            </>
          ) : (
            <NavLink to="/home" className="text-white/35 hover:text-white/60 transition-colors text-xs">
              not signed in
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  )
}
