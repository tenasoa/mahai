import { useEffect, useState } from "react";
import { data, Form, Link, useNavigation } from "react-router";

import type { Route } from "./+types/profil";
import { Button, ButtonLink } from "~/components/ui/Button";
import { EmptyState } from "~/components/ui/EmptyState";
import { FormError, FormSucces } from "~/components/ui/Field";
import { lireErreur } from "~/lib/auth/erreurs";
import { appelerAuth, getSession, requireSession } from "~/lib/auth/session.server";
import { emailActif } from "~/lib/email/email.server";
import { lireRecents, EVENEMENT_RECENTS } from "~/lib/recents";
import type { MiseEnPage } from "./_app";

export const handle: MiseEnPage = { large: true };

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

/** Initiales du nom (deux lettres au plus), pour la tuile du compte. */
const initiales = (nom: string) =>
  nom
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((m) => m[0]!.toUpperCase())
    .join("");

type DonneesAppareil = { recents: number; notes: number; examens: { slug: string; titre: string }[] };

/** Ce que ce navigateur garde (sujets récents, notes, examens en cours), et de quoi l'effacer. */
function lireAppareil(): DonneesAppareil | null {
  try {
    const cles = Object.keys(window.localStorage);
    const recents = lireRecents();
    return {
      recents: recents.length,
      notes: cles.filter((c) => c.startsWith("mahai:notes:") && window.localStorage.getItem(c)).length,
      examens: cles
        .filter((c) => c.startsWith("mahai:examen:"))
        .map((c) => c.slice("mahai:examen:".length))
        .map((slug) => ({ slug, titre: recents.find((r) => r.slug === slug)?.titre ?? slug })),
    };
  } catch {
    return null; // stockage bloqué (navigation privée)
  }
}

function SurCetAppareil() {
  const [donnees, setDonnees] = useState<DonneesAppareil | null>(null);
  useEffect(() => setDonnees(lireAppareil()), []);
  if (!donnees) return null;
  const vide = donnees.recents + donnees.notes + donnees.examens.length === 0;

  function effacer() {
    if (!window.confirm("Effacer de ce navigateur tes sujets récents, tes notes et les examens en cours ?")) return;
    try {
      Object.keys(window.localStorage)
        .filter((c) => c.startsWith("mahai:"))
        .forEach((c) => window.localStorage.removeItem(c));
    } catch {
      // stockage indisponible : rien à effacer
    }
    window.dispatchEvent(new Event(EVENEMENT_RECENTS));
    setDonnees(lireAppareil());
  }

  return (
    <section aria-labelledby="titre-appareil" className="flex flex-col gap-3 rounded-card border-2 border-line p-5 text-sm">
      <h2 id="titre-appareil" className="text-base font-bold">
        Sur cet appareil
      </h2>
      <p className="text-ink-2">Gardé dans ce navigateur seulement, jamais envoyé.</p>
      <dl className="flex flex-col gap-2">
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Sujets récents</dt>
          <dd className="font-medium tabular-nums">{donnees.recents}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Notes personnelles</dt>
          <dd className="font-medium tabular-nums">{donnees.notes}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Examen en cours</dt>
          <dd className="text-right font-medium">
            {donnees.examens.length === 0
              ? "Aucun"
              : donnees.examens.map((e) => (
                  <Link key={e.slug} to={`/sujets/${e.slug}`} className="block underline underline-offset-4">
                    {e.titre}
                  </Link>
                ))}
          </dd>
        </div>
      </dl>
      {vide ? null : (
        <button
          type="button"
          onClick={effacer}
          className="min-h-11 self-start font-medium text-ink underline underline-offset-4"
        >
          Effacer ces données
        </button>
      )}
    </section>
  );
}

export default function Profil({ loaderData, actionData }: Route.ComponentProps) {
  const { utilisateur } = loaderData;
  const envoi = useNavigation().state === "submitting";

  if (!utilisateur) {
    return (
      <div className="flex flex-col gap-5 lg:max-w-xl">
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
      </div>
    );
  }

  const deconnexion = (classe: string) => (
    <Form method="post" action="/deconnexion" className={classe}>
      <Button type="submit" variant="secondary" className="w-full">
        Me déconnecter
      </Button>
    </Form>
  );

  return (
    <div className="flex flex-col gap-5 lg:max-w-5xl lg:gap-6">
      <header className="flex items-center gap-4">
        <span
          aria-hidden="true"
          className="hidden size-16 shrink-0 items-center justify-center rounded-tile bg-francais text-2xl font-extrabold lg:flex"
        >
          {initiales(utilisateur.name)}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h1 className="text-[2rem] leading-tight font-extrabold tracking-tight">Salut {utilisateur.name}</h1>
          <p className="hidden truncate text-ink-2 lg:block">
            {utilisateur.email} · {utilisateur.role}
          </p>
        </div>
        {deconnexion("hidden shrink-0 lg:block")}
      </header>

      {loaderData.emailVerifie ? <FormSucces message="Email confirmé, merci !" /> : null}

      <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-6">
        <div className="flex flex-col gap-5">
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

          <section className="grid grid-cols-2 gap-2.5 lg:gap-4" aria-label="Ta progression">
            <div className="flex min-h-28 flex-col rounded-tile bg-histoire p-4 lg:min-h-44 lg:p-6">
              <span className="text-sm font-medium lg:text-base">Série</span>
              <span className="mt-auto text-4xl font-extrabold tabular-nums lg:text-6xl">0</span>
              <span className="text-sm lg:text-base">jour pour l'instant</span>
            </div>
            <div className="flex min-h-28 flex-col rounded-tile bg-maths p-4 lg:min-h-44 lg:p-6">
              <span className="text-sm font-medium lg:text-base">XP</span>
              <span className="mt-auto text-4xl font-extrabold tabular-nums lg:text-6xl">0</span>
              <span className="text-sm lg:text-base">à gagner</span>
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-5">
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
          <SurCetAppareil />
          {deconnexion("lg:hidden")}
        </div>
      </div>
    </div>
  );
}
