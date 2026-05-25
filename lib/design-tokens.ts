/**
 * 🎨 MAH.AI - SYSTEM DESIGN TOKENS
 * Centralisation des tokens de design (couleurs, espacements, typographie, ombres)
 * pour assurer la cohérence visuelle de l'application de luxe/premium.
 */

export const COLORS = {
  // Couleurs de fond
  backgrounds: {
    void: 'var(--void)',        // Fond sombre/clair principal
    depth: 'var(--depth)',      // Deuxième niveau de profondeur
    surface: 'var(--surface)',  // Surfaces et conteneurs secondaires
    card: 'var(--card)',        // Fond de carte
    cardHover: 'var(--card-hover)',
    lift: 'var(--lift)',        // Éléments surélevés
  },

  // Palette dorée (Marque primaire)
  gold: {
    default: 'var(--gold)',
    text: 'var(--gold-text)',   // Variante contrastée pour l'accessibilité du texte
    hi: 'var(--gold-hi)',
    lo: 'var(--gold-lo)',
    dim: 'var(--gold-dim)',
    line: 'var(--gold-line)',
    glow: 'var(--gold-glow)',
  },

  // Hiérarchie de texte
  text: {
    primary: 'var(--text)',
    secondary: 'var(--text-2)',
    tertiary: 'var(--text-3)',
    quaternary: 'var(--text-4)',
  },

  // Couleurs sémantiques
  semantic: {
    success: 'var(--sage)',
    successDim: 'var(--sage-dim)',
    error: 'var(--ruby)',
    errorDim: 'var(--ruby-dim)',
    warning: 'var(--amber)',
    warningDim: 'var(--amber-dim)',
    info: 'var(--blue)',
    infoDim: 'var(--blue-dim)',
  },
};

export const SPACING = {
  xs: 'var(--space-xs)',     // 4px
  sm: 'var(--space-sm)',     // 8px
  md: 'var(--space-md)',     // 16px
  lg: 'var(--space-lg)',     // 24px
  xl: 'var(--space-xl)',     // 32px
  xxl: 'var(--space-2xl)',   // 48px
};

export const SHADOWS = {
  sm: 'var(--shadow-sm)',
  md: 'var(--shadow-md)',
  lg: 'var(--shadow-lg)',
  gold: 'var(--shadow-gold)',
};

export const RADIUS = {
  xs: 'var(--r-xs)',
  md: 'var(--r)',
  lg: 'var(--r-lg)',
  xl: 'var(--r-xl)',
};
