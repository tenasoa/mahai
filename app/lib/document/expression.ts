/**
 * Expressions mathématiques des graphiques (« x^2 - 3x + 1 », « 2sin(x) », « ln(x)/x »…).
 *
 * Analyseur maison, sans `eval` ni `Function` : l'expression vient d'un contributeur et elle est
 * calculée sur le serveur. Une expression lue devient un arbre de fonctions JavaScript.
 *
 * Reconnu : + - * / ^ (et × ÷ · −), parenthèses, |valeur absolue|, multiplication implicite
 * (2x, 3(x+1), x sin(x)), virgule ou point décimal, pi / π, e, et les fonctions de FONCTIONS.
 */

export type Fonction = (x: number) => number;

const FONCTIONS: Record<string, (v: number) => number> = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  arcsin: Math.asin,
  arccos: Math.acos,
  arctan: Math.atan,
  sinh: Math.sinh,
  cosh: Math.cosh,
  tanh: Math.tanh,
  sh: Math.sinh,
  ch: Math.cosh,
  th: Math.tanh,
  exp: Math.exp,
  ln: Math.log,
  log: Math.log10,
  sqrt: Math.sqrt,
  racine: Math.sqrt,
  abs: Math.abs,
  ent: Math.floor,
  floor: Math.floor,
};

const CONSTANTES: Record<string, number> = { pi: Math.PI, e: Math.E };

/** Noms reconnus, du plus long au plus court (« sinh » avant « sin », « exp » avant « e »). */
const NOMS = [...Object.keys(FONCTIONS), ...Object.keys(CONSTANTES), "x"].sort((a, b) => b.length - a.length);

export const LONGUEUR_MAX_EXPRESSION = 200;

type Jeton =
  | { t: "nombre"; v: number }
  | { t: "nom"; v: string }
  | { t: "op"; v: "+" | "-" | "*" | "/" | "^" | "(" | ")" | "|" };

export class ExpressionInvalide extends Error {}

function decouper(source: string): Jeton[] {
  const s = source
    .replace(/[×·∙]/g, "*")
    .replace(/÷/g, "/")
    .replace(/[−–]/g, "-")
    .replace(/π/g, "pi")
    .replace(/√/g, "sqrt")
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")
    .replace(/\*\*/g, "^");
  const jetons: Jeton[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i]!;
    if (/\s/.test(c)) {
      i++;
    } else if (/[0-9.,]/.test(c)) {
      // Pas de notation « 2e3 » : « 2e » se lit 2 × e.
      const m = /^[0-9]*[.,]?[0-9]*/.exec(s.slice(i))![0];
      const v = Number(m.replace(",", "."));
      if (m === "" || m === "." || m === "," || !Number.isFinite(v)) throw new ExpressionInvalide(`Nombre mal écrit : « ${m || c} ».`);
      jetons.push({ t: "nombre", v });
      i += m.length;
    } else if (/[a-zA-Z]/.test(c)) {
      // Suite de lettres : découpée en noms connus (« xsin » → x, sin ; « ex » → e, x).
      const mot = /^[a-zA-Z]+/.exec(s.slice(i))![0];
      let j = 0;
      while (j < mot.length) {
        const nom = NOMS.find((n) => mot.toLowerCase().startsWith(n, j));
        if (!nom) throw new ExpressionInvalide(`Inconnu : « ${mot.slice(j)} ». Variable : x.`);
        jetons.push({ t: "nom", v: nom });
        j += nom.length;
      }
      i += mot.length;
    } else if ("+-*/^()|".includes(c)) {
      jetons.push({ t: "op", v: c as "+" });
      i++;
    } else if (c === "[" || c === "{") {
      jetons.push({ t: "op", v: "(" });
      i++;
    } else if (c === "]" || c === "}") {
      jetons.push({ t: "op", v: ")" });
      i++;
    } else {
      throw new ExpressionInvalide(`Caractère non reconnu : « ${c} ».`);
    }
  }
  return jetons;
}

/** Lit une expression en x ; lève `ExpressionInvalide` avec un message en français. */
export function compiler(source: string): Fonction {
  if (source.length > LONGUEUR_MAX_EXPRESSION) throw new ExpressionInvalide("Expression trop longue.");
  const jetons = decouper(source);
  if (jetons.length === 0) throw new ExpressionInvalide("Expression vide.");
  let p = 0;
  let absolu = 0; // profondeur dans |…|
  let noeuds = 0;

  const voir = () => jetons[p];
  const estOp = (v: string) => {
    const j = jetons[p];
    return j?.t === "op" && j.v === v;
  };
  const compter = () => {
    if (++noeuds > 500) throw new ExpressionInvalide("Expression trop longue.");
  };

  /** Le jeton courant peut-il commencer un facteur (multiplication implicite) ? */
  function debutFacteur(): boolean {
    const j = voir();
    if (!j) return false;
    if (j.t !== "op") return true;
    if (j.v === "(") return true;
    return j.v === "|" && absolu === 0;
  }

  function somme(): Fonction {
    let g = produit();
    while (estOp("+") || estOp("-")) {
      const op = (voir() as { v: string }).v;
      p++;
      const a = g;
      const b = produit();
      compter();
      g = op === "+" ? (x) => a(x) + b(x) : (x) => a(x) - b(x);
    }
    return g;
  }

  function produit(): Fonction {
    let g = signe();
    for (;;) {
      if (estOp("*") || estOp("/")) {
        const op = (voir() as { v: string }).v;
        p++;
        const a = g;
        const b = signe();
        compter();
        g = op === "*" ? (x) => a(x) * b(x) : (x) => a(x) / b(x);
      } else if (debutFacteur()) {
        const a = g;
        const b = puissance();
        compter();
        g = (x) => a(x) * b(x);
      } else {
        return g;
      }
    }
  }

  function signe(): Fonction {
    if (estOp("-")) {
      p++;
      const a = signe();
      compter();
      return (x) => -a(x);
    }
    if (estOp("+")) {
      p++;
      return signe();
    }
    return puissance();
  }

  function puissance(): Fonction {
    const base = atome();
    if (!estOp("^")) return base;
    p++;
    const exposant = signe(); // associatif à droite : 2^3^2 = 2^(3^2) ; 2^-1 permis
    compter();
    return (x) => Math.pow(base(x), exposant(x));
  }

  function atome(): Fonction {
    const j = voir();
    if (!j) throw new ExpressionInvalide("Expression incomplète.");
    compter();
    if (j.t === "nombre") {
      p++;
      return () => j.v;
    }
    if (j.t === "nom") {
      p++;
      if (j.v === "x") return (x) => x;
      if (j.v in CONSTANTES) {
        const v = CONSTANTES[j.v]!;
        return () => v;
      }
      const f = FONCTIONS[j.v]!;
      if (!voir() || (voir()!.t === "op" && !estOp("(") && !estOp("|"))) {
        throw new ExpressionInvalide(`Il manque l'argument de ${j.v}.`);
      }
      // sin(x)^2 = (sin x)^2 : l'argument est un seul atome, la puissance s'applique au résultat.
      const a = atome();
      return (x) => f(a(x));
    }
    if (j.v === "(") {
      p++;
      const g = somme();
      if (!estOp(")")) throw new ExpressionInvalide("Parenthèse non fermée.");
      p++;
      return g;
    }
    if (j.v === "|") {
      p++;
      absolu++;
      const g = somme();
      absolu--;
      if (!estOp("|")) throw new ExpressionInvalide("Valeur absolue non fermée.");
      p++;
      return (x) => Math.abs(g(x));
    }
    throw new ExpressionInvalide(j.v === ")" ? "Parenthèse fermante en trop." : `« ${j.v} » mal placé.`);
  }

  const resultat = somme();
  if (p < jetons.length) {
    const j = jetons[p]!;
    throw new ExpressionInvalide(j.t === "op" && j.v === ")" ? "Parenthèse fermante en trop." : "Expression mal formée.");
  }
  return resultat;
}

/** Comme `compiler`, sans lever : `null` si l'expression est invalide. */
export function essayerCompiler(source: string): Fonction | null {
  try {
    return compiler(source);
  } catch {
    return null;
  }
}

/** Message d'erreur pour l'éditeur, `null` si l'expression est valide. */
export function erreurExpression(source: string): string | null {
  try {
    compiler(source);
    return null;
  } catch (e) {
    return e instanceof ExpressionInvalide ? e.message : "Expression invalide.";
  }
}
