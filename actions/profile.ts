"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { query } from "@/lib/db";
import { db } from "@/lib/db-client";
import { logger } from "@/lib/logger";
import {
  updateProfileSchema,
  type UpdateProfileData,
} from "@/lib/validations/profile";

type AuthenticatedContext =
  | {
      supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
      userId: string;
    }
  | {
      error: string;
    };

async function getAuthenticatedContext(): Promise<AuthenticatedContext> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { error: "Vous devez être connecté pour effectuer cette action" };
  }

  return {
    supabase,
    userId: user.id,
  };
}

function extractProfileStoragePath(profilePicture: string | null | undefined) {
  if (!profilePicture) {
    return null;
  }

  try {
    const url = new URL(profilePicture);
    const marker = "/object/public/profiles/";
    const index = url.pathname.indexOf(marker);

    if (index === -1) {
      return null;
    }

    return decodeURIComponent(url.pathname.slice(index + marker.length));
  } catch {
    return null;
  }
}

async function getProfileByUserId(userId: string) {
  const result = await query('SELECT * FROM "User" WHERE id = $1 LIMIT 1', [
    userId,
  ]);
  return result.rows[0] ?? null;
}

export async function getCurrentProfileAction() {
  const context = await getAuthenticatedContext();

  if ("error" in context) {
    return { success: false, error: context.error };
  }

  try {
    const profile = await getProfileByUserId(context.userId);

    if (!profile) {
      return {
        success: false,
        error: "Erreur lors de la récupération du profil",
      };
    }

    return { success: true, data: profile };
  } catch (error) {
    logger.apiError("profile action", error);
    return { success: false, error: "Erreur serveur" };
  }
}

export async function updateCurrentUserProfileAction(data: UpdateProfileData) {
  const context = await getAuthenticatedContext();

  if ("error" in context) {
    return { success: false, error: context.error };
  }

  try {
    const validatedData = updateProfileSchema.parse(data);
    const entries = Object.entries(validatedData).filter(
      ([, value]) => value !== undefined,
    );
    const updatedAt = new Date().toISOString();
    const assignments: string[] = [];
    const values: unknown[] = [];

    entries.forEach(([field, value], index) => {
      assignments.push(`"${field}" = $${index + 1}`);
      values.push(value);
    });

    assignments.push(`"updatedAt" = $${entries.length + 1}`);
    values.push(updatedAt);
    values.push(context.userId);

    const result = await query(
      `UPDATE "User" SET ${assignments.join(", ")} WHERE id = $${entries.length + 2} RETURNING *`,
      values,
    );

    const profile = result.rows[0] ?? null;

    if (!profile) {
      return {
        success: false,
        error: "Erreur lors de la mise à jour du profil",
      };
    }

    revalidatePath("/profil");
    revalidatePath(`/profil/${context.userId}`);

    return { success: true, data: profile };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Données invalides",
        details: error.errors.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      };
    }

    logger.apiError("profile action unexpected", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erreur serveur inattendue",
    };
  }
}

const securitySettingsSchema = z.object({
  securityTwoFactorEnabled: z.boolean(),
  securityLoginAlertEnabled: z.boolean(),
  securityUnknownDeviceBlock: z.boolean(),
  securityRecoveryEmailEnabled: z.boolean(),
  securitySessionTimeoutMinutes: z.number().int().min(15).max(1440),
});

export interface PurchasedSubjectItem {
  id: string;
  titre: string;
  type: string;
  matiere: string;
  annee: string;
  serie: string | null;
  prix: number;
  rating: number;
  reviewsCount: number;
  amountAr: number;
  purchasedAt: string;
  // Champs deprecated (alias) gardés pour compat ascendante UI.
  credits?: number;
  creditsAmount?: number;
}

export async function getCurrentUserPurchasedSubjectsAction() {
  const context = await getAuthenticatedContext();

  if ("error" in context) {
    return {
      success: false,
      error: context.error,
      data: [] as PurchasedSubjectItem[],
    };
  }

  try {
    const result = await query(
      `SELECT
         s.id,
         s.titre,
         s.type,
         s.matiere,
         s.annee,
         s.serie,
         s.prix,
         s.rating,
         s."reviewsCount",
         p."amountAr",
         p."createdAt" AS "purchasedAt"
       FROM "Purchase" p
       JOIN "Subject" s ON s.id = p."subjectId"
       WHERE p."userId" = $1
         AND p.status = 'COMPLETED'
       ORDER BY p."createdAt" DESC`,
      [context.userId],
    );

    // Alias legacy (credits / creditsAmount) pour compat des composants UI
    // qui n'ont pas encore été migrés.
    const data = result.rows.map((r: any) => ({
      ...r,
      credits: r.prix,
      creditsAmount: r.amountAr,
    })) as PurchasedSubjectItem[];

    return { success: true, data };
  } catch (error) {
    logger.apiError("getPurchasedSubjects", error);
    return {
      success: false,
      error: "Impossible de récupérer vos sujets débloqués",
      data: [] as PurchasedSubjectItem[],
    };
  }
}

export async function updateCurrentUserSecuritySettingsAction(data: unknown) {
  const context = await getAuthenticatedContext();

  if ("error" in context) {
    return { success: false, error: context.error };
  }

  try {
    const validatedData = securitySettingsSchema.parse(data);
    const now = new Date().toISOString();

    const result = await query(
      `UPDATE "User"
       SET
         "securityTwoFactorEnabled" = $1,
         "securityLoginAlertEnabled" = $2,
         "securityUnknownDeviceBlock" = $3,
         "securityRecoveryEmailEnabled" = $4,
         "securitySessionTimeoutMinutes" = $5,
         "securitySettingsUpdatedAt" = $6,
         "updatedAt" = $6
       WHERE id = $7
       RETURNING
         "securityTwoFactorEnabled",
         "securityLoginAlertEnabled",
         "securityUnknownDeviceBlock",
         "securityRecoveryEmailEnabled",
         "securitySessionTimeoutMinutes",
         "securitySettingsUpdatedAt"`,
      [
        validatedData.securityTwoFactorEnabled,
        validatedData.securityLoginAlertEnabled,
        validatedData.securityUnknownDeviceBlock,
        validatedData.securityRecoveryEmailEnabled,
        validatedData.securitySessionTimeoutMinutes,
        now,
        context.userId,
      ],
    );

    revalidatePath("/profil");
    return { success: true, data: result.rows[0] ?? null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Paramètres de sécurité invalides" };
    }

    logger.apiError("updateSecurity", error);
    return {
      success: false,
      error: "Impossible de sauvegarder les paramètres de sécurité",
    };
  }
}

export async function uploadCurrentUserProfilePictureAction(file: File) {
  const context = await getAuthenticatedContext();

  if ("error" in context) {
    return { success: false, error: context.error };
  }

  try {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: "Type de fichier non supporté" };
    }

    if (file.size > maxSize) {
      return { success: false, error: "Fichier trop volumineux (max 5MB)" };
    }

    const fileExt = file.name.split(".").pop() || "webp";
    const fileName = `${context.userId}/profile.${fileExt}`;

    const { error: uploadError } = await context.supabase.storage
      .from("profiles")
      .upload(fileName, file, {
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      logger.apiError("profileImageUpload", uploadError);
      return { success: false, error: "Erreur lors du téléchargement" };
    }

    const {
      data: { publicUrl },
    } = context.supabase.storage.from("profiles").getPublicUrl(fileName);

    const updateResult = await query(
      'UPDATE "User" SET "profilePicture" = $1, "updatedAt" = $2 WHERE id = $3 RETURNING *',
      [publicUrl, new Date().toISOString(), context.userId],
    );

    const profile = updateResult.rows[0] ?? null;

    if (!profile) {
      return {
        success: false,
        error: "Erreur lors de la mise à jour du profil",
      };
    }

    revalidatePath("/profil");
    revalidatePath(`/profil/${context.userId}`);

    return { success: true, data: profile };
  } catch (error) {
    logger.apiError("profile action", error);
    return { success: false, error: "Erreur serveur" };
  }
}

export async function deleteCurrentUserProfilePictureAction() {
  const context = await getAuthenticatedContext();

  if ("error" in context) {
    return { success: false, error: context.error };
  }

  try {
    const profileResult = await query(
      'SELECT "profilePicture" FROM "User" WHERE id = $1 LIMIT 1',
      [context.userId],
    );
    const profile = profileResult.rows[0] ?? null;

    if (!profile) {
      return {
        success: false,
        error: "Erreur lors de la récupération du profil",
      };
    }

    const storagePath = extractProfileStoragePath(profile?.profilePicture);

    if (storagePath) {
      const { error: deleteError } = await context.supabase.storage
        .from("profiles")
        .remove([storagePath]);

      if (deleteError) {
        logger.apiError("profileImageDelete", deleteError);
      }
    }

    const updateResult = await query(
      'UPDATE "User" SET "profilePicture" = NULL, "updatedAt" = $1 WHERE id = $2 RETURNING *',
      [new Date().toISOString(), context.userId],
    );
    const updatedProfile = updateResult.rows[0] ?? null;

    if (!updatedProfile) {
      return {
        success: false,
        error: "Erreur lors de la mise à jour du profil",
      };
    }

    revalidatePath("/profil");
    revalidatePath(`/profil/${context.userId}`);

    return { success: true, data: updatedProfile };
  } catch (error) {
    logger.apiError("profile action", error);
    return { success: false, error: "Erreur serveur" };
  }
}

// Schema pour la demande de code de changement de mot de passe
const requestPasswordCodeSchema = z
  .object({
    currentPassword: z
      .string()
      .min(6, "Le mot de passe actuel doit contenir au moins 6 caractères"),
    newPassword: z
      .string()
      .min(6, "Le nouveau mot de passe doit contenir au moins 6 caractères"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

// Schema pour la validation finale du mot de passe avec code
const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string(),
  confirmPassword: z.string(),
  code: z.string().length(6, "Le code doit contenir 6 chiffres"),
});

/**
 * Étape 1 : Vérifier le mot de passe actuel et envoyer un code par email
 */
export async function requestPasswordChangeCodeAction(data: unknown) {
  const context = await getAuthenticatedContext();
  if ("error" in context) return { success: false, error: context.error };

  try {
    if (process.env.ENABLE_AUTH_EMAIL_DELIVERY !== "true") {
      return {
        success: false,
        error: "La vérification par email est temporairement désactivée.",
      };
    }

    const validatedData = requestPasswordCodeSchema.parse(data);
    const {
      data: { user },
    } = await context.supabase.auth.getUser();
    if (!user) return { success: false, error: "Utilisateur non trouvé" };

    // Vérifier le mot de passe actuel via Supabase Auth
    const { error: signInError } =
      await context.supabase.auth.signInWithPassword({
        email: user.email!,
        password: validatedData.currentPassword,
      });

    if (signInError)
      return { success: false, error: "Le mot de passe actuel est incorrect" };

    // Générer un code à 6 chiffres
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    const code = String(100000 + (buf[0] % 900000));
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // Expire dans 15 minutes

    // Supprimer les anciens codes pour cet email
    await db.emailVerification.deleteMany({ where: { email: user.email! } });

    // Enregistrer le nouveau code
    await db.emailVerification.create({
      data: {
        email: user.email!,
        token: code,
        expiresAt,
      },
    });

    // Use Supabase's native password reset email
    const { error: resetError } =
      await context.supabase.auth.resetPasswordForEmail(user.email!, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/reset-password`,
      });

    if (resetError) {
      logger.authError("requestPasswordChangeCode email", resetError);
      return { success: false, error: "L'envoi de l'email a échoué" };
    }

    return { success: true, message: "Code envoyé par email" };
  } catch (error) {
    if (error instanceof z.ZodError)
      return {
        success: false,
        error: error.errors[0]?.message || "Validation échouée",
      };
    logger.authError("requestPasswordChangeCodeAction", error);
    return { success: false, error: "Erreur lors de l'envoi du code" };
  }
}

/**
 * Étape 2 : Vérifier le code et changer le mot de passe
 */
export async function changeUserPasswordAction(data: unknown) {
  const context = await getAuthenticatedContext();
  if ("error" in context) return { success: false, error: context.error };

  try {
    const validatedData = changePasswordSchema.parse(data);
    const {
      data: { user },
    } = await context.supabase.auth.getUser();
    if (!user) return { success: false, error: "Utilisateur non trouvé" };

    // 1. Vérifier le code dans la base de données
    const verificationResult = await query(
      'SELECT * FROM "EmailVerification" WHERE email = $1 AND token = $2 AND "expiresAt" > NOW()',
      [user.email!, validatedData.code],
    );

    if (verificationResult.rows.length === 0) {
      return { success: false, error: "Code invalide ou expiré" };
    }

    // 2. Supprimer le code utilisé
    await db.emailVerification.deleteMany({ where: { email: user.email! } });

    // 3. Procéder au changement de mot de passe via Supabase Auth
    const { error: updateError } = await context.supabase.auth.updateUser({
      password: validatedData.newPassword,
    });

    if (updateError) return { success: false, error: updateError.message };

    // Optionnel : Mettre à jour securitySettingsUpdatedAt si le champ existe
    await query(
      'UPDATE "User" SET "securitySettingsUpdatedAt" = NOW() WHERE id = $1',
      [user.id],
    );

    revalidatePath("/profil");
    return { success: true, message: "Mot de passe mis à jour avec succès" };
  } catch (error) {
    if (error instanceof z.ZodError)
      return {
        success: false,
        error: error.errors[0]?.message || "Validation échouée",
      };
    logger.authError("changeUserPasswordAction", error);
    return { success: false, error: "Erreur serveur" };
  }
}

/**
 * Récupérer l'historique des transactions de crédits de l'utilisateur
 */
export async function getUserTransactionsAction() {
  const context = await getAuthenticatedContext();
  if ("error" in context) return { success: false, error: context.error };

  try {
    const result = await query(
      'SELECT * FROM "Transaction" WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT 20',
      [context.userId],
    );

    return { success: true, data: result.rows };
  } catch (error) {
    logger.apiError("getUserTransactionsAction", error);
    return {
      success: false,
      error: "Erreur lors du chargement des transactions",
    };
  }
}

/**
 * Mettre à jour les préférences de paiement (opérateur et téléphone)
 */
export async function updatePaymentPreferencesAction(data: {
  operator: string;
  phoneNumber: string;
}) {
  const context = await getAuthenticatedContext();
  if ("error" in context) return { success: false, error: context.error };

  try {
    // Validation simple
    if (!data.operator || !data.phoneNumber) {
      return { success: false, error: "Veuillez remplir tous les champs" };
    }

    await db.user.update({
      where: { id: context.userId },
      data: {
        defaultOperator: data.operator,
        phone: data.phoneNumber,
      },
    });

    revalidatePath("/profil");
    return { success: true, message: "Préférences de paiement mises à jour" };
  } catch (error) {
    logger.apiError("updatePaymentPreferencesAction", error);
    return {
      success: false,
      error: "Erreur lors de la sauvegarde des préférences",
    };
  }
}

/**
 * Recharger le solde via Mobile Money (Paiement manuel avec validation admin)
 * NOTE: Pour la production, intégrer l'API MVola/Orange/Airtel pour paiement automatique.
 */
export async function rechargeCreditsAction(data: {
  packCredits: number;
  packPrice: number;
  operator: string;
  phoneNumber: string;
  transferCode?: string;
  status?: "PENDING" | "COMPLETED";
}) {
  const context = await getAuthenticatedContext();
  if ("error" in context) return { success: false, error: context.error };

  try {
    // Validation des champs requis
    if (
      !data.packCredits ||
      !data.packPrice ||
      !data.operator ||
      !data.phoneNumber
    ) {
      return { success: false, error: "Tous les champs sont requis" };
    }

    // Bloquer les achats à 0 Ar
    if (data.packPrice <= 0) {
      return {
        success: false,
        error: "Le montant de la recharge doit être supérieur à 0 Ar",
      };
    }

    // Bloquer les montants à 0
    if (data.packCredits <= 0) {
      return {
        success: false,
        error: "Le montant de la recharge doit être supérieur à 0 Ar",
      };
    }

    // ⚠ Sécurité : on N'utilise PAS `packPrice` du client. On recalcule depuis
    // la DB :
    //   1. Vérifier qu'un CreditPack actif existe pour ce montant
    //   2. Le montant enregistré = pack.arAmount (en Ariary, calcul serveur)
    //   3. Le bonus en Ar (pack.bonusAr) s'ajoute au solde sans augmenter le prix
    // Empêche un attaquant d'envoyer un prix arbitraire pour un pack quelconque.
    //
    // NOTE: `packCredits` est conservé dans la signature pour compat client mais
    // est interprété comme l'arAmount attendu côté serveur (système unifié Ar).
    const packCheck = await query(
      `SELECT id, "arAmount", "bonusAr" FROM "CreditPack"
       WHERE "arAmount" = $1 AND "isActive" = true
       LIMIT 1`,
      [data.packCredits],
    );
    if (packCheck.rows.length === 0) {
      return {
        success: false,
        error: "Pack de recharge invalide ou désactivé.",
      };
    }
    const pack = packCheck.rows[0];
    const expectedAmount = Number(pack.arAmount);

    // Tolérance de 1 Ar pour absorber les arrondis client. Au-delà → reject.
    if (Math.abs(data.packPrice - expectedAmount) > 1) {
      return {
        success: false,
        error: `Prix invalide : attendu ${expectedAmount} Ar pour ce pack, reçu ${data.packPrice} Ar.`,
      };
    }

    // Solde Ar total à créditer = arAmount + bonusAr (le bonus n'augmente PAS le prix).
    const arToAward = expectedAmount + (Number(pack.bonusAr) || 0);

    const isPending = data.status === "PENDING";

    // 1. Créer la transaction dans la nouvelle table Transaction (système Ariary)
    await query(
      `INSERT INTO "Transaction"
         ("id", "userId", "type", "amountAr", "description", "paymentMethod", "phoneNumber", "senderCode", "status")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        crypto.randomUUID(),
        context.userId,
        "RECHARGE",
        arToAward, // Montant total en Ariary (incluant bonus)
        `Recharge ${data.operator} — ${expectedAmount} Ar — ${data.phoneNumber}`,
        data.operator,
        data.phoneNumber,
        data.transferCode || null,
        isPending ? "PENDING" : "COMPLETED",
      ],
    );

    // 2. Mettre à jour le solde Ar (seulement si validé immédiatement)
    if (!isPending) {
      await query(
        `UPDATE "User" SET "balanceAr" = "balanceAr" + $1, "updatedAt" = NOW() WHERE "id" = $2`,
        [arToAward, context.userId],
      );
    }

    revalidatePath("/recharge");
    revalidatePath("/profil");

    if (isPending) {
      return {
        success: true,
        message: `Votre demande de recharge de ${arToAward} Ar a été enregistrée. Validation par l'administrateur sous 12h.`,
      };
    }

    return {
      success: true,
      message: `Recharge de ${arToAward} Ar effectuée avec succès`,
    };
  } catch (error) {
    logger.apiError("rechargeCreditsAction", error);
    return { success: false, error: "Erreur lors de la recharge" };
  }
}

/**
 * Aide à router une notification (id préfixé `notif:` ou `tx:`) vers la
 * bonne table.
 */
function splitNotificationId(prefixedId: string): { table: 'Notification' | 'Transaction'; id: string } {
  if (prefixedId.startsWith('notif:')) return { table: 'Notification', id: prefixedId.slice(6) }
  if (prefixedId.startsWith('tx:'))    return { table: 'Transaction', id: prefixedId.slice(3) }
  // Backward-compat : ancien id non préfixé = transaction
  return { table: 'Transaction', id: prefixedId }
}

/**
 * Marquer toutes les notifications comme lues pour l'utilisateur connecté
 * (Notification + CreditTransaction).
 */
export async function markAllNotificationsAsReadAction() {
  const context = await getAuthenticatedContext();
  if ("error" in context) return { success: false, error: context.error };

  try {
    await query(
      `UPDATE "Transaction" SET "isRead" = true WHERE "userId" = $1 AND "isRead" = false`,
      [context.userId],
    );

    // Best-effort sur la table Notification (peut ne pas exister si la
    // migration n'est pas encore passée — ne bloque pas).
    try {
      await query(
        `UPDATE "Notification" SET "isRead" = true, "readAt" = NOW()
         WHERE "userId" = $1 AND "isRead" = false`,
        [context.userId],
      )
    } catch (e) {
      logger.warn('markAllNotifications (Notification table) skipped', { error: String(e) })
    }

    revalidatePath("/notifications");
    return {
      success: true,
      message: "Toutes les notifications ont été marquées comme lues",
    };
  } catch (error) {
    logger.apiError("markAllNotificationsAsReadAction", error);
    return {
      success: false,
      error: "Erreur lors de la mise à jour des notifications",
    };
  }
}

/**
 * Marquer une notification spécifique comme lue
 */
export async function markNotificationAsReadAction(notificationId: string) {
  const context = await getAuthenticatedContext();
  if ("error" in context) return { success: false, error: context.error };

  try {
    const { table, id } = splitNotificationId(notificationId)
    if (table === 'Notification') {
      await query(
        `UPDATE "Notification" SET "isRead" = true, "readAt" = NOW()
         WHERE id = $1 AND "userId" = $2`,
        [id, context.userId],
      )
    } else {
      await query(
        `UPDATE "Transaction" SET "isRead" = true WHERE id = $1 AND "userId" = $2`,
        [id, context.userId],
      )
    }

    revalidatePath("/notifications");
    return { success: true };
  } catch (error) {
    logger.apiError("markNotificationAsReadAction", error);
    return {
      success: false,
      error: "Erreur lors de la mise à jour de la notification",
    };
  }
}

/**
 * Ignorer/masquer une notification spécifique
 */
export async function dismissNotificationAction(notificationId: string) {
  const context = await getAuthenticatedContext();
  if ("error" in context) return { success: false, error: context.error };

  try {
    const { table, id } = splitNotificationId(notificationId)
    if (table === 'Notification') {
      await query(
        `UPDATE "Notification" SET "isDismissed" = true WHERE id = $1 AND "userId" = $2`,
        [id, context.userId],
      )
    } else {
      await query(
        `UPDATE "Transaction" SET "isDismissed" = true WHERE id = $1 AND "userId" = $2`,
        [id, context.userId],
      )
    }

    revalidatePath("/notifications");
    return { success: true };
  } catch (error) {
    logger.apiError("dismissNotificationAction", error);
    return {
      success: false,
      error: "Erreur lors de la suppression de la notification",
    };
  }
}

/**
 * Récupérer le flux unifié de notifications de l'utilisateur :
 *   - entrées de la table Notification (révision, validation, etc.)
 *   - transactions CreditTransaction (recharge, achat) compatibles
 * Le résultat est trié par date décroissante.
 *
 * Forme : `{ id, type, title, body, link, createdAt, read, source }`
 *   - id préfixé `notif:` ou `tx:` pour pouvoir agir dessus.
 */
export async function getUserNotificationsAction() {
  const context = await getAuthenticatedContext();
  if ("error" in context) return { success: false, error: context.error };

  try {
    const items: Array<{
      id: string
      type: string
      title: string
      body: string
      link: string | null
      createdAt: string
      read: boolean
      source: 'notification' | 'transaction'
      metadata?: Record<string, unknown>
    }> = []

    // 1) Table Notification (best-effort)
    try {
      const notifRes = await query(
        `SELECT id, type, title, body, link, "createdAt", "isRead", metadata
         FROM "Notification"
         WHERE "userId" = $1 AND "isDismissed" = false
         ORDER BY "createdAt" DESC
         LIMIT 30`,
        [context.userId],
      )
      for (const row of notifRes.rows) {
        items.push({
          id: `notif:${row.id}`,
          type: String(row.type),
          title: row.title,
          body: row.body || '',
          link: row.link,
          createdAt: row.createdAt instanceof Date
            ? row.createdAt.toISOString()
            : String(row.createdAt),
          read: Boolean(row.isRead),
          source: 'notification',
          metadata: row.metadata || {},
        })
      }
    } catch (e) {
      // Migration Notification pas encore passée — on continue avec les
      // transactions seules.
      logger.warn('getUserNotificationsAction (Notification) skipped', { error: String(e) })
    }

    // 2) Transaction (recharges, achats, gains — système Ariary)
    try {
      const txRes = await query(
        `SELECT id, type, status, "amountAr", description, "createdAt", "isRead"
         FROM "Transaction"
         WHERE "userId" = $1 AND "isDismissed" = false
         ORDER BY "createdAt" DESC
         LIMIT 30`,
        [context.userId],
      )
      for (const tx of txRes.rows) {
        const amountAr = Math.abs(Number(tx.amountAr ?? 0))
        const title =
          tx.type === 'RECHARGE'
            ? tx.status === 'PENDING'
              ? 'Recharge en attente'
              : 'Recharge créditée'
            : tx.type === 'SPEND' || tx.type === 'ACHAT'
              ? 'Achat de sujet'
              : 'Transaction'
        items.push({
          id: `tx:${tx.id}`,
          type: tx.type === 'RECHARGE' ? 'credit' : (tx.type === 'SPEND' || tx.type === 'ACHAT') ? 'sujet' : 'alert',
          title,
          body: tx.description || `${tx.type === 'RECHARGE' ? '+' : '-'}${amountAr} Ar${tx.status === 'PENDING' ? ' (en attente)' : ''}`,
          link: '/recharge',
          createdAt: tx.createdAt instanceof Date
            ? tx.createdAt.toISOString()
            : String(tx.createdAt),
          read: Boolean(tx.isRead),
          source: 'transaction',
        })
      }
    } catch (e) {
      logger.warn('getUserNotificationsAction (Transaction) skipped', { error: String(e) })
    }

    // Tri global décroissant
    items.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1))

    return { success: true, data: items.slice(0, 40) }
  } catch (error) {
    logger.apiError('getUserNotificationsAction', error);
    return { success: false, error: 'Erreur lors du chargement des notifications' };
  }
}

/**
 * Récupérer les transactions non ignorées de l'utilisateur
 */
export async function getUserActiveTransactionsAction() {
  const context = await getAuthenticatedContext();
  if ("error" in context) return { success: false, error: context.error };

  try {
    const result = await query(
      `SELECT * FROM "Transaction"
       WHERE "userId" = $1 AND "isDismissed" = false
       ORDER BY "createdAt" DESC
       LIMIT 20`,
      [context.userId],
    );

    // Normaliser createdAt en ISO string UTC (le driver pg peut retourner un
    // objet Date ou une chaîne sans 'Z' selon la config de la colonne)
    const rows = result.rows.map((row: any) => ({
      ...row,
      createdAt: row.createdAt instanceof Date
        ? row.createdAt.toISOString()
        : typeof row.createdAt === 'string' && !row.createdAt.endsWith('Z')
          ? new Date(row.createdAt).toISOString()
          : row.createdAt,
    }));

    return { success: true, data: rows };
  } catch (error) {
    logger.apiError("getUserActiveTransactionsAction", error);
    return {
      success: false,
      error: "Erreur lors du chargement des transactions",
    };
  }
}

/**
 * Récupérer l'historique complet des transactions de l'utilisateur (pour la page crédits)
 */
export async function getUserCreditHistoryAction(
  page?: number,
  pageSize?: number,
) {
  const context = await getAuthenticatedContext();
  if ("error" in context) return { success: false, error: context.error };

  try {
    const safePage = page || 1;
    const safePageSize = pageSize || 10;

    // Count total
    const countResult = await query(
      `SELECT COUNT(*) FROM "Transaction" WHERE "userId" = $1`,
      [context.userId],
    );
    const total = parseInt(countResult.rows[0]?.count || "0", 10);

    // Get transactions with pagination
    const offset = (safePage - 1) * safePageSize;
    const result = await query(
      `SELECT * FROM "Transaction"
       WHERE "userId" = $1
       ORDER BY "createdAt" DESC
       LIMIT $2 OFFSET $3`,
      [context.userId, safePageSize, offset],
    );

    return {
      success: true,
      data: result.rows,
      pagination: {
        total,
        page: safePage,
        pageSize: safePageSize,
        totalPages: Math.ceil(total / safePageSize),
      },
    };
  } catch (error) {
    logger.apiError("getUserCreditHistoryAction", error);
    return {
      success: false,
      error: "Erreur lors du chargement de l'historique",
    };
  }
}
