# 🎨 Design System Master - Mah.AI

**Date :** 23 mars 2026
**Version :** 2.0
**Statut :** Document de référence consolidé
**Source :** Fusion de `DESIGN_SYSTEM_AUDIT.md` et `AUDIT_DESIGN_SYSTEM.md`

---

## 📋 Résumé Exécutif

Mah.AI est une plateforme EdTech pour Madagascar avec un **système de design luxury** (or/ivoire). Cet audit consolidé identifie **18 problèmes** et propose **un plan d'implémentation en 5 phases** pour améliorer la cohérence, l'accessibilité et la performance.

---

## 1. 🎨 Système de Design Actuel

### 1.1 Palette de Couleurs (Source de Vérité)

```css
/* === COULEURS PRINCIPALES === */
--void: #f8f4ee;              /* Fond principal clair → dark: #080705 */
--depth: #f2ede4;             /* Couche intermédiaire → dark: #0e0c0a */
--surface: #ede6da;           /* Surfaces secondaires → dark: #141210 */
--card: #ffffff;              /* Cartes → dark: #1a1714 */

/* === GOLD PALETTE === */
--gold: #a8782a;              /* Or principal → dark: #c9a84c */
--gold-hi: #c9a84c;           /* Or clair → dark: #e8c96a */
--gold-lo: #d4a855;           /* Or foncé → dark: #8a6e2a */
--gold-dim: rgba(168,120,42,0.08);
--gold-line: rgba(168,120,42,0.22);
--gold-glow: rgba(168,120,42,0.12);

/* === TEXT HIERARCHY === */
--text: #1a1714;              /* Texte principal */
--text-2: rgba(26,23,20,0.75);  /* Texte secondaire */
--text-3: rgba(26,23,20,0.55);  /* Texte tertiaire */
--text-4: rgba(26,23,20,0.35);   /* Texte quaternaire */

/* === ACCENT COLORS === */
--ruby: #9b2335;              /* Alerte/Erreur */
--sage: #4a6b5a;              /* Succès */
--navy: #1c2b4a;              /* Information */
--amber: #C9843C;             /* Warning */

/* === BORDERS === */
--b1: rgba(26,23,20,0.12);
--b2: rgba(168,120,42,0.08);
--b3: rgba(26,23,20,0.04);

/* === OVERLAY === */
--overlay: rgba(8,7,5,0.85);  /* Dark mode: rgba(0,0,0,0.8) */
```

### 1.2 Typographie

```css
--display: 'Cormorant Garamond', serif;    /* Titres */
--body: 'Outfit', sans-serif;              /* Corps */
--mono: 'DM Mono', monospace;              /* Labels, code */

/* Échelle recommandée */
--text-xs: 0.75rem;   /* 12px */
--text-sm: 0.88rem;   /* 14px */
--text-base: 1rem;    /* 16px */
--text-lg: 1.125rem;  /* 18px */
--text-xl: 1.25rem;   /* 20px */
--text-2xl: 1.5rem;   /* 24px */
--text-3xl: 2rem;     /* 32px */
--text-4xl: 2.5rem;   /* 40px */
```

### 1.3 Espacements & Rayons

```css
/* === SPACING === */
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-2xl: 48px;

/* === BORDER RADIUS === */
--r-xs: 4px;
--r: 8px;
--r-lg: 16px;
--r-xl: 24px;

/* === SHADOWS === */
--shadow-sm: 0 2px 8px rgba(26, 23, 20, 0.05);
--shadow-md: 0 8px 40px rgba(26, 23, 20, 0.1);
--shadow-lg: 0 16px 60px rgba(26, 23, 20, 0.15);
--shadow-gold: 0 4px 24px rgba(201, 168, 76, 0.2);

/* === TRANSITIONS === */
--transition-fast: 0.15s ease;
--transition-base: 0.25s ease;
--transition-slow: 0.4s ease;
```

---

## 2. 🐛 Problèmes Identifiés

### PROBLÈME #1 : Variables CSS Dupliquées

**Sévérité :** 🔴 Haute
**Fichiers :** `globals.css`, `profile.css`, `dashboard-theme.css`

**Description :** Les mêmes variables sont définies avec des noms différents.

| Variable Standard | Variable Dupliquée | Fichier |
|-------------------|-------------------|---------|
| `--gold` | `--luxury-gold` | profile.css |
| `--text-2` | `--luxury-text-muted` | profile.css |
| `--r-lg` | `--luxury-radius` | profile.css |
| `--card` | `--luxury-card-bg` | profile.css |

**Solution :**
```css
/* SUPPRIMER de profile.css */
--luxury-gold: #b38e3d;      /* ❌ À supprimer */
--luxury-radius: 16px;       /* ❌ À supprimer */

/* UTILISER les variables standard */
color: var(--gold);          /* ✅ Correct */
border-radius: var(--r-lg);  /* ✅ Correct */
```

---

### PROBLÈME #2 : Valeurs Gold Incohérentes

**Sévérité :** 🔴 Haute
**Impact :** Incohérence visuelle entre pages

| Fichier | Variable | Valeur Light |
|---------|----------|--------------|
| globals.css | `--gold` | `#a8782a` |
| profile.css | `--luxury-gold` | `#b38e3d` |
| dashboard-theme.css | `--gold` | `#C9A84C` |
| Toast component | hardcoded | `#C9A84C` |

**Solution :** Standardiser sur `globals.css` comme unique source de vérité.

---

### PROBLÈME #3 : Border Radius Non Standardisés

**Sévérité :** 🟡 Moyenne

```css
/* Valeurs attendues */
border-radius: var(--r);      /* 8px */
border-radius: var(--r-lg);   /* 16px */

/* Valeurs trouvées (à corriger) */
border-radius: 0.4rem;       /* dashboard.css → utiliser var(--r) */
border-radius: 0.6rem;        /* catalogue.css → utiliser var(--r) */
border-radius: 12px;          /* hardcoded → utiliser var(--r-lg) */
border-radius: var(--luxury-radius);  /* profile.css → utiliser var(--r-lg) */
```

---

### PROBLÈME #4 : Modal Overlays Incohérents

**Sévérité :** 🟡 Moyenne

| Fichier | Background |
|---------|-------------|
| catalogue.css | `rgba(0, 0, 0, 0.8)` |
| recharge.css | `rgba(8, 7, 5, 0.85)` |
| modal.css | `rgba(248, 244, 238, 0.85)` |

**Solution :**
```css
/* Dans globals.css */
:root {
  --overlay: rgba(8, 7, 5, 0.85);
}
[data-theme="dark"] {
  --overlay: rgba(0, 0, 0, 0.8);
}

/* Utilisation */
.modal-overlay {
  background: var(--overlay);
  backdrop-filter: blur(8px);
}
```

---

### PROBLÈME #5 : Font Sizes Incohérents

**Sévérité :** 🟡 Moyenne

| Élément | dashboard.css | catalogue.css | profile.css |
|---------|---------------|---------------|--------------|
| Titre section | `1.4rem` | `2.5rem` | `1.3rem` |
| Titre carte | `1rem` | `1.05rem` | `1.3rem` |
| Padding carte | `1.5rem` | `1.1rem` | `2.5rem` |

**Solution :** Utiliser les tokens `--text-*` et `--space-*`.

---

### PROBLÈME #6 : Styles Inline dans JSX

**Sévérité :** 🔴 Haute
**Fichiers :** `LuxuryNavbar.tsx`, `LuxuryFooter.tsx`

**Code actuel :**
```tsx
<nav style={{
  position: 'fixed', top: 0, left: 0, right: 0, zIndex: 500,
  background: scrolled ? 'rgba(var(--depth-rgb), 0.95)' : 'rgba(var(--void-rgb), 0.95)',
  borderBottom: '1px solid var(--b1)', backdropFilter: 'blur(20px)'
}}>
```

**Solution :**
```tsx
// LuxuryNavbar.module.css
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 500;
  background: rgba(var(--depth-rgb), 0.95);
  border-bottom: 1px solid var(--b1);
  backdrop-filter: blur(20px);
}

.nav--transparent {
  background: rgba(var(--void-rgb), 0.95);
}

// LuxuryNavbar.tsx
<nav className={`${styles.nav} ${!scrolled ? styles['nav--transparent'] : ''}`}>
```

---

### PROBLÈME #7 : Fichiers CSS Trop Volumineux

**Sévérité :** 🔴 Haute
**Fichiers :** `recharge.css` (1698 lignes), `catalogue.css` (1800+ lignes), `profil.css` (2152 lignes)

**Solution :** Découper en composants.

```
components/
├── ui/
│   ├── Card/
│   │   ├── Card.tsx
│   │   ├── Card.module.css
│   │   └── index.ts
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.module.css
│   │   └── index.ts
│   ├── Input/
│   │   ├── Input.tsx
│   │   ├── Input.module.css
│   │   └── index.ts
│   └── Modal/
│       ├── Modal.tsx
│       ├── Modal.module.css
│       └── index.ts
```

---

### PROBLÈME #8 : Responsive Tablettes Manquant

**Sévérité :** 🟡 Moyenne

**Breakpoints actuels :**
```css
@media (max-width: 768px) { }  /* Mobile */
@media (min-width: 769px) { }  /* Desktop */
```

**Breakpoints recommandés :**
```js
// tailwind.config.js
theme: {
  screens: {
    'sm': '640px',   /* Mobile large */
    'md': '768px',   /* Tablettes portrait */
    'lg': '1024px',  /* Tablettes paysage */
    'xl': '1280px',  /* Desktop */
    '2xl': '1536px', /* Grands écrans */
  }
}
```

---

### PROBLÈME #9 : Touch Targets < 44px

**Sévérité :** 🔴 Haute (Accessibilité WCAG)
**Éléments :** Boutons filtres (`.pill`), Icônes (`.pc-fav`), Pagination

**Taille actuelle :** 32-36px
**Recommandation WCAG :** 44px minimum

**Solution :**
```css
@media (pointer: coarse) {
  .pill,
  .diff-btn,
  .pc-fav,
  .mobile-nav-item,
  .btn {
    min-width: 44px;
    min-height: 44px;
    padding: 0.75rem 1rem;
  }
}
```

---

### PROBLÈME #10 : Curseur Personnalisé Non-Optimisé

**Sévérité :** 🟡 Moyenne
**Fichier :** `LuxuryCursor.tsx`

**Problèmes :**
1. Boucle `requestAnimationFrame` continue même si inactive
2. Pas de fallback si `cursor: none` non supporté
3. Consomme batterie sur portables

**Solution :**
```tsx
useEffect(() => {
  let animationId: number
  let lastInteraction = 0
  let lastMousePos = { x: 0, y: 0 }

  const handleMouseMove = () => {
    lastInteraction = Date.now()
  }

  const animate = () => {
    // Arrêter si inactif depuis 2 secondes
    if (Date.now() - lastInteraction > 2000) return

    if (mousePos.current !== lastMousePos) {
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * 0.2
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * 0.2

      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringPos.current.x}px, ${ringPos.current.y}px)`
      }
      lastMousePos = { ...mousePos.current }
    }

    animationId = requestAnimationFrame(animate)
  }

  document.addEventListener('mousemove', handleMouseMove)
  animationId = requestAnimationFrame(animate)

  return () => {
    document.removeEventListener('mousemove', handleMouseMove)
    cancelAnimationFrame(animationId)
  }
}, [])
```

---

### PROBLÈME #11 : Pas de Toggle "Réduction du Mouvement"

**Sévérité :** 🟡 Moyenne
**Impact :** Accessibilité

**Solution :**
```tsx
// components/settings/MotionToggle.tsx
export function MotionToggle() {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('reduced-motion')
    if (saved) {
      setReducedMotion(saved === 'true')
      document.documentElement.setAttribute('data-reduced-motion', saved)
    }
  }, [])

  const toggle = () => {
    const newValue = !reducedMotion
    setReducedMotion(newValue)
    localStorage.setItem('reduced-motion', String(newValue))
    document.documentElement.setAttribute('data-reduced-motion', String(newValue))
  }

  return (
    <button onClick={toggle} className="motion-toggle">
      {reducedMotion ? '🎬 Animations activées' : '⏸️ Animations réduites'}
    </button>
  )
}
```

```css
/* globals.css */
[data-reduced-motion="true"] *,
[data-reduced-motion="true"] *::before,
[data-reduced-motion="true"] *::after {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
}
```

---

### PROBLÈME #12 : Sidebar Catalogue Non-Responsive

**Sévérité :** 🔴 Haute
**Fichier :** `catalogue.css`

**Solution :**
```css
/* Desktop */
.sidebar {
  position: fixed;
  width: 280px;
}

/* Tablettes */
@media (max-width: 1024px) {
  .sidebar {
    width: 240px;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .sidebar-toggle {
    display: flex;
  }
}

/* Mobile */
@media (max-width: 768px) {
  .sidebar {
    display: none;
  }

  .filters-mobile {
    display: block;
  }
}
```

---

### PROBLÈME #13 : Backdrop Filter Sans Fallback

**Sévérité :** 🟢 Basse
**Fichiers :** `LuxuryNavbar.tsx`, `recharge.css`, modals

**Solution :**
```css
.navbar {
  background: rgba(var(--depth-rgb), 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);

  /* Fallback pour navigateurs sans support */
  @supports not (backdrop-filter: blur(20px)) {
    background: rgba(var(--depth-rgb), 0.98);
  }
}
```

---

### PROBLÈME #14 : Boutons Non Standardisés

**Sévérité :** 🔴 Haute

**Code actuel dispersé :**
```css
/* dashboard.css */
.btn-xs { padding: 0.3rem 0.75rem; font-size: 0.7rem; }

/* catalogue.css */
.btn-sm { padding: 0.42rem 1rem; font-size: 0.76rem; }

/* Gradients différents */
background: linear-gradient(135deg, var(--gold), var(--gold-hi));
background: linear-gradient(135deg, var(--luxury-gold), #d4af37);
```

**Solution :** Voir section 3.1 Composant Button unifié.

---

### PROBLÈME #15 : Shadows Éparpillées

**Sévérité :** 🟡 Moyenne

```css
/* globals.css */
--shadow-md: 0 8px 40px rgba(26, 23, 20, 0.1);

/* dashboard-theme.css */
--sh-gold: 0 4px 24px -4px rgba(201, 168, 76, 0.15);

/* catalogue.css (hardcoded) */
box-shadow: 0 4px 24px rgba(201, 168, 76, 0.28);
```

**Solution :** Utiliser uniquement les variables `--shadow-*` de globals.css.

---

### PROBLÈME #16 : Animation Timing Variables

**Sévérité :** 🟢 Basse

| Animation | Durée |
|-----------|-------|
| Hover card | `0.3s` |
| Modal transition | `0.2s` |
| Gold pulse | `0.42s` |
| Fade in | `0.15s` |

**Solution :** Standardiser avec `--transition-fast`, `--transition-base`, `--transition-slow`.

---

### PROBLÈME #17 : Cards Non Uniformes

**Sévérité :** 🟡 Moyenne

| Page | Classe | Différences |
|------|--------|-------------|
| Dashboard | `.stat-card` | Border color variable |
| Catalogue | `.pcard` | Simpler, hover glow |
| Profile | `.luxury-card` | Glassmorphism |
| Recharge | `.balance-card` | Gradient background |

**Solution :** Voir section 3.2 Composant Card unifié.

---

### PROBLÈME #18 : Documentation Obsolète

**Sévérité :** 🔴 Haute
**Fichier :** `AGENTS.md`

**Problème :** Couleurs teal/green au lieu de gold/ivoire.

**Solution :** Mettre à jour avec les tokens de ce document.

---

## 3. 🧩 Composants Standardisés

### 3.1 Composant Button

```tsx
// components/ui/Button/Button.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react'
import styles from './Button.module.css'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`${styles.btn} ${styles[variant]} ${styles[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
```

```css
/* components/ui/Button/Button.module.css */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: var(--body);
  font-weight: 500;
  border-radius: var(--r);
  cursor: pointer;
  transition: all var(--transition-base);
  border: none;
}

/* === VARIANTS === */
.btn-primary {
  background: linear-gradient(135deg, var(--gold), var(--gold-hi));
  color: var(--void);
  box-shadow: var(--shadow-gold);
}

.btn-primary:hover {
  filter: brightness(1.1);
  transform: translateY(-2px);
}

.btn-secondary {
  background: transparent;
  border: 1px solid var(--gold-line);
  color: var(--gold);
}

.btn-secondary:hover {
  background: var(--gold-dim);
}

.btn-ghost {
  background: transparent;
  border: 1px solid var(--b1);
  color: var(--text-2);
}

.btn-ghost:hover {
  border-color: var(--text-3);
  color: var(--text);
}

.btn-danger {
  background: rgba(155, 35, 53, 0.1);
  border: 1px solid rgba(155, 35, 53, 0.3);
  color: var(--ruby);
}

.btn-danger:hover {
  background: rgba(155, 35, 53, 0.2);
}

/* === SIZES === */
.btn-xs {
  padding: 0.25rem 0.75rem;
  font-size: 0.7rem;
}

.btn-sm {
  padding: 0.35rem 1rem;
  font-size: 0.75rem;
}

.btn-md {
  padding: 0.5rem 1.5rem;
  font-size: 0.88rem;
}

.btn-lg {
  padding: 0.75rem 2rem;
  font-size: 1rem;
}

/* === ACCESSIBILITY === */
@media (pointer: coarse) {
  .btn {
    min-height: 44px;
    min-width: 44px;
  }
}

/* === REDUCED MOTION === */
[data-reduced-motion="true"] .btn {
  transition: none;
}
```

---

### 3.2 Composant Card

```tsx
// components/ui/Card/Card.tsx
import { ReactNode } from 'react'
import styles from './Card.module.css'

interface CardProps {
  variant?: 'default' | 'hero' | 'stat' | 'interactive'
  children: ReactNode
  className?: string
  hover?: boolean
  glow?: boolean
}

export function Card({
  variant = 'default',
  children,
  className = '',
  hover = true,
  glow = false
}: CardProps) {
  return (
    <div className={`${styles.card} ${styles[variant]} ${hover ? styles.hover : ''} ${glow ? styles.glow : ''} ${className}`}>
      {children}
    </div>
  )
}
```

```css
/* components/ui/Card/Card.module.css */
.card {
  background: var(--card);
  border: 1px solid var(--b1);
  border-radius: var(--r-lg);
  padding: var(--space-lg);
  transition: all var(--transition-base);
}

.hover:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.glow {
  border-color: var(--gold-line);
  box-shadow: var(--shadow-gold);
}

.glow:hover {
  border-color: var(--gold);
  box-shadow: 0 8px 32px rgba(201, 168, 76, 0.25);
}

/* === VARIANTS === */
.hero {
  background: linear-gradient(135deg, var(--card), rgba(168, 120, 42, 0.04));
  border: 1px solid var(--gold-line);
  padding: var(--space-xl);
}

.stat {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  min-height: 120px;
}

.interactive {
  cursor: pointer;
}
```

---

### 3.3 Composant Input

```tsx
// components/ui/Input/Input.tsx
import { InputHTMLAttributes, forwardRef } from 'react'
import styles from './Input.module.css'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className={styles.wrapper}>
        {label && (
          <label className={styles.label}>{label}</label>
        )}
        <input
          ref={ref}
          className={`${styles.input} ${error ? styles.error : ''} ${className}`}
          {...props}
        />
        {error && (
          <span className={styles.errorMessage}>{error}</span>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
```

```css
/* components/ui/Input/Input.module.css */
.wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.label {
  font-family: var(--mono);
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text-3);
}

.input {
  background: var(--depth);
  border: 1px solid var(--b2);
  border-radius: var(--r);
  padding: 0.85rem 1rem;
  font-size: var(--text-sm);
  font-family: var(--body);
  color: var(--text);
  transition: all var(--transition-fast);
}

.input:focus {
  outline: none;
  border-color: var(--gold-line);
  box-shadow: 0 0 0 4px var(--gold-dim);
}

.input.error {
  border-color: var(--ruby);
}

.errorMessage {
  font-size: var(--text-xs);
  color: var(--ruby);
}

/* === ACCESSIBILITY === */
@media (pointer: coarse) {
  .input {
    min-height: 44px;
  }
}
```

---

### 3.4 Composant Modal

```tsx
// components/ui/Modal/Modal.tsx
import { ReactNode, useEffect } from 'react'
import styles from './Modal.module.css'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
}

export function Modal({ isOpen, onClose, children, title }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.content}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {title && (
          <h2 id="modal-title" className={styles.title}>{title}</h2>
        )}
        {children}
      </div>
    </div>
  )
}
```

```css
/* components/ui/Modal/Modal.module.css */
.overlay {
  position: fixed;
  inset: 0;
  background: var(--overlay);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn var(--transition-fast);
}

.content {
  background: var(--card);
  border: 1px solid var(--b1);
  border-radius: var(--r-xl);
  padding: var(--space-xl);
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
  box-shadow: var(--shadow-lg);
  animation: slideUp var(--transition-base);
}

.title {
  font-family: var(--display);
  font-size: var(--text-2xl);
  color: var(--text);
  margin-bottom: var(--space-lg);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* === REDUCED MOTION === */
[data-reduced-motion="true"] .overlay,
[data-reduced-motion="true"] .content {
  animation: none;
}
```

---

## 4. ✅ Plan d'Implémentation

### Phase 1 : Documentation (Semaine 1)

| Tâche | Priorité | Fichier |
|-------|----------|---------|
| Mettre à jour `AGENTS.md` | 🔴 Haute | `AGENTS.md` |
| Créer `DESIGN_TOKENS.md` | 🔴 Haute | `docs/DESIGN_TOKENS.md` |
| Supprimer `AUDIT_DESIGN_SYSTEM.md` et `DESIGN_SYSTEM_AUDIT.md` | 🟡 Moyenne | `docs/` |
| Documenter composants existants | 🟡 Moyenne | `docs/COMPONENT_GUIDE.md` |

### Phase 2 : Consolidation CSS (Semaines 2-3)

| Tâche | Priorité | Fichiers |
|-------|----------|----------|
| Standardiser variables dans `globals.css` | 🔴 Haute | `globals.css` |
| Supprimer variables `--luxury-*` | 🔴 Haute | `profile.css`, `dashboard-theme.css` |
| Remplacer hardcoded par `var(--r)`, `var(--r-lg)` | 🟡 Moyenne | Tous CSS |
| Unifier modal overlays | 🟡 Moyenne | `catalogue.css`, `recharge.css` |
| Standardiser shadows | 🟡 Moyenne | Tous CSS |

### Phase 3 : Composants (Semaine 4)

| Tâche | Priorité | Fichier à créer |
|-------|----------|-----------------|
| Créer composant `Button` | 🔴 Haute | `components/ui/Button/` |
| Créer composant `Card` | 🔴 Haute | `components/ui/Card/` |
| Créer composant `Input` | 🟡 Moyenne | `components/ui/Input/` |
| Créer composant `Modal` | 🟡 Moyenne | `components/ui/Modal/` |

### Phase 4 : Responsive & Accessibilité (Semaine 5)

| Tâche | Priorité | Fichiers |
|-------|----------|----------|
| Ajouter breakpoints tablettes | 🔴 Haute | `tailwind.config.js` |
| Rendre sidebar collapsible | 🔴 Haute | `catalogue.css` |
| Touch targets 44px minimum | 🔴 Haute | `globals.css` |
| Ajouter toggle reduced-motion | 🟡 Moyenne | `globals.css`, composant |

### Phase 5 : Refactoring & Performance (Semaine 6)

| Tâche | Priorité | Fichiers |
|-------|----------|----------|
| Extraire styles inline Navbar | 🔴 Haute | `LuxuryNavbar.tsx` |
| Extraire styles inline Footer | 🟡 Moyenne | `LuxuryFooter.tsx` |
| Optimiser `LuxuryCursor.tsx` | 🟡 Moyenne | `LuxuryCursor.tsx` |
| Découper `recharge.css` | 🟢 Basse | `recharge.css` |
| Découper `catalogue.css` | 🟢 Basse | `catalogue.css` |

---

## 5. 📊 Métriques de Succès

| Métrique | Actuel | Cible | Comment Mesurer |
|----------|--------|-------|-----------------|
| Lighthouse Performance | ~70 | 90+ | `npm run build` + Lighthouse |
| Lighthouse Accessibility | ~80 | 95+ | Lighthouse CI |
| Lignes CSS totales | ~5000 | ~3000 | `wc -l **/*.css` |
| Composants réutilisables | 5 | 15+ | Compter `components/ui/` |
| Touch targets < 44px | ~20 | 0 | Audit manuel |
| Variables dupliquées | 8+ | 0 | `grep --luxury-` |
| Fichiers CSS > 1000 lignes | 4 | 0 | `wc -l` |

---

## 6. 📁 Fichiers à Modifier

### Priorité Haute

| Fichier | Action |
|---------|--------|
| `globals.css` | Ajouter tokens, supprimer doublons |
| `profile.css` | Supprimer `--luxury-*` |
| `dashboard-theme.css` | Unifier avec globals |
| `LuxuryNavbar.tsx` | Extraire styles inline |
| `catalogue.css` | Responsive sidebar, découper |

### Priorité Moyenne

| Fichier | Action |
|---------|--------|
| `LuxuryFooter.tsx` | Extraire styles inline |
| `LuxuryCursor.tsx` | Optimiser RAF |
| `recharge.css` | Découper, unifier modals |
| `tailwind.config.js` | Ajouter breakpoints |

### Fichiers à Créer

| Fichier | Description |
|---------|-------------|
| `components/ui/Button/Button.tsx` | Bouton unifié |
| `components/ui/Button/Button.module.css` | Styles bouton |
| `components/ui/Card/Card.tsx` | Carte unifiée |
| `components/ui/Card/Card.module.css` | Styles carte |
| `components/ui/Input/Input.tsx` | Input unifié |
| `components/ui/Input/Input.module.css` | Styles input |
| `components/ui/Modal/Modal.tsx` | Modal unifiée |
| `components/ui/Modal/Modal.module.css` | Styles modal |
| `docs/DESIGN_TOKENS.md` | Documentation tokens |

---

## 7. 🤖 Instructions pour Agent IA

Si vous êtes un agent IA chargé d'implémenter ces recommandations :

### Ordre de Priorité

1. **Phase 1** : Lire ce document en entier
2. **Phase 2** : Consolidation CSS (globsaux.css d'abord)
3. **Phase 3** : Créer les composants de base
4. **Phase 4** : Responsive et accessibilité
5. **Phase 5** : Refactoring et performance

### Règles Obligatoires

- ✅ Toujours utiliser les variables CSS (`--gold`, `--void`, etc.)
- ✅ Conserver le thème luxury (or/ivoire)
- ✅ Maintenir la compatibilité dark/light mode
- ✅ Ne pas casser les animations sans alternative
- ✅ Touch targets minimum 44px
- ✅ Tester sur mobile ET desktop

### À Ne Pas Faire

- ❌ Ajouter de nouvelles variables `--luxury-*`
- ❌ Utiliser des valeurs hardcoded pour les couleurs
- ❌ Ignorer le mode sombre
- ❌ Créer des composants sans accessibilité

---

## 8. 🎯 Philosophie de Design

> **"Luxury Education"**
> Positionner Mah.AI comme une plateforme premium pour les étudiants malgaches aspirants. Chaque élément visuel doit évoquer l'excellence, la qualité et la réussite.

### Principes

1. **Cohérence** : Même apparence sur toutes les pages
2. **Accessibilité** : Utilisable par tous
3. **Performance** : Rapide sur mobile
4. **Élégance** : Design luxury or/ivoire

---

## 9. 📝 Ce qui Fonctionne Bien (À Conserver)

- ✅ La palette de couleurs or/ivoire
- ✅ Le curseur personnalisé (après optimisation)
- ✅ Les animations reveal on scroll
- ✅ Le support dual-thème (clair/sombre)
- ✅ Les skip links pour accessibilité
- ✅ Les typographies Cormorant Garamond + Outfit

---

**Document créé pour :** Agents IA de design
**Prochaine révision :** 30 mars 2026
**Version :** 2.0 (Consolidé)

---

*Fin du document*