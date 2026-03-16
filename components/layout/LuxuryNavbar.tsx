"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { Bell, Diamond, Sun, Moon, CreditCard } from "lucide-react"
import { useAuth } from "@/lib/hooks/useAuth"
import { logoutUser } from "@/actions/auth"

interface NavItem {
  label: string
  href: string
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

  const navItems: NavItem[] = userId ? [
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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)

    const savedTheme = localStorage.getItem('theme') || 'dark'
    setTheme(savedTheme)
    document.documentElement.setAttribute('data-theme', savedTheme)

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
    <nav className="nav" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 500,
      background: scrolled ? 'rgba(var(--depth-rgb), 0.95)' : 'rgba(var(--void-rgb), 0.95)',
      borderBottom: '1px solid var(--b1)',
      backdropFilter: 'blur(20px)',
      transition: 'all 0.4s'
    }}>
      <div className="nav-inner" style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '0 2rem',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem'
      }}>
        
        {/* ═══════ GAUCHE : Logo ═══════ */}
        <Link href="/" className="logo" style={{
          fontFamily: 'var(--display)',
          fontSize: '1.5rem',
          fontWeight: 600,
          letterSpacing: '-.02em',
          color: 'var(--text)',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '.3rem'
        }}>
          Mah
          <span className="logo-gem" style={{
            width: '7px',
            height: '7px',
            background: 'var(--gold)',
            borderRadius: '50%',
            boxShadow: '0 0 10px var(--gold-glow)',
            animation: 'gp 3s ease-in-out infinite'
          }}></span>
          AI
        </Link>

        {/* ═══════ CENTRE : Menu Navigation ═══════ */}
        <ul className="nav-menu" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          listStyle: 'none',
          margin: 0,
          padding: 0,
          flex: 1,
          justifyContent: 'center'
        }}>
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="nav-link"
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: '0.62rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: isActive(item.href) ? 'var(--gold)' : 'var(--text-3)',
                  textDecoration: 'none',
                  padding: '0.4rem 0.8rem',
                  borderRadius: 'var(--r)',
                  border: isActive(item.href) ? '1px solid var(--gold-line)' : '1px solid transparent',
                  background: isActive(item.href) ? 'var(--gold-dim)' : 'transparent',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!isActive(item.href)) {
                    e.currentTarget.style.color = 'var(--text)'
                    e.currentTarget.style.background = 'var(--b3)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(item.href)) {
                    e.currentTarget.style.color = 'var(--text-3)'
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* ═══════ DROITE : Actions ═══════ */}
        <div className="nav-right" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          
          {/* Crédits avec Diamant */}
          {userId && (
            <div className="credit-display" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0 0.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ 
                  fontFamily: 'var(--body)', 
                  fontSize: '0.9rem', 
                  fontWeight: 600, 
                  color: 'var(--text)' 
                }}>
                  {appUser?.credits ?? 0}
                </span>
                <span style={{ 
                  fontFamily: 'var(--mono)', 
                  fontSize: '0.65rem', 
                  color: 'var(--gold-lo)', 
                  textTransform: 'uppercase',
                  marginTop: '2px'
                }}>
                  cr
                </span>
              </div>
              <div className="diamond-icon" style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '20px',
                height: '20px'
              }}>
                <div style={{
                  position: 'absolute',
                  inset: '-4px',
                  background: 'radial-gradient(circle, rgba(64, 150, 255, 0.2), transparent 70%)',
                  borderRadius: '50%',
                  animation: 'pulse-blue 2s infinite ease-in-out'
                }}></div>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#4096ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 4px rgba(64, 150, 255, 0.5))' }}>
                  <path d="M6 3h12l4 6-10 12L2 9z"></path>
                  <path d="M11 3L8 9l10 12"></path>
                  <path d="M13 3l3 6-10 12"></path>
                  <path d="M2 9h20"></path>
                </svg>
              </div>
            </div>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--card)',
              border: '1px solid var(--b1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'none',
              transition: 'all 0.2s',
              color: 'var(--text-3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--gold-line)'
              e.currentTarget.style.color = 'var(--gold)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--b1)'
              e.currentTarget.style.color = 'var(--text-3)'
            }}
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          {/* Bouton Recharger - Premium Style */}
          {userId && (
            <Link
              href="/credits"
              className="btn-recharge-premium"
              style={{
                fontFamily: 'var(--body)',
                fontSize: '0.78rem',
                fontWeight: 600,
                padding: '0.5rem 1.25rem',
                borderRadius: '2rem',
                background: 'linear-gradient(135deg, #8A6E2A 0%, #C9A84C 50%, #E8C96A 100%)',
                color: 'var(--void)',
                border: 'none',
                cursor: 'none',
                letterSpacing: '0.02em',
                transition: 'all 0.3s',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 15px rgba(138, 110, 42, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(138, 110, 42, 0.35)'
                e.currentTarget.style.filter = 'brightness(1.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none'
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(138, 110, 42, 0.25)'
                e.currentTarget.style.filter = 'none'
              }}
            >
              <span style={{ fontSize: '1.1rem', fontWeight: 400 }}>+</span> Recharger
            </Link>
          )}

          {/* Notifications - Golden Bell Style */}
          {userId && (
            <div className="relative" ref={notifDropdownRef}>
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="notif-btn-premium"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'rgba(201, 168, 76, 0.05)',
                  border: '1px solid rgba(201, 168, 76, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'none',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(201, 168, 76, 0.12)'
                  e.currentTarget.style.borderColor = 'rgba(201, 168, 76, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(201, 168, 76, 0.05)'
                  e.currentTarget.style.borderColor = 'rgba(201, 168, 76, 0.15)'
                }}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="#F5C75D" style={{ filter: 'drop-shadow(0 2px 4px rgba(138, 110, 42, 0.3))' }}>
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                <span style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '8px',
                  height: '8px',
                  background: '#FF4D4F',
                  borderRadius: '50%',
                  border: '2px solid var(--void)',
                  boxShadow: '0 0 0 1px rgba(255, 77, 79, 0.2)'
                }}></span>
              </button>

              {notifDropdownOpen && (
                <div className="notif-dropdown" style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 0.75rem)',
                  width: '300px',
                  background: 'var(--card)',
                  border: '1px solid var(--b1)',
                  borderRadius: 'var(--r-lg)',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                  padding: '0.5rem 0',
                  zIndex: 100,
                  animation: 'fadeIn 0.2s ease'
                }}>
                  <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--b1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)' }}>Notifications</p>
                    <span style={{ fontSize: '0.65rem', color: 'var(--gold)', fontWeight: 500 }}>3 nouvelles</span>
                  </div>
                  {/* ... items ... */}
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {[1, 2, 3].map(i => (
                      <div key={i} style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--b3)', transition: 'background 0.2s' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text)', marginBottom: '0.25rem', lineHeight: 1.4 }}>
                          {i === 1 ? 'Correction IA disponible pour BAC Mathématiques' : i === 2 ? 'Votre compte a été crédité de 50cr' : 'Nouveau sujet disponible en SVT'}
                        </p>
                        <p style={{ fontSize: '0.65rem', color: 'var(--text-4)' }}>Il y a {i*2} heures</p>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: '0.75rem 1.25rem', textAlign: 'center' }}>
                    <Link href="/dashboard/notifications" style={{ fontSize: '0.7rem', color: 'var(--gold)', textDecoration: 'none', fontWeight: 500 }}>Voir tout l'historique</Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Avatar Dropdown - Premium Circle */}
          {userId ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #A8782A 0%, #453517 100%)',
                  border: '1px solid rgba(201, 168, 76, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--display)',
                  fontSize: '1.1rem',
                  fontWeight: 500,
                  color: '#E8C96A',
                  cursor: 'none',
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)'
                  e.currentTarget.style.borderColor = 'rgba(201, 168, 76, 0.6)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none'
                  e.currentTarget.style.borderColor = 'rgba(201, 168, 76, 0.3)'
                }}
              >
                {(appUser?.prenom?.charAt(0) || user?.email?.charAt(0) || 'S').toUpperCase()}
              </button>

              {dropdownOpen && (
                <div className="avatar-dropdown" style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 0.75rem)',
                  width: '220px',
                  background: 'var(--card)',
                  border: '1px solid var(--b1)',
                  borderRadius: 'var(--r-lg)',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                  padding: '0.5rem 0',
                  zIndex: 100,
                  animation: 'fadeIn 0.2s ease'
                }}>
                  <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--b1)' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.15rem' }}>{appUser?.prenom || 'Utilisateur'}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-4)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
                  </div>
                  <Link href="/dashboard/profil" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.25rem', fontSize: '0.85rem', color: 'var(--text-2)', textDecoration: 'none' }}>
                    <span>👤</span> Profil
                  </Link>
                  <Link href="/credits" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.25rem', fontSize: '0.85rem', color: 'var(--text-2)', textDecoration: 'none' }}>
                    <span>💎</span> Mes Crédits
                  </Link>
                  <div style={{ height: '1px', background: 'var(--b1)', margin: '0.5rem 0' }}></div>
                  <button onClick={() => logoutUser()} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.25rem', fontSize: '0.85rem', color: 'var(--ruby)', background: 'none', border: 'none', cursor: 'none', textAlign: 'left' }}>
                    <span>🚪</span> Déconnexion
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link href="/auth/login" style={{ fontSize: '0.75rem', color: 'var(--text-2)', textDecoration: 'none', fontWeight: 500, padding: '0.5rem 1rem' }}>Connexion</Link>
              <Link href="/auth/register" style={{ 
                fontSize: '0.75rem', 
                background: 'linear-gradient(135deg, var(--gold), var(--gold-hi))', 
                color: 'var(--void)', 
                textDecoration: 'none', 
                fontWeight: 600, 
                padding: '0.5rem 1.25rem', 
                borderRadius: 'var(--r)' 
              }}>Inscription</Link>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes gp {
          0%, 100% { box-shadow: 0 0 6px var(--gold-glow); }
          50% { box-shadow: 0 0 18px rgba(201, 168, 76, 0.4); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-blue {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.5); opacity: 0.4; }
        }
      `}</style>
    </nav>
  )
}
