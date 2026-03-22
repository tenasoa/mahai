'use client'

import { useCountUp } from '@/lib/hooks/useCountUp'

interface StatItemProps {
  value: number
  label: string
  suffix?: string
  prefix?: string
  decimals?: number
  delay?: number
}

function StatItem({ value, label, suffix = '', prefix = '', decimals = 0, delay = 0 }: StatItemProps) {
  const { count } = useCountUp({
    end: value,
    duration: 2000,
    delay: delay + 1200,
    decimals
  })

  return (
    <div className="stat-item">
      <div className="stat-num">
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

interface AnimatedStatsProps {
  stats: Array<{
    key: string
    value: number
    label: string
    suffix?: string
    prefix?: string
    decimals?: number
  }>
  className?: string
}

export function AnimatedStats({ stats, className = '' }: AnimatedStatsProps) {
  return (
    <div className={`hero-stats ${className}`}>
      {stats.map((stat, index) => (
        <StatItem
          key={stat.key}
          value={stat.value}
          label={stat.label}
          suffix={stat.suffix}
          prefix={stat.prefix}
          decimals={stat.decimals}
          delay={index * 100}
        />
      ))}
    </div>
  )
}

// Pre-configured stats for Mah.AI landing page
export function LandingPageStats() {
  const stats = [
    { key: 'sujets', value: 200, label: 'Sujets disponibles', suffix: '+' },
    { key: 'users', value: 10000, label: 'Étudiants cibles', suffix: '+' },
    { key: 'success', value: 87, label: 'Taux de réussite visé', suffix: '%' },
    { key: 'free', value: 0, label: 'Pour commencer', prefix: '', suffix: ' Ar' }
  ]

  return <AnimatedStats stats={stats} />
}
