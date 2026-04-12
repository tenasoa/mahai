'use client'

import { InputHTMLAttributes, forwardRef, useState } from 'react'
import styles from './Input.module.css'
import { Eye, EyeOff } from 'lucide-react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time' | 'datetime-local'
  showPasswordToggle?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      type = 'text',
      showPasswordToggle = false,
      className = '',
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false)
    const [isFocused, setIsFocused] = useState(false)

    const inputType = showPasswordToggle
      ? showPassword
        ? 'text'
        : 'password'
      : type

    const hasError = !!error
    const hasLeftIcon = !!leftIcon
    const hasRightIcon = !!rightIcon || showPasswordToggle

    return (
      <div className={`${styles.wrapper} ${className}`}>
        {label && (
          <label htmlFor={id} className={styles.label}>
            {label}
          </label>
        )}

        <div
          className={`${styles.inputWrapper} ${hasLeftIcon ? styles.hasLeftIcon : ''} ${hasRightIcon || showPasswordToggle ? styles.hasRightIcon : ''} ${hasError ? styles.error : ''} ${isFocused ? styles.focused : ''} ${disabled ? styles.disabled : ''}`}
        >
          {leftIcon && <span className={styles.iconLeft}>{leftIcon}</span>}

          <input
            ref={ref}
            id={id}
            type={inputType}
            disabled={disabled}
            className={styles.input}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />

          {showPasswordToggle && type === 'password' && (
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}

          {rightIcon && !showPasswordToggle && (
            <span className={styles.iconRight}>{rightIcon}</span>
          )}
        </div>

        {error && <span className={styles.errorMessage}>{error}</span>}

        {hint && !error && <span className={styles.hint}>{hint}</span>}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
