import { data, Form, Link, useNavigation } from "react-router";

import type { Route } from "./+types/profil";
import { Button, ButtonLink } from "~/components/ui/Button";
import { EmptyState } from "~/components/ui/EmptyState";
import { FormError, FormSucces } from "~/components/ui/Field";
import { lireErreur } from "~/lib/auth/erreurs";
import { appelerAuth, getSession, requireSession } from "~/lib/auth/session.server";
import { emailActif } from "~/lib/email/email.server";

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
  if (!session) return { utilisateur: null, emailVerifie: false };
  const { name, email, role, emailVerified } = session.user;
  const params = new URL(request.url).searchParams;
  return {
    utilisateur: {
      name,
      email,
      role: LIBELLES_ROLE[role ?? "eleve"] ?? "Élève",
      // On ne propose de confirmer l'email que si l'envoi est possible.
      aConfirmer: !emailVerified && emailActif(),
    },
    // Retour du lien de vérification : `?email=verifie`, ou `&error=…` si le lien est mort.
    emailVerifie: params.get("email") === "verifie" && !params.has("error") && emailVerified,
    lienMort: params.get("email") === "verifie" && params.has("error"),
  };
}

/** Renvoie l'email de vérification. */
export async function action({ request }: Route.ActionArgs) {
  const session = await requireSession(request);
  const reponse = await appelerAuth(request, "/send-verification-email", {
    email: session.user.email,
    callbackURL: "/profil?email=verifie",
  });
  if (!reponse.ok) {
    return data({ envoye: false, erreur: await lireErreur(reponse) }, { status: reponse.status });
  }
  return { envoye: true, erreur: undefined };
}

export default function Profil({ loaderData, actionData }: Route.ComponentProps) {
  const { utilisateur } = loaderData;
  const envoi = useNavigation().state === "submitting";

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

      {loaderData.emailVerifie ? <FormSucces message="Email confirmé, merci !" /> : null}

      {utilisateur.aConfirmer ? (
        <section className="flex flex-col gap-2 rounded-card border-2 border-line p-4 text-sm">
          <p className="font-bold">Confirme ton email</p>
          {loaderData.lienMort && !actionData ? (
            <FormError message="Ce lien a expiré ou a déjà servi. Demande-en un nouveau." />
          ) : null}
          {actionData?.envoye ? (
            <p className="text-ink-2">
              Lien envoyé à {utilisateur.email}. Pense à regarder dans les spams.
            </p>
          ) : (
            <>
              <p className="text-ink-2">
                On t'a envoyé un lien à {utilisateur.email}. Il permet de
                récupérer ton compte si tu oublies ton mot de passe.
              </p>
              <FormError message={actionData?.erreur} />
              <Form method="post">
                <button
                  type="submit"
                  disabled={envoi}
                  className="min-h-11 font-medium text-ink underline underline-offset-4"
                >
                  {envoi ? "Envoi…" : "Renvoyer le lien"}
                </button>
              </Form>
            </>
          )}
        </section>
      ) : null}

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
