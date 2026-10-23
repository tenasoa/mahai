# Migration Supabase + Vercel → Cloudflare

> Statut : **proposition, à valider**. Rédigé le 23/10/2026.
> Objectif : quitter Supabase (auth, base, storage), Vercel (hébergement, Blob) et Upstash (Redis), tout regrouper chez Cloudflare.

## 1. Ce que Cloudflare fournit, et ce qu'il ne fournit pas

| Besoin Mah.AI | Aujourd'hui | Chez Cloudflare | Remarque |
|---|---|---|---|
| Hébergement Next.js | Vercel | **Workers** + adaptateur **OpenNext** (`@opennextjs/cloudflare`) | Next.js 16.4 supporté ; plancher de sécurité 16.3.8. |
| Base Postgres | Supabase Postgres | **Hyperdrive** + Postgres **PlanetScale** créé et facturé depuis le dashboard Cloudflare | ⚠️ Cloudflare n'héberge pas Postgres lui-même : c'est PlanetScale (≈ 5 $/mois le nœud). |
| Base SQLite | — | **D1** | Ne convient pas comme base principale ici (voir §2). Utile pour du petit stockage en bord de réseau. |
| Fichiers (images, PDF) | Vercel Blob + Supabase Storage | **R2** | Sortie (egress) gratuite. API compatible S3. |
| Cache / rate-limit | Upstash Redis | **KV** + binding **Rate Limiting** (ou Durable Objects) | `lib/rate-limit.ts` à réécrire. |
| Authentification | Supabase Auth | ❌ pas d'auth grand public chez Cloudflare | → **Better Auth** (open source, tourne sur Workers, stocke dans notre Postgres). Cloudflare Access sert à protéger des outils internes, pas des élèves. |
| Emails transactionnels | SMTP Supabase / Resend | **Email Service** (envoi depuis un Worker) | En **bêta publique** (avril 2026), plan Workers Paid. Garder Resend en secours au début. |
| IA | Claude, OpenAI, OpenRouter, Perplexity | **Workers AI** : 10 000 neurones/jour gratuits, puis 0,011 $ / 1 000 neurones | Modèles ouverts (gpt-oss-120b, Llama 4 Scout, Qwen, Mistral…). Qualité à valider sur les maths : à ajouter comme provider, pas forcément à la place des autres. |
| Temps réel (notifications live) | — | **Durable Objects** + WebSockets (API Hibernation) | « Cloudflare Realtime » est autre chose : de l'audio/vidéo WebRTC. |
| Tâches longues (corrections IA) | appel synchrone | **Queues** + **Workflows** | Évite les timeouts sur les grosses copies. |
| PDF des sujets | `@react-pdf/renderer` + MathJax côté serveur | **Browser Rendering** (Chrome headless) en option | Risque : poids du bundle et temps CPU sur Workers. À tester en premier. |
| Monitoring | Sentry (`@sentry/nextjs`) | Sentry fonctionne sur Workers | + logs Workers intégrés. |

**Coût de base** : plan Workers Paid (5 $/mois, requis pour un bundle Next.js de cette taille, l'Email Service et des limites CPU confortables) + Postgres PlanetScale (à partir de ≈ 5 $/mois).

## 2. Pourquoi Postgres (Hyperdrive) et pas D1 pour la base principale

Inventaire du code au 23/10/2026 :

- **335 appels SQL** (`query()` et la couche `db-client`), écrits pour Postgres : `ILIKE` (21), casts `::jsonb` / `::int` / `::date` (≈ 40), `ON CONFLICT`, transactions `BEGIN/COMMIT`, enums, `NOW()`.
- 22 migrations dans `supabase/migrations/` + 30 dans `migrations_manual/`.

D1 = SQLite : pas de `ILIKE`, pas de `jsonb`, pas d'enums, types différents. Migrer vers D1 = réécrire et retester toutes les requêtes et migrations.
Avec Hyperdrive + Postgres, le driver `pg` actuel reste : seule la connexion change dans `lib/db.ts`. Les transactions sont supportées par Hyperdrive, donc la séparation actuelle `pool` / `txPool` (`DATABASE_URL` / `DIRECT_URL`) disparaît.

**Recommandation : Postgres PlanetScale via Hyperdrive.** D1 reste disponible plus tard pour des données en bord de réseau (cache de catalogue, compteurs) si le besoin se présente.

## 3. Ce qui touche Supabase dans le code

- **39 fichiers** importent `@/lib/supabase/*` ou `@supabase/*`.
- Auth : `getUser` (22), `getSession` (9), `signInWithPassword`, `signUp`, `verifyOtp`, `resetPasswordForEmail`, `updateUser`, `exchangeCodeForSession`, `auth.admin`, `onAuthStateChange`.
- Requêtes via le client Supabase (au lieu de `pg`) : `Subject`, `User`, `BlogPost`, `BlogComment`, `SystemSetting`, `profiles`, `testimonials`, `images` → à repasser sur `query()`.
- Storage : 2 usages (`storage.from`), plus `@vercel/blob` dans 2 fichiers.
- `proxy.ts` : entièrement construit sur la session Supabase (cookies `sb-*`).

## 4. Plan en phases

Chaque phase est livrable seule, avec retour arrière possible. On ne coupe Supabase qu'à la fin.

### Phase 0 — Préparer (½ jour)
- Compte Cloudflare en plan Workers Paid, domaine géré par Cloudflare (DNS).
- `wrangler` + `@opennextjs/cloudflare` en devDependencies, `wrangler.jsonc`, `open-next.config.ts`.
- Secrets (`wrangler secret put`) : clés IA, Sentry, et pour l'instant les clés Supabase.

### Phase 1 — Héberger sur Workers, toujours avec Supabase (2–3 jours)
- Monter Next.js en ≥ 16.4 (corrige aussi les failles critiques relevées dans l'audit).
- Build OpenNext, déploiement sur un domaine de préproduction.
- Points à risque à valider ici : génération PDF (`@react-pdf/renderer`, `mathjax-full`), `pg` en `nodejs_compat`, taille du bundle, `bodySizeLimit` des Server Actions.
- ✅ Critère de sortie : toutes les pages et actions fonctionnent sur Workers, Vercel reste en production.

### Phase 2 — Fichiers vers R2 (1 jour)
- Bucket R2 `mahai-assets` (+ domaine public ou URLs signées).
- Remplacer `@vercel/blob` (`app/api/editor/upload-image`) et `supabase.storage` (avatars, images) par R2.
- Script de copie des fichiers existants, puis réécriture des URLs en base.

### Phase 3 — Base vers Postgres PlanetScale + Hyperdrive (2 jours)
- Créer la base depuis le dashboard Cloudflare, `pg_dump` (schéma `public`) → restauration.
- `lib/db.ts` : un seul pool branché sur `env.HYPERDRIVE.connectionString`.
- Repasser les ≈ 10 appels `supabase.from(...)` sur `query()`.
- Mettre en place **un seul** dossier de migrations, suivi en base (fin des 3 dossiers appliqués à la main).
- ✅ Critère : bascule en lecture/écriture sur la nouvelle base, ancienne base gardée en lecture seule pendant 2 semaines.

### Phase 4 — Auth : Supabase Auth → Better Auth (4–5 jours, la plus délicate)
- Tables Better Auth dans Postgres, liées à `"User".id` (on garde les mêmes UUID).
- **Migration des comptes sans forcer de nouveau mot de passe** : Supabase stocke des hash bcrypt (`auth.users.encrypted_password`), Better Auth accepte une fonction de vérification personnalisée → les élèves gardent leur mot de passe.
- Réécrire `proxy.ts` (cookies de session Better Auth, mêmes règles : routes protégées, vérification email, onboarding, revalidation ADMIN), `actions/auth.ts`, `lib/supabase/*` → `lib/auth/*`.
- Emails (vérification, mot de passe oublié) via Cloudflare Email Service, Resend en secours.
- ✅ Critère : inscription, connexion, vérification email, mot de passe oublié, déconnexion, accès admin testés de bout en bout (Playwright).

### Phase 5 — Ce que Cloudflare apporte en plus (au fil de l'eau)
- **Workers AI** comme nouveau provider dans `lib/ai/providers/` (la factory existe déjà) : d'abord pour les tâches légères et le mode « corrigé complet » mis en cache, comparé à Claude/OpenRouter sur un jeu de copies réelles avant d'en faire le défaut.
- **Queues** pour les corrections IA longues, avec notification à la fin.
- **Durable Objects** pour les notifications en direct (recharge validée, correction prête, nouveau sujet).
- Rate limiting via le binding natif au lieu d'Upstash.
- **Cron Triggers** pour les tâches planifiées (rappels de série d'étude, nettoyage).

### Phase 6 — Couper (½ jour)
- Retirer `@supabase/*`, `@vercel/blob`, `@upstash/redis`, les variables d'environnement associées.
- Fermer les projets Supabase, Vercel et Upstash une fois les sauvegardes faites.

**Total estimé : 2 à 3 semaines de travail** pour une personne, phase 5 non comprise.

## 5. Décisions à prendre

1. Base principale : **Postgres PlanetScale via Hyperdrive** (recommandé) ou réécriture vers D1 ?
2. Auth : **Better Auth** (recommandé) ou un service tiers (Clerk…) ?
3. Emails : Cloudflare Email Service (bêta) dès le départ, ou Resend d'abord ?
4. Ordre avec la refonte du design : faire la phase 1 (hébergement + montée Next.js) **avant** la refonte, puis mener design et phases 2–4 en parallèle.
