"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import styles from "./ThemeToggleButton.module.css";

type ThemeMode = "light" | "dark";
type ThemeToggleVariant = "navbar" | "floating";

function resolveTheme(): ThemeMode {
  if (typeof document !== "undefined") {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    if (currentTheme === "light" || currentTheme === "dark") {
      return currentTheme;
    }
  }

  if (typeof window !== "undefined") {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }

    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
  }

  return "light";
}

function applyTheme(newTheme: ThemeMode) {
  localStorage.setItem("theme", newTheme);
  document.documentElement.setAttribute("data-theme", newTheme);
  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(newTheme);
}

export function ThemeToggleButton({
  variant = "navbar",
}: {
  variant?: ThemeToggleVariant;
}) {
  const [theme, setTheme] = useState<ThemeMode>("light");

  useEffect(() => {
    const currentTheme = resolveTheme();
    setTheme(currentTheme);
    applyTheme(currentTheme);
  }, []);

  const handleToggle = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  const isDarkMode = theme === "dark";
  const title = isDarkMode ? "Activer le mode clair" : "Activer le mode sombre";
  const label = isDarkMode ? "Mode clair" : "Mode sombre";

  return (
    <button
      type="button"
      className={`${styles.button} ${styles[variant]}`}
      onClick={handleToggle}
      aria-label={title}
      aria-pressed={isDarkMode}
      title={title}
      data-theme-toggle={variant}
    >
      <span className={styles.content}>
        <span className={styles.iconWrap} aria-hidden="true">
          {isDarkMode ? (
            <Sun size={16} className={styles.iconSun} />
          ) : (
            <Moon size={16} className={styles.iconMoon} />
          )}
        </span>
        <span className={styles.label}>{label}</span>
      </span>
    </button>
  );
}
