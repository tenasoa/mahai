'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Step = 1 | 2 | 3 | 4

const matieres = [
  { id: 'math', icon: '📐', name: 'Mathématiques', count: 1240 },
  { id: 'physique', icon: '⚗️', name: 'Physique-Chimie', count: 980 },
  { id: 'svt', icon: '🌿', name: 'SVT', count: 760 },
  { id: 'francais', icon: '📚', name: 'Français', count: 1100 },
  { id: 'hg', icon: '🌍', name: 'Histoire-Géo', count: 640 },
  { id: 'anglais', icon: '🌐', name: 'Anglais', count: 520 },
  { id: 'info', icon: '💻', name: 'Informatique', count: 310 },
  { id: 'eco', icon: '💰', name: 'Économie', count: 420 },
  { id: 'autre', icon: '🎨', name: 'Autre', count: 890 },
]

const niveaux = [
  { id: 'college', icon: '📗', name: 'Collège (BEPC)', desc: '3ème · Préparation au BEPC' },
  { id: 'lycee-c', icon: '📘', name: 'Lycée Série C', desc: 'Terminale · BAC Scientifique' },
  { id: 'lycee-ad', icon: '📙', name: 'Lycée Série A/D', desc: 'Terminale · BAC Littéraire/Technique' },
  { id: 'superieur', icon: '🎓', name: 'Supérieur', desc: 'Université · Grandes écoles' },
]

const objectifs = [
  'Réussir le BAC',
  'Améliorer mes notes',
  "Concours d'entrée",
  'Révision continue',
  'Curiosité',
]

interface OnboardingFormProps {
  userName: string
  onComplete: () => void
  onSkip: () => void
}

export function OnboardingForm({ userName, onComplete, onSkip }: OnboardingFormProps) {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [selectedMats, setSelectedMats] = useState<string[]>(['math', 'physique'])
  const [selectedNiveau, setSelectedNiveau] = useState<string>('lycee-c')
  const [selectedObjs, setSelectedObjs] = useState<string[]>(['Réussir le BAC'])
  const [animatedCount, setAnimatedCount] = useState(0)
  const [direction, setDirection] = useState<'next' | 'back'>('next')

  const totalSteps = 4

  const toggleMatiere = (id: string) => {
    setSelectedMats((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    )
  }

  const toggleObjectif = (obj: string) => {
    setSelectedObjs((prev) =>
      prev.includes(obj) ? prev.filter((o) => o !== obj) : [...prev, obj]
    )
  }

  const nextStep = () => {
    if (step === 3) {
      // Animate count for step 4
      animateCount()
    }
    if (step < totalSteps) {
      setDirection('next')
      setStep((prev) => (prev + 1) as Step)
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setDirection('back')
      setStep((prev) => (prev - 1) as Step)
    }
  }

  const animateCount = () => {
    const target = 2840
    let n = 0
    const interval = setInterval(() => {
      n = Math.min(n + Math.ceil(target / 40), target)
      setAnimatedCount(n)
      if (n >= target) clearInterval(interval)
    }, 30)
  }

  const finish = () => {
    onComplete()
  }

  const getDotStyle = (dotStep: number) => {
    if (dotStep < step) {
      return {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: 'var(--gold)',
        border: '1px solid var(--gold)',
        boxShadow: '0 0 10px var(--gold-glow)',
        transition: 'all 0.4s',
      }
    }
    if (dotStep === step) {
      return {
        width: '24px',
        height: '8px',
        borderRadius: '4px',
        background: 'transparent',
        border: '1px solid var(--gold)',
        boxShadow: '0 0 8px var(--gold-glow)',
        transition: 'all 0.4s',
      }
    }
    return {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: 'var(--b2)',
      border: '1px solid var(--b1)',
      transition: 'all 0.4s',
    }
  }

  const screenAnimation = direction === 'next' ? 'slideIn' : 'slideBack'

  return (
    <div>
      {/* Progress Dots */}
      <div style={{ display: 'flex', gap: '0.55rem', marginBottom: '2.5rem', justifyContent: 'center' }}>
        {[1, 2, 3, 4].map((s) => (
          <div key={s} style={getDotStyle(s)} />
        ))}
      </div>

      {/* Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '640px',
          background: 'var(--card)',
          border: '1px solid var(--b1)',
          borderRadius: '16px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Gold line at top */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
          }}
        />

        {/* Screen 1: Welcome */}
        {step === 1 && (
          <div className={screenAnimation} style={{ padding: '2.5rem' }}>
            <div style={{ padding: '0.5rem 0' }}>
              {/* Welcome Gem */}
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--gold-lo), var(--gold))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  margin: '0 auto 1.5rem',
                  boxShadow: '0 0 40px var(--gold-glow)',
                  animation: 'pulse 3s ease-in-out infinite',
                }}
              >
                ✦
              </div>

              {/* Label */}
              <div
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: '0.6rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.18em',
                  color: 'var(--gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.75rem',
                }}
              >
                <span style={{ flex: 1, maxWidth: '40px', height: '1px', background: 'var(--gold-line)' }} />
                Mah.AI · Bienvenue
                <span style={{ flex: 1, maxWidth: '40px', height: '1px', background: 'var(--gold-line)' }} />
              </div>

              {/* Title */}
              <h1
                style={{
                  fontFamily: 'var(--display)',
                  fontSize: '2.4rem',
                  fontWeight: 400,
                  letterSpacing: '-0.04em',
                  color: 'var(--text)',
                  textAlign: 'center',
                  marginBottom: '0.65rem',
                  lineHeight: 1.1,
                }}
              >
                Bonjour,
                <br />
                <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>{userName}</em> !
              </h1>

              {/* Subtitle */}
              <p
                style={{
                  fontSize: '0.88rem',
                  color: 'var(--text-2)',
                  textAlign: 'center',
                  lineHeight: 1.75,
                  maxWidth: '420px',
                  margin: '0 auto 2rem',
                }}
              >
                Votre compte est créé. En 2 minutes, personnalisez votre expérience pour accéder aux
                meilleurs sujets d&apos;examen malgaches.
              </p>

              {/* Feature List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '2rem' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                    background: 'var(--surface)',
                    border: '1px solid var(--b2)',
                    borderRadius: 'var(--r-lg)',
                    padding: '0.85rem 1rem',
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: 'var(--r)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                      flexShrink: 0,
                      background: 'var(--gold-dim)',
                    }}
                  >
                    🎯
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text)', marginBottom: '0.12rem' }}>
                      Catalogue personnalisé
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', lineHeight: 1.45 }}>
                      Les sujets recommandés en fonction de votre filière et niveau
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                    background: 'var(--surface)',
                    border: '1px solid var(--b2)',
                    borderRadius: 'var(--r-lg)',
                    padding: '0.85rem 1rem',
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: 'var(--r)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                      flexShrink: 0,
                      background: 'var(--sage-dim)',
                    }}
                  >
                    🤖
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text)', marginBottom: '0.12rem' }}>
                      Correction IA instantanée
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', lineHeight: 1.45 }}>
                      Soumettez vos réponses et obtenez un feedback détaillé en secondes
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                    background: 'var(--surface)',
                    border: '1px solid var(--b2)',
                    borderRadius: 'var(--r-lg)',
                    padding: '0.85rem 1rem',
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: 'var(--r)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                      flexShrink: 0,
                      background: 'rgba(74,107,90,0.12)',
                    }}
                  >
                    📈
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text)', marginBottom: '0.12rem' }}>
                      Suivi de progression
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', lineHeight: 1.45 }}>
                      Visualisez votre évolution semaine après semaine
                    </div>
                  </div>
                </div>
              </div>

              {/* Bonus */}
              <div
                style={{
                  background: 'var(--gold-dim)',
                  border: '1px solid var(--gold-line)',
                  borderRadius: 'var(--r)',
                  padding: '0.6rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                }}
              >
                <span style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--gold)' }}>🎁 Bonus</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-2)' }}>
                  10 crédits offerts pour votre première connexion
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Screen 2: Matières */}
        {step === 2 && (
          <div className={screenAnimation} style={{ padding: '2.5rem' }}>
            <div
              style={{
                fontFamily: 'var(--mono)',
                fontSize: '0.6rem',
                textTransform: 'uppercase',
                letterSpacing: '0.18em',
                color: 'var(--gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginBottom: '0.75rem',
              }}
            >
              <span style={{ flex: 1, maxWidth: '40px', height: '1px', background: 'var(--gold-line)' }} />
              Étape 1 · Matières
              <span style={{ flex: 1, maxWidth: '40px', height: '1px', background: 'var(--gold-line)' }} />
            </div>

            <h2
              style={{
                fontFamily: 'var(--display)',
                fontSize: '1.9rem',
                fontWeight: 400,
                color: 'var(--text)',
                letterSpacing: '-0.02em',
                marginBottom: '0.4rem',
                textAlign: 'left',
              }}
            >
              Vos <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>matières</em>
            </h2>
            <p style={{ fontSize: '0.83rem', color: 'var(--text-3)', marginBottom: '1.5rem' }}>
              Sélectionnez au moins 2 matières pour personnaliser votre catalogue.
            </p>

            {/* Matières Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.55rem', marginBottom: '1.5rem' }}>
              {matieres.map((mat) => {
                const isSelected = selectedMats.includes(mat.id)
                return (
                  <div
                    key={mat.id}
                    onClick={() => toggleMatiere(mat.id)}
                    style={{
                      border: `1px solid ${isSelected ? 'var(--gold)' : 'var(--b2)'}`,
                      borderRadius: 'var(--r-lg)',
                      padding: '0.85rem 0.65rem',
                      textAlign: 'center',
                      cursor: 'none',
                      transition: 'all 0.2s',
                      background: isSelected ? 'var(--gold-dim)' : 'var(--surface)',
                      boxShadow: isSelected ? '0 0 0 2px var(--gold-dim)' : 'none',
                    }}
                  >
                    <div style={{ fontSize: '1.4rem', marginBottom: '0.35rem' }}>{mat.icon}</div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        color: isSelected ? 'var(--gold)' : 'var(--text)',
                        marginBottom: '0.12rem',
                      }}
                    >
                      {mat.name}
                    </div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '0.58rem', color: isSelected ? 'var(--gold-lo)' : 'var(--text-3)' }}>
                      {mat.count.toLocaleString('fr')} sujets
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={{ fontFamily: 'var(--mono)', fontSize: '0.62rem', color: 'var(--text-3)', textAlign: 'center' }}>
              {selectedMats.length} matière{selectedMats.length > 1 ? 's' : ''} sélectionnée
              {selectedMats.length > 1 ? 's' : ''}
            </div>
          </div>
        )}

        {/* Screen 3: Niveau & Objectif */}
        {step === 3 && (
          <div className={screenAnimation} style={{ padding: '2.5rem' }}>
            <div
              style={{
                fontFamily: 'var(--mono)',
                fontSize: '0.6rem',
                textTransform: 'uppercase',
                letterSpacing: '0.18em',
                color: 'var(--gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginBottom: '0.75rem',
              }}
            >
              <span style={{ flex: 1, maxWidth: '40px', height: '1px', background: 'var(--gold-line)' }} />
              Étape 2 · Profil scolaire
              <span style={{ flex: 1, maxWidth: '40px', height: '1px', background: 'var(--gold-line)' }} />
            </div>

            <h2
              style={{
                fontFamily: 'var(--display)',
                fontSize: '1.9rem',
                fontWeight: 400,
                color: 'var(--text)',
                letterSpacing: '-0.02em',
                marginBottom: '0.4rem',
                textAlign: 'left',
              }}
            >
              Votre <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>niveau</em>
            </h2>
            <p style={{ fontSize: '0.83rem', color: 'var(--text-3)', marginBottom: '1.25rem' }}>
              Pour vous proposer des sujets adaptés.
            </p>

            {/* Niveau Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '1rem' }}>
              {niveaux.map((niv) => {
                const isSelected = selectedNiveau === niv.id
                return (
                  <div
                    key={niv.id}
                    onClick={() => setSelectedNiveau(niv.id)}
                    style={{
                      border: `1px solid ${isSelected ? 'var(--gold)' : 'var(--b2)'}`,
                      borderRadius: 'var(--r-lg)',
                      padding: '1.1rem',
                      cursor: 'none',
                      transition: 'all 0.2s',
                      background: isSelected ? 'var(--gold-dim)' : 'var(--surface)',
                    }}
                  >
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{niv.icon}</div>
                    <div
                      style={{
                        fontSize: '0.88rem',
                        fontWeight: 500,
                        color: isSelected ? 'var(--gold)' : 'var(--text)',
                        marginBottom: '0.2rem',
                      }}
                    >
                      {niv.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', lineHeight: 1.4 }}>{niv.desc}</div>
                  </div>
                )
              })}
            </div>

            {/* Objectifs */}
            <div
              style={{
                fontFamily: 'var(--mono)',
                fontSize: '0.6rem',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: 'var(--text-3)',
                marginTop: '1.25rem',
                marginBottom: '0.65rem',
              }}
            >
              Mon objectif principal
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
              {objectifs.map((obj) => {
                const isSelected = selectedObjs.includes(obj)
                return (
                  <button
                    key={obj}
                    onClick={() => toggleObjectif(obj)}
                    style={{
                      border: `1px solid ${isSelected ? 'var(--gold)' : 'var(--b2)'}`,
                      borderRadius: 'var(--r)',
                      padding: '0.42rem 0.9rem',
                      fontFamily: 'var(--mono)',
                      fontSize: '0.62rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: isSelected ? 'var(--gold)' : 'var(--text-3)',
                      cursor: 'none',
                      background: isSelected ? 'var(--gold-dim)' : 'none',
                      transition: 'all 0.2s',
                    }}
                  >
                    {obj}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Screen 4: Ready */}
        {step === 4 && (
          <div className={screenAnimation} style={{ padding: '2.5rem' }}>
            <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
              {/* Check icon */}
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  background: 'var(--sage-dim)',
                  border: '1px solid var(--sage-line)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.6rem',
                  margin: '0 auto 1.25rem',
                  animation: 'popIn 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                ✓
              </div>

              <div
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: '0.6rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.18em',
                  color: 'var(--gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.75rem',
                }}
              >
                <span style={{ flex: 1, maxWidth: '40px', height: '1px', background: 'var(--gold-line)' }} />
                Profil configuré
                <span style={{ flex: 1, maxWidth: '40px', height: '1px', background: 'var(--gold-line)' }} />
              </div>

              <h2
                style={{
                  fontFamily: 'var(--display)',
                  fontSize: '2.4rem',
                  fontWeight: 400,
                  letterSpacing: '-0.04em',
                  color: 'var(--text)',
                  textAlign: 'center',
                  marginBottom: '0.5rem',
                  lineHeight: 1.1,
                }}
              >
                Vous êtes <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>prêt·e</em> !
              </h2>

              <p
                style={{
                  fontSize: '0.88rem',
                  color: 'var(--text-2)',
                  textAlign: 'center',
                  lineHeight: 1.75,
                  maxWidth: '420px',
                  margin: '0 auto 1.75rem',
                }}
              >
                Votre espace personnel est configuré. Voici ce qui vous attend sur Mah.AI.
              </p>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem', marginBottom: '2rem' }}>
                <div
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--b2)',
                    borderRadius: 'var(--r-lg)',
                    padding: '0.9rem',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--display)',
                      fontSize: '1.8rem',
                      fontWeight: 400,
                      color: 'var(--gold)',
                      letterSpacing: '-0.04em',
                    }}
                  >
                    {animatedCount.toLocaleString('fr')}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: '0.58rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: 'var(--text-3)',
                      marginTop: '0.2rem',
                    }}
                  >
                    Sujets recommandés
                  </div>
                </div>
                <div
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--b2)',
                    borderRadius: 'var(--r-lg)',
                    padding: '0.9rem',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--display)',
                      fontSize: '1.8rem',
                      fontWeight: 400,
                      color: 'var(--gold)',
                      letterSpacing: '-0.04em',
                    }}
                  >
                    10
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: '0.58rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: 'var(--text-3)',
                      marginTop: '0.2rem',
                    }}
                  >
                    Crédits offerts
                  </div>
                </div>
                <div
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--b2)',
                    borderRadius: 'var(--r-lg)',
                    padding: '0.9rem',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--display)',
                      fontSize: '1.8rem',
                      fontWeight: 400,
                      color: 'var(--gold)',
                      letterSpacing: '-0.04em',
                    }}
                  >
                    ∞
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: '0.58rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: 'var(--text-3)',
                      marginTop: '0.2rem',
                    }}
                  >
                    Corrections IA
                  </div>
                </div>
              </div>

              {/* Profile Recap */}
              <div
                style={{
                  background: 'var(--gold-dim)',
                  border: '1px solid var(--gold-line)',
                  borderRadius: 'var(--r-lg)',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: '0.58rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    color: 'var(--gold)',
                    marginBottom: '0.5rem',
                  }}
                >
                  ✦ Votre profil
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-2)', lineHeight: 1.7 }}>
                  Niveau :{' '}
                  <strong style={{ color: 'var(--text)' }}>
                    {niveaux.find((n) => n.id === selectedNiveau)?.name || 'Non défini'}
                  </strong>
                  <br />
                  Matières :{' '}
                  <strong style={{ color: 'var(--text)' }}>
                    {selectedMats.length > 0
                      ? matieres
                          .filter((m) => selectedMats.includes(m.id))
                          .map((m) => m.name)
                          .join(', ')
                      : 'Non définie'}
                  </strong>
                  <br />
                  Objectif :{' '}
                  <strong style={{ color: 'var(--text)' }}>
                    {selectedObjs.join(', ') || 'Non défini'}
                  </strong>
                </div>
              </div>

              {/* Final Button */}
              <button
                onClick={finish}
                style={{
                  width: '100%',
                  fontFamily: 'var(--body)',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  padding: '1rem',
                  borderRadius: 'var(--r)',
                  background: 'linear-gradient(135deg, var(--gold), var(--gold-hi))',
                  color: 'var(--void)',
                  border: 'none',
                  cursor: 'none',
                  letterSpacing: '0.04em',
                  transition: 'all 0.25s',
                  boxShadow: '0 4px 24px rgba(201,168,76,0.25)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 36px rgba(201,168,76,0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none'
                  e.currentTarget.style.boxShadow = '0 4px 24px rgba(201,168,76,0.25)'
                }}
              >
                Explorer mon catalogue →
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        {step < 4 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.25rem 2.5rem',
              borderTop: '1px solid var(--b3)',
              background: 'var(--surface)',
            }}
          >
            <button
              onClick={prevStep}
              style={{
                background: 'none',
                border: 'none',
                fontFamily: 'var(--mono)',
                fontSize: '0.62rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--text-3)',
                cursor: step === 1 ? 'not-allowed' : 'none',
                transition: 'color 0.2s',
                visibility: step === 1 ? 'hidden' : 'visible',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-2)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-3)')}
            >
              ← Retour
            </button>
            <span
              style={{
                fontFamily: 'var(--mono)',
                fontSize: '0.6rem',
                color: 'var(--text-3)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              0{step} / 0{totalSteps}
            </span>
            <button
              onClick={nextStep}
              style={{
                fontFamily: 'var(--body)',
                fontSize: '0.88rem',
                fontWeight: 500,
                padding: '0.65rem 1.75rem',
                borderRadius: 'var(--r)',
                background: 'linear-gradient(135deg, var(--gold), var(--gold-hi))',
                color: 'var(--void)',
                border: 'none',
                cursor: 'none',
                transition: 'all 0.25s',
                letterSpacing: '0.04em',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 6px 24px rgba(201,168,76,0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {step === 1 ? 'Commencer →' : step === 3 ? 'Voir mon profil →' : 'Continuer →'}
            </button>
          </div>
        )}
      </div>

      {/* Skip link */}
      {step < 4 && (
        <button
          onClick={onSkip}
          style={{
            marginTop: '1.25rem',
            background: 'none',
            border: 'none',
            fontFamily: 'var(--mono)',
            fontSize: '0.58rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--text-4)',
            cursor: 'none',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-3)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-4)')}
        >
          Passer la configuration →
        </button>
      )}
    </div>
  )
}
