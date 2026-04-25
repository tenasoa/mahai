'use client'

import Link from 'next/link'
import { ArrowLeft, Inbox, CheckCircle, XCircle } from 'lucide-react'

interface Stats {
  pending: number
  validated: number
  rejected: number
  total: number
}

interface SubmissionsHeaderProps {
  stats: Stats
}

export function SubmissionsHeader({ stats }: SubmissionsHeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin" 
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Soumissions en attente
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Validez ou rejetez les sujets proposés par les contributeurs
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <StatBadge 
              icon={Inbox} 
              label="En attente" 
              value={stats.pending} 
              color="amber"
            />
            <StatBadge 
              icon={CheckCircle} 
              label="Validés" 
              value={stats.validated} 
              color="emerald"
            />
            <StatBadge 
              icon={XCircle} 
              label="Rejetés" 
              value={stats.rejected} 
              color="rose"
            />
          </div>
        </div>
      </div>
    </header>
  )
}

interface StatBadgeProps {
  icon: React.ElementType
  label: string
  value: number
  color: 'amber' | 'emerald' | 'rose'
}

function StatBadge({ icon: Icon, label, value, color }: StatBadgeProps) {
  const colors = {
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200'
  }

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${colors[color]}`}>
      <Icon className="w-4 h-4" />
      <span className="font-medium">{value}</span>
      <span className="text-sm opacity-75">{label}</span>
    </div>
  )
}
