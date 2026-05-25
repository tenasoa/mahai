export interface BadgeDefinition {
  id: string
  name: string
  description: string
  icon: string // emoji
  category: 'debut' | 'streak' | 'performance' | 'social' | 'elite'
}

export const BADGES: BadgeDefinition[] = [
  { id: 'first_step', name: 'Premier pas', description: 'Acheter ton premier sujet', icon: '🆕', category: 'debut' },
  { id: 'ai_explorer', name: 'IA Explorer', description: 'Lancer ta première correction IA', icon: '🤖', category: 'debut' },
  { id: 'profile_complete', name: 'Profil complet', description: 'Compléter ton profil à 100%', icon: '✅', category: 'debut' },
  { id: 'streak_3', name: 'Régulier', description: '3 jours de streak consécutifs', icon: '🔥', category: 'streak' },
  { id: 'streak_7', name: 'Assidu', description: '7 jours de streak consécutifs', icon: '🌟', category: 'streak' },
  { id: 'streak_14', name: 'Discipliné', description: '14 jours de streak consécutifs', icon: '💪', category: 'streak' },
  { id: 'streak_30', name: 'Inarrêtable', description: '30 jours de streak consécutifs', icon: '🏆', category: 'streak' },
  { id: 'streak_60', name: 'Légende', description: '60 jours de streak consécutifs', icon: '👑', category: 'elite' },
  { id: 'streak_100', name: 'Mythe', description: '100 jours de streak consécutifs', icon: '🎯', category: 'elite' },
  { id: 'subjects_5', name: 'Studieux', description: 'Acheter 5 sujets', icon: '📚', category: 'performance' },
  { id: 'subjects_10', name: 'Acharné', description: 'Acheter 10 sujets', icon: '📖', category: 'performance' },
  { id: 'subjects_25', name: 'Érudit', description: 'Acheter 25 sujets', icon: '🎓', category: 'performance' },
  { id: 'corrections_5', name: 'Corrigé', description: '5 corrections IA obtenues', icon: '✍️', category: 'performance' },
  { id: 'corrections_15', name: 'Perfectionniste', description: '15 corrections IA obtenues', icon: '💎', category: 'performance' },
  { id: 'referral_1', name: 'Parrain', description: 'Inviter un ami qui devient actif', icon: '🤝', category: 'social' },
  { id: 'referral_3', name: 'Ambassadeur', description: '3 filleuls actifs', icon: '📣', category: 'social' },
  { id: 'referral_10', name: 'Influenceur', description: '10 filleuls actifs', icon: '🌟', category: 'elite' },
  { id: 'recharge_first', name: 'Crédité', description: 'Effectuer ta première recharge', icon: '💰', category: 'debut' },
]

export function getBadgeById(id: string): BadgeDefinition | undefined {
  return BADGES.find(b => b.id === id)
}
