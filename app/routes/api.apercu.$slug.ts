import type { Route } from "./+types/api.apercu.$slug";
import { getDb } from "~/db/db.server";
import { sujetPublie } from "~/lib/catalogue/catalogue.server";
import { totalPoints } from "~/lib/document/nettoyer";
import { planDocument } from "~/lib/document/plan";

/** Aperçu d'un sujet publié pour le catalogue sur ordinateur : informations et plan, sans le texte. */
export async function loader({ params }: Route.LoaderArgs) {
  const sujet = await sujetPublie(getDb(), params.slug);
  if (!sujet) return Response.json({ erreur: "Sujet introuvable" }, { status: 404 });
  const serie = sujet.series.length === 1 ? sujet.series[0]!.serieId : null;
  const plan = planDocument(sujet.enonce, serie);
  const coefficients = sujet.series.map((s) => s.coefficient).filter((c): c is number => typeof c === "number");
  return Response.json(
    {
      slug: sujet.slug,
      dureeMinutes: sujet.dureeMinutes,
      coefficient: serie ? (coefficients[0] ?? null) : sujet.series.length === 0 ? sujet.coefficient : null,
      coefficients: [...new Set(coefficients)],
      total: totalPoints(sujet.enonce, serie),
      aCorrige: sujet.corrige !== null,
      plan: plan
        .filter((e) => e.genre !== "question")
        .map(({ id, titre, points, genre }) => ({ id, titre, points, genre })),
      questions: plan.filter((e) => e.genre === "question").length,
    },
    { headers: { "Cache-Control": "public, max-age=60" } },
  );
}

export type Apercu = {
  slug: string;
  dureeMinutes: number | null;
  coefficient: number | null;
  coefficients: number[];
  total: number | null;
  aCorrige: boolean;
  plan: { id: string; titre: string; points: number | null; genre: "partie" | "exercice" | "question" }[];
  questions: number;
};
