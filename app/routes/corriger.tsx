import type { Route } from "./+types/corriger";
import { EmptyState } from "~/components/ui/EmptyState";

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

export default function Corriger() {
  return (
    <>
      <h1 className="text-[2rem] leading-none font-extrabold tracking-tight">
        Corriger ma copie
      </h1>

      <ol className="flex flex-col gap-2.5">
        {ETAPES.map((e, i) => (
          <li
            key={e.titre}
            className="flex items-center gap-3.5 rounded-card bg-soft p-3"
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
    </>
  );
}
