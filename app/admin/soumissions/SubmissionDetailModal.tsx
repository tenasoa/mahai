'use client'

import { useState } from 'react'
import { X, CheckCircle, XCircle, Loader2, FileText, User, Calendar, Eye, AlertCircle } from 'lucide-react'
import { finalizeAndPublish, rejectSubmission } from '@/actions/admin/submissions'
import { useRouter } from 'next/navigation'

interface Submission {
  id: string
  title: string
  matiere: string
  examType: string
  anneeScolaire: string
  serie?: string
  duree?: string
  coefficient?: number
  prix: number
  prixMode: string
  visibilite: string
  content?: string
  authorPrenom: string
  authorNom: string
  authorEmail: string
  authorId: string
  createdAt: string
  updatedAt: string
}

interface SubmissionDetailModalProps {
  submission: Submission
  onClose: () => void
}

const DIFFICULTES = [
  { value: 'FACILE', label: 'Facile', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'MOYEN', label: 'Moyen', color: 'bg-amber-100 text-amber-700' },
  { value: 'DIFFICILE', label: 'Difficile', color: 'bg-rose-100 text-rose-700' }
] as const

const BADGES = [
  { value: 'FREE', label: 'Gratuit', description: 'Accès libre' },
  { value: 'AI', label: 'Premium', description: 'Crédits requis' },
  { value: 'GOLD', label: 'Gold', description: 'Contenu exclusif' },
  { value: 'INTER', label: 'Intermédiaire', description: 'Niveau intermédiaire' }
] as const

export function SubmissionDetailModal({ submission, onClose }: SubmissionDetailModalProps) {
  const router = useRouter()
  const [isPublishing, setIsPublishing] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  // Formulaire de finalisation
  const [formData, setFormData] = useState({
    titre: submission.title || '',
    matiere: submission.matiere || '',
    type: submission.examType || 'BAC',
    annee: submission.anneeScolaire || String(new Date().getFullYear()),
    serie: submission.serie || '',
    pages: 1,
    credits: submission.prix || 0,
    difficulte: 'MOYEN' as 'FACILE' | 'MOYEN' | 'DIFFICILE',
    badge: 'AI' as 'GOLD' | 'AI' | 'FREE' | 'INTER',
    description: '',
    notes: ''
  })

  const handlePublish = async () => {
    if (!formData.titre.trim()) {
      alert('Le titre est requis')
      return
    }

    setIsPublishing(true)
    try {
      const result = await finalizeAndPublish(submission.id, formData)
      alert('Sujet publié avec succès !')
      onClose()
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erreur lors de la publication')
    } finally {
      setIsPublishing(false)
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Veuillez indiquer un motif de rejet')
      return
    }

    setIsRejecting(true)
    try {
      await rejectSubmission(submission.id, rejectReason)
      alert('Soumission rejetée')
      onClose()
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erreur lors du rejet')
    } finally {
      setIsRejecting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Révision de la soumission</h2>
            <p className="text-sm text-slate-500">
              Par {submission.authorPrenom} {submission.authorNom} • {submission.authorEmail}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid lg:grid-cols-2 gap-6 p-6">
            {/* Colonne gauche - Formulaire */}
            <div className="space-y-6">
              <section>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Informations du sujet
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Titre *
                    </label>
                    <input
                      type="text"
                      value={formData.titre}
                      onChange={e => setFormData({ ...formData, titre: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Titre du sujet"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Matière *
                      </label>
                      <select
                        value={formData.matiere}
                        onChange={e => setFormData({ ...formData, matiere: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Choisir...</option>
                        <option value="MATHEMATIQUES">Mathématiques</option>
                        <option value="PHYSIQUE-CHIMIE">Physique-Chimie</option>
                        <option value="SVT">SVT</option>
                        <option value="PHILOSOPHIE">Philosophie</option>
                        <option value="FRANCAIS">Français</option>
                        <option value="HISTOIRE-GEOGRAPHIE">Histoire-Géographie</option>
                        <option value="ANGLAIS">Anglais</option>
                        <option value="ALLEMAND">Allemand</option>
                        <option value="ESPAGNOL">Espagnol</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Type
                      </label>
                      <select
                        value={formData.type}
                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="BAC">Baccalauréat</option>
                        <option value="BEPC">BEPC</option>
                        <option value="CONCOURS">Concours</option>
                        <option value="EXERCICE">Exercice</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Année *
                      </label>
                      <input
                        type="number"
                        value={formData.annee}
                        onChange={e => setFormData({ ...formData, annee: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Série
                      </label>
                      <select
                        value={formData.serie}
                        onChange={e => setFormData({ ...formData, serie: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">—</option>
                        <option value="S">S</option>
                        <option value="L">L</option>
                        <option value="ES">ES</option>
                        <option value="Technologique">Technologique</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Pages
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.pages}
                        onChange={e => setFormData({ ...formData, pages: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Crédits (prix)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.credits}
                        onChange={e => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none"
                      placeholder="Description du sujet..."
                    />
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Configuration</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Difficulté
                    </label>
                    <div className="flex gap-2">
                      {DIFFICULTES.map(diff => (
                        <button
                          key={diff.value}
                          onClick={() => setFormData({ ...formData, difficulte: diff.value })}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-all ${
                            formData.difficulte === diff.value
                              ? diff.color + ' border-current ring-2 ring-offset-1'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          {diff.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Badge
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {BADGES.map(badge => (
                        <button
                          key={badge.value}
                          onClick={() => setFormData({ ...formData, badge: badge.value })}
                          className={`p-3 rounded-lg border text-left transition-all ${
                            formData.badge === badge.value
                              ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className={`font-medium ${
                            formData.badge === badge.value ? 'text-indigo-900' : 'text-slate-900'
                          }`}>
                            {badge.label}
                          </div>
                          <div className="text-xs text-slate-500">{badge.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Notes pour le contributeur (optionnel)
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={e => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none"
                      placeholder="Merci pour votre contribution ! Votre sujet a été publié avec quelques ajustements..."
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* Colonne droite - Aperçu et actions */}
            <div className="space-y-6">
              <section className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-slate-500" />
                  Détails originaux
                </h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Soumis le</dt>
                    <dd className="text-slate-900">{new Date(submission.createdAt).toLocaleDateString('fr-FR')}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Prix suggéré</dt>
                    <dd className="text-slate-900">{submission.prix} crédits ({submission.prixMode})</dd>
                  </div>
                  {submission.duree && (
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Durée</dt>
                      <dd className="text-slate-900">{submission.duree}</dd>
                    </div>
                  )}
                  {submission.coefficient && (
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Coefficient</dt>
                      <dd className="text-slate-900">{submission.coefficient}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Visibilité</dt>
                    <dd className="text-slate-900">{submission.visibilite}</dd>
                  </div>
                </dl>
              </section>

              {/* Aperçu du contenu */}
              <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-900">Aperçu du contenu</h3>
                </div>
                <div className="p-4 max-h-64 overflow-y-auto">
                  {submission.content ? (
                    <pre className="text-xs text-slate-600 whitespace-pre-wrap">
                      {JSON.stringify(submission.content, null, 2).substring(0, 500)}...
                    </pre>
                  ) : (
                    <p className="text-sm text-slate-400 italic">Aucun contenu disponible</p>
                  )}
                </div>
              </section>

              {/* Formulaire de rejet */}
              {showRejectForm && (
                <section className="bg-rose-50 rounded-xl p-4 border border-rose-200">
                  <h3 className="text-sm font-semibold text-rose-900 mb-2">
                    Motif du rejet *
                  </h3>
                  <textarea
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 resize-none text-sm"
                    placeholder="Expliquez pourquoi ce sujet est rejeté..."
                  />
                  <p className="text-xs text-rose-600 mt-1">
                    Minimum 10 caractères requis
                  </p>
                </section>
              )}
            </div>
          </div>
        </div>

        {/* Footer avec actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            {!showRejectForm ? (
              <button
                onClick={() => setShowRejectForm(true)}
                className="flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors font-medium"
              >
                <XCircle className="w-4 h-4" />
                Rejeter
              </button>
            ) : (
              <button
                onClick={() => setShowRejectForm(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Annuler
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors font-medium"
            >
              Fermer
            </button>

            {showRejectForm ? (
              <button
                onClick={handleReject}
                disabled={isRejecting || rejectReason.length < 10}
                className="flex items-center gap-2 px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isRejecting && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirmer le rejet
              </button>
            ) : (
              <button
                onClick={handlePublish}
                disabled={isPublishing || !formData.titre.trim()}
                className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isPublishing && <Loader2 className="w-4 h-4 animate-spin" />}
                <CheckCircle className="w-4 h-4" />
                Publier le sujet
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
