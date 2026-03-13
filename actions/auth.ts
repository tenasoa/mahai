'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { createSupabaseServerClient } from '@/lib/supabase/client'
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, verifyEmailSchema, type RegisterFormData, type LoginFormData, type ForgotPasswordFormData, type ResetPasswordFormData, type VerifyEmailFormData } from '@/lib/validations/auth'
import crypto from 'crypto'

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
    // Create email verification token
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await prisma.emailVerification.create({
      data: {
        email,
        token,
        expiresAt,
      },
    })

    await prisma.user.create({
      data: {
        id: authData.user.id,
        email,
        password: password,
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

  // Create password reset token
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  await prisma.passwordReset.create({
    data: {
      email,
      token,
      expiresAt,
    },
  })

  // TODO: Send email with token
  console.log(`Password reset token for ${email}: ${token}`)

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

  if (!resetToken) {
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
  const supabase = await createSupabaseServerClient()
  const { error: updateError } = await supabase.auth.admin.updateUserById(
    user.id,
    { password }
  )

  if (updateError) {
    return { error: 'Erreur lors de la mise à jour du mot de passe' }
  }

  // Update password in Prisma
  await prisma.user.update({
    where: { id: user.id },
    data: { password },
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
