'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'

// ============================================
// MAH.AI — Page d'Onboarding
// ============================================
// Choix du rôle après inscription
// Design immersif et interactif
// ============================================

const ROLES = [
  {
    id: 'ETUDIANT',
    emoji: '🎓',
    titre: 'Étudiant',
    description: 'Accède aux sujets, corrections IA et examens blancs',
    avantages: ['Catalogue national illimité', 'Corrections IA détaillées', 'Suivi des progrès'],
    couleur: 'var(--teal)',
  },
  {
    id: 'CONTRIBUTEUR',
    emoji: '✍️',
    titre: 'Contributeur',
    description: 'Partage des sujets et gagne de l\'argent par vente',
    avantages: ['Revenus passifs (45%)', 'Éditeur de sujets intégré', 'Statistiques de vente'],
    couleur: 'var(--gold)',
  },
  {
    id: 'PROFESSEUR',
    emoji: '👨‍🏫',
    titre: 'Professeur',
    description: 'Propose des corrections humaines certifiées',
    avantages: ['Revenus élevés (55%)', 'Profil public certifié', 'Étudiants dédiés'],
    couleur: 'var(--rose)',
    badge: 'Sur validation',
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Mouse glow effect on cards
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const cards = document.querySelectorAll(".role-card-inner");
      cards.forEach(card => {
        const rect = (card as HTMLElement).getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        (card as HTMLElement).style.setProperty("--mx", `${x}%`);
        (card as HTMLElement).style.setProperty("--my", `${y}%`);
      });
    };
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  const handleRoleSelect = async (roleId: string) => {
    if (!isLoaded || !user) return;
    
    setSelectedRole(roleId)
    setLoading(true)

    try {
      // Mettre à jour les metadata Clerk
      await user.update({
        publicMetadata: {
          roles: [roleId],
        },
      })

      // Redirection selon le rôle
      setTimeout(() => {
        switch (roleId) {
          case 'ETUDIANT':
            router.push('/catalogue')
            break;
          case 'CONTRIBUTEUR':
            router.push('/dashboard/contributeur')
            break;
          case 'PROFESSEUR':
            router.push('/professeur/verification')
            break;
          default:
            router.push('/')
        }
      }, 800);
    } catch (error) {
      console.error('Erreur lors de la sélection du rôle:', error)
      setLoading(false)
      setSelectedRole(null)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg relative py-20 px-4 overflow-hidden">
      {/* Mesh background */}
      <div className="mesh-bg" aria-hidden="true">
        <span /><span /><span />
      </div>

      <div className="relative z-10 max-w-5xl w-full mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal/5 border border-teal/20 text-teal text-[10px] font-bold uppercase tracking-widest mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal"></span>
            </span>
            Configuration de ton espace
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Bienvenue sur <span className="text-teal">Mah.AI</span> <span className="text-2xl align-top">🇲🇬</span>
          </h1>
          <p className="text-muted text-base md:text-lg max-w-xl mx-auto font-medium">
            Pour t'offrir la meilleure expérience, dis-nous comment tu souhaites utiliser la plateforme.
          </p>
        </div>

        {/* Roles Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {ROLES.map((role, index) => (
            <div 
              key={role.id}
              className={`animate-fade-up`}
              style={{ animationDelay: `${0.1 + index * 0.1}s` }}
            >
              <button
                onClick={() => handleRoleSelect(role.id)}
                disabled={loading}
                className={`
                  role-card-inner group w-full text-left relative p-8 rounded-[28px] border transition-all duration-500 overflow-hidden
                  ${selectedRole === role.id 
                    ? 'border-teal bg-teal/5 scale-[1.02] shadow-[0_20px_60px_rgba(10,255,224,0.15)]' 
                    : 'border-border/40 bg-bg2/40 hover:border-teal/30 hover:bg-bg2/60 hover:-translate-y-2'
                  }
                  ${loading && selectedRole !== role.id ? 'opacity-40 grayscale pointer-events-none' : ''}
                `}
              >
                {/* Mouse Glow Background Effect */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at var(--mx, 50%) var(--my, 50%), ${role.couleur}15, transparent 70%)`
                  }}
                />

                {/* Role Badge */}
                {role.badge && (
                  <div className="absolute top-6 right-6 px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-bold uppercase tracking-widest text-muted">
                    {role.badge}
                  </div>
                )}

                {/* Role Icon */}
                <div className={`
                  w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-8 transition-transform duration-500
                  ${selectedRole === role.id ? 'scale-110 bg-teal/10 shadow-[0_0_20px_rgba(10,255,224,0.2)]' : 'bg-white/5 group-hover:scale-110 group-hover:rotate-6'}
                `}>
                  {role.emoji}
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold mb-3 tracking-tight group-hover:text-teal transition-colors">
                  {role.titre}
                </h3>
                <p className="text-sm text-muted/80 leading-relaxed mb-8">
                  {role.description}
                </p>

                {/* Features List */}
                <div className="space-y-3">
                  {role.avantages.map((adv, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-4 h-4 rounded-full bg-teal/10 flex items-center justify-center text-teal">
                        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-xs font-medium text-muted/70">{adv}</span>
                    </div>
                  ))}
                </div>

                {/* Loading Indicator inside selected card */}
                {loading && selectedRole === role.id && (
                  <div className="absolute inset-0 bg-bg/40 backdrop-blur-[2px] flex items-center justify-center z-20">
                    <div className="w-8 h-8 border-3 border-teal border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Support Link */}
        <div className="text-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <p className="text-sm text-muted/60 font-mono">
            Tu pourras changer de rôle ou postuler pour devenir professeur plus tard dans tes <Link href="/profil" className="text-teal/80 hover:text-teal underline">paramètres</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
