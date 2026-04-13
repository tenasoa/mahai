"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  CreditCard,
  BarChart3,
  User,
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
}

export function ContributorSidebar({
  user,
  stats,
  isCollapsed,
  onToggle,
}: ContributorSidebarProps) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const savedTheme =
      (localStorage.getItem("mahai_theme") as "light" | "dark") || "dark";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

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
          href: "/contributeur/nouveau",
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
          icon: CreditCard,
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
      <aside
        className={`sidebar ${isCollapsed ? "collapsed" : ""}`}
        id="sidebar"
      >
        <Link href="/" className="sb-logo">
          <span className="sb-logo-text">
            Mah
            <span className="sb-gem" />
            AI
          </span>
        </Link>

        <div className="sb-user">
          <div className="sb-avatar">
            {user.profilePicture ? (
              <img src={user.profilePicture} alt="Profile" />
            ) : (
              (user.prenom?.charAt(0) || "C").toUpperCase()
            )}
          </div>
          <div>
            <div className="sb-name">
              {user.prenom} {user.nom}
            </div>
            <div className="sb-badge">Contributeur certifié ✦</div>
          </div>
        </div>

        {stats && (
          <div className="sb-earnings">
            <div className="sb-e-label">Revenus totaux</div>
            <div className="sb-e-val">
              {stats.earnings.toLocaleString("fr-FR")}
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.7rem",
                  color: "var(--gold-lo)",
                }}
              >
                {" "}
                Ar
              </span>
            </div>
            <div className="sb-e-sub">
              +{stats.monthEarnings.toLocaleString("fr-FR")} Ar ce mois
            </div>
          </div>
        )}

        <nav className="sb-nav">
          <div style={{ marginTop: '0.75rem', marginBottom: '1.5rem' }}>
              <div className="sb-section"><span className="sb-section-text">Navigation rapide</span></div>
              <Link className={`sb-link ${pathname === '/dashboard' ? 'active' : ''}`} href="/dashboard" title="Espace Étudiant">
                <User size={18} strokeWidth={1.5} className="sb-icon" />
                <span className="sb-link-text">Espace Étudiant</span>
              </Link>
              {user.role?.toLowerCase() === 'admin' && (
                <Link className={`sb-link ${pathname.startsWith('/admin') ? 'active' : ''}`} href="/admin" title="Panel Admin">
                  <LayoutDashboard size={18} strokeWidth={1.5} className="sb-icon" />
                  <span className="sb-link-text">Panel Admin</span>
                </Link>
              )}
          </div>

          {navItems.map((section, idx) => (
            <div key={idx}>
              <div
                className="sb-section"
                style={{ marginTop: idx > 0 ? "0.75rem" : 0 }}
              >
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
                    title={link.label}
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
        </nav>

        {/* Theme Toggle Button */}
        <div className="sb-bottom">
          <button
            onClick={toggleTheme}
            className="sb-theme-toggle"
            title={`Passer en mode ${theme === "dark" ? "clair" : "sombre"}`}
            aria-label={`Passer en mode ${theme === "dark" ? "clair" : "sombre"}`}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            {!isCollapsed && (
              <span className="sb-theme-text">
                Mode {theme === "dark" ? "clair" : "sombre"}
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* Toggle Button - Outside Sidebar */}
      <button
        className="sidebar-toggle"
        onClick={onToggle}
        title={isCollapsed ? "Déployer le menu" : "Réduire le menu"}
        aria-label={isCollapsed ? "Déployer le menu" : "Réduire le menu"}
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </>
  );
}
