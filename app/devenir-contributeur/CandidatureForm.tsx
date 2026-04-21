'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import {
  submitContributorApplication,
  type ContributorApplicationState,
} from './actions'

interface ContributorApplicationPayload {
  fullName?: string | null
  phone?: string | null
  subjects?: string | null
  educationLevel?: string | null
  teachingExperience?: string | null
  motivation?: string | null
  availability?: string | null
  portfolioUrl?: string | null
  sampleLesson?: string | null
}

const initialContributorApplicationState: ContributorApplicationState = {
  success: false,
  message: '',
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-gold to-gold-hi px-5 py-3 text-sm font-semibold text-void transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Envoi en cours...' : 'Envoyer ma candidature'}
    </button>
  )
}

function FieldError({ state, field }: { state: ContributorApplicationState; field: string }) {
  const message = state.errors?.[field]
  if (!message) return null
  return <p className="mt-1 text-xs text-ruby">{message}</p>
}

export default function CandidatureForm({
  defaultValues,
}: {
  defaultValues: ContributorApplicationPayload
}) {
  const [state, formAction] = useActionState(
    submitContributorApplication,
    initialContributorApplicationState,
  )

  return (
    <form action={formAction} className="space-y-5 rounded-2xl border border-border-1 bg-card p-6 md:p-8">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-text-3">Nom complet</label>
          <input
            name="fullName"
            defaultValue={defaultValues.fullName ?? ''}
            className="w-full rounded-xl border border-border-1 bg-surface px-3 py-2.5 text-sm text-text outline-none transition focus:border-gold-line focus:ring-4 focus:ring-gold-dim"
          />
          <FieldError state={state} field="fullName" />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-text-3">Téléphone</label>
          <input
            name="phone"
            defaultValue={defaultValues.phone ?? ''}
            className="w-full rounded-xl border border-border-1 bg-surface px-3 py-2.5 text-sm text-text outline-none transition focus:border-gold-line focus:ring-4 focus:ring-gold-dim"
          />
          <FieldError state={state} field="phone" />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-text-3">Matières maîtrisées</label>
        <input
          name="subjects"
          defaultValue={defaultValues.subjects ?? ''}
          placeholder="Ex: Mathématiques, Physique, Philosophie"
          className="w-full rounded-xl border border-border-1 bg-surface px-3 py-2.5 text-sm text-text outline-none transition placeholder:text-text-4 focus:border-gold-line focus:ring-4 focus:ring-gold-dim"
        />
        <FieldError state={state} field="subjects" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-text-3">Niveau académique</label>
          <input
            name="educationLevel"
            defaultValue={defaultValues.educationLevel ?? ''}
            placeholder="Licence, Master, Doctorat..."
            className="w-full rounded-xl border border-border-1 bg-surface px-3 py-2.5 text-sm text-text outline-none transition placeholder:text-text-4 focus:border-gold-line focus:ring-4 focus:ring-gold-dim"
          />
          <FieldError state={state} field="educationLevel" />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-text-3">Disponibilité</label>
          <input
            name="availability"
            defaultValue={defaultValues.availability ?? ''}
            placeholder="Ex: 8h/semaine, soir + weekend"
            className="w-full rounded-xl border border-border-1 bg-surface px-3 py-2.5 text-sm text-text outline-none transition placeholder:text-text-4 focus:border-gold-line focus:ring-4 focus:ring-gold-dim"
          />
          <FieldError state={state} field="availability" />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-text-3">Expérience pédagogique</label>
        <textarea
          name="teachingExperience"
          defaultValue={defaultValues.teachingExperience ?? ''}
          rows={4}
          placeholder="Décrivez vos expériences (cours particuliers, enseignement, correction, création de sujets...)."
          className="w-full rounded-xl border border-border-1 bg-surface px-3 py-2.5 text-sm text-text outline-none transition placeholder:text-text-4 focus:border-gold-line focus:ring-4 focus:ring-gold-dim"
        />
        <FieldError state={state} field="teachingExperience" />
      </div>

      <div>
        <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-text-3">Motivation</label>
        <textarea
          name="motivation"
          defaultValue={defaultValues.motivation ?? ''}
          rows={5}
          placeholder="Expliquez pourquoi vous souhaitez devenir contributeur Mah.AI et votre valeur ajoutée pour les élèves."
          className="w-full rounded-xl border border-border-1 bg-surface px-3 py-2.5 text-sm text-text outline-none transition placeholder:text-text-4 focus:border-gold-line focus:ring-4 focus:ring-gold-dim"
        />
        <FieldError state={state} field="motivation" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-text-3">Portfolio (optionnel)</label>
          <input
            name="portfolioUrl"
            defaultValue={defaultValues.portfolioUrl ?? ''}
            placeholder="https://..."
            className="w-full rounded-xl border border-border-1 bg-surface px-3 py-2.5 text-sm text-text outline-none transition placeholder:text-text-4 focus:border-gold-line focus:ring-4 focus:ring-gold-dim"
          />
          <FieldError state={state} field="portfolioUrl" />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-text-3">Exemple de sujet (optionnel)</label>
          <input
            name="sampleLesson"
            defaultValue={defaultValues.sampleLesson ?? ''}
            placeholder="Lien Drive / URL de référence"
            className="w-full rounded-xl border border-border-1 bg-surface px-3 py-2.5 text-sm text-text outline-none transition placeholder:text-text-4 focus:border-gold-line focus:ring-4 focus:ring-gold-dim"
          />
        </div>
      </div>

      {state.message && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            state.success
              ? 'border-sage-line bg-sage-dim text-sage'
              : 'border-ruby-line bg-ruby-dim text-ruby'
          }`}
        >
          {state.message}
        </div>
      )}

      <SubmitButton />
    </form>
  )
}
