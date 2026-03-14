import { PrismaClient, ExamenType, Difficulte, Langue, Format, Badge, Role } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Nettoyage (Optionnel, à utiliser avec précaution)
  // await prisma.purchase.deleteMany()
  // await prisma.wishlist.deleteMany()
  // await prisma.subject.deleteMany()
  // await prisma.user.deleteMany()

  // Créer un utilisateur Admin/Auteur
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mah-ai.mg' },
    update: {},
    create: {
      email: 'admin@mah-ai.mg',
      prenom: 'Admin',
      nom: 'MahAI',
      role: Role.ADMIN,
      credits: 5000,
    },
  })

  const matieres = [
    'Mathématiques', 'Physique-Chimie', 'SVT', 'Français', 
    'Histoire-Géographie', 'Philosophie', 'Anglais', 'Malagasy'
  ]

  const types = [ExamenType.BAC, ExamenType.BEPC, ExamenType.CEPE]
  const difficultes = [Difficulte.FACILE, Difficulte.MOYEN, Difficulte.DIFFICILE]
  const badges = [Badge.AI, Badge.GOLD, Badge.FREE, Badge.INTER]
  const glyphes: Record<string, string> = {
    'Mathématiques': '∑',
    'Physique-Chimie': 'φ',
    'SVT': 'Ω',
    'Français': '∂',
    'Histoire-Géographie': 'π',
    'Philosophie': 'λ',
    'Anglais': 'A',
    'Malagasy': 'M'
  }

  const subjectsData = []

  for (let i = 1; i <= 50; i++) {
    const type = types[Math.floor(Math.random() * types.length)]
    const matiere = matieres[Math.floor(Math.random() * matieres.length)]
    const diff = difficultes[Math.floor(Math.random() * difficultes.length)]
    const badge = badges[Math.floor(Math.random() * badges.length)]
    const annee = (2015 + Math.floor(Math.random() * 10)).toString()
    
    subjectsData.push({
      titre: `${matiere} — Session ${annee} (${type})`,
      type: type,
      matiere: matiere,
      annee: annee,
      serie: type === ExamenType.BAC ? (Math.random() > 0.5 ? 'S' : 'L') : null,
      description: `Sujet officiel de ${matiere} pour l'examen du ${type} session ${annee}.`,
      pages: 4 + Math.floor(Math.random() * 15),
      credits: badge === Badge.FREE ? 0 : 5 + Math.floor(Math.random() * 25),
      difficulte: diff,
      langue: Math.random() > 0.2 ? Langue.FRANCAIS : Langue.MALGACHE,
      format: Math.random() > 0.3 ? Format.PDF : Format.INTERACTIF,
      badge: badge,
      glyph: glyphes[matiere] || '?',
      featured: i <= 5, // Les 5 premiers sont mis en avant
      rating: 3.5 + Math.random() * 1.5,
      reviewsCount: Math.floor(Math.random() * 300),
      authorId: admin.id,
      hasCorrectionIa: Math.random() > 0.3,
      hasCorrectionProf: Math.random() > 0.7,
    })
  }

  for (const data of subjectsData) {
    await prisma.subject.create({ data })
  }

  console.log('✅ Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
