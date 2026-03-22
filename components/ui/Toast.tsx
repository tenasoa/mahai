'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface ToastProps {
  message: string
  title?: string
  type: 'success' | 'error' | 'info' | 'warning'
  onClose: () => void
}

const TOAST_CONFIG = {
  success: {
    line: '#4A6B5A',
    prog: '#8ECAAC',
    icBg: 'rgba(74,107,90,.15)',
    icBd: 'rgba(74,107,90,.3)',
    title: 'Succès',
    shake: false,
    svg: <path d="M4 8L7 11L13 5" stroke="#8ECAAC" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  },
  error: {
    line: '#9B2335',
    prog: '#E06070',
    icBg: 'rgba(155,35,53,.13)',
    icBd: 'rgba(155,35,53,.3)',
    title: 'Erreur',
    shake: true,
    svg: <path d="M8 4V9M8 11.5V11.4" stroke="#E06070" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  },
  info: {
    line: '#C9A84C',
    prog: '#C9A84C',
    icBg: 'rgba(201,168,76,.08)',
    icBd: 'rgba(201,168,76,.22)',
    title: 'Information',
    shake: false,
    svg: <path d="M8 5V5.1M8 7V12" stroke="#C9A84C" strokeWidth="1.6" strokeLinecap="round"/>
  },
  warning: {
    line: '#C9843C',
    prog: '#C9843C',
    icBg: 'rgba(201,132,60,.12)',
    icBd: 'rgba(201,132,60,.28)',
    title: 'Attention',
    shake: false,
    svg: <><path d="M8 2.5L14 13.5H2L8 2.5Z" stroke="#C9843C" strokeWidth="1.3" strokeLinejoin="round"/><path d="M8 7V9.5M8 11V11.1" stroke="#C9843C" strokeWidth="1.3" strokeLinecap="round"/></>
  }
}

export function Toast({ message, type, onClose }: ToastProps) {
  const [isEntering, setIsEntering] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const [shouldShake, setShouldShake] = useState(false)
  const config = TOAST_CONFIG[type]

  useEffect(() => {
    const entryTimer = setTimeout(() => setIsEntering(true), 50)
    
    if (config.shake) {
      const shakeTimer = setTimeout(() => setShouldShake(true), 500)
      const clearShakeTimer = setTimeout(() => setShouldShake(false), 1000)
    }

    const duration = 5000
    const closeTimer = setTimeout(() => {
      handleClose()
    }, duration)

    return () => {
      clearTimeout(entryTimer)
      clearTimeout(closeTimer)
    }
  }, [type, config.shake])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(onClose, 400)
  }

  return (
    <div className={`luxury-toast ${isEntering ? 'in' : ''} ${isExiting ? 'out' : ''} ${shouldShake ? 'shake' : ''}`}>
      <div className="toast-line" style={{ background: config.line }}></div>
      <div className="toast-ic" style={{ background: config.icBg, border: `1px solid ${config.icBd}` }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          {config.svg}
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="toast-title">{config.title}</div>
        <div className="toast-msg">{message}</div>
      </div>
      <button className="toast-x" onClick={handleClose}>
        <X size={14} />
      </button>
      <div className="toast-prog" style={{ background: config.prog }}></div>

      <style jsx>{`
        .luxury-toast {
          background: #1C1916;
          border: 1px solid rgba(201,168,76,.16);
          border-radius: 8px;
          padding: 13px 15px;
          display: flex;
          align-items: flex-start;
          gap: 11px;
          position: relative;
          overflow: hidden;
          width: 340px;
          transform: translateX(calc(100% + 2rem));
          opacity: 0;
          transition: transform .42s cubic-bezier(.22,.68,0,1.2), opacity .35s ease;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          pointer-events: auto;
          margin-bottom: 8px;
        }
        .luxury-toast.in { transform: translateX(0); opacity: 1; }
        .luxury-toast.out { transform: translateX(calc(100% + 2rem)); opacity: 0; transition: transform .32s cubic-bezier(.4,0,.6,1), opacity .25s ease; }
        .luxury-toast.shake { animation: shake .4s cubic-bezier(.36,.07,.19,.97); }
        @keyframes shake {
          10%, 90% { transform: translateX(-3px); }
          20%, 80% { transform: translateX(4px); }
          30%, 50%, 70% { transform: translateX(-4px); }
          40%, 60% { transform: translateX(4px); }
        }
        .toast-line {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform .55s .15s cubic-bezier(.22,.68,0,1.1);
        }
        .luxury-toast.in .toast-line { transform: scaleX(1); }
        .toast-ic {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justifyContent: center;
          flex-shrink: 0;
          margin-top: 1px;
          transform: scale(0) rotate(-90deg);
          transition: transform .38s .08s cubic-bezier(.34,1.56,.64,1);
        }
        .luxury-toast.in .toast-ic { transform: scale(1) rotate(0deg); }
        .toast-title {
          font-size: 13px;
          font-weight: 500;
          color: #F0EBE3;
          margin-bottom: 3px;
          line-height: 1.3;
          opacity: 0;
          transform: translateY(4px);
          transition: opacity .3s .18s, transform .3s .18s ease;
        }
        .luxury-toast.in .toast-title { opacity: 1; transform: translateY(0); }
        .toast-msg {
          font-size: 12px;
          color: rgba(240,235,227,.5);
          line-height: 1.5;
          opacity: 0;
          transform: translateY(4px);
          transition: opacity .3s .25s, transform .3s .25s ease;
        }
        .luxury-toast.in .toast-msg { opacity: 1; transform: translateY(0); }
        .toast-x {
          background: none;
          border: none;
          color: rgba(240,235,227,.2);
          cursor: pointer;
          padding: 0;
          line-height: 1;
          flex-shrink: 0;
          transition: color .15s, transform .15s;
          margin-left: auto;
          margin-top: 1px;
          opacity: 0;
          transform: scale(.7);
          transition: opacity .25s .3s, transform .25s .3s ease, color .15s;
          display: flex;
          align-items: center;
          justifyContent: center;
        }
        .luxury-toast.in .toast-x { opacity: 1; transform: scale(1); }
        .toast-x:hover { color: rgba(240,235,227,.65); transform: scale(1.15) !important; }
        .toast-prog {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 2px;
          width: 100%;
          border-radius: 0 2px 2px 0;
          transform-origin: left;
          animation: progress 5s linear forwards;
        }
        @keyframes progress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
      `}</style>
    </div>
  )
}

interface ToastContainerProps {
  toasts: Array<{ id: string; message: string; type: 'success' | 'error' | 'info' | 'warning' }>
  removeToast: (id: string) => void
}

export function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return createPortal(
    <div style={{ 
      position: 'fixed', 
      top: '12px', 
      right: '12px', 
      zIndex: 99999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      pointerEvents: 'none',
    }}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>,
    document.body
  )
}

export function useToast() {
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: 'success' | 'error' | 'info' | 'warning' }>>([])

  const addToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { id, message, type }])
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  return { toasts, addToast, removeToast }
}
