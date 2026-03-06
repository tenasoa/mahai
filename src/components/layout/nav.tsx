"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton, Show, SignInButton } from "@clerk/nextjs"
import { LayoutDashboard, BookOpen, GraduationCap, Zap, Menu, X } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/ui/logo"

const NAV_LINKS = [
  { name: "Catalogue", href: "/catalogue", icon: BookOpen },
  { name: "Sujets", href: "/sujets", icon: GraduationCap },
  { name: "Tarifs", href: "/pricing", icon: Zap },
]

export default function Nav() {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-6 py-4",
      isScrolled ? "bg-bg/70 backdrop-blur-2xl border-b border-white/5 py-3" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Logo size="md" />

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 relative group/link",
                  isActive ? "text-teal" : "text-muted hover:text-white"
                )}
              >
                <Icon className={cn("w-3.5 h-3.5 transition-transform group-hover/link:-translate-y-0.5", isActive ? "text-teal" : "text-muted/60")} />
                {link.name}
                {isActive && (
                  <span className="absolute -bottom-1.5 left-0 right-0 h-0.5 bg-teal rounded-full shadow-[0_0_8px_rgba(10,255,224,0.5)]" />
                )}
              </Link>
            )
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-5">
          <Show when="signed-in">
            <Link 
              href="/dashboard"
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-bg2 border border-white/10 rounded-xl hover:border-teal/50 hover:bg-bg3 transition-all duration-300 font-bold text-[10px] uppercase tracking-widest text-text shadow-sm"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-teal" />
              Espace Client
            </Link>
            <div className="p-0.5 bg-gradient-to-tr from-teal/20 to-purple/20 rounded-full">
              <UserButton />
            </div>
          </Show>
          
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="px-6 py-2.5 bg-teal hover:bg-teal2 text-bg font-black rounded-xl transition-all duration-300 shadow-lg shadow-teal/10 hover:shadow-teal/20 hover:-translate-y-0.5 active:scale-95 text-xs uppercase tracking-wider">
                Connexion
              </button>
            </SignInButton>
          </Show>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden p-2 text-white hover:bg-white/5 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-bg/95 backdrop-blur-2xl border-b border-white/5 p-8 animate-slide-down shadow-2xl">
          <div className="flex flex-col gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-4 text-xl font-bold text-text hover:text-teal transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-bg2 flex items-center justify-center border border-white/5">
                   <link.icon className="w-5 h-5" />
                </div>
                {link.name}
              </Link>
            ))}
            <Show when="signed-in">
                 <Link 
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-4 text-xl font-bold text-teal"
                >
                  <div className="w-10 h-10 rounded-xl bg-teal/10 flex items-center justify-center border border-teal/20">
                    <LayoutDashboard className="w-5 h-5" />
                  </div>
                  Dashboard
                </Link>
            </Show>
          </div>
        </div>
      )}
    </nav>
  )
}
