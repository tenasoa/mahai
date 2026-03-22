// Types pour le catalogue basés sur le schéma de la base de données

export type ExamenType = 'BAC' | 'BEPC' | 'CEPE'
export type Difficulte = 'FACILE' | 'MOYEN' | 'DIFFICILE'
export type Langue = 'FRANCAIS' | 'MALGACHE'
export type Format = 'PDF' | 'INTERACTIF'
export type Badge = 'GOLD' | 'AI' | 'FREE' | 'INTER'

export interface Subject {
  id: string
  titre: string
  type: ExamenType
  matiere: string
  annee: string
  serie?: string | null
  description?: string | null
  pages: number
  credits: number
  difficulte: Difficulte
  langue: Langue
  format: Format
  badge: Badge
  glyph: string
  featured: boolean
  rating: number
  reviewsCount: number
  hasCorrectionIa: boolean
  hasCorrectionProf: boolean
  authorId: string
  createdAt: string
  isUnlocked?: boolean
  author?: {
    prenom: string
    nom?: string | null
  }
}

export interface WishlistItem {
  id: string
  userId: string
  subjectId: string
  subject: Subject
  createdAt: string
}

export interface CatalogueFilters {
  types?: ExamenType[]
  matieres?: string[]
  minRating?: number
  maxCredits?: number
  search?: string
}

export interface CatalogueQueryParams extends CatalogueFilters {
  page?: number
  limit?: number
  sortBy?: 'rating' | 'reviewsCount' | 'credits' | 'annee' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

// Mapping des glyphs par matière
export const MATIERE_GLYPHS: Record<string, string> = {
  'Mathématiques': '∑',
  'Physique-Chimie': 'φ',
  'SVT': 'Ω',
  'Français': '∂',
  'Anglais': 'α',
  'Histoire-Géographie': 'π',
  'Philosophie': 'λ',
  'Économie': '€',
  'Culture Générale': 'γ',
}

// Mapping des badges
export const BADGE_LABELS: Record<Badge, string> = {
  GOLD: 'Premium',
  AI: '✦ IA',
  FREE: 'Gratuit',
  INTER: 'Interactif',
}

// Mapping des difficultés
export const DIFFICULTE_LABELS: Record<Difficulte, string> = {
  FACILE: 'Facile',
  MOYEN: 'Moyen',
  DIFFICILE: 'Difficile',
}

// Mapping des couleurs par difficulté
export const DIFFICULTE_COLORS: Record<Difficulte, string> = {
  FACILE: '#6EAA8C',
  MOYEN: 'var(--gold)',
  DIFFICILE: '#E05575',
}
