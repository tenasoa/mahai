// Généré par scripts/db/gen-drizzle-schema.py depuis db/reference/postgres-catalog.json (phase 3 du plan
// docs/plans/2026-10-23-migration-cloudflare.md). Ne pas modifier à la main : corriger le générateur.
// Les dates sont des millisecondes (Date côté JS), le JSON est stocké en texte, les booléens en 0/1.
import { sql } from 'drizzle-orm'
import {
  sqliteTable,
  text,
  integer,
  real,
  index,
  uniqueIndex,
  primaryKey,
  check,
  type AnySQLiteColumn,
} from 'drizzle-orm/sqlite-core'

export const aICorrection = sqliteTable(
  "AICorrection",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("userId").notNull().references((): AnySQLiteColumn => user.id, { onDelete: 'cascade' }),
    subjectId: text("subjectId").notNull().references((): AnySQLiteColumn => subject.id, { onDelete: 'cascade' }),
    mode: text("mode").notNull(),
    userAnswers: text("userAnswers", { mode: 'json' }).notNull().default(sql`'{}'`),
    aiResult: text("aiResult", { mode: 'json' }).notNull(),
    costAr: integer("costAr").notNull().default(0),
    model: text("model"),
    tokensIn: integer("tokensIn"),
    tokensOut: integer("tokensOut"),
    createdAt: integer("createdAt", { mode: 'timestamp_ms' }).default(sql`(cast(unixepoch('subsec') * 1000 as integer))`),
    cachedFromPoolId: text("cachedFromPoolId").references((): AnySQLiteColumn => directCorrectionPool.id, { onDelete: 'set null' }),
  },
  (t) => [
    check("AICorrection_mode_check", sql`mode IN ('SUBMISSION', 'DIRECT')`),
    index("idx_ai_correction_subject").on(t.subjectId, t.createdAt),
    index("idx_ai_correction_user").on(t.userId, t.createdAt),
    index("idx_ai_correction_user_subject_mode").on(t.userId, t.subjectId, t.mode, t.createdAt),
  ],
)

export const adminAuditLog = sqliteTable(
  "AdminAuditLog",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    adminId: text("adminId").notNull().references((): AnySQLiteColumn => user.id, { onDelete: 'set null' }),
    action: text("action").notNull(),
    targetType: text("targetType"),
    targetId: text("targetId"),
    details: text("details", { mode: 'json' }).notNull().default(sql`'{}'`),
    createdAt: integer("createdAt", { mode: 'timestamp_ms' }).notNull().default(sql`(cast(unixepoch('subsec') * 1000 as integer))`),
  },
  (t) => [
    index("idx_admin_audit_action").on(t.action, t.createdAt),
    index("idx_admin_audit_admin").on(t.adminId, t.createdAt),
    index("idx_admin_audit_target").on(t.targetType, t.targetId, t.createdAt),
  ],
)

export const blogCategory = sqliteTable(
  "BlogCategory",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    color: text("color").default("#gold"),
    sort_order: integer("sort_order").default(0),
    is_active: integer("is_active", { mode: 'boolean' }).default(true),
    createdAt: integer("createdAt", { mode: 'timestamp_ms' }).default(sql`(cast(unixepoch('subsec') * 1000 as integer))`),
  },
  (t) => [
    uniqueIndex("BlogCategory_name_key").on(t.name),
    uniqueIndex("BlogCategory_slug_key").on(t.slug),
  ],
)

export const blogComment = sqliteTable(
  "BlogComment",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    post_id: text("post_id").notNull().references((): AnySQLiteColumn => blogPost.id, { onDelete: 'cascade' }),
    user_id: text("user_id").notNull(),
    user_name: text("user_name").notNull(),
    content: text("content").notNull(),
    parent_id: text("parent_id").references((): AnySQLiteColumn => blogComment.id, { onDelete: 'cascade' }),
    is_approved: integer("is_approved", { mode: 'boolean' }).default(true),
    createdAt: integer("createdAt", { mode: 'timestamp_ms' }).default(sql`(cast(unixepoch('subsec') * 1000 as integer))`),
    updatedAt: integer("updatedAt", { mode: 'timestamp_ms' }).default(sql`(cast(unixepoch('subsec') * 1000 as integer))`).$onUpdate(() => new Date()),
  },
  (t) => [
    index("idx_blog_comment_approved").on(t.is_approved),
    index("idx_blog_comment_parent").on(t.parent_id),
    index("idx_blog_comment_post").on(t.post_id),
    index("idx_blog_comment_user").on(t.user_id),
  ],
)

export const blogPost = sqliteTable(
  "BlogPost",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    excerpt: text("excerpt"),
    content: text("content").notNull(),
    category: text("category").notNull().default("general"),
    author_id: text("author_id").notNull(),
    author_name: text("author_name").notNull(),
    cover_image: text("cover_image"),
    read_time: integer("read_time").default(5),
    is_published: integer("is_published", { mode: 'boolean' }).default(false),
    is_featured: integer("is_featured", { mode: 'boolean' }).default(false),
    views: integer("views").default(0),
    published_at: integer("published_at", { mode: 'timestamp_ms' }),
    createdAt: integer("createdAt", { mode: 'timestamp_ms' }).default(sql`(cast(unixepoch('subsec') * 1000 as integer))`),
    updatedAt: integer("updatedAt", { mode: 'timestamp_ms' }).default(sql`(cast(unixepoch('subsec') * 1000 as integer))`).$onUpdate(() => new Date()),
  },
  (t) => [
    uniqueIndex("BlogPost_slug_key").on(t.slug),
    index("BlogPost_author_id_idx").on(t.author_id),
    index("BlogPost_category_idx").on(t.category),
    index("BlogPost_is_featured_idx").on(t.is_featured),
    index("BlogPost_is_published_idx").on(t.is_published),
    index("BlogPost_slug_idx").on(t.slug),
    index("idx_blog_post_author").on(t.author_id),
    index("idx_blog_post_category").on(t.category),
    index("idx_blog_post_featured").on(t.is_featured),
    index("idx_blog_post_published").on(t.is_published),
    index("idx_blog_post_slug").on(t.slug),
  ],
)

export const contributorApplication = sqliteTable(
  "ContributorApplication",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("userId").notNull().references((): AnySQLiteColumn => user.id, { onDelete: 'cascade' }),
    fullName: text("fullName").notNull(),
    phone: text("phone").notNull(),
    subjects: text("subjects").notNull(),
    educationLevel: text("educationLevel").notNull(),
    teachingExperience: text("teachingExperience").notNull(),
    motivation: text("motivation").notNull(),
    availability: text("availability").notNull(),
    portfolioUrl: text("portfolioUrl"),
    sampleLesson: text("sampleLesson"),
    status: text("status").notNull().default("PENDING"),
    adminNotes: text("adminNotes"),
    reviewedBy: text("reviewedBy").references((): AnySQLiteColumn => user.id, { onDelete: 'set null' }),
    reviewedAt: integer("reviewedAt", { mode: 'timestamp_ms' }),
    createdAt: integer("createdAt", { mode: 'timestamp_ms' }).notNull().default(sql`(cast(unixepoch('subsec') * 1000 as integer))`),
    updatedAt: integer("updatedAt", { mode: 'timestamp_ms' }).notNull().default(sql`(cast(unixepoch('subsec') * 1000 as integer))`).$onUpdate(() => new Date()),
  },
  (t) => [
    check("ContributorApplication_status_check", sql`status IN ('PENDING', 'APPROVED', 'REJECTED')`),
    uniqueIndex("ContributorApplication_userId_key").on(t.userId),
    index("ContributorApplication_createdAt_idx").on(t.createdAt),
    index("ContributorApplication_status_idx").on(t.status),
  ],
)

export const creditPack = sqliteTable(
  "CreditPack",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    credits: integer("credits").notNull(),
    arAmount: integer("arAmount").notNull(),
    bonus: integer("bonus").default(0),
    isPopular: integer("isPopular", { mode: 'boolean' }).default(false),
    isActive: integer("isActive", { mode: 'boolean' }).default(true),
    sortOrder: integer("sortOrder").default(0),
    createdAt: integer("createdAt", { mode: 'timestamp_ms' }).default(sql`(cast(unixepoch('subsec') * 1000 as integer))`),
    updatedAt: integer("updatedAt", { mode: 'timestamp_ms' }).default(sql`(cast(unixepoch('subsec') * 1000 as integer))`).$onUpdate(() => new Date()),
    bonusAr: integer("bonusAr").notNull().default(0),
  },
  (t) => [
    index("idx_credit_pack_active").on(t.isActive),
    index("idx_credit_pack_order").on(t.sortOrder),
  ],
)

export const creditTransaction = sqliteTable(
  "CreditTransaction",
  {
    id: text("id").primaryKey(),
    userId: text("userId").notNull().references((): AnySQLiteColumn => user.id),
    amount: integer("amount").notNull(),
    type: text("type").notNull(),
    description: text("description"),
    paymentMethod: text("paymentMethod"),
    transactionId: text("transactionId"),
    status: text("status").notNull().default("PENDING"),
    createdAt: integer("createdAt", { mode: 'timestamp_ms' }).notNull().default(sql`(cast(unixepoch('subsec') * 1000 as integer))`),
    metadata: text("metadata", { mode: 'json' }).default(sql`'{}'`),
    phoneNumber: text("phoneNumber"),
    senderCode: text("senderCode"),
    creditsCount: integer("creditsCount").default(0),
    rejectionReason: text("rejectionReason"),
    validatedAt: integer("validatedAt", { mode: 'timestamp_ms' }),
    validatedBy: text("validatedBy").references((): AnySQLiteColumn => user.id, { onDelete: 'set null' }),
    isRead: integer("isRead", { mode: 'boolean' }).notNull().default(false),
    isDismissed: integer("isDismissed", { mode: 'boolean' }).notNull().default(false),
  },
  (t) => [
    index("CreditTransaction_senderCode_idx").on(t.senderCode),
    index("CreditTransaction_status_idx").on(t.status),
    index("CreditTransaction_userId_idx").on(t.userId),
    index("CreditTransaction_userId_isDismissed_idx").on(t.userId, t.isDismissed),
    index("CreditTransaction_userId_isRead_idx").on(t.userId, t.isRead),
    index("idx_credit_transaction_created").on(t.createdAt),
    index("idx_credit_transaction_type").on(t.type),
    index("idx_credit_transaction_user").on(t.userId),
  ],
)

export const dailyActivity = sqliteTable(
  "DailyActivity",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("userId").notNull().references((): AnySQLiteColumn => user.id, { onDelete: 'cascade' }),
    date: text("date").notNull().default(sql`(date('now'))`),
    type: text("type").notNull().default("LOGIN"),
    metadata: text("metadata", { mode: 'json' }),
    createdAt: integer("createdAt", { mode: 'timestamp_ms' }).default(sql`(cast(unixepoch('subsec') * 1000 as integer))`),
  },
  (t) => [
    index("idx_daily_activity_user_date").on(t.userId, t.date),
    uniqueIndex("idx_daily_activity_user_date_type").on(t.userId, t.date, t.type),
  ],
)

export const directCorrectionPool = sqliteTable(
  "DirectCorrectionPool",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    subjectId: text("subjectId").notNull().references((): AnySQLiteColumn => subject.id, { onDelete: 'cascade' }),
    content: text("content", { mode: 'json' }).notNull(),
    generatedByUserId: text("generatedByUserId").notNull().references((): AnySQLiteColumn => user.id),
    timesServed: integer("timesServed").notNull().default(0),
    model: text("model"),
    tokensIn: integer("tokensIn").default(0),
    tokensOut: integer("tokensOut").default(0),
    createdAt: integer("createdAt", { mode: 'timestamp_ms' }).notNull().default(sql`(cast(unixepoch('subsec') * 1000 as integer))`),
  },
  (t) => [
    index("DirectCorrectionPool_subjectId_idx").on(t.subjectId),
  ],
)

export const directCorrectionSeen = sqliteTable(
  "DirectCorrectionSeen",
  {
    userId: text("userId").notNull().references((): AnySQLiteColumn => user.id, { onDelete: 'cascade' }),
    poolId: text("poolId").notNull().references((): AnySQLiteColumn => directCorrectionPool.id, { onDelete: 'cascade' }),
    seenAt: integer("seenAt", { mode: 'timestamp_ms' }).notNull().default(sql`(cast(unixepoch('subsec') * 1000 as integer))`),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.poolId] }),
  ],
)

export const emailVerification = sqliteTable(
  "EmailVerification",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    token: text("token").notNull(),
    expiresAt: integer("expiresAt", { mode: 'timestamp_ms' }).notNull(),
    used: integer("used", { mode: 'boolean' }).notNull().default(false),
    createdAt: integer("createdAt", { mode: 'timestamp_ms' }).notNull().default(sql`(cast(unixepoch('subsec') * 1000 as integer))`),
  },
  (t) => [
    uniqueIndex("EmailVerification_token_key").on(t.token),
  ],
)

export const examenBlanc = sqliteTable(
  "ExamenBlanc",
  {
    id: text("id").primaryKey(),
    userId: text("userId").notNull().references((): AnySQLiteColumn => user.id),
    titre: text("titre").notNull(),
    typeExamen: text("typeExamen").notNull(),
    matiere: text("matiere").notNull(),
    annee: text("annee").notNull(),
    dureeSecondes: integer("dureeSecondes").notNull(),
    startedAt: integer("startedAt", { mode: 'timestamp_ms' }),
    submittedAt: integer("submittedAt", { mode: 'timestamp_ms' }),
    score: real("score"),
    scoreMax: real("scoreMax"),
    percentile: real("percentile"),
    status: text("status", { enum: ["NOT_STARTED", "IN_PROGRESS", "SUBMITTED", "GRADED"] }).notNull().default("NOT_STARTED"),
    createdAt: integer("createdAt", { mode: 'timestamp_ms' }).notNull().default(sql`(cast(unixepoch('subsec') * 1000 as integer))`),
    subjectId: text("subjectId").references((): AnySQLiteColumn => subject.id, { onDelete: 'set null' }),
  },
  (t) => [
    check("ExamenBlanc_status_enum", sql`"status" IN ('NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'GRADED')`),
    index("ExamenBlanc_subjectId_idx").on(t.subjectId),
    index("ExamenBlanc_userId_idx").on(t.userId),
  ],
)

export const merchantPhone = sqliteTable(
  "MerchantPhone",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    operator: text("operator").notNull(),
    phone: text("phone").notNull(),
    label: text("label"),
    isActive: integer("isActive", { mode: 'boolean' }).default(true),
    isDefault: integer("isDefault", { mode: 'boolean' }).default(false),
    createdAt: integer("createdAt", { mode: 'timestamp_ms' }).default(sql`(cast(unixepoch('subsec') * 1000 as integer))`),
    updatedAt: integer("updatedAt", { mode: 'timestamp_ms' }).default(sql`(cast(unixepoch('subsec') * 1000 as integer))`).$onUpdate(() => new Date()),
  },
  (t) => [
    check("MerchantPhone_operator_check", sql`operator IN ('mvola', 'orange', 'airtel')`),
    index("idx_merchant_phone_active").on(t.isActive),
    uniqueIndex("idx_merchant_phone_default").on(t.operator).where(sql`("isDefault" = true)`),
    index("idx_merchant_phone_operator").on(t.operator),
  ],
)

export const notification = sqliteTable(
  "Notification",
  {
    id: text("id").primaryKey(),
    userId: text("userId").notNull().references((): AnySQLiteColumn => user.id, { onDelete: 'cascade' }),
    type: text("type").notNull(),
    title: text("title").notNull(),
    body: text("body"),
    link: text("link"),
    metadata: text("metadata", { mode: 'json' }).notNull().default(sql`'{}'`),
    isRead: integer("isRead", { mode: 'boolean' }).notNull().default(false),
    isDismissed: integer("isDismissed", { mode: 'boolean' }).notNull().default(false),
    createdAt: integer("createdAt", { mode: 'timestamp_ms' }).notNull().default(sql`(cast(unixepoch('subsec') * 1000 as integer))`),
    readAt: integer("readAt", { mode: 'timestamp_ms' }),
  },
  (t) => [
    index("idx_notif_type").on(t.type, t.createdAt),
    index("idx_notif_user_dismissed").on(t.userId, t.isDismissed, t.createdAt),
    index("idx_notif_user_unread").on(t.userId, t.isRead).where(sql`("isDismissed" = false)`),
  ],
)

export const passwordReset = sqliteTable(
  "PasswordReset",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    token: text("token").notNull(),
    expiresAt: integer("expiresAt", { mode: 'timestamp_ms' }).notNull(),
    used: integer("used", { mode: 'boolean' }).notNull().default(false),
    createdAt: integer("createdAt", { mode: 'timestamp_ms' }).notNull().default(sql`(cast(unixepoch('subsec') * 1000 as integer))`),
  },
  (t) => [
    uniqueIndex("PasswordReset_token_key").on(t.token),
  ],
)

export const purchase = sqliteTable(
  "Purchase",
  {
    id: text("id").primaryKey(),
    userId: text("userId").notNull().references((): AnySQLiteColumn => user.id),
    subjectId: text("subjectId").references((): AnySQLiteColumn => subject.id),
    paymentMethod: text("paymentMethod"),
    status: text("status").notNull().default("PENDING"),
    createdAt: integer("createdAt", { mode: 'timestamp_ms' }).notNull().default(sql`(cast(unixepoch('subsec') * 1000 as integer))`),
    amountAr: integer("amountAr").notNull(),
  },
  (t) => [
    check("check_amount_ar_positive", sql`("amountAr" >= 0)`),
    index("Purchase_subjectId_idx").on(t.subjectId),
    index("Purchase_userId_idx").on(t.userId),
    index("idx_purchase_amount_ar").on(t.amountAr, t.createdAt),
  ],
)

export const questionExamen = sqliteTable(
  "QuestionExamen",
  {
    id: text("id").primaryKey(),
    examenId: text("examenId").notNull().references((): AnySQLiteColumn => examenBlanc.id, { onDelete: 'cascade' }),
    numero: integer("numero").notNull(),
    texte: text("texte").notNull(),
    type: text("type").notNull().default("r\u00e9ponse"),
    options: text("options", { mode: 'json' }),
    points: integer("points").notNull().default(5),
    createdAt: integer("createdAt", { mode: 'timestamp_ms' }).notNull().default(sql`(cast(unixepoch('subsec') * 1000 as integer))`),
  },
  (t) => [
    index("QuestionExamen_examenId_idx").on(t.examenId),
  ],
)

export const referralCommission = sqliteTable(
  "ReferralCommission",
  {
    id: text("id").primaryKey(),
    referrerId: text("referrerId").references((): AnySQLiteColumn => user.id),
    referredId: text("referredId").references((): AnySQLiteColumn => user.id),
    arAmount: integer("arAmount").notNull().default(0),
    status: text("status").default("PENDING"),
    createdAt: integer("createdAt", { mode: 'timestamp_ms' }).default(sql`(cast(unixepoch('subsec') * 1000 as integer))`),
    updatedAt: integer("updatedAt", { mode: 'timestamp_ms' }).default(sql`(cast(unixepoch('subsec') * 1000 as integer))`).$onUpdate(() => new Date()),
  },
)

export const subject = sqliteTable(
  "Subject",
  {
    id: text("id").primaryKey(),
    titre: text("titre").notNull(),
    type: text("type", { enum: ["BAC", "BEPC", "CEPE", "BACC", "Concours", "Etablissement", "Autre"] }).notNull(),
    matiere: text("matiere").notNull(),
    annee: text("annee").notNull(),
    serie: text("serie"),
    description: text("description"),
    pages: integer("pages").notNull(),
    difficulte: text("difficulte", { enum: ["FACILE", "MOYEN", "DIFFICILE"] }).notNull().default("MOYEN"),
    langue: text("langue", { enum: ["FRANCAIS", "MALGACHE"] }).notNull().default("FRANCAIS"),
    format: text("format", { enum: ["PDF", "INTERACTIF"] }).notNull().default("PDF"),
    badge: text("badge", { enum: ["GOLD", "AI", "FREE", "INTER"] }).notNull().default("AI"),
    glyph: text("glyph").notNull().default("\u2211"),
    featured: integer("featured", { mode: 'boolean' }).notNull().default(false),
    rating: real("rating").notNull().default(0),
    reviewsCount: integer("reviewsCount").notNull().default(0),
    hasCorrectionIa: integer("hasCorrectionIa", { mode: 'boolean' }).notNull().default(false),
    hasCorrectionProf: integer("hasCorrectionProf", { mode: 'boolean' }).notNull().default(false),
    authorId: text("authorId").notNull().references((): AnySQLiteColumn => user.id),
    createdAt: integer("createdAt", { mode: 'timestamp_ms' }).notNull().default(sql`(cast(unixepoch('subsec') * 1000 as integer))`),
    status: text("status").notNull().default("PUBLISHED"),
    downloadCount: integer("downloadCount").notNull().default(0),
    duree: text("duree"),
    coefficient: integer("coefficient"),
    filiere: text("filiere"),
    niveau: text("niveau"),
    examType: text("examType"),
    anneeScolaire: text("anneeScolaire"),
    dateOfficielle: text("dateOfficielle"),
    bepcOption: text("bepcOption"),
    baccType: text("baccType"),
    concoursType: text("concoursType"),
    etablissement: text("etablissement"),
    semestre: text("semestre"),
    customMeta: text("customMeta", { mode: 'json' }).notNull().default(sql`'[]'`),
    submissionId: text("submissionId").references((): AnySQLiteColumn => subjectSubmission.id, { onDelete: 'set null' }),
    content: text("content", { mode: 'json' }),
    contentType: text("contentType"),
    tags: text("tags", { mode: 'json' }).$type<string[]>().notNull().default(sql`'[]'`),
    prixMode: text("prixMode"),
    visibilite: text("visibilite"),
    reviewerId: text("reviewerId").references((): AnySQLiteColumn => user.id, { onDelete: 'set null' }),
    publishedAt: integer("publishedAt", { mode: 'timestamp_ms' }),
    prix: integer("prix").notNull().default(0),
  },
  (t) => [
    check("check_prix_positive", sql`(prix >= 0)`),
    check("Subject_type_enum", sql`"type" IN ('BAC', 'BEPC', 'CEPE', 'BACC', 'Concours', 'Etablissement', 'Autre')`),
    check("Subject_difficulte_enum", sql`"difficulte" IN ('FACILE', 'MOYEN', 'DIFFICILE')`),
    check("Subject_langue_enum", sql`"langue" IN ('FRANCAIS', 'MALGACHE')`),
    check("Subject_format_enum", sql`"format" IN ('PDF', 'INTERACTIF')`),
    check("Subject_badge_enum", sql`"badge" IN ('GOLD', 'AI', 'FREE', 'INTER')`),
    index("Subject_authorId_idx").on(t.authorId),
    index("idx_subject_examtype").on(t.examType, t.anneeScolaire),
    index("idx_subject_submission_id").on(t.submissionId),
  ],
)

export const subjectDownload = sqliteTable(
  "SubjectDownload",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("userId").notNull().references((): AnySQLiteColumn => user.id, { onDelete: 'cascade' }),
    subjectId: text("subjectId").notNull().references((): AnySQLiteColumn => subject.id, { onDelete: 'cascade' }),
    watermarkCode: text("watermarkCode").notNull(),
    ipAddress: text("ipAddress"),
    userAgent: text("userAgent"),
    downloadedAt: integer("downloadedAt", { mode: 'timestamp_ms' }).default(sql`(cast(unixepoch('subsec') * 1000 as integer))`),
  },
  (t) => [
    uniqueIndex("SubjectDownload_watermarkCode_key").on(t.watermarkCode),
    index("idx_subject_download_subject").on(t.subjectId, t.downloadedAt),
    index("idx_subject_download_user").on(t.userId, t.downloadedAt),
    index("idx_subject_download_watermark").on(t.watermarkCode),
  ],
)

export const subjectImage = sqliteTable(
  "SubjectImage",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    submissionId: text("submissionId").notNull().references((): AnySQLiteColumn => subjectSubmission.id, { onDelete: 'cascade' }),
    authorId: text("authorId").notNull(),
    url: text("url").notNull(),
    filename: text("filename").notNull(),
    mimeType: text("mimeType").notNull().default("image/jpeg"),
    size: integer("size").notNull().default(0),
    createdAt: integer("createdAt", { mode: 'timestamp_ms' }).notNull().default(sql`(cast(unixepoch('subsec') * 1000 as integer))`),
  },
  (t) => [
    uniqueIndex("SubjectImage_url_key").on(t.url),
    index("idx_subject_image_author").on(t.authorId),
    index("idx_subject_image_submission").on(t.submissionId),
  ],
)

export const subjectLog = sqliteTable(
  "SubjectLog",
  {
    id: text("id").primaryKey(),
    subjectId: text("subjectId").notNull().references((): AnySQLiteColumn => subject.id, { onDelete: 'cascade' }),
    userId: text("userId").notNull().references((): AnySQLiteColumn => user.id, { onDelete: 'cascade' }),
    action: text("action").notNull(),
    oldStatus: text("oldStatus"),
    newStatus: text("newStatus"),
    notes: text("notes"),
    createdAt: integer("createdAt", { mode: 'timestamp_ms' }).notNull().default(sql`(cast(unixepoch('subsec') * 1000 as integer))`),
  },
  (t) => [
    index("SubjectLog_createdAt_idx").on(t.createdAt),
    index("SubjectLog_subjectId_idx").on(t.subjectId),
    index("SubjectLog_userId_idx").on(t.userId),
    index("idx_subjectlog_subjectid").on(t.subjectId),
  ],
)

export const subjectSubmission = sqliteTable(
  "SubjectSubmission",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull().default(""),
    matiere: text("matiere").notNull().default(""),
    niveau: text("niveau").notNull().default(""),
    serie: text("serie"),
    annee: integer("annee"),
    duree: text("duree"),
    coefficient: integer("coefficient"),
    contentType: text("contentType").notNull().default("sujet_seul"),
    content: text("content", { mode: 'json' }).notNull().default(sql`'{}'`),
    tags: text("tags", { mode: 'json' }).$type<string[]>().notNull().default(sql`'[]'`),
    prix: integer("prix").notNull().default(0),
    prixMode: text("prixMode").notNull().default("forfait"),
    visibilite: text("visibilite").notNull().default("public"),
    status: text("status").notNull().default("DRAFT"),
    examType: text("examType"),
    bepcOption: text("bepcOption"),
    baccType: text("baccType"),
    concoursType: text("concoursType"),
    etablissement: text("etablissement"),
    semestre: text("semestre"),
    filiere: text("filiere"),
    anneeScolaire: text("anneeScolaire"),
    dateOfficielle: text("dateOfficielle"),
    customMeta: text("customMeta", { mode: 'json' }).notNull().default(sql`'[]'`),
    authorId: text("authorId").notNull().references((): AnySQLiteColumn => user.id, { onDelete: 'cascade' }),
    createdAt: integer("createdAt", { mode: 'timestamp_ms' }).notNull().default(sql`(cast(unixepoch('subsec') * 1000 as integer))`),
    updatedAt: integer("updatedAt", { mode: 'timestamp_ms' }).notNull().default(sql`(cast(unixepoch('subsec') * 1000 as integer))`).$onUpdate(() => new Date()),
    notes: text("notes"),
    reviewerId: text("reviewerId").references((): AnySQLiteColumn => user.id, { onDelete: 'set null' }),
    validatedAt: integer("validatedAt", { mode: 'timestamp_ms' }),
    reviewedAt: integer("reviewedAt", { mode: 'timestamp_ms' }),
    pages: integer("pages"),
    difficulte: text("difficulte"),
    description: text("description"),
  },
  (t) => [
    index("idx_submission_author_revision").on(t.authorId, t.status).where(sql`(status = 'REVISION_REQUESTED')`),
    index("idx_submission_author_status").on(t.authorId, t.status, t.createdAt),
    index("idx_submission_matiere_niveau").on(t.matiere, t.niveau),
    index("idx_submission_status").on(t.status, t.createdAt),
    index("idx_submission_status_reviewer").on(t.status, t.reviewerId).where(sql`status IN ('SUBMITTED', 'VALIDATED', 'REJECTED')`),
    index("idx_submission_validated_at").on(t.validatedAt).where(sql`(status = 'VALIDATED')`),
  ],
)

export const systemSetting = sqliteTable(
  "SystemSetting",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    key: text("key").notNull(),
    value: text("value").notNull(),
    type: text("type").notNull().default("string"),
    label: text("label"),
    description: text("description"),
    category: text("category").notNull().default("general"),
    isEditable: integer("isEditable", { mode: 'boolean' }).default(true),
    updatedAt: integer("updatedAt", { mode: 'timestamp_ms' }).default(sql`(cast(unixepoch('subsec') * 1000 as integer))`).$onUpdate(() => new Date()),
  },
  (t) => [
    uniqueIndex("SystemSetting_key_key").on(t.key),
    check("SystemSetting_type_check", sql`type IN ('string', 'number', 'boolean', 'json')`),
    index("idx_system_setting_category").on(t.category),
    index("idx_system_setting_key").on(t.key),
  ],
)

export const transaction = sqliteTable(
  "Transaction",
  {
    id: text("id").primaryKey(),
    userId: text("userId").notNull().references((): AnySQLiteColumn => user.id, { onDelete: 'cascade' }),
    amountAr: integer("amountAr").notNull(),
    type: text("type").notNull(),
    status: text("status").notNull().default("PENDING"),
    description: text("description"),
    phoneNumber: text("phoneNumber"),
    paymentMethod: text("paymentMethod"),
    senderCode: text("senderCode"),
    validatedAt: integer("validatedAt", { mode: 'timestamp_ms' }),
    validatedBy: text("validatedBy"),
    rejectionReason: text("rejectionReason"),
    metadata: text("metadata", { mode: 'json' }).default(sql`'{}'`),
    createdAt: integer("createdAt", { mode: 'timestamp_ms' }).default(sql`(cast(unixepoch('subsec') * 1000 as integer))`),
    isRead: integer("isRead", { mode: 'boolean' }).notNull().default(false),
    isDismissed: integer("isDismissed", { mode: 'boolean' }).notNull().default(false),
  },
  (t) => [
    index("Transaction_userId_isDismissed_idx").on(t.userId, t.isDismissed).where(sql`("isDismissed" = false)`),
    index("Transaction_userId_isRead_idx").on(t.userId, t.isRead).where(sql`("isRead" = false)`),
    index("idx_transaction_status_created").on(t.status, t.createdAt),
    index("idx_transaction_type").on(t.type, t.createdAt),
    index("idx_transaction_user_created").on(t.userId, t.createdAt),
    index("idx_transaction_user_unread").on(t.userId, t.isRead).where(sql`(("isRead" = false) AND ("isDismissed" = false))`),
  ],
)

export const user = sqliteTable(
  "User",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    password: text("password").notNull(),
    prenom: text("prenom").notNull(),
    nom: text("nom"),
    role: text("role", { enum: ["ETUDIANT", "CONTRIBUTEUR", "PROFESSEUR", "VERIFICATEUR", "VALIDATEUR", "ADMIN"] }).notNull().default("ETUDIANT"),
    phone: text("phone"),
    phoneVerified: integer("phoneVerified", { mode: 'boolean' }).notNull().default(false),
    schoolLevel: text("schoolLevel"),
    emailVerified: integer("emailVerified", { mode: 'boolean' }).notNull().default(false),
    createdAt: integer("createdAt", { mode: 'timestamp_ms' }).notNull().default(sql`(cast(unixepoch('subsec') * 1000 as integer))`),
    updatedAt: integer("updatedAt", { mode: 'timestamp_ms' }).notNull().default(sql`(cast(unixepoch('subsec') * 1000 as integer))`).$onUpdate(() => new Date()),
    userType: text("userType", { enum: ["ETUDIANT", "PROFESSIONNEL", "ENSEIGNANT", "PARENT", "AUTRE"] }).default("ETUDIANT"),
    customUserType: text("customUserType"),
    etablissement: text("etablissement"),
    educationLevel: text("educationLevel", { enum: ["PRIMAIRE", "COLLEGE", "LYCEE", "UNIVERSITE", "FORMATION", "FACULTE", "INSTITUT"] }),
    gradeLevel: text("gradeLevel", { enum: ["11EME", "10EME", "9EME", "8EME", "7EME", "6EME", "5EME", "4EME", "3EME", "SECONDE", "PREMIERE", "TERMINALE", "L1", "L2", "L3", "M1", "M2", "TECH_1", "TECH_2", "TECH_3"] }),
    filiere: text("filiere"),
    age: integer("age"),
    dateNaissance: text("dateNaissance"),
    region: text("region"),
    district: text("district"),
    preferences: text("preferences", { mode: 'json' }).default(sql`'{}'`),
    bio: text("bio"),
    matieresPreferees: text("matieresPreferees", { mode: 'json' }).$type<string[]>(),
    objectifsEtude: text("objectifsEtude", { mode: 'json' }).$type<string[]>(),
    profilePublic: integer("profilePublic", { mode: 'boolean' }).default(true),
    showEmail: integer("showEmail", { mode: 'boolean' }).default(false),
    showPhone: integer("showPhone", { mode: 'boolean' }).default(false),
    showEtablissement: integer("showEtablissement", { mode: 'boolean' }).default(true),
    notifCorrections: integer("notifCorrections", { mode: 'boolean' }).default(true),
    notifSujets: integer("notifSujets", { mode: 'boolean' }).default(true),
    notifPromos: integer("notifPromos", { mode: 'boolean' }).default(false),
    notifRappels: integer("notifRappels", { mode: 'boolean' }).default(true),
    birthDate: text("birthDate"),
    nomComplet: text("nomComplet"),
    pseudo: text("pseudo"),
    profilePicture: text("profilePicture"),
    defaultOperator: text("defaultOperator").default("MVOLA"),
    securityTwoFactorEnabled: integer("securityTwoFactorEnabled", { mode: 'boolean' }).notNull().default(false),
    securityLoginAlertEnabled: integer("securityLoginAlertEnabled", { mode: 'boolean' }).notNull().default(true),
    securityUnknownDeviceBlock: integer("securityUnknownDeviceBlock", { mode: 'boolean' }).notNull().default(false),
    securityRecoveryEmailEnabled: integer("securityRecoveryEmailEnabled", { mode: 'boolean' }).notNull().default(true),
    securitySessionTimeoutMinutes: integer("securitySessionTimeoutMinutes").notNull().default(120),
    securitySettingsUpdatedAt: integer("securitySettingsUpdatedAt", { mode: 'timestamp_ms' }),
    referralCode: text("referralCode"),
    referredByUserId: text("referredByUserId").references((): AnySQLiteColumn => user.id, { onDelete: 'set null' }),
    lyceeType: text("lyceeType"),
    balanceAr: integer("balanceAr").notNull().default(0),
  },
  (t) => [
    uniqueIndex("User_email_key").on(t.email),
    check("User_securitySessionTimeoutMinutes_check", sql`(("securitySessionTimeoutMinutes" >= 15) AND ("securitySessionTimeoutMinutes" <= 1440))`),
    check("check_balance_ar_positive", sql`("balanceAr" >= 0)`),
    check("User_role_enum", sql`"role" IN ('ETUDIANT', 'CONTRIBUTEUR', 'PROFESSEUR', 'VERIFICATEUR', 'VALIDATEUR', 'ADMIN')`),
    check("User_userType_enum", sql`"userType" IN ('ETUDIANT', 'PROFESSIONNEL', 'ENSEIGNANT', 'PARENT', 'AUTRE')`),
    check("User_educationLevel_enum", sql`"educationLevel" IN ('PRIMAIRE', 'COLLEGE', 'LYCEE', 'UNIVERSITE', 'FORMATION', 'FACULTE', 'INSTITUT')`),
    check("User_gradeLevel_enum", sql`"gradeLevel" IN ('11EME', '10EME', '9EME', '8EME', '7EME', '6EME', '5EME', '4EME', '3EME', 'SECONDE', 'PREMIERE', 'TERMINALE', 'L1', 'L2', 'L3', 'M1', 'M2', 'TECH_1', 'TECH_2', 'TECH_3')`),
    index("idx_user_balance_ar").on(t.balanceAr).where(sql`("balanceAr" > 0)`),
    index("idx_user_birthdate").on(t.birthDate),
    index("idx_user_educationLevel").on(t.educationLevel),
    index("idx_user_gradeLevel").on(t.gradeLevel),
    index("idx_user_nom").on(t.nom),
    index("idx_user_prenom").on(t.prenom),
    index("idx_user_profilepicture").on(t.profilePicture),
    index("idx_user_pseudo").on(t.pseudo),
    uniqueIndex("idx_user_referral_code_unique").on(t.referralCode).where(sql`("referralCode" IS NOT NULL)`),
    index("idx_user_referred_by").on(t.referredByUserId),
    index("idx_user_region").on(t.region),
    index("idx_user_security_2fa").on(t.securityTwoFactorEnabled),
    index("idx_user_security_settings_updated").on(t.securitySettingsUpdatedAt),
    index("idx_user_userType").on(t.userType),
  ],
)

export const userPhone = sqliteTable(
  "UserPhone",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("userId").notNull().references((): AnySQLiteColumn => user.id, { onDelete: 'cascade' }),
    phone: text("phone").notNull(),
    provider: text("provider").notNull(),
    label: text("label"),
    isDefault: integer("isDefault", { mode: 'boolean' }).notNull().default(false),
    createdAt: integer("createdAt", { mode: 'timestamp_ms' }).notNull().default(sql`(cast(unixepoch('subsec') * 1000 as integer))`),
    updatedAt: integer("updatedAt", { mode: 'timestamp_ms' }).notNull().default(sql`(cast(unixepoch('subsec') * 1000 as integer))`).$onUpdate(() => new Date()),
  },
  (t) => [
    uniqueIndex("UserPhone_userId_phone_key").on(t.userId, t.phone),
    index("UserPhone_userId_idx").on(t.userId),
  ],
)

export const userReferral = sqliteTable(
  "UserReferral",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    referrerUserId: text("referrerUserId").notNull().references((): AnySQLiteColumn => user.id, { onDelete: 'cascade' }),
    referredUserId: text("referredUserId").notNull().references((): AnySQLiteColumn => user.id, { onDelete: 'cascade' }),
    status: text("status").notNull().default("PENDING"),
    referrerBonusGrantedAt: integer("referrerBonusGrantedAt", { mode: 'timestamp_ms' }),
    referredBonusGrantedAt: integer("referredBonusGrantedAt", { mode: 'timestamp_ms' }),
    activatedAt: integer("activatedAt", { mode: 'timestamp_ms' }),
    metadata: text("metadata", { mode: 'json' }).notNull().default(sql`'{}'`),
    createdAt: integer("createdAt", { mode: 'timestamp_ms' }).notNull().default(sql`(cast(unixepoch('subsec') * 1000 as integer))`),
    updatedAt: integer("updatedAt", { mode: 'timestamp_ms' }).notNull().default(sql`(cast(unixepoch('subsec') * 1000 as integer))`).$onUpdate(() => new Date()),
    referrerBonusAr: integer("referrerBonusAr").notNull().default(0),
    referredBonusAr: integer("referredBonusAr").notNull().default(0),
  },
  (t) => [
    check("UserReferral_referrer_not_referred", sql`("referrerUserId" <> "referredUserId")`),
    check("UserReferral_status_check", sql`status IN ('PENDING', 'COMPLETED', 'CANCELED')`),
    uniqueIndex("idx_user_referral_referred_unique").on(t.referredUserId),
    index("idx_user_referral_referrer").on(t.referrerUserId, t.createdAt),
  ],
)

export const wishlist = sqliteTable(
  "Wishlist",
  {
    id: text("id").primaryKey(),
    userId: text("userId").notNull().references((): AnySQLiteColumn => user.id, { onDelete: 'cascade' }),
    subjectId: text("subjectId").notNull().references((): AnySQLiteColumn => subject.id, { onDelete: 'cascade' }),
    createdAt: integer("createdAt", { mode: 'timestamp_ms' }).notNull().default(sql`(cast(unixepoch('subsec') * 1000 as integer))`),
  },
  (t) => [
    uniqueIndex("Wishlist_userId_subjectId_key").on(t.userId, t.subjectId),
  ],
)

export const withdrawal = sqliteTable(
  "Withdrawal",
  {
    id: text("id").primaryKey(),
    userId: text("userId").notNull().references((): AnySQLiteColumn => user.id, { onDelete: 'cascade' }),
    amount: integer("amount").notNull(),
    phoneNumber: text("phoneNumber").notNull(),
    paymentMethod: text("paymentMethod").notNull().default("MVOLA"),
    status: text("status").notNull().default("PENDING"),
    transactionId: text("transactionId"),
    rejectionReason: text("rejectionReason"),
    processedAt: integer("processedAt", { mode: 'timestamp_ms' }),
    createdAt: integer("createdAt", { mode: 'timestamp_ms' }).notNull().default(sql`(cast(unixepoch('subsec') * 1000 as integer))`),
    updatedAt: integer("updatedAt", { mode: 'timestamp_ms' }).notNull().default(sql`(cast(unixepoch('subsec') * 1000 as integer))`).$onUpdate(() => new Date()),
  },
  (t) => [
    index("Withdrawal_createdAt_idx").on(t.createdAt),
    index("Withdrawal_paymentMethod_idx").on(t.paymentMethod),
    index("Withdrawal_status_createdAt_idx").on(t.status, t.createdAt),
    index("Withdrawal_status_idx").on(t.status),
    index("Withdrawal_userId_idx").on(t.userId),
  ],
)

export const testimonials = sqliteTable(
  "testimonials",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    role: text("role").notNull(),
    quote: text("quote").notNull(),
    avatar_initial: text("avatar_initial"),
    rating: integer("rating").default(5),
    is_example: integer("is_example", { mode: 'boolean' }).default(false),
    is_featured: integer("is_featured", { mode: 'boolean' }).default(false),
    is_published: integer("is_published", { mode: 'boolean' }).default(true),
    display_order: integer("display_order").default(0),
    created_at: integer("created_at", { mode: 'timestamp_ms' }).default(sql`(cast(unixepoch('subsec') * 1000 as integer))`),
    updated_at: integer("updated_at", { mode: 'timestamp_ms' }).default(sql`(cast(unixepoch('subsec') * 1000 as integer))`),
  },
  (t) => [
    check("testimonials_rating_check", sql`((rating >= 1) AND (rating <= 5))`),
    index("idx_testimonials_landing").on(t.is_published, t.display_order).where(sql`(is_published = true)`),
  ],
)
