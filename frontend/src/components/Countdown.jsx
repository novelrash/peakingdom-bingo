import { useEffect, useState } from 'react'

function diff(target) {
  const ms = new Date(target) - Date.now()
  if (ms <= 0) return null
  const s = Math.floor(ms / 1000)
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  }
}

function Unit({ value, label }) {
  return (
    <div className="text-center">
      <div className="bg-surface-raised border border-osrs-gold/25 rounded-lg px-3 py-2 min-w-[54px] shadow-gold-sm">
        <span className="text-2xl font-cinzel font-bold text-osrs-gold tabular-nums">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <p className="text-[10px] text-white/35 uppercase tracking-widest mt-1.5">{label}</p>
    </div>
  )
}

function Sep() {
  return <span className="text-osrs-gold/30 font-bold text-xl mt-2 select-none">:</span>
}

export default function Countdown({ start, end }) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const hasStarted = start && new Date(start) <= now
  const hasEnded = end && new Date(end) <= now

  if (hasEnded) {
    return <div className="text-center text-white/40 font-medium text-sm">Event has ended</div>
  }

  const target = hasStarted ? end : start
  const label = hasStarted ? 'Event ends in' : 'Event starts in'
  const t = target ? diff(target) : null

  if (!t) return null

  return (
    <div className="text-center">
      <p className="text-xs text-osrs-gold/50 mb-3 uppercase tracking-widest font-medium">{label}</p>
      <div className="flex gap-2 justify-center items-start">
        <Unit value={t.days} label="days" />
        <Sep />
        <Unit value={t.hours} label="hrs" />
        <Sep />
        <Unit value={t.minutes} label="min" />
        <Sep />
        <Unit value={t.seconds} label="sec" />
      </div>
    </div>
  )
}
