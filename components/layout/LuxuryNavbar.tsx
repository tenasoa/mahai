"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { Sun, Moon, User, LogOut, BookOpen, CreditCard, ChevronDown } from "lucide-react"
import { useAuth } from "@/lib/hooks/useAuth"
import { logoutUser } from "@/actions/auth"

export function LuxuryNavbar() {
  const { userId, user, appUser } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [theme, setTheme] = useState('dark')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)

    const savedTheme = localStorage.getItem('theme') || 'dark'
    setTheme(savedTheme)
    document.documentElement.setAttribute('data-theme', savedTheme)

    // Close dropdown on click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
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

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 px-8 transition-all duration-400 ${
      scrolled 
        ? "bg-card/95 backdrop-blur-xl shadow-md border-b border-b1" 
        : "bg-transparent"
    }`}>
      <div className="max-w-[1300px] mx-auto h-[76px] flex items-center justify-between">
        <Link href="/" className="font-display text-2xl font-semibold tracking-tight text-text no-underline flex items-center relative">
          Mah
          <span className="w-2 h-2 mx-1 rounded-full bg-gradient-to-br from-gold-hi to-gold shadow-[0_0_10px_var(--gold-glow)] animate-[gemPulse_3s_ease-in-out_infinite]"></span>
          AI
        </Link>
        <ul className="hidden md:flex items-center gap-10 list-none m-0 p-0">
          <li>
            <Link href="/" className="text-sm font-normal text-text-2 no-underline tracking-wide transition-colors relative hover:text-text">
              Accueil
            </Link>
          </li>
          <li>
            <Link href="/catalogue" className="text-sm font-normal text-text-2 no-underline tracking-wide transition-colors relative hover:text-text">
              Catalogue
            </Link>
          </li>
          <li>
            <Link href="/credits" className="text-sm font-normal text-text-2 no-underline tracking-wide transition-colors relative hover:text-text">
              Acheter des crédits
            </Link>
          </li>
        </ul>
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleTheme}
            className="p-2 mr-2 rounded-full border border-gold/10 hover:border-gold-line transition-all text-text-2 hover:text-text cursor-none"
            aria-label="Changer de thème"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {userId ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1 pl-3 pr-2 rounded-full border border-gold/10 hover:border-gold-line transition-all bg-card/50 cursor-none"
              >
                <div className="flex flex-col items-end hidden sm:flex">
                  <span className="text-[10px] font-mono text-gold leading-none mb-1">{appUser?.credits ?? 0} CR</span>
                  <span className="text-xs font-medium text-text leading-none">{appUser?.prenom || user?.email?.split('@')[0] || 'Moi'}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold to-gold-hi flex items-center justify-center text-void font-bold text-xs shadow-sm">
                  {(appUser?.prenom?.charAt(0) || user?.email?.charAt(0) || 'U').toUpperCase()}
                </div>
                <ChevronDown size={14} className={`text-text-3 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-card border border-border-3 rounded-lg shadow-xl py-2 animate-in fade-in slide-in-from-top-2 duration-200 z-[100]">
                  <div className="px-4 py-2 border-b border-border-3 mb-1">
                    <p className="text-xs font-mono text-text-3 uppercase tracking-wider mb-1">Mon Compte</p>
                    <p className="text-sm font-medium text-text truncate">{user?.email}</p>
                  </div>

                  <div className="px-4 py-2 mb-1 bg-gold-dim border border-gold-line rounded" style={{ margin: '0.5rem 1rem' }}>
                    <p className="text-xs font-mono text-text-3 uppercase tracking-wider mb-0.5">Crédits restants</p>
                    <p className="text-xl font-display text-gold font-semibold">{appUser?.credits ?? 0} CR</p>
                  </div>

                  <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-2 hover:text-text hover:bg-surface transition-colors cursor-none">
                    <User size={16} className="text-gold" />
                    Tableau de bord
                  </Link>
                  
                  <Link href="/dashboard/achats" className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-2 hover:text-text hover:bg-surface transition-colors cursor-none">
                    <BookOpen size={16} className="text-gold" />
                    Mes Sujets
                  </Link>

                  <Link href="/credits" className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-2 hover:text-text hover:bg-surface transition-colors cursor-none">
                    <CreditCard size={16} className="text-gold" />
                    Crédits
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
                className="hidden sm:inline-flex items-center font-body text-xs font-medium px-5 py-2 rounded border border-gold/10 bg-transparent text-text-2 tracking-wide transition-all hover:border-gold-line hover:text-text cursor-none"
              >
                Connexion
              </Link>
              <Link 
                href="/auth/register" 
                className="inline-flex items-center font-body text-xs font-medium px-6 py-2 rounded bg-gradient-to-br from-gold to-gold-hi text-void border-none tracking-wide shadow-[0_2px_16px_rgba(201,168,76,0.25)] transition-all hover:-translate-y-px hover:shadow-[0_4px_24px_rgba(201,168,76,0.35)] cursor-none"
              >
                S'inscrire
              </Link>
            </>
          )}
          
          <button className="md:hidden flex flex-col gap-[5px] bg-transparent border-none p-2">
            <span className="w-6 h-px bg-text-2 transition-all"></span>
            <span className="w-6 h-px bg-text-2 transition-all"></span>
            <span className="w-6 h-px bg-text-2 transition-all"></span>
          </button>
        </div>
      </div>
    </nav>
  )
}
