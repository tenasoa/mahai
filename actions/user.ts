'use server'

import { prisma } from '@/lib/prisma'

export async function getUserCredits(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true }
    })
    
    return user?.credits || 0
  } catch (error) {
    console.error('Error fetching user credits:', error)
    return 0
  }
}
