import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  // TODO: Implement wishlist functionality
  return NextResponse.json({ message: 'Wishlist not implemented yet' })
}
