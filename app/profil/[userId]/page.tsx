import { Suspense } from "react";
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import {
  MapPin,
  GraduationCap,
  Calendar,
  BookOpen,
  Award,
  Zap,
  UserRound,
  School,
} from "lucide-react";
import { LuxuryNavbar } from "@/components/layout/LuxuryNavbar";
import { LuxuryCursor } from "@/components/layout/LuxuryCursor";
import { PublicProfileSkeleton } from "@/components/ui/PageSkeletons";

// Lecture restreinte au sous-ensemble de champs réellement publics.
async function getPublicProfile(userId: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: profile, error } = await supabase
      .from("User")
      .select(
        `
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
      `,
      )
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Erreur chargement profil public:", error.message);
      return null;
    }

    if (!profile) return null;

    // Sécurité de visibilité
    if (profile.profilePublic === false) {
      return null;
    }

    return profile;
  } catch (e) {
    console.error("Exception lors du fetch profil public:", e);
    return null;
  }
}

export default async function PublicProfilePage({
  params,
}: {
  params: { userId: string };
}) {
  const { userId } = await params;
  const profile = await getPublicProfile(userId);

  if (!profile) {
    notFound();
  }

  const userInitial = (profile.prenom?.charAt(0) || "U").toUpperCase();

  const displayUserType = () => {
    if (profile.userType === "AUTRE")
      return profile.customUserType || "Passionné";
    const types: Record<string, string> = {
      ETUDIANT: "Étudiant",
      PROFESSIONNEL: "Professionnel",
      ENSEIGNANT: "Enseignant",
      PARENT: "Parent",
    };
    return types[profile.userType || ""] || "Utilisateur";
  };

  return (
    <Suspense fallback={<PublicProfileSkeleton />}>
      <div className="profile-page public">
        <LuxuryCursor />
        <LuxuryNavbar />

        <div className="profile-container" style={{ marginTop: "120px" }}>
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
                  <h1 className="ph-name">
                    {profile.prenom} {profile.nom}
                  </h1>
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
                      <span>
                        {profile.district}, {profile.region}
                      </span>
                    </div>
                  )}
                  <div className="ph-meta-item">
                    <Calendar size={12} />
                    <span>
                      Membre depuis{" "}
                      {new Date(profile.createdAt).toLocaleDateString("fr-FR", {
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="ph-right">
              <Award size={64} className="text-gold opacity-10" />
            </div>
          </div>

          <div className="profile-grid" style={{ marginTop: "2.5rem" }}>
            <div className="profile-main-content">
              <section className="luxury-card settings-card">
                <div className="sc-header">
                  <h3 className="sc-title">
                    Identité <em>Publique</em>
                  </h3>
                  <UserRound size={14} className="sc-info-icon" />
                </div>
                <div className="info-rows mt-4">
                  <div className="info-row">
                    <span className="ir-label">Prénom</span>
                    <span className="ir-value">{profile.prenom || "Non renseigné"}</span>
                  </div>
                  <div className="info-row">
                    <span className="ir-label">Nom</span>
                    <span className="ir-value">{profile.nom || "Non renseigné"}</span>
                  </div>
                  <div className="info-row">
                    <span className="ir-label">Pseudo</span>
                    <span className="ir-value">{profile.pseudo || "Non renseigné"}</span>
                  </div>
                  <div className="info-row">
                    <span className="ir-label">Type de profil</span>
                    <span className="ir-value">{displayUserType()}</span>
                  </div>
                  <div className="info-row">
                    <span className="ir-label">Localisation</span>
                    <span className="ir-value">
                      {profile.region ? `${profile.district || "—"}, ${profile.region}` : "Non renseigné"}
                    </span>
                  </div>
                </div>
              </section>

              <section className="luxury-card settings-card">
                <div className="sc-header">
                  <h3 className="sc-title">
                    Parcours <em>Académique</em>
                  </h3>
                  <GraduationCap size={14} className="sc-info-icon" />
                </div>
                <div className="info-rows mt-4">
                  <div className="info-row">
                    <span className="ir-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <GraduationCap size={14} /> Niveau & Classe
                    </span>
                    <span className="ir-value">
                      {profile.educationLevel || "Non renseigné"} — {profile.gradeLevel || "—"}
                    </span>
                  </div>
                  {profile.showEtablissement && profile.etablissement && (
                    <div className="info-row">
                      <span className="ir-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <School size={14} /> Établissement
                      </span>
                      <span className="ir-value">{profile.etablissement}</span>
                    </div>
                  )}
                  {profile.filiere && (
                    <div className="info-row">
                      <span className="ir-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BookOpen size={14} /> Filière / Mention
                      </span>
                      <span className="ir-value">{profile.filiere}</span>
                    </div>
                  )}
                </div>
              </section>

              <section className="luxury-card settings-card">
                <div className="sc-header">
                  <h3 className="sc-title">
                    À propos de <em>{profile.prenom}</em>
                  </h3>
                  <BookOpen size={14} className="sc-info-icon" />
                </div>
                <div className="bio-content">
                  <p className="bio-text">
                    {profile.bio || "Cet utilisateur n'a pas encore rédigé de biographie."}
                  </p>
                </div>
              </section>
            </div>

            <div className="profile-sidebar-content">
              <section className="luxury-card settings-card">
                <div className="sc-header">
                  <h3 className="sc-title">
                    Matières <em>Favorites</em>
                  </h3>
                  <Zap size={14} className="sc-info-icon" />
                </div>
                <div className="pref-group">
                  <div className="luxury-tags">
                    {profile.matieresPreferees?.length > 0 ? (
                      profile.matieresPreferees.map((m: string) => (
                        <span key={m} className="luxury-tag">{m}</span>
                      ))
                    ) : (
                      <span className="luxury-tag-empty">Aucune matière favorite</span>
                    )}
                  </div>
                </div>
              </section>

              <section className="luxury-card settings-card">
                <div className="sc-header">
                  <h3 className="sc-title">
                    Objectifs <em>Visés</em>
                  </h3>
                  <Award size={14} className="sc-info-icon" />
                </div>
                <div className="pref-group" style={{ borderTop: "none", paddingTop: "0" }}>
                  <div className="luxury-tags">
                    {profile.objectifsEtude?.length > 0 ? (
                      profile.objectifsEtude.map((o: string) => (
                        <span key={o} className="luxury-tag gold">{o}</span>
                      ))
                    ) : (
                      <span className="luxury-tag-empty">Aucun objectif public</span>
                    )}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
