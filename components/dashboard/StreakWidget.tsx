'use client'

import { useEffect, useState } from 'react'
import { Flame } from 'lucide-react'
import { getStreakDataAction, type StreakData } from '@/actions/user'
import './streak-widget.css'

export function StreakWidget() {
  const [data, setData] = useState<StreakData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getStreakDataAction().then(d => {
      setData(d)
      setLoading(false)
    })
  }, [])

  if (loading) return <StreakSkeleton />
  if (!data) return null

  const dayNames = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

  return (
    <div className="streak-card">
      <div className="streak-header">
        <div>
          <span className="streak-title">
            <Flame size={16} />
            Streak actuel
          </span>
          <div className="streak-num">{data.currentStreak}</div>
          <div className="streak-unit">jours consécutifs</div>
          {data.currentStreak > 0 && (
            <div className="streak-best">Record : {data.longestStreak} jours</div>
          )}
        </div>
      </div>
      <div className="streak-days">
        {data.weekDays.map((day, i) => (
          <div
            key={i}
            className={`streak-day${day.count > 0 ? ' done' : ''}${day.isToday && day.count > 0 ? ' today' : ''}`}
            title={dayNames[i]}
          >
            <span className="streak-day-label">{dayNames[i]}</span>
          </div>
        ))}
      </div>
      {data.currentStreak === 0 && !data.todayDone && (
        <p className="streak-hint">
          Commence ton streak aujourd&rsquo;hui ! Explore le catalogue.
        </p>
      )}
      {data.currentStreak > 0 && data.todayDone && (
        <p className="streak-hint streak-hint-done">
          🔥 Journée validée ! Reviens demain pour continuer ta série.
        </p>
      )}
      {data.currentStreak > 0 && !data.todayDone && (
        <p className="streak-hint streak-hint-pending">
          Ta série de {data.currentStreak} jours est en jeu — explore un sujet maintenant !
        </p>
      )}
    </div>
  )
}

function StreakSkeleton() {
  return (
    <div className="streak-card skeleton-pulse" style={{ minHeight: 140 }}>
      <div style={{ width: '60%', height: 16, background: 'var(--b2)', borderRadius: 4, marginBottom: 12 }} />
      <div style={{ width: '40%', height: 40, background: 'var(--b2)', borderRadius: 8, marginBottom: 8 }} />
      <div style={{ display: 'flex', gap: 4 }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} style={{ width: 28, height: 28, background: 'var(--b2)', borderRadius: 6 }} />
        ))}
      </div>
    </div>
  )
}
