# Plan — Améliorations de l'éditeur de sujets (TipTap)

> Plan rédigé le 2026-04-26 — implémentation différée. Reprendre ce document quand tu démarres la Phase A.

## Contexte

L'éditeur actuel (`components/editor/`) est solide : TipTap v3, 7 extensions custom (`partie`, `exercice`, `enonce`, `question`, `annotation`, `formula`, `schema`), toolbar à 19 boutons, modale KaTeX riche, sidebars métadonnées + pricing, MobileBar drawer responsive, auto-save 2 s.

Trois **manques fonctionnels** sont remontés par les contributeurs :

1. **KaTeX inline impossible** — l'utilisateur ne peut pas taper `la formule $x^2 + y^2 = r^2$ dans une phrase` ; les formules sont des **blocs** (atom) à part entière, insérables uniquement via la modale `KaTeXModal`.
2. **Pas de dessin / schéma natif** — le node `schema` est juste un upload d'image (Vercel Blob). Aucune lib de dessin embarquée pour cartographie, circuits électriques/électroniques, plans hiérarchiques.
3. **Toolbar incomplète** — manquent indice/exposant, lien, tableau, séparateur horizontal, headings, formule inline, recherche/remplacer, raccourcis clavier visibles.

Cette phase ajoute ces 3 capacités **sans casser l'éditeur existant**, en réutilisant les extensions TipTap déjà installées (`@tiptap/core`, `@tiptap/react`, `@tiptap/extension-link`, etc.) et le système de NodeView React déjà en place.

---

## Choix techniques discutés

### KaTeX inline : Mark vs Node

TipTap distingue **Marks** (formatage inline qui suit le texte : gras, italique, code, lien) et **Nodes** (blocs ou atomes avec leur propre boîte : paragraphe, image, formule bloc).

Pour les formules **dans une phrase**, on veut un **Mark inline** qui :
- s'applique à un range de texte sélectionné (ex. `x^2 + y` → mark inlineMath)
- est rendu en KaTeX au lieu du texte source
- est éditable via popover quand le curseur est dedans

**Décision :** créer une extension `inlineMath` de type **node atom inline** (pas mark — un mark ne peut pas remplacer le rendu, alors qu'un node atom inline si). C'est le pattern utilisé par les extensions `mention` ou `emoji` de TipTap.

L'alternative « parser `$...$` avec InputRule » est ajoutée par-dessus pour la fluidité de saisie : taper `$x^2$<space>` crée automatiquement un node `inlineMath` avec `latex='x^2'`.

### Dessins : Excalidraw + Mermaid (et garder l'upload image)

| Lib | Usage idéal Mah.AI | Poids | Complexité d'intégration |
|---|---|---|---|
| **Excalidraw** (`@excalidraw/excalidraw`) | Cartographie, schémas électriques **simples**, croquis libres, géométrie | ~600 KB gz | Moyenne — composant React, persiste un JSON + export PNG/SVG |
| **Mermaid** (`mermaid`) | Plans hiérarchiques, organigrammes, ER-diagrammes, flowcharts | ~150 KB gz (lazy) | Faible — texte → SVG, juste un wrapper React |
| **Upload image** (déjà présent) | Schémas complexes générés ailleurs (KiCad, LTSpice, draw.io export) | 0 (existe) | Aucune — déjà branché |

**Décision :** garder les **trois** côte à côte. Le contributeur choisit l'outil adapté :
- besoin de **dessiner main-libre** ou un schéma sommaire → Excalidraw
- besoin d'un **diagramme structuré** texte-vers-image → Mermaid (« écris `graph TD; A-->B` »)
- besoin d'un **schéma pro** (circuit complexe, plan d'ingénierie) → image upload

Pour les circuits électriques/électroniques avancés, **aucune lib browser-native ne tient la route** sans payer Drawio/diagrams.net en SaaS. On laisse la voie « image upload depuis ton outil préféré (KiCad / EasyEDA / Falstad / Circuit Simulator) » comme aujourd'hui — la lib Excalidraw + l'upload couvrent 95 % des cas de figure.

### Toolbar : ne pas tout entasser

Une toolbar trop chargée dégrade l'UX (paradoxe du choix). Plan : grouper les nouveaux boutons dans un **menu déroulant « Plus »** + ajouter un **bubble menu** flottant sur la sélection (TipTap `BubbleMenu`) pour les marks contextuels (gras, italique, lien, indice/exposant, formule inline). Le slash command `/` reste différable (bonus phase E).

---

## Phase A — Formules KaTeX inline

**Objectif :** taper `la dérivée de $f(x) = x^2$ vaut $f'(x) = 2x$.` dans un paragraphe et voir les deux formules rendues KaTeX **dans la phrase**.

### Fichiers à créer

- `components/editor/extensions/inlineMath.ts` — extension TipTap :
  - type `node`, `group: 'inline'`, `inline: true`, `atom: true`
  - attrs : `{ latex: string }`
  - `parseHTML`/`renderHTML` : `<span data-inline-math="latex">…</span>`
  - `addNodeView` → composant React qui rend KaTeX avec `displayMode: false`
  - `addInputRules` → regex `/\$([^$\n]+?)\$/` qui transforme `$x^2$<space>` en node
  - `addPasteRules` → idem pour le coller depuis ChatGPT/PDF
  - `addKeyboardShortcuts` → `Mod-M` ouvre la popover d'édition
- `components/editor/InlineMathPopover.tsx` — popover éphémère affichée quand le curseur est sur un node `inlineMath` :
  - input LaTeX + preview live
  - boutons "Insérer", "Supprimer", "Convertir en bloc"
  - utilisé via `BubbleMenu` ciblé sur ce type de node

### Fichiers à modifier

- `components/editor/extensions.tsx` — registre l'extension `inlineMath` et expose `insertInlineMath(latex)`
- `components/editor/EditorCanvas.tsx` — ajoute `inlineMath` au tableau d'extensions du `useEditor`
- `components/editor/EditorToolbar.tsx` — nouveau bouton **« $ inline »** à côté du bouton **« ∑ Formule »** existant (le bloc reste pour les formules centrées sur leur ligne)
- `components/editor/KaTeXModal.tsx` — ajouter un toggle **Inline / Bloc** au top de la modale ; quand Inline est choisi, l'insertion crée un node `inlineMath` au lieu de `formula`
- `components/sujet/SubjectRenderer.tsx` — gérer le rendu KaTeX inline en lecture (le HTML `<span data-inline-math>` doit être transformé par un `dangerouslySetInnerHTML` filtré OU un parser TipTap-side)
- `lib/ai/prompts.ts::tiptapToText` — ajouter le case `inlineMath` qui sérialise en `$latex$` pour que l'IA reçoive bien la formule
- `components/sujet/SubjectPDF.tsx` — pas de changement nécessaire (le `renderInlineLatex` existant détecte déjà `$...$`)

### Test manuel d'acceptation

1. Dans un paragraphe, taper `Soit $a^2 + b^2 = c^2$ le théorème.` — les deux dollar-bornes disparaissent, la formule est rendue inline
2. Cliquer sur la formule rendue → popover s'ouvre, je peux modifier le LaTeX
3. Coller depuis ChatGPT `Voici $f(x) = \sin(x)$ et $g(x) = \cos(x)$` → les deux formules sont automatiquement converties
4. Soumettre l'exo → l'IA reçoit le LaTeX dans le texte (pas un blob `[FORMULA]`)
5. Téléchargement PDF → les formules apparaissent bien en Courier inline (pas en bloc séparé)

---

## Phase B — Toolbar enrichie + bubble menu

**Objectif :** réduire les frictions courantes (ajouter un lien, indice/exposant chimique `H_2O`, tableau de mesures, séparateur visuel, headings de sous-sections).

### Fichiers à créer

- `components/editor/BubbleToolbar.tsx` — utilise `<BubbleMenu>` de `@tiptap/react`. S'affiche quand l'utilisateur sélectionne du texte. Contient : **B I U S** + indice/exposant + lien + ∑ inline + couleur (optionnel)
- `components/editor/MoreMenu.tsx` — menu déroulant « Plus… » pour la toolbar principale, contenant : table, hr, headings (H2/H3), code-block, image inline (différent du node `schema`)

### Boutons à ajouter à `EditorToolbar.tsx`

| Bouton | Extension TipTap | Action |
|---|---|---|
| **H₂** Indice | `Subscript` (à installer : `@tiptap/extension-subscript`) | `editor.chain().focus().toggleSubscript().run()` |
| **X²** Exposant | `Superscript` (à installer : `@tiptap/extension-superscript`) | idem `toggleSuperscript()` |
| **🔗** Lien | `Link` (déjà présent) | popover URL + label |
| **▭** Tableau | `Table`, `TableRow`, `TableCell`, `TableHeader` (à installer : `@tiptap/extension-table*`) | insère table 3×3 par défaut, menu contextuel pour ajout/suppression de lignes/colonnes |
| **―** Ligne hr | `HorizontalRule` (déjà dans starter-kit) | `setHorizontalRule()` |
| **H** Headings | `Heading` (déjà dans starter-kit) | dropdown H2/H3/H4 (H1 est réservé au titre) |
| **$ inline** Formule inline | `inlineMath` (Phase A) | ouvre `KaTeXModal` en mode inline |
| **« " »** Citation | `Blockquote` (déjà dans starter-kit) | toggleBlockquote |
| **🔍** Rechercher | `extension-search-and-replace` (lib externe ou implé custom) | overlay modal — *différable* |

### Fichiers à modifier

- `package.json` — ajouter `@tiptap/extension-subscript`, `@tiptap/extension-superscript`, `@tiptap/extension-table`, `@tiptap/extension-table-row`, `@tiptap/extension-table-cell`, `@tiptap/extension-table-header`
- `components/editor/extensions.tsx` — registre des nouvelles extensions
- `components/editor/EditorToolbar.tsx` — ajout des boutons + un dropdown « Plus… » qui ouvre `MoreMenu`
- `components/editor/MobileBar.tsx` — onglet « Écrire » : grouper les nouveaux boutons dans une grille 4×N (touch-friendly)
- `components/sujet/SubjectRenderer.tsx` + `components/sujet/SubjectPDF.tsx` — supporter les nouveaux nodes (table, sub/sup, hr, heading)
- `components/editor/editor.css` — styles pour les tables (bordures, padding, header strip), highlight des sub/sup, lien souligné

### A11y bonus (à inclure ici)

- Tous les boutons toolbar reçoivent un `aria-label` + `title` (tooltip visible au hover)
- Documentation des raccourcis dans une **petite modale « ? Raccourcis »** ouverte par `Mod-/` ou un bouton ⓘ dans la toolbar
- Navigation tabbable forcée sur la toolbar (chaque bouton est focusable au clavier)

---

## Phase C — Dessins (Excalidraw + Mermaid)

**Objectif :** permettre au contributeur d'**insérer un dessin** (cartographie, schéma simple, circuit) ou un **diagramme structuré** (organigramme, hiérarchie, flowchart) sans quitter l'éditeur.

### Architecture : 2 nouveaux nodes côte à côte

```
schema (existe)        → image upload (KiCad, LTSpice, dessin externe)
drawing (nouveau)      → Excalidraw — dessin libre, schémas pédago
diagram (nouveau)      → Mermaid — diagrammes texte-vers-SVG
```

Le menu **⊕ Insérer** propose désormais 4 options visuelles :
- 🖼 Importer une image (existant — `schema`)
- ✏️ Dessiner (nouveau — `drawing`)
- 📊 Diagramme texte (nouveau — `diagram`)
- ∑ Formule (existant — `formula`)

### C.1 — Node `drawing` (Excalidraw)

**Stockage :**
- `attrs.elements` : JSON des éléments Excalidraw (sérialisable, ~5-50 KB par dessin)
- `attrs.previewUrl` : URL Vercel Blob du PNG export (pour l'affichage rapide quand le contributeur ne réédite pas)
- `attrs.width`, `attrs.height` : dimensions du canvas

**Fichiers à créer :**
- `components/editor/extensions/drawing.ts` — extension TipTap (node block, NodeView React)
- `components/editor/DrawingNodeView.tsx` :
  - mode lecture : affiche `<img src={previewUrl}>` (rapide, pas de JS Excalidraw chargé tant que pas édition)
  - mode édition : lazy-import `@excalidraw/excalidraw` (split de bundle), affiche le canvas, bouton **Enregistrer** qui :
    1. exporte le PNG via `exportToBlob`
    2. upload le PNG sur `/api/editor/upload-image` (réutilise l'endpoint existant)
    3. met à jour `attrs.elements` (JSON) et `attrs.previewUrl`
- `components/editor/DrawingModal.tsx` — fullscreen modal pour l'édition (l'inline canvas est trop petit sur mobile)

**Dépendances :**
- `package.json` — ajouter `@excalidraw/excalidraw` (via `pnpm add @excalidraw/excalidraw`)

**Rendu lecture (`SubjectRenderer`) :** image PNG via `<img src={previewUrl}>` avec lien « ouvrir en grand » qui montre le PNG en lightbox.

**Rendu PDF (`SubjectPDF`) :** image embed via `<Image src={previewUrl}>` de `@react-pdf/renderer` (déjà utilisé pour le filigrane logo).

### C.2 — Node `diagram` (Mermaid)

**Stockage :**
- `attrs.code` : source Mermaid (ex. `graph TD; A-->B; B-->C`)
- `attrs.previewSvg` : SVG rendu (cache)

**Fichiers à créer :**
- `components/editor/extensions/diagram.ts` — extension TipTap
- `components/editor/DiagramNodeView.tsx` :
  - éditeur split : à gauche un `<textarea>` Mermaid, à droite la preview SVG live (re-render après debounce 500 ms)
  - templates précâblés : « Hiérarchie », « Flowchart », « ER-diagramme », « Sequence », « Pie chart »
  - bouton **Enregistrer** persiste `code` + `previewSvg`
- `components/editor/DiagramTemplates.ts` — 5 templates Mermaid prêts à coller

**Dépendances :**
- `package.json` — ajouter `mermaid` (via `pnpm add mermaid`) ; côté `SubjectRenderer` (lecture) on peut juste injecter le SVG cached, donc Mermaid n'est chargé que dans l'éditeur

**Rendu lecture :** `<div dangerouslySetInnerHTML={{ __html: previewSvg }}>` (SVG est safe car généré côté client par Mermaid, validé)

**Rendu PDF :** convertir le SVG en PNG côté client avant upload (similaire à Excalidraw) — ou afficher un placeholder « Diagramme – voir version web » si la conversion est trop lourde

### C.3 — Documentation utilisateur courte

- `docs/EDITOR_DRAWING_GUIDE.md` — petite page (10 lignes par outil) avec exemples : « Comment dessiner un circuit avec Excalidraw », « Comment écrire une hiérarchie en Mermaid »

### Test manuel d'acceptation

1. Dans un nouvel exo, ⊕ Insérer → Dessiner → Excalidraw s'ouvre fullscreen → dessiner un triangle → Enregistrer → image PNG visible dans l'éditeur
2. Rouvrir le dessin (clic) → les éléments sont restaurés (pas juste le PNG)
3. ⊕ Insérer → Diagramme → écrire `graph LR; A-->B-->C` → preview SVG instantanée → Enregistrer
4. Lecture du sujet → image et SVG bien affichés
5. PDF du sujet → image visible, diagramme visible (ou placeholder si conversion ratée)
6. Upload classique d'image (`schema`) → continue de fonctionner sans régression

---

## Phase D — Validation & qualité de vie

**Objectif :** réduire les soumissions bâclées avant qu'elles n'arrivent en review (synergie avec l'auto-review IA prévue dans le plan IA Phase 2).

### Fichiers à créer

- `lib/editor/lint.ts` — fonctions pures qui parcourent le contenu TipTap et retournent une liste de warnings :
  - `lintSubject(content): { level: 'info'|'warn'|'error', message: string, nodePos?: number }[]`
  - règles : *« aucune partie définie »*, *« exercice sans points »*, *« énoncé manquant dans l'exercice 2 »*, *« somme des points = 18, attendu 20 »*, *« questions sans numéro »*, etc.
- `components/editor/LintPanel.tsx` — panneau dépliable dans la sidebar droite (sous Pricing) qui liste les warnings ; clic sur un warning scroll-to-node

### Fichiers à modifier

- `components/editor/MetadataSidebar.tsx` ou `EditorClient.tsx` — calcule les warnings après chaque édition (debounce 1 s) et passe à `LintPanel`
- `actions/contributeur/submissions.ts` — sur submit, si des warnings de niveau `error` existent, demander confirmation explicite

### Auto-save indicateur visuel

- `EditorNavbar.tsx` (ou wherever vit le top bar) — afficher un petit point coloré + texte :
  - 🟡 « Modifications non sauvegardées… »
  - 🟢 « Sauvegardé il y a 3 s »
  - 🔴 « Erreur de sauvegarde — réessayer »

---

## Roadmap pas-à-pas

| Étape | Livrable | Durée estimée | Prérequis |
|---|---|---|---|
| **A1** | `inlineMath` extension + InputRule + NodeView | 3 h | aucun |
| **A2** | `InlineMathPopover` + bouton toolbar `$ inline` | 1.5 h | A1 |
| **A3** | Modifier `KaTeXModal` (toggle inline/bloc) | 1 h | A1 |
| **A4** | `SubjectRenderer` + `tiptapToText` (IA) supportent inline | 1 h | A1 |
| **A5** | Tests manuels Phase A | 30 min | A4 |
| **B1** | Installer `@tiptap/extension-{subscript,superscript,table,table-*}` | 15 min | A terminé |
| **B2** | Ajouter boutons indice/exposant/lien/hr/headings + `MoreMenu` | 2 h | B1 |
| **B3** | Ajouter table avec menu contextuel basique | 2 h | B1 |
| **B4** | `BubbleToolbar` (TipTap BubbleMenu) | 1.5 h | B2 |
| **B5** | A11y : aria-labels + modale `? Raccourcis` | 1 h | B4 |
| **B6** | `SubjectRenderer` + `SubjectPDF` supportent les nouveaux nodes | 1.5 h | B3 |
| **C1** | Installer `@excalidraw/excalidraw`, créer node `drawing` + NodeView lecture (PNG) | 3 h | B terminé |
| **C2** | `DrawingModal` (édition fullscreen), enregistrement JSON + PNG vers Blob | 3 h | C1 |
| **C3** | Installer `mermaid`, créer node `diagram` + NodeView split editor | 3 h | C1 |
| **C4** | Templates Mermaid + tests sur diagrammes complexes | 1 h | C3 |
| **C5** | `SubjectRenderer` + `SubjectPDF` supportent `drawing` et `diagram` | 1.5 h | C3 |
| **C6** | Doc utilisateur `docs/EDITOR_DRAWING_GUIDE.md` | 1 h | C5 |
| **D1** | `lib/editor/lint.ts` + règles de base | 2 h | C terminé |
| **D2** | `LintPanel.tsx` + intégration sidebar | 1.5 h | D1 |
| **D3** | Indicateur auto-save visible | 30 min | D2 |

**Total : ~31 h de dev** sur 4 phases livrables indépendamment. Ordre recommandé : A → B → C → D, chaque phase validée avant la suivante (pas de big-bang).

---

## Vérifications end-to-end

### Phase A (KaTeX inline)
- Taper `Soit $a + b = c$ et calculons.` → `a + b = c` rendu KaTeX
- Mod-M ouvre la popover de modification
- Coller depuis ChatGPT → conversion auto
- IA reçoit le LaTeX brut (vérifier les logs)
- PDF affiche les formules en Courier inline

### Phase B (Toolbar)
- Sélectionner un mot → bubble menu apparaît avec B/I/U/lien/sub/sup
- Bouton tableau → table 3×3 insérée, menu contextuel pour add row/col
- Bouton headings → dropdown, choisir H3 → texte transformé
- Mod-/ ouvre la modale des raccourcis
- Tab navigue les boutons toolbar

### Phase C (Dessins)
- ⊕ Insérer → Dessiner → Excalidraw s'ouvre, dessiner un schéma de circuit simple, sauvegarder → PNG visible dans l'éditeur
- Rouvrir → édition reprend depuis le JSON, pas depuis le PNG
- ⊕ Insérer → Diagramme → écrire un flowchart en Mermaid → preview live, sauvegarder
- Bundle size : Excalidraw n'est chargé qu'à l'ouverture du modal (split de bundle vérifiable dans `next build`)
- Lecture sur `/sujet/[id]` → tous les schémas s'affichent
- PDF download → tous les schémas embarqués en image

### Phase D (Validation)
- Créer un exo sans énoncé → warning visible dans `LintPanel`, scroll-to-node fonctionne
- Soumettre avec une erreur de niveau `error` → modale de confirmation
- Modifier un caractère → indicateur passe à 🟡 puis 🟢 après 2 s

---

## Notes pour démarrer (utilisateur débutant)

- **Commence par la Phase A** : c'est le fix le plus impactant et le plus petit. Les contributeurs râlent surtout là-dessus.
- **Avant la Phase B**, vérifier sur tablette/mobile que l'ajout de boutons ne casse pas le `MobileBar` (qui scroll horizontalement).
- **Phase C est la plus longue** mais la plus visible côté contributeur. Si tu manques de temps, livre **Mermaid d'abord** (plus simple, moins de code) puis Excalidraw plus tard.
- **Phase D peut être différée** si tu préfères implémenter d'abord l'**auto-review IA** (cf. plan `2026-04-26-ai-phase-2-chatbot-autoreview-recos.md` — Phase B). Les deux se complètent : le linter règle le formel, l'IA règle le pédagogique.
- **Ne pas toucher aux extensions existantes** (`partie`, `exercice`, etc.) sans raison forte — elles sont déjà éprouvées et la numérotation auto est fragile.
