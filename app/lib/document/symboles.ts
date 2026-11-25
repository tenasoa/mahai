/**
 * Bibliothèque de symboles électriques et logiques pour l'éditeur de schémas (Excalidraw).
 * Symboles de la norme CEI 60617, utilisée dans les sujets français et malgaches.
 * Chaque symbole est une liste de formes simples (squelettes Excalidraw), converties dans le
 * navigateur par `convertToExcalidrawElements`. Bornes de connexion à gauche et à droite, à y = 20.
 */

export type Forme = Record<string, unknown>;
export type Symbole = { id: string; nom: string; formes: Forme[] };

type Point = [number, number];

const trait = (...pts: Point[]): Forme => ({
  type: "line",
  x: pts[0]![0],
  y: pts[0]![1],
  points: pts.map(([x, y]) => [x - pts[0]![0], y - pts[0]![1]]),
});

const fleche = (de: Point, vers: Point): Forme => ({
  type: "arrow",
  x: de[0],
  y: de[1],
  points: [
    [0, 0],
    [vers[0] - de[0], vers[1] - de[1]],
  ],
  endArrowhead: "triangle",
});

const rect = (x: number, y: number, l: number, h: number, etiquette?: string, taille = 18): Forme => ({
  type: "rectangle",
  x,
  y,
  width: l,
  height: h,
  ...(etiquette ? { label: { text: etiquette, fontSize: taille, fontFamily: 2 } } : {}),
});

const cercle = (cx: number, cy: number, r: number, etiquette?: string): Forme => ({
  type: "ellipse",
  x: cx - r,
  y: cy - r,
  width: 2 * r,
  height: 2 * r,
  ...(etiquette ? { label: { text: etiquette, fontSize: 18, fontFamily: 2 } } : {}),
});

const point = (cx: number, cy: number, r = 4): Forme => ({
  ...cercle(cx, cy, r),
  backgroundColor: "#1e1e1e",
  fillStyle: "solid",
});

const texte = (x: number, y: number, t: string, taille = 16): Forme => ({
  type: "text",
  x,
  y,
  text: t,
  fontSize: taille,
  fontFamily: 2,
});

/** Demi-cercles d'une bobine, de x0 à x0 + 15 × n. */
function spires(x0: number, n: number): Point[] {
  const r = 7.5;
  const pts: Point[] = [];
  for (let k = 0; k < n; k++) {
    const cx = x0 + r + 2 * r * k;
    for (let i = 0; i <= 8; i++) {
      const a = Math.PI - (Math.PI * i) / 8;
      pts.push([cx + r * Math.cos(a), 20 - r * Math.sin(a)]);
    }
  }
  return pts;
}

const diode = (): Forme[] => [
  trait([0, 20], [30, 20]),
  trait([30, 5], [30, 35], [55, 20], [30, 5]),
  trait([55, 5], [55, 35]),
  trait([55, 20], [80, 20]),
];

/** Porte logique CEI : rectangle avec son signe, sortie inversée si `non`. */
function porte(signe: string, non = false, entrees = 2): Forme[] {
  const formes: Forme[] = [rect(20, 0, 40, 50, signe)];
  if (entrees === 1) formes.push(trait([0, 25], [20, 25]));
  else formes.push(trait([0, 15], [20, 15]), trait([0, 35], [20, 35]));
  if (non) formes.push(cercle(64, 25, 4), trait([68, 25], [80, 25]));
  else formes.push(trait([60, 25], [80, 25]));
  return formes;
}

export const SYMBOLES: Symbole[] = [
  { id: "fil-noeud", nom: "Nœud", formes: [point(20, 20)] },
  { id: "resistance", nom: "Résistance", formes: [trait([0, 20], [20, 20]), rect(20, 10, 40, 20), trait([60, 20], [80, 20])] },
  {
    id: "resistance-variable",
    nom: "Résistance variable",
    formes: [trait([0, 20], [20, 20]), rect(20, 10, 40, 20), trait([60, 20], [80, 20]), fleche([25, 40], [60, 0])],
  },
  {
    id: "condensateur",
    nom: "Condensateur",
    formes: [trait([0, 20], [35, 20]), trait([35, 2], [35, 38]), trait([45, 2], [45, 38]), trait([45, 20], [80, 20])],
  },
  {
    id: "condensateur-polarise",
    nom: "Condensateur polarisé",
    formes: [
      trait([0, 20], [35, 20]),
      trait([35, 2], [35, 38]),
      { ...rect(43, 2, 4, 36), backgroundColor: "#1e1e1e", fillStyle: "solid" },
      trait([47, 20], [80, 20]),
      texte(20, -8, "+"),
    ],
  },
  { id: "bobine", nom: "Bobine", formes: [trait([0, 20], [10, 20]), trait(...spires(10, 4)), trait([70, 20], [80, 20])] },
  { id: "diode", nom: "Diode", formes: diode() },
  {
    id: "zener",
    nom: "Diode Zener",
    formes: [...diode().filter((_, i) => i !== 2), trait([50, 2], [55, 5], [55, 35], [60, 38])],
  },
  { id: "del", nom: "DEL", formes: [...diode(), fleche([42, 4], [54, -8]), fleche([50, 10], [62, -2])] },
  {
    id: "pile",
    nom: "Pile / générateur continu",
    formes: [
      trait([0, 20], [35, 20]),
      trait([35, 0], [35, 40]),
      { ...trait([45, 10], [45, 30]), strokeWidth: 4 },
      trait([45, 20], [80, 20]),
      texte(20, -10, "+"),
    ],
  },
  { id: "source-tension", nom: "Source de tension", formes: [trait([0, 20], [80, 20]), cercle(40, 20, 16)] },
  {
    id: "source-courant",
    nom: "Source de courant",
    formes: [trait([0, 20], [24, 20]), cercle(40, 20, 16), trait([40, 4], [40, 36]), trait([56, 20], [80, 20])],
  },
  {
    id: "generateur-alternatif",
    nom: "Générateur alternatif",
    formes: [trait([0, 20], [24, 20]), cercle(40, 20, 16, "~"), trait([56, 20], [80, 20])],
  },
  {
    id: "masse",
    nom: "Masse",
    formes: [trait([20, 0], [20, 20]), trait([5, 20], [35, 20]), trait([10, 27], [30, 27]), trait([15, 34], [25, 34])],
  },
  {
    id: "interrupteur",
    nom: "Interrupteur",
    formes: [trait([0, 20], [25, 20]), point(25, 20, 3), trait([25, 20], [55, 4]), point(55, 20, 3), trait([55, 20], [80, 20])],
  },
  {
    id: "lampe",
    nom: "Lampe",
    formes: [
      trait([0, 20], [26, 20]),
      cercle(40, 20, 14),
      trait([30.1, 10.1], [49.9, 29.9]),
      trait([30.1, 29.9], [49.9, 10.1]),
      trait([54, 20], [80, 20]),
    ],
  },
  ...(
    [
      ["amperemetre", "Ampèremètre", "A"],
      ["voltmetre", "Voltmètre", "V"],
      ["ohmmetre", "Ohmmètre", "Ω"],
      ["moteur", "Moteur", "M"],
      ["generateur", "Générateur", "G"],
    ] as const
  ).map(([id, nom, lettre]) => ({
    id,
    nom,
    formes: [trait([0, 20], [24, 20]), cercle(40, 20, 16, lettre), trait([56, 20], [80, 20])],
  })),
  {
    id: "npn",
    nom: "Transistor NPN",
    formes: [
      cercle(42, 30, 22),
      trait([0, 30], [32, 30]),
      { ...trait([32, 16], [32, 44]), strokeWidth: 3 },
      trait([32, 23], [50, 12], [50, 0]),
      fleche([32, 37], [50, 48]),
      trait([50, 48], [50, 60]),
      texte(54, -2, "C", 14),
      texte(54, 46, "E", 14),
      texte(0, 12, "B", 14),
    ],
  },
  {
    id: "pnp",
    nom: "Transistor PNP",
    formes: [
      cercle(42, 30, 22),
      trait([0, 30], [32, 30]),
      { ...trait([32, 16], [32, 44]), strokeWidth: 3 },
      trait([32, 23], [50, 12], [50, 0]),
      fleche([50, 48], [34, 38]),
      trait([50, 48], [50, 60]),
      texte(54, -2, "E", 14),
      texte(54, 46, "C", 14),
      texte(0, 12, "B", 14),
    ],
  },
  {
    id: "aop",
    nom: "Amplificateur opérationnel",
    formes: [
      trait([20, 0], [20, 60], [80, 30], [20, 0]),
      trait([0, 15], [20, 15]),
      trait([0, 45], [20, 45]),
      trait([80, 30], [100, 30]),
      texte(24, 4, "−"),
      texte(24, 34, "+"),
    ],
  },
  { id: "et", nom: "Porte ET", formes: porte("&") },
  { id: "ou", nom: "Porte OU", formes: porte("≥1") },
  { id: "non", nom: "Porte NON", formes: porte("1", true, 1) },
  { id: "non-et", nom: "Porte NON-ET", formes: porte("&", true) },
  { id: "non-ou", nom: "Porte NON-OU", formes: porte("≥1", true) },
  { id: "ou-exclusif", nom: "Porte OU exclusif", formes: porte("=1") },
  {
    id: "bascule-d",
    nom: "Bascule D",
    formes: [
      rect(20, 0, 60, 80),
      trait([0, 20], [20, 20]),
      trait([0, 60], [20, 60]),
      trait([20, 52], [30, 60], [20, 68]),
      trait([80, 20], [100, 20]),
      trait([80, 60], [100, 60]),
      texte(26, 10, "D"),
      texte(34, 50, "C"),
      texte(64, 10, "Q"),
      texte(64, 50, "Q̄"),
    ],
  },
];
