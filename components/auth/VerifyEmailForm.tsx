"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { verifyEmail, resendVerificationEmail } from '@/actions/auth'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import { CheckCircle2, AlertCircle, Info, Mail, ArrowRight } from 'lucide-react'

interface VerifyEmailFormProps {
  email?: string
  onComplete: () => void
}

export function VerifyEmailForm({ email = 'herizo.r@gmail.com', onComplete }: VerifyEmailFormProps) {
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', ''])
  const [showSuccess, setShowSuccess] = useState(false)
  const [timer, setTimer] = useState(60)
  const [timerActive, setTimerActive] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
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

  const verifyCode = async () => {
    const code = otpCode.join('')
    if (code.length === 6 && code !== '000000') {
      setIsLoading(true)
      
      const result = await verifyEmail({ token: code })
      
      setIsLoading(false)
      
      if (result.error) {
        addToast(result.error, 'error')
        // Show error animation
        for (let i = 0; i < 6; i++) {
          const input = document.getElementById(`otp-${i}`) as HTMLInputElement
          if (input) {
            input.style.borderColor = 'rgba(255, 107, 157, 0.5)'
            setTimeout(() => {
              input.style.borderColor = 'var(--b2)'
            }, 500)
          }
        }
      } else {
        setShowSuccess(true)
        addToast('Email vérifié avec succès !', 'success')
        setTimeout(() => {
          onComplete()
        }, 2000)
      }
    }
  }

  const resendCode = async () => {
    setIsLoading(true)
    
    try {
      const result = await resendVerificationEmail(email)
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

  if (!mounted) {
    return <div style={{ minHeight: '400px' }} />
  }

  if (showSuccess) {
    return (
      <div style={{ textAlign: 'center', animation: 'fadeUp 0.4s ease' }}>
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
          animation: 'popIn 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
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
          E-mail <em style={{ fontStyle: 'italic', color: '#8ECAAC' }}>vérifié</em> !
        </h1>
        <p style={{
          fontSize: '0.85rem',
          color: 'var(--text-2)',
          lineHeight: 1.7,
          marginBottom: '1.75rem',
        }}>
          Votre compte est maintenant actif. 10 crédits de bienvenue ont été ajoutés à votre portefeuille.
        </p>
        <div style={{
          background: 'var(--gold-dim)',
          border: '1px solid var(--gold-line)',
          borderRadius: 'var(--r-lg)',
          padding: '0.85rem 1rem',
          fontFamily: 'var(--mono)',
          fontSize: '0.68rem',
          color: 'var(--gold)',
          textAlign: 'center',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.55rem',
        }}>
          🎁 10 crédits de bienvenue ajoutés à votre compte
        </div>
        <button
          onClick={() => window.location.href = '/auth/role-selection'}
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
          Configurer mon profil →
        </button>
      </div>
    )
  }

  return (
    <div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      {/* Envelope animation */}
      <div style={{
        width: '100%',
        height: '120px',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.5rem',
      }}>
        <div style={{
          animation: 'envFloat 3s ease-in-out infinite',
        }}>
          <Mail className="w-16 h-16 text-[#FFD166] opacity-80" strokeWidth={1.5} />
        </div>
      </div>

      <h1 style={{
        fontFamily: 'var(--display)',
        fontSize: '1.95rem',
        fontWeight: 400,
        letterSpacing: '-0.02em',
        color: 'var(--text)',
        textAlign: 'center',
        marginBottom: '0.4rem',
        lineHeight: 1.1,
      }}>
        Vérifiez votre <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>boîte mail</em>
      </h1>
      <p style={{
        fontSize: '0.85rem',
        color: 'var(--text-3)',
        textAlign: 'center',
        lineHeight: 1.7,
        marginBottom: '1.75rem',
      }}>
        Un e-mail de confirmation a été envoyé à l'adresse indiquée. Entrez le code à 6 chiffres pour continuer.
      </p>

      {/* Email pill */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.45rem',
        background: 'var(--gold-dim)',
        border: '1px solid var(--gold-line)',
        borderRadius: 'var(--r-lg)',
        padding: '0.55rem 1.1rem',
        fontFamily: 'var(--mono)',
        fontSize: '0.72rem',
        color: 'var(--gold)',
        marginBottom: '1.75rem',
        wordBreak: 'break-all',
      }}>
        <Mail className="w-3 h-3" />
        <span>{email}</span>
      </div>

      {/* OTP entry */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          {otpCode.map((digit, index) => (
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
            Renvoyer {timerActive ? `(${timer}s)` : ''}
          </button>
        </div>
      </div>

      <button
        onClick={verifyCode}
        disabled={otpCode.join('').length < 6 || isLoading}
        style={{
          width: '100%',
          fontFamily: 'var(--body)',
          fontSize: '0.9rem',
          fontWeight: 500,
          padding: '0.85rem',
          borderRadius: 'var(--r)',
          background: otpCode.join('').length === 6 && !isLoading ? 'linear-gradient(135deg, var(--gold), var(--gold-hi))' : 'var(--b2)',
          color: otpCode.join('').length === 6 && !isLoading ? 'var(--void)' : 'var(--text-4)',
          border: 'none',
          cursor: otpCode.join('').length === 6 && !isLoading ? 'none' : 'not-allowed',
          letterSpacing: '0.04em',
          transition: 'all 0.25s',
          boxShadow: otpCode.join('').length === 6 && !isLoading ? '0 4px 20px rgba(201,168,76,0.2)' : 'none',
        }}
      >
        {isLoading ? 'Vérification...' : 'Confirmer mon compte →'}
      </button>

      <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        <Link
          href="/auth/register"
          style={{
            fontFamily: 'var(--mono)',
            fontSize: '0.62rem',
            color: 'var(--text-3)',
            textDecoration: 'none',
            transition: 'color 0.2s',
            cursor: 'none',
          }}
        >
          ← Mauvaise adresse ? Recommencer
        </Link>
      </div>
    </div>
  )
}
