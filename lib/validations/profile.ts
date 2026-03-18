import { z } from 'zod'
import { MADAGASCAR_REGIONS } from '../data/madagascar-geo'
import { EDUCATION_LEVELS as EDUCATION_LEVELS_CONST, USER_TYPES as USER_TYPES_CONST, GRADE_LEVELS as GRADE_LEVELS_CONST } from '../constants/profile-data'

// Extraire les valeurs des constantes
export const EDUCATION_LEVEL_VALUES = EDUCATION_LEVELS_CONST.map(level => level.value) as readonly string[]
export const USER_TYPE_VALUES = USER_TYPES_CONST.map(type => type.value) as readonly string[]
export const GRADE_LEVEL_VALUES = GRADE_LEVELS_CONST as readonly string[]

// Niveaux d'études supportés (pour référence)
export const EDUCATION_LEVELS = EDUCATION_LEVEL_VALUES
export const USER_TYPES = USER_TYPE_VALUES
export const GRADE_LEVELS = GRADE_LEVEL_VALUES

// Schéma de validation pour la mise à jour du profil
export const updateProfileSchema = z.object({
  // Informations personnelles
  nomComplet: z.string().optional(),
  pseudo: z.string().optional(),
  userType: z.union([z.literal('ETUDIANT'), z.literal('PROFESSIONNEL'), z.literal('ENSEIGNANT'), z.literal('PARENT'), z.literal('AUTRE')]).optional(),
  customUserType: z.string().optional(),
  birthDate: z.string().optional(),
  phone: z.string().optional(),

  // Informations académiques
  etablissement: z.string().optional(),
  educationLevel: z.union([z.literal('PRIMAIRE'), z.literal('COLLEGE'), z.literal('LYCEE'), z.literal('UNIVERSITE'), z.literal('FACULTE'), z.literal('INSTITUT'), z.literal('FORMATION')]).optional(),
  gradeLevel: z.union([z.literal('11EME'), z.literal('10EME'), z.literal('9EME'), z.literal('8EME'), z.literal('7EME'), z.literal('6EME'), z.literal('5EME'), z.literal('4EME'), z.literal('3EME'), z.literal('SECONDE'), z.literal('PREMIERE'), z.literal('TERMINALE'), z.literal('L1'), z.literal('L2'), z.literal('L3'), z.literal('M1'), z.literal('M2'), z.literal('AUTRE')]).optional(),
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
  userType: z.union([z.literal('ETUDIANT'), z.literal('PROFESSIONNEL'), z.literal('ENSEIGNANT'), z.literal('PARENT'), z.literal('AUTRE')]),
  prenom: z.string().min(1, 'Le prénom est requis'),
  nom: z.string().optional(),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  educationLevel: z.union([z.literal('PRIMAIRE'), z.literal('COLLEGE'), z.literal('LYCEE'), z.literal('UNIVERSITE'), z.literal('FACULTE'), z.literal('INSTITUT'), z.literal('FORMATION')]).optional(),
  gradeLevel: z.union([z.literal('11EME'), z.literal('10EME'), z.literal('9EME'), z.literal('8EME'), z.literal('7EME'), z.literal('6EME'), z.literal('5EME'), z.literal('4EME'), z.literal('3EME'), z.literal('SECONDE'), z.literal('PREMIERE'), z.literal('TERMINALE'), z.literal('L1'), z.literal('L2'), z.literal('L3'), z.literal('M1'), z.literal('M2'), z.literal('AUTRE')]).optional(),
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
