'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { finalizeAndPublish, rejectSubmission, requestRevision } from '@/actions/admin/submissions'
import { CurrencyConverter } from '@/lib/currency-converter'
import {
  CheckCircle,
  XCircle,
  Loader2,
  FileText,
  Eye,
  User,
  Calendar,
  BookOpen,
  Award,
  Tag,
  AlertTriangle,
  Clock,
  ChevronLeft,
  CreditCard,
  Hash,
  BarChart3,
  Crown,
  Sparkles,
  Pencil,
  RotateCcw
} from 'lucide-react'
import { SubmissionPreview } from '@/components/admin/SubmissionPreview'
import { ToastContainer } from '@/components/ui/ToastContainer'
import { useToast } from '@/lib/hooks/useToast'

interface Submission {
  id: string
  title: string
  matiere: string
  examType: string
  anneeScolaire: string
  serie?: string
  filiere?: string
  duree?: string
  coefficient?: number
  pages?: number
  difficulte?: 'FACILE' | 'MOYEN' | 'DIFFICILE'
  description?: string
  prix: number
  content?: any
  authorPrenom: string
  authorNom: string
  authorEmail: string
  createdAt?: string
}

const DIFFICULTES = [
  {
    value: 'FACILE',
    label: 'Facile',
    icon: '🌱',
    color: 'var(--sage)',
    bgColor: 'var(--sage-dim)',
    borderColor: 'var(--sage-line)',
    description: 'Accessible à tous les niveaux'
  },
  {
    value: 'MOYEN',
    label: 'Moyen',
    icon: '📚',
    color: 'var(--amber)',
    bgColor: 'var(--amber-dim)',
    borderColor: 'var(--amber-line)',
    description: 'Niveau standard attendu'
  },
  {
    value: 'DIFFICILE',
    label: 'Difficile',
    icon: '🎯',
    color: 'var(--ruby)',
    bgColor: 'var(--ruby-dim)',
    borderColor: 'var(--ruby-line)',
    description: 'Exige une bonne maîtrise'
  }
] as const

const BADGES = [
  {
    value: 'FREE',
    label: 'Gratuit',
    description: 'Accès libre pour tous',
    icon: Sparkles,
    color: 'var(--text-2)',
    bgColor: 'var(--b2)',
    borderColor: 'var(--b3)'
  },
  {
    value: 'AI',
    label: 'Premium',
    description: 'Crédits requis pour accéder',
    icon: CreditCard,
    color: 'var(--gold)',
    bgColor: 'var(--gold-dim)',
    borderColor: 'var(--gold-line)'
  },
  {
    value: 'GOLD',
    label: 'Gold',
    description: 'Contenu exclusif haut de gamme',
    icon: Crown,
    color: 'var(--gold)',
    bgColor: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0.1) 100%)',
    borderColor: 'var(--gold-line)'
  },
] as const

const EXAM_TYPES = [
  { value: 'CEPE', label: 'CEPE' },
  { value: 'BEPC', label: 'BEPC' },
  { value: 'BACC', label: 'Baccalauréat' },
  { value: 'ETABLISSEMENT', label: "Sujet type d'examen de l'établissement" },
  { value: 'CONCOURS', label: 'Concours' },
  { value: 'AUTRE', label: 'Autre' },
] as const

export function ReviewForm({ submission }: { submission: Submission }) {
  const router = useRouter()
  const toast = useToast()
  const [isPublishing, setIsPublishing] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [isRequestingRevision, setIsRequestingRevision] = useState(false)
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [showRevisionForm, setShowRevisionForm] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')
  const [editInfoMode, setEditInfoMode] = useState(false)
  const [currencyRate, setCurrencyRate] = useState(50)

  const [formData, setFormData] = useState({
    titre: submission.title || '',
    matiere: submission.matiere || '',
    type: submission.examType || 'BACC',
    annee: submission.anneeScolaire || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    serie: submission.serie || '',
    filiere: submission.filiere || '',
    pages: submission.pages || 1,
    duree: submission.duree || '3h',
    coefficient: submission.coefficient || 1,
    credits: CurrencyConverter.arToCredits(Number(submission.prix || 0), 50),
    difficulte: submission.difficulte || 'MOYEN' as 'FACILE' | 'MOYEN' | 'DIFFICILE',
    badge: 'AI' as 'GOLD' | 'AI' | 'FREE',
    description: submission.description || '',
    notes: ''
  })

  useEffect(() => {
    let isMounted = true

    const loadCurrencyRate = async () => {
      try {
        const res = await fetch('/api/admin/currency-config')
        if (!res.ok) return
        const data = await res.json()
        const rate = Number(data?.config?.arPerCredit)
        if (!Number.isFinite(rate) || rate <= 0) return

        if (!isMounted) return
        setCurrencyRate(rate)

        const arPrice = Number(submission.prix || 0)
        const converted = arPrice > 0 ? CurrencyConverter.arToCredits(arPrice, rate) : 0
        setFormData(prev => ({ ...prev, credits: converted }))
      } catch {
        // fallback silencieux sur 50 Ar/cr
      }
    }

    void loadCurrencyRate()
    return () => {
      isMounted = false
    }
  }, [submission.id, submission.prix])

  const handlePublish = async () => {
    if (!formData.titre.trim()) {
      toast.error('Champ requis', 'Le titre est requis')
      return
    }
    setIsPublishing(true)
    try {
      await finalizeAndPublish(submission.id, formData)
      toast.success('Publié', 'Sujet publié avec succès')
      setTimeout(() => router.push('/admin/sujets?status=PENDING'), 600)
    } catch (error) {
      toast.error('Erreur', error instanceof Error ? error.message : 'Erreur lors de la publication')
      setIsPublishing(false)
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Motif requis', 'Veuillez indiquer un motif de rejet')
      return
    }
    setIsRejecting(true)
    try {
      await rejectSubmission(submission.id, rejectReason)
      toast.success('Rejetée', 'Soumission rejetée')
      setTimeout(() => router.push('/admin/sujets?status=PENDING'), 600)
    } catch (error) {
      toast.error('Erreur', error instanceof Error ? error.message : 'Erreur lors du rejet')
      setIsRejecting(false)
    }
  }

  const handleRequestRevision = async () => {
    const message = formData.notes.trim()
    if (message.length < 10) {
      toast.error('Message trop court', "Écrivez au moins 10 caractères dans « Notes de validation » pour guider le contributeur.")
      return
    }
    setIsRequestingRevision(true)
    try {
      await requestRevision(submission.id, message)
      toast.success('Révision demandée', 'Demande envoyée au contributeur')
      setTimeout(() => router.push('/admin/sujets?status=PENDING'), 600)
    } catch (error) {
      toast.error('Erreur', error instanceof Error ? error.message : 'Erreur lors de la demande de révision')
      setIsRequestingRevision(false)
      setShowRevisionForm(false)
    }
  }

  return (
    <div className="admin-card" style={{ overflow: 'visible' }}>
      <ToastContainer />
      {/* Header with Author Info */}
      <div style={{
        padding: '1.25rem 1.5rem',
        borderBottom: '1px solid var(--b2)',
        background: 'linear-gradient(135deg, var(--b1) 0%, var(--void) 100%)',
        borderRadius: 'var(--r-lg) var(--r-lg) 0 0'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          {/* Left: Submission Info */}
          <div style={{ flex: 1 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '0.75rem'
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.375rem 0.75rem',
                background: 'var(--amber-dim)',
                border: '1px solid var(--amber-line)',
                borderRadius: 'var(--r)',
                fontSize: '0.75rem',
                fontWeight: 500,
                color: 'var(--amber)'
              }}>
                <Clock size={12} />
                En attente de validation
              </div>
              <span style={{
                fontSize: '0.75rem',
                color: 'var(--text-3)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem'
              }}>
                <Hash size={12} />
                ID: {submission.id.slice(0, 8)}...
              </span>
            </div>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: 'var(--text)',
              marginBottom: '0.5rem'
            }}>
              {submission.title || 'Sans titre'}
            </h2>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              fontSize: '0.85rem',
              color: 'var(--text-2)'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <BookOpen size={14} />
                {submission.matiere}
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Award size={14} />
                {submission.examType}
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Calendar size={14} />
                {submission.anneeScolaire}
              </span>
              {submission.serie && (
                <>
                  <span>•</span>
                  <span>Série {submission.serie}</span>
                </>
              )}
            </div>
          </div>

          {/* Right: Author Card */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.875rem',
            padding: '0.875rem 1rem',
            background: 'var(--void)',
            borderRadius: 'var(--r)',
            border: '1px solid var(--b2)'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'var(--gold-dim)',
              border: '2px solid var(--gold-line)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--gold)'
            }}>
              {(submission.authorPrenom?.charAt(0) || '')}{(submission.authorNom?.charAt(0) || '')}
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text)' }}>
                {submission.authorPrenom} {submission.authorNom}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
                {submission.authorEmail}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Improved Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.25rem',
        padding: '0.75rem 1.5rem 0',
        borderBottom: '1px solid var(--b2)'
      }}>
        {[
          { id: 'edit', label: 'Formulaire d\'édition', icon: FileText },
          { id: 'preview', label: 'Aperçu du contenu', icon: Eye }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              fontSize: '0.85rem',
              fontWeight: 500,
              borderRadius: 'var(--r) var(--r) 0 0',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--gold)' : '2px solid transparent',
              background: activeTab === tab.id ? 'var(--b1)' : 'transparent',
              color: activeTab === tab.id ? 'var(--gold)' : 'var(--text-3)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginBottom: '-1px'
            }}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: '1.5rem' }}>
        {activeTab === 'edit' ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem'
          }}>
            {/* Left Column - Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Basic Info Card - View/Edit Mode */}
              <div style={{
                background: 'var(--b1)',
                borderRadius: 'var(--r-lg)',
                padding: '1.25rem',
                border: '1px solid var(--b2)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.625rem',
                  marginBottom: '1rem',
                  paddingBottom: '0.75rem',
                  borderBottom: '1px solid var(--b2)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.625rem'
                  }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: 'var(--r)',
                      background: 'var(--gold-dim)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--gold)'
                    }}>
                      <FileText size={14} />
                    </div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>Informations du sujet</h3>
                  </div>
                  <button
                    onClick={() => setEditInfoMode(!editInfoMode)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      padding: '0.375rem 0.75rem',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      borderRadius: 'var(--r)',
                      border: '1px solid var(--b2)',
                      background: editInfoMode ? 'var(--gold-dim)' : 'var(--void)',
                      color: editInfoMode ? 'var(--gold)' : 'var(--text-2)',
                      cursor: 'pointer'
                    }}
                  >
                    <Pencil size={12} />
                    {editInfoMode ? 'Terminer' : 'Modifier'}
                  </button>
                </div>

                {editInfoMode ? (
                  /* Edit Mode */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                    {/* Titre */}
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        color: 'var(--text-2)',
                        marginBottom: '0.375rem'
                      }}>
                        Titre du sujet <span style={{ color: 'var(--ruby)' }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.titre}
                        onChange={e => setFormData({ ...formData, titre: e.target.value })}
                        placeholder="Ex: Baccalauréat série S - Mathématiques 2023"
                        style={{
                          width: '100%',
                          padding: '0.625rem 0.875rem',
                          fontSize: '0.9rem',
                          borderRadius: 'var(--r)',
                          border: '1px solid var(--b2)',
                          background: 'var(--void)',
                          color: 'var(--text)'
                        }}
                      />
                    </div>

                    {/* Matiere + Type */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          color: 'var(--text-2)',
                          marginBottom: '0.375rem'
                        }}>
                          Matière <span style={{ color: 'var(--ruby)' }}>*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.matiere}
                          onChange={e => setFormData({ ...formData, matiere: e.target.value })}
                          placeholder="Ex: Mathématiques"
                          style={{
                            width: '100%',
                            padding: '0.625rem 0.875rem',
                            fontSize: '0.85rem',
                            borderRadius: 'var(--r)',
                            border: '1px solid var(--b2)',
                            background: 'var(--void)',
                            color: 'var(--text)'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          color: 'var(--text-2)',
                          marginBottom: '0.375rem'
                        }}>
                          Type d'examen <span style={{ color: 'var(--ruby)' }}>*</span>
                        </label>
                        <select
                          value={formData.type}
                          onChange={e => setFormData({ ...formData, type: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.625rem 0.875rem',
                            fontSize: '0.85rem',
                            borderRadius: 'var(--r)',
                            border: '1px solid var(--b2)',
                            background: 'var(--void)',
                            color: 'var(--text)'
                          }}
                        >
                          {EXAM_TYPES.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Année scolaire + Série + Filière */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          color: 'var(--text-2)',
                          marginBottom: '0.375rem'
                        }}>
                          Année {formData.type !== 'CONCOURS' && '(2010-2011)'}
                        </label>
                        <input
                          type="text"
                          value={formData.annee}
                          onChange={e => setFormData({ ...formData, annee: e.target.value as any })}
                          placeholder={formData.type === 'CONCOURS' ? 'Ex: 2024' : 'Ex: 2023-2024'}
                          style={{
                            width: '100%',
                            padding: '0.625rem 0.875rem',
                            fontSize: '0.85rem',
                            borderRadius: 'var(--r)',
                            border: '1px solid var(--b2)',
                            background: 'var(--void)',
                            color: 'var(--text)'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          color: 'var(--text-2)',
                          marginBottom: '0.375rem'
                        }}>
                          Série
                        </label>
                        <input
                          type="text"
                          value={formData.serie}
                          onChange={e => setFormData({ ...formData, serie: e.target.value })}
                          placeholder="Ex: S, L..."
                          style={{
                            width: '100%',
                            padding: '0.625rem 0.875rem',
                            fontSize: '0.85rem',
                            borderRadius: 'var(--r)',
                            border: '1px solid var(--b2)',
                            background: 'var(--void)',
                            color: 'var(--text)'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          color: 'var(--text-2)',
                          marginBottom: '0.375rem'
                        }}>
                          Filière
                        </label>
                        <input
                          type="text"
                          value={formData.filiere}
                          onChange={e => setFormData({ ...formData, filiere: e.target.value })}
                          placeholder="Ex: Scientifique..."
                          style={{
                            width: '100%',
                            padding: '0.625rem 0.875rem',
                            fontSize: '0.85rem',
                            borderRadius: 'var(--r)',
                            border: '1px solid var(--b2)',
                            background: 'var(--void)',
                            color: 'var(--text)'
                          }}
                        />
                      </div>
                    </div>

                    {/* Pages + Crédits */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          color: 'var(--text-2)',
                          marginBottom: '0.375rem'
                        }}>
                          Nombre de pages
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={formData.pages}
                          onChange={e => setFormData({ ...formData, pages: parseInt(e.target.value) })}
                          style={{
                            width: '100%',
                            padding: '0.625rem 0.875rem',
                            fontSize: '0.85rem',
                            borderRadius: 'var(--r)',
                            border: '1px solid var(--b2)',
                            background: 'var(--void)',
                            color: 'var(--text)'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          color: 'var(--text-2)',
                          marginBottom: '0.375rem'
                        }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <CreditCard size={12} />
                            Crédits (auto)
                          </span>
                        </label>
                        <div style={{
                          fontSize: '0.72rem',
                          color: 'var(--text-3)',
                          marginBottom: '0.35rem'
                        }}>
                          Prix soumis: {Number(submission.prix || 0).toLocaleString()} Ar • 1 cr = {currencyRate} Ar
                        </div>
                        <input
                          type="number"
                          min="0"
                          value={formData.credits}
                          onChange={e => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                          style={{
                            width: '100%',
                            padding: '0.625rem 0.875rem',
                            fontSize: '0.85rem',
                            borderRadius: 'var(--r)',
                            border: '1px solid var(--b2)',
                            background: 'var(--void)',
                            color: 'var(--text)',
                            fontFamily: 'var(--mono)',
                            fontWeight: 600
                          }}
                        />
                      </div>
                    </div>

                    {/* Durée + Coefficient */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          color: 'var(--text-2)',
                          marginBottom: '0.375rem'
                        }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Clock size={12} />
                            Durée
                          </span>
                        </label>
                        <input
                          type="text"
                          value={formData.duree}
                          onChange={e => setFormData({ ...formData, duree: e.target.value })}
                          placeholder="Ex: 3h"
                          style={{
                            width: '100%',
                            padding: '0.625rem 0.875rem',
                            fontSize: '0.85rem',
                            borderRadius: 'var(--r)',
                            border: '1px solid var(--b2)',
                            background: 'var(--void)',
                            color: 'var(--text)'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          color: 'var(--text-2)',
                          marginBottom: '0.375rem'
                        }}>
                          Coefficient
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={formData.coefficient}
                          onChange={e => setFormData({ ...formData, coefficient: parseInt(e.target.value) })}
                          style={{
                            width: '100%',
                            padding: '0.625rem 0.875rem',
                            fontSize: '0.85rem',
                            borderRadius: 'var(--r)',
                            border: '1px solid var(--b2)',
                            background: 'var(--void)',
                            color: 'var(--text)'
                          }}
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        color: 'var(--text-2)',
                        marginBottom: '0.375rem'
                      }}>
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Description du sujet..."
                        rows={3}
                        style={{
                          width: '100%',
                          padding: '0.625rem 0.875rem',
                          fontSize: '0.85rem',
                          borderRadius: 'var(--r)',
                          border: '1px solid var(--b2)',
                          background: 'var(--void)',
                          color: 'var(--text)',
                          resize: 'vertical'
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {/* Titre */}
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', display: 'block', marginBottom: '0.25rem' }}>Titre</span>
                      <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)' }}>{formData.titre || '—'}</span>
                    </div>

                    {/* Matiere + Type */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', display: 'block', marginBottom: '0.25rem' }}>Matière</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text)' }}>
                          {formData.matiere || '—'}
                        </span>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', display: 'block', marginBottom: '0.25rem' }}>Type d'examen</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text)' }}>
                          {EXAM_TYPES.find(t => t.value === formData.type)?.label || formData.type || '—'}
                        </span>
                      </div>
                    </div>

                    {/* Année + Série + Filière */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', display: 'block', marginBottom: '0.25rem' }}>Année scolaire</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text)' }}>{formData.annee || '—'}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', display: 'block', marginBottom: '0.25rem' }}>Série</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text)' }}>{formData.serie || '—'}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', display: 'block', marginBottom: '0.25rem' }}>Filière</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text)' }}>{formData.filiere || '—'}</span>
                      </div>
                    </div>

                    {/* Pages + Crédits + Durée + Coefficient */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', display: 'block', marginBottom: '0.25rem' }}>Pages</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text)', fontFamily: 'var(--mono)' }}>{formData.pages || '—'}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', display: 'block', marginBottom: '0.25rem' }}>Crédits (convertis)</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text)', fontFamily: 'var(--mono)' }}>{formData.credits || '—'}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', display: 'block', marginBottom: '0.25rem' }}>Durée</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text)' }}>{formData.duree || '—'}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', display: 'block', marginBottom: '0.25rem' }}>Coefficient</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text)', fontFamily: 'var(--mono)' }}>{formData.coefficient || '—'}</span>
                      </div>
                    </div>

                    {/* Description */}
                    {formData.description && (
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', display: 'block', marginBottom: '0.25rem' }}>Description</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-2)', lineHeight: 1.5 }}>{formData.description}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Difficulty Card */}
              <div style={{
                background: 'var(--b1)',
                borderRadius: 'var(--r-lg)',
                padding: '1.25rem',
                border: '1px solid var(--b2)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  marginBottom: '1rem',
                  paddingBottom: '0.75rem',
                  borderBottom: '1px solid var(--b2)'
                }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: 'var(--r)',
                    background: 'var(--sage-dim)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--sage)'
                  }}>
                    <BarChart3 size={14} />
                  </div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>Niveau de difficulté</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {DIFFICULTES.map(diff => (
                    <button
                      key={diff.value}
                      onClick={() => setFormData({ ...formData, difficulte: diff.value })}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem',
                        borderRadius: 'var(--r)',
                        border: formData.difficulte === diff.value
                          ? `2px solid ${diff.color}`
                          : '1px solid var(--b2)',
                        background: formData.difficulte === diff.value ? diff.bgColor : 'var(--void)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        textAlign: 'left'
                      }}
                    >
                      <span style={{ fontSize: '1.25rem' }}>{diff.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          color: formData.difficulte === diff.value ? diff.color : 'var(--text)'
                        }}>
                          {diff.label}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
                          {diff.description}
                        </div>
                      </div>
                      {formData.difficulte === diff.value && (
                        <CheckCircle size={18} style={{ color: diff.color }} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Badge Selection Card */}
              <div style={{
                background: 'var(--b1)',
                borderRadius: 'var(--r-lg)',
                padding: '1.25rem',
                border: '1px solid var(--b2)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  marginBottom: '1rem',
                  paddingBottom: '0.75rem',
                  borderBottom: '1px solid var(--b2)'
                }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: 'var(--r)',
                    background: 'var(--ruby-dim)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--ruby)'
                  }}>
                    <Tag size={14} />
                  </div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>Badge d'accès</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {BADGES.map(badge => {
                    const Icon = badge.icon
                    const isSelected = formData.badge === badge.value
                    return (
                      <button
                        key={badge.value}
                        onClick={() => setFormData({ ...formData, badge: badge.value })}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.875rem',
                          borderRadius: 'var(--r)',
                          border: isSelected
                            ? `2px solid ${badge.color}`
                            : '1px solid var(--b2)',
                          background: isSelected ? badge.bgColor : 'var(--void)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          textAlign: 'left'
                        }}
                      >
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: 'var(--r)',
                          background: isSelected ? badge.bgColor : 'var(--b2)',
                          border: `1px solid ${isSelected ? badge.borderColor : 'var(--b3)'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: badge.color
                        }}>
                          <Icon size={16} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: isSelected ? badge.color : 'var(--text)'
                          }}>
                            {badge.label}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
                            {badge.description}
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle size={18} style={{ color: badge.color }} />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Validation Notes Card */}
              <div style={{
                background: 'var(--b1)',
                borderRadius: 'var(--r-lg)',
                padding: '1.25rem',
                border: '1px solid var(--b2)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  marginBottom: '1rem',
                  paddingBottom: '0.75rem',
                  borderBottom: '1px solid var(--b2)'
                }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: 'var(--r)',
                    background: 'var(--amber-dim)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--amber)'
                  }}>
                    <AlertTriangle size={14} />
                  </div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>Notes de validation</h3>
                </div>

                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notes internes sur cette soumission (optionnel)..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    fontSize: '0.85rem',
                    borderRadius: 'var(--r)',
                    border: '1px solid var(--b2)',
                    background: 'var(--void)',
                    color: 'var(--text)',
                    resize: 'none',
                    minHeight: '100px'
                  }}
                />
              </div>

              {/* Action Buttons */}
              {!showRejectForm && !showRevisionForm ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  padding: '1.25rem',
                  background: 'var(--b1)',
                  borderRadius: 'var(--r-lg)',
                  border: '1px solid var(--b2)'
                }}>
                  <button
                    onClick={handlePublish}
                    disabled={isPublishing}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      width: '100%',
                      padding: '0.875rem',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      borderRadius: 'var(--r)',
                      border: 'none',
                      background: 'var(--sage)',
                      color: '#fff',
                      cursor: isPublishing ? 'not-allowed' : 'pointer',
                      opacity: isPublishing ? 0.7 : 1,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {isPublishing ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <CheckCircle size={18} />
                    )}
                    {isPublishing ? 'Publication en cours...' : 'Publier le sujet'}
                  </button>

                  <button
                    onClick={() => setShowRevisionForm(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      width: '100%',
                      padding: '0.75rem',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      borderRadius: 'var(--r)',
                      border: '1px solid var(--amber-line)',
                      background: 'var(--amber-dim)',
                      color: 'var(--amber)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <RotateCcw size={16} />
                    Demander une révision
                  </button>

                  <button
                    onClick={() => setShowRejectForm(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      width: '100%',
                      padding: '0.75rem',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      borderRadius: 'var(--r)',
                      border: '1px solid var(--ruby-line)',
                      background: 'var(--ruby-dim)',
                      color: 'var(--ruby)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <XCircle size={16} />
                    Rejeter cette soumission
                  </button>
                </div>
              ) : showRevisionForm ? (
                <div style={{
                  padding: '1.25rem',
                  background: 'var(--amber-dim)',
                  borderRadius: 'var(--r-lg)',
                  border: '1px solid var(--amber-line)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.75rem',
                    color: 'var(--amber)',
                    fontWeight: 600
                  }}>
                    <RotateCcw size={18} />
                    Demander une révision
                  </div>

                  <p style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-2)',
                    lineHeight: 1.5,
                    marginBottom: '0.875rem'
                  }}>
                    Le contributeur recevra ce message et pourra rééditer son sujet.
                    Utilisez le champ <strong>« Notes de validation »</strong> ci-dessus pour
                    décrire précisément les modifications attendues.
                  </p>

                  <div style={{
                    padding: '0.75rem',
                    background: 'var(--void)',
                    borderRadius: 'var(--r)',
                    border: '1px solid var(--b2)',
                    marginBottom: '1rem',
                    maxHeight: '140px',
                    overflow: 'auto'
                  }}>
                    <div style={{
                      fontSize: '0.7rem',
                      color: 'var(--text-3)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '0.25rem'
                    }}>
                      Aperçu du message
                    </div>
                    <div style={{
                      fontSize: '0.85rem',
                      color: formData.notes.trim() ? 'var(--text)' : 'var(--text-4)',
                      whiteSpace: 'pre-wrap',
                      fontStyle: formData.notes.trim() ? 'normal' : 'italic'
                    }}>
                      {formData.notes.trim() || '(Les notes de validation sont vides — écrivez votre message dans le champ au-dessus)'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={handleRequestRevision}
                      disabled={isRequestingRevision || formData.notes.trim().length < 10}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        flex: 1,
                        padding: '0.625rem',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        borderRadius: 'var(--r)',
                        border: 'none',
                        background: 'var(--amber)',
                        color: '#fff',
                        cursor:
                          isRequestingRevision || formData.notes.trim().length < 10
                            ? 'not-allowed'
                            : 'pointer',
                        opacity:
                          isRequestingRevision || formData.notes.trim().length < 10
                            ? 0.6
                            : 1,
                      }}
                    >
                      {isRequestingRevision ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <RotateCcw size={16} />
                      )}
                      {isRequestingRevision ? 'Envoi...' : 'Envoyer la demande'}
                    </button>

                    <button
                      onClick={() => setShowRevisionForm(false)}
                      disabled={isRequestingRevision}
                      style={{
                        padding: '0.625rem 1rem',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        borderRadius: 'var(--r)',
                        border: '1px solid var(--b2)',
                        background: 'var(--void)',
                        color: 'var(--text-2)',
                        cursor: isRequestingRevision ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{
                  padding: '1.25rem',
                  background: 'var(--ruby-dim)',
                  borderRadius: 'var(--r-lg)',
                  border: '1px solid var(--ruby-line)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '1rem',
                    color: 'var(--ruby)',
                    fontWeight: 600
                  }}>
                    <AlertTriangle size={18} />
                    Rejeter cette soumission
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.8rem',
                      fontWeight: 500,
                      color: 'var(--text-2)',
                      marginBottom: '0.375rem'
                    }}>
                      Motif du rejet <span style={{ color: 'var(--ruby)' }}>*</span>
                    </label>
                    <textarea
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                      placeholder="Expliquez clairement pourquoi cette soumission est rejetée..."
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        fontSize: '0.85rem',
                        borderRadius: 'var(--r)',
                        border: '1px solid var(--ruby-line)',
                        background: 'var(--void)',
                        color: 'var(--text)',
                        resize: 'none'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={handleReject}
                      disabled={isRejecting}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        flex: 1,
                        padding: '0.625rem',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        borderRadius: 'var(--r)',
                        border: 'none',
                        background: 'var(--ruby)',
                        color: '#fff',
                        cursor: isRejecting ? 'not-allowed' : 'pointer',
                        opacity: isRejecting ? 0.7 : 1
                      }}
                    >
                      {isRejecting ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <XCircle size={16} />
                      )}
                      {isRejecting ? 'Rejet...' : 'Confirmer le rejet'}
                    </button>

                    <button
                      onClick={() => setShowRejectForm(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        padding: '0.625rem 1rem',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        borderRadius: 'var(--r)',
                        border: '1px solid var(--b2)',
                        background: 'var(--void)',
                        color: 'var(--text-2)',
                        cursor: 'pointer'
                      }}
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Preview Tab - Rendered HTML like real subject page */
          <div style={{
            background: 'var(--b1)',
            borderRadius: 'var(--r-lg)',
            border: '1px solid var(--b2)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '1rem 1.25rem',
              background: 'var(--void)',
              borderBottom: '1px solid var(--b2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--r)',
                  background: 'var(--gold-dim)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--gold)'
                }}>
                  <Eye size={16} />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>
                    Aperçu du sujet
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', margin: '0.25rem 0 0 0' }}>
                    Rendu final tel que les élèves le verront
                  </p>
                </div>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.75rem',
                color: 'var(--text-3)'
              }}>
                <span style={{
                  padding: '0.25rem 0.625rem',
                  background: 'var(--b2)',
                  borderRadius: 'var(--r)',
                  fontFamily: 'var(--mono)'
                }}>
                  {submission.content ? 'Contenu formaté' : 'Aucun contenu'}
                </span>
              </div>
            </div>
            <div style={{
              padding: '1.25rem',
              maxHeight: '600px',
              overflow: 'auto'
            }}>
              <SubmissionPreview
                content={submission.content}
                submission={{
                  title: formData.titre || submission.title,
                  matiere: formData.matiere || submission.matiere,
                  examType: formData.type || submission.examType,
                  anneeScolaire: formData.annee || submission.anneeScolaire,
                  serie: formData.serie || submission.serie,
                  filiere: formData.filiere || submission.filiere,
                  duree: formData.duree || submission.duree,
                  pages: formData.pages || submission.pages,
                  coefficient: formData.coefficient || submission.coefficient,
                  difficulte: formData.difficulte || submission.difficulte,
                  description: formData.description || submission.description,
                  prix: formData.credits || submission.prix,
                  authorPrenom: submission.authorPrenom,
                  authorNom: submission.authorNom
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
