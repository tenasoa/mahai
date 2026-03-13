'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormData } from '@/lib/validations/auth'
import { loginUser } from '@/actions/auth'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export function LoginForm() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null)
    const result = await loginUser(data)
    if (result?.error) {
      setServerError(result.error)
    }
  }

  if (!mounted) {
    return <div style={{ minHeight: '300px' }} />
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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

      <div className="form-group" style={{ marginBottom: '1.25rem' }}>
        <label className="form-label" style={{ 
          fontFamily: 'var(--mono)', 
          fontSize: '0.62rem', 
          textTransform: 'uppercase', 
          letterSpacing: '0.14em', 
          color: 'var(--text-3)', 
          display: 'block', 
          marginBottom: '0.55rem' 
        }}>
          Adresse e-mail
        </label>
        <div className="form-input-wrap" style={{ position: 'relative' }}>
          <input
            {...register('email')}
            type="email"
            style={{ 
              width: '100%', 
              background: 'var(--surface)', 
              border: '1px solid var(--b2)', 
              borderRadius: 'var(--r)', 
              padding: '0.75rem 1rem', 
              fontFamily: 'var(--body)', 
              fontSize: '0.88rem', 
              color: 'var(--text)', 
              outline: 'none', 
              transition: 'border-color 0.2s, box-shadow 0.2s',
              WebkitAppearance: 'none'
            }}
            placeholder="votre@email.com"
          />
        </div>
        {errors.email && (
          <p style={{ 
            marginTop: '0.5rem', 
            fontSize: '0.6rem', 
            color: 'var(--ruby)', 
            fontFamily: 'var(--mono)', 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em' 
          }}>
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="form-group" style={{ marginBottom: '1.25rem' }}>
        <label className="form-label" style={{ 
          fontFamily: 'var(--mono)', 
          fontSize: '0.62rem', 
          textTransform: 'uppercase', 
          letterSpacing: '0.14em', 
          color: 'var(--text-3)', 
          display: 'block', 
          marginBottom: '0.55rem' 
        }}>
          Mot de passe
        </label>
        <div className="form-input-wrap" style={{ position: 'relative' }}>
          <input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            style={{ 
              width: '100%', 
              background: 'var(--surface)', 
              border: '1px solid var(--b2)', 
              borderRadius: 'var(--r)', 
              padding: '0.75rem 1rem', 
              fontFamily: 'var(--body)', 
              fontSize: '0.88rem', 
              color: 'var(--text)', 
              outline: 'none', 
              transition: 'border-color 0.2s, box-shadow 0.2s',
              WebkitAppearance: 'none'
            }}
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
              cursor: 'none',
              transition: 'color 0.2s'
            }}
          >
            {showPassword ? '🙈' : '👁'}
          </button>
        </div>
        {errors.password && (
          <p style={{ 
            marginTop: '0.5rem', 
            fontSize: '0.6rem', 
            color: 'var(--ruby)', 
            fontFamily: 'var(--mono)', 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em' 
          }}>
            {errors.password.message}
          </p>
        )}
      </div>

      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '1.5rem' 
      }}>
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          cursor: 'none', 
          fontSize: '0.78rem', 
          color: 'var(--text-2)' 
        }}>
          <input 
            type="checkbox" 
            style={{ 
              accentColor: 'var(--gold)', 
              width: '14px', 
              height: '14px',
              cursor: 'none'
            }} 
          />
          Se souvenir de moi
        </label>
        <Link 
          href="/auth/forgot-password" 
          style={{ 
            fontFamily: 'var(--mono)', 
            fontSize: '0.62rem', 
            color: 'var(--gold)', 
            textDecoration: 'none', 
            textTransform: 'uppercase', 
            letterSpacing: '0.1em' 
          }}
        >
          Mot de passe oublié ?
        </Link>
      </div>

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
          cursor: 'none', 
          letterSpacing: '0.04em', 
          transition: 'all 0.25s', 
          marginTop: '0.5rem', 
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
        {isSubmitting ? 'Connexion en cours...' : 'Se connecter →'}
      </button>

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
          gap: '0.65rem'
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

      <div style={{ 
        marginTop: '1.5rem', 
        textAlign: 'center', 
        fontSize: '0.8rem', 
        color: 'var(--text-3)' 
      }}>
        Pas encore de compte ?{' '}
        <Link 
          href="/auth/register"
          style={{ 
            color: 'var(--gold)', 
            textDecoration: 'none', 
            transition: 'color 0.2s' 
          }}
        >
          Créer un compte gratuit →
        </Link>
      </div>
    </form>
  )
}
