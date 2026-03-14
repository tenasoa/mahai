'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, verifyEmailSchema, type RegisterFormData, type LoginFormData, type ForgotPasswordFormData, type ResetPasswordFormData, type VerifyEmailFormData } from '@/lib/validations/auth'
import crypto from 'crypto'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Helper function to generate consistent 6-digit code
function generate6DigitCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function registerUser(formData: RegisterFormData) {
  const supabase = await createSupabaseServerClient()

  const validation = registerSchema.safeParse(formData)

  if (!validation.success) {
    return {
      error: validation.error.errors[0].message,
      fields: formData,
    }
  }

  const { email, password, prenom, nom } = validation.data

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        prenom,
        nom: nom || '',
      },
    },
  })

  if (authError) {
    return {
      error: authError.message,
      fields: formData,
    }
  }

  if (authData.user) {
    // Create email verification token (6 digits)
    const token = generate6DigitCode()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

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
        subject: 'Vérifiez votre adresse email - Mah.AI',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
            <div style="background-color: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h1 style="color: #333; text-align: center; margin-bottom: 20px;">📧 Mah.AI - Vérification de votre email</h1>
              
              <p style="color: #666; font-size: 16px; line-height: 1.5;">
                Bienvenue ${prenom} !<br><br>
                Merci de vous être inscrit sur Mah.AI. Pour activer votre compte, veuillez vérifier votre adresse email.
              </p>
              
              <div style="background-color: #f0f8ff; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <p style="color: #333; font-size: 14px; margin: 0 0 10px 0;">Votre code de vérification :</p>
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
              
              <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                <p style="color: #856404; font-size: 14px; margin: 0;">
                  <strong>🎁 Bonus de bienvenue :</strong><br>
                  10 crédits offerts après vérification de votre email !
                </p>
              </div>
              
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
      // Continue even if email fails
    }

    await prisma.user.create({
      data: {
        id: authData.user.id,
        email,
        prenom,
        nom: nom || null,
        role: 'ETUDIANT',
        credits: 10,
      },
    })
  }

  revalidatePath('/dashboard', 'layout')
  redirect('/auth/verify-email?email=' + encodeURIComponent(email))
}

export type RoleFormData = {
  role: 'ETUDIANT' | 'CONTRIBUTEUR' | 'PROFESSEUR'
  schoolLevel?: string
  acceptCGU?: boolean
}

export async function updateUserRole(formData: RoleFormData) {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) {
    return { error: 'Vous devez être connecté pour effectuer cette action' }
  }

  const updateData: any = {
    role: formData.role,
  }

  if (formData.role === 'ETUDIANT' && formData.schoolLevel) {
    updateData.schoolLevel = formData.schoolLevel
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    })
  } catch (error) {
    console.error('Error updating role:', error)
    return { error: 'Erreur lors de la mise à jour du rôle' }
  }

  revalidatePath('/dashboard', 'layout')
  redirect('/dashboard')
}

export async function loginUser(formData: LoginFormData) {
  const supabase = await createSupabaseServerClient()

  const validation = loginSchema.safeParse(formData)

  if (!validation.success) {
    return {
      error: validation.error.errors[0].message,
      fields: formData,
    }
  }

  const { email, password } = validation.data

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError) {
    return {
      error: 'Email ou mot de passe incorrect',
      fields: formData,
    }
  }

  revalidatePath('/dashboard', 'layout')
  redirect('/dashboard')
}

export async function logoutUser() {
  const supabase = await createSupabaseServerClient()

  await supabase.auth.signOut()

  revalidatePath('/', 'layout')
  redirect('/auth/login')
}

export async function requestPasswordReset(formData: ForgotPasswordFormData) {
  const validation = forgotPasswordSchema.safeParse(formData)

  if (!validation.success) {
    return {
      error: validation.error.errors[0].message,
      fields: formData,
    }
  }

  const { email } = validation.data

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    // Don't reveal that user doesn't exist
    return { success: 'Si cet email existe, un code de réinitialisation a été envoyé.' }
  }

  // Create password reset token (6 digits)
  const token = generate6DigitCode()
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
  
  console.log('🔐 Password Reset Token Generated:', { token, email, expiresAt })

  await prisma.passwordReset.create({
    data: {
      email,
      token,
      expiresAt,
    },
  })

  // Send password reset email
  try {
    console.log('📧 Sending email with token:', token)
    
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Code de réinitialisation Mah.AI',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #333; text-align: center; margin-bottom: 20px;">🔐 Mah.AI - Réinitialisation du mot de passe</h1>
            
            <p style="color: #666; font-size: 16px; line-height: 1.5;">
              Bonjour,<br><br>
              Vous avez demandé à réinitialiser votre mot de passe pour votre compte Mah.AI.
            </p>
            
            <div style="background-color: #f0f8ff; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <p style="color: #333; font-size: 14px; margin: 0 0 10px 0;">Votre code de réinitialisation :</p>
              <div style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 5px; background: #fff; padding: 15px; border-radius: 5px; border: 2px solid #007bff;">
                ${token}
              </div>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.5;">
              <strong>Important :</strong><br>
              • Ce code expire dans 1 heure<br>
              • Ne partagez ce code avec personne<br>
              • Si vous n'avez pas demandé cette réinitialisation, ignorez cet email
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
    console.error('Error sending password reset email:', emailError)
    // Continue even if email fails
  }

  return { success: 'Si cet email existe, un code de réinitialisation a été envoyé.' }
}

export async function resetPassword(formData: ResetPasswordFormData) {
  const validation = resetPasswordSchema.safeParse(formData)

  if (!validation.success) {
    return {
      error: validation.error.errors[0].message,
      fields: formData,
    }
  }

  const { token, password } = validation.data

  console.log('🔍 Reset Password Attempt:', { token, password })

  // Find valid reset token
  const resetToken = await prisma.passwordReset.findFirst({
    where: {
      token,
      used: false,
      expiresAt: {
        gt: new Date(),
      },
    },
  })

  console.log('🔍 Found Token:', resetToken)

  if (!resetToken) {
    console.log('❌ Token validation failed')
    return { error: 'Token invalide ou expiré' }
  }

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: resetToken.email },
  })

  if (!user) {
    return { error: 'Utilisateur non trouvé' }
  }

  // Update password in Supabase
  const supabase = await createSupabaseAdminClient()
  
  // Find Supabase Auth user by email to be 100% sure of the ID
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
  const supabaseUser = users.find(u => u.email === resetToken.email)

  if (!supabaseUser) {
    console.error('❌ User not found in Supabase Auth:', resetToken.email)
    return { error: 'Compte non trouvé dans le système d\'authentification' }
  }

  console.log('🚀 Attempting to update Supabase password for ID:', supabaseUser.id)
  
  const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
    supabaseUser.id,
    { password }
  )

  if (updateError) {
    console.error('❌ Supabase Admin Update Error:', {
      message: updateError.message,
      status: updateError.status,
      code: updateError.code
    })
    return { error: `Erreur Supabase: ${updateError.message}` }
  }

  console.log('✅ Supabase password updated successfully')

  // Update password in Prisma using the Supabase ID
  // Password is now removed from Prisma for security
  await prisma.user.update({
    where: { id: user.id },
    data: {
      // Just updating the updatedAt timestamp if needed, 
      // or we can remove the update entirely if only email/password changed
      updatedAt: new Date(),
    },
  })

  // Mark token as used
  await prisma.passwordReset.update({
    where: { id: resetToken.id },
    data: { used: true },
  })

  return { success: 'Mot de passe réinitialisé avec succès' }
}

export async function verifyEmail(formData: VerifyEmailFormData) {
  const validation = verifyEmailSchema.safeParse(formData)

  if (!validation.success) {
    return {
      error: validation.error.errors[0].message,
      fields: formData,
    }
  }

  const { token } = validation.data

  // Find valid verification token
  const verificationToken = await prisma.emailVerification.findFirst({
    where: {
      token,
      used: false,
      expiresAt: {
        gt: new Date(),
      },
    },
  })

  if (!verificationToken) {
    return { error: 'Token invalide ou expiré' }
  }

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: verificationToken.email },
  })

  if (!user) {
    return { error: 'Utilisateur non trouvé' }
  }

  // Mark email as verified
  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true },
  })

  // Mark token as used
  await prisma.emailVerification.update({
    where: { id: verificationToken.id },
    data: { used: true },
  })

  // Add welcome credits if not already added
  if (user.credits === 0) {
    await prisma.user.update({
      where: { id: user.id },
      data: { credits: 10 },
    })

    // Create credit transaction
    await prisma.creditTransaction.create({
      data: {
        userId: user.id,
        amount: 10,
        type: 'EARN',
        description: 'Crédits de bienvenue',
        status: 'COMPLETED',
      },
    })
  }

  return { success: 'Email vérifié avec succès' }
}

export async function resendVerificationEmail(email: string) {
  try {
    // Find existing user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return { error: 'Utilisateur non trouvé' }
    }

    // Create new verification token (6 digits)
    const token = generate6DigitCode()
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
