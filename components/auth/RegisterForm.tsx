'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth'
import { registerUser } from '@/actions/auth'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ToastContainer, useToast } from '@/components/ui/Toast'

type Step = 1 | 2 | 3

export function RegisterForm() {
  const [step, setStep] = useState<Step>(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [selectedRole, setSelectedRole] = useState<'ETUDIANT' | 'CONTRIBUTEUR'>('ETUDIANT')
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'premium'>('free')
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [cgvChecked, setCgvChecked] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { toasts, addToast, removeToast } = useToast()
  
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
      role: 'ETUDIANT',
      etablissement: '',
      newsletterOptIn: true,
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

  useEffect(() => {
    setValue('role', selectedRole)
  }, [selectedRole, setValue])

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
        addToast('Veuillez remplir prénom et e-mail', 'error')
        return
      }
    }
    setStep(n)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const selectRole = (role: 'ETUDIANT' | 'CONTRIBUTEUR') => {
    setSelectedRole(role)
  }

  const selectPlan = (plan: 'free' | 'premium') => {
    setSelectedPlan(plan)
  }

  const onSubmit = async (data: RegisterFormData) => {
    if (!cgvChecked) {
      addToast('Veuillez accepter les conditions d\'utilisation', 'error')
      return
    }
    const result = await registerUser({
      ...data,
      role: selectedRole,
      newsletterOptIn: Boolean(data.newsletterOptIn),
    })
    if (result?.error) {
      addToast(result.error, 'error')
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
      <ToastContainer toasts={toasts} removeToast={removeToast} />

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
              <input
                {...register('etablissement')}
                style={formInputStyle}
                placeholder="Université d'Antananarivo…"
              />
            </div>

            <p style={{ 
              marginTop: '-0.25rem',
              marginBottom: '1.5rem',
              fontSize: '0.74rem',
              color: 'var(--text-3)',
              lineHeight: 1.6
            }}>
              La filière et l&apos;année d&apos;étude se complètent plus tard depuis votre profil.
            </p>

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
                onClick={() => selectRole('ETUDIANT')}
                style={{ 
                  padding: '1.1rem', 
                  background: selectedRole === 'ETUDIANT' ? 'var(--gold-dim)' : 'var(--surface)', 
                  border: `1px solid ${selectedRole === 'ETUDIANT' ? 'var(--gold)' : 'var(--b2)'}`, 
                  borderRadius: 'var(--r)', 
                  cursor: 'none', 
                  transition: 'all 0.2s', 
                  textAlign: 'center',
                  boxShadow: selectedRole === 'ETUDIANT' ? '0 0 0 3px var(--gold-dim)' : 'none'
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
                onClick={() => selectRole('CONTRIBUTEUR')}
                style={{ 
                  padding: '1.1rem', 
                  background: selectedRole === 'CONTRIBUTEUR' ? 'var(--gold-dim)' : 'var(--surface)', 
                  border: `1px solid ${selectedRole === 'CONTRIBUTEUR' ? 'var(--gold)' : 'var(--b2)'}`, 
                  borderRadius: 'var(--r)', 
                  cursor: 'none', 
                  transition: 'all 0.2s', 
                  textAlign: 'center',
                  boxShadow: selectedRole === 'CONTRIBUTEUR' ? '0 0 0 3px var(--gold-dim)' : 'none'
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
                {...register('newsletterOptIn')}
                type="checkbox" 
                id="newsCheck"
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
