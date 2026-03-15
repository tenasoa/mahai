"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { Bell, Diamond, Sun, Moon } from "lucide-react"
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
      background: scrolled ? 'var(--card)/95' : 'var(--depth)/95',
      borderBottom: '1px solid var(--b1)',
      backdropFilter: 'blur(20px)',
      transition: 'all 0.4s'
    }}>
      <div className="nav-inner" style={{
        maxWidth: '1400px',
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
          gap: '0.75rem',
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
                  padding: '0.4rem 0.9rem',
                  borderRadius: 'var(--r)',
                  border: isActive(item.href) ? '1px solid var(--gold-line)' : '1px solid transparent',
                  background: isActive(item.href) ? 'var(--gold-dim)' : 'transparent',
                  transition: 'all 0.2s',
                  cursor: 'none'
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

        {/* ═══════ DROITE : Groupe d'icônes ═══════ */}
        <div className="nav-right" style={{
          display: 'flex',
          alignItems: 'center',
          gap: userId ? '1rem' : '1.5rem',
          marginLeft: 'auto'
        }}>
          
          {/* Menu simplifié si non connecté */}
          {!userId && (
            <>
              <Link
                href="/auth/login"
                style={{
                  fontFamily: 'var(--body)',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--r)',
                  border: '1px solid var(--b1)',
                  background: 'transparent',
                  color: 'var(--text-2)',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  cursor: 'none',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--gold-line)'
                  e.currentTarget.style.color = 'var(--text)'
                  e.currentTarget.style.background = 'var(--surface)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--b1)'
                  e.currentTarget.style.color = 'var(--text-2)'
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                Connexion
              </Link>
              <Link
                href="/auth/register"
                style={{
                  fontFamily: 'var(--body)',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  padding: '0.5rem 1.25rem',
                  borderRadius: 'var(--r)',
                  background: 'linear-gradient(135deg, var(--gold), var(--gold-hi))',
                  color: 'var(--void)',
                  border: 'none',
                  textDecoration: 'none',
                  letterSpacing: '0.04em',
                  transition: 'all 0.2s',
                  cursor: 'none',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 12px rgba(168,134,58,0.22)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(168,134,58,0.35)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 2px 12px rgba(168,134,58,0.22)'
                }}
              >
                S'inscrire
              </Link>
            </>
          )}

          {/* Crédits Display (seulement si connecté) */}
          {userId && (
            <div className="credits-display" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.25rem 0.5rem'
            }}>
              <span style={{
                fontFamily: 'var(--display)',
                fontSize: '1.25rem',
                fontWeight: 500,
                color: 'var(--text)',
                letterSpacing: '-.02em'
              }}>
                {appUser?.credits ?? 0}
              </span>
              <span style={{
                fontFamily: 'var(--mono)',
                fontSize: '0.6rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--gold)'
              }}>
                CR
              </span>
              <Diamond className="w-4 h-4" style={{
                width: '16px',
                height: '16px',
                color: '#4A8BC9',
                fill: 'rgba(74,139,201,0.2)'
              }} />
            </div>
          )}

          {/* Toggle Thème */}
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'var(--card)',
              border: '1px solid var(--b1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'none',
              transition: 'all 0.2s',
              color: 'var(--gold)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--gold-line)'
              e.currentTarget.style.background = 'var(--gold-dim)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--b1)'
              e.currentTarget.style.background = 'var(--card)'
            }}
          >
            {theme === 'dark' ? (
              <Sun size={16} style={{ color: 'var(--gold)' }} />
            ) : (
              <Moon size={16} style={{ color: 'var(--gold)' }} />
            )}
          </button>

          {/* Bouton Recharger */}
          {userId && (
            <Link
              href="/credits"
              className="btn-recharge"
              style={{
                fontFamily: 'var(--body)',
                fontSize: '0.76rem',
                fontWeight: 500,
                padding: '0.4rem 0.9rem',
                borderRadius: 'var(--r)',
                background: 'linear-gradient(135deg, var(--gold), var(--gold-hi))',
                color: 'var(--void)',
                border: 'none',
                cursor: 'none',
                letterSpacing: '0.04em',
                transition: 'all 0.2s',
                textDecoration: 'none',
                whiteSpace: 'nowrap'
              }}
            >
              + Recharger
            </Link>
          )}

          {/* Notifications */}
          {userId && (
            <div className="relative" ref={notifDropdownRef}>
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="notif-btn"
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'var(--card)',
                  border: '1px solid var(--b1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'none',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--gold-line)'
                  e.currentTarget.style.background = 'var(--gold-dim)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--b1)'
                  e.currentTarget.style.background = 'var(--card)'
                }}
              >
                <Bell size={16} style={{ color: 'var(--gold)' }} />
                <span style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  width: '7px',
                  height: '7px',
                  background: 'var(--ruby)',
                  borderRadius: '50%',
                  border: '1px solid var(--depth)'
                }}></span>
              </button>

              {notifDropdownOpen && (
                <div className="notif-dropdown" style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 0.5rem)',
                  width: '280px',
                  background: 'var(--card)',
                  border: '1px solid var(--b1)',
                  borderRadius: 'var(--r-lg)',
                  boxShadow: 'var(--glow-md)',
                  padding: '0.5rem 0',
                  zIndex: 100,
                  animation: 'fadeIn 0.2s ease'
                }}>
                  <div style={{
                    padding: '0.5rem 1rem',
                    borderBottom: '1px solid var(--b1)',
                    marginBottom: '0.5rem'
                  }}>
                    <p style={{
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      color: 'var(--text)'
                    }}>Notifications</p>
                  </div>
                  <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                    <div style={{
                      padding: '0.75rem 1rem',
                      borderBottom: '1px solid var(--b3)',
                      cursor: 'none'
                    }}>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text)', marginBottom: '0.2rem' }}>
                        3 nouvelles corrections IA disponibles
                      </p>
                      <p style={{ fontSize: '0.65rem', color: 'var(--text-4)' }}>Il y a 2 heures</p>
                    </div>
                    <div style={{
                      padding: '0.75rem 1rem',
                      borderBottom: '1px solid var(--b3)',
                      cursor: 'none'
                    }}>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text)', marginBottom: '0.2rem' }}>
                        Nouveau sujet ajouté : Mathématiques BAC 2024
                      </p>
                      <p style={{ fontSize: '0.65rem', color: 'var(--text-4)' }}>Il y a 5 heures</p>
                    </div>
                    <div style={{
                      padding: '0.75rem 1rem',
                      cursor: 'none'
                    }}>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text)', marginBottom: '0.2rem' }}>
                        Recharge de 150 crédits effectuée
                      </p>
                      <p style={{ fontSize: '0.65rem', color: 'var(--text-4)' }}>Il y a 1 jour</p>
                    </div>
                  </div>
                  <div style={{
                    padding: '0.5rem 1rem',
                    borderTop: '1px solid var(--b1)',
                    marginTop: '0.5rem'
                  }}>
                    <Link href="/dashboard/notifications" style={{
                      fontSize: '0.65rem',
                      color: 'var(--gold)',
                      textDecoration: 'none',
                      fontFamily: 'var(--mono)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em'
                    }}>
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
                className="avatar-btn"
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--gold-lo), var(--gold-dim))',
                  border: '1px solid var(--gold-line)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--display)',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: 'var(--gold)',
                  cursor: 'none',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 8px rgba(168,134,58,0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)'
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(168,134,58,0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(168,134,58,0.2)'
                }}
              >
                {(appUser?.prenom?.charAt(0) || user?.email?.charAt(0) || 'S').toUpperCase()}
              </button>

              {dropdownOpen && (
                <div className="avatar-dropdown" style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 0.5rem)',
                  width: '180px',
                  background: 'var(--card)',
                  border: '1px solid var(--b1)',
                  borderRadius: 'var(--r-lg)',
                  boxShadow: 'var(--glow-md)',
                  padding: '0.5rem 0',
                  zIndex: 100,
                  animation: 'fadeIn 0.2s ease'
                }}>
                  <div style={{
                    padding: '0.5rem 1rem',
                    borderBottom: '1px solid var(--b1)',
                    marginBottom: '0.5rem'
                  }}>
                    <p style={{
                      fontSize: '0.6rem',
                      fontFamily: 'var(--mono)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: 'var(--text-3)',
                      marginBottom: '0.2rem'
                    }}>Mon Compte</p>
                    <p style={{
                      fontSize: '0.8rem',
                      fontWeight: 500,
                      color: 'var(--text)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>{appUser?.prenom || user?.email?.split('@')[0]}</p>
                    <p style={{
                      fontSize: '0.65rem',
                      color: 'var(--text-4)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>{user?.email}</p>
                  </div>

                  <Link 
                    href="/dashboard/profil" 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 1rem',
                      fontSize: '0.8rem',
                      color: 'var(--text-2)',
                      textDecoration: 'none',
                      transition: 'all 0.2s',
                      cursor: 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--text)'
                      e.currentTarget.style.background = 'var(--surface)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-2)'
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                    Profil
                  </Link>

                  <div style={{
                    height: '1px',
                    background: 'var(--b1)',
                    margin: '0.5rem 0'
                  }}></div>

                  <button
                    onClick={() => logoutUser()}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 1rem',
                      fontSize: '0.8rem',
                      color: 'var(--ruby)',
                      background: 'none',
                      border: 'none',
                      cursor: 'none',
                      transition: 'all 0.2s',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--ruby-dim)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                      <polyline points="16,17 21,12 16,7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      <style jsx global>{`
        @keyframes gp {
          0%, 100% { box-shadow: 0 0 6px var(--gold-glow); }
          50% { box-shadow: 0 0 18px rgba(201,168,76,0.4); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </nav>
  )
}
