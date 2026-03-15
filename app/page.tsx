'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useMultiReveal } from '@/lib/hooks'
import { LuxuryFooter } from '@/components/layout/LuxuryFooter'
import './landing.css'

export default function LandingPage() {
  // Reveal on scroll
  useMultiReveal('.reveal', { threshold: 0.1, rootMargin: '0px 0px -40px 0px' })

  return (
    <div style={{ minHeight: "100vh" }}>

      {/* ═══════ HERO ═══════ */}
      <section className="hero">
        <div className="hero-ambient">
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
              <span><em>académique</em></span>
              <span>à portée de main</span>
            </h1>
            <p className="hero-sub">
              Accédez à des milliers de sujets d'examens officiels — BAC, BEPC, CEPE — avec correction par intelligence artificielle. Payez via MVola, étudiez intelligemment.
            </p>
            <div className="hero-actions">
              <Link href="/catalogue?guest=true" className="btn-primary">
                Parcourir le catalogue
                <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
              <a href="#how" className="btn-secondary">Comment ça marche</a>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <div className="num">2 138</div>
                <div className="lbl">Sujets</div>
              </div>
              <div className="hero-stat">
                <div className="num">47</div>
                <div className="lbl">Matières</div>
              </div>
              <div className="hero-stat">
                <div className="num">21 ans</div>
                <div className="lbl">2003 — 2024</div>
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
                <div className="pf-lines"><div className="pf-line"></div><div className="pf-line med"></div></div>
              </div>
              <div className="paper-float paper-float-2">
                <div className="pf-header">
                  <div className="pf-exam">BEPC</div>
                  <div className="pf-price">10 cr</div>
                </div>
                <div className="pf-title">Mathématiques</div>
                <div className="pf-lines"><div className="pf-line"></div><div className="pf-line short"></div></div>
              </div>

              {/* Main card */}
              <div className="paper-float paper-float-1">
                <div className="pf-header">
                  <div className="pf-exam">BAC 2024</div>
                  <div className="pf-price">15 cr</div>
                </div>
                <div className="pf-title">Mathématiques — Algèbre & Fonctions</div>
                <div className="pf-sub">18 pages · 3h · Difficile</div>
                <div className="pf-lines">
                  <div className="pf-line"></div>
                  <div className="pf-line med"></div>
                  <div className="pf-line short"></div>
                  <div className="pf-line gold"></div>
                </div>
                <div className="pf-footer">
                  <div className="pf-stars">
                    <svg className="star" viewBox="0 0 24 24"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
                    <svg className="star" viewBox="0 0 24 24"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
                    <svg className="star" viewBox="0 0 24 24"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
                    <svg className="star" viewBox="0 0 24 24"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
                    <svg className="star dim" viewBox="0 0 24 24"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
                  </div>
                  <div className="pf-ai-badge"><div className="pf-ai-dot"></div>Correction IA</div>
                </div>
              </div>

              {/* AI Panel */}
              <div className="ai-panel">
                <div className="ai-panel-title"><div className="ai-dot"></div>Correction IA — Exercice 1</div>
                <div className="ai-line"><span className="ai-check">✦</span><span className="ai-text"><strong>Approche correcte</strong> — factorisation par groupement</span></div>
                <div className="ai-line"><span className="ai-check">✦</span><span className="ai-text">Vérifiez le signe de <strong>Δ</strong> avant de conclure</span></div>
                <div className="ai-line"><span className="ai-check">✦</span><span className="ai-text">Justification incomplète à l'étape 3</span></div>
                <div className="ai-score">
                  <span className="ai-score-label">Score estimé</span>
                  <span className="ai-score-val">14.5 / 20</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ═══════ MARQUEE ═══════ */}
      <div className="marquee-section">
        <div className="marquee-track">
          <div className="marquee-item"><div className="marquee-dot"></div><strong>BAC</strong> Mathématiques</div>
          <div className="marquee-item"><div className="marquee-dot"></div><strong>BEPC</strong> Français</div>
          <div className="marquee-item"><div className="marquee-dot"></div><strong>CEPE</strong> Sciences</div>
          <div className="marquee-item"><div className="marquee-dot"></div><strong>IA</strong> Correction GPT-4o</div>
          <div className="marquee-item"><div className="marquee-dot"></div><strong>MVola</strong> Paiement Mobile</div>
          <div className="marquee-item"><div className="marquee-dot"></div><strong>2003–2024</strong> Archives</div>
          <div className="marquee-item"><div className="marquee-dot"></div><strong>47</strong> Matières</div>
          <div className="marquee-item"><div className="marquee-dot"></div><strong>2 138</strong> Sujets</div>
          {/* Duplicate for seamless loop */}
          <div className="marquee-item"><div className="marquee-dot"></div><strong>BAC</strong> Mathématiques</div>
          <div className="marquee-item"><div className="marquee-dot"></div><strong>BEPC</strong> Français</div>
          <div className="marquee-item"><div className="marquee-dot"></div><strong>CEPE</strong> Sciences</div>
          <div className="marquee-item"><div className="marquee-dot"></div><strong>IA</strong> Correction GPT-4o</div>
          <div className="marquee-item"><div className="marquee-dot"></div><strong>MVola</strong> Paiement Mobile</div>
          <div className="marquee-item"><div className="marquee-dot"></div><strong>2003–2024</strong> Archives</div>
          <div className="marquee-item"><div className="marquee-dot"></div><strong>47</strong> Matières</div>
          <div className="marquee-item"><div className="marquee-dot"></div><strong>2 138</strong> Sujets</div>
        </div>
      </div>

      {/* ═══════ HOW IT WORKS ═══════ */}
      <section className="section" id="how">
        <div className="container">
          <div className="eyebrow reveal">Processus</div>
          <h2 className="serif reveal" style={{ fontSize: "clamp(2rem,4vw,3.2rem)", fontWeight: 400, letterSpacing: "-.03em", lineHeight: 1.1, maxWidth: 550 }}>
            Simple comme<br /><em>bonjour</em>
          </h2>

          <div className="how-grid">
            <div className="how-step reveal">
              <div className="how-step-header">
                <div className="how-num">01</div>
                <div className="how-icon">🔍</div>
              </div>
              <div className="how-title">Cherchez</div>
              <p className="how-desc">Filtrez par matière, niveau, année et difficulté. Plus de 2 138 sujets vous attendent.</p>
            </div>
            <div className="how-step reveal reveal-delay-1">
              <div className="how-step-header">
                <div className="how-num">02</div>
                <div className="how-icon">👁</div>
              </div>
              <div className="how-title">Prévisualisez</div>
              <p className="how-desc">Consultez les premières pages gratuitement avant tout achat. Zéro surprise.</p>
            </div>
            <div className="how-step reveal reveal-delay-2">
              <div className="how-step-header">
                <div className="how-num">03</div>
                <div className="how-icon">📱</div>
              </div>
              <div className="how-title">Payez via MVola</div>
              <p className="how-desc">Rechargez votre wallet en crédits depuis votre téléphone. Sécurisé et instantané.</p>
            </div>
            <div className="how-step reveal reveal-delay-3">
              <div className="how-step-header">
                <div className="how-num">04</div>
                <div className="how-icon">✦</div>
              </div>
              <div className="how-title">Correction IA</div>
              <p className="how-desc">Soumettez vos réponses. Notre IA analyse, corrige et vous note en temps réel.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ FEATURES ═══════ */}
      <section className="section" style={{ background: "var(--surface)" }}>
        <div className="container">
          <div className="eyebrow reveal">Fonctionnalités</div>
          <h2 className="serif reveal" style={{ fontSize: "clamp(2rem,4vw,3.2rem)", fontWeight: 400, letterSpacing: "-.03em", lineHeight: 1.1 }}>
            Conçu pour<br /><em>votre réussite</em>
          </h2>

          <div className="features-grid">
            {/* Hero feature card */}
            <div className="feat-card hero-feat reveal">
              <div className="feat-eyebrow">Intelligence Artificielle</div>
              <h3 className="feat-title">Correction instantanée<br />par GPT-4o mini</h3>
              <p className="feat-desc">Notre moteur IA analyse vos réponses, identifie les erreurs et propose des explications détaillées en français et en malgache.</p>
              <ul className="feat-list">
                <li>Notation automatique avec justification</li>
                <li>Suggestions d'amélioration personnalisées</li>
                <li>Disponible en français et malgache</li>
                <li>Résultats en moins de 10 secondes</li>
              </ul>
              <div className="feat-demo">
                <div className="demo-line">
                  <span className="demo-check">✦</span>
                  <span className="demo-text"><span className="hi">Exercice 1 :</span> Approche correcte, factorisation complète</span>
                  <span className="demo-score">6/6</span>
                </div>
                <div className="demo-line">
                  <span className="demo-check" style={{color: "var(--ruby)"}}>△</span>
                  <span className="demo-text"><span className="hi">Exercice 2 :</span> Vérifiez le signe du discriminant</span>
                  <span className="demo-score">3/5</span>
                </div>
                <div className="demo-line">
                  <span className="demo-check">✦</span>
                  <span className="demo-text"><span className="hi">Exercice 3 :</span> Excellent, démarche rigoureuse</span>
                  <span className="demo-score">8/8</span>
                </div>
              </div>
            </div>

            {/* Small cards */}
            <div className="feat-card reveal reveal-delay-1">
              <div className="feat-small-icon">📚</div>
              <div className="feat-small-title">Archives 2003–2024</div>
              <p className="feat-small-desc">21 années d'examens officiels soigneusement numérisés, vérifiés et indexés pour une recherche précise.</p>
            </div>

            <div className="feat-card reveal reveal-delay-2">
              <div className="feat-small-icon">📱</div>
              <div className="feat-small-title">Paiement MVola natif</div>
              <p className="feat-small-desc">Rechargez votre wallet MahAI en crédits directement depuis votre numéro MVola. Simple et sécurisé.</p>
            </div>

            <div className="feat-card reveal">
              <div className="feat-small-icon">✍️</div>
              <div className="feat-small-title">Devenez contributeur</div>
              <p className="feat-small-desc">Publiez vos sujets, définissez votre prix et recevez vos gains directement sur MVola ou en virement bancaire.</p>
            </div>

            <div className="feat-card reveal reveal-delay-1">
              <div className="feat-small-icon">🇲🇬</div>
              <div className="feat-small-title">100% Malgache</div>
              <p className="feat-small-desc">Contenu centré sur les programmes officiels malgaches. Interface en français et traduction en malgache disponible.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ SHOWCASE ═══════ */}
      <section className="section">
        <div className="container">
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
            <div>
              <div className="eyebrow reveal">Catalogue</div>
              <h2 className="serif reveal" style={{ fontSize: "clamp(2rem,4vw,3.2rem)", fontWeight: 400, letterSpacing: "-.03em", lineHeight: 1.1 }}>
                Sujets <em>populaires</em>
              </h2>
            </div>
            <Link href="/catalogue" className="btn-secondary reveal" style={{ flexShrink: 0 }}>Voir tout le catalogue →</Link>
          </div>

          <div className="showcase-track">
            <div className="paper-card featured reveal">
              <div className="pc-img">
                <div className="pc-img-pattern"></div>
                <div className="pc-img-num">∑</div>
                <div className="pc-badge gold">Premium</div>
              </div>
              <div className="pc-body">
                <div className="pc-exam-row">
                  <span className="pc-exam-tag">BAC · Mathématiques</span>
                  <span className="pc-year">2024</span>
                </div>
                <div className="pc-title">Algèbre & Fonctions — Session officielle</div>
                <div className="pc-meta">18 pages · 3h · ★ 4.8 (124 avis)</div>
              </div>
              <div className="pc-footer">
                <div className="pc-price">15 <span className="unit">crédits</span></div>
                <div className="pc-actions">
                  <button className="btn-sm btn-sm-ghost">Aperçu</button>
                  <button className="btn-sm btn-sm-gold">Acheter</button>
                </div>
              </div>
            </div>

            <div className="paper-card reveal reveal-delay-1">
              <div className="pc-img">
                <div className="pc-img-pattern"></div>
                <div className="pc-img-num">φ</div>
                <div className="pc-badge ai">✦ IA</div>
              </div>
              <div className="pc-body">
                <div className="pc-exam-row">
                  <span className="pc-exam-tag">BEPC · Physique-Chimie</span>
                  <span className="pc-year">2023</span>
                </div>
                <div className="pc-title">Mécanique & Électricité</div>
                <div className="pc-meta">12 pages · 2h · ★ 4.6 (87 avis)</div>
              </div>
              <div className="pc-footer">
                <div className="pc-price">10 <span className="unit">crédits</span></div>
                <div className="pc-actions">
                  <button className="btn-sm btn-sm-ghost">Aperçu</button>
                  <button className="btn-sm btn-sm-gold">Acheter</button>
                </div>
              </div>
            </div>

            <div className="paper-card reveal reveal-delay-2">
              <div className="pc-img">
                <div className="pc-img-pattern"></div>
                <div className="pc-img-num">∂</div>
                <div className="pc-badge free">Gratuit</div>
              </div>
              <div className="pc-body">
                <div className="pc-exam-row">
                  <span className="pc-exam-tag">CEPE · Français</span>
                  <span className="pc-year">2022</span>
                </div>
                <div className="pc-title">Compréhension & Expression écrite</div>
                <div className="pc-meta">8 pages · 2h · ★ 4.4 (212 avis)</div>
              </div>
              <div className="pc-footer">
                <div className="pc-price" style={{ color: "var(--sage)", background: "none" }}>Gratuit</div>
                <div className="pc-actions">
                  <button className="btn-sm btn-sm-ghost">Aperçu</button>
                  <button className="btn-sm btn-sm-gold">Obtenir</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ TESTIMONIALS ═══════ */}
      <section className="section" style={{ background: "var(--surface)" }}>
        <div className="container">
          <div className="eyebrow reveal">Témoignages</div>
          <h2 className="serif reveal" style={{ fontSize: "clamp(2rem,4vw,3.2rem)", fontWeight: 400, letterSpacing: "-.03em", lineHeight: 1.1, marginBottom: 0 }}>
            Ils ont <em>réussi</em>
          </h2>

          <div className="testi-grid">
            <div className="testi-card reveal">
              <div className="testi-quote">"</div>
              <p className="testi-text">Grâce à MahAI, j'ai pu m'exercer sur les sujets des 10 dernières années. La correction IA m'a permis de comprendre exactement où j'échouais.</p>
              <div className="testi-author">
                <div className="testi-avatar">S</div>
                <div>
                  <div className="testi-name">Seheno Rakotondrabe</div>
                  <div className="testi-role">BAC série D · Mention Bien 2024</div>
                </div>
              </div>
            </div>

            <div className="testi-card reveal reveal-delay-1">
              <div className="testi-quote">"</div>
              <p className="testi-text">L'interface est élégante et les sujets sont bien organisés. Le paiement MVola fonctionne parfaitement, je recommande vivement.</p>
              <div className="testi-author">
                <div className="testi-avatar">T</div>
                <div>
                  <div className="testi-name">Tiana Andriantsoa</div>
                  <div className="testi-role">BEPC 2024 · Admis avec mention</div>
                </div>
              </div>
            </div>

            <div className="testi-card reveal reveal-delay-2">
              <div className="testi-quote">"</div>
              <p className="testi-text">En tant que contributeur, j'ai publié 12 sujets et reçu mes gains directement sur MVola. Un système transparent et équitable.</p>
              <div className="testi-author">
                <div className="testi-avatar">R</div>
                <div>
                  <div className="testi-name">Rivo Ramaroson</div>
                  <div className="testi-role">Contributeur certifié · 12 sujets publiés</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ PRICING ═══════ */}
      <section className="section pricing-section" id="pricing">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 0 }}>
            <div className="eyebrow reveal" style={{ justifyContent: "center" }}>Tarifs</div>
            <h2 className="serif reveal" style={{ fontSize: "clamp(2rem,4vw,3.2rem)", fontWeight: 400, letterSpacing: "-.03em", lineHeight: 1.1 }}>
              Rechargez en <em>crédits</em>
            </h2>
            <p className="reveal" style={{ fontSize: ".9rem", color: "var(--text-2)", maxWidth: 440, margin: ".75rem auto 0", lineHeight: 1.75 }}>
              Achetez des crédits une fois, utilisez-les quand vous voulez. Sans abonnement.
            </p>
          </div>

          <div className="pricing-grid">
            <div className="price-card reveal">
              <div className="price-plan">Starter</div>
              <div className="price-amount">50 <span className="unit">cr</span></div>
              <p className="price-desc">Parfait pour découvrir la plateforme et accéder à quelques sujets.</p>
              <div className="price-divider"></div>
              <ul className="price-features">
                <li><span className="price-check">✦</span>50 crédits</li>
                <li><span className="price-check">✦</span>Accès illimité au catalogue</li>
                <li><span className="price-check">✦</span>Aperçu gratuit</li>
                <li className="muted"><span className="price-x">—</span>Corrections IA illimitées</li>
              </ul>
              <button className="btn-secondary" style={{ width: "100%", justifyContent: "center", padding: ".75rem" }}>
                Payer via MVola
              </button>
            </div>

            <div className="price-card popular reveal reveal-delay-1">
              <div className="popular-badge">Le plus populaire</div>
              <div className="price-plan">Standard</div>
              <div className="price-amount">150 <span className="unit">cr</span></div>
              <p className="price-desc">Idéal pour une préparation sérieuse à l'examen sur plusieurs matières.</p>
              <div className="price-divider"></div>
              <ul className="price-features">
                <li><span className="price-check">✦</span>150 crédits (+10 bonus)</li>
                <li><span className="price-check">✦</span>Accès illimité au catalogue</li>
                <li><span className="price-check">✦</span>Corrections IA incluses</li>
                <li><span className="price-check">✦</span>Historique des achats</li>
              </ul>
              <button className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: ".75rem" }}>
                Payer via MVola
              </button>
            </div>

            <div className="price-card reveal reveal-delay-2">
              <div className="price-plan">Premium</div>
              <div className="price-amount">300 <span className="unit">cr</span></div>
              <p className="price-desc">Pour les élèves déterminés à maîtriser toutes les matières avant l'examen.</p>
              <div className="price-divider"></div>
              <ul className="price-features">
                <li><span className="price-check">✦</span>300 crédits (+40 bonus)</li>
                <li><span className="price-check">✦</span>Corrections IA illimitées</li>
                <li><span className="price-check">✦</span>Mode traduction malgache</li>
                <li><span className="price-check">✦</span>Support prioritaire</li>
              </ul>
              <button className="btn-secondary" style={{ width: "100%", justifyContent: "center", padding: ".75rem" }}>
                Payer via MVola
              </button>
            </div>
          </div>

          <div className="mvola-note reveal">
            <div className="mvola-badge">📱 MVola · Orange Money · Airtel Money</div>
            <span className="mvola-note-text">Paiement mobile sécurisé · Crédits instantanés · Sans frais cachés</span>
          </div>
        </div>
      </section>

      {/* ═══════ CTA ═══════ */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-orb"></div>
          <div className="eyebrow reveal" style={{ justifyContent: "center" }}>Commencez dès maintenant</div>
          <h2 className="cta-title serif reveal">
            Votre réussite<br /><em>commence ici</em>
          </h2>
          <p className="cta-sub reveal">
            Rejoignez des milliers d'élèves malgaches qui préparent leurs examens avec MahAI.
          </p>
          <div className="cta-actions reveal">
            <Link href="/catalogue?guest=true" className="btn-primary" style={{ fontSize: ".9rem", padding: ".9rem 2.2rem" }}>
              Explorer le catalogue
              <svg viewBox="0 0 24 24" style={{ width: 16, stroke: "var(--void)", strokeWidth: 2, fill: "none" }}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <Link href="/auth/register" className="btn-secondary" style={{ fontSize: ".9rem", padding: ".9rem 1.75rem" }}>
              Créer un compte gratuit
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <LuxuryFooter />
    </div>
  )
}
