import { prisma } from '@/lib/prisma'
import SubjectDetailClient from './page.client'
import { notFound } from 'next/navigation'

interface SubjectPageProps {
  params: Promise<{ id: string }>
}

export default async function SubjectPage({ params }: SubjectPageProps) {
  const { id } = await params

  try {
    const subject = await prisma.subject.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            prenom: true,
            nom: true,
          },
        },
      },
    })

    if (!subject) {
      notFound()
    }

    // In production, get userId from session
    const userId = 'demo-user-id'
    
    // Get user credits (in production, fetch from authenticated user)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    })

    // Check if user has already purchased this subject
    const purchase = await prisma.purchase.findFirst({
      where: {
        userId,
        subjectId: id,
        status: 'COMPLETED',
      },
    })

    return (
      <SubjectDetailClient
        subject={subject}
        userCredits={user?.credits || 0}
        hasPurchased={!!purchase}
      />
    )
  } catch (error) {
    console.error('Error fetching subject:', error)
    notFound()
  }
}
