"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  Sun,
  Moon,
  User,
  LogOut,
  RefreshCw,
  Settings,
  FolderOpen,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { UserNotifications } from "./UserNotifications";
import { logoutUser } from "@/actions/auth";
import { ThemeToggleButton } from "./ThemeToggleButton";
import styles from "./LuxuryNavbar.module.css";

interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ size?: number }>;
}

export function LuxuryNavbar() {
  const pathname = usePathname();
  const { userId, appUser } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const centerNavItems: NavItem[] = userId
    ? [
        { label: "Tableau de bord", href: "/dashboard" },
        { label: "Catalogue", href: "/catalogue" },
        { label: "Crédits", href: "/recharge" },
      ]
    : [
        { label: "Accueil", href: "/" },
        { label: "Fonctionnalités", href: "/#features" },
        { label: "Tarifs", href: "/#pricing" },
      ];

  const dropdownNavItems: NavItem[] = userId
    ? [
        { label: "Profil", href: "/profil", icon: User },
        ...(appUser?.role === "ADMIN"
          ? [{ label: "Administration", href: "/admin", icon: Settings }]
          : []),
        ...(appUser?.role === "CONTRIBUTEUR" || appUser?.role === "ADMIN"
          ? [
              {
                label: "Espace Contributeur",
                href: "/contributeur",
                icon: FolderOpen,
              },
            ]
          : []),
      ]
    : [];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    const savedTheme = localStorage.getItem("theme");
    const rootTheme = document.documentElement.getAttribute("data-theme");
    const initialTheme =
      savedTheme === "light" || savedTheme === "dark"
        ? savedTheme
        : rootTheme === "light" || rootTheme === "dark"
          ? rootTheme
          : window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";

    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(initialTheme);

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Force re-render when userId changes
  }, [userId]);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(newTheme);
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
    }
    return pathname === href;
  };

  const showLandingThemeToggle = !userId && pathname === "/";

  return (
    <nav
      className={`${styles.nav} ${scrolled ? styles.navScrolled : styles.navTransparent}`}
    >
      <div className={styles.navInner}>
        {/* LOGO */}
        <Link href="/" className={styles.logo}>
          Mah
          <span className={styles.logoGem}></span>
          AI
        </Link>

        {/* CENTER NAV */}
        <ul className={styles.centerNav}>
          {centerNavItems.map((item) => (
            <li key={item.href} className={styles.navItem}>
              <Link
                href={item.href}
                className={`${styles.navLink} ${isActive(item.href) ? styles.navLinkActive : ""}`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* RIGHT ACTIONS */}
        <div className={styles.rightActions}>
          {/* NOTIFICATIONS */}
          {userId && <UserNotifications />}

          {/* AVATAR & DROPDOWN */}
          {userId ? (
            <div className={styles.dropdown} ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={styles.avatarButton}
                aria-label="Menu utilisateur"
                aria-expanded={dropdownOpen}
              >
                {appUser?.profilePicture ? (
                  <img
                    src={appUser.profilePicture}
                    alt="Avatar"
                    className={styles.avatarImage}
                  />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {(appUser?.prenom?.charAt(0) || "U").toUpperCase()}
                  </div>
                )}
              </button>

              {dropdownOpen && (
                <div className={styles.dropdownMenu}>
                  {/* Credit Balance */}
                  <div className={styles.creditBalance}>
                    <div className={styles.creditBalanceRow}>
                      <span className={styles.creditBalanceLabel}>Solde</span>
                      <span className={styles.creditBalanceValue}>
                        {appUser?.credits ?? 0} cr
                      </span>
                    </div>
                    <Link
                      href="/recharge"
                      className={styles.rechargeButton}
                      onClick={() => setDropdownOpen(false)}
                    >
                      <RefreshCw size={14} />
                      Recharger
                    </Link>
                  </div>

                  {/* Navigation Links */}
                  <div className={styles.dropdownSection}>
                    {dropdownNavItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`${styles.dropdownLink} ${isActive(item.href) ? styles.dropdownLinkActive : ""}`}
                        onClick={() => setDropdownOpen(false)}
                      >
                        {item.icon && <item.icon size={16} />}
                        {item.label}
                      </Link>
                    ))}
                  </div>

                  <div className={styles.dropdownDivider} />

                  {/* Theme & Logout */}
                  <div className={styles.dropdownSection}>
                    <button
                      onClick={toggleTheme}
                      className={styles.dropdownButton}
                    >
                      {theme === "dark" ? (
                        <Sun size={16} />
                      ) : (
                        <Moon size={16} />
                      )}
                      {theme === "dark" ? "Mode Clair" : "Mode Sombre"}
                    </button>
                    <button
                      onClick={() => logoutUser()}
                      className={`${styles.dropdownButton} ${styles.dropdownButtonDanger}`}
                    >
                      <LogOut size={16} /> Déconnexion
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.authLinks}>
              {showLandingThemeToggle ? (
                <ThemeToggleButton variant="navbar" />
              ) : null}
              <Link href="/auth/login" className={styles.authLink}>
                Connexion
              </Link>
              <Link href="/auth/register" className={styles.authLinkPrimary}>
                Inscription
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
