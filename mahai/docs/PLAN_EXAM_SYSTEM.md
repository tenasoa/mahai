# Plan d'Implémentation — Système d'Examen Mah.AI

> Date : 2026-03-19
> Stack : Next.js 16 + Supabase + pg + Perplexity API

---

## Vue d'ensemble

| Phase | Types d'examen | Durée estimée |
|-------|---------------|---------------|
| **Phase 1** | Individuel simple (type 1) | 2-3 jours |
| **Phase 2** | Groupe + même moment (type 2) | 2-3 jours |
| **Phase 3** | Planifié individuel (type 3) | 3-4 jours |
| **Phase 4** | Planifié groupe (type 4) | 1-2 jours |

**Total estimé : 8-12 jours**

---

## Décisions techniques

| Décision | Choix |
|----------|-------|
| Modèle IA | Perplexity API (Sonar) |
| Création examens | Rôles `PROFESSEUR` + `ADMIN` |
| Source des sujets | Sujets débloqués (credits) + IA générée |
| Inscription groupes | Auto-inscription par code |
| Créneau manqué | Zéro pour ce sujet seulement |
| Timer | Côté serveur (vérification timestamp) |
| Correction QCM/numérique | Automatique |
| Correction ouverte | Perplexity IA |

---

## 1. Schéma de base de données

### 1.1 Tables Phase 1

```sql
-- Session d'examen
CREATE TABLE IF NOT EXISTS "ExamSession" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "examType" TEXT NOT NULL CHECK ("examType" IN (
    'INDIVIDUAL_SIMPLE',
    'GROUP_SAME_TIME',
    'SCHEDULED_INDIVIDUAL',
    'SCHEDULED_GROUP'
  )),
  "createdBy" TEXT NOT NULL REFERENCES "User"("id"),
  "subjectId" TEXT REFERENCES "Subject"("id"),
  "matiere" TEXT NOT NULL,
  "typeExamen" TEXT NOT NULL,
  "annee" TEXT,
  "serie" TEXT,
  "dureeSecondes" INTEGER NOT NULL DEFAULT 7200,
  "scoreMax" DOUBLE PRECISION NOT NULL DEFAULT 100,
  "status" TEXT NOT NULL DEFAULT 'DRAFT'
    CHECK ("status" IN ('DRAFT','ACTIVE','CLOSED','GRADED')),
  "scheduledStartAt" TIMESTAMPTZ,
  "scheduledEndAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Questions d'un examen
CREATE TABLE IF NOT EXISTS "ExamQuestion" (
  "id" TEXT PRIMARY KEY,
  "examSessionId" TEXT NOT NULL REFERENCES "ExamSession"("id") ON DELETE CASCADE,
  "ordre" INTEGER NOT NULL DEFAULT 1,
  "texte" TEXT NOT NULL,
  "questionType" TEXT NOT NULL CHECK ("questionType" IN ('QCM','OUVERT','NUMERIQUE')),
  "options" JSONB,
  "reponseCorrecte" TEXT,
  "points" INTEGER NOT NULL DEFAULT 1,
  "generateParIA" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Inscriptions aux examens
CREATE TABLE IF NOT EXISTS "ExamEnrollment" (
  "id" TEXT PRIMARY KEY,
  "examSessionId" TEXT NOT NULL REFERENCES "ExamSession"("id") ON DELETE CASCADE,
  "userId" TEXT NOT NULL REFERENCES "User"("id"),
  "groupId" TEXT REFERENCES "ExamGroup"("id"),
  "startedAt" TIMESTAMPTZ,
  "submittedAt" TIMESTAMPTZ,
  "score" DOUBLE PRECISION,
  "scoreMax" DOUBLE PRECISION,
  "percentile" DOUBLE PRECISION,
  "status" TEXT NOT NULL DEFAULT 'ENROLLED'
    CHECK ("status" IN ('ENROLLED','IN_PROGRESS','SUBMITTED','GRADED','ABSENT')),
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE("examSessionId", "userId")
);

-- Réponses des utilisateurs
CREATE TABLE IF NOT EXISTS "ExamAnswer" (
  "id" TEXT PRIMARY KEY,
  "enrollmentId" TEXT NOT NULL REFERENCES "ExamEnrollment"("id") ON DELETE CASCADE,
  "questionId" TEXT NOT NULL REFERENCES "ExamQuestion"("id"),
  "reponseUtilisateur" TEXT,
  "pointsObtenus" DOUBLE PRECISION,
  "correctionIA" TEXT,
  "submittedAt" TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE("enrollmentId", "questionId")
);
```

### 1.2 Tables Phase 2 (Groupes)

```sql
-- Groupes d'examen
CREATE TABLE IF NOT EXISTS "ExamGroup" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "code" TEXT UNIQUE NOT NULL,
  "createdBy" TEXT NOT NULL REFERENCES "User"("id"),
  "maxMembers" INTEGER DEFAULT 50,
  "description" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Membres des groupes
CREATE TABLE IF NOT EXISTS "ExamGroupMember" (
  "id" TEXT PRIMARY KEY,
  "groupId" TEXT NOT NULL REFERENCES "ExamGroup"("id") ON DELETE CASCADE,
  "userId" TEXT NOT NULL REFERENCES "User"("id"),
  "joinedAt" TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE("groupId", "userId")
);
```

### 1.3 Tables Phase 3 (Planification)

```sql
-- Planning d'examen
CREATE TABLE IF NOT EXISTS "ExamSchedule" (
  "id" TEXT PRIMARY KEY,
  "examSessionId" TEXT NOT NULL REFERENCES "ExamSession"("id") ON DELETE CASCADE,
  "jourSemaine" TEXT NOT NULL CHECK ("jourSemaine" IN (
    'LUNDI','MARDI','MERCREDI','JEUDI','VENDREDI','SAMEDI','DIMANCHE'
  )),
  "heureDebut" TIME NOT NULL,
  "heureFin" TIME NOT NULL,
  "matiere" TEXT NOT NULL,
  "ordre" INTEGER NOT NULL DEFAULT 1,
  "generateParIA" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);
```

### 1.4 Index

```sql
CREATE INDEX IF NOT EXISTS "idx_exam_session_created_by" ON "ExamSession"("createdBy");
CREATE INDEX IF NOT EXISTS "idx_exam_session_status" ON "ExamSession"("status");
CREATE INDEX IF NOT EXISTS "idx_exam_question_session" ON "ExamQuestion"("examSessionId");
CREATE INDEX IF NOT EXISTS "idx_exam_enrollment_user" ON "ExamEnrollment"("userId");
CREATE INDEX IF NOT EXISTS "idx_exam_enrollment_session" ON "ExamEnrollment"("examSessionId");
CREATE INDEX IF NOT EXISTS "idx_exam_answer_enrollment" ON "ExamAnswer"("enrollmentId");
CREATE INDEX IF NOT EXISTS "idx_exam_group_code" ON "ExamGroup"("code");
CREATE INDEX IF NOT EXISTS "idx_exam_group_member_group" ON "ExamGroupMember"("groupId");
CREATE INDEX IF NOT EXISTS "idx_exam_group_member_user" ON "ExamGroupMember"("userId");
CREATE INDEX IF NOT EXISTS "idx_exam_schedule_session" ON "ExamSchedule"("examSessionId");
```


### 1.5 RLS Policies

```sql
-- ExamSession
ALTER TABLE "ExamSession" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active sessions"
  ON "ExamSession" FOR SELECT
  USING ("status" = 'ACTIVE');

CREATE POLICY "Profs and admins can create sessions"
  ON "ExamSession" FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text
    AND role IN ('PROFESSEUR', 'ADMIN'))
  );

-- ExamEnrollment
ALTER TABLE "ExamEnrollment" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own enrollments"
  ON "ExamEnrollment" FOR SELECT
  USING ("userId" = auth.uid()::text);

CREATE POLICY "Users can enroll themselves"
  ON "ExamEnrollment" FOR INSERT
  WITH CHECK ("userId" = auth.uid()::text);

-- ExamAnswer
ALTER TABLE "ExamAnswer" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own answers"
  ON "ExamAnswer" FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM "ExamEnrollment"
    WHERE id = "ExamAnswer"."enrollmentId"
    AND "userId" = auth.uid()::text)
  );
```

---

## 2. Types TypeScript

Fichier : `mahai/types/examen.ts`

```typescript
export type ExamTypeEnum =
  | 'INDIVIDUAL_SIMPLE'
  | 'GROUP_SAME_TIME'
  | 'SCHEDULED_INDIVIDUAL'
  | 'SCHEDULED_GROUP'

export type ExamStatusEnum =
  | 'DRAFT'
  | 'ACTIVE'
  | 'CLOSED'
  | 'GRADED'

export type QuestionTypeEnum =
  | 'QCM'
  | 'OUVERT'
  | 'NUMERIQUE'

export type EnrollmentStatusEnum =
  | 'ENROLLED'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'GRADED'
  | 'ABSENT'

export interface ExamSession {
  id: string
  title: string
  examType: ExamTypeEnum
  createdBy: string
  subjectId?: string
  matiere: string
  typeExamen: string
  annee?: string
  serie?: string
  dureeSecondes: number
  scoreMax: number
  status: ExamStatusEnum
  scheduledStartAt?: Date
  scheduledEndAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface ExamQuestion {
  id: string
  examSessionId: string
  ordre: number
  texte: string
  questionType: QuestionTypeEnum
  options?: string[]
  reponseCorrecte?: string
  points: number
  generateParIA: boolean
  createdAt: Date
}

export interface ExamEnrollment {
  id: string
  examSessionId: string
  userId: string
  groupId?: string
  startedAt?: Date
  submittedAt?: Date
  score?: number
  scoreMax?: number
  percentile?: number
  status: EnrollmentStatusEnum
  createdAt: Date
}

export interface ExamAnswer {
  id: string
  enrollmentId: string
  questionId: string
  reponseUtilisateur?: string
  pointsObtenus?: number
  correctionIA?: string
  submittedAt: Date
}

export interface ExamGroup {
  id: string
  name: string
  code: string
  createdBy: string
  maxMembers: number
  description?: string
  createdAt: Date
}

export interface ExamGroupMember {
  id: string
  groupId: string
  userId: string
  joinedAt: Date
}

export interface ExamSchedule {
  id: string
  examSessionId: string
  jourSemaine: string
  heureDebut: string
  heureFin: string
  matiere: string
  ordre: number
  generateParIA: boolean
  createdAt: Date
}

// Types pour la soumission
export interface SubmitExamPayload {
  answers: Record<string, string>
}

export interface GradeResult {
  questionId: string
  pointsObtenus: number
  pointsMax: number
  correct: boolean
  correctionIA?: string
}

// Types pour la generation IA
export interface AIGenerateParams {
  matiere: string
  typeExamen: string
  annee?: string
  serie?: string
  nombreQuestions: number
  repartition: {
    qcm: number
    ouvert: number
    numerique: number
  }
}
```


---

## 3. Server Actions

Fichier : `mahai/actions/examens.ts`

### Phase 1

| Action | Description | Role requis |
|--------|-------------|-------------|
| `createExamSessionAction` | Creer une session d'examen | PROFESSEUR, ADMIN |
| `addQuestionAction` | Ajouter une question manuellement | PROFESSEUR, ADMIN |
| `generateQuestionsAction` | Generer des questions via Perplexity | PROFESSEUR, ADMIN |
| `enrollExamAction` | S'inscrire a un examen | Tous |
| `startExamAction` | Demarrer un examen (timer serveur) | Tous |
| `submitAnswerAction` | Soumettre une reponse | Tous |
| `submitExamAction` | Soumettre l'examen complet | Tous |
| `gradeExamAction` | Correction auto + IA | Auto |
| `getExamSessionsAction` | Lister les examens disponibles | Tous |
| `getExamResultAction` | Recuperer les resultats d'un examen | Tous |

### Phase 2

| Action | Description | Role requis |
|--------|-------------|-------------|
| `createGroupAction` | Creer un groupe d'examen | PROFESSEUR, ADMIN |
| `joinGroupAction` | Rejoindre un groupe par code | Tous |
| `leaveGroupAction` | Quitter un groupe | Tous |
| `getGroupMembersAction` | Lister les membres d'un groupe | Tous |
| `syncStartGroupExamAction` | Lancer l'examen pour tout le groupe | PROFESSEUR, ADMIN |

### Phase 3

| Action | Description | Role requis |
|--------|-------------|-------------|
| `createScheduleAction` | Creer un planning d'examen | PROFESSEUR, ADMIN |
| `getScheduleAction` | Recuperer le planning d'une session | Tous |
| `checkScheduleAccessAction` | Verifier si l'acces est ouvert maintenant | Tous |
| `markAbsentAction` | Marquer absent pour creneau manque | Auto |

---

## 4. API Routes

| Route | Methode | Description | Phase |
|-------|---------|-------------|-------|
| `/api/examens` | GET | Liste des examens (filtres) | 1 |
| `/api/examens` | POST | Creer un examen | 1 |
| `/api/examens/[id]` | GET | Detail d'un examen | 1 |
| `/api/examens/[id]` | PUT | Mettre a jour un examen | 1 |
| `/api/examens/[id]` | DELETE | Supprimer un examen | 1 |
| `/api/examens/[id]/questions` | GET | Questions d'un examen | 1 |
| `/api/examens/[id]/questions` | POST | Ajouter une question | 1 |
| `/api/examens/[id]/questions/[qid]` | PUT | Modifier une question | 1 |
| `/api/examens/[id]/questions/[qid]` | DELETE | Supprimer une question | 1 |
| `/api/examens/[id]/enroll` | POST | S'inscrire | 1 |
| `/api/examens/[id]/start` | POST | Demarrer l'examen | 1 |
| `/api/examens/[id]/answer` | POST | Soumettre une reponse | 1 |
| `/api/examens/[id]/submit` | POST | Soumettre l'examen | 1 |
| `/api/examens/[id]/grade` | POST | Lancer la correction | 1 |
| `/api/examens/[id]/result` | GET | Resultats detailles | 1 |
| `/api/examens/[id]/generate` | POST | Generer questions IA | 1 |
| `/api/examens/groupes` | GET | Mes groupes | 2 |
| `/api/examens/groupes` | POST | Creer un groupe | 2 |
| `/api/examens/groupes/join` | POST | Rejoindre par code | 2 |
| `/api/examens/groupes/[id]/members` | GET | Membres du groupe | 2 |
| `/api/examens/[id]/schedule` | GET | Planning | 3 |
| `/api/examens/[id]/schedule` | POST | Creer un creneau | 3 |

---

## 5. Pages

### Phase 1

| Route | Description | Fichier |
|-------|-------------|---------|
| `/examens` | Liste des examens disponibles | `app/examens/page.tsx` |
| `/examens/creer` | Creation d'examen (prof/admin) | `app/examens/creer/page.tsx` |
| `/examens/[id]` | Prise d'examen (questions + timer) | `app/examens/[id]/page.tsx` |
| `/examens/[id]/results` | Resultats detailles | `app/examens/[id]/results/page.tsx` |
| `/examens/[id]/correction` | Correction achetable | `app/examens/[id]/correction/page.tsx` |

### Phase 2

| Route | Description | Fichier |
|-------|-------------|---------|
| `/examens/groupes` | Mes groupes | `app/examens/groupes/page.tsx` |
| `/examens/groupes/creer` | Creer un groupe | `app/examens/groupes/creer/page.tsx` |
| `/examens/groupes/rejoindre` | Rejoindre par code | `app/examens/groupes/rejoindre/page.tsx` |
| `/examens/groupes/[id]` | Detail du groupe | `app/examens/groupes/[id]/page.tsx` |

### Phase 3

| Route | Description | Fichier |
|-------|-------------|---------|
| `/examens/planning` | Vue planning semaine | `app/examens/planning/page.tsx` |
| `/examens/planning/[session]` | Detail planning | `app/examens/planning/[session]/page.tsx` |


---

## 6. Integration Perplexity API

### 6.1 Configuration

Fichier : `mahai/lib/perplexity.ts`

```typescript
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY
const PERPLEXITY_MODEL = 'sonar-pro'

export async function callPerplexity(prompt: string): Promise<string> {
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: PERPLEXITY_MODEL,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  const data = await response.json()
  return data.choices[0].message.content
}
```

### 6.2 Generation de questions

Fichier : `mahai/lib/ai-exam-generator.ts`

```typescript
export async function generateExamQuestions(params: AIGenerateParams): Promise<ExamQuestion[]> {
  const prompt = `
Tu es un professeur malgache. Genere un sujet d'examen.

Matiere : ${params.matiere}
Type d'examen : ${params.typeExamen}
Annee : ${params.annee || 'Recente'}
Serie : ${params.serie || 'General'}

Nombre de questions : ${params.nombreQuestions}
- ${params.repartition.qcm} QCM (4 options A/B/C/D)
- ${params.repartition.ouvert} questions ouvertes (redaction)
- ${params.repartition.numerique} questions numeriques

Reponds UNIQUEMENT en JSON valide, sans markdown :
[
  {
    "texte": "Enonce de la question",
    "questionType": "QCM|OUVERT|NUMERIQUE",
    "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
    "reponseCorrecte": "A",
    "points": 2
  }
]

Pour les questions ouvertes, "reponseCorrecte" = reponse modele.
Pour numeriques, "reponseCorrecte" = nombre attendu.
`

  const response = await callPerplexity(prompt)
  return JSON.parse(response)
}
```

### 6.3 Correction de questions ouvertes

Fichier : `mahai/lib/ai-exam-grader.ts`

```typescript
export async function gradeOpenQuestion(
  question: string,
  reponseModele: string,
  reponseEleve: string,
  points: number
): Promise<{ pointsObtenus: number; feedback: string }> {
  const prompt = `
Tu es un correcteur d'examen malgache. Evalue cette reponse d'eleve.

QUESTION : ${question}
REPONSE MODELE : ${reponseModele}
REPONSE DE L'ELEVE : ${reponseEleve}
POINTS MAXIMUM : ${points}

Evalue sur ${points} points et donne un feedback constructif.

Reponds UNIQUEMENT en JSON valide :
{
  "pointsObtenus": 1.5,
  "feedback": "Explication detaillee..."
}
`

  const response = await callPerplexity(prompt)
  return JSON.parse(response)
}
```

---

## 7. Logique de correction

### 7.1 Algorithme

```
Pour chaque question de l'examen :

  SI questionType = 'QCM' :
    pointsObtenus = (reponseUtilisateur === reponseCorrecte) ? points : 0

  SI questionType = 'NUMERIQUE' :
    diff = abs(reponseUtilisateur - reponseCorrecte)
    pointsObtenus = (diff <= 0.01) ? points : 0

  SI questionType = 'OUVERT' :
    result = gradeOpenQuestion(...)
    pointsObtenus = result.pointsObtenus
    correctionIA = result.feedback

  score total = SUM(pointsObtenus)
  score max = SUM(points)
  percentile = calculPercentile(score, tous les scores de la session)
```

### 7.2 Validation timer serveur

```typescript
// Dans submitExamAction
const enrollment = await getEnrollment(enrollmentId)
const session = await getSession(enrollment.examSessionId)

const elapsedMs = Date.now() - new Date(enrollment.startedAt).getTime()
const maxMs = session.dureeSecondes * 1000

if (elapsedMs > maxMs) {
  // Soumettre les reponses existantes telles quelles
  // Marquer comme expire
}

if (elapsedMs > maxMs + 300000) { // +5 min de grace
  // Marquer ABSENT si aucune reponse
}
```


---

## 8. Fichiers a creer/modifier

### Phase 1

| Fichier | Action | Description |
|---------|--------|-------------|
| `migrations_manual/10_exam_system.sql` | Creer | Tables, index, RLS |
| `types/examen.ts` | Creer | Types TypeScript |
| `lib/perplexity.ts` | Creer | Client API Perplexity |
| `lib/ai-exam-generator.ts` | Creer | Generation IA de questions |
| `lib/ai-exam-grader.ts` | Creer | Correction IA |
| `lib/db-client.ts` | Modifier | Ajouter methodes examen |
| `actions/examens.ts` | Creer | Server actions |
| `app/examens/page.tsx` | Modifier | Liste des examens |
| `app/examens/creer/page.tsx` | Creer | Creation d'examen |
| `app/examens/[id]/page.tsx` | Modifier | Questions dynamiques |
| `app/examens/[id]/page.client.tsx` | Modifier | Timer serveur |
| `app/examens/[id]/results/page.tsx` | Modifier | Resultats dynamiques |
| `app/api/examens/route.ts` | Creer | GET/POST examens |
| `app/api/examens/[id]/questions/route.ts` | Creer | CRUD questions |
| `app/api/examens/[id]/enroll/route.ts` | Creer | Inscription |
| `app/api/examens/[id]/start/route.ts` | Creer | Demarrage |
| `app/api/examens/[id]/submit/route.ts` | Modifier | Soumission + correction |
| `app/api/examens/[id]/grade/route.ts` | Creer | Correction IA |
| `app/api/examens/[id]/generate/route.ts` | Creer | Generation IA |

### Phase 2

| Fichier | Action | Description |
|---------|--------|-------------|
| `migrations_manual/11_exam_groups.sql` | Creer | Tables groupes |
| `actions/examens-groupes.ts` | Creer | Actions groupes |
| `app/examens/groupes/page.tsx` | Creer | Mes groupes |
| `app/examens/groupes/creer/page.tsx` | Creer | Creer groupe |
| `app/examens/groupes/rejoindre/page.tsx` | Creer | Rejoindre par code |
| `app/examens/groupes/[id]/page.tsx` | Creer | Detail groupe |
| `app/api/examens/groupes/route.ts` | Creer | CRUD groupes |
| `app/api/examens/groupes/join/route.ts` | Creer | Inscription |

### Phase 3

| Fichier | Action | Description |
|---------|--------|-------------|
| `migrations_manual/12_exam_schedule.sql` | Creer | Tables planning |
| `actions/examens-planning.ts` | Creer | Actions planning |
| `app/examens/planning/page.tsx` | Creer | Vue planning |
| `app/examens/planning/[session]/page.tsx` | Creer | Detail planning |
| `app/api/examens/[id]/schedule/route.ts` | Creer | CRUD planning |

---

## 9. Workflow utilisateur

### 9.1 Creation d'examen (Prof/Admin)

```
1. Prof clique "Creer un examen"
2. Remplit : titre, matiere, type examen, annee, duree
3. Ajoute les questions :
   a. Manuellement (un par un)
   b. Ou "Generer par IA" → Perplexity genere les questions
4. Verifie/modifie les questions generees
5. Publie la session → status passe a ACTIVE
```

### 9.2 Prise d'examen individuel (Etudiant)

```
1. Etudiant voit les examens disponibles sur /examens
2. Clique sur un examen → bouton "Commencer"
3. L'inscription est creee (status: ENROLLED)
4. Clique "Demarrer" → startedAt est enregistre, timer demarre
5. Repond aux questions (navigation prev/next)
6. Timer affiche le temps restant
7. A 0 → auto-submit
8. Ou clique "Terminer" → confirmation → submit
9. Resultats affiches immediatement (QCM/numerique)
10. Correction IA disponible pour questions ouvertes
```

### 9.3 Examen de groupe (Phase 2)

```
1. Prof cree un groupe → obtient un code
2. Prof associe le groupe a une session d'examen
3. Etudiants rejoignent le groupe avec le code
4. A l'heure H, prof clique "Lancer l'examen"
5. Tous les membres voient l'examen
6. Chacun repond individuellement
7. Timer commun pour tous
```

### 9.4 Examen planifie (Phase 3)

```
1. Prof cree une session planifiee
2. Definit le planning : Lundi 8h Physique, Lundi 10h Maths...
3. L'IA genere les questions pour chaque creneau
4. Etudiant s'inscrit
5. Chaque creneau :
   - Sujet accessible uniquement pendant [heureDebut, heureFin]
   - Si etudiant ne se connecte pas → score 0 pour ce sujet
   - Sujet disparait apres heureFin
```

---

## 10. Questions ouvertes restantes

| Question | Statut |
|----------|--------|
| Limite de questions par examen ? | A definir |
| Frais de generation IA (couts Perplexity) ? | A calculer |
| Notifications avant creneau planifie ? | A implementer |
| Export PDF des examens ? | Optionnel |
| Historique des examens passes ? | A implementer |
| Classement national reel ? | Necessite beaucoup de donnees |
