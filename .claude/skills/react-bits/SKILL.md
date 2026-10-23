---
name: react-bits
description: >-
  React Bits : 215+ composants React animés et fonds animés gratuits (texte qui se découpe, compteurs,
  fonds, curseurs…), ajoutés au projet en code source via le registre shadcn et le serveur MCP
  shadcn. Utiliser quand on veut un effet animé prêt à l'emploi pour Mah.AI, plutôt que de l'écrire
  à la main.
---

# React Bits

Bibliothèque de [React Bits](https://reactbits.dev) (DavidHDev/react-bits). Les composants sont
**copiés en code source** dans le projet (comme shadcn), pas installés comme dépendance npm.

## Comment l'utiliser ici

1. Le registre `@react-bits` est déclaré dans `components.json` à la racine.
2. Le serveur MCP `shadcn` est déclaré dans `.mcp.json` : il permet de chercher et d'ajouter un
   composant (« ajoute le composant SplitText de @react-bits »).
3. Sans MCP : `npx shadcn@latest add @react-bits/<Nom>-TS-TW` (variante TypeScript + Tailwind).
   Toujours choisir la variante **TS-TW** : le projet est en TypeScript + Tailwind 3.

## Règles pour Mah.AI

- Un composant React Bits est un point de départ : l'adapter aux tokens de DESIGN.md (couleurs,
  police Bricolage Grotesque, coins carrés) avant de l'utiliser.
- Toujours prévoir `prefers-reduced-motion` : l'animation ne doit jamais cacher du contenu.
- Pas d'effet décoratif sans raison : un effet doit servir l'idée de la page (voir
  `design-taste-frontend` et `emil-design-eng`).

## Licence

MIT + Commons Clause (voir `LICENSE.md`) : utilisation libre dans Mah.AI, y compris commerciale ;
interdit seulement de revendre les composants eux-mêmes comme produit.
