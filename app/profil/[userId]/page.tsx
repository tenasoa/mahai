'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { LuxuryNavbar } from '@/components/layout/LuxuryNavbar'
import { LuxuryCursor } from '@/components/layout/LuxuryCursor'
import { getProfileAction } from '@/actions/profile'
import { User, Calendar, MapPin, GraduationCap, BookOpen, Award, Star } from 'lucide-react'
import '../profil.css'

interface PublicProfile {
  id: string
  prenom: string
  nom?: string
  userType: string
  customUserType?: string
  bio?: string
  etablissement?: string
  educationLevel?: string
  gradeLevel?: string
  filiere?: string
  region?: string
  district?: string
  credits?: number
  profilePublic?: boolean
  showEmail?: boolean
  showPhone?: boolean
  showEtablissement?: boolean
  email?: string
  phone?: string
  createdAt: string
}

export default function PublicProfilePage() {
  const params = useParams()
  const userId = params.userId as string
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const result = await getProfileAction(userId)
        
        if (result.success) {
          const userProfile = result.data as PublicProfile
          
          // Vérifier si le profil est public
          if (!userProfile.profilePublic) {
            setError('Ce profil est privé')
            setLoading(false)
            return
          }
          
          setProfile(userProfile)
        } else {
          setError('Utilisateur non trouvé')
        }
      } catch (err) {
        setError('Erreur lors du chargement du profil')
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchProfile()
    }
  }, [userId])

  if (loading) {
    return (
      <div className="profile-page">
        <LuxuryCursor />
        <LuxuryNavbar />
        <div className="loading-screen" style={{ 
          background: 'var(--void)', 
          height: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          color: 'var(--gold)' 
        }}>
          Chargement du profil...
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="profile-page">
        <LuxuryCursor />
        <LuxuryNavbar />
        <div className="profile-container">
          <div className="error-container" style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: 'var(--card)',
            border: '1px solid var(--b1)',
            borderRadius: 'var(--r-lg)',
            margin: '2rem auto'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔒</div>
            <h2 style={{ 
              fontFamily: 'var(--display)', 
              fontSize: '1.5rem', 
              color: 'var(--text)', 
              marginBottom: '1rem' 
            }}>
              Profil non accessible
            </h2>
            <p style={{ color: 'var(--text-2)', marginBottom: '2rem' }}>
              {error || 'Ce profil n\'existe pas ou est privé'}
            </p>
            <button 
              onClick={() => window.history.back()}
              className="btn-secondary"
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: 'var(--r)',
                background: 'var(--b2)',
                border: '1px solid var(--b3)',
                color: 'var(--text)',
                cursor: 'pointer'
              }}
            >
              Retour
            </button>
          </div>
        </div>
      </div>
    )
  }

  const getUserTypeLabel = (type: string, custom?: string) => {
    if (type === 'AUTRE' && custom) return custom
    const types: Record<string, string> = {
      'ETUDIANT': 'Étudiant',
      'PROFESSIONNEL': 'Professionnel',
      'ENSEIGNANT': 'Enseignant',
      'PARENT': 'Parent'
    }
    return types[type] || type
  }

  const getEducationLevelLabel = (level: string) => {
    const levels: Record<string, string> = {
      'PRIMAIRE': 'Primaire',
      'COLLEGE': 'Collège',
      'LYCEE': 'Lycée',
      'UNIVERSITE': 'Université/Faculté',
      'FORMATION': 'Formation'
    }
    return levels[level] || level
  }

  const getGradeLevelLabel = (grade: string) => {
    const grades: Record<string, string> = {
      '11EME': '11ème', '10EME': '10ème', '9EME': '9ème', '8EME': '8ème', '7EME': '7ème',
      '6EME': '6ème', '5EME': '5ème', '4EME': '4ème', '3EME': '3ème',
      'SECONDE': 'Seconde', 'PREMIERE': 'Première', 'TERMINALE': 'Terminale',
      'L1': 'L1', 'L2': 'L2', 'L3': 'L3', 'M1': 'M1', 'M2': 'M2'
    }
    return grades[grade] || grade
  }

  return (
    <div className="profile-page">
      <LuxuryCursor />
      <LuxuryNavbar />

      <div className="profile-container">
        {/* HEADER */}
        <div className="profile-header">
          <div className="ph-inner">
            <div className="ph-avatar-wrap">
              <div className="ph-avatar">
                {profile.prenom?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>
            <div className="ph-info">
              <div className="ph-name">
                {profile.prenom} {profile.nom}
              </div>
              <div className="ph-badges">
                <span className="ph-badge student">
                  {getUserTypeLabel(profile.userType, profile.customUserType)}
                </span>
                <span className="ph-badge verified">✓ Vérifié</span>
              </div>
              <div className="ph-meta">
                {profile.region && (
                  <span className="ph-meta-item">
                    <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    {profile.region}
                    {profile.district && `, ${profile.district}`}
                  </span>
                )}
                <span className="ph-meta-item">
                  <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  Membre depuis {new Date(profile.createdAt).toLocaleDateString('fr-FR', { 
                    year: 'numeric', 
                    month: 'long' 
                  })}
                </span>
                {profile.educationLevel && (
                  <span className="ph-meta-item">
                    <GraduationCap size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    {getEducationLevelLabel(profile.educationLevel)}
                    {profile.gradeLevel && ` - ${getGradeLevelLabel(profile.gradeLevel)}`}
                  </span>
                )}
              </div>
            </div>
            <div>
              <div className="ph-stats">
                <div className="ph-stat">
                  <div className="n">{profile.credits || 0}</div>
                  <div className="l">Crédits</div>
                </div>
                <div className="ph-stat">
                  <div className="n">4.8</div>
                  <div className="l">Note</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BIOGRAPHIE */}
        {profile.bio && (
          <div className="settings-card" style={{ marginBottom: '1.5rem' }}>
            <div className="sc-title">
              <BookOpen size={18} style={{ display: 'inline', marginRight: '8px' }} />
              Biographie
            </div>
            <p style={{ 
              lineHeight: '1.6', 
              color: 'var(--text-2)', 
              fontSize: '0.9rem' 
            }}>
              {profile.bio}
            </p>
          </div>
        )}

        {/* INFORMATIONS ACADEMIQUES */}
        {(profile.etablissement || profile.filiere) && (
          <div className="settings-card" style={{ marginBottom: '1.5rem' }}>
            <div className="sc-title">
              <GraduationCap size={18} style={{ display: 'inline', marginRight: '8px' }} />
              Informations académiques
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {profile.showEtablissement && profile.etablissement && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--text-3)', minWidth: '120px' }}>Établissement:</span>
                  <span style={{ color: 'var(--text)' }}>{profile.etablissement}</span>
                </div>
              )}
              {profile.filiere && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--text-3)', minWidth: '120px' }}>Filière:</span>
                  <span style={{ color: 'var(--text)' }}>{profile.filiere}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CONTACT */}
        <div className="settings-card">
          <div className="sc-title">
            <User size={18} style={{ display: 'inline', marginRight: '8px' }} />
            Contact
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {profile.showEmail && profile.email && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--text-3)', minWidth: '120px' }}>Email:</span>
                <a 
                  href={`mailto:${profile.email}`}
                  style={{ 
                    color: 'var(--gold)', 
                    textDecoration: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {profile.email}
                </a>
              </div>
            )}
            {profile.showPhone && profile.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--text-3)', minWidth: '120px' }}>Téléphone:</span>
                <span style={{ color: 'var(--text)' }}>{profile.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* STATISTIQUES */}
        <div className="settings-card" style={{ marginTop: '1.5rem' }}>
          <div className="sc-title">
            <Award size={18} style={{ display: 'inline', marginRight: '8px' }} />
            Statistiques
          </div>
          <div className="stats-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem'
          }}>
            <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--surface)', borderRadius: 'var(--r)' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--gold)', marginBottom: '0.5rem' }}>
                {profile.credits || 0}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>Crédits disponibles</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--surface)', borderRadius: 'var(--r)' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--gold)', marginBottom: '0.5rem' }}>
                4.8
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>Note moyenne</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--surface)', borderRadius: 'var(--r)' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--gold)', marginBottom: '0.5rem' }}>
                24
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>Sujets achetés</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
