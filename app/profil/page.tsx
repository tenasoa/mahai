'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { LuxuryNavbar } from '@/components/layout/LuxuryNavbar'
import { LuxuryCursor } from '@/components/layout/LuxuryCursor'
import { ProfileEditModal } from '@/components/modals/ProfileEditModal'
import { getProfileAction, updateProfileAction } from '@/actions/profile'
import './profil.css'
import '@/components/modals/ProfileEditModal.css'

type TabType = 'infos' | 'achats' | 'mvola' | 'securite'

export default function ProfilePage() {
  const router = useRouter()
  const { userId, user, appUser, setAppUser } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('infos')
  const [loading, setLoading] = useState(true)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  // États des switchs (Notifications)
  const [notifIA, setNotifIA] = useState(true)
  const [notifSubjects, setNotifSubjects] = useState(true)
  const [notifPromo, setNotifPromo] = useState(false)

  useEffect(() => {
    if (!userId && !loading) {
      router.push('/auth/login')
    }
    setLoading(false)
  }, [userId, loading, router])

  if (loading || !userId) {
    return (
      <div className="loading-screen" style={{ background: 'var(--void)', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)' }}>
        Chargement du profil...
      </div>
    )
  }

  const handleProfileUpdate = async (data: any) => {
    setSaveLoading(true)
    try {
      const result = await updateProfileAction(userId!, data)
      
      if (result.success) {
        setNotification({ type: 'success', message: 'Profil mis à jour avec succès !' })
        setEditModalOpen(false)
        // Mettre à jour les données localement sans recharger la page
        if (result.data && setAppUser) {
          setAppUser(result.data)
        }
      } else {
        setNotification({ type: 'error', message: result.error || 'Erreur lors de la mise à jour' })
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Erreur serveur' })
    } finally {
      setSaveLoading(false)
    }
  }

  const userInitial = (appUser?.prenom?.charAt(0) || user?.email?.charAt(0) || 'U').toUpperCase()

  return (
    <div className="profile-page">
      <LuxuryCursor />
      <LuxuryNavbar />

      <div className="profile-container">
        {/* HEADER */}
        <div className="profile-header">
          <div className="ph-inner">
            <div className="ph-avatar-wrap">
              <div className="ph-avatar">{userInitial}</div>
              <button className="ph-edit-btn">✏️</button>
            </div>
            <div className="ph-info">
              <div className="ph-name">{appUser?.prenom} {appUser?.nom}</div>
              <div className="ph-badges">
                <span className="ph-badge student">Étudiant</span>
                {appUser?.role === 'CONTRIBUTEUR' && <span className="ph-badge contrib">Contributeur</span>}
                <span className="ph-badge verified">✓ Vérifié</span>
              </div>
              <div className="ph-meta">
                <span className="ph-meta-item">📍 Antananarivo, Madagascar</span>
                <span className="ph-meta-item">📅 Membre depuis janv. 2024</span>
                <span className="ph-meta-item">🎓 {appUser?.schoolLevel || 'Niveau non défini'}</span>
              </div>
            </div>
            <div>
              <div className="ph-stats">
                <div className="ph-stat"><div className="n">24</div><div className="l">Sujets achetés</div></div>
                <div className="ph-stat"><div className="n">{appUser?.credits}</div><div className="l">Crédits</div></div>
                <div className="ph-stat"><div className="n">4.8</div><div className="l">Note</div></div>
              </div>
              <div className="ph-actions">
                <button className="btn-profile-ghost">Voir mon profil public</button>
              </div>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="profile-tabs">
          <button className={`ptab ${activeTab === 'infos' ? 'active' : ''}`} onClick={() => setActiveTab('infos')}>Informations</button>
          <button className={`ptab ${activeTab === 'achats' ? 'active' : ''}`} onClick={() => setActiveTab('achats')}>Mes achats</button>
          <button className={`ptab ${activeTab === 'mvola' ? 'active' : ''}`} onClick={() => setActiveTab('mvola')}>MVola & Crédits</button>
          <button className={`ptab ${activeTab === 'securite' ? 'active' : ''}`} onClick={() => setActiveTab('securite')}>Sécurité</button>
        </div>

        {/* TAB: INFOS */}
        <div className={`ptab-panel ${activeTab === 'infos' ? 'active' : ''}`}>
          <div className="profile-grid">
            <div>
              <div className="settings-card">
                <div className="sc-title">Informations <em>personnelles</em></div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Prénom</label><input className="form-input" defaultValue={appUser?.prenom} /></div>
                  <div className="form-group"><label className="form-label">Nom</label><input className="form-input" defaultValue={appUser?.nom || ''} /></div>
                </div>
                <div className="form-group"><label className="form-label">Adresse e-mail</label><input className="form-input" type="email" defaultValue={user?.email || ''} readOnly /></div>
                <div className="form-group"><label className="form-label">Téléphone MVola</label><input className="form-input" type="tel" placeholder="+261 34 XX XXX XX" /></div>
                <div className="form-group"><label className="form-label">Ville</label><input className="form-input" defaultValue="Antananarivo" /></div>
                <button className="btn-save-profile">Enregistrer</button>
              </div>
            </div>
            <div>
              <div className="settings-card">
                <div className="sc-title">Profil <em>académique</em></div>
                <div className="form-group"><label className="form-label">Niveau d'études</label>
                  <select className="form-select" defaultValue={appUser?.schoolLevel || 'BAC'}>
                    <option>BAC</option><option>BEPC</option><option>CEPE</option><option>Université</option>
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Série</label>
                  <select className="form-select" defaultValue="Série D">
                    <option>Série A</option><option>Série B</option><option>Série C</option><option>Série D</option><option>Série L</option>
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Biographie</label>
                  <textarea 
                    className="form-textarea" 
                    placeholder="Parlez-nous de vous…" 
                    defaultValue="Élève passionné préparant ses examens avec Mah.AI."
                  />
                </div>
                <button className="btn-save-profile">Enregistrer</button>
              </div>
              <div className="settings-card">
                <div className="sc-title">Notifications <em>& préférences</em></div>
                <div className="toggle-row">
                  <div><div className="toggle-label">Nouvelles corrections IA</div><div className="toggle-desc">Alerte quand une correction est prête</div></div>
                  <div className={`toggle-switch ${notifIA ? 'on' : ''}`} onClick={() => setNotifIA(!notifIA)}><div className="toggle-knob"></div></div>
                </div>
                <div className="toggle-row">
                  <div><div className="toggle-label">Nouveaux sujets disponibles</div><div className="toggle-desc">Selon vos matières préférées</div></div>
                  <div className={`toggle-switch ${notifSubjects ? 'on' : ''}`} onClick={() => setNotifSubjects(!notifSubjects)}><div className="toggle-knob"></div></div>
                </div>
                <div className="toggle-row">
                  <div><div className="toggle-label">E-mails promotionnels</div><div className="toggle-desc">Offres et crédits bonus</div></div>
                  <div className={`toggle-switch ${notifPromo ? 'on' : ''}`} onClick={() => setNotifPromo(!notifPromo)}><div className="toggle-knob"></div></div>
                </div>
                <button className="btn-save-profile">Enregistrer</button>
              </div>
            </div>
          </div>
        </div>

        {/* TAB: ACHATS */}
        <div className={`ptab-panel ${activeTab === 'achats' ? 'active' : ''}`}>
          <div className="settings-card full">
            <div className="sc-title" style={{ marginBottom: '1.5rem' }}>Sujets <em>achetés</em></div>
            <div className="purchase-grid">
              <div className="pur-card"><div className="pur-tag">BAC · Maths</div><div className="pur-title">Algèbre & Fonctions 2024</div><div className="pur-meta">18 pages · 3h · ★ 4.9</div><div className="pur-price">−15 cr · 12 Jan 2025</div></div>
              <div className="pur-card"><div className="pur-tag">BEPC · Physique</div><div className="pur-title">Mécanique & Électricité 2023</div><div className="pur-meta">12 pages · 2h · ★ 4.6</div><div className="pur-price">−10 cr · 9 Jan 2025</div></div>
              <div className="pur-card"><div className="pur-tag">BAC · Chimie</div><div className="pur-title">Thermodynamique 2024</div><div className="pur-meta">16 pages · 3h · ★ 4.7</div><div className="pur-price">−15 cr · 7 Jan 2025</div></div>
            </div>
          </div>
        </div>

        {/* TAB: MVOLA */}
        <div className={`ptab-panel ${activeTab === 'mvola' ? 'active' : ''}`}>
          <div className="profile-grid">
            <div className="mvola-card">
              <div className="mvola-header">
                <div className="mvola-title">Wallet <em>MVola</em></div>
                <div className="mvola-status">● Connecté</div>
              </div>
              <div className="mvola-num">+261 34 XX XXX XX</div>
              <div className="mvola-balance-row">
                <div className="mb-item"><div className="lbl">Crédits disponibles</div><div className="val">{appUser?.credits} cr</div></div>
                <div className="mb-item"><div className="lbl">En attente</div><div className="val" style={{ color: 'var(--text-3)' }}>0 cr</div></div>
              </div>
              <div className="mvola-actions">
                <button className="btn-mvola primary">+ Recharger</button>
                <button className="btn-mvola ghost">Changer de numéro</button>
              </div>
            </div>
            <div className="settings-card">
              <div className="sc-title">Historique <em>crédits</em></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.6rem 0', borderBottom: '1px solid var(--b3)' }}>
                  <div><div style={{ fontSize: '.82rem', color: 'var(--text)' }}>Recharge MVola</div><div style={{ fontFamily: 'var(--mono)', fontSize: '.6rem', color: 'var(--text-3)' }}>5 Jan 2025</div></div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '.72rem', color: 'var(--gold)' }}>+150 cr</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.6rem 0', borderBottom: '1px solid var(--b3)' }}>
                  <div><div style={{ fontSize: '.82rem', color: 'var(--text)' }}>Achat — Maths BAC 2024</div><div style={{ fontFamily: 'var(--mono)', fontSize: '.6rem', color: 'var(--text-3)' }}>12 Jan 2025</div></div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '.72rem', color: 'var(--ruby)' }}>−15 cr</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TAB: SECURITE */}
        <div className={`ptab-panel ${activeTab === 'securite' ? 'active' : ''}`}>
          <div className="profile-grid">
            <div className="settings-card">
              <div className="sc-title">Changer le <em>mot de passe</em></div>
              <div className="form-group"><label className="form-label">Mot de passe actuel</label><input className="form-input" type="password" placeholder="••••••••" /></div>
              <div className="form-group"><label className="form-label">Nouveau mot de passe</label><input className="form-input" type="password" placeholder="8 caractères minimum" /></div>
              <div className="form-group"><label className="form-label">Confirmer</label><input className="form-input" type="password" placeholder="Répétez le nouveau mot de passe" /></div>
              <button className="btn-save-profile">Mettre à jour</button>
            </div>
            <div>
              <div className="settings-card" style={{ marginBottom: '1.25rem' }}>
                <div className="sc-title">Sessions <em>actives</em></div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '.85rem', background: 'var(--surface)', border: '1px solid var(--b2)', borderRadius: 'var(--r)', marginBottom: '.65rem' }}>
                  <div><div style={{ fontSize: '.82rem', color: 'var(--text)' }}>📱 Chrome — Antananarivo</div><div style={{ fontFamily: 'var(--mono)', fontSize: '.6rem', color: 'var(--text-3)', marginTop: '.18rem' }}>Session actuelle · Aujourd'hui</div></div>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '.58rem', color: 'var(--sage)', background: 'rgba(74,107,90,.2)', padding: '.2rem .5rem', borderRadius: '2px' }}>Active</span>
                </div>
                <button className="btn-danger-profile">Déconnecter toutes les autres sessions</button>
              </div>
              <div className="danger-zone">
                <div className="dz-title">Zone dangereuse</div>
                <div className="dz-action">
                  <div><div className="dz-desc">Exporter mes données</div><div className="dz-sub">Télécharger toutes vos données en JSON</div></div>
                  <button className="btn-danger-profile">Exporter</button>
                </div>
                <div className="dz-action">
                  <div><div className="dz-desc">Supprimer mon compte</div><div className="dz-sub">Action irréversible — tous vos crédits seront perdus</div></div>
                  <button className="btn-danger-profile">Supprimer</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`} style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '1rem 1.5rem',
          borderRadius: 'var(--r)',
          background: notification.type === 'success' ? 'var(--sage)' : 'var(--ruby)',
          color: 'white',
          zIndex: 1000,
          animation: 'slideIn 0.3s ease-out'
        }}>
          {notification.message}
        </div>
      )}

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        userData={appUser}
        onSave={handleProfileUpdate}
        loading={saveLoading}
      />

      {/* Bouton d'édition flottant */}
      <button 
        onClick={() => setEditModalOpen(true)}
        className="floating-edit-btn"
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--gold), var(--gold-hi))',
          border: 'none',
          color: 'var(--void)',
          fontSize: '1.5rem',
          cursor: 'none',
          boxShadow: '0 4px 20px rgba(201, 168, 76, 0.4)',
          transition: 'all 0.3s',
          zIndex: 900
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1) rotate(90deg)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1) rotate(0deg)'
        }}
      >
        ✏️
      </button>

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
