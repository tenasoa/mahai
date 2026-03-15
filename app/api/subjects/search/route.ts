import { NextResponse } from 'next/server'
import { getSubjectsAction } from '@/actions/subjects'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') || ''
  
  if (!q || q.length < 2) {
    return NextResponse.json({ subjects: [] })
  }

  try {
    const result = await getSubjectsAction({ search: q, limit: 10 })
    return NextResponse.json({ subjects: result.subjects })
  } catch (error) {
    console.error('Error searching subjects:', error)
    return NextResponse.json(
      { error: 'Failed to search subjects' },
      { status: 500 }
    )
  }
}
