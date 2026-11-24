import { data, Form, Link, useNavigation } from "react-router";

import type { Route } from "./+types/mot-de-passe-oublie";
import { Button } from "~/components/ui/Button";
import { EmptyState } from "~/components/ui/EmptyState";
import { Field, FormError, FormSucces } from "~/components/ui/Field";
import { lireErreur } from "~/lib/auth/erreurs";
import { appelerAuth } from "~/lib/auth/session.server";
import { emailActif } from "~/lib/email/email.server";
import { SITE } from "~/lib/site";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Mot de passe oublié — Mah.ai" }];
}

export function loader() {
  return { actif: emailActif() };
}

export async function action({ request }: Route.ActionArgs) {
  if (!emailActif()) throw data("Indisponible", { status: 404 });
  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim();
  if (!email) {
    return data({ erreur: "Indique ton email.", envoye: false }, { status: 400 });
  }

  const reponse = await appelerAuth(request, "/request-password-reset", {
    email,
    redirectTo: "/nouveau-mot-de-passe",
  });
  if (!reponse.ok) {
    return data(
      { erreur: await lireErreur(reponse), envoye: false },
      { status: reponse.status },
    );
  }
  // Même réponse que le compte existe ou non.
  return { erreur: undefined, envoye: true };
}

export default function MotDePasseOublie({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const envoi = useNavigation().state === "submitting";

  if (!loaderData.actif) {
    return (
      <>
        <h1 className="text-[2rem] leading-tight font-extrabold tracking-tight">
          Mot de passe oublié
        </h1>
        <EmptyState title="Pas encore d'envoi automatique">
          <p>
            Écris à <a href={`mailto:${SITE.contact}`} className="font-medium underline">{SITE.contact}</a>{" "}
            depuis l'email de ton compte : on t'aide à le récupérer.
          </p>
        </EmptyState>
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-[2rem] leading-tight font-extrabold tracking-tight">
          Mot de passe oublié
        </h1>
        <p className="text-base text-ink-2">
          Indique l'email de ton compte : on t'envoie un lien pour en choisir un
          nouveau.
        </p>
      </div>

      {actionData?.envoye ? (
        <FormSucces message="C'est parti ! Si un compte existe avec cet email, le lien arrive dans quelques minutes. Pense à regarder dans les spams." />
      ) : (
        <Form method="post" className="flex flex-col gap-4" noValidate>
          <FormError message={actionData?.erreur} />
          <Field
            id="email"
            name="email"
            type="email"
            label="Email"
            autoComplete="email"
            inputMode="email"
            required
          />
          <Button type="submit" disabled={envoi} className="mt-2 min-h-14 w-full">
            {envoi ? "Envoi…" : "Recevoir le lien"}
          </Button>
        </Form>
      )}

      <p className="text-center text-sm text-ink-2">
        <Link to="/connexion" className="font-bold text-ink underline underline-offset-4">
          Retour à la connexion
        </Link>
      </p>
    </>
  );
}
