'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { LuxuryNavbar } from '@/components/layout/LuxuryNavbar'
import { LuxuryCursor } from '@/components/layout/LuxuryCursor'
import { ProfileEditModal } from '@/components/modals/ProfileEditModal'
import { AvatarUploadModal } from '@/components/modals/AvatarUploadModal'
import { ProfilePageSkeleton } from '@/components/ui/PageSkeletons'
import {
  updateCurrentUserProfileAction,
  getCurrentUserPurchasedSubjectsAction,
  updateCurrentUserSecuritySettingsAction,
  type PurchasedSubjectItem,
} from '@/actions/profile'
import { uploadAvatarAction } from '@/actions/avatar'
import {
  MapPin, GraduationCap, Building, Phone, Calendar,
  User as UserIcon, BookOpen, Shield, BellRing, Clock3, KeyRound,
  Eye, EyeOff, CheckCircle, Info, Zap, Camera
} from 'lucide-react'
import './profil.css'
import '@/components/modals/ProfileEditModal.css'
import '@/components/modals/AvatarUploadModal.css'

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
  const [avatarModalOpen, setAvatarModalOpen] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'profil' | 'mes-sujets' | 'coffre-fort' | 'securite'>('profil')
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [purchasedSubjects, setPurchasedSubjects] = useState<PurchasedSubjectItem[]>([])
  const [purchasedSubjectsLoading, setPurchasedSubjectsLoading] = useState(false)
  const [purchasedSubjectsLoaded, setPurchasedSubjectsLoaded] = useState(false)
  const [securitySaving, setSecuritySaving] = useState(false)
  const [securitySettings, setSecuritySettings] = useState({
    securityTwoFactorEnabled: false,
    securityLoginAlertEnabled: true,
    securityUnknownDeviceBlock: false,
    securityRecoveryEmailEnabled: true,
    securitySessionTimeoutMinutes: 120,
  })

  const handleAvatarChange = async (file: File) => {
    if (!userId) return

    try {
      setSaveLoading(true)
      const result = await uploadAvatarAction(userId, file)

      if (result.success) {
        setNotification({ type: 'success', message: 'Avatar mis à jour avec succès !' })
        setAvatarModalOpen(false)
        setTimeout(() => window.location.reload(), 1500)
      } else {
        setNotification({ type: 'error', message: result.error || 'Erreur lors de l\'upload' })
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Erreur lors de l\'upload de l\'avatar' })
    } finally {
      setSaveLoading(false)
    }
  }

  const loadPurchasedSubjects = async () => {
    if (purchasedSubjectsLoading) return

    setPurchasedSubjectsLoading(true)
    try {
      const result = await getCurrentUserPurchasedSubjectsAction()
      if (result.success) {
        setPurchasedSubjects(result.data)
      } else {
        setNotification({ type: 'error', message: result.error || 'Impossible de charger vos sujets débloqués.' })
      }
    } catch (error) {
      console.error('Erreur chargement mes sujets:', error)
      setNotification({ type: 'error', message: 'Erreur serveur pendant le chargement de vos sujets.' })
    } finally {
      setPurchasedSubjectsLoading(false)
      setPurchasedSubjectsLoaded(true)
    }
  }

  const handleSecuritySave = async () => {
    setSecuritySaving(true)
    try {
      const result = await updateCurrentUserSecuritySettingsAction(securitySettings)
      if (result.success) {
        setNotification({ type: 'success', message: 'Paramètres de sécurité enregistrés.' })
      } else {
        setNotification({ type: 'error', message: result.error || 'Échec de la sauvegarde des paramètres.' })
      }
    } catch (error) {
      console.error('Erreur sauvegarde sécurité:', error)
      setNotification({ type: 'error', message: 'Erreur serveur pendant la sauvegarde de la sécurité.' })
    } finally {
      setSecuritySaving(false)
    }
  }

  useEffect(() => {
    if (!authLoading) {
      if (!userId) {
        router.push('/auth/login')
      } else {
        setLoading(false)
      }
    }
  }, [userId, authLoading, router])

  useEffect(() => {
    if (!appUser) return

    setSecuritySettings({
      securityTwoFactorEnabled: appUser.securityTwoFactorEnabled ?? false,
      securityLoginAlertEnabled: appUser.securityLoginAlertEnabled ?? true,
      securityUnknownDeviceBlock: appUser.securityUnknownDeviceBlock ?? false,
      securityRecoveryEmailEnabled: appUser.securityRecoveryEmailEnabled ?? true,
      securitySessionTimeoutMinutes: appUser.securitySessionTimeoutMinutes ?? 120,
    })
  }, [appUser])

  useEffect(() => {
    if (activeTab === 'mes-sujets' && !purchasedSubjectsLoaded) {
      loadPurchasedSubjects()
    }
  }, [activeTab, purchasedSubjectsLoaded])

  if (loading || authLoading || !userId) {
    return (
      <>
        <LuxuryNavbar />
        <LuxuryCursor />
        <ProfilePageSkeleton />
      </>
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
              {appUser?.profilePicture ? (
                <div className="ph-avatar-image">
                  <img src={appUser.profilePicture} alt="Avatar" />
                </div>
              ) : (
                <div className="ph-avatar">
                  <span className="ph-avatar-glow"></span>
                  {userInitial}
                </div>
              )}
              <button className="ph-edit-btn ph-camera-btn" onClick={() => setAvatarModalOpen(true)} title="Changer l'avatar">
                <Camera size={16} />
              </button>
            </div>

            <div className="ph-info">
              <div className="ph-name-wrap">
                <div className="ph-name-block">
                  <h1 className="ph-name">{appUser?.prenom}</h1>
                  <p className="ph-surname">{appUser?.nom}</p>
                </div>
                {appUser?.pseudo && (
                  <span className="ph-badge">@{appUser.pseudo}</span>
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
                    <ProfileInfoRow label="Pseudo" value={appUser?.pseudo || 'Non renseigné'} icon={<UserIcon size={14} />} showVisibilityIcon={false} />
                    <ProfileInfoRow label="Prénom" value={appUser?.prenom || 'Non renseigné'} icon={<UserIcon size={14} />} showVisibilityIcon={false} />
                    <ProfileInfoRow label="Nom" value={appUser?.nom || 'Non renseigné'} icon={<UserIcon size={14} />} showVisibilityIcon={false} />
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
            <div className="section-header">
              <h3 className="section-title-with-icon">
                <BookOpen size={18} />
                Mes <em>Sujets</em>
              </h3>
            </div>

            {purchasedSubjectsLoading ? (
              <div className="subjects-grid">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="subject-card-skeleton">
                    <div className="subject-line w-70"></div>
                    <div className="subject-line w-45"></div>
                    <div className="subject-line w-30"></div>
                  </div>
                ))}
              </div>
            ) : purchasedSubjects.length > 0 ? (
              <>
                <div className="subjects-summary">
                  <span>
                    <strong>{purchasedSubjects.length}</strong> sujet{purchasedSubjects.length > 1 ? 's' : ''} débloqué{purchasedSubjects.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="subjects-grid">
                  {purchasedSubjects.map((subject) => (
                    <article key={`${subject.id}-${subject.purchasedAt}`} className="subject-card">
                      <div className="subject-card-head">
                        <span className="subject-badge">{subject.type}</span>
                        <span className="subject-credits">-{subject.creditsAmount} cr</span>
                      </div>
                      <h4 className="subject-title">{subject.titre}</h4>
                      <p className="subject-meta">
                        {subject.matiere} · {subject.annee}{subject.serie ? ` · ${subject.serie}` : ''}
                      </p>
                      <p className="subject-date">
                        Débloqué le {new Date(subject.purchasedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </p>
                      <button className="btn-card-action mt-4" onClick={() => router.push(`/sujet/${subject.id}`)}>
                        Ouvrir le sujet
                      </button>
                    </article>
                  ))}
                </div>
              </>
            ) : (
              <>
                <p className="empty-section-title">Aucun sujet débloqué pour le moment.</p>
                <p className="empty-section-text">
                  Quand vous achetez un sujet avec vos crédits, il apparaît automatiquement ici.
                </p>
                <button className="btn-card-action mt-4" onClick={() => router.push('/catalogue')}>
                  Explorer le catalogue
                </button>
              </>
            )}
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
            <div className="section-header">
              <h3 className="section-title-with-icon">
                <Shield size={18} />
                Paramètres <em>Sécurité</em>
              </h3>
            </div>

            <div className="security-grid">
                <div className="security-card">
                  <div className="security-card-head">
                    <BellRing size={16} className="sc-info-icon" />
                    <div>
                      <div className="security-title">Alertes de connexion</div>
                      <div className="security-desc">Recevoir un email lors d’une nouvelle connexion.</div>
                    </div>
                  </div>
                  <label className="security-switch">
                    <input
                      type="checkbox"
                      checked={securitySettings.securityLoginAlertEnabled}
                      onChange={(event) =>
                        setSecuritySettings((previous) => ({
                          ...previous,
                          securityLoginAlertEnabled: event.target.checked,
                        }))
                      }
                    />
                    <span>Activer</span>
                  </label>
                </div>

                <div className="security-card">
                  <div className="security-card-head">
                    <Shield size={16} className="sc-info-icon" />
                    <div>
                      <div className="security-title">Blocage appareil inconnu</div>
                      <div className="security-desc">Refuser les connexions depuis un appareil non reconnu.</div>
                    </div>
                  </div>
                  <label className="security-switch">
                    <input
                      type="checkbox"
                      checked={securitySettings.securityUnknownDeviceBlock}
                      onChange={(event) =>
                        setSecuritySettings((previous) => ({
                          ...previous,
                          securityUnknownDeviceBlock: event.target.checked,
                        }))
                      }
                    />
                    <span>Activer</span>
                  </label>
                </div>

                <div className="security-card">
                  <div className="security-card-head">
                    <KeyRound size={16} className="sc-info-icon" />
                    <div>
                      <div className="security-title">Authentification renforcée (2FA)</div>
                      <div className="security-desc">Préférence stockée dès maintenant, activation finale au prochain sprint.</div>
                    </div>
                  </div>
                  <label className="security-switch">
                    <input
                      type="checkbox"
                      checked={securitySettings.securityTwoFactorEnabled}
                      onChange={(event) =>
                        setSecuritySettings((previous) => ({
                          ...previous,
                          securityTwoFactorEnabled: event.target.checked,
                        }))
                      }
                    />
                    <span>Activer</span>
                  </label>
                </div>

                <div className="security-card">
                  <div className="security-card-head">
                    <Clock3 size={16} className="sc-info-icon" />
                    <div>
                      <div className="security-title">Expiration automatique de session</div>
                      <div className="security-desc">Déconnexion automatique après inactivité.</div>
                    </div>
                  </div>
                  <select
                    className="security-select"
                    value={securitySettings.securitySessionTimeoutMinutes}
                    onChange={(event) =>
                      setSecuritySettings((previous) => ({
                        ...previous,
                        securitySessionTimeoutMinutes: Number(event.target.value),
                      }))
                    }
                  >
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 heure</option>
                    <option value={120}>2 heures</option>
                    <option value={240}>4 heures</option>
                  </select>
                </div>

                <div className="security-card">
                  <div className="security-card-head">
                    <Shield size={16} className="sc-info-icon" />
                    <div>
                      <div className="security-title">Récupération par email</div>
                      <div className="security-desc">Autoriser la réinitialisation de mot de passe via email.</div>
                    </div>
                  </div>
                  <label className="security-switch">
                    <input
                      type="checkbox"
                      checked={securitySettings.securityRecoveryEmailEnabled}
                      onChange={(event) =>
                        setSecuritySettings((previous) => ({
                          ...previous,
                          securityRecoveryEmailEnabled: event.target.checked,
                        }))
                      }
                    />
                    <span>Activer</span>
                  </label>
                </div>
              </div>

              <div className="security-actions">
                <button className="btn-card-action" onClick={handleSecuritySave} disabled={securitySaving}>
                  {securitySaving ? 'Enregistrement...' : 'Enregistrer les paramètres sécurité'}
                </button>
                <button className="btn-card-action ghost" onClick={() => router.push('/auth/forgot-password')}>
                  Mettre à jour mon mot de passe
                </button>
              </div>

              {appUser?.securitySettingsUpdatedAt && (
                <p className="security-footnote">
                  Dernière mise à jour: {new Date(appUser.securitySettingsUpdatedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              )}
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

      {/* MODALE UPLOAD AVATAR */}
      <AvatarUploadModal
        isOpen={avatarModalOpen}
        onClose={() => setAvatarModalOpen(false)}
        userId={userId!}
        currentAvatarUrl={appUser?.profilePicture}
        onAvatarChange={() => window.location.reload()}
        onError={(message) => setNotification({ type: 'error', message })}
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
