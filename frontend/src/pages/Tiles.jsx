import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav'
import BingoGrid from '../components/BingoGrid'
import { usePlayer } from '../lib/usePlayer'
import { supabase } from '../lib/supabase'

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
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploadError, setUploadError] = useState(null)
  const [toast, setToast] = useState(null)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('points')
  const [tier, setTier] = useState('all')
  const [showCompleted, setShowCompleted] = useState(false)
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
  const displayTiles = showCompleted ? filteredSorted : activeTiles

  function handleImageSelect(file) {
    if (!file) return
    setImageFile(file)
    setUploadError(null)
    const reader = new FileReader()
    reader.onload = e => setImagePreview(e.target.result)
    reader.readAsDataURL(file)
  }

  function clearImage() {
    setImageFile(null)
    setImagePreview(null)
    setUploadError(null)
  }

  async function submitCompletion(tile) {
    setSubmitting(true)
    setUploadError(null)
    let image_url = null

    if (imageFile) {
      const ext = imageFile.name.split('.').pop()
      const path = `manual/${playerId}/${tile.id}_${Date.now()}.${ext}`
      const { data, error } = await supabase.storage
        .from('completion-images')
        .upload(path, imageFile, { contentType: imageFile.type, upsert: false })
      if (error) {
        setUploadError(`Image upload failed: ${error.message}`)
        setSubmitting(false)
        return
      }
      const { data: { publicUrl } } = supabase.storage.from('completion-images').getPublicUrl(data.path)
      image_url = publicUrl
    }

    const res = await fetch(`${API}/api/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tile_id: tile.id, player_id: playerId, image_url }),
    })
    setSubmitting(false)
    setConfirmTile(null)
    clearImage()
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
    <div className="min-h-screen page-bg text-white">
      <Nav eventName={settings?.event_name} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header row */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-cinzel font-bold text-osrs-gold">Bingo Tiles</h1>
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

          {/* Tier filter + completed toggle */}
          <div className="flex items-center justify-between gap-2">
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

            {approvedIds.size > 0 && (
              <label className="flex items-center gap-2 cursor-pointer select-none flex-shrink-0">
                <input
                  type="checkbox"
                  checked={showCompleted}
                  onChange={e => setShowCompleted(e.target.checked)}
                  className="w-3.5 h-3.5 rounded accent-green-500 cursor-pointer"
                />
                <span className="text-xs text-white/40 hover:text-white/60 transition-colors">
                  Show completed ({approvedIds.size})
                </span>
              </label>
            )}
          </div>
        </div>

        {tiles.length === 0 ? (
          <div className="text-center py-20 text-white/30">No tiles have been added yet.</div>
        ) : displayTiles.length === 0 && (search || tier !== 'all') ? (
          <div className="text-center py-20 text-white/30">No tiles match your filters.</div>
        ) : (
          <BingoGrid
            tiles={displayTiles}
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

            <div className="mt-4">
              <label className="block text-xs text-white/50 mb-1.5">
                Screenshot <span className="text-red-400/70">*required</span>
              </label>
              {imagePreview ? (
                <div className="relative rounded-lg overflow-hidden border border-white/10">
                  <img src={imagePreview} alt="Preview" className="w-full max-h-40 object-cover" />
                  <button
                    onClick={clearImage}
                    className="absolute top-1.5 right-1.5 bg-black/60 text-white/70 hover:text-white rounded-full w-6 h-6 flex items-center justify-center text-xs transition-colors"
                  >✕</button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 bg-white/5 border border-dashed border-white/15 rounded-lg px-3 py-4 cursor-pointer hover:border-white/30 hover:bg-white/8 transition-colors">
                  <span className="text-xs text-white/40">Click to attach screenshot…</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => handleImageSelect(e.target.files?.[0] || null)}
                  />
                </label>
              )}
              {uploadError && (
                <p className="text-xs text-red-400 mt-1.5">{uploadError}</p>
              )}
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => submitCompletion(confirmTile)}
                disabled={submitting || !imageFile}
                className="flex-1 bg-osrs-gold text-surface-base py-2 rounded-lg font-bold hover:bg-osrs-gold-bright disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Uploading image…' : 'Yes, submit'}
              </button>
              <button
                onClick={() => { setConfirmTile(null); clearImage() }}
                disabled={submitting}
                className="flex-1 border border-white/10 py-2 rounded-lg text-white/60 hover:bg-white/5 disabled:opacity-40 transition-colors"
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
