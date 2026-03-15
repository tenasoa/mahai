import { NextResponse } from 'next/server'
import { purchaseSubject } from '@/actions/user'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const result = await purchaseSubject(params.id, session.user.id)
    
    if (result.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error purchasing subject:', error)
    return NextResponse.json(
      { error: 'Failed to purchase subject' },
      { status: 500 }
    )
  }
}
