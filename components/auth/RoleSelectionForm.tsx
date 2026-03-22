'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { updateUserRole } from '@/actions/auth'
import { useState } from 'react'

const roleSchema = z.object({
  role: z.enum(['ETUDIANT', 'CONTRIBUTEUR', 'PROFESSEUR'], {
    required_error: 'Veuillez sélectionner un rôle',
  }),
  schoolLevel: z.string().optional(),
  acceptCGU: z.boolean().refine((val) => val === true, {
    message: 'Vous devez accepter les CGU',
  }).optional(),
}).superRefine((data, ctx) => {
  if (data.role === 'ETUDIANT' && !data.schoolLevel) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Veuillez sélectionner votre niveau scolaire',
      path: ['schoolLevel'],
    })
  }
  if (data.role === 'CONTRIBUTEUR' && data.acceptCGU !== true) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Vous devez accepter les CGU pour devenir contributeur',
      path: ['acceptCGU'],
    })
  }
})

type RoleFormData = z.infer<typeof roleSchema>

const roles = [
  {
    value: 'ETUDIANT',
    title: 'Étudiant',
    description: 'Accédez aux examens blancs, achetez des sujets et suivez votre progression',
    icon: '🎓',
    gradient: 'role-etudiant',
  },
  {
    value: 'CONTRIBUTEUR',
    title: 'Contributeur',
    description: 'Soumettez des sujets d\'examens et gagnez des crédits',
    icon: '✏️',
    gradient: 'role-contributeur',
  },
  {
    value: 'PROFESSEUR',
    title: 'Professeur',
    description: 'Corrigez des copies et partagez vos connaissances',
    icon: '📚',
    gradient: 'role-professeur',
  },
]

const schoolLevels = [
  { value: 'CEPE', label: 'CEPE (Cours Primaire)' },
  { value: 'BEPC', label: 'BEPC (Collège)' },
  { value: 'LYCEE', label: 'Lycée' },
  { value: 'UNIVERSITE', label: 'Université' },
]

export function RoleSelectionForm() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
  })

  const watchedRole = watch('role')

  const onSubmit = async (data: RoleFormData) => {
    setServerError(null)
    
    const result = await updateUserRole(data)
    
    if (result?.error) {
      setServerError(result.error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && (
        <div className="p-3 text-sm bg-rose/10 text-rose border border-rose/20 rounded-lg">
          {serverError}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {roles.map((role) => (
          <label
            key={role.value}
            className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-teal/50 ${
              watchedRole === role.value
                ? 'border-teal bg-bg3'
                : 'border-white/10 hover:border-white/20'
            }`}
          >
            <input
              type="radio"
              value={role.value}
              {...register('role')}
              className="sr-only"
              onChange={() => setSelectedRole(role.value)}
            />
            <span className="text-3xl mb-2">{role.icon}</span>
            <span className="font-semibold text-text">{role.title}</span>
            <p className="text-sm text-text-muted mt-1">{role.description}</p>
            {watchedRole === role.value && (
              <span className="absolute top-2 right-2 text-teal">✓</span>
            )}
          </label>
        ))}
      </div>
      {errors.role && (
        <p className="text-sm text-rose">{errors.role.message}</p>
      )}

      {watchedRole === 'ETUDIANT' && (
        <div>
          <label htmlFor="schoolLevel" className="block text-sm font-medium text-text-muted mb-2">
            Niveau scolaire <span className="text-rose">*</span>
          </label>
          <select
            {...register('schoolLevel')}
            id="schoolLevel"
            className="w-full px-4 py-3 bg-bg3 border border-white/10 rounded-lg text-text focus:outline-none focus:border-teal/50 focus:ring-1 focus:ring-teal/50"
          >
            <option value="">Sélectionnez votre niveau</option>
            {schoolLevels.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
          {errors.schoolLevel && (
            <p className="mt-1 text-sm text-rose">{errors.schoolLevel.message}</p>
          )}
        </div>
      )}

      {watchedRole === 'CONTRIBUTEUR' && (
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register('acceptCGU')}
              className="w-4 h-4 bg-bg3 border-white/10 rounded text-teal focus:ring-teal/50"
            />
            <span className="text-sm text-text-muted">
              J'accepte les <a href="/cgu" className="text-teal hover:underline">Conditions Générales d'Utilisation</a>
            </span>
          </label>
          {errors.acceptCGU && (
            <p className="mt-1 text-sm text-rose">{errors.acceptCGU.message}</p>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !watchedRole}
        className="w-full py-3 px-4 btn-primary rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Enregistrement...' : 'Continuer'}
      </button>
    </form>
  )
}
