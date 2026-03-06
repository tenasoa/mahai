import { SignIn } from '@clerk/nextjs'
import { clerkAppearance } from '@/lib/auth/clerk-theme'

// ============================================
// MAH.AI — Page de Connexion
// ============================================
// Page d'authentification optimisée avec Clerk
// Design moderne et cohérent (Teal & Dark)
// ============================================

export default function SignInPage() {
  return (
    <div className="animate-fade-up">
      {/* Header personnalisé */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-text mb-2">
          Bon retour <span className="text-teal">!</span>
        </h1>
        <p className="text-muted text-sm font-mono">
          Connecte-toi pour tes révisions
        </p>
      </div>

      {/* Clerk SignIn — Thème personnalisé */}
      <SignIn
        appearance={clerkAppearance}
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        forceRedirectUrl="/catalogue"
      />

      {/* Liens de bas de page */}
      <div className="mt-10 pt-6 border-t border-border/30 text-center">
        <p className="text-[11px] text-muted/50 leading-relaxed font-mono">
          Besoin d'aide ? <a href="/contact" className="text-muted/80 hover:text-teal transition-colors">Support technique</a>
          <br />
          En te connectant, tu acceptes nos <a href="/terms" className="text-muted/80 hover:text-teal underline">CGU</a>
        </p>
      </div>
    </div>
  )
}
