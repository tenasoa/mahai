/**
 * Tableau d'avancement (chimie) : équation de la réaction, quantités initiales saisies (nombre,
 * « 2,0 × 10^{-2} », symbole comme « n_1 », « excès », ou vide pour l'élève) ; lignes « en
 * cours » et « état final » déduites (x_max et réactif limitant calculés) ou laissées vides.
 * Textes en LaTeX, formules en mhchem.
 */

export type Espece = { formule: string; coef: number; reactif: boolean; initial: string };
export type Avancement = {
  especes: Espece[];
  unite: string;
  /** Remplir la ligne « en cours » (sinon cases vides à compléter). */
  enCours: boolean;
  /** Remplir l'état final (x_max calculé quand c'est possible). */
  final: boolean;
  alt: string;
};

export const UNITES_AVANCEMENT = ["mol", "mmol", "µmol"] as const;
export const LIMITES_AVANCEMENT = { especes: 8, coef: 20, texte: 40 } as const;

export const AVANCEMENT_DEFAUT: Avancement = {
  especes: [
    { formule: "A", coef: 1, reactif: true, initial: "" },
    { formule: "B", coef: 1, reactif: true, initial: "" },
    { formule: "C", coef: 1, reactif: false, initial: "" },
  ],
  unite: "mol",
  enCours: true,
  final: true,
  alt: "",
};

const texte = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max).trim() : "");

/** Valeurs vérifiées ; réactifs d'abord, puis produits. */
export function normaliserAvancement(a: Record<string, unknown> | undefined | null): Avancement {
  const especes = (Array.isArray(a?.especes) ? a.especes : [])
    .slice(0, LIMITES_AVANCEMENT.especes)
    .flatMap((e): Espece[] => {
      if (!e || typeof e !== "object") return [];
      const o = e as Record<string, unknown>;
      const coef = typeof o.coef === "number" && Number.isInteger(o.coef) ? Math.min(LIMITES_AVANCEMENT.coef, Math.max(1, o.coef)) : 1;
      return [{ formule: texte(o.formule, LIMITES_AVANCEMENT.texte), coef, reactif: o.reactif !== false, initial: texte(o.initial, LIMITES_AVANCEMENT.texte) }];
    });
  return {
    especes: [...especes.filter((e) => e.reactif), ...especes.filter((e) => !e.reactif)],
    unite: typeof a?.unite === "string" && (UNITES_AVANCEMENT as readonly string[]).includes(a.unite) ? a.unite : "mol",
    enCours: a?.enCours !== false,
    final: a?.final !== false,
    alt: texte(a?.alt, 300),
  };
}

/* ---------- Nombres ---------- */

/** Lit « 0,5 », « 2.0e-3 », « 2{,}0 \times 10^{-2} », « 3·10^-4 », « 1/4 » ; sinon `null`. */
export function lireQuantite(s: string): number | null {
  const t = s.replace(/\{,\}/g, ",").replace(/\\[,;!]|\s/g, "");
  const frac = /^\\[dt]?frac\{(\d+)\}\{(\d+)\}$/.exec(t) ?? /^(\d+)\/(\d+)$/.exec(t);
  if (frac) return Number(frac[2]) ? Number(frac[1]) / Number(frac[2]) : null;
  const m = /^(\d+(?:[.,]\d+)?)(?:(?:\\times|\\cdot|×|·|x)10\^\{?([-−]?\d+)\}?|[eE]([-−]?\d+))?$/.exec(t);
  if (!m) return null;
  const exposant = Number((m[2] ?? m[3] ?? "0").replace("−", "-"));
  const v = Number(m[1]!.replace(",", ".")) * 10 ** exposant;
  return Number.isFinite(v) ? v : null;
}

const fr = (n: number) => String(n).replace(".", "{,}");

/**
 * Écriture des résultats : notation scientifique ou décimale, avec `chiffres` significatifs
 * (ceux des données de l'énoncé) ou, à défaut (`null`), arrondie sans zéros inutiles.
 */
export type Ecriture = { scientifique: boolean; chiffres: number | null };
const LIBRE: Ecriture = { scientifique: false, chiffres: null };

/** Écrit une quantité en LaTeX : décimal ou notation scientifique. */
export function ecrireQuantite(v: number, ecriture: Ecriture = LIBRE): string {
  const a = Math.abs(v);
  if (a < 1e-12) return "0";
  const chiffres = ecriture.chiffres ?? 3;
  if (ecriture.scientifique || a < 1e-2 || a >= 1e4) {
    let exposant = Math.floor(Math.log10(a) + 1e-9);
    let m = v / 10 ** exposant;
    // Mantisse à `chiffres` chiffres significatifs ; 9,99… arrondi à 10 passe à l'exposant suivant.
    let ecrite = m.toPrecision(chiffres);
    if (Math.abs(Number(ecrite)) >= 10) {
      exposant++;
      m /= 10;
      ecrite = m.toPrecision(chiffres);
    }
    if (ecriture.chiffres === null) ecrite = String(Number(ecrite));
    return `${ecrite.replace(".", "{,}")} \\times 10^{${exposant}}`;
  }
  if (ecriture.chiffres === null) return fr(Math.round(v * 1e4) / 1e4);
  const decimales = Math.min(8, Math.max(0, ecriture.chiffres - 1 - Math.floor(Math.log10(a) + 1e-9)));
  return v.toFixed(decimales).replace(".", "{,}");
}

const SCIENTIFIQUE = /[eE][-−]?\d|10\^/;

/** Chiffres significatifs d'une quantité écrite (« 2,0e-2 » → 2, « 0,050 » → 2). */
export function chiffresSignificatifs(s: string): number | null {
  const m = /^\s*(\d+(?:[.,{}]+\d+)?)/.exec(s.replace(/\{,\}/g, ","));
  if (!m) return null;
  const chiffres = m[1]!.replace(/[^\d]/g, "").replace(/^0+/, "");
  return chiffres.length || null;
}

/** Quantité telle que l'auteur l'a écrite, mise en LaTeX (« 2,0e-2 » → « 2{,}0 \times 10^{-2} »). */
export function afficherQuantite(s: string): string {
  const e = /^\s*(\d+(?:[.,]\d+)?)\s*[eE]\s*([-−]?\d+)\s*$/.exec(s);
  if (e) return `${e[1]!.replace(/[.,]/, "{,}")} \\times 10^{${e[2]!.replace("−", "-")}}`;
  return s.replace(/(\d)[,](?=\d)/g, "$1{,}");
}

const estExces = (s: string) => /^(en\s*)?exc[eè]s$/i.test(s.trim());

/* ---------- Lignes du tableau ---------- */

export type Cellules = { initial: string[]; enCours: string[]; final: string[]; xmax: string; limitants: number[] };

/** `a·x` en LaTeX : « x », « 2x », « 3x_{max} ». */
const terme = (coef: number, x: string) => (coef === 1 ? x : `${coef}${x}`);

export function cellules(t: Avancement): Cellules {
  const valeurs = t.especes.map((e) => lireQuantite(e.initial));
  // Résultats écrits comme les données : notation scientifique si l'énoncé l'emploie, avec le
  // plus petit nombre de chiffres significatifs des données (entre 2 et 4). Seules les données
  // écrites avec une virgule ou une puissance de 10 en indiquent (« 1 » ou « 3 » : non).
  const chiffres = t.especes
    .map((e, i) => (valeurs[i] && /[.,]|[eE][-−]?\d|10\^/.test(e.initial) ? chiffresSignificatifs(e.initial) : null))
    .filter((c): c is number => c !== null);
  const ecriture: Ecriture = {
    scientifique: t.especes.some((e) => SCIENTIFIQUE.test(e.initial)),
    chiffres: chiffres.length ? Math.min(4, Math.max(2, Math.min(...chiffres))) : null,
  };
  const ecrire = (v: number) => ecrireQuantite(v, ecriture);
  // x_max : plus petit n/a parmi les réactifs (hors excès), si tous sont des nombres.
  const reactifs = t.especes.map((e, i) => ({ e, i, v: valeurs[i] })).filter(({ e }) => e.reactif && !estExces(e.initial));
  const calculable = reactifs.length > 0 && reactifs.every((r) => r.v !== null);
  const xmax = calculable ? Math.min(...reactifs.map((r) => r.v! / r.e.coef)) : null;
  const limitants = xmax === null ? [] : reactifs.filter((r) => Math.abs(r.v! / r.e.coef - xmax) <= 1e-12 * Math.max(1, xmax)).map((r) => r.i);

  const initial = t.especes.map((e) => (estExces(e.initial) ? "\\text{excès}" : afficherQuantite(e.initial)));
  const signe = (e: Espece) => (e.reactif ? "-" : "+");
  const enCours = t.especes.map((e, i) => {
    if (!t.enCours || !e.initial) return "";
    if (estExces(e.initial)) return "\\text{excès}";
    const v = valeurs[i];
    if (v !== null && Math.abs(v) < 1e-12) return e.reactif ? `-${terme(e.coef, "x")}` : terme(e.coef, "x");
    return `${initial[i]} ${signe(e)} ${terme(e.coef, "x")}`;
  });
  const final = t.especes.map((e, i) => {
    if (!t.final || !e.initial) return "";
    if (estExces(e.initial)) return "\\text{excès}";
    const v = valeurs[i];
    if (v !== null && xmax !== null) return ecrire(v + (e.reactif ? -1 : 1) * e.coef * xmax);
    if (v !== null && Math.abs(v) < 1e-12) return e.reactif ? "" : terme(e.coef, "x_{max}");
    return `${initial[i]} ${signe(e)} ${terme(e.coef, "x_{max}")}`;
  });
  return {
    initial,
    enCours,
    final,
    xmax: t.final && xmax !== null ? `x_{max} = ${ecrire(xmax)}` : "x_{max}",
    limitants: t.final ? limitants : [],
  };
}

/** Équation en mhchem : « 2H2 + O2 -> 2H2O ». */
export function equation(t: Avancement): string {
  const cote = (r: boolean) =>
    t.especes
      .filter((e) => e.reactif === r && e.formule)
      .map((e) => (e.coef > 1 ? `${e.coef}${e.formule}` : e.formule))
      .join(" + ");
  return `${cote(true)} -> ${cote(false)}`;
}

/** Texte cherchable. */
export function texteAvancement(t: Avancement): string {
  return [t.alt, equation(t), ...t.especes.map((e) => e.initial)].filter(Boolean).join(" ");
}
