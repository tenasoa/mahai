import { z } from 'zod'

// ============================================
// MAH.AI — Utilitaires de formatage
// ============================================

// ── FORMAT ARIARY ────────────────────────────────────────────
export function formatAriary(amount: number): string {
  return new Intl.NumberFormat('fr-MG', {
    style: 'currency',
    currency: 'MGA',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// ── FORMAT DATE ──────────────────────────────────────────────
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

// ── FORMAT DATE RELATIVE ─────────────────────────────────────
export function formatRelativeTime(date: Date | string): string {
  const now = new Date()
  const then = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'à l\'instant'
  if (diffInSeconds < 3600) return `il y a ${Math.floor(diffInSeconds / 60)} min`
  if (diffInSeconds < 86400) return `il y a ${Math.floor(diffInSeconds / 3600)} h`
  if (diffInSeconds < 604800) return `il y a ${Math.floor(diffInSeconds / 86400)} j`
  
  return formatDate(date)
}

// ── TRONQUER TEXTE ───────────────────────────────────────────
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '…'
}

// ── SLUGIFY ──────────────────────────────────────────────────
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ── VALIDATEURS ──────────────────────────────────────────────
export const phoneSchema = z.string().regex(/^03[2-4]\d{8}$/, 'Numéro invalide')

export const emailSchema = z.string().email('Email invalide')

export const sujetSchema = z.object({
  titre: z.string().min(10, 'Le titre doit faire au moins 10 caractères'),
  typeExamen: z.enum(['CEPE', 'BEPC', 'BAC', 'CONCOURS_FP']),
  matiere: z.string().min(2, 'Matière requise'),
  annee: z.number().int().min(2000).max(new Date().getFullYear()),
  serie: z.string().optional(),
  prixCredits: z.number().int().positive(),
  contenu: z.any(), // JSON Tiptap
})

export const transactionSchema = z.object({
  montantAr: z.number().int().positive(),
  moyenPaiement: z.enum(['MVOLA', 'ORANGE_MONEY', 'AIRTEL_MONEY']),
  numeroEnvoyeur: phoneSchema,
  reference: z.string().optional(),
})
