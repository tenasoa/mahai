import { data, Form, Link, redirect, useNavigation } from "react-router";

import type { Route } from "./+types/connexion";
import { Button } from "~/components/ui/Button";
import { Field, FormError, FormSucces } from "~/components/ui/Field";
import { GoogleButton, Separateur } from "~/components/ui/GoogleButton";
import { googleActif } from "~/lib/auth/auth.server";
import { lireErreur, messageErreurOAuth } from "~/lib/auth/erreurs";
import { emailActif } from "~/lib/email/email.server";
import {
  appelerAuth,
  cheminSur,
  getSession,
  redirectAvecCookies,
} from "~/lib/auth/session.server";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Connexion — Mah.ai" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const params = new URL(request.url).searchParams;
  const suite = params.get("suite");
  if (await getSession(request)) throw redirect(cheminSur(suite));
  return {
    suite: cheminSur(suite),
    google: googleActif(),
    motDePasseOublie: emailActif(),
    reinitialise: params.has("reinitialise"),
    erreurGoogle: messageErreurOAuth(params.get("error")),
  };
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const suite = cheminSur(String(form.get("suite") ?? ""));

  if (!email || !password) {
    return data(
      { erreur: "Renseigne ton email et ton mot de passe.", email },
      { status: 400 },
    );
  }

  const reponse = await appelerAuth(request, "/sign-in/email", {
    email,
    password,
    rememberMe: true,
  });

  if (!reponse.ok) {
    return data(
      { erreur: await lireErreur(reponse), email },
      { status: reponse.status },
    );
  }
  return redirectAvecCookies(suite, reponse);
}

export default function Connexion({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const envoi = useNavigation().state === "submitting";
  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-[2rem] leading-tight font-extrabold tracking-tight">
          Content de te revoir
        </h1>
        <p className="text-base text-ink-2">Connecte-toi pour reprendre ta série.</p>
      </div>

      {!actionData?.erreur ? <FormError message={loaderData.erreurGoogle} /> : null}
      {loaderData.reinitialise && !actionData?.erreur ? (
        <FormSucces message="Mot de passe changé. Connecte-toi avec le nouveau." />
      ) : null}

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
          autoComplete="current-password"
          required
        />
        {loaderData.motDePasseOublie ? (
          <Link
            to="/mot-de-passe-oublie"
            className="-mt-1 self-end px-2 text-sm font-medium text-ink-2 underline underline-offset-4"
          >
            Mot de passe oublié ?
          </Link>
        ) : null}
        <Button type="submit" disabled={envoi} className="mt-2 min-h-14 w-full">
          {envoi ? "Connexion…" : "Me connecter"}
        </Button>
      </Form>

      <p className="text-center text-sm text-ink-2">
        Pas encore de compte ?{" "}
        <Link
          to={`/inscription?suite=${encodeURIComponent(loaderData.suite)}`}
          className="font-bold text-ink underline underline-offset-4"
        >
          Créer un compte
        </Link>
      </p>
    </>
  );
}
