import { describe, expect, it, vi } from "vitest";

import { creerEnvoyeurGmail } from "./gmail";
import { construireMime, enteteUtf8 } from "./mime";
import { emailReinitialisation, emailVerification } from "./modeles";

const exemple = {
  a: "eleve@exemple.test",
  sujet: "Ton nouveau mot de passe Mah.ai",
  texte: "Salut Rova, voilà ton lien : https://exemple.test/x",
  html: "<p>Salut Rova</p>",
};

function decoderPartie(mime: string, type: string): string {
  const morceau = mime.split(`Content-Type: ${type}; charset=UTF-8\r\n`)[1]!;
  const corps = morceau.split("\r\n\r\n")[1]!.split("\r\n--")[0]!.replace(/\r\n/g, "");
  return new TextDecoder().decode(Uint8Array.from(atob(corps), (c) => c.charCodeAt(0)));
}

describe("construction MIME", () => {
  it("encode les accents du sujet et garde l'ASCII tel quel", () => {
    expect(enteteUtf8("Mah.ai")).toBe("Mah.ai");
    expect(enteteUtf8("Réinitialise")).toMatch(/^=\?UTF-8\?B\?.+\?=$/);
  });

  it("produit des parties texte et HTML décodables, en CRLF", () => {
    const mime = construireMime(
      { ...exemple, texte: "Révise bien ! é à ç" },
      { nom: "Mah.ai", adresse: "envoi@exemple.test" },
      "frontiere",
    );
    expect(mime).toContain("From: Mah.ai <envoi@exemple.test>\r\n");
    expect(mime).toContain("To: eleve@exemple.test\r\n");
    expect(mime).toContain('boundary="frontiere"');
    expect(mime.trimEnd().endsWith("--frontiere--")).toBe(true);
    expect(decoderPartie(mime, "text/plain")).toBe("Révise bien ! é à ç");
    expect(decoderPartie(mime, "text/html")).toBe("<p>Salut Rova</p>");
    expect(mime.replace(/\r\n/g, "")).not.toContain("\n");
  });

  it("refuse une injection d'en-tête", () => {
    expect(() =>
      construireMime(
        { ...exemple, a: "eleve@exemple.test\r\nBcc: pirate@exemple.test" },
        { nom: "Mah.ai", adresse: "envoi@exemple.test" },
      ),
    ).toThrow();
  });
});

describe("modèles d'emails", () => {
  it("échappe le prénom dans le HTML et met le lien partout", () => {
    const url = "https://mahai.test/api/auth/reset-password/abc?callbackURL=/nouveau";
    const mail = emailReinitialisation({ email: "a@b.test", prenom: "<b>Rova</b>" }, url);
    expect(mail.html).not.toContain("<b>Rova</b>");
    expect(mail.html).toContain("&lt;b&gt;Rova&lt;/b&gt;");
    expect(mail.texte).toContain(url);
    expect(mail.html).toContain(url.replace(/&/g, "&amp;"));
    expect(emailVerification({ email: "a@b.test", prenom: "Rova" }, url).sujet).toMatch(
      /Confirme/,
    );
  });
});

describe("envoi Gmail", () => {
  const config = {
    clientId: "id",
    clientSecret: "secret",
    refreshToken: "refresh",
    expediteur: "envoi@exemple.test",
  };

  it("obtient un jeton une seule fois puis envoie le message", async () => {
    const recuperer = vi.fn(async (url: string | URL | Request, _init?: RequestInit) => {
      if (String(url).includes("oauth2")) {
        return Response.json({ access_token: "jeton", expires_in: 3600 });
      }
      return Response.json({ id: "1" });
    });
    const envoyer = creerEnvoyeurGmail(config, recuperer as typeof fetch);
    await envoyer(exemple);
    await envoyer(exemple);

    const appels = recuperer.mock.calls.map(([url]) => String(url));
    expect(appels.filter((u) => u.includes("oauth2"))).toHaveLength(1);
    expect(appels.filter((u) => u.includes("messages/send"))).toHaveLength(2);

    const init = recuperer.mock.calls[1]![1] as RequestInit;
    expect((init.headers as Record<string, string>).authorization).toBe("Bearer jeton");
    expect(JSON.parse(String(init.body)).raw).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("signale un refus de Gmail", async () => {
    const recuperer = vi.fn(async () => new Response("invalid_grant", { status: 400 }));
    const envoyer = creerEnvoyeurGmail(config, recuperer as typeof fetch);
    await expect(envoyer(exemple)).rejects.toThrow(/jeton refusé/);
  });
});
