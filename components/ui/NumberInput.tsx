'use client'

import { ChevronUp, ChevronDown } from 'lucide-react'

interface NumberInputProps {
  value: string | number
  onChange: (value: string) => void
  min?: number
  step?: number
  placeholder?: string
  className?: string
  style?: React.CSSProperties
  label?: string
  disabled?: boolean
}

export function NumberInput({
  value,
  onChange,
  min = 0,
  step = 1,
  placeholder,
  className,
  style,
  label,
  disabled = false
}: NumberInputProps) {
  const handleIncrement = () => {
    const currentValue = parseInt(value.toString()) || 0
    const newValue = currentValue + step
    if (newValue >= min) {
      onChange(newValue.toString())
    }
  }

  const handleDecrement = () => {
    const currentValue = parseInt(value.toString()) || 0
    const newValue = currentValue - step
    if (newValue >= min) {
      onChange(newValue.toString())
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
      {label && (
        <label style={{ 
          fontFamily: 'var(--mono)', 
          fontSize: '0.65rem', 
          textTransform: 'uppercase', 
          letterSpacing: '0.1em', 
          color: 'var(--text-3)' 
        }}>
          {label}
        </label>
      )}
      <div style={{ 
        display: 'flex', 
        alignItems: 'stretch', 
        gap: '0', 
        width: '100%',
        ...style 
      }}>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={className}
          style={{
            flex: 1,
            padding: '0.75rem',
            background: 'var(--surface)',
            border: '1px solid var(--b1)',
            borderRadius: 'var(--r)',
            color: 'var(--text)',
            fontFamily: 'var(--body)',
            fontSize: '0.9rem',
            borderRight: 'none',
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
            outline: 'none',
            // Hide default spinner arrows
            MozAppearance: 'textfield',
          }}
        />
        <style jsx>{`
          input[type="number"]::-webkit-inner-spin-button,
          input[type="number"]::-webkit-outer-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          input[type="number"] {
            -moz-appearance: textfield;
          }
        `}</style>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid var(--b1)',
          borderLeft: 'none',
          borderTopRightRadius: 'var(--r)',
          borderBottomRightRadius: 'var(--r)',
          background: 'var(--surface)'
        }}>
          <button
            type="button"
            onClick={handleIncrement}
            disabled={disabled}
            style={{
              padding: '0.25rem 0.5rem',
              background: 'transparent',
              border: 'none',
              borderBottom: '1px solid var(--b1)',
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-3)',
              transition: 'all 0.2s',
              borderTopRightRadius: 'var(--r)',
            }}
            onMouseEnter={(e) => {
              if (!disabled) {
                e.currentTarget.style.color = 'var(--gold)'
                e.currentTarget.style.background = 'var(--gold-dim)'
              }
            }}
            onMouseLeave={(e) => {
              if (!disabled) {
                e.currentTarget.style.color = 'var(--text-3)'
                e.currentTarget.style.background = 'transparent'
              }
            }}
          >
            <ChevronUp size={14} />
          </button>
          <button
            type="button"
            onClick={handleDecrement}
            disabled={disabled}
            style={{
              padding: '0.25rem 0.5rem',
              background: 'transparent',
              border: 'none',
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-3)',
              transition: 'all 0.2s',
              borderBottomRightRadius: 'var(--r)',
            }}
            onMouseEnter={(e) => {
              if (!disabled) {
                e.currentTarget.style.color = 'var(--gold)'
                e.currentTarget.style.background = 'var(--gold-dim)'
              }
            }}
            onMouseLeave={(e) => {
              if (!disabled) {
                e.currentTarget.style.color = 'var(--text-3)'
                e.currentTarget.style.background = 'transparent'
              }
            }}
          >
            <ChevronDown size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
