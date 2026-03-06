// ============================================
// MAH.AI — Types TypeScript
// ============================================

import type { Role } from '@prisma/client'

// ── UTILISATEUR ──────────────────────────────────────────────
export interface User {
  id: string
  clerkId: string
  email: string
  prenom: string
  nom?: string | null
  avatarUrl?: string | null
  credits: number
  roles: Role[]
  statut: string
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date | null
}

// ── SUJET ────────────────────────────────────────────────────
export interface Sujet {
  id: string
  titre: string
  contenu: any // JSON Tiptap
  contenuTexte?: string | null
  typeExamen: string
  matiere: string
  annee: number
  serie?: string | null
  prixCredits: number
  statut: string
  pdfUrl?: string | null
  pages: number
  notemoyenne?: number | null
  nbNotes: number
  nbAchats: number
  nbConsultations: number
  contributeurId: string
  createdAt: Date
  updatedAt: Date
  publieAt?: Date | null
}

// ── ACHAT ────────────────────────────────────────────────────
export interface Achat {
  id: string
  userId: string
  sujetId: string
  typeAcces: string
  creditsPaies: number
  pdfUrl?: string | null
  createdAt: Date
}

// ── TRANSACTION ──────────────────────────────────────────────
export interface Transaction {
  id: string
  userId: string
  montantAr: number
  creditsAttendus: number
  moyenPaiement: string
  numeroEnvoyeur: string
  reference?: string | null
  captureUrl?: string | null
  statut: string
  validePar?: string | null
  motifRejet?: string | null
  createdAt: Date
  valideAt?: Date | null
}

// ── NOTIFICATION ─────────────────────────────────────────────
export interface Notification {
  id: string
  userId: string
  titre: string
  message: string
  type: string
  lue: boolean
  lien?: string | null
  createdAt: Date
}

// ── COMPOSANTS ───────────────────────────────────────────────
export interface SubjectCardProps {
  sujet: Sujet
  onBuy?: (sujetId: string, typeAcces: string) => void
}

export interface FilterSidebarProps {
  onFilterChange?: (filters: Filters) => void
}

export interface Filters {
  typeExamen?: string[]
  matiere?: string[]
  annee?: number[]
  serie?: string[]
  prixMax?: number
}

// ── PAIEMENT ─────────────────────────────────────────────────
export type PaiementMoyen = 'MVOLA' | 'ORANGE_MONEY' | 'AIRTEL_MONEY'

export interface PackCredits {
  id: string
  nom: string
  credits: number
  prixAr: number
  bonus: number
  popular?: boolean
}

export const PACKS_CREDITS: PackCredits[] = [
  { id: 'decouverte', nom: 'Pack Découverte', credits: 10, prixAr: 5000, bonus: 0 },
  { id: 'revisions', nom: 'Pack Révisions', credits: 50, prixAr: 20000, bonus: 25, popular: true },
  { id: 'premium', nom: 'Pack Premium', credits: 150, prixAr: 50000, bonus: 50 },
]

// ── ROLES ────────────────────────────────────────────────────
export const ROLE_LABELS: Record<Role, string> = {
  ETUDIANT: 'Étudiant',
  CONTRIBUTEUR: 'Contributeur',
  VERIFICATEUR: 'Vérificateur',
  PROFESSEUR: 'Professeur',
  ADMIN: 'Admin',
}

export const ROLE_ICONS: Record<Role, string> = {
  ETUDIANT: '🎓',
  CONTRIBUTEUR: '✍️',
  VERIFICATEUR: '👁️',
  PROFESSEUR: '👨‍🏫',
  ADMIN: '⚙️',
}
