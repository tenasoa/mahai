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
import { PDFGeneratingOverlay, AIProcessingLoadingCompact } from '@/components/ui/AIProcessingLoading'
import type { AICorrectionResult } from '@/lib/ai/schemas'

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

function buildSubjectHeader(subject: ConsultSubject): HTMLElement {
  const wrap = document.createElement('div')
  wrap.style.cssText = [
    'font-family:ui-sans-serif,system-ui,-apple-system,sans-serif',
    'padding:0 0 20px',
    'margin-bottom:24px',
    'border-bottom:1.5px solid #C9A84C',
  ].join(';')

  const brand = document.createElement('div')
  brand.style.cssText = 'font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#C9A84C;margin-bottom:10px;font-weight:600;'
  brand.textContent = 'Mah.AI · Annales Madagascar'
  wrap.appendChild(brand)

  const title = document.createElement('h1')
  title.style.cssText = 'font-size:20px;font-weight:700;color:#0c0c0e;margin:0 0 14px;line-height:1.3;font-family:inherit;'
  title.textContent = subject.titre
  wrap.appendChild(title)

  const chips = document.createElement('div')
  chips.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px 18px;'

  const addChip = (label: string, value: string | null | undefined) => {
    if (!value) return
    const chip = document.createElement('span')
    chip.style.cssText = 'font-size:12px;color:#555;'
    chip.innerHTML = `<span style="color:#999;margin-right:3px;">${label} :</span><span style="color:#0c0c0e;font-weight:600;">${value}</span>`
    chips.appendChild(chip)
  }

  addChip('Matière', subject.matiere)
  const examLabel = [subject.examType || subject.type, subject.serie].filter(Boolean).join(' · ')
  if (examLabel) addChip('Examen', examLabel)
  addChip('Année', subject.anneeScolaire || subject.annee)
  if (subject.etablissement) addChip('Établissement', subject.etablissement)
  if (subject.duree) addChip('Durée', subject.duree)
  if (subject.coefficient) addChip('Coefficient', String(subject.coefficient))

  wrap.appendChild(chips)
  return wrap
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
  const [correctionLoadError, setCorrectionLoadError] = useState<string | null>(null)
  const [correctionLoading, setCorrectionLoading] = useState(focusCorrection)
  const [includeCorrection, setIncludeCorrection] = useState<boolean>(true)
  const correctionSectionRef = useRef<HTMLElement | null>(null)
  const subjectContentRef = useRef<HTMLDivElement | null>(null)
  const aiCorrectionDOMRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let cancelled = false
    async function loadCorrection() {
      setCorrectionLoading(true)
      try {
        const res = await getLatestAICorrection(subject.id)
        if (cancelled) return
        if (res.success && res.data) {
          setAiCorrection({
            result: res.data.result,
            mode: res.data.mode,
            createdAt: res.data.createdAt,
          })
        } else if (!res.success) {
          setCorrectionLoadError(res.error)
        }
      } catch (err) {
        if (!cancelled) setCorrectionLoadError('Impossible de charger la correction.')
        console.error('load latest AI correction error:', err)
      } finally {
        if (!cancelled) setCorrectionLoading(false)
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

      const [{ htmlElementToPDFPages }, { PDFDocument }] = await Promise.all([
        import('@/lib/html-to-pdf'),
        import('pdf-lib'),
      ])

      const pdfTrace = {
        code: trace.data.watermarkCode,
        userName: trace.data.userName,
        userEmail: trace.data.userEmail,
        downloadedAt: trace.data.downloadedAt,
      }

      // ── Étape 1 : Capture du sujet depuis le DOM ──────────────────────────
      if (!subjectContentRef.current) throw new Error('Contenu du sujet introuvable.')

      const subjectWrap = document.createElement('div')
      subjectWrap.style.cssText = [
        'position:fixed', 'left:-9999px', 'top:0',
        'width:780px', 'padding:32px 36px 40px',
        'background:#ffffff', 'box-sizing:border-box',
      ].join(';')

      subjectWrap.appendChild(buildSubjectHeader(subject))
      subjectWrap.appendChild(subjectContentRef.current.cloneNode(true) as HTMLElement)
      document.body.appendChild(subjectWrap)

      await new Promise(r => setTimeout(r, 200))

      const subjectBytes = await htmlElementToPDFPages(subjectWrap, {
        scale: 3,
        marginMm: 14,
        trace: pdfTrace,
        sectionLabel: subject.matiere || 'Sujet',
      })

      try { document.body.removeChild(subjectWrap) } catch { /* déjà retiré */ }

      // ── Étape 2 : Capture correction IA depuis le DOM rendu ───────────────
      let finalBytes = subjectBytes
      if (includeCorrection && aiCorrection && aiCorrectionDOMRef.current) {
        try {
          const printWrap = document.createElement('div')
          printWrap.style.cssText = [
            'position:fixed', 'left:-9999px', 'top:0',
            'width:780px', 'padding:28px 32px 40px',
            'background:#ffffff', 'box-sizing:border-box',
          ].join(';')

          printWrap.appendChild(aiCorrectionDOMRef.current.cloneNode(true) as HTMLElement)
          document.body.appendChild(printWrap)

          await new Promise(r => setTimeout(r, 200))

          // Fix KaTeX em → px (html2canvas calcule mal les em relatifs des fractions)
          for (const el of Array.from(
            printWrap.querySelectorAll<HTMLElement>('.katex .vlist > span')
          )) {
            const computed = window.getComputedStyle(el)
            if (computed.position !== 'static') {
              const topPx = parseFloat(computed.top)
              if (!isNaN(topPx)) el.style.top = `${topPx}px`
            }
          }
          for (const el of Array.from(
            printWrap.querySelectorAll<HTMLElement>(
              '.katex, .katex-html, .katex .vlist-t, .katex .vlist-r, .katex .vlist, .katex .mfrac'
            )
          )) {
            el.style.overflow = 'visible'
          }

          const corrBytes = await htmlElementToPDFPages(printWrap, {
            scale: 3,
            marginMm: 14,
            trace: pdfTrace,
            sectionLabel: 'Correction IA',
          })

          try { document.body.removeChild(printWrap) } catch { /* déjà retiré */ }

          // Fusion sujet + correction via pdf-lib
          const [subjectDoc, corrDoc] = await Promise.all([
            PDFDocument.load(subjectBytes),
            PDFDocument.load(corrBytes),
          ])
          const copiedPages = await subjectDoc.copyPages(corrDoc, corrDoc.getPageIndices())
          copiedPages.forEach(p => subjectDoc.addPage(p))
          finalBytes = await subjectDoc.save()
        } catch (corrErr) {
          console.error('[pdf] correction capture failed, using subject-only PDF:', corrErr)
        }
      }

      // ── Étape 3 : Déclenchement du téléchargement ─────────────────────────
      const finalBlob = new Blob([finalBytes.buffer as ArrayBuffer], { type: 'application/pdf' })
      const url = URL.createObjectURL(finalBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `mahai-${slugifyForFilename(subject.titre)}-${trace.data.watermarkCode}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 5000)
    } catch (err) {
      console.error('[pdf] download error:', err)
      setDownloadError('Erreur lors de la génération du PDF.')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="consult-page">
      <PDFGeneratingOverlay isOpen={isDownloading} />
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
        {focusCorrection && !aiCorrection && correctionLoadError && (
          <div className="consult-correction-notice error" role="alert">
            ⚠ Impossible de charger la correction : {correctionLoadError}
          </div>
        )}
        {focusCorrection && !aiCorrection && correctionLoading && !correctionLoadError && (
          <div className="consult-correction-notice loading" role="status">
            <AIProcessingLoadingCompact message="Chargement de votre correction IA…" />
          </div>
        )}
        {focusCorrection && aiCorrection && (
          <div className="consult-correction-notice ready" role="status">
            ✅ Correction IA prête — consultez les explications ci-dessous puis téléchargez votre PDF.
          </div>
        )}

        <div ref={subjectContentRef}>
          <SubjectRenderer content={subject.content} />
        </div>

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
            <div ref={aiCorrectionDOMRef}>
              <AICorrectionView
                result={aiCorrection.result}
                mode={aiCorrection.mode}
                createdAt={aiCorrection.createdAt}
              />
            </div>
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
          padding-top: 64px;
        }
        .consult-header {
          position: sticky;
          top: 64px;
          z-index: 30;
          background: color-mix(in srgb, var(--void) 92%, transparent);
          backdrop-filter: saturate(160%) blur(10px);
          border-bottom: 1px solid var(--b1);
        }
        .consult-header-inner {
          max-width: var(--page-max-w, 1400px);
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
          max-width: var(--page-max-w, 1400px);
          margin: 0 auto;
          padding: 0.6rem 1.25rem;
          color: #ff6b9d;
          font-size: 0.82rem;
        }

        .consult-main {
          max-width: var(--page-max-w, 1400px);
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
          color: #6EAA8C;
        }
        .consult-correction-notice.loading {
          background: var(--gold-dim, rgba(201, 168, 76, 0.08));
          border-color: var(--gold-line, rgba(201, 168, 76, 0.35));
          color: var(--gold, #C9A84C);
        }
        .consult-correction-notice.error {
          background: rgba(224, 85, 117, 0.08);
          border-color: rgba(224, 85, 117, 0.35);
          color: #E05575;
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
