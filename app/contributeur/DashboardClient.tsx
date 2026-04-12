'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { 
  Bell, TrendingUp, 
  FileText, ArrowUpRight, ShoppingCart, DollarSign, 
  BarChart3, Edit3, Eye, Star
} from 'lucide-react'
import { getUserActiveTransactionsAction } from '@/actions/profile'
import { EmptyState } from '@/components/ui/EmptyState'

interface ContributorDashboardProps {
  user: {
    prenom: string
    nom: string
    role: string
    profilePicture?: string | null
  }
  kpi: {
    published: number
    pending: number
    sales: number
    revenue: number
  }
  topSubjects: any[]
  allSubjects: any[]
}

export default function ContributorDashboardClient({ user, kpi, topSubjects, allSubjects }: ContributorDashboardProps) {
  const [showNotifDropdown, setShowNotifDropdown] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadQuickNotifications()

    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadQuickNotifications = async () => {
    try {
      const result = await getUserActiveTransactionsAction()
      if (result.success && result.data) {
        setNotifications(result.data.slice(0, 5))
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="admin-page-content">
      {/* Header */}
      <div className="admin-header">
        <div>
          <div className="admin-header-badge">
            <BarChart3 size={12} />
            Dashboard Contributeur
          </div>
          <h1 className="admin-title">Ravi de vous revoir, {user.prenom} !</h1>
          <p className="admin-subtitle">
            Voici un aperçu de la performance de votre catalogue pédagogique.
          </p>
        </div>
        
        <div className="admin-header-actions">
          <Link href="/contributeur/nouveau" className="admin-btn admin-btn-primary">
            <Edit3 size={16} />
            Nouveau sujet
          </Link>

          <div className="notif-wrapper" ref={notifRef} style={{ position: 'relative' }}>
            <button 
              className={`btn-notif ${notifications.length > 0 ? 'has-new' : ''}`}
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            >
              <Bell size={20} />
            </button>

            {showNotifDropdown && (
              <div className="notif-dropdown admin-card" style={{ 
                position: 'absolute', top: '100%', right: 0, zIndex: 100, 
                width: '320px', marginTop: '1rem' 
              }}>
                <div className="admin-card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--b2)', paddingBottom: '0.75rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Notifications</span>
                    <Link href="/notifications" style={{ fontSize: '0.75rem', color: 'var(--gold)' }}>Tout voir</Link>
                  </div>
                  <div className="notif-list">
                    {notifications.length === 0 ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-4)', fontSize: '0.85rem' }}>
                        Aucune nouvelle notification
                      </div>
                    ) : (
                      notifications.map((n: any, i: number) => (
                        <div key={i} style={{ display: 'flex', gap: '1rem', padding: '0.85rem 0', borderBottom: '1px solid var(--b3)' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--gold-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)' }}>
                            <DollarSign size={14} />
                          </div>
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>Achat de crédit</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-4)' }}>Un utilisateur a acheté votre sujet.</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Revenus totaux</span>
            <div className="kpi-icon" style={{ background: 'var(--gold-dim)', color: 'var(--gold)' }}>
              <DollarSign size={16} />
            </div>
          </div>
          <div className="kpi-value gold">{kpi.revenue.toLocaleString('fr-FR')} <small>Ar</small></div>
          <div className="kpi-trend trend-up">
            <TrendingUp size={12} />
            +12.5% ce mois
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Ventes cumulées</span>
            <div className="kpi-icon" style={{ background: 'var(--blue-dim)', color: 'var(--blue)' }}>
              <ShoppingCart size={16} />
            </div>
          </div>
          <div className="kpi-value">{kpi.sales} <small>sujets</small></div>
          <div className="kpi-trend">Transactions réussies</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Sujets publiés</span>
            <div className="kpi-icon" style={{ background: 'var(--sage-dim)', color: 'var(--sage)' }}>
              <FileText size={16} />
            </div>
          </div>
          <div className="kpi-value">{kpi.published}</div>
          <div className="kpi-trend" style={{ color: 'var(--sage)' }}>En ligne & Actifs</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Taux de conversion</span>
            <div className="kpi-icon" style={{ background: 'var(--ruby-dim)', color: '#FF6B9D' }}>
              <Star size={16} />
            </div>
          </div>
          <div className="kpi-value">{((kpi.sales / (kpi.published || 1)) * 0.5).toFixed(1)}%</div>
          <div className="kpi-trend">Performance relative</div>
        </div>
      </div>

      {/* Content Split */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '2rem', marginTop: '2.5rem' }}>
        {/* Top Subjects */}
        <div className="admin-card">
          <div className="admin-card-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Sujets les plus populaires</h3>
              <Link href="/contributeur/sujets" className="admin-btn admin-btn-outline" style={{ height: '32px', fontSize: '0.75rem' }}>
                Voir tout catalogue
              </Link>
            </div>
          </div>
          
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Titre du sujet</th>
                  <th>Ventes</th>
                  <th style={{ textAlign: 'right' }}>Revenus</th>
                  <th style={{ width: '50px' }}></th>
                </tr>
              </thead>
              <tbody>
                {topSubjects.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                       <div style={{ padding: '3rem', textAlign: 'center' }}>
                         <p style={{ color: 'var(--text-4)' }}>Aucune donnée de vente pour le moment.</p>
                       </div>
                    </td>
                  </tr>
                ) : (
                  topSubjects.map((subject: any) => (
                    <tr key={subject.id}>
                      <td>
                        <div style={{ fontWeight: 500, color: 'var(--text-2)' }}>{subject.titre}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-4)' }}>{subject.matiere} • {subject.serie}</div>
                      </td>
                      <td>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: '0.9rem' }}>{subject.ventes || 0}</div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'var(--display)', fontSize: '1rem', color: 'var(--gold)' }}>{(subject.revenus || 0).toLocaleString('fr-FR')} Ar</div>
                      </td>
                      <td>
                        <Link href={`/sujet/${subject.id}`} style={{ color: 'var(--text-4)' }}>
                          <Eye size={16} />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="admin-card">
          <div className="admin-card-body">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem' }}>Statut de votre catalogue</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', background: 'var(--surface)', borderRadius: 'var(--r)', border: '1px solid var(--b2)' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                   <div className="status-dot status-green" style={{ width: '10px', height: '10px' }}></div>
                   <span style={{ fontWeight: 500 }}>Vérifiés & En ligne</span>
                 </div>
                 <span style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>{kpi.published}</span>
               </div>
  
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', background: 'var(--surface)', borderRadius: 'var(--r)', border: '1px solid var(--b2)' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                   <div className="status-dot status-amber" style={{ width: '10px', height: '10px' }}></div>
                   <span style={{ fontWeight: 500 }}>En attente de revue</span>
                 </div>
                 <span style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>{kpi.pending}</span>
               </div>
  
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', background: 'var(--surface)', borderRadius: 'var(--r)', border: '1px solid var(--b2)' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                   <div className="status-dot status-gray" style={{ width: '10px', height: '10px' }}></div>
                   <span style={{ fontWeight: 500 }}>Brouillons persistés</span>
                 </div>
                 <span style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>{allSubjects.filter(s => s.status === 'DRAFT').length}</span>
               </div>
            </div>
  
            <div style={{ marginTop: '2.5rem', padding: '1.25rem', background: 'var(--gold-dim)', borderRadius: 'var(--r)', border: '1px dashed var(--gold-line)' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-3)', textAlign: 'center' }}>
                <Star size={14} style={{ display: 'inline', marginRight: '6px', color: 'var(--gold)' }} />
                <strong>Astuce :</strong> Les sujets avec une correction détaillée se vendent 3x plus vite.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}