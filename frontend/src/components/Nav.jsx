import { useEffect, useRef, useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { usePlayer } from '../lib/usePlayer'

const API = import.meta.env.VITE_API_URL || ''
const EVENT_NAME_KEY = 'osrs_bingo_event_name'

export default function Nav({ eventName }) {
  const displayName = eventName || localStorage.getItem(EVENT_NAME_KEY) || 'OSRS Bingo'
  if (eventName) localStorage.setItem(EVENT_NAME_KEY, eventName)

  const { playerId, playerName, playerTeam, selectPlayer } = usePlayer()

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [players, setPlayers] = useState([])
  const [playersLoaded, setPlayersLoaded] = useState(false)
  const containerRef = useRef(null)
  const inputRef = useRef(null)

  async function openDropdown() {
    setDropdownOpen(true)
    setQuery('')
    if (!playersLoaded) {
      const data = await fetch(`${API}/api/players`).then(r => r.json())
      setPlayers(data)
      setPlayersLoaded(true)
    }
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function handlePickPlayer(player) {
    selectPlayer(player)
    setDropdownOpen(false)
    setQuery('')
  }

  function handleClear(e) {
    e.preventDefault()
    selectPlayer(null)
  }

  useEffect(() => {
    if (!dropdownOpen) return
    function handler(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [dropdownOpen])

  const suggestions = query.length >= 1
    ? players.filter(p => p.username.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : []

  const linkClass = ({ isActive }) =>
    `px-3 py-1 rounded text-sm font-medium transition-colors whitespace-nowrap ${
      isActive
        ? 'bg-osrs-gold/10 text-osrs-gold'
        : 'text-white/60 hover:text-osrs-gold hover:bg-osrs-gold/10'
    }`

  const navLinks = (
    <>
      <NavLink to="/home"        className={linkClass}>Home</NavLink>
      <NavLink to="/feed"        className={linkClass}>Feed</NavLink>
      <NavLink to="/leaderboard" className={linkClass}>Leaderboard</NavLink>
      <NavLink to="/tiles"       className={linkClass}>Tiles</NavLink>
      <NavLink to="/setup"       className={linkClass}>Setup</NavLink>
    </>
  )

  return (
    <nav className="sticky top-0 z-40 bg-surface-base/90 backdrop-blur-md border-b border-osrs-gold/20 shadow-[0_2px_24px_rgba(255,176,0,0.07)]">
      <div className="max-w-6xl mx-auto px-4">

        {/* Main bar */}
        <div className="h-14 flex items-center justify-between gap-3">

          {/* Brand — visible on mobile, hidden on md+ where nav links take center */}
          <span className="md:hidden font-cinzel text-osrs-gold font-bold text-sm truncate flex-1 min-w-0">
            {displayName}
          </span>

          {/* Desktop nav links — centered */}
          <div className="hidden md:flex flex-1 items-center justify-center gap-1">
            {navLinks}
          </div>

          {/* Player selector */}
          <div ref={containerRef} className="relative flex items-center gap-2 text-sm flex-shrink-0">
            {playerName ? (
              <>
                <Link
                  to={playerTeam ? `/team/${playerTeam.id}` : '#'}
                  state={playerTeam ? { playerId } : undefined}
                  className="text-osrs-gold/90 font-medium hover:text-osrs-gold transition-colors truncate max-w-[120px]"
                >
                  {playerName}
                </Link>
                <button
                  onClick={handleClear}
                  className="text-white/25 hover:text-white/60 transition-colors text-base leading-none flex-shrink-0"
                  title="Change player"
                >
                  ×
                </button>
              </>
            ) : (
              <button
                onClick={openDropdown}
                className="px-3 py-1 rounded-lg bg-osrs-gold/15 border border-osrs-gold/30 text-osrs-gold text-xs font-semibold hover:bg-osrs-gold/25 hover:border-osrs-gold/50 transition-colors whitespace-nowrap"
              >
                Select User
              </button>
            )}

            {dropdownOpen && (
              <div className="absolute top-full right-0 mt-3 w-72 max-w-[calc(100vw-2rem)] bg-surface-overlay border border-white/10 rounded-xl shadow-2xl p-3 z-50">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search your OSRS username…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="w-full bg-surface-raised border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-osrs-gold/40 placeholder:text-white/25 mb-2"
                />
                <ul className="space-y-0.5 max-h-60 overflow-y-auto">
                  {suggestions.length === 0 && (
                    <li className="text-white/30 text-xs text-center py-3">
                      {query.length < 1 ? 'Start typing to search' : 'No players found'}
                    </li>
                  )}
                  {suggestions.map(p => (
                    <li key={p.id}>
                      <button
                        onClick={() => handlePickPlayer(p)}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-white/5 rounded-lg transition-colors text-left"
                      >
                        <span className="text-white/90">{p.username}</span>
                        {p.teams && (
                          <span className="flex items-center gap-1.5 text-white/40 text-xs">
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.teams.color }} />
                            {p.teams.name}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Mobile nav links — scrollable strip below the main bar */}
        <div className="md:hidden flex items-center gap-0.5 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
          {navLinks}
        </div>

      </div>
    </nav>
  )
}
