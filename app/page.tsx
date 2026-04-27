"use client";

import { useEffect, useRef, useState, lazy, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useMultiReveal } from "@/lib/hooks";
import { useTilt } from "@/lib/hooks/useTilt";
import { LuxuryFooter } from "@/components/layout/LuxuryFooter";
import { MOBILE_MONEY_PROVIDERS } from "@/data/mobile-money-providers";
import { CountUp } from "@/components/landing/CountUp";
import { AiDemoInteractive } from "@/components/landing/AiDemoInteractive";
import "./landing.css";

// Lazy-load sections lourdes (testimonials charge depuis l'API)
const TestimonialsSection = lazy(() =>
  import("@/components/landing/TestimonialsSection").then((m) => ({
    default: m.TestimonialsSection,
  }))
);

type LandingStats = {
  subjects: number;
  matieres: number;
  yearMin: number | null;
  yearMax: number | null;
  yearSpan: number | null;
  users: number;
  aiCorrections: number;
  contributors: number;
};

type LandingPack = {
  id: string;
  name: string;
  credits: number;
  price: number;
  bonus: number;
  popular: boolean;
};

type PopularSubject = {
  id: string;
  title: string;
  type: string;
  matiere: string;
  annee: string | null;
  credits: number;
  badge: string | null;
  glyph: string;
  rating: number;
  reviewsCount: number;
  pages: number | null;
  hasCorrectionIa: boolean;
  sales: number;
};

const BADGE_LABEL: Record<string, string> = {
  GOLD: "Premium",
  AI: "✦ IA",
  FREE: "Gratuit",
  INTER: "Interactif",
};
const BADGE_CLASS: Record<string, string> = {
  GOLD: "gold",
  AI: "ai",
  FREE: "free",
  INTER: "ai",
};

const formatNumber = (n: number) => n.toLocaleString("fr-FR").replace(/\u202F/g, " ");

const FALLBACK_STATS: LandingStats = {
  subjects: 0,
  matieres: 0,
  yearMin: null,
  yearMax: null,
  yearSpan: null,
  users: 0,
  aiCorrections: 0,
  contributors: 0,
};

function FaqItem({
  question,
  answer,
  delay = 0,
}: {
  question: string;
  answer: string;
  delay?: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = itemRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={itemRef}
      className={`faq-item ${isOpen ? "is-open" : ""} reveal${isVisible ? " visible" : ""}`}
      style={{ transitionDelay: `${delay * 80}ms` }}
    >
      <button
        className="faq-question"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${delay}`}
      >
        <span>{question}</span>
        <span className="faq-icon" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M7 1v12M1 7h12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </button>
      <div
        id={`faq-answer-${delay}`}
        className="faq-answer"
        aria-hidden={!isOpen}
      >
        <div className="faq-answer-inner">{answer}</div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const heroAmbientRef = useRef<HTMLDivElement>(null);
  const aiPanelRef = useRef<HTMLDivElement>(null);
  const heroSectionRef = useRef<HTMLElement>(null);
  const [showStickyCta, setShowStickyCta] = useState(false);
  const [stats, setStats] = useState<LandingStats>(FALLBACK_STATS);
  const [packs, setPacks] = useState<LandingPack[]>([]);
  const [popular, setPopular] = useState<PopularSubject[]>([]);

  // Set page title
  useEffect(() => {
    document.title = "Mah.AI — Accueil";
  }, []);

  // Charger les stats réelles + packs de crédits actifs
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [statsRes, packsRes, popularRes] = await Promise.all([
          fetch("/api/landing/stats", { cache: "no-store" }),
          fetch("/api/config/credit-packs", { cache: "no-store" }),
          fetch("/api/landing/popular", { cache: "no-store" }),
        ]);
        if (!cancelled && statsRes.ok) {
          const data = (await statsRes.json()) as LandingStats;
          setStats({ ...FALLBACK_STATS, ...data });
        }
        if (!cancelled && packsRes.ok) {
          const data = (await packsRes.json()) as { packs?: LandingPack[] };
          if (Array.isArray(data.packs)) setPacks(data.packs);
        }
        if (!cancelled && popularRes.ok) {
          const data = (await popularRes.json()) as { subjects?: PopularSubject[] };
          if (Array.isArray(data.subjects)) setPopular(data.subjects);
        }
      } catch (err) {
        console.error("Landing fetch error:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const yearRangeLabel =
    stats.yearMin && stats.yearMax
      ? `${stats.yearMin} — ${stats.yearMax}`
      : "Archives officielles";
  const archivesTitle =
    stats.yearMin && stats.yearMax
      ? `Archives ${stats.yearMin}–${stats.yearMax}`
      : "Archives officielles";
  const archivesDesc =
    stats.yearSpan && stats.yearSpan > 0
      ? `${stats.yearSpan} années d'examens officiels soigneusement numérisés, vérifiés et indexés pour une recherche précise.`
      : "Examens officiels soigneusement numérisés, vérifiés et indexés pour une recherche précise.";

  // Tri : Gratuit (credits=0) → Standard (popular) → Premium (autres)
  const sortedPacks = [...packs].sort((a, b) => a.credits - b.credits);
  const freePack = sortedPacks.find((p) => p.credits === 0) ?? null;
  const paidPacks = sortedPacks.filter((p) => p.credits > 0);
  const standardPack = paidPacks.find((p) => p.popular) ?? paidPacks[0] ?? null;
  const premiumPack =
    paidPacks.find((p) => p !== standardPack && p.credits > (standardPack?.credits ?? 0)) ??
    paidPacks[paidPacks.length - 1] ??
    null;

  // Pause orb animations when hero is off-screen (battery/CPU saving)
  useEffect(() => {
    const el = heroAmbientRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        el.classList.toggle("orbs-paused", !entry.isIntersecting);
      },
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Déclenche l'animation séquentielle du panel IA dès qu'il entre dans
  // le viewport (une seule fois). Respecte prefers-reduced-motion via CSS.
  useEffect(() => {
    const el = aiPanelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-playing");
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Sticky CTA mobile : visible après avoir scrollé au-delà du hero
  // (le CTA principal du hero est encore visible pour les premiers écrans).
  useEffect(() => {
    const el = heroSectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyCta(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "-60% 0px 0px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Reveal on scroll
  useMultiReveal(".reveal", {
    threshold: 0.1,
    rootMargin: "0px 0px -40px 0px",
  });

  // Effet tilt 3D au survol (désactivé en touch + reduced-motion)
  useTilt(".paper-card", { max: 5, scale: 1.015 }, [popular.length]);
  useTilt(".audience-card", { max: 4, scale: 1.01 });

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* ═══════ HERO ═══════ */}
      <section className="hero" ref={heroSectionRef}>
        <div ref={heroAmbientRef} className="hero-ambient">
          <div className="ambient-orb orb-1"></div>
          <div className="ambient-orb orb-2"></div>
          <div className="ambient-orb orb-3"></div>
          <div className="hero-grid"></div>
        </div>

        <div className="hero-inner">
          {/* Left */}
          <div className="hero-left">
            <div className="hero-label">
              <div className="hero-label-line"></div>
              Plateforme éducative · Madagascar
            </div>
            <h1 className="hero-title">
              <span>L'excellence</span>
              <span>
                <em>académique</em>
              </span>
              <span>à portée de main</span>
            </h1>
            <p className="hero-sub">
              Accédez à des milliers de sujets d'examens officiels — BAC, BEPC,
              CEPE — avec correction par intelligence artificielle. Payez via
              Mobile Money (MVola, Orange Money, Airtel Money), étudiez
              intelligemment.
            </p>
            <div className="hero-actions">
              <Link href="/catalogue?guest=true" className="btn-primary">
                Parcourir le catalogue
                <svg viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link href="/auth/register" className="btn-secondary">
                Créer un compte · 10 crédits offerts
              </Link>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <div className="num">
                  {stats.subjects > 0 ? (
                    <CountUp end={stats.subjects} />
                  ) : (
                    "—"
                  )}
                </div>
                <div className="lbl">Sujets</div>
              </div>
              <div className="hero-stat">
                <div className="num">
                  {stats.matieres > 0 ? (
                    <CountUp end={stats.matieres} />
                  ) : (
                    "—"
                  )}
                </div>
                <div className="lbl">Matières</div>
              </div>
              <div className="hero-stat">
                <div className="num">
                  {stats.yearSpan && stats.yearSpan > 0 ? (
                    <>
                      <CountUp end={stats.yearSpan} /> ans
                    </>
                  ) : (
                    "—"
                  )}
                </div>
                <div className="lbl">{yearRangeLabel}</div>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="hero-visual">
            <div className="hero-card-stack">
              {/* Back cards */}
              <div className="paper-float paper-float-3">
                <div className="pf-header">
                  <div className="pf-exam">BAC</div>
                  <div className="pf-price">20 cr</div>
                </div>
                <div className="pf-title">Physique-Chimie</div>
                <div className="pf-lines">
                  <div className="pf-line"></div>
                  <div className="pf-line med"></div>
                </div>
              </div>
              <div className="paper-float paper-float-2">
                <div className="pf-header">
                  <div className="pf-exam">BEPC</div>
                  <div className="pf-price">10 cr</div>
                </div>
                <div className="pf-title">Mathématiques</div>
                <div className="pf-lines">
                  <div className="pf-line"></div>
                  <div className="pf-line short"></div>
                </div>
              </div>

              {/* Main card */}
              <div className="paper-float paper-float-1">
                <div className="pf-header">
                  <div className="pf-exam">BAC 2024</div>
                  <div className="pf-price">15 cr</div>
                </div>
                <div className="pf-title">
                  Mathématiques — Algèbre & Fonctions
                </div>
                <div className="pf-sub">18 pages · 3h · Difficile</div>
                <div className="pf-lines">
                  <div className="pf-line"></div>
                  <div className="pf-line med"></div>
                  <div className="pf-line short"></div>
                  <div className="pf-line gold"></div>
                </div>
                <div className="pf-footer">
                  <div className="pf-stars">
                    <svg className="star" viewBox="0 0 24 24">
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                    </svg>
                    <svg className="star" viewBox="0 0 24 24">
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                    </svg>
                    <svg className="star" viewBox="0 0 24 24">
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                    </svg>
                    <svg className="star" viewBox="0 0 24 24">
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                    </svg>
                    <svg className="star dim" viewBox="0 0 24 24">
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                    </svg>
                  </div>
                  <div className="pf-ai-badge">
                    <div className="pf-ai-dot"></div>Correction IA
                  </div>
                </div>
              </div>

              {/* AI Panel */}
              <div className="ai-panel" ref={aiPanelRef}>
                <div className="ai-panel-title">
                  <div className="ai-dot"></div>Correction IA — Exercice 1
                </div>
                <div className="ai-line">
                  <span className="ai-check">✦</span>
                  <span className="ai-text">
                    <strong>Approche correcte</strong> — factorisation par
                    groupement
                  </span>
                </div>
                <div className="ai-line">
                  <span className="ai-check">✦</span>
                  <span className="ai-text">
                    Vérifiez le signe de <strong>Δ</strong> avant de conclure
                  </span>
                </div>
                <div className="ai-line">
                  <span className="ai-check">✦</span>
                  <span className="ai-text">
                    Justification incomplète à l'étape 3
                  </span>
                </div>
                <div className="ai-score">
                  <span className="ai-score-label">Score estimé</span>
                  <span className="ai-score-val">14.5 / 20</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ TRUST BAND ═══════ */}
      {(stats.users > 0 || stats.aiCorrections > 0 || stats.contributors > 0) && (
        <section className="trust-band" aria-label="Chiffres clés">
          <div className="trust-band-inner">
            {stats.users > 0 && (
              <div className="trust-stat">
                <div className="trust-num">
                  <CountUp end={stats.users} />
                </div>
                <div className="trust-lbl">Élèves inscrits</div>
              </div>
            )}
            {stats.aiCorrections > 0 && (
              <div className="trust-stat">
                <div className="trust-num">
                  <CountUp end={stats.aiCorrections} />
                </div>
                <div className="trust-lbl">Corrections IA générées</div>
              </div>
            )}
            {stats.contributors > 0 && (
              <div className="trust-stat">
                <div className="trust-num">
                  <CountUp end={stats.contributors} />
                </div>
                <div className="trust-lbl">Contributeurs actifs</div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ═══════ MARQUEE ═══════ */}
      <div className="marquee-section">
        <div className="marquee-track">
          <div className="marquee-item">
            <div className="marquee-dot"></div>
            <strong>BAC</strong> Mathématiques
          </div>
          <div className="marquee-item">
            <div className="marquee-dot"></div>
            <strong>BEPC</strong> Français
          </div>
          <div className="marquee-item">
            <div className="marquee-dot"></div>
            <strong>CEPE</strong> Sciences
          </div>
          <div className="marquee-item">
            <div className="marquee-dot"></div>
            <strong>IA</strong> Correction intelligente
          </div>
          <div className="marquee-item">
            <div className="marquee-dot"></div>
            <strong>Mobile Money</strong> MVola · Orange · Airtel
          </div>
          {stats.yearMin && stats.yearMax && (
            <div className="marquee-item">
              <div className="marquee-dot"></div>
              <strong>{stats.yearMin}–{stats.yearMax}</strong> Archives
            </div>
          )}
          {stats.matieres > 0 && (
            <div className="marquee-item">
              <div className="marquee-dot"></div>
              <strong>{stats.matieres}</strong> Matières
            </div>
          )}
          {stats.subjects > 0 && (
            <div className="marquee-item">
              <div className="marquee-dot"></div>
              <strong>{formatNumber(stats.subjects)}</strong> Sujets
            </div>
          )}
          {/* Duplicate for seamless loop */}
          <div className="marquee-item">
            <div className="marquee-dot"></div>
            <strong>BAC</strong> Mathématiques
          </div>
          <div className="marquee-item">
            <div className="marquee-dot"></div>
            <strong>BEPC</strong> Français
          </div>
          <div className="marquee-item">
            <div className="marquee-dot"></div>
            <strong>CEPE</strong> Sciences
          </div>
          <div className="marquee-item">
            <div className="marquee-dot"></div>
            <strong>IA</strong> Correction intelligente
          </div>
          <div className="marquee-item">
            <div className="marquee-dot"></div>
            <strong>Mobile Money</strong> MVola · Orange · Airtel
          </div>
          {stats.yearMin && stats.yearMax && (
            <div className="marquee-item">
              <div className="marquee-dot"></div>
              <strong>{stats.yearMin}–{stats.yearMax}</strong> Archives
            </div>
          )}
          {stats.matieres > 0 && (
            <div className="marquee-item">
              <div className="marquee-dot"></div>
              <strong>{stats.matieres}</strong> Matières
            </div>
          )}
          {stats.subjects > 0 && (
            <div className="marquee-item">
              <div className="marquee-dot"></div>
              <strong>{formatNumber(stats.subjects)}</strong> Sujets
            </div>
          )}
        </div>
      </div>

      {/* ═══════ POUR QUI ═══════ */}
      <section className="section" id="audience">
        <div className="container">
          <div className="eyebrow reveal">Pour qui ?</div>
          <h2
            className="serif reveal"
            style={{
              fontSize: "clamp(2rem,4vw,3.2rem)",
              fontWeight: 400,
              letterSpacing: "-.03em",
              lineHeight: 1.1,
              maxWidth: 600,
            }}
          >
            Conçu pour <em>chacun</em>
          </h2>

          <div className="audience-grid">
            <Link href="/auth/register?role=ETUDIANT" className="audience-card reveal">
              <div className="audience-icon">🎓</div>
              <div className="audience-eyebrow">Élèves</div>
              <h3 className="audience-title">
                Préparez le BAC, BEPC ou CEPE
              </h3>
              <p className="audience-desc">
                Accès aux annales officielles, correction IA instantanée,
                progression suivie. 10 crédits offerts à l'inscription.
              </p>
              <span className="audience-cta">
                Créer mon compte étudiant
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </Link>

            <Link
              href="/auth/register?role=CONTRIBUTEUR"
              className="audience-card reveal reveal-delay-1"
            >
              <div className="audience-icon">✍️</div>
              <div className="audience-eyebrow">Contributeurs</div>
              <h3 className="audience-title">
                Publiez vos sujets, gagnez des revenus
              </h3>
              <p className="audience-desc">
                Enseignants et tuteurs : monétisez vos sujets, fixez votre prix,
                recevez vos gains via Mobile Money.
              </p>
              <span className="audience-cta">
                Devenir contributeur
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </Link>

            <Link href="/catalogue?guest=true" className="audience-card reveal reveal-delay-2">
              <div className="audience-icon">👨‍👩‍👧</div>
              <div className="audience-eyebrow">Parents</div>
              <h3 className="audience-title">
                Soutenez vos enfants efficacement
              </h3>
              <p className="audience-desc">
                Trouvez des sujets adaptés au niveau de votre enfant et suivez
                ses progrès grâce à la correction IA détaillée.
              </p>
              <span className="audience-cta">
                Explorer le catalogue
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════ HOW IT WORKS ═══════ */}
      <section className="section" id="how">
        <div className="container">
          <div className="eyebrow reveal">Processus</div>
          <h2
            className="serif reveal"
            style={{
              fontSize: "clamp(2rem,4vw,3.2rem)",
              fontWeight: 400,
              letterSpacing: "-.03em",
              lineHeight: 1.1,
              maxWidth: 550,
            }}
          >
            Simple comme
            <br />
            <em>bonjour</em>
          </h2>

          <div className="how-grid">
            <div className="how-step reveal">
              <div className="how-step-header">
                <div className="how-num">01</div>
                <div className="how-icon">🔍</div>
              </div>
              <div className="how-title">Cherchez</div>
              <p className="how-desc">
                Filtrez par matière, niveau, année et difficulté.{" "}
                {stats.subjects > 0
                  ? `Plus de ${formatNumber(stats.subjects)} sujets vous attendent.`
                  : "Notre catalogue s'enrichit chaque semaine."}
              </p>
            </div>
            <div className="how-step reveal reveal-delay-1">
              <div className="how-step-header">
                <div className="how-num">02</div>
                <div className="how-icon">👁</div>
              </div>
              <div className="how-title">Prévisualisez</div>
              <p className="how-desc">
                Consultez les premières pages gratuitement avant tout achat.
                Zéro surprise.
              </p>
            </div>
            <div className="how-step reveal reveal-delay-2">
              <div className="how-step-header">
                <div className="how-num">03</div>
                <div className="how-icon">📱</div>
              </div>
              <div className="how-title">Payez via Mobile Money</div>
              <p className="how-desc">
                Rechargez votre wallet en crédits depuis votre téléphone via
                MVola, Orange Money ou Airtel Money. Sécurisé et instantané.
              </p>
            </div>
            <div className="how-step reveal reveal-delay-3">
              <div className="how-step-header">
                <div className="how-num">04</div>
                <div className="how-icon">✦</div>
              </div>
              <div className="how-title">Correction IA</div>
              <p className="how-desc">
                Soumettez vos réponses. Notre IA analyse, corrige et vous note
                en temps réel.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ FEATURES ═══════ */}
      <section
        className="section"
        id="features"
        style={{ background: "var(--surface)" }}
      >
        <div className="container">
          <div className="eyebrow reveal">Fonctionnalités</div>
          <h2
            className="serif reveal"
            style={{
              fontSize: "clamp(2rem,4vw,3.2rem)",
              fontWeight: 400,
              letterSpacing: "-.03em",
              lineHeight: 1.1,
            }}
          >
            Conçu pour
            <br />
            <em>votre réussite</em>
          </h2>

          <div className="features-grid">
            {/* Hero feature card */}
            <div className="feat-card hero-feat reveal">
              <div className="feat-eyebrow">Intelligence Artificielle</div>
              <h3 className="feat-title">
                Correction instantanée
                <br />
                par notre moteur IA
              </h3>
              <p className="feat-desc">
                Notre moteur IA analyse vos réponses, identifie les erreurs et
                propose des explications détaillées en français et en malgache.
              </p>
              <ul className="feat-list">
                <li>Notation automatique avec justification</li>
                <li>Suggestions d'amélioration personnalisées</li>
                <li>Disponible en français et malgache</li>
                <li>Résultats en moins de 10 secondes</li>
              </ul>
              <div className="feat-demo">
                <div className="demo-line">
                  <span className="demo-check">✦</span>
                  <span className="demo-text">
                    <span className="hi">Exercice 1 :</span> Approche correcte,
                    factorisation complète
                  </span>
                  <span className="demo-score">6/6</span>
                </div>
                <div className="demo-line">
                  <span className="demo-check" style={{ color: "var(--ruby)" }}>
                    △
                  </span>
                  <span className="demo-text">
                    <span className="hi">Exercice 2 :</span> Vérifiez le signe
                    du discriminant
                  </span>
                  <span className="demo-score">3/5</span>
                </div>
                <div className="demo-line">
                  <span className="demo-check">✦</span>
                  <span className="demo-text">
                    <span className="hi">Exercice 3 :</span> Excellent, démarche
                    rigoureuse
                  </span>
                  <span className="demo-score">8/8</span>
                </div>
              </div>
            </div>

            {/* Small cards */}
            <div className="feat-card reveal reveal-delay-1">
              <div className="feat-small-icon">📚</div>
              <div className="feat-small-title">{archivesTitle}</div>
              <p className="feat-small-desc">{archivesDesc}</p>
            </div>

            <div className="feat-card reveal reveal-delay-2">
              <div className="feat-small-icon">📱</div>
              <div className="feat-small-title">Paiement Mobile Money</div>
              <p className="feat-small-desc">
                Rechargez votre wallet MahAI en crédits directement depuis votre
                numéro MVola, Orange Money ou Airtel Money. Simple et sécurisé.
              </p>
            </div>

            <div className="feat-card reveal">
              <div className="feat-small-icon">✍️</div>
              <div className="feat-small-title">Devenez contributeur</div>
              <p className="feat-small-desc">
                Publiez vos sujets, définissez votre prix et recevez vos gains
                directement via Mobile Money ou en virement bancaire.
              </p>
            </div>

            <div className="feat-card reveal reveal-delay-1">
              <div className="feat-small-icon">🇲🇬</div>
              <div className="feat-small-title">100% Malgache</div>
              <p className="feat-small-desc">
                Contenu centré sur les programmes officiels malgaches. Interface
                en français et traduction en malgache disponible.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ AI DEMO INTERACTIVE ═══════ */}
      <section className="section ai-demo-section" id="demo-ia">
        <div className="container">
          <div style={{ textAlign: "center" }}>
            <div className="eyebrow reveal" style={{ justifyContent: "center" }}>
              Démo en direct
            </div>
            <h2
              className="serif reveal"
              style={{
                fontSize: "clamp(1.6rem,3.2vw,2.4rem)",
                fontWeight: 400,
                letterSpacing: "-.03em",
                lineHeight: 1.15,
              }}
            >
              Voyez l'<em>IA</em> en action
            </h2>
            <p
              className="reveal"
              style={{
                fontSize: ".92rem",
                color: "var(--text-2)",
                maxWidth: 520,
                margin: ".75rem auto 0",
                lineHeight: 1.7,
              }}
            >
              Regardez comment notre moteur IA analyse et corrige une réponse
              d'examen en quelques secondes.
            </p>
          </div>
          <div className="reveal">
            <AiDemoInteractive />
          </div>
        </div>
      </section>

      {/* ═══════ SHOWCASE ═══════ */}
      <section className="section">
        <div className="container">
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div className="eyebrow reveal">Catalogue</div>
              <h2
                className="serif reveal"
                style={{
                  fontSize: "clamp(2rem,4vw,3.2rem)",
                  fontWeight: 400,
                  letterSpacing: "-.03em",
                  lineHeight: 1.1,
                }}
              >
                Sujets <em>populaires</em>
              </h2>
            </div>
            <Link
              href="/catalogue"
              className="btn-secondary reveal"
              style={{ flexShrink: 0 }}
            >
              Voir tout le catalogue →
            </Link>
          </div>

          {popular.length > 0 ? (
            <div className="showcase-track">
              {popular.slice(0, 3).map((subject, idx) => {
                const isFree = subject.credits === 0 || subject.badge === "FREE";
                const badgeKey = subject.badge && BADGE_LABEL[subject.badge] ? subject.badge : null;
                const featured = idx === 0;
                const delayClass = idx === 1 ? " reveal-delay-1" : idx === 2 ? " reveal-delay-2" : "";
                return (
                  <Link
                    key={subject.id}
                    href={`/sujet/${subject.id}`}
                    className={`paper-card${featured ? " featured" : ""} reveal${delayClass}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <div className="pc-img">
                      <div className="pc-img-pattern"></div>
                      <div className="pc-img-num">{subject.glyph}</div>
                      {badgeKey && (
                        <div className={`pc-badge ${BADGE_CLASS[badgeKey]}`}>
                          {BADGE_LABEL[badgeKey]}
                        </div>
                      )}
                    </div>
                    <div className="pc-body">
                      <div className="pc-exam-row">
                        <span className="pc-exam-tag">
                          {subject.type} · {subject.matiere}
                        </span>
                        {subject.annee && <span className="pc-year">{subject.annee}</span>}
                      </div>
                      <div className="pc-title">{subject.title}</div>
                      <div className="pc-meta">
                        {subject.pages ? `${subject.pages} pages · ` : ""}
                        {subject.rating > 0
                          ? `★ ${subject.rating.toFixed(1)} (${subject.reviewsCount} avis)`
                          : `${subject.sales} ventes`}
                      </div>
                    </div>
                    <div className="pc-footer">
                      {isFree ? (
                        <div
                          className="pc-price"
                          style={{ color: "var(--sage)", background: "none" }}
                        >
                          Gratuit
                        </div>
                      ) : (
                        <div className="pc-price">
                          {subject.credits} <span className="unit">crédits</span>
                        </div>
                      )}
                      <div className="pc-actions">
                        <span className="btn-sm btn-sm-gold">
                          {isFree ? "Obtenir" : "Découvrir"}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div
              className="reveal"
              style={{
                marginTop: "3rem",
                padding: "3rem 1.5rem",
                textAlign: "center",
                color: "var(--text-2)",
                border: "1px dashed var(--b1)",
                borderRadius: "var(--r-lg)",
                fontSize: ".95rem",
              }}
            >
              Notre catalogue arrive bientôt.{" "}
              <Link href="/catalogue" style={{ color: "var(--gold)", textDecoration: "underline" }}>
                Explorez déjà ce qui est disponible
              </Link>
              .
            </div>
          )}
        </div>
      </section>

      {/* ═══════ TESTIMONIALS (lazy-loaded) ═══════ */}
      <Suspense
        fallback={
          <section className="section" style={{ background: "var(--surface)", minHeight: 400 }}>
            <div className="container" style={{ textAlign: "center", padding: "4rem 0" }}>
              <div style={{ color: "var(--text-3)", fontSize: ".85rem" }}>Chargement des témoignages…</div>
            </div>
          </section>
        }
      >
        <TestimonialsSection />
      </Suspense>

      {/* ═══════ MOBILE MONEY ═══════ */}
      <section className="section mm-showcase" aria-label="Moyens de paiement Mobile Money">
        <div className="container">
          <div style={{ textAlign: "center" }}>
            <div className="eyebrow reveal" style={{ justifyContent: "center" }}>
              Paiement
            </div>
            <h2
              className="serif reveal"
              style={{
                fontSize: "clamp(1.6rem,3.2vw,2.4rem)",
                fontWeight: 400,
                letterSpacing: "-.03em",
                lineHeight: 1.15,
              }}
            >
              Payez avec votre <em>Mobile Money</em> habituel
            </h2>
            <p
              className="reveal"
              style={{
                fontSize: ".92rem",
                color: "var(--text-2)",
                maxWidth: 520,
                margin: ".75rem auto 0",
                lineHeight: 1.7,
              }}
            >
              Aucune carte bancaire requise. Rechargez votre wallet MahAI
              directement depuis votre numéro, en quelques secondes.
            </p>
          </div>

          <div className="mm-logos reveal">
            {MOBILE_MONEY_PROVIDERS.map((p) => (
              <div key={p.id} className="mm-logo-card">
                <Image
                  src={p.logoPath}
                  alt={p.alt}
                  width={120}
                  height={40}
                  className="mm-logo-img"
                />
                <div className="mm-logo-name">{p.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ PRICING ═══════ */}
      <section className="section pricing-section" id="pricing">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 0 }}>
            <div
              className="eyebrow reveal"
              style={{ justifyContent: "center" }}
            >
              Tarifs
            </div>
            <h2
              className="serif reveal"
              style={{
                fontSize: "clamp(2rem,4vw,3.2rem)",
                fontWeight: 400,
                letterSpacing: "-.03em",
                lineHeight: 1.1,
              }}
            >
              Rechargez en <em>crédits</em>
            </h2>
            <p
              className="reveal"
              style={{
                fontSize: ".9rem",
                color: "var(--text-2)",
                maxWidth: 440,
                margin: ".75rem auto 0",
                lineHeight: 1.75,
              }}
            >
              Achetez des crédits une fois, utilisez-les quand vous voulez. Sans
              abonnement.
            </p>
          </div>

          <div className="pricing-grid">
            <div className="price-card reveal">
              <div className="price-plan">Gratuit</div>
              <div className="price-amount">
                0 <span className="unit">cr</span>
              </div>
              <p className="price-desc">
                Pour tester la plateforme avec les sujets offerts gratuitement.
              </p>
              <div className="price-divider"></div>
              <ul className="price-features">
                <li>
                  <span className="price-check">✦</span>Accès aux sujets
                  gratuits
                </li>
                <li>
                  <span className="price-check">✦</span>Aperçu illimité
                </li>
                <li>
                  <span className="price-check">✦</span>10 crédits offerts à
                  l'inscription
                </li>
                <li className="muted">
                  <span className="price-x">—</span>Corrections IA limitées
                </li>
              </ul>
              <Link
                href="/auth/register"
                className="btn-secondary"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  padding: ".75rem",
                  textDecoration: "none",
                }}
              >
                Créer un compte
              </Link>
            </div>

            <div className="price-card popular reveal reveal-delay-1">
              <div className="popular-badge">Le plus populaire</div>
              <div className="price-plan">{standardPack?.name || "Standard"}</div>
              <div className="price-amount">
                {standardPack ? standardPack.credits : 150}{" "}
                <span className="unit">cr</span>
              </div>
              <p className="price-desc">
                Idéal pour une préparation sérieuse à l'examen sur plusieurs
                matières.
              </p>
              <div className="price-divider"></div>
              <ul className="price-features">
                <li>
                  <span className="price-check">✦</span>
                  {standardPack
                    ? `${standardPack.credits} crédits${standardPack.bonus > 0 ? ` (+${standardPack.bonus} bonus)` : ""}`
                    : "150 crédits (+10 bonus)"}
                </li>
                <li>
                  <span className="price-check">✦</span>Accès illimité au
                  catalogue
                </li>
                <li>
                  <span className="price-check">✦</span>Corrections IA incluses
                </li>
                <li>
                  <span className="price-check">✦</span>Historique des achats
                </li>
              </ul>
              <Link
                href="/recharge"
                className="btn-primary"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  padding: ".75rem",
                  textDecoration: "none",
                }}
              >
                Recharger via Mobile Money
              </Link>
            </div>

            <div className="price-card reveal reveal-delay-2">
              <div className="price-plan">{premiumPack?.name || "Premium"}</div>
              <div className="price-amount">
                {premiumPack ? premiumPack.credits : 300}{" "}
                <span className="unit">cr</span>
              </div>
              <p className="price-desc">
                Pour les élèves déterminés à maîtriser toutes les matières avant
                l'examen.
              </p>
              <div className="price-divider"></div>
              <ul className="price-features">
                <li>
                  <span className="price-check">✦</span>
                  {premiumPack
                    ? `${premiumPack.credits} crédits${premiumPack.bonus > 0 ? ` (+${premiumPack.bonus} bonus)` : ""}`
                    : "300 crédits (+40 bonus)"}
                </li>
                <li>
                  <span className="price-check">✦</span>Corrections IA
                  prioritaires
                </li>
                <li>
                  <span className="price-check">✦</span>Mode traduction malgache
                </li>
                <li>
                  <span className="price-check">✦</span>Support prioritaire
                </li>
              </ul>
              <Link
                href="/recharge"
                className="btn-secondary"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  padding: ".75rem",
                  textDecoration: "none",
                }}
              >
                Recharger via Mobile Money
              </Link>
            </div>
          </div>

          <div className="payment-note reveal">
            <div
              className="payment-provider-list"
              role="list"
              aria-label="Moyens de paiement Mobile Money"
            >
              {MOBILE_MONEY_PROVIDERS.map((provider) => (
                <div
                  className="payment-provider-badge"
                  key={provider.id}
                  role="listitem"
                >
                  <Image
                    src={provider.logoPath}
                    alt={provider.alt}
                    width={42}
                    height={42}
                    className="payment-provider-logo"
                  />
                  <span>{provider.name}</span>
                </div>
              ))}
            </div>
            <span className="payment-note-text">
              Paiement mobile sécurisé · Crédits instantanés · Sans frais cachés
            </span>
          </div>
        </div>
      </section>

      {/* ═══════ FAQ ═══════ */}
      <section className="section faq-section" id="faq">
        <div className="container">
          <div className="section-headline" style={{ textAlign: "center" }}>
            <div
              className="eyebrow reveal"
              style={{ justifyContent: "center" }}
            >
              Questions fréquentes
            </div>
            <h2
              className="serif reveal"
              style={{
                fontSize: "clamp(2rem,4vw,3.2rem)",
                fontWeight: 400,
                letterSpacing: "-.03em",
                lineHeight: 1.1,
              }}
            >
              Vos <em>questions</em>, nos réponses
            </h2>
          </div>

          <div className="faq-grid">
            {[
              {
                q: "Qu'est-ce qu'un crédit et comment l'utiliser ?",
                a: "Un crédit est la monnaie de Mah.AI. 1 crédit = accès à 1 sujet complet (aperçu + téléchargement). Vous pouvez aussi utiliser vos crédits pour obtenir des corrections détaillées par IA de vos réponses.",
              },
              {
                q: "Puis-je acheter un sujet sans créer de compte ?",
                a: "Non, un compte est nécessaire pour suivre vos crédits et historique. Mais l'inscription est gratuite et vous recevez 10 crédits offerts pour tester la plateforme.",
              },
              {
                q: "Comment fonctionne la correction IA ?",
                a: "Après avoir consulté un sujet, vous pouvez soumettre votre réponse écrite. Notre IA l'analyse et vous fournit une correction détaillée avec points forts, axes d'amélioration et une note estimée.",
              },
              {
                q: "Les sujets sont-ils officiels ?",
                a: "Les sujets proposés proviennent de sources éducatives fiables et sont vérifiés par notre équipe. Ils correspondent aux standards des examens officiels malgaches (BACC, BEPC, CEPE).",
              },
              {
                q: "Puis-je devenir contributeur et vendre mes sujets ?",
                a: "Oui ! Les enseignants et étudiants peuvent soumettre leurs sujets. Après validation, vos sujets sont publiés et vous recevez des crédits pour chaque achat effectué par d'autres utilisateurs.",
              },
              {
                q: "Quels moyens de paiement acceptez-vous ?",
                a: "Nous acceptons les paiements Mobile Money (MVola, Orange Money, Airtel Money) largement utilisés à Madagascar. Les crédits sont crédités instantanément sur votre compte.",
              },
            ].map((item, idx) => (
              <FaqItem key={idx} question={item.q} answer={item.a} delay={idx} />
            ))}
          </div>

          <div className="faq-cta reveal">
            <p className="faq-cta-text">
              Vous ne trouvez pas votre réponse ?
            </p>
            <Link
              href="/contact"
              className="btn-secondary"
              style={{
                fontSize: ".85rem",
                padding: ".7rem 1.5rem",
                textDecoration: "none",
              }}
            >
              Contactez-nous
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════ CTA ═══════ */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-orb"></div>
          <div className="eyebrow reveal" style={{ justifyContent: "center" }}>
            Commencez dès maintenant
          </div>
          <h2 className="cta-title serif reveal">
            Votre réussite
            <br />
            <em>commence ici</em>
          </h2>
          <p className="cta-sub reveal">
            Rejoignez des milliers d'élèves malgaches qui préparent leurs
            examens avec MahAI.
          </p>
          <div className="cta-actions reveal">
            <Link
              href="/catalogue?guest=true"
              className="btn-primary"
              style={{ fontSize: ".9rem", padding: ".9rem 2.2rem" }}
            >
              Explorer le catalogue
              <svg
                viewBox="0 0 24 24"
                style={{
                  width: 16,
                  stroke: "var(--void)",
                  strokeWidth: 2,
                  fill: "none",
                }}
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/auth/register"
              className="btn-secondary"
              style={{ fontSize: ".9rem", padding: ".9rem 1.75rem" }}
            >
              Créer un compte gratuit
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <LuxuryFooter />

      {/* ═══════ STICKY CTA MOBILE ═══════ */}
      <div
        className={`sticky-cta-mobile${showStickyCta ? " is-visible" : ""}`}
        aria-hidden={!showStickyCta}
      >
        <Link href="/auth/register" className="sticky-cta-mobile-btn">
          Créer un compte
          <span className="sticky-cta-mobile-bonus">10 crédits offerts</span>
        </Link>
      </div>
    </div>
  );
}
