# Skills tiers installés dans ce projet

Copiés tels quels depuis leur dépôt d'origine (licence MIT), relus avant installation et figés sur
le commit ci-dessous. Pour mettre à jour : re-cloner, relire le diff (surtout les `scripts/`), recopier.

| Skill (dossier) | Source | Commit | Notes |
|---|---|---|---|
| `design-taste-frontend` | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) `skills/taste-skill` | `6010f91a9935f1c167dfc500fb1a475681892e6b` | Scripts Node 22+ et Chrome/Chromium (`CHROME_PATH` si besoin). Réseau : uniquement des banques d'images libres (Openverse, Wikimedia, Met, AIC, archive.org, NASA, picsum). |
| `image-to-code` | [Leonxlnx/imagegen-skills](https://github.com/Leonxlnx/imagegen-skills) `skills/image-to-code` | `beb16b0d0f4dae9a6f5cb04ea41e97b93a54ab8e` | Écrit pour Codex : suppose un agent capable de générer des images. Avec Claude Code, lui fournir des maquettes/captures (ou un outil de génération d'images connecté). |
| `web-design-guidelines` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) `skills/web-design-guidelines` | `063bee94c3f4df8453406c830b0a7df0f2860278` | Récupère les règles à jour à chaque revue depuis `vercel-labs/web-interface-guidelines` (accès réseau à GitHub requis). |
| `awesome-design-md` | [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md) | `3b605329240ce735b510037cca322f1831fdd7f8` | Skill d'accès écrit pour Mah.AI : index des 84 marques + récupération à la demande (les fichiers ne sont pas copiés). |
| `ui-ux-pro-max` | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) `.claude/skills/ui-ux-pro-max` | `d14efff8ed1faa4187f004f79926f428c8074ec7` | MIT. Scripts Python locaux (recherche dans ses CSV), aucun appel réseau. |
| `impeccable` | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) `.claude/skills/impeccable` | `33003f1013a636e612752a1cad7b82b8bb4c67f2` | Apache-2.0. ⚠️ Le lanceur `scripts/impeccable` télécharge au premier usage un **binaire natif** (moteur v0.1.16) depuis les releases GitHub de l'auteur et vérifie son SHA-256 avant de l'exécuter. Ce binaire n'a pas été relu. |
| `emil-design-eng`, `animate`, `review-animations`, `improve-animations`, `animation-vocabulary`, `animation-performance`, `find-animation-opportunities`, `break-ui`, `prototype`, `pick-ui-library`, `apple-design` | [emilkowalski/skills](https://github.com/emilkowalski/skills) `skills/` | `2d228630ba1446365f614a108cb8252f1feda202` | MIT. Skills web uniquement (Swift, Expo, mobile natif et Sonner non installés). |
| `hallmark` | [Nutlope/hallmark](https://github.com/Nutlope/hallmark) `skills/hallmark` | `7ec868225c6caa040558c321ee0fefa0e73f83a8` | MIT. `scripts/install-hook.mjs` ajoute un hook de lint dans `.claude/settings.json` **seulement si on le lance**. `scripts/imagegen.mjs` utilise l'API Together (clé `TOGETHER_API_KEY`, payante, optionnelle). |
| `gsap-core`, `gsap-timeline`, `gsap-scrolltrigger`, `gsap-react`, `gsap-plugins`, `gsap-utils`, `gsap-performance`, `gsap-frameworks` | [greensock/gsap-skills](https://github.com/greensock/gsap-skills) `skills/` | `aed9cfd3277740755f6bfc1155c7aa645403b760` | MIT. Skills officiels GSAP (GSAP et tous ses plugins sont gratuits). |
| `scroll-world` | [oso95/scroll-world](https://github.com/oso95/scroll-world) `skills/scroll-world` | `71cc36d3bb150248ae36a2c552f9cbf88802a79c` | MIT. ⚠️ **Payant à l'usage** : vidéos générées via Monid / Higgsfield (≈ 27 $ pour 6 scènes en 1080p), CLI `higgsfield` authentifiée et `ffmpeg` requis. |
| `reference-design-contract`, `faq-page`, `motion-design` | [nexu-io/open-design](https://github.com/nexu-io/open-design) `skills/` | `e03d5c23f308c39f4de7c057568df66c29a84385` | Apache-2.0. Sélection : la plupart des 171 skills du dépôt sont des fiches qui renvoient ailleurs, des doublons (taste, gsap, emil, impeccable…) ou dépendent d'API payantes. |
| `google-design-md` | [google-labs-code/design.md](https://github.com/google-labs-code/design.md) `docs/spec.md` | `6e5da5382f41edbba9d73b2c62f33f32e9971f15` | Apache-2.0. Skill d'accès écrit pour Mah.AI : spécification copiée + CLI `@google/design.md` (lint, diff, export). Le skill `design-md` de `stitch-skills` n'est pas installé : il exige le serveur MCP Stitch. |
| `react-bits` | [DavidHDev/react-bits](https://github.com/DavidHDev/react-bits) | `e12c22192ac7b4b452c5e2feb9b586d74765d696` | MIT + Commons Clause. Skill d'accès écrit pour Mah.AI ; les composants passent par le registre `@react-bits` (`components.json`) et le serveur MCP `shadcn` (`.mcp.json`). |

Le serveur MCP **Playwright** (Microsoft) est activé via le plugin officiel
`playwright@claude-plugins-official` dans `.claude/settings.json`.
Le serveur MCP **shadcn** (pour React Bits) est déclaré dans `.mcp.json` à la racine.

**Non installé :** « Canvas UI » — aucun skill de ce nom trouvé. Le plus proche, `canvas-design`
(Anthropic), est déjà disponible au niveau du compte.
