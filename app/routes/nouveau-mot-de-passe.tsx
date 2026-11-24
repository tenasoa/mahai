import { data, Form, Link, redirect, useNavigation } from "react-router";

import type { Route } from "./+types/nouveau-mot-de-passe";
import { Button } from "~/components/ui/Button";
import { Field, FormError } from "~/components/ui/Field";
import { lireErreur, messageErreur } from "~/lib/auth/erreurs";
import { appelerAuth } from "~/lib/auth/session.server";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Nouveau mot de passe — Mah.ai" }];
}

/** Better Auth redirige ici avec `?token=…`, ou `?error=INVALID_TOKEN` si le lien est mort. */
export function loader({ request }: Route.LoaderArgs) {
  const params = new URL(request.url).searchParams;
  const token = params.get("token");
  const erreur = params.get("error");
  return {
    token,
    lienInvalide: Boolean(erreur) || !token,
    message: erreur ? messageErreur(erreur) : undefined,
  };
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const token = String(form.get("token") ?? "");
  const motDePasse = String(form.get("password") ?? "");
  if (motDePasse.length < 8) {
    return data(
      { erreur: "Le mot de passe doit faire au moins 8 caractères." },
      { status: 400 },
    );
  }

  const reponse = await appelerAuth(request, "/reset-password", {
    newPassword: motDePasse,
    token,
  });
  if (!reponse.ok) {
    return data({ erreur: await lireErreur(reponse) }, { status: reponse.status });
  }
  return redirect("/connexion?reinitialise=1");
}

export default function NouveauMotDePasse({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const envoi = useNavigation().state === "submitting";

  if (loaderData.lienInvalide) {
    return (
      <>
        <h1 className="text-[2rem] leading-tight font-extrabold tracking-tight">
          Lien expiré
        </h1>
        <FormError
          message={loaderData.message ?? "Ce lien n'est pas valide. Demande un nouveau lien."}
        />
        <Link
          to="/mot-de-passe-oublie"
          className="inline-flex min-h-14 w-full items-center justify-center rounded-full bg-ink px-6 text-base font-bold text-white"
        >
          Demander un nouveau lien
        </Link>
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-[2rem] leading-tight font-extrabold tracking-tight">
          Nouveau mot de passe
        </h1>
        <p className="text-base text-ink-2">
          Choisis-en un que tu n'utilises pas ailleurs. Tu seras déconnecté de
          tes autres appareils.
        </p>
      </div>

      <Form method="post" className="flex flex-col gap-4" noValidate>
        <input type="hidden" name="token" value={loaderData.token ?? ""} />
        <FormError message={actionData?.erreur} />
        <Field
          id="password"
          name="password"
          type="password"
          label="Nouveau mot de passe"
          aide="8 caractères minimum."
          autoComplete="new-password"
          minLength={8}
          maxLength={128}
          required
        />
        <Button type="submit" disabled={envoi} className="mt-2 min-h-14 w-full">
          {envoi ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </Form>
    </>
  );
}
