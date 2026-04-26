'use client'

/**
 * Panneau d'administration pour basculer entre les providers IA
 * (Claude / Perplexity / …). Affiche pour chacun :
 *  - le statut de la clé API (présente dans .env.local ou non)
 *  - le modèle actuellement configuré
 *  - un bouton radio pour le sélectionner
 *
 * L'admin choisit un provider → on appelle setAIProvider(id). Refusé si la
 * clé API du provider cible n'est pas définie côté serveur (gardé-fou).
 */

import { useEffect, useState } from 'react'
import { CheckCircle2, AlertCircle, Loader2, Bot, Sparkles, Key } from 'lucide-react'
import { getAIProviderStatus, setAIProvider } from '@/actions/ai-correction'

interface ProviderStatusUI {
  id: 'claude' | 'perplexity'
  label: string
  isConfigured: boolean
  isActive: boolean
  model: string
  envVarName: string
}

const PROVIDER_META: Record<
  ProviderStatusUI['id'],
  { description: string; icon: typeof Bot; helpUrl: string }
> = {
  claude: {
    description:
      'Anthropic — raisonnement scientifique avancé, supporte les sorties JSON strictes et le caching prompt.',
    icon: Bot,
    helpUrl: 'https://console.anthropic.com/',
  },
  perplexity: {
    description:
      'Perplexity Sonar — fonctionne dès le tier gratuit / Pro, recherche web désactivée pour les sujets d\'examen.',
    icon: Sparkles,
    helpUrl: 'https://www.perplexity.ai/settings/api',
  },
}

interface Props {
  onChange?: () => void
}

export function AIProviderPanel({ onChange }: Props) {
  const [providers, setProviders] = useState<ProviderStatusUI[] | null>(null)
  const [activeId, setActiveId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)

  async function reload() {
    setLoading(true)
    setFeedback(null)
    try {
      const res = await getAIProviderStatus()
      if (!res.success) {
        setFeedback({ type: 'err', msg: res.error })
        return
      }
      setProviders(res.data.providers as ProviderStatusUI[])
      setActiveId(res.data.activeId)
    } catch (err) {
      setFeedback({ type: 'err', msg: err instanceof Error ? err.message : 'Erreur' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void reload()
  }, [])

  async function handleSelect(id: ProviderStatusUI['id']) {
    if (id === activeId || pendingId) return
    setPendingId(id)
    setFeedback(null)
    try {
      const res = await setAIProvider(id)
      if (!res.success) {
        setFeedback({ type: 'err', msg: res.error })
        return
      }
      setActiveId(id)
      setFeedback({ type: 'ok', msg: `Provider IA actif : ${id}.` })
      onChange?.()
    } catch (err) {
      setFeedback({ type: 'err', msg: err instanceof Error ? err.message : 'Erreur' })
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div className="ai-provider-panel">
      <div className="ai-provider-panel-head">
        <div>
          <h3>Provider IA actif</h3>
          <p>
            Choisissez le fournisseur utilisé pour les corrections IA. Les clés API sont lues depuis
            <code> .env.local</code> — jamais stockées en base.
          </p>
        </div>
        {loading && <Loader2 size={18} className="ai-provider-spin" />}
      </div>

      {feedback && (
        <div className={`ai-provider-feedback ai-provider-feedback-${feedback.type}`}>
          {feedback.type === 'ok' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
          <span>{feedback.msg}</span>
        </div>
      )}

      {providers && (
        <ul className="ai-provider-list">
          {providers.map((p) => {
            const meta = PROVIDER_META[p.id]
            const Icon = meta.icon
            const isActive = p.id === activeId
            const disabled = !p.isConfigured && !isActive
            return (
              <li
                key={p.id}
                className={`ai-provider-card ${isActive ? 'ai-provider-card-active' : ''} ${
                  disabled ? 'ai-provider-card-disabled' : ''
                }`}
              >
                <button
                  type="button"
                  className="ai-provider-card-btn"
                  onClick={() => handleSelect(p.id)}
                  disabled={disabled || pendingId !== null}
                  aria-pressed={isActive}
                >
                  <span className="ai-provider-radio" aria-hidden="true">
                    {isActive ? <span className="ai-provider-radio-dot" /> : null}
                  </span>
                  <span className="ai-provider-icon">
                    <Icon size={20} />
                  </span>
                  <span className="ai-provider-info">
                    <span className="ai-provider-name">
                      {p.label}
                      {isActive && <span className="ai-provider-badge">Actif</span>}
                    </span>
                    <span className="ai-provider-desc">{meta.description}</span>
                    <span className="ai-provider-meta">
                      <span className="ai-provider-pill">
                        <span className="ai-provider-pill-label">Modèle</span>
                        <code>{p.model}</code>
                      </span>
                      <span
                        className={`ai-provider-pill ai-provider-pill-${
                          p.isConfigured ? 'ok' : 'missing'
                        }`}
                      >
                        <Key size={10} />
                        <code>{p.envVarName}</code>
                        {p.isConfigured ? ' configurée' : ' manquante'}
                      </span>
                    </span>
                  </span>
                </button>
                {!p.isConfigured && (
                  <a
                    className="ai-provider-help"
                    href={meta.helpUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Obtenir une clé →
                  </a>
                )}
                {pendingId === p.id && (
                  <Loader2 size={16} className="ai-provider-spin ai-provider-pending" />
                )}
              </li>
            )
          })}
        </ul>
      )}

      <p className="ai-provider-hint">
        💡 Les modèles ainsi que les tarifs (<code>ai.price.submission</code>,{' '}
        <code>ai.price.direct</code>, <code>ai.claude.model</code>, <code>ai.perplexity.model</code>,{' '}
        <code>ai.effort</code>) restent éditables dans l'onglet <strong>Paramètres</strong>{' '}
        (catégorie <em>IA</em>).
      </p>

      <style jsx>{`
        .ai-provider-panel {
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid var(--gold-line, rgba(201, 168, 76, 0.3));
          background: linear-gradient(180deg, rgba(201, 168, 76, 0.04), transparent 80%);
          color: var(--text-1, #fff);
        }
        .ai-provider-panel-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1.25rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-1, rgba(255, 255, 255, 0.08));
        }
        .ai-provider-panel-head h3 {
          margin: 0 0 0.25rem;
          font-size: 1.05rem;
          font-weight: 600;
          font-family: var(--font-display, serif);
        }
        .ai-provider-panel-head p {
          margin: 0;
          font-size: 0.8rem;
          color: var(--text-3, rgba(255, 255, 255, 0.6));
          line-height: 1.55;
          max-width: 640px;
        }
        .ai-provider-panel-head code {
          padding: 0.05rem 0.3rem;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 3px;
          font-size: 0.78rem;
        }
        .ai-provider-feedback {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 0.85rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          font-size: 0.82rem;
        }
        .ai-provider-feedback-ok {
          background: rgba(110, 170, 140, 0.1);
          color: #6eaa8c;
          border: 1px solid rgba(110, 170, 140, 0.35);
        }
        .ai-provider-feedback-err {
          background: rgba(224, 85, 117, 0.1);
          color: #e05575;
          border: 1px solid rgba(224, 85, 117, 0.35);
        }
        .ai-provider-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }
        .ai-provider-card {
          position: relative;
          border-radius: 12px;
          border: 1px solid var(--border-1, rgba(255, 255, 255, 0.08));
          background: var(--card, rgba(255, 255, 255, 0.02));
          transition: border-color 0.18s, background 0.18s, transform 0.18s;
        }
        .ai-provider-card:hover {
          border-color: var(--gold-line, rgba(201, 168, 76, 0.5));
        }
        .ai-provider-card-active {
          border-color: var(--gold, #c9a84c) !important;
          background: rgba(201, 168, 76, 0.06);
        }
        .ai-provider-card-disabled {
          opacity: 0.55;
        }
        .ai-provider-card-btn {
          width: 100%;
          padding: 1rem 1.1rem;
          background: transparent;
          border: 0;
          color: inherit;
          text-align: left;
          cursor: pointer;
          display: grid;
          grid-template-columns: 22px 38px 1fr;
          gap: 0.85rem;
          align-items: flex-start;
        }
        .ai-provider-card-btn:disabled {
          cursor: not-allowed;
        }
        .ai-provider-radio {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 1.5px solid var(--text-3, rgba(255, 255, 255, 0.5));
          margin-top: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ai-provider-card-active .ai-provider-radio {
          border-color: var(--gold, #c9a84c);
        }
        .ai-provider-radio-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: var(--gold, #c9a84c);
        }
        .ai-provider-icon {
          width: 38px;
          height: 38px;
          border-radius: 9px;
          background: var(--gold-dim, rgba(201, 168, 76, 0.15));
          color: var(--gold, #c9a84c);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ai-provider-info {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .ai-provider-name {
          font-weight: 600;
          font-size: 0.95rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }
        .ai-provider-badge {
          font-size: 0.65rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          font-weight: 700;
          padding: 0.1rem 0.45rem;
          border-radius: 999px;
          background: var(--gold, #c9a84c);
          color: #0c0c0e;
        }
        .ai-provider-desc {
          color: var(--text-3, rgba(255, 255, 255, 0.6));
          font-size: 0.8rem;
          line-height: 1.55;
        }
        .ai-provider-meta {
          margin-top: 0.25rem;
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .ai-provider-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.18rem 0.55rem;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-1, rgba(255, 255, 255, 0.08));
          font-size: 0.7rem;
          color: var(--text-3, rgba(255, 255, 255, 0.7));
        }
        .ai-provider-pill code {
          font-family: var(--font-mono, monospace);
          font-size: 0.7rem;
          color: var(--text-2, rgba(255, 255, 255, 0.85));
        }
        .ai-provider-pill-label {
          font-size: 0.62rem;
          color: var(--text-3, rgba(255, 255, 255, 0.5));
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .ai-provider-pill-ok {
          background: rgba(110, 170, 140, 0.1);
          border-color: rgba(110, 170, 140, 0.35);
          color: #6eaa8c;
        }
        .ai-provider-pill-ok code { color: #6eaa8c; }
        .ai-provider-pill-missing {
          background: rgba(224, 85, 117, 0.08);
          border-color: rgba(224, 85, 117, 0.35);
          color: #e05575;
        }
        .ai-provider-pill-missing code { color: #e05575; }
        .ai-provider-help {
          position: absolute;
          right: 1rem;
          top: 1rem;
          font-size: 0.75rem;
          color: var(--gold, #c9a84c);
          text-decoration: none;
          padding: 0.3rem 0.6rem;
          border: 1px solid var(--gold-line, rgba(201, 168, 76, 0.4));
          border-radius: 8px;
          transition: background 0.18s;
        }
        .ai-provider-help:hover {
          background: var(--gold-dim, rgba(201, 168, 76, 0.1));
        }
        .ai-provider-pending {
          position: absolute;
          right: 1rem;
          top: 1rem;
        }
        .ai-provider-spin {
          animation: ai-provider-spin 0.9s linear infinite;
          color: var(--gold, #c9a84c);
        }
        @keyframes ai-provider-spin {
          to {
            transform: rotate(360deg);
          }
        }
        .ai-provider-hint {
          margin-top: 1.25rem;
          padding: 0.75rem 1rem;
          font-size: 0.78rem;
          color: var(--text-3, rgba(255, 255, 255, 0.65));
          background: rgba(255, 255, 255, 0.02);
          border-radius: 8px;
          border: 1px dashed var(--border-1, rgba(255, 255, 255, 0.1));
          line-height: 1.55;
        }
        .ai-provider-hint code {
          font-family: var(--font-mono, monospace);
          padding: 0.05rem 0.3rem;
          border-radius: 3px;
          background: rgba(255, 255, 255, 0.06);
          font-size: 0.72rem;
        }
      `}</style>
    </div>
  )
}
