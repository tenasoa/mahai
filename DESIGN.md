# Mah.ai — identité « Mosaïque »

Choisie le 24/11/2026 parmi trois pistes (maquettes :
https://claude.ai/artifact/TSYsD63MAyJX21NhY2PXCS). Les jetons vivent dans `app/app.css` (`@theme`).

## L'idée

Chaque matière a sa couleur. L'application est une mosaïque de tuiles que l'élève remplit en
progressant. Ton ludique et énergique, mais une interface légère et lisible.

## Couleurs

| Rôle | Jeton | Valeur | Usage |
|---|---|---|---|
| Encre | `ink` | #17171C | Texte, action principale (pastille sombre) |
| Encre 2 | `ink-2` | #3A3A45 | Texte courant secondaire |
| Gris | `muted` | #55555F | Légendes, onglets inactifs |
| Contour de contrôle | `control` | #8C8C96 | Bordure des champs (3:1 minimum) |
| Filet | `line` | #E2E2E8 | Séparateurs, contours décoratifs |
| Fond doux | `soft` | #F4F4F6 | Cartes, boutons secondaires, onglet actif |
| Fond | `surface` | #FFFFFF | Fond de page |
| Maths | `maths` | #8DB8FF | Tuiles de la matière |
| Français | `francais` | #FF9EC4 | Tuiles de la matière |
| Physique-chimie | `physique` | #FFAE6B | Tuiles de la matière |
| SVT | `svt` | #7ED99B | Tuiles de la matière |
| Histoire-géo | `histoire` | #FFD84D | Tuiles de la matière |
| Juste / À revoir / Erreur | `juste`, `a-revoir`, `erreur` | vert, jaune, rose | États de correction |

Règles :
- Les couleurs de matières **identifient**, elles ne servent jamais de bouton. Le texte posé
  dessus est toujours en `ink`.
- **Une seule action principale par écran** : la pastille `ink` avec texte blanc
  (`ButtonLink` / `Button` variante `primary`).
- Un état (juste, à revoir, erreur) n'est jamais indiqué par la couleur seule : toujours une
  icône et un libellé.
- Pas d'ombre, de dégradé ni de flou.

## Typographie

Lexend (variable, auto-hébergée via `@fontsource-variable/lexend`), conçue pour faciliter la
lecture. Graisses : 400 texte, 500 libellés, 700 titres de section, 800 titres de page.
Chiffres en `tabular-nums` quand ils s'alignent (prix, notes, XP).

## Formes

Rayons : tuiles 20 px (`rounded-tile`), cartes 18 px (`rounded-card`), boutons et champs en
pilule. Zones tactiles de 44 px minimum.

## Écrans

- Mobile d'abord (360 × 800), colonne centrée de 576 px maximum jusqu'à 1024 px.
- Ordinateur (`lg`, 1024 px et plus) : barre latérale à la place de la navigation du bas (réduite
  à un rail d'icônes pendant la lecture d'un sujet). Elle porte la navigation, les sujets récents
  et le mode examen en cours, jamais une liste qui double un filtre de la page (les matières
  sont des tuiles dans le catalogue), pages larges déclarées par
  `export const handle = { large: true }`. L'ordinateur **ajoute** ce que le grand écran permet
  (filtres avec compteurs, tableau et aperçu, sommaire, corrigé à côté, mode examen, raccourcis
  clavier `/`, `↑ ↓`, `C`, `Ctrl S`) sans rien retirer au mobile, qui reste l'écran de référence.
- Chaque écran prévoit ses états : chargement, vide (`EmptyState`), erreur, hors ligne.
- Majuscule en début de phrase seulement, pas d'emoji, ton direct et encourageant.
- Animations courtes et légères (une tuile qui se remplit quand on termine un sujet),
  désactivées si l'appareil demande moins de mouvement.

## Pictogrammes des matières

Chaque matière a un pictogramme au trait (24 × 24, trait de 2, sans remplissage), noir sur sa
tuile de couleur : la couleur ne porte jamais seule l'information. Bibliothèque fermée dans
`app/components/ui/Pictogramme.tsx` (identifiants dans `app/lib/pictogrammes.ts`), choix par
matière dans `/admin/listes`. Toujours décoratif (`aria-hidden`) : le nom est écrit à côté.

