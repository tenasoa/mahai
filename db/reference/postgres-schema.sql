--
-- PostgreSQL database dump
--

\restrict YGBSLQB2f6FVcgobdpe8c3YDAzYvozFHyTdiwClnQ363Zi6nkOCI5nl4tC5cwu2

-- Dumped from database version 16.15 (Ubuntu 16.15-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.15 (Ubuntu 16.15-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: Badge; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Badge" AS ENUM (
    'GOLD',
    'AI',
    'FREE',
    'INTER'
);


--
-- Name: Difficulte; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Difficulte" AS ENUM (
    'FACILE',
    'MOYEN',
    'DIFFICILE'
);


--
-- Name: EducationLevel; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."EducationLevel" AS ENUM (
    'PRIMAIRE',
    'COLLEGE',
    'LYCEE',
    'UNIVERSITE',
    'FORMATION',
    'FACULTE',
    'INSTITUT'
);


--
-- Name: ExamenStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ExamenStatus" AS ENUM (
    'NOT_STARTED',
    'IN_PROGRESS',
    'SUBMITTED',
    'GRADED'
);


--
-- Name: ExamenType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ExamenType" AS ENUM (
    'BAC',
    'BEPC',
    'CEPE',
    'BACC',
    'Concours',
    'Etablissement',
    'Autre'
);


--
-- Name: Format; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Format" AS ENUM (
    'PDF',
    'INTERACTIF'
);


--
-- Name: GradeLevel; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."GradeLevel" AS ENUM (
    '11EME',
    '10EME',
    '9EME',
    '8EME',
    '7EME',
    '6EME',
    '5EME',
    '4EME',
    '3EME',
    'SECONDE',
    'PREMIERE',
    'TERMINALE',
    'L1',
    'L2',
    'L3',
    'M1',
    'M2',
    'TECH_1',
    'TECH_2',
    'TECH_3'
);


--
-- Name: Langue; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Langue" AS ENUM (
    'FRANCAIS',
    'MALGACHE'
);


--
-- Name: Role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Role" AS ENUM (
    'ETUDIANT',
    'CONTRIBUTEUR',
    'PROFESSEUR',
    'VERIFICATEUR',
    'VALIDATEUR',
    'ADMIN'
);


--
-- Name: SubmissionStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SubmissionStatus" AS ENUM (
    'PENDING',
    'UNDER_REVIEW',
    'REJECTED',
    'VALIDATED',
    'PUBLISHED'
);


--
-- Name: UserType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."UserType" AS ENUM (
    'ETUDIANT',
    'PROFESSIONNEL',
    'ENSEIGNANT',
    'PARENT',
    'AUTRE'
);


--
-- Name: getcyclestats(integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.getcyclestats(targetyear integer, targetmonth integer) RETURNS TABLE(totalwithdrawals bigint, pendingcount bigint, completedcount bigint, failedcount bigint, totalamount bigint, pendingamount bigint, completedamount bigint, averageamount numeric)
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT,
    COUNT(*) FILTER (WHERE status = 'PENDING')::BIGINT,
    COUNT(*) FILTER (WHERE status = 'COMPLETED')::BIGINT,
    COUNT(*) FILTER (WHERE status = 'FAILED')::BIGINT,
    COALESCE(SUM(amount), 0)::BIGINT,
    COALESCE(SUM(amount) FILTER (WHERE status = 'PENDING'), 0)::BIGINT,
    COALESCE(SUM(amount) FILTER (WHERE status = 'COMPLETED'), 0)::BIGINT,
    COALESCE(AVG(amount) FILTER (WHERE status = 'COMPLETED'), 0)::NUMERIC
  FROM "Withdrawal"
  WHERE EXTRACT(YEAR FROM "createdAt") = targetYear
    AND EXTRACT(MONTH FROM "createdAt") = targetMonth;
END;
$$;


--
-- Name: getmonthwithdrawals(integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.getmonthwithdrawals(targetyear integer, targetmonth integer) RETURNS TABLE(id text, "userId" text, amount integer, phonenumber text, paymentmethod text, status text, prenom text, nom text, email text, credits integer, "createdAt" timestamp without time zone, "processedAt" timestamp without time zone, "rejectionReason" text)
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    w.id,
    w."userId",
    w.amount,
    w.phoneNumber,
    w.paymentMethod,
    w.status,
    u.prenom,
    u.nom,
    u.email,
    u.credits,
    w."createdAt",
    w."processedAt",
    w."rejectionReason"
  FROM "Withdrawal" w
  JOIN "User" u ON w."userId" = u.id
  WHERE EXTRACT(YEAR FROM w."createdAt") = targetYear
    AND EXTRACT(MONTH FROM w."createdAt") = targetMonth
  ORDER BY w."createdAt" DESC;
END;
$$;


--
-- Name: set_user_referral_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_user_referral_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AICorrection; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AICorrection" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    "userId" text NOT NULL,
    "subjectId" text NOT NULL,
    mode character varying(16) NOT NULL,
    "userAnswers" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "aiResult" jsonb NOT NULL,
    "costAr" integer DEFAULT 0 NOT NULL,
    model text,
    "tokensIn" integer,
    "tokensOut" integer,
    "createdAt" timestamp with time zone DEFAULT now(),
    "cachedFromPoolId" uuid,
    CONSTRAINT "AICorrection_mode_check" CHECK (((mode)::text = ANY ((ARRAY['SUBMISSION'::character varying, 'DIRECT'::character varying])::text[])))
);


--
-- Name: TABLE "AICorrection"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public."AICorrection" IS 'Historique des corrections IA (soumission élève + correction directe). 1 ligne = 1 appel facturé.';


--
-- Name: AdminAuditLog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AdminAuditLog" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    "adminId" text NOT NULL,
    action character varying(64) NOT NULL,
    "targetType" character varying(32),
    "targetId" text,
    details jsonb DEFAULT '{}'::jsonb NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE "AdminAuditLog"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public."AdminAuditLog" IS 'Journal des actions admin sensibles (validations paiement, rôles, suppressions). Append-only.';


--
-- Name: Withdrawal; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Withdrawal" (
    id text NOT NULL,
    "userId" text NOT NULL,
    amount integer NOT NULL,
    "phoneNumber" text NOT NULL,
    "paymentMethod" text DEFAULT 'MVOLA'::text NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "transactionId" text,
    "rejectionReason" text,
    "processedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: AdminWithdrawalStats; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public."AdminWithdrawalStats" AS
 SELECT EXTRACT(year FROM "createdAt") AS year,
    EXTRACT(month FROM "createdAt") AS month,
    to_char("createdAt", 'YYYY-MM'::text) AS month_label,
    count(*) AS totalwithdrawals,
    count(*) FILTER (WHERE (status = 'PENDING'::text)) AS pendingcount,
    count(*) FILTER (WHERE (status = 'PROCESSING'::text)) AS processingcount,
    count(*) FILTER (WHERE (status = 'COMPLETED'::text)) AS completedcount,
    count(*) FILTER (WHERE (status = 'FAILED'::text)) AS failedcount,
    COALESCE(sum(amount), (0)::bigint) AS totalamount,
    COALESCE(sum(amount) FILTER (WHERE (status = 'PENDING'::text)), (0)::bigint) AS pendingamount,
    COALESCE(sum(amount) FILTER (WHERE (status = 'COMPLETED'::text)), (0)::bigint) AS completedamount,
    COALESCE(avg(amount) FILTER (WHERE (status = 'COMPLETED'::text)), (0)::numeric) AS averageamount,
    count(DISTINCT "userId") AS uniqueusers,
    count(DISTINCT "userId") FILTER (WHERE (status = 'COMPLETED'::text)) AS paidusers
   FROM public."Withdrawal"
  GROUP BY (EXTRACT(year FROM "createdAt")), (EXTRACT(month FROM "createdAt")), (to_char("createdAt", 'YYYY-MM'::text))
  ORDER BY (EXTRACT(year FROM "createdAt")) DESC, (EXTRACT(month FROM "createdAt")) DESC;


--
-- Name: BlogCategory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."BlogCategory" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    color text DEFAULT '#gold'::text,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    "createdAt" timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE "BlogCategory"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public."BlogCategory" IS 'Catégories pour classer les articles de blog';


--
-- Name: BlogComment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."BlogComment" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid NOT NULL,
    user_id text NOT NULL,
    user_name text NOT NULL,
    content text NOT NULL,
    parent_id uuid,
    is_approved boolean DEFAULT true,
    "createdAt" timestamp with time zone DEFAULT now(),
    "updatedAt" timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE "BlogComment"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public."BlogComment" IS 'Commentaires des utilisateurs sur les articles de blog';


--
-- Name: COLUMN "BlogComment".parent_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."BlogComment".parent_id IS 'For nested/reply comments';


--
-- Name: BlogPost; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."BlogPost" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    excerpt text,
    content text NOT NULL,
    category text DEFAULT 'general'::text NOT NULL,
    author_id text NOT NULL,
    author_name text NOT NULL,
    cover_image text,
    read_time integer DEFAULT 5,
    is_published boolean DEFAULT false,
    is_featured boolean DEFAULT false,
    views integer DEFAULT 0,
    published_at timestamp with time zone,
    "createdAt" timestamp with time zone DEFAULT now(),
    "updatedAt" timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE "BlogPost"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public."BlogPost" IS 'Articles de blog publiés sur la plateforme';


--
-- Name: COLUMN "BlogPost".slug; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."BlogPost".slug IS 'URL-friendly identifier for the post';


--
-- Name: COLUMN "BlogPost".read_time; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."BlogPost".read_time IS 'Estimated reading time in minutes';


--
-- Name: ContributorApplication; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ContributorApplication" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    "userId" text NOT NULL,
    "fullName" text NOT NULL,
    phone text NOT NULL,
    subjects text NOT NULL,
    "educationLevel" text NOT NULL,
    "teachingExperience" text NOT NULL,
    motivation text NOT NULL,
    availability text NOT NULL,
    "portfolioUrl" text,
    "sampleLesson" text,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "adminNotes" text,
    "reviewedBy" text,
    "reviewedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "ContributorApplication_status_check" CHECK ((status = ANY (ARRAY['PENDING'::text, 'APPROVED'::text, 'REJECTED'::text])))
);


--
-- Name: CreditPack; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CreditPack" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    credits integer NOT NULL,
    "arAmount" integer NOT NULL,
    bonus integer DEFAULT 0,
    "isPopular" boolean DEFAULT false,
    "isActive" boolean DEFAULT true,
    "sortOrder" integer DEFAULT 0,
    "createdAt" timestamp with time zone DEFAULT now(),
    "updatedAt" timestamp with time zone DEFAULT now(),
    "bonusAr" integer DEFAULT 0 NOT NULL
);


--
-- Name: TABLE "CreditPack"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public."CreditPack" IS 'Configuration des packs de crédits disponibles à l achat';


--
-- Name: COLUMN "CreditPack"."arAmount"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."CreditPack"."arAmount" IS 'Prix en Ariary (Ar)';


--
-- Name: COLUMN "CreditPack".bonus; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."CreditPack".bonus IS 'Crédits bonus offerts avec ce pack';


--
-- Name: CreditTransaction; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CreditTransaction" (
    id text NOT NULL,
    "userId" text NOT NULL,
    amount integer NOT NULL,
    type text NOT NULL,
    description text,
    "paymentMethod" text,
    "transactionId" text,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    "phoneNumber" text,
    "senderCode" text,
    "creditsCount" integer DEFAULT 0,
    "rejectionReason" text,
    "validatedAt" timestamp(3) without time zone,
    "validatedBy" text,
    "isRead" boolean DEFAULT false NOT NULL,
    "isDismissed" boolean DEFAULT false NOT NULL
);

ALTER TABLE ONLY public."CreditTransaction" REPLICA IDENTITY FULL;


--
-- Name: TABLE "CreditTransaction"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public."CreditTransaction" IS 'Historique des transactions de crédits des utilisateurs';


--
-- Name: COLUMN "CreditTransaction".amount; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."CreditTransaction".amount IS 'Montant en crédits (positif pour les ajouts, négatif pour les dépenses)';


--
-- Name: COLUMN "CreditTransaction".type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."CreditTransaction".type IS 'Type de transaction: ACHAT (dépense), RECHARGE (ajout), REMBOURSEMENT, BONUS';


--
-- Name: COLUMN "CreditTransaction".metadata; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."CreditTransaction".metadata IS 'Données JSON supplémentaires (operator, phoneNumber, price, transferCode, etc.)';


--
-- Name: CurrentCycleWithdrawals; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public."CurrentCycleWithdrawals" AS
 SELECT count(*) AS totalwithdrawals,
    count(*) FILTER (WHERE (status = 'PENDING'::text)) AS pendingcount,
    count(*) FILTER (WHERE (status = 'COMPLETED'::text)) AS completedcount,
    count(*) FILTER (WHERE (status = 'FAILED'::text)) AS failedcount,
    COALESCE(sum(amount), (0)::bigint) AS totalamount,
    COALESCE(sum(amount) FILTER (WHERE (status = 'PENDING'::text)), (0)::bigint) AS pendingamount,
    COALESCE(sum(amount) FILTER (WHERE (status = 'COMPLETED'::text)), (0)::bigint) AS completedamount,
    COALESCE(avg(amount) FILTER (WHERE (status = 'COMPLETED'::text)), (0)::numeric) AS averageamount
   FROM public."Withdrawal"
  WHERE ((EXTRACT(month FROM "createdAt") = EXTRACT(month FROM now())) AND (EXTRACT(year FROM "createdAt") = EXTRACT(year FROM now())));


--
-- Name: DailyActivity; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."DailyActivity" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    "userId" text NOT NULL,
    date date DEFAULT CURRENT_DATE NOT NULL,
    type text DEFAULT 'LOGIN'::text NOT NULL,
    metadata jsonb,
    "createdAt" timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE "DailyActivity"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public."DailyActivity" IS 'Enregistre une activité utilisateur par jour. Sert au calcul du streak quotidien.';


--
-- Name: COLUMN "DailyActivity".date; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."DailyActivity".date IS 'Jour de l''activité (date only). Une seule entrée par (userId, date, type).';


--
-- Name: DirectCorrectionPool; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."DirectCorrectionPool" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "subjectId" text NOT NULL,
    content jsonb NOT NULL,
    "generatedByUserId" text NOT NULL,
    "timesServed" integer DEFAULT 0 NOT NULL,
    model text,
    "tokensIn" integer DEFAULT 0,
    "tokensOut" integer DEFAULT 0,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: DirectCorrectionSeen; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."DirectCorrectionSeen" (
    "userId" text NOT NULL,
    "poolId" uuid NOT NULL,
    "seenAt" timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: EmailVerification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."EmailVerification" (
    id text NOT NULL,
    email text NOT NULL,
    token text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    used boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: ExamenBlanc; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ExamenBlanc" (
    id text NOT NULL,
    "userId" text NOT NULL,
    titre text NOT NULL,
    "typeExamen" text NOT NULL,
    matiere text NOT NULL,
    annee text NOT NULL,
    "dureeSecondes" integer NOT NULL,
    "startedAt" timestamp(3) without time zone,
    "submittedAt" timestamp(3) without time zone,
    score double precision,
    "scoreMax" double precision,
    percentile double precision,
    status public."ExamenStatus" DEFAULT 'NOT_STARTED'::public."ExamenStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "subjectId" text
);


--
-- Name: MerchantPhone; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."MerchantPhone" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    operator text NOT NULL,
    phone text NOT NULL,
    label text,
    "isActive" boolean DEFAULT true,
    "isDefault" boolean DEFAULT false,
    "createdAt" timestamp with time zone DEFAULT now(),
    "updatedAt" timestamp with time zone DEFAULT now(),
    CONSTRAINT "MerchantPhone_operator_check" CHECK ((operator = ANY (ARRAY['mvola'::text, 'orange'::text, 'airtel'::text])))
);


--
-- Name: TABLE "MerchantPhone"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public."MerchantPhone" IS 'Numéros de téléphone pour la réception des paiements Mobile Money';


--
-- Name: COLUMN "MerchantPhone".operator; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."MerchantPhone".operator IS 'Opérateur mobile: mvola, orange, airtel';


--
-- Name: Notification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    body text,
    link text,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "isDismissed" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "readAt" timestamp with time zone
);


--
-- Name: TABLE "Notification"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public."Notification" IS 'Notifications applicatives unifiées (révision sujet, paiement, candidature…). Le centre de notifications utilisateur fusionne cette table avec les CreditTransaction marquées non-dismiss.';


--
-- Name: PasswordReset; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PasswordReset" (
    id text NOT NULL,
    email text NOT NULL,
    token text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    used boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Purchase; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Purchase" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "subjectId" text,
    "paymentMethod" text,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "amountAr" integer NOT NULL,
    CONSTRAINT check_amount_ar_positive CHECK (("amountAr" >= 0))
);


--
-- Name: COLUMN "Purchase"."amountAr"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."Purchase"."amountAr" IS 'Montant payé en Ariary';


--
-- Name: QuestionExamen; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."QuestionExamen" (
    id text NOT NULL,
    "examenId" text NOT NULL,
    numero integer NOT NULL,
    texte text NOT NULL,
    type text DEFAULT 'réponse'::text NOT NULL,
    options jsonb,
    points integer DEFAULT 5 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: ReferralCommission; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ReferralCommission" (
    id text NOT NULL,
    "referrerId" text,
    "referredId" text,
    "arAmount" integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'PENDING'::text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now()
);


--
-- Name: COLUMN "ReferralCommission"."arAmount"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."ReferralCommission"."arAmount" IS 'Commission en Ariary';


--
-- Name: Subject; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Subject" (
    id text NOT NULL,
    titre text NOT NULL,
    type public."ExamenType" NOT NULL,
    matiere text NOT NULL,
    annee text NOT NULL,
    serie text,
    description text,
    pages integer NOT NULL,
    difficulte public."Difficulte" DEFAULT 'MOYEN'::public."Difficulte" NOT NULL,
    langue public."Langue" DEFAULT 'FRANCAIS'::public."Langue" NOT NULL,
    format public."Format" DEFAULT 'PDF'::public."Format" NOT NULL,
    badge public."Badge" DEFAULT 'AI'::public."Badge" NOT NULL,
    glyph text DEFAULT '∑'::text NOT NULL,
    featured boolean DEFAULT false NOT NULL,
    rating double precision DEFAULT 0 NOT NULL,
    "reviewsCount" integer DEFAULT 0 NOT NULL,
    "hasCorrectionIa" boolean DEFAULT false NOT NULL,
    "hasCorrectionProf" boolean DEFAULT false NOT NULL,
    "authorId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status text DEFAULT 'PUBLISHED'::text NOT NULL,
    "downloadCount" integer DEFAULT 0 NOT NULL,
    duree text,
    coefficient integer,
    filiere text,
    niveau text,
    "examType" text,
    "anneeScolaire" text,
    "dateOfficielle" text,
    "bepcOption" text,
    "baccType" text,
    "concoursType" text,
    etablissement text,
    semestre text,
    "customMeta" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "submissionId" text,
    content jsonb,
    "contentType" text,
    tags text[] DEFAULT '{}'::text[] NOT NULL,
    "prixMode" text,
    visibilite text,
    "reviewerId" text,
    "publishedAt" timestamp with time zone,
    prix integer DEFAULT 0 NOT NULL,
    CONSTRAINT check_prix_positive CHECK ((prix >= 0))
);


--
-- Name: COLUMN "Subject"."examType"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."Subject"."examType" IS 'Type d''examen (CEPE | BEPC | BACC | Concours | Etablissement | Autre)';


--
-- Name: COLUMN "Subject"."anneeScolaire"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."Subject"."anneeScolaire" IS 'Année scolaire ou année du concours (ex: "2010-2011")';


--
-- Name: COLUMN "Subject"."dateOfficielle"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."Subject"."dateOfficielle" IS 'Date officielle de l''épreuve (texte libre)';


--
-- Name: COLUMN "Subject"."customMeta"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."Subject"."customMeta" IS 'Métadonnées libres saisies par le contributeur [{id,label,value}]';


--
-- Name: COLUMN "Subject"."submissionId"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."Subject"."submissionId" IS 'Soumission contributeur d''origine (lien historique)';


--
-- Name: COLUMN "Subject".prix; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."Subject".prix IS 'Prix en Ariary (unique devise)';


--
-- Name: SubjectDownload; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SubjectDownload" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    "userId" text NOT NULL,
    "subjectId" text NOT NULL,
    "watermarkCode" character varying(12) NOT NULL,
    "ipAddress" character varying(64),
    "userAgent" text,
    "downloadedAt" timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE "SubjectDownload"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public."SubjectDownload" IS 'Historique des téléchargements PDF de sujets — alimente la traçabilité du filigrane.';


--
-- Name: COLUMN "SubjectDownload"."watermarkCode"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."SubjectDownload"."watermarkCode" IS 'Code court visible sur le PDF (ex: A4F2-9C71). Recherche rapide depuis l''admin.';


--
-- Name: SubjectImage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SubjectImage" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    "submissionId" text NOT NULL,
    "authorId" text NOT NULL,
    url text NOT NULL,
    filename text NOT NULL,
    "mimeType" text DEFAULT 'image/jpeg'::text NOT NULL,
    size integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE "SubjectImage"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public."SubjectImage" IS 'Images uploadées vers Vercel Blob pour chaque soumission. Supprimées en cascade quand le brouillon est supprimé.';


--
-- Name: SubjectLog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SubjectLog" (
    id text NOT NULL,
    "subjectId" text NOT NULL,
    "userId" text NOT NULL,
    action text NOT NULL,
    "oldStatus" text,
    "newStatus" text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: SubjectSubmission; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SubjectSubmission" (
    id text NOT NULL,
    title text DEFAULT ''::text NOT NULL,
    matiere text DEFAULT ''::text NOT NULL,
    niveau text DEFAULT ''::text NOT NULL,
    serie text,
    annee integer,
    duree text,
    coefficient integer,
    "contentType" text DEFAULT 'sujet_seul'::text NOT NULL,
    content jsonb DEFAULT '{}'::jsonb NOT NULL,
    tags text[] DEFAULT '{}'::text[] NOT NULL,
    prix integer DEFAULT 0 NOT NULL,
    "prixMode" text DEFAULT 'forfait'::text NOT NULL,
    visibilite text DEFAULT 'public'::text NOT NULL,
    status text DEFAULT 'DRAFT'::text NOT NULL,
    "examType" text,
    "bepcOption" text,
    "baccType" text,
    "concoursType" text,
    etablissement text,
    semestre text,
    filiere text,
    "anneeScolaire" text,
    "dateOfficielle" text,
    "customMeta" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "authorId" text NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    notes text,
    "reviewerId" text,
    "validatedAt" timestamp with time zone,
    "reviewedAt" timestamp with time zone,
    pages integer,
    difficulte text,
    description text
);


--
-- Name: TABLE "SubjectSubmission"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public."SubjectSubmission" IS 'Brouillons et soumissions de sujets contributeurs. status: DRAFT → SUBMITTED → VERIFIED → VALIDATED → PUBLISHED | REJECTED';


--
-- Name: COLUMN "SubjectSubmission".content; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."SubjectSubmission".content IS 'JSON Tiptap (editor.getJSON()). Blocs : partie, exercice, question, annotation, formula (KaTeX), schema (image Vercel Blob).';


--
-- Name: COLUMN "SubjectSubmission".prix; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."SubjectSubmission".prix IS 'Prix en Ariary (unique devise)';


--
-- Name: COLUMN "SubjectSubmission".notes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."SubjectSubmission".notes IS 'Notes de modération, motifs de refus ou commentaires validation';


--
-- Name: COLUMN "SubjectSubmission"."reviewerId"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."SubjectSubmission"."reviewerId" IS 'ID de l''admin qui a validé/refusé la soumission';


--
-- Name: COLUMN "SubjectSubmission"."validatedAt"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."SubjectSubmission"."validatedAt" IS 'Date de validation et publication';


--
-- Name: COLUMN "SubjectSubmission"."reviewedAt"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."SubjectSubmission"."reviewedAt" IS 'Date de revue (refus ou demande de révision)';


--
-- Name: COLUMN "SubjectSubmission".pages; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."SubjectSubmission".pages IS 'Nombre de pages du sujet (pour validation)';


--
-- Name: COLUMN "SubjectSubmission".difficulte; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."SubjectSubmission".difficulte IS 'Niveau de difficulte : FACILE | MOYEN | DIFFICILE';


--
-- Name: COLUMN "SubjectSubmission".description; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."SubjectSubmission".description IS 'Description du sujet pour le catalogue';


--
-- Name: SystemSetting; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SystemSetting" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    type text DEFAULT 'string'::text NOT NULL,
    label text,
    description text,
    category text DEFAULT 'general'::text NOT NULL,
    "isEditable" boolean DEFAULT true,
    "updatedAt" timestamp with time zone DEFAULT now(),
    CONSTRAINT "SystemSetting_type_check" CHECK ((type = ANY (ARRAY['string'::text, 'number'::text, 'boolean'::text, 'json'::text])))
);


--
-- Name: TABLE "SystemSetting"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public."SystemSetting" IS 'Paramètres système configurables de l''application';


--
-- Name: COLUMN "SystemSetting".key; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."SystemSetting".key IS 'Clé unique du paramètre';


--
-- Name: COLUMN "SystemSetting".value; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."SystemSetting".value IS 'Valeur du paramètre (stockée en TEXT, type indiqué par colonne type)';


--
-- Name: COLUMN "SystemSetting".type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."SystemSetting".type IS 'Type de la valeur: string, number, boolean, json';


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    prenom text NOT NULL,
    nom text,
    role public."Role" DEFAULT 'ETUDIANT'::public."Role" NOT NULL,
    phone text,
    "phoneVerified" boolean DEFAULT false NOT NULL,
    "schoolLevel" text,
    "emailVerified" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userType" public."UserType" DEFAULT 'ETUDIANT'::public."UserType",
    "customUserType" text,
    etablissement text,
    "educationLevel" public."EducationLevel",
    "gradeLevel" public."GradeLevel",
    filiere text,
    age integer,
    "dateNaissance" date,
    region text,
    district text,
    preferences jsonb DEFAULT '{}'::jsonb,
    bio text,
    "matieresPreferees" text[],
    "objectifsEtude" text[],
    "profilePublic" boolean DEFAULT true,
    "showEmail" boolean DEFAULT false,
    "showPhone" boolean DEFAULT false,
    "showEtablissement" boolean DEFAULT true,
    "notifCorrections" boolean DEFAULT true,
    "notifSujets" boolean DEFAULT true,
    "notifPromos" boolean DEFAULT false,
    "notifRappels" boolean DEFAULT true,
    "birthDate" text,
    "nomComplet" text,
    pseudo text,
    "profilePicture" text,
    "defaultOperator" text DEFAULT 'MVOLA'::text,
    "securityTwoFactorEnabled" boolean DEFAULT false NOT NULL,
    "securityLoginAlertEnabled" boolean DEFAULT true NOT NULL,
    "securityUnknownDeviceBlock" boolean DEFAULT false NOT NULL,
    "securityRecoveryEmailEnabled" boolean DEFAULT true NOT NULL,
    "securitySessionTimeoutMinutes" integer DEFAULT 120 NOT NULL,
    "securitySettingsUpdatedAt" timestamp with time zone,
    "referralCode" text,
    "referredByUserId" text,
    "lyceeType" text,
    "balanceAr" integer DEFAULT 0 NOT NULL,
    CONSTRAINT "User_securitySessionTimeoutMinutes_check" CHECK ((("securitySessionTimeoutMinutes" >= 15) AND ("securitySessionTimeoutMinutes" <= 1440))),
    CONSTRAINT check_balance_ar_positive CHECK (("balanceAr" >= 0)),
    CONSTRAINT user_balance_ar_positive CHECK (("balanceAr" >= 0))
);


--
-- Name: COLUMN "User".prenom; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."User".prenom IS 'Prénom de l''utilisateur';


--
-- Name: COLUMN "User".nom; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."User".nom IS 'Nom de famille de l''utilisateur';


--
-- Name: COLUMN "User"."userType"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."User"."userType" IS 'Type d''utilisateur prédéfini';


--
-- Name: COLUMN "User"."customUserType"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."User"."customUserType" IS 'Type personnalisé quand AUTRE est sélectionné';


--
-- Name: COLUMN "User".etablissement; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."User".etablissement IS 'Nom de l''établissement scolaire/professionnel';


--
-- Name: COLUMN "User"."educationLevel"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."User"."educationLevel" IS 'Niveau d''éducation principal';


--
-- Name: COLUMN "User"."gradeLevel"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."User"."gradeLevel" IS 'Classe/année spécifique';


--
-- Name: COLUMN "User".filiere; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."User".filiere IS 'Filière d''études (université ou technique)';


--
-- Name: COLUMN "User".age; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."User".age IS 'Âge de l''utilisateur';


--
-- Name: COLUMN "User"."dateNaissance"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."User"."dateNaissance" IS 'Date de naissance pour calcul automatique de l''âge';


--
-- Name: COLUMN "User".region; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."User".region IS 'Région de Madagascar (23 régions)';


--
-- Name: COLUMN "User".district; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."User".district IS 'District correspondant à la région';


--
-- Name: COLUMN "User".preferences; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."User".preferences IS 'Préférences utilisateur au format JSON';


--
-- Name: COLUMN "User".bio; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."User".bio IS 'Biographie/description personnelle';


--
-- Name: COLUMN "User"."matieresPreferees"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."User"."matieresPreferees" IS 'Liste des matières préférées pour recommandations';


--
-- Name: COLUMN "User"."objectifsEtude"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."User"."objectifsEtude" IS 'Objectifs d''apprentissage personnalisés';


--
-- Name: COLUMN "User"."profilePublic"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."User"."profilePublic" IS 'Visibilité du profil public';


--
-- Name: COLUMN "User"."showEmail"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."User"."showEmail" IS 'Afficher email dans profil public';


--
-- Name: COLUMN "User"."showPhone"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."User"."showPhone" IS 'Afficher téléphone dans profil public';


--
-- Name: COLUMN "User"."showEtablissement"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."User"."showEtablissement" IS 'Afficher établissement dans profil public';


--
-- Name: COLUMN "User"."notifCorrections"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."User"."notifCorrections" IS 'Notifications pour nouvelles corrections IA';


--
-- Name: COLUMN "User"."notifSujets"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."User"."notifSujets" IS 'Notifications pour nouveaux sujets';


--
-- Name: COLUMN "User"."notifPromos"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."User"."notifPromos" IS 'Notifications pour offres promotionnelles';


--
-- Name: COLUMN "User"."notifRappels"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."User"."notifRappels" IS 'Notifications de rappels d''étude';


--
-- Name: COLUMN "User"."birthDate"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."User"."birthDate" IS 'Date de naissance au format ISO (YYYY-MM-DD)';


--
-- Name: COLUMN "User"."nomComplet"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."User"."nomComplet" IS 'Nom complet (prénom + nom) - Peut être généré automatiquement';


--
-- Name: COLUMN "User".pseudo; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."User".pseudo IS 'Pseudonyme pour l''affichage dans l''interface';


--
-- Name: COLUMN "User"."profilePicture"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."User"."profilePicture" IS 'URL de l''avatar utilisateur (stocké sur Vercel Blob)';


--
-- Name: COLUMN "User"."defaultOperator"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."User"."defaultOperator" IS 'Opérateur de paiement par défaut (MVOLA, ORANGE, AIRTEL)';


--
-- Name: COLUMN "User"."securityTwoFactorEnabled"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."User"."securityTwoFactorEnabled" IS 'Authentification à deux facteurs (2FA)';


--
-- Name: COLUMN "User"."securityLoginAlertEnabled"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."User"."securityLoginAlertEnabled" IS 'Alertes de connexion par email';


--
-- Name: COLUMN "User"."securityUnknownDeviceBlock"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."User"."securityUnknownDeviceBlock" IS 'Blocage des appareils inconnus';


--
-- Name: COLUMN "User"."securityRecoveryEmailEnabled"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."User"."securityRecoveryEmailEnabled" IS 'Récupération de compte par email';


--
-- Name: COLUMN "User"."securitySessionTimeoutMinutes"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."User"."securitySessionTimeoutMinutes" IS 'Délai d''expiration de session en minutes';


--
-- Name: COLUMN "User"."securitySettingsUpdatedAt"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."User"."securitySettingsUpdatedAt" IS 'Date de dernière mise à jour des paramètres de sécurité';


--
-- Name: COLUMN "User"."referralCode"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."User"."referralCode" IS 'Code de parrainage unique partageable';


--
-- Name: COLUMN "User"."referredByUserId"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."User"."referredByUserId" IS 'Parrain ayant invité l utilisateur';


--
-- Name: COLUMN "User"."lyceeType"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."User"."lyceeType" IS 'Type de lycée: GENERALE ou TECHNIQUE';


--
-- Name: COLUMN "User"."balanceAr"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."User"."balanceAr" IS 'Solde en Ariary (ancien système de crédits supprimé)';


--
-- Name: TopWithdrawalsContributors; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public."TopWithdrawalsContributors" AS
 SELECT u.id,
    u.nom,
    u.email,
    u.phone,
    u."balanceAr",
    count(DISTINCT s.id) AS "subjectsCount",
    count(DISTINCT p.id) AS "purchasesCount"
   FROM ((public."User" u
     LEFT JOIN public."Subject" s ON ((s."authorId" = u.id)))
     LEFT JOIN public."Purchase" p ON ((p."subjectId" = s.id)))
  WHERE (u.role = 'CONTRIBUTEUR'::public."Role")
  GROUP BY u.id, u.nom, u.email, u.phone, u."balanceAr"
  ORDER BY u."balanceAr" DESC NULLS LAST;


--
-- Name: Transaction; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Transaction" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "amountAr" integer NOT NULL,
    type character varying(32) NOT NULL,
    status character varying(32) DEFAULT 'PENDING'::character varying NOT NULL,
    description text,
    "phoneNumber" text,
    "paymentMethod" text,
    "senderCode" text,
    "validatedAt" timestamp with time zone,
    "validatedBy" text,
    "rejectionReason" text,
    metadata jsonb DEFAULT '{}'::jsonb,
    "createdAt" timestamp with time zone DEFAULT now(),
    "isRead" boolean DEFAULT false NOT NULL,
    "isDismissed" boolean DEFAULT false NOT NULL
);


--
-- Name: TABLE "Transaction"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public."Transaction" IS 'Transactions financières en Ariary. Remplace CreditTransaction (à supprimer en Phase 3).';


--
-- Name: UserPhone; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."UserPhone" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    "userId" text NOT NULL,
    phone text NOT NULL,
    provider text NOT NULL,
    label text,
    "isDefault" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: UserReferral; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."UserReferral" (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    "referrerUserId" text NOT NULL,
    "referredUserId" text NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "referrerBonusGrantedAt" timestamp with time zone,
    "referredBonusGrantedAt" timestamp with time zone,
    "activatedAt" timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "referrerBonusAr" integer DEFAULT 0 NOT NULL,
    "referredBonusAr" integer DEFAULT 0 NOT NULL,
    CONSTRAINT "UserReferral_referrer_not_referred" CHECK (("referrerUserId" <> "referredUserId")),
    CONSTRAINT "UserReferral_status_check" CHECK ((status = ANY (ARRAY['PENDING'::text, 'COMPLETED'::text, 'CANCELED'::text])))
);


--
-- Name: TABLE "UserReferral"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public."UserReferral" IS 'Suivi des parrainages entre utilisateurs';


--
-- Name: COLUMN "UserReferral"."referrerBonusAr"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."UserReferral"."referrerBonusAr" IS 'Bonus Ariary offert au parrain';


--
-- Name: COLUMN "UserReferral"."referredBonusAr"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."UserReferral"."referredBonusAr" IS 'Bonus Ariary offert au filleul';


--
-- Name: Wishlist; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Wishlist" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "subjectId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: WithdrawalStats; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public."WithdrawalStats" AS
 SELECT "userId",
    count(*) AS totalwithdrawals,
    sum(
        CASE
            WHEN (status = 'PENDING'::text) THEN amount
            ELSE 0
        END) AS pendingamount,
    sum(
        CASE
            WHEN (status = 'COMPLETED'::text) THEN amount
            ELSE 0
        END) AS completedamount,
    sum(
        CASE
            WHEN (status = 'FAILED'::text) THEN amount
            ELSE 0
        END) AS failedamount,
    sum(amount) AS totalamount
   FROM public."Withdrawal"
  GROUP BY "userId";


--
-- Name: WithdrawalsByOperator; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public."WithdrawalsByOperator" AS
 SELECT "paymentMethod" AS operator,
    EXTRACT(year FROM "createdAt") AS year,
    EXTRACT(month FROM "createdAt") AS month,
    count(*) AS totalwithdrawals,
    count(*) FILTER (WHERE (status = 'COMPLETED'::text)) AS completedwithdrawals,
    COALESCE(sum(amount), (0)::bigint) AS totalamount,
    COALESCE(sum(amount) FILTER (WHERE (status = 'COMPLETED'::text)), (0)::bigint) AS completedamount,
    COALESCE(avg(amount), (0)::numeric) AS averageamount
   FROM public."Withdrawal"
  GROUP BY "paymentMethod", (EXTRACT(year FROM "createdAt")), (EXTRACT(month FROM "createdAt"))
  ORDER BY (EXTRACT(year FROM "createdAt")) DESC, (EXTRACT(month FROM "createdAt")) DESC, "paymentMethod";


--
-- Name: testimonials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.testimonials (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    role text NOT NULL,
    quote text NOT NULL,
    avatar_initial character(1),
    rating smallint DEFAULT 5,
    is_example boolean DEFAULT false,
    is_featured boolean DEFAULT false,
    is_published boolean DEFAULT true,
    display_order smallint DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT testimonials_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- Name: TABLE testimonials; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.testimonials IS 'Témoignages affichés sur la landing page. Les entrées marquées is_example sont des exemples illustratifs.';


--
-- Name: COLUMN testimonials.is_example; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.testimonials.is_example IS 'true = témoignage illustratif (pas un vrai utilisateur vérifié)';


--
-- Name: v_submission_summary; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.v_submission_summary AS
 SELECT s.id,
    s.title,
    s.matiere,
    s.niveau,
    s.serie,
    s.annee,
    s.status,
    s.prix,
    s."prixMode",
    s.visibilite,
    s."contentType",
    s."createdAt",
    s."updatedAt",
    ((u.prenom || ' '::text) || u.nom) AS author_name,
    u.email AS author_email,
    COALESCE(jsonb_array_length((s.content -> 'content'::text)), 0) AS block_count,
    ( SELECT count(*) AS count
           FROM public."SubjectImage" i
          WHERE (i."submissionId" = s.id)) AS image_count
   FROM (public."SubjectSubmission" s
     JOIN public."User" u ON ((u.id = s."authorId")));


--
-- Name: v_user_financial_summary; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.v_user_financial_summary AS
 SELECT u.id,
    u.email,
    u."balanceAr",
    COALESCE(sum(p."amountAr"), (0)::bigint) AS total_spent_ar,
    count(p.id) AS purchases_count,
    COALESCE(sum(rc."arAmount"), (0)::bigint) AS total_commissions_ar
   FROM ((public."User" u
     LEFT JOIN public."Purchase" p ON ((p."userId" = u.id)))
     LEFT JOIN public."ReferralCommission" rc ON ((rc."referrerId" = u.id)))
  GROUP BY u.id, u.email, u."balanceAr";


--
-- Name: VIEW v_user_financial_summary; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON VIEW public.v_user_financial_summary IS 'Vue récapitulative financière par utilisateur (tous montants en Ariary)';


--
-- Name: AICorrection AICorrection_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AICorrection"
    ADD CONSTRAINT "AICorrection_pkey" PRIMARY KEY (id);


--
-- Name: AdminAuditLog AdminAuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AdminAuditLog"
    ADD CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY (id);


--
-- Name: BlogCategory BlogCategory_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BlogCategory"
    ADD CONSTRAINT "BlogCategory_name_key" UNIQUE (name);


--
-- Name: BlogCategory BlogCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BlogCategory"
    ADD CONSTRAINT "BlogCategory_pkey" PRIMARY KEY (id);


--
-- Name: BlogCategory BlogCategory_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BlogCategory"
    ADD CONSTRAINT "BlogCategory_slug_key" UNIQUE (slug);


--
-- Name: BlogComment BlogComment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BlogComment"
    ADD CONSTRAINT "BlogComment_pkey" PRIMARY KEY (id);


--
-- Name: BlogPost BlogPost_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BlogPost"
    ADD CONSTRAINT "BlogPost_pkey" PRIMARY KEY (id);


--
-- Name: BlogPost BlogPost_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BlogPost"
    ADD CONSTRAINT "BlogPost_slug_key" UNIQUE (slug);


--
-- Name: ContributorApplication ContributorApplication_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContributorApplication"
    ADD CONSTRAINT "ContributorApplication_pkey" PRIMARY KEY (id);


--
-- Name: ContributorApplication ContributorApplication_userId_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContributorApplication"
    ADD CONSTRAINT "ContributorApplication_userId_key" UNIQUE ("userId");


--
-- Name: CreditPack CreditPack_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CreditPack"
    ADD CONSTRAINT "CreditPack_pkey" PRIMARY KEY (id);


--
-- Name: CreditTransaction CreditTransaction_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CreditTransaction"
    ADD CONSTRAINT "CreditTransaction_pkey" PRIMARY KEY (id);


--
-- Name: DailyActivity DailyActivity_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DailyActivity"
    ADD CONSTRAINT "DailyActivity_pkey" PRIMARY KEY (id);


--
-- Name: DirectCorrectionPool DirectCorrectionPool_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DirectCorrectionPool"
    ADD CONSTRAINT "DirectCorrectionPool_pkey" PRIMARY KEY (id);


--
-- Name: DirectCorrectionSeen DirectCorrectionSeen_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DirectCorrectionSeen"
    ADD CONSTRAINT "DirectCorrectionSeen_pkey" PRIMARY KEY ("userId", "poolId");


--
-- Name: EmailVerification EmailVerification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EmailVerification"
    ADD CONSTRAINT "EmailVerification_pkey" PRIMARY KEY (id);


--
-- Name: EmailVerification EmailVerification_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EmailVerification"
    ADD CONSTRAINT "EmailVerification_token_key" UNIQUE (token);


--
-- Name: ExamenBlanc ExamenBlanc_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ExamenBlanc"
    ADD CONSTRAINT "ExamenBlanc_pkey" PRIMARY KEY (id);


--
-- Name: MerchantPhone MerchantPhone_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MerchantPhone"
    ADD CONSTRAINT "MerchantPhone_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: PasswordReset PasswordReset_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PasswordReset"
    ADD CONSTRAINT "PasswordReset_pkey" PRIMARY KEY (id);


--
-- Name: PasswordReset PasswordReset_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PasswordReset"
    ADD CONSTRAINT "PasswordReset_token_key" UNIQUE (token);


--
-- Name: Purchase Purchase_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Purchase"
    ADD CONSTRAINT "Purchase_pkey" PRIMARY KEY (id);


--
-- Name: QuestionExamen QuestionExamen_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."QuestionExamen"
    ADD CONSTRAINT "QuestionExamen_pkey" PRIMARY KEY (id);


--
-- Name: ReferralCommission ReferralCommission_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ReferralCommission"
    ADD CONSTRAINT "ReferralCommission_pkey" PRIMARY KEY (id);


--
-- Name: SubjectDownload SubjectDownload_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SubjectDownload"
    ADD CONSTRAINT "SubjectDownload_pkey" PRIMARY KEY (id);


--
-- Name: SubjectDownload SubjectDownload_watermarkCode_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SubjectDownload"
    ADD CONSTRAINT "SubjectDownload_watermarkCode_key" UNIQUE ("watermarkCode");


--
-- Name: SubjectImage SubjectImage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SubjectImage"
    ADD CONSTRAINT "SubjectImage_pkey" PRIMARY KEY (id);


--
-- Name: SubjectImage SubjectImage_url_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SubjectImage"
    ADD CONSTRAINT "SubjectImage_url_key" UNIQUE (url);


--
-- Name: SubjectLog SubjectLog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SubjectLog"
    ADD CONSTRAINT "SubjectLog_pkey" PRIMARY KEY (id);


--
-- Name: SubjectSubmission SubjectSubmission_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SubjectSubmission"
    ADD CONSTRAINT "SubjectSubmission_pkey" PRIMARY KEY (id);


--
-- Name: Subject Subject_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Subject"
    ADD CONSTRAINT "Subject_pkey" PRIMARY KEY (id);


--
-- Name: SystemSetting SystemSetting_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SystemSetting"
    ADD CONSTRAINT "SystemSetting_key_key" UNIQUE (key);


--
-- Name: SystemSetting SystemSetting_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SystemSetting"
    ADD CONSTRAINT "SystemSetting_pkey" PRIMARY KEY (id);


--
-- Name: Transaction Transaction_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "Transaction_pkey" PRIMARY KEY (id);


--
-- Name: UserPhone UserPhone_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserPhone"
    ADD CONSTRAINT "UserPhone_pkey" PRIMARY KEY (id);


--
-- Name: UserPhone UserPhone_userId_phone_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserPhone"
    ADD CONSTRAINT "UserPhone_userId_phone_key" UNIQUE ("userId", phone);


--
-- Name: UserReferral UserReferral_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserReferral"
    ADD CONSTRAINT "UserReferral_pkey" PRIMARY KEY (id);


--
-- Name: User User_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_email_key" UNIQUE (email);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: Wishlist Wishlist_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Wishlist"
    ADD CONSTRAINT "Wishlist_pkey" PRIMARY KEY (id);


--
-- Name: Withdrawal Withdrawal_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Withdrawal"
    ADD CONSTRAINT "Withdrawal_pkey" PRIMARY KEY (id);


--
-- Name: testimonials testimonials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.testimonials
    ADD CONSTRAINT testimonials_pkey PRIMARY KEY (id);


--
-- Name: BlogPost_author_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "BlogPost_author_id_idx" ON public."BlogPost" USING btree (author_id);


--
-- Name: BlogPost_category_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "BlogPost_category_idx" ON public."BlogPost" USING btree (category);


--
-- Name: BlogPost_is_featured_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "BlogPost_is_featured_idx" ON public."BlogPost" USING btree (is_featured);


--
-- Name: BlogPost_is_published_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "BlogPost_is_published_idx" ON public."BlogPost" USING btree (is_published);


--
-- Name: BlogPost_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "BlogPost_slug_idx" ON public."BlogPost" USING btree (slug);


--
-- Name: ContributorApplication_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ContributorApplication_createdAt_idx" ON public."ContributorApplication" USING btree ("createdAt" DESC);


--
-- Name: ContributorApplication_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ContributorApplication_status_idx" ON public."ContributorApplication" USING btree (status);


--
-- Name: CreditTransaction_senderCode_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "CreditTransaction_senderCode_idx" ON public."CreditTransaction" USING btree ("senderCode");


--
-- Name: CreditTransaction_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "CreditTransaction_status_idx" ON public."CreditTransaction" USING btree (status);


--
-- Name: CreditTransaction_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "CreditTransaction_userId_idx" ON public."CreditTransaction" USING btree ("userId");


--
-- Name: CreditTransaction_userId_isDismissed_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "CreditTransaction_userId_isDismissed_idx" ON public."CreditTransaction" USING btree ("userId", "isDismissed");


--
-- Name: CreditTransaction_userId_isRead_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "CreditTransaction_userId_isRead_idx" ON public."CreditTransaction" USING btree ("userId", "isRead");


--
-- Name: DirectCorrectionPool_subjectId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "DirectCorrectionPool_subjectId_idx" ON public."DirectCorrectionPool" USING btree ("subjectId");


--
-- Name: ExamenBlanc_subjectId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ExamenBlanc_subjectId_idx" ON public."ExamenBlanc" USING btree ("subjectId");


--
-- Name: ExamenBlanc_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ExamenBlanc_userId_idx" ON public."ExamenBlanc" USING btree ("userId");


--
-- Name: Purchase_subjectId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Purchase_subjectId_idx" ON public."Purchase" USING btree ("subjectId");


--
-- Name: Purchase_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Purchase_userId_idx" ON public."Purchase" USING btree ("userId");


--
-- Name: QuestionExamen_examenId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "QuestionExamen_examenId_idx" ON public."QuestionExamen" USING btree ("examenId");


--
-- Name: SubjectLog_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SubjectLog_createdAt_idx" ON public."SubjectLog" USING btree ("createdAt");


--
-- Name: SubjectLog_subjectId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SubjectLog_subjectId_idx" ON public."SubjectLog" USING btree ("subjectId");


--
-- Name: SubjectLog_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SubjectLog_userId_idx" ON public."SubjectLog" USING btree ("userId");


--
-- Name: Subject_authorId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Subject_authorId_idx" ON public."Subject" USING btree ("authorId");


--
-- Name: Transaction_userId_isDismissed_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Transaction_userId_isDismissed_idx" ON public."Transaction" USING btree ("userId", "isDismissed") WHERE ("isDismissed" = false);


--
-- Name: Transaction_userId_isRead_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Transaction_userId_isRead_idx" ON public."Transaction" USING btree ("userId", "isRead") WHERE ("isRead" = false);


--
-- Name: UserPhone_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "UserPhone_userId_idx" ON public."UserPhone" USING btree ("userId");


--
-- Name: Wishlist_userId_subjectId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Wishlist_userId_subjectId_key" ON public."Wishlist" USING btree ("userId", "subjectId");


--
-- Name: Withdrawal_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Withdrawal_createdAt_idx" ON public."Withdrawal" USING btree ("createdAt");


--
-- Name: Withdrawal_createdAt_month_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Withdrawal_createdAt_month_idx" ON public."Withdrawal" USING btree (EXTRACT(month FROM "createdAt"), EXTRACT(year FROM "createdAt"));


--
-- Name: Withdrawal_paymentMethod_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Withdrawal_paymentMethod_idx" ON public."Withdrawal" USING btree ("paymentMethod");


--
-- Name: Withdrawal_status_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Withdrawal_status_createdAt_idx" ON public."Withdrawal" USING btree (status, "createdAt");


--
-- Name: Withdrawal_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Withdrawal_status_idx" ON public."Withdrawal" USING btree (status);


--
-- Name: Withdrawal_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Withdrawal_userId_idx" ON public."Withdrawal" USING btree ("userId");


--
-- Name: idx_admin_audit_action; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_audit_action ON public."AdminAuditLog" USING btree (action, "createdAt" DESC);


--
-- Name: idx_admin_audit_admin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_audit_admin ON public."AdminAuditLog" USING btree ("adminId", "createdAt" DESC);


--
-- Name: idx_admin_audit_target; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_audit_target ON public."AdminAuditLog" USING btree ("targetType", "targetId", "createdAt" DESC);


--
-- Name: idx_ai_correction_subject; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_correction_subject ON public."AICorrection" USING btree ("subjectId", "createdAt" DESC);


--
-- Name: idx_ai_correction_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_correction_user ON public."AICorrection" USING btree ("userId", "createdAt" DESC);


--
-- Name: idx_ai_correction_user_subject_mode; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_correction_user_subject_mode ON public."AICorrection" USING btree ("userId", "subjectId", mode, "createdAt" DESC);


--
-- Name: idx_blog_comment_approved; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_blog_comment_approved ON public."BlogComment" USING btree (is_approved);


--
-- Name: idx_blog_comment_parent; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_blog_comment_parent ON public."BlogComment" USING btree (parent_id);


--
-- Name: idx_blog_comment_post; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_blog_comment_post ON public."BlogComment" USING btree (post_id);


--
-- Name: idx_blog_comment_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_blog_comment_user ON public."BlogComment" USING btree (user_id);


--
-- Name: idx_blog_post_author; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_blog_post_author ON public."BlogPost" USING btree (author_id);


--
-- Name: idx_blog_post_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_blog_post_category ON public."BlogPost" USING btree (category);


--
-- Name: idx_blog_post_featured; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_blog_post_featured ON public."BlogPost" USING btree (is_featured);


--
-- Name: idx_blog_post_published; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_blog_post_published ON public."BlogPost" USING btree (is_published);


--
-- Name: idx_blog_post_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_blog_post_slug ON public."BlogPost" USING btree (slug);


--
-- Name: idx_credit_pack_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_credit_pack_active ON public."CreditPack" USING btree ("isActive");


--
-- Name: idx_credit_pack_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_credit_pack_order ON public."CreditPack" USING btree ("sortOrder");


--
-- Name: idx_credit_transaction_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_credit_transaction_created ON public."CreditTransaction" USING btree ("createdAt" DESC);


--
-- Name: idx_credit_transaction_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_credit_transaction_type ON public."CreditTransaction" USING btree (type);


--
-- Name: idx_credit_transaction_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_credit_transaction_user ON public."CreditTransaction" USING btree ("userId");


--
-- Name: idx_daily_activity_user_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_daily_activity_user_date ON public."DailyActivity" USING btree ("userId", date DESC);


--
-- Name: idx_daily_activity_user_date_type; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_daily_activity_user_date_type ON public."DailyActivity" USING btree ("userId", date, type);


--
-- Name: idx_merchant_phone_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_merchant_phone_active ON public."MerchantPhone" USING btree ("isActive");


--
-- Name: idx_merchant_phone_default; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_merchant_phone_default ON public."MerchantPhone" USING btree (operator) WHERE ("isDefault" = true);


--
-- Name: idx_merchant_phone_operator; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_merchant_phone_operator ON public."MerchantPhone" USING btree (operator);


--
-- Name: idx_notif_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notif_type ON public."Notification" USING btree (type, "createdAt" DESC);


--
-- Name: idx_notif_user_dismissed; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notif_user_dismissed ON public."Notification" USING btree ("userId", "isDismissed", "createdAt" DESC);


--
-- Name: idx_notif_user_unread; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notif_user_unread ON public."Notification" USING btree ("userId", "isRead") WHERE ("isDismissed" = false);


--
-- Name: idx_purchase_amount_ar; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_purchase_amount_ar ON public."Purchase" USING btree ("amountAr", "createdAt" DESC);


--
-- Name: idx_subject_download_subject; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_subject_download_subject ON public."SubjectDownload" USING btree ("subjectId", "downloadedAt" DESC);


--
-- Name: idx_subject_download_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_subject_download_user ON public."SubjectDownload" USING btree ("userId", "downloadedAt" DESC);


--
-- Name: idx_subject_download_watermark; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_subject_download_watermark ON public."SubjectDownload" USING btree ("watermarkCode");


--
-- Name: idx_subject_examtype; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_subject_examtype ON public."Subject" USING btree ("examType", "anneeScolaire");


--
-- Name: idx_subject_image_author; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_subject_image_author ON public."SubjectImage" USING btree ("authorId");


--
-- Name: idx_subject_image_submission; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_subject_image_submission ON public."SubjectImage" USING btree ("submissionId");


--
-- Name: idx_subject_submission_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_subject_submission_id ON public."Subject" USING btree ("submissionId");


--
-- Name: idx_subjectlog_subjectid; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_subjectlog_subjectid ON public."SubjectLog" USING btree ("subjectId");


--
-- Name: idx_submission_author_revision; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_submission_author_revision ON public."SubjectSubmission" USING btree ("authorId", status) WHERE (status = 'REVISION_REQUESTED'::text);


--
-- Name: idx_submission_author_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_submission_author_status ON public."SubjectSubmission" USING btree ("authorId", status, "createdAt" DESC);


--
-- Name: idx_submission_matiere_niveau; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_submission_matiere_niveau ON public."SubjectSubmission" USING btree (matiere, niveau);


--
-- Name: idx_submission_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_submission_status ON public."SubjectSubmission" USING btree (status, "createdAt" DESC);


--
-- Name: idx_submission_status_reviewer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_submission_status_reviewer ON public."SubjectSubmission" USING btree (status, "reviewerId") WHERE (status = ANY (ARRAY['SUBMITTED'::text, 'VALIDATED'::text, 'REJECTED'::text]));


--
-- Name: idx_submission_validated_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_submission_validated_at ON public."SubjectSubmission" USING btree ("validatedAt" DESC) WHERE (status = 'VALIDATED'::text);


--
-- Name: idx_system_setting_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_system_setting_category ON public."SystemSetting" USING btree (category);


--
-- Name: idx_system_setting_key; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_system_setting_key ON public."SystemSetting" USING btree (key);


--
-- Name: idx_testimonials_landing; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_testimonials_landing ON public.testimonials USING btree (is_published, display_order) WHERE (is_published = true);


--
-- Name: idx_transaction_status_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_transaction_status_created ON public."Transaction" USING btree (status, "createdAt" DESC);


--
-- Name: idx_transaction_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_transaction_type ON public."Transaction" USING btree (type, "createdAt" DESC);


--
-- Name: idx_transaction_user_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_transaction_user_created ON public."Transaction" USING btree ("userId", "createdAt" DESC);


--
-- Name: idx_transaction_user_unread; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_transaction_user_unread ON public."Transaction" USING btree ("userId", "isRead") WHERE (("isRead" = false) AND ("isDismissed" = false));


--
-- Name: idx_user_balance_ar; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_balance_ar ON public."User" USING btree ("balanceAr") WHERE ("balanceAr" > 0);


--
-- Name: idx_user_birthdate; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_birthdate ON public."User" USING btree ("birthDate");


--
-- Name: idx_user_educationLevel; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_user_educationLevel" ON public."User" USING btree ("educationLevel");


--
-- Name: idx_user_gradeLevel; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_user_gradeLevel" ON public."User" USING btree ("gradeLevel");


--
-- Name: idx_user_nom; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_nom ON public."User" USING btree (nom);


--
-- Name: idx_user_prenom; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_prenom ON public."User" USING btree (prenom);


--
-- Name: idx_user_profilepicture; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_profilepicture ON public."User" USING btree ("profilePicture");


--
-- Name: idx_user_pseudo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_pseudo ON public."User" USING btree (pseudo);


--
-- Name: idx_user_referral_code_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_user_referral_code_unique ON public."User" USING btree ("referralCode") WHERE ("referralCode" IS NOT NULL);


--
-- Name: idx_user_referral_referred_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_user_referral_referred_unique ON public."UserReferral" USING btree ("referredUserId");


--
-- Name: idx_user_referral_referrer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_referral_referrer ON public."UserReferral" USING btree ("referrerUserId", "createdAt" DESC);


--
-- Name: idx_user_referred_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_referred_by ON public."User" USING btree ("referredByUserId");


--
-- Name: idx_user_region; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_region ON public."User" USING btree (region);


--
-- Name: idx_user_security_2fa; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_security_2fa ON public."User" USING btree ("securityTwoFactorEnabled");


--
-- Name: idx_user_security_settings_updated; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_security_settings_updated ON public."User" USING btree ("securitySettingsUpdatedAt");


--
-- Name: idx_user_userType; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_user_userType" ON public."User" USING btree ("userType");


--
-- Name: SubjectSubmission set_submission_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_submission_updated_at BEFORE UPDATE ON public."SubjectSubmission" FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: UserReferral trg_user_referral_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_user_referral_updated_at BEFORE UPDATE ON public."UserReferral" FOR EACH ROW EXECUTE FUNCTION public.set_user_referral_updated_at();


--
-- Name: User update_user_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON public."User" FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: Withdrawal update_withdrawal_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_withdrawal_updated_at BEFORE UPDATE ON public."Withdrawal" FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: AICorrection AICorrection_cachedFromPoolId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AICorrection"
    ADD CONSTRAINT "AICorrection_cachedFromPoolId_fkey" FOREIGN KEY ("cachedFromPoolId") REFERENCES public."DirectCorrectionPool"(id) ON DELETE SET NULL;


--
-- Name: BlogComment BlogComment_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BlogComment"
    ADD CONSTRAINT "BlogComment_parent_id_fkey" FOREIGN KEY (parent_id) REFERENCES public."BlogComment"(id) ON DELETE CASCADE;


--
-- Name: BlogComment BlogComment_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BlogComment"
    ADD CONSTRAINT "BlogComment_post_id_fkey" FOREIGN KEY (post_id) REFERENCES public."BlogPost"(id) ON DELETE CASCADE;


--
-- Name: ContributorApplication ContributorApplication_reviewedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContributorApplication"
    ADD CONSTRAINT "ContributorApplication_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES public."User"(id) ON DELETE SET NULL;


--
-- Name: ContributorApplication ContributorApplication_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContributorApplication"
    ADD CONSTRAINT "ContributorApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- Name: CreditTransaction CreditTransaction_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CreditTransaction"
    ADD CONSTRAINT "CreditTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id);


--
-- Name: CreditTransaction CreditTransaction_validatedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CreditTransaction"
    ADD CONSTRAINT "CreditTransaction_validatedBy_fkey" FOREIGN KEY ("validatedBy") REFERENCES public."User"(id) ON DELETE SET NULL;


--
-- Name: DirectCorrectionPool DirectCorrectionPool_generatedByUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DirectCorrectionPool"
    ADD CONSTRAINT "DirectCorrectionPool_generatedByUserId_fkey" FOREIGN KEY ("generatedByUserId") REFERENCES public."User"(id);


--
-- Name: DirectCorrectionPool DirectCorrectionPool_subjectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DirectCorrectionPool"
    ADD CONSTRAINT "DirectCorrectionPool_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES public."Subject"(id) ON DELETE CASCADE;


--
-- Name: DirectCorrectionSeen DirectCorrectionSeen_poolId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DirectCorrectionSeen"
    ADD CONSTRAINT "DirectCorrectionSeen_poolId_fkey" FOREIGN KEY ("poolId") REFERENCES public."DirectCorrectionPool"(id) ON DELETE CASCADE;


--
-- Name: DirectCorrectionSeen DirectCorrectionSeen_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DirectCorrectionSeen"
    ADD CONSTRAINT "DirectCorrectionSeen_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- Name: ExamenBlanc ExamenBlanc_subjectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ExamenBlanc"
    ADD CONSTRAINT "ExamenBlanc_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES public."Subject"(id) ON DELETE SET NULL;


--
-- Name: ExamenBlanc ExamenBlanc_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ExamenBlanc"
    ADD CONSTRAINT "ExamenBlanc_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id);


--
-- Name: Notification Notification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- Name: Purchase Purchase_subjectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Purchase"
    ADD CONSTRAINT "Purchase_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES public."Subject"(id);


--
-- Name: Purchase Purchase_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Purchase"
    ADD CONSTRAINT "Purchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id);


--
-- Name: QuestionExamen QuestionExamen_examenId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."QuestionExamen"
    ADD CONSTRAINT "QuestionExamen_examenId_fkey" FOREIGN KEY ("examenId") REFERENCES public."ExamenBlanc"(id) ON DELETE CASCADE;


--
-- Name: ReferralCommission ReferralCommission_referredId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ReferralCommission"
    ADD CONSTRAINT "ReferralCommission_referredId_fkey" FOREIGN KEY ("referredId") REFERENCES public."User"(id);


--
-- Name: ReferralCommission ReferralCommission_referrerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ReferralCommission"
    ADD CONSTRAINT "ReferralCommission_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES public."User"(id);


--
-- Name: SubjectImage SubjectImage_submissionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SubjectImage"
    ADD CONSTRAINT "SubjectImage_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES public."SubjectSubmission"(id) ON DELETE CASCADE;


--
-- Name: SubjectLog SubjectLog_subjectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SubjectLog"
    ADD CONSTRAINT "SubjectLog_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES public."Subject"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SubjectLog SubjectLog_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SubjectLog"
    ADD CONSTRAINT "SubjectLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SubjectSubmission SubjectSubmission_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SubjectSubmission"
    ADD CONSTRAINT "SubjectSubmission_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- Name: SubjectSubmission SubjectSubmission_reviewerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SubjectSubmission"
    ADD CONSTRAINT "SubjectSubmission_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES public."User"(id) ON DELETE SET NULL;


--
-- Name: Subject Subject_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Subject"
    ADD CONSTRAINT "Subject_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id);


--
-- Name: Subject Subject_reviewerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Subject"
    ADD CONSTRAINT "Subject_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES public."User"(id) ON DELETE SET NULL;


--
-- Name: Subject Subject_submissionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Subject"
    ADD CONSTRAINT "Subject_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES public."SubjectSubmission"(id) ON DELETE SET NULL;


--
-- Name: UserPhone UserPhone_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserPhone"
    ADD CONSTRAINT "UserPhone_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- Name: UserReferral UserReferral_referredUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserReferral"
    ADD CONSTRAINT "UserReferral_referredUserId_fkey" FOREIGN KEY ("referredUserId") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- Name: UserReferral UserReferral_referrerUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserReferral"
    ADD CONSTRAINT "UserReferral_referrerUserId_fkey" FOREIGN KEY ("referrerUserId") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- Name: User User_referredByUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_referredByUserId_fkey" FOREIGN KEY ("referredByUserId") REFERENCES public."User"(id) ON DELETE SET NULL;


--
-- Name: Wishlist Wishlist_subjectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Wishlist"
    ADD CONSTRAINT "Wishlist_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES public."Subject"(id) ON DELETE CASCADE;


--
-- Name: Wishlist Wishlist_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Wishlist"
    ADD CONSTRAINT "Wishlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- Name: Withdrawal Withdrawal_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Withdrawal"
    ADD CONSTRAINT "Withdrawal_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- Name: AdminAuditLog fk_admin_audit_log_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AdminAuditLog"
    ADD CONSTRAINT fk_admin_audit_log_user FOREIGN KEY ("adminId") REFERENCES public."User"(id) ON DELETE SET NULL;


--
-- Name: AICorrection fk_ai_correction_subject; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AICorrection"
    ADD CONSTRAINT fk_ai_correction_subject FOREIGN KEY ("subjectId") REFERENCES public."Subject"(id) ON DELETE CASCADE;


--
-- Name: AICorrection fk_ai_correction_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AICorrection"
    ADD CONSTRAINT fk_ai_correction_user FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- Name: DailyActivity fk_daily_activity_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DailyActivity"
    ADD CONSTRAINT fk_daily_activity_user FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- Name: SubjectDownload fk_subject_download_subject; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SubjectDownload"
    ADD CONSTRAINT fk_subject_download_subject FOREIGN KEY ("subjectId") REFERENCES public."Subject"(id) ON DELETE CASCADE;


--
-- Name: SubjectDownload fk_subject_download_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SubjectDownload"
    ADD CONSTRAINT fk_subject_download_user FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- Name: Transaction fk_transaction_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT fk_transaction_user FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- Name: BlogPost; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."BlogPost" ENABLE ROW LEVEL SECURITY;

--
-- Name: BlogPost BlogPost_delete_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "BlogPost_delete_admin" ON public."BlogPost" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public."User" u
  WHERE ((u.id = (auth.uid())::text) AND (u.role = 'ADMIN'::public."Role")))));


--
-- Name: BlogPost BlogPost_insert_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "BlogPost_insert_admin" ON public."BlogPost" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public."User" u
  WHERE ((u.id = (auth.uid())::text) AND (u.role = 'ADMIN'::public."Role")))));


--
-- Name: BlogPost BlogPost_read_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "BlogPost_read_admin" ON public."BlogPost" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public."User" u
  WHERE ((u.id = (auth.uid())::text) AND (u.role = 'ADMIN'::public."Role")))));


--
-- Name: BlogPost BlogPost_read_published; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "BlogPost_read_published" ON public."BlogPost" FOR SELECT USING ((is_published = true));


--
-- Name: BlogPost BlogPost_update_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "BlogPost_update_admin" ON public."BlogPost" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public."User" u
  WHERE ((u.id = (auth.uid())::text) AND (u.role = 'ADMIN'::public."Role"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public."User" u
  WHERE ((u.id = (auth.uid())::text) AND (u.role = 'ADMIN'::public."Role")))));


--
-- Name: CreditTransaction; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."CreditTransaction" ENABLE ROW LEVEL SECURITY;

--
-- Name: ExamenBlanc; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."ExamenBlanc" ENABLE ROW LEVEL SECURITY;

--
-- Name: Subject Les sujets sont visibles par tous; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Les sujets sont visibles par tous" ON public."Subject" FOR SELECT USING (true);


--
-- Name: Wishlist Les utilisateurs ajoutent à leur propre wishlist; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Les utilisateurs ajoutent à leur propre wishlist" ON public."Wishlist" FOR INSERT WITH CHECK (((auth.uid())::text = "userId"));


--
-- Name: ExamenBlanc Les utilisateurs créent leurs propres examens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Les utilisateurs créent leurs propres examens" ON public."ExamenBlanc" FOR INSERT WITH CHECK (((auth.uid())::text = "userId"));


--
-- Name: User Les utilisateurs modifient leur propre profil; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Les utilisateurs modifient leur propre profil" ON public."User" FOR UPDATE USING (((auth.uid())::text = id));


--
-- Name: Wishlist Les utilisateurs suppriment de leur propre wishlist; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Les utilisateurs suppriment de leur propre wishlist" ON public."Wishlist" FOR DELETE USING (((auth.uid())::text = "userId"));


--
-- Name: User Les utilisateurs voient leur propre profil; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Les utilisateurs voient leur propre profil" ON public."User" FOR SELECT USING (((auth.uid())::text = id));


--
-- Name: Wishlist Les utilisateurs voient leur propre wishlist; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Les utilisateurs voient leur propre wishlist" ON public."Wishlist" FOR SELECT USING (((auth.uid())::text = "userId"));


--
-- Name: Purchase Les utilisateurs voient leurs propres achats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Les utilisateurs voient leurs propres achats" ON public."Purchase" FOR SELECT USING (((auth.uid())::text = "userId"));


--
-- Name: ExamenBlanc Les utilisateurs voient leurs propres examens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Les utilisateurs voient leurs propres examens" ON public."ExamenBlanc" FOR SELECT USING (((auth.uid())::text = "userId"));


--
-- Name: CreditTransaction Les utilisateurs voient leurs propres transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Les utilisateurs voient leurs propres transactions" ON public."CreditTransaction" FOR SELECT USING (((auth.uid())::text = "userId"));


--
-- Name: Purchase; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."Purchase" ENABLE ROW LEVEL SECURITY;

--
-- Name: Subject; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."Subject" ENABLE ROW LEVEL SECURITY;

--
-- Name: SubjectImage; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."SubjectImage" ENABLE ROW LEVEL SECURITY;

--
-- Name: SubjectSubmission; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."SubjectSubmission" ENABLE ROW LEVEL SECURITY;

--
-- Name: User; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;

--
-- Name: Wishlist; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."Wishlist" ENABLE ROW LEVEL SECURITY;

--
-- Name: SubjectImage image_own_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY image_own_access ON public."SubjectImage" USING (((auth.uid())::text = "authorId"));


--
-- Name: SubjectSubmission submission_admin_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY submission_admin_access ON public."SubjectSubmission" USING ((EXISTS ( SELECT 1
   FROM public."User"
  WHERE (("User".id = (auth.uid())::text) AND ("User".role = ANY (ARRAY['ADMIN'::public."Role", 'VERIFICATEUR'::public."Role", 'VALIDATEUR'::public."Role"]))))));


--
-- Name: SubjectSubmission submission_own_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY submission_own_access ON public."SubjectSubmission" USING (((auth.uid())::text = "authorId"));


--
-- Name: testimonials; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

--
-- Name: testimonials testimonials_admin_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY testimonials_admin_all ON public.testimonials USING ((EXISTS ( SELECT 1
   FROM public."User"
  WHERE (("User".id = (auth.uid())::text) AND ("User".role = 'ADMIN'::public."Role")))));


--
-- Name: testimonials testimonials_public_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY testimonials_public_read ON public.testimonials FOR SELECT USING ((is_published = true));


--
-- PostgreSQL database dump complete
--

\unrestrict YGBSLQB2f6FVcgobdpe8c3YDAzYvozFHyTdiwClnQ363Zi6nkOCI5nl4tC5cwu2

