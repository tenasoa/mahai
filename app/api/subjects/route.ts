import { NextResponse } from 'next/server'
import { getSubjectsAction } from '@/actions/subjects'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '12', 10)
  
  const types = searchParams.get('types')?.split(',').filter(Boolean) || []
  const matieres = searchParams.get('matieres')?.split(',').filter(Boolean) || []
  const annees = searchParams.get('annees')?.split(',').filter(Boolean) || []
  const difficultes = searchParams.get('difficultes')?.split(',').filter(Boolean) || []
  const langues = searchParams.get('langues')?.split(',').filter(Boolean) || []
  const formats = searchParams.get('formats')?.split(',').filter(Boolean) || []
  
  const sortBy = searchParams.get('sortBy') as any || 'recent'
  const q = searchParams.get('q') || ''
  const minRating = searchParams.get('minRating') ? parseFloat(searchParams.get('min')!) : undefined
  const maxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined
  
  const hasCorrectionIa = searchParams.get('hasCorrectionIa') === 'true'
  const hasCorrectionProf = searchParams.get('hasCorrectionProf') === 'true'

  const filters = {
    search: q,
    types,
    matiere: matieres[0],
    difficultes,
    langues,
    formats,
    minRating,
    maxPrice,
    page,
    limit,
    sortBy
  }

  try {
    const result = await getSubjectsAction(filters)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching subjects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subjects' },
      { status: 500 }
    )
  }
}
