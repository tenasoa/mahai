"use client";

import { useEffect, useRef, useState } from "react";

export function LuxuryCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  // Coordonnées cibles (souris)
  const mousePos = useRef({ x: 0, y: 0 });
  // Coordonnées actuelles du cercle (pour l'effet retard)
  const ringPos = useRef({ x: 0, y: 0 });
  // Timestamp de la dernière interaction
  const lastInteraction = useRef(0);
  // Référence pour la boucle d'animation
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Ne pas activer sur mobile ou tablette tactile
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const isSmallScreen = window.innerWidth < 1024;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const appReducedMotion =
      document.documentElement.getAttribute("data-reduced-motion") === "true";

    if (isTouch || isSmallScreen || prefersReducedMotion || appReducedMotion) {
      setIsVisible(false);
      document.documentElement.removeAttribute("data-custom-cursor");
      return;
    }

    setIsVisible(true);
    document.documentElement.setAttribute("data-custom-cursor", "true");

    // Check theme initial
    const checkTheme = () => {
      const isDarkTheme =
        document.documentElement.getAttribute("data-theme") === "dark";
      setIsDark(isDarkTheme);
    };
    checkTheme();

    // Observer les changements de thème
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class"],
    });

    // Initialiser la position au centre de l'écran
    const startX = window.innerWidth / 2;
    const startY = window.innerHeight / 2;
    mousePos.current = { x: startX, y: startY };
    ringPos.current = { x: startX, y: startY };
    lastInteraction.current = Date.now();

    // Initialiser la position du curseur au centre
    if (cursorRef.current) {
      cursorRef.current.style.left = `${startX}px`;
      cursorRef.current.style.top = `${startY}px`;
    }
    if (ringRef.current) {
      ringRef.current.style.left = `${startX}px`;
      ringRef.current.style.top = `${startY}px`;
    }

    const updateMousePos = (e: MouseEvent) => {
      const now = Date.now();
      mousePos.current = { x: e.clientX, y: e.clientY };
      lastInteraction.current = now;

      // Le point (curseur principal) suit instantanément
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
      }

      if (animationFrameRef.current === null) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Détection plus robuste des éléments interactifs
      const isClickable =
        target.tagName.toLowerCase() === "a" ||
        target.tagName.toLowerCase() === "button" ||
        target.closest("a") !== null ||
        target.closest("button") !== null ||
        target.classList.contains("cursor-pointer") ||
        window.getComputedStyle(target).cursor === "pointer";

      setIsHovering(isClickable);
    };

    // Animation loop pour l'effet élastique du cercle
    const animate = () => {
      const now = Date.now();

      // Arrêter l'animation si la souris n'a pas bougé depuis 2 secondes
      // pour économiser la batterie et les ressources CPU
      if (now - lastInteraction.current > 2000) {
        animationFrameRef.current = null;
        return;
      }

      // Interpolation linéaire (LERP) : 0.20 pour plus de réactivité
      const lerpFactor = 0.2;
      ringPos.current.x +=
        (mousePos.current.x - ringPos.current.x) * lerpFactor;
      ringPos.current.y +=
        (mousePos.current.y - ringPos.current.y) * lerpFactor;

      if (ringRef.current) {
        ringRef.current.style.left = `${ringPos.current.x}px`;
        ringRef.current.style.top = `${ringPos.current.y}px`;
      }

      // Continuer la boucle
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Démarrer l'animation
    animationFrameRef.current = requestAnimationFrame(animate);

    window.addEventListener("mousemove", updateMousePos);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      observer.disconnect();
      document.documentElement.removeAttribute("data-custom-cursor");
      window.removeEventListener("mousemove", updateMousePos);
      window.removeEventListener("mouseover", handleMouseOver);
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      <div
        ref={cursorRef}
        className="cursor"
        style={{
          width: isHovering ? "14px" : "8px",
          height: isHovering ? "14px" : "8px",
          opacity: 1,
          display: "block",
          zIndex: 99999,
          background: "var(--gold-lo)",
          borderRadius: "50%",
          mixBlendMode: isDark ? "screen" : "multiply",
          transform: "translate(-50%, -50%)",
          transition: "width 0.2s, height 0.2s",
          pointerEvents: "none",
          position: "fixed",
          boxShadow: isDark
            ? "0 0 8px var(--gold-glow)"
            : "0 0 8px rgba(168,120,42,0.4)",
        }}
      />
      <div
        ref={ringRef}
        className="cursor-ring"
        style={{
          width: isHovering ? "52px" : "36px",
          height: isHovering ? "52px" : "36px",
          display: "block",
          zIndex: 99998,
          border: "1px solid var(--gold-lo)",
          borderRadius: "50%",
          transform: "translate(-50%, -50%)",
          transition: "width 0.35s, height 0.35s",
          pointerEvents: "none",
          position: "fixed",
          opacity: isDark ? 0.5 : 0.6,
        }}
      />
    </>
  );
}
