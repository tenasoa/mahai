'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth'
import { registerUser } from '@/actions/auth'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ToastContainer, useToast } from '@/components/ui/Toast'
import { Eye, EyeOff, GraduationCap, Sparkles } from 'lucide-react'
import './auth-forms.css'

type Step = 1 | 2 | 3

export function RegisterForm() {
  const [step, setStep] = useState<Step>(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [selectedRole, setSelectedRole] = useState<'ETUDIANT' | 'CONTRIBUTEUR'>('ETUDIANT')
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

  if (!mounted) {
    return <div className="auth-skeleton-tall" />
  }

  return (
    <div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Stepper */}
      <div className="auth-stepper">
        <div className="auth-step">
          <div className={`auth-step-circle ${step >= 1 ? 'active' : ''} ${step === 1 ? 'current' : ''}`}>01</div>
          <div className={`auth-step-label ${step >= 1 ? 'active' : ''}`}>Profil</div>
        </div>
        <div className={`auth-step-line ${step > 1 ? 'active' : ''}`} />
        <div className="auth-step">
          <div className={`auth-step-circle ${step >= 2 ? 'active' : ''} ${step === 2 ? 'current' : ''}`}>02</div>
          <div className={`auth-step-label ${step >= 2 ? 'active' : ''}`}>Rôle</div>
        </div>
        <div className={`auth-step-line ${step > 2 ? 'active' : ''}`} />
        <div className="auth-step">
          <div className={`auth-step-circle ${step >= 3 ? 'active' : ''} ${step === 3 ? 'current' : ''}`}>03</div>
          <div className={`auth-step-label ${step >= 3 ? 'active' : ''}`}>Sécurité</div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* STEP 1: Profil */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h1 className="auth-heading">
              Créer votre <em>compte</em>
            </h1>
            <p className="auth-subtitle">
              Accédez à des milliers de sujets d&apos;examen et boostez votre préparation avec l&apos;IA.
            </p>

            <div className="auth-grid-2">
              <div className="auth-form-group-sm">
                <label className="auth-label">
                  Prénom <span className="auth-required">*</span>
                </label>
                <input {...register('prenom')} className="auth-input" placeholder="Jean" />
                {errors.prenom && (
                  <p className="auth-error">{errors.prenom.message}</p>
                )}
              </div>
              <div className="auth-form-group-sm">
                <label className="auth-label">
                  Nom <span className="auth-required">*</span>
                </label>
                <input {...register('nom')} className="auth-input" placeholder="Razafy" />
                {errors.nom && (
                  <p className="auth-error">{errors.nom.message}</p>
                )}
              </div>
            </div>

            <div className="auth-form-group-sm">
              <label className="auth-label">
                Adresse e-mail <span className="auth-required">*</span>
              </label>
              <input {...register('email')} type="email" className="auth-input" placeholder="votre@email.com" />
              {errors.email && (
                <p className="auth-error">{errors.email.message}</p>
              )}
            </div>

            <div className="auth-form-group-sm">
              <label className="auth-label">Établissement</label>
              <input
                {...register('etablissement')}
                className="auth-input"
                placeholder="Université d'Antananarivo…"
              />
            </div>

            <p className="auth-hint-text">
              La filière et l&apos;année d&apos;étude se complètent plus tard depuis votre profil.
            </p>

            <button type="button" onClick={() => goStep(2)} className="auth-submit-btn">
              Continuer →
            </button>

            <div className="auth-footer">
              Déjà un compte ?{' '}
              <Link href="/auth/login" className="auth-footer-link">
                Se connecter
              </Link>
            </div>
          </div>
        )}

        {/* STEP 2: Rôle */}
        {step === 2 && (
          <div className="animate-fade-in">
            <button type="button" onClick={() => goStep(1)} className="auth-back-btn">
              ← Retour
            </button>

            <h1 className="auth-heading">
              Votre <em>rôle</em>
            </h1>
            <p className="auth-subtitle">
              Choisissez comment vous allez utiliser Mah.AI. Vous pourrez changer plus tard.
            </p>

            <div className="auth-role-grid">
              <div
                onClick={() => selectRole('ETUDIANT')}
                className={`auth-role-card ${selectedRole === 'ETUDIANT' ? 'selected' : ''}`}
              >
                <div className="auth-role-icon"><GraduationCap size={24} /></div>
                <div className="auth-role-title">Étudiant</div>
                <div className="auth-role-desc">
                  Accéder aux sujets, s&apos;entraîner et obtenir des corrections IA
                </div>
              </div>
              <div
                onClick={() => selectRole('CONTRIBUTEUR')}
                className={`auth-role-card ${selectedRole === 'CONTRIBUTEUR' ? 'selected' : ''}`}
              >
                <div className="auth-role-icon"><Sparkles size={24} /></div>
                <div className="auth-role-title">Contributeur</div>
                <div className="auth-role-desc">
                  Publier des sujets, gagner des crédits et construire votre réputation
                </div>
              </div>
            </div>

            <button type="button" onClick={() => goStep(3)} className="auth-submit-btn">
              Continuer →
            </button>
          </div>
        )}

        {/* STEP 3: Sécurité */}
        {step === 3 && (
          <div className="animate-fade-in">
            <button type="button" onClick={() => goStep(2)} className="auth-back-btn">
              ← Retour
            </button>

            <h1 className="auth-heading">
              Sécuriser votre <em>compte</em>
            </h1>
            <p className="auth-subtitle">
              Choisissez un mot de passe solide pour protéger vos données.
            </p>

            {/* Password Field */}
            <div className="auth-form-group-sm">
              <label className="auth-label">
                Mot de passe <span className="auth-required">*</span>
              </label>
              <div className="auth-input-wrap">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input auth-input-with-action"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="auth-icon-btn"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="auth-strength-track">
                <div
                  className="auth-strength-fill"
                  style={{
                    width: `${passwordStrength}%`,
                    background: passwordStrength <= 25 ? 'var(--ruby)' : passwordStrength <= 75 ? 'var(--gold)' : 'var(--sage)'
                  }}
                />
              </div>

              <div className="auth-password-hints">
                <span className={`auth-hint ${hasLength ? 'valid' : ''}`}>
                  <span>{hasLength ? '●' : '○'}</span> 8+ caractères
                </span>
                <span className={`auth-hint ${hasUpper ? 'valid' : ''}`}>
                  <span>{hasUpper ? '●' : '○'}</span> Majuscule
                </span>
                <span className={`auth-hint ${hasNumber ? 'valid' : ''}`}>
                  <span>{hasNumber ? '●' : '○'}</span> Chiffre
                </span>
                <span className={`auth-hint ${hasSpecial ? 'valid' : ''}`}>
                  <span>{hasSpecial ? '●' : '○'}</span> Caractère spécial
                </span>
              </div>
              {errors.password && (
                <p className="auth-error">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="auth-form-group-sm">
              <label className="auth-label">
                Confirmer <span className="auth-required">*</span>
              </label>
              <div className="auth-input-wrap">
                <input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="auth-input auth-input-with-action"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="auth-icon-btn"
                  aria-label={showConfirmPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="auth-error">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* CGU Checkbox */}
            <div className="auth-cgu-row">
              <input
                type="checkbox"
                id="cgvCheck"
                checked={cgvChecked}
                onChange={(e) => setCgvChecked(e.target.checked)}
                className="auth-cgu-checkbox"
              />
              <label htmlFor="cgvCheck" className="auth-cgu-label">
                J&apos;accepte les <Link href="/legal/cgu" target="_blank" rel="noopener noreferrer">Conditions Générales d&apos;Utilisation</Link> et la <Link href="/legal/confidentialite" target="_blank" rel="noopener noreferrer">Politique de confidentialité</Link> de Mah.AI
              </label>
            </div>

            {/* Newsletter Checkbox */}
            <div className="auth-cgu-row">
              <input
                {...register('newsletterOptIn')}
                type="checkbox"
                id="newsCheck"
                className="auth-cgu-checkbox"
              />
              <label htmlFor="newsCheck" className="auth-cgu-label">
                Recevoir les actualités, nouveaux sujets et offres Mah.AI
              </label>
            </div>

            <button type="submit" disabled={isSubmitting} className="auth-submit-btn">
              {isSubmitting ? 'Création...' : (<>Créer mon compte <Sparkles size={16} /></>)}
            </button>

            <div className="auth-footer">
              Déjà un compte ?{' '}
              <Link href="/auth/login" className="auth-footer-link">
                Se connecter
              </Link>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
