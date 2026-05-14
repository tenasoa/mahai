import { z } from 'zod'
import { REGISTER_ROLE_VALUES } from '@/lib/auth-flow'

/**
 * Validation de force du mot de passe.
 * Exige au moins 8 caractères, une majuscule, une minuscule,
 * un chiffre et un caractère spécial.
 *
 * Utilisé à la fois pour l'inscription et la réinitialisation.
 */
function strongPassword() {
  return z.string().superRefine((val, ctx) => {
    if (val.length < 8) {
      ctx.addIssue({ code: z.ZodIssueCode.too_small, minimum: 8, type: 'string', inclusive: true, message: 'Le mot de passe doit contenir au moins 8 caractères' })
      return
    }
    if (!/[A-Z]/.test(val)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Le mot de passe doit contenir au moins une majuscule' })
      return
    }
    if (!/[a-z]/.test(val)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Le mot de passe doit contenir au moins une minuscule' })
      return
    }
    if (!/[0-9]/.test(val)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Le mot de passe doit contenir au moins un chiffre' })
      return
    }
    if (!/[^A-Za-z0-9]/.test(val)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Le mot de passe doit contenir au moins un caractère spécial' })
      return
    }
  })
}

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'L\'e-mail est requis')
    .email('Adresse e-mail invalide'),
  password: strongPassword(),
  confirmPassword: z.string(),
  prenom: z
    .string()
    .min(1, 'Le prénom est requis')
    .max(50, 'Le prénom ne peut pas dépasser 50 caractères'),
  nom: z
    .string()
    .max(50, 'Le nom ne peut pas dépasser 50 caractères')
    .optional(),
  role: z.enum(REGISTER_ROLE_VALUES),
  etablissement: z.preprocess(
    (value) => typeof value === 'string' && value.trim() === '' ? undefined : value,
    z
      .string()
      .max(120, "L'établissement ne peut pas dépasser 120 caractères")
      .optional()
  ),
  referralCode: z.preprocess(
    (value) => {
      if (typeof value !== 'string') return undefined
      const normalized = value.trim().toUpperCase()
      return normalized.length > 0 ? normalized : undefined
    },
    z
      .string()
      .max(40, 'Le code de parrainage est invalide')
      .regex(/^[A-Z0-9-]+$/, 'Le code de parrainage est invalide')
      .optional()
  ),
  newsletterOptIn: z.boolean().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
})

export type RegisterFormData = z.infer<typeof registerSchema>

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'L\'e-mail est requis')
    .email('Adresse e-mail invalide'),
  password: z
    .string()
    .min(1, 'Le mot de passe est requis'),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'L\'e-mail est requis')
    .email('Adresse e-mail invalide'),
})

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Le token de réinitialisation est requis'),
  password: strongPassword(),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
})

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Le token de vérification est requis'),
})

export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>
