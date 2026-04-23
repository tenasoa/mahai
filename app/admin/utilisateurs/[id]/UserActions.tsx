'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CreditCard, Edit3, Plus, Minus, X, Check } from 'lucide-react'
import {
  adjustUserCreditsAdmin,
  updateUserInfoAdmin,
} from '@/actions/admin/users'

interface UserInfo {
  id: string
  prenom?: string
  nom?: string
  email?: string
  phone?: string
  pseudo?: string
  schoolLevel?: string
  region?: string
  district?: string
  bio?: string
  credits?: number
}

interface Props {
  user: UserInfo
}

export function AdminCreditAdjuster({ user }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [direction, setDirection] = useState<'add' | 'subtract'>('add')
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const reset = () => {
    setAmount('')
    setReason('')
    setError(null)
    setDirection('add')
  }

  const handleSubmit = () => {
    setError(null)
    const parsed = parseInt(amount, 10)
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError('Montant invalide')
      return
    }
    if (!reason.trim()) {
      setError('Un motif est requis')
      return
    }
    const delta = direction === 'add' ? parsed : -parsed

    startTransition(async () => {
      try {
        await adjustUserCreditsAdmin(user.id, delta, reason.trim())
        setOpen(false)
        reset()
        router.refresh()
      } catch (e: any) {
        setError(e?.message || "Échec de l'ajustement")
      }
    })
  }

  return (
    <>
      <button
        type="button"
        className="admin-btn admin-btn-outline"
        style={{ flex: 1, fontSize: '0.75rem', padding: '0.5rem' }}
        onClick={() => setOpen(true)}
      >
        Ajuster le solde
      </button>

      {open && (
        <div className="admin-modal-backdrop" onClick={() => !isPending && setOpen(false)}>
          <div className="admin-modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div className="admin-modal-title">
                <CreditCard size={18} />
                Ajuster le solde
              </div>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => !isPending && setOpen(false)}
                aria-label="Fermer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="admin-modal-body">
              <p className="admin-modal-note">
                Solde actuel&nbsp;: <strong>{user.credits ?? 0} cr</strong>
              </p>

              <div className="admin-toggle-row">
                <button
                  type="button"
                  className={`admin-toggle-btn ${direction === 'add' ? 'active add' : ''}`}
                  onClick={() => setDirection('add')}
                >
                  <Plus size={14} />
                  Ajouter
                </button>
                <button
                  type="button"
                  className={`admin-toggle-btn ${direction === 'subtract' ? 'active subtract' : ''}`}
                  onClick={() => setDirection('subtract')}
                >
                  <Minus size={14} />
                  Retirer
                </button>
              </div>

              <label className="admin-modal-label">Montant (crédits)</label>
              <input
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="admin-modal-input"
                placeholder="0"
              />

              <label className="admin-modal-label">Motif</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="admin-modal-input"
                placeholder="Ex. bonus de bienvenue, remboursement, correction manuelle…"
                rows={3}
              />

              {error && <div className="admin-modal-error">{error}</div>}
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn-outline"
                onClick={() => !isPending && setOpen(false)}
                disabled={isPending}
              >
                Annuler
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                onClick={handleSubmit}
                disabled={isPending}
              >
                <Check size={14} />
                {isPending ? 'Enregistrement…' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ModalStyles />
    </>
  )
}

export function AdminUserInfoEditor({ user }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    prenom: user.prenom ?? '',
    nom: user.nom ?? '',
    email: user.email ?? '',
    phone: user.phone ?? '',
    pseudo: user.pseudo ?? '',
    schoolLevel: user.schoolLevel ?? '',
    region: user.region ?? '',
    district: user.district ?? '',
    bio: user.bio ?? '',
  })
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }))
  }

  const handleSubmit = () => {
    setError(null)
    if (!form.prenom.trim()) {
      setError('Le prénom est requis')
      return
    }
    startTransition(async () => {
      try {
        await updateUserInfoAdmin(user.id, form)
        setOpen(false)
        router.refresh()
      } catch (e: any) {
        setError(e?.message || "Échec de la mise à jour")
      }
    })
  }

  return (
    <>
      <button
        type="button"
        className="admin-btn admin-btn-outline"
        onClick={() => setOpen(true)}
        style={{ gap: '0.5rem' }}
      >
        <Edit3 size={14} />
        Modifier les informations
      </button>

      {open && (
        <div className="admin-modal-backdrop" onClick={() => !isPending && setOpen(false)}>
          <div className="admin-modal-panel admin-modal-panel-lg" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div className="admin-modal-title">
                <Edit3 size={18} />
                Modifier les informations
              </div>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => !isPending && setOpen(false)}
                aria-label="Fermer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="admin-modal-body">
              <div className="admin-modal-grid-2">
                <div>
                  <label className="admin-modal-label">Prénom *</label>
                  <input className="admin-modal-input" value={form.prenom} onChange={update('prenom')} />
                </div>
                <div>
                  <label className="admin-modal-label">Nom</label>
                  <input className="admin-modal-input" value={form.nom} onChange={update('nom')} />
                </div>
                <div>
                  <label className="admin-modal-label">Email</label>
                  <input type="email" className="admin-modal-input" value={form.email} onChange={update('email')} />
                </div>
                <div>
                  <label className="admin-modal-label">Téléphone</label>
                  <input className="admin-modal-input" value={form.phone} onChange={update('phone')} />
                </div>
                <div>
                  <label className="admin-modal-label">Pseudo</label>
                  <input className="admin-modal-input" value={form.pseudo} onChange={update('pseudo')} />
                </div>
                <div>
                  <label className="admin-modal-label">Niveau scolaire</label>
                  <input className="admin-modal-input" value={form.schoolLevel} onChange={update('schoolLevel')} />
                </div>
                <div>
                  <label className="admin-modal-label">Région</label>
                  <input className="admin-modal-input" value={form.region} onChange={update('region')} />
                </div>
                <div>
                  <label className="admin-modal-label">District</label>
                  <input className="admin-modal-input" value={form.district} onChange={update('district')} />
                </div>
                <div className="admin-modal-grid-span-2">
                  <label className="admin-modal-label">Bio</label>
                  <textarea className="admin-modal-input" rows={3} value={form.bio} onChange={update('bio')} />
                </div>
              </div>

              {error && <div className="admin-modal-error">{error}</div>}
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn-outline"
                onClick={() => !isPending && setOpen(false)}
                disabled={isPending}
              >
                Annuler
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                onClick={handleSubmit}
                disabled={isPending}
              >
                <Check size={14} />
                {isPending ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ModalStyles />
    </>
  )
}

function ModalStyles() {
  return (
    <style jsx global>{`
      .admin-modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.55);
        backdrop-filter: blur(4px);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        animation: modalFadeIn 0.15s ease;
      }
      .admin-modal-panel {
        background: var(--card);
        border: 1px solid var(--b1);
        border-radius: var(--r-lg, 16px);
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.4);
        width: 100%;
        max-width: 440px;
        max-height: 90vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        animation: modalSlideIn 0.2s ease;
      }
      .admin-modal-panel-lg {
        max-width: 640px;
      }
      .admin-modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.1rem 1.25rem;
        border-bottom: 1px solid var(--b2);
      }
      .admin-modal-title {
        display: flex;
        align-items: center;
        gap: 0.55rem;
        font-family: var(--display);
        font-size: 1.1rem;
        color: var(--text);
      }
      .admin-modal-close {
        background: transparent;
        border: none;
        color: var(--text-3);
        padding: 0.35rem;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.15s, color 0.15s;
      }
      .admin-modal-close:hover {
        background: var(--surface);
        color: var(--text);
      }
      .admin-modal-body {
        padding: 1.25rem;
        overflow-y: auto;
        flex: 1;
      }
      .admin-modal-note {
        font-size: 0.85rem;
        color: var(--text-3);
        margin-bottom: 1rem;
      }
      .admin-modal-note strong {
        color: var(--gold);
        font-family: var(--mono);
      }
      .admin-modal-label {
        display: block;
        font-family: var(--mono);
        font-size: 0.62rem;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--text-3);
        margin-bottom: 0.4rem;
        margin-top: 0.85rem;
      }
      .admin-modal-label:first-child {
        margin-top: 0;
      }
      .admin-modal-input {
        width: 100%;
        background: var(--surface);
        border: 1px solid var(--b2);
        border-radius: var(--r);
        padding: 0.6rem 0.85rem;
        font-family: var(--body);
        font-size: 0.88rem;
        color: var(--text);
        outline: none;
        transition: border-color 0.15s, box-shadow 0.15s;
      }
      .admin-modal-input:focus {
        border-color: var(--gold);
        box-shadow: 0 0 0 3px var(--gold-dim);
      }
      .admin-modal-grid-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.85rem 1rem;
      }
      .admin-modal-grid-2 > div label {
        margin-top: 0;
      }
      .admin-modal-grid-span-2 {
        grid-column: span 2;
      }
      .admin-modal-error {
        margin-top: 0.85rem;
        padding: 0.65rem 0.85rem;
        background: var(--ruby-dim, rgba(155, 35, 53, 0.1));
        border: 1px solid var(--ruby-line, rgba(155, 35, 53, 0.3));
        border-radius: var(--r);
        color: var(--ruby);
        font-size: 0.82rem;
      }
      .admin-modal-footer {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 0.6rem;
        padding: 1rem 1.25rem;
        border-top: 1px solid var(--b2);
        background: var(--surface);
      }
      .admin-toggle-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.5rem;
        margin-bottom: 0.75rem;
      }
      .admin-toggle-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.35rem;
        padding: 0.55rem 0.75rem;
        background: var(--surface);
        border: 1px solid var(--b2);
        border-radius: var(--r);
        color: var(--text-3);
        font-size: 0.8rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.15s;
      }
      .admin-toggle-btn:hover {
        color: var(--text);
      }
      .admin-toggle-btn.active.add {
        background: var(--sage-dim, rgba(0, 255, 136, 0.1));
        border-color: var(--sage, #00FF88);
        color: var(--sage, #00FF88);
      }
      .admin-toggle-btn.active.subtract {
        background: var(--ruby-dim, rgba(155, 35, 53, 0.1));
        border-color: var(--ruby);
        color: var(--ruby);
      }
      @keyframes modalFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes modalSlideIn {
        from { opacity: 0; transform: translateY(8px) scale(0.98); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      @media (max-width: 600px) {
        .admin-modal-grid-2 {
          grid-template-columns: 1fr;
        }
        .admin-modal-grid-span-2 {
          grid-column: span 1;
        }
      }
    `}</style>
  )
}
