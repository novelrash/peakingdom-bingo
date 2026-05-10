import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav'
import Countdown from '../components/Countdown'
import { usePlayer } from '../lib/usePlayer'

const API = import.meta.env.VITE_API_URL || ''

export default function Home() {
  const [settings, setSettings] = useState(null)
  const [players, setPlayers] = useState([])
  const [stats, setStats] = useState({ teams: 0, players: 0, tilesCompleted: 0 })
  const { playerId, playerName, playerTeam, selectPlayer } = usePlayer()

  const [query, setQuery] = useState(playerName || '')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/settings`).then(r => r.json()),
      fetch(`${API}/api/players`).then(r => r.json()),
      fetch(`${API}/api/leaderboard/teams`).then(r => r.json()),
      fetch(`${API}/api/completions`).then(r => r.json()),
    ]).then(([s, pl, teams, completions]) => {
      setSettings(s)
      setPlayers(pl)
      setStats({
        teams: teams.length,
        players: pl.length,
        tilesCompleted: completions.filter(c => c.status === 'approved').length,
      })
    })
  }, [])

  const suggestions = query.length >= 1
    ? players
        .filter(p => p.username.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 8)
    : []

  function handleQueryChange(e) {
    setQuery(e.target.value)
    setDropdownOpen(true)
    if (!e.target.value) selectPlayer(null)
  }

  function handlePickPlayer(player) {
    selectPlayer(player)
    setQuery(player.username)
    setDropdownOpen(false)
  }

  function handleBlur() {
    setTimeout(() => {
      setDropdownOpen(false)
      // revert input to confirmed selection (or empty)
      setQuery(playerName || '')
    }, 150)
  }

  function handleClear() {
    selectPlayer(null)
    setQuery('')
    inputRef.current?.focus()
  }

  return (
    <div className="min-h-screen page-bg text-white flex flex-col">
      <Nav eventName={settings?.event_name} />

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16 gap-6">
        <h1 className="font-cinzel leading-none tracking-wide text-shimmer-gold drop-shadow-lg">
          <span className="block text-6xl md:text-8xl">Pea Kingdom</span>
          <span className="block text-6xl md:text-8xl">Bingo</span>
        </h1>

        {(settings?.event_start || settings?.event_end) && (
          <div className="mt-2 text-osrs-gold">
            <Countdown start={settings.event_start} end={settings.event_end} />
          </div>
        )}

        {/* Player typeahead */}
        <div className="mt-4 flex flex-col items-center gap-3 w-full max-w-xs">
          <p className="text-white/50 text-sm">Select your name to track your progress</p>

          <div className="relative w-full">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search your OSRS username…"
              value={query}
              onChange={handleQueryChange}
              onFocus={() => query.length >= 1 && setDropdownOpen(true)}
              onBlur={handleBlur}
              className="w-full bg-surface-raised border border-white/10 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-osrs-gold/40 placeholder:text-white/25 pr-8"
            />
            {query && (
              <button
                onMouseDown={e => e.preventDefault()}
                onClick={handleClear}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors text-lg leading-none"
              >
                ×
              </button>
            )}

            {dropdownOpen && suggestions.length > 0 && (
              <ul className="absolute z-20 w-full mt-1 bg-surface-overlay border border-white/10 rounded-lg shadow-2xl overflow-hidden">
                {suggestions.map(p => (
                  <li key={p.id}>
                    <button
                      onMouseDown={e => e.preventDefault()}
                      onClick={() => handlePickPlayer(p)}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-white/5 transition-colors text-left"
                    >
                      <span className="text-white/90">{p.username}</span>
                      {p.teams && (
                        <span className="flex items-center gap-1.5 text-white/40 text-xs">
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: p.teams.color }}
                          />
                          {p.teams.name}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {playerId && playerTeam && (
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: playerTeam.color }} />
              <span className="text-white/70">
                Signed in as <span className="font-semibold text-white">{playerName}</span> · {playerTeam.name}
              </span>
              <button
                onClick={handleClear}
                className="text-white/30 hover:text-white/60 ml-1 text-xs"
              >
                change
              </button>
            </div>
          )}
        </div>

        {/* CTAs */}
        <div className="flex gap-4 mt-4">
          <Link
            to="/tiles"
            className="bg-osrs-gold text-surface-base font-bold px-6 py-2.5 rounded-lg hover:bg-osrs-gold-bright transition-colors"
          >
            View Tiles
          </Link>
          <Link
            to="/leaderboard"
            className="border border-osrs-gold/30 text-osrs-gold/80 font-semibold px-6 py-2.5 rounded-lg hover:bg-osrs-gold/10 transition-colors"
          >
            Leaderboard
          </Link>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-t border-white/5 py-8">
        <div className="max-w-lg mx-auto grid grid-cols-3 gap-3 px-4">
          {[
            { value: stats.teams, label: 'Teams' },
            { value: stats.players, label: 'Players' },
            { value: stats.tilesCompleted, label: 'Tiles Completed' },
          ].map(({ value, label }) => (
            <div key={label} className="bg-surface-raised border border-osrs-gold/10 rounded-xl py-5 px-2 text-center shadow-gold-sm">
              <p className="text-3xl font-cinzel font-bold text-osrs-gold">{value}</p>
              <p className="text-white/35 text-[10px] uppercase tracking-widest mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="text-center text-white/15 text-xs py-5 border-t border-white/5">
        <Link to="/admin/login" className="hover:text-white/35 transition-colors">Admin</Link>
      </footer>
    </div>
  )
}
