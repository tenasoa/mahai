"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  LayoutDashboard,
  FileText,
  CreditCard,
  Users,
  GraduationCap,
  Feather,
  Sun,
  Moon,
  Wallet,
  Settings,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Newspaper
} from "lucide-react";
import { useAdminTransactionsRealtime } from "@/lib/hooks/useAdminTransactionsRealtime";
import "@/app/dashboard-theme.css";

const navItems = [
  {
    section: "Vue générale",
    links: [
      {
        href: "/admin",
        label: "Dashboard",
        icon: "dashboard",
        badge: null,
        badgeType: null,
      },
    ],
  },
  {
    section: "Contenu",
    links: [
      {
        href: "/admin/sujets",
        label: "Sujets",
        icon: "subjects",
        badge: "sujets",
        badgeType: "ruby",
      },
      {
        href: "/admin/blog",
        label: "Blog",
        icon: "blog",
        badge: null,
        badgeType: null,
      },
    ],
  },
  {
    section: "Finances",
    links: [
      {
        href: "/admin/credits",
        label: "Mobile Banking",
        icon: "credits",
        badge: "credits",
        badgeType: "amber",
      },
      {
        href: "/admin/retraits",
        label: "Retraits Gains",
        icon: "withdrawals",
        badge: null,
        badgeType: null,
      },
    ],
  },
  {
    section: "Utilisateurs",
    links: [
      {
        href: "/admin/utilisateurs",
        label: "Utilisateurs",
        icon: "users",
        badge: null,
        badgeType: null,
      },
      {
        href: "/admin/candidatures",
        label: "Candidatures",
        icon: "applications",
        badge: null,
        badgeType: null,
      },
    ],
  },
  {
    section: "Système",
    links: [
      {
        href: "/admin/configuration",
        label: "Configuration",
        icon: "settings",
        badge: null,
        badgeType: null,
      },
    ],
  },
];

function SidebarIcon({ type, size = 18 }: { type: string; size?: number }) {
  switch (type) {
    case "dashboard":
      return <LayoutDashboard size={size} />;
    case "subjects":
      return <FileText size={size} />;
    case "credits":
      return <CreditCard size={size} />;
    case "blog":
      return <Newspaper size={size} />;
    case "withdrawals":
      return <Wallet size={size} />;
    case "users":
      return <Users size={size} />;
    case "applications":
      return <UserCheck size={size} />;
    case "settings":
      return <Settings size={size} />;
    default:
      return <LayoutDashboard size={size} />;
  }
}

interface AdminSidebarProps {
  user: {
    prenom: string;
    nom: string;
    role: string;
    profilePicture?: string | null;
  };
  initials: string;
}

export function AdminSidebar({ user, initials }: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  // Hook Realtime pour les transactions en attente
  const { pendingCount, resetCount } = useAdminTransactionsRealtime({
    enabled: true,
  });

  // Persistance du sidebar
  useEffect(() => {
    const saved = localStorage.getItem("mahai_admin_sidebar_collapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }
    setIsMounted(true);
  }, []);

  // Fermer le menu mobile au changement de page
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Fermer le menu mobile sur touche Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMobileOpen]);

  // Bloquer le scroll du body quand menu mobile ouvert
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => document.body.style.overflow = "unset";
  }, [isMobileOpen]);

  // Charger le thème depuis localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("admin-theme");
    if (savedTheme) {
      const isDark = savedTheme === "dark";
      setIsDarkMode(isDark);
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = isDarkMode ? "light" : "dark";
    setIsDarkMode(!isDarkMode);
    localStorage.setItem("admin-theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("mahai_admin_sidebar_collapsed", String(newState));
  };

  return (
    <>
      {/* Bouton hamburger flottant pour mobile */}
      <button
        className="admin-mobile-menu-btn"
        onClick={() => setIsMobileOpen(true)}
        aria-label="Ouvrir le menu"
      >
        <Menu size={20} />
      </button>

      {/* Overlay mobile */}
      {isMobileOpen && (
        <div
          className="admin-mobile-overlay"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`admin-sidebar ${isCollapsed ? "collapsed" : ""} ${isMobileOpen ? "mobile-open" : ""}`}
        id="adminSidebar"
      >
        {/* Header du logo avec bouton toggle intégré (style Comet) */}
        <div
          className="sb-logo"
          onClick={isCollapsed && isMounted ? toggleSidebar : undefined}
          suppressHydrationWarning
        >
          <div className="sb-logo-row" suppressHydrationWarning>
            <Link
              href="/"
              className="sb-logo-main"
              onClick={(e) => {
                if (isCollapsed) e.preventDefault();
              }}
              aria-label="Mah.AI"
            >
              {isCollapsed ? (
                <span className="sb-logo-compact">
                  M<span className="sb-gem" />
                </span>
              ) : (
                <>
                  Mah
                  <span className="sb-gem" />
                  AI
                </>
              )}
            </Link>

            {/* Bouton toggle inline (desktop) */}
            {isMounted && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSidebar();
                }}
                className="sb-toggle-inline"
                title={isCollapsed ? "Étendre le menu" : "Réduire le menu"}
                aria-label={isCollapsed ? "Étendre le menu" : "Réduire le menu"}
              >
                {isCollapsed ? (
                  <ChevronRight size={16} />
                ) : (
                  <ChevronLeft size={16} />
                )}
              </button>
            )}
          </div>
          <span className="sb-admin-badge">⚡ Administration</span>

          {/* Bouton fermer mobile */}
          <button
            type="button"
            className="sb-mobile-close"
            onClick={(e) => {
              e.stopPropagation();
              setIsMobileOpen(false);
            }}
            aria-label="Fermer le menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="sb-nav">
          {navItems.map((section) => (
            <div key={section.section} suppressHydrationWarning>
              <div className="sb-section" suppressHydrationWarning>
                {section.section}
              </div>
              {section.links.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/admin" && pathname?.startsWith(link.href));
                const showBadge = link.badge === "credits" && pendingCount > 0;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`sb-link ${isActive ? "active" : ""} ${showBadge ? "has-badge" : ""}`}
                    title={isCollapsed ? link.label : undefined}
                    data-tooltip={link.label}
                    onClick={() => {
                      if (link.href === "/admin/credits") {
                        resetCount();
                      }
                    }}
                  >
                    <SidebarIcon type={link.icon} />
                    <span className="sb-link-text">{link.label}</span>
                    {showBadge ? (
                      <span className="sb-notification-badge">
                        {pendingCount}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          ))}

          {/* Navigation rapide en bas */}
          <div className="sb-quick-nav" suppressHydrationWarning>
            <div className="sb-section" suppressHydrationWarning>
              Navigation rapide
            </div>
            <Link
              href="/dashboard"
              className={`sb-link ${pathname === "/dashboard" ? "active" : ""}`}
              title={isCollapsed ? "Espace Étudiant" : undefined}
              data-tooltip="Espace Étudiant"
            >
              <GraduationCap size={18} />
              <span className="sb-link-text">Espace Étudiant</span>
            </Link>
            <Link
              href="/contributeur"
              className={`sb-link ${pathname.startsWith("/contributeur") ? "active" : ""}`}
              title={isCollapsed ? "Espace Contributeur" : undefined}
              data-tooltip="Espace Contributeur"
            >
              <Feather size={18} />
              <span className="sb-link-text">Espace Contributeur</span>
            </Link>
          </div>
        </nav>

        <div className="sb-footer" suppressHydrationWarning>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="sb-theme-toggle"
            title={
              isDarkMode ? "Passer en mode clair" : "Passer en mode sombre"
            }
            data-tooltip={isDarkMode ? "Mode Clair" : "Mode Sombre"}
            aria-label="Changer le thème"
          >
            {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
            <span className="sb-theme-text">
              {isDarkMode ? "Mode Clair" : "Mode Sombre"}
            </span>
          </button>

          <Link
            href="/dashboard"
            className="sb-user"
            title={isCollapsed ? `${user.prenom} ${user.nom}` : undefined}
            data-tooltip={`${user.prenom} ${user.nom}`}
          >
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={`${user.prenom} ${user.nom}`}
                className="sb-av"
              />
            ) : (
              <div className="sb-av">{initials}</div>
            )}
            <div className="sb-user-info">
              <div className="sb-user-name">
                {user.prenom} {user.nom}
              </div>
              <div className="sb-user-role">Super Admin</div>
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}
