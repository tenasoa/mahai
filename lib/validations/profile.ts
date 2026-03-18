import { z } from 'zod'
import { MADAGASCAR_REGIONS } from '../data/madagascar-geo'

// Niveaux d'études supportés
export const EDUCATION_LEVELS = [
  'PRIMAIRE', 
  'COLLEGE', 
  'LYCEE', 
  'UNIVERSITE', 
  'FACULTE', 
  'INSTITUT', 
  'FORMATION'
] as const

// Classes par niveau
export const GRADE_LEVELS = [
  // Primaire
  '11EME', '10EME', '9EME', '8EME', '7EME',
  // Collège
  '6EME', '5EME', '4EME', '3EME',
  // Lycée
  'SECONDE', 'PREMIERE', 'TERMINALE',
  // Supérieur
  'L1', 'L2', 'L3', 'M1', 'M2',
  // Autre
  'AUTRE'
] as const

// Types d'utilisateurs
export const USER_TYPES = ['ETUDIANT', 'PROFESSIONNEL', 'ENSEIGNANT', 'PARENT', 'AUTRE'] as const

// Schéma de validation pour la mise à jour du profil
export const updateProfileSchema = z.object({
  // Informations personnelles
  userType: z.enum(USER_TYPES).optional(),
  customUserType: z.string().optional(),
  birthDate: z.string().optional(),
  phone: z.string().optional(),
  
  // Informations académiques
  etablissement: z.string().optional(),
  educationLevel: z.enum(EDUCATION_LEVELS).optional(),
  gradeLevel: z.enum(GRADE_LEVELS).optional(),
  filiere: z.string().optional(),
  
  // Localisation
  region: z.string().optional(),
  district: z.string().optional(),
  
  // Préférences
  bio: z.string().max(500).optional(),
  matieresPreferees: z.array(z.string()).optional(),
  objectifsEtude: z.array(z.string()).optional(),
  
  // Paramètres de confidentialité
  profilePublic: z.boolean().optional(),
  showEmail: z.boolean().optional(),
  showPhone: z.boolean().optional(),
  showEtablissement: z.boolean().optional(),
  
  // Paramètres de notification
  notifCorrections: z.boolean().optional(),
  notifSujets: z.boolean().optional(),
  notifPromos: z.boolean().optional(),
  notifRappels: z.boolean().optional()
}).partial()

// Types TypeScript dérivés du schéma
export type UpdateProfileData = z.infer<typeof updateProfileSchema>

// Schéma pour la création de profil (plus strict)
export const createProfileSchema = z.object({
  userType: z.enum(USER_TYPES),
  prenom: z.string().min(1, 'Le prénom est requis'),
  nom: z.string().optional(),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  educationLevel: z.enum(EDUCATION_LEVELS).optional(),
  gradeLevel: z.enum(GRADE_LEVELS).optional(),
  region: z.string().optional(),
  district: z.string().optional()
})

export type CreateProfileData = z.infer<typeof createProfileSchema>

// Validation pour les champs spécifiques
export const validatePhoneNumber = (phone: string): boolean => {
  // Format Malagasy simple: 032, 033, 034, 038 suivi de 7 chiffres
  const phoneRegex = /^(032|033|034|038)\d{7}$|^\+261(32|33|34|38)\d{7}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

export const validateMadagascarRegion = (region: string): boolean => {
  return MADAGASCAR_REGIONS.some(r => r.name === region)
}

export const validateDistrictForRegion = (regionName: string, districtName: string): boolean => {
  const region = MADAGASCAR_REGIONS.find(r => r.name === regionName)
  return region ? region.districts.includes(districtName) : false
}
