import { NextResponse } from 'next/server'
import { db } from '@/lib/db-client'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = 'demo-user-id' // In production, get from session

    // Verify user has purchased this subject
    const purchase = await db.purchase.findFirst({
      where: {
        userId,
        subjectId: id,
        status: 'COMPLETED',
      },
    })

    if (!purchase) {
      return NextResponse.json(
        { error: 'Vous n\'avez pas acheté ce sujet' },
        { status: 403 }
      )
    }

    // Get subject
    const subject = await db.subject.findUnique({
      where: { id },
    })

    if (!subject) {
      return NextResponse.json(
        { error: 'Sujet non trouvé' },
        { status: 404 }
      )
    }

    // In production, get the PDF from Vercel Blob or S3
    // For now, return a placeholder download
    // In production:
    // const { url } = await download(subject.blobUrl, {
    //   token: process.env.BLOB_READ_WRITE_TOKEN,
    // })

    return NextResponse.json({
      downloadUrl: `/api/files/${id}.pdf`, // Placeholder
      titre: subject.titre,
      message: 'En production: lien de téléchargement signé depuis Vercel Blob',
    })
  } catch (error) {
    console.error('Error generating download:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la génération du téléchargement' },
      { status: 500 }
    )
  }
}
