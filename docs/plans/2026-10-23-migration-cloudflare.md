# Migration Supabase + Vercel → Cloudflare

> Statut : **validé le 23/10/2026**. Choix du propriétaire : base **D1**, authentification
> **Better Auth**, refonte visuelle en **direction A** (voir `DESIGN.md`).
> Objectif : quitter Supabase (auth, base, storage), Vercel (hébergement, Blob) et Upstash (Redis),
> tout regrouper chez Cloudflare.

## 1. Ce que Cloudflare fournit, et ce qu'il ne fournit pas

| Besoin Mah.AI | Aujourd'hui | Cible Cloudflare | Remarque |
|---|---|---|---|
| Hébergement Next.js | Vercel | **Workers** + adaptateur **OpenNext** (`@opennextjs/cloudflare`) | Exige Next.js ≥ 16.4.1 : fait (16.4.3). |
| Base de données | Supabase Postgres | **D1** (SQLite managé) | Réécriture des requêtes : voir §2. |
| Fichiers (images, PDF) | Vercel Blob + Supabase Storage | **R2** | Sortie (egress) gratuite. |
| Cache Next.js (ISR) | Vercel | **R2** (`NEXT_INC_CACHE_R2_BUCKET`) | Déjà configuré dans `wrangler.jsonc`. |
| Cache / rate-limit | Upstash Redis | **KV** + binding **Rate Limiting** | `lib/rate-limit.ts` à réécrire. |
| Authentification | Supabase Auth | **Better Auth** | Bibliothèque gratuite (MIT), sans palier payant ; stocke ses tables dans D1. |
| Emails transactionnels | SMTP Supabase / Resend | **Email Service** (envoi depuis un Worker) | En **bêta publique** depuis avril 2026, plan Workers Paid. Resend en secours. |
| IA | Claude, OpenAI, OpenRouter, Perplexity | + **Workers AI** (10 000 neurones/jour gratuits) | Nouveau provider dans `lib/ai/providers/`, à comparer sur de vraies copies. |
| Temps réel | — | **Durable Objects** + WebSockets (API Hibernation) | « Cloudflare Realtime » = audio/vidéo WebRTC, autre usage. |
| Tâches longues | appel synchrone | **Queues** / **Workflows** | Corrections IA longues. |
| PDF des sujets | `@react-pdf/renderer` + MathJax | à valider sur Workers, **Browser Rendering** en repli | Voir phase 1. |

**Coût de base** : plan Workers Paid, 5 $/mois. D1, R2, KV et Queues ont des quotas inclus largement
suffisants au démarrage.

## 2. D1 : ce que ça implique

Inventaire au 23/10/2026 : **335 appels SQL** écrits pour Postgres, 22 migrations dans
`supabase/migrations/` et 30 dans `migrations_manual/`.

| Postgres aujourd'hui | En D1 (SQLite) |
|---|---|
| `BEGIN … COMMIT` via `transaction()` | **Pas de transaction interactive.** Atomicité par `db.batch([...])` : toutes les requêtes du lot passent ou aucune. Un lot ne peut pas réutiliser le résultat d'une requête précédente : on écrit des requêtes conditionnelles. |
| `ILIKE` (21 usages) | `LIKE` n'ignore la casse que pour l'ASCII : les accents français posent problème. On stocke une colonne normalisée (minuscules, sans accents) pour la recherche. |
| `jsonb`, `::jsonb` | Colonne `TEXT` + fonctions `json_extract`, `json_each`. |
| Enums Postgres | `TEXT` + contrainte `CHECK (col IN (...))`. |
| `uuid`, `gen_random_uuid()` | `TEXT` + `crypto.randomUUID()` côté application (déjà le cas dans plusieurs actions). |
| `NOW()`, `timestamptz` | `TEXT` ISO 8601 (`datetime('now')`) ou entier epoch, une seule convention pour tout le schéma. |
| Casts `::int`, `::date`, `::text` | `CAST(... AS ...)` ou suppression (typage dynamique SQLite). |
| Connexion `pg` (`DATABASE_URL`, `DIRECT_URL`) | Binding `env.DB`, accès via `getCloudflareContext()`. Plus de pool ni de distinction 5432/6543. |

**Exemple : achat d'un sujet (débit du solde + achat), en un lot atomique.**

```ts
await env.DB.batch([
  env.DB.prepare(`UPDATE "User" SET "balanceAr" = "balanceAr" - ?1
                  WHERE id = ?2 AND "balanceAr" >= ?1`).bind(prix, userId),
  // n'insère que si la ligne précédente a vraiment débité le solde
  env.DB.prepare(`INSERT INTO "Purchase" (id, "userId", "subjectId", "amountAr")
                  SELECT ?1, ?2, ?3, ?4 WHERE changes() = 1`).bind(id, userId, subjectId, prix),
])
```

Ce motif est à valider par un test sur D1 local avant d'être généralisé aux paiements, recharges et
retraits.

**Recommandation : passer par Drizzle ORM** (`drizzle-orm/d1`). Puisque toutes les requêtes sont de
toute façon réécrites, autant les réécrire typées. Drizzle génère les migrations D1
(`wrangler d1 migrations`), ce qui remplace les trois dossiers appliqués à la main. Better Auth s'y
branche directement (adaptateur Drizzle). La couche `lib/db-client.ts` (forme Prisma) disparaît.

## 3. Better Auth à la place de Supabase Auth

- **Gratuit** : bibliothèque open source sous licence MIT. L'équipe vend une infrastructure
  optionnelle à part, dont nous n'avons pas besoin.
- **Stockage** : ses tables (`user`, `session`, `account`, `verification`) vivent dans D1 et sont
  reliées à `"User".id` (on garde les mêmes identifiants).
- **Comptes existants sans nouveau mot de passe** : Supabase stocke des hash bcrypt
  (`auth.users.encrypted_password`). Better Auth accepte une fonction de vérification personnalisée :
  on vérifie en bcrypt les anciens hash, puis on re-hache avec l'algorithme par défaut à la première
  connexion réussie.
- **À réécrire** : `proxy.ts` (cookie de session Better Auth, mêmes règles : routes protégées,
  vérification d'email, onboarding, contrôle ADMIN), `actions/auth.ts`, `lib/supabase/*` →
  `lib/auth/*`, les 39 fichiers qui importent Supabase.
- **Emails** : vérification et mot de passe oublié via Cloudflare Email Service, Resend en secours.

## 4. Plan en phases

Chaque phase est livrable seule, avec retour arrière possible. Supabase n'est coupé qu'à la fin.

### Phase 1 — Héberger sur Workers, toujours avec Supabase
- ✅ Next.js 16.4.3, dépendances à jour, 0 vulnérabilité (`pnpm audit`).
- ✅ OpenNext + Wrangler : `wrangler.jsonc`, `open-next.config.ts`, scripts `cf:build`,
  `cf:preview`, `cf:deploy`, `cf:typegen`.
- À valider : build OpenNext, taille du Worker, génération PDF, `pg` en `nodejs_compat`.
- Prérequis côté compte (propriétaire) : plan Workers Paid, bucket R2 `mahai-opennext-cache`,
  secrets (`wrangler secret put …`).
- ✅ Critère de sortie : préproduction sur Workers fonctionnelle ; Vercel reste en production.

### Phase 2 — Fichiers vers R2
- ✅ `lib/storage.ts` : binding R2 `FILES` sur Workers, API S3 de R2 ailleurs (Vercel reste en
  production jusqu'à la bascule). Avatars, images de l'éditeur et du blog passent par R2 ;
  `@vercel/blob` et les appels `supabase.storage` sont retirés.
- ✅ Les images sont vérifiées sur leur contenu (JPG, PNG, WebP, GIF) et servies par
  `R2_PUBLIC_URL` ou, à défaut, par la route `/files/…`.
- ✅ `scripts/migrate-files-to-r2.mjs` : inventaire, copie et réécriture des anciennes URLs dans
  toutes les colonnes texte et JSON, avec retour arrière.
- Côté compte (propriétaire) : bucket `mahai-assets` (`pnpm wrangler r2 bucket create
  mahai-assets`), domaine public du bucket (`R2_PUBLIC_URL`), jeton R2 « Object Read & Write »
  limité au bucket et variables `R2_*` sur Vercel, puis le script (inventaire, puis `--apply`).
- Critère de sortie : plus aucune URL `vercel-storage.com` ni `supabase.co/storage` en base
  (l'inventaire du script n'en trouve plus).

### Phase 3 — Schéma D1 + réécriture des requêtes (la plus longue)
- Schéma Drizzle à partir du schéma Postgres actuel, première migration D1.
- Réécriture des 335 requêtes, module par module : catalogue/sujets → achats/solde → recharges →
  contributeurs/retraits → admin → blog/notifications/parrainage. Tests d'intégration sur D1 local
  pour chaque module, en priorité ceux qui touchent à l'argent.
- Export Postgres → transformation (types, JSON, dates) → import `wrangler d1 execute`.
- ✅ Critère : toutes les pages lisent et écrivent dans D1 en préproduction ; Postgres gardé en
  lecture seule 2 semaines.

### Phase 4 — Better Auth
- Tables Better Auth, migration des comptes (hash bcrypt), réécriture de `proxy.ts` et des actions
  d'auth, emails.
- ✅ Critère : inscription, connexion, vérification d'email, mot de passe oublié, déconnexion et
  accès admin testés de bout en bout avec Playwright.

### Phase 5 — Ce que Cloudflare apporte en plus
- Provider Workers AI, Queues pour les corrections longues, Durable Objects pour les notifications
  en direct, rate limiting natif, Cron Triggers.

### Phase 6 — Couper
- Retirer `@supabase/*`, `pg`, `@vercel/blob`, `@upstash/redis` et leurs variables ; fermer Supabase,
  Vercel et Upstash après sauvegarde.

**Estimation : 4 à 5 semaines** pour une personne (phase 5 non comprise). La réécriture vers D1
ajoute environ deux semaines par rapport à une migration vers Postgres.

## 5. Refonte visuelle (en parallèle)

- Direction A « La copie corrigée », décrite dans `DESIGN.md` (format Google DESIGN.md, validé par
  `npx @google/design.md lint`).
- Les maquettes de toutes les pages servent de référence ; les pages sont refaites au fil des phases
  3 et 4, quand leurs données passent sur D1, pour ne toucher chaque écran qu'une fois.
