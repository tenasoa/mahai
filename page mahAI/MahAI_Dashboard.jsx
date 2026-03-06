import { useState, useEffect, useRef } from "react";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,700;12..96,800&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --teal:#0AFFE0;--teal2:#00C9A7;--green:#00FF88;--gold:#FFD166;
    --rose:#FF6B9D;--blue:#4F8EF7;--purple:#A78BFA;--orange:#FF9F43;
    --bg:#060910;--bg2:#0C1220;--bg3:#111928;--bg4:#0A1628;
    --border:rgba(255,255,255,0.07);--border2:rgba(10,255,224,0.2);
    --text:#F0F4FF;--muted:#6B7899;--muted2:#3A4560;
    --font:'Bricolage Grotesque',sans-serif;--mono:'DM Mono',monospace;
    --r:18px;
  }
  html{scroll-behavior:smooth}
  body{font-family:var(--font);background:var(--bg);color:var(--text);overflow-x:hidden;-webkit-font-smoothing:antialiased}
  ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:var(--bg)}::-webkit-scrollbar-thumb{background:var(--teal2);border-radius:2px}
  body::before{content:'';position:fixed;inset:0;z-index:0;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");opacity:.35;pointer-events:none}

  /* mesh */
  .mesh{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden}
  .mesh span{position:absolute;border-radius:50%;filter:blur(140px);opacity:.06;animation:fm 22s ease-in-out infinite alternate}
  .mesh span:nth-child(1){width:600px;height:600px;top:-150px;left:-150px;background:var(--teal);animation-delay:0s}
  .mesh span:nth-child(2){width:400px;height:400px;bottom:0;right:-100px;background:var(--purple);animation-delay:-9s}
  .mesh span:nth-child(3){width:350px;height:350px;top:50%;left:40%;background:var(--blue);animation-delay:-17s}
  @keyframes fm{0%{transform:translate(0,0) scale(1)}50%{transform:translate(25px,-20px) scale(1.06)}100%{transform:translate(-20px,25px) scale(.96)}}

  /* ── SIDEBAR ── */
  .sidebar{
    position:fixed;top:0;left:0;bottom:0;width:240px;z-index:50;
    background:rgba(6,9,16,.85);backdrop-filter:blur(20px);
    border-right:1px solid var(--border);
    display:flex;flex-direction:column;padding:0;
    transition:transform .3s ease;
  }
  .sidebar-logo{padding:24px 24px 20px;border-bottom:1px solid var(--border)}
  .logo-text{font-size:22px;font-weight:800;letter-spacing:-1px;background:linear-gradient(135deg,var(--teal),var(--green));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
  .logo-sub{font-size:11px;color:var(--muted);font-family:var(--mono);margin-top:2px}

  .sidebar-user{padding:16px 20px;margin:12px;background:var(--bg2);border:1px solid var(--border);border-radius:14px;display:flex;align-items:center;gap:12px}
  .user-avatar{width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,#1A3A5C,var(--teal2));display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;position:relative}
  .user-online{position:absolute;bottom:-2px;right:-2px;width:10px;height:10px;border-radius:50%;background:var(--green);border:2px solid var(--bg2);animation:onlinePulse 2s ease-in-out infinite}
  @keyframes onlinePulse{0%,100%{box-shadow:0 0 0 0 rgba(0,255,136,.4)}50%{box-shadow:0 0 0 4px rgba(0,255,136,0)}}
  .user-name{font-size:13px;font-weight:700}
  .user-role{font-size:11px;color:var(--muted);font-family:var(--mono)}

  .sidebar-nav{flex:1;padding:8px 12px;overflow-y:auto}
  .nav-section{font-size:10px;color:var(--muted2);font-family:var(--mono);letter-spacing:.12em;text-transform:uppercase;padding:14px 12px 6px}
  .nav-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;cursor:pointer;transition:background .2s,color .2s;color:var(--muted);font-size:13px;font-weight:500;margin-bottom:2px;text-decoration:none;position:relative}
  .nav-item:hover{background:rgba(255,255,255,.04);color:var(--text)}
  .nav-item.active{background:rgba(10,255,224,.08);color:var(--teal);border:1px solid rgba(10,255,224,.15)}
  .nav-item .nav-icon{font-size:16px;width:20px;text-align:center;flex-shrink:0}
  .nav-badge{margin-left:auto;background:var(--rose);color:#fff;font-size:10px;font-weight:700;padding:2px 7px;border-radius:100px;font-family:var(--mono)}

  .sidebar-credits{margin:12px;background:linear-gradient(135deg,rgba(10,255,224,.08),rgba(10,255,224,.03));border:1px solid rgba(10,255,224,.2);border-radius:14px;padding:14px 16px}
  .credits-label{font-size:11px;color:var(--teal);font-family:var(--mono);margin-bottom:4px}
  .credits-num{font-size:26px;font-weight:800;letter-spacing:-1px;color:var(--teal)}
  .credits-sub{font-size:11px;color:var(--muted);margin-top:2px}
  .btn-recharge{width:100%;background:linear-gradient(135deg,var(--teal),var(--teal2));color:var(--bg);border:none;padding:9px;border-radius:10px;font-family:var(--font);font-size:13px;font-weight:700;cursor:pointer;margin-top:10px;transition:opacity .2s}
  .btn-recharge:hover{opacity:.85}

  /* ── MAIN ── */
  .main{margin-left:240px;min-height:100vh;padding:0}

  /* topbar */
  .topbar{position:sticky;top:0;z-index:40;background:rgba(6,9,16,.8);backdrop-filter:blur(20px);border-bottom:1px solid var(--border);padding:14px 32px;display:flex;align-items:center;justify-content:space-between}
  .topbar-left h1{font-size:22px;font-weight:800;letter-spacing:-.5px}
  .topbar-left p{font-size:13px;color:var(--muted);margin-top:2px}
  .topbar-right{display:flex;align-items:center;gap:12px}
  .notif-btn{width:36px;height:36px;border-radius:10px;background:var(--bg2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:16px;position:relative;transition:border-color .2s}
  .notif-btn:hover{border-color:var(--border2)}
  .notif-dot{position:absolute;top:6px;right:6px;width:7px;height:7px;border-radius:50%;background:var(--rose);border:1.5px solid var(--bg)}
  .search-bar{display:flex;align-items:center;gap:8px;background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:8px 14px;font-size:13px;color:var(--muted);font-family:var(--mono);min-width:200px;cursor:pointer;transition:border-color .2s}
  .search-bar:hover{border-color:var(--border2)}

  /* content */
  .content{padding:28px 32px;position:relative;z-index:1}

  /* ── BENTO GRID ── */
  .bento{display:grid;gap:16px}

  /* Grid A — Stats row */
  .grid-stats{grid-template-columns:repeat(4,1fr)}

  /* Grid B — Main content */
  .grid-main{grid-template-columns:1fr 1fr 1fr;grid-template-rows:auto auto}
  .grid-main .span2{grid-column:span 2}

  /* Grid C — Activity */
  .grid-activity{grid-template-columns:2fr 1fr}

  /* ── CARD BASE ── */
  .card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r);padding:24px;position:relative;overflow:hidden;transition:transform .3s cubic-bezier(.34,1.56,.64,1),border-color .25s,box-shadow .3s}
  .card::before{content:'';position:absolute;inset:0;opacity:0;background:radial-gradient(circle at var(--mx,50%) var(--my,50%),rgba(10,255,224,.05),transparent 60%);transition:opacity .4s;pointer-events:none}
  .card:hover{transform:translateY(-3px);border-color:rgba(255,255,255,.12);box-shadow:0 20px 50px rgba(0,0,0,.35)}
  .card:hover::before{opacity:1}

  /* ── STAT CARDS ── */
  .stat-card{padding:20px 22px}
  .stat-icon{width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:18px;margin-bottom:14px;flex-shrink:0}
  .stat-val{font-size:28px;font-weight:800;letter-spacing:-1px;margin-bottom:2px}
  .stat-label{font-size:12px;color:var(--muted);font-family:var(--mono)}
  .stat-trend{font-size:11px;font-family:var(--mono);margin-top:6px;display:flex;align-items:center;gap:4px}
  .trend-up{color:var(--green)}
  .trend-down{color:var(--rose)}

  /* ── PROGRESS CARD ── */
  .prog-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:20px}
  .prog-title{font-size:16px;font-weight:700}
  .prog-sub{font-size:12px;color:var(--muted);font-family:var(--mono);margin-top:3px}
  .prog-pct{font-size:28px;font-weight:800;letter-spacing:-1px;color:var(--teal)}
  .prog-bar-wrap{margin-bottom:16px}
  .prog-bar-label{display:flex;justify-content:space-between;font-size:12px;color:var(--muted);font-family:var(--mono);margin-bottom:6px}
  .prog-bar-track{height:6px;background:rgba(255,255,255,.06);border-radius:3px;overflow:hidden}
  .prog-bar-fill{height:100%;border-radius:3px;transition:width 1.4s cubic-bezier(.4,0,.2,1)}

  /* ── EXAM SCORES ── */
  .score-list{display:flex;flex-direction:column;gap:10px}
  .score-row{display:flex;align-items:center;gap:12px;padding:10px 12px;background:var(--bg3);border-radius:12px;transition:background .2s}
  .score-row:hover{background:rgba(10,255,224,.05)}
  .score-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
  .score-matiere{flex:1;font-size:13px;font-weight:600}
  .score-date{font-size:11px;color:var(--muted);font-family:var(--mono)}
  .score-note{font-family:var(--mono);font-size:14px;font-weight:700;min-width:50px;text-align:right}
  .score-bar-mini{flex:1;max-width:80px;height:4px;background:rgba(255,255,255,.07);border-radius:2px;overflow:hidden}
  .score-bar-fill{height:100%;border-radius:2px}

  /* ── RÉCENTS ── */
  .recent-item{display:flex;align-items:center;gap:12px;padding:12px;background:var(--bg3);border-radius:12px;margin-bottom:8px;cursor:pointer;transition:background .2s,transform .2s}
  .recent-item:hover{background:rgba(10,255,224,.05);transform:translateX(3px)}
  .recent-thumb{width:44px;height:44px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}
  .recent-body{flex:1}
  .recent-title{font-size:13px;font-weight:700;margin-bottom:2px}
  .recent-meta{font-size:11px;color:var(--muted);font-family:var(--mono)}
  .recent-action{font-size:11px;font-family:var(--mono);color:var(--teal);opacity:0}
  .recent-item:hover .recent-action{opacity:1}

  /* ── CALENDAR ── */
  .cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:16px}
  .cal-day-name{font-size:10px;font-family:var(--mono);color:var(--muted);text-align:center;padding:4px 0}
  .cal-day{height:28px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:11px;font-family:var(--mono);cursor:pointer;transition:background .2s;color:var(--muted)}
  .cal-day.today{background:var(--teal);color:var(--bg);font-weight:700}
  .cal-day.has-exam{background:rgba(255,209,102,.12);color:var(--gold);border:1px solid rgba(255,209,102,.2)}
  .cal-day.studied{background:rgba(10,255,224,.08);color:var(--teal)}
  .cal-day:hover:not(.today){background:rgba(255,255,255,.08)}
  .cal-legend{display:flex;gap:16px;flex-wrap:wrap}
  .cal-leg-item{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--muted);font-family:var(--mono)}
  .cal-leg-dot{width:8px;height:8px;border-radius:50%}

  /* ── AI RECOMMANDATIONS ── */
  .ai-reco-card{background:linear-gradient(135deg,#0A1E3A,var(--bg2));border-color:rgba(10,255,224,.2)}
  .ai-header-row{display:flex;align-items:center;gap:10px;margin-bottom:18px}
  .ai-orb{width:36px;height:36px;border-radius:11px;background:linear-gradient(135deg,var(--teal),var(--teal2));display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;position:relative}
  .ai-orb::after{content:'';position:absolute;inset:-3px;border-radius:14px;border:1px solid rgba(10,255,224,.3);animation:op 2s ease-in-out infinite}
  @keyframes op{0%,100%{opacity:1}50%{opacity:.3}}
  .reco-item{display:flex;gap:10px;padding:10px;background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:10px;margin-bottom:8px;cursor:pointer;transition:background .2s,border-color .2s}
  .reco-item:hover{background:rgba(10,255,224,.05);border-color:rgba(10,255,224,.15)}
  .reco-emoji{font-size:20px;flex-shrink:0;margin-top:2px}
  .reco-text{font-size:13px;color:var(--muted);line-height:1.5}
  .reco-text strong{color:var(--text);display:block;margin-bottom:3px;font-size:13px}
  .reco-cta{font-size:11px;color:var(--teal);font-family:var(--mono);margin-top:4px}

  /* ── STREAK ── */
  .streak-card{background:linear-gradient(135deg,rgba(255,209,102,.06),var(--bg2));border-color:rgba(255,209,102,.2)}
  .streak-num{font-size:52px;font-weight:800;letter-spacing:-3px;color:var(--gold);line-height:1}
  .streak-label{font-size:12px;color:var(--muted);font-family:var(--mono);margin-top:4px}
  .streak-days{display:flex;gap:4px;margin-top:14px}
  .streak-day{width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:10px;font-family:var(--mono);border:1px solid var(--border);color:var(--muted);transition:all .3s}
  .streak-day.done{background:rgba(255,209,102,.12);border-color:rgba(255,209,102,.25);color:var(--gold)}
  .streak-day.today-s{background:var(--gold);color:var(--bg);font-weight:700;box-shadow:0 4px 14px rgba(255,209,102,.3)}

  /* ── OBJECTIF BAC ── */
  .bac-countdown{text-align:center;padding:6px 0}
  .bac-days{font-size:56px;font-weight:800;letter-spacing:-3px;background:linear-gradient(135deg,var(--teal),var(--green));-webkit-background-clip:text;-webkit-text-fill-color:transparent;line-height:1}
  .bac-label{font-size:12px;color:var(--muted);font-family:var(--mono);margin-top:4px;margin-bottom:18px}
  .bac-prog-wrap{background:var(--bg3);border-radius:12px;padding:14px 16px}
  .bac-prog-row{display:flex;justify-content:space-between;font-size:12px;color:var(--muted);font-family:var(--mono);margin-bottom:8px}
  .bac-prog-bar-track{height:6px;background:rgba(255,255,255,.06);border-radius:3px;overflow:hidden}
  .bac-prog-bar-fill{height:100%;border-radius:3px;background:linear-gradient(90deg,var(--teal),var(--green));transition:width 1.6s cubic-bezier(.4,0,.2,1)}
  .bac-matiere-list{margin-top:12px;display:flex;flex-direction:column;gap:7px}
  .bac-mat-row{display:flex;align-items:center;gap:8px;font-size:12px}
  .bac-mat-name{width:90px;color:var(--muted);font-family:var(--mono);font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .bac-mat-bar{flex:1;height:4px;background:rgba(255,255,255,.06);border-radius:2px;overflow:hidden}
  .bac-mat-fill{height:100%;border-radius:2px;transition:width 1.4s cubic-bezier(.4,0,.2,1) var(--delay,0s)}
  .bac-mat-pct{font-family:var(--mono);font-size:11px;width:28px;text-align:right}

  /* ── ACTIVITY CHART ── */
  .chart-wrap{display:flex;align-items:flex-end;gap:6px;height:80px;margin:16px 0 8px}
  .chart-bar-wrap{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px}
  .chart-bar{width:100%;border-radius:4px 4px 0 0;transition:height .8s cubic-bezier(.4,0,.2,1),background .2s;cursor:pointer;min-height:4px;position:relative}
  .chart-bar:hover{filter:brightness(1.3)}
  .chart-bar::after{content:attr(data-val);position:absolute;bottom:calc(100% + 4px);left:50%;transform:translateX(-50%);font-size:10px;color:var(--text);font-family:var(--mono);white-space:nowrap;opacity:0;transition:opacity .2s}
  .chart-bar:hover::after{opacity:1}
  .chart-label{font-size:10px;font-family:var(--mono);color:var(--muted)}

  /* ── NOTIF PANEL ── */
  .notif-panel{position:fixed;top:70px;right:20px;width:320px;background:var(--bg2);border:1px solid var(--border);border-radius:18px;z-index:200;box-shadow:0 24px 60px rgba(0,0,0,.5);overflow:hidden;transition:opacity .3s,transform .3s cubic-bezier(.34,1.56,.64,1)}
  .notif-panel.hidden{opacity:0;transform:translateY(-10px) scale(.97);pointer-events:none}
  .notif-panel-header{padding:16px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}
  .notif-panel-title{font-size:15px;font-weight:700}
  .notif-panel-close{background:none;border:none;color:var(--muted);font-size:20px;cursor:pointer;line-height:1}
  .notif-item{display:flex;gap:12px;padding:14px 20px;border-bottom:1px solid var(--border);cursor:pointer;transition:background .2s}
  .notif-item:hover{background:rgba(255,255,255,.03)}
  .notif-item.unread{background:rgba(10,255,224,.03)}
  .notif-dot-indicator{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:5px}
  .notif-body{flex:1}
  .notif-text{font-size:13px;color:var(--text);line-height:1.5;margin-bottom:4px}
  .notif-time{font-size:11px;color:var(--muted);font-family:var(--mono)}

  /* ── ANIMATIONS ── */
  @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  @keyframes slideRight{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}
  @keyframes countUp{from{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}}
  .anim-0{animation:slideUp .5s ease both}
  .anim-1{animation:slideUp .5s .08s ease both}
  .anim-2{animation:slideUp .5s .16s ease both}
  .anim-3{animation:slideUp .5s .24s ease both}
  .anim-4{animation:slideUp .5s .32s ease both}
  .anim-5{animation:slideUp .5s .40s ease both}
  .anim-6{animation:slideUp .5s .48s ease both}
  .anim-7{animation:slideUp .5s .56s ease both}

  /* ── MOBILE ── */
  @media(max-width:900px){
    .sidebar{transform:translateX(-100%)}
    .main{margin-left:0}
    .content{padding:16px}
    .grid-stats{grid-template-columns:repeat(2,1fr)}
    .grid-main{grid-template-columns:1fr}
    .grid-main .span2{grid-column:span 1}
    .grid-activity{grid-template-columns:1fr}
    .topbar{padding:12px 16px}
  }
`;

// ── Data ────────────────────────────────────────────────────────
const SCORES = [
  { matiere: "Mathématiques", date: "Hier", note: 14.5, max: 20, color: "var(--teal)" },
  { matiere: "Physique-Chimie", date: "Il y a 3j", note: 12, max: 20, color: "var(--blue)" },
  { matiere: "Français", date: "La semaine passée", note: 16, max: 20, color: "var(--rose)" },
  { matiere: "SVT", date: "Il y a 10j", note: 11.5, max: 20, color: "var(--green)" },
];
const RECENTS = [
  { emoji: "📐", bg: "rgba(10,255,224,.1)", title: "Maths BAC 2024 — Série C", meta: "Consulté hier · 6 pages", action: "Continuer →" },
  { emoji: "⚗️", bg: "rgba(79,142,247,.1)", title: "Physique-Chimie BEPC 2023", meta: "Téléchargé il y a 3j", action: "Voir →" },
  { emoji: "📖", bg: "rgba(255,107,157,.1)", title: "Français BAC 2024", meta: "Correction IA achetée", action: "Voir →" },
  { emoji: "🌿", bg: "rgba(0,255,136,.1)", title: "SVT Série D 2022", meta: "Examen blanc : 11.5/20", action: "Refaire →" },
];
const RECOS = [
  { emoji: "🎯", titre: "Révise les intégrales", desc: "Tu as raté 3 questions sur 4 dans les derniers examens. Voici 5 sujets ciblés.", cta: "Voir les sujets →" },
  { emoji: "📈", titre: "Ton examen blanc demain", desc: "Plan IA : 2h de Maths + 1h de Physique avant de dormir.", cta: "Démarrer la session →" },
  { emoji: "💡", titre: "Nouveau sujet disponible", desc: "BAC 2024 Philosophie série A vient d'être publié par Prof. Andria.", cta: "Consulter →" },
];
const BAC_MATIERES = [
  { name: "Mathématiques", pct: 68, color: "var(--teal)" },
  { name: "Phys-Chimie", pct: 45, color: "var(--blue)" },
  { name: "SVT", pct: 55, color: "var(--green)" },
  { name: "Français", pct: 80, color: "var(--rose)" },
  { name: "Philosophie", pct: 30, color: "var(--purple)" },
  { name: "Hist-Géo", pct: 50, color: "var(--gold)" },
];
const ACTIVITY = [
  { day: "L", val: 2 }, { day: "M", val: 5 }, { day: "M", val: 3 },
  { day: "J", val: 7 }, { day: "V", val: 4 }, { day: "S", val: 8 },
  { day: "D", val: 6 },
];
const CAL_DAYS = [
  null, null, 1, 2, 3, 4, 5,
  6, 7, 8, 9, 10, 11, 12,
  13, 14, 15, 16, 17, 18, 19,
  20, 21, 22, 23, 24, 25, 26,
  27, 28, 29, 30, 31, null, null,
];
const EXAM_DAYS = [8, 22];
const STUDIED_DAYS = [1, 2, 3, 5, 6, 7, 9, 10, 13, 14, 15, 17, 18, 20, 21];
const TODAY_DAY = 24;

const NOTIFS = [
  { unread: true, dot: "var(--teal)", text: "🤖 Correction IA disponible pour Maths BAC 2024", time: "Il y a 5 min" },
  { unread: true, dot: "var(--gold)", text: "⭐ Nouveau sujet validé : Phys-Chimie Série D 2024", time: "Il y a 1h" },
  { unread: true, dot: "var(--rose)", text: "💳 Paiement MVola confirmé — +10 crédits ajoutés", time: "Il y a 2h" },
  { unread: false, dot: "var(--muted2)", text: "📊 Ton score de la semaine : 14.2/20 en moyenne", time: "Hier" },
  { unread: false, dot: "var(--muted2)", text: "🎓 Prof. Rakoto a validé ta correction de SVT", time: "Il y a 2j" },
];

export default function MahAIDashboard() {
  const [notifOpen, setNotifOpen] = useState(false);
  const [progWidths, setProgWidths] = useState({ global: 0, matieres: BAC_MATIERES.map(() => 0) });
  const [chartHeights, setChartHeights] = useState(ACTIVITY.map(() => 0));
  const [counters, setCounters] = useState({ sujets: 0, scores: 0, streak: 0, credits: 0 });
  const [mousePos, setMousePos] = useState({});

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Animate on mount
  useEffect(() => {
    const t1 = setTimeout(() => {
      const maxH = 80;
      const maxVal = Math.max(...ACTIVITY.map(a => a.val));
      setChartHeights(ACTIVITY.map(a => (a.val / maxVal) * maxH));
      setProgWidths({ global: 62, matieres: BAC_MATIERES.map(m => m.pct) });
    }, 400);

    // Count up
    const targets = { sujets: 24, scores: 14.2, streak: 12, credits: 12 };
    const dur = 1600;
    const start = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - start) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setCounters({
        sujets: Math.floor(e * targets.sujets),
        scores: Math.round(e * targets.scores * 10) / 10,
        streak: Math.floor(e * targets.streak),
        credits: Math.floor(e * targets.credits),
      });
      if (p < 1) requestAnimationFrame(tick);
    };
    const t2 = setTimeout(() => requestAnimationFrame(tick), 300);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Mouse glow
  useEffect(() => {
    const fn = e => {
      document.querySelectorAll(".card").forEach(card => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
        card.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
      });
    };
    window.addEventListener("mousemove", fn);
    return () => window.removeEventListener("mousemove", fn);
  }, []);

  const navItems = [
    { icon: "🏠", label: "Tableau de bord", active: true },
    { icon: "📚", label: "Catalogue", badge: null },
    { icon: "🎒", label: "Mes sujets", badge: null },
    { icon: "📝", label: "Examens blancs", badge: "3" },
    { icon: "🤖", label: "Correction IA", badge: null },
    { icon: "📈", label: "Mes progrès", badge: null },
  ];
  const navItems2 = [
    { icon: "💳", label: "Crédits & Paiement", badge: null },
    { icon: "🔔", label: "Notifications", badge: "3" },
    { icon: "⚙️", label: "Paramètres", badge: null },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>
      <div className="mesh"><span /><span /><span /></div>

      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-text">Mah.AI</div>
          <div className="logo-sub">Dashboard étudiant</div>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">
            👨‍🎓
            <div className="user-online" />
          </div>
          <div>
            <div className="user-name">Miora Rakoto</div>
            <div className="user-role">Étudiant · BAC Série C</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">Menu principal</div>
          {navItems.map(item => (
            <a key={item.label} href="#" className={`nav-item ${item.active ? "active" : ""}`}>
              <span className="nav-icon">{item.icon}</span>
              {item.label}
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </a>
          ))}
          <div className="nav-section">Compte</div>
          {navItems2.map(item => (
            <a key={item.label} href="#" className="nav-item">
              <span className="nav-icon">{item.icon}</span>
              {item.label}
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </a>
          ))}
        </nav>

        <div className="sidebar-credits">
          <div className="credits-label">💎 MES CRÉDITS</div>
          <div className="credits-num">{counters.credits}</div>
          <div className="credits-sub">crédits disponibles</div>
          <button className="btn-recharge">+ Recharger avec MVola</button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="main">
        {/* Topbar */}
        <div className="topbar">
          <div className="topbar-left">
            <h1>Bonjour, Miora 👋</h1>
            <p>Mardi 24 juin 2025 · BAC dans <strong style={{ color: "var(--teal)" }}>47 jours</strong></p>
          </div>
          <div className="topbar-right">
            <div className="search-bar">🔍 Rechercher un sujet...</div>
            <div className="notif-btn" onClick={() => setNotifOpen(v => !v)}>
              🔔
              <div className="notif-dot" />
            </div>
          </div>
        </div>

        {/* Notif panel */}
        <div className={`notif-panel ${notifOpen ? "" : "hidden"}`}>
          <div className="notif-panel-header">
            <div className="notif-panel-title">Notifications</div>
            <button className="notif-panel-close" onClick={() => setNotifOpen(false)}>×</button>
          </div>
          {NOTIFS.map((n, i) => (
            <div key={i} className={`notif-item ${n.unread ? "unread" : ""}`}>
              <div className="notif-dot-indicator" style={{ background: n.dot }} />
              <div className="notif-body">
                <div className="notif-text">{n.text}</div>
                <div className="notif-time">{n.time}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="content" onClick={() => setNotifOpen(false)}>

          {/* ── STATS ROW ── */}
          <div className="bento grid-stats" style={{ marginBottom: 16 }}>
            {[
              { icon: "📚", bg: "rgba(10,255,224,.1)", bc: "rgba(10,255,224,.2)", val: counters.sujets, label: "Sujets consultés", trend: "+3 cette semaine", up: true, color: "var(--teal)" },
              { icon: "🏆", bg: "rgba(255,209,102,.1)", bc: "rgba(255,209,102,.2)", val: `${counters.scores}/20`, label: "Score moyen", trend: "+0.8 vs semaine passée", up: true, color: "var(--gold)" },
              { icon: "🔥", bg: "rgba(255,107,157,.1)", bc: "rgba(255,107,157,.2)", val: `${counters.streak}j`, label: "Jours consécutifs", trend: "Record : 18j", up: false, color: "var(--rose)" },
              { icon: "📝", bg: "rgba(79,142,247,.1)", bc: "rgba(79,142,247,.2)", val: 7, label: "Examens blancs passés", trend: "+2 cette semaine", up: true, color: "var(--blue)" },
            ].map((s, i) => (
              <div key={s.label} className={`card stat-card anim-${i}`}>
                <div className="stat-icon" style={{ background: s.bg, border: `1px solid ${s.bc}` }}>{s.icon}</div>
                <div className="stat-val" style={{ color: s.color }}>{s.val}</div>
                <div className="stat-label">{s.label}</div>
                <div className={`stat-trend ${s.up ? "trend-up" : ""}`}>
                  {s.up ? "↑" : "○"} {s.trend}
                </div>
              </div>
            ))}
          </div>

          {/* ── GRID MAIN ── */}
          <div className="bento grid-main" style={{ marginBottom: 16 }}>

            {/* Progression globale — span 2 */}
            <div className="card span2 anim-4">
              <div className="prog-header">
                <div>
                  <div className="prog-title">📊 Préparation BAC 2025</div>
                  <div className="prog-sub">Progression globale sur toutes les matières</div>
                </div>
                <div className="prog-pct">{progWidths.global}%</div>
              </div>

              <div className="prog-bar-wrap">
                <div className="prog-bar-label"><span>0%</span><span>Objectif 100%</span></div>
                <div className="prog-bar-track">
                  <div className="prog-bar-fill" style={{
                    width: `${progWidths.global}%`,
                    background: "linear-gradient(90deg,var(--teal),var(--green))"
                  }} />
                </div>
              </div>

              <div className="bac-matiere-list">
                {BAC_MATIERES.map((m, i) => (
                  <div key={m.name} className="bac-mat-row">
                    <div className="bac-mat-name">{m.name}</div>
                    <div className="bac-mat-bar">
                      <div className="bac-mat-fill" style={{
                        width: `${progWidths.matieres[i]}%`,
                        background: m.color,
                        "--delay": `${i * 0.1}s`
                      }} />
                    </div>
                    <div className="bac-mat-pct" style={{ color: m.color }}>{progWidths.matieres[i]}%</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Compte à rebours */}
            <div className="card anim-5">
              <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--mono)", marginBottom: 12 }}>⏳ COMPTE À REBOURS</div>
              <div className="bac-countdown">
                <div className="bac-days">47</div>
                <div className="bac-label">jours avant le BAC 2025</div>
              </div>
              <div className="bac-prog-wrap">
                <div className="bac-prog-row"><span>Avancement</span><span style={{ color: "var(--teal)" }}>62%</span></div>
                <div className="bac-prog-bar-track">
                  <div className="bac-prog-bar-fill" style={{ width: "62%" }} />
                </div>
              </div>
              <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                {["🎓 Séries C", "📐 Maths", "⚗️ Sciences"].map(tag => (
                  <span key={tag} style={{ background: "rgba(10,255,224,.07)", border: "1px solid rgba(10,255,224,.15)", color: "var(--teal)", padding: "4px 10px", borderRadius: 8, fontSize: 11, fontFamily: "var(--mono)" }}>{tag}</span>
                ))}
              </div>
            </div>

          </div>

          {/* ── GRID ACTIVITY ── */}
          <div className="bento grid-activity" style={{ marginBottom: 16 }}>

            {/* Scores + Recents */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Scores récents */}
              <div className="card anim-4">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>🏆 Derniers scores</div>
                  <span style={{ fontSize: 11, color: "var(--teal)", fontFamily: "var(--mono)", cursor: "pointer" }}>Voir tout →</span>
                </div>
                <div className="score-list">
                  {SCORES.map(s => (
                    <div key={s.matiere} className="score-row">
                      <div className="score-dot" style={{ background: s.color }} />
                      <div className="score-matiere">{s.matiere}</div>
                      <div className="score-bar-mini">
                        <div className="score-bar-fill" style={{ width: `${(s.note / s.max) * 100}%`, background: s.color }} />
                      </div>
                      <div className="score-date">{s.date}</div>
                      <div className="score-note" style={{ color: s.color }}>{s.note}/{s.max}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activité de la semaine */}
              <div className="card anim-5">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>📅 Activité cette semaine</div>
                  <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--mono)" }}>Sujets étudiés/jour</span>
                </div>
                <div className="chart-wrap">
                  {ACTIVITY.map((a, i) => (
                    <div key={i} className="chart-bar-wrap">
                      <div
                        className="chart-bar"
                        style={{
                          height: chartHeights[i],
                          background: i === 5
                            ? "linear-gradient(180deg,var(--teal),var(--teal2))"
                            : "rgba(10,255,224,.2)",
                          boxShadow: i === 5 ? "0 0 12px rgba(10,255,224,.3)" : "none",
                        }}
                        data-val={`${a.val} sujets`}
                      />
                      <div className="chart-label">{a.day}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sujets récents */}
              <div className="card anim-6">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>📂 Récemment consultés</div>
                  <span style={{ fontSize: 11, color: "var(--teal)", fontFamily: "var(--mono)", cursor: "pointer" }}>Tous mes sujets →</span>
                </div>
                {RECENTS.map(r => (
                  <div key={r.title} className="recent-item">
                    <div className="recent-thumb" style={{ background: r.bg }}>{r.emoji}</div>
                    <div className="recent-body">
                      <div className="recent-title">{r.title}</div>
                      <div className="recent-meta">{r.meta}</div>
                    </div>
                    <div className="recent-action">{r.action}</div>
                  </div>
                ))}
              </div>

            </div>

            {/* Right sidebar widgets */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* IA Recommandations */}
              <div className="card ai-reco-card anim-4">
                <div className="ai-header-row">
                  <div className="ai-orb">🤖</div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>Recommandations IA</div>
                    <div style={{ fontSize: 11, color: "var(--teal)", fontFamily: "var(--mono)", marginTop: 2 }}>Personnalisées pour toi</div>
                  </div>
                </div>
                {RECOS.map(r => (
                  <div key={r.titre} className="reco-item">
                    <div className="reco-emoji">{r.emoji}</div>
                    <div className="reco-text">
                      <strong>{r.titre}</strong>
                      {r.desc}
                      <div className="reco-cta">{r.cta}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Streak */}
              <div className="card streak-card anim-5">
                <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--mono)", marginBottom: 8 }}>🔥 STREAK DE RÉVISION</div>
                <div className="streak-num">{counters.streak}</div>
                <div className="streak-label">jours consécutifs</div>
                <div className="streak-days">
                  {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
                    <div key={i} className={`streak-day ${i < 5 ? "done" : ""} ${i === 6 ? "today-s" : ""}`}>
                      {i === 6 ? "🔥" : d}
                    </div>
                  ))}
                </div>
              </div>

              {/* Mini Calendar */}
              <div className="card anim-6">
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>🗓 Juin 2025</div>
                <div className="cal-grid">
                  {["L", "M", "M", "J", "V", "S", "D"].map(d => (
                    <div key={d} className="cal-day-name">{d}</div>
                  ))}
                  {CAL_DAYS.map((day, i) => {
                    if (!day) return <div key={i} />;
                    const isToday = day === TODAY_DAY;
                    const hasExam = EXAM_DAYS.includes(day);
                    const studied = STUDIED_DAYS.includes(day);
                    return (
                      <div key={i} className={`cal-day ${isToday ? "today" : ""} ${hasExam ? "has-exam" : ""} ${!isToday && !hasExam && studied ? "studied" : ""}`}>
                        {day}
                      </div>
                    );
                  })}
                </div>
                <div className="cal-legend">
                  <div className="cal-leg-item"><div className="cal-leg-dot" style={{ background: "var(--teal)" }} />Révisé</div>
                  <div className="cal-leg-item"><div className="cal-leg-dot" style={{ background: "var(--gold)" }} />Examen</div>
                  <div className="cal-leg-item"><div className="cal-leg-dot" style={{ background: "rgba(10,255,224,.8)" }} />Aujourd'hui</div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
