'use client'

/**
 * SubmitWizardClient — wizard 4 étapes de publication post-édition.
 *
 * Inspiré de widgets/mah-ai-editor.html (Validation + Tarif & Publication).
 * Accessible depuis le bouton « Publier » de l'EditorNavbar.
 *
 * Étapes :
 *  1. Aperçu       — preview lecture seule du sujet via SubjectRenderer
 *  2. Validation   — checks automatiques (titre/matière/contenu/prix/etc.)
 *  3. Tarification — récap revenus 70/30 + ajustement prix possible
 *  4. Confirmation — case acceptation CGU + bouton final « Soumettre »
 *
 * Si une étape de validation échoue, on bloque le passage à la suivante.
 * À la soumission, on appelle submitSubject() qui met le statut SUBMITTED
 * et notifie les admins.
 */

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import StepsBar from '@/components/editor/StepsBar'
import { SubjectRenderer } from '@/components/sujet/SubjectRenderer'
import Badge from '@/components/ui/Badge/Badge'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import { submitSubject } from '../../editor-actions'

interface DraftPayload {
  title: string
  matiere: string
  examType: string
  baccType: string
  bepcOption: string
  serie: string
  concoursType: string
  anneeScolaire: string
  duree: string
  coefficient: string
  contentType: string
  tags: string[]
  prix: number
  prixMode: string
  visibilite: string
  content: any
  status: string
}

interface Props {
  draftId: string
  draft: DraftPayload
}

interface Check {
  id: string
  label: string
  ok: boolean
  detail?: string
}

const STEPS = [
  { num: 1, label: 'Aperçu' },
  { num: 2, label: 'Validation' },
  { num: 3, label: 'Tarification' },
  { num: 4, label: 'Confirmation' },
]

function countQuestions(content: any): number {
  if (!content?.content) return 0
  let n = 0
  function walk(node: any) {
    if (!node) return
    if (node.type === 'question') n++
    if (Array.isArray(node.content)) node.content.forEach(walk)
  }
  walk(content)
  return n
}

function countWords(content: any): number {
  if (!content?.content) return 0
  let txt = ''
  function walk(node: any) {
    if (!node) return
    if (typeof node.text === 'string') txt += ' ' + node.text
    if (Array.isArray(node.content)) node.content.forEach(walk)
  }
  walk(content)
  return txt.trim().split(/\s+/).filter(Boolean).length
}

export default function SubmitWizardClient({ draftId, draft }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [acceptCGU, setAcceptCGU] = useState(false)
  const [pending, startTransition] = useTransition()
  const { toasts, addToast, removeToast } = useToast()

  // ── Calculs dérivés ─────────────────────────────────────────────
  const wordCount = countWords(draft.content)
  const questionCount = countQuestions(draft.content)
  const commission = Math.round(draft.prix * 0.3)
  const revenu = draft.prix - commission

  const checks: Check[] = [
    { id: 'title', label: 'Titre du sujet', ok: !!draft.title.trim(), detail: draft.title || 'Manquant' },
    { id: 'matiere', label: 'Matière', ok: !!draft.matiere.trim(), detail: draft.matiere || 'Manquante' },
    { id: 'examType', label: 'Type d\'examen', ok: !!draft.examType, detail: draft.examType || 'Manquant' },
    { id: 'annee', label: 'Année scolaire', ok: !!draft.anneeScolaire, detail: draft.anneeScolaire || 'Manquante' },
    { id: 'content', label: 'Contenu rédigé', ok: wordCount >= 20, detail: `${wordCount} mots` },
    { id: 'questions', label: 'Au moins une question', ok: questionCount > 0, detail: `${questionCount} question${questionCount > 1 ? 's' : ''}` },
    { id: 'prix', label: 'Prix > 0', ok: draft.prix > 0, detail: `${draft.prix.toLocaleString()} Ar` },
  ]

  const allChecksOk = checks.every((c) => c.ok)
  const failingChecks = checks.filter((c) => !c.ok)

  const canGoStep2 = true
  const canGoStep3 = allChecksOk
  const canGoStep4 = allChecksOk
  const canSubmit = allChecksOk && acceptCGU

  // ── Submit ──────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!canSubmit) return
    startTransition(async () => {
      try {
        const res = await submitSubject(draftId)
        if (res.success) {
          addToast(
            'Sujet soumis à la modération. Vous recevrez une notification dès la validation.',
            'success',
          )
          setTimeout(() => router.push('/contributeur/sujets'), 1500)
        } else if ('errors' in res && res.errors) {
          addToast(`Validation échouée : ${res.errors.join(', ')}`, 'error')
        } else if ('error' in res) {
          addToast(res.error || 'Erreur lors de la soumission', 'error')
        } else {
          addToast('Erreur inconnue lors de la soumission', 'error')
        }
      } catch (err) {
        addToast(err instanceof Error ? err.message : 'Erreur réseau', 'error')
      }
    })
  }

  return (
    <div className="submit-wizard">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* ─── Header ─── */}
      <header className="sw-header">
        <div className="sw-header-inner">
          <Link
            href={`/contributeur/sujets/${draftId}/edit`}
            className="sw-back"
            aria-label="Retour à l'éditeur"
          >
            <ArrowLeft size={14} />
            Retour à l'édition
          </Link>

          <div className="sw-title-block">
            <p className="sw-eyebrow">Publication</p>
            <h1>{draft.title || 'Sujet sans titre'}</h1>
            <p className="sw-subtitle">
              {[draft.matiere, draft.examType, draft.anneeScolaire].filter(Boolean).join(' · ')}
            </p>
          </div>

          <div className="sw-status">
            <Badge variant={draft.status === 'REVISION_REQUESTED' ? 'amber' : 'gold'} size="sm">
              {draft.status === 'REVISION_REQUESTED' ? 'Révision' : 'Brouillon'}
            </Badge>
          </div>
        </div>

        <div className="sw-stepsbar-wrap">
          <StepsBar
            steps={STEPS}
            current={step}
            onStepClick={(n) => {
              // Navigation libre vers l'étape précédente, pas vers une étape
              // future qui n'a pas validé ses checks.
              if (n < step) setStep(n)
              else if (n === 2 && canGoStep2) setStep(n)
              else if (n === 3 && canGoStep3) setStep(n)
              else if (n === 4 && canGoStep4) setStep(n)
            }}
          />
        </div>
      </header>

      {/* ─── Body ─── */}
      <main className="sw-main">

        {step === 1 && (
          <section className="sw-step">
            <div className="sw-step-head">
              <h2>Aperçu du sujet</h2>
              <p>Vérifiez le rendu lecture tel que vu par l'élève après achat.</p>
            </div>

            <div className="sw-stats-row">
              <div className="sw-stat">
                <span className="sw-stat-num">{wordCount.toLocaleString()}</span>
                <span className="sw-stat-label">mots</span>
              </div>
              <div className="sw-stat">
                <span className="sw-stat-num">{questionCount}</span>
                <span className="sw-stat-label">question{questionCount > 1 ? 's' : ''}</span>
              </div>
              <div className="sw-stat">
                <span className="sw-stat-num">{draft.duree || '—'}</span>
                <span className="sw-stat-label">durée</span>
              </div>
              <div className="sw-stat">
                <span className="sw-stat-num">{draft.coefficient || '—'}</span>
                <span className="sw-stat-label">coefficient</span>
              </div>
            </div>

            <div className="sw-preview">
              <SubjectRenderer content={draft.content} />
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="sw-step">
            <div className="sw-step-head">
              <h2>Validation pré-soumission</h2>
              <p>
                {allChecksOk
                  ? '✓ Toutes les vérifications sont passées. Vous pouvez continuer.'
                  : `${failingChecks.length} point${failingChecks.length > 1 ? 's' : ''} à corriger avant de pouvoir publier.`}
              </p>
            </div>

            <ul className="sw-checks">
              {checks.map((c) => (
                <li
                  key={c.id}
                  className={`sw-check sw-check--${c.ok ? 'ok' : 'fail'}`}
                >
                  <span className="sw-check-icon">
                    {c.ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  </span>
                  <div className="sw-check-text">
                    <span className="sw-check-label">{c.label}</span>
                    {c.detail && <span className="sw-check-detail">{c.detail}</span>}
                  </div>
                </li>
              ))}
            </ul>

            {!allChecksOk && (
              <div className="sw-fix-hint">
                <p>
                  Pour corriger ces points, retournez à l'éditeur :{' '}
                  <Link href={`/contributeur/sujets/${draftId}/edit`} className="sw-link">
                    Modifier le sujet →
                  </Link>
                </p>
              </div>
            )}
          </section>
        )}

        {step === 3 && (
          <section className="sw-step">
            <div className="sw-step-head">
              <h2>Tarification & revenus</h2>
              <p>Récapitulatif des conditions financières définies à la création.</p>
            </div>

            <div className="sw-pricing-grid">
              <div className="sw-pricing-card">
                <span className="sw-pricing-label">Prix affiché élève</span>
                <span className="sw-pricing-value">{draft.prix.toLocaleString()} <em>Ar</em></span>
                <span className="sw-pricing-mode">Mode : {draft.prixMode === 'forfait' ? 'Forfait' : 'Par page'}</span>
              </div>
              <div className="sw-pricing-card sw-pricing-card--neg">
                <span className="sw-pricing-label">Commission plateforme</span>
                <span className="sw-pricing-value">− {commission.toLocaleString()} <em>Ar</em></span>
                <span className="sw-pricing-mode">30 % du prix</span>
              </div>
              <div className="sw-pricing-card sw-pricing-card--gold">
                <span className="sw-pricing-label">Vos revenus nets</span>
                <span className="sw-pricing-value">{revenu.toLocaleString()} <em>Ar</em></span>
                <span className="sw-pricing-mode">70 % à chaque achat</span>
              </div>
            </div>

            <div className="sw-pricing-note">
              <p>
                Le prix sera réajustable depuis l'éditeur après publication. La commission Mah.AI est
                fixe à 30 % et finance l'hébergement, la modération et les corrections IA.
              </p>
              <Link href={`/contributeur/sujets/${draftId}/edit`} className="sw-link">
                Modifier la tarification →
              </Link>
            </div>
          </section>
        )}

        {step === 4 && (
          <section className="sw-step">
            <div className="sw-step-head">
              <h2>Confirmation et envoi</h2>
              <p>Dernière étape : acceptez les conditions puis envoyez à la modération.</p>
            </div>

            <div className="sw-summary">
              <div className="sw-summary-row">
                <span>Titre</span>
                <strong>{draft.title}</strong>
              </div>
              <div className="sw-summary-row">
                <span>Matière · Type · Année</span>
                <strong>{[draft.matiere, draft.examType, draft.anneeScolaire].filter(Boolean).join(' · ')}</strong>
              </div>
              <div className="sw-summary-row">
                <span>Volume rédigé</span>
                <strong>{wordCount} mots, {questionCount} question{questionCount > 1 ? 's' : ''}</strong>
              </div>
              <div className="sw-summary-row sw-summary-row--gold">
                <span>Vos revenus par achat</span>
                <strong>{revenu.toLocaleString()} Ar</strong>
              </div>
            </div>

            <label className="sw-cgu">
              <input
                type="checkbox"
                checked={acceptCGU}
                onChange={(e) => setAcceptCGU(e.target.checked)}
                disabled={pending}
              />
              <span>
                Je certifie être l'auteur du sujet (ou en avoir les droits) et accepte que Mah.AI le
                modère, le diffuse et le commercialise selon les{' '}
                <Link href="/legal/cgu" target="_blank" rel="noopener noreferrer" className="sw-link">
                  Conditions Générales d'Utilisation
                </Link>
                .
              </span>
            </label>

            <div className="sw-submit-row">
              <button
                className="sw-submit-btn"
                onClick={handleSubmit}
                disabled={!canSubmit || pending}
                aria-busy={pending}
              >
                {pending ? (
                  <>
                    <Loader2 size={16} className="sw-spin" />
                    Envoi en cours…
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Soumettre à la modération
                  </>
                )}
              </button>
              {!acceptCGU && allChecksOk && (
                <span className="sw-submit-hint">Cochez les CGU pour activer le bouton.</span>
              )}
            </div>
          </section>
        )}

        {/* ─── Footer (nav prev/next) ─── */}
        <footer className="sw-footer">
          <button
            className="sw-nav-btn"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1 || pending}
          >
            <ArrowLeft size={14} /> Précédent
          </button>

          <span className="sw-step-counter">
            {step} / {STEPS.length}
          </span>

          {step < STEPS.length ? (
            <button
              className="sw-nav-btn sw-nav-btn--primary"
              onClick={() => {
                if (step === 1 && canGoStep2) setStep(2)
                else if (step === 2 && canGoStep3) setStep(3)
                else if (step === 3 && canGoStep4) setStep(4)
              }}
              disabled={
                (step === 1 && !canGoStep2) ||
                (step === 2 && !canGoStep3) ||
                (step === 3 && !canGoStep4)
              }
            >
              Continuer <ArrowRight size={14} />
            </button>
          ) : (
            <span style={{ width: 110 }} />
          )}
        </footer>
      </main>

      <style jsx>{`
        .submit-wizard {
          min-height: 100vh;
          background: var(--void);
          color: var(--text);
        }
        .sw-header {
          background: var(--card);
          border-bottom: 1px solid var(--b1);
          position: sticky;
          top: 0;
          z-index: 30;
          backdrop-filter: saturate(160%) blur(10px);
        }
        .sw-header-inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: 1rem 1.5rem 0.5rem;
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 1.5rem;
          align-items: flex-start;
        }
        .sw-back {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.45rem 0.75rem;
          font-size: 0.78rem;
          color: var(--text-2);
          text-decoration: none;
          border-radius: var(--r-xs);
          transition: background 0.15s, color 0.15s;
          font-family: var(--mono);
          letter-spacing: 0.04em;
        }
        .sw-back:hover {
          background: var(--surface);
          color: var(--text);
        }
        .sw-title-block { min-width: 0; }
        .sw-eyebrow {
          font-family: var(--mono);
          font-size: 0.6rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--gold);
          margin: 0 0 0.2rem;
        }
        .sw-title-block h1 {
          font-family: var(--display);
          font-size: 1.55rem;
          font-weight: 500;
          letter-spacing: -0.012em;
          color: var(--text);
          margin: 0;
          line-height: 1.2;
        }
        .sw-subtitle {
          font-size: 0.78rem;
          color: var(--text-3);
          margin: 0.2rem 0 0;
        }
        .sw-status { padding-top: 0.4rem; }
        .sw-stepsbar-wrap {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 1.5rem 1rem;
          display: flex;
          justify-content: center;
        }

        .sw-main {
          max-width: 1100px;
          margin: 0 auto;
          padding: 2rem 1.5rem 4rem;
        }
        .sw-step {
          background: var(--card);
          border: 1px solid var(--b1);
          border-radius: var(--r-lg);
          padding: 1.75rem;
          box-shadow: var(--shadow-sm);
          animation: sw-fadeUp 0.32s ease both;
        }
        @keyframes sw-fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .sw-step-head {
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--b1);
          margin-bottom: 1.25rem;
        }
        .sw-step-head h2 {
          font-family: var(--display);
          font-size: 1.35rem;
          font-weight: 500;
          letter-spacing: -0.01em;
          color: var(--text);
          margin: 0 0 0.3rem;
        }
        .sw-step-head p {
          font-size: 0.85rem;
          color: var(--text-3);
          margin: 0;
        }

        /* Stats row (étape 1) */
        .sw-stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.85rem;
          margin-bottom: 1.5rem;
        }
        .sw-stat {
          padding: 0.85rem 1rem;
          background: var(--paper);
          border: 1px solid var(--b1);
          border-radius: var(--r-xs);
          text-align: center;
        }
        .sw-stat-num {
          display: block;
          font-family: var(--display);
          font-size: 1.6rem;
          font-weight: 500;
          color: var(--text);
          line-height: 1;
        }
        .sw-stat-label {
          display: block;
          margin-top: 0.32rem;
          font-family: var(--mono);
          font-size: 0.62rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-3);
        }

        .sw-preview {
          padding: 1rem;
          background: var(--paper);
          border: 1px solid var(--b1);
          border-radius: var(--r-xs);
        }

        /* Checks (étape 2) */
        .sw-checks {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .sw-check {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.85rem 1rem;
          border-radius: var(--r-xs);
          border: 1px solid;
        }
        .sw-check--ok {
          background: var(--sage-dim);
          border-color: var(--sage-line);
        }
        .sw-check--fail {
          background: var(--ruby-dim);
          border-color: var(--ruby-line);
        }
        .sw-check-icon { display: inline-flex; flex-shrink: 0; }
        .sw-check--ok .sw-check-icon { color: var(--sage); }
        .sw-check--fail .sw-check-icon { color: var(--ruby); }
        .sw-check-text {
          flex: 1;
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 1rem;
          min-width: 0;
        }
        .sw-check-label {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text);
        }
        .sw-check-detail {
          font-family: var(--mono);
          font-size: 0.72rem;
          color: var(--text-3);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sw-fix-hint {
          margin-top: 1rem;
          padding: 0.85rem 1rem;
          background: var(--gold-dim);
          border: 1px solid var(--gold-line);
          border-radius: var(--r-xs);
          font-size: 0.82rem;
          color: var(--text-2);
        }
        .sw-fix-hint p { margin: 0; }

        /* Pricing (étape 3) */
        .sw-pricing-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 0.85rem;
          margin-bottom: 1.25rem;
        }
        .sw-pricing-card {
          padding: 1.25rem 1rem;
          background: var(--paper);
          border: 1px solid var(--b1);
          border-radius: var(--r-xs);
          text-align: center;
        }
        .sw-pricing-card--neg { background: var(--surface); }
        .sw-pricing-card--gold {
          background: var(--gold-dim);
          border-color: var(--gold-line);
        }
        .sw-pricing-label {
          display: block;
          font-family: var(--mono);
          font-size: 0.6rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-3);
          margin-bottom: 0.5rem;
        }
        .sw-pricing-value {
          display: block;
          font-family: var(--display);
          font-size: 1.85rem;
          font-weight: 500;
          color: var(--text);
          line-height: 1;
        }
        .sw-pricing-card--gold .sw-pricing-value { color: var(--gold); }
        .sw-pricing-value em {
          font-size: 0.9rem;
          font-style: normal;
          color: var(--text-3);
          margin-left: 0.25rem;
        }
        .sw-pricing-mode {
          display: block;
          margin-top: 0.4rem;
          font-size: 0.7rem;
          color: var(--text-3);
        }
        .sw-pricing-note {
          padding: 1rem;
          background: var(--surface);
          border: 1px dashed var(--b1);
          border-radius: var(--r-xs);
          font-size: 0.82rem;
          color: var(--text-2);
          line-height: 1.55;
        }
        .sw-pricing-note p { margin: 0 0 0.5rem; }

        /* Confirmation (étape 4) */
        .sw-summary {
          margin-bottom: 1.25rem;
          padding: 1rem 1.25rem;
          background: var(--paper);
          border: 1px solid var(--b1);
          border-radius: var(--r-xs);
        }
        .sw-summary-row {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          padding: 0.5rem 0;
          font-size: 0.85rem;
          border-bottom: 1px solid var(--b1);
        }
        .sw-summary-row:last-child { border-bottom: none; }
        .sw-summary-row span {
          color: var(--text-3);
          font-family: var(--mono);
          font-size: 0.7rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .sw-summary-row strong {
          color: var(--text);
          font-weight: 500;
          text-align: right;
        }
        .sw-summary-row--gold strong { color: var(--gold); font-size: 0.95rem; }

        .sw-cgu {
          display: flex;
          gap: 0.65rem;
          padding: 1rem;
          background: var(--surface);
          border: 1px solid var(--b1);
          border-radius: var(--r-xs);
          font-size: 0.82rem;
          color: var(--text-2);
          line-height: 1.55;
          cursor: pointer;
          transition: border-color 0.15s;
        }
        .sw-cgu:hover { border-color: var(--gold-line); }
        .sw-cgu input {
          margin-top: 0.18rem;
          accent-color: var(--gold);
          flex-shrink: 0;
          width: 14px;
          height: 14px;
        }

        .sw-submit-row {
          margin-top: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .sw-submit-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: var(--ink);
          color: var(--cream);
          border: 1px solid var(--ink);
          border-radius: var(--r-xs);
          font-family: var(--body);
          font-size: 0.9rem;
          font-weight: 500;
          letter-spacing: 0.02em;
          cursor: pointer;
          transition: opacity 0.15s, transform 0.15s;
        }
        .sw-submit-btn:not(:disabled):hover {
          opacity: 0.88;
          transform: translateY(-1px);
        }
        .sw-submit-btn:disabled {
          background: var(--surface);
          color: var(--text-3);
          border-color: var(--b1);
          cursor: not-allowed;
          transform: none;
        }
        .sw-submit-hint {
          font-size: 0.78rem;
          color: var(--text-3);
          font-style: italic;
        }
        .sw-spin { animation: sw-rot 0.9s linear infinite; }
        @keyframes sw-rot { to { transform: rotate(360deg); } }

        /* Footer nav */
        .sw-footer {
          margin-top: 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 1rem;
          background: var(--card);
          border: 1px solid var(--b1);
          border-radius: var(--r-lg);
        }
        .sw-nav-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.55rem 1rem;
          background: transparent;
          color: var(--text-2);
          border: 1px solid var(--b1);
          border-radius: var(--r-xs);
          font-family: var(--body);
          font-size: 0.82rem;
          cursor: pointer;
          transition: all 0.15s;
          min-width: 110px;
          justify-content: center;
        }
        .sw-nav-btn:hover:not(:disabled) {
          border-color: var(--text);
          color: var(--text);
        }
        .sw-nav-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .sw-nav-btn--primary {
          background: var(--gold);
          color: var(--ink);
          border-color: var(--gold);
        }
        .sw-nav-btn--primary:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
          color: var(--ink);
        }

        .sw-step-counter {
          font-family: var(--mono);
          font-size: 0.72rem;
          color: var(--text-3);
          letter-spacing: 0.06em;
        }

        .sw-link {
          color: var(--gold);
          text-decoration: underline;
          text-decoration-color: var(--gold-line);
          text-underline-offset: 3px;
        }
        .sw-link:hover { text-decoration-color: var(--gold); }

        /* Responsive */
        @media (max-width: 720px) {
          .sw-header-inner {
            grid-template-columns: 1fr;
            grid-template-areas: 'back' 'title' 'status';
            row-gap: 0.5rem;
          }
          .sw-stats-row { grid-template-columns: 1fr 1fr; }
          .sw-pricing-grid { grid-template-columns: 1fr; }
          .sw-step { padding: 1.25rem; }
          .sw-title-block h1 { font-size: 1.25rem; }
        }
      `}</style>
    </div>
  )
}
