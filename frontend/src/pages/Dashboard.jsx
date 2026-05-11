import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const API = import.meta.env.VITE_API_URL || ''

const TRIGGER_TYPES = [
  { value: '',                 label: 'None (manual)' },
  { value: 'LOOT',             label: 'Loot Drop' },
  { value: 'COLLECTION',       label: 'Collection Log' },
  { value: 'KILL_COUNT',       label: 'Kill Count' },
  { value: 'QUEST',            label: 'Quest' },
  { value: 'LEVEL',            label: 'Level Up' },
  { value: 'PET',              label: 'Pet' },
  { value: 'COMBAT_ACHIEVEMENT', label: 'Combat Task' },
  { value: 'DEATH',            label: 'Death' },
]

const SKILLS = ['Attack','Strength','Defence','Hitpoints','Ranged','Prayer','Magic',
  'Cooking','Woodcutting','Fletching','Fishing','Firemaking','Crafting','Smithing',
  'Mining','Herblore','Agility','Thieving','Slayer','Farming','Runecraft','Hunter','Construction']

function buildTrigger(type, cfg, tileTitle = '') {
  if (!type) return null
  const item  = cfg.useTitle ? tileTitle : (cfg.item  || '')
  const boss  = cfg.useTitle ? tileTitle : (cfg.boss  || '')
  const quest = cfg.useTitle ? tileTitle : (cfg.quest || '')
  const pet   = cfg.useTitle ? tileTitle : (cfg.pet   || '')
  const task  = cfg.useTitle ? tileTitle : (cfg.task  || '')
  switch (type) {
    case 'LOOT':
      return cfg.useContains ? { type, item_contains: item } : { type, item }
    case 'COLLECTION':  return { type, item }
    case 'KILL_COUNT':  return { type, boss, ...(cfg.min_count ? { min_count: Number(cfg.min_count) } : {}) }
    case 'QUEST':       return { type, quest }
    case 'LEVEL':       return { type, skill: cfg.skill || 'Attack', level: Number(cfg.level) || 99 }
    case 'PET':         return pet ? { type, pet } : { type }
    case 'COMBAT_ACHIEVEMENT': return { type, task }
    case 'DEATH':       return { type }
    default:            return null
  }
}

function parseTrigger(trigger) {
  if (!trigger) return { type: '', cfg: {} }
  const { type, item, item_contains, boss, min_count, quest, skill, level, pet, task } = trigger
  const cfg = {
    item: item || item_contains || '',
    useContains: !!item_contains,
    boss: boss || '',
    min_count: min_count || '',
    quest: quest || '',
    skill: skill || 'Attack',
    level: level || 99,
    pet: pet || '',
    task: task || '',
  }
  return { type: type || '', cfg }
}

function TriggerBuilder({ type, cfg, setType, setCfg, tileTitle = '' }) {
  function SameTitleCheckbox({ field }) {
    const checked = !!cfg.useTitle
    return (
      <label className="flex items-center gap-1.5 text-xs text-white/40 cursor-pointer select-none mt-1 w-fit">
        <input
          type="checkbox"
          checked={checked}
          onChange={e => {
            if (e.target.checked) setCfg(c => ({ ...c, [field]: tileTitle, useTitle: true }))
            else setCfg(c => ({ ...c, useTitle: false }))
          }}
          className="accent-violet-500"
        />
        Same as title
      </label>
    )
  }
  const inputCls = 'bg-surface-overlay border border-white/10 text-white rounded px-3 py-2 w-full focus:outline-none focus:border-osrs-gold/40 placeholder:text-white/30 text-sm'
  const labelCls = 'block text-xs text-white/50 mb-1'
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {TRIGGER_TYPES.map(t => (
          <button
            key={t.value}
            type="button"
            onClick={() => setType(t.value)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
              type === t.value
                ? 'bg-osrs-gold text-surface-base'
                : 'bg-white/5 border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {type === 'LOOT' && (
        <div className="space-y-2">
          <div>
            <label className={labelCls}>Item name</label>
            <input className={inputCls} placeholder="e.g. Twisted bow" value={cfg.useTitle ? tileTitle : (cfg.item || '')} disabled={!!cfg.useTitle} onChange={e => setCfg(c => ({ ...c, item: e.target.value }))} />
            <SameTitleCheckbox field="item" />
          </div>
          <label className="flex items-center gap-2 text-xs text-white/50 cursor-pointer select-none">
            <input type="checkbox" checked={!!cfg.useContains} onChange={e => setCfg(c => ({ ...c, useContains: e.target.checked }))} className="accent-violet-500" />
            Use partial match (item name <em>contains</em> text above)
          </label>
        </div>
      )}

      {type === 'COLLECTION' && (
        <div>
          <label className={labelCls}>Item name</label>
          <input className={inputCls} placeholder="e.g. Twisted bow" value={cfg.useTitle ? tileTitle : (cfg.item || '')} disabled={!!cfg.useTitle} onChange={e => setCfg(c => ({ ...c, item: e.target.value }))} />
          <SameTitleCheckbox field="item" />
        </div>
      )}

      {type === 'KILL_COUNT' && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={labelCls}>Boss name</label>
            <input className={inputCls} placeholder="e.g. Zulrah" value={cfg.useTitle ? tileTitle : (cfg.boss || '')} disabled={!!cfg.useTitle} onChange={e => setCfg(c => ({ ...c, boss: e.target.value }))} />
            <SameTitleCheckbox field="boss" />
          </div>
          <div>
            <label className={labelCls}>Min kills (optional)</label>
            <input type="number" min={1} className={inputCls} placeholder="e.g. 100" value={cfg.min_count || ''} onChange={e => setCfg(c => ({ ...c, min_count: e.target.value }))} />
          </div>
        </div>
      )}

      {type === 'QUEST' && (
        <div>
          <label className={labelCls}>Quest name</label>
          <input className={inputCls} placeholder="e.g. Dragon Slayer II" value={cfg.useTitle ? tileTitle : (cfg.quest || '')} disabled={!!cfg.useTitle} onChange={e => setCfg(c => ({ ...c, quest: e.target.value }))} />
          <SameTitleCheckbox field="quest" />
        </div>
      )}

      {type === 'LEVEL' && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={labelCls}>Skill</label>
            <select className={inputCls} value={cfg.skill || 'Attack'} onChange={e => setCfg(c => ({ ...c, skill: e.target.value }))}>
              {SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Level</label>
            <input type="number" min={2} max={99} className={inputCls} value={cfg.level || 99} onChange={e => setCfg(c => ({ ...c, level: e.target.value }))} />
          </div>
        </div>
      )}

      {type === 'PET' && (
        <div>
          <label className={labelCls}>Pet name (leave blank for any pet)</label>
          <input className={inputCls} placeholder="e.g. Olmlet" value={cfg.useTitle ? tileTitle : (cfg.pet || '')} disabled={!!cfg.useTitle} onChange={e => setCfg(c => ({ ...c, pet: e.target.value }))} />
          <SameTitleCheckbox field="pet" />
        </div>
      )}

      {type === 'COMBAT_ACHIEVEMENT' && (
        <div>
          <label className={labelCls}>Task name (partial match)</label>
          <input className={inputCls} placeholder="e.g. Verzik Speed-Runner" value={cfg.useTitle ? tileTitle : (cfg.task || '')} disabled={!!cfg.useTitle} onChange={e => setCfg(c => ({ ...c, task: e.target.value }))} />
          <SameTitleCheckbox field="task" />
        </div>
      )}

      {type === 'DEATH' && (
        <p className="text-xs text-white/30">Triggers on any death event.</p>
      )}

      {type && (
        <div className="font-mono text-xs text-white/30 bg-black/30 rounded px-3 py-2 break-all">
          {JSON.stringify(buildTrigger(type, cfg))}
        </div>
      )}
    </div>
  )
}

async function authHeader() {
  const { data } = await supabase.auth.getSession()
  return { Authorization: `Bearer ${data.session.access_token}` }
}

async function api(path, method = 'GET', body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (res.status === 204) return null
  return res.json()
}

const inputCls = 'bg-surface-overlay border border-white/10 text-white rounded px-3 py-2 w-full focus:outline-none focus:border-osrs-gold/40 placeholder:text-white/30'
const labelCls = 'block text-xs text-white/50 mb-1'

export default function Dashboard() {
  const [tab, setTab] = useState('completions')
  const [teams, setTeams] = useState([])
  const [tiles, setTiles] = useState([])
  const [pending, setPending] = useState([])
  const [settings, setSettings] = useState({})
  const [newTeam, setNewTeam] = useState({ name: '', color: '#3b82f6' })
  const [newPlayer, setNewPlayer] = useState({ username: '', team_id: '' })
  const [newTile, setNewTile] = useState({ title: '', description: '', points: 1 })
  const [newTriggerType, setNewTriggerType] = useState('')
  const [newTriggerCfg, setNewTriggerCfg] = useState({})
  const [editingTile, setEditingTile] = useState(null)
  const [selectedTiles, setSelectedTiles] = useState(new Set())
  const [resetting, setResetting] = useState(false)
  const [editSettings, setEditSettings] = useState({ event_name: '', event_start: '', event_end: '' })
  const [dinkConfigRaw, setDinkConfigRaw] = useState('')
  const [dinkConfigError, setDinkConfigError] = useState('')
  const [approved, setApproved] = useState([])
  const [saving, setSaving] = useState(false)
  const [savingDink, setSavingDink] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => { load() }, [tab])

  async function load() {
    const [t, ti, p, a, s] = await Promise.all([
      api('/api/admin/teams'),
      api('/api/tiles'),
      tab === 'completions' ? api('/api/admin/completions') : Promise.resolve([]),
      tab === 'completions' ? api('/api/admin/completions/approved') : Promise.resolve([]),
      api('/api/admin/settings'),
    ])
    setTeams(t || [])
    setTiles(ti || [])
    setPending(p || [])
    setApproved(a || [])
    setSettings(s || {})
    setEditSettings({
      event_name: s?.event_name || '',
      event_start: s?.event_start ? s.event_start.slice(0, 16) : '',
      event_end: s?.event_end ? s.event_end.slice(0, 16) : '',
    })
    setDinkConfigRaw(s?.dink_config ? JSON.stringify(s.dink_config, null, 2) : '')
  }

  async function addTeam(e) {
    e.preventDefault()
    await api('/api/admin/teams', 'POST', newTeam)
    setNewTeam({ name: '', color: '#3b82f6' })
    load()
  }

  async function deleteTeam(id) {
    if (!confirm('Delete this team and all its players?')) return
    await api(`/api/admin/teams/${id}`, 'DELETE')
    load()
  }

  async function addPlayer(e) {
    e.preventDefault()
    await api('/api/admin/players', 'POST', newPlayer)
    setNewPlayer({ username: '', team_id: newPlayer.team_id })
    load()
  }

  async function deletePlayer(id) {
    await api(`/api/admin/players/${id}`, 'DELETE')
    load()
  }

  async function addTile(e) {
    e.preventDefault()
    const payload = {
      title: newTile.title,
      description: newTile.description || null,
      points: Number(newTile.points),
      trigger_data: buildTrigger(newTriggerType, newTriggerCfg, newTile.title),
    }
    await api('/api/admin/tiles', 'POST', payload)
    setNewTile({ title: '', description: '', points: 1 })
    setNewTriggerType('')
    setNewTriggerCfg({})
    load()
  }

  async function deleteTile(id) {
    if (!confirm('Delete this tile?')) return
    await api(`/api/admin/tiles/${id}`, 'DELETE')
    load()
  }

  async function bulkDeleteTiles() {
    if (!selectedTiles.size) return
    if (!confirm(`Delete ${selectedTiles.size} tile(s)? This cannot be undone.`)) return
    await api('/api/admin/tiles/bulk-delete', 'POST', { ids: [...selectedTiles] })
    setSelectedTiles(new Set())
    load()
  }

  async function toggleTileDisabled(tile) {
    await api(`/api/admin/tiles/${tile.id}`, 'PATCH', { disabled: !tile.disabled })
    load()
  }

  async function resetCompletions() {
    if (!confirm('Delete ALL tile completions? This will wipe scores for everyone and cannot be undone.')) return
    setResetting(true)
    await api('/api/admin/completions/reset', 'DELETE')
    setResetting(false)
    load()
  }

  function toggleSelectTile(id) {
    setSelectedTiles(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    setSelectedTiles(prev =>
      prev.size === tiles.length ? new Set() : new Set(tiles.map(t => t.id))
    )
  }

  const [editTriggerType, setEditTriggerType] = useState('')
  const [editTriggerCfg, setEditTriggerCfg] = useState({})

  function openEdit(tile) {
    const { type, cfg } = parseTrigger(tile.trigger_data)
    setEditTriggerType(type)
    setEditTriggerCfg(cfg)
    setEditingTile({
      id: tile.id,
      title: tile.title,
      description: tile.description || '',
      points: tile.points,
      category: tile.category || '',
    })
  }

  async function saveEditedTile(e) {
    e.preventDefault()
    await api(`/api/admin/tiles/${editingTile.id}`, 'PATCH', {
      title: editingTile.title,
      description: editingTile.description || null,
      points: Number(editingTile.points),
      trigger_data: buildTrigger(editTriggerType, editTriggerCfg, editingTile.title),
      category: editingTile.category || null,
    })
    setEditingTile(null)
    load()
  }

  async function review(id, status) {
    await api(`/api/admin/completions/${id}?status=${status}`, 'PATCH')
    setPending(prev => prev.filter(c => c.id !== id))
  }

  async function deleteCompletion(id) {
    if (!confirm('Remove this completion permanently?')) return
    await api(`/api/admin/completions/${id}`, 'DELETE')
    setPending(prev => prev.filter(c => c.id !== id))
    setApproved(prev => prev.filter(c => c.id !== id))
  }

  async function saveSettings(e) {
    e.preventDefault()
    setSaving(true)
    await api('/api/admin/settings', 'PATCH', {
      event_name: editSettings.event_name || null,
      event_start: editSettings.event_start || null,
      event_end: editSettings.event_end || null,
    })
    setSaving(false)
    load()
  }

  async function saveDinkConfig() {
    setDinkConfigError('')
    let parsed
    try {
      parsed = dinkConfigRaw.trim() ? JSON.parse(dinkConfigRaw) : null
    } catch {
      setDinkConfigError('Invalid JSON — check your syntax.')
      return
    }
    setSavingDink(true)
    await api('/api/admin/settings', 'PATCH', { dink_config: parsed })
    setSavingDink(false)
    load()
  }

  function copyConfigUrl() {
    navigator.clipboard.writeText(`${API}/api/dink/config`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function signOut() {
    await supabase.auth.signOut()
    window.location.href = '/home'
  }

  const TABS = ['completions', 'teams', 'tiles', 'settings']

  return (
    <>
      <div className="min-h-screen bg-surface-base text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <button onClick={signOut} className="text-sm text-white/40 hover:text-white/70 transition-colors">Sign out</button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-white/10 mb-6">
            {TABS.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 capitalize text-sm font-medium transition-colors ${
                  tab === t
                    ? 'border-b-2 border-osrs-gold text-osrs-gold'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                {t}
                {t === 'completions' && pending.length > 0 && (
                  <span className="ml-1.5 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{pending.length}</span>
                )}
              </button>
            ))}
          </div>

          {/* --- Completions tab --- */}
          {tab === 'completions' && (
            <div className="space-y-3">
              {pending.length === 0 && (
                <p className="text-white/30 text-center py-8">No pending submissions.</p>
              )}
              {pending.map(c => (
                <div key={c.id} className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                  {c.image_url && (
                    <a href={c.image_url} target="_blank" rel="noreferrer">
                      <img
                        src={c.image_url}
                        alt="Submission screenshot"
                        className="w-full max-h-64 object-cover border-b border-white/10 hover:opacity-90 transition-opacity cursor-pointer"
                      />
                    </a>
                  )}
                  <div className="px-4 py-3 flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-white">{c.tiles?.title}</p>
                      <p className="text-sm text-white/50">
                        {c.players?.username} · Team {c.teams?.name} · {c.tiles?.points} pts
                      </p>
                      <p className="text-xs text-white/30">{new Date(c.submitted_at).toLocaleString()}</p>
                      {!c.image_url && (
                        <p className="text-xs text-white/20 mt-0.5">No screenshot provided</p>
                      )}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => review(c.id, 'approved')}
                        className="bg-green-900/40 border border-green-500/30 text-green-400 px-3 py-1 rounded text-sm hover:bg-green-900/60 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => review(c.id, 'rejected')}
                        className="bg-red-900/40 border border-red-500/30 text-red-400 px-3 py-1 rounded text-sm hover:bg-red-900/60 transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => deleteCompletion(c.id)}
                        className="border border-white/10 text-white/30 px-2 py-1 rounded text-sm hover:text-red-400 hover:border-red-500/30 transition-colors"
                        title="Delete"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Approved completions */}
              {approved.length > 0 && (
                <div className="mt-6 border-t border-white/10 pt-6">
                  <h3 className="font-semibold text-white/50 mb-3 text-sm uppercase tracking-wide">
                    Approved ({approved.length})
                  </h3>
                  <div className="space-y-1.5">
                    {approved.map(c => (
                      <div key={c.id} className="flex items-center gap-3 px-3 py-2 bg-white/3 border border-white/5 rounded-lg">
                        {c.image_url && (
                          <a href={c.image_url} target="_blank" rel="noreferrer">
                            <img src={c.image_url} className="w-10 h-10 rounded object-cover flex-shrink-0 hover:opacity-80 transition-opacity" />
                          </a>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white/80 truncate">{c.tiles?.title}</p>
                          <p className="text-xs text-white/35">{c.players?.username} · {c.teams?.name} · {c.tiles?.points} pts</p>
                        </div>
                        <button
                          onClick={() => deleteCompletion(c.id)}
                          className="text-white/20 hover:text-red-400 transition-colors text-sm flex-shrink-0 px-2"
                          title="Remove completion"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* --- Teams tab --- */}
          {tab === 'teams' && (
            <div className="space-y-8">
              <div>
                <h3 className="font-semibold text-white/80 mb-3 text-sm uppercase tracking-wide">Add Team</h3>
                <form onSubmit={addTeam} className="flex gap-3 items-end flex-wrap">
                  <div>
                    <label className={labelCls}>Team name</label>
                    <input
                      className={inputCls}
                      style={{ width: '180px' }}
                      placeholder="Team name"
                      value={newTeam.name}
                      onChange={e => setNewTeam(t => ({ ...t, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Color</label>
                    <input
                      type="color"
                      className="bg-surface-overlay border border-white/10 rounded h-10 w-14 px-1 cursor-pointer"
                      value={newTeam.color}
                      onChange={e => setNewTeam(t => ({ ...t, color: e.target.value }))}
                    />
                  </div>
                  <button className="bg-osrs-gold text-surface-base font-bold px-4 py-2 rounded hover:bg-osrs-gold-bright transition-colors">
                    Add Team
                  </button>
                </form>
              </div>

              <div>
                <h3 className="font-semibold text-white/80 mb-3 text-sm uppercase tracking-wide">Add Player</h3>
                <form onSubmit={addPlayer} className="flex gap-3 items-end flex-wrap">
                  <div>
                    <label className={labelCls}>OSRS username</label>
                    <input
                      className={inputCls}
                      style={{ width: '180px' }}
                      placeholder="Username"
                      value={newPlayer.username}
                      onChange={e => setNewPlayer(p => ({ ...p, username: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Team</label>
                    <select
                      className={inputCls}
                      style={{ width: '160px' }}
                      value={newPlayer.team_id}
                      onChange={e => setNewPlayer(p => ({ ...p, team_id: e.target.value }))}
                      required
                    >
                      <option value="">Select team</option>
                      {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  <button className="bg-osrs-gold text-surface-base font-bold px-4 py-2 rounded hover:bg-osrs-gold-bright transition-colors">
                    Add Player
                  </button>
                </form>
              </div>

              <div className="space-y-3">
                {teams.map(team => (
                  <div key={team.id} className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                    <div className="flex items-center gap-3 px-4 py-3 bg-white/5">
                      <span className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: team.color }} />
                      <span className="font-semibold text-white">{team.name}</span>
                      <span className="text-sm text-white/40">({team.players?.length || 0} players)</span>
                      <button
                        onClick={() => deleteTeam(team.id)}
                        className="ml-auto text-red-400/70 hover:text-red-400 text-sm transition-colors"
                      >
                        Delete team
                      </button>
                    </div>
                    {team.players?.length > 0 && (
                      <ul className="divide-y divide-white/5">
                        {team.players.map(p => (
                          <li key={p.id} className="flex items-center justify-between px-4 py-2 text-sm">
                            <span className="text-white/80">{p.username}</span>
                            <button
                              onClick={() => deletePlayer(p.id)}
                              className="text-red-400/60 hover:text-red-400 transition-colors"
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- Tiles tab --- */}
          {tab === 'tiles' && (
            <div className="space-y-4">
              <details className="bg-white/5 border border-white/10 rounded-lg">
                <summary className="px-4 py-3 font-medium cursor-pointer text-sm select-none text-white/80">
                  + Add new tile
                </summary>
                <form onSubmit={addTile} className="space-y-3 p-4 border-t border-white/10">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 sm:col-span-1">
                      <label className={labelCls}>Title</label>
                      <input
                        className={inputCls}
                        placeholder="e.g. Kill Zulrah"
                        value={newTile.title}
                        onChange={e => setNewTile(t => ({ ...t, title: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Points</label>
                      <input
                        type="number" min={1}
                        className={inputCls}
                        value={newTile.points}
                        onChange={e => setNewTile(t => ({ ...t, points: Number(e.target.value) }))}
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <label className={labelCls}>Description (optional)</label>
                      <input
                        className={inputCls}
                        placeholder="Requirements or notes"
                        value={newTile.description}
                        onChange={e => setNewTile(t => ({ ...t, description: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Dink trigger</label>
                    <TriggerBuilder
                      type={newTriggerType}
                      cfg={newTriggerCfg}
                      setType={t => { setNewTriggerType(t); setNewTriggerCfg({}) }}
                      setCfg={setNewTriggerCfg}
                      tileTitle={newTile.title}
                    />
                  </div>
                  <button className="bg-osrs-gold text-surface-base font-bold px-4 py-2 rounded hover:bg-osrs-gold-bright transition-colors">
                    Add Tile
                  </button>
                </form>
              </details>

              {/* Bulk actions bar */}
              <div className="flex items-center gap-3 px-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-white/50 hover:text-white/70 transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedTiles.size === tiles.length && tiles.length > 0}
                    onChange={toggleSelectAll}
                    className="accent-violet-500 w-4 h-4"
                  />
                  {selectedTiles.size > 0 ? `${selectedTiles.size} selected` : 'Select all'}
                </label>

                {selectedTiles.size > 0 && (
                  <button
                    onClick={bulkDeleteTiles}
                    className="px-3 py-1 rounded text-sm bg-red-900/40 border border-red-500/30 text-red-400 hover:bg-red-900/60 transition-colors"
                  >
                    Delete {selectedTiles.size}
                  </button>
                )}

                <button
                  onClick={resetCompletions}
                  disabled={resetting}
                  className="ml-auto px-3 py-1 rounded text-sm border border-white/10 text-white/40 hover:text-red-400 hover:border-red-500/30 transition-colors disabled:opacity-40"
                >
                  {resetting ? 'Resetting…' : 'Reset all completions'}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {tiles.map(tile => (
                  <div
                    key={tile.id}
                    className={`border rounded-lg p-3 relative group transition-colors ${
                      selectedTiles.has(tile.id)
                        ? 'bg-violet-900/20 border-violet-500/40'
                        : tile.disabled
                          ? 'bg-white/3 border-white/5 opacity-50'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedTiles.has(tile.id)}
                      onChange={() => toggleSelectTile(tile.id)}
                      className="absolute top-2.5 left-2.5 accent-violet-500 w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ opacity: selectedTiles.has(tile.id) ? 1 : undefined }}
                    />

                    <p className={`font-medium text-sm pr-14 pl-1 ${tile.disabled ? 'line-through text-white/40' : 'text-white/90'}`}>
                      {tile.title}
                    </p>
                    <p className="text-xs text-white/40 mt-0.5 pl-1">
                      {tile.points} pts
                      {tile.category && ` · ${tile.category}`}
                      {tile.grid_position != null && ` · pos ${tile.grid_position}`}
                      {tile.trigger_data && <span className="ml-1 text-osrs-gold" title="Has Dink trigger">⚡</span>}
                    </p>
                    {tile.description && (
                      <p className="text-xs text-white/30 mt-1 line-clamp-2 pl-1">{tile.description}</p>
                    )}

                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => toggleTileDisabled(tile)}
                        className={`text-xs px-1 transition-colors ${tile.disabled ? 'text-green-400 hover:text-green-300' : 'text-white/40 hover:text-yellow-400'}`}
                        title={tile.disabled ? 'Enable tile' : 'Disable tile'}
                      >
                        {tile.disabled ? '▶' : '⏸'}
                      </button>
                      <button
                        onClick={() => openEdit(tile)}
                        className="text-white/40 hover:text-osrs-gold text-xs px-1 transition-colors"
                        title="Edit"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => deleteTile(tile.id)}
                        className="text-white/40 hover:text-red-400 text-xs px-1 transition-colors"
                        title="Delete"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- Settings tab --- */}
          {tab === 'settings' && (
            <div className="space-y-10 max-w-lg">

              {/* Event settings */}
              <section>
                <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">Event</h2>
                <form onSubmit={saveSettings} className="space-y-4">
                  <div>
                    <label className={labelCls}>Event name</label>
                    <input
                      className={inputCls}
                      value={editSettings.event_name}
                      onChange={e => setEditSettings(s => ({ ...s, event_name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Event start</label>
                    <input
                      type="datetime-local"
                      className={inputCls}
                      value={editSettings.event_start}
                      onChange={e => setEditSettings(s => ({ ...s, event_start: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Event end</label>
                    <input
                      type="datetime-local"
                      className={inputCls}
                      value={editSettings.event_end}
                      onChange={e => setEditSettings(s => ({ ...s, event_end: e.target.value }))}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-osrs-gold text-surface-base font-bold px-4 py-2 rounded hover:bg-osrs-gold-bright disabled:opacity-50 transition-colors"
                  >
                    {saving ? 'Saving…' : 'Save Settings'}
                  </button>
                </form>
              </section>

              {/* Dink Dynamic Config */}
              <section>
                <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-1">Dink Dynamic Configuration</h2>
                <p className="text-xs text-white/30 mb-3">
                  Players paste the URL below into RuneLite → DinkPlugin → <span className="text-white/50">Dynamic Configuration URL</span>. DinkPlugin fetches it on every game launch and applies whatever settings you define here — webhook destinations, which events to track, etc. Players never need to reconfigure.
                </p>

                <div className="flex gap-2 mb-5">
                  <input
                    readOnly
                    value={`${API}/api/dink/config`}
                    className={`${inputCls} font-mono text-xs text-white/60`}
                  />
                  <button
                    onClick={copyConfigUrl}
                    className="px-4 py-2 rounded border border-white/10 text-sm font-medium text-white/60 hover:text-white hover:border-white/20 transition-colors flex-shrink-0"
                  >
                    {copied ? '✓ Copied' : 'Copy'}
                  </button>
                </div>

                <div>
                  <label className={labelCls}>Configuration JSON</label>
                  <p className="text-xs text-white/25 mb-2">
                    Keys map to DinkPlugin's RuneLite config names. Use <code className="text-white/40">webhooks</code> for a comma-separated list of webhook URLs. Include your Discord channel webhook(s) and optionally your backend URL if you want automatic tile completion.
                  </p>
                  <textarea
                    className={`${inputCls} font-mono text-xs leading-relaxed`}
                    rows={10}
                    placeholder={`{\n  "webhooks": "https://discord.com/api/webhooks/YOUR_ID/YOUR_TOKEN"\n}`}
                    value={dinkConfigRaw}
                    onChange={e => { setDinkConfigRaw(e.target.value); setDinkConfigError('') }}
                    spellCheck={false}
                  />
                  {dinkConfigError && (
                    <p className="text-xs text-red-400 mt-1">{dinkConfigError}</p>
                  )}
                </div>

                <button
                  onClick={saveDinkConfig}
                  disabled={savingDink}
                  className="mt-3 bg-osrs-gold text-surface-base font-bold px-4 py-2 rounded hover:bg-osrs-gold-bright disabled:opacity-50 transition-colors"
                >
                  {savingDink ? 'Saving…' : 'Save Config'}
                </button>
              </section>

            </div>
          )}
        </div>
      </div>

      {/* --- Edit tile modal --- */}
      {editingTile && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-surface-raised border border-white/10 rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="font-bold text-lg mb-4 text-white">Edit Tile</h3>
            <form onSubmit={saveEditedTile} className="space-y-3">
              <div>
                <label className={labelCls}>Title</label>
                <input
                  className={inputCls}
                  value={editingTile.title}
                  onChange={e => setEditingTile(t => ({ ...t, title: e.target.value }))}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Points</label>
                  <input
                    type="number" min={1}
                    className={inputCls}
                    value={editingTile.points}
                    onChange={e => setEditingTile(t => ({ ...t, points: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className={labelCls}>Category</label>
                  <select
                    className={inputCls}
                    value={editingTile.category}
                    onChange={e => setEditingTile(t => ({ ...t, category: e.target.value }))}
                  >
                    <option value="">None</option>
                    <option value="high">High</option>
                    <option value="mid">Mid</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelCls}>Description</label>
                <input
                  className={inputCls}
                  value={editingTile.description}
                  onChange={e => setEditingTile(t => ({ ...t, description: e.target.value }))}
                />
              </div>
              <div>
                <label className={labelCls}>Dink trigger</label>
                <TriggerBuilder
                  type={editTriggerType}
                  cfg={editTriggerCfg}
                  setType={t => { setEditTriggerType(t); setEditTriggerCfg({}) }}
                  setCfg={setEditTriggerCfg}
                  tileTitle={editingTile.title}
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  className="flex-1 bg-osrs-gold text-surface-base py-2 rounded-lg font-bold hover:bg-osrs-gold-bright transition-colors"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingTile(null)}
                  className="flex-1 border border-white/10 py-2 rounded-lg text-white/60 hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
