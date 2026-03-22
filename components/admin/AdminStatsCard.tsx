import { LucideIcon } from 'lucide-react'

interface AdminStatsCardProps {
  title: string
  value: string | number
  icon?: LucideIcon
  iconColor?: 'blue' | 'ruby' | 'emerald' | 'amber' | 'gold'
  trend?: {
    value: number
    label: string
    direction: 'up' | 'down' | 'neutral'
  }
  subtitle?: string
  onClick?: () => void
  className?: string
}

const colorVariants = {
  blue: {
    bg: 'var(--blue-dim)',
    border: 'var(--blue-line)',
    color: '#5B9BD5',
    gradient: 'linear-gradient(90deg, #3A6EA8, #5B9BD5)'
  },
  ruby: {
    bg: 'var(--ruby-dim)',
    border: 'var(--ruby-line)',
    color: '#E06070',
    gradient: 'linear-gradient(90deg, var(--ruby), #E06070)'
  },
  emerald: {
    bg: 'var(--sage-dim)',
    border: 'var(--sage-line)',
    color: '#8ECAAC',
    gradient: 'linear-gradient(90deg, var(--sage), #8ECAAC)'
  },
  amber: {
    bg: 'var(--amber-dim)',
    border: 'var(--amber-line)',
    color: 'var(--amber)',
    gradient: 'linear-gradient(90deg, var(--amber), #E89A3C)'
  },
  gold: {
    bg: 'var(--gold-dim)',
    border: 'var(--gold-line)',
    color: 'var(--gold)',
    gradient: 'linear-gradient(90deg, var(--gold-lo), var(--gold))'
  }
}

export function AdminStatsCard({
  title,
  value,
  icon: Icon,
  iconColor = 'blue',
  trend,
  subtitle,
  onClick,
  className = ''
}: AdminStatsCardProps) {
  const colors = colorVariants[iconColor]

  return (
    <div
      className={`kpi-card ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="kpi-header">
        <span className="kpi-title">{title}</span>
        {Icon && (
          <span
            className="kpi-icon"
            style={{
              background: colors.bg,
              color: colors.color,
              border: `1px solid ${colors.border}`
            }}
          >
            <Icon size={18} />
          </span>
        )}
      </div>

      <div className="kpi-value">{value}</div>

      {trend && (
        <div className={`kpi-trend ${trend.direction === 'up' ? 'kpi-trend-up' : trend.direction === 'down' ? 'kpi-trend-down' : ''}`}>
          {trend.direction === 'up' && '↑'}
          {trend.direction === 'down' && '↓'}
          {trend.direction === 'neutral' && '→'}
          <span>{trend.value}% {trend.label}</span>
        </div>
      )}

      {subtitle && (
        <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontFamily: 'var(--mono)', marginTop: '0.5rem' }}>
          {subtitle}
        </div>
      )}
    </div>
  )
}
