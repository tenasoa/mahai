'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormData } from '@/lib/validations/auth'
import { loginUser } from '@/actions/auth'
import { useState, useEffect, useId } from 'react'
import Link from 'next/link'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import './auth-forms.css'

const REMEMBER_ME_KEY = 'mahai_remember_email'

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { toasts, addToast, removeToast } = useToast()
  const emailFieldId = useId()
  const passwordFieldId = useId()
  const emailErrorId = `${emailFieldId}-error`
  const passwordErrorId = `${passwordFieldId}-error`

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  // Load saved email on mount
  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem(REMEMBER_ME_KEY)
      if (savedEmail) {
        setValue('email', savedEmail)
        setRememberMe(true)
      }
    }
  }, [setValue])

  const onSubmit = async (data: LoginFormData) => {
    // Gérer "Se souvenir de moi"
    if (typeof window !== 'undefined') {
      if (rememberMe) {
        localStorage.setItem(REMEMBER_ME_KEY, data.email)
      } else {
        localStorage.removeItem(REMEMBER_ME_KEY)
      }
    }

    const result = await loginUser(data)
    if (result?.error) {
      addToast(result.error, 'error')
    } else {
      addToast('Connexion réussie !', 'success')
    }
  }

  if (!mounted) {
    return <div className="auth-skeleton" />
  }

  return (
    <div className="auth-form-wrapper">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="auth-form">
        <div className="auth-form-group">
          <label htmlFor={emailFieldId} className="auth-label">
            Adresse e-mail
          </label>
          <div className="auth-input-wrap">
            <input
              id={emailFieldId}
              {...register('email')}
              type="email"
              className="auth-input"
              placeholder="votre@email.com"
              autoComplete="email"
              aria-invalid={errors.email ? 'true' : 'false'}
              aria-describedby={errors.email ? emailErrorId : undefined}
            />
          </div>
          {errors.email && (
            <p id={emailErrorId} role="alert" className="auth-error">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="auth-form-group">
          <label htmlFor={passwordFieldId} className="auth-label">
            Mot de passe
          </label>
          <div className="auth-input-wrap">
            <input
              id={passwordFieldId}
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              className="auth-input auth-input-with-action"
              placeholder="••••••••"
              autoComplete="current-password"
              aria-invalid={errors.password ? 'true' : 'false'}
              aria-describedby={errors.password ? passwordErrorId : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="auth-icon-btn"
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p id={passwordErrorId} role="alert" className="auth-error">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="auth-checkbox-row">
          <label className="auth-checkbox-label">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="auth-checkbox"
            />
            Se souvenir de moi
          </label>
          <Link href="/auth/forgot-password" className="auth-link">
            Mot de passe oublié ?
          </Link>
        </div>

        <button type="submit" disabled={isSubmitting} className="auth-submit-btn">
          {isSubmitting ? 'Connexion...' : (
            <>
              Se connecter <LogIn size={18} />
            </>
          )}
        </button>

        <div className="auth-footer">
          Pas encore de compte ?{' '}
          <Link href="/auth/register" className="auth-footer-link">
            Créer un compte gratuit →
          </Link>
        </div>
      </form>
    </div>
  )
}
