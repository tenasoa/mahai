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

## Catalogue et éditeur de sujets

- Sujets : table `sujet` (énoncé et corrigé en **JSON TipTap**), séries et coefficients dans
  `sujet_serie`. Accès dans `app/lib/catalogue/` ; formulaire vérifié par `lireFormulaireSujet`.
- Tout document reçu passe par `nettoyerDocument` (`app/lib/document/nettoyer.ts`, liste blanche de
  nœuds, marques et attributs) avant l'enregistrement. Ajouter un nœud = l'ajouter là, dans
  `RenduDocument` (lecture élève, sans TipTap) et dans l'éditeur (`app/components/editeur/`).
- Barème : `points` commun, ou `pointsSeries` (identifiant de série → points) quand il diffère.
- Formules : KaTeX dessiné **côté navigateur** (trop coûteux en CPU pour un Worker), mhchem pour
  `\ce{…}` ; saisie visuelle MathLive chargée seulement dans le dialogue de l'admin.
- Admin sous `/admin` (rôles `admin` et `moderateur`, `requireEditeur`) ; les autres voient un 404.
- Outils de l'éditeur (`app/lib/document/outils.ts`) : image, document numéroté, encadré, note,
  extrait, chimie, code, algorithme, diagramme, schéma, chronogramme, logique, graphique,
  variations, molécule, génétique. Profil par matière (`matiere.outils`, `null` = tous)
  réglé dans `/admin/listes` ; menu « / » et bouton « Insérer… » (`app/components/editeur/commandes.tsx`).
- Images : bucket R2 `MEDIAS` (clés `m/<uuid>.<ext>`), envoi par `/admin/medias` (type vérifié par
  les premiers octets, 5 Mo max., compressées en WebP dans le navigateur), lecture par `/medias/*`.
  `/admin/images` repère les images citées par aucun sujet (brouillons compris) et les supprime
  (rôle admin, jamais celles envoyées depuis moins de 24 h) : `app/lib/medias/nettoyage*.ts`.
- Bibliothèques lourdes (Mermaid, highlight.js, MathLive, Excalidraw, WaveDrom, SmilesDrawer) : seulement dans
  `charger.client.ts`, chargées à la demande. Ne rien exécuter au chargement d'un module partagé
  avec le serveur.
- Électronique (`app/components/editeur/electronique.tsx`) : schémas Excalidraw enregistrés en PNG
  dans R2 avec la scène incluse (« Modifier » la relit depuis l'image), symboles CEI dans
  `app/lib/document/symboles.ts` ; chronogrammes WaveDrom (SVG passé par DOMPurify, `<use>` limité
  aux références `#…`) ; tableaux de Karnaugh (`app/lib/document/karnaugh.ts`).
- Sciences (`app/components/editeur/sciences.tsx`) : graphiques dans un repère décrits par des
  données (`app/lib/document/graphique.ts`) et dessinés en SVG **sur le serveur**
  (`SvgGraphique`) ; les expressions passent par l'analyseur maison `expression.ts` (jamais
  `eval`). Tableaux de signes et de variations (`variations.ts`, textes en LaTeX). Molécules en
  SMILES dessinées dans le navigateur par SmilesDrawer (`dessinerMolecule`).
- SVT (`app/components/editeur/genetique.tsx`, logique dans `app/lib/document/genetique.ts`) :
  arbre généalogique (individus rangés par génération, unions « au suivant », parent repéré par
  son indice dans la génération précédente ; SVG dessiné sur le serveur) et échiquier de
  croisement (génotype déduit des gamètes, « A//a » = chromosomes homologues, « ; » sépare les
  gènes). Repères sur une image (`reperes` du nœud `image`, coordonnées en fraction, bouton
  « Repères ») pour les schémas à annoter.
- Polices d'Excalidraw servies depuis `public/excalidraw/fonts` (copiées du paquet, sans la police
  chinoise de 13 Mo) : à recopier lors d'une mise à jour d'Excalidraw.

## Architecture

- **React Router 8** en mode framework, rendu serveur, sur **Cloudflare Workers** via
  `@cloudflare/vite-plugin`. Point d'entrée du Worker : `workers/app.ts`.
- Routes déclarées dans `app/routes.ts`. `routes/_app.tsx` est la coquille : en-tête et navigation
  du bas sur téléphone, barre latérale (`BarreLaterale`) dès 1024 px. Une route choisit sa largeur
  sur ordinateur par `export const handle: MiseEnPage = { large, rail }` ; le mobile ne change pas
  (les blocs propres à l'ordinateur sont en `hidden lg:…`). Les routes `api.*` sont des routes de
  ressource (JSON), par exemple `api/apercu/:slug` pour l'aperçu du catalogue.
- Plan d'un énoncé (`app/lib/document/plan.ts`) : sommaire de lecture, aperçu du catalogue et plan
  de l'éditeur ; `RenduDocument` pose les mêmes ancres avec `ancre="enonce"`.
- Préférences de lecture gardées dans le navigateur (`lireLocal` / `ecrireLocal`,
  `app/lib/clavier.ts`) : corrigé à côté, mode examen en cours, notes personnelles, sujets
  récents de la barre latérale (`app/lib/recents.ts`).
- Matières : couleur et pictogramme (`matiere.icone`, liste fermée `app/lib/pictogrammes.ts`,
  tracés dans `app/components/ui/Pictogramme.tsx`) ; `TuileMatiere` pour les petites tuiles.
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
