# CLAUDE.md

Guide pour travailler sur Mah.ai v2. Langue de travail : **français**.

- Le produit, les choix et le découpage en vagues : `docs/brief.md`.
- L'identité visuelle « Mosaïque » et ses règles : `DESIGN.md`.

## Commandes

Gestionnaire de paquets : **pnpm** (pas npm ni yarn).

```bash
pnpm dev         # serveur de dev (Vite + runtime Workers local, bindings simulés)
pnpm typecheck   # wrangler types + react-router typegen + tsc
pnpm build       # build de production
pnpm deploy      # build + wrangler deploy
```

Sous Windows, lancer `wrangler` depuis PowerShell : c'est là que la connexion OAuth est lue.

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
