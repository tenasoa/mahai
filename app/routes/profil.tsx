import { Form, Link } from "react-router";

import type { Route } from "./+types/profil";
import { Button, ButtonLink } from "~/components/ui/Button";
import { EmptyState } from "~/components/ui/EmptyState";
import { getSession } from "~/lib/auth/session.server";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Profil — Mah.ai" }];
}

const LIBELLES_ROLE: Record<string, string> = {
  eleve: "Élève",
  contributeur: "Contributeur",
  etablissement: "Établissement",
  moderateur: "Modérateur",
  admin: "Administrateur",
};

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request);
  if (!session) return { utilisateur: null };
  const { name, email, role } = session.user;
  return {
    utilisateur: { name, email, role: LIBELLES_ROLE[role ?? "eleve"] ?? "Élève" },
  };
}

export default function Profil({ loaderData }: Route.ComponentProps) {
  const { utilisateur } = loaderData;

  if (!utilisateur) {
    return (
      <>
        <h1 className="text-[2rem] leading-none font-extrabold tracking-tight">
          Profil
        </h1>
        <EmptyState
          title="Tu n'es pas connecté"
          action={
            <div className="flex w-full flex-col gap-2 pt-1">
              <ButtonLink to="/inscription" className="w-full">
                Créer mon compte
              </ButtonLink>
              <Link
                to="/connexion"
                className="inline-flex min-h-12 items-center justify-center text-base font-medium"
              >
                J'ai déjà un compte
              </Link>
            </div>
          }
        >
          <p>
            Crée ton compte pour garder ta série, tes XP et tes sujets sur tous
            tes appareils.
          </p>
        </EmptyState>
      </>
    );
  }

  return (
    <>
      <h1 className="text-[2rem] leading-tight font-extrabold tracking-tight">
        Salut {utilisateur.name}
      </h1>

      <section className="grid grid-cols-2 gap-2.5" aria-label="Ta progression">
        <div className="flex min-h-28 flex-col rounded-tile bg-histoire p-4">
          <span className="text-sm font-medium">Série</span>
          <span className="mt-auto text-4xl font-extrabold tabular-nums">0</span>
          <span className="text-sm">jour pour l'instant</span>
        </div>
        <div className="flex min-h-28 flex-col rounded-tile bg-maths p-4">
          <span className="text-sm font-medium">XP</span>
          <span className="mt-auto text-4xl font-extrabold tabular-nums">0</span>
          <span className="text-sm">à gagner</span>
        </div>
      </section>

      <dl className="flex flex-col gap-3 rounded-card bg-soft p-5 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Email</dt>
          <dd className="truncate font-medium">{utilisateur.email}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Compte</dt>
          <dd className="font-medium">{utilisateur.role}</dd>
        </div>
      </dl>

      <Form method="post" action="/deconnexion">
        <Button type="submit" variant="secondary" className="w-full">
          Me déconnecter
        </Button>
      </Form>
    </>
  );
}
