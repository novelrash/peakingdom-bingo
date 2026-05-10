import { useEffect, useState } from 'react'
import Nav from '../components/Nav'
import Leaderboard from '../components/Leaderboard'

const API = import.meta.env.VITE_API_URL || ''

export default function LeaderboardPage() {
  const [settings, setSettings] = useState(null)
  const [teamLeaderboard, setTeamLeaderboard] = useState([])
  const [playerLeaderboard, setPlayerLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/settings`).then(r => r.json()),
      fetch(`${API}/api/leaderboard/teams`).then(r => r.json()),
      fetch(`${API}/api/leaderboard/players`).then(r => r.json()),
    ]).then(([s, teams, players]) => {
      setSettings(s)
      setTeamLeaderboard(teams)
      setPlayerLeaderboard(players)
      setLoading(false)
    })
  }, [])

  return (
    <div className="min-h-screen page-bg text-white">
      <Nav eventName={settings?.event_name} />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-cinzel font-bold text-osrs-gold mb-6">Leaderboard</h1>

        {loading ? (
          <p className="text-white/30 text-center py-12">Loading...</p>
        ) : (
          <div className="bg-surface-raised border border-osrs-gold/10 rounded-xl shadow-gold-sm p-6">
            <Leaderboard teams={teamLeaderboard} players={playerLeaderboard} />
          </div>
        )}
      </div>
    </div>
  )
}
