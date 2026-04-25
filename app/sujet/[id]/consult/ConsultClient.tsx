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

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download, Loader2, Bot, GraduationCap } from 'lucide-react'
import { recordSubjectDownload } from '@/actions/subject-download'
import { SubjectRenderer } from '@/components/sujet/SubjectRenderer'
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
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)

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
                  <Download size={16} /> Télécharger le PDF
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
        <SubjectRenderer content={subject.content} />

        {(subject.hasCorrectionIa || subject.hasCorrectionProf) && (
          <section className="consult-correction-grid">
            {subject.hasCorrectionIa && (
              <div className="consult-corr-card">
                <div className="consult-corr-head">
                  <Bot size={20} />
                  <h2>Correction IA</h2>
                </div>
                <p>Correction détaillée générée par intelligence artificielle.</p>
                <button className="consult-corr-btn">Voir la correction IA</button>
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
          color: var(--text-1, #fff);
        }
        .consult-header {
          position: sticky;
          top: 0;
          z-index: 30;
          background: rgba(12, 12, 14, 0.92);
          backdrop-filter: saturate(160%) blur(10px);
          border-bottom: 1px solid var(--border-1, rgba(255, 255, 255, 0.08));
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
          color: var(--text-2, rgba(255, 255, 255, 0.7));
          text-decoration: none;
          font-size: 0.85rem;
          border-radius: 8px;
          transition: background 0.2s;
        }
        .consult-back:hover {
          background: var(--lift, rgba(255, 255, 255, 0.04));
          color: var(--text-1, #fff);
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
        .consult-actions { display: flex; gap: 0.5rem; }
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

        .consult-correction-grid {
          margin-top: 2.5rem;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1rem;
        }
        .consult-corr-card {
          padding: 1.25rem;
          border-radius: 14px;
          border: 1px solid var(--border-1, rgba(255, 255, 255, 0.08));
          background: var(--card, rgba(255, 255, 255, 0.02));
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
          color: var(--text-1, #fff);
        }
        .consult-corr-card p {
          color: var(--text-3, rgba(255, 255, 255, 0.6));
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
          color: var(--text-3, rgba(255, 255, 255, 0.55));
          border-top: 1px dashed var(--border-1, rgba(255, 255, 255, 0.1));
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
