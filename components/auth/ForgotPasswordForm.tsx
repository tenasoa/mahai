"use client"

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { requestPasswordReset, resetPassword } from '@/actions/auth'
import { forgotPasswordSchema, resetPasswordSchema } from '@/lib/validations/auth'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import Link from 'next/link'
import { KeyRound, Mail, Lock, CheckCircle2, Eye, EyeOff, Check } from 'lucide-react'
import './auth-forms.css'

type Step = 1 | 2 | 3 | 4

interface ForgotPasswordFormProps {
  onComplete: () => void
}

export function ForgotPasswordForm({ onComplete }: ForgotPasswordFormProps) {
  const [step, setStep] = useState<Step>(1)
  const [email, setEmail] = useState('')
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', ''])
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [timer, setTimer] = useState(60)
  const [timerActive, setTimerActive] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [resetToken, setResetToken] = useState('')
  const { toasts, addToast, removeToast } = useToast()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (timerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setTimerActive(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timerActive, timer])

  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const checkPasswordStrength = () => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return strength
  }

  const passwordsMatch = password && confirmPassword && password === confirmPassword

  const handleOtpInput = (value: string, index: number) => {
    const newOtp = [...otpCode]
    newOtp[index] = value.replace(/[^0-9]/g, '').slice(-1)
    setOtpCode(newOtp)
    
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement
      nextInput?.focus()
    }
  }

  const handleOtpKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`) as HTMLInputElement
      prevInput?.focus()
    }
  }

  const goToStep2 = async () => {
    if (!validateEmail()) return
    
    setIsLoading(true)

    const result = await requestPasswordReset({ email })
    
    setIsLoading(false)
    
    if (result.error) {
      addToast(result.error, 'error')
    } else {
      addToast(result.success || 'Code envoyé avec succès', 'success')
      setStep(2)
      setTimerActive(true)
      setTimeout(() => {
        const firstInput = document.getElementById('otp-0') as HTMLInputElement
        firstInput?.focus()
      }, 100)
    }
  }

  const goToStep3 = () => {
    const code = otpCode.join('')
    
    if (code.length === 6) {
      setStep(3)
      setTimerActive(false)
      setResetToken(code)
    }
  }

  const handleResetPassword = async () => {
    setIsLoading(true)
    
    try {
      const result = await resetPassword({
        token: resetToken,
        password,
        confirmPassword,
      })
      if (result.error) {
        addToast(result.error, 'error')
      } else {
        setStep(4)
        addToast('Mot de passe réinitialisé avec succès !', 'success')
        setTimeout(() => {
          onComplete()
        }, 2500)
      }
    } catch (error) {
      addToast('Erreur lors de la réinitialisation', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const resendCode = async () => {
    setIsLoading(true)
    
    try {
      const result = await requestPasswordReset({ email })
      if (result.error) {
        addToast(result.error, 'error')
      } else {
        setOtpCode(['', '', '', '', '', ''])
        setTimer(60)
        setTimerActive(true)
        addToast('Nouveau code envoyé !', 'success')
        const firstInput = document.getElementById('otp-0') as HTMLInputElement
        firstInput?.focus()
      }
    } catch (error) {
      addToast('Erreur lors de l\'envoi du code', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const getStepState = (stepNum: number) => {
    if (stepNum < step) return 'completed'
    if (stepNum === step) return 'active'
    return 'pending'
  }

  if (!mounted) {
    return <div className="auth-skeleton-tall" />
  }

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <div>
        {/* Steps */}
        <div className="auth-stepper-sm auth-animate-up">
          <div className="auth-step-sm">
            <div className={`auth-step-circle-sm ${getStepState(1)}`}>
              {step > 1 ? '✓' : '1'}
            </div>
            <div className={`auth-step-label-sm ${getStepState(1)}`}>Email</div>
          </div>
          <div className={`auth-step-line-sm ${step > 1 ? 'active' : ''}`} />
          <div className="auth-step-sm">
            <div className={`auth-step-circle-sm ${getStepState(2)}`}>
              {step > 2 ? '✓' : '2'}
            </div>
            <div className={`auth-step-label-sm ${getStepState(2)}`}>Code</div>
          </div>
          <div className={`auth-step-line-sm ${step > 2 ? 'active' : ''}`} />
          <div className="auth-step-sm">
            <div className={`auth-step-circle-sm ${getStepState(3)}`}>3</div>
            <div className={`auth-step-label-sm ${getStepState(3)}`}>Nouveau mdp</div>
          </div>
        </div>

        {/* Card */}
        <div className="auth-card auth-animate-up-delay">
          <div className="auth-card-line" />

          {/* Step 1: Email */}
          {step === 1 && (
            <div className="animate-fade-in">
              <div className="auth-step-icon">
                <Mail size={40} strokeWidth={1.5} />
              </div>
              <h1 className="auth-heading-centered">
                Mot de passe <em>oublié</em> ?
              </h1>
              <p className="auth-subtitle-centered">
                Saisissez l'adresse e-mail associée à votre compte. Nous vous enverrons un code de vérification à 6 chiffres.
              </p>

              <div className="auth-form-group">
                <label className="auth-label">Adresse e-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="auth-input"
                  style={email && !validateEmail() ? { borderColor: 'var(--ruby-line)' } : undefined}
                  aria-invalid={email && !validateEmail() ? 'true' : 'false'}
                />
                {email && !validateEmail() && (
                  <p className="auth-error">Adresse e-mail invalide.</p>
                )}
              </div>
              <button
                onClick={goToStep2}
                disabled={!validateEmail() || isLoading}
                className="auth-submit-btn auth-submit-btn-mt-sm"
              >
                {isLoading ? 'Envoi en cours...' : 'Envoyer le code →'}
              </button>
            </div>
          )}

          {/* Step 2: OTP */}
          {step === 2 && (
            <div className="animate-fade-in">
              <div className="auth-step-icon">
                <Lock size={40} strokeWidth={1.5} />
              </div>
              <h1 className="auth-heading-centered">
                Vérifiez <em>votre boîte</em>
              </h1>
              <div className="auth-email-badge">
                <Mail size={12} /> {email}
              </div>
              <p className="auth-subtitle-centered-mt">
                Un code à 6 chiffres a été envoyé. Vérifiez aussi vos spams si vous ne le voyez pas dans les 2 minutes.
              </p>
              <div className="auth-otp-row">
                {otpCode.slice(0, 6).map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    inputMode="numeric"
                    aria-label={`Chiffre ${index + 1} du code`}
                    value={digit}
                    onChange={(e) => handleOtpInput(e.target.value, index)}
                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                    className={`auth-otp-input${digit ? ' filled' : ''}`}
                  />
                ))}
              </div>
              <div className="auth-resend-row">
                <span>Pas reçu ?</span>
                <button onClick={resendCode} disabled={timerActive} className="auth-resend-btn">
                  Renvoyer ({timerActive ? `${timer}s` : 'le code'})
                </button>
              </div>
              <button
                onClick={goToStep3}
                disabled={otpCode.join('').length < 6}
                className={`auth-submit-btn-conditional${otpCode.join('').length === 6 ? ' enabled' : ''}`}
              >
                Vérifier le code →
              </button>
            </div>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (() => {
            const strength = checkPasswordStrength()
            const strengthColors = ['var(--ruby)', 'var(--amber)', 'var(--sage)', 'var(--gold)']
            const strengthLabels = ['Faible', 'Moyen', 'Fort', 'Très fort']
            const canSubmit = password.length >= 8 && passwordsMatch && !isLoading
            return (
            <div className="animate-fade-in">
              <div className="auth-step-icon">
                <KeyRound size={40} strokeWidth={1.5} />
              </div>
              <h1 className="auth-heading-centered">
                Nouveau <em>mot de passe</em>
              </h1>
              <p className="auth-subtitle-centered">
                Choisissez un mot de passe fort d'au moins 8 caractères, avec des majuscules, chiffres et symboles.
              </p>

              <div className="auth-form-group-sm">
                <label className="auth-label">Nouveau mot de passe</label>
                <div className="auth-input-wrap">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 caractères"
                    className="auth-input auth-input-with-action"
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
                <div className="auth-strength-row">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="auth-strength-segment"
                      style={{ background: i <= strength ? strengthColors[strength - 1] : undefined }}
                    />
                  ))}
                </div>
                <div className="auth-strength-label" style={{ color: password ? strengthColors[strength - 1] || 'var(--text-3)' : undefined }}>
                  {password ? strengthLabels[strength - 1] || '—' : '—'}
                </div>
              </div>

              <div className="auth-form-group-sm">
                <label className="auth-label">Confirmer le mot de passe</label>
                <div className="auth-input-wrap">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Répétez le mot de passe"
                    className="auth-input auth-input-with-action"
                    style={{
                      background: passwordsMatch ? undefined : confirmPassword ? 'var(--ruby-dim)' : undefined,
                      borderColor: passwordsMatch ? 'var(--sage-line)' : confirmPassword ? 'var(--ruby-line)' : undefined,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="auth-icon-btn"
                    aria-label={showConfirmPassword ? 'Masquer la confirmation' : 'Afficher la confirmation'}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {confirmPassword && !passwordsMatch && (
                  <p className="auth-match-error">Les mots de passe ne correspondent pas.</p>
                )}
                {passwordsMatch && (
                  <p className="auth-match-ok">
                    <Check size={12} className="auth-check-inline" /> Les mots de passe correspondent
                  </p>
                )}
              </div>

              <button
                onClick={handleResetPassword}
                disabled={!canSubmit}
                className={`auth-submit-btn-conditional auth-submit-btn-mt-sm${canSubmit ? ' enabled' : ''}`}
              >
                {isLoading ? 'Réinitialisation...' : 'Réinitialiser →'}
              </button>
            </div>
            )
          })()}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="auth-success-wrap">
              <div className="auth-success-icon">
                <CheckCircle2 size={32} />
              </div>
              <h1 className="auth-success-heading">
                Mot de passe <em>réinitialisé</em>
              </h1>
              <p className="auth-success-text">
                Votre mot de passe a bien été mis à jour. Vous pouvez maintenant vous connecter avec vos nouveaux identifiants.
              </p>
              <button
                onClick={() => window.location.href = '/auth/login'}
                className="auth-submit-btn"
              >
                Se connecter →
              </button>
            </div>
          )}
        </div>

        {/* Back link */}
        <Link href="/auth/login" className="auth-back-link">
          ← Retour à la connexion
        </Link>
      </div>
    </>
  )
}
