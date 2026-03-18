'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { LuxuryNavbar } from '@/components/layout/LuxuryNavbar'
import { LuxuryCursor } from '@/components/layout/LuxuryCursor'
import { ProfileEditModal } from '@/components/modals/ProfileEditModal'
import { updateProfileAction } from '@/actions/profile'
import { 
  MapPin, GraduationCap, Building, Phone, Calendar, 
  User as UserIcon, BookOpen, Shield, ShoppingBag, 
  Wallet, Eye, EyeOff, CheckCircle, Info, ArrowRight,
  Lock, Trash2, Database, Zap
} from 'lucide-react'
import './profil.css'
import '@/components/modals/ProfileEditModal.css'

type TabType = 'infos' | 'achats' | 'mvola' | 'securite'

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
  const [activeTab, setActiveTab] = useState<TabType>('infos')
  const [loading, setLoading] = useState(true)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
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
      const result = await updateProfileAction(userId!, data)
      
      if (result.success) {
        setNotification({ type: 'success', message: 'Profil sublimé avec succès !' })
        setEditModalOpen(false)
        setTimeout(() => window.location.reload(), 1500)
      } else {
        setNotification({ type: 'error', message: result.error || 'Dissonance lors de la mise à jour' })
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Erreur mystique du serveur' })
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
                <h1 className="ph-name">{appUser?.prenom} {appUser?.nom}</h1>
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
                <div className="n">24</div>
                <div className="l">Sujets</div>
              </div>
              <div className="ph-stat">
                <div className="n gold-text">{appUser?.credits || 0}</div>
                <div className="l">Crédits</div>
              </div>
              <div className="ph-stat">
                <div className="n">4.8</div>
                <div className="l">Note</div>
              </div>
            </div>
            <button className="btn-profile-public" onClick={() => router.push(`/profil/${userId}`)}>
              <Eye size={14} /> Aperçu Public
            </button>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="profile-nav-tabs">
          {[
            { id: 'infos', label: 'Identité', icon: <UserIcon size={16} /> },
            { id: 'achats', label: 'Bibliothèque', icon: <ShoppingBag size={16} /> },
            { id: 'mvola', label: 'Finance', icon: <Wallet size={16} /> },
            { id: 'securite', label: 'Coffre-fort', icon: <Shield size={16} /> }
          ].map(tab => (
            <button 
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id as TabType)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* CONTENU DES ONGLETS */}
        <div className="tabs-content">
          
          {/* TAB: INFOS */}
          <div className={`ptab-panel ${activeTab === 'infos' ? 'active' : ''}`}>
            <div className="profile-grid">
              <div className="grid-column">
                <div className="luxury-card settings-card">
                  <div className="sc-header">
                    <h3 className="sc-title">Informations <em>Personnelles</em></h3>
                    <Info size={14} className="sc-info-icon" />
                  </div>
                  <div className="info-rows">
                    <ProfileInfoRow label="Identité" value={`${appUser?.prenom} ${appUser?.nom || ''}`} icon={<UserIcon size={14} />} showVisibilityIcon={false} />
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
                      {appUser?.matieresPreferees?.length > 0 ? (
                        appUser.matieresPreferees.map((m: string) => <span key={m} className="luxury-tag">{m}</span>)
                      ) : (
                        <span className="luxury-tag-empty">Aucune matière favorite</span>
                      )}
                    </div>
                  </div>

                  <div className="pref-group mt-6">
                    <span className="ir-label">Objectifs Visés</span>
                    <div className="luxury-tags">
                      {appUser?.objectifsEtude?.length > 0 ? (
                        appUser.objectifsEtude.map((o: string) => <span key={o} className="luxury-tag gold">{o}</span>)
                      ) : (
                        <span className="luxury-tag-empty">Aucun objectif défini</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TAB: ACHATS (BIBLIOTHÈQUE) */}
          <div className={`ptab-panel ${activeTab === 'achats' ? 'active' : ''}`}>
            <div className="luxury-card p-10">
              <div className="sc-header mb-8">
                <h3 className="sc-title">Ma <em>Bibliothèque</em> de Sujets</h3>
                <ShoppingBag size={18} className="text-gold opacity-50" />
              </div>
              <div className="purchase-modern-grid">
                {[1, 2, 3].map(i => (
                  <div key={i} className="modern-pur-card">
                    <div className="mp-header">
                      <span className="mp-tag">{i % 2 === 0 ? 'Maths BAC' : 'Physique BEPC'}</span>
                      <span className="mp-price">-{i * 5} cr</span>
                    </div>
                    <h4 className="mp-title">{i % 2 === 0 ? 'Algèbre & Fonctions Complexes' : 'Mécanique & Électricité'}</h4>
                    <div className="mp-footer">
                      <span>Acheté le {i + 10} Mar 2026</span>
                      <button className="mp-view">Consulter <ArrowRight size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TAB: MVOLA (FINANCE) */}
          <div className={`ptab-panel ${activeTab === 'mvola' ? 'active' : ''}`}>
            <div className="finance-layout">
              <div className="luxury-card mvola-premium">
                <div className="mp-head">
                  <div className="mp-logo">MVola</div>
                  <div className="mp-status">ACTIF</div>
                </div>
                <div className="mp-number">{appUser?.phone || '034 XX XXX XX'}</div>
                <div className="mp-balance">
                  <span className="lbl">Solde Mah.AI</span>
                  <span className="val">{appUser?.credits || 0} <em>cr</em></span>
                </div>
                <button className="btn-mp-topup" onClick={() => router.push('/credits')}>Recharger le compte</button>
              </div>

              <div className="luxury-card settings-card flex-1">
                <div className="sc-header">
                  <h3 className="sc-title">Dernières <em>Transactions</em></h3>
                  <Wallet size={14} className="sc-info-icon" />
                </div>
                <div className="info-rows">
                  <div className="transaction-row">
                    <div className="tr-icon plus">+</div>
                    <div className="tr-info">
                      <div className="tr-title">Recharge MVola</div>
                      <div className="tr-date">12 Mars 2026</div>
                    </div>
                    <div className="tr-amount positive">+150 cr</div>
                  </div>
                  <div className="transaction-row">
                    <div className="tr-icon minus">-</div>
                    <div className="tr-info">
                      <div className="tr-title">Achat Sujet BAC</div>
                      <div className="tr-date">10 Mars 2026</div>
                    </div>
                    <div className="tr-amount negative">-15 cr</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TAB: SECURITE (COFFRE-FORT) */}
          <div className={`ptab-panel ${activeTab === 'securite' ? 'active' : ''}`}>
            <div className="profile-grid">
              <div className="luxury-card settings-card">
                <div className="sc-header">
                  <h3 className="sc-title">Accès <em>& Protection</em></h3>
                  <Lock size={14} className="sc-info-icon" />
                </div>
                <p className="text-sm text-text-3 mb-8">Gérez vos identifiants et la sécurité de votre session.</p>
                <div className="info-rows mb-8">
                  <ProfileInfoRow label="Mot de passe" value="••••••••••••" showVisibilityIcon={false} />
                  <ProfileInfoRow label="Double Auth" value="Désactivé" showVisibilityIcon={false} />
                </div>
                <button className="btn-card-action">Changer le mot de passe</button>
              </div>

              <div className="luxury-card danger-zone-modern">
                <div className="sc-header">
                  <h3 className="sc-title text-rose">Zone de <em>Confiance</em></h3>
                  <Trash2 size={14} className="text-rose opacity-50" />
                </div>
                <p className="text-sm text-text-3 mb-8">Action irréversibles concernant vos données personnelles.</p>
                <div className="info-rows mb-8">
                  <div className="info-row">
                    <div className="ir-label">Données</div>
                    <div className="ir-content"><span className="ir-value">Télécharger mon archive JSON</span></div>
                    <div className="ir-visibility-cell"><Database size={14} className="opacity-30" /></div>
                  </div>
                </div>
                <button className="btn-danger-modern">Supprimer mon compte définitivement</button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* NOTIFICATION LUXURY */}
      {notification && (
        <div className={`luxury-notif ${notification.type}`}>
          <div className="ln-icon">{notification.type === 'success' ? '✓' : '✕'}</div>
          <div className="ln-text">{notification.message}</div>
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
