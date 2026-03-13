"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Sun, Moon } from "lucide-react"

export function LuxuryNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)

    // Check initial theme
    const savedTheme = localStorage.getItem('theme') || 'dark'
    setTheme(savedTheme)
    document.documentElement.setAttribute('data-theme', savedTheme)

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 px-8 transition-all duration-400 ${scrolled ? "bg-void border-b border-border-1 backdrop-blur-md" : "bg-transparent"}`}>
      <div className="max-w-[1300px] mx-auto h-[76px] flex items-center justify-between">
        <Link href="/" className="font-display text-2xl font-semibold tracking-tight text-text no-underline flex items-center relative">
          Mah
          <span className="w-2 h-2 mx-1 rounded-full bg-gradient-to-br from-gold-hi to-gold shadow-[0_0_10px_var(--gold-glow)] animate-[gemPulse_3s_ease-in-out_infinite]"></span>
          AI
        </Link>
        <ul className="hidden md:flex items-center gap-10 list-none m-0 p-0">
          <li>
            <Link href="/" className="text-sm font-normal text-text-2 no-underline tracking-wide transition-colors relative hover:text-text after:content-[''] after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-px after:bg-gold after:scale-x-0 after:origin-right after:transition-transform hover:after:scale-x-100 hover:after:origin-left">
              Accueil
            </Link>
          </li>
          <li>
            <Link href="/catalogue" className="text-sm font-normal text-text-2 no-underline tracking-wide transition-colors relative hover:text-text after:content-[''] after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-px after:bg-gold after:scale-x-0 after:origin-right after:transition-transform hover:after:scale-x-100 hover:after:origin-left">
              Catalogue
            </Link>
          </li>
          <li>
            <Link href="/tarifs" className="text-sm font-normal text-text-2 no-underline tracking-wide transition-colors relative hover:text-text after:content-[''] after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-px after:bg-gold after:scale-x-0 after:origin-right after:transition-transform hover:after:scale-x-100 hover:after:origin-left">
              Tarifs
            </Link>
          </li>
          <li>
            <Link href="/a-propos" className="text-sm font-normal text-text-2 no-underline tracking-wide transition-colors relative hover:text-text after:content-[''] after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-px after:bg-gold after:scale-x-0 after:origin-right after:transition-transform hover:after:scale-x-100 hover:after:origin-left">
              À Propos
            </Link>
          </li>
        </ul>
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleTheme}
            className="p-2 mr-2 rounded-full border border-border-1 hover:border-gold-line transition-all text-text-2 hover:text-text cursor-none"
            aria-label="Changer de thème"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <Link 
            href="/auth/login" 
            className="hidden sm:inline-flex items-center font-body text-xs font-medium px-5 py-2 rounded border border-border-1 bg-transparent text-text-2 tracking-wide transition-all hover:border-gold-line hover:text-text cursor-none"
          >
            Connexion
          </Link>
          <Link 
            href="/auth/register" 
            className="inline-flex items-center font-body text-xs font-medium px-6 py-2 rounded bg-gradient-to-br from-gold to-gold-hi text-void border-none tracking-wide shadow-[0_2px_16px_rgba(201,168,76,0.25)] transition-all hover:-translate-y-px hover:shadow-[0_4px_24px_rgba(201,168,76,0.35)] cursor-none"
          >
            Inscris-toi
          </Link>
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
