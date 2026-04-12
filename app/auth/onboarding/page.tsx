import { redirect } from "next/navigation";
import { OnboardingFlow } from "@/components/auth/OnboardingFlow";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { syncAppUserWithAuthUser } from "@/lib/auth-user-sync";

export default async function OnboardingPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  if (!user.email_confirmed_at) {
    redirect(
      "/auth/verify-email?email=" + encodeURIComponent(user.email || ""),
    );
  }

  const syncResult = await syncAppUserWithAuthUser(user);
  if (syncResult.error || !syncResult.appUser) {
    redirect("/auth/login?error=profil-introuvable");
  }

  return (
    <div className="min-h-screen bg-void auth-page">
      <OnboardingFlow
        initialUserName={syncResult.appUser.prenom || "Étudiant"}
      />
    </div>
  );
}
