"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { Sun, Moon, User, LogOut, ChevronDown, RefreshCw, Settings } from "lucide-react"
import { useAuth } from "@/lib/hooks/useAuth"
import { UserNotifications } from './UserNotifications'
import { logoutUser } from "@/actions/auth"

interface NavItem {
  label: string
  href: string
  icon?: React.ComponentType<{ size?: number }>
}

export function LuxuryNavbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { userId, appUser } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [theme, setTheme] = useState('dark')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Menus centraux - différents pour connecté / non-connecté
  const centerNavItems: NavItem[] = userId ? [
    { label: 'Tableau de bord', href: '/dashboard' },
    { label: 'Catalogue', href: '/catalogue' },
    { label: 'Crédits', href: '/recharge' },
  ] : [
    { label: 'Accueil', href: '/' },
    { label: 'Fonctionnalités', href: '/#features' },
    { label: 'Tarifs', href: '/#pricing' }
  ]

  // Items du dropdown (uniquement menus supplémentaires)
  const dropdownNavItems: NavItem[] = userId ? [
    { label: 'Profil', href: '/profil', icon: User },
    ...(appUser?.role === 'ADMIN' ? [{ label: 'Administration', href: '/admin', icon: Settings }] : []),
  ] : []

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)

    const savedTheme = localStorage.getItem('theme') || 'dark'
    setTheme(savedTheme)
    document.documentElement.setAttribute('data-theme', savedTheme)

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setDropdownOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Force re-render when userId changes to update nav items
  useEffect(() => {
    // This effect runs when userId changes to trigger a re-render
  }, [userId])

  // Ne pas afficher la navbar sur les pages d'administration
  if (pathname?.startsWith('/admin')) {
    return null
  }

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard' || pathname.startsWith('/dashboard/')
    return pathname === href
  }

  return (
    <nav className="nav" style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 500,
      background: scrolled ? 'rgba(var(--depth-rgb), 0.95)' : 'rgba(var(--void-rgb), 0.95)',
      borderBottom: '1px solid var(--b1)', backdropFilter: 'blur(20px)', transition: 'all 0.4s'
    }}>
      <div className="nav-inner" style={{
        maxWidth: '1440px', margin: '0 auto', padding: '0 2rem', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>

        {/* LOGO */}
        <Link href="/" className="logo" style={{
          fontFamily: 'var(--display)', fontSize: '1.5rem', fontWeight: 600,
          color: 'var(--text)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '.3rem'
        }}>
          Mah<span className="logo-gem" style={{
            width: '7px', height: '7px', background: 'var(--gold)', borderRadius: '50%',
            boxShadow: '0 0 10px var(--gold-glow)', animation: 'gp 3s ease-in-out infinite'
          }}></span>AI
        </Link>

        {/* MENUS CENTRAUX */}
        <ul style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem', listStyle: 'none', margin: 0, padding: 0
        }}>
          {centerNavItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href} style={{
                fontFamily: 'var(--mono)', fontSize: '0.62rem', textTransform: 'uppercase',
                letterSpacing: '0.1em', color: isActive(item.href) ? 'var(--gold)' : 'var(--text-3)',
                textDecoration: 'none', padding: '0.4rem 0.9rem', borderRadius: 'var(--r)',
                border: isActive(item.href) ? '1px solid var(--gold-line)' : '1px solid transparent',
                background: isActive(item.href) ? 'var(--gold-dim)' : 'transparent',
                transition: 'all 0.2s', cursor: 'none'
              }}
              onMouseEnter={(e) => {
                if (!isActive(item.href)) {
                  e.currentTarget.style.color = 'var(--text-2)'
                  e.currentTarget.style.borderColor = 'var(--gold-line)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(item.href)) {
                  e.currentTarget.style.color = 'var(--text-3)'
                  e.currentTarget.style.borderColor = 'transparent'
                }
              }}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* ACTIONS DROITE */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>

          {/* NOTIFICATIONS (uniquement si connecté) */}
          {userId && <UserNotifications />}

          {/* AVATAR & NAVIGATION DROPDOWN */}
          {userId ? (
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setDropdownOpen(!dropdownOpen)} style={{
                width: '42px',
                height: '42px',
                padding: '0',
                borderRadius: '50%',
                background: 'transparent',
                border: '2px solid var(--gold-line)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'none', transition: 'all 0.3s',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--gold)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--gold-line)'}
              >
                {appUser?.profilePicture ? (
                  <img
                    src={appUser.profilePicture}
                    alt="Avatar"
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    background: 'var(--gold-dim)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--display)',
                    fontSize: '1.1rem',
                    color: 'var(--gold)',
                    fontWeight: 600
                  }}>
                    {(appUser?.prenom?.charAt(0) || 'U').toUpperCase()}
                  </div>
                )}
              </button>

              {dropdownOpen && (
                <div className="avatar-dropdown" style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 0.75rem)', width: '240px',
                  background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: 'var(--r-lg)',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.3)', padding: '0.5rem 0', zIndex: 100, animation: 'fadeIn 0.2s ease'
                }}>
                  {/* Navigation Links & Actions */}
                  <div style={{ padding: '0.5rem 0' }}>
                    {/* Crédits + Recharger (fusionné) */}
                    <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--b3)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-4)' }}>Solde</span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--gold)' }}>{appUser?.credits ?? 0} cr</span>
                      </div>
                      <Link href="/recharge" style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                        padding: '0.5rem', fontSize: '0.75rem', color: 'var(--gold)', background: 'rgba(201, 168, 76, 0.1)',
                        border: '1px solid rgba(201, 168, 76, 0.2)', borderRadius: 'var(--r)', cursor: 'none', transition: 'all 0.2s',
                        textDecoration: 'none'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(201, 168, 76, 0.2)'; e.currentTarget.style.borderColor = 'rgba(201, 168, 76, 0.4)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(201, 168, 76, 0.1)'; e.currentTarget.style.borderColor = 'rgba(201, 168, 76, 0.2)' }}
                      onClick={() => setDropdownOpen(false)}
                      >
                        <RefreshCw size={14} />
                        Recharger
                      </Link>
                    </div>
                    
                    {/* Navigation Links */}
                    {dropdownNavItems.map((item) => (
                      <Link key={item.href} href={item.href} style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 1.25rem',
                        fontSize: '0.82rem', color: isActive(item.href) ? 'var(--gold)' : 'var(--text-2)',
                        textDecoration: 'none', transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.color = 'var(--text)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; if(!isActive(item.href)) e.currentTarget.style.color = 'var(--text-2)' }}
                      onClick={() => setDropdownOpen(false)}
                      >
                        {item.icon && <item.icon size={16} />}
                        {item.label}
                      </Link>
                    ))}
                  </div>

                  <div style={{ height: '1px', background: 'var(--b1)', margin: '0.25rem 0' }}></div>

                  {/* Thème + Déconnexion */}
                  <div style={{ padding: '0.5rem 0' }}>
                    <button onClick={toggleTheme} style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 1.25rem',
                      fontSize: '0.82rem', color: 'var(--text-2)', background: 'none', border: 'none', cursor: 'none', textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                      {theme === 'dark' ? 'Mode Clair' : 'Mode Sombre'}
                    </button>
                    <button onClick={() => logoutUser()} style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 1.25rem',
                      fontSize: '0.82rem', color: 'var(--ruby)', background: 'none', border: 'none', cursor: 'none', textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--ruby-dim)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <LogOut size={16} /> Déconnexion
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link href="/auth/login" style={{ fontSize: '0.75rem', color: 'var(--text-2)', textDecoration: 'none', fontWeight: 500, padding: '0.5rem 1rem' }}>Connexion</Link>
              <Link href="/auth/register" style={{ fontSize: '0.75rem', background: 'linear-gradient(135deg, var(--gold), var(--gold-hi))', color: 'var(--void)', textDecoration: 'none', fontWeight: 600, padding: '0.5rem 1.25rem', borderRadius: 'var(--r)' }}>Inscription</Link>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes gp { 0%, 100% { box-shadow: 0 0 6px var(--gold-glow); } 50% { box-shadow: 0 0 18px rgba(201,168,76,0.4); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </nav>
  )
}
