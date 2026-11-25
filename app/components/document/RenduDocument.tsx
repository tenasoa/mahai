import { Fragment, useEffect, useId, useRef, useState, type ReactNode } from "react";

import { chargerColoration, dessinerChronogramme, dessinerDiagramme } from "~/lib/document/charger.client";
import { normaliserKarnaugh } from "~/lib/document/karnaugh";
import { normaliserGraphique } from "~/lib/document/graphique";
import { normaliserVariations } from "~/lib/document/variations";
import { normaliserArbre, normaliserEchiquier } from "~/lib/document/genetique";
import { normaliserReperes } from "~/lib/document/reperes";
import { ArbreGenealogique } from "./ArbreGenealogique";
import { EchiquierCroisement } from "./EchiquierCroisement";
import { GrilleKarnaugh } from "./GrilleKarnaugh";
import { ImageReperes } from "./ImageReperes";
import { Molecule } from "./Molecule";
import { SvgGraphique } from "./SvgGraphique";
import { TableauVariations } from "./TableauVariations";
import { Tex } from "./Tex";
import { ENCADRES, LANGAGES } from "~/lib/document/outils";
import { urlMedia } from "~/lib/medias/medias";

import { pointsPour, type Marque, type Noeud } from "~/lib/document/nettoyer";
import { idExercice, idPartie, idQuestion } from "~/lib/document/plan";

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
  /** Partagé par tout le document : numéros des documents et notes de bas de page. */
  compteurs: { documents: number; notes: string[]; prefixe: string; parties: number };
  /** Préfixe des ancres du sommaire (« enonce ») ; aucune ancre sans lui. */
  ancre: string | null;
  /** Enfant direct du document (seuls ceux-là ont une ancre de partie). */
  racine: boolean;
  /** Exercice parent (« exercice-2 »), pour l'ancre de ses questions. */
  chemin: string | null;
};

const texteDe = (n: Noeud): string =>
  n.type === "text" ? (n.text ?? "") : (n.content ?? []).map(texteDe).join("");

function enfants(n: Noeud, parent: Contexte): ReactNode {
  let indexQuestion = 0;
  let indexExercice = 0;
  const ctx = parent.racine === (n.type === "doc") ? parent : { ...parent, racine: n.type === "doc" };
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
      // Même règle que planDocument : titres de niveau 2, non vides, au premier niveau.
      const id =
        ctx.ancre && ctx.racine && niveau === "h2" && texteDe(n).trim()
          ? `${ctx.ancre}-${idPartie(++ctx.compteurs.parties)}`
          : undefined;
      return <Balise id={id}>{enfants(n, { ...ctx, racine: false })}</Balise>;
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
        <BlocCode
          code={texteDe(n)}
          langage={(n.attrs?.language as string | null) ?? null}
          numeros={n.attrs?.numeros === true}
        />
      );
    case "image": {
      const largeur = Number(n.attrs?.largeur) || undefined;
      const hauteur = Number(n.attrs?.hauteur) || undefined;
      const reperes = normaliserReperes(n.attrs?.reperes);
      if (reperes.length) {
        return (
          <ImageReperes
            src={urlMedia(String(n.attrs?.cle))}
            alt={String(n.attrs?.alt ?? "")}
            largeur={largeur}
            hauteur={hauteur}
            reperes={reperes}
          />
        );
      }
      return (
        <img
          src={urlMedia(String(n.attrs?.cle))}
          alt={String(n.attrs?.alt ?? "")}
          width={largeur}
          height={hauteur}
          loading="lazy"
          decoding="async"
          className="image"
        />
      );
    }
    case "documentNumerote": {
      const numeroDocument = ++ctx.compteurs.documents;
      const legende = String(n.attrs?.legende ?? "");
      return (
        <figure className="document">
          <div className="corps">{enfants(n, ctx)}</div>
          <figcaption>
            <strong>Document {numeroDocument}</strong>
            {legende ? ` — ${legende}` : ""}
          </figcaption>
        </figure>
      );
    }
    case "encadre": {
      const genre = String(n.attrs?.genre ?? "donnees") as keyof typeof ENCADRES;
      return (
        <aside className="encadre" data-genre={genre}>
          <p className="titre-encadre">{ENCADRES[genre] ?? ENCADRES.donnees}</p>
          {enfants(n, ctx)}
        </aside>
      );
    }
    case "note": {
      const { notes, prefixe } = ctx.compteurs;
      notes.push(String(n.attrs?.texte ?? ""));
      const k = notes.length;
      return (
        <sup className="appel-note">
          <a id={`${prefixe}-appel-${k}`} href={`#${prefixe}-note-${k}`} aria-label={`Note ${k}`}>
            {k}
          </a>
        </sup>
      );
    }
    case "extrait": {
      const source = String(n.attrs?.source ?? "");
      return (
        <figure className="extrait">
          <ol>
            {(n.content ?? []).map((ligne, i) => (
              <li key={i}>
                <span className="num" aria-hidden="true">
                  {(i + 1) % 5 === 0 ? i + 1 : ""}
                </span>
                <span>{ligne.content?.length ? enfants(ligne, ctx) : " "}</span>
              </li>
            ))}
          </ol>
          {source ? <figcaption>{source}</figcaption> : null}
        </figure>
      );
    }
    case "diagramme":
      return <Dessin source={String(n.attrs?.source ?? "")} dessiner={dessinerDiagramme} />;
    case "chronogramme":
      return <Dessin source={String(n.attrs?.source ?? "")} dessiner={dessinerChronogramme} />;
    case "schema": {
      const largeur = Number(n.attrs?.largeur) || undefined;
      const hauteur = Number(n.attrs?.hauteur) || undefined;
      return (
        <img
          src={urlMedia(String(n.attrs?.cle))}
          alt={String(n.attrs?.alt ?? "") || "Schéma"}
          width={largeur}
          height={hauteur}
          loading="lazy"
          decoding="async"
          className="image schema"
        />
      );
    }
    case "karnaugh":
      return (
        <div className="tableau">
          <GrilleKarnaugh k={normaliserKarnaugh(n.attrs)} />
        </div>
      );
    case "graphique":
      return (
        <figure className="figure-graphique">
          <SvgGraphique g={normaliserGraphique(n.attrs)} />
        </figure>
      );
    case "variations":
      return (
        <div className="tableau">
          <TableauVariations t={normaliserVariations(n.attrs)} />
        </div>
      );
    case "molecule":
      return (
        <Molecule
          smiles={String(n.attrs?.smiles ?? "")}
          nom={String(n.attrs?.nom ?? "")}
          carbones={n.attrs?.carbones === true}
        />
      );
    case "arbre":
      return (
        <figure className="figure-arbre">
          <ArbreGenealogique arbre={normaliserArbre(n.attrs)} />
        </figure>
      );
    case "echiquier":
      return (
        <div className="tableau">
          <EchiquierCroisement e={normaliserEchiquier(n.attrs)} />
        </div>
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
      const chemin = idExercice(index + 1);
      return (
        <section className="exercice" id={ctx.ancre ? `${ctx.ancre}-${chemin}` : undefined}>
          <header className="flex items-start justify-between gap-3">
            <h2>
              Exercice {index + 1}
              {titre ? ` — ${titre}` : ""}
            </h2>
            <Points attrs={n.attrs} ctx={ctx} />
          </header>
          {enfants(n, { ...ctx, profondeurQuestion: 0, chemin })}
        </section>
      );
    }
    case "question":
      return (
        <div
          className={`question profondeur-${ctx.profondeurQuestion}`}
          id={ctx.ancre && ctx.profondeurQuestion === 0 && (ctx.racine || ctx.chemin) ? `${ctx.ancre}-${idQuestion(index + 1, ctx.chemin ?? undefined)}` : undefined}
        >
          <span className="numero" aria-hidden="true">
            {numero(ctx.profondeurQuestion, index)}
          </span>
          <div className="corps">
            {enfants(n, { ...ctx, profondeurQuestion: ctx.profondeurQuestion + 1, chemin: null })}
          </div>
          <Points attrs={n.attrs} ctx={ctx} />
        </div>
      );
    default:
      return null;
  }
}

export { Tex };

type Hast = { type: string; value?: string; properties?: { className?: string[] }; children?: Hast[] };

function depuisHast(n: Hast, cle: number): ReactNode {
  if (n.type === "text") return n.value ?? "";
  const contenu = (n.children ?? []).map(depuisHast);
  if (n.type !== "element") return <Fragment key={cle}>{contenu}</Fragment>;
  return (
    <span key={cle} className={n.properties?.className?.join(" ")}>
      {contenu}
    </span>
  );
}

/** Code source : texte brut côté serveur, coloré dans le navigateur (lowlight chargé à la demande). */
function BlocCode({ code, langage, numeros }: { code: string; langage: string | null; numeros: boolean }) {
  const [colore, setColore] = useState<ReactNode>(null);
  useEffect(() => {
    if (!langage || langage === "plaintext") return;
    let annule = false;
    void chargerColoration().then((lowlight) => {
      if (annule || !lowlight.registered(langage)) return;
      setColore(depuisHast(lowlight.highlight(langage, code) as Hast, 0));
    });
    return () => {
      annule = true;
    };
  }, [code, langage]);
  const nom = LANGAGES.find((l) => l.id === langage)?.nom;
  const lignes = code.split("\n").length;
  return (
    <figure className="code" aria-label={nom ? `Code ${nom}` : "Code"}>
      {nom && langage !== "plaintext" ? <figcaption>{nom}</figcaption> : null}
      <div className="defilement">
        {numeros ? (
          <pre className="numeros" aria-hidden="true">
            {Array.from({ length: lignes }, (_, i) => i + 1).join("\n")}
          </pre>
        ) : null}
        <pre>
          <code className="hljs">{colore ?? code}</code>
        </pre>
      </div>
    </figure>
  );
}

/** Diagramme (Mermaid) ou chronogramme (WaveDrom) : texte côté serveur, SVG dans le navigateur. */
function Dessin({ source, dessiner }: { source: string; dessiner: (source: string) => Promise<string> }) {
  const ref = useRef<HTMLDivElement>(null);
  const [dessine, setDessine] = useState(false);
  useEffect(() => {
    let annule = false;
    dessiner(source)
      .then((svg) => {
        if (annule || !ref.current) return;
        ref.current.innerHTML = svg;
        setDessine(true);
      })
      .catch(() => {});
    return () => {
      annule = true;
    };
  }, [source, dessiner]);
  return (
    <figure className="diagramme">
      {/* Conteneur vide réservé à Mermaid : React n'y touche pas. */}
      <div ref={ref} />
      {dessine ? null : <pre>{source}</pre>}
    </figure>
  );
}

export function RenduDocument({
  doc,
  serie = null,
  series = [],
  className = "",
  ancre = null,
}: {
  doc: Noeud;
  serie?: string | null;
  series?: SerieAffichee[];
  className?: string;
  /** Préfixe des ancres du sommaire (voir `planDocument`). */
  ancre?: string | null;
}) {
  const prefixe = `n${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const compteurs = { documents: 0, notes: [] as string[], prefixe, parties: 0 };
  // Rendu synchrone : les notes sont collectées pendant le parcours, puis listées à la fin.
  const corps = noeud(doc, { profondeurQuestion: 0, serie, series, compteurs, ancre, racine: false, chemin: null }, 0);
  return (
    <div className={`contenu ${className}`}>
      {corps}
      {compteurs.notes.length > 0 ? (
        <ol className="notes" aria-label="Notes">
          {compteurs.notes.map((texte, i) => (
            <li key={i} id={`${prefixe}-note-${i + 1}`}>
              {texte}{" "}
              <a href={`#${prefixe}-appel-${i + 1}`} aria-label="Retour au texte">
                ↩
              </a>
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}
