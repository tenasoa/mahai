// Citations et messages de motivation pour le tableau de bord
export interface MotivationalQuote {
  text: string
  author?: string
  source?: string
}

export const motivationalQuotes: MotivationalQuote[] = [
  {
    text: "L'éducation est l'arme la plus puissante pour changer le monde.",
    author: "Nelson Mandela",
  },
  {
    text: "Le succès, c'est d'aller d'échec en échec sans perdre son enthousiasme.",
    author: "Winston Churchill",
  },
  {
    text: "Il n'y a pas de chemin vers le succès, le succès est un chemin.",
    author: "Confucius",
  },
  {
    text: "La seule façon de faire du bon travail est d'aimer ce que vous faites.",
    author: "Steve Jobs",
  },
  {
    text: "Croyez en vous et en tout ce que vous êtes. Sachez qu'il y a quelque chose à l'intérieur de vous qui est plus grand que n'importe quel obstacle.",
    author: "Christian D. Larson",
  },
  {
    text: "L'apprentissage est un trésor qui suivra son propriétaire partout.",
    author: "Proverbe chinois",
  },
  {
    text: "Ne vous arrêtez pas quand vous avez réussi. Arrêtez-vous quand vous avez fini.",
    author: "Franklin D. Roosevelt",
  },
  {
    text: "Le futur appartient à ceux qui croient à la beauté de leurs rêves.",
    author: "Eleanor Roosevelt",
  },
  {
    text: "La réussite n'est pas la clé du bonheur. Le bonheur est la clé de la réussite. Si vous aimez ce que vous faites, vous réussirez.",
    author: "Albert Schweitzer",
  },
  {
    text: "Votre éducation est un investissement, pas une dépense.",
  },
  {
    text: "Chaque expert était autrefois un débutant.",
    author: "Helen Hayes",
  },
  {
    text: "La persévérance est la clé du succès. Chaque échec est une leçon qui vous rapproche de votre objectif.",
  },
  {
    text: "N'ayez pas peur d'abandonner le bon pour poursuivre le grand.",
    author: "John D. Rockefeller",
  },
  {
    text: "Le seul endroit où le succès vient avant le travail, c'est dans le dictionnaire.",
    author: "Vidal Sassoon",
  },
  {
    text: "Vous n'êtes jamais trop vieux pour fixer un autre objectif ou rêver à un nouveau rêve.",
    author: "C.S. Lewis",
  },
  {
    text: "La différence entre une personne ordinaire et une personne exceptionnelle est cette petite chose qu'on appelle la détermination.",
  },
  {
    text: "L'échec est simplement l'opportunité de recommencer de manière plus intelligente.",
    author: "Henry Ford",
  },
  {
    text: "Votre temps est limité, ne le gâchez pas en menant une existence qui n'est pas la vôtre.",
    author: "Steve Jobs",
  },
  {
    text: "La meilleure façon de prédire l'avenir est de le créer.",
    author: "Peter Drucker",
  },
  {
    text: "Chaque jour est une nouvelle opportunité de vous rapprocher de vos objectifs.",
  },
  {
    text: "L'intelligence, c'est de savoir comment faire. La motivation, c'est de vouloir le faire. L'attitude, c'est ce qui vous permet de le faire.",
    author: "Lou Holtz",
  },
  {
    text: "Ne regardez pas en arrière, vous n'allez pas par là.",
    author: "Yogi Berra",
  },
  {
    text: "La réussite, c'est 1% d'inspiration et 99% de transpiration.",
    author: "Thomas Edison",
  },
  {
    text: "Vous avez en vous toutes les ressources nécessaires pour réussir.",
  },
  {
    text: "Chaque petit pas compte. Continuez à avancer !",
  },
  {
    text: "L'éducation est le passeport pour l'avenir, car demain appartient à ceux qui s'y préparent aujourd'hui.",
    author: "Malcolm X",
  },
  {
    text: "Ne laissez personne vous dire que vous ne pouvez pas réussir. Vous avez le pouvoir de réaliser vos rêves.",
  },
  {
    text: "La discipline est le pont entre les objectifs et les réalisations.",
    author: "Jim Rohn",
  },
  {
    text: "Soyez fier de vos progrès. Travaillez dur pour atteindre vos objectifs.",
  },
  {
    text: "L'effort est la clé du succès. Personne n'a jamais réussi sans travailler dur.",
  },
]

// Fonction pour obtenir une citation aléatoire
export function getRandomQuote(): MotivationalQuote {
  const randomIndex = Math.floor(Math.random() * motivationalQuotes.length)
  return motivationalQuotes[randomIndex]
}
