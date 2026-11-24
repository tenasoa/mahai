# CLAUDE.md

Guide pour travailler sur Mah.ai v2. Langue de travail : **français**.

- Le produit, les choix et le découpage en vagues : `docs/brief.md`.
- L'identité visuelle « Mosaïque » et ses règles : `DESIGN.md`.

## Commandes

Gestionnaire de paquets : **pnpm** (pas npm ni yarn).

```bash
pnpm dev         # serveur de dev (Vite + runtime Workers local, bindings simulés)
pnpm typecheck   # wrangler types + react-router typegen + tsc
pnpm test        # tests unitaires (Vitest)
pnpm build       # build de production
pnpm run deploy  # build + wrangler deploy en production (pas `pnpm deploy`, commande interne de pnpm)
pnpm run deploy:preprod  # build + déploiement sur mahai-preprod.tenasoa.workers.dev

pnpm db:generate         # génère une migration SQL dans drizzle/ depuis app/db/schema.ts
pnpm db:migrate:local    # applique les migrations à la base locale (.wrangler/)
pnpm db:migrate:preprod  # … à la base D1 mahai-preprod
pnpm db:migrate:prod     # … à la base D1 mahai (production)
```

Sous Windows, lancer `wrangler` depuis PowerShell : c'est là que la connexion OAuth est lue.

Environnements : la racine de `wrangler.jsonc` est la production, `env.preprod` la préprod.
Toujours tester en préprod (migrations puis déploiement) avant la production.

## Base de données et comptes

- **D1** (SQLite) avec **Drizzle ORM**. Schéma dans `app/db/schema.ts` ; ne jamais modifier une
  migration déjà appliquée, en générer une nouvelle.
- **Better Auth** : configuration dans `app/lib/auth/auth.server.ts`, routes HTTP sous
  `/api/auth/*`. Les écrans `connexion` / `inscription` appellent l'API côté serveur et recopient
  les cookies (`redirectAvecCookies`).
- Mots de passe hachés en PBKDF2-SHA256 natif (`app/lib/auth/password.ts`) : le scrypt par défaut
  est trop coûteux en CPU pour un Worker.
- `getSession(request)` / `requireSession(request)` dans `app/lib/auth/session.server.ts` pour
  protéger une route.
- Le rôle (`eleve`, `contributeur`, `etablissement`, `moderateur`, `admin`) n'est jamais modifiable
  par l'utilisateur ; une contrainte CHECK le protège aussi en base.
- Secret `BETTER_AUTH_SECRET` : `.dev.vars` en local, `wrangler secret put` ailleurs.
- Connexion Google facultative : active seulement si `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET`
  sont posés (`googleActif()`). Mise en place : `docs/google-oauth.md`.
- Emails (mot de passe oublié, confirmation d'email) envoyés par l'API Gmail d'un compte dédié,
  en arrière-plan (`envoyerEnFond`, `app/lib/email/`). Actifs seulement si les 4 secrets
  `GMAIL_*` sont posés (`emailActif()`). Mise en place : `docs/gmail-envoi.md`.
- Limitation des tentatives stockée en base (table `rate_limit`). Les formulaires appellent
  Better Auth via `appelerAuth()` (handler HTTP) et non `auth.api.*`, qui contourne la limite.

## Architecture

- **React Router 8** en mode framework, rendu serveur, sur **Cloudflare Workers** via
  `@cloudflare/vite-plugin`. Point d'entrée du Worker : `workers/app.ts`.
- Routes déclarées dans `app/routes.ts`. `routes/_app.tsx` est la coquille (en-tête + navigation
  du bas) ; les routes `api.*` sont des routes de ressource (JSON).
- Variables et bindings Cloudflare : `import { env } from "cloudflare:workers"`. Après toute
  modification de `wrangler.jsonc`, relancer `pnpm cf-typegen`.
- Styles : Tailwind CSS 4, jetons dans `@theme` de `app/app.css`. Utiliser les jetons
  (`bg-ink`, `bg-maths`, `rounded-tile`…), jamais de couleur en dur.
- Composants d'interface dans `app/components/ui/`, mise en page dans `app/components/layout/`.

## Règles

- Une seule action principale (`variant="primary"`) par écran.
- Les formulaires doivent marcher sans JavaScript (`<Form method="get|post">`).
- Pas de fausses données dans l'application : un écran sans contenu affiche un `EmptyState`.
- Tout ce qui touche l'argent (solde, achats, recharges, retraits) est couvert par des tests
  avant d'être fusionné.
- Clés d'API et secrets : `wrangler secret put` en production, `.dev.vars` en local (jamais
  commités).
