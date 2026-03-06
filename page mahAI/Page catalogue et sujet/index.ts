// types/index.ts - Types principaux de Mah.AI

/**
 * Types d'examens supportés
 */
export type TypeExamen = 
  | 'CEPE'
  | 'BEPC' 
  | 'BAC'
  | 'UNIVERSITE'
  | 'CONCOURS_FP';

/**
 * Séries pour le BAC
 */
export type SerieBac = 
  | 'A' 
  | 'C' 
  | 'D' 
  | 'L' 
  | 'S' 
  | 'OSIE' 
  | 'TECHNIQUE' 
  | 'PROFESSIONNEL';

/**
 * Matières principales
 */
export type Matiere =
  | 'MATHEMATIQUES'
  | 'PHYSIQUE_CHIMIE'
  | 'SVT'
  | 'FRANCAIS'
  | 'ANGLAIS'
  | 'MALAGASY'
  | 'HISTOIRE_GEO'
  | 'PHILOSOPHIE'
  | 'INFORMATIQUE'
  | 'AUTRE';

/**
 * Statut d'un sujet
 */
export type StatutSujet =
  | 'BROUILLON'
  | 'EN_VERIFICATION'
  | 'PUBLIE'
  | 'REFUSE'
  | 'ARCHIVE';

/**
 * Rôles utilisateurs
 */
export type UserRole =
  | 'ETUDIANT'
  | 'CONTRIBUTEUR'
  | 'VERIFICATEUR'
  | 'PROFESSEUR'
  | 'ADMIN';

/**
 * Type d'accès à un sujet
 */
export type TypeAcces =
  | 'SUJET'
  | 'CORRECTION_IA'
  | 'CORRECTION_PROF'
  | 'EXAMEN_BLANC';

/**
 * Interface User (depuis Prisma + Clerk)
 */
export interface User {
  id: string;
  clerkId: string;
  email: string;
  prenom: string;
  nom?: string;
  telephone?: string;
  region?: string;
  photo?: string;
  bio?: string;
  credits: number;
  roles: UserRole[];
  niveauScolaire?: string;
  serie?: string;
  etablissement?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface Sujet complet
 */
export interface Sujet {
  id: string;
  titre: string;
  contenu: any; // JSON Tiptap
  contenuTexte?: string;
  typeExamen: TypeExamen;
  serie?: SerieBac;
  matiere: Matiere;
  annee: number;
  duree?: number; // en minutes
  bareme?: number;
  difficulte?: number; // 1-5
  nbPages?: number;
  statut: StatutSujet;
  prixCredits: number;
  notemoyenne?: number;
  nbNotes?: number;
  nbAchats?: number;
  urlPdf?: string;
  contributeurId: string;
  verificateurId?: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  
  // Relations virtuelles (non en DB)
  contributeur?: User;
  verificateur?: User;
}

/**
 * Interface Achat
 */
export interface Achat {
  id: string;
  userId: string;
  sujetId?: string;
  typeAcces: TypeAcces;
  creditsPaies: number;
  createdAt: Date;
  
  // Relations
  user?: User;
  sujet?: Sujet;
}

/**
 * Filtres pour la recherche de sujets
 */
export interface SujetFilters {
  typeExamen?: TypeExamen[];
  matiere?: Matiere[];
  serie?: SerieBac[];
  anneeMin?: number;
  anneeMax?: number;
  maxCredits?: number;
  search?: string;
  statut?: StatutSujet;
}

/**
 * Options de tri
 */
export type SortOption =
  | 'recents'
  | 'populaires'
  | 'mieux_notes'
  | 'prix_croissant'
  | 'prix_decroissant';

/**
 * Résultat paginé
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Badge pour affichage UI
 */
export interface Badge {
  label: string;
  color: 'teal' | 'gold' | 'rose' | 'blue' | 'purple' | 'green' | 'orange';
}

/**
 * Métadonnées d'affichage d'un sujet
 */
export interface SujetDisplay extends Sujet {
  emoji: string;
  badges: Badge[];
  color: string;
  arPrice: string;
  isNew: boolean;
  isPopular: boolean;
}
