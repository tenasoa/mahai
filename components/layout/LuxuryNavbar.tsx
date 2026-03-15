"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { Sun, Moon, Bell, LogOut, User, CreditCard, ChevronDown } from "lucide-react"
import { useAuth } from "@/lib/hooks/useAuth"
import { logoutUser } from "@/actions/auth"

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

export function LuxuryNavbar() {
  const pathname = usePathname()
  const { userId, user, appUser } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [theme, setTheme] = useState('dark')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const notifDropdownRef = useRef<HTMLDivElement>(null)

  // Navigation items with icons
  const navItems: NavItem[] = [
    {
      label: 'Tableau de bord',
      href: '/dashboard',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
      )
    },
    {
      label: 'Catalogue',
      href: '/catalogue',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
        </svg>
      )
    },
    {
      label: 'Mes Sujets',
      href: '/dashboard/achats',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
      )
    },
    {
      label: 'Examens',
      href: '/examens',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
      )
    },
    {
      label: 'Communauté',
      href: '/dashboard/communaute',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 00-3-3.87"/>
          <path d="M16 3.13a4 4 0 010 7.75"/>
        </svg>
      )
    }
  ]

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)

    const savedTheme = localStorage.getItem('theme') || 'dark'
    setTheme(savedTheme)
    document.documentElement.setAttribute('data-theme', savedTheme)

    // Close dropdowns on click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
        setNotifDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname.startsWith('/dashboard/')
    }
    return pathname === href
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 px-8 transition-all duration-400 ${
      scrolled 
        ? "bg-card/95 backdrop-blur-xl shadow-md border-b border-b1" 
        : "bg-transparent"
    }`}>
      <div className="max-w-[1400px] mx-auto h-[76px] flex items-center justify-between">
        
        {/* ═══════ GAUCHE : Logo + Crédits ═══════ */}
        <div className="flex items-center gap-6">
          <Link href="/" className="font-display text-2xl font-semibold tracking-tight text-text no-underline flex items-center relative group">
            Mah
            <span className="w-2 h-2 mx-1 rounded-full bg-gradient-to-br from-gold-hi to-gold shadow-[0_0_10px_var(--gold-glow)] animate-[gemPulse_3s_ease-in-out_infinite] group-hover:shadow-[0_0_20px_var(--gold-glow)] transition-shadow"></span>
            AI
          </Link>

          {/* Crédits Badge */}
          {userId && (
            <Link 
              href="/credits"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gold-dim border border-gold-line hover:border-gold transition-all cursor-none group"
            >
              <CreditCard className="w-4 h-4 text-gold group-hover:scale-110 transition-transform" />
              <span className="text-sm font-mono text-gold font-semibold">
                {appUser?.credits ?? 0} CR
              </span>
            </Link>
          )}
        </div>

        {/* ═══════ CENTRE : Menu Navigation ═══════ */}
        <ul className="hidden md:flex items-center gap-2 list-none m-0 p-0">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg
                  text-sm font-medium transition-all duration-300
                  cursor-none
                  ${isActive(item.href)
                    ? 'bg-gold-dim text-gold border border-gold-line'
                    : 'text-text-2 hover:text-text hover:bg-surface'
                  }
                `}
              >
                {item.icon}
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* ═══════ DROITE : Notifications + Thème + Avatar ═══════ */}
        <div className="flex items-center gap-3">
          
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full border border-gold/10 hover:border-gold-line transition-all text-text-2 hover:text-text cursor-none"
            aria-label="Changer de thème"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Notifications */}
          {userId && (
            <div className="relative" ref={notifDropdownRef}>
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="p-2 rounded-full border border-gold/10 hover:border-gold-line transition-all text-text-2 hover:text-text cursor-none relative"
              >
                <Bell size={18} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-ruby rounded-full border-2 border-card"></span>
              </button>

              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-card border border-border-3 rounded-lg shadow-xl py-2 animate-in fade-in slide-in-from-top-2 duration-200 z-[100]">
                  <div className="px-4 py-2 border-b border-border-3">
                    <p className="text-sm font-medium text-text">Notifications</p>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <div className="px-4 py-3 hover:bg-surface transition-colors cursor-none">
                      <p className="text-sm text-text">3 nouvelles corrections IA disponibles</p>
                      <p className="text-xs text-text-4 mt-1">Il y a 2 heures</p>
                    </div>
                    <div className="px-4 py-3 hover:bg-surface transition-colors cursor-none">
                      <p className="text-sm text-text">Nouveau sujet ajouté : Mathématiques BAC 2024</p>
                      <p className="text-xs text-text-4 mt-1">Il y a 5 heures</p>
                    </div>
                    <div className="px-4 py-3 hover:bg-surface transition-colors cursor-none">
                      <p className="text-sm text-text">Recharge de 150 crédits effectuée</p>
                      <p className="text-xs text-text-4 mt-1">Il y a 1 jour</p>
                    </div>
                  </div>
                  <div className="px-4 py-2 border-t border-border-3">
                    <Link href="/dashboard/notifications" className="text-xs text-gold hover:text-gold-hi transition-colors">
                      Voir tout →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Avatar Dropdown */}
          {userId ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1 pl-3 pr-2 rounded-full border border-gold/10 hover:border-gold-line transition-all bg-card/50 cursor-none"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold to-gold-hi flex items-center justify-center text-void font-bold text-xs shadow-sm">
                  {(appUser?.prenom?.charAt(0) || user?.email?.charAt(0) || 'U').toUpperCase()}
                </div>
                <ChevronDown size={14} className={`text-text-3 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-card border border-border-3 rounded-lg shadow-xl py-2 animate-in fade-in slide-in-from-top-2 duration-200 z-[100]">
                  <div className="px-4 py-2 border-b border-border-3 mb-1">
                    <p className="text-xs font-mono text-text-3 uppercase tracking-wider mb-1">Mon Compte</p>
                    <p className="text-sm font-medium text-text truncate">{appUser?.prenom || user?.email?.split('@')[0]}</p>
                    <p className="text-xs text-text-4 truncate">{user?.email}</p>
                  </div>

                  <Link 
                    href="/dashboard/profil" 
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-2 hover:text-text hover:bg-surface transition-colors cursor-none"
                  >
                    <User size={16} className="text-gold" />
                    Profil
                  </Link>

                  <div className="border-t border-border-3 my-1"></div>

                  <button
                    onClick={() => logoutUser()}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-ruby hover:bg-ruby/5 transition-colors cursor-none text-left"
                  >
                    <LogOut size={16} />
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="hidden sm:inline-flex items-center font-body text-xs font-medium px-5 py-2 rounded-lg border border-gold/10 bg-transparent text-text-2 tracking-wide transition-all hover:border-gold-line hover:text-text hover:bg-gold-dim/30 cursor-none"
              >
                Connexion
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center font-body text-xs font-medium px-6 py-2 rounded-lg bg-gradient-to-br from-gold to-gold-hi text-void border-none tracking-wide shadow-[0_2px_16px_rgba(201,168,76,0.25)] transition-all hover:-translate-y-px hover:shadow-[0_4px_24px_rgba(201,168,76,0.35)] cursor-none"
              >
                S'inscrire
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
