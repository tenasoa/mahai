/**
 * Wrapper d'envoi d'emails transactionnels via Resend.
 *
 * Prérequis :
 *   pnpm add resend
 *   RESEND_API_KEY=re_xxxx
 */

import { logger } from './logger'

// Type laissé en `any` volontairement : `resend` est une dépendance optionnelle
// chargée dynamiquement (cf. getResend ci-dessous). Si le paquet n'est pas
// installé, l'import dynamique echoue et on retourne null sans bloquer le build.
let resendClient: any = null

async function getResend() {
  if (resendClient) return resendClient

  if (!process.env.RESEND_API_KEY) {
    return null
  }

  try {
    // @ts-ignore - `resend` est une dependance optionnelle non listee dans package.json
    const { Resend } = await import('resend')
    resendClient = new Resend(process.env.RESEND_API_KEY)
    return resendClient
  } catch {
    return null
  }
}

export interface SendEmailInput {
  to: string
  subject: string
  html: string
  replyTo?: string
}

export interface SendEmailResult {
  success: boolean
  messageId?: string
  error?: string
}

const FROM_ADDRESS = 'Mah.AI <noreply@mahai.mg>'

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const resend = await getResend()

  if (!resend) {
    logger.warn('Resend not configured, skipping email', { to: input.to, subject: input.subject })
    return { success: false, error: 'Resend not configured' }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      replyTo: input.replyTo,
    })

    if (error) {
      logger.error('Resend send failed', error, { to: input.to, subject: input.subject })
      return { success: false, error: error.message }
    }

    return { success: true, messageId: data?.id }
  } catch (error) {
    logger.error('Resend unexpected error', error, { to: input.to })
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// ── Templates d'emails ───────────────────────────────────────────────────

export function welcomeEmailTemplate(prenom: string): string {
  return `
    <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #faf8f5; border-radius: 12px; border: 1px solid rgba(168,120,42,0.15);">
      <h1 style="font-family: 'Cormorant Garamond', Georgia, serif; color: #1a1714; font-size: 24px; margin-bottom: 16px;">
        Bienvenue sur Mah<span style="color: #a8782a;">.</span>AI, ${prenom} !
      </h1>
      <p style="color: rgba(26,23,20,0.75); font-size: 15px; line-height: 1.6;">
        Votre compte a été créé avec succès. Vous avez reçu <strong>500 Ar</strong> de bonus pour commencer à explorer les sujets d'examen.
      </p>
      <a href="https://mahai.mg/dashboard" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #a8782a; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 500;">
        Accéder à mon tableau de bord
      </a>
    </div>
  `
}

export function purchaseConfirmationTemplate(prenom: string, sujetTitre: string, amountAr: number): string {
  return `
    <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #faf8f5; border-radius: 12px; border: 1px solid rgba(168,120,42,0.15);">
      <h1 style="font-family: 'Cormorant Garamond', Georgia, serif; color: #1a1714; font-size: 22px; margin-bottom: 16px;">Achat confirmé</h1>
      <p style="color: rgba(26,23,20,0.75); font-size: 15px; line-height: 1.6;">
        Bonjour ${prenom}, votre achat du sujet <strong>${sujetTitre}</strong> pour <strong>${amountAr} Ar</strong> a bien été effectué.
      </p>
      <a href="https://mahai.mg/dashboard" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #a8782a; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 500;">Voir mes sujets</a>
    </div>
  `
}

export function aiCorrectionReadyTemplate(prenom: string, sujetTitre: string): string {
  return `
    <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #faf8f5; border-radius: 12px; border: 1px solid rgba(168,120,42,0.15);">
      <h1 style="font-family: 'Cormorant Garamond', Georgia, serif; color: #1a1714; font-size: 22px; margin-bottom: 16px;">Votre correction IA est prête</h1>
      <p style="color: rgba(26,23,20,0.75); font-size: 15px; line-height: 1.6;">
        Bonjour ${prenom}, la correction IA pour <strong>${sujetTitre}</strong> est maintenant disponible.
      </p>
      <a href="https://mahai.mg/dashboard" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #a8782a; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 500;">Voir la correction</a>
    </div>
  `
}
