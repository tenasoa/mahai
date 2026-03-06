'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser, UserButton } from '@clerk/nextjs'
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  PenTool, 
  Bot, 
  BarChart3, 
  CreditCard, 
  Bell, 
  Settings,
  Menu,
  X,
  PlusCircle
} from 'lucide-react'
import { Logo } from '@/components/ui/logo'

// ============================================
// MAH.AI — Layout Dashboard
// ============================================
// Sidebar persistante et Topbar responsive
// ============================================

const navItems = [
  { href: "/etudiant", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/catalogue", label: "Catalogue", icon: BookOpen },
  { href: "/etudiant/sujets", label: "Mes sujets", icon: FileText },
  { href: "/etudiant/examens", label: "Examens blancs", icon: PenTool, badge: "3" },
  { href: "/etudiant/ai", label: "Correction IA", icon: Bot },
  { href: "/etudiant/progres", label: "Mes progrès", icon: BarChart3 },
]

const accountItems = [
  { href: "/etudiant/credits", label: "Crédits & Paiement", icon: CreditCard },
  { href: "/etudiant/notifications", label: "Notifications", icon: Bell },
  { href: "/etudiant/parametres", label: "Paramètres", icon: Settings },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { user, isLoaded } = useUser()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Fermer la sidebar sur mobile lors du changement de route
  useEffect(() => {
    setIsSidebarOpen(false)
  }, [pathname])

  if (!isLoaded) return null

  return (
    <div className="min-h-screen bg-bg text-text selection:bg-teal/30">
      {/* ── SIDEBAR (Desktop) ── */}
      <aside className={`
        fixed top-0 left-0 bottom-0 w-64 z-50
        glass border-r border-border/40 transition-transform duration-300
        lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-8 border-b border-border/20">
            <Logo size="sm" />
            <div className="text-[10px] font-bold text-muted uppercase tracking-widest mt-3 font-mono">
              Espace Étudiant
            </div>
          </div>

          {/* User Preview */}
          <div className="p-4">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 group hover:border-teal/20 transition-all">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-border/40">
                <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: 'w-full h-full' } }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold truncate">{user?.firstName || 'Étudiant'}</div>
                <div className="text-[10px] text-muted font-mono uppercase truncate">BAC Série C</div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
            <div className="px-3 mb-2 text-[10px] font-black text-muted/40 uppercase tracking-[0.2em] font-mono">Principal</div>
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all group
                    ${isActive 
                      ? 'bg-teal/10 text-teal border border-teal/20 shadow-lg shadow-teal/5' 
                      : 'text-muted hover:bg-white/5 hover:text-text'}
                  `}
                >
                  <item.icon className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                  {item.label}
                  {item.badge && (
                    <span className="ml-auto bg-rose text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg shadow-rose/20">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}

            <div className="px-3 mt-8 mb-2 text-[10px] font-black text-muted/40 uppercase tracking-[0.2em] font-mono">Compte</div>
            {accountItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all group
                    ${isActive 
                      ? 'bg-teal/10 text-teal border border-teal/20' 
                      : 'text-muted hover:bg-white/5 hover:text-text'}
                  `}
                >
                  <item.icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Credits Widget */}
          <div className="p-4">
            <div className="glass p-5 rounded-[24px] border border-teal/20 bg-teal/5 relative overflow-hidden group">
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-teal/10 rounded-full blur-2xl group-hover:bg-teal/20 transition-all" />
              <div className="text-[9px] font-black text-teal uppercase tracking-widest font-mono mb-1">Tes Crédits</div>
              <div className="text-3xl font-black text-teal tracking-tighter">12</div>
              <div className="text-[10px] text-teal/60 font-medium mb-4">crédits disponibles</div>
              <Link 
                href="/etudiant/credits"
                className="flex items-center justify-center gap-2 w-full py-2 bg-teal text-bg text-xs font-black rounded-xl hover:scale-105 transition-all shadow-lg shadow-teal/20"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Recharger
              </Link>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className={`lg:ml-64 min-h-screen flex flex-col relative z-10 transition-all duration-300`}>
        
        {/* Topbar */}
        <header className="sticky top-0 z-40 glass border-b border-border/40 px-6 py-4 flex items-center justify-between">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 text-muted hover:text-text transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="hidden lg:block">
            <div className="text-sm font-bold tracking-tight">
              Bonjour, <span className="text-teal">{user?.firstName} 👋</span>
            </div>
            <div className="text-[10px] text-muted font-mono uppercase tracking-wider">
               BAC dans <span className="text-teal font-bold underline">47 jours</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-border/40 text-muted font-mono text-[11px] cursor-pointer hover:border-teal/30 transition-all">
              <span>🔍</span> Rechercher un sujet... <span className="text-[9px] opacity-40 ml-2">⌘K</span>
            </div>
            <button className="relative w-10 h-10 rounded-xl bg-white/5 border border-border/40 flex items-center justify-center text-muted hover:text-text hover:border-teal/30 transition-all group">
              <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-rose border border-bg group-hover:scale-125 transition-all" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 md:p-10">
          {children}
        </main>

        {/* Footer info */}
        <footer className="px-10 py-6 text-center text-[10px] text-muted/30 font-mono border-t border-border/10">
          MAH.AI EDU PLATFORM — VERSION 1.0.2-BETA
        </footer>
      </div>

      {/* Overlay mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  )
}
