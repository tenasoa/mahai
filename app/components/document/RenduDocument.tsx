import { Fragment, useEffect, useRef, type ReactNode } from "react";

import { dessinerFormule } from "~/lib/document/katex.client";

import { pointsPour, type Marque, type Noeud } from "~/lib/document/nettoyer";

export type SerieAffichee = { id: string; nom: string };

/**
 * Affiche un énoncé ou un corrigé (document JSON déjà nettoyé par `nettoyerDocument`).
 * Aucune dépendance à l'éditeur : la page élève reste légère. Les formules sont dessinées par
 * KaTeX (avec \ce{…} pour la chimie), chargé seulement si la page en contient.
 */

const ROMAINS = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x"];

function numero(profondeur: number, index: number): string {
  if (profondeur === 0) return `${index + 1}.`;
  if (profondeur === 1) return `${String.fromCharCode(97 + (index % 26))})`;
  return `${ROMAINS[index] ?? index + 1})`;
}

const nombre = (n: number) => String(n).replace(".", ",");
const pts = (n: number) => `${nombre(n)} pt${n > 1 ? "s" : ""}`;

/** Barème d'un exercice ou d'une question : celui de la série choisie, ou chaque série. */
function Points({ attrs, ctx }: { attrs: Noeud["attrs"]; ctx: Contexte }) {
  const parSerie = attrs?.pointsSeries as Record<string, number> | undefined;
  let texte: string | null = null;
  if (ctx.serie || !parSerie) {
    const p = pointsPour(attrs, ctx.serie);
    texte = p === null ? null : pts(p);
  } else {
    texte = ctx.series
      .map((s) => {
        const p = pointsPour(attrs, s.id);
        return p === null ? null : `${s.nom} : ${pts(p)}`;
      })
      .filter(Boolean)
      .join(" · ");
  }
  if (!texte) return null;
  return (
    <span className="shrink-0 rounded-full bg-soft px-2.5 py-0.5 text-xs font-medium tabular-nums text-ink-2">
      {texte}
    </span>
  );
}

function avecMarques(texte: ReactNode, marques: Marque[] | undefined): ReactNode {
  return (marques ?? []).reduce<ReactNode>((enfant, m) => {
    switch (m.type) {
      case "bold":
        return <strong>{enfant}</strong>;
      case "italic":
        return <em>{enfant}</em>;
      case "underline":
        return <u>{enfant}</u>;
      case "strike":
        return <s>{enfant}</s>;
      case "code":
        return <code>{enfant}</code>;
      case "subscript":
        return <sub>{enfant}</sub>;
      case "superscript":
        return <sup>{enfant}</sup>;
      case "link":
        return (
          <a href={String(m.attrs?.href)} target="_blank" rel="noopener noreferrer nofollow">
            {enfant}
          </a>
        );
      default:
        return enfant;
    }
  }, texte);
}

type Contexte = {
  profondeurQuestion: number;
  /** Série choisie par l'élève (barème affiché pour elle seule). */
  serie: string | null;
  series: SerieAffichee[];
};

function enfants(n: Noeud, ctx: Contexte): ReactNode {
  let indexQuestion = 0;
  let indexExercice = 0;
  return (n.content ?? []).map((e, i) => {
    let rendu: ReactNode;
    if (e.type === "question") {
      rendu = noeud(e, { ...ctx }, indexQuestion++);
    } else if (e.type === "exercice") {
      rendu = noeud(e, ctx, indexExercice++);
    } else {
      rendu = noeud(e, ctx, i);
    }
    return <Fragment key={i}>{rendu}</Fragment>;
  });
}

function noeud(n: Noeud, ctx: Contexte, index: number): ReactNode {
  switch (n.type) {
    case "doc":
      return enfants(n, ctx);
    case "text":
      return avecMarques(n.text, n.marks);
    case "paragraph":
      return <p>{enfants(n, ctx)}</p>;
    case "heading": {
      const niveau = n.attrs?.level === 3 ? "h3" : n.attrs?.level === 4 ? "h4" : "h2";
      const Balise = niveau;
      return <Balise>{enfants(n, ctx)}</Balise>;
    }
    case "bulletList":
      return <ul>{enfants(n, ctx)}</ul>;
    case "orderedList":
      return <ol start={Number(n.attrs?.start ?? 1)}>{enfants(n, ctx)}</ol>;
    case "listItem":
      return <li>{enfants(n, ctx)}</li>;
    case "blockquote":
      return <blockquote>{enfants(n, ctx)}</blockquote>;
    case "codeBlock":
      return (
        <pre>
          <code>{enfants(n, ctx)}</code>
        </pre>
      );
    case "horizontalRule":
      return <hr />;
    case "hardBreak":
      return <br />;
    case "table":
      return (
        <div className="tableau">
          <table>
            <tbody>{enfants(n, ctx)}</tbody>
          </table>
        </div>
      );
    case "tableRow":
      return <tr>{enfants(n, ctx)}</tr>;
    case "tableHeader":
    case "tableCell": {
      const Cellule = n.type === "tableHeader" ? "th" : "td";
      return (
        <Cellule colSpan={Number(n.attrs?.colspan ?? 1)} rowSpan={Number(n.attrs?.rowspan ?? 1)}>
          {enfants(n, ctx)}
        </Cellule>
      );
    }
    case "inlineMath":
      return <Tex latex={String(n.attrs?.latex ?? "")} />;
    case "blockMath":
      return (
        <div className="formule">
          <Tex latex={String(n.attrs?.latex ?? "")} bloc />
        </div>
      );
    case "exercice": {
      const titre = String(n.attrs?.titre ?? "");
      return (
        <section className="exercice">
          <header className="flex items-start justify-between gap-3">
            <h2>
              Exercice {index + 1}
              {titre ? ` — ${titre}` : ""}
            </h2>
            <Points attrs={n.attrs} ctx={ctx} />
          </header>
          {enfants(n, { ...ctx, profondeurQuestion: 0 })}
        </section>
      );
    }
    case "question":
      return (
        <div className={`question profondeur-${ctx.profondeurQuestion}`}>
          <span className="numero" aria-hidden="true">
            {numero(ctx.profondeurQuestion, index)}
          </span>
          <div className="corps">
            {enfants(n, { ...ctx, profondeurQuestion: ctx.profondeurQuestion + 1 })}
          </div>
          <Points attrs={n.attrs} ctx={ctx} />
        </div>
      );
    default:
      return null;
  }
}

/**
 * Formule LaTeX : le texte brut est rendu côté serveur (lisible sans JavaScript), puis KaTeX le
 * dessine dans le navigateur (trop coûteux en CPU pour un Worker).
 */
export function Tex({ latex, bloc = false }: { latex: string; bloc?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (ref.current) void dessinerFormule(ref.current, latex, bloc);
  }, [latex, bloc]);
  return (
    <span ref={ref} className="tex" data-bloc={bloc ? "" : undefined}>
      {latex}
    </span>
  );
}

export function RenduDocument({
  doc,
  serie = null,
  series = [],
  className = "",
}: {
  doc: Noeud;
  serie?: string | null;
  series?: SerieAffichee[];
  className?: string;
}) {
  return (
    <div className={`contenu ${className}`}>
      {noeud(doc, { profondeurQuestion: 0, serie, series }, 0)}
    </div>
  );
}
