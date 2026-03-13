'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth'
import { registerUser } from '@/actions/auth'
import { useState, useEffect } from 'react'
import Link from 'next/link'

type Step = 1 | 2 | 3

export function RegisterForm() {
  const [step, setStep] = useState<Step>(1)
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [selectedRole, setSelectedRole] = useState<'STUDENT' | 'CONTRIBUTOR'>('STUDENT')
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'premium'>('free')
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [cgvChecked, setCgvChecked] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      prenom: '',
      nom: '',
      email: '',
      password: '',
      confirmPassword: '',
    }
  })

  const password = watch('password')

  // Password strength calculation
  useEffect(() => {
    let strength = 0
    if (password.length >= 8) strength += 25
    if (/[A-Z]/.test(password)) strength += 25
    if (/[0-9]/.test(password)) strength += 25
    if (/[^A-Za-z0-9]/.test(password)) strength += 25
    setPasswordStrength(strength)
  }, [password])

  // Password hints status
  const hasLength = password.length >= 8
  const hasUpper = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[^A-Za-z0-9]/.test(password)

  const goStep = (n: Step) => {
    if (n === 2) {
      const email = watch('email')
      const prenom = watch('prenom')
      if (!email || !prenom) {
        setServerError('Veuillez remplir prénom et e-mail')
        return
      }
    }
    setStep(n)
    setServerError(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const selectRole = (role: 'STUDENT' | 'CONTRIBUTOR') => {
    setSelectedRole(role)
  }

  const selectPlan = (plan: 'free' | 'premium') => {
    setSelectedPlan(plan)
  }

  const onSubmit = async (data: RegisterFormData) => {
    if (!cgvChecked) {
      setServerError('Veuillez accepter les conditions d\'utilisation')
      return
    }
    setServerError(null)
    const result = await registerUser({ ...data, role: selectedRole } as any)
    if (result?.error) {
      setServerError(result.error)
      setStep(1)
    }
  }

  // Common styles
  const formGroupStyle = { marginBottom: '1.1rem' }
  const formLabelStyle = { 
    fontFamily: 'var(--mono)', 
    fontSize: '0.62rem', 
    textTransform: 'uppercase' as const, 
    letterSpacing: '0.14em', 
    color: 'var(--text-3)', 
    display: 'block', 
    marginBottom: '0.5rem' 
  }
  const formInputStyle = { 
    width: '100%', 
    background: 'var(--surface)', 
    border: '1px solid var(--b2)', 
    borderRadius: 'var(--r)', 
    padding: '0.72rem 1rem', 
    fontFamily: 'var(--body)', 
    fontSize: '0.88rem', 
    color: 'var(--text)', 
    outline: 'none', 
    transition: 'border-color 0.2s, box-shadow 0.2s',
    WebkitAppearance: 'none' as const
  }

  if (!mounted) {
    return <div style={{ minHeight: '400px' }} />
  }

  return (
    <div>
      {/* Stepper */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: 0, 
        marginBottom: '2rem', 
        position: 'relative' 
      }}>
        {/* Step 1 */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column' as const, 
          alignItems: 'center', 
          gap: '0.45rem', 
          position: 'relative', 
          zIndex: 1 
        }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontFamily: 'var(--mono)', 
            fontSize: '0.65rem', 
            border: '1px solid var(--b1)', 
            background: step >= 1 ? 'var(--gold)' : 'var(--surface)', 
            color: step >= 1 ? 'var(--void)' : 'var(--text-3)',
            transition: 'all 0.3s',
            boxShadow: step === 1 ? '0 0 0 4px var(--gold-dim)' : 'none'
          }}>
            01
          </div>
          <div style={{ 
            fontFamily: 'var(--mono)', 
            fontSize: '0.55rem', 
            textTransform: 'uppercase' as const, 
            letterSpacing: '0.12em', 
            color: step >= 1 ? 'var(--gold)' : 'var(--text-3)', 
            whiteSpace: 'nowrap' as const 
          }}>
            Profil
          </div>
        </div>

        {/* Line 1 */}
        <div style={{ 
          flex: 1, 
          height: '1px', 
          background: step > 1 ? 'var(--gold-line)' : 'var(--b1)', 
          minWidth: '40px', 
          margin: '0 4px', 
          marginBottom: '20px',
          maxWidth: '60px'
        }}></div>

        {/* Step 2 */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column' as const, 
          alignItems: 'center', 
          gap: '0.45rem', 
          position: 'relative', 
          zIndex: 1 
        }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontFamily: 'var(--mono)', 
            fontSize: '0.65rem', 
            border: '1px solid var(--b1)', 
            background: step >= 2 ? 'var(--gold)' : 'var(--surface)', 
            color: step >= 2 ? 'var(--void)' : 'var(--text-3)',
            transition: 'all 0.3s',
            boxShadow: step === 2 ? '0 0 0 4px var(--gold-dim)' : 'none'
          }}>
            02
          </div>
          <div style={{ 
            fontFamily: 'var(--mono)', 
            fontSize: '0.55rem', 
            textTransform: 'uppercase' as const, 
            letterSpacing: '0.12em', 
            color: step >= 2 ? 'var(--gold)' : 'var(--text-3)', 
            whiteSpace: 'nowrap' as const 
          }}>
            Rôle
          </div>
        </div>

        {/* Line 2 */}
        <div style={{ 
          flex: 1, 
          height: '1px', 
          background: step > 2 ? 'var(--gold-line)' : 'var(--b1)', 
          minWidth: '40px', 
          margin: '0 4px', 
          marginBottom: '20px',
          maxWidth: '60px'
        }}></div>

        {/* Step 3 */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column' as const, 
          alignItems: 'center', 
          gap: '0.45rem', 
          position: 'relative', 
          zIndex: 1 
        }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontFamily: 'var(--mono)', 
            fontSize: '0.65rem', 
            border: '1px solid var(--b1)', 
            background: step >= 3 ? 'var(--gold)' : 'var(--surface)', 
            color: step >= 3 ? 'var(--void)' : 'var(--text-3)',
            transition: 'all 0.3s',
            boxShadow: step === 3 ? '0 0 0 4px var(--gold-dim)' : 'none'
          }}>
            03
          </div>
          <div style={{ 
            fontFamily: 'var(--mono)', 
            fontSize: '0.55rem', 
            textTransform: 'uppercase' as const, 
            letterSpacing: '0.12em', 
            color: step >= 3 ? 'var(--gold)' : 'var(--text-3)', 
            whiteSpace: 'nowrap' as const 
          }}>
            Sécurité
          </div>
        </div>
      </div>

      {serverError && (
        <div style={{ 
          padding: '1rem', 
          marginBottom: '1.5rem', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem', 
          fontSize: '0.875rem', 
          background: 'rgba(155, 35, 53, 0.1)', 
          color: 'var(--ruby)', 
          border: '1px solid rgba(155, 35, 53, 0.2)', 
          borderRadius: '0.5rem' 
        }}>
          <span>✕</span>
          <p>{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* STEP 1: Profil */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h1 style={{ 
              fontFamily: 'var(--display)', 
              fontSize: '1.8rem', 
              fontWeight: 400, 
              color: 'var(--text)', 
              letterSpacing: '-0.02em', 
              marginBottom: '0.4rem',
              lineHeight: 1.2
            }}>
              Créer votre <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>compte</em>
            </h1>
            <p style={{ 
              fontSize: '0.82rem', 
              color: 'var(--text-3)', 
              marginBottom: '2rem', 
              lineHeight: 1.6 
            }}>
              Accédez à des milliers de sujets d&apos;examen et boostez votre préparation avec l&apos;IA.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <div style={formGroupStyle}>
                <label style={formLabelStyle}>
                  Prénom <span style={{ color: 'var(--ruby)' }}>*</span>
                </label>
                <input {...register('prenom')} style={formInputStyle} placeholder="Jean" />
                {errors.prenom && (
                  <p style={{ marginTop: '0.3rem', fontSize: '0.6rem', color: 'var(--ruby)', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {errors.prenom.message}
                  </p>
                )}
              </div>
              <div style={formGroupStyle}>
                <label style={formLabelStyle}>
                  Nom <span style={{ color: 'var(--ruby)' }}>*</span>
                </label>
                <input {...register('nom')} style={formInputStyle} placeholder="Razafy" />
                {errors.nom && (
                  <p style={{ marginTop: '0.3rem', fontSize: '0.6rem', color: 'var(--ruby)', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {errors.nom.message}
                  </p>
                )}
              </div>
            </div>

            <div style={formGroupStyle}>
              <label style={formLabelStyle}>
                Adresse e-mail <span style={{ color: 'var(--ruby)' }}>*</span>
              </label>
              <input {...register('email')} type="email" style={formInputStyle} placeholder="votre@email.com" />
              {errors.email && (
                <p style={{ marginTop: '0.3rem', fontSize: '0.6rem', color: 'var(--ruby)', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {errors.email.message}
                </p>
              )}
            </div>

            <div style={formGroupStyle}>
              <label style={formLabelStyle}>Établissement</label>
              <input style={formInputStyle} placeholder="Université d'Antananarivo…" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <div style={formGroupStyle}>
                <label style={formLabelStyle}>Filière</label>
                <select style={{ 
                  ...formInputStyle, 
                  cursor: 'none',
                  appearance: 'none' as const,
                  backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='rgba(240,235,227,0.3)' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")",
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center'
                }}>
                  <option value="">Sélectionner…</option>
                  <option>Informatique</option>
                  <option>Droit</option>
                  <option>Médecine</option>
                  <option>Économie &amp; Gestion</option>
                  <option>Lettres &amp; Sciences Humaines</option>
                  <option>Sciences</option>
                  <option>Éducation</option>
                  <option>Autre</option>
                </select>
              </div>
              <div style={formGroupStyle}>
                <label style={formLabelStyle}>Année d&apos;études</label>
                <select style={{ 
                  ...formInputStyle, 
                  cursor: 'none',
                  appearance: 'none' as const,
                  backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='rgba(240,235,227,0.3)' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")",
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center'
                }}>
                  <option value="">Sélectionner…</option>
                  <option>L1 — 1ère année</option>
                  <option>L2 — 2ème année</option>
                  <option>L3 — 3ème année</option>
                  <option>M1 — Master 1</option>
                  <option>M2 — Master 2</option>
                  <option>Doctorat</option>
                  <option>Lycée</option>
                </select>
              </div>
            </div>

            {/* Google Button */}
            <button 
              type="button"
              style={{ 
                width: '100%', 
                fontFamily: 'var(--body)', 
                fontSize: '0.85rem', 
                fontWeight: 400, 
                padding: '0.75rem', 
                borderRadius: 'var(--r)', 
                background: 'transparent', 
                border: '1px solid var(--b1)', 
                color: 'var(--text-2)', 
                cursor: 'none', 
                letterSpacing: '0.04em', 
                transition: 'all 0.2s', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '0.65rem',
                marginBottom: '0.85rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--gold-line)'
                e.currentTarget.style.color = 'var(--text)'
                e.currentTarget.style.background = 'var(--gold-dim)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--b1)'
                e.currentTarget.style.color = 'var(--text-2)'
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continuer avec Google
            </button>

            {/* Divider */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem', 
              margin: '1.5rem 0' 
            }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--b1)' }}></div>
              <span style={{ 
                fontFamily: 'var(--mono)', 
                fontSize: '0.6rem', 
                textTransform: 'uppercase', 
                letterSpacing: '0.12em', 
                color: 'var(--text-4)' 
              }}>
                ou
              </span>
              <div style={{ flex: 1, height: '1px', background: 'var(--b1)' }}></div>
            </div>

            {/* Continue Button */}
            <button
              type="button"
              onClick={() => goStep(2)}
              style={{ 
                width: '100%', 
                fontFamily: 'var(--body)', 
                fontSize: '0.9rem', 
                fontWeight: 500, 
                padding: '0.9rem', 
                borderRadius: 'var(--r)', 
                background: 'linear-gradient(135deg, var(--gold), var(--gold-hi))', 
                color: 'var(--void)', 
                border: 'none', 
                cursor: 'none', 
                letterSpacing: '0.04em', 
                transition: 'all 0.25s',
                boxShadow: '0 4px 20px rgba(201,168,76,0.25)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(201,168,76,0.38)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none'
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(201,168,76,0.25)'
              }}
            >
              Continuer →
            </button>

            <div style={{ 
              marginTop: '1.5rem', 
              textAlign: 'center', 
              fontSize: '0.8rem', 
              color: 'var(--text-3)' 
            }}>
              Déjà un compte ?{' '}
              <Link 
                href="/auth/login"
                style={{ 
                  color: 'var(--gold)', 
                  textDecoration: 'none', 
                  transition: 'color 0.2s' 
                }}
              >
                Se connecter
              </Link>
            </div>
          </div>
        )}

        {/* STEP 2: Rôle */}
        {step === 2 && (
          <div className="animate-fade-in">
            {/* Back Button */}
            <button
              type="button"
              onClick={() => goStep(1)}
              style={{ 
                background: 'none', 
                border: 'none', 
                fontFamily: 'var(--mono)', 
                fontSize: '0.62rem', 
                textTransform: 'uppercase', 
                letterSpacing: '0.12em', 
                color: 'var(--text-3)', 
                cursor: 'none', 
                transition: 'color 0.2s', 
                padding: 0, 
                marginBottom: '1.25rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.4rem'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-3)'}
            >
              ← Retour
            </button>

            <h1 style={{ 
              fontFamily: 'var(--display)', 
              fontSize: '1.8rem', 
              fontWeight: 400, 
              color: 'var(--text)', 
              letterSpacing: '-0.02em', 
              marginBottom: '0.4rem',
              lineHeight: 1.2
            }}>
              Votre <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>rôle</em>
            </h1>
            <p style={{ 
              fontSize: '0.82rem', 
              color: 'var(--text-3)', 
              marginBottom: '2rem', 
              lineHeight: 1.6 
            }}>
              Choisissez comment vous allez utiliser Mah.AI. Vous pourrez changer plus tard.
            </p>

            {/* Role Cards */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '0.75rem', 
              marginBottom: '1.5rem' 
            }}>
              {/* Student Card */}
              <div 
                onClick={() => selectRole('STUDENT')}
                style={{ 
                  padding: '1.1rem', 
                  background: selectedRole === 'STUDENT' ? 'var(--gold-dim)' : 'var(--surface)', 
                  border: `1px solid ${selectedRole === 'STUDENT' ? 'var(--gold)' : 'var(--b2)'}`, 
                  borderRadius: 'var(--r)', 
                  cursor: 'none', 
                  transition: 'all 0.2s', 
                  textAlign: 'center',
                  boxShadow: selectedRole === 'STUDENT' ? '0 0 0 3px var(--gold-dim)' : 'none'
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🎓</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text)', marginBottom: '0.2rem' }}>
                  Étudiant
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text-3)', lineHeight: 1.5 }}>
                  Accéder aux sujets, s&apos;entraîner et obtenir des corrections IA
                </div>
              </div>

              {/* Contributor Card */}
              <div 
                onClick={() => selectRole('CONTRIBUTOR')}
                style={{ 
                  padding: '1.1rem', 
                  background: selectedRole === 'CONTRIBUTOR' ? 'var(--gold-dim)' : 'var(--surface)', 
                  border: `1px solid ${selectedRole === 'CONTRIBUTOR' ? 'var(--gold)' : 'var(--b2)'}`, 
                  borderRadius: 'var(--r)', 
                  cursor: 'none', 
                  transition: 'all 0.2s', 
                  textAlign: 'center',
                  boxShadow: selectedRole === 'CONTRIBUTOR' ? '0 0 0 3px var(--gold-dim)' : 'none'
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>✦</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text)', marginBottom: '0.2rem' }}>
                  Contributeur
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text-3)', lineHeight: 1.5 }}>
                  Publier des sujets, gagner des crédits et construire votre réputation
                </div>
              </div>
            </div>

            {/* Plan Selection */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ 
                fontFamily: 'var(--mono)', 
                fontSize: '0.62rem', 
                textTransform: 'uppercase', 
                letterSpacing: '0.14em', 
                color: 'var(--text-3)', 
                marginBottom: '0.75rem' 
              }}>
                Plan
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                {/* Free Plan */}
                <div 
                  onClick={() => selectPlan('free')}
                  style={{ 
                    padding: '0.9rem', 
                    background: selectedPlan === 'free' ? 'var(--gold-dim)' : 'var(--surface)', 
                    border: `1px solid ${selectedPlan === 'free' ? 'var(--gold)' : 'var(--b2)'}`, 
                    borderRadius: 'var(--r)', 
                    cursor: 'none', 
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--text)', marginBottom: '0.2rem' }}>
                    Gratuit
                  </div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text-3)' }}>
                    5 sujets / mois
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginTop: '0.45rem' }}>
                    0 Ar
                  </div>
                </div>

                {/* Premium Plan */}
                <div 
                  onClick={() => selectPlan('premium')}
                  style={{ 
                    padding: '0.9rem', 
                    background: selectedPlan === 'premium' ? 'var(--gold-dim)' : 'var(--surface)', 
                    border: `1px solid ${selectedPlan === 'premium' ? 'var(--gold)' : 'var(--b2)'}`, 
                    borderRadius: 'var(--r)', 
                    cursor: 'none', 
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--text)', marginBottom: '0.2rem' }}>
                    Premium ✦
                  </div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text-3)' }}>
                    Illimité + IA
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--gold)', marginTop: '0.45rem' }}>
                    15 000 Ar/mois
                  </div>
                </div>
              </div>
            </div>

            {/* Continue Button */}
            <button
              type="button"
              onClick={() => goStep(3)}
              style={{ 
                width: '100%', 
                fontFamily: 'var(--body)', 
                fontSize: '0.9rem', 
                fontWeight: 500, 
                padding: '0.9rem', 
                borderRadius: 'var(--r)', 
                background: 'linear-gradient(135deg, var(--gold), var(--gold-hi))', 
                color: 'var(--void)', 
                border: 'none', 
                cursor: 'none', 
                letterSpacing: '0.04em', 
                transition: 'all 0.25s',
                boxShadow: '0 4px 20px rgba(201,168,76,0.25)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(201,168,76,0.38)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none'
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(201,168,76,0.25)'
              }}
            >
              Continuer →
            </button>
          </div>
        )}

        {/* STEP 3: Sécurité */}
        {step === 3 && (
          <div className="animate-fade-in">
            {/* Back Button */}
            <button
              type="button"
              onClick={() => goStep(2)}
              style={{ 
                background: 'none', 
                border: 'none', 
                fontFamily: 'var(--mono)', 
                fontSize: '0.62rem', 
                textTransform: 'uppercase', 
                letterSpacing: '0.12em', 
                color: 'var(--text-3)', 
                cursor: 'none', 
                transition: 'color 0.2s', 
                padding: 0, 
                marginBottom: '1.25rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.4rem'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-3)'}
            >
              ← Retour
            </button>

            <h1 style={{ 
              fontFamily: 'var(--display)', 
              fontSize: '1.8rem', 
              fontWeight: 400, 
              color: 'var(--text)', 
              letterSpacing: '-0.02em', 
              marginBottom: '0.4rem',
              lineHeight: 1.2
            }}>
              Sécuriser votre <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>compte</em>
            </h1>
            <p style={{ 
              fontSize: '0.82rem', 
              color: 'var(--text-3)', 
              marginBottom: '2rem', 
              lineHeight: 1.6 
            }}>
              Choisissez un mot de passe solide pour protéger vos données.
            </p>

            {/* Password Field */}
            <div style={formGroupStyle}>
              <label style={formLabelStyle}>
                Mot de passe <span style={{ color: 'var(--ruby)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  style={formInputStyle}
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ 
                    position: 'absolute', 
                    right: '1rem', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: 'var(--text-3)', 
                    background: 'none', 
                    border: 'none', 
                    fontSize: '0.9rem', 
                    cursor: 'none'
                  }}
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>

              {/* Strength Bar */}
              <div style={{ 
                height: '3px', 
                background: 'var(--b2)', 
                borderRadius: '2px', 
                overflow: 'hidden', 
                marginTop: '0.45rem' 
              }}>
                <div style={{ 
                  height: '100%', 
                  borderRadius: '2px', 
                  transition: 'width 0.3s, background 0.3s',
                  width: `${passwordStrength}%`,
                  background: passwordStrength <= 25 ? 'var(--ruby)' : passwordStrength <= 50 ? 'var(--gold)' : passwordStrength <= 75 ? 'var(--gold)' : 'var(--sage)'
                }}></div>
              </div>

              {/* Password Hints */}
              <div style={{ 
                marginTop: '0.5rem', 
                display: 'flex', 
                flexWrap: 'wrap' as const, 
                gap: '0.35rem' 
              }}>
                <span style={{ 
                  fontFamily: 'var(--mono)', 
                  fontSize: '0.58rem', 
                  letterSpacing: '0.06em', 
                  color: hasLength ? 'var(--sage)' : 'var(--text-4)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.25rem',
                  transition: 'color 0.2s'
                }}>
                  <span>{hasLength ? '●' : '○'}</span> 8+ caractères
                </span>
                <span style={{ 
                  fontFamily: 'var(--mono)', 
                  fontSize: '0.58rem', 
                  letterSpacing: '0.06em', 
                  color: hasUpper ? 'var(--sage)' : 'var(--text-4)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.25rem',
                  transition: 'color 0.2s'
                }}>
                  <span>{hasUpper ? '●' : '○'}</span> Majuscule
                </span>
                <span style={{ 
                  fontFamily: 'var(--mono)', 
                  fontSize: '0.58rem', 
                  letterSpacing: '0.06em', 
                  color: hasNumber ? 'var(--sage)' : 'var(--text-4)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.25rem',
                  transition: 'color 0.2s'
                }}>
                  <span>{hasNumber ? '●' : '○'}</span> Chiffre
                </span>
                <span style={{ 
                  fontFamily: 'var(--mono)', 
                  fontSize: '0.58rem', 
                  letterSpacing: '0.06em', 
                  color: hasSpecial ? 'var(--sage)' : 'var(--text-4)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.25rem',
                  transition: 'color 0.2s'
                }}>
                  <span>{hasSpecial ? '●' : '○'}</span> Caractère spécial
                </span>
              </div>
              {errors.password && (
                <p style={{ marginTop: '0.3rem', fontSize: '0.6rem', color: 'var(--ruby)', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div style={formGroupStyle}>
              <label style={formLabelStyle}>
                Confirmer <span style={{ color: 'var(--ruby)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  style={formInputStyle}
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ 
                    position: 'absolute', 
                    right: '1rem', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: 'var(--text-3)', 
                    background: 'none', 
                    border: 'none', 
                    fontSize: '0.9rem', 
                    cursor: 'none'
                  }}
                >
                  {showConfirmPassword ? '🙈' : '👁'}
                </button>
              </div>
              {errors.confirmPassword && (
                <p style={{ marginTop: '0.3rem', fontSize: '0.6rem', color: 'var(--ruby)', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* CGU Checkbox */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '0.75rem', 
              marginBottom: '0.85rem' 
            }}>
              <input 
                type="checkbox" 
                id="cgvCheck"
                checked={cgvChecked}
                onChange={(e) => setCgvChecked(e.target.checked)}
                style={{ 
                  width: '16px', 
                  height: '16px', 
                  flexShrink: 0, 
                  accentColor: 'var(--gold)', 
                  cursor: 'none', 
                  marginTop: '2px' 
                }} 
              />
              <label 
                htmlFor="cgvCheck"
                style={{ 
                  fontSize: '0.78rem', 
                  color: 'var(--text-2)', 
                  lineHeight: 1.5, 
                  cursor: 'none' 
                }}
              >
                J&apos;accepte les <Link href="#" style={{ color: 'var(--gold)', textDecoration: 'none' }}>Conditions Générales d&apos;Utilisation</Link> et la <Link href="#" style={{ color: 'var(--gold)', textDecoration: 'none' }}>Politique de confidentialité</Link> de Mah.AI
              </label>
            </div>

            {/* Newsletter Checkbox */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '0.75rem', 
              marginBottom: '0.85rem' 
            }}>
              <input 
                type="checkbox" 
                id="newsCheck"
                defaultChecked
                style={{ 
                  width: '16px', 
                  height: '16px', 
                  flexShrink: 0, 
                  accentColor: 'var(--gold)', 
                  cursor: 'none', 
                  marginTop: '2px' 
                }} 
              />
              <label 
                htmlFor="newsCheck"
                style={{ 
                  fontSize: '0.78rem', 
                  color: 'var(--text-2)', 
                  lineHeight: 1.5, 
                  cursor: 'none' 
                }}
              >
                Recevoir les actualités, nouveaux sujets et offres Mah.AI
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{ 
                width: '100%', 
                fontFamily: 'var(--body)', 
                fontSize: '0.9rem', 
                fontWeight: 500, 
                padding: '0.9rem', 
                borderRadius: 'var(--r)', 
                background: 'linear-gradient(135deg, var(--gold), var(--gold-hi))', 
                color: 'var(--void)', 
                border: 'none', 
                cursor: isSubmitting ? 'not-allowed' : 'none', 
                letterSpacing: '0.04em', 
                transition: 'all 0.25s',
                boxShadow: '0 4px 20px rgba(201,168,76,0.25)',
                opacity: isSubmitting ? 0.4 : 1
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(201,168,76,0.38)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none'
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(201,168,76,0.25)'
              }}
            >
              {isSubmitting ? 'Création...' : 'Créer mon compte ✦'}
            </button>

            <div style={{ 
              marginTop: '1.5rem', 
              textAlign: 'center', 
              fontSize: '0.8rem', 
              color: 'var(--text-3)' 
            }}>
              Déjà un compte ?{' '}
              <Link 
                href="/auth/login"
                style={{ 
                  color: 'var(--gold)', 
                  textDecoration: 'none', 
                  transition: 'color 0.2s' 
                }}
              >
                Se connecter
              </Link>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
