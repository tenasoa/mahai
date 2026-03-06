import { useState, useEffect, useRef } from "react";

// ── Styles globaux injectés ──────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,700;12..96,800&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --teal:    #0AFFE0;
    --teal2:   #00C9A7;
    --green:   #00FF88;
    --gold:    #FFD166;
    --rose:    #FF6B9D;
    --bg:      #060910;
    --bg2:     #0C1220;
    --bg3:     #111928;
    --border:  rgba(255,255,255,0.07);
    --border2: rgba(10,255,224,0.25);
    --text:    #F0F4FF;
    --muted:   #6B7899;
    --font:    'Bricolage Grotesque', sans-serif;
    --mono:    'DM Mono', monospace;
  }

  html { scroll-behavior: smooth; }

  body {
    font-family: var(--font);
    background: var(--bg);
    color: var(--text);
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
  }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--teal2); border-radius: 2px; }

  /* ── Noise overlay ── */
  body::before {
    content: '';
    position: fixed; inset: 0; z-index: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
    opacity: 0.4;
    pointer-events: none;
  }

  /* ── Glow mesh bg ── */
  .mesh-bg {
    position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden;
  }
  .mesh-bg span {
    position: absolute; border-radius: 50%;
    filter: blur(120px); opacity: 0.12;
    animation: floatMesh 20s ease-in-out infinite alternate;
  }
  .mesh-bg span:nth-child(1) { width: 600px; height: 600px; top: -200px; left: -200px; background: var(--teal); animation-delay: 0s; }
  .mesh-bg span:nth-child(2) { width: 500px; height: 500px; top: 30%; right: -150px; background: var(--green); animation-delay: -7s; }
  .mesh-bg span:nth-child(3) { width: 400px; height: 400px; bottom: -100px; left: 30%; background: #3B5AFF; animation-delay: -14s; }

  @keyframes floatMesh {
    0%   { transform: translate(0, 0) scale(1); }
    50%  { transform: translate(30px, -20px) scale(1.05); }
    100% { transform: translate(-20px, 30px) scale(0.95); }
  }

  /* ── Layout ── */
  .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; position: relative; z-index: 1; }

  /* ── NAV ── */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 40px;
    background: rgba(6,9,16,0.6);
    backdrop-filter: blur(20px) saturate(180%);
    border-bottom: 1px solid var(--border);
    transition: padding 0.4s ease;
  }
  nav.scrolled { padding: 14px 40px; }

  .nav-logo {
    font-size: 24px; font-weight: 800; letter-spacing: -1px;
    background: linear-gradient(135deg, var(--teal), var(--green));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .nav-logo span { -webkit-text-fill-color: var(--muted); font-weight: 400; }

  .nav-links { display: flex; gap: 32px; align-items: center; }
  .nav-links a {
    color: var(--muted); font-size: 14px; font-weight: 500;
    text-decoration: none; letter-spacing: 0.02em;
    transition: color 0.2s;
  }
  .nav-links a:hover { color: var(--text); }

  .btn-nav {
    background: var(--teal); color: var(--bg);
    border: none; padding: 10px 22px; border-radius: 10px;
    font-family: var(--font); font-size: 14px; font-weight: 700;
    cursor: pointer; letter-spacing: 0.02em;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .btn-nav:hover { transform: translateY(-1px); box-shadow: 0 8px 30px rgba(10,255,224,0.3); }

  /* ── HERO ── */
  .hero {
    min-height: 100vh; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    text-align: center; padding: 120px 24px 80px;
    position: relative;
  }

  .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(10,255,224,0.08); border: 1px solid rgba(10,255,224,0.2);
    color: var(--teal); padding: 6px 16px; border-radius: 100px;
    font-size: 13px; font-weight: 500; font-family: var(--mono);
    margin-bottom: 32px;
    animation: fadeSlideDown 0.8s ease both;
  }
  .hero-badge::before {
    content: ''; width: 6px; height: 6px; border-radius: 50%;
    background: var(--teal);
    animation: pulse 2s ease-in-out infinite;
  }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.5)} }

  .hero-title {
    font-size: clamp(52px, 8vw, 100px);
    font-weight: 800; letter-spacing: -3px; line-height: 0.95;
    margin-bottom: 28px;
    animation: fadeSlideDown 0.8s 0.15s ease both;
  }
  .hero-title .line1 { display: block; color: var(--text); }
  .hero-title .line2 {
    display: block;
    background: linear-gradient(135deg, var(--teal) 0%, var(--green) 50%, var(--gold) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-size: 200% 200%;
    animation: fadeSlideDown 0.8s 0.15s ease both, gradientShift 4s ease-in-out infinite;
  }
  @keyframes gradientShift {
    0%,100%{background-position:0% 50%} 50%{background-position:100% 50%}
  }
  .hero-title .line3 { display: block; color: var(--muted); font-weight: 300; }

  .hero-sub {
    font-size: 18px; color: var(--muted); max-width: 560px; line-height: 1.7;
    margin-bottom: 48px; font-weight: 400;
    animation: fadeSlideDown 0.8s 0.3s ease both;
  }

  .hero-ctas {
    display: flex; gap: 16px; align-items: center; justify-content: center;
    margin-bottom: 80px;
    animation: fadeSlideDown 0.8s 0.45s ease both;
  }

  .btn-primary {
    background: linear-gradient(135deg, var(--teal), var(--teal2));
    color: var(--bg); border: none; padding: 16px 36px; border-radius: 14px;
    font-family: var(--font); font-size: 16px; font-weight: 700;
    cursor: pointer; display: flex; align-items: center; gap: 8px;
    transition: transform 0.2s, box-shadow 0.3s;
    position: relative; overflow: hidden;
  }
  .btn-primary::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.2), transparent);
    opacity: 0; transition: opacity 0.2s;
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 16px 50px rgba(10,255,224,0.35); }
  .btn-primary:hover::after { opacity: 1; }

  .btn-ghost {
    background: transparent; border: 1px solid var(--border2);
    color: var(--text); padding: 16px 32px; border-radius: 14px;
    font-family: var(--font); font-size: 16px; font-weight: 500;
    cursor: pointer; display: flex; align-items: center; gap: 8px;
    transition: background 0.2s, border-color 0.2s;
  }
  .btn-ghost:hover { background: rgba(10,255,224,0.06); }

  /* ── STATS ── */
  .hero-stats {
    display: flex; gap: 0; border: 1px solid var(--border);
    border-radius: 20px; overflow: hidden;
    background: rgba(12,18,32,0.6); backdrop-filter: blur(10px);
    animation: fadeSlideUp 0.8s 0.6s ease both;
  }
  .stat-item {
    padding: 20px 36px; text-align: center;
    border-right: 1px solid var(--border);
  }
  .stat-item:last-child { border-right: none; }
  .stat-num {
    font-size: 28px; font-weight: 800; letter-spacing: -1px;
    background: linear-gradient(135deg, var(--teal), var(--green));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .stat-label { font-size: 12px; color: var(--muted); margin-top: 4px; font-family: var(--mono); }

  /* ── SCROLL indicator ── */
  .scroll-hint {
    position: absolute; bottom: 32px; left: 50%; transform: translateX(-50%);
    display: flex; flex-direction: column; align-items: center; gap: 8px;
    color: var(--muted); font-size: 12px; font-family: var(--mono);
    animation: fadeIn 1s 1.2s ease both;
  }
  .scroll-line {
    width: 1px; height: 40px;
    background: linear-gradient(to bottom, var(--teal), transparent);
    animation: scrollDrop 2s ease-in-out infinite;
  }
  @keyframes scrollDrop { 0%{transform:scaleY(0);transform-origin:top} 50%{transform:scaleY(1);transform-origin:top} 51%{transform:scaleY(1);transform-origin:bottom} 100%{transform:scaleY(0);transform-origin:bottom} }

  /* ── SECTION HEADERS ── */
  .section { padding: 100px 0; position: relative; z-index: 1; }
  .section-tag {
    font-family: var(--mono); font-size: 12px; color: var(--teal);
    letter-spacing: 0.15em; text-transform: uppercase;
    margin-bottom: 16px; display: flex; align-items: center; gap: 10px;
  }
  .section-tag::before, .section-tag::after {
    content: ''; flex: 0 0 30px; height: 1px; background: var(--teal2); opacity: 0.5;
  }
  .section-title {
    font-size: clamp(36px, 5vw, 56px); font-weight: 800;
    letter-spacing: -2px; line-height: 1.05; margin-bottom: 20px;
  }
  .section-sub { font-size: 17px; color: var(--muted); max-width: 500px; line-height: 1.7; }

  /* ── BENTO GRID ── */
  .bento { display: grid; gap: 16px; }

  /* Grid A — Features principale */
  .bento-a {
    grid-template-columns: repeat(12, 1fr);
    grid-template-rows: auto;
  }
  .bento-a .card:nth-child(1) { grid-column: span 7; grid-row: span 2; }
  .bento-a .card:nth-child(2) { grid-column: span 5; }
  .bento-a .card:nth-child(3) { grid-column: span 5; }
  .bento-a .card:nth-child(4) { grid-column: span 4; }
  .bento-a .card:nth-child(5) { grid-column: span 4; }
  .bento-a .card:nth-child(6) { grid-column: span 4; }

  /* Grid B — Comment ça marche */
  .bento-b {
    grid-template-columns: repeat(3, 1fr);
  }

  /* Grid C — Rôles */
  .bento-c {
    grid-template-columns: repeat(12, 1fr);
  }
  .bento-c .card:nth-child(1) { grid-column: span 3; }
  .bento-c .card:nth-child(2) { grid-column: span 3; }
  .bento-c .card:nth-child(3) { grid-column: span 3; }
  .bento-c .card:nth-child(4) { grid-column: span 3; }

  /* ── CARD ── */
  .card {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 28px;
    position: relative; overflow: hidden;
    transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1),
                border-color 0.3s ease,
                box-shadow 0.35s ease;
    cursor: default;
  }
  .card::before {
    content: ''; position: absolute; inset: 0; opacity: 0;
    background: radial-gradient(circle at var(--mx,50%) var(--my,50%), rgba(10,255,224,0.06), transparent 60%);
    transition: opacity 0.4s;
    pointer-events: none;
  }
  .card:hover { transform: translateY(-4px); border-color: rgba(10,255,224,0.25); box-shadow: 0 24px 60px rgba(0,0,0,0.4); }
  .card:hover::before { opacity: 1; }

  /* Card variants */
  .card-hero { background: linear-gradient(135deg, #0C1F3A 0%, #060F1E 100%); }
  .card-teal { background: linear-gradient(135deg, rgba(10,255,224,0.1) 0%, var(--bg2) 100%); border-color: rgba(10,255,224,0.2); }
  .card-gold { background: linear-gradient(135deg, rgba(255,209,102,0.08) 0%, var(--bg2) 100%); border-color: rgba(255,209,102,0.15); }
  .card-rose { background: linear-gradient(135deg, rgba(255,107,157,0.08) 0%, var(--bg2) 100%); border-color: rgba(255,107,157,0.15); }
  .card-green { background: linear-gradient(135deg, rgba(0,255,136,0.07) 0%, var(--bg2) 100%); border-color: rgba(0,255,136,0.15); }

  .card-icon {
    width: 48px; height: 48px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; margin-bottom: 20px;
  }
  .card-tag {
    font-family: var(--mono); font-size: 11px; letter-spacing: 0.12em;
    text-transform: uppercase; margin-bottom: 10px;
  }
  .card-title { font-size: 22px; font-weight: 700; letter-spacing: -0.5px; margin-bottom: 10px; }
  .card-body { font-size: 14px; color: var(--muted); line-height: 1.7; }
  .card-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(10,255,224,0.1); border: 1px solid rgba(10,255,224,0.2);
    color: var(--teal); padding: 4px 12px; border-radius: 100px;
    font-size: 12px; font-weight: 600; font-family: var(--mono);
    margin-bottom: 16px;
  }

  /* ── Big hero card ── */
  .big-card-visual {
    margin: 20px -28px -28px;
    background: var(--bg3);
    border-top: 1px solid var(--border);
    border-radius: 0 0 20px 20px;
    padding: 24px 28px;
    overflow: hidden;
    position: relative;
  }

  /* ── Fake UI elements ── */
  .fake-search {
    background: rgba(255,255,255,0.04); border: 1px solid var(--border);
    border-radius: 10px; padding: 10px 14px;
    display: flex; align-items: center; gap: 10px;
    font-size: 13px; color: var(--muted); font-family: var(--mono);
    margin-bottom: 12px;
  }
  .fake-chip {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(255,255,255,0.06); border: 1px solid var(--border);
    padding: 5px 12px; border-radius: 8px; font-size: 12px; color: var(--text);
    margin: 3px; cursor: pointer; transition: background 0.2s;
  }
  .fake-chip.active { background: rgba(10,255,224,0.12); border-color: rgba(10,255,224,0.3); color: var(--teal); }
  .fake-chip:hover { background: rgba(255,255,255,0.1); }

  .fake-card-row {
    display: flex; align-items: center; gap: 12px;
    background: rgba(255,255,255,0.03); border: 1px solid var(--border);
    border-radius: 10px; padding: 12px 14px; margin-bottom: 8px;
    transition: background 0.2s;
  }
  .fake-card-row:hover { background: rgba(10,255,224,0.05); }
  .fake-dot { width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0; }
  .fake-text { flex: 1; }
  .fake-text-l { height: 9px; border-radius: 4px; background: rgba(255,255,255,0.12); margin-bottom: 5px; }
  .fake-text-s { height: 7px; width: 60%; border-radius: 4px; background: rgba(255,255,255,0.06); }
  .fake-price { font-family: var(--mono); font-size: 13px; font-weight: 600; color: var(--teal); }

  /* ── AI Chat mock ── */
  .chat-bubble {
    padding: 10px 14px; border-radius: 12px; font-size: 13px; line-height: 1.5;
    max-width: 80%; margin-bottom: 8px;
  }
  .chat-bubble.user { background: rgba(10,255,224,0.12); border: 1px solid rgba(10,255,224,0.2); color: var(--teal); margin-left: auto; text-align: right; }
  .chat-bubble.ai { background: rgba(255,255,255,0.05); border: 1px solid var(--border); color: var(--text); }
  .chat-typing { display: flex; gap: 4px; padding: 12px 14px; }
  .chat-typing span {
    width: 6px; height: 6px; border-radius: 50%; background: var(--teal);
    animation: typing 1.2s ease-in-out infinite;
  }
  .chat-typing span:nth-child(2) { animation-delay: 0.2s; }
  .chat-typing span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes typing { 0%,60%,100%{opacity:0.3;transform:translateY(0)} 30%{opacity:1;transform:translateY(-4px)} }

  /* ── Score ring ── */
  .score-ring-wrap { display: flex; align-items: center; justify-content: center; margin: 16px 0; }
  .score-ring { position: relative; width: 100px; height: 100px; }
  .score-ring svg { transform: rotate(-90deg); }
  .score-ring .ring-bg { fill: none; stroke: rgba(255,255,255,0.07); stroke-width: 8; }
  .score-ring .ring-fill { fill: none; stroke: var(--teal); stroke-width: 8; stroke-linecap: round;
    stroke-dasharray: 251; stroke-dashoffset: 63;
    animation: ringFill 2s 1s ease both; }
  @keyframes ringFill { from{stroke-dashoffset:251} }
  .score-center { position: absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; }
  .score-num { font-size: 24px; font-weight: 800; letter-spacing: -1px; color: var(--teal); }
  .score-label { font-size: 10px; color: var(--muted); font-family: var(--mono); }

  /* ── How it works ── */
  .step-card {
    background: var(--bg2); border: 1px solid var(--border); border-radius: 20px; padding: 32px;
    position: relative; overflow: hidden; text-align: center;
    transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), border-color 0.3s;
  }
  .step-card:hover { transform: translateY(-6px); border-color: rgba(10,255,224,0.3); }
  .step-num {
    font-family: var(--mono); font-size: 64px; font-weight: 700;
    color: rgba(255,255,255,0.04); position: absolute; top: 16px; right: 24px;
    line-height: 1; letter-spacing: -3px;
  }
  .step-emoji { font-size: 40px; margin-bottom: 20px; display: block; }
  .step-title { font-size: 20px; font-weight: 700; letter-spacing: -0.5px; margin-bottom: 12px; }
  .step-body { font-size: 14px; color: var(--muted); line-height: 1.7; }
  .step-connector {
    display: flex; align-items: center; justify-content: center;
    color: var(--teal); opacity: 0.4; font-size: 20px;
    align-self: center;
  }

  /* ── Roles ── */
  .role-card {
    background: var(--bg2); border: 1px solid var(--border); border-radius: 20px; padding: 28px;
    position: relative; overflow: hidden;
    transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), border-color 0.3s;
  }
  .role-card:hover { transform: translateY(-4px); }
  .role-emoji { font-size: 36px; margin-bottom: 16px; display: block; }
  .role-name { font-size: 19px; font-weight: 700; margin-bottom: 8px; letter-spacing: -0.4px; }
  .role-gain { font-family: var(--mono); font-size: 13px; margin-bottom: 14px; }
  .role-perks { list-style: none; }
  .role-perks li { font-size: 13px; color: var(--muted); padding: 5px 0; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 8px; }
  .role-perks li::before { content: '→'; color: var(--teal); font-family: var(--mono); font-size: 11px; flex-shrink: 0; }

  /* ── Pricing ── */
  .pricing-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
  .price-card {
    background: var(--bg2); border: 1px solid var(--border); border-radius: 20px; padding: 32px;
    position: relative; overflow: hidden;
    transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), border-color 0.3s;
  }
  .price-card.featured {
    background: linear-gradient(135deg, #0D2A40 0%, var(--bg2) 100%);
    border-color: var(--teal2);
    transform: scale(1.03);
  }
  .price-card.featured:hover { transform: scale(1.03) translateY(-4px); }
  .price-card:not(.featured):hover { transform: translateY(-4px); }
  .price-label { font-family: var(--mono); font-size: 12px; color: var(--muted); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 12px; }
  .price-name { font-size: 24px; font-weight: 800; letter-spacing: -0.8px; margin-bottom: 6px; }
  .price-amount { font-size: 42px; font-weight: 800; letter-spacing: -2px; margin: 16px 0 4px; }
  .price-amount span { font-size: 16px; font-weight: 400; color: var(--muted); vertical-align: super; margin-right: 4px; }
  .price-period { font-size: 13px; color: var(--muted); margin-bottom: 24px; }
  .price-divider { height: 1px; background: var(--border); margin: 20px 0; }
  .price-feature { font-size: 13px; color: var(--muted); padding: 7px 0; display: flex; align-items: center; gap: 10px; }
  .price-feature .check { color: var(--teal); font-size: 12px; flex-shrink: 0; }
  .price-badge {
    position: absolute; top: 16px; right: 16px;
    background: var(--teal); color: var(--bg);
    font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 100px;
    font-family: var(--mono);
  }

  /* ── Ticker ── */
  .ticker-wrap { overflow: hidden; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 14px 0; background: rgba(10,255,224,0.02); }
  .ticker { display: flex; gap: 0; animation: tickerMove 25s linear infinite; white-space: nowrap; }
  .ticker-item { display: inline-flex; align-items: center; gap: 12px; padding: 0 32px; font-size: 13px; font-family: var(--mono); color: var(--muted); }
  .ticker-item strong { color: var(--teal); }
  .ticker-dot { color: var(--border); }
  @keyframes tickerMove { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }

  /* ── CTA ── */
  .cta-section {
    padding: 100px 0; text-align: center; position: relative; z-index: 1;
  }
  .cta-card {
    background: linear-gradient(135deg, #0A2040 0%, #0C1A30 50%, #080E1E 100%);
    border: 1px solid rgba(10,255,224,0.2);
    border-radius: 28px; padding: 80px 60px;
    position: relative; overflow: hidden;
  }
  .cta-card::before {
    content: ''; position: absolute; top: 0; left: 50%; transform: translateX(-50%);
    width: 400px; height: 1px;
    background: linear-gradient(90deg, transparent, var(--teal), transparent);
  }
  .cta-glow {
    position: absolute; width: 300px; height: 300px; border-radius: 50%;
    background: var(--teal); filter: blur(100px); opacity: 0.08;
    top: 50%; left: 50%; transform: translate(-50%,-50%);
    animation: ctaGlow 3s ease-in-out infinite alternate;
  }
  @keyframes ctaGlow { 0%{opacity:0.05;transform:translate(-50%,-50%) scale(1)} 100%{opacity:0.12;transform:translate(-50%,-50%) scale(1.2)} }
  .cta-title { font-size: clamp(36px,5vw,64px); font-weight: 800; letter-spacing: -2px; line-height: 1.05; margin-bottom: 20px; position: relative; }
  .cta-sub { font-size: 17px; color: var(--muted); max-width: 500px; margin: 0 auto 40px; line-height: 1.7; position: relative; }
  .cta-btns { display: flex; gap: 14px; justify-content: center; position: relative; }

  /* ── FOOTER ── */
  footer {
    border-top: 1px solid var(--border);
    padding: 40px 0; text-align: center;
    font-family: var(--mono); font-size: 13px; color: var(--muted);
    position: relative; z-index: 1;
  }
  footer a { color: var(--teal); text-decoration: none; }

  /* ── Animations ── */
  @keyframes fadeSlideDown { from{opacity:0;transform:translateY(-20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeSlideUp   { from{opacity:0;transform:translateY(20px)}  to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn        { from{opacity:0} to{opacity:1} }

  .reveal {
    opacity: 0; transform: translateY(30px);
    transition: opacity 0.7s ease, transform 0.7s cubic-bezier(0.34,1.56,0.64,1);
  }
  .reveal.visible { opacity: 1; transform: translateY(0); }
  .reveal-delay-1 { transition-delay: 0.1s; }
  .reveal-delay-2 { transition-delay: 0.2s; }
  .reveal-delay-3 { transition-delay: 0.3s; }
  .reveal-delay-4 { transition-delay: 0.4s; }

  /* ── Mobile ── */
  @media(max-width: 768px) {
    nav { padding: 16px 20px; }
    .nav-links { display: none; }
    .hero { padding: 100px 16px 60px; }
    .hero-stats { flex-direction: column; }
    .stat-item { border-right: none; border-bottom: 1px solid var(--border); }
    .bento-a { grid-template-columns: 1fr; }
    .bento-a .card { grid-column: span 1 !important; grid-row: span 1 !important; }
    .bento-b { grid-template-columns: 1fr; }
    .step-connector { transform: rotate(90deg); }
    .bento-c { grid-template-columns: repeat(2,1fr); }
    .bento-c .card { grid-column: span 2 !important; }
    .pricing-grid { grid-template-columns: 1fr; }
    .price-card.featured { transform: none; }
    .cta-card { padding: 40px 24px; }
    .cta-btns { flex-direction: column; align-items: center; }
    .hero-ctas { flex-direction: column; }
  }
`;

// ── Composant principal ─────────────────────────────────────────
export default function MahAILanding() {
  const [scrolled, setScrolled] = useState(false);
  const [count, setCount] = useState({ sujets: 0, users: 0, success: 0 });
  const revealRefs = useRef([]);

  // Nav scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Inject CSS
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = GLOBAL_CSS;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Reveal on scroll
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); });
    }, { threshold: 0.1, rootMargin: "0px 0px -60px 0px" });
    document.querySelectorAll(".reveal").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  // Count up animation
  useEffect(() => {
    const targets = { sujets: 200, users: 10000, success: 87 };
    const duration = 2000;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount({
        sujets: Math.floor(ease * targets.sujets),
        users: Math.floor(ease * targets.users),
        success: Math.floor(ease * targets.success),
      });
      if (progress < 1) requestAnimationFrame(tick);
    };
    const timer = setTimeout(() => requestAnimationFrame(tick), 1200);
    return () => clearTimeout(timer);
  }, []);

  // Mouse glow on cards
  useEffect(() => {
    const onMouseMove = (e) => {
      const cards = document.querySelectorAll(".card");
      cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty("--mx", `${x}%`);
        card.style.setProperty("--my", `${y}%`);
      });
    };
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  const tickerItems = [
    "🎓 BAC", "📐 Mathématiques", "🔬 Sciences", "📚 Français",
    "🌍 Histoire-Géo", "⚗️ Physique-Chimie", "🧬 SVT", "💡 Philosophie",
    "🎓 BEPC", "📊 Économie", "🏫 CEPE", "🎯 Concours FP",
  ];

  return (
    <div style={{ minHeight: "100vh", fontFamily: "var(--font)" }}>
      {/* Mesh background */}
      <div className="mesh-bg">
        <span /><span /><span />
      </div>

      {/* ── NAV ── */}
      <nav className={scrolled ? "scrolled" : ""}>
        <div className="nav-logo">Mah<span>.</span>AI</div>
        <div className="nav-links">
          <a href="#features">Fonctionnalités</a>
          <a href="#how">Comment ça marche</a>
          <a href="#roles">Rôles</a>
          <a href="#pricing">Tarifs</a>
          <button className="btn-nav">Commencer gratuitement →</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="hero-badge">🇲🇬 Plateforme EdTech Madagascar · MVP Beta</div>

          <h1 className="hero-title">
            <span className="line1">Réussis tes examens</span>
            <span className="line2">avec l'IA</span>
            <span className="line3">à tes côtés.</span>
          </h1>

          <p className="hero-sub">
            Accède aux meilleurs sujets d'examens nationaux, reçois des corrections détaillées par l'IA et des professeurs certifiés, et prépare-toi comme jamais.
          </p>

          <div className="hero-ctas">
            <button className="btn-primary">
              🚀 Commencer gratuitement
            </button>
            <button className="btn-ghost">
              ▶ Voir la démo
            </button>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-num">{count.sujets}+</div>
              <div className="stat-label">Sujets disponibles</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">{count.users.toLocaleString()}+</div>
              <div className="stat-label">Étudiants cibles</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">{count.success}%</div>
              <div className="stat-label">Taux de réussite visé</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">0 Ar</div>
              <div className="stat-label">Pour commencer</div>
            </div>
          </div>

          <div className="scroll-hint">
            découvrir
            <div className="scroll-line" />
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <div className="ticker-wrap">
        <div className="ticker">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} className="ticker-item">
              <strong>{item}</strong>
              <span className="ticker-dot">·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── BENTO FEATURES ── */}
      <section className="section" id="features">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div className="section-tag reveal">Fonctionnalités</div>
            <h2 className="section-title reveal reveal-delay-1">Tout ce dont tu as besoin<br />pour réussir</h2>
            <p className="section-sub reveal reveal-delay-2" style={{ margin: "0 auto" }}>
              Une plateforme complète pensée pour les candidats malagasy — du CEPE au concours FP.
            </p>
          </div>

          <div className="bento bento-a">

            {/* Card 1 — Grande — Catalogue */}
            <div className="card card-hero reveal" style={{ minHeight: 380 }}>
              <div className="card-badge">
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--teal)", display: "inline-block" }} />
                Catalogue
              </div>
              <div className="card-title" style={{ fontSize: 28 }}>Tous les sujets nationaux,<br />en un seul endroit</div>
              <div className="card-body" style={{ marginBottom: 20 }}>
                BAC · BEPC · CEPE · Concours FP — tous les sujets officiels depuis 2015, organisés et consultables en secondes.
              </div>
              <div className="big-card-visual">
                <div className="fake-search">
                  🔍 <span>Rechercher : BAC 2023 Mathématiques Série C</span>
                </div>
                <div style={{ marginBottom: 12, display: "flex", flexWrap: "wrap" }}>
                  {["BAC", "BEPC", "CEPE", "Concours", "Maths", "Français"].map((c, i) => (
                    <span key={c} className={`fake-chip ${i < 2 ? "active" : ""}`}>{c}</span>
                  ))}
                </div>
                {[
                  { label: "Mathématiques · Série C", year: "2024", color: "var(--teal)", price: "2 crédits" },
                  { label: "Physique-Chimie · Série D", year: "2023", color: "var(--gold)", price: "2 crédits" },
                  { label: "Français · Toutes séries", year: "2024", color: "var(--rose)", price: "1 crédit" },
                ].map((item) => (
                  <div key={item.label} className="fake-card-row">
                    <div className="fake-dot" style={{ background: `${item.color}22`, border: `1px solid ${item.color}44` }} />
                    <div className="fake-text">
                      <div className="fake-text-l" style={{ width: "70%" }} />
                      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4, fontFamily: "var(--mono)" }}>{item.label} · {item.year}</div>
                    </div>
                    <div className="fake-price">{item.price}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 2 — IA Chat */}
            <div className="card card-teal reveal reveal-delay-1">
              <div className="card-icon" style={{ background: "rgba(10,255,224,0.1)", border: "1px solid rgba(10,255,224,0.2)" }}>🤖</div>
              <div className="card-tag" style={{ color: "var(--teal)" }}>Intelligence Artificielle</div>
              <div className="card-title">Aide IA progressive</div>
              <div className="card-body" style={{ marginBottom: 16 }}>L'IA guide sans donner la réponse — tu apprends vraiment.</div>
              <div>
                <div className="chat-bubble user">Comment trouver la dérivée de f(x) = x² ?</div>
                <div className="chat-bubble ai">Bonne question ! Par quel théorème as-tu commencé ? Tu te souviens de la règle de puissance ?</div>
                <div className="chat-typing" style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "1px solid var(--border)", display: "inline-flex" }}>
                  <span /><span /><span />
                </div>
              </div>
            </div>

            {/* Card 3 — Score */}
            <div className="card card-green reveal reveal-delay-2">
              <div className="card-icon" style={{ background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.2)" }}>📊</div>
              <div className="card-tag" style={{ color: "var(--green)" }}>Examens Blancs</div>
              <div className="card-title">Teste-toi en conditions réelles</div>
              <div className="card-body" style={{ marginBottom: 12 }}>Timer, notation automatique, analyse par matière.</div>
              <div className="score-ring-wrap">
                <div className="score-ring">
                  <svg width="100" height="100" viewBox="0 0 100 100">
                    <circle className="ring-bg" cx="50" cy="50" r="40" />
                    <circle className="ring-fill" cx="50" cy="50" r="40" />
                  </svg>
                  <div className="score-center">
                    <div className="score-num">75%</div>
                    <div className="score-label">ton score</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cards 4-6 — petites */}
            <div className="card reveal">
              <div style={{ fontSize: 28, marginBottom: 12 }}>📄</div>
              <div className="card-title" style={{ fontSize: 18 }}>PDF avec watermark</div>
              <div className="card-body">Télécharge les sujets en PDF de haute qualité, traçable et sécurisé.</div>
            </div>
            <div className="card card-gold reveal reveal-delay-1">
              <div style={{ fontSize: 28, marginBottom: 12 }}>💳</div>
              <div className="card-title" style={{ fontSize: 18 }}>MVola & Orange Money</div>
              <div className="card-body" style={{ color: "var(--muted)" }}>Paiement 100% malgache — Mobile Money, rapide et sécurisé.</div>
              <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
                {["MVola", "Orange Money", "Airtel"].map(m => (
                  <span key={m} style={{ background: "rgba(255,209,102,0.1)", border: "1px solid rgba(255,209,102,0.2)", color: "var(--gold)", padding: "3px 10px", borderRadius: 6, fontSize: 11, fontFamily: "var(--mono)" }}>{m}</span>
                ))}
              </div>
            </div>
            <div className="card card-rose reveal reveal-delay-2">
              <div style={{ fontSize: 28, marginBottom: 12 }}>🎓</div>
              <div className="card-title" style={{ fontSize: 18 }}>Professeurs certifiés</div>
              <div className="card-body" style={{ color: "var(--muted)" }}>Des vraies corrections humaines signées par des professeurs vérifiés.</div>
              <div style={{ marginTop: 14 }}>
                {["⭐⭐⭐⭐⭐", "⭐⭐⭐⭐⭐", "⭐⭐⭐⭐"].map((s, i) => (
                  <div key={i} style={{ fontSize: 11, color: "var(--muted)", marginBottom: 3 }}>{s} Prof. certifié</div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="section" id="how" style={{ background: "linear-gradient(180deg, transparent, rgba(10,255,224,0.02), transparent)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div className="section-tag reveal" style={{ justifyContent: "center" }}>Comment ça marche</div>
            <h2 className="section-title reveal reveal-delay-1">En 4 étapes simples</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr auto 1fr auto 1fr", gap: 8, alignItems: "start" }}>
            {[
              { num: "01", emoji: "📝", title: "Inscris-toi", body: "Crée ton compte gratuitement. 5 crédits offerts dès l'inscription." },
              null,
              { num: "02", emoji: "🔍", title: "Cherche ton sujet", body: "Filtre par type d'examen, matière, année et série. Accès au catalogue complet." },
              null,
              { num: "03", emoji: "🤖", title: "Obtiens la correction", body: "Correction IA instantanée ou correction par un professeur certifié." },
              null,
              { num: "04", emoji: "🏆", title: "Passe ton examen", body: "Entraîne-toi avec les examens blancs et mesure tes progrès." },
            ].map((item, i) => {
              if (item === null) {
                return (
                  <div key={i} className="step-connector" style={{ paddingTop: 60, color: "var(--teal)", opacity: 0.3, fontSize: 24 }}>
                    →
                  </div>
                );
              }
              return (
                <div key={i} className={`step-card reveal reveal-delay-${Math.floor(i / 2)}`}>
                  <div className="step-num">{item.num}</div>
                  <span className="step-emoji">{item.emoji}</span>
                  <div className="step-title">{item.title}</div>
                  <div className="step-body">{item.body}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── ROLES ── */}
      <section className="section" id="roles">
        <div className="container">
          <div style={{ marginBottom: 60 }}>
            <div className="section-tag reveal">Rôles & Revenus</div>
            <h2 className="section-title reveal reveal-delay-1">Contribue et gagne de l'argent</h2>
            <p className="section-sub reveal reveal-delay-2">Mah.AI reverse jusqu'à 70% de chaque vente à la communauté qui crée et vérifie le contenu.</p>
          </div>

          <div className="bento bento-c">
            {[
              {
                emoji: "📚", name: "Contributeur", color: "var(--teal)",
                gain: "45% par vente de sujet",
                gainColor: "var(--teal)",
                perks: ["Saisir des sujets dans l'éditeur", "Toucher 45% à chaque consultation", "Suivre tes gains en temps réel", "Accès aux statistiques de tes sujets"],
                border: "rgba(10,255,224,0.2)",
              },
              {
                emoji: "🔍", name: "Vérificateur", color: "var(--gold)",
                gain: "15% par sujet validé",
                gainColor: "var(--gold)",
                perks: ["Valider la qualité des sujets soumis", "Toucher 15% sur chaque vente", "Rôle accordé sur candidature", "Badge Vérificateur sur profil"],
                border: "rgba(255,209,102,0.2)",
              },
              {
                emoji: "🎓", name: "Professeur", color: "var(--rose)",
                gain: "55% par correction vendue",
                gainColor: "var(--rose)",
                perks: ["Rédiger des corrections humaines", "Taux de commission le plus élevé", "Badge Professeur Certifié", "Profil public avec spécialités"],
                border: "rgba(255,107,157,0.2)",
              },
              {
                emoji: "👨‍🎓", name: "Étudiant", color: "var(--muted)",
                gain: "5 crédits offerts à l'inscription",
                gainColor: "var(--green)",
                perks: ["Accès au catalogue complet", "Corrections IA et professeurs", "Examens blancs chronométrés", "Paiement MVola / Orange Money"],
                border: "var(--border)",
              },
            ].map((role, i) => (
              <div key={role.name} className={`role-card reveal reveal-delay-${i}`} style={{ borderColor: role.border }}>
                <span className="role-emoji">{role.emoji}</span>
                <div className="role-name" style={{ color: role.color }}>{role.name}</div>
                <div className="role-gain" style={{ color: role.gainColor, marginBottom: 16 }}>
                  {role.gain}
                </div>
                <ul className="role-perks">
                  {role.perks.map(p => <li key={p}>{p}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="section" id="pricing">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div className="section-tag reveal" style={{ justifyContent: "center" }}>Tarifs</div>
            <h2 className="section-title reveal reveal-delay-1">Simple et transparent</h2>
            <p className="section-sub reveal reveal-delay-2" style={{ margin: "0 auto" }}>Achète des crédits une fois, utilise-les quand tu veux. Pas d'abonnement forcé.</p>
          </div>

          <div className="pricing-grid">
            {[
              {
                label: "Débutant", name: "Pack Découverte",
                price: "5 000", credits: "10 crédits",
                period: "Idéal pour commencer",
                features: ["10 sujets à consulter", "Corrections IA incluses", "Téléchargement PDF", "Support par email"],
                featured: false, badge: null,
                color: "var(--text)",
              },
              {
                label: "Populaire", name: "Pack Révisions",
                price: "20 000", credits: "50 crédits",
                period: "Le choix des candidats BAC",
                features: ["50 sujets à consulter", "5 corrections professeurs", "Examens blancs illimités", "Téléchargements PDF illimités", "Priorité support"],
                featured: true, badge: "⭐ Recommandé",
                color: "var(--teal)",
              },
              {
                label: "Intensif", name: "Pack Champion",
                price: "50 000", credits: "150 crédits",
                period: "Prépare-toi à fond",
                features: ["150 sujets à consulter", "20 corrections professeurs", "Examens blancs illimités", "Plan de révision IA personnalisé", "Badge Étudiant Premium"],
                featured: false, badge: null,
                color: "var(--text)",
              },
            ].map((plan, i) => (
              <div key={plan.name} className={`price-card ${plan.featured ? "featured" : ""} reveal reveal-delay-${i}`}>
                {plan.badge && <div className="price-badge">{plan.badge}</div>}
                <div className="price-label">{plan.label}</div>
                <div className="price-name" style={{ color: plan.color }}>{plan.name}</div>
                <div className="price-amount" style={{ color: plan.featured ? "var(--teal)" : "var(--text)" }}>
                  <span>Ar</span>{parseInt(plan.price).toLocaleString()}
                </div>
                <div className="price-period">{plan.credits} · {plan.period}</div>
                <button className={plan.featured ? "btn-primary" : "btn-ghost"} style={{ width: "100%", justifyContent: "center" }}>
                  {plan.featured ? "Commencer maintenant" : "Choisir ce pack"}
                </button>
                <div className="price-divider" />
                {plan.features.map(f => (
                  <div key={f} className="price-feature">
                    <span className="check">✓</span>
                    {f}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 32 }}>
            <p style={{ color: "var(--muted)", fontSize: 14, fontFamily: "var(--mono)" }}>
              💡 Établissements scolaires et lycées : <span style={{ color: "var(--teal)" }}>tarif groupé disponible →</span>
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card reveal">
            <div className="cta-glow" />
            <div className="cta-title">
              Prêt à décrocher<br />
              <span style={{
                background: "linear-gradient(135deg, var(--teal), var(--green))",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
              }}>ton BAC avec mention ?</span>
            </div>
            <p className="cta-sub">
              Rejoins les étudiants malgaches qui préparent leurs examens intelligemment. 5 crédits offerts sans carte bancaire.
            </p>
            <div className="cta-btns">
              <button className="btn-primary" style={{ fontSize: 17, padding: "18px 44px" }}>
                🚀 Commencer gratuitement
              </button>
              <button className="btn-ghost" style={{ fontSize: 17, padding: "18px 36px" }}>
                Voir le catalogue →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer>
        <div className="container">
          <div style={{ marginBottom: 16, fontSize: 22, fontWeight: 800, letterSpacing: -1, background: "linear-gradient(135deg, var(--teal), var(--green))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Mah.AI
          </div>
          <p style={{ marginBottom: 8 }}>La plateforme EdTech made in 🇲🇬 Madagascar</p>
          <p>
            <a href="#">CGU</a> · <a href="#">Confidentialité</a> · <a href="#">Contact</a> · <a href="#">Devenir contributeur</a>
          </p>
          <p style={{ marginTop: 16, opacity: 0.4 }}>© 2025 Mah.AI — Tous droits réservés</p>
        </div>
      </footer>
    </div>
  );
}
