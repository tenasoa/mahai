'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, AlertTriangle, ChevronLeft, ChevronRight, Flag } from 'lucide-react'

interface ExamQuestion {
  id: string
  numero: number
  texte: string
  type: 'qcm' | '郎答' | 'numérique'
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

export default function ExamTakingClient({ exam }: { exam: Exam }) {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [flagged, setFlagged] = useState<Set<number>>(new Set())
  const [timeLeft, setTimeLeft] = useState(exam.dureeSecondes)
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit()
      return
    }
    const timer = setInterval(() => setTimeLeft(p => p - 1), 1000)
    return () => clearInterval(timer)
  }, [timeLeft])

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  const handleAnswer = (qId: string, ans: string) => setAnswers(p => ({ ...p, [qId]: ans }))
  const toggleFlag = (n: number) => setFlagged(p => { const s = new Set(p); s.has(n) ? s.delete(n) : s.add(n); return s })

  const handleSubmit = async () => {
    if (submitted) return
    setSubmitted(true)
    setLoading(true)
    try {
      const res = await fetch(`/api/examens/${exam.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      })
      if (res.ok) router.push(`/examens/${exam.id}/results?score=${(await res.json()).score}`)
    } catch { console.error('Error') }
    finally { setLoading(false) }
  }

  const q = exam.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / exam.questions.length) * 100

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-bg2 border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-text">{exam.titre}</h1>
            <p className="text-sm text-text-muted">Question {currentQuestion + 1} / {exam.questions.length}</p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono ${
            timeLeft <= 300 ? 'bg-rose/20 text-rose animate-pulse' : 'bg-bg3 text-text'
          }`}>
            <Clock className="w-5 h-5" />
            <span className="text-xl font-bold">{formatTime(timeLeft)}</span>
          </div>
        </div>
        <div className="h-1 bg-bg3">
          <div className="h-full bg-teal transition-all" style={{ width: `${progress}%` }} />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {timeLeft <= 300 && !submitted && (
          <div className="mb-4 p-3 bg-rose/10 border border-rose/20 rounded-lg flex items-center gap-2 text-rose">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">Il ne reste que {formatTime(timeLeft)} !</span>
          </div>
        )}

        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-text">Question {q.numero}</span>
              <span className="text-sm text-text-muted">({q.points} pts)</span>
            </div>
            <button onClick={() => toggleFlag(q.numero)} className={`p-2 rounded-lg ${flagged.has(q.numero) ? 'bg-gold/20 text-gold' : 'text-text-muted hover:bg-bg3'}`}>
              <Flag className="w-5 h-5" />
            </button>
          </div>
          <p className="text-text text-lg mb-6">{q.texte}</p>

          {q.type === 'qcm' && q.options && (
            <div className="space-y-2">
              {q.options.map((opt, i) => (
                <label key={i} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                  answers[q.id] === opt ? 'border-teal bg-teal/10' : 'border-white/10 hover:border-white/20'
                }`}>
                  <input type="radio" name={q.id} value={opt} checked={answers[q.id] === opt} onChange={() => handleAnswer(q.id, opt)} className="w-4 h-4 text-teal" />
                  <span className="text-text">{opt}</span>
                </label>
              ))}
            </div>
          )}
          {q.type === '郎答' && (
            <textarea value={answers[q.id] || ''} onChange={(e) => handleAnswer(q.id, e.target.value)} rows={5}
              className="w-full p-3 bg-bg3 border border-white/10 rounded-lg text-text placeholder-text-muted2 focus:border-teal/50" placeholder="Votre réponse..." />
          )}
          {q.type === 'numérique' && (
            <input type="text" value={answers[q.id] || ''} onChange={(e) => handleAnswer(q.id, e.target.value)}
              className="w-full p-3 bg-bg3 border border-white/10 rounded-lg text-text placeholder-text-muted2 focus:border-teal/50" placeholder="Nombre..." />
          )}
        </div>

        <div className="flex items-center justify-between">
          <button onClick={() => setCurrentQuestion(p => Math.max(0, p - 1))} disabled={currentQuestion === 0}
            className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-lg text-text-muted hover:bg-bg3 disabled:opacity-50">
            <ChevronLeft className="w-5 h-5" /> Précédent
          </button>
          <div className="flex gap-1">
            {exam.questions.map((_, i) => (
              <button key={i} onClick={() => setCurrentQuestion(i)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                  i === currentQuestion 
                    ? 'bg-teal text-bg' 
                    : answers[exam.questions[i].id] 
                      ? 'bg-green/20 text-green' 
                      : 'bg-bg3 text-text-muted'
                }`}>{i + 1}</button>
            ))}
          </div>
          {currentQuestion < exam.questions.length - 1 ? (
            <button onClick={() => setCurrentQuestion(p => p + 1)}
              className="flex items-center gap-2 px-4 py-2 bg-teal text-bg rounded-lg font-medium hover:bg-teal-secondary">Suivant <ChevronRight className="w-5 h-5" /></button>
          ) : (
            <button onClick={() => setShowConfirm(true)} disabled={submitted || loading}
              className="flex items-center gap-2 px-6 py-2 bg-green text-bg rounded-lg font-medium hover:bg-green/90 disabled:opacity-50">
              {loading ? '...' : 'Soumettre'}
            </button>
          )}
        </div>
      </main>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-bg2 border border-white/10 rounded-xl p-6 max-w-md mx-4">
            <h3 className="text-xl font-bold text-text mb-4">Confirmer la soumission</h3>
            <p className="text-text-muted mb-6">Êtes-vous sûr ? Vos réponses seront définitivement soumises.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 px-4 py-2 border border-white/10 rounded-lg text-text hover:bg-bg3">Annuler</button>
              <button onClick={handleSubmit} className="flex-1 px-4 py-2 bg-green text-bg rounded-lg font-medium">Confirmer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
