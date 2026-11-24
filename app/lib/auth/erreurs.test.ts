import { describe, expect, it } from "vitest";

import {
  lireErreur,
  MESSAGE_PAR_DEFAUT,
  messageErreur,
  messageErreurOAuth,
} from "./erreurs";
import { cheminSur } from "./redirection";

describe("messages d'erreur", () => {
  it("ne révèle pas si l'email existe à la connexion", () => {
    expect(messageErreur("INVALID_EMAIL_OR_PASSWORD")).toBe(
      messageErreur("INVALID_PASSWORD"),
    );
  });

  it("signale le trop grand nombre de tentatives", () => {
    expect(messageErreur(undefined, 429)).toMatch(/Trop de tentatives/);
  });

  it("retombe sur un message générique", () => {
    expect(messageErreur("CODE_INCONNU")).toBe(MESSAGE_PAR_DEFAUT);
  });

  it("lit le code dans une réponse JSON, ou pas de JSON du tout", async () => {
    const json = new Response(JSON.stringify({ code: "USER_ALREADY_EXISTS" }), {
      status: 422,
    });
    expect(await lireErreur(json)).toMatch(/existe déjà/);
    expect(await lireErreur(new Response("oups", { status: 500 }))).toBe(
      MESSAGE_PAR_DEFAUT,
    );
  });
});

describe("erreurs au retour de Google", () => {
  it("ne dit rien sans erreur", () => {
    expect(messageErreurOAuth(null)).toBeUndefined();
  });
  it("explique un compte email déjà existant", () => {
    expect(messageErreurOAuth("unable_to_link_account")).toMatch(/mot de passe/);
  });
  it("a un message par défaut", () => {
    expect(messageErreurOAuth("inconnu")).toMatch(/Google/);
  });
});

describe("chemins de redirection", () => {
  it("n'accepte que les chemins internes", () => {
    expect(cheminSur("/sujets?matiere=maths")).toBe("/sujets?matiere=maths");
    expect(cheminSur("https://exemple.com")).toBe("/profil");
    expect(cheminSur("//exemple.com")).toBe("/profil");
    expect(cheminSur("/\\exemple.com")).toBe("/profil");
    expect(cheminSur(null)).toBe("/profil");
  });
});
