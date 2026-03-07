'use client'

import { usePathname } from 'next/navigation'
import { useUser, Show, SignInButton } from '@clerk/nextjs'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  FileText, 
  PenTool, 
  Bot, 
  BarChart3, 
  CreditCard, 
  Bell, 
  Settings,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Gem,
  X
} from 'lucide-react'
import { Logo } from '@/components/ui/logo'
import { useSidebar } from './AppShell'
import { cn } from '@/lib/utils'
import RippleEffect from '@/components/ui/RippleEffect'

const navItems = [
  { href: "/etudiant", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/etudiant/sujets", label: "Mes sujets", icon: FileText },
  { href: "/etudiant/examens", label: "Examens blancs", icon: PenTool, badge: "3" },
  { href: "/etudiant/ai", label: "Correction IA", icon: Bot },
  { href: "/etudiant/progres", label: "Mes progrès", icon: BarChart3 },
]

const accountItems = [
  { href: "/etudiant/credits", label: "Crédits & Paiement", icon: CreditCard },
  { href: "/etudiant/notifications", label: "Notifications", icon: Bell },
  { href: "/etudiant/profil", label: "Profil", icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user, isLoaded } = useUser()
  const { isCollapsed, setCollapsed, isMobileOpen, setMobileOpen } = useSidebar()

  return (
    <>
      {/* Sidebar Desktop */}
      <aside 
        className={cn(
          "fixed top-0 left-0 bottom-0 z-50 glass border-r border-white/5 flex flex-col transition-all duration-500 ease-in-out hidden lg:flex group/sidebar hover:border-teal/30 hover:shadow-[0_0_30px_rgba(10,255,224,0.08)]",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        {/* Toggle Button */}
        <button 
          onClick={() => setCollapsed(!isCollapsed)}
          className="absolute -right-3 top-24 w-6 h-6 bg-bg border border-border/40 hover:border-teal/40 rounded-full flex items-center justify-center text-muted hover:text-teal transition-all shadow-lg z-50 group"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>

        {/* Logo Section */}
        <div className={cn("p-6 border-b border-border/20 transition-all duration-500", isCollapsed ? "px-4" : "p-8")}>
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            {!isCollapsed && (
              <div className="animate-in fade-in duration-700">
                <div className="text-[10px] font-bold text-muted uppercase tracking-widest font-mono">
                  Mah.AI
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User Preview */}
        <div className="p-4">
          {!isLoaded ? (
            <div className={cn(
              "flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 animate-pulse",
              isCollapsed && "justify-center p-2"
            )}>
              <div className="w-10 h-10 rounded-xl bg-white/10" />
              {!isCollapsed && (
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/10 rounded w-24" />
                  <div className="h-3 bg-white/10 rounded w-16" />
                </div>
              )}
            </div>
          ) : (
            <>
              <Show when="signed-in">
                <Link href="/etudiant/profil" className={cn(
                  "flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 group hover:border-teal/20 transition-all overflow-hidden",
                  isCollapsed && "justify-center p-2"
                )}>
                  <div className="w-10 h-10 min-w-[40px] rounded-xl overflow-hidden border border-border/40">
                    <img
                      src={user?.imageUrl || ''}
                      alt="Profil utilisateur"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0 animate-in fade-in slide-in-from-left-2 duration-500">
                      <div className="text-sm font-bold truncate">{user?.firstName || 'Étudiant'}</div>
                      <div className="text-[10px] text-muted font-mono uppercase truncate opacity-60">BAC Série C</div>
                    </div>
                  )}
                </Link>
              </Show>
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <button className={cn(
                    "flex items-center gap-3 p-3 rounded-2xl bg-teal/10 border border-teal/20 text-teal hover:bg-teal hover:text-bg transition-all w-full",
                    isCollapsed && "justify-center p-2"
                  )}>
                    <div className="w-10 h-10 min-w-[40px] rounded-xl bg-teal/10 flex items-center justify-center border border-teal/20">
                      <LayoutDashboard className="w-5 h-5" />
                    </div>
                    {!isCollapsed && (
                      <span className="font-bold text-sm">Connexion</span>
                    )}
                  </button>
                </SignInButton>
              </Show>
            </>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar overflow-x-hidden">
          {!isCollapsed && (
            <div className="px-3 mb-2 text-[10px] font-black text-muted/40 uppercase tracking-[0.2em] font-mono animate-in fade-in duration-700">Principal</div>
          )}
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all group relative",
                  isActive 
                    ? 'bg-teal/10 text-teal border border-teal/20 shadow-lg shadow-teal/5' 
                    : 'text-muted hover:bg-white/5 hover:text-text',
                  isCollapsed && "justify-center px-0"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon className={cn("w-4 h-4 transition-transform duration-300", isActive ? 'scale-110' : 'group-hover:scale-110')} />
                {!isCollapsed && (
                  <span className="animate-in fade-in slide-in-from-left-2 duration-500">{item.label}</span>
                )}
                {item.badge && !isCollapsed && (
                  <span className="ml-auto bg-rose text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg shadow-rose/20 animate-in zoom-in duration-500">
                    {item.badge}
                  </span>
                )}
                {item.badge && isCollapsed && (
                   <span className="absolute top-2 right-2 w-2 h-2 bg-rose rounded-full" />
                )}
              </Link>
            )
          })}

          <div className={cn("mt-8", isCollapsed ? "h-px bg-border/10 my-6 mx-4" : "px-3 mb-2")}>
            {!isCollapsed && (
              <div className="text-[10px] font-black text-muted/40 uppercase tracking-[0.2em] font-mono animate-in fade-in duration-700">Compte</div>
            )}
          </div>
          
          {accountItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all group",
                  isActive 
                    ? 'bg-teal/10 text-teal border border-teal/20' 
                    : 'text-muted hover:bg-white/5 hover:text-text',
                  isCollapsed && "justify-center px-0"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                {!isCollapsed && (
                  <span className="animate-in fade-in slide-in-from-left-2 duration-500">{item.label}</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Credits Widget */}
        <div className="p-4">
          {isCollapsed ? (
            <Link 
              href="/etudiant/credits"
              className="w-12 h-12 mx-auto bg-teal/10 border border-teal/20 rounded-xl flex items-center justify-center text-teal hover:bg-teal hover:text-bg transition-all shadow-lg shadow-teal/5"
              title="12 Crédits"
            >
              <Gem className="w-5 h-5" />
            </Link>
          ) : (
            <div className="glass p-5 rounded-[24px] border border-teal/20 bg-teal/5 relative overflow-hidden group animate-in slide-in-from-bottom-2 duration-500">
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-teal/10 rounded-full blur-2xl group-hover:bg-teal/20 transition-all" />
              <div className="text-[9px] font-black text-teal uppercase tracking-widest font-mono mb-1">Tes Crédits</div>
              <div className="text-3xl font-black text-teal tracking-tighter">12</div>
              <div className="text-[10px] text-teal/60 font-medium mb-4">disponibles</div>
              <Link 
                href="/etudiant/credits"
                className="relative overflow-hidden flex items-center justify-center gap-2 w-full py-2 bg-teal text-bg text-xs font-black rounded-xl hover:scale-105 transition-all shadow-lg shadow-teal/20"
              >
                <RippleEffect color="rgba(6, 9, 16, 0.2)" />
                <PlusCircle className="w-3.5 h-3.5" /> Recharger
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* Sidebar Mobile */}
      <aside 
        className={cn(
          "fixed top-0 left-0 bottom-0 z-[60] w-72 glass border-r border-border/40 flex flex-col transition-transform duration-500 lg:hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Close Button Mobile */}
        <button 
          onClick={() => setMobileOpen(false)}
          className="absolute right-4 top-6 p-2 text-muted hover:text-text"
          aria-label="Fermer le menu"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8 border-b border-border/20">
          <Logo size="sm" />
          <div className="text-[10px] font-bold text-muted uppercase tracking-widest mt-3 font-mono">
            Espace Étudiant
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-6 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-xl text-lg font-bold transition-all",
                pathname === item.href ? "bg-teal/10 text-teal border border-teal/20" : "text-muted hover:text-text"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
          <div className="h-px bg-border/20 my-6" />
          {accountItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-xl text-lg font-bold transition-all",
                pathname === item.href ? "bg-teal/10 text-teal border border-teal/20" : "text-muted hover:text-text"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] lg:hidden transition-all duration-500 animate-in fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  )
}
