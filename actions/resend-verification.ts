'use server'

import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function resendVerificationEmail(email: string) {
  try {
    // Find existing user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return { error: 'Utilisateur non trouvé' }
    }

    if (user.emailVerified) {
      return { error: 'Email déjà vérifié' }
    }

    // Create new verification token (6 digits)
    const token = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Delete old tokens
    await prisma.emailVerification.deleteMany({
      where: { email },
    })

    // Create new token
    await prisma.emailVerification.create({
      data: {
        email,
        token,
        expiresAt,
      },
    })

    // Send verification email
    try {
      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: email,
        subject: '📧 Nouveau code de vérification - Mah.AI',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
            <div style="background-color: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h1 style="color: #333; text-align: center; margin-bottom: 20px;">📧 Mah.AI - Nouveau code de vérification</h1>
              
              <p style="color: #666; font-size: 16px; line-height: 1.5;">
                Bonjour ${user.prenom} !<br><br>
                Voici votre nouveau code de vérification pour votre compte Mah.AI.
              </p>
              
              <div style="background-color: #f0f8ff; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <p style="color: #333; font-size: 14px; margin: 0 0 10px 0;">Votre nouveau code de vérification :</p>
                <div style="font-size: 32px; font-weight: bold; color: #28a745; letter-spacing: 5px; background: #fff; padding: 15px; border-radius: 5px; border: 2px solid #28a745;">
                  ${token}
                </div>
              </div>
              
              <p style="color: #666; font-size: 14px; line-height: 1.5;">
                <strong>Important :</strong><br>
                • Ce code expire dans 24 heures<br>
                • Ne partagez ce code avec personne<br>
                • Une fois vérifié, vous recevrez 10 crédits de bienvenue
              </p>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="color: #999; font-size: 12px; margin: 0;">
                  © 2024 Mah.AI - Plateforme d'éducation malgache
                </p>
              </div>
            </div>
          </div>
        `,
      })
    } catch (emailError) {
      console.error('Error sending verification email:', emailError)
    }

    return { success: 'Nouveau code de vérification envoyé !' }
  } catch (error) {
    return { error: 'Erreur lors de l\'envoi du code' }
  }
}
