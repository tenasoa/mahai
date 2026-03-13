import { prisma } from '@/lib/prisma'
import { CatalogueClient } from '@/components/catalogue/CatalogueClient'

async function getSubjects(page: number = 1, limit: number = 12, q?: string) {
  const skip = (page - 1) * limit

  const where: any = {}

  if (q && q.length >= 2) {
    where.OR = [
      { titre: { contains: q, mode: 'insensitive' } },
      { matiere: { contains: q, mode: 'insensitive' } },
    ]
  }

  const [subjects, total] = await Promise.all([
    prisma.subject.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.subject.count({ where }),
  ])

  return {
    subjects,
    totalPages: Math.ceil(total / limit),
  }
}

export default async function CataloguePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>
}) {
  const params = await searchParams
  const page = parseInt(params.page || '1', 10)
  const q = params.q
  const { subjects, totalPages } = await getSubjects(page, 12, q)

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-content mx-auto px-content py-8">
        <div className="mb-8">
          <h1 className="text-h1 font-bold text-text">Catalogue</h1>
          <p className="mt-2 text-text-muted">
            Parcourir tous les sujets d'examens disponibles
          </p>
        </div>

        <CatalogueClient 
          initialSubjects={subjects} 
          initialPage={page}
          totalPages={totalPages}
          initialQuery={q}
        />
      </div>
    </div>
  )
}
