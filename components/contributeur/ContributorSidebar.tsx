"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Wallet,
  BarChart3,
  GraduationCap,
  ShieldCheck,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  Sun,
  Moon,
} from "lucide-react";

interface ContributorSidebarProps {
  user: {
    prenom: string;
    nom: string;
    role: string;
    profilePicture?: string | null;
  };
  stats?: {
    earnings: number;
    monthEarnings: number;
    totalSubjects: number;
  };
  isCollapsed: boolean;
  onToggle: () => void;
  isMobileOpen?: boolean;
  onMobileOpen?: () => void;
  onMobileClose?: () => void;
}

export function ContributorSidebar({
  user,
  stats,
  isCollapsed,
  onToggle,
  isMobileOpen = false,
  onMobileOpen,
  onMobileClose,
}: ContributorSidebarProps) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const savedTheme =
      (localStorage.getItem("mahai_theme") as "light" | "dark") || "dark";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  // Fermer au touche Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileOpen) onMobileClose?.();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMobileOpen, onMobileClose]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("mahai_theme", newTheme);
  };

  const navItems = [
    {
      section: "Tableau de bord",
      links: [
        {
          href: "/contributeur",
          label: "Vue d'ensemble",
          icon: LayoutDashboard,
        },
        {
          href: "/contributeur/sujets",
          label: "Mes sujets",
          icon: FileText,
          badge: stats?.totalSubjects,
        },
        {
          href: "/contributeur/sujets/nouveau",
          label: "Nouveau sujet",
          icon: PlusCircle,
        },
      ],
    },
    {
      section: "Finances",
      links: [
        {
          href: "/contributeur/retraits",
          label: "Retraits Gains",
          icon: Wallet,
        },
        {
          href: "/contributeur/analytiques",
          label: "Analytiques",
          icon: BarChart3,
        },
      ],
    },
  ];

  return (
    <>
      {/* Bouton hamburger flottant (mobile) */}
      <button
        className="contrib-mobile-menu-btn"
        onClick={onMobileOpen}
        aria-label="Ouvrir le menu"
      >
        <Menu size={20} />
      </button>

      {/* Overlay mobile */}
      {isMobileOpen && (
        <div
          className="contrib-mobile-overlay"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`sidebar ${isCollapsed ? "collapsed" : ""} ${isMobileOpen ? "mobile-open" : ""}`}
        id="sidebar"
      >
        {/* Header logo style Comet (bouton toggle intégré) */}
        <div
          className="sb-logo"
          onClick={isCollapsed ? onToggle : undefined}
        >
          <div className="sb-logo-row">
            <Link
              href="/"
              className="sb-logo-main"
              onClick={(e) => { if (isCollapsed) e.preventDefault() }}
              aria-label="Mah.AI"
            >
              {isCollapsed ? (
                <span className="sb-logo-compact">M<span className="sb-gem" /></span>
              ) : (
                <span className="sb-logo-text">
                  Mah
                  <span className="sb-gem" />
                  AI
                </span>
              )}
            </Link>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onToggle() }}
              className="sb-toggle-inline"
              title={isCollapsed ? "Déployer le menu" : "Réduire le menu"}
              aria-label={isCollapsed ? "Déployer le menu" : "Réduire le menu"}
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>

          {/* Bouton fermer (mobile uniquement) */}
          <button
            type="button"
            className="sb-mobile-close"
            onClick={(e) => { e.stopPropagation(); onMobileClose?.() }}
            aria-label="Fermer le menu"
          >
            <X size={18} />
          </button>
        </div>

        {stats && (
          <div className="sb-earnings">
            <div className="sb-e-label">Revenus totaux</div>
            <div className="sb-e-val">
              {stats.earnings.toLocaleString("fr-FR")}
              <span className="sb-e-unit">Ar</span>
            </div>
            <div className="sb-e-sub">
              +{stats.monthEarnings.toLocaleString("fr-FR")} Ar ce mois
            </div>
          </div>
        )}

        <nav className="sb-nav">
          {navItems.map((section, idx) => (
            <div key={idx}>
              <div className="sb-section">
                <span className="sb-section-text">{section.section}</span>
              </div>
              {section.links.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/contributeur" &&
                    pathname?.startsWith(link.href));
                const Icon = link.icon;

                return (
                  <Link
                    key={link.href}
                    className={`sb-link ${isActive ? "active" : ""}`}
                    href={link.href}
                    title={isCollapsed ? link.label : undefined}
                    data-tooltip={link.label}
                  >
                    <Icon size={18} strokeWidth={1.5} className="sb-icon" />
                    <span className="sb-link-text">{link.label}</span>
                    {link.badge !== undefined && (
                      <span className="sb-nb">{link.badge}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}

          {/* Navigation rapide en bas (harmonisé avec admin) */}
          <div className="sb-quick-nav">
            <div className="sb-section">
              <span className="sb-section-text">Navigation rapide</span>
            </div>
            <Link
              className={`sb-link ${pathname === '/dashboard' ? 'active' : ''}`}
              href="/dashboard"
              title={isCollapsed ? 'Espace Étudiant' : undefined}
              data-tooltip="Espace Étudiant"
            >
              <GraduationCap size={18} strokeWidth={1.5} className="sb-icon" />
              <span className="sb-link-text">Espace Étudiant</span>
            </Link>
            {user.role?.toLowerCase() === 'admin' && (
              <Link
                className={`sb-link ${pathname.startsWith('/admin') ? 'active' : ''}`}
                href="/admin"
                title={isCollapsed ? 'Panel Admin' : undefined}
                data-tooltip="Panel Admin"
              >
                <ShieldCheck size={18} strokeWidth={1.5} className="sb-icon" />
                <span className="sb-link-text">Panel Admin</span>
              </Link>
            )}
          </div>
        </nav>

        {/* Footer : theme toggle compact + profil utilisateur */}
        <div className="sb-footer">
          <button
            onClick={toggleTheme}
            className="sb-theme-toggle"
            title={`Passer en mode ${theme === "dark" ? "clair" : "sombre"}`}
            data-tooltip={`Mode ${theme === "dark" ? "clair" : "sombre"}`}
            aria-label={`Passer en mode ${theme === "dark" ? "clair" : "sombre"}`}
          >
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            <span className="sb-theme-text">
              Mode {theme === "dark" ? "clair" : "sombre"}
            </span>
          </button>

          <Link
            href="/dashboard"
            className="sb-user"
            title={isCollapsed ? `${user.prenom} ${user.nom}` : undefined}
            data-tooltip={`${user.prenom} ${user.nom}`}
          >
            {user.profilePicture ? (
              <img src={user.profilePicture} alt={`${user.prenom} ${user.nom}`} className="sb-av" />
            ) : (
              <div className="sb-av">{(user.prenom?.charAt(0) || "C").toUpperCase()}</div>
            )}
            <div className="sb-user-info">
              <div className="sb-user-name">{user.prenom} {user.nom}</div>
              <div className="sb-user-role">Contributeur certifié ✦</div>
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}
