import { Logo } from '@/components/ui/logo'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg relative py-12 px-4 overflow-hidden">
      {/* Mesh Background Global */}
      <div className="mesh-bg" aria-hidden="true">
        <span /><span /><span />
      </div>
      {/* Logo */}
      <div className="relative z-10 mb-10 animate-fade-in">
        <Logo size="lg" />
      </div>

      {/* Auth Card Container */}
      <div className="relative z-10 w-full max-w-md">
        <div className="glass p-8 rounded-[28px] border border-border/50 shadow-2xl backdrop-blur-3xl relative overflow-hidden group">
          {/* Subtle inner glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-teal/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-green/10 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="relative z-10">
            {children}
          </div>
        </div>
        
        {/* Footer info */}
        <div className="mt-8 text-center text-xs text-muted/60 font-mono animate-fade-in" style={{ animationDelay: '0.4s' }}>
          Plateforme EdTech Madagascar 🇲🇬 · Sécurisée par Mah.AI
        </div>
      </div>
    </div>
  )
}
