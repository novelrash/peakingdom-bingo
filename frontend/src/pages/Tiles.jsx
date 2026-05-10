import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav'
import BingoGrid from '../components/BingoGrid'
import { usePlayer } from '../lib/usePlayer'

const API = import.meta.env.VITE_API_URL || ''

const TIERS = [
  { key: 'all',   label: 'All',   dot: null,                 test: () => true },
  { key: 'elite', label: 'Elite', dot: 'bg-pink-300',        test: p => p >= 100 },
  { key: 'high',  label: 'High',  dot: 'bg-purple-500',      test: p => p >= 50 && p < 100 },
  { key: 'mid',   label: 'Mid',   dot: 'bg-blue-500',        test: p => p >= 30 && p < 50 },
  { key: 'low',   label: 'Low',   dot: 'bg-emerald-500',     test: p => p < 30 },
]

const TIER_ACTIVE = {
  all:   'bg-white/15 text-white border-white/20',
  elite: 'bg-pink-900/40 text-pink-200 border-pink-400/40',
  high:  'bg-purple-900/40 text-purple-300 border-purple-500/40',
  mid:   'bg-blue-900/40 text-blue-300 border-blue-500/40',
  low:   'bg-emerald-900/40 text-emerald-300 border-emerald-500/40',
}

export default function Tiles() {
  const [settings, setSettings] = useState(null)
  const [tiles, setTiles] = useState([])
  const [completions, setCompletions] = useState([])
  const [confirmTile, setConfirmTile] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('points')
  const [tier, setTier] = useState('all')
  const [completedOpen, setCompletedOpen] = useState(false)
  const { playerId, playerName, playerTeam } = usePlayer()

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/settings`).then(r => r.json()),
      fetch(`${API}/api/tiles`).then(r => r.json()),
      fetch(`${API}/api/completions`).then(r => r.json()),
    ]).then(([s, ti, co]) => {
      setSettings(s)
      setTiles(ti)
      setCompletions(co)
    })
  }, [])

  const teamCompletions = playerTeam
    ? completions.filter(c => c.team_id === playerTeam.id)
    : []

  const approvedIds = useMemo(
    () => new Set(teamCompletions.filter(c => c.status === 'approved').map(c => c.tile_id)),
    [teamCompletions]
  )

  const filteredSorted = useMemo(() => {
    const tierTest = TIERS.find(t => t.key === tier)?.test ?? (() => true)
    let result = tiles.filter(t =>
      t.title.toLowerCase().includes(search.toLowerCase()) && tierTest(t.points)
    )
    if (sort === 'az') {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title))
    } else {
      result = [...result].sort((a, b) => b.points - a.points)
    }
    return result
  }, [tiles, search, sort, tier])

  const activeTiles = filteredSorted.filter(t => !approvedIds.has(t.id))
  const completedTiles = filteredSorted.filter(t => approvedIds.has(t.id))

  async function submitCompletion(tile) {
    setSubmitting(true)
    const res = await fetch(`${API}/api/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tile_id: tile.id, player_id: playerId }),
    })
    setSubmitting(false)
    setConfirmTile(null)
    if (res.ok) {
      const newComp = await res.json()
      setCompletions(prev => [...prev, newComp])
      showToast(`"${tile.title}" submitted — waiting for admin approval`)
    } else {
      const err = await res.json()
      showToast(err.detail, true)
    }
  }

  function showToast(msg, error = false) {
    setToast({ msg, error })
    setTimeout(() => setToast(null), 4000)
  }

  return (
    <div className="min-h-screen bg-surface-base text-white">
      <Nav eventName={settings?.event_name} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header row */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-bold text-white">Bingo Tiles</h1>
          {playerId && playerTeam ? (
            <div className="flex items-center gap-2 text-sm bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: playerTeam.color }} />
              <span className="text-white/80">
                {playerName} · <span className="font-medium text-white">{playerTeam.name}</span>
              </span>
            </div>
          ) : (
            <Link to="/home" className="text-sm text-osrs-gold/70 hover:text-osrs-gold transition-colors">
              Sign in to submit tiles →
            </Link>
          )}
        </div>

        {/* Controls */}
        <div className="space-y-2 mb-5">
          {/* Search + sort */}
          <div className="flex gap-3 items-center">
            <input
              type="text"
              placeholder="Search tiles…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-surface-raised border border-white/10 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-osrs-gold/40 placeholder:text-white/25"
            />
            <div className="flex rounded-lg overflow-hidden border border-white/10">
              <button
                onClick={() => setSort('points')}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  sort === 'points'
                    ? 'bg-osrs-gold text-surface-base'
                    : 'bg-surface-raised text-white/50 hover:text-white/80'
                }`}
              >
                Points ↓
              </button>
              <button
                onClick={() => setSort('az')}
                className={`px-3 py-2 text-sm font-medium transition-colors border-l border-white/10 ${
                  sort === 'az'
                    ? 'bg-osrs-gold text-surface-base'
                    : 'bg-surface-raised text-white/50 hover:text-white/80'
                }`}
              >
                A–Z
              </button>
            </div>
          </div>

          {/* Tier filter */}
          <div className="flex gap-1.5">
            {TIERS.map(t => (
              <button
                key={t.key}
                onClick={() => setTier(t.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  tier === t.key
                    ? TIER_ACTIVE[t.key]
                    : 'bg-surface-raised border-white/10 text-white/40 hover:text-white/70'
                }`}
              >
                {t.dot && <span className={`w-2 h-2 rounded-full ${t.dot} flex-shrink-0`} />}
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Active tiles */}
        {tiles.length === 0 ? (
          <div className="text-center py-20 text-white/30">No tiles have been added yet.</div>
        ) : activeTiles.length === 0 && (search || tier !== 'all') ? (
          <div className="text-center py-20 text-white/30">No tiles match your filters.</div>
        ) : (
          <BingoGrid
            tiles={activeTiles}
            completions={teamCompletions}
            playerId={playerId}
            onSubmit={tile => setConfirmTile(tile)}
          />
        )}

        <p className="text-xs text-white/25 mt-4 text-center">
          {!playerId
            ? 'Select your name on the home page to submit completions.'
            : 'Click a tile to submit it for admin approval.'}
        </p>

        {/* Completed tiles — collapsible */}
        {completedTiles.length > 0 && (
          <div className="mt-10 border-t border-white/5 pt-6">
            <button
              onClick={() => setCompletedOpen(o => !o)}
              className="flex items-center gap-2 text-sm text-white/35 hover:text-white/60 transition-colors select-none"
            >
              <span className={`transition-transform duration-200 ${completedOpen ? 'rotate-90' : ''}`}>▶</span>
              Completed by your team ({completedTiles.length})
            </button>
            {completedOpen && (
              <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
                {completedTiles.map(tile => (
                  <li key={tile.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/3 border border-white/5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-green-400 text-xs flex-shrink-0">✓</span>
                      <span className="text-xs text-white/30 line-through truncate">{tile.title}</span>
                    </div>
                    <span className="text-xs text-white/20 flex-shrink-0 ml-2">{tile.points} pts</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Confirm modal */}
      {confirmTile && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-surface-raised border border-white/10 rounded-xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-lg mb-1 text-white">Submit completion?</h3>
            <p className="text-white/90 font-medium">{confirmTile.title}</p>
            <p className="text-sm text-white/50 mt-1">{confirmTile.points} pts · pending admin approval</p>
            {confirmTile.description && (
              <p className="text-sm text-white/60 mt-2">{confirmTile.description}</p>
            )}
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => submitCompletion(confirmTile)}
                disabled={submitting}
                className="flex-1 bg-osrs-gold text-surface-base py-2 rounded-lg font-bold hover:bg-osrs-gold-bright disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Submitting…' : 'Yes, submit'}
              </button>
              <button
                onClick={() => setConfirmTile(null)}
                className="flex-1 border border-white/10 py-2 rounded-lg text-white/60 hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm max-w-xs ${
          toast.error
            ? 'bg-red-900/90 border border-red-500/30 text-red-200'
            : 'bg-surface-overlay border border-osrs-gold/20 text-white'
        }`}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
