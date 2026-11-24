import { Form, Link, useSearchParams } from "react-router";

import type { Route } from "./+types/sujets";
import { EmptyState } from "~/components/ui/EmptyState";
import { Icon } from "~/components/ui/Icon";
import { MATIERES, trouverMatiere } from "~/lib/matieres";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Sujets — Mah.ai" }];
}

export default function Sujets() {
  const [params] = useSearchParams();
  const q = params.get("q") ?? "";
  const matiere = trouverMatiere(params.get("matiere"));

  return (
    <>
      <h1 className="text-[2rem] leading-none font-extrabold tracking-tight">
        Sujets
      </h1>

      {/* Formulaire GET : la recherche marche même sans JavaScript. */}
      <Form method="get" role="search" className="flex flex-col gap-1.5">
        <label htmlFor="recherche" className="text-sm font-medium">
          Chercher un sujet
        </label>
        <div className="flex min-h-13 items-center gap-2.5 rounded-full border-2 border-control bg-soft px-4 focus-within:border-ink">
          <Icon name="recherche" size={20} />
          <input
            id="recherche"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Ex. BAC 2024 maths"
            className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted"
          />
          {matiere ? (
            <input type="hidden" name="matiere" value={matiere.id} />
          ) : null}
        </div>
      </Form>

      <nav aria-label="Filtrer par matière">
        <ul className="grid grid-cols-5 gap-2">
          {MATIERES.map((m) => {
            const actif = matiere?.id === m.id;
            const suite = new URLSearchParams();
            if (q) suite.set("q", q);
            if (!actif) suite.set("matiere", m.id);
            const lien = suite.toString();
            return (
              <li key={m.id}>
                <Link
                  to={lien ? `?${lien}` : "."}
                  aria-current={actif ? "true" : undefined}
                  className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 py-2 text-center text-[11px] leading-tight ${
                    actif ? "border-ink bg-soft font-bold" : "border-transparent"
                  }`}
                >
                  <span className={`${m.tile} size-8 rounded-[10px]`} />
                  {m.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <EmptyState title="Le catalogue se remplit">
        {matiere || q ? (
          <p>
            Aucun sujet pour
            {matiere ? ` ${matiere.label}` : ""}
            {q ? ` « ${q} »` : ""} pour l'instant. Les premiers sujets et
            corrigés arrivent bientôt.
          </p>
        ) : (
          <p>
            Les premiers sujets et corrigés arrivent bientôt : CEPE, BEPC, BAC
            et concours.
          </p>
        )}
      </EmptyState>
    </>
  );
}
