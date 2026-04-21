# Pattern Sidebar Mah.AI — Style Comet

Ce document décrit le pattern utilisé pour toutes les sidebars de rôle (Admin, Contributeur, et à venir : Professeur, Validateur, Vérificateur).

## Comportement attendu

### Mode étendu (expanded)
- Header affiche : **logo à gauche** + **bouton toggle à droite** (ChevronLeft)
- Tous les textes, labels, badges et sections visibles
- Le toggle permet de réduire la sidebar

### Mode réduit (collapsed)
- Header affiche uniquement le **logo centré**
- Au **hover sur le header** : le logo disparaît (opacity 0) et un **bouton toggle** apparaît à la place (ChevronRight) couvrant toute la zone
- Le clic sur le header entier (et pas uniquement sur le bouton) déploie la sidebar
- Les labels des liens sont masqués, seuls les icônes restent visibles
- Tooltips au hover des icônes

### Mode mobile (<1024px)
- Sidebar slide-in depuis la gauche via un bouton hamburger flottant
- Overlay sombre derrière avec fermeture au clic
- Bouton fermer (X) dans le header de la sidebar

## Structure JSX à respecter

```tsx
<aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
  {/* HEADER LOGO AVEC TOGGLE INTÉGRÉ */}
  <div
    className="sb-logo"
    onClick={isCollapsed ? toggleSidebar : undefined}
  >
    <div className="sb-logo-row">
      <Link
        href="/"
        className="sb-logo-main"
        onClick={(e) => { if (isCollapsed) e.preventDefault() }}
        aria-label="Mah.AI"
      >
        Mah<span className="sb-gem" />AI
      </Link>

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); toggleSidebar() }}
        className="sb-toggle-inline"
        aria-label={isCollapsed ? 'Étendre' : 'Réduire'}
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </div>
    {/* Optionnel : badge de rôle sous le logo (masqué en collapsed) */}
    <span className="sb-role-badge">⚡ Professeur</span>
  </div>

  {/* NAV PRINCIPAL */}
  <nav className="sb-nav">
    {/* Liens avec data-tooltip pour tooltips en collapsed */}
  </nav>

  {/* FOOTER (theme toggle + profil) */}
  <div className="sb-footer">
    ...
  </div>
</aside>
```

## Classes CSS essentielles

| Classe | Rôle |
|--------|------|
| `.sb-logo` | Wrapper header logo (clickable en collapsed) |
| `.sb-logo-row` | Flex row avec logo + bouton toggle |
| `.sb-logo-main` | Le texte/lien du logo (opacity transition) |
| `.sb-toggle-inline` | Bouton toggle (visible toujours en expanded, au hover en collapsed) |
| `.sb-nav` | Navigation principale |
| `.sb-section` | Titre de section (ex: "Vue générale") |
| `.sb-link` | Lien de navigation |
| `.sb-link-text` | Label du lien (masqué en collapsed) |
| `.sb-footer` | Footer avec theme toggle + profil |

## États à gérer côté React

```tsx
const [isCollapsed, setIsCollapsed] = useState(false)
const [isMobileOpen, setIsMobileOpen] = useState(false)
const [isMounted, setIsMounted] = useState(false)

// Persistance dans localStorage
useEffect(() => {
  const saved = localStorage.getItem('mahai_<ROLE>_sidebar_collapsed')
  if (saved !== null) setIsCollapsed(saved === 'true')
  setIsMounted(true)
}, [])

const toggleSidebar = () => {
  const newState = !isCollapsed
  setIsCollapsed(newState)
  localStorage.setItem('mahai_<ROLE>_sidebar_collapsed', String(newState))
}
```

**Important** : `isMounted` évite les hydration mismatches (la valeur `localStorage` n'est disponible que côté client).

## Créer un nouveau rôle (checklist)

Pour un futur rôle (ex: Professeur) :

1. Créer `components/professeur/ProfessorSidebar.tsx` basé sur `AdminSidebar.tsx`
2. Créer `app/professeur/ProfessorLayout.tsx` et `app/professeur/layout.tsx`
3. Créer `app/professeur/professeur.css` ou réutiliser un CSS partagé
4. Adapter les `navItems` et le badge de rôle
5. Changer la clé `localStorage` : `mahai_professor_sidebar_collapsed`
6. Ajouter `suppressHydrationWarning` sur les divs racine du layout (cf. ci-dessous)

## Hydration warning (extensions navigateur)

Certaines extensions (Bitdefender, LastPass, Grammarly...) injectent des attributs HTML (`bis_skin_checked`, `bis_register`, `data-grammarly`, etc.) qui causent des erreurs d'hydratation React.

**Solution** : ajouter `suppressHydrationWarning` sur les divs racine des layouts. C'est déjà appliqué sur :
- `app/layout.tsx` (body + main-content)
- `app/admin/layout.tsx` (admin-body, admin-layout, admin-main)
- `app/contributeur/ContributorLayout.tsx` (contributor-dashboard-page, main)

À répliquer pour chaque nouveau layout de rôle.
