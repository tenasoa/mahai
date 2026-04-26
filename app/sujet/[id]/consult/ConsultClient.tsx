'use client'

/**
 * ConsultClient — Vue lecture intégrale d'un sujet acheté + téléchargement PDF tracé.
 *
 * - Rend le contenu TipTap via <SubjectRenderer /> (mêmes extensions que l'éditeur).
 * - Bouton « Télécharger le PDF » :
 *     1. Appelle `recordSubjectDownload(subjectId)` côté serveur (insère une ligne
 *        SubjectDownload + génère un code filigrane unique).
 *     2. Génère le PDF avec @react-pdf/renderer et déclenche le download navigateur.
 *     3. Le filigrane et le pied de page contiennent le code de traçabilité.
 */

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, Download, Loader2, GraduationCap, Sparkles } from 'lucide-react'
import { recordSubjectDownload } from '@/actions/subject-download'
import { SubjectRenderer } from '@/components/sujet/SubjectRenderer'
import { AICorrectionView } from '@/components/sujet/AICorrectionView'
import { getLatestAICorrection } from '@/actions/ai-correction'
import type { AICorrectionResult } from '@/lib/ai/schemas'
import type { SubjectPDFMeta } from '@/components/sujet/SubjectPDF'

interface ConsultSubject {
  id: string
  titre: string
  matiere: string
  annee: string
  type?: string
  serie?: string | null
  pages?: number | null
  duree?: string | null
  coefficient?: number | string | null
  examType?: string | null
  baccType?: string | null
  bepcOption?: string | null
  concoursType?: string | null
  etablissement?: string | null
  filiere?: string | null
  semestre?: string | null
  anneeScolaire?: string | null
  dateOfficielle?: string | null
  authorName?: string | null
  hasCorrectionIa?: boolean | null
  hasCorrectionProf?: boolean | null
  content?: any
}

interface Props {
  subject: ConsultSubject
}

function slugifyForFilename(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .toLowerCase()
    .slice(0, 60)
}

export function ConsultClient({ subject }: Props) {
  const searchParams = useSearchParams()
  const focusCorrection = searchParams.get('view') === 'correction'
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [aiCorrection, setAiCorrection] = useState<{
    result: AICorrectionResult
    mode: 'SUBMISSION' | 'DIRECT'
    createdAt: string
  } | null>(null)
  const [includeCorrection, setIncludeCorrection] = useState<boolean>(true)
  const correctionSectionRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    let cancelled = false
    async function loadCorrection() {
      try {
        const res = await getLatestAICorrection(subject.id)
        if (cancelled) return
        if (res.success && res.data) {
          setAiCorrection({
            result: res.data.result,
            mode: res.data.mode,
            createdAt: res.data.createdAt,
          })
        }
      } catch (err) {
        // L'absence de correction ne doit pas bloquer la consultation.
        console.error('load latest AI correction error:', err)
      }
    }
    void loadCorrection()
    return () => {
      cancelled = true
    }
  }, [subject.id])

  useEffect(() => {
    if (searchParams.get('view') !== 'correction') return
    if (!aiCorrection) return
    const id = window.setTimeout(() => {
      correctionSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
    return () => window.clearTimeout(id)
  }, [searchParams, aiCorrection])

  async function handleDownload() {
    if (isDownloading) return
    setDownloadError(null)
    setIsDownloading(true)
    try {
      const trace = await recordSubjectDownload(subject.id)
      if (!trace.success) {
        setDownloadError(trace.error || 'Téléchargement refusé.')
        return
      }

      // Import dynamique : @react-pdf/renderer pèse lourd, on ne le charge qu'au clic.
      const [{ pdf }, { default: SubjectPDF }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('@/components/sujet/SubjectPDF'),
      ])

      const meta: SubjectPDFMeta = {
        title: subject.titre,
        matiere: subject.matiere,
        examType: subject.examType || subject.type || undefined,
        baccType: subject.baccType || undefined,
        bepcOption: subject.bepcOption || undefined,
        concoursType: subject.concoursType || undefined,
        etablissement: subject.etablissement || undefined,
        filiere: subject.filiere || undefined,
        semestre: subject.semestre || undefined,
        serie: subject.serie || undefined,
        anneeScolaire: subject.anneeScolaire || subject.annee || undefined,
        dateOfficielle: subject.dateOfficielle || undefined,
        duree: subject.duree || undefined,
        coefficient: subject.coefficient ?? undefined,
        authorName: subject.authorName || undefined,
      }

      const shouldIncludeCorr = includeCorrection && !!aiCorrection
      const blob = await pdf(
        <SubjectPDF
          content={subject.content || { type: 'doc', content: [] }}
          meta={meta}
          trace={{
            watermarkCode: trace.data.watermarkCode,
            userEmail: trace.data.userEmail,
            userName: trace.data.userName,
            downloadedAt: trace.data.downloadedAt,
          }}
          aiCorrection={shouldIncludeCorr ? aiCorrection!.result : null}
          aiCorrectionMode={shouldIncludeCorr ? aiCorrection!.mode : undefined}
        />
      ).toBlob()

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `mahai-${slugifyForFilename(subject.titre)}-${trace.data.watermarkCode}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      // libère l'URL après un instant — laisse au navigateur le temps d'attraper le clic.
      setTimeout(() => URL.revokeObjectURL(url), 5000)
    } catch (err) {
      console.error('PDF download error:', err)
      setDownloadError('Erreur lors de la génération du PDF.')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="consult-page">
      <header className="consult-header">
        <div className="consult-header-inner">
          <Link href={`/sujet/${subject.id}`} className="consult-back">
            <ArrowLeft size={16} /> Retour
          </Link>

          <div className="consult-title-block">
            <p className="consult-eyebrow">
              {[subject.matiere, subject.examType || subject.type, subject.anneeScolaire || subject.annee]
                .filter(Boolean)
                .join(' · ')}
            </p>
            <h1>{subject.titre}</h1>
          </div>

          <div className="consult-actions">
            {aiCorrection && (
              <label className="consult-include-corr">
                <input
                  type="checkbox"
                  checked={includeCorrection}
                  onChange={(e) => setIncludeCorrection(e.target.checked)}
                />
                <span>Inclure la correction IA</span>
              </label>
            )}
            <button
              className="consult-btn-primary"
              onClick={handleDownload}
              disabled={isDownloading}
              aria-busy={isDownloading}
            >
              {isDownloading ? (
                <>
                  <Loader2 size={16} className="spin" /> Préparation…
                </>
              ) : (
                <>
                  <Download size={16} />
                  {aiCorrection && includeCorrection
                    ? 'Télécharger PDF (sujet + correction)'
                    : 'Télécharger le PDF'}
                </>
              )}
            </button>
          </div>
        </div>

        {downloadError && (
          <div className="consult-error" role="alert">
            {downloadError}
          </div>
        )}
      </header>

      <main className="consult-main">
        {focusCorrection && (
          <div className={`consult-correction-notice ${aiCorrection ? 'ready' : 'loading'}`} role="status">
            {aiCorrection
              ? '✅ Correction IA prête — consultez les explications ci-dessous puis téléchargez votre PDF.'
              : '⏳ Préparation de votre correction IA…'}
          </div>
        )}

        <SubjectRenderer content={subject.content} />

        {aiCorrection && (
          <section className="consult-ai-section" ref={correctionSectionRef} id="ai-correction">
            <header className="consult-ai-section-head">
              <div>
                <p className="consult-ai-eyebrow">
                  <Sparkles size={12} />
                  {aiCorrection.mode === 'SUBMISSION'
                    ? 'Votre correction IA'
                    : 'Correction IA modèle'}
                </p>
                <h2>Correction IA générée pour ce sujet</h2>
              </div>
              <Link className="consult-ai-link" href={`/sujet/${subject.id}`}>
                Refaire l'exercice
              </Link>
            </header>
            <AICorrectionView
              result={aiCorrection.result}
              mode={aiCorrection.mode}
              createdAt={aiCorrection.createdAt}
            />
          </section>
        )}

        {!aiCorrection && (subject.hasCorrectionIa || subject.hasCorrectionProf) && (
          <section className="consult-correction-grid">
            {subject.hasCorrectionIa && (
              <div className="consult-corr-card">
                <div className="consult-corr-head">
                  <Sparkles size={20} />
                  <h2>Correction IA</h2>
                </div>
                <p>Lancez une correction IA depuis la page du sujet pour la consulter ici.</p>
                <Link className="consult-corr-btn" href={`/sujet/${subject.id}`}>
                  Demander une correction IA
                </Link>
              </div>
            )}
            {subject.hasCorrectionProf && (
              <div className="consult-corr-card consult-corr-card-prof">
                <div className="consult-corr-head">
                  <GraduationCap size={20} />
                  <h2>Correction Prof</h2>
                </div>
                <p>Correction détaillée par un professeur expert.</p>
                <button className="consult-corr-btn">Voir la correction Prof</button>
              </div>
            )}
          </section>
        )}

        <footer className="consult-trace-note">
          Chaque téléchargement génère un code filigrane unique apposé sur le PDF
          (page de garde, pied de page, et arrière-plan diagonal). Ce code permet
          de remonter à l'utilisateur en cas de revente non autorisée.
        </footer>
      </main>

      <style jsx>{`
        .consult-page {
          min-height: 100vh;
          background: var(--void);
          color: var(--text);
        }
        .consult-header {
          position: sticky;
          top: 0;
          z-index: 30;
          background: color-mix(in srgb, var(--void) 92%, transparent);
          backdrop-filter: saturate(160%) blur(10px);
          border-bottom: 1px solid var(--b1);
        }
        .consult-header-inner {
          max-width: 1080px;
          margin: 0 auto;
          padding: 0.9rem 1.25rem;
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 1rem;
        }
        .consult-back {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.5rem 0.75rem;
          color: var(--text-2);
          text-decoration: none;
          font-size: 0.85rem;
          border-radius: 8px;
          transition: background 0.2s;
        }
        .consult-back:hover {
          background: var(--lift);
          color: var(--text);
        }
        .consult-title-block { min-width: 0; }
        .consult-eyebrow {
          font-size: 0.7rem;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          color: var(--gold, #C9A84C);
          margin: 0 0 0.25rem;
        }
        .consult-title-block h1 {
          font-family: var(--font-display, serif);
          font-size: 1.05rem;
          font-weight: 600;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .consult-actions { display: flex; align-items: center; gap: 0.75rem; }
        .consult-include-corr {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.78rem;
          color: var(--text-2, rgba(255, 255, 255, 0.7));
          cursor: pointer;
          user-select: none;
        }
        .consult-include-corr input { accent-color: var(--gold, #C9A84C); cursor: pointer; }
        .consult-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.6rem 1rem;
          background: var(--gold, #C9A84C);
          color: #0c0c0e;
          border: 0;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: filter 0.2s, transform 0.2s;
          box-shadow: 0 6px 20px rgba(201, 168, 76, 0.25);
        }
        .consult-btn-primary:hover:not(:disabled) {
          filter: brightness(1.08);
          transform: translateY(-1px);
        }
        .consult-btn-primary:disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }
        .spin { animation: consult-spin 0.9s linear infinite; }
        @keyframes consult-spin { to { transform: rotate(360deg); } }

        .consult-error {
          max-width: 1080px;
          margin: 0 auto;
          padding: 0.6rem 1.25rem;
          color: #ff6b9d;
          font-size: 0.82rem;
        }

        .consult-main {
          max-width: 1080px;
          margin: 0 auto;
          padding: 2rem 1.25rem 4rem;
        }

        .consult-correction-notice {
          margin-bottom: 1rem;
          padding: 0.75rem 0.95rem;
          border-radius: 10px;
          font-size: 0.82rem;
          line-height: 1.45;
          border: 1px solid;
        }
        .consult-correction-notice.ready {
          background: rgba(110, 170, 140, 0.1);
          border-color: rgba(110, 170, 140, 0.35);
          color: #2d6b4e;
        }
        .consult-correction-notice.loading {
          background: var(--gold-dim, rgba(201, 168, 76, 0.08));
          border-color: var(--gold-line, rgba(201, 168, 76, 0.35));
          color: var(--gold, #C9A84C);
        }

        .consult-ai-section {
          margin-top: 2.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .consult-ai-section-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .consult-ai-section-head h2 {
          font-family: var(--display);
          font-size: 1.15rem;
          margin: 0.2rem 0 0;
          color: var(--text);
        }
        .consult-ai-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.7rem;
          letter-spacing: 1.4px;
          text-transform: uppercase;
          color: var(--gold, #C9A84C);
          margin: 0;
        }
        .consult-ai-link {
          font-size: 0.82rem;
          color: var(--gold, #C9A84C);
          text-decoration: none;
          padding: 0.4rem 0.8rem;
          border: 1px solid var(--gold-line, rgba(201, 168, 76, 0.35));
          border-radius: 8px;
          transition: background 0.2s;
        }
        .consult-ai-link:hover {
          background: var(--gold-dim, rgba(201, 168, 76, 0.08));
        }

        .consult-correction-grid {
          margin-top: 2.5rem;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1rem;
        }
        .consult-corr-card {
          padding: 1.25rem;
          border-radius: 14px;
          border: 1px solid var(--b1);
          background: var(--card);
        }
        .consult-corr-head {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          margin-bottom: 0.5rem;
          color: var(--gold, #C9A84C);
        }
        .consult-corr-head h2 {
          font-size: 1rem;
          margin: 0;
          color: var(--text);
        }
        .consult-corr-card p {
          color: var(--text-3);
          font-size: 0.85rem;
          margin: 0 0 1rem;
        }
        .consult-corr-btn {
          width: 100%;
          padding: 0.65rem 1rem;
          border: 1px solid var(--gold-line, rgba(201, 168, 76, 0.35));
          background: transparent;
          color: var(--gold, #C9A84C);
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.85rem;
          transition: background 0.2s;
        }
        .consult-corr-btn:hover {
          background: var(--gold-dim, rgba(201, 168, 76, 0.08));
        }
        .consult-corr-card-prof .consult-corr-head { color: #6EAA8C; }
        .consult-corr-card-prof .consult-corr-btn {
          color: #6EAA8C;
          border-color: rgba(110, 170, 140, 0.35);
        }
        .consult-corr-card-prof .consult-corr-btn:hover {
          background: rgba(110, 170, 140, 0.08);
        }

        .consult-trace-note {
          margin-top: 3rem;
          padding: 1rem 1.25rem;
          font-size: 0.78rem;
          color: var(--text-3);
          border-top: 1px dashed var(--b1);
          line-height: 1.6;
          text-align: center;
        }

        @media (max-width: 720px) {
          .consult-header-inner {
            grid-template-columns: auto 1fr;
            grid-template-areas: 'back actions' 'title title';
            row-gap: 0.5rem;
          }
          .consult-back { grid-area: back; }
          .consult-actions { grid-area: actions; justify-content: flex-end; }
          .consult-title-block { grid-area: title; }
          .consult-title-block h1 {
            white-space: normal;
            font-size: 1rem;
          }
          .consult-btn-primary {
            padding: 0.55rem 0.85rem;
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  )
}
