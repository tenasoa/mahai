"use client"

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { requestPasswordReset, resetPassword } from '@/actions/auth'
import { forgotPasswordSchema, resetPasswordSchema } from '@/lib/validations/auth'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import Link from 'next/link'
import { KeyRound, Mail, Lock, CheckCircle2 } from 'lucide-react'

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

  const getStepCircleStyle = (stepNum: number) => {
    if (stepNum < step) {
      return {
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--mono)',
        fontSize: '0.6rem',
        fontWeight: 500,
        border: '1px solid var(--sage)',
        color: '#fff',
        background: 'var(--sage)',
        transition: 'all 0.4s',
        position: 'relative',
        zIndex: 1,
      } as any
    }
    if (stepNum === step) {
      return {
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--mono)',
        fontSize: '0.6rem',
        fontWeight: 500,
        border: '1px solid var(--gold)',
        color: 'var(--void)',
        background: 'var(--gold)',
        boxShadow: '0 0 14px var(--gold-glow)',
        transition: 'all 0.4s',
        position: 'relative',
        zIndex: 1,
      } as any
    }
    return {
      width: '28px',
      height: '28px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--mono)',
      fontSize: '0.6rem',
      fontWeight: 500,
      border: '1px solid var(--b1)',
      color: 'var(--text-4)',
      background: 'var(--void)',
      transition: 'all 0.4s',
      position: 'relative',
      zIndex: 1,
    } as any
  }

  if (!mounted) {
    return <div style={{ minHeight: '400px' }} />
  }

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <div>
        {/* Steps */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0,
          marginBottom: '2rem',
          animation: 'fadeUp 0.5s 0.1s ease both',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
            <div style={getStepCircleStyle(1)}>
              {step > 1 ? '✓' : '1'}
            </div>
            <div style={{
              fontFamily: 'var(--mono)',
              fontSize: '0.55rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: step > 1 ? 'var(--sage)' : step === 1 ? 'var(--gold)' : 'var(--text-4)',
              marginTop: '0.35rem',
              whiteSpace: 'nowrap',
            }}>
              Email
            </div>
          </div>
          <div style={{
            width: '48px',
            height: '1px',
            background: step > 1 ? 'var(--sage)' : 'var(--b1)',
            margin: '0 -1px',
            flexShrink: 0,
            position: 'relative',
            overflow: 'hidden',
            top: '-7px',
          }}>
            <div style={{
              height: '100%',
              width: step > 1 ? '100%' : '0%',
              background: step > 1 ? 'var(--sage)' : 'var(--gold)',
              transition: 'width 0.6s ease',
            }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
            <div style={getStepCircleStyle(2)}>
              {step > 2 ? '✓' : '2'}
            </div>
            <div style={{
              fontFamily: 'var(--mono)',
              fontSize: '0.55rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: step > 2 ? 'var(--sage)' : step === 2 ? 'var(--gold)' : 'var(--text-4)',
              marginTop: '0.35rem',
              whiteSpace: 'nowrap',
            }}>
              Code
            </div>
          </div>
          <div style={{
            width: '48px',
            height: '1px',
            background: step > 2 ? 'var(--sage)' : 'var(--b1)',
            margin: '0 -1px',
            flexShrink: 0,
            position: 'relative',
            overflow: 'hidden',
            top: '-7px',
          }}>
            <div style={{
              height: '100%',
              width: step > 2 ? '100%' : '0%',
              background: step > 2 ? 'var(--sage)' : 'var(--gold)',
              transition: 'width 0.6s ease',
            }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
            <div style={getStepCircleStyle(3)}>
              3
            </div>
            <div style={{
              fontFamily: 'var(--mono)',
              fontSize: '0.55rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: step === 3 ? 'var(--gold)' : 'var(--text-4)',
              marginTop: '0.35rem',
              whiteSpace: 'nowrap',
            }}>
              Nouveau mdp
            </div>
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--b1)',
          borderRadius: 'var(--r-lg)',
          padding: '2.25rem',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          animation: 'fadeUp 0.5s 0.15s ease both',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
            opacity: 0.5,
          }} />

          {/* Step 1: Email */}
          {step === 1 && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <Mail className="w-10 h-10 text-[#FFD166] mx-auto opacity-80" strokeWidth={1.5} />
              </div>
              <h1 style={{
                fontFamily: 'var(--display)',
                fontSize: '1.9rem',
                fontWeight: 400,
                letterSpacing: '-0.02em',
                color: 'var(--text)',
                textAlign: 'center',
                marginBottom: '0.4rem',
              }}>
                Mot de passe <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>oublié</em> ?
              </h1>
              <p style={{
                fontSize: '0.82rem',
                color: 'var(--text-3)',
                textAlign: 'center',
                lineHeight: 1.65,
                marginBottom: '1.75rem',
              }}>
                Saisissez l'adresse e-mail associée à votre compte. Nous vous enverrons un code de vérification à 6 chiffres.
              </p>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{
                  fontFamily: 'var(--mono)',
                  fontSize: '0.6rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.14em',
                  color: 'var(--text-3)',
                  display: 'block',
                  marginBottom: '0.5rem',
                }}>
                  Adresse e-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  style={{
                    width: '100%',
                    background: 'var(--surface)',
                    border: email && !validateEmail() ? '1px solid var(--ruby-line)' : '1px solid var(--b2)',
                    borderRadius: 'var(--r)',
                    padding: '0.72rem 1rem',
                    fontFamily: 'var(--body)',
                    fontSize: '0.88rem',
                    color: 'var(--text)',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                />
                {email && !validateEmail() && (
                  <p style={{
                    fontFamily: 'var(--mono)',
                    fontSize: '0.6rem',
                    color: '#E06070',
                    marginTop: '0.4rem',
                  }}>
                    Adresse e-mail invalide.
                  </p>
                )}
              </div>
              <button
                onClick={goToStep2}
                disabled={!validateEmail() || isLoading}
                style={{
                  width: '100%',
                  fontFamily: 'var(--body)',
                  fontSize: '0.88rem',
                  fontWeight: 500,
                  padding: '0.85rem',
                  borderRadius: 'var(--r)',
                  background: validateEmail() && !isLoading ? 'linear-gradient(135deg, var(--gold), var(--gold-hi))' : 'var(--b2)',
                  color: validateEmail() && !isLoading ? 'var(--void)' : 'var(--text-4)',
                  border: 'none',
                  cursor: validateEmail() && !isLoading ? 'none' : 'not-allowed',
                  letterSpacing: '0.04em',
                  transition: 'all 0.25s',
                  marginTop: '0.25rem',
                  boxShadow: validateEmail() && !isLoading ? '0 4px 20px rgba(201,168,76,0.2)' : 'none',
                }}
              >
                {isLoading ? 'Envoi en cours...' : 'Envoyer le code →'}
              </button>
            </div>
          )}

          {/* Step 2: OTP */}
          {step === 2 && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <Lock className="w-10 h-10 text-[#FFD166] mx-auto opacity-80" strokeWidth={1.5} />
              </div>
              <h1 style={{
                fontFamily: 'var(--display)',
                fontSize: '1.9rem',
                fontWeight: 400,
                letterSpacing: '-0.02em',
                color: 'var(--text)',
                textAlign: 'center',
                marginBottom: '0.4rem',
              }}>
                Vérifiez <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>votre boîte</em>
              </h1>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                background: 'var(--gold-dim)',
                border: '1px solid var(--gold-line)',
                borderRadius: 'var(--r)',
                padding: '0.3rem 0.85rem',
                fontFamily: 'var(--mono)',
                fontSize: '0.68rem',
                color: 'var(--gold)',
                margin: '0 auto 0.25rem',
              }}>
                <Mail className="w-3 h-3" /> {email}
              </div>
              <p style={{
                fontSize: '0.82rem',
                color: 'var(--text-3)',
                textAlign: 'center',
                lineHeight: 1.65,
                marginTop: '0.75rem',
                marginBottom: '1.75rem',
              }}>
                Un code à 6 chiffres a été envoyé. Vérifiez aussi vos spams si vous ne le voyez pas dans les 2 minutes.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', margin: '0.25rem 0' }}>
                {otpCode.slice(0, 6).map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    inputMode="numeric"
                    value={digit}
                    onChange={(e) => handleOtpInput(e.target.value, index)}
                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                    style={{
                      width: '44px',
                      height: '52px',
                      textAlign: 'center',
                      fontFamily: 'var(--mono)',
                      fontSize: '1.3rem',
                      fontWeight: 500,
                      color: digit ? 'var(--gold)' : 'var(--text)',
                      background: 'var(--surface)',
                      border: digit ? '1px solid var(--gold)' : '1px solid var(--b2)',
                      borderRadius: 'var(--r)',
                      outline: 'none',
                      transition: 'all 0.2s',
                    }}
                  />
                ))}
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '1rem',
                fontFamily: 'var(--mono)',
                fontSize: '0.62rem',
                color: 'var(--text-3)',
              }}>
                <span>Pas reçu ?</span>
                <button
                  onClick={resendCode}
                  disabled={timerActive}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: timerActive ? 'var(--text-4)' : 'var(--gold)',
                    cursor: timerActive ? 'not-allowed' : 'none',
                    fontFamily: 'var(--mono)',
                    fontSize: '0.62rem',
                    transition: 'color 0.2s',
                    padding: 0,
                  }}
                >
                  Renvoyer ({timerActive ? `${timer}s` : 'le code'})
                </button>
              </div>
              <button
                onClick={goToStep3}
                disabled={otpCode.join('').length < 6}
                style={{
                  width: '100%',
                  fontFamily: 'var(--body)',
                  fontSize: '0.88rem',
                  fontWeight: 500,
                  padding: '0.85rem',
                  borderRadius: 'var(--r)',
                  background: otpCode.join('').length === 6 ? 'linear-gradient(135deg, var(--gold), var(--gold-hi))' : 'var(--b2)',
                  color: otpCode.join('').length === 6 ? 'var(--void)' : 'var(--text-4)',
                  border: 'none',
                  cursor: otpCode.join('').length === 6 ? 'none' : 'not-allowed',
                  letterSpacing: '0.04em',
                  transition: 'all 0.25s',
                  marginTop: '1.25rem',
                  boxShadow: otpCode.join('').length === 6 ? '0 4px 20px rgba(201,168,76,0.2)' : 'none',
                }}
              >
                Vérifier le code →
              </button>
            </div>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <KeyRound className="w-10 h-10 text-[#FFD166] mx-auto opacity-80" strokeWidth={1.5} />
              </div>
              <h1 style={{
                fontFamily: 'var(--display)',
                fontSize: '1.9rem',
                fontWeight: 400,
                letterSpacing: '-0.02em',
                color: 'var(--text)',
                textAlign: 'center',
                marginBottom: '0.4rem',
              }}>
                Nouveau <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>mot de passe</em>
              </h1>
              <p style={{
                fontSize: '0.82rem',
                color: 'var(--text-3)',
                textAlign: 'center',
                lineHeight: 1.65,
                marginBottom: '1.75rem',
              }}>
                Choisissez un mot de passe fort d'au moins 8 caractères, avec des majuscules, chiffres et symboles.
              </p>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{
                  fontFamily: 'var(--mono)',
                  fontSize: '0.6rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.14em',
                  color: 'var(--text-3)',
                  display: 'block',
                  marginBottom: '0.5rem',
                }}>
                  Nouveau mot de passe
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 caractères"
                    style={{
                      width: '100%',
                      background: 'var(--surface)',
                      border: '1px solid var(--b2)',
                      borderRadius: 'var(--r)',
                      padding: '0.72rem 1rem',
                      paddingRight: '2.75rem',
                      fontFamily: 'var(--body)',
                      fontSize: '0.88rem',
                      color: 'var(--text)',
                      outline: 'none',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.85rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-3)',
                      cursor: 'none',
                      fontSize: '0.9rem',
                      padding: 0,
                      transition: 'color 0.2s',
                    }}
                  >
                    {showPassword ? '🙈' : '👁'}
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '3px', marginTop: '0.45rem' }}>
                  {[1, 2, 3, 4].map((i) => {
                    const strength = checkPasswordStrength()
                    const colors = ['var(--ruby)', 'var(--amber)', 'var(--sage)', 'var(--gold)']
                    return (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          height: '3px',
                          borderRadius: '2px',
                          background: i <= strength ? colors[strength - 1] : 'var(--b2)',
                          transition: 'background 0.3s',
                        }}
                      />
                    )
                  })}
                </div>
                <div style={{
                  fontFamily: 'var(--mono)',
                  fontSize: '0.58rem',
                  color: password ? (checkPasswordStrength() === 1 ? '#E06070' : checkPasswordStrength() === 2 ? 'var(--amber)' : checkPasswordStrength() === 3 ? '#8ECAAC' : 'var(--gold)') : 'var(--text-3)',
                  marginTop: '0.3rem',
                  textAlign: 'right',
                  transition: 'color 0.3s',
                }}>
                  {password ? (checkPasswordStrength() === 1 ? 'Faible' : checkPasswordStrength() === 2 ? 'Moyen' : checkPasswordStrength() === 3 ? 'Fort' : 'Très fort') : '—'}
                </div>
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{
                  fontFamily: 'var(--mono)',
                  fontSize: '0.6rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.14em',
                  color: 'var(--text-3)',
                  display: 'block',
                  marginBottom: '0.5rem',
                }}>
                  Confirmer le mot de passe
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Répétez le mot de passe"
                    style={{
                      width: '100%',
                      background: passwordsMatch ? 'var(--surface)' : confirmPassword ? 'rgba(155,35,53,0.05)' : 'var(--surface)',
                      border: passwordsMatch ? '1px solid var(--sage-line)' : confirmPassword ? '1px solid var(--ruby-line)' : '1px solid var(--b2)',
                      borderRadius: 'var(--r)',
                      padding: '0.72rem 1rem',
                      paddingRight: '2.75rem',
                      fontFamily: 'var(--body)',
                      fontSize: '0.88rem',
                      color: 'var(--text)',
                      outline: 'none',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.85rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-3)',
                      cursor: 'none',
                      fontSize: '0.9rem',
                      padding: 0,
                      transition: 'color 0.2s',
                    }}
                  >
                    {showConfirmPassword ? '🙈' : '👁'}
                  </button>
                </div>
                {confirmPassword && !passwordsMatch && (
                  <p style={{
                    fontFamily: 'var(--mono)',
                    fontSize: '0.6rem',
                    color: '#E06070',
                    marginTop: '0.4rem',
                  }}>
                    Les mots de passe ne correspondent pas.
                  </p>
                )}
                {passwordsMatch && (
                  <p style={{
                    fontFamily: 'var(--mono)',
                    fontSize: '0.6rem',
                    color: '#8ECAAC',
                    marginTop: '0.4rem',
                  }}>
                    ✓ Les mots de passe correspondent
                  </p>
                )}
              </div>
              <button
                onClick={handleResetPassword}
                disabled={!(password.length >= 8 && passwordsMatch) || isLoading}
                style={{
                  width: '100%',
                  fontFamily: 'var(--body)',
                  fontSize: '0.88rem',
                  fontWeight: 500,
                  padding: '0.85rem',
                  borderRadius: 'var(--r)',
                  background: password.length >= 8 && passwordsMatch && !isLoading ? 'linear-gradient(135deg, var(--gold), var(--gold-hi))' : 'var(--b2)',
                  color: password.length >= 8 && passwordsMatch && !isLoading ? 'var(--void)' : 'var(--text-4)',
                  border: 'none',
                  cursor: password.length >= 8 && passwordsMatch && !isLoading ? 'none' : 'not-allowed',
                  letterSpacing: '0.04em',
                  transition: 'all 0.25s',
                  marginTop: '0.25rem',
                  boxShadow: password.length >= 8 && passwordsMatch && !isLoading ? '0 4px 20px rgba(201,168,76,0.2)' : 'none',
                }}
              >
                {isLoading ? 'Réinitialisation...' : 'Réinitialiser →'}
              </button>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div style={{ textAlign: 'center', padding: '0.5rem 0', animation: 'popIn 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'rgba(0, 255, 136, 0.1)',
                border: '1px solid rgba(0, 255, 136, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}>
                <CheckCircle2 className="w-8 h-8 text-[#00FF88]" />
              </div>
              <h1 style={{
                fontFamily: 'var(--display)',
                fontSize: '2rem',
                color: 'var(--text)',
                letterSpacing: '-0.03em',
                marginBottom: '0.4rem',
              }}>
                Mot de passe <em style={{ fontStyle: 'italic', color: 'var(--sage)' }}>réinitialisé</em>
              </h1>
              <p style={{
                fontSize: '0.85rem',
                color: 'var(--text-2)',
                lineHeight: 1.7,
                marginBottom: '1.75rem',
                maxWidth: '300px',
                margin: '0 auto 1.75rem',
              }}>
                Votre mot de passe a bien été mis à jour. Vous pouvez maintenant vous connecter avec vos nouveaux identifiants.
              </p>
              <button
                onClick={() => window.location.href = '/auth/login'}
                style={{
                  width: '100%',
                  fontFamily: 'var(--body)',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  padding: '0.85rem',
                  borderRadius: 'var(--r)',
                  background: 'linear-gradient(135deg, var(--gold), var(--gold-hi))',
                  color: 'var(--void)',
                  border: 'none',
                  cursor: 'none',
                  letterSpacing: '0.04em',
                  transition: 'all 0.25s',
                  boxShadow: '0 4px 20px rgba(201,168,76,0.2)',
                }}
              >
                Se connecter →
              </button>
            </div>
          )}
        </div>

        {/* Back link */}
        <Link
          href="/auth/login"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            fontFamily: 'var(--mono)',
            fontSize: '0.62rem',
            color: 'var(--text-3)',
            textDecoration: 'none',
            cursor: 'none',
            transition: 'color 0.2s',
            marginTop: '1.25rem',
          }}
        >
          ← Retour à la connexion
        </Link>
      </div>
    </>
  )
}
