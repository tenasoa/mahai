/**
 * Tests d'intégration - Authentification
 */
import { registerSchema, loginSchema } from "@/lib/validations/auth";

describe("Auth Validation", () => {
  describe("registerSchema", () => {
    it("devrait valider un email correct", () => {
      const result = registerSchema.safeParse({
        email: "test@example.com",
        password: "Password123!",
        confirmPassword: "Password123!",
        prenom: "Jean",
        nom: "Dupont",
      });
      expect(result.success).toBe(true);
    });

    it("devrait rejeter un email invalide", () => {
      const result = registerSchema.safeParse({
        email: "invalid-email",
        password: "Password123!",
        confirmPassword: "Password123!",
        prenom: "Jean",
        nom: "Dupont",
      });
      expect(result.success).toBe(false);
    });

    it("devrait rejeter un mot de passe trop court", () => {
      const result = registerSchema.safeParse({
        email: "test@example.com",
        password: "123",
        confirmPassword: "123",
        prenom: "Jean",
        nom: "Dupont",
      });
      expect(result.success).toBe(false);
    });

    it("devrait rejeter si les mots de passe ne correspondent pas", () => {
      const result = registerSchema.safeParse({
        email: "test@example.com",
        password: "Password123!",
        confirmPassword: "Different123!",
        prenom: "Jean",
        nom: "Dupont",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("loginSchema", () => {
    it("devrait valider un login correct", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "Password123!",
      });
      expect(result.success).toBe(true);
    });

    it("devrait rejeter un email manquant", () => {
      const result = loginSchema.safeParse({
        email: "",
        password: "Password123!",
      });
      expect(result.success).toBe(false);
    });
  });
});
