import type { Route } from "./+types/profil";
import { EmptyState } from "~/components/ui/EmptyState";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Profil — Mah.ai" }];
}

export default function Profil() {
  return (
    <>
      <h1 className="text-[2rem] leading-none font-extrabold tracking-tight">
        Profil
      </h1>
      <EmptyState title="Les comptes ouvrent bientôt">
        <p>
          Tu pourras t'inscrire avec ton email, ton compte Google ou ton numéro
          de téléphone, et suivre ta série, tes XP et tes achats ici.
        </p>
      </EmptyState>
    </>
  );
}
