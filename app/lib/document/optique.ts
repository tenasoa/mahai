/**
 * Banc d'optique (physique) : lentilles minces sur un axe optique, un objet AB (ou un objet à
 * l'infini), et, en option, les foyers, l'image calculée par la relation de conjugaison et les
 * rayons de construction. Abscisses et hauteurs dans l'unité de l'énoncé (en général le cm) ;
 * une lentille est convergente si sa distance focale f' est positive, divergente sinon.
 * Avec plusieurs lentilles, l'image donnée par l'une sert d'objet à la suivante.
 */

export type Lentille = { x: number; f: number };
export type GenreObjet = "aucun" | "reel" | "infini";
/** `angle` (en degrés) : inclinaison des rayons venant d'un objet à l'infini. */
export type ObjetOptique = { genre: GenreObjet; x: number; h: number; angle: number };
export type Optique = {
  lentilles: Lentille[];
  objet: ObjetOptique;
  foyers: boolean;
  rayons: boolean;
  image: boolean;
  /** Pas des graduations de l'axe (0 : aucune). */
  graduation: number;
  alt: string;
};

export const LIMITES_OPTIQUE = { lentilles: 3, coordonnee: 1000, angle: 60, graduations: 80 } as const;

export const OPTIQUE_DEFAUT: Optique = {
  lentilles: [{ x: 0, f: 10 }],
  objet: { genre: "reel", x: -25, h: 4, angle: 10 },
  foyers: true,
  rayons: true,
  image: true,
  graduation: 0,
  alt: "",
};

const GENRES: GenreObjet[] = ["aucun", "reel", "infini"];

const nombre = (v: unknown, defaut: number, max: number = LIMITES_OPTIQUE.coordonnee) => {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v.replace(",", ".")) : NaN;
  return Number.isFinite(n) ? Math.max(-max, Math.min(max, n)) : defaut;
};

/** Valeurs vérifiées (nettoyage serveur et lecture dans l'éditeur). */
export function normaliserOptique(a: Record<string, unknown> | undefined | null): Optique {
  const lentilles = (Array.isArray(a?.lentilles) ? a.lentilles : [])
    .slice(0, LIMITES_OPTIQUE.lentilles)
    .flatMap((l): Lentille[] => {
      if (!l || typeof l !== "object") return [];
      const o = l as Record<string, unknown>;
      const f = nombre(o.f, 10);
      return [{ x: nombre(o.x, 0), f: Math.abs(f) < 0.01 ? 10 : f }];
    });
  const o = (a?.objet && typeof a.objet === "object" ? a.objet : {}) as Record<string, unknown>;
  const genre = GENRES.includes(o.genre as GenreObjet) ? (o.genre as GenreObjet) : "aucun";
  return {
    lentilles: lentilles.length ? lentilles : [{ x: 0, f: 10 }],
    objet: { genre, x: nombre(o.x, -25), h: nombre(o.h, 4), angle: nombre(o.angle, 10, LIMITES_OPTIQUE.angle) },
    foyers: a?.foyers !== false,
    rayons: a?.rayons === true,
    image: a?.image === true,
    graduation: Math.max(0, nombre(a?.graduation, 0)),
    alt: typeof a?.alt === "string" ? a.alt.slice(0, 300) : "",
  };
}

/* ---------- Calcul des images ---------- */

/** Objet ou image : point (x, h) à distance finie, ou à l'infini (rayons de pente `pente`). */
export type Conjugue = { infini: false; x: number; h: number; reelle: boolean } | { infini: true; pente: number };

/**
 * Images successives données par chaque lentille (relation de conjugaison
 * 1/OA' − 1/OA = 1/f', grandissement γ = OA'/OA). `reelle` : l'image est après la lentille.
 */
export function images(o: Optique): Conjugue[] {
  if (o.objet.genre === "aucun") return [];
  let objet: Conjugue =
    o.objet.genre === "infini" ? { infini: true, pente: Math.tan((o.objet.angle * Math.PI) / 180) } : { infini: false, x: o.objet.x, h: o.objet.h, reelle: true };
  const r: Conjugue[] = [];
  for (const l of o.lentilles) {
    let image: Conjugue;
    if (objet.infini) image = { infini: false, x: l.x + l.f, h: objet.pente * l.f, reelle: l.f > 0 };
    else {
      const p = objet.x - l.x;
      if (Math.abs(p) < 1e-9) image = { infini: false, x: l.x, h: objet.h, reelle: true };
      else if (Math.abs(p + l.f) < 1e-9 * Math.max(1, Math.abs(l.f))) image = { infini: true, pente: objet.h / p };
      else {
        const q = (l.f * p) / (l.f + p);
        image = { infini: false, x: l.x + q, h: (objet.h * q) / p, reelle: q > 0 };
      }
    }
    r.push(image);
    objet = image;
  }
  return r;
}

/* ---------- Disposition ---------- */

export type Segment = { x1: number; y1: number; x2: number; y2: number; pointille: boolean; rayon: number; fleche: boolean };
export type Fleche = { x: number; h: number; nomPied: string; nomTete: string; pointille: boolean; principale: boolean };
export type Repere = { x: number; nom: string };
export type Dessin = {
  xmin: number;
  xmax: number;
  /** Demi-hauteur du dessin (dans l'unité de l'énoncé). */
  ymax: number;
  /** Demi-hauteur des lentilles. */
  hauteurLentille: number;
  lentilles: (Lentille & { nom: string })[];
  reperes: Repere[];
  fleches: Fleche[];
  segments: Segment[];
  graduations: number[];
  /** L'image finale est à l'infini (rayons émergents parallèles). */
  imageInfinie: boolean;
};

const INDICES = "₀₁₂₃₄₅₆₇₈₉";
const indice = (i: number) => String(i).replace(/\d/g, (c) => INDICES[Number(c)]!);

/** Prend en compte une abscisse d'image seulement si elle reste raisonnable par rapport au montage. */
const proche = (x: number, centre: number, portee: number) => Math.abs(x - centre) <= portee;

export function disposer(o: Optique): Dessin {
  const ls = [...o.lentilles].sort((a, b) => a.x - b.x);
  const plusieurs = ls.length > 1;
  const imgs = images({ ...o, lentilles: ls });
  const fmax = Math.max(...ls.map((l) => Math.abs(l.f)));
  const premiere = ls[0]!;
  const derniere = ls[ls.length - 1]!;
  const centre = (premiere.x + derniere.x) / 2;
  const portee = (derniere.x - premiere.x) / 2 + 6 * fmax;

  // Fenêtre : lentilles et foyers, objet, images raisonnables.
  const xs: number[] = ls.flatMap((l) => [l.x - Math.abs(l.f), l.x + Math.abs(l.f)]);
  const hs: number[] = [];
  if (o.objet.genre === "reel") (xs.push(o.objet.x), hs.push(o.objet.h));
  if (o.objet.genre === "infini") xs.push(premiere.x - 2 * Math.abs(premiere.f));
  imgs.forEach((im, i) => {
    if (im.infini || !proche(im.x, centre, portee)) return;
    const visible = i === imgs.length - 1 ? o.image : o.image && plusieurs;
    if (visible || o.rayons) (xs.push(im.x), hs.push(im.h));
  });
  let xmin = Math.min(...xs);
  let xmax = Math.max(...xs);
  const marge = (xmax - xmin) * 0.08 || 1;
  xmin -= marge;
  xmax += marge * (o.rayons ? 1.6 : 1);

  const segments = o.rayons ? tracerRayons(o, ls, imgs, xmin, xmax) : [];
  // Les lentilles dépassent l'objet, les images et les points où les rayons les traversent.
  const surLentilles = segments.filter((s) => !s.pointille && ls.some((l) => l.x === s.x2)).map((s) => Math.abs(s.y2));
  const hmax = Math.max(0, ...hs.map(Math.abs));
  const hauteurLentille = Math.max(hmax > 0 ? hmax * 1.35 : fmax * 0.45, ...surLentilles.map((y) => y * 1.12));
  const ymax = hauteurLentille * 1.2;

  const lentilles = ls.map((l, i) => ({ ...l, nom: plusieurs ? `L${indice(i + 1)}` : "L" }));
  const reperes: Repere[] = [];
  if (o.foyers)
    ls.forEach((l, i) => {
      const k = plusieurs ? indice(i + 1) : "";
      reperes.push({ x: l.x, nom: `O${k}` }, { x: l.x - l.f, nom: `F${k}` }, { x: l.x + l.f, nom: `F'${k}` });
    });

  const fleches: Fleche[] = [];
  if (o.objet.genre === "reel") fleches.push({ x: o.objet.x, h: o.objet.h, nomPied: "A", nomTete: "B", pointille: false, principale: true });
  if (o.image)
    imgs.forEach((im, i) => {
      if (im.infini || !proche(im.x, centre, portee)) return;
      const finale = i === imgs.length - 1;
      if (!finale && !plusieurs) return;
      const k = finale ? "'" : indice(i + 1);
      fleches.push({ x: im.x, h: im.h, nomPied: `A${k}`, nomTete: `B${k}`, pointille: !im.reelle, principale: finale });
    });

  const graduations: number[] = [];
  if (o.graduation > 0 && (xmax - xmin) / o.graduation <= LIMITES_OPTIQUE.graduations)
    for (let x = Math.ceil(xmin / o.graduation) * o.graduation; x <= xmax; x += o.graduation) graduations.push(Math.round(x * 1e6) / 1e6);

  const finale = imgs[imgs.length - 1];
  return { xmin, xmax, ymax, hauteurLentille, lentilles, reperes, fleches, segments, graduations, imageInfinie: Boolean(finale?.infini) };
}

/**
 * Rayons de construction, suivis à travers toutes les lentilles : depuis B, le rayon parallèle à
 * l'axe, celui qui passe par le centre optique et celui qui passe par le foyer objet de la
 * première lentille (objet à l'infini : trois rayons parallèles). Prolongements en pointillés :
 * vers le foyer d'une lentille divergente et, si l'image finale est virtuelle, jusqu'à elle.
 */
function tracerRayons(o: Optique, ls: Lentille[], imgs: Conjugue[], xmin: number, xmax: number): Segment[] {
  const l1 = ls[0]!;
  /** `depuis` : le rayon semble venir du foyer F situé avant l'objet (loupe) : pointillés de F à B. */
  type Rayon = { x0: number; y0: number; pente: number; depart: number; depuis?: number };
  const rayons: Rayon[] = [];
  if (o.objet.genre === "reel") {
    const { x, h } = o.objet;
    const depart = x < l1.x ? x : xmin;
    rayons.push({ x0: x, y0: h, pente: 0, depart });
    if (Math.abs(l1.x - x) > 1e-9) rayons.push({ x0: x, y0: h, pente: -h / (l1.x - x), depart });
    const xF = l1.x - l1.f;
    if (Math.abs(xF - x) > 1e-9) rayons.push({ x0: x, y0: h, pente: -h / (xF - x), depart, depuis: xF < depart ? xF : undefined });
  } else if (o.objet.genre === "infini") {
    const pente = Math.tan((o.objet.angle * Math.PI) / 180);
    for (const y of [0, pente * l1.f, -pente * l1.f]) rayons.push({ x0: l1.x, y0: y, pente, depart: xmin });
  }

  const finale = imgs[imgs.length - 1];
  const segments: Segment[] = [];
  rayons.forEach((r, k) => {
    let x = r.depart;
    let y = r.y0 + r.pente * (x - r.x0);
    let pente = r.pente;
    // Objet virtuel pour la première lentille (après elle) : prolongement jusqu'à B.
    if (o.objet.genre === "reel" && o.objet.x > l1.x) {
      const yl = r.y0 + r.pente * (l1.x - r.x0);
      segments.push({ x1: l1.x, y1: yl, x2: r.x0, y2: r.y0, pointille: true, rayon: k, fleche: false });
    }
    if (r.depuis !== undefined) segments.push({ x1: r.depuis, y1: 0, x2: r.x0, y2: r.y0, pointille: true, rayon: k, fleche: false });
    ls.forEach((l) => {
      const yl = y + pente * (l.x - x);
      segments.push({ x1: x, y1: y, x2: l.x, y2: yl, pointille: false, rayon: k, fleche: true });
      // Rayon incident dirigé vers le foyer objet (situé après une lentille divergente).
      const xF = l.x - l.f;
      if (l.f < 0 && Math.abs(y + pente * (xF - x)) < 1e-6 * Math.max(1, Math.abs(yl)) && Math.abs(yl) > 1e-9)
        segments.push({ x1: l.x, y1: yl, x2: xF, y2: 0, pointille: true, rayon: k, fleche: false });
      const nouvelle = pente - yl / l.f;
      // Rayon incident parallèle à l'axe sur une lentille divergente : il semble venir de F'.
      if (l.f < 0 && Math.abs(pente) < 1e-12 && Math.abs(yl) > 1e-9)
        segments.push({ x1: l.x, y1: yl, x2: l.x + l.f, y2: 0, pointille: true, rayon: k, fleche: false });
      x = l.x;
      y = yl;
      pente = nouvelle;
    });
    segments.push({ x1: x, y1: y, x2: xmax, y2: y + pente * (xmax - x), pointille: false, rayon: k, fleche: true });
    if (finale && !finale.infini && !finale.reelle && finale.x >= xmin)
      segments.push({ x1: x, y1: y, x2: finale.x, y2: y + pente * (finale.x - x), pointille: true, rayon: k, fleche: false });
  });
  return segments;
}

/** Nombre écrit à la française, sans zéros inutiles. */
export const ecrireNombre = (n: number) => String(Math.round(n * 100) / 100).replace(".", ",").replace("-", "−");

/** Texte cherchable. */
export function texteOptique(o: Optique): string {
  const r = [o.alt];
  for (const l of o.lentilles) r.push(`lentille ${l.f > 0 ? "convergente" : "divergente"} f' = ${ecrireNombre(l.f)}`);
  if (o.objet.genre === "reel") r.push(`objet AB`);
  if (o.objet.genre === "infini") r.push("objet à l'infini");
  return r.filter(Boolean).join(" ");
}
