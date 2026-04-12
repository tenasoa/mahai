'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormData } from '@/lib/validations/auth'
import { loginUser } from '@/actions/auth'
import { useState, useEffect, useId } from 'react'
import Link from 'next/link'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import { Eye, EyeOff, LogIn } from 'lucide-react'

const fieldLabelStyle = {
  fontFamily: 'var(--mono)',
  fontSize: '0.62rem',
  textTransform: 'uppercase',
  letterSpacing: '0.14em',
  color: 'var(--text-3)',
  display: 'block',
  marginBottom: '0.55rem'
} as const

const fieldInputStyle = {
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
} as const

const fieldErrorStyle = {
  marginTop: '0.5rem',
  fontSize: '0.6rem',
  color: 'var(--ruby)',
  fontFamily: 'var(--mono)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
} as const

const inlineInteractiveStyle = {
  transition: 'color 0.2s, border-color 0.2s, background 0.2s, transform 0.2s, box-shadow 0.2s'
} as const

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { toasts, addToast, removeToast } = useToast()
  const emailFieldId = useId()
  const passwordFieldId = useId()
  const emailErrorId = `${emailFieldId}-error`
  const passwordErrorId = `${passwordFieldId}-error`

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
    const result = await loginUser(data)
    if (result?.error) {
      addToast(result.error, 'error')
    } else {
      addToast('Connexion réussie !', 'success')
    }
  }

  if (!mounted) {
    return <div style={{ minHeight: '300px' }} />
  }

  return (
    <div style={{ position: 'relative' }}>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
          <label htmlFor={emailFieldId} className="form-label" style={fieldLabelStyle}>
            Adresse e-mail
          </label>
          <div className="form-input-wrap" style={{ position: 'relative' }}>
            <input
              id={emailFieldId}
              {...register('email')}
              type="email"
              className="form-input luxury-form-input"
              style={fieldInputStyle}
              placeholder="votre@email.com"
              autoComplete="email"
              aria-invalid={errors.email ? 'true' : 'false'}
              aria-describedby={errors.email ? emailErrorId : undefined}
            />
          </div>
          {errors.email && (
            <p id={emailErrorId} role="alert" style={fieldErrorStyle}>
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
          <label htmlFor={passwordFieldId} className="form-label" style={fieldLabelStyle}>
            Mot de passe
          </label>
          <div className="form-input-wrap" style={{ position: 'relative' }}>
            <input
              id={passwordFieldId}
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              className="form-input luxury-form-input luxury-form-input-with-action"
              style={fieldInputStyle}
              placeholder="••••••••"
              autoComplete="current-password"
              aria-invalid={errors.password ? 'true' : 'false'}
              aria-describedby={errors.password ? passwordErrorId : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="luxury-icon-button"
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              aria-pressed={showPassword}
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                ...inlineInteractiveStyle
              }}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p id={passwordErrorId} role="alert" style={fieldErrorStyle}>
              {errors.password.message}
            </p>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem'
          }}
        >
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'none',
              fontSize: '0.78rem',
              color: 'var(--text-2)'
            }}
          >
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
            className="luxury-inline-link"
            style={{
              fontFamily: 'var(--mono)',
              fontSize: '0.62rem',
              color: 'var(--gold)',
              textDecoration: 'none',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              ...inlineInteractiveStyle
            }}
          >
            Mot de passe oublié ?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="luxury-primary-button"
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
            marginTop: '0.5rem',
            boxShadow: '0 4px 20px rgba(201,168,76,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            ...inlineInteractiveStyle
          }}
        >
          {isSubmitting ? 'Connexion...' : (
            <>
              Se connecter <LogIn className="w-4 h-4" />
            </>
          )}
        </button>

        <div
          style={{
            marginTop: '1.5rem',
            textAlign: 'center',
            fontSize: '0.8rem',
            color: 'var(--text-3)'
          }}
        >
          Pas encore de compte ?{' '}
          <Link
            href="/auth/register"
            className="luxury-inline-link"
            style={{
              color: 'var(--gold)',
              textDecoration: 'none',
              ...inlineInteractiveStyle
            }}
          >
            Créer un compte gratuit →
          </Link>
        </div>
      </form>
    </div>
  )
}
