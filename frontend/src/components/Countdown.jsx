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
      <span className="text-3xl font-bold tabular-nums">{String(value).padStart(2, '0')}</span>
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
    </div>
  )
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
    return <div className="text-center text-gray-500 font-medium">Event has ended</div>
  }

  const target = hasStarted ? end : start
  const label = hasStarted ? 'Event ends in' : 'Event starts in'
  const t = target ? diff(target) : null

  if (!t) return null

  return (
    <div className="text-center">
      <p className="text-sm text-gray-500 mb-2">{label}</p>
      <div className="flex gap-4 justify-center">
        <Unit value={t.days} label="days" />
        <Unit value={t.hours} label="hrs" />
        <Unit value={t.minutes} label="min" />
        <Unit value={t.seconds} label="sec" />
      </div>
    </div>
  )
}
