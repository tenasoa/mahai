import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "./password";

describe("hachage des mots de passe", () => {
  it("vérifie le bon mot de passe", async () => {
    const hash = await hashPassword("révise-bien-2026");
    expect(await verifyPassword({ hash, password: "révise-bien-2026" })).toBe(
      true,
    );
  });

  it("refuse un mauvais mot de passe", async () => {
    const hash = await hashPassword("révise-bien-2026");
    expect(await verifyPassword({ hash, password: "revise-bien-2026" })).toBe(
      false,
    );
  });

  it("utilise un sel différent à chaque fois", async () => {
    const a = await hashPassword("meme-mot");
    const b = await hashPassword("meme-mot");
    expect(a).not.toBe(b);
    expect(a.startsWith("pbkdf2-sha256$100000$")).toBe(true);
  });

  it("refuse les hash malformés sans planter", async () => {
    for (const hash of [
      "",
      "n'importe quoi",
      "bcrypt$10$abc$def",
      "pbkdf2-sha256$abc$sel$hash",
      "pbkdf2-sha256$999999999$c2Vs$aGFzaA",
      "pbkdf2-sha256$100000$***$***",
    ]) {
      expect(await verifyPassword({ hash, password: "x" })).toBe(false);
    }
  });
});
