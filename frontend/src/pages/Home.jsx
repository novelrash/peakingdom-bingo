import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav'
import Countdown from '../components/Countdown'

const API = import.meta.env.VITE_API_URL || ''

export default function Home() {
  const [settings, setSettings] = useState(null)
  const [stats, setStats] = useState({ teams: 0, players: 0, tilesCompleted: 0 })

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/settings`).then(r => r.json()),
      fetch(`${API}/api/players`).then(r => r.json()),
      fetch(`${API}/api/leaderboard/teams`).then(r => r.json()),
      fetch(`${API}/api/completions`).then(r => r.json()),
    ]).then(([s, pl, teams, completions]) => {
      setSettings(s)
      setStats({
        teams: teams.length,
        players: pl.length,
        tilesCompleted: completions.filter(c => c.status === 'approved').length,
      })
    })
  }, [])

  return (
    <div className="min-h-screen page-bg text-white flex flex-col">
      <Nav eventName={settings?.event_name} />

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16 gap-6">
        <h1 className="font-cinzel leading-none tracking-wide text-shimmer-gold drop-shadow-lg">
          <span className="block text-[11vw]">Pea Kingdom</span>
          <span className="block text-[11vw]">Bingo</span>
        </h1>

        {(settings?.event_start || settings?.event_end) && (
          <div className="mt-2 text-osrs-gold">
            <Countdown start={settings.event_start} end={settings.event_end} />
          </div>
        )}

        <div className="flex gap-4 mt-4">
          <Link
            to="/tiles"
            className="bg-osrs-gold text-surface-base font-bold px-6 py-2.5 rounded-lg hover:bg-osrs-gold-bright transition-colors"
          >
            View Tiles
          </Link>
          <Link
            to="/feed"
            className="border border-osrs-gold/30 text-osrs-gold/80 font-semibold px-6 py-2.5 rounded-lg hover:bg-osrs-gold/10 transition-colors"
          >
            Leaderboard
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
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
