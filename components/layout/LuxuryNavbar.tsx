"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { Sun, Moon, User, LogOut, ChevronDown, Bell, CreditCard, RefreshCw, Settings } from "lucide-react"
import { useAuth } from "@/lib/hooks/useAuth"
import { logoutUser } from "@/actions/auth"

interface NavItem {
  label: string
  href: string
  icon?: React.ComponentType<{ size?: number }>
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

  // Menus centraux - différents pour connecté / non-connecté
  const centerNavItems: NavItem[] = userId ? [
    { label: 'Tableau de bord', href: '/dashboard' },
    { label: 'Catalogue', href: '/catalogue' },
    { label: 'Mes Sujets', href: '/dashboard/achats' },
    { label: 'Examens', href: '/examens' },
    { label: 'Communauté', href: '/dashboard/communaute' }
  ] : [
    { label: 'Accueil', href: '/' },
    { label: 'Fonctionnalités', href: '/#features' },
    { label: 'Tarifs', href: '/#pricing' }
  ]

  // Items du dropdown (uniquement menus supplémentaires)
  const dropdownNavItems: NavItem[] = [
    { label: 'Profil', href: '/profil', icon: User },
    { label: 'Paramètres', href: '/parametres', icon: Settings }
  ]

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)

    const savedTheme = localStorage.getItem('theme') || 'dark'
    setTheme(savedTheme)
    document.documentElement.setAttribute('data-theme', savedTheme)

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setDropdownOpen(false)
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) setNotifDropdownOpen(false)
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

        {/* ACTIONS DROITE - Uniquement Notification + Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>

          {/* NOTIFICATIONS */}
          {userId && (
            <div className="relative" ref={notifDropdownRef}>
              <button onClick={() => setNotifDropdownOpen(!notifDropdownOpen)} style={{
                width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(201, 168, 76, 0.05)',
                border: '1px solid rgba(201, 168, 76, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'none', transition: 'all 0.2s', position: 'relative'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(201, 168, 76, 0.12)'; e.currentTarget.style.borderColor = 'rgba(201, 168, 76, 0.3)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(201, 168, 76, 0.05)'; e.currentTarget.style.borderColor = 'rgba(201, 168, 76, 0.15)' }}
              >
                <Bell size={18} style={{ color: 'var(--gold)' }} />
                <span style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', background: '#FF4D4F', borderRadius: '50%', border: '2px solid var(--void)' }}></span>
              </button>
              {notifDropdownOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 0.75rem)', width: '300px',
                  background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: 'var(--r-lg)',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.3)', padding: '0.5rem 0', zIndex: 100, animation: 'fadeIn 0.2s ease'
                }}>
                  <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--b1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)' }}>Notifications</p>
                    <span style={{ fontSize: '0.65rem', color: 'var(--gold)' }}>3 nouvelles</span>
                  </div>
                  <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                    {[1, 2].map(i => (
                      <div key={i} style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--b3)' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text)', marginBottom: '0.2rem' }}>{i === 1 ? 'Correction IA disponible' : 'Compte crédité de 50cr'}</p>
                        <p style={{ fontSize: '0.65rem', color: 'var(--text-4)' }}>Il y a {i*2}h</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AVATAR & NAVIGATION DROPDOWN */}
          {userId ? (
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setDropdownOpen(!dropdownOpen)} style={{
                height: '38px', padding: '0 0.35rem 0 1rem', borderRadius: '2rem',
                background: 'linear-gradient(135deg, #A8782A 0%, #453517 100%)',
                border: '1px solid rgba(201, 168, 76, 0.3)', display: 'flex', alignItems: 'center', gap: '0.65rem',
                cursor: 'none', transition: 'all 0.3s', boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(201, 168, 76, 0.6)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(201, 168, 76, 0.3)'}
              >
                <span style={{ fontFamily: 'var(--display)', fontSize: '0.9rem', fontWeight: 500, color: '#E8C96A' }}>
                  {appUser?.pseudo || appUser?.prenom || 'Menu'}
                </span>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ChevronDown size={14} color="#E8C96A" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
                </div>
              </button>

              {dropdownOpen && (
                <div className="avatar-dropdown" style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 0.75rem)', width: '240px',
                  background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: 'var(--r-lg)',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.3)', padding: '0.5rem 0', zIndex: 100, animation: 'fadeIn 0.2s ease'
                }}>
                  {/* User Info */}
                  <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--b1)' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.15rem' }}>
                      {appUser?.nomComplet || `${appUser?.prenom || ''} ${appUser?.nom || ''}`.trim()}
                    </p>
                    {appUser?.pseudo && (
                      <p style={{ fontSize: '0.65rem', color: 'var(--gold)', fontWeight: 500 }}>@{appUser.pseudo}</p>
                    )}
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-4)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
                  </div>

                  {/* Navigation Links & Actions */}
                  <div style={{ padding: '0.5rem 0' }}>
                    {/* Crédits + Recharger (fusionné) */}
                    <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--b3)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-4)' }}>Solde</span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--gold)' }}>250 cr</span>
                      </div>
                      <button style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                        padding: '0.5rem', fontSize: '0.75rem', color: 'var(--gold)', background: 'rgba(201, 168, 76, 0.1)',
                        border: '1px solid rgba(201, 168, 76, 0.2)', borderRadius: 'var(--r)', cursor: 'none', transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(201, 168, 76, 0.2)'; e.currentTarget.style.borderColor = 'rgba(201, 168, 76, 0.4)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(201, 168, 76, 0.1)'; e.currentTarget.style.borderColor = 'rgba(201, 168, 76, 0.2)' }}
                      >
                        <RefreshCw size={14} />
                        Recharger
                      </button>
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
