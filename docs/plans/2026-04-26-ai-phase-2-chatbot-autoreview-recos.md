# Plan IA Mah.AI — Phase 2 : Chatbot, auto-review, recommandations

> Plan rédigé le 2026-04-26 — implémentation différée. Reprendre ce document quand tu démarres la Phase A.

## Contexte

La phase 1 a livré les corrections IA (Claude + Perplexity, débit crédits, PDF intégré, panel admin de bascule provider). Cette phase ajoute **trois fonctionnalités IA prioritaires** identifiées par l'audit :

1. **Chatbot FAQ** sur `/support` et `/contact` — déflecte 80 % des tickets répétitifs
2. **Auto-review des soumissions contributeur** — réduit le bruit côté `VERIFICATEUR`/`VALIDATEUR`/`ADMIN`
3. **Recommandations post-correction** — au lieu de finir sur un cul-de-sac, l'élève voit le sujet suivant adapté à ses faiblesses

**Contraintes opérationnelles :** budget infra = 0 € (on démarre sur les tiers gratuits — Perplexity Sonar, Supabase free, Vercel Hobby) ; infra cron pas encore choisie (le plan reste agnostique). Tout réutilise la `factory provider` IA déjà en place (`lib/ai/providers/factory.ts`).

---

## Choisir la bonne approche : LLM API / n8n / RAG

Ces 3 technologies répondent à **des problèmes différents** — on les combine, on n'en choisit pas une.

| Technologie | Pour quoi | Quand l'utiliser dans Mah.AI |
|---|---|---|
| **LLM API direct** (Claude, Sonar) | Raisonnement stateless : corriger, classifier, résumer, conseiller | Corrections d'exos, classification de soumissions, génération de réponses, ranking de recommandations |
| **n8n / Vercel Cron** | Orchestration : « toutes les 2 h, fetch DB, appelle un service, envoie un email » | Relance paiements, digest hebdo, cleanup drafts (phase 3, pas dans ce plan) |
| **RAG** (vector DB + embeddings) | Ancrer le LLM dans une base de connaissance privée trop grande pour le prompt | Inutile aujourd'hui : 8 articles FAQ tiennent dans le prompt. Phase 4 quand on aura un corpus pédagogique (fiches méthodo). |

**Décision :** les 3 fonctionnalités de cette phase passent toutes par **LLM API direct** via la factory existante. Pas de n8n. Pas de RAG (pseudo-RAG via prompt stuffing pour le chatbot, vu la petite taille du corpus).

---

## Phase A — Chatbot FAQ (simple, premier livrable)

**Pourquoi en premier :** ROI utilisateur immédiat, code 100 % réutilisable des providers IA, pas de migration SQL, pas de débit crédit (gratuit pour l'utilisateur).

### Fichiers à créer

- `lib/ai/knowledge/faq.ts` — exporte `SUPPORT_FAQ_TEXT` : les 8 articles FAQ déjà présents dans `app/support/page.tsx` extraits en texte structuré (titre + corps Markdown)
- `lib/ai/prompts/chatbot.ts` — `SYSTEM_PROMPT_CHATBOT` qui injecte `SUPPORT_FAQ_TEXT` + règles de fallback (« si question hors-sujet → invite vers /contact »)
- `actions/ai-chatbot.ts` — server action `askChatbot(history: ChatMessage[], message: string)` qui :
  - utilise `loadAIRuntimeConfig()` de la factory
  - appelle `provider.correct(...)` adapté pour mode chat (texte libre, pas JSON schema)
  - **rate-limit IP-based** simple (10 messages / minute / IP) via une table `ChatbotRateLimit` ou un Map en mémoire
  - **pas de débit crédit** : c'est un service support, payé par la plateforme
- `components/support/SupportChatbot.tsx` — widget flottant en bas à droite des pages `/support` et `/contact`. État local : historique des messages, statut (idle/typing/error). Markdown rendering via `react-markdown` (déjà installé).

### Fichiers à modifier

- `app/support/page.tsx` — embed `<SupportChatbot />`
- `app/contact/page.tsx` — bouton « Essayer le chatbot d'abord » qui ouvre le widget
- `lib/ai/providers/types.ts` — étendre `AIProvider` avec une méthode `chat(history, system, message)` qui ne demande pas de JSON schema (le `correct(...)` actuel impose le JSON)
- `lib/ai/providers/claude.ts` + `lib/ai/providers/perplexity.ts` — implémenter `chat(...)` (output texte simple, sans `output_config.format`)

### Pourquoi pas RAG pour 8 articles ?

Avec 8 articles courts (~3 KB total), le **prompt stuffing** suffit : on colle tout dans le system prompt. RAG devient pertinent au-dessus de ~50 documents ou ~50 KB, quand le contexte explose. On bascule en RAG quand on aura un vrai corpus pédagogique (Phase 4).

---

## Phase B — Auto-review des soumissions

**Pourquoi en deuxième :** dépend d'une migration SQL, mais ROI admin énorme (selon l'audit, ~70 % de gain de temps). Réutilise les patterns provider + transaction de `actions/ai-correction.ts`.

### Fichiers à créer

- `supabase/migrations/20260428_submission_ai_review.sql` — ajoute à la table `SubjectSubmission` :
  - `aiReview JSONB` (résultat structuré : verdict + issues[] + suggestedFeedback)
  - `aiReviewedAt TIMESTAMPTZ`
  - `aiReviewModel TEXT`
- `lib/ai/prompts/submission-review.ts` — `SYSTEM_PROMPT_REVIEW` : demande à l'IA de classifier la soumission (`ready_to_publish` / `needs_revision` / `reject`) + lister jusqu'à 5 issues + proposer un feedback constructif au contributeur
- `lib/ai/schemas.ts` — étendre avec `AISubmissionReviewSchema` (JSON schema strict pour structured output)
- `actions/ai-submission-review.ts` — server action `reviewSubmission(submissionId)` :
  - vérifie rôle ADMIN/VERIFICATEUR/VALIDATEUR
  - appelle `provider.correct({ mode: 'REVIEW', ... })` ou nouvelle méthode dédiée
  - persiste dans `SubjectSubmission.aiReview`
  - **idempotent** : si déjà reviewé < 24 h, retourne le résultat caché

### Fichiers à modifier

- `actions/admin/submissions.ts` — ajout d'un trigger optionnel : à la transition `DRAFT → SUBMITTED`, appel async (fire-and-forget) à `reviewSubmission(...)` pour pré-mâcher le travail admin
- `app/admin/soumissions/page.tsx` — colonne avec badge `🤖 OK` / `🤖 ⚠ 3 issues` / `🤖 ❌ rejet sugg.` selon `aiReview.verdict`
- `app/admin/sujets/[id]/review/page.tsx` — panneau dépliable « Pré-revue IA » avec issues + suggestion de feedback. Bouton « Re-run AI review » pour forcer une nouvelle passe
- Cohérence : le verdict IA est **indicatif** ; l'humain garde la décision finale (jamais d'auto-publish)

### Coût estimé

~$0.005 par soumission avec Sonar Pro. Si 100 soumissions/jour = $0.50/jour = $15/mois max. À ce prix, c'est **rentable dès la première heure d'admin sauvée**.

---

## Phase C — Recommandations post-correction

**Pourquoi en dernier :** dépend des phases A/B (factory robuste, prompts éprouvés). Effet rétention important.

### Approche en deux passes

1. **Pass SQL pure** (v1, livrée tout de suite après B) : extraire les `verdict='incorrect'`/`'partial'` de la dernière `AICorrection`, déduire les matières/thèmes faibles depuis `Subject.tags` ou `Subject.matiere`, requête `SELECT TOP 3 Subject WHERE matiere IN (...) AND niveau = ... AND id != currentSubjectId` rangée par `purchases_count DESC`. Pas d'IA, pas de coût additionnel.
2. **Pass LLM** (v2, optionnel) : si la pass 1 retourne plusieurs candidats, l'IA réordonne et génère une **justification courte** par recommandation (« Ton point faible : équations différentielles. Ce sujet 2023 reprend exactement ce thème. »). Coût marginal.

### Fichiers à créer

- `lib/ai/recommendations.ts` — fonctions :
  - `extractWeakTopics(result: AICorrectionResult): string[]` (heuristique sur les verdicts)
  - `findCandidateSubjects(weakTopics, currentSubjectId, niveau): Promise<Subject[]>` (SQL pur)
  - `rankWithLLM(candidates, weakTopics): Promise<{ subject, justification }[]>` (optionnel, v2)

### Fichiers à modifier

- `actions/ai-correction.ts` — étendre `AICorrectionResponse.data` avec `recommendations: { subjectId, title, matiere, justification }[]`. Branché à la fin de `processCorrection(...)`
- `components/sujet/AICorrectionView.tsx` — nouvelle section en bas « Continuez votre progression » avec 3 cartes cliquables (lien vers `/sujet/[id]`)

---

## Roadmap pas-à-pas (pour débutant)

Ordre recommandé d'exécution **après reprise du projet** :

| Étape | Livrable | Durée estimée | Prérequis |
|---|---|---|---|
| A1 | Extraire FAQ → `lib/ai/knowledge/faq.ts` | 30 min | aucun |
| A2 | Étendre la factory provider avec `chat(...)` | 1 h | A1 |
| A3 | Server action `askChatbot` + rate-limit | 1 h | A2 |
| A4 | Composant `<SupportChatbot />` | 2 h | A3 |
| A5 | Embed dans `/support` et `/contact` + tests manuels | 30 min | A4 |
| B1 | Migration `20260428_submission_ai_review.sql` | 30 min | A terminé |
| B2 | Schema + prompt + action `reviewSubmission` | 2 h | B1 |
| B3 | UI badges + panneau review admin | 2 h | B2 |
| B4 | Trigger async sur transition `DRAFT → SUBMITTED` | 1 h | B3 |
| C1 | `lib/ai/recommendations.ts` (SQL pure, v1) | 1 h | B terminé |
| C2 | Branchement dans `processCorrection` + UI | 1 h | C1 |
| C3 | (Optionnel) Re-ranking LLM + justification | 1 h | C2 |

**Total : ~13 h de dev** pour livrer les trois fonctionnalités. Phases livrées indépendamment et déployables une par une (chaque commit reste un build vert).

---

## Vérification end-to-end

### Phase A (chatbot)

- Sur `/support`, ouvrir le widget, demander « Comment je m'inscris ? » → réponse contextualisée FAQ + lien vers `/auth/register`
- Demander « Combien coûte la correction IA ? » → réponse mentionnant les crédits + provider actif
- Demander « Qui a gagné la coupe d'Afrique ? » → polie redirection vers `/contact`, pas de hallucination
- Spam 11 messages en 60 s depuis la même IP → rate-limit kick au 11ᵉ
- Toggle provider Claude ↔ Perplexity dans `/admin/configuration` puis renvoyer un message → la réponse vient bien du provider sélectionné

### Phase B (auto-review)

- Soumettre un sujet **bien rempli** depuis `/contributeur/sujets/nouveau` → après ~10 s, badge `🤖 OK` apparaît dans `/admin/soumissions`
- Soumettre un sujet **vide ou bâclé** → badge `🤖 ⚠ N issues` avec liste précise (manque énoncé, points incohérents, etc.)
- Bouton « Re-run AI review » sur la page review → met à jour `aiReviewedAt` et change potentiellement le verdict si le contributeur a édité entre-temps
- L'admin garde toujours le pouvoir final : approuver malgré un avis IA défavorable doit rester possible

### Phase C (recommandations)

- Faire un exo `SUBMISSION` avec 2-3 réponses fausses sur des thèmes différents → la `AICorrectionView` affiche 3 sujets recommandés en bas
- Cliquer une recommandation → navigation vers `/sujet/[id]` du sujet ciblé
- Si l'élève a déjà acheté tous les sujets de la matière → message « Vous avez tout débloqué pour cette matière » au lieu de cartes vides
- Vérifier que la requête SQL exclut bien le sujet courant et reste sous 50 ms en prod

---

## Notes finales pour un démarrage débutant

- **Commence par la Phase A** : c'est la plus simple, validation rapide, pas de migration. Tu vois le widget chat marcher en ~5 h cumulées.
- **N'introduis n8n / RAG / pgvector que quand un besoin réel le justifie.** Aujourd'hui = aucun.
- **Garde le toggle provider** : tester sur Perplexity (gratuit) puis basculer vers Claude quand tu auras les crédits, sans changer une ligne de code applicatif.
- **Tous les coûts IA sont prévisibles** : compteurs `tokensIn/tokensOut` déjà tracés dans `AICorrection` ; on étendra la même traçabilité pour le chatbot et l'auto-review.

---

## Annexe — opportunités IA / automatisation détectées mais hors scope de cette phase

Issues de l'audit du 2026-04-26, à reprendre dans les phases suivantes :

### Crons d'automatisation (sans IA, parfaits pour Vercel Cron ou n8n)
- Check pending payments > 12h → notifier user + admin
- Détecteur de stagnation étudiant (daily) → email doux de relance
- Cleanup drafts > 90 jours
- Digest hebdo personnalisé (samedi 18h)
- Auto-approve withdrawal sous threshold
- Promotion automatique CONTRIBUTEUR → VALIDATEUR après N corrections acceptées

### IA candidates futures
- Détection fraude paiements (rules SQL + LLM pour cas ambigus)
- Email transactionnels enrichis (ton personnalisé selon contexte)
- Modération auto des commentaires de blog
- Auto-snippets pour la liste des articles blog
- RAG sur corpus pédagogique malgache (BEPC/BAC corrigés 2010-2024) quand le corpus existera
