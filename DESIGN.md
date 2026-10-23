---
version: alpha
name: Mah.AI — La copie corrigée
description: "Direction A. Le site est une copie d'examen posée sur une table : papier à grands carreaux Seyès, encre bleue pour le texte et les actions, stylo rouge réservé à la correction. Une seule police de texte (Bricolage Grotesque), une écriture manuscrite (Caveat) uniquement pour les annotations du correcteur."
colors:
  ground: "#ddd6c6"
  ground-app: "#f1eee6"
  paper: "#fbfaf6"
  paper-step: "#ede8dc"
  on-surface: "#23231f"
  on-surface-muted: "#59574e"
  primary: "#1b2550"
  primary-hover: "#2a3670"
  on-primary: "#ffffff"
  correction: "#c8231b"
  error: "#c8231b"
  margin-line: "#e2574c"
  seyes-line: "rgba(61, 96, 180, 0.16)"
  success: "#4f6238"
  warning: "#8a5a00"
  hairline: "#d2cab8"
  footer: "#23231f"
  on-footer: "#ddd6c6"
typography:
  headline-display:
    fontFamily: Bricolage Grotesque
    fontSize: 6.75rem
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Bricolage Grotesque
    fontSize: 3.75rem
    fontWeight: 700
    lineHeight: 1
    letterSpacing: -0.035em
  headline-md:
    fontFamily: Bricolage Grotesque
    fontSize: 2rem
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -0.02em
  body-lg:
    fontFamily: Bricolage Grotesque
    fontSize: 1.375rem
    fontWeight: 400
    lineHeight: 1.45
  body-md:
    fontFamily: Bricolage Grotesque
    fontSize: 1.125rem
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: Bricolage Grotesque
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.5
  label-md:
    fontFamily: Bricolage Grotesque
    fontSize: 1rem
    fontWeight: 600
    lineHeight: 1.2
  pen-lg:
    fontFamily: Caveat
    fontSize: 2.125rem
    fontWeight: 700
    lineHeight: 1.15
  pen-md:
    fontFamily: Caveat
    fontSize: 1.625rem
    fontWeight: 500
    lineHeight: 1.15
rounded:
  none: 0px
  full: 9999px
spacing:
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  section: 160px
  gutter: 32px
  gutter-mobile: 16px
  content-max: 1376px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.none}"
    padding: 18px 28px
    height: 48px
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.none}"
    padding: 10px 22px
  link:
    textColor: "{colors.primary}"
    typography: "{typography.label-md}"
  link-hover:
    textColor: "{colors.correction}"
  sheet:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.none}"
    padding: 56px 48px 64px 120px
  panel:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.none}"
    padding: 24px
  panel-row:
    backgroundColor: "{colors.paper-step}"
    padding: 16px
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.none}"
    padding: 14px 16px
    height: 48px
  input-error:
    textColor: "{colors.error}"
  page:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.on-surface}"
  app-shell:
    backgroundColor: "{colors.ground-app}"
    textColor: "{colors.on-surface}"
  text-muted:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.on-surface-muted}"
  sheet-margin-line:
    backgroundColor: "{colors.margin-line}"
    width: 2px
  sheet-rule:
    backgroundColor: "{colors.seyes-line}"
    height: 1px
  status-success:
    backgroundColor: "{colors.paper-step}"
    textColor: "{colors.success}"
  status-warning:
    backgroundColor: "{colors.paper-step}"
    textColor: "{colors.warning}"
  table-rule:
    backgroundColor: "{colors.hairline}"
    height: 1px
  footer:
    backgroundColor: "{colors.footer}"
    textColor: "{colors.on-footer}"
  annotation:
    textColor: "{colors.correction}"
    typography: "{typography.pen-lg}"
  grade-circle:
    textColor: "{colors.correction}"
    typography: "{typography.pen-lg}"
    rounded: "{rounded.full}"
---

# Mah.AI — La copie corrigée

## Overview

Mah.AI vend des sujets d'examens malgaches (CEPE, BEPC, BACC) avec leur corrigé, et fait corriger la
copie de l'élève par une IA. L'idée de la direction : **la copie d'examen devient la page, et la
correction IA devient l'encre rouge dans la marge.** Un élève, un parent ou un enseignant reconnaît
l'objet au premier coup d'œil.

Deux surfaces partagent le même système :

- **Pages publiques** (accueil, catalogue, sujet, blog…) : fond `ground` (la table), une ou deux
  « feuilles » `paper` à carreaux Seyès qui portent le contenu principal.
- **Écrans d'application** (espace élève, contributeur, admin) : fond `ground-app` plus clair,
  panneaux `paper` sans carreaux. Calme, dense, lisible ; l'encre rouge garde son rôle.

Ton : direct, chaleureux, tutoiement pour les élèves. Pas de jargon marketing.

## Colors

- **Ground (#ddd6c6)** : la table sous la copie, fond des pages publiques.
- **Ground app (#f1eee6)** : fond des écrans d'application, un ton plus clair.
- **Paper (#fbfaf6)** et **Paper step (#ede8dc)** : la feuille, et un pas de ton pour séparer deux
  surfaces sans trait ni ombre.
- **On-surface (#23231f)** : tout le texte courant, en pleine encre. Le gris **on-surface-muted
  (#59574e)** est réservé aux notes secondaires.
- **Primary (#1b2550)** : l'encre bleue du stylo à bille. Titres de pages publiques, boutons, liens.
- **Correction (#c8231b)** : le stylo rouge. Réservé à ce qui corrige ou alerte : annotations, notes
  sur 20, erreurs de formulaire, montants refusés. Jamais décoratif, jamais sur un bouton d'action.
- **Margin line (#e2574c)** et **Seyès line** : les deux seuls traits du système, ceux de la copie
  elle-même.
- **Success (#4f6238)** et **Warning (#8a5a00)** : statuts (en vente, en relecture, en attente).

Tous les couples texte/fond respectent WCAG AA (4,5:1) : on-surface-muted sur ground ≈ 5:1,
correction sur paper ≈ 5,6:1, success sur paper-step ≈ 5,3:1.

## Typography

Une seule famille pour tout le texte : **Bricolage Grotesque** (Google Fonts, 400/600/700).
**Caveat** n'apparaît que dans les annotations du correcteur (stylo rouge) : jamais pour un titre,
un bouton ou un paragraphe.

- Trois tailles font l'essentiel du travail : un titre très grand, le texte courant, une note.
- `headline-display` est la taille desktop du titre d'accueil ; sur mobile il descend à ~3rem
  (en CSS : `clamp(48px, 6.6vw, 108px)`). Même principe pour `headline-lg`
  (`clamp(36px, 4vw, 60px)`).
- Titres : 2 lignes maximum à toutes les largeurs, interlettrage négatif, alignés à gauche.
- Texte courant : 16–22px, 45–75 caractères par ligne.
- Chiffres alignés (`font-variant-numeric: tabular-nums`) pour les montants en Ariary et les notes.

## Layout

- Contenu centré dans `content-max` (1376px), marges `gutter` (32px) sur desktop, `gutter-mobile`
  (16px) sur téléphone, identiques à gauche et à droite.
- Écart entre sections publiques : `section` (160px) sur desktop, ~96px sur mobile ; toujours plus
  grand que n'importe quel écart interne.
- Sections voisines de composition différente : une feuille, puis un aplat d'encre bleue, puis un
  tableau…, jamais trois grilles de cartes identiques à la suite.
- Écrans d'application : barre latérale de 224px (`sidebar` du projet), contenu fluide, panneaux
  espacés de 12px. Sur mobile la barre latérale passe au-dessus.
- Une moitié d'écran n'est jamais vide : si le texte occupe la gauche, la droite porte la feuille,
  l'image, le tableau ou l'aperçu d'interface.

## Elevation & Depth

Aucune ombre au repos, aucun dégradé, aucun flou. La profondeur vient de l'empilement de la feuille
`paper` sur la table `ground`, et de pas de ton (`paper` → `paper-step`). Seuls les éléments
réellement flottants (menu déroulant, boîte de dialogue, toast) prennent une ombre courte.

## Shapes

Coins carrés partout (`rounded.none`) : boutons, champs, panneaux, feuilles. Seule exception : le
cercle rouge tracé autour d'une note (`grade-circle`, `rounded.full`), comme au stylo.

## Components

- **Bouton principal** : aplat encre bleue, texte blanc, coins carrés, 48px de haut minimum. Un seul
  par écran.
- **Bouton secondaire** : contour encre bleue de 2px, fond transparent ; s'inverse quand il est
  sélectionné (choix de réponse, filtres).
- **Lien** : encre bleue soulignée, rouge au survol.
- **Feuille (`sheet`)** : papier à carreaux Seyès + ligne de marge rouge à 88px du bord gauche.
  Porte le contenu principal d'une page publique.
- **Panneau (`panel`)** et **ligne de panneau (`panel-row`)** : surfaces des écrans d'application.
- **Champ (`input`)** : fond papier, bordure 2px `hairline`, encre bleue au focus ; message d'erreur
  écrit en rouge sous le champ.
- **Annotation** : texte Caveat rouge, légèrement incliné (-3° à -7°), dans la marge ou sous la
  réponse. **Note** : chiffre Caveat rouge entouré d'un cercle.
- **Statuts** : texte en couleur de statut, pas de pastille colorée ni de badge en capsule.
- **Tableaux** : seuls endroits où des filets `hairline` de 1px sont permis.

## Do's and Don'ts

- Do : garder le rouge pour la correction ; si tout est rouge, plus rien ne corrige.
- Do : écrire les montants en Ariary entiers (« 150 Ar », « 2 350 Ar »), espace fine des milliers.
- Do : montrer le vrai produit (un vrai sujet, une vraie correction) plutôt qu'une illustration.
- Do : respecter `prefers-reduced-motion` ; aucun contenu ne doit dépendre d'une animation pour
  apparaître.
- Don't : pas de petite étiquette en capitales au-dessus des titres, pas de pastille « Nouveau ».
- Don't : pas d'emoji, pas d'icône dans un carré coloré au-dessus de cartes identiques.
- Don't : pas de violet, pas de dégradé, pas d'effet verre, pas d'ombre au repos.
- Don't : pas de numérotation décorative (01 / 02 / 03) ; une vraie liste ordonnée si l'ordre compte.
- Don't : pas de Caveat pour autre chose qu'une annotation de correcteur.
- Don't : ne jamais inventer de chiffres (nombre d'élèves, taux de réussite, avis) sur les pages.
