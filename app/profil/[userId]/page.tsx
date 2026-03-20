
import { Suspense } from 'react'
import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import { MapPin, GraduationCap, Calendar, BookOpen, Award, Zap, UserRound, School } from 'lucide-react'
import { LuxuryNavbar } from '@/components/layout/LuxuryNavbar'
import { LuxuryCursor } from '@/components/layout/LuxuryCursor'
import { PublicProfileSkeleton } from '@/components/ui/PageSkeletons'
import '../profil.css'

// Lecture restreinte au sous-ensemble de champs réellement publics.
async function getPublicProfile(userId: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: profile, error } = await supabase
      .from('User')
      .select(`
        id,
        prenom,
        nom,
        nomComplet,
        pseudo,
        userType,
        customUserType,
        region,
        district,
        createdAt,
        educationLevel,
        gradeLevel,
        etablissement,
        showEtablissement,
        filiere,
        bio,
        matieresPreferees,
        objectifsEtude,
        profilePublic,
        profilePicture
      `)
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Erreur chargement profil public:', error.message)
      return null
    }
    
    if (!profile) return null
    
    // Sécurité de visibilité
    if (profile.profilePublic === false) {
      return null
    }

    return profile
  } catch (e) {
    console.error('Exception lors du fetch profil public:', e)
    return null
  }
}

export default async function PublicProfilePage({ params }: { params: { userId: string } }) {
  const { userId } = await params;
  const profile = await getPublicProfile(userId)

  if (!profile) {
    notFound()
  }

  const userInitial = (profile.prenom?.charAt(0) || 'U').toUpperCase()

  const displayUserType = () => {
    if (profile.userType === 'AUTRE') return profile.customUserType || 'Passionné'
    const types: Record<string, string> = {
      'ETUDIANT': 'Étudiant',
      'PROFESSIONNEL': 'Professionnel',
      'ENSEIGNANT': 'Enseignant',
      'PARENT': 'Parent'
    }
    return types[profile.userType || ''] || 'Utilisateur'
  }

  return (
    <Suspense fallback={<PublicProfileSkeleton />}>
      <div className="profile-page public">
      <LuxuryCursor />
      <LuxuryNavbar />

      <div className="profile-container" style={{ marginTop: '120px' }}>
        {/* HEADER */}
        <div className="profile-header luxury-card public-header">
          <div className="ph-left">
            <div className="ph-avatar-wrap">
              {profile.profilePicture ? (
                <div className="ph-avatar-image large">
                  <img src={profile.profilePicture} alt={profile.prenom} />
                </div>
              ) : (
                <div className="ph-avatar large">{userInitial}</div>
              )}
            </div>
            <div className="ph-info">
              <div className="ph-name-wrap">
                <h1 className="ph-name">{profile.prenom} {profile.nom}</h1>
                {profile.pseudo && (
                  <span className="ph-badge">@{profile.pseudo}</span>
                )}
              </div>
              <div className="ph-badges">
                <span className="ph-badge student">{displayUserType()}</span>
                <span className="ph-badge verified">✓ Profil Vérifié</span>
              </div>
              <div className="ph-meta">
                {profile.region && (
                  <div className="ph-meta-item">
                    <MapPin size={12} />
                    <span>{profile.district}, {profile.region}</span>
                  </div>
                )}
                <div className="ph-meta-item">
                  <Calendar size={12} />
                  <span>Membre depuis {new Date(profile.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="ph-right">
             <Award size={64} className="text-gold opacity-10" />
          </div>
        </div>

        <div className="public-grid">
          <div className="grid-column">
            <section id="section-identity" className="luxury-card settings-card public-info-card">
              <div className="sc-header">
                <h3 className="sc-title">Identité <em>Publique</em></h3>
                <UserRound size={14} className="opacity-50" />
              </div>
              <div className="public-field-grid">
                <div className="public-field-item">
                  <div className="public-field-label">Prénom</div>
                  <div className="public-field-value">
                    {profile.prenom || 'Non renseigné'}
                  </div>
                </div>
                <div className="public-field-item">
                  <div className="public-field-label">Nom</div>
                  <div className="public-field-value">
                    {profile.nom || 'Non renseigné'}
                  </div>
                </div>
                <div className="public-field-item">
                  <div className="public-field-label">Pseudo</div>
                  <div className="public-field-value">{profile.pseudo || 'Non renseigné'}</div>
                </div>
                <div className="public-field-item">
                  <div className="public-field-label">Type de profil</div>
                  <div className="public-field-value">{displayUserType()}</div>
                </div>
                <div className="public-field-item">
                  <div className="public-field-label">Localisation</div>
                  <div className="public-field-value">
                    {profile.region ? `${profile.district || '—'}, ${profile.region}` : 'Non renseigné'}
                  </div>
                </div>
              </div>
            </section>

            <section id="section-parcours" className="luxury-card settings-card public-info-card">
              <div className="sc-header">
                <h3 className="sc-title">Parcours <em>Académique</em></h3>
                <GraduationCap size={14} className="opacity-50" />
              </div>

              <div className="public-field-grid">
                <div className="public-field-item with-icon">
                  <div className="public-field-icon">
                    <GraduationCap size={14} />
                  </div>
                  <div className="public-field-content">
                    <div className="public-field-label">Niveau & Classe</div>
                    <div className="public-field-value">
                      {profile.educationLevel || 'Non renseigné'} — {profile.gradeLevel || '—'}
                    </div>
                  </div>
                </div>

                {profile.showEtablissement && profile.etablissement && (
                  <div className="public-field-item with-icon">
                    <div className="public-field-icon">
                      <School size={14} />
                    </div>
                    <div className="public-field-content">
                      <div className="public-field-label">Établissement</div>
                      <div className="public-field-value">{profile.etablissement}</div>
                    </div>
                  </div>
                )}

                {profile.filiere && (
                  <div className="public-field-item with-icon">
                    <div className="public-field-icon">
                      <BookOpen size={14} />
                    </div>
                    <div className="public-field-content">
                      <div className="public-field-label">Filière / Mention</div>
                      <div className="public-field-value">{profile.filiere}</div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            <section id="section-bio" className="luxury-card settings-card">
              <div className="sc-header">
                <h3 className="sc-title">À propos de <em>{profile.prenom}</em></h3>
                <BookOpen size={14} className="opacity-50" />
              </div>
              <p className="public-bio">{profile.bio || "Cet utilisateur n'a pas encore rédigé de biographie."}</p>
            </section>
          </div>

          <div className="grid-column">
            <section id="section-matieres" className="luxury-card settings-card">
              <div className="sc-header">
                <h3 className="sc-title">Matières <em>Favorites</em></h3>
                <Zap size={14} className="opacity-50" />
              </div>
              <div className="luxury-tags">
                {profile.matieresPreferees?.length > 0 ? (
                  profile.matieresPreferees.map((m: string) => <span key={m} className="luxury-tag">{m}</span>)
                ) : (
                  <span className="luxury-tag-empty">Aucune matière favorite</span>
                )}
              </div>
            </section>

            <section id="section-objectifs" className="luxury-card settings-card">
              <div className="sc-header">
                <h3 className="sc-title">Objectifs <em>Visés</em></h3>
                <Award size={14} className="opacity-50" />
              </div>
              <div className="luxury-tags">
                {profile.objectifsEtude?.length > 0 ? (
                  profile.objectifsEtude.map((o: string) => <span key={o} className="luxury-tag gold">{o}</span>)
                ) : (
                  <span className="luxury-tag-empty">Aucun objectif public</span>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
    </Suspense>
  );
}
