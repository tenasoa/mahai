---
name: google-design-md
description: >-
  Format officiel DESIGN.md de Google Labs (Stitch) : spécification, linter, diff et export vers
  Tailwind. Utiliser pour écrire, valider ou faire évoluer le DESIGN.md à la racine de Mah.AI, pour
  vérifier qu'il respecte le format, comparer deux versions, ou générer les tokens Tailwind/CSS à
  partir de lui.
---

# DESIGN.md (format Google Labs)

La spécification complète est dans `spec.md`, à côté de ce fichier (copie de
`google-labs-code/design.md`, `docs/spec.md`). La lire avant d'écrire ou de restructurer un DESIGN.md.

En bref : un DESIGN.md = des **tokens lisibles par machine** (front matter YAML : `colors`,
`typography`, `rounded`, `spacing`…) + une **explication en prose** (pourquoi ces valeurs, comment
les appliquer, à faire / à éviter).

## Outils (CLI `@google/design.md`)

```bash
npx @google/design.md lint DESIGN.md                 # vérifie le format (--format json possible)
npx @google/design.md diff DESIGN.md DESIGN-v2.md    # compare deux versions
npx @google/design.md export --format css-tailwind DESIGN.md > theme.css
npx @google/design.md export --format json-tailwind DESIGN.md > tailwind.theme.json
```

Si `npx` se trompe à cause du point dans le nom du binaire, utiliser l'alias :
`npx -p @google/design.md designmd lint DESIGN.md`.

## Règles pour Mah.AI

- Le DESIGN.md du projet est à la racine. Il décrit la **direction A « La copie corrigée »**.
- Toute modification de tokens dans DESIGN.md doit être reportée dans `app/globals.css` et
  `tailwind.config.js` (ou régénérée via `export`), puis lintée.
- Pour s'inspirer d'une marque, voir le skill `awesome-design-md` ; ne jamais copier une identité.
