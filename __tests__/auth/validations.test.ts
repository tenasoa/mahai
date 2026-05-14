/**
 * Tests de validation des schémas d'authentification
 */

import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validations/auth";

describe("registerSchema", () => {
  const validData = {
    email: "test@example.com",
    password: "MotDePasse123!",
    confirmPassword: "MotDePasse123!",
    prenom: "Jean",
    nom: "Rakoto",
    role: "ETUDIANT" as const,
  };

  it("devrait accepter des données valides", () => {
    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("devrait rejeter un email invalide", () => {
    const result = registerSchema.safeParse({ ...validData, email: "pas-un-email" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toContain("email");
    }
  });

  it("devrait rejeter un mot de passe < 8 caractères", () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: "1234567",
      confirmPassword: "1234567",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toContain("password");
    }
  });

  it("devrait rejeter si les mots de passe ne correspondent pas", () => {
    const result = registerSchema.safeParse({
      ...validData,
      confirmPassword: "DifferentPassword1",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toContain("confirmPassword");
    }
  });

  it("devrait rejeter un prénom vide", () => {
    const result = registerSchema.safeParse({ ...validData, prenom: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toContain("prenom");
    }
  });

  it("devrait rejeter un prénom > 50 caractères", () => {
    const result = registerSchema.safeParse({
      ...validData,
      prenom: "A".repeat(51),
    });
    expect(result.success).toBe(false);
  });

  it("devrait accepter un nom vide (optionnel)", () => {
    const result = registerSchema.safeParse({ ...validData, nom: "" });
    expect(result.success).toBe(true);
  });

  it("devrait rejeter un code de parrainage invalide", () => {
    const result = registerSchema.safeParse({
      ...validData,
      referralCode: "invalid@code!",
    });
    expect(result.success).toBe(false);
  });

  it("devrait accepter un code de parrainage valide", () => {
    const result = registerSchema.safeParse({
      ...validData,
      referralCode: "HERIZO-2024",
    });
    expect(result.success).toBe(true);
  });

  it("devrait rejeter un rôle invalide", () => {
    const result = registerSchema.safeParse({
      ...validData,
      role: "HACKER",
    });
    expect(result.success).toBe(false);
  });

  it("devrait accepter le rôle CONTRIBUTEUR", () => {
    const result = registerSchema.safeParse({
      ...validData,
      role: "CONTRIBUTEUR" as const,
    });
    expect(result.success).toBe(true);
  });
});

describe("loginSchema", () => {
  it("devrait accepter des données valides", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "anything",
    });
    expect(result.success).toBe(true);
  });

  it("devrait rejeter un email vide", () => {
    const result = loginSchema.safeParse({ email: "", password: "test" });
    expect(result.success).toBe(false);
  });

  it("devrait rejeter un email invalide", () => {
    const result = loginSchema.safeParse({
      email: "invalid",
      password: "test",
    });
    expect(result.success).toBe(false);
  });

  it("devrait rejeter un mot de passe vide", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("forgotPasswordSchema", () => {
  it("devrait accepter un email valide", () => {
    const result = forgotPasswordSchema.safeParse({ email: "test@example.com" });
    expect(result.success).toBe(true);
  });

  it("devrait rejeter un email invalide", () => {
    const result = forgotPasswordSchema.safeParse({ email: "invalid" });
    expect(result.success).toBe(false);
  });

  it("devrait rejeter un email vide", () => {
    const result = forgotPasswordSchema.safeParse({ email: "" });
    expect(result.success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  it("devrait accepter des données valides", () => {
    const result = resetPasswordSchema.safeParse({
      token: "123456",
      password: "NouveauMotDePasse1!",
      confirmPassword: "NouveauMotDePasse1!",
    });
    expect(result.success).toBe(true);
  });

  it("devrait rejeter un token vide", () => {
    const result = resetPasswordSchema.safeParse({
      token: "",
      password: "password123",
      confirmPassword: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("devrait rejeter un mot de passe < 8 caractères", () => {
    const result = resetPasswordSchema.safeParse({
      token: "123456",
      password: "1234567",
      confirmPassword: "1234567",
    });
    expect(result.success).toBe(false);
  });

  it("devrait rejeter si les mots de passe ne correspondent pas", () => {
    const result = resetPasswordSchema.safeParse({
      token: "123456",
      password: "password123",
      confirmPassword: "different",
    });
    expect(result.success).toBe(false);
  });
});
