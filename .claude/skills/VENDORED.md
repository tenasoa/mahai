# Skills tiers installés dans ce projet

Copiés tels quels depuis leur dépôt d'origine (licence MIT), relus avant installation et figés sur
le commit ci-dessous. Pour mettre à jour : re-cloner, relire le diff (surtout les `scripts/`), recopier.

| Skill (dossier) | Source | Commit | Notes |
|---|---|---|---|
| `design-taste-frontend` | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) `skills/taste-skill` | `6010f91a9935f1c167dfc500fb1a475681892e6b` | Scripts Node 22+ et Chrome/Chromium (`CHROME_PATH` si besoin). Réseau : uniquement des banques d'images libres (Openverse, Wikimedia, Met, AIC, archive.org, NASA, picsum). |
| `image-to-code` | [Leonxlnx/imagegen-skills](https://github.com/Leonxlnx/imagegen-skills) `skills/image-to-code` | `beb16b0d0f4dae9a6f5cb04ea41e97b93a54ab8e` | Écrit pour Codex : suppose un agent capable de générer des images. Avec Claude Code, lui fournir des maquettes/captures (ou un outil de génération d'images connecté). |
| `web-design-guidelines` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) `skills/web-design-guidelines` | `063bee94c3f4df8453406c830b0a7df0f2860278` | Récupère les règles à jour à chaque revue depuis `vercel-labs/web-interface-guidelines` (accès réseau à GitHub requis). |
| `awesome-design-md` | [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md) | `3b605329240ce735b510037cca322f1831fdd7f8` | Skill d'accès écrit pour Mah.AI : index des 84 marques + récupération à la demande (les fichiers ne sont pas copiés). |

Le serveur MCP **Playwright** (Microsoft) est activé via le plugin officiel
`playwright@claude-plugins-official` dans `.claude/settings.json`.
