
import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import { MapPin, GraduationCap, Calendar, BookOpen, Award, Zap } from 'lucide-react'
import { LuxuryNavbar } from '@/components/layout/LuxuryNavbar'
import { LuxuryCursor } from '@/components/layout/LuxuryCursor'
import '../profil.css'

// On utilise le Service Role pour lire le profil public et outrepasser les politiques RLS
async function getPublicProfile(userId: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: profile, error } = await supabase
      .from('User')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Erreur Supabase détaillée:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      return null
    }
    
    if (!profile) return null
    
    // Sécurité de visibilité
    if (profile.profilePublic === false) {
      console.log('Profil trouvé mais marqué comme privé.')
      return null
    }

    return profile
  } catch (e) {
    console.error('Exception lors du fetch profil:', e)
    return null
  }
}

export default async function PublicProfilePage({ params }: { params: { userId: string } }) {
  const { userId } = await params;
  
  console.log('Chargement du profil public pour:', userId)
  
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
    <div className="profile-page public">
      <LuxuryCursor />
      <LuxuryNavbar />

      <div className="profile-container" style={{ marginTop: '120px' }}>
        {/* HEADER */}
        <div className="profile-header luxury-card public-header">
          <div className="ph-left">
            <div className="ph-avatar-wrap">
              <div className="ph-avatar large">{userInitial}</div>
            </div>
            <div className="ph-info">
              <div className="ph-name-wrap">
                <h1 className="ph-name">{profile.prenom} {profile.nom}</h1>
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
            <div className="luxury-card settings-card">
              <div className="sc-header">
                <h3 className="sc-title">Parcours <em>Académique</em></h3>
                <GraduationCap size={14} className="opacity-50" />
              </div>
              
              <div className="public-info-row">
                <div className="p-label">Niveau & Classe</div>
                <div className="p-val">{profile.educationLevel || 'Non renseigné'} — {profile.gradeLevel || '—'}</div>
              </div>
              
              {profile.etablissement && (
                <div className="public-info-row">
                  <div className="p-label">Établissement</div>
                  <div className="p-val">{profile.etablissement}</div>
                </div>
              )}
              
              {profile.filiere && (
                <div className="public-info-row">
                  <div className="p-label">Filière / Mention</div>
                  <div className="p-val">{profile.filiere}</div>
                </div>
              )}
            </div>

            <div className="luxury-card settings-card">
              <div className="sc-header">
                <h3 className="sc-title">À propos de <em>{profile.prenom}</em></h3>
                <BookOpen size={14} className="opacity-50" />
              </div>
              <p className="public-bio">{profile.bio || "Cet utilisateur n'a pas encore rédigé de biographie."}</p>
            </div>
          </div>

          <div className="grid-column">
            <div className="luxury-card settings-card">
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
            </div>

            <div className="luxury-card settings-card">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
