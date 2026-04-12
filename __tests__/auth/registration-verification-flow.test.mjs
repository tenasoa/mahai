import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const repoRoot = "C:\\Users\\Tenasoa\\Desktop\\Mah.AI\\mahai";

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

test("register schema keeps profile-only academic fields out of signup", () => {
  const schema = read("lib/validations/auth.ts");

  assert.match(schema, /role:\s*z\./, "Expected register schema to include role");
  assert.match(
    schema,
    /etablissement:\s*z\./,
    "Expected register schema to include etablissement",
  );
  assert.doesNotMatch(
    schema,
    /filiere:\s*z\./,
    "Expected register schema to keep filiere out of signup",
  );
  assert.doesNotMatch(
    schema,
    /studyYear:\s*z\./,
    "Expected register schema to keep studyYear out of signup",
  );
  assert.match(
    schema,
    /newsletterOptIn:\s*z\./,
    "Expected register schema to include newsletterOptIn",
  );
});

test("register form avoids academic profile fields and Google auth for now", () => {
  const registerForm = read("components/auth/RegisterForm.tsx");

  assert.doesNotMatch(
    registerForm,
    /register\('filiere'\)/,
    "Expected signup form to remove filiere input",
  );
  assert.doesNotMatch(
    registerForm,
    /register\('studyYear'\)/,
    "Expected signup form to remove studyYear input",
  );
  assert.doesNotMatch(
    registerForm,
    /Continuer avec Google/,
    "Expected signup form to remove the Google CTA until OAuth is configured",
  );
  assert.match(
    registerForm,
    /ToastContainer/,
    "Expected signup form to mount the shared toast container for auth errors",
  );
  assert.match(
    registerForm,
    /addToast\(/,
    "Expected signup form to publish auth errors through the shared toast system",
  );
  assert.doesNotMatch(
    registerForm,
    /\{serverError \? \(/,
    "Expected signup form to stop rendering inline server errors",
  );
});

test("login form also hides Google auth until OAuth is configured", () => {
  const loginForm = read("components/auth/LoginForm.tsx");

  assert.doesNotMatch(
    loginForm,
    /Continuer avec Google/,
    "Expected login form to remove the Google CTA until OAuth is configured",
  );
});

test("auth actions manage a verification cookie and reroute unverified users", () => {
  const authActions = read("actions/auth.ts");

  assert.match(
    authActions,
    /mahai-email-verified/,
    "Expected auth actions to manage a dedicated email verification cookie",
  );
  assert.match(
    authActions,
    /redirect\(["']\/auth\/verify-email\?email=/,
    "Expected auth actions to redirect unverified users to /auth/verify-email",
  );
  assert.match(
    authActions,
    /redirect\(["']\/auth\/onboarding["']\)/,
    "Expected auth actions to redirect verified users into onboarding",
  );
  assert.match(
    authActions,
    /createSupabaseAdminClient\(\)/,
    "Expected verifyEmail to use the Supabase admin client for auth-side confirmation",
  );
});

test("route protection blocks authenticated but unverified users outside verify-email", () => {
  const proxy = read("app/proxy.ts");

  assert.match(
    proxy,
    /mahai-email-verified/,
    "Expected proxy to inspect the email verification cookie",
  );
  assert.match(
    proxy,
    /\/auth\/onboarding/,
    "Expected onboarding to be protected by the auth proxy",
  );
  assert.match(
    proxy,
    /\/auth\/verify-email/,
    "Expected proxy to redirect unverified users toward verify-email",
  );
});

test("onboarding persists its selections back into the profile", () => {
  const onboardingFlow = read("components/auth/OnboardingFlow.tsx");

  assert.match(
    onboardingFlow,
    /updateCurrentUserProfileAction/,
    "Expected onboarding to save profile data through the profile action",
  );
  assert.match(
    onboardingFlow,
    /matieresPreferees/,
    "Expected onboarding to persist preferred subjects",
  );
  assert.match(
    onboardingFlow,
    /objectifsEtude/,
    "Expected onboarding to persist study goals",
  );
});
