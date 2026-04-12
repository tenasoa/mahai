# 💎 Design Tokens - Mah.AI

Ce document sert de source de vérité pour tous les tokens de design (couleurs, typographie, espacement) utilisés dans le projet.

---

## 🎨 Palette de Couleurs (Tokens CSS)

### Couleurs Principales (Fond & Surfaces)
| Token | Valeur (Light) | Valeur (Dark) | Description |
|-------|----------------|---------------|-------------|
| `--void` | `#f8f4ee` | `#080705` | Fond principal |
| `--depth` | `#f2ede4` | `#0e0c0a` | Couche intermédiaire |
| `--surface` | `#ede6da` | `#141210` | Surfaces secondaires |
| `--card` | `#ffffff` | `#1a1714` | Cartes & Éléments flottants |

### Gold Palette (Luxury Accent)
| Token | Valeur (Light) | Valeur (Dark) | Description |
|-------|----------------|---------------|-------------|
| `--gold` | `#a8782a` | `#c9a84c` | Or principal |
| `--gold-hi` | `#c9a84c` | `#e8c96a` | Or clair (highlight) |
| `--gold-lo` | `#d4a855` | `#8a6e2a` | Or foncé |
| `--gold-dim` | `rgba(168,120,42,0.08)` | | Or translucide léger |
| `--gold-line` | `rgba(168,120,42,0.22)` | | Bordures Gold |
| `--gold-glow` | `rgba(168,120,42,0.12)` | | Effet de lueur Gold |

### Hiérarchie du Texte
| Token | Valeur | Description |
|-------|--------|-------------|
| `--text` | `#1a1714` | Texte principal |
| `--text-2` | `rgba(26,23,20,0.75)` | Texte secondaire |
| `--text-3` | `rgba(26,23,20,0.55)` | Texte tertiaire |
| `--text-4` | `rgba(26,23,20,0.35)` | Texte quaternaire |

### Couleurs d'Accentuation (Sémantiques)
| Token | Valeur | Usage |
|-------|--------|-------|
| `--ruby` | `#9b2335` | Alerte / Erreur |
| `--sage` | `#4a6b5a` | Succès |
| `--navy` | `#1c2b4a` | Information |
| `--amber` | `#C9843C` | Warning |

---

## 🖋️ Typographie

### Polices
- **Titres (`--display`)** : `'Cormorant Garamond', serif`
- **Corps (`--body`)** : `'Outfit', sans-serif`
- **Labels / Code (`--mono`)** : `'DM Mono', monospace`

### Échelle de Taille
| Token | Rem | Px (Approx) |
|-------|-----|------------|
| `--text-xs` | `0.75rem` | 12px |
| `--text-sm` | `0.88rem` | 14px |
| `--text-base` | `1rem` | 16px |
| `--text-lg` | `1.125rem` | 18px |
| `--text-xl` | `1.25rem` | 20px |
| `--text-2xl` | `1.5rem` | 24px |
| `--text-3xl` | `2rem` | 32px |
| `--text-4xl` | `2.5rem` | 40px |

---

## 📏 Espacements & Rayons

### Espacements
- `--space-xs`: 4px
- `--space-sm`: 8px
- `--space-md`: 16px
- `--space-lg`: 24px
- `--space-xl`: 32px
- `--space-2xl`: 48px

### Border Radius
- `--r-xs`: 4px
- `--r`: 8px (Standard)
- `--r-lg`: 16px (Cartes)
- `--r-xl`: 24px (Modals)

### Ombres (Shadows)
- `--shadow-sm`: `0 2px 8px rgba(26, 23, 20, 0.05)`
- `--shadow-md`: `0 8px 40px rgba(26, 23, 20, 0.1)`
- `--shadow-lg`: `0 16px 60px rgba(26, 23, 20, 0.15)`
- `--shadow-gold`: `0 4px 24px rgba(201, 168, 76, 0.2)`

---

## 🎞️ Transitions
- `--transition-fast`: `0.15s ease`
- `--transition-base`: `0.25s ease`
- `--transition-slow`: `0.4s ease`
