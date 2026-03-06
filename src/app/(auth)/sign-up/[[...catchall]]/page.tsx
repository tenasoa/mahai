import { SignUp } from '@clerk/nextjs'
import { clerkAppearance } from '@/lib/auth/clerk-theme'

// ============================================
// MAH.AI — Page d'Inscription
// ============================================
// Page de création de compte optimisée
// Design cohérent avec la charte Mah.AI
// ============================================

export default function SignUpPage() {
  return (
    <div className="animate-fade-up">
      {/* Header personnalisé */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-text mb-2">
          Rejoins Mah.AI <span className="text-teal">🇲🇬</span>
        </h1>
        <p className="text-muted text-sm font-mono">
          Crée ton compte en quelques secondes
        </p>
      </div>

      {/* Clerk SignUp — Thème personnalisé */}
      <SignUp
        appearance={clerkAppearance}
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        forceRedirectUrl="/onboarding"
      />

      {/* Liste des avantages (Bento-style list) */}
      <div className="mt-10 pt-8 border-t border-border/30">
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: "🎁", text: "10 crédits offerts" },
            { icon: "📄", text: "Catalogue national" },
            { icon: "🤖", text: "Corrections IA" },
            { icon: "⏱️", text: "Examens blancs" },
          ].map((feature, i) => (
            <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/5 hover:border-teal/20 transition-all duration-300">
              <span className="text-lg">{feature.icon}</span>
              <span className="text-[10px] font-bold text-muted/80 uppercase tracking-tighter">{feature.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer info */}
      <div className="mt-8 text-center">
        <p className="text-[11px] text-muted/50 leading-relaxed font-mono">
          En t'inscrivant, tu acceptes notre <a href="/privacy" className="text-muted/80 hover:text-teal underline">Politique de confidentialité</a>
          <br />
          Besoin d'aide ? <a href="/contact" className="text-muted/80 hover:text-teal">Contactez-nous</a>
        </p>
      </div>
    </div>
  )
}
