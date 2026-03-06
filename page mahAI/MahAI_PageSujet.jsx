import { useState, useEffect, useRef } from "react";

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,700;12..96,800&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --teal:#0AFFE0; --teal2:#00C9A7; --green:#00FF88; --gold:#FFD166;
    --rose:#FF6B9D; --blue:#4F8EF7; --purple:#A78BFA;
    --bg:#060910; --bg2:#0C1220; --bg3:#111928; --bg4:#0A1628;
    --border:rgba(255,255,255,0.07); --border2:rgba(10,255,224,0.25);
    --text:#F0F4FF; --muted:#6B7899; --muted2:#4A5568;
    --font:'Bricolage Grotesque',sans-serif; --mono:'DM Mono',monospace;
    --r:20px;
  }
  html { scroll-behavior:smooth; }
  body { font-family:var(--font); background:var(--bg); color:var(--text); overflow-x:hidden; -webkit-font-smoothing:antialiased; }
  ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:var(--bg)} ::-webkit-scrollbar-thumb{background:var(--teal2);border-radius:2px}
  body::before { content:''; position:fixed; inset:0; z-index:0; background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E"); opacity:.4; pointer-events:none; }
  .mesh { position:fixed; inset:0; z-index:0; pointer-events:none; overflow:hidden; }
  .mesh span { position:absolute; border-radius:50%; filter:blur(130px); opacity:.07; animation:floatM 20s ease-in-out infinite alternate; }
  .mesh span:nth-child(1){width:500px;height:500px;top:-100px;right:-100px;background:var(--teal);animation-delay:0s}
  .mesh span:nth-child(2){width:400px;height:400px;bottom:10%;left:-50px;background:var(--blue);animation-delay:-8s}
  .mesh span:nth-child(3){width:300px;height:300px;top:40%;left:40%;background:var(--purple);animation-delay:-15s}
  @keyframes floatM{0%{transform:translate(0,0) scale(1)} 50%{transform:translate(20px,-15px) scale(1.04)} 100%{transform:translate(-15px,20px) scale(.97)}}

  /* ── Nav ── */
  nav { position:fixed; top:0; left:0; right:0; z-index:100; display:flex; align-items:center; justify-content:space-between; padding:16px 40px; background:rgba(6,9,16,.75); backdrop-filter:blur(20px); border-bottom:1px solid var(--border); }
  .nav-logo { font-size:22px; font-weight:800; letter-spacing:-1px; background:linear-gradient(135deg,var(--teal),var(--green)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
  .nav-right { display:flex; align-items:center; gap:16px; }
  .nav-credits { display:flex; align-items:center; gap:8px; background:rgba(10,255,224,.08); border:1px solid rgba(10,255,224,.2); padding:8px 16px; border-radius:10px; font-size:14px; font-family:var(--mono); color:var(--teal); }
  .nav-avatar { width:36px; height:36px; border-radius:10px; background:linear-gradient(135deg,var(--teal),var(--teal2)); display:flex; align-items:center; justify-content:center; font-size:16px; cursor:pointer; }
  .btn-back { background:transparent; border:1px solid var(--border); color:var(--muted); padding:8px 16px; border-radius:10px; font-family:var(--font); font-size:14px; cursor:pointer; display:flex; align-items:center; gap:6px; transition:border-color .2s,color .2s; }
  .btn-back:hover { border-color:var(--border2); color:var(--text); }

  /* ── Layout ── */
  .container { max-width:1200px; margin:0 auto; padding:0 24px; position:relative; z-index:1; }
  .page { padding:90px 0 60px; }

  /* ── Breadcrumb ── */
  .breadcrumb { display:flex; align-items:center; gap:8px; font-family:var(--mono); font-size:12px; color:var(--muted); margin-bottom:24px; }
  .breadcrumb a { color:var(--muted); text-decoration:none; transition:color .2s; }
  .breadcrumb a:hover { color:var(--teal); }
  .breadcrumb span { color:var(--muted2); }

  /* ── Main Bento ── */
  .main-bento { display:grid; grid-template-columns:1fr 380px; gap:20px; align-items:start; }

  /* ── Left column ── */
  .left-col { display:flex; flex-direction:column; gap:20px; }

  /* ── Subject Header Card ── */
  .header-card {
    background:var(--bg2); border:1px solid var(--border); border-radius:var(--r); padding:36px;
    position:relative; overflow:hidden;
    animation:slideUp .6s ease both;
  }
  .header-card::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,var(--teal),var(--green),transparent); }
  .subject-meta { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:20px; }
  .meta-badge { display:inline-flex; align-items:center; gap:5px; padding:5px 12px; border-radius:8px; font-size:12px; font-family:var(--mono); font-weight:600; border:1px solid; }
  .mb-teal { background:rgba(10,255,224,.08); border-color:rgba(10,255,224,.25); color:var(--teal); }
  .mb-gold { background:rgba(255,209,102,.08); border-color:rgba(255,209,102,.25); color:var(--gold); }
  .mb-rose { background:rgba(255,107,157,.08); border-color:rgba(255,107,157,.25); color:var(--rose); }
  .mb-blue { background:rgba(79,142,247,.08); border-color:rgba(79,142,247,.25); color:var(--blue); }
  .mb-muted { background:rgba(255,255,255,.05); border-color:var(--border); color:var(--muted); }
  .subject-title { font-size:clamp(22px,3vw,32px); font-weight:800; letter-spacing:-1px; line-height:1.15; margin-bottom:16px; }
  .subject-desc { font-size:15px; color:var(--muted); line-height:1.75; margin-bottom:24px; }
  .subject-stats-row { display:flex; gap:24px; flex-wrap:wrap; }
  .stat-chip { display:flex; align-items:center; gap:8px; font-size:13px; color:var(--muted); }
  .stat-chip strong { color:var(--text); font-weight:600; }
  .stars { color:var(--gold); letter-spacing:1px; font-size:14px; }

  /* ── Preview Card ── */
  .preview-card {
    background:var(--bg2); border:1px solid var(--border); border-radius:var(--r); overflow:hidden;
    animation:slideUp .6s .1s ease both;
  }
  .preview-header { padding:20px 28px; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; }
  .preview-title { font-size:15px; font-weight:700; display:flex; align-items:center; gap:8px; }
  .preview-badge { font-size:11px; font-family:var(--mono); color:var(--rose); background:rgba(255,107,157,.08); border:1px solid rgba(255,107,157,.2); padding:3px 10px; border-radius:100px; }
  .preview-body { padding:28px; position:relative; }
  .preview-content { font-size:14px; line-height:1.9; color:var(--muted); }
  .preview-content .q-num { color:var(--teal); font-family:var(--mono); font-size:13px; font-weight:600; }
  .preview-content .q-text { color:var(--text); font-size:15px; margin-bottom:4px; }
  .preview-content .q-detail { color:var(--muted); font-size:13px; margin-bottom:18px; padding-left:16px; border-left:2px solid var(--border); }
  .preview-blur {
    position:absolute; bottom:0; left:0; right:0; height:180px;
    background:linear-gradient(to bottom,transparent,var(--bg2));
    display:flex; align-items:flex-end; justify-content:center; padding-bottom:24px;
  }
  .preview-unlock { display:flex; align-items:center; gap:10px; background:rgba(10,255,224,.06); border:1px dashed rgba(10,255,224,.25); border-radius:12px; padding:12px 20px; font-size:13px; color:var(--teal); font-family:var(--mono); }

  /* ── AI Correction Card ── */
  .ai-card {
    background:linear-gradient(135deg,#0A1E3A 0%,var(--bg2) 100%);
    border:1px solid rgba(10,255,224,.2); border-radius:var(--r); overflow:hidden;
    animation:slideUp .6s .2s ease both;
  }
  .ai-header { padding:20px 28px; border-bottom:1px solid rgba(10,255,224,.1); display:flex; align-items:center; gap:12px; }
  .ai-orb { width:40px; height:40px; border-radius:12px; background:linear-gradient(135deg,var(--teal),var(--teal2)); display:flex; align-items:center; justify-content:center; font-size:18px; position:relative; flex-shrink:0; }
  .ai-orb::after { content:''; position:absolute; inset:-3px; border-radius:15px; border:1px solid rgba(10,255,224,.3); animation:orbPulse 2s ease-in-out infinite; }
  @keyframes orbPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(1.1)} }
  .ai-title-wrap { flex:1; }
  .ai-title { font-size:16px; font-weight:700; }
  .ai-sub { font-size:12px; color:var(--teal); font-family:var(--mono); margin-top:2px; }
  .ai-cost { font-family:var(--mono); font-size:12px; color:var(--muted); }
  .ai-body { padding:24px 28px; }
  .ai-msg { background:rgba(255,255,255,.03); border:1px solid var(--border); border-radius:12px; padding:14px; margin-bottom:12px; }
  .ai-msg-header { font-size:12px; color:var(--muted); font-family:var(--mono); margin-bottom:8px; display:flex; align-items:center; gap:6px; }
  .ai-msg-text { font-size:14px; color:var(--muted); line-height:1.7; }
  .ai-answer-preview { background:rgba(10,255,224,.04); border:1px solid rgba(10,255,224,.15); border-radius:12px; padding:14px; position:relative; overflow:hidden; }
  .ai-answer-blur { position:absolute; inset:0; background:rgba(6,9,16,.7); display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); }
  .ai-locked-msg { text-align:center; }
  .ai-locked-icon { font-size:28px; margin-bottom:8px; }
  .ai-locked-text { font-size:13px; color:var(--muted); font-family:var(--mono); }
  .ai-ans-line { height:9px; border-radius:4px; background:rgba(10,255,224,.2); margin-bottom:8px; }

  /* ── Right column (Sticky purchase panel) ── */
  .right-col { position:sticky; top:90px; display:flex; flex-direction:column; gap:16px; }

  /* ── Purchase Card ── */
  .purchase-card {
    background:var(--bg2); border:1px solid var(--border); border-radius:var(--r); padding:28px; overflow:hidden; position:relative;
    animation:slideLeft .6s .15s ease both;
  }
  .purchase-card::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,var(--teal),transparent); }
  .price-display { margin-bottom:24px; }
  .price-big { font-size:40px; font-weight:800; letter-spacing:-2px; color:var(--teal); }
  .price-big span { font-size:16px; font-weight:400; color:var(--muted); vertical-align:super; margin-right:4px; }
  .price-compare { font-size:13px; color:var(--muted); margin-top:4px; font-family:var(--mono); }
  .price-compare s { color:var(--muted2); }

  .access-options { margin-bottom:24px; }
  .access-opt {
    display:flex; align-items:center; gap:12px;
    padding:14px; border-radius:12px; border:1px solid var(--border);
    cursor:pointer; margin-bottom:8px; transition:border-color .2s, background .2s;
    position:relative;
  }
  .access-opt.selected { border-color:var(--teal2); background:rgba(10,255,224,.05); }
  .access-opt:hover:not(.selected) { border-color:rgba(255,255,255,.15); }
  .access-opt-icon { width:38px; height:38px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
  .access-opt-body { flex:1; }
  .access-opt-name { font-size:14px; font-weight:700; margin-bottom:2px; }
  .access-opt-desc { font-size:12px; color:var(--muted); font-family:var(--mono); }
  .access-opt-price { font-family:var(--mono); font-size:14px; font-weight:700; }
  .radio-dot { width:18px; height:18px; border-radius:50%; border:2px solid var(--border); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .radio-dot.checked { border-color:var(--teal); }
  .radio-dot.checked::after { content:''; width:8px; height:8px; border-radius:50%; background:var(--teal); }

  .btn-buy {
    width:100%; background:linear-gradient(135deg,var(--teal),var(--teal2));
    color:var(--bg); border:none; padding:17px; border-radius:14px;
    font-family:var(--font); font-size:16px; font-weight:800; cursor:pointer;
    display:flex; align-items:center; justify-content:center; gap:10px;
    transition:transform .2s, box-shadow .3s; margin-bottom:12px;
    position:relative; overflow:hidden;
  }
  .btn-buy::after { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(255,255,255,.15),transparent); opacity:0; transition:opacity .2s; }
  .btn-buy:hover { transform:translateY(-2px); box-shadow:0 16px 50px rgba(10,255,224,.35); }
  .btn-buy:hover::after { opacity:1; }
  .btn-buy:active { transform:translateY(0); }

  .btn-preview-full { width:100%; background:transparent; border:1px solid var(--border); color:var(--muted); padding:13px; border-radius:12px; font-family:var(--font); font-size:14px; cursor:pointer; transition:border-color .2s,color .2s; }
  .btn-preview-full:hover { border-color:var(--border2); color:var(--text); }

  .purchase-trust { display:flex; flex-direction:column; gap:8px; margin-top:16px; padding-top:16px; border-top:1px solid var(--border); }
  .trust-item { display:flex; align-items:center; gap:8px; font-size:12px; color:var(--muted); }
  .trust-item span:first-child { color:var(--teal); font-size:14px; }

  /* ── Contributor Card ── */
  .contrib-card {
    background:var(--bg2); border:1px solid var(--border); border-radius:var(--r); padding:20px;
    animation:slideLeft .6s .25s ease both;
  }
  .contrib-header { display:flex; align-items:center; gap:12px; margin-bottom:14px; }
  .contrib-avatar { width:44px; height:44px; border-radius:12px; background:linear-gradient(135deg,#1A3A5C,#0A2040); border:1px solid var(--border); display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }
  .contrib-name { font-size:15px; font-weight:700; }
  .contrib-role { font-size:11px; color:var(--teal); font-family:var(--mono); margin-top:2px; }
  .contrib-stats { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
  .contrib-stat { background:var(--bg3); border-radius:10px; padding:10px 12px; }
  .contrib-stat-num { font-size:18px; font-weight:800; letter-spacing:-0.5px; }
  .contrib-stat-label { font-size:11px; color:var(--muted); font-family:var(--mono); margin-top:2px; }

  /* ── Related card (small bento) ── */
  .related-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:24px; }
  .rel-card { background:var(--bg2); border:1px solid var(--border); border-radius:14px; padding:16px; cursor:pointer; transition:transform .3s cubic-bezier(.34,1.56,.64,1), border-color .2s; }
  .rel-card:hover { transform:translateY(-3px); border-color:rgba(10,255,224,.2); }
  .rel-label { font-size:11px; font-family:var(--mono); color:var(--muted); margin-bottom:6px; }
  .rel-title { font-size:13px; font-weight:700; color:var(--text); margin-bottom:8px; line-height:1.3; }
  .rel-bottom { display:flex; align-items:center; justify-content:space-between; }
  .rel-price { font-family:var(--mono); font-size:12px; color:var(--teal); font-weight:600; }
  .rel-stars { font-size:10px; color:var(--gold); }

  /* ── Reviews section ── */
  .reviews-section { margin-top:20px; animation:slideUp .6s .35s ease both; }
  .review-card { background:var(--bg2); border:1px solid var(--border); border-radius:var(--r); padding:28px; }
  .review-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:24px; }
  .review-title { font-size:18px; font-weight:700; }
  .review-avg { display:flex; align-items:center; gap:12px; }
  .review-big-num { font-size:36px; font-weight:800; color:var(--gold); letter-spacing:-1px; }
  .review-bars { flex:1; }
  .review-bar-row { display:flex; align-items:center; gap:8px; margin-bottom:5px; }
  .review-bar-label { font-size:11px; font-family:var(--mono); color:var(--muted); width:10px; text-align:right; }
  .review-bar-track { flex:1; height:5px; background:rgba(255,255,255,.07); border-radius:3px; overflow:hidden; }
  .review-bar-fill { height:100%; border-radius:3px; background:var(--gold); transition:width 1.2s cubic-bezier(.4,0,.2,1); }
  .review-items { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:20px; }
  .review-item { background:var(--bg3); border-radius:14px; padding:16px; }
  .review-top { display:flex; align-items:center; gap:10px; margin-bottom:10px; }
  .review-avatar { width:32px; height:32px; border-radius:9px; display:flex; align-items:center; justify-content:center; font-size:14px; }
  .review-uname { font-size:13px; font-weight:700; }
  .review-date { font-size:11px; color:var(--muted); font-family:var(--mono); }
  .review-text { font-size:13px; color:var(--muted); line-height:1.6; }
  .review-grade { font-family:var(--mono); font-size:11px; color:var(--green); margin-top:8px; }

  /* ── Corrections tab ── */
  .tabs { display:flex; gap:4px; background:var(--bg3); padding:4px; border-radius:12px; margin-bottom:20px; }
  .tab { flex:1; padding:10px; border-radius:9px; background:transparent; border:none; font-family:var(--font); font-size:13px; font-weight:600; color:var(--muted); cursor:pointer; transition:background .2s, color .2s; }
  .tab.active { background:var(--bg2); color:var(--text); box-shadow:0 2px 8px rgba(0,0,0,.3); }

  /* ── Toast notif ── */
  .toast {
    position:fixed; bottom:24px; left:50%; transform:translateX(-50%) translateY(80px); z-index:200;
    background:var(--bg2); border:1px solid rgba(10,255,224,.3); border-radius:14px;
    padding:14px 24px; display:flex; align-items:center; gap:12px;
    font-size:14px; box-shadow:0 20px 60px rgba(0,0,0,.5);
    transition:transform .4s cubic-bezier(.34,1.56,.64,1), opacity .3s;
    opacity:0;
  }
  .toast.show { transform:translateX(-50%) translateY(0); opacity:1; }
  .toast-icon { font-size:20px; }

  /* ── Progress bar (timer) ── */
  .exam-timer { background:var(--bg3); border:1px solid var(--border); border-radius:14px; padding:16px 20px; display:flex; align-items:center; gap:16px; }
  .timer-icon { font-size:24px; }
  .timer-body { flex:1; }
  .timer-label { font-size:12px; color:var(--muted); font-family:var(--mono); margin-bottom:6px; }
  .timer-track { height:4px; background:rgba(255,255,255,.07); border-radius:2px; overflow:hidden; }
  .timer-fill { height:100%; background:linear-gradient(90deg,var(--teal),var(--green)); border-radius:2px; animation:timerFill 60s linear infinite; }
  @keyframes timerFill { from{width:0%} to{width:100%} }
  .timer-time { font-family:var(--mono); font-size:20px; font-weight:700; color:var(--teal); }

  /* ── Animations ── */
  @keyframes slideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideLeft { from{opacity:0;transform:translateX(24px)} to{opacity:1;transform:translateX(0)} }
  .reveal { opacity:0; transform:translateY(20px); transition:opacity .6s ease, transform .6s cubic-bezier(.34,1.56,.64,1); }
  .reveal.visible { opacity:1; transform:translateY(0); }
  .reveal-delay-1 { transition-delay:.1s; } .reveal-delay-2 { transition-delay:.2s; }

  /* ── Mobile ── */
  @media(max-width:900px) {
    .main-bento { grid-template-columns:1fr; }
    .right-col { position:static; }
    nav { padding:14px 20px; }
    .related-grid { grid-template-columns:1fr; }
    .review-items { grid-template-columns:1fr; }
  }
`;

// ── Data mock ──────────────────────────────────────────────────
const SUJET = {
  id: "bac-2024-maths-serie-c",
  title: "Mathématiques — BAC 2024",
  serie: "Série C & D",
  matiere: "Mathématiques",
  type: "BAC",
  annee: 2024,
  duree: "4h",
  pages: 6,
  note: 4.8,
  nbNotes: 247,
  nbAchats: 1832,
  contributeur: { name: "Rakoto Jean-Marie", role: "Contributeur Certifié ✓", avatar: "👨‍🏫", nbSujets: 38, note: 4.9 },
  description: "Sujet officiel du Baccalauréat 2024, séries C et D. Couvre l'analyse (limites, dérivées, intégrales), la géométrie dans l'espace et les probabilités. Niveau difficile — idéal pour la préparation intensive.",
  questions: [
    { num: "I", titre: "Analyse — Étude de fonctions (8 points)", detail: "Soit f la fonction définie sur ℝ par f(x) = x³ - 6x² + 9x + 2. Calculer f'(x), dresser le tableau de variation de f, puis déterminer les extrema..." },
    { num: "II", titre: "Géométrie dans l'espace (6 points)", detail: "Dans l'espace rapporté à un repère orthonormé (O, i, j, k), on donne les points A(1, 2, -1), B(3, 0, 2), C(-1, 4, 0)..." },
    { num: "III", titre: "Probabilités et statistiques (6 points)", detail: "Une urne contient 4 boules rouges et 6 boules bleues. On tire successivement et sans remise 3 boules..." },
  ],
  reviews: [
    { name: "Miora R.", avatar: "🧑‍🎓", bg: "#1A2F5A", date: "Il y a 3 jours", text: "Correction très détaillée, chaque étape expliquée. J'ai compris des notions que je n'arrivais pas à saisir.", grade: "BAC obtenu mention Bien ✓", stars: 5 },
    { name: "Fidy M.", avatar: "👨‍💻", bg: "#2A1A4A", date: "Il y a 1 semaine", text: "La correction IA est bluffante pour les maths. Elle explique les erreurs sans donner la réponse directement.", grade: "En préparation", stars: 5 },
    { name: "Lalaina V.", avatar: "👩‍🎓", bg: "#1A3A3A", date: "Il y a 2 semaines", text: "Sujet conforme à l'original. La mise en forme est propre, les formules lisibles. Très utile.", grade: "BAC avec mention TB ✓", stars: 4 },
    { name: "Tiana H.", avatar: "🧑", bg: "#3A2A1A", date: "Il y a 1 mois", text: "Je recommande ce sujet à tous les candidats série C. La correction du professeur est plus complète que celle de mon lycée.", grade: "Prépa grande école", stars: 5 },
  ],
};

export default function MahAISubjectPage() {
  const [selected, setSelected] = useState("sujet");
  const [activeTab, setActiveTab] = useState("apercu");
  const [toast, setToast] = useState({ show: false, msg: "" });
  const [barWidths, setBarWidths] = useState([0, 0, 0, 0, 0]);
  const reviewRef = useRef(null);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = GLOBAL_CSS;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); });
    }, { threshold: 0.1 });
    document.querySelectorAll(".reveal").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  // Animate review bars when visible
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) setBarWidths([78, 15, 5, 2, 0]);
      });
    }, { threshold: 0.3 });
    if (reviewRef.current) obs.observe(reviewRef.current);
    return () => obs.disconnect();
  }, []);

  const showToast = (msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 3000);
  };

  const accessOptions = [
    { id: "sujet", icon: "📄", name: "Sujet seul", desc: "Accès complet au sujet + PDF", price: "2 crédits", priceAr: "1 000 Ar", color: "var(--teal)" },
    { id: "correction_ia", icon: "🤖", name: "Sujet + Correction IA", desc: "IA explique chaque exercice", price: "4 crédits", priceAr: "2 000 Ar", color: "var(--blue)" },
    { id: "correction_prof", icon: "🎓", name: "Sujet + Correction Professeur", desc: "Correction humaine certifiée", price: "8 crédits", priceAr: "4 000 Ar", color: "var(--gold)" },
  ];

  return (
    <div style={{ minHeight: "100vh" }}>
      <div className="mesh"><span /><span /><span /></div>

      {/* Nav */}
      <nav>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button className="btn-back">← Retour</button>
          <div className="nav-logo">Mah.AI</div>
        </div>
        <div className="nav-right">
          <div className="nav-credits">💎 12 crédits</div>
          <div className="nav-avatar">👤</div>
        </div>
      </nav>

      <div className="page">
        <div className="container">
          {/* Breadcrumb */}
          <div className="breadcrumb">
            <a href="#">Accueil</a><span>/</span>
            <a href="#">Catalogue</a><span>/</span>
            <a href="#">BAC</a><span>/</span>
            <a href="#">Mathématiques</a><span>/</span>
            <span style={{ color: "var(--text)" }}>BAC 2024 Maths Série C</span>
          </div>

          {/* Main Bento */}
          <div className="main-bento">
            {/* ── LEFT ── */}
            <div className="left-col">

              {/* Header */}
              <div className="header-card">
                <div className="subject-meta">
                  <span className="meta-badge mb-teal">🎓 BAC</span>
                  <span className="meta-badge mb-gold">📐 Mathématiques</span>
                  <span className="meta-badge mb-rose">Série C & D</span>
                  <span className="meta-badge mb-blue">2024</span>
                  <span className="meta-badge mb-muted">⏱ 4h</span>
                </div>
                <h1 className="subject-title">Mathématiques — Baccalauréat 2024<br /><span style={{ color: "var(--muted)", fontWeight: 300 }}>Séries C et D · Sujet officiel</span></h1>
                <p className="subject-desc">{SUJET.description}</p>
                <div className="subject-stats-row">
                  <div className="stat-chip">
                    <span className="stars">★★★★★</span>
                    <strong>{SUJET.note}</strong>
                    <span>({SUJET.nbNotes} avis)</span>
                  </div>
                  <div className="stat-chip">👥 <strong>{SUJET.nbAchats.toLocaleString()}</strong> <span>consultations</span></div>
                  <div className="stat-chip">📄 <strong>{SUJET.pages}</strong> <span>pages</span></div>
                  <div className="stat-chip">⏱ <strong>{SUJET.duree}</strong> <span>durée</span></div>
                </div>
              </div>

              {/* Tabs */}
              <div className="reveal">
                <div className="tabs">
                  {[
                    { id: "apercu", label: "👁 Aperçu" },
                    { id: "correction", label: "🤖 Correction IA" },
                    { id: "examenblanc", label: "📝 Examen blanc" },
                  ].map(t => (
                    <button key={t.id} className={`tab ${activeTab === t.id ? "active" : ""}`} onClick={() => setActiveTab(t.id)}>
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Tab: Aperçu */}
                {activeTab === "apercu" && (
                  <div className="preview-card">
                    <div className="preview-header">
                      <div className="preview-title">📄 Aperçu du sujet <span className="preview-badge">🔒 Pages 3-6 verrouillées</span></div>
                    </div>
                    <div className="preview-body">
                      <div className="preview-content">
                        <div style={{ background: "var(--bg3)", borderRadius: 12, padding: "16px 20px", marginBottom: 20, borderLeft: "3px solid var(--teal)" }}>
                          <div style={{ fontSize: 11, color: "var(--teal)", fontFamily: "var(--mono)", marginBottom: 6 }}>INSTRUCTIONS GÉNÉRALES</div>
                          <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7 }}>
                            La calculatrice est autorisée. Le candidat traitera les trois exercices dans l'ordre de son choix. Chaque exercice est indépendant. La présentation, la lisibilité, l'orthographe et la qualité de la rédaction sont pris en compte.
                          </div>
                        </div>
                        {SUJET.questions.map((q, i) => (
                          <div key={q.num} style={{ marginBottom: 20, opacity: i === 2 ? 0.5 : 1 }}>
                            <div className="q-num">Exercice {q.num}</div>
                            <div className="q-text">{q.titre}</div>
                            {i < 2 && <div className="q-detail">{q.detail}</div>}
                          </div>
                        ))}
                      </div>
                      <div className="preview-blur">
                        <div className="preview-unlock">
                          🔒 Achète ce sujet pour accéder aux 4 pages restantes + PDF téléchargeable
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab: Correction IA */}
                {activeTab === "correction" && (
                  <div className="ai-card">
                    <div className="ai-header">
                      <div className="ai-orb">🤖</div>
                      <div className="ai-title-wrap">
                        <div className="ai-title">Correction Intelligente</div>
                        <div className="ai-sub">Alimentée par Perplexity AI · Sonar Large</div>
                      </div>
                      <div className="ai-cost">4 crédits</div>
                    </div>
                    <div className="ai-body">
                      <div className="ai-msg">
                        <div className="ai-msg-header">👤 Ta question — Exercice I</div>
                        <div className="ai-msg-text" style={{ color: "var(--text)" }}>Je n'arrive pas à trouver les extrema de la fonction f. J'ai calculé f'(x) = 3x² - 12x + 9 mais je ne sais pas quoi faire ensuite.</div>
                      </div>
                      <div className="ai-msg">
                        <div className="ai-msg-header">🤖 Mah.AI — Guide progressif</div>
                        <div className="ai-msg-text">
                          Excellent début ! Tu as bien calculé f'(x). Maintenant, rappelle-toi : les extrema se trouvent là où f'(x) = 0. <br /><br />
                          Essaie de résoudre 3x² - 12x + 9 = 0. Peux-tu simplifier cette équation en divisant par 3 ? Que remarques-tu ?
                        </div>
                      </div>
                      <div style={{ position: "relative" }}>
                        <div className="ai-answer-preview">
                          {[80, 60, 90, 45, 70].map((w, i) => (
                            <div key={i} className="ai-ans-line" style={{ width: `${w}%`, opacity: 0.6 - i * 0.08 }} />
                          ))}
                        </div>
                        <div className="ai-answer-blur">
                          <div className="ai-locked-msg">
                            <div className="ai-locked-icon">🔒</div>
                            <div className="ai-locked-text">Correction complète disponible<br />pour 4 crédits</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab: Examen blanc */}
                {activeTab === "examenblanc" && (
                  <div className="preview-card">
                    <div className="preview-header">
                      <div className="preview-title">📝 Mode Examen Blanc</div>
                      <span className="meta-badge mb-gold" style={{ fontSize: 11 }}>⏱ 4h chronomètre</span>
                    </div>
                    <div style={{ padding: 28 }}>
                      <div className="exam-timer" style={{ marginBottom: 20 }}>
                        <div className="timer-icon">⏱</div>
                        <div className="timer-body">
                          <div className="timer-label">Durée officielle</div>
                          <div className="timer-track"><div className="timer-fill" /></div>
                        </div>
                        <div className="timer-time">4:00:00</div>
                      </div>
                      {[
                        { label: "📊 Notation automatique", desc: "Score calculé sur 20 pts selon le barème officiel" },
                        { label: "🤖 Analyse IA post-examen", desc: "L'IA analyse tes erreurs et suggère des révisions" },
                        { label: "📈 Historique des scores", desc: "Suis ta progression sur plusieurs tentatives" },
                        { label: "👥 Comparaison anonyme", desc: "Compare ton score à la moyenne de la plateforme" },
                      ].map(f => (
                        <div key={f.label} style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(10,255,224,.08)", border: "1px solid rgba(10,255,224,.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{f.label.split(" ")[0]}</div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{f.label.slice(2)}</div>
                            <div style={{ fontSize: 12, color: "var(--muted)" }}>{f.desc}</div>
                          </div>
                        </div>
                      ))}
                      <button className="btn-buy" style={{ marginTop: 8 }} onClick={() => showToast("⏱ Examen blanc démarré ! Bonne chance !")}>
                        🚀 Démarrer l'examen blanc · 3 crédits
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Reviews */}
              <div className="reviews-section reveal" ref={reviewRef}>
                <div className="review-card">
                  <div className="review-header">
                    <div className="review-title">⭐ Avis des étudiants</div>
                    <div className="review-avg">
                      <div>
                        <div className="review-big-num">{SUJET.note}</div>
                        <div className="stars" style={{ fontSize: 16 }}>★★★★★</div>
                        <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--mono)", marginTop: 4 }}>{SUJET.nbNotes} avis</div>
                      </div>
                      <div className="review-bars">
                        {[[5, barWidths[0]], [4, barWidths[1]], [3, barWidths[2]], [2, barWidths[3]], [1, barWidths[4]]].map(([n, w]) => (
                          <div key={n} className="review-bar-row">
                            <div className="review-bar-label">{n}</div>
                            <div className="review-bar-track">
                              <div className="review-bar-fill" style={{ width: `${w}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="review-items">
                    {SUJET.reviews.map((r) => (
                      <div key={r.name} className="review-item">
                        <div className="review-top">
                          <div className="review-avatar" style={{ background: r.bg }}>{r.avatar}</div>
                          <div>
                            <div className="review-uname">{r.name}</div>
                            <div className="review-date">{r.date}</div>
                          </div>
                          <div style={{ marginLeft: "auto", color: "var(--gold)", fontSize: 11 }}>{"★".repeat(r.stars)}</div>
                        </div>
                        <div className="review-text">{r.text}</div>
                        <div className="review-grade">{r.grade}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* ── RIGHT (sticky) ── */}
            <div className="right-col">

              {/* Purchase card */}
              <div className="purchase-card">
                <div className="price-display">
                  <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--mono)", marginBottom: 4 }}>À partir de</div>
                  <div className="price-big">
                    <span>Ar</span>
                    {accessOptions.find(o => o.id === selected)?.priceAr.replace(" Ar", "").replace(" ", "")}
                  </div>
                  <div className="price-compare">
                    {accessOptions.find(o => o.id === selected)?.price} · <s>valeur Ar {
                      selected === "sujet" ? "2 500" : selected === "correction_ia" ? "5 000" : "10 000"
                    }</s>
                  </div>
                </div>

                <div className="access-options">
                  <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--mono)", marginBottom: 10 }}>CHOISIR TON ACCÈS</div>
                  {accessOptions.map(opt => (
                    <div key={opt.id} className={`access-opt ${selected === opt.id ? "selected" : ""}`} onClick={() => setSelected(opt.id)}>
                      <div className="radio-dot checked={selected === opt.id ? 'true' : ''}" style={{ borderColor: selected === opt.id ? opt.color : "var(--border)" }}>
                        {selected === opt.id && <div style={{ width: 8, height: 8, borderRadius: "50%", background: opt.color }} />}
                      </div>
                      <div className="access-opt-icon" style={{ background: `${opt.color}11`, border: `1px solid ${opt.color}33` }}>
                        {opt.icon}
                      </div>
                      <div className="access-opt-body">
                        <div className="access-opt-name" style={{ color: selected === opt.id ? opt.color : "var(--text)" }}>{opt.name}</div>
                        <div className="access-opt-desc">{opt.desc}</div>
                      </div>
                      <div className="access-opt-price" style={{ color: selected === opt.id ? opt.color : "var(--muted)" }}>{opt.price}</div>
                    </div>
                  ))}
                </div>

                <button className="btn-buy" onClick={() => showToast(`✅ Accès "${accessOptions.find(o=>o.id===selected)?.name}" débloqué !`)}>
                  💳 Payer avec MVola · {accessOptions.find(o => o.id === selected)?.priceAr}
                </button>
                <button className="btn-preview-full">Voir l'aperçu gratuit →</button>

                <div className="purchase-trust">
                  <div className="trust-item"><span>✓</span> Paiement sécurisé MVola & Orange Money</div>
                  <div className="trust-item"><span>✓</span> Accès immédiat après paiement confirmé</div>
                  <div className="trust-item"><span>✓</span> PDF téléchargeable avec watermark nominatif</div>
                  <div className="trust-item"><span>↩</span> Remboursement en crédits sous 48h si problème</div>
                </div>
              </div>

              {/* Contributor */}
              <div className="contrib-card">
                <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--mono)", marginBottom: 14 }}>CONTRIBUTEUR</div>
                <div className="contrib-header">
                  <div className="contrib-avatar">{SUJET.contributeur.avatar}</div>
                  <div>
                    <div className="contrib-name">{SUJET.contributeur.name}</div>
                    <div className="contrib-role">{SUJET.contributeur.role}</div>
                  </div>
                </div>
                <div className="contrib-stats">
                  <div className="contrib-stat">
                    <div className="contrib-stat-num" style={{ color: "var(--teal)" }}>{SUJET.contributeur.nbSujets}</div>
                    <div className="contrib-stat-label">sujets publiés</div>
                  </div>
                  <div className="contrib-stat">
                    <div className="contrib-stat-num" style={{ color: "var(--gold)" }}>★ {SUJET.contributeur.note}</div>
                    <div className="contrib-stat-label">note moyenne</div>
                  </div>
                </div>
              </div>

              {/* Related subjects */}
              <div>
                <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--mono)", marginBottom: 12 }}>SUJETS SIMILAIRES</div>
                <div className="related-grid">
                  {[
                    { label: "BAC 2023 · Maths", title: "Mathématiques Série C — 2023", price: "2 crédits", stars: "★★★★★" },
                    { label: "BAC 2024 · Phys", title: "Physique-Chimie Série C — 2024", price: "2 crédits", stars: "★★★★☆" },
                    { label: "BEPC 2024 · Maths", title: "Mathématiques BEPC — 2024", price: "1 crédit", stars: "★★★★★" },
                    { label: "BAC 2022 · Maths", title: "Mathématiques Série D — 2022", price: "2 crédits", stars: "★★★★☆" },
                  ].map((s) => (
                    <div key={s.title} className="rel-card">
                      <div className="rel-label">{s.label}</div>
                      <div className="rel-title">{s.title}</div>
                      <div className="rel-bottom">
                        <div className="rel-price">{s.price}</div>
                        <div className="rel-stars">{s.stars}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      <div className={`toast ${toast.show ? "show" : ""}`}>
        <span className="toast-icon">🎉</span>
        <span>{toast.msg}</span>
      </div>
    </div>
  );
}
