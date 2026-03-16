import { z } from 'zod'

// Schéma de validation pour la mise à jour du profil
export const updateProfileSchema = z.object({
  // Informations personnelles
  userType: z.enum(['ETUDIANT', 'PROFESSIONNEL', 'ENSEIGNANT', 'PARENT', 'AUTRE']).optional(),
  customUserType: z.string().optional(),
  age: z.number().min(13).max(100).optional(),
  dateNaissance: z.string().optional(),
  phone: z.string().optional(),
  
  // Informations académiques
  etablissement: z.string().optional(),
  educationLevel: z.enum(['PRIMAIRE', 'COLLEGE', 'LYCEE', 'UNIVERSITE', 'FORMATION']).optional(),
  gradeLevel: z.enum([
    '11EME', '10EME', '9EME', '8EME', '7EME',
    '6EME', '5EME', '4EME', '3EME',
    'SECONDE', 'PREMIERE', 'TERMINALE',
    'L1', 'L2', 'L3', 'M1', 'M2'
  ]).optional(),
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
  userType: z.enum(['ETUDIANT', 'PROFESSIONNEL', 'ENSEIGNANT', 'PARENT', 'AUTRE']),
  prenom: z.string().min(1, 'Le prénom est requis'),
  nom: z.string().optional(),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  educationLevel: z.enum(['PRIMAIRE', 'COLLEGE', 'LYCEE', 'UNIVERSITE', 'FORMATION']).optional(),
  gradeLevel: z.enum([
    '11EME', '10EME', '9EME', '8EME', '7EME',
    '6EME', '5EME', '4EME', '3EME',
    'SECONDE', 'PREMIERE', 'TERMINALE',
    'L1', 'L2', 'L3', 'M1', 'M2'
  ]).optional(),
  region: z.string().optional(),
  district: z.string().optional()
})

export type CreateProfileData = z.infer<typeof createProfileSchema>

// Validation pour les champs spécifiques
export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+261\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}$/
  return phoneRegex.test(phone)
}

export const validateAge = (age: number): boolean => {
  return age >= 13 && age <= 100
}

export const validateMadagascarRegion = (region: string): boolean => {
  const regions = [
    'Analamanga', 'Anosy', 'Androy', 'Atsimo-Andrefana', 'Atsimo-Atsinanana',
    'Alaotra-Mangoro', 'Amoron\'i Mania', 'Boeny', 'Betsiboka', 'Bongolava',
    'Diana', 'Haute Matsiatra', 'Ihorombe', 'Itasy', 'Melaky', 'Menabe',
    'Sofia', 'Sava', 'Vakinankaratra', 'Vatovavy-Fitovinany'
  ]
  return regions.includes(region)
}
