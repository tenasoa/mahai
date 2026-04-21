'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import './exam-mode.css'

interface ExamQuestion {
  id: string
  numero: number
  texte: string
  type: string
  options?: string[]
  points: number
}

interface Exam {
  id: string
  titre: string
  typeExamen: string
  matiere: string
  annee: string
  dureeSecondes: number
  questions: ExamQuestion[]
}

function formatTimer(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export default function ExamTakingClient({ exam }: { exam: Exam }) {
  const router = useRouter()
  const [started, setStarted] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState(Math.max(60, exam.dureeSecondes || 10800))
  const [submitting, setSubmitting] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [copyWarning, setCopyWarning] = useState<string | null>(null)

  const currentQuestion = exam.questions[currentQuestionIndex]

  const answeredCount = useMemo(
    () => Object.values(answers).filter((value) => value.trim().length > 0).length,
    [answers],
  )

  const timerMode = timeLeft <= 300 ? 'urgent' : timeLeft <= 1800 ? 'warn' : 'normal'

  const handleSubmit = useCallback(async () => {
    if (submitting) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/examens/${exam.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      })

      if (!response.ok) {
        throw new Error('Échec de soumission')
      }

      const payload = await response.json()
      router.push(`/examens/${exam.id}/results?score=${payload.score}`)
    } catch (error) {
      console.error('submit exam error', error)
      setCopyWarning('Erreur lors de la soumission. Réessayez.')
      setSubmitting(false)
    }
  }, [answers, exam.id, router, submitting])

  useEffect(() => {
    if (!started || submitting) return
    if (timeLeft <= 0) {
      void handleSubmit()
      return
    }

    const interval = setInterval(() => {
      setTimeLeft((previous) => previous - 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [handleSubmit, started, submitting, timeLeft])

  useEffect(() => {
    if (!started) return

    const showGuardWarning = (message: string) => {
      setCopyWarning(message)
      setTimeout(() => setCopyWarning(null), 2800)
    }

    const preventCopyAction = (event: ClipboardEvent) => {
      event.preventDefault()
      showGuardWarning('Copier-coller non autorisé en mode examen.')
    }

    const preventContextMenu = (event: MouseEvent) => {
      event.preventDefault()
    }

    const visibilityWatcher = () => {
      if (document.hidden) {
        showGuardWarning('Changement de fenêtre détecté.')
      }
    }

    document.addEventListener('copy', preventCopyAction)
    document.addEventListener('paste', preventCopyAction)
    document.addEventListener('cut', preventCopyAction)
    document.addEventListener('contextmenu', preventContextMenu)
    document.addEventListener('visibilitychange', visibilityWatcher)

    return () => {
      document.removeEventListener('copy', preventCopyAction)
      document.removeEventListener('paste', preventCopyAction)
      document.removeEventListener('cut', preventCopyAction)
      document.removeEventListener('contextmenu', preventContextMenu)
      document.removeEventListener('visibilitychange', visibilityWatcher)
    }
  }, [started])

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((previous) => ({
      ...previous,
      [questionId]: value,
    }))
  }

  const goNext = () => {
    setCurrentQuestionIndex((previous) => Math.min(exam.questions.length - 1, previous + 1))
  }

  const goPrevious = () => {
    setCurrentQuestionIndex((previous) => Math.max(0, previous - 1))
  }

  if (!started) {
    return (
      <div className="exam-root">
        <section className="pre-exam-wrap">
          <article className="pre-exam-card">
            <div className="pre-exam-icon">📋</div>
            <h1 className="pre-exam-title">
              Mode <em>Examen Solo</em>
            </h1>
            <p className="pre-exam-subtitle">
              Vous allez simuler les conditions réelles d'une épreuve. Le chronomètre démarre dès votre confirmation.
            </p>

            <div className="pre-exam-metrics">
              <div className="metric-cell">
                <div className="metric-value">{Math.max(1, Math.floor((exam.dureeSecondes || 3600) / 3600))}h</div>
                <div className="metric-label">Durée</div>
              </div>
              <div className="metric-cell">
                <div className="metric-value">{exam.questions.length}</div>
                <div className="metric-label">Questions</div>
              </div>
              <div className="metric-cell">
                <div className="metric-value">{exam.questions.reduce((sum, item) => sum + (item.points || 0), 0)}</div>
                <div className="metric-label">Points</div>
              </div>
              <div className="metric-cell">
                <div className="metric-value">{exam.typeExamen}</div>
                <div className="metric-label">Type</div>
              </div>
            </div>

            <div className="pre-exam-rules">
              <p>⏱ Chronomètre affiché en permanence.</p>
              <p>📋 Copier-coller et clic droit bloqués en mode examen.</p>
              <p>🔒 Changement de fenêtre détecté et signalé.</p>
              <p>✓ Vos réponses sont sauvegardées localement pendant la session.</p>
            </div>

            <button className="exam-primary-btn" onClick={() => setStarted(true)}>
              Commencer l'examen
            </button>
          </article>
        </section>
      </div>
    )
  }

  return (
    <div className="exam-root">
      {copyWarning && <div className="guard-warning">⚠ {copyWarning}</div>}

      <div className="exam-layout">
        <header className="exam-topbar">
          <div className="exam-brand">
            Mah<span className="exam-brand-gem" />AI
          </div>
          <div className="exam-title">{exam.titre || `${exam.matiere} ${exam.annee}`}</div>
          <div className={`exam-timer exam-timer-${timerMode}`}>
            <span className="timer-dot" />
            <span>{formatTimer(timeLeft)}</span>
            <small>restant</small>
          </div>
        </header>

        <div className="exam-progress-track">
          <div
            className="exam-progress-fill"
            style={{ width: `${Math.round(((currentQuestionIndex + 1) / exam.questions.length) * 100)}%` }}
          />
        </div>

        <div className="exam-main">
          <aside className="question-sidebar">
            {exam.questions.map((question, index) => {
              const isAnswered = Boolean(answers[question.id]?.trim())
              const isActive = currentQuestionIndex === index
              return (
                <button
                  key={question.id}
                  type="button"
                  className={`question-pill ${isActive ? 'active' : ''} ${isAnswered ? 'answered' : ''}`}
                  onClick={() => setCurrentQuestionIndex(index)}
                >
                  {String(question.numero || index + 1).padStart(2, '0')}
                </button>
              )
            })}
          </aside>

          <section className="exam-content">
            <p className="question-meta">
              Question {String(currentQuestion.numero || currentQuestionIndex + 1).padStart(2, '0')} · {currentQuestion.points} pts
            </p>
            <h2 className="question-title">{currentQuestion.texte}</h2>

            {currentQuestion.type === 'qcm' && Array.isArray(currentQuestion.options) ? (
              <div className="question-options">
                {currentQuestion.options.map((option) => (
                  <label key={option} className="option-row">
                    <input
                      type="radio"
                      name={`q-${currentQuestion.id}`}
                      checked={answers[currentQuestion.id] === option}
                      onChange={() => handleAnswerChange(currentQuestion.id, option)}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            ) : currentQuestion.type === 'numerique' ? (
              <input
                value={answers[currentQuestion.id] || ''}
                onChange={(event) => handleAnswerChange(currentQuestion.id, event.target.value)}
                className="exam-answer-input"
                placeholder="Votre réponse numérique..."
              />
            ) : (
              <textarea
                className="exam-answer"
                value={answers[currentQuestion.id] || ''}
                onChange={(event) => handleAnswerChange(currentQuestion.id, event.target.value)}
                placeholder="Rédigez votre réponse..."
                rows={8}
              />
            )}

            <p className="answer-counter">{answers[currentQuestion.id]?.length || 0} caractères</p>

            <div className="question-nav">
              <button type="button" className="exam-secondary-btn" onClick={goPrevious} disabled={currentQuestionIndex === 0}>
                ← Précédent
              </button>
              {currentQuestionIndex < exam.questions.length - 1 ? (
                <button type="button" className="exam-primary-btn" onClick={goNext}>
                  Question suivante →
                </button>
              ) : (
                <button type="button" className="exam-primary-btn" onClick={() => setShowSubmitConfirm(true)}>
                  Soumettre
                </button>
              )}
            </div>
          </section>
        </div>

        <footer className="exam-bottombar">
          <p>
            Questions répondues: <strong>{answeredCount}</strong> / {exam.questions.length}
          </p>
          <div className="exam-bottom-actions">
            <button type="button" className="exam-danger-btn" onClick={() => setShowExitConfirm(true)}>
              Abandonner
            </button>
            <button type="button" className="exam-success-btn" onClick={() => setShowSubmitConfirm(true)} disabled={submitting}>
              {submitting ? 'Soumission...' : 'Soumettre pour correction'}
            </button>
          </div>
        </footer>
      </div>

      {showExitConfirm && (
        <div className="exam-overlay" onClick={() => setShowExitConfirm(false)}>
          <div className="exam-modal" onClick={(event) => event.stopPropagation()}>
            <h3>Abandonner l'examen ?</h3>
            <p>Vos réponses de cette session seront perdues.</p>
            <div className="exam-modal-actions">
              <button type="button" className="exam-secondary-btn" onClick={() => setShowExitConfirm(false)}>
                Continuer
              </button>
              <button type="button" className="exam-danger-btn" onClick={() => router.push('/examens')}>
                Quitter
              </button>
            </div>
          </div>
        </div>
      )}

      {showSubmitConfirm && (
        <div className="exam-overlay" onClick={() => setShowSubmitConfirm(false)}>
          <div className="exam-modal" onClick={(event) => event.stopPropagation()}>
            <h3>Confirmer la soumission</h3>
            <p>
              Vous avez répondu à <strong>{answeredCount}</strong> question(s) sur {exam.questions.length}.
            </p>
            <div className="exam-modal-actions">
              <button type="button" className="exam-secondary-btn" onClick={() => setShowSubmitConfirm(false)}>
                Retour
              </button>
              <button
                type="button"
                className="exam-success-btn"
                onClick={() => void handleSubmit()}
                disabled={submitting}
              >
                {submitting ? 'Soumission...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
