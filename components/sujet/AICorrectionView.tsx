'use client'

/**
 * AICorrectionView — affichage d'une correction IA (un objet AICorrectionResult).
 *
 * - Markdown via react-markdown + remark-gfm (listes, **gras**, *italique*).
 * - Maths LaTeX via remark-math + rehype-katex : `$x^2$` inline, `$$...$$` bloc.
 * - Verdict coloré par question (vert/jaune/rouge/gris) en mode SUBMISSION.
 * - En mode DIRECT : affiche le « modèle de correction » sans verdict.
 */

import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import remarkGfm from 'remark-gfm'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { Bot, Check, AlertCircle, X, FileQuestion, BookOpen } from 'lucide-react'
import type { AICorrectionResult, AICorrectionItem } from '@/lib/ai/schemas'

interface Props {
  result: AICorrectionResult
  mode: 'SUBMISSION' | 'DIRECT'
  createdAt?: string
}

const VERDICT_META: Record<
  AICorrectionItem['verdict'],
  { label: string; color: string; bg: string; border: string; Icon: typeof Check }
> = {
  correct: { label: 'Correct', color: '#6EAA8C', bg: 'rgba(110, 170, 140, 0.10)', border: 'rgba(110, 170, 140, 0.35)', Icon: Check },
  partial: { label: 'Partiel', color: '#C9A84C', bg: 'rgba(201, 168, 76, 0.10)', border: 'rgba(201, 168, 76, 0.35)', Icon: AlertCircle },
  incorrect: { label: 'Incorrect', color: '#E05575', bg: 'rgba(224, 85, 117, 0.10)', border: 'rgba(224, 85, 117, 0.35)', Icon: X },
  missing: { label: 'Non répondu', color: '#888', bg: 'rgba(136, 136, 136, 0.10)', border: 'rgba(136, 136, 136, 0.35)', Icon: FileQuestion },
  model: { label: 'Correction modèle', color: '#9bb7e0', bg: 'rgba(155, 183, 224, 0.10)', border: 'rgba(155, 183, 224, 0.35)', Icon: BookOpen },
}

function MD({ children }: { children: string }) {
  return (
    <div className="ai-md">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {children || ''}
      </ReactMarkdown>
    </div>
  )
}

export function AICorrectionView({ result, mode, createdAt }: Props) {
  const items = result.items || []
  const summary = result.summary

  return (
    <div className="ai-correction">
      <header className="ai-head">
        <div className="ai-head-icon">
          <Bot size={18} />
        </div>
        <div>
          <h3 className="ai-title">
            {mode === 'SUBMISSION' ? 'Correction IA de vos réponses' : 'Correction IA modèle'}
          </h3>
          <p className="ai-sub">
            Générée par Claude · {createdAt ? new Date(createdAt).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }) : "à l'instant"}
            {summary?.totalScore && summary.totalScore !== '—' && (
              <> · Note <strong>{summary.totalScore}</strong></>
            )}
          </p>
        </div>
      </header>

      <ol className="ai-items">
        {items.map((item, idx) => {
          const meta = VERDICT_META[item.verdict] || VERDICT_META.model
          const { Icon } = meta
          return (
            <li key={idx} className="ai-item">
              <div className="ai-item-head">
                <span className="ai-item-num">{idx + 1}</span>
                <div className="ai-item-title">
                  <p className="ai-item-label">{item.questionLabel}</p>
                  <span
                    className="ai-verdict"
                    style={{
                      color: meta.color,
                      background: meta.bg,
                      borderColor: meta.border,
                    }}
                  >
                    <Icon size={12} /> {meta.label}
                    {item.score && <span className="ai-score">· {item.score}</span>}
                  </span>
                </div>
              </div>

              {mode === 'SUBMISSION' && item.userAnswer && (
                <div className="ai-block ai-block-user">
                  <span className="ai-block-label">Votre réponse</span>
                  <MD>{item.userAnswer}</MD>
                </div>
              )}

              <div className="ai-block ai-block-correct">
                <span className="ai-block-label">
                  {mode === 'SUBMISSION' ? 'Solution attendue' : 'Correction'}
                </span>
                <MD>{item.correctAnswer}</MD>
              </div>

              {item.feedback && (
                <div className="ai-block ai-block-feedback">
                  <span className="ai-block-label">Commentaire</span>
                  <MD>{item.feedback}</MD>
                </div>
              )}
            </li>
          )
        })}
      </ol>

      {summary && (summary.strengths?.length || summary.improvements?.length) ? (
        <div className="ai-summary">
          {summary.strengths?.length > 0 && (
            <div className="ai-summary-col">
              <h4>Points forts</h4>
              <ul>{summary.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
            </div>
          )}
          {summary.improvements?.length > 0 && (
            <div className="ai-summary-col">
              <h4>{mode === 'DIRECT' ? 'Conseils méthodologiques' : 'Axes de progrès'}</h4>
              <ul>{summary.improvements.map((s, i) => <li key={i}>{s}</li>)}</ul>
            </div>
          )}
        </div>
      ) : null}

      <style jsx>{`
        .ai-correction {
          border: 1px solid var(--gold-line, rgba(201, 168, 76, 0.3));
          border-radius: 14px;
          background: linear-gradient(180deg,
            rgba(201, 168, 76, 0.04) 0%,
            transparent 80%);
          padding: 1.25rem;
          color: var(--text-1, #fff);
        }
        .ai-head {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          margin-bottom: 1.25rem;
          padding-bottom: 0.85rem;
          border-bottom: 1px solid var(--border-1, rgba(255,255,255,0.08));
        }
        .ai-head-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: var(--gold-dim, rgba(201, 168, 76, 0.15));
          color: var(--gold, #C9A84C);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ai-title {
          font-family: var(--font-display, serif);
          font-size: 1.05rem;
          font-weight: 600;
          margin: 0;
        }
        .ai-sub {
          font-size: 0.78rem;
          color: var(--text-3, rgba(255,255,255,0.55));
          margin: 0.2rem 0 0;
        }
        .ai-items {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .ai-item {
          padding: 1rem;
          border-radius: 12px;
          background: var(--card, rgba(255,255,255,0.02));
          border: 1px solid var(--border-1, rgba(255,255,255,0.06));
        }
        .ai-item-head {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          margin-bottom: 0.85rem;
        }
        .ai-item-num {
          flex-shrink: 0;
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: var(--gold-dim, rgba(201, 168, 76, 0.18));
          color: var(--gold, #C9A84C);
          font-family: var(--font-mono, monospace);
          font-weight: 600;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ai-item-title {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .ai-item-label {
          margin: 0;
          font-weight: 500;
          font-size: 0.95rem;
        }
        .ai-verdict {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.2rem 0.55rem;
          border-radius: 999px;
          font-size: 0.72rem;
          font-weight: 500;
          letter-spacing: 0.02em;
          border: 1px solid;
          width: fit-content;
        }
        .ai-score {
          margin-left: 0.25rem;
          opacity: 0.85;
        }
        .ai-block {
          margin-top: 0.75rem;
          padding: 0.85rem 1rem;
          border-radius: 10px;
          background: rgba(255,255,255,0.02);
          border-left: 3px solid var(--border-1, rgba(255,255,255,0.1));
        }
        .ai-block-user {
          background: rgba(155, 183, 224, 0.05);
          border-left-color: rgba(155, 183, 224, 0.55);
        }
        .ai-block-correct {
          background: rgba(110, 170, 140, 0.04);
          border-left-color: rgba(110, 170, 140, 0.55);
        }
        .ai-block-feedback {
          background: rgba(201, 168, 76, 0.04);
          border-left-color: rgba(201, 168, 76, 0.55);
        }
        .ai-block-label {
          display: block;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-size: 0.65rem;
          color: var(--text-3, rgba(255,255,255,0.55));
          margin-bottom: 0.4rem;
          font-weight: 600;
        }
        .ai-summary {
          margin-top: 1.25rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-1, rgba(255,255,255,0.08));
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
        }
        .ai-summary-col h4 {
          font-size: 0.85rem;
          margin: 0 0 0.5rem;
          color: var(--gold, #C9A84C);
        }
        .ai-summary-col ul {
          padding-left: 1.1rem;
          margin: 0;
          font-size: 0.85rem;
          color: var(--text-2, rgba(255,255,255,0.7));
          line-height: 1.55;
        }
      `}</style>

      <style jsx global>{`
        .ai-md {
          font-size: 0.92rem;
          line-height: 1.65;
          color: var(--text-2, rgba(255,255,255,0.85));
        }
        .ai-md p { margin: 0.4rem 0; }
        .ai-md strong { color: var(--text-1, #fff); }
        .ai-md ul, .ai-md ol { padding-left: 1.4rem; margin: 0.4rem 0; }
        .ai-md li { margin: 0.15rem 0; }
        .ai-md h1, .ai-md h2, .ai-md h3, .ai-md h4 {
          font-size: 0.95rem;
          margin: 0.85rem 0 0.4rem;
          font-weight: 600;
          color: var(--gold, #C9A84C);
        }
        .ai-md code {
          background: rgba(255, 255, 255, 0.06);
          padding: 0.1rem 0.35rem;
          border-radius: 4px;
          font-size: 0.85em;
          font-family: var(--font-mono, monospace);
        }
        .ai-md pre {
          background: rgba(0, 0, 0, 0.35);
          padding: 0.65rem 0.9rem;
          border-radius: 8px;
          overflow-x: auto;
          font-size: 0.82em;
        }
        .ai-md pre code { background: none; padding: 0; }
        .ai-md blockquote {
          border-left: 3px solid var(--gold-line, rgba(201, 168, 76, 0.4));
          padding-left: 0.75rem;
          margin: 0.5rem 0;
          color: var(--text-3, rgba(255,255,255,0.65));
        }
        .ai-md .katex-display {
          margin: 0.75rem 0 !important;
          overflow-x: auto;
          overflow-y: hidden;
          padding: 0.25rem 0;
        }
        .ai-md .katex {
          font-size: 1em;
        }
      `}</style>
    </div>
  )
}
