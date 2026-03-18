'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { LuxuryNavbar } from '@/components/layout/LuxuryNavbar'
import { LuxuryCursor } from '@/components/layout/LuxuryCursor'
import { ProfileEditModal } from '@/components/modals/ProfileEditModal'
import { updateCurrentUserProfileAction } from '@/actions/profile'
import { 
  MapPin, GraduationCap, Building, Phone, Calendar, 
  User as UserIcon, BookOpen, Shield,
  Eye, EyeOff, CheckCircle, Info, Zap
} from 'lucide-react'
import './profil.css'
import '@/components/modals/ProfileEditModal.css'

interface InfoRowProps {
  label: string
  value: string | number | undefined | null
  icon?: React.ReactNode
  isPublic?: boolean
  showVisibilityIcon?: boolean
}

function ProfileInfoRow({ label, value, icon, isPublic, showVisibilityIcon = true }: InfoRowProps) {
  const isEmpty = !value || value === ''
  const displayValue = isEmpty ? 'Non renseigné' : value

  return (
    <div className={`info-row ${isEmpty ? 'is-empty' : ''}`}>
      <div className="ir-label">{label}</div>
      <div className="ir-content">
        {icon && <span className="ir-icon">{icon}</span>}
        <span className="ir-value">{displayValue}</span>
      </div>
      <div className="ir-visibility-cell">
        {showVisibilityIcon && (
          <div className={`ir-visibility ${isPublic ? 'public' : 'private'}`} title={isPublic ? 'Visible sur votre profil public' : 'Masqué sur votre profil public'}>
            {isPublic ? <Eye size={14} /> : <EyeOff size={14} />}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const router = useRouter()
  const { userId, user, appUser, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'profil' | 'mes-sujets' | 'coffre-fort' | 'securite'>('profil')
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  useEffect(() => {
    if (!authLoading) {
      if (!userId) {
        router.push('/auth/login')
      } else {
        setLoading(false)
      }
    }
  }, [userId, authLoading, router])

  if (loading || authLoading || !userId) {
    return (
      <div className="loading-screen" style={{ background: 'var(--void)', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)' }}>
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">Symphonie de vos données...</p>
        </div>
      </div>
    )
  }

  const handleProfileUpdate = async (data: any) => {
    setSaveLoading(true)
    try {
      // Nettoyer les données avant envoi
      const cleanedData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== null && value !== '')
      )

      const result = await updateCurrentUserProfileAction(cleanedData)

      if (result.success) {
        setNotification({ type: 'success', message: 'Profil sublimé avec succès !' })
        setEditModalOpen(false)
        setTimeout(() => window.location.reload(), 1500)
      } else {
        console.error('Erreur mise à jour:', result)
        const errorMsg = result.details 
          ? `Validation échouée: ${JSON.stringify(result.details)}`
          : (result.error || 'Dissonance lors de la mise à jour')
        setNotification({ type: 'error', message: errorMsg })
      }
    } catch (error) {
      console.error('Erreur exceptionnelle:', error)
      setNotification({ type: 'error', message: error instanceof Error ? error.message : 'Erreur mystique du serveur' })
    } finally {
      setSaveLoading(false)
    }
  }

  const calculateAge = (birthDate: string | null | undefined) => {
    if (!birthDate) return null
    const birth = new Date(birthDate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const userInitial = (appUser?.prenom?.charAt(0) || user?.email?.charAt(0) || 'U').toUpperCase()
  
  const displayUserType = () => {
    if (appUser?.userType === 'AUTRE') return appUser.customUserType || 'Passionné'
    const types: Record<string, string> = {
      'ETUDIANT': 'Étudiant',
      'PROFESSIONNEL': 'Professionnel',
      'ENSEIGNANT': 'Enseignant',
      'PARENT': 'Parent'
    }
    return types[appUser?.userType || ''] || 'Utilisateur'
  }

  return (
    <div className="profile-page">
      <LuxuryCursor />
      <LuxuryNavbar />

      <div className="profile-container">
        {/* HEADER ARCHITECTURAL */}
        <div className="profile-header luxury-card">
          <div className="ph-left">
            <div className="ph-avatar-wrap">
              <div className="ph-avatar">
                <span className="ph-avatar-glow"></span>
                {userInitial}
              </div>
              <button className="ph-edit-btn" onClick={() => setEditModalOpen(true)}>✏️</button>
            </div>
            
            <div className="ph-info">
              <div className="ph-name-wrap">
                <h1 className="ph-name">{appUser?.nomComplet || appUser?.prenom}</h1>
                {appUser?.pseudo && (
                  <span className="ph-badge" style={{ marginLeft: '0.5rem' }}>@{appUser.pseudo}</span>
                )}
                <CheckCircle size={22} className="ph-verified-icon" />
              </div>

              <div className="ph-badges">
                <span className="ph-badge student">{displayUserType()}</span>
                {appUser?.role === 'CONTRIBUTEUR' && <span className="ph-badge contrib">Contributeur Or</span>}
              </div>
              
              <div className="ph-meta">
                {appUser?.region && (
                  <div className="ph-meta-item">
                    <MapPin size={12} />
                    <span>{appUser.district}, {appUser.region}</span>
                  </div>
                )}
                <div className="ph-meta-item">
                  <Calendar size={12} />
                  <span>Membre depuis {new Date(appUser?.createdAt || Date.now()).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="ph-right">
            <div className="ph-stats">
              <div className="ph-stat">
                <div className="n gold-text">{appUser?.credits || 0}</div>
                <div className="l">Crédits</div>
              </div>
              <div className="ph-stat">
                <div className="n">{appUser?.profilePublic ? 'Oui' : 'Non'}</div>
                <div className="l">Profil public</div>
              </div>
            </div>
            <button className="btn-profile-public" onClick={() => router.push(`/profil/${userId}`)}>
              <Eye size={14} /> Aperçu Public
            </button>
          </div>
        </div>

        <nav className="luxury-card profile-nav-tabs" aria-label="Navigation des sections du profil utilisateur">
          <button type="button" className={`nav-tab ${activeTab === 'profil' ? 'active' : ''}`} onClick={() => setActiveTab('profil')}>
            <UserIcon size={14} />
            Profil
          </button>
          <button type="button" className={`nav-tab ${activeTab === 'mes-sujets' ? 'active' : ''}`} onClick={() => setActiveTab('mes-sujets')}>
            <BookOpen size={14} />
            Mes sujets
          </button>
          <button type="button" className={`nav-tab ${activeTab === 'coffre-fort' ? 'active' : ''}`} onClick={() => setActiveTab('coffre-fort')}>
            <Zap size={14} />
            Coffre-fort
          </button>
          <button type="button" className={`nav-tab ${activeTab === 'securite' ? 'active' : ''}`} onClick={() => setActiveTab('securite')}>
            <Shield size={14} />
            Sécurité
          </button>
        </nav>

        <div className="tabs-content">
          <div className={`ptab-panel ${activeTab === 'profil' ? 'active' : ''}`}>
            <div className="profile-grid">
              <div className="grid-column">
                <div className="luxury-card settings-card">
                  <div className="sc-header">
                    <h3 className="sc-title">Informations <em>Personnelles</em></h3>
                    <Info size={14} className="sc-info-icon" />
                  </div>
                  <div className="info-rows">
                    <ProfileInfoRow label="Nom complet" value={appUser?.nomComplet || appUser?.prenom || 'Non renseigné'} icon={<UserIcon size={14} />} showVisibilityIcon={false} />
                    <ProfileInfoRow label="Pseudo" value={appUser?.pseudo || 'Non renseigné'} icon={<UserIcon size={14} />} showVisibilityIcon={false} />
                    <ProfileInfoRow label="Âge" value={appUser?.birthDate ? `${calculateAge(appUser.birthDate)} ans` : null} icon={<Calendar size={14} />} showVisibilityIcon={false} />
                    <ProfileInfoRow label="E-mail" value={user?.email} icon={<Shield size={14} />} isPublic={appUser?.showEmail} />
                    <ProfileInfoRow label="Téléphone" value={appUser?.phone} icon={<Phone size={14} />} isPublic={appUser?.showPhone} />
                  </div>
                  <button className="btn-card-action" onClick={() => setEditModalOpen(true)}>Éditer le profil</button>
                </div>

                <div className="luxury-card settings-card">
                  <div className="sc-header">
                    <h3 className="sc-title">Localisation <em>& Zone</em></h3>
                    <MapPin size={14} className="sc-info-icon" />
                  </div>
                  <div className="info-rows">
                    <ProfileInfoRow label="Région" value={appUser?.region} showVisibilityIcon={false} />
                    <ProfileInfoRow label="District" value={appUser?.district} showVisibilityIcon={false} />
                  </div>
                </div>
              </div>

              <div className="grid-column">
                <div className="luxury-card settings-card">
                  <div className="sc-header">
                    <h3 className="sc-title">Parcours <em>Académique</em></h3>
                    <GraduationCap size={14} className="sc-info-icon" />
                  </div>
                  <div className="info-rows">
                    <ProfileInfoRow label="Établissement" value={appUser?.etablissement} icon={<Building size={14} />} isPublic={appUser?.showEtablissement} />
                    <ProfileInfoRow label="Niveau" value={appUser?.educationLevel} showVisibilityIcon={false} />
                    <ProfileInfoRow label="Classe / Série" value={appUser?.gradeLevel} showVisibilityIcon={false} />
                    {appUser?.filiere && (
                      <ProfileInfoRow label="Filière" value={appUser.filiere} icon={<BookOpen size={14} />} showVisibilityIcon={false} />
                    )}
                  </div>
                </div>

                <div className="luxury-card settings-card">
                  <div className="sc-header">
                    <h3 className="sc-title">Ambitions <em>& Goûts</em></h3>
                    <Zap size={14} className="sc-info-icon" />
                  </div>

                  <div className="pref-group">
                    <span className="ir-label">Matières de Prédilection</span>
                    <div className="luxury-tags">
                      {(appUser?.matieresPreferees?.length ?? 0) > 0 ? (
                        appUser?.matieresPreferees?.map((m: string) => <span key={m} className="luxury-tag">{m}</span>)
                      ) : (
                        <span className="luxury-tag-empty">Aucune matière favorite</span>
                      )}
                    </div>
                  </div>

                  <div className="pref-group mt-6">
                    <span className="ir-label">Objectifs Visés</span>
                    <div className="luxury-tags">
                      {(appUser?.objectifsEtude?.length ?? 0) > 0 ? (
                        appUser?.objectifsEtude?.map((o: string) => <span key={o} className="luxury-tag gold">{o}</span>)
                      ) : (
                        <span className="luxury-tag-empty">Aucun objectif défini</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="luxury-card settings-card">
                  <div className="sc-header">
                    <h3 className="sc-title">Fonctionnalités <em>En Intégration</em></h3>
                    <Info size={14} className="sc-info-icon" />
                  </div>
                  <p className="text-sm text-text-3">
                    La bibliothèque d’achats, l’historique financier et les réglages avancés de sécurité seront réintroduits quand leurs vraies données seront connectées.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className={`ptab-panel ${activeTab === 'mes-sujets' ? 'active' : ''}`}>
            <div className="luxury-card settings-card empty-section-card">
              <div className="sc-header">
                <h3 className="sc-title">Mes <em>Sujets</em></h3>
                <BookOpen size={14} className="sc-info-icon" />
              </div>
              <p className="empty-section-title">Aucune donnée disponible pour le moment.</p>
              <p className="empty-section-text">
                Vos achats, téléchargements et progression apparaîtront ici dès que l’intégration des données sera finalisée.
              </p>
            </div>
          </div>

          <div className={`ptab-panel ${activeTab === 'coffre-fort' ? 'active' : ''}`}>
            <div className="luxury-card settings-card empty-section-card">
              <div className="sc-header">
                <h3 className="sc-title">Coffre-<em>fort</em></h3>
                <Zap size={14} className="sc-info-icon" />
              </div>
              <p className="empty-section-title">Aucune donnée disponible pour le moment.</p>
              <p className="empty-section-text">
                Le suivi des crédits, transactions et paiements sera affiché ici quand le module financier sera relié.
              </p>
            </div>
          </div>

          <div className={`ptab-panel ${activeTab === 'securite' ? 'active' : ''}`}>
            <div className="luxury-card settings-card empty-section-card">
              <div className="sc-header">
                <h3 className="sc-title">Paramètres <em>Sécurité</em></h3>
                <Shield size={14} className="sc-info-icon" />
              </div>
              <p className="empty-section-title">Aucune donnée disponible pour le moment.</p>
              <p className="empty-section-text">
                Les préférences de sécurité avancées (sessions, authentification renforcée, historiques) seront ajoutées dans cette section.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* NOTIFICATION TOAST */}
      {notification && (
        <div className="toast-container">
          <div className={`toast ${notification.type}`}>
            <div className="toast-icon">{notification.type === 'success' ? '✓' : '✕'}</div>
            <div className="toast-content">
              <div className="toast-title">{notification.type === 'success' ? 'Succès' : 'Erreur'}</div>
              <div className="toast-msg">{notification.message}</div>
            </div>
            <button
              className="toast-close"
              onClick={() => setNotification(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* MODALE D'ÉDITION */}
      <ProfileEditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        userData={appUser}
        onSave={handleProfileUpdate}
        loading={saveLoading}
      />

      <style jsx>{`
        .mt-6 { margin-top: 1.5rem; }
        .mb-8 { margin-bottom: 2rem; }
        .p-10 { padding: 3rem; }
        .flex-1 { flex: 1; }
        .text-rose { color: #FF4D4F; }
      `}</style>
    </div>
  )
}
