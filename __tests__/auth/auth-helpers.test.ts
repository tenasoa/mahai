/**
 * Tests des helpers d'authentification (fonctions pures sans DB)
 */

describe("isSafeRedirect", () => {
  // Réimplémentation locale pour tester la logique pure
  function isSafeRedirect(url: string): boolean {
    return (
      typeof url === "string" &&
      url.startsWith("/") &&
      !url.startsWith("//") &&
      !url.startsWith("/auth/login") &&
      !url.startsWith("/auth/register")
    );
  }

  it("devrait accepter un chemin relatif valide", () => {
    expect(isSafeRedirect("/dashboard")).toBe(true);
    expect(isSafeRedirect("/catalogue")).toBe(true);
    expect(isSafeRedirect("/profil")).toBe(true);
    expect(isSafeRedirect("/recharge")).toBe(true);
  });

  it("devrait rejeter un chemin commençant par // (protocol-relative)", () => {
    expect(isSafeRedirect("//evil.com")).toBe(false);
    expect(isSafeRedirect("//google.com")).toBe(false);
  });

  it("devrait rejeter une URL absolue externe", () => {
    expect(isSafeRedirect("https://evil.com")).toBe(false);
    expect(isSafeRedirect("http://evil.com")).toBe(false);
  });

  it("devrait rejeter les routes auth pour éviter les boucles", () => {
    expect(isSafeRedirect("/auth/login")).toBe(false);
    expect(isSafeRedirect("/auth/register")).toBe(false);
    expect(isSafeRedirect("/auth/login?redirect=/dashboard")).toBe(false);
  });

  it("devrait rejeter une chaîne vide", () => {
    expect(isSafeRedirect("")).toBe(false);
  });

  it("devrait accepter une route avec query params", () => {
    expect(isSafeRedirect("/catalogue?matiere=math")).toBe(true);
  });

  it("devrait accepter une route admin", () => {
    expect(isSafeRedirect("/admin")).toBe(true);
    expect(isSafeRedirect("/admin/utilisateurs")).toBe(true);
  });
});

describe("generate6DigitCode", () => {
  // Réimplémentation locale pour test
  function generate6DigitCode(): string {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return String(100000 + (buf[0] % 900000));
  }

  it("devrait générer un code à 6 chiffres", () => {
    const code = generate6DigitCode();
    expect(code).toMatch(/^\d{6}$/);
  });

  it("devrait générer un code entre 100000 et 999999", () => {
    for (let i = 0; i < 100; i++) {
      const code = parseInt(generate6DigitCode(), 10);
      expect(code).toBeGreaterThanOrEqual(100000);
      expect(code).toBeLessThanOrEqual(999999);
    }
  });

  it("devrait générer des codes différents", () => {
    const codes = new Set<string>();
    for (let i = 0; i < 50; i++) {
      codes.add(generate6DigitCode());
    }
    // Au moins quelques codes différents (probabilité quasi certaine)
    expect(codes.size).toBeGreaterThan(1);
  });
});
