import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
})

const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Démarrage du seed de la base de données...')

  // 1. Créer un utilisateur de test
  const testUser = await prisma.user.upsert({
    where: { email: 'test@mahai.mg' },
    update: {},
    create: {
      id: 'test-user-1',
      email: 'test@mahai.mg',
      prenom: 'Test',
      nom: 'User',
      role: 'ETUDIANT',
      credits: 100,
      phoneVerified: false,
      emailVerified: true,
    },
  })
  console.log('✅ Utilisateur de test créé:', testUser.email)

  // 2. Créer des sujets
  const subjects = [
    // BAC Mathématiques
    {
      titre: 'Algèbre & Fonctions — Session officielle',
      type: 'BAC',
      matiere: 'Mathématiques',
      annee: '2024',
      serie: 'C&D',
      description: 'Sujet complet d\'algèbre avec fonctions, suites et probabilités',
      pages: 18,
      credits: 15,
      difficulte: 'DIFFICILE',
      langue: 'FRANCAIS',
      format: 'PDF',
      badge: 'GOLD',
      glyph: '∑',
      featured: true,
      rating: 4.8,
      reviewsCount: 124,
      hasCorrectionIa: true,
    },
    {
      titre: 'Analyse & Géométrie dans l\'espace',
      type: 'BAC',
      matiere: 'Mathématiques',
      annee: '2023',
      serie: 'C',
      description: 'Épreuves d\'analyse et géométrie 3D',
      pages: 16,
      credits: 12,
      difficulte: 'DIFFICILE',
      langue: 'FRANCAIS',
      format: 'PDF',
      badge: 'AI',
      glyph: '∑',
      featured: false,
      rating: 4.6,
      reviewsCount: 89,
      hasCorrectionIa: true,
    },
    
    // BAC Physique
    {
      titre: 'Mécanique & Électricité',
      type: 'BAC',
      matiere: 'Physique-Chimie',
      annee: '2024',
      serie: 'C',
      description: 'Mécanique du point et circuits électriques',
      pages: 14,
      credits: 15,
      difficulte: 'DIFFICILE',
      langue: 'FRANCAIS',
      format: 'PDF',
      badge: 'GOLD',
      glyph: 'φ',
      featured: true,
      rating: 4.7,
      reviewsCount: 98,
      hasCorrectionIa: true,
    },
    {
      titre: 'Thermodynamique & Ondes',
      type: 'BAC',
      matiere: 'Physique-Chimie',
      annee: '2023',
      serie: 'C',
      description: 'Thermodynamique et propagation des ondes',
      pages: 12,
      credits: 10,
      difficulte: 'MOYEN',
      langue: 'FRANCAIS',
      format: 'PDF',
      badge: 'AI',
      glyph: 'φ',
      featured: false,
      rating: 4.5,
      reviewsCount: 67,
      hasCorrectionIa: true,
    },
    
    // BAC SVT
    {
      titre: 'Biologie Cellulaire & Génétique',
      type: 'BAC',
      matiere: 'SVT',
      annee: '2024',
      serie: 'D',
      description: 'Structure cellulaire et lois de Mendel',
      pages: 16,
      credits: 20,
      difficulte: 'DIFFICILE',
      langue: 'FRANCAIS',
      format: 'PDF',
      badge: 'INTER',
      glyph: 'Ω',
      featured: false,
      rating: 4.4,
      reviewsCount: 65,
      hasCorrectionIa: false,
    },
    {
      titre: 'Évolution & Écologie',
      type: 'BAC',
      matiere: 'SVT',
      annee: '2023',
      serie: 'D',
      description: 'Théorie de l\'évolution et écosystèmes',
      pages: 14,
      credits: 15,
      difficulte: 'MOYEN',
      langue: 'FRANCAIS',
      format: 'PDF',
      badge: 'AI',
      glyph: 'Ω',
      featured: false,
      rating: 4.3,
      reviewsCount: 52,
      hasCorrectionIa: true,
    },
    
    // BAC Français
    {
      titre: 'Dissertation & Analyse littéraire',
      type: 'BAC',
      matiere: 'Français',
      annee: '2024',
      serie: 'A',
      description: 'Dissertation sur les classiques français',
      pages: 8,
      credits: 10,
      difficulte: 'MOYEN',
      langue: 'FRANCAIS',
      format: 'PDF',
      badge: 'AI',
      glyph: '∂',
      featured: false,
      rating: 4.6,
      reviewsCount: 78,
      hasCorrectionIa: false,
    },
    {
      titre: 'Commentaire composé — Poésie',
      type: 'BAC',
      matiere: 'Français',
      annee: '2023',
      serie: 'A',
      description: 'Analyse de poèmes de Baudelaire et Rimbaud',
      pages: 6,
      credits: 8,
      difficulte: 'FACILE',
      langue: 'FRANCAIS',
      format: 'PDF',
      badge: 'FREE',
      glyph: '∂',
      featured: false,
      rating: 4.9,
      reviewsCount: 215,
      hasCorrectionIa: false,
    },
    
    // BAC Philosophie
    {
      titre: 'Dissertation — La conscience',
      type: 'BAC',
      matiere: 'Philosophie',
      annee: '2024',
      serie: 'A',
      description: 'Réflexion sur la conscience et l\'inconscient',
      pages: 6,
      credits: 25,
      difficulte: 'DIFFICILE',
      langue: 'FRANCAIS',
      format: 'PDF',
      badge: 'GOLD',
      glyph: 'λ',
      featured: true,
      rating: 4.9,
      reviewsCount: 98,
      hasCorrectionIa: false,
    },
    
    // BEPC Mathématiques
    {
      titre: 'Algèbre & Géométrie',
      type: 'BEPC',
      matiere: 'Mathématiques',
      annee: '2024',
      serie: null,
      description: 'Équations, inéquations et théorème de Pythagore',
      pages: 10,
      credits: 8,
      difficulte: 'MOYEN',
      langue: 'FRANCAIS',
      format: 'PDF',
      badge: 'AI',
      glyph: '∑',
      featured: false,
      rating: 4.7,
      reviewsCount: 156,
      hasCorrectionIa: true,
    },
    {
      titre: 'Arithmétique & Statistiques',
      type: 'BEPC',
      matiere: 'Mathématiques',
      annee: '2023',
      serie: null,
      description: 'Nombres relatifs et tableaux statistiques',
      pages: 8,
      credits: 6,
      difficulte: 'FACILE',
      langue: 'FRANCAIS',
      format: 'PDF',
      badge: 'FREE',
      glyph: '∑',
      featured: false,
      rating: 4.8,
      reviewsCount: 203,
      hasCorrectionIa: false,
    },
    
    // BEPC Physique
    {
      titre: 'Électricité & Mécanique',
      type: 'BEPC',
      matiere: 'Physique-Chimie',
      annee: '2024',
      serie: null,
      description: 'Circuits simples et mouvement',
      pages: 8,
      credits: 8,
      difficulte: 'MOYEN',
      langue: 'FRANCAIS',
      format: 'PDF',
      badge: 'AI',
      glyph: 'φ',
      featured: false,
      rating: 4.5,
      reviewsCount: 87,
      hasCorrectionIa: true,
    },
    
    // BEPC Français
    {
      titre: 'Compréhension & Expression',
      type: 'BEPC',
      matiere: 'Français',
      annee: '2024',
      serie: null,
      description: 'Lecture compréhension et production écrite',
      pages: 6,
      credits: 5,
      difficulte: 'FACILE',
      langue: 'FRANCAIS',
      format: 'PDF',
      badge: 'FREE',
      glyph: '∂',
      featured: false,
      rating: 4.4,
      reviewsCount: 178,
      hasCorrectionIa: false,
    },
    
    // CEPE Mathématiques
    {
      titre: 'Calcul & Problèmes',
      type: 'CEPE',
      matiere: 'Mathématiques',
      annee: '2024',
      serie: null,
      description: 'Opérations de base et problèmes simples',
      pages: 6,
      credits: 3,
      difficulte: 'FACILE',
      langue: 'FRANCAIS',
      format: 'PDF',
      badge: 'FREE',
      glyph: '∑',
      featured: false,
      rating: 4.8,
      reviewsCount: 312,
      hasCorrectionIa: false,
    },
    {
      titre: 'Géométrie & Mesures',
      type: 'CEPE',
      matiere: 'Mathématiques',
      annee: '2023',
      serie: null,
      description: 'Figures géométriques et conversions',
      pages: 5,
      credits: 3,
      difficulte: 'FACILE',
      langue: 'FRANCAIS',
      format: 'PDF',
      badge: 'FREE',
      glyph: '∑',
      featured: false,
      rating: 4.7,
      reviewsCount: 289,
      hasCorrectionIa: false,
    },
    
    // CEPE Français
    {
      titre: 'Dictée & Compréhension',
      type: 'CEPE',
      matiere: 'Français',
      annee: '2024',
      serie: null,
      description: 'Dictée de mots et textes courts',
      pages: 4,
      credits: 3,
      difficulte: 'FACILE',
      langue: 'FRANCAIS',
      format: 'PDF',
      badge: 'FREE',
      glyph: '∂',
      featured: false,
      rating: 4.6,
      reviewsCount: 267,
      hasCorrectionIa: false,
    },
  ]

  let created = 0
  let updated = 0

  for (const subjectData of subjects) {
    const subject = await prisma.subject.upsert({
      where: {
        id: `seed-${subjectData.type.toLowerCase()}-${subjectData.matiere.toLowerCase().replace(/\s+/g, '-')}-${subjectData.annee}-${created}`,
      },
      update: subjectData,
      create: {
        ...subjectData,
        id: `seed-${subjectData.type.toLowerCase()}-${subjectData.matiere.toLowerCase().replace(/\s+/g, '-')}-${subjectData.annee}-${created}`,
        authorId: testUser.id,
      },
    })
    
    if (subject) {
      created++
      console.log(`  ✅ ${subject.titre}`)
    }
  }

  console.log(`\n📊 Résumé:`)
  console.log(`   ${created} sujets créés/mis à jour`)
  console.log(`   ${subjects.length} sujets au total`)
  
  // 3. Afficher quelques statistiques
  const stats = await prisma.subject.groupBy({
    by: ['type', 'matiere'],
    _count: true,
    _avg: { rating: true },
  })
  
  console.log(`\n📈 Statistiques par type et matière:`)
  stats.forEach(stat => {
    console.log(`   ${stat.type} - ${stat.matiere}: ${stat._count} sujets (note moy: ${stat._avg.rating?.toFixed(2) || 'N/A'})`)
  })
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
