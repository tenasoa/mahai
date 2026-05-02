'use client'

/**
 * ShareModal — modale de partage social + copie de lien.
 *
 * Inspirée de widgets/45-share-component-*.html. Présente :
 *  - Mini-preview du contenu partagé (titre + meta + thumbnail optionnel)
 *  - Champ « lien » readonly avec bouton « Copier » (feedback visuel)
 *  - Message éditable (italique) qui sera prepended au lien sur les
 *    plateformes qui supportent du texte (WhatsApp, SMS, Telegram, Email)
 *  - Grille 8 plateformes : WhatsApp, Facebook, Telegram, X (Twitter),
 *    SMS, Email, Instagram (copie + ouverture de l'app), Plus (navigator share API)
 *
 * Aucun tracking — tous les liens sont des deeplinks publics standard.
 *
 * Usage :
 *   <ShareModal
 *     isOpen={showShare}
 *     onClose={() => setShowShare(false)}
 *     url="https://mahai.mg/sujet/abc123"
 *     title="BAC Mathématiques 2024"
 *     subtitle="Algèbre & Fonctions · 18 pages · 3h"
 *     thumbnail="/og-images/sujet-abc123.png"
 *   />
 */

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  Check,
  Copy,
  Pencil,
  MessageCircle,
  Send,
  Mail,
  Instagram,
  Facebook,
  Share2,
} from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  url: string
  title: string
  subtitle?: string
  thumbnail?: string
  /** Message par défaut prepended au lien sur les plateformes texte. */
  defaultMessage?: string
}

interface Platform {
  id: string
  label: string
  icon: React.ReactNode
  color: string
  /** Construit l'URL de partage à partir de message + url. Renvoie null pour
      un comportement custom (ex: copier le lien pour Instagram). */
  href: (msg: string, url: string) => string | null
  /** Comportement custom au click — par défaut window.open(href). */
  onCustomClick?: (msg: string, url: string) => void
}

const PLATFORMS: Platform[] = [
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    color: '#25D366',
    icon: <MessageCircle size={18} />,
    href: (msg, url) =>
      `https://wa.me/?text=${encodeURIComponent(`${msg}\n${url}`.trim())}`,
  },
  {
    id: 'facebook',
    label: 'Facebook',
    color: '#1877F2',
    icon: <Facebook size={18} />,
    href: (_msg, url) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    id: 'telegram',
    label: 'Telegram',
    color: '#26A5E4',
    icon: <Send size={18} />,
    href: (msg, url) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(msg)}`,
  },
  {
    id: 'twitter',
    label: 'X / Twitter',
    color: '#000000',
    icon: (
      <span style={{ fontFamily: 'serif', fontSize: 18, fontWeight: 900, lineHeight: 1 }}>
        𝕏
      </span>
    ),
    href: (msg, url) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(msg)}&url=${encodeURIComponent(url)}`,
  },
  {
    id: 'sms',
    label: 'SMS',
    color: '#9B2335',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    href: (msg, url) => `sms:?body=${encodeURIComponent(`${msg}\n${url}`.trim())}`,
  },
  {
    id: 'email',
    label: 'E-mail',
    color: '#4A6B5A',
    icon: <Mail size={18} />,
    href: (msg, url) =>
      `mailto:?subject=${encodeURIComponent('Découvre ce sujet sur Mah.AI')}&body=${encodeURIComponent(`${msg}\n\n${url}`)}`,
  },
  {
    id: 'instagram',
    label: 'Instagram',
    color: '#E4405F',
    icon: <Instagram size={18} />,
    href: () => null,
    onCustomClick: (_msg, url) => {
      // Instagram n'expose pas d'API de partage texte web. On copie le lien
      // dans le presse-papier — l'utilisateur le colle dans son app.
      navigator.clipboard?.writeText(url).catch(() => {})
      window.open('https://www.instagram.com', '_blank', 'noopener,noreferrer')
    },
  },
  {
    id: 'native',
    label: 'Autres',
    color: '#1C2B4A',
    icon: <Share2 size={18} />,
    href: () => null,
    onCustomClick: (msg, url) => {
      if (typeof navigator !== 'undefined' && navigator.share) {
        navigator
          .share({ title: 'Mah.AI', text: msg, url })
          .catch(() => {})
      } else {
        navigator.clipboard?.writeText(url).catch(() => {})
      }
    },
  },
]

export default function ShareModal({
  isOpen,
  onClose,
  url,
  title,
  subtitle,
  thumbnail,
  defaultMessage,
}: Props) {
  const [mounted, setMounted] = useState(false)
  const [message, setMessage] = useState(defaultMessage || `Découvre « ${title} » sur Mah.AI :`)
  const [editingMessage, setEditingMessage] = useState(false)
  const [copied, setCopied] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => setMounted(true), [])

  // Reset l'état "copié" quand on rouvre la modale
  useEffect(() => {
    if (isOpen) {
      setCopied(false)
      setEditingMessage(false)
    }
  }, [isOpen])

  // Esc pour fermer
  useEffect(() => {
    if (!isOpen) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  if (!isOpen || !mounted) return null

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback : sélectionne le contenu de l'input
      inputRef.current?.select()
      document.execCommand('copy')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handlePlatform = (p: Platform) => {
    if (p.onCustomClick) {
      p.onCustomClick(message, url)
      return
    }
    const href = p.href(message, url)
    if (href) window.open(href, '_blank', 'noopener,noreferrer')
  }

  return createPortal(
    <div
      className="share-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="share-modal">
        <div className="share-header">
          <div>
            <p className="share-eyebrow">Partager</p>
            <h2 id="share-title" className="share-title">
              {title}
            </h2>
          </div>
          <button className="share-close" onClick={onClose} aria-label="Fermer">
            <X size={16} />
          </button>
        </div>

        <div className="share-body">
          {/* Mini preview du contenu */}
          <div className="share-preview">
            {thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={thumbnail} alt="" className="share-preview-thumb" />
            ) : (
              <div className="share-preview-thumb-fallback" aria-hidden="true">
                <span>{title.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <div className="share-preview-text">
              <div className="share-preview-title">{title}</div>
              {subtitle && <div className="share-preview-meta">{subtitle}</div>}
            </div>
          </div>

          {/* Message éditable */}
          <div className="share-msg-row">
            <span className="share-msg-label">Message</span>
            {editingMessage ? (
              <input
                className="share-msg-input"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onBlur={() => setEditingMessage(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setEditingMessage(false)
                }}
                autoFocus
              />
            ) : (
              <button
                className="share-msg-display"
                onClick={() => setEditingMessage(true)}
                title="Cliquer pour modifier"
              >
                <em>{message}</em>
                <Pencil size={11} />
              </button>
            )}
          </div>

          {/* Lien copiable */}
          <div className="share-link-row">
            <input
              ref={inputRef}
              className="share-link-input"
              type="text"
              value={url}
              readOnly
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <button
              className={`share-link-btn ${copied ? 'copied' : ''}`}
              onClick={handleCopy}
              type="button"
            >
              {copied ? (
                <>
                  <Check size={13} /> Copié
                </>
              ) : (
                <>
                  <Copy size={13} /> Copier
                </>
              )}
            </button>
          </div>

          {/* Grille plateformes (4 colonnes desktop, 4 cols mobile) */}
          <div className="share-platforms">
            {PLATFORMS.map((p) => (
              <button
                key={p.id}
                className="share-platform"
                onClick={() => handlePlatform(p)}
                type="button"
                style={{ '--platform-color': p.color } as React.CSSProperties}
              >
                <span className="share-platform-icon">{p.icon}</span>
                <span className="share-platform-label">{p.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .share-overlay {
          position: fixed;
          inset: 0;
          background: rgba(8, 7, 5, 0.78);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          z-index: 10000;
          animation: share-fade-in 0.18s ease-out;
        }
        .share-modal {
          width: 100%;
          max-width: 460px;
          background: var(--card, #fff);
          border: 1px solid var(--b1, rgba(0, 0, 0, 0.1));
          border-radius: var(--r-lg, 16px);
          box-shadow: var(--shadow-lg, 0 16px 60px rgba(0, 0, 0, 0.15));
          position: relative;
          overflow: hidden;
          animation: share-pop-in 0.36s cubic-bezier(0.22, 0.68, 0, 1.18);
        }
        .share-modal::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(
            90deg,
            transparent,
            var(--gold, #c9a84c) 30%,
            var(--gold-hi, #d4b860) 50%,
            var(--gold, #c9a84c) 70%,
            transparent
          );
          z-index: 1;
        }

        .share-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 1.25rem 1.5rem 0.5rem;
          gap: 1rem;
        }
        .share-eyebrow {
          font-family: var(--mono, monospace);
          font-size: 0.62rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--text-3, rgba(0, 0, 0, 0.4));
          margin: 0 0 0.2rem;
        }
        .share-title {
          font-family: var(--display, serif);
          font-size: 1.15rem;
          font-weight: 500;
          color: var(--text, #1a1714);
          margin: 0;
          letter-spacing: -0.01em;
          line-height: 1.25;
        }
        .share-close {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 1px solid var(--b1);
          background: transparent;
          color: var(--text-3);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
          flex-shrink: 0;
        }
        .share-close:hover {
          background: var(--surface);
          color: var(--text);
        }

        .share-body {
          padding: 0.75rem 1.5rem 1.5rem;
        }

        /* Preview */
        .share-preview {
          display: flex;
          gap: 0.85rem;
          padding: 0.85rem;
          background: var(--paper, #ede8e0);
          border: 1px solid var(--b1);
          border-radius: var(--r-xs, 4px);
          margin-bottom: 1rem;
        }
        .share-preview-thumb,
        .share-preview-thumb-fallback {
          width: 56px;
          height: 56px;
          border-radius: var(--r-xs);
          object-fit: cover;
          flex-shrink: 0;
        }
        .share-preview-thumb-fallback {
          background: var(--ink, #1a1714);
          color: var(--gold-lo, #d4a855);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--display);
          font-size: 1.6rem;
          font-weight: 500;
        }
        .share-preview-text {
          min-width: 0;
          flex: 1;
        }
        .share-preview-title {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text);
          line-height: 1.3;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .share-preview-meta {
          font-family: var(--mono);
          font-size: 0.65rem;
          color: var(--text-3);
          margin-top: 0.25rem;
          letter-spacing: 0.02em;
        }

        /* Message éditable */
        .share-msg-row {
          margin-bottom: 0.85rem;
        }
        .share-msg-label {
          display: block;
          font-family: var(--mono);
          font-size: 0.6rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--text-3);
          margin-bottom: 0.32rem;
        }
        .share-msg-display {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.55rem 0.7rem;
          background: var(--paper);
          border: 1px solid var(--b1);
          border-radius: var(--r-xs);
          color: var(--text-2);
          font-family: var(--body);
          font-size: 0.78rem;
          cursor: pointer;
          text-align: left;
          line-height: 1.4;
          transition: border-color 0.15s;
        }
        .share-msg-display:hover {
          border-color: var(--gold-line);
        }
        .share-msg-display em {
          flex: 1;
          font-style: italic;
        }
        .share-msg-input {
          width: 100%;
          padding: 0.55rem 0.7rem;
          background: var(--paper);
          border: 1px solid var(--gold);
          border-radius: var(--r-xs);
          font-family: var(--body);
          font-size: 0.78rem;
          color: var(--text);
          outline: none;
          box-shadow: 0 0 0 3px var(--gold-glow);
        }

        /* Lien copiable */
        .share-link-row {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.25rem;
        }
        .share-link-input {
          flex: 1;
          padding: 0.55rem 0.75rem;
          background: var(--paper);
          border: 1px solid var(--b1);
          border-radius: var(--r-xs);
          font-family: var(--mono);
          font-size: 0.7rem;
          color: var(--text-2);
          outline: none;
          letter-spacing: 0.02em;
          min-width: 0;
        }
        .share-link-input:focus {
          border-color: var(--gold);
          box-shadow: 0 0 0 3px var(--gold-glow);
        }
        .share-link-btn {
          display: flex;
          align-items: center;
          gap: 0.32rem;
          padding: 0 0.85rem;
          background: var(--ink, #1a1714);
          color: var(--cream, #f7f3ee);
          border: 1px solid var(--ink);
          border-radius: var(--r-xs);
          font-family: var(--body);
          font-size: 0.72rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          flex-shrink: 0;
        }
        .share-link-btn:hover {
          opacity: 0.88;
        }
        .share-link-btn.copied {
          background: var(--sage, #4a6b5a);
          border-color: var(--sage);
        }

        /* Plateformes */
        .share-platforms {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.5rem;
        }
        .share-platform {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          padding: 0.85rem 0.5rem;
          background: var(--paper);
          border: 1px solid var(--b1);
          border-radius: var(--r-xs);
          color: var(--text-2);
          font-family: var(--body);
          font-size: 0.65rem;
          cursor: pointer;
          transition: all 0.18s;
          --platform-color: var(--gold);
        }
        .share-platform:hover {
          background: var(--card);
          border-color: var(--platform-color);
          color: var(--platform-color);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
        }
        .share-platform-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.04);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--platform-color);
          transition: all 0.18s;
        }
        .share-platform:hover .share-platform-icon {
          background: var(--platform-color);
          color: white;
        }
        .share-platform-label {
          font-size: 0.65rem;
          letter-spacing: 0.02em;
          font-weight: 500;
        }

        @keyframes share-fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes share-pop-in {
          from {
            opacity: 0;
            transform: scale(0.94) translateY(12px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        /* Mobile */
        @media (max-width: 480px) {
          .share-modal {
            max-width: 100%;
            border-radius: var(--r-lg) var(--r-lg) 0 0;
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            animation: share-slide-up 0.36s cubic-bezier(0.22, 0.68, 0, 1.18);
          }
          .share-overlay {
            align-items: flex-end;
            padding: 0;
          }
          .share-platforms {
            grid-template-columns: repeat(4, 1fr);
            gap: 0.4rem;
          }
        }

        @keyframes share-slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>
    </div>,
    document.body,
  )
}
