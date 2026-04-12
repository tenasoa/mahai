// Test d'envoi d'email avec Supabase
// Exécuter avec : node test-email-supabase.js

import { createClient } from "@supabase/supabase-js";

// Remplacez par vos vraies valeurs
const SUPABASE_URL = "https://meaovjzywjllbxrwprmo.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lYW92anp5d2psbGJ4cndwcm1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjczMzMyNiwiZXhwIjoyMDg4MzA5MzI2fQ.swtYbx3oL7CGQy8AtdtyPSRpp-UvjhjENclpjVa95Bc";
const TEST_EMAIL = "odilon.tenasoa@outlook.com";

async function testEmail() {
  console.log("🧪 Test d'envoi d'email avec Supabase...");
  console.log("URL:", SUPABASE_URL);
  console.log("Email de test:", TEST_EMAIL);
  console.log("");

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    // Méthode 1: resetPasswordForEmail (teste le SMTP)
    console.log("📤 Envoi d'un email de réinitialisation de mot de passe...");
    const { data, error } = await supabase.auth.resetPasswordForEmail(
      TEST_EMAIL,
      {
        redirectTo: "http://localhost:3000/auth/reset-password",
      },
    );

    if (error) {
      console.error("❌ Erreur:", error);
      console.error("Message:", error.message);
      console.error("Status:", error.status);
    } else {
      console.log("✅ Email envoyé avec succès !");
      console.log("Response:", data);
      console.log("");
      console.log("📬 Vérifiez votre boîte Gmail :", TEST_EMAIL);
      console.log("   (Vérifiez aussi les spams si nécessaire)");
    }
  } catch (err) {
    console.error("❌ Erreur inattendue:", err);
  }
}

testEmail();
