import { data, Form, Link, redirect, useNavigation } from "react-router";

import type { Route } from "./+types/inscription";
import { Button } from "~/components/ui/Button";
import { Field, FormError } from "~/components/ui/Field";
import { GoogleButton, Separateur } from "~/components/ui/GoogleButton";
import { LiensLegaux } from "~/components/ui/LiensLegaux";
import { googleActif } from "~/lib/auth/auth.server";
import { lireErreur } from "~/lib/auth/erreurs";
import {
  appelerAuth,
  cheminSur,
  getSession,
  redirectAvecCookies,
} from "~/lib/auth/session.server";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Créer un compte — Mah.ai" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const suite = new URL(request.url).searchParams.get("suite");
  if (await getSession(request)) throw redirect(cheminSur(suite));
  return { suite: cheminSur(suite), google: googleActif() };
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const suite = cheminSur(String(form.get("suite") ?? ""));
  const saisie = { name, email };

  if (!name || name.length > 60) {
    return data(
      { erreur: "Indique ton prénom (60 caractères maximum).", ...saisie },
      { status: 400 },
    );
  }
  if (!email) {
    return data({ erreur: "Indique ton email.", ...saisie }, { status: 400 });
  }
  if (password.length < 8) {
    return data(
      {
        erreur: "Le mot de passe doit faire au moins 8 caractères.",
        ...saisie,
      },
      { status: 400 },
    );
  }

  const reponse = await appelerAuth(request, "/sign-up/email", {
    name,
    email,
    password,
    // Page d'arrivée après le clic dans l'email de vérification.
    callbackURL: "/profil?email=verifie",
  });

  if (!reponse.ok) {
    return data(
      { erreur: await lireErreur(reponse), ...saisie },
      { status: reponse.status },
    );
  }
  return redirectAvecCookies(suite, reponse);
}

export default function Inscription({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const envoi = useNavigation().state === "submitting";
  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-[2rem] leading-tight font-extrabold tracking-tight">
          Crée ton compte
        </h1>
        <p className="text-base text-ink-2">
          Gratuit. Ta série, tes XP et tes sujets te suivent sur tous tes
          appareils.
        </p>
      </div>

      {loaderData.google ? (
        <>
          <GoogleButton suite={loaderData.suite} />
          <Separateur />
        </>
      ) : null}

      <Form method="post" className="flex flex-col gap-4" noValidate>
        <input type="hidden" name="suite" value={loaderData.suite} />
        <FormError message={actionData?.erreur} />
        <Field
          id="name"
          name="name"
          label="Prénom"
          autoComplete="given-name"
          maxLength={60}
          required
          defaultValue={actionData?.name}
        />
        <Field
          id="email"
          name="email"
          type="email"
          label="Email"
          autoComplete="email"
          inputMode="email"
          required
          defaultValue={actionData?.email}
        />
        <Field
          id="password"
          name="password"
          type="password"
          label="Mot de passe"
          aide="8 caractères minimum."
          autoComplete="new-password"
          minLength={8}
          maxLength={128}
          required
        />
        <Button type="submit" disabled={envoi} className="mt-2 min-h-14 w-full">
          {envoi ? "Création…" : "Créer mon compte"}
        </Button>
      </Form>

      <p className="text-center text-sm text-ink-2">
        Déjà un compte ?{" "}
        <Link
          to={`/connexion?suite=${encodeURIComponent(loaderData.suite)}`}
          className="font-bold text-ink underline underline-offset-4"
        >
          Me connecter
        </Link>
      </p>

      <LiensLegaux intro="En créant ton compte, tu acceptes les règles de Mah.ai :" />
    </>
  );
}
