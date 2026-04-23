# Spécification — Éditeur de Sujet Contributeur

> **Fichier de référence pour l'implémentation.** Ne pas modifier sans validation.
> Source design : `Doc_Mah.AI/Design Luxury/contributeur/06-editor-v2-dark.html` (v2 — référence principale)
> Source design v1 : `Doc_Mah.AI/Design Luxury/contributeur/06-editor-dark.html` (ne pas implémenter)

---

## 1. Routes

| Route | Usage |
|-------|-------|
| `/contributeur/sujets/nouveau` | Création d'un nouveau sujet (modal onboarding au chargement) |
| `/contributeur/sujets/[id]/edit` | Édition d'un sujet existant (sans modal onboarding) |

Fichiers à créer :
```
mahai/app/contributeur/sujets/nouveau/page.tsx
mahai/app/contributeur/sujets/[id]/edit/page.tsx
mahai/app/contributeur/sujets/nouveau/EditorClient.tsx   ← composant client principal
mahai/components/editor/                                 ← tous les sous-composants
```

---

## 2. Layout général

**3 colonnes sticky (desktop) :**
```
max-width: 1600px, padding: 1.25rem
grid-template-columns: 220px 1fr 280px, gap: 1.25rem
```

- **Colonne gauche (220px)** : sticky, scroll indépendant → Métadonnées + Plan du document
- **Colonne centrale (1fr)** : Disc bar + Toolbar + Canvas éditeur
- **Colonne droite (280px)** : sticky, scroll indépendant → Prix + Stats + Visibilité

**Responsive :**
- `< 1100px` : masquer sidebar gauche (accessible via Sheet/Drawer)
- `< 768px` : masquer sidebar droite, afficher bottom bar mobile

---

## 3. Navbar de l'éditeur

Hauteur : `56px`, sticky top 0, `backdrop-filter: blur(12px)`, `z-index: 300`

Contenu (gauche → droite) :
1. **Logo** Mah.AI avec gem animée (or pulsant)
2. **Breadcrumb** : `Mes sujets` › `Nouveau sujet` (DM Mono, uppercase, 0.65rem)
3. **Badge sauvegarde** (centre-droite) : 3 états —
   - `● SAUVEGARDÉ` (sage/vert, animation pulse)
   - `○ Sauvegarde…` (or, spinner)
   - `✕ Erreur` (ruby/rouge)
4. **Compteur de mots** : `xxx mots` (DM Mono, text-3)
5. **Bouton Prévisualiser** (ghost)
6. **Bouton Soumettre** (gold/primary) — désactivé si validation incomplète

**Sauvegarde automatique :**
- Debounce **2000ms** après chaque frappe/modification
- Server Action Next.js : `saveSubjectDraft(id, content)`
- Stocker un `draftId` en localStorage pour reprise de session

---

## 4. Disc bar (barre matières)

Hauteur : `38px`, sticky sous la navbar, `z-index: 299`, scroll horizontal sans scrollbar visible

Boutons filtre par matière (DM Mono, 0.58rem, uppercase) :
- Toutes | Mathématiques | Physique-Chimie | SVT | Histoire-Géo | Français | Philosophie | Anglais | Informatique | Économie

**Amélioration vs design source :**
- Afficher un badge numérique sur chaque matière (nombre de sujets du contributeur dans cette matière)
- Bouton "Toutes" toujours en premier, actif par défaut

---

## 5. Toolbar rich-text

Sticky sous la disc bar, `z-index: 290`. Utiliser **Tiptap** comme moteur (ProseMirror-based).

### Extensions Tiptap à installer
```bash
pnpm add @tiptap/react @tiptap/starter-kit @tiptap/extension-typography @tiptap/extension-placeholder @tiptap/extension-text-align @tiptap/extension-underline @tiptap/extension-highlight @tiptap/extension-code-block-lowlight katex
```

### Groupes de boutons (séparés par `|`)
```
B | I | U | Barré | Code inline
|
Aligner gauche | Centrer | Aligner droite
|
Liste à puces | Liste numérotée
|
∑ Math (inline KaTeX) | Σ Formule (modal KaTeX) | → Symboles (dropdown) | ⊕ Insérer bloc (menu)
```

Chaque bouton : `28×26px`, `border-radius: 2px`, état `.on` → `background: gold, color: void`

---

## 6. Menu d'insertion (⊕)

Menu flottant positionné sous le bouton ⊕, `min-width: 260px`, animé (`opacity + translateY`).

### Section "Structure du sujet"
| Bloc | Icône | Description |
|------|-------|-------------|
| **Partie** | `Ⅰ` (violet) | Section principale numérotée en chiffres romains |
| **Exercice** | `✎` (or) | Exercice numéroté avec barème |
| **Énoncé** | `¶` (neutre) | Contexte et données du problème |
| **Question** | `Q` (or) | Question numérotée avec points |
| **Barème** | `⚖` (neutre) | Tableau de répartition des points |

### Section "Annotations pédagogiques"
| Bloc | Icône | Couleur |
|------|-------|---------|
| **Note** | `💡` | Amber (conseil pratique) |
| **Rappel de cours** | `📗` | Sage (concept clé) |
| **Information** | `ℹ` | Violet |
| **Attention / Piège** | `⚠` | Ruby (erreur fréquente) |
| **Définition** | `📖` | Violet |
| **Théorème / Propriété** | `🔷` | Sage |
| **Exemple résolu** | `✏` | Neutre |
| **Correction (masquée)** | `✓` | Sage — révélée après soumission uniquement |

### Section "Médias & Formules"
| Bloc | Description |
|------|-------------|
| **Formule / Équation** | Ouvre la modal KaTeX |
| **Schéma / Figure** | Placeholder upload image |
| **Tableau** | Grille éditable |
| **Bloc de code** | Syntaxe highlight (lowlight) |

---

## 7. Canvas éditeur

Background : `--card`, `border: 1px solid --b1`, `border-radius: 8px`
`min-height: 680px`, `padding: 2rem 2.5rem 4rem`
Police : `Bricolage Grotesque` (app font) pour le corps — **NE PAS** utiliser Cormorant Garamond du design HTML source.

**État vide :**
- Placeholder italique : *"Commencez par insérer une Partie avec ⊕ ou tapez directement…"*
- **Amélioration** : afficher un guide contextuel interactif (3 cartes cliquables : "Insérer une Partie", "Insérer un Exercice", "Voir un exemple") qui disparaît dès la première frappe ou insertion

### Styles des blocs dans le canvas

#### Partie
```
border: 1px solid --b1
border-radius: 8px
padding: 1.25rem 1.5rem
background: --lift
position: relative
```
Label : DM Mono, 0.62rem, uppercase, or, avec ligne décorative gauche `::before`
Contrôles au survol (top-right) : `↑ ↓ ✕` (20×20px, border or)

#### Exercice
```
border: 1px dashed --b1
border-radius: 4px
padding: 1rem 1.25rem
background: --depth
```
Badge points (float right) : DM Mono, or, `contentEditable` → éditable inline

#### Énoncé
```
border-left: 3px solid --text-3
background: --surface
padding: 0.8rem 1.1rem
font-style: italic
```

#### Question
```
background: --b2, border: 1px solid --b1
display: flex, gap: 0.65rem
```
Numéro (DM Mono, or, min-width 28px) + corps éditable

#### Note (amber), Rappel (sage), Info (violet), Attention (ruby)
```
border: 1px solid <couleur>-line
background: <couleur>-dim
padding: 0.65rem 1rem
border-radius: 4px
display: flex, gap: 0.55rem
```
Icône + label uppercase + corps éditable

#### Définition / Théorème / Exemple / Correction
- Définition : `border-left: 3px solid violet`
- Théorème : `border-radius: 8px, background: sage-dim`
- Exemple : `border-left: 3px solid sage`
- Correction : `border-radius: 8px, background: sage-dim` + tag `[Masquer]`

#### Formule mathématique
```
background: --surface, border: 1px solid --b2
border-radius: 8px, padding: 0.85rem 1.25rem
text-align: center
```
Rendu KaTeX, overflow-x: auto

#### Schéma / Diagramme
```
border: 2px dashed --b1
border-radius: 8px, padding: 2.5rem 1.5rem
text-align: center, cursor: pointer
```
Hover : `border-color: gold-line`

---

## 8. Sidebar gauche — Métadonnées

### Panel "Métadonnées"
Champs (labels DM Mono 0.58rem uppercase, inputs `background: --surface`) :

| Champ | Type | Valeurs |
|-------|------|---------|
| **Matière** | Select | Mathématiques · Physique-Chimie · SVT · Histoire-Géo · Français · Philosophie · Anglais · Informatique · Économie |
| **Niveau** | Select | CEPE · BEPC · BAC |
| **Série** | Select | Dépend du niveau (A · C · D · OSE pour BAC) |
| **Année** | Select | 2015 → 2025 |
| **Durée** | Select | 1h · 2h · 3h · 3h30 · 4h |
| **Coefficient** | Select | 1 · 2 · 3 · 4 · 5 |
| **Tags** | Chips multi-select | Correction incluse · Annale officielle · Difficulté facile/moyen/difficile |

### Panel "Plan du document" (outline tree)
- Généré automatiquement depuis les blocs Partie/Exercice du canvas
- Items cliquables → scroll vers le bloc correspondant
- `.active` : `background: gold-dim, color: gold`
- Sous-items indentés : `padding-left: 1.4rem` (exercices) · `2.2rem` (questions)

---

## 9. Sidebar droite — Tarification & Stats

### Card Prix
Background : `linear-gradient(135deg, --card, rgba(gold, 0.03))`, `border: 1px solid gold-line`

**Header** : `TARIFICATION` (DM Mono, or), background `gold-dim`

**Toggle mode** : `Par page` | `Forfait` (2 boutons inline, `.on` = gold)

**Input prix** : grand champ centré (Bricolage Grotesque, 1.35rem, gold), type number

**Ventilation automatique (réactive) :**
```
Prix affiché étudiant :  xxx Ar
Commission plateforme (30%) : - xxx Ar   [tooltip: "30% de frais de plateforme"]
Vos revenus (70%) :      xxx Ar  ← en gold
```
**Amélioration vs design** : tooltip au survol de chaque ligne expliquant le calcul.

### Stats (grille 2×2)
```
Mots · Pages · Questions · Temps estimé
```
Calculés en temps réel depuis le contenu du canvas.

### Visibilité (radio-like)
3 options :
- 🌐 **Public** — Accessible à tous
- 🔒 **Abonnés** — Abonnés actifs uniquement
- ⭐ **Premium** — Crédits requis

Option `.on` : `border-color: gold, background: gold-dim`

---

## 10. Onboarding multi-step (modal)

Affiché **uniquement** sur `/contributeur/sujets/nouveau` au premier chargement.
`position: fixed, inset: 0, z-index: 600, backdrop-filter: blur(8px)`
Carte : `max-width: 560px`, `border-radius: 8px`, ligne décorative top `linear-gradient(gold)`

### Étape 1 — Informations de base
```
Titre du sujet        [input texte, required]
Matière               [select]
Niveau                [select: CEPE / BEPC / BAC]
Série                 [select: conditionnel au niveau]
Année                 [select: 2015–2025]
```

### Étape 2 — Configuration
**Type de contenu** (grille 2×2, radio visuel) :
- `Sujet seul` — Énoncé uniquement
- `Sujet + Corrigé` — Avec correction détaillée
- `Cours + Exercices` — Support de cours complet
- `Annale officielle` — Document officiel scanné/retranscrit

**Durée** [select] · **Coefficient** [select]

### Étape 3 — Tarification
- Aperçu prix **réactif** (recalcul si type changé à étape 2)
- Affichage ventilation dès cette étape

**Amélioration** : si l'utilisateur change le type de contenu à l'étape 2 après avoir été à l'étape 3, le recalcul se fait automatiquement au retour à l'étape 3.

### Footer modal
```
[← Retour]   Étape X / 3   [Continuer →] ou [Ouvrir l'éditeur]
```
Validation : bouton "Continuer" désactivé si champs obligatoires vides.

---

## 11. Modal Formule KaTeX

`position: fixed, z-index: 800, max-width: 620px`
Ligne décorative top or (identique à onboarding)

### Onglets templates (scroll horizontal)
- **Algèbre** : fractions, puissances, racines, systèmes
- **Analyse** : limites, dérivées, intégrales, suites
- **Géométrie** : vecteurs, angles, aires, volumes
- **Physique** : lois de Newton, électricité, optique
- **Chimie** : équations, concentrations, pH

Chaque template : bouton `78×52px` avec nom + aperçu KaTeX pré-rendu.

### Zone de saisie
- Label : `LATEX`
- Input monospace (DM Mono, or, `background: --surface`)
- Aperçu temps réel (KaTeX render) : `min-height: 54px, border: 1px solid --b2`
- Erreur KaTeX : afficher message en ruby

### Grille de symboles rapides
Lettres grecques · Opérateurs · Physique/Chimie
Boutons `30×27px`, hover → `gold-dim`

### Footer
`[Annuler]` (ghost) · `[Insérer]` (gold primary)

---

## 12. Dropdown Symboles

`position: fixed, min-width: 320px, max-height: 420px, overflow-y: auto`

Sections :
- **Lettres grecques** : α β γ δ ε ζ η θ ι κ λ μ ν ξ π ρ σ τ υ φ χ ψ ω (+ majuscules)
- **Opérateurs** : ∑ ∏ ∫ ∂ ∇ ∞ ± × ÷ ≠ ≤ ≥ ≈ ∈ ∉ ⊂ ⊃ ∪ ∩
- **Physique / Chimie** : → ⇌ ⇒ ⊕ ⊗ ° ℃ Ω μ ħ

Clic sur un symbole → insère dans le canvas à la position du curseur.

---

## 13. Barre mobile (< 768px)

Bottom bar fixe, `height: ~56px`, `backdrop-filter: blur(12px)` :
```
[ ✎ Écrire ] [ ⊕ Insérer ] [ ≡ Métadonnées ] [ ⚙ Paramètres ]
```
Chaque onglet actif en gold.

**Drawers (slide-up depuis le bas) :**
- **Insérer** → menu d'insertion complet
- **Métadonnées** → panneau gauche complet
- **Paramètres** → prix + visibilité

---

## 14. Toast notifications

Position : `bottom: 2rem, right: 2rem`, `z-index: 9999`
Animation : `translateX(16px) → 0 + opacity`

Types :
- ✅ **Succès** (sage) : "Sujet sauvegardé", "Bloc inséré"
- ⚠ **Attention** (amber) : "Titre requis pour soumettre"
- ✕ **Erreur** (ruby) : "Erreur de sauvegarde — réessayez"
- ℹ **Info** (violet) : "Brouillon repris depuis la session précédente"

---

## 15. Contraintes techniques importantes

### Police — IMPORTANT
- **Ne pas** utiliser `Cormorant Garamond` du design HTML source.
- Utiliser `Bricolage Grotesque` (headings) + `DM Mono` (labels/badges) — cohérence avec l'app.
- Corps du canvas : `DM Sans` ou `Outfit` acceptable, selon ce qui est déjà chargé dans l'app.

### Curseur custom — SUPPRIMER
- Le design HTML a `cursor: none` + JS de curseur doré animé.
- **Ne pas porter** en Next.js (inaccessible, mauvaise UX prod).

### Éditeur riche — Tiptap (obligatoire)
- **Ne pas** utiliser un simple `contentEditable` brut.
- Base : Tiptap v2 + extensions custom pour chaque type de bloc.
- Chaque bloc (Partie, Exercice, Question…) = extension Tiptap `NodeView` avec rendu React.
- Sérialisation : JSON Tiptap → stocké en Prisma `Json` field.

### KaTeX
- Rendu côté client uniquement (`import 'katex/dist/katex.min.css'` dans le layout)
- Extension Tiptap pour inline math + block math (utiliser `@tiptap/extension-mathematics` si disponible, sinon custom)

### Sauvegarde
- Server Action : `saveSubjectDraft(subjectId: string, data: SubjectDraftInput)`
- Prisma model : `SubjectSubmission` (existant) avec champ `content Json` + `status: DRAFT`
- Nouveau sujet : créer le brouillon dès la fermeture du modal onboarding step 1 → générer un ID → rediriger vers `/contributeur/sujets/[id]/edit`

### Autorisation
- Route protégée : `role === 'CONTRIBUTEUR'` uniquement
- Vérifier ownership : un contributeur ne peut éditer que ses propres sujets

### Validation avant soumission (bouton "Soumettre")
Champs obligatoires :
- [ ] Titre non vide
- [ ] Matière sélectionnée
- [ ] Niveau sélectionné
- [ ] Année sélectionnée
- [ ] Canvas non vide (au moins 1 bloc)
- [ ] Prix > 0 (si mode payant)

Afficher les erreurs inline + toast récapitulatif.

---

## 16. Schéma de données (Prisma)

Le modèle `SubjectSubmission` existant doit être étendu ou confirmé avec ces champs :

```prisma
model SubjectSubmission {
  id          String   @id @default(cuid())
  title       String
  matiere     String
  niveau      String   // CEPE | BEPC | BAC
  serie       String?
  annee       Int
  duree       String?
  coefficient Int?
  contentType String   // sujet_seul | sujet_corrige | cours_exercices | annale
  content     Json     // JSON Tiptap
  tags        String[] // tableau de tags
  prix        Int      // en Ariary
  prixMode    String   // par_page | forfait
  visibilite  String   // public | abonnes | premium
  status      String   // DRAFT | SUBMITTED | VERIFIED | VALIDATED | PUBLISHED | REJECTED
  authorId    String
  author      User     @relation(fields: [authorId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## 17. Ordre d'implémentation recommandé

1. **Schema Prisma** — Vérifier/compléter le modèle `SubjectSubmission`, `pnpm prisma db push`
2. **Server Actions** — `createDraft`, `saveDraft`, `submitSubject`
3. **Layout éditeur** — Structure 3 colonnes, navbar, responsive
4. **Modal onboarding** — Multi-step avec validation
5. **Sidebar gauche** — Métadonnées + outline (sans outline dynamique d'abord)
6. **Canvas Tiptap** — Éditeur de base (texte riche) + blocs Partie/Exercice/Question
7. **Menu insertion** — Tous les types de blocs
8. **Sidebar droite** — Prix réactif + stats + visibilité
9. **KaTeX** — Modal formule + inline math
10. **Dropdown symboles**
11. **Outline dynamique** — Synchronisation canvas → plan du document
12. **Sauvegarde auto** — Debounce + états badge nav
13. **Validation & soumission**
14. **Mobile** — Bottom bar + drawers
15. **Toasts**

---

*Dernière mise à jour : 2026-04-22 — Source : analyse Design Luxury 06-editor-v2 + améliorations UX/UI*
