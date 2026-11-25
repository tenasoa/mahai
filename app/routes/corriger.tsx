import type { Route } from "./+types/corriger";
import type { MiseEnPage } from "./_app";
import { EmptyState } from "~/components/ui/EmptyState";
import { Icon } from "~/components/ui/Icon";

export const handle: MiseEnPage = { large: true };

export function meta({}: Route.MetaArgs) {
  return [{ title: "Corriger ma copie — Mah.ai" }];
}

const ETAPES = [
  {
    titre: "Prends ta copie en photo",
    texte: "Une ou plusieurs pages, même manuscrites.",
    tuile: "bg-maths",
  },
  {
    titre: "L'IA la lit et la corrige",
    texte: "Question par question, avec une note estimée.",
    tuile: "bg-histoire",
  },
  {
    titre: "Tu revois tes erreurs",
    texte: "Avec le tuteur, puis sur des exercices du même type.",
    tuile: "bg-svt",
  },
];

/** Ce que l'ordinateur ajoutera : décrit, pas simulé (la fonction n'existe pas encore). */
const SUR_ORDINATEUR = [
  "Glisser-déposer plusieurs photos ou un PDF scanné",
  "Ta copie et la correction côte à côte, question par question",
  "Chaque réponse marquée juste ou à revoir, avec le barème",
];

export default function Corriger() {
  return (
    <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-start lg:gap-10">
      <div className="flex flex-col gap-5">
        <h1 className="text-[2rem] leading-none font-extrabold tracking-tight lg:text-4xl">
          Corriger ma copie
        </h1>
        <p className="hidden text-[17px] leading-relaxed text-ink-2 lg:block">
          Fais ton sujet sur papier, comme le jour de l'examen, puis donne ta copie à l'IA : elle
          la corrige avec le barème officiel.
        </p>

        <ol className="flex flex-col gap-2.5">
          {ETAPES.map((e, i) => (
            <li
              key={e.titre}
              className="flex items-center gap-3.5 rounded-card bg-soft p-3 lg:p-4"
            >
              <span
                className={`${e.tuile} flex size-12 shrink-0 items-center justify-center rounded-[14px] text-lg font-extrabold`}
              >
                {i + 1}
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-base font-bold">{e.titre}</span>
                <span className="text-sm text-muted">{e.texte}</span>
              </span>
            </li>
          ))}
        </ol>

        <EmptyState title="Bientôt disponible">
          <p>
            La correction de copie arrive avec l'ouverture des comptes. Tu pourras
            l'essayer dès ton inscription.
          </p>
        </EmptyState>
      </div>

      {/* Ordinateur : la zone de dépôt telle qu'elle sera, inactive tant que la fonction n'existe pas. */}
      <section aria-labelledby="titre-depot" className="hidden flex-col gap-4 lg:flex">
        <div
          aria-disabled="true"
          className="flex min-h-80 flex-col items-center justify-center gap-3 rounded-card border-2 border-dashed border-control p-8 text-center"
        >
          <span className="flex size-14 items-center justify-center rounded-2xl bg-soft text-muted">
            <Icon name="envoi" size={26} />
          </span>
          <h2 id="titre-depot" className="text-lg font-bold">
            Dépose ta copie ici
          </h2>
          <p className="max-w-sm text-sm text-muted">Photos (JPG, PNG) ou PDF scanné, plusieurs pages à la fois.</p>
          <span className="rounded-full bg-soft px-3 py-1 text-xs font-medium text-ink-2">Bientôt</span>
        </div>
        <div className="flex flex-col gap-2.5 rounded-card border-2 border-line p-5">
          <h2 className="text-sm font-bold">Sur ordinateur</h2>
          <ul className="flex flex-col gap-2 text-sm text-ink-2">
            {SUR_ORDINATEUR.map((t) => (
              <li key={t} className="flex items-start gap-2">
                <span aria-hidden="true" className="mt-1.5 size-2.5 shrink-0 rounded-[3px] bg-control" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
