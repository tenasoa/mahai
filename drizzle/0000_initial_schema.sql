CREATE TABLE `AICorrection` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`subjectId` text NOT NULL,
	`mode` text NOT NULL,
	`userAnswers` text DEFAULT '{}' NOT NULL,
	`aiResult` text NOT NULL,
	`costAr` integer DEFAULT 0 NOT NULL,
	`model` text,
	`tokensIn` integer,
	`tokensOut` integer,
	`createdAt` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)),
	`cachedFromPoolId` text,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`subjectId`) REFERENCES `Subject`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`cachedFromPoolId`) REFERENCES `DirectCorrectionPool`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "AICorrection_mode_check" CHECK(mode IN ('SUBMISSION', 'DIRECT'))
);
--> statement-breakpoint
CREATE INDEX `idx_ai_correction_subject` ON `AICorrection` (`subjectId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `idx_ai_correction_user` ON `AICorrection` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `idx_ai_correction_user_subject_mode` ON `AICorrection` (`userId`,`subjectId`,`mode`,`createdAt`);--> statement-breakpoint
CREATE TABLE `AdminAuditLog` (
	`id` text PRIMARY KEY NOT NULL,
	`adminId` text NOT NULL,
	`action` text NOT NULL,
	`targetType` text,
	`targetId` text,
	`details` text DEFAULT '{}' NOT NULL,
	`createdAt` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`adminId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_admin_audit_action` ON `AdminAuditLog` (`action`,`createdAt`);--> statement-breakpoint
CREATE INDEX `idx_admin_audit_admin` ON `AdminAuditLog` (`adminId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `idx_admin_audit_target` ON `AdminAuditLog` (`targetType`,`targetId`,`createdAt`);--> statement-breakpoint
CREATE TABLE `BlogCategory` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`color` text DEFAULT '#gold',
	`sort_order` integer DEFAULT 0,
	`is_active` integer DEFAULT true,
	`createdAt` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `BlogCategory_name_key` ON `BlogCategory` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `BlogCategory_slug_key` ON `BlogCategory` (`slug`);--> statement-breakpoint
CREATE TABLE `BlogComment` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text NOT NULL,
	`user_id` text NOT NULL,
	`user_name` text NOT NULL,
	`content` text NOT NULL,
	`parent_id` text,
	`is_approved` integer DEFAULT true,
	`createdAt` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)),
	`updatedAt` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)),
	FOREIGN KEY (`post_id`) REFERENCES `BlogPost`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`parent_id`) REFERENCES `BlogComment`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_blog_comment_approved` ON `BlogComment` (`is_approved`);--> statement-breakpoint
CREATE INDEX `idx_blog_comment_parent` ON `BlogComment` (`parent_id`);--> statement-breakpoint
CREATE INDEX `idx_blog_comment_post` ON `BlogComment` (`post_id`);--> statement-breakpoint
CREATE INDEX `idx_blog_comment_user` ON `BlogComment` (`user_id`);--> statement-breakpoint
CREATE TABLE `BlogPost` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`excerpt` text,
	`content` text NOT NULL,
	`category` text DEFAULT 'general' NOT NULL,
	`author_id` text NOT NULL,
	`author_name` text NOT NULL,
	`cover_image` text,
	`read_time` integer DEFAULT 5,
	`is_published` integer DEFAULT false,
	`is_featured` integer DEFAULT false,
	`views` integer DEFAULT 0,
	`published_at` integer,
	`createdAt` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)),
	`updatedAt` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `BlogPost_slug_key` ON `BlogPost` (`slug`);--> statement-breakpoint
CREATE INDEX `BlogPost_author_id_idx` ON `BlogPost` (`author_id`);--> statement-breakpoint
CREATE INDEX `BlogPost_category_idx` ON `BlogPost` (`category`);--> statement-breakpoint
CREATE INDEX `BlogPost_is_featured_idx` ON `BlogPost` (`is_featured`);--> statement-breakpoint
CREATE INDEX `BlogPost_is_published_idx` ON `BlogPost` (`is_published`);--> statement-breakpoint
CREATE INDEX `BlogPost_slug_idx` ON `BlogPost` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_blog_post_author` ON `BlogPost` (`author_id`);--> statement-breakpoint
CREATE INDEX `idx_blog_post_category` ON `BlogPost` (`category`);--> statement-breakpoint
CREATE INDEX `idx_blog_post_featured` ON `BlogPost` (`is_featured`);--> statement-breakpoint
CREATE INDEX `idx_blog_post_published` ON `BlogPost` (`is_published`);--> statement-breakpoint
CREATE INDEX `idx_blog_post_slug` ON `BlogPost` (`slug`);--> statement-breakpoint
CREATE TABLE `ContributorApplication` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`fullName` text NOT NULL,
	`phone` text NOT NULL,
	`subjects` text NOT NULL,
	`educationLevel` text NOT NULL,
	`teachingExperience` text NOT NULL,
	`motivation` text NOT NULL,
	`availability` text NOT NULL,
	`portfolioUrl` text,
	`sampleLesson` text,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`adminNotes` text,
	`reviewedBy` text,
	`reviewedAt` integer,
	`createdAt` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`updatedAt` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`reviewedBy`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "ContributorApplication_status_check" CHECK(status IN ('PENDING', 'APPROVED', 'REJECTED'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ContributorApplication_userId_key` ON `ContributorApplication` (`userId`);--> statement-breakpoint
CREATE INDEX `ContributorApplication_createdAt_idx` ON `ContributorApplication` (`createdAt`);--> statement-breakpoint
CREATE INDEX `ContributorApplication_status_idx` ON `ContributorApplication` (`status`);--> statement-breakpoint
CREATE TABLE `CreditPack` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`credits` integer NOT NULL,
	`arAmount` integer NOT NULL,
	`bonus` integer DEFAULT 0,
	`isPopular` integer DEFAULT false,
	`isActive` integer DEFAULT true,
	`sortOrder` integer DEFAULT 0,
	`createdAt` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)),
	`updatedAt` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)),
	`bonusAr` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_credit_pack_active` ON `CreditPack` (`isActive`);--> statement-breakpoint
CREATE INDEX `idx_credit_pack_order` ON `CreditPack` (`sortOrder`);--> statement-breakpoint
CREATE TABLE `CreditTransaction` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`amount` integer NOT NULL,
	`type` text NOT NULL,
	`description` text,
	`paymentMethod` text,
	`transactionId` text,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`createdAt` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`metadata` text DEFAULT '{}',
	`phoneNumber` text,
	`senderCode` text,
	`creditsCount` integer DEFAULT 0,
	`rejectionReason` text,
	`validatedAt` integer,
	`validatedBy` text,
	`isRead` integer DEFAULT false NOT NULL,
	`isDismissed` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`validatedBy`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `CreditTransaction_senderCode_idx` ON `CreditTransaction` (`senderCode`);--> statement-breakpoint
CREATE INDEX `CreditTransaction_status_idx` ON `CreditTransaction` (`status`);--> statement-breakpoint
CREATE INDEX `CreditTransaction_userId_idx` ON `CreditTransaction` (`userId`);--> statement-breakpoint
CREATE INDEX `CreditTransaction_userId_isDismissed_idx` ON `CreditTransaction` (`userId`,`isDismissed`);--> statement-breakpoint
CREATE INDEX `CreditTransaction_userId_isRead_idx` ON `CreditTransaction` (`userId`,`isRead`);--> statement-breakpoint
CREATE INDEX `idx_credit_transaction_created` ON `CreditTransaction` (`createdAt`);--> statement-breakpoint
CREATE INDEX `idx_credit_transaction_type` ON `CreditTransaction` (`type`);--> statement-breakpoint
CREATE INDEX `idx_credit_transaction_user` ON `CreditTransaction` (`userId`);--> statement-breakpoint
CREATE TABLE `DailyActivity` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`date` text DEFAULT (date('now')) NOT NULL,
	`type` text DEFAULT 'LOGIN' NOT NULL,
	`metadata` text,
	`createdAt` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)),
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_daily_activity_user_date` ON `DailyActivity` (`userId`,`date`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_daily_activity_user_date_type` ON `DailyActivity` (`userId`,`date`,`type`);--> statement-breakpoint
CREATE TABLE `DirectCorrectionPool` (
	`id` text PRIMARY KEY NOT NULL,
	`subjectId` text NOT NULL,
	`content` text NOT NULL,
	`generatedByUserId` text NOT NULL,
	`timesServed` integer DEFAULT 0 NOT NULL,
	`model` text,
	`tokensIn` integer DEFAULT 0,
	`tokensOut` integer DEFAULT 0,
	`createdAt` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`subjectId`) REFERENCES `Subject`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`generatedByUserId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `DirectCorrectionPool_subjectId_idx` ON `DirectCorrectionPool` (`subjectId`);--> statement-breakpoint
CREATE TABLE `DirectCorrectionSeen` (
	`userId` text NOT NULL,
	`poolId` text NOT NULL,
	`seenAt` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	PRIMARY KEY(`userId`, `poolId`),
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`poolId`) REFERENCES `DirectCorrectionPool`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `EmailVerification` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`token` text NOT NULL,
	`expiresAt` integer NOT NULL,
	`used` integer DEFAULT false NOT NULL,
	`createdAt` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `EmailVerification_token_key` ON `EmailVerification` (`token`);--> statement-breakpoint
CREATE TABLE `ExamenBlanc` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`titre` text NOT NULL,
	`typeExamen` text NOT NULL,
	`matiere` text NOT NULL,
	`annee` text NOT NULL,
	`dureeSecondes` integer NOT NULL,
	`startedAt` integer,
	`submittedAt` integer,
	`score` real,
	`scoreMax` real,
	`percentile` real,
	`status` text DEFAULT 'NOT_STARTED' NOT NULL,
	`createdAt` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`subjectId` text,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`subjectId`) REFERENCES `Subject`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "ExamenBlanc_status_enum" CHECK("status" IN ('NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'GRADED'))
);
--> statement-breakpoint
CREATE INDEX `ExamenBlanc_subjectId_idx` ON `ExamenBlanc` (`subjectId`);--> statement-breakpoint
CREATE INDEX `ExamenBlanc_userId_idx` ON `ExamenBlanc` (`userId`);--> statement-breakpoint
CREATE TABLE `MerchantPhone` (
	`id` text PRIMARY KEY NOT NULL,
	`operator` text NOT NULL,
	`phone` text NOT NULL,
	`label` text,
	`isActive` integer DEFAULT true,
	`isDefault` integer DEFAULT false,
	`createdAt` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)),
	`updatedAt` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)),
	CONSTRAINT "MerchantPhone_operator_check" CHECK(operator IN ('mvola', 'orange', 'airtel'))
);
--> statement-breakpoint
CREATE INDEX `idx_merchant_phone_active` ON `MerchantPhone` (`isActive`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_merchant_phone_default` ON `MerchantPhone` (`operator`) WHERE ("isDefault" = true);--> statement-breakpoint
CREATE INDEX `idx_merchant_phone_operator` ON `MerchantPhone` (`operator`);--> statement-breakpoint
CREATE TABLE `Notification` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`body` text,
	`link` text,
	`metadata` text DEFAULT '{}' NOT NULL,
	`isRead` integer DEFAULT false NOT NULL,
	`isDismissed` integer DEFAULT false NOT NULL,
	`createdAt` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`readAt` integer,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_notif_type` ON `Notification` (`type`,`createdAt`);--> statement-breakpoint
CREATE INDEX `idx_notif_user_dismissed` ON `Notification` (`userId`,`isDismissed`,`createdAt`);--> statement-breakpoint
CREATE INDEX `idx_notif_user_unread` ON `Notification` (`userId`,`isRead`) WHERE ("isDismissed" = false);--> statement-breakpoint
CREATE TABLE `PasswordReset` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`token` text NOT NULL,
	`expiresAt` integer NOT NULL,
	`used` integer DEFAULT false NOT NULL,
	`createdAt` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `PasswordReset_token_key` ON `PasswordReset` (`token`);--> statement-breakpoint
CREATE TABLE `Purchase` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`subjectId` text,
	`paymentMethod` text,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`createdAt` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`amountAr` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`subjectId`) REFERENCES `Subject`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "check_amount_ar_positive" CHECK(("amountAr" >= 0))
);
--> statement-breakpoint
CREATE INDEX `Purchase_subjectId_idx` ON `Purchase` (`subjectId`);--> statement-breakpoint
CREATE INDEX `Purchase_userId_idx` ON `Purchase` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_purchase_amount_ar` ON `Purchase` (`amountAr`,`createdAt`);--> statement-breakpoint
CREATE TABLE `QuestionExamen` (
	`id` text PRIMARY KEY NOT NULL,
	`examenId` text NOT NULL,
	`numero` integer NOT NULL,
	`texte` text NOT NULL,
	`type` text DEFAULT 'réponse' NOT NULL,
	`options` text,
	`points` integer DEFAULT 5 NOT NULL,
	`createdAt` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`examenId`) REFERENCES `ExamenBlanc`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `QuestionExamen_examenId_idx` ON `QuestionExamen` (`examenId`);--> statement-breakpoint
CREATE TABLE `ReferralCommission` (
	`id` text PRIMARY KEY NOT NULL,
	`referrerId` text,
	`referredId` text,
	`arAmount` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'PENDING',
	`createdAt` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)),
	`updatedAt` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)),
	FOREIGN KEY (`referrerId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`referredId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `Subject` (
	`id` text PRIMARY KEY NOT NULL,
	`titre` text NOT NULL,
	`type` text NOT NULL,
	`matiere` text NOT NULL,
	`annee` text NOT NULL,
	`serie` text,
	`description` text,
	`pages` integer NOT NULL,
	`difficulte` text DEFAULT 'MOYEN' NOT NULL,
	`langue` text DEFAULT 'FRANCAIS' NOT NULL,
	`format` text DEFAULT 'PDF' NOT NULL,
	`badge` text DEFAULT 'AI' NOT NULL,
	`glyph` text DEFAULT '∑' NOT NULL,
	`featured` integer DEFAULT false NOT NULL,
	`rating` real DEFAULT 0 NOT NULL,
	`reviewsCount` integer DEFAULT 0 NOT NULL,
	`hasCorrectionIa` integer DEFAULT false NOT NULL,
	`hasCorrectionProf` integer DEFAULT false NOT NULL,
	`authorId` text NOT NULL,
	`createdAt` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`status` text DEFAULT 'PUBLISHED' NOT NULL,
	`downloadCount` integer DEFAULT 0 NOT NULL,
	`duree` text,
	`coefficient` integer,
	`filiere` text,
	`niveau` text,
	`examType` text,
	`anneeScolaire` text,
	`dateOfficielle` text,
	`bepcOption` text,
	`baccType` text,
	`concoursType` text,
	`etablissement` text,
	`semestre` text,
	`customMeta` text DEFAULT '[]' NOT NULL,
	`submissionId` text,
	`content` text,
	`contentType` text,
	`tags` text DEFAULT '[]' NOT NULL,
	`prixMode` text,
	`visibilite` text,
	`reviewerId` text,
	`publishedAt` integer,
	`prix` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`submissionId`) REFERENCES `SubjectSubmission`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`reviewerId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "check_prix_positive" CHECK((prix >= 0)),
	CONSTRAINT "Subject_type_enum" CHECK("type" IN ('BAC', 'BEPC', 'CEPE', 'BACC', 'Concours', 'Etablissement', 'Autre')),
	CONSTRAINT "Subject_difficulte_enum" CHECK("difficulte" IN ('FACILE', 'MOYEN', 'DIFFICILE')),
	CONSTRAINT "Subject_langue_enum" CHECK("langue" IN ('FRANCAIS', 'MALGACHE')),
	CONSTRAINT "Subject_format_enum" CHECK("format" IN ('PDF', 'INTERACTIF')),
	CONSTRAINT "Subject_badge_enum" CHECK("badge" IN ('GOLD', 'AI', 'FREE', 'INTER'))
);
--> statement-breakpoint
CREATE INDEX `Subject_authorId_idx` ON `Subject` (`authorId`);--> statement-breakpoint
CREATE INDEX `idx_subject_examtype` ON `Subject` (`examType`,`anneeScolaire`);--> statement-breakpoint
CREATE INDEX `idx_subject_submission_id` ON `Subject` (`submissionId`);--> statement-breakpoint
CREATE TABLE `SubjectDownload` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`subjectId` text NOT NULL,
	`watermarkCode` text NOT NULL,
	`ipAddress` text,
	`userAgent` text,
	`downloadedAt` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)),
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`subjectId`) REFERENCES `Subject`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `SubjectDownload_watermarkCode_key` ON `SubjectDownload` (`watermarkCode`);--> statement-breakpoint
CREATE INDEX `idx_subject_download_subject` ON `SubjectDownload` (`subjectId`,`downloadedAt`);--> statement-breakpoint
CREATE INDEX `idx_subject_download_user` ON `SubjectDownload` (`userId`,`downloadedAt`);--> statement-breakpoint
CREATE INDEX `idx_subject_download_watermark` ON `SubjectDownload` (`watermarkCode`);--> statement-breakpoint
CREATE TABLE `SubjectImage` (
	`id` text PRIMARY KEY NOT NULL,
	`submissionId` text NOT NULL,
	`authorId` text NOT NULL,
	`url` text NOT NULL,
	`filename` text NOT NULL,
	`mimeType` text DEFAULT 'image/jpeg' NOT NULL,
	`size` integer DEFAULT 0 NOT NULL,
	`createdAt` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`submissionId`) REFERENCES `SubjectSubmission`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `SubjectImage_url_key` ON `SubjectImage` (`url`);--> statement-breakpoint
CREATE INDEX `idx_subject_image_author` ON `SubjectImage` (`authorId`);--> statement-breakpoint
CREATE INDEX `idx_subject_image_submission` ON `SubjectImage` (`submissionId`);--> statement-breakpoint
CREATE TABLE `SubjectLog` (
	`id` text PRIMARY KEY NOT NULL,
	`subjectId` text NOT NULL,
	`userId` text NOT NULL,
	`action` text NOT NULL,
	`oldStatus` text,
	`newStatus` text,
	`notes` text,
	`createdAt` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`subjectId`) REFERENCES `Subject`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `SubjectLog_createdAt_idx` ON `SubjectLog` (`createdAt`);--> statement-breakpoint
CREATE INDEX `SubjectLog_subjectId_idx` ON `SubjectLog` (`subjectId`);--> statement-breakpoint
CREATE INDEX `SubjectLog_userId_idx` ON `SubjectLog` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_subjectlog_subjectid` ON `SubjectLog` (`subjectId`);--> statement-breakpoint
CREATE TABLE `SubjectSubmission` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text DEFAULT '' NOT NULL,
	`matiere` text DEFAULT '' NOT NULL,
	`niveau` text DEFAULT '' NOT NULL,
	`serie` text,
	`annee` integer,
	`duree` text,
	`coefficient` integer,
	`contentType` text DEFAULT 'sujet_seul' NOT NULL,
	`content` text DEFAULT '{}' NOT NULL,
	`tags` text DEFAULT '[]' NOT NULL,
	`prix` integer DEFAULT 0 NOT NULL,
	`prixMode` text DEFAULT 'forfait' NOT NULL,
	`visibilite` text DEFAULT 'public' NOT NULL,
	`status` text DEFAULT 'DRAFT' NOT NULL,
	`examType` text,
	`bepcOption` text,
	`baccType` text,
	`concoursType` text,
	`etablissement` text,
	`semestre` text,
	`filiere` text,
	`anneeScolaire` text,
	`dateOfficielle` text,
	`customMeta` text DEFAULT '[]' NOT NULL,
	`authorId` text NOT NULL,
	`createdAt` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`updatedAt` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`notes` text,
	`reviewerId` text,
	`validatedAt` integer,
	`reviewedAt` integer,
	`pages` integer,
	`difficulte` text,
	`description` text,
	FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`reviewerId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_submission_author_revision` ON `SubjectSubmission` (`authorId`,`status`) WHERE (status = 'REVISION_REQUESTED');--> statement-breakpoint
CREATE INDEX `idx_submission_author_status` ON `SubjectSubmission` (`authorId`,`status`,`createdAt`);--> statement-breakpoint
CREATE INDEX `idx_submission_matiere_niveau` ON `SubjectSubmission` (`matiere`,`niveau`);--> statement-breakpoint
CREATE INDEX `idx_submission_status` ON `SubjectSubmission` (`status`,`createdAt`);--> statement-breakpoint
CREATE INDEX `idx_submission_status_reviewer` ON `SubjectSubmission` (`status`,`reviewerId`) WHERE status IN ('SUBMITTED', 'VALIDATED', 'REJECTED');--> statement-breakpoint
CREATE INDEX `idx_submission_validated_at` ON `SubjectSubmission` (`validatedAt`) WHERE (status = 'VALIDATED');--> statement-breakpoint
CREATE TABLE `SystemSetting` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL,
	`type` text DEFAULT 'string' NOT NULL,
	`label` text,
	`description` text,
	`category` text DEFAULT 'general' NOT NULL,
	`isEditable` integer DEFAULT true,
	`updatedAt` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)),
	CONSTRAINT "SystemSetting_type_check" CHECK(type IN ('string', 'number', 'boolean', 'json'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `SystemSetting_key_key` ON `SystemSetting` (`key`);--> statement-breakpoint
CREATE INDEX `idx_system_setting_category` ON `SystemSetting` (`category`);--> statement-breakpoint
CREATE INDEX `idx_system_setting_key` ON `SystemSetting` (`key`);--> statement-breakpoint
CREATE TABLE `testimonials` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`quote` text NOT NULL,
	`avatar_initial` text,
	`rating` integer DEFAULT 5,
	`is_example` integer DEFAULT false,
	`is_featured` integer DEFAULT false,
	`is_published` integer DEFAULT true,
	`display_order` integer DEFAULT 0,
	`created_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)),
	`updated_at` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)),
	CONSTRAINT "testimonials_rating_check" CHECK(((rating >= 1) AND (rating <= 5)))
);
--> statement-breakpoint
CREATE INDEX `idx_testimonials_landing` ON `testimonials` (`is_published`,`display_order`) WHERE (is_published = true);--> statement-breakpoint
CREATE TABLE `Transaction` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`amountAr` integer NOT NULL,
	`type` text NOT NULL,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`description` text,
	`phoneNumber` text,
	`paymentMethod` text,
	`senderCode` text,
	`validatedAt` integer,
	`validatedBy` text,
	`rejectionReason` text,
	`metadata` text DEFAULT '{}',
	`createdAt` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)),
	`isRead` integer DEFAULT false NOT NULL,
	`isDismissed` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `Transaction_userId_isDismissed_idx` ON `Transaction` (`userId`,`isDismissed`) WHERE ("isDismissed" = false);--> statement-breakpoint
CREATE INDEX `Transaction_userId_isRead_idx` ON `Transaction` (`userId`,`isRead`) WHERE ("isRead" = false);--> statement-breakpoint
CREATE INDEX `idx_transaction_status_created` ON `Transaction` (`status`,`createdAt`);--> statement-breakpoint
CREATE INDEX `idx_transaction_type` ON `Transaction` (`type`,`createdAt`);--> statement-breakpoint
CREATE INDEX `idx_transaction_user_created` ON `Transaction` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `idx_transaction_user_unread` ON `Transaction` (`userId`,`isRead`) WHERE (("isRead" = false) AND ("isDismissed" = false));--> statement-breakpoint
CREATE TABLE `User` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`prenom` text NOT NULL,
	`nom` text,
	`role` text DEFAULT 'ETUDIANT' NOT NULL,
	`phone` text,
	`phoneVerified` integer DEFAULT false NOT NULL,
	`schoolLevel` text,
	`emailVerified` integer DEFAULT false NOT NULL,
	`createdAt` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`updatedAt` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`userType` text DEFAULT 'ETUDIANT',
	`customUserType` text,
	`etablissement` text,
	`educationLevel` text,
	`gradeLevel` text,
	`filiere` text,
	`age` integer,
	`dateNaissance` text,
	`region` text,
	`district` text,
	`preferences` text DEFAULT '{}',
	`bio` text,
	`matieresPreferees` text,
	`objectifsEtude` text,
	`profilePublic` integer DEFAULT true,
	`showEmail` integer DEFAULT false,
	`showPhone` integer DEFAULT false,
	`showEtablissement` integer DEFAULT true,
	`notifCorrections` integer DEFAULT true,
	`notifSujets` integer DEFAULT true,
	`notifPromos` integer DEFAULT false,
	`notifRappels` integer DEFAULT true,
	`birthDate` text,
	`nomComplet` text,
	`pseudo` text,
	`profilePicture` text,
	`defaultOperator` text DEFAULT 'MVOLA',
	`securityTwoFactorEnabled` integer DEFAULT false NOT NULL,
	`securityLoginAlertEnabled` integer DEFAULT true NOT NULL,
	`securityUnknownDeviceBlock` integer DEFAULT false NOT NULL,
	`securityRecoveryEmailEnabled` integer DEFAULT true NOT NULL,
	`securitySessionTimeoutMinutes` integer DEFAULT 120 NOT NULL,
	`securitySettingsUpdatedAt` integer,
	`referralCode` text,
	`referredByUserId` text,
	`lyceeType` text,
	`balanceAr` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`referredByUserId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "User_securitySessionTimeoutMinutes_check" CHECK((("securitySessionTimeoutMinutes" >= 15) AND ("securitySessionTimeoutMinutes" <= 1440))),
	CONSTRAINT "check_balance_ar_positive" CHECK(("balanceAr" >= 0)),
	CONSTRAINT "User_role_enum" CHECK("role" IN ('ETUDIANT', 'CONTRIBUTEUR', 'PROFESSEUR', 'VERIFICATEUR', 'VALIDATEUR', 'ADMIN')),
	CONSTRAINT "User_userType_enum" CHECK("userType" IN ('ETUDIANT', 'PROFESSIONNEL', 'ENSEIGNANT', 'PARENT', 'AUTRE')),
	CONSTRAINT "User_educationLevel_enum" CHECK("educationLevel" IN ('PRIMAIRE', 'COLLEGE', 'LYCEE', 'UNIVERSITE', 'FORMATION', 'FACULTE', 'INSTITUT')),
	CONSTRAINT "User_gradeLevel_enum" CHECK("gradeLevel" IN ('11EME', '10EME', '9EME', '8EME', '7EME', '6EME', '5EME', '4EME', '3EME', 'SECONDE', 'PREMIERE', 'TERMINALE', 'L1', 'L2', 'L3', 'M1', 'M2', 'TECH_1', 'TECH_2', 'TECH_3'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `User_email_key` ON `User` (`email`);--> statement-breakpoint
CREATE INDEX `idx_user_balance_ar` ON `User` (`balanceAr`) WHERE ("balanceAr" > 0);--> statement-breakpoint
CREATE INDEX `idx_user_birthdate` ON `User` (`birthDate`);--> statement-breakpoint
CREATE INDEX `idx_user_educationLevel` ON `User` (`educationLevel`);--> statement-breakpoint
CREATE INDEX `idx_user_gradeLevel` ON `User` (`gradeLevel`);--> statement-breakpoint
CREATE INDEX `idx_user_nom` ON `User` (`nom`);--> statement-breakpoint
CREATE INDEX `idx_user_prenom` ON `User` (`prenom`);--> statement-breakpoint
CREATE INDEX `idx_user_profilepicture` ON `User` (`profilePicture`);--> statement-breakpoint
CREATE INDEX `idx_user_pseudo` ON `User` (`pseudo`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_user_referral_code_unique` ON `User` (`referralCode`) WHERE ("referralCode" IS NOT NULL);--> statement-breakpoint
CREATE INDEX `idx_user_referred_by` ON `User` (`referredByUserId`);--> statement-breakpoint
CREATE INDEX `idx_user_region` ON `User` (`region`);--> statement-breakpoint
CREATE INDEX `idx_user_security_2fa` ON `User` (`securityTwoFactorEnabled`);--> statement-breakpoint
CREATE INDEX `idx_user_security_settings_updated` ON `User` (`securitySettingsUpdatedAt`);--> statement-breakpoint
CREATE INDEX `idx_user_userType` ON `User` (`userType`);--> statement-breakpoint
CREATE TABLE `UserPhone` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`phone` text NOT NULL,
	`provider` text NOT NULL,
	`label` text,
	`isDefault` integer DEFAULT false NOT NULL,
	`createdAt` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`updatedAt` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `UserPhone_userId_phone_key` ON `UserPhone` (`userId`,`phone`);--> statement-breakpoint
CREATE INDEX `UserPhone_userId_idx` ON `UserPhone` (`userId`);--> statement-breakpoint
CREATE TABLE `UserReferral` (
	`id` text PRIMARY KEY NOT NULL,
	`referrerUserId` text NOT NULL,
	`referredUserId` text NOT NULL,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`referrerBonusGrantedAt` integer,
	`referredBonusGrantedAt` integer,
	`activatedAt` integer,
	`metadata` text DEFAULT '{}' NOT NULL,
	`createdAt` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`updatedAt` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`referrerBonusAr` integer DEFAULT 0 NOT NULL,
	`referredBonusAr` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`referrerUserId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`referredUserId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "UserReferral_referrer_not_referred" CHECK(("referrerUserId" <> "referredUserId")),
	CONSTRAINT "UserReferral_status_check" CHECK(status IN ('PENDING', 'COMPLETED', 'CANCELED'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_user_referral_referred_unique` ON `UserReferral` (`referredUserId`);--> statement-breakpoint
CREATE INDEX `idx_user_referral_referrer` ON `UserReferral` (`referrerUserId`,`createdAt`);--> statement-breakpoint
CREATE TABLE `Wishlist` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`subjectId` text NOT NULL,
	`createdAt` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`subjectId`) REFERENCES `Subject`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Wishlist_userId_subjectId_key` ON `Wishlist` (`userId`,`subjectId`);--> statement-breakpoint
CREATE TABLE `Withdrawal` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`amount` integer NOT NULL,
	`phoneNumber` text NOT NULL,
	`paymentMethod` text DEFAULT 'MVOLA' NOT NULL,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`transactionId` text,
	`rejectionReason` text,
	`processedAt` integer,
	`createdAt` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`updatedAt` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `Withdrawal_createdAt_idx` ON `Withdrawal` (`createdAt`);--> statement-breakpoint
CREATE INDEX `Withdrawal_paymentMethod_idx` ON `Withdrawal` (`paymentMethod`);--> statement-breakpoint
CREATE INDEX `Withdrawal_status_createdAt_idx` ON `Withdrawal` (`status`,`createdAt`);--> statement-breakpoint
CREATE INDEX `Withdrawal_status_idx` ON `Withdrawal` (`status`);--> statement-breakpoint
CREATE INDEX `Withdrawal_userId_idx` ON `Withdrawal` (`userId`);