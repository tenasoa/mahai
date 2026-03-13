"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { verifyEmail } from '@/actions/auth'

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
  const [serverError, setServerError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [verificationToken, setVerificationToken] = useState('')

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
      setServerError(null)

      // For demo, use a demo token
      const token = 'demo-' + Math.random().toString(36).substring(2, 15)
      setVerificationToken(token)
      
      const result = await verifyEmail({ token })
      
      setIsLoading(false)
      
      if (result.error) {
        setServerError(result.error)
        // Show error animation
        for (let i = 0; i < 6; i++) {
          const input = document.getElementById(`otp-${i}`) as HTMLInputElement
          if (input) {
            input.style.borderColor = 'rgba(155, 35, 53, 0.5)'
            setTimeout(() => {
              input.style.borderColor = 'var(--b2)'
            }, 500)
          }
        }
      } else {
        setShowSuccess(true)
        setTimeout(() => {
          onComplete()
        }, 2000)
      }
    }
  }

  const resendCode = () => {
    setOtpCode(['', '', '', '', '', ''])
    setTimer(60)
    setTimerActive(true)
    const firstInput = document.getElementById('otp-0') as HTMLInputElement
    firstInput?.focus()
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
          background: 'var(--sage-dim)',
          border: '1px solid var(--sage-line)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.8rem',
          margin: '0 auto 1.25rem',
          animation: 'popIn 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          ✓
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
          position: 'absolute' as any,
          inset: 0,
          pointerEvents: 'none',
        }}>
          <span style={{
            position: 'absolute' as any,
            fontSize: '0.75rem',
            animation: 'sparkle 2.5s ease-in-out infinite',
            top: '20%',
            left: '20%',
            '--tx': '-20px',
            '--ty': '-30px',
            animationDelay: '0s',
          } as any}>✦</span>
          <span style={{
            position: 'absolute' as any,
            fontSize: '0.75rem',
            animation: 'sparkle 2.5s ease-in-out infinite',
            top: '30%',
            right: '18%',
            '--tx': '22px',
            '--ty': '-28px',
            animationDelay: '0.6s',
          } as any}>✦</span>
          <span style={{
            position: 'absolute' as any,
            fontSize: '0.75rem',
            animation: 'sparkle 2.5s ease-in-out infinite',
            bottom: '25%',
            left: '28%',
            '--tx': '-18px',
            '--ty': '20px',
            animationDelay: '1.1s',
          } as any}>·</span>
          <span style={{
            position: 'absolute' as any,
            fontSize: '0.75rem',
            animation: 'sparkle 2.5s ease-in-out infinite',
            bottom: '20%',
            right: '25%',
            '--tx': '20px',
            '--ty': '18px',
            animationDelay: '1.8s',
          } as any}>✦</span>
          <span style={{
            position: 'absolute' as any,
            fontSize: '0.75rem',
            animation: 'sparkle 2.5s ease-in-out infinite',
            top: '15%',
            left: '48%',
            '--tx': '0',
            '--ty': '-34px',
            animationDelay: '0.35s',
          } as any}>·</span>
        </div>
        <div style={{
          animation: 'envFloat 3s ease-in-out infinite',
        }}>
          <svg style={{
            width: '80px',
            height: '60px',
            filter: 'drop-shadow(0 8px 24px rgba(201,168,76,0.25))',
          }} viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* envelope body */}
            <rect x="2" y="12" width="76" height="46" rx="4" fill="rgba(26,23,20,1)" stroke="rgba(201,168,76,0.45)" strokeWidth="1.5"/>
            {/* envelope flap closed */}
            <path d="M2 16 L40 38 L78 16" stroke="rgba(201,168,76,0.6)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            {/* seal gem */}
            <circle cx="40" cy="36" r="5" fill="rgba(201,168,76,0.15)" stroke="rgba(201,168,76,0.6)" strokeWidth="1"/>
            <circle cx="40" cy="36" r="2.5" fill="rgba(201,168,76,0.9)"/>
            {/* left crease */}
            <line x1="2" y1="58" x2="32" y2="36" stroke="rgba(201,168,76,0.2)" strokeWidth="1"/>
            {/* right crease */}
            <line x1="78" y1="58" x2="48" y2="36" stroke="rgba(201,168,76,0.2)" strokeWidth="1"/>
            {/* top line decoration */}
            <line x1="20" y1="5" x2="60" y2="5" stroke="rgba(201,168,76,0.25)" strokeWidth="1"/>
            <circle cx="40" cy="5" r="2" fill="rgba(201,168,76,0.5)"/>
          </svg>
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
        Un e-mail de confirmation a été envoyé à l'adresse indiquée lors de votre inscription. Cliquez sur le lien pour activer votre compte.
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
        <span style={{ fontSize: '0.9rem', flexShrink: 0 }}>✉</span>
        <span>{email}</span>
      </div>

      {/* Checklist */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--b2)',
        borderRadius: 'var(--r-lg)',
        padding: '0.85rem 1rem',
        marginBottom: '1.75rem',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          padding: '0.45rem 0',
          borderBottom: '1px solid var(--b3)',
          fontSize: '0.82rem',
          color: 'var(--text-2)',
        }}>
          <span style={{
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.65rem',
            flexShrink: 0,
            background: 'var(--sage-dim)',
            border: '1px solid var(--sage-line)',
            color: '#8ECAAC',
          }}>✓</span>
          Compte créé avec succès
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          padding: '0.45rem 0',
          borderBottom: '1px solid var(--b3)',
          fontSize: '0.82rem',
          color: 'var(--text-2)',
        }}>
          <span style={{
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.65rem',
            flexShrink: 0,
            background: 'var(--amber-dim)',
            border: '1px solid var(--amber-line)',
            color: 'var(--amber)',
            animation: 'blink 1.5s ease-in-out infinite',
          }}>⏳</span>
          <span>E-mail de confirmation envoyé · <span style={{ color: 'var(--amber)' }}>En attente de vérification</span></span>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          padding: '0.45rem 0',
          borderBottom: '1px solid var(--b3)',
          fontSize: '0.82rem',
          color: 'var(--text-3)',
        }}>
          <span style={{
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.65rem',
            flexShrink: 0,
            background: 'var(--b2)',
            border: '1px solid var(--b1)',
            color: 'var(--text-4)',
          }}>🔒</span>
          <span>Accès complet au compte · Après vérification</span>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          padding: '0.45rem 0',
          fontSize: '0.82rem',
          color: 'var(--text-3)',
        }}>
          <span style={{
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.65rem',
            flexShrink: 0,
            background: 'var(--b2)',
            border: '1px solid var(--b1)',
            color: 'var(--text-4)',
          }}>🎁</span>
          <span>10 crédits de bienvenue · Après vérification</span>
        </div>
      </div>

      {/* OTP entry */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{
          fontFamily: 'var(--mono)',
          fontSize: '0.6rem',
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
          color: 'var(--text-3)',
          textAlign: 'center',
          marginBottom: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          justifyContent: 'center',
        }}>
          <span style={{ flex: 1, height: '1px', background: 'var(--b1)', maxWidth: '60px' }} />
          Ou entrez le code reçu par e-mail
          <span style={{ flex: 1, height: '1px', background: 'var(--b1)', maxWidth: '60px' }} />
        </div>
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
            Renvoyer le code
          </button>
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
          borderRadius: '0.5rem',
        }}>
          <span>✕</span>
          <p>{serverError}</p>
        </div>
      )}

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

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        margin: '1.25rem 0',
      }}>
        <span style={{ flex: 1, height: '1px', background: 'var(--b1)' }} />
        <span style={{
          fontFamily: 'var(--mono)',
          fontSize: '0.58rem',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: 'var(--text-4)',
        }}>ou</span>
        <span style={{ flex: 1, height: '1px', background: 'var(--b1)' }} />
      </div>

      <button
        onClick={() => window.open('https://gmail.com')}
        style={{
          width: '100%',
          fontFamily: 'var(--body)',
          fontSize: '0.85rem',
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
          gap: '0.55rem',
        }}
      >
        <svg width="18" height="13" viewBox="0 0 18 13" fill="none">
          <path d="M1 1h16M1 1v11a1 1 0 001 1h14a1 1 0 001-1V1M1 1l8 6 8-6" stroke="var(--gold)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Ouvrir ma boîte Gmail
      </button>
      <button
        onClick={() => window.open('https://outlook.com')}
        style={{
          width: '100%',
          fontFamily: 'var(--body)',
          fontSize: '0.85rem',
          padding: '0.75rem',
          borderRadius: 'var(--r)',
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.06)',
          color: 'rgba(240,235,227,0.3)',
          cursor: 'none',
          letterSpacing: '0.04em',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.55rem',
          marginTop: '0.5rem',
        }}
      >
        <svg width="18" height="13" viewBox="0 0 18 13" fill="none">
          <path d="M1 1h16M1 1v11a1 1 0 001 1h14a1 1 0 001-1V1M1 1l8 6 8-6" stroke="rgba(240,235,227,0.3)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Ouvrir Outlook
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
          ← Mauvaise adresse ? Recommencer l'inscription
        </Link>
      </div>
    </div>
  )
}
