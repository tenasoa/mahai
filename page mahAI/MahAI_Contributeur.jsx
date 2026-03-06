import { useState, useEffect, useRef } from "react";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,700;12..96,800&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --gold:#FFD166;--gold2:#F5A623;--teal:#0AFFE0;--teal2:#00C9A7;
    --green:#00FF88;--rose:#FF6B9D;--blue:#4F8EF7;--purple:#A78BFA;--orange:#FF9F43;
    --bg:#070A0F;--bg2:#0D1420;--bg3:#121C2E;--bg4:#0A1018;
    --border:rgba(255,255,255,.07);--border-gold:rgba(255,209,102,.2);
    --text:#F0F4FF;--muted:#6B7899;--muted2:#3A4560;
    --font:'Bricolage Grotesque',sans-serif;--mono:'DM Mono',monospace;
    --r:18px;
  }
  html{scroll-behavior:smooth}
  body{font-family:var(--font);background:var(--bg);color:var(--text);overflow-x:hidden;-webkit-font-smoothing:antialiased}
  ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:var(--bg)}::-webkit-scrollbar-thumb{background:var(--gold2);border-radius:2px}
  body::before{content:'';position:fixed;inset:0;z-index:0;opacity:.4;pointer-events:none;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")}

  .mesh{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden}
  .mesh span{position:absolute;border-radius:50%;filter:blur(140px);animation:fm 22s ease-in-out infinite alternate}
  .mesh span:nth-child(1){width:600px;height:600px;top:-150px;right:-100px;background:var(--gold);opacity:.05;animation-delay:0s}
  .mesh span:nth-child(2){width:500px;height:500px;bottom:-100px;left:-100px;background:var(--teal);opacity:.04;animation-delay:-9s}
  .mesh span:nth-child(3){width:350px;height:350px;top:45%;left:35%;background:var(--purple);opacity:.04;animation-delay:-16s}
  @keyframes fm{0%{transform:translate(0,0)}100%{transform:translate(25px,-20px)}}

  /* ── SIDEBAR ── */
  .sidebar{position:fixed;top:0;left:0;bottom:0;width:248px;z-index:50;background:rgba(7,10,15,.9);backdrop-filter:blur(24px);border-right:1px solid var(--border);display:flex;flex-direction:column}
  .sb-logo{padding:22px 22px 16px;border-bottom:1px solid var(--border)}
  .sb-logo-text{font-size:21px;font-weight:800;letter-spacing:-1px;background:linear-gradient(135deg,var(--gold),var(--orange));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
  .sb-logo-sub{font-size:10px;color:var(--muted);font-family:var(--mono);margin-top:2px;letter-spacing:.08em}

  .sb-profile{margin:12px;background:linear-gradient(135deg,rgba(255,209,102,.06),rgba(255,209,102,.02));border:1px solid var(--border-gold);border-radius:14px;padding:14px 16px;display:flex;align-items:center;gap:11px}
  .sb-avatar{width:42px;height:42px;border-radius:12px;background:linear-gradient(135deg,#2A1A00,#5A3A00);border:2px solid rgba(255,209,102,.3);display:flex;align-items:center;justify-content:center;font-size:19px;flex-shrink:0;position:relative}
  .sb-verified{position:absolute;bottom:-3px;right:-3px;width:14px;height:14px;border-radius:50%;background:var(--gold);display:flex;align-items:center;justify-content:center;font-size:8px;border:2px solid var(--bg)}
  .sb-name{font-size:13px;font-weight:700}
  .sb-badge{display:inline-flex;align-items:center;gap:4px;font-size:10px;color:var(--gold);font-family:var(--mono);margin-top:3px}

  .sb-nav{flex:1;padding:8px 12px;overflow-y:auto}
  .sb-section{font-size:10px;color:var(--muted2);font-family:var(--mono);letter-spacing:.12em;text-transform:uppercase;padding:14px 12px 6px}
  .sb-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;cursor:pointer;color:var(--muted);font-size:13px;font-weight:500;margin-bottom:2px;transition:all .2s;text-decoration:none;border:1px solid transparent}
  .sb-item:hover{background:rgba(255,255,255,.04);color:var(--text)}
  .sb-item.active{background:rgba(255,209,102,.08);color:var(--gold);border-color:rgba(255,209,102,.15)}
  .sb-item .icon{font-size:16px;width:20px;text-align:center;flex-shrink:0}
  .sb-dot{width:6px;height:6px;border-radius:50%;background:var(--rose);margin-left:auto;flex-shrink:0}

  .sb-withdraw{margin:12px;background:linear-gradient(135deg,rgba(255,209,102,.1),rgba(255,209,102,.04));border:1px solid var(--border-gold);border-radius:14px;padding:14px 16px}
  .sw-label{font-size:10px;color:var(--gold);font-family:var(--mono);margin-bottom:4px;letter-spacing:.08em}
  .sw-amount{font-size:26px;font-weight:800;letter-spacing:-1.5px;color:var(--gold)}
  .sw-sub{font-size:11px;color:var(--muted);margin-top:1px}
  .btn-withdraw{width:100%;background:linear-gradient(135deg,var(--gold),var(--gold2));color:#0A0600;border:none;padding:10px;border-radius:10px;font-family:var(--font);font-size:13px;font-weight:800;cursor:pointer;margin-top:10px;transition:opacity .2s,transform .15s}
  .btn-withdraw:hover{opacity:.88;transform:translateY(-1px)}
  .btn-withdraw:active{transform:translateY(0)}

  /* ── MAIN ── */
  .main{margin-left:248px;min-height:100vh}
  .topbar{position:sticky;top:0;z-index:40;background:rgba(7,10,15,.85);backdrop-filter:blur(20px);border-bottom:1px solid var(--border);padding:14px 32px;display:flex;align-items:center;justify-content:space-between}
  .tb-title{font-size:21px;font-weight:800;letter-spacing:-.5px}
  .tb-sub{font-size:12px;color:var(--muted);margin-top:2px}
  .tb-right{display:flex;gap:10px;align-items:center}
  .btn-new{display:flex;align-items:center;gap:8px;background:linear-gradient(135deg,var(--gold),var(--gold2));color:#0A0600;border:none;padding:10px 20px;border-radius:11px;font-family:var(--font);font-size:14px;font-weight:800;cursor:pointer;transition:transform .2s,box-shadow .25s}
  .btn-new:hover{transform:translateY(-2px);box-shadow:0 10px 30px rgba(255,209,102,.3)}
  .notif-btn{width:36px;height:36px;border-radius:10px;background:var(--bg2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:15px;position:relative;transition:border-color .2s}
  .notif-btn:hover{border-color:var(--border-gold)}
  .notif-dot{position:absolute;top:6px;right:6px;width:7px;height:7px;border-radius:50%;background:var(--rose);border:1.5px solid var(--bg)}

  /* ── CONTENT ── */
  .content{padding:24px 32px;position:relative;z-index:1}

  /* ── CARDS ── */
  .card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r);padding:22px;position:relative;overflow:hidden;transition:transform .3s cubic-bezier(.34,1.56,.64,1),border-color .25s,box-shadow .3s}
  .card::before{content:'';position:absolute;inset:0;opacity:0;background:radial-gradient(circle at var(--mx,50%) var(--my,50%),rgba(255,209,102,.04),transparent 60%);transition:opacity .4s;pointer-events:none}
  .card:hover{transform:translateY(-3px);border-color:rgba(255,255,255,.1);box-shadow:0 18px 45px rgba(0,0,0,.35)}
  .card:hover::before{opacity:1}

  /* ── BENTO GRIDS ── */
  .grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:16px}
  .grid-main{display:grid;grid-template-columns:2fr 1fr;gap:16px;margin-bottom:16px}
  .grid-bottom{display:grid;grid-template-columns:3fr 2fr;gap:16px;margin-bottom:16px}
  .grid-tips{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}

  /* ── STAT CARD ── */
  .sc-icon{width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:18px;margin-bottom:14px}
  .sc-val{font-size:28px;font-weight:800;letter-spacing:-1.5px;line-height:1;margin-bottom:4px}
  .sc-label{font-size:11px;color:var(--muted);font-family:var(--mono)}
  .sc-trend{margin-top:8px;font-size:11px;font-family:var(--mono);display:flex;align-items:center;gap:4px}
  .up{color:var(--green)} .dn{color:var(--rose)}

  /* ── REVENUE CHART ── */
  .chart-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:20px}
  .chart-title{font-size:16px;font-weight:700}
  .chart-sub{font-size:12px;color:var(--muted);font-family:var(--mono);margin-top:3px}
  .chart-total{text-align:right}
  .chart-total-num{font-size:26px;font-weight:800;letter-spacing:-1px;color:var(--gold)}
  .chart-total-label{font-size:11px;color:var(--muted);font-family:var(--mono)}
  .chart-tabs{display:flex;gap:4px;background:var(--bg3);padding:3px;border-radius:9px;margin-bottom:16px;width:fit-content}
  .ctab{padding:6px 14px;border-radius:7px;background:transparent;border:none;font-family:var(--font);font-size:12px;font-weight:600;color:var(--muted);cursor:pointer;transition:all .2s}
  .ctab.on{background:var(--bg2);color:var(--text);box-shadow:0 2px 8px rgba(0,0,0,.3)}

  /* area chart */
  .area-chart{position:relative;height:120px;margin:0 -4px}
  .area-chart svg{width:100%;height:100%}
  .chart-line-months{display:flex;justify-content:space-between;margin-top:8px;padding:0 4px}
  .month-label{font-size:10px;font-family:var(--mono);color:var(--muted);text-align:center}

  /* bar chart */
  .bar-chart-wrap{display:flex;align-items:flex-end;gap:8px;height:100px;margin:12px 0 8px}
  .bar-col{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px}
  .bar{width:100%;border-radius:5px 5px 0 0;transition:height .9s cubic-bezier(.4,0,.2,1),opacity .3s;cursor:pointer;position:relative}
  .bar:hover{filter:brightness(1.2)}
  .bar::after{content:attr(data-val);position:absolute;bottom:calc(100%+4px);left:50%;transform:translateX(-50%);font-size:10px;color:var(--text);font-family:var(--mono);white-space:nowrap;opacity:0;transition:opacity .2s}
  .bar:hover::after{opacity:1}
  .bar-label{font-size:10px;font-family:var(--mono);color:var(--muted);text-align:center}

  /* ── TOP SUJETS ── */
  .top-subject{display:flex;align-items:center;gap:12px;padding:11px 12px;background:var(--bg3);border-radius:11px;margin-bottom:8px;transition:background .2s,transform .2s;cursor:pointer}
  .top-subject:hover{background:rgba(255,209,102,.05);transform:translateX(3px)}
  .ts-rank{font-family:var(--mono);font-size:13px;font-weight:700;width:22px;text-align:center;flex-shrink:0}
  .ts-emoji{font-size:18px;flex-shrink:0}
  .ts-body{flex:1;min-width:0}
  .ts-name{font-size:13px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .ts-meta{font-size:11px;color:var(--muted);font-family:var(--mono);margin-top:2px}
  .ts-right{text-align:right;flex-shrink:0}
  .ts-gain{font-family:var(--mono);font-size:13px;font-weight:700;color:var(--gold)}
  .ts-consult{font-size:10px;color:var(--muted);font-family:var(--mono);margin-top:2px}
  .ts-trend-bar{width:60px;height:3px;background:rgba(255,255,255,.06);border-radius:2px;margin-top:5px;overflow:hidden}
  .ts-trend-fill{height:100%;border-radius:2px;background:linear-gradient(90deg,var(--gold),var(--orange));transition:width 1s ease}

  /* ── SUJETS TABLE ── */
  .subjects-table{width:100%;border-collapse:collapse}
  .subjects-table th{font-size:10px;font-family:var(--mono);color:var(--muted);letter-spacing:.1em;text-transform:uppercase;padding:10px 14px;text-align:left;border-bottom:1px solid var(--border);white-space:nowrap}
  .subjects-table td{padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.04);vertical-align:middle}
  .subjects-table tr:last-child td{border-bottom:none}
  .subjects-table tbody tr{transition:background .15s;cursor:pointer}
  .subjects-table tbody tr:hover{background:rgba(255,255,255,.03)}
  .status-badge{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:100px;font-size:10px;font-weight:700;font-family:var(--mono);border:1px solid;white-space:nowrap}
  .st-pub{background:rgba(0,255,136,.08);border-color:rgba(0,255,136,.25);color:var(--green)}
  .st-wait{background:rgba(255,209,102,.08);border-color:rgba(255,209,102,.25);color:var(--gold)}
  .st-rej{background:rgba(255,107,157,.08);border-color:rgba(255,107,157,.25);color:var(--rose)}
  .st-draft{background:rgba(255,255,255,.04);border-color:var(--border);color:var(--muted)}
  .row-gain{font-family:var(--mono);font-size:13px;font-weight:700;color:var(--gold)}
  .row-note{display:flex;align-items:center;gap:4px;font-size:12px;color:var(--gold)}
  .table-action{background:transparent;border:1px solid var(--border);color:var(--muted);padding:5px 12px;border-radius:7px;font-family:var(--mono);font-size:11px;cursor:pointer;transition:all .2s;white-space:nowrap}
  .table-action:hover{border-color:var(--border-gold);color:var(--gold)}

  /* ── GAINS TIMELINE ── */
  .timeline{display:flex;flex-direction:column;gap:0}
  .tl-item{display:flex;gap:14px;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.04);position:relative}
  .tl-item:last-child{border-bottom:none}
  .tl-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0;margin-top:4px;border:2px solid}
  .tl-dot-gold{background:rgba(255,209,102,.3);border-color:var(--gold)}
  .tl-dot-green{background:rgba(0,255,136,.3);border-color:var(--green)}
  .tl-dot-rose{background:rgba(255,107,157,.3);border-color:var(--rose)}
  .tl-body{flex:1;min-width:0}
  .tl-text{font-size:13px;color:var(--text);line-height:1.4}
  .tl-time{font-size:11px;color:var(--muted);font-family:var(--mono);margin-top:3px}
  .tl-amount{font-family:var(--mono);font-size:14px;font-weight:700;color:var(--gold);flex-shrink:0;align-self:flex-start;padding-top:2px}

  /* ── TIPS / BADGES ── */
  .tip-card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r);padding:20px;transition:transform .3s cubic-bezier(.34,1.56,.64,1),border-color .25s}
  .tip-card:hover{transform:translateY(-3px)}
  .tip-icon{font-size:28px;margin-bottom:12px}
  .tip-title{font-size:14px;font-weight:700;margin-bottom:6px}
  .tip-body{font-size:12px;color:var(--muted);line-height:1.6}
  .tip-badge{display:inline-flex;align-items:center;gap:5px;margin-top:10px;padding:4px 10px;border-radius:100px;font-size:11px;font-family:var(--mono);border:1px solid}

  /* ── LEVEL CARD ── */
  .level-card{background:linear-gradient(135deg,rgba(255,209,102,.06),rgba(255,209,102,.02));border-color:var(--border-gold)}
  .level-badge{display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,var(--gold),var(--gold2));color:#0A0600;padding:8px 16px;border-radius:100px;font-size:13px;font-weight:800;margin-bottom:16px}
  .level-bar-wrap{background:var(--bg3);border-radius:12px;padding:14px 16px;margin-bottom:14px}
  .level-bar-labels{display:flex;justify-content:space-between;font-size:11px;font-family:var(--mono);color:var(--muted);margin-bottom:8px}
  .level-bar-track{height:6px;background:rgba(255,255,255,.06);border-radius:3px;overflow:hidden}
  .level-bar-fill{height:100%;border-radius:3px;background:linear-gradient(90deg,var(--gold),var(--orange));transition:width 1.6s cubic-bezier(.4,0,.2,1)}
  .level-perks{display:flex;flex-direction:column;gap:6px}
  .perk-row{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--muted)}
  .perk-row .check{color:var(--gold)}

  /* ── MODAL ── */
  .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:200;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(8px);animation:fadeIn .2s ease}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  .modal{background:var(--bg2);border:1px solid var(--border-gold);border-radius:24px;padding:36px;width:100%;max-width:520px;position:relative;animation:modalIn .35s cubic-bezier(.34,1.56,.64,1)}
  @keyframes modalIn{from{opacity:0;transform:scale(.9) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}}
  .modal-close{position:absolute;top:16px;right:16px;background:var(--bg3);border:1px solid var(--border);color:var(--muted);width:32px;height:32px;border-radius:8px;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;transition:all .2s}
  .modal-close:hover{border-color:var(--border-gold);color:var(--text)}
  .modal-title{font-size:22px;font-weight:800;letter-spacing:-.5px;margin-bottom:6px}
  .modal-sub{font-size:13px;color:var(--muted);margin-bottom:24px}
  .form-group{margin-bottom:16px}
  .form-label{font-size:11px;color:var(--muted);font-family:var(--mono);letter-spacing:.08em;text-transform:uppercase;margin-bottom:7px;display:block}
  .form-input{width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:11px 14px;color:var(--text);font-family:var(--font);font-size:14px;outline:none;transition:border-color .2s}
  .form-input:focus{border-color:var(--border-gold)}
  .form-input::placeholder{color:var(--muted)}
  .form-select{width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:11px 14px;color:var(--text);font-family:var(--font);font-size:14px;outline:none;cursor:pointer;transition:border-color .2s;-webkit-appearance:none}
  .form-select:focus{border-color:var(--border-gold)}
  .form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .btn-submit{width:100%;background:linear-gradient(135deg,var(--gold),var(--gold2));color:#0A0600;border:none;padding:14px;border-radius:12px;font-family:var(--font);font-size:15px;font-weight:800;cursor:pointer;margin-top:8px;transition:opacity .2s,transform .15s}
  .btn-submit:hover{opacity:.88;transform:translateY(-1px)}

  /* ── TOAST ── */
  .toast{position:fixed;bottom:24px;right:24px;background:var(--bg2);border:1px solid var(--border-gold);border-radius:14px;padding:14px 20px;display:flex;align-items:center;gap:10px;font-size:14px;box-shadow:0 20px 50px rgba(0,0,0,.5);z-index:300;transition:transform .4s cubic-bezier(.34,1.56,.64,1),opacity .3s;transform:translateY(80px);opacity:0}
  .toast.show{transform:translateY(0);opacity:1}

  /* ── ANIMATIONS ── */
  @keyframes slideUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
  @keyframes slideRight{from{opacity:0;transform:translateX(-16px)}to{opacity:1;transform:translateX(0)}}
  .a0{animation:slideUp .45s ease both}
  .a1{animation:slideUp .45s .07s ease both}
  .a2{animation:slideUp .45s .14s ease both}
  .a3{animation:slideUp .45s .21s ease both}
  .a4{animation:slideUp .45s .28s ease both}
  .a5{animation:slideUp .45s .35s ease both}
  .a6{animation:slideUp .45s .42s ease both}
  .a7{animation:slideUp .45s .49s ease both}
  .asr{animation:slideRight .45s ease both}

  /* ── MOBILE ── */
  @media(max-width:960px){.sidebar{display:none}.main{margin-left:0}.content{padding:16px}}
  @media(max-width:700px){.grid-4{grid-template-columns:repeat(2,1fr)}.grid-main,.grid-bottom{grid-template-columns:1fr}.grid-tips{grid-template-columns:1fr}}
`;

// ── Data ────────────────────────────────────────────────────────
const MONTHLY = [
  { m:"Jan", ar:18000, consult:12 },
  { m:"Fév", ar:24000, consult:18 },
  { m:"Mar", ar:31000, consult:24 },
  { m:"Avr", ar:27000, consult:21 },
  { m:"Mai", ar:42000, consult:33 },
  { m:"Jun", ar:55000, consult:41 },
  { m:"Jul", ar:38000, consult:29 },
  { m:"Aoû", ar:61000, consult:47 },
  { m:"Sep", ar:48000, consult:36 },
  { m:"Oct", ar:74000, consult:58 },
  { m:"Nov", ar:89000, consult:68 },
  { m:"Déc", ar:93500, consult:72 },
];

const TOP_SUBJECTS = [
  { rank:1, emoji:"📐", name:"Maths BAC 2024 Série C", meta:"Publié il y a 3 mois", gain:"41 850 Ar", consult:1832, pct:100 },
  { rank:2, emoji:"📖", name:"Français BAC 2024", meta:"Publié il y a 2 mois", gain:"28 350 Ar", consult:1120, pct:61 },
  { rank:3, emoji:"⚗️", name:"Physique-Chimie 2024", meta:"Publié il y a 2 mois", gain:"21 600 Ar", consult:987, pct:54 },
  { rank:4, emoji:"🌿", name:"SVT Série D 2023", meta:"Publié il y a 6 mois", gain:"15 300 Ar", consult:765, pct:42 },
  { rank:5, emoji:"🌍", name:"Histoire-Géo BAC 2024", meta:"Publié il y a 1 mois", gain:"9 000 Ar", consult:400, pct:22 },
];

const SUBJECTS_LIST = [
  { id:1, emoji:"📐", name:"Maths BAC 2024 — Série C&D", type:"BAC", annee:2024, status:"pub", gain:"41 850", consult:1832, note:4.8 },
  { id:2, emoji:"📖", name:"Français BAC 2024 — Toutes séries", type:"BAC", annee:2024, status:"pub", gain:"28 350", consult:1120, note:4.9 },
  { id:3, emoji:"⚗️", name:"Physique-Chimie 2024 — Série C", type:"BAC", annee:2024, status:"pub", gain:"21 600", consult:987, note:4.6 },
  { id:4, emoji:"🌿", name:"SVT Série D 2023", type:"BAC", annee:2023, status:"pub", gain:"15 300", consult:765, note:4.5 },
  { id:5, emoji:"📝", name:"Maths BEPC 2024", type:"BEPC", annee:2024, status:"wait", gain:"—", consult:0, note:null },
  { id:6, emoji:"🌍", name:"Histoire-Géo BAC 2024", type:"BAC", annee:2024, status:"pub", gain:"9 000", consult:400, note:4.7 },
  { id:7, emoji:"💭", name:"Philosophie BAC 2024 — Série A", type:"BAC", annee:2024, status:"wait", gain:"—", consult:0, note:null },
  { id:8, emoji:"🔢", name:"Maths BAC 2023 — Série C", type:"BAC", annee:2023, status:"rej", gain:"—", consult:0, note:null },
];

const TIMELINE = [
  { dot:"gold", text:"42 consultations de Maths BAC 2024 → gain +4 410 Ar", time:"Aujourd'hui, 14:32", amount:"+4 410 Ar" },
  { dot:"green", text:"Virement MVola approuvé — 45 000 Ar retiré", time:"Hier, 09:15", amount:"−45 000 Ar" },
  { dot:"gold", text:"18 consultations de Français BAC 2024 → gain +2 025 Ar", time:"Il y a 2 jours", amount:"+2 025 Ar" },
  { dot:"rose", text:"Sujet 'Maths BAC 2023 Série C' rejeté — doublon détecté", time:"Il y a 3 jours", amount:"0 Ar" },
  { dot:"gold", text:"Sujet 'Histoire-Géo BAC 2024' publié avec succès", time:"Il y a 5 jours", amount:"+0 Ar" },
  { dot:"green", text:"Badge 'Contributeur Or' obtenu — commission +5%", time:"Il y a 1 semaine", amount:"🏅" },
];

export default function MahAIContributeur() {
  const [activeTab, setActiveTab] = useState("sujets");
  const [chartMode, setChartMode] = useState("gains");
  const [modal, setModal] = useState(false);
  const [barH, setBarH] = useState(MONTHLY.map(()=>0));
  const [levelFill, setLevelFill] = useState(0);
  const [trendFills, setTrendFills] = useState(TOP_SUBJECTS.map(()=>0));
  const [counters, setCounters] = useState({ gains:0, consult:0, sujets:0, note:0 });
  const [toast, setToast] = useState({ show:false, msg:"" });

  useEffect(()=>{
    const s = document.createElement("style");
    s.textContent = CSS;
    document.head.appendChild(s);
    return ()=>document.head.removeChild(s);
  },[]);

  // Mouse glow
  useEffect(()=>{
    const fn = e=>{
      document.querySelectorAll(".card").forEach(c=>{
        const r = c.getBoundingClientRect();
        c.style.setProperty("--mx",`${((e.clientX-r.left)/r.width)*100}%`);
        c.style.setProperty("--my",`${((e.clientY-r.top)/r.height)*100}%`);
      });
    };
    window.addEventListener("mousemove",fn);
    return ()=>window.removeEventListener("mousemove",fn);
  },[]);

  // Animate on mount
  useEffect(()=>{
    // Count up
    const targets = { gains:116250, consult:5104, sujets:8, note:4.7 };
    const dur = 1800;
    const start = Date.now();
    const tick = ()=>{
      const p = Math.min((Date.now()-start)/dur,1);
      const e = 1-Math.pow(1-p,3);
      setCounters({
        gains: Math.floor(e*targets.gains),
        consult: Math.floor(e*targets.consult),
        sujets: Math.floor(e*targets.sujets),
        note: Math.round(e*targets.note*10)/10,
      });
      if(p<1) requestAnimationFrame(tick);
    };
    const t1 = setTimeout(()=>requestAnimationFrame(tick),300);

    // Bars
    const t2 = setTimeout(()=>{
      const max = Math.max(...MONTHLY.map(m=>m.ar));
      setBarH(MONTHLY.map(m=>(m.ar/max)*100));
      setLevelFill(72);
      setTrendFills(TOP_SUBJECTS.map(s=>s.pct));
    },400);

    return ()=>{ clearTimeout(t1); clearTimeout(t2); };
  },[]);

  const showToast = msg=>{
    setToast({show:true,msg});
    setTimeout(()=>setToast({show:false,msg:""}),3000);
  };

  const statusLabel = s=>({
    pub:  <span className="status-badge st-pub">● Publié</span>,
    wait: <span className="status-badge st-wait">◐ En attente</span>,
    rej:  <span className="status-badge st-rej">✕ Rejeté</span>,
    draft:<span className="status-badge st-draft">○ Brouillon</span>,
  }[s]);

  // SVG area chart
  const chartData = chartMode==="gains" ? MONTHLY.map(m=>m.ar) : MONTHLY.map(m=>m.consult);
  const maxVal = Math.max(...chartData);
  const W=600, H=110, PAD=8;
  const pts = chartData.map((v,i)=>({
    x: PAD + (i/(chartData.length-1))*(W-PAD*2),
    y: H-PAD - ((v/maxVal)*(H-PAD*2))
  }));
  const linePath = pts.map((p,i)=>`${i===0?"M":"L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${pts[pts.length-1].x},${H} L${pts[0].x},${H} Z`;

  return (
    <div style={{minHeight:"100vh",display:"flex"}}>
      <div className="mesh"><span/><span/><span/></div>

      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="sb-logo">
          <div className="sb-logo-text">Mah.AI</div>
          <div className="sb-logo-sub">Espace Contributeur</div>
        </div>

        <div className="sb-profile">
          <div className="sb-avatar">
            👨‍🏫
            <div className="sb-verified">✓</div>
          </div>
          <div>
            <div className="sb-name">Rakoto Jean-Marie</div>
            <div className="sb-badge">🏅 Contributeur Or</div>
          </div>
        </div>

        <nav className="sb-nav">
          <div className="sb-section">Navigation</div>
          {[
            { icon:"🏠", label:"Vue d'ensemble", active:true },
            { icon:"📚", label:"Mes sujets", dot:false },
            { icon:"💰", label:"Mes gains", dot:false },
            { icon:"📊", label:"Statistiques", dot:false },
            { icon:"🔔", label:"Notifications", dot:true },
          ].map(item=>(
            <a key={item.label} className={`sb-item ${item.active?"active":""}`} href="#">
              <span className="icon">{item.icon}</span>
              {item.label}
              {item.dot && <div className="sb-dot"/>}
            </a>
          ))}
          <div className="sb-section">Publier</div>
          {[
            { icon:"✏️", label:"Nouveau sujet" },
            { icon:"📋", label:"Modèles" },
            { icon:"📖", label:"Guide contributeur" },
          ].map(item=>(
            <a key={item.label} className="sb-item" href="#">
              <span className="icon">{item.icon}</span>
              {item.label}
            </a>
          ))}
          <div className="sb-section">Compte</div>
          {[
            { icon:"💳", label:"MVola & Paiement" },
            { icon:"⚙️", label:"Paramètres" },
          ].map(item=>(
            <a key={item.label} className="sb-item" href="#">
              <span className="icon">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="sb-withdraw">
          <div className="sw-label">💰 GAINS DISPONIBLES</div>
          <div className="sw-amount">{counters.gains > 0 ? (counters.gains * 0.389 / 1000).toFixed(0) : "0"}K Ar</div>
          <div className="sw-sub">Retrait possible via MVola</div>
          <button className="btn-withdraw" onClick={()=>showToast("💸 Demande de retrait envoyée à MVola !")}>
            Retirer mes gains →
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="main">
        <div className="topbar">
          <div>
            <div className="tb-title">Bonjour, Jean-Marie 🏅</div>
            <div className="tb-sub">Commission actuelle : <strong style={{color:"var(--gold)"}}>50%</strong> · Prochain palier : <strong style={{color:"var(--teal)"}}>55%</strong> à 10 000 consultations</div>
          </div>
          <div className="tb-right">
            <div className="notif-btn"><span>🔔</span><div className="notif-dot"/></div>
            <button className="btn-new" onClick={()=>setModal(true)}>
              ✏️ Nouveau sujet
            </button>
          </div>
        </div>

        <div className="content">

          {/* ── STATS ROW ── */}
          <div className="grid-4">
            {[
              { icon:"💰", bg:"rgba(255,209,102,.1)", bc:"rgba(255,209,102,.25)", val:`${counters.gains.toLocaleString()} Ar`, label:"Gains totaux cumulés", trend:"↑ +23% ce mois", up:true, color:"var(--gold)" },
              { icon:"👁", bg:"rgba(10,255,224,.08)", bc:"rgba(10,255,224,.2)", val:counters.consult.toLocaleString(), label:"Consultations totales", trend:"↑ +18% ce mois", up:true, color:"var(--teal)" },
              { icon:"📚", bg:"rgba(79,142,247,.08)", bc:"rgba(79,142,247,.2)", val:counters.sujets, label:"Sujets publiés", trend:"2 en attente de validation", up:null, color:"var(--blue)" },
              { icon:"⭐", bg:"rgba(167,139,250,.08)", bc:"rgba(167,139,250,.2)", val:counters.note, label:"Note moyenne", trend:"↑ +0.1 vs mois dernier", up:true, color:"var(--purple)" },
            ].map((s,i)=>(
              <div key={s.label} className={`card a${i}`}>
                <div className="sc-icon" style={{background:s.bg,border:`1px solid ${s.bc}`}}>{s.icon}</div>
                <div className="sc-val" style={{color:s.color}}>{s.val}</div>
                <div className="sc-label">{s.label}</div>
                <div className={`sc-trend ${s.up===true?"up":""}`}>
                  {s.up===true?"↑":s.up===false?"↓":"·"} {s.trend}
                </div>
              </div>
            ))}
          </div>

          {/* ── GRID MAIN ── */}
          <div className="grid-main">

            {/* Revenue Chart */}
            <div className="card a4">
              <div className="chart-header">
                <div>
                  <div className="chart-title">📈 Évolution des gains</div>
                  <div className="chart-sub">12 derniers mois · en Ariary</div>
                </div>
                <div className="chart-total">
                  <div className="chart-total-num">
                    {chartMode==="gains" ? "116 250 Ar" : "459 consult."}
                  </div>
                  <div className="chart-total-label">total 2025</div>
                </div>
              </div>
              <div className="chart-tabs">
                {["gains","consult"].map(m=>(
                  <button key={m} className={`ctab ${chartMode===m?"on":""}`} onClick={()=>setChartMode(m)}>
                    {m==="gains" ? "💰 Gains" : "👁 Consultations"}
                  </button>
                ))}
              </div>
              <div className="area-chart">
                <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={chartMode==="gains"?"#FFD166":"#0AFFE0"} stopOpacity="0.3"/>
                      <stop offset="100%" stopColor={chartMode==="gains"?"#FFD166":"#0AFFE0"} stopOpacity="0.02"/>
                    </linearGradient>
                  </defs>
                  <path d={areaPath} fill="url(#areaGrad)"/>
                  <path d={linePath} fill="none" stroke={chartMode==="gains"?"#FFD166":"#0AFFE0"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  {pts.map((p,i)=>(
                    <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={chartMode==="gains"?"#FFD166":"#0AFFE0"} opacity={i===pts.length-1?1:0.4}/>
                  ))}
                </svg>
              </div>
              <div className="chart-line-months">
                {MONTHLY.map(m=>(
                  <div key={m.m} className="month-label">{m.m}</div>
                ))}
              </div>
            </div>

            {/* Top sujets */}
            <div className="card a5">
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
                <div>
                  <div style={{fontSize:15,fontWeight:700}}>🏆 Top sujets</div>
                  <div style={{fontSize:11,color:"var(--muted)",fontFamily:"var(--mono)",marginTop:2}}>par consultations</div>
                </div>
                <span style={{fontSize:11,color:"var(--gold)",fontFamily:"var(--mono)",cursor:"pointer"}}>Tout voir →</span>
              </div>
              {TOP_SUBJECTS.map((s,i)=>(
                <div key={s.rank} className="top-subject" style={{animationDelay:`${i*0.08}s`}}>
                  <div className="ts-rank" style={{color:s.rank===1?"var(--gold)":s.rank===2?"#C0C0C0":s.rank===3?"#CD7F32":"var(--muted)"}}>{s.rank===1?"🥇":s.rank===2?"🥈":s.rank===3?"🥉":s.rank}</div>
                  <div className="ts-emoji">{s.emoji}</div>
                  <div className="ts-body">
                    <div className="ts-name">{s.name}</div>
                    <div className="ts-meta">{s.meta}</div>
                    <div className="ts-trend-bar">
                      <div className="ts-trend-fill" style={{width:`${trendFills[i]}%`}}/>
                    </div>
                  </div>
                  <div className="ts-right">
                    <div className="ts-gain">{s.gain}</div>
                    <div className="ts-consult">{s.consult.toLocaleString()} consult.</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── GRID BOTTOM ── */}
          <div className="grid-bottom">

            {/* Subjects table */}
            <div className="card a6" style={{padding:0,overflow:"hidden"}}>
              <div style={{padding:"20px 22px 0",display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
                <div>
                  <div style={{fontSize:16,fontWeight:700}}>📋 Mes sujets</div>
                  <div style={{fontSize:11,color:"var(--muted)",fontFamily:"var(--mono)",marginTop:3}}>{SUBJECTS_LIST.length} sujets au total · {SUBJECTS_LIST.filter(s=>s.status==="wait").length} en attente</div>
                </div>
                <button className="btn-new" style={{fontSize:13,padding:"8px 16px"}} onClick={()=>setModal(true)}>+ Nouveau</button>
              </div>
              <div style={{overflowX:"auto"}}>
                <table className="subjects-table">
                  <thead>
                    <tr>
                      <th>Sujet</th>
                      <th>Type</th>
                      <th>Statut</th>
                      <th>Consultations</th>
                      <th>Gains</th>
                      <th>Note</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {SUBJECTS_LIST.map(s=>(
                      <tr key={s.id}>
                        <td>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <span style={{fontSize:17}}>{s.emoji}</span>
                            <span style={{fontSize:13,fontWeight:600}}>{s.name}</span>
                          </div>
                        </td>
                        <td><span style={{fontSize:11,fontFamily:"var(--mono)",color:"var(--muted)"}}>{s.type} · {s.annee}</span></td>
                        <td>{statusLabel(s.status)}</td>
                        <td><span style={{fontFamily:"var(--mono)",fontSize:13}}>{s.consult > 0 ? s.consult.toLocaleString() : "—"}</span></td>
                        <td><span className="row-gain">{s.gain !== "—" ? `${s.gain} Ar` : "—"}</span></td>
                        <td>
                          {s.note ? (
                            <div className="row-note">
                              <span>★</span>
                              <span style={{fontFamily:"var(--mono)",fontSize:12}}>{s.note}</span>
                            </div>
                          ) : <span style={{color:"var(--muted2)",fontSize:12}}>—</span>}
                        </td>
                        <td>
                          <button className="table-action" onClick={()=>showToast(`✏️ Édition de "${s.name}"`)}>
                            {s.status==="rej" ? "Corriger" : s.status==="draft" ? "Publier" : "Voir"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right col — Level + Timeline */}
            <div style={{display:"flex",flexDirection:"column",gap:16}}>

              {/* Level card */}
              <div className="card level-card a6">
                <div style={{fontSize:11,color:"var(--muted)",fontFamily:"var(--mono)",marginBottom:12,letterSpacing:".08em"}}>NIVEAU CONTRIBUTEUR</div>
                <div className="level-badge">🏅 Contributeur Or</div>
                <div className="level-bar-wrap">
                  <div className="level-bar-labels">
                    <span>5 104 consult.</span>
                    <span style={{color:"var(--gold)"}}>72% → Platine</span>
                  </div>
                  <div className="level-bar-track">
                    <div className="level-bar-fill" style={{width:`${levelFill}%`}}/>
                  </div>
                  <div style={{fontSize:11,color:"var(--muted)",fontFamily:"var(--mono)",marginTop:8}}>
                    Encore <strong style={{color:"var(--gold)"}}>2 796 consultations</strong> pour atteindre Platine
                  </div>
                </div>
                <div className="level-perks">
                  {[
                    ["✓","Commission 50% (standard Or)"],
                    ["✓","Badge Or visible sur profil"],
                    ["✓","Sujets mis en avant dans le catalogue"],
                    ["→","Platine : commission 55% + priorité validation"],
                  ].map(([icon,label],i)=>(
                    <div key={i} className="perk-row">
                      <span className="check" style={{color:i===3?"var(--teal)":"var(--gold)"}}>{icon}</span>
                      <span style={{color:i===3?"var(--teal)":"var(--muted)"}}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div className="card a7">
                <div style={{fontSize:15,fontWeight:700,marginBottom:16}}>⏱ Activité récente</div>
                <div className="timeline">
                  {TIMELINE.map((t,i)=>(
                    <div key={i} className="tl-item">
                      <div className={`tl-dot tl-dot-${t.dot}`}/>
                      <div className="tl-body">
                        <div className="tl-text">{t.text}</div>
                        <div className="tl-time">{t.time}</div>
                      </div>
                      <div className="tl-amount" style={{color:t.dot==="gold"?"var(--gold)":t.dot==="green"?"var(--teal)":"var(--rose)"}}>{t.amount}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── TIPS ── */}
          <div className="grid-tips">
            {[
              { icon:"💡", title:"Maximise tes gains", body:"Les sujets BAC Série C/D génèrent 3× plus de consultations que les autres. Priorise les années récentes (2022-2024) et les matières scientifiques.", badge:"🎯 Conseil stratégique", bc:"rgba(255,209,102,.2)", tc:"var(--gold)" },
              { icon:"📸", title:"Qualité = plus de consultations", body:"Un sujet avec images bien scanées (>300 dpi), formules propres en KaTeX et structure claire reçoit en moyenne 40% de consultations en plus.", badge:"⭐ Bonnes pratiques", bc:"rgba(10,255,224,.2)", tc:"var(--teal)" },
              { icon:"⚡", title:"Validation plus rapide", body:"Soumets tes sujets le dimanche soir — les vérificateurs traitent en priorité le lundi matin. Délai moyen : 18h vs 48h en semaine.", badge:"🚀 Astuce timing", bc:"rgba(167,139,250,.2)", tc:"var(--purple)" },
            ].map(t=>(
              <div key={t.title} className="tip-card">
                <div className="tip-icon">{t.icon}</div>
                <div className="tip-title">{t.title}</div>
                <div className="tip-body">{t.body}</div>
                <div className="tip-badge" style={{borderColor:t.bc,color:t.tc,background:`${t.bc}40`}}>{t.badge}</div>
              </div>
            ))}
          </div>

        </div>
      </main>

      {/* ── MODAL Nouveau Sujet ── */}
      {modal && (
        <div className="modal-overlay" onClick={e=>{ if(e.target===e.currentTarget) setModal(false); }}>
          <div className="modal">
            <button className="modal-close" onClick={()=>setModal(false)}>×</button>
            <div style={{fontSize:28,marginBottom:12}}>✏️</div>
            <div className="modal-title">Soumettre un nouveau sujet</div>
            <div className="modal-sub">Il sera examiné par un vérificateur avant publication. Délai : 24-48h.</div>

            <div className="form-group">
              <label className="form-label">Titre du sujet</label>
              <input className="form-input" placeholder="Ex : Mathématiques BAC 2024 — Série C" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Type d'examen</label>
                <select className="form-select">
                  <option>BAC</option>
                  <option>BEPC</option>
                  <option>CEPE</option>
                  <option>Concours FP</option>
                  <option>Université</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Année</label>
                <select className="form-select">
                  {[2024,2023,2022,2021,2020].map(y=><option key={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Matière</label>
                <select className="form-select">
                  {["Mathématiques","Physique-Chimie","SVT","Français","Histoire-Géo","Philosophie","Économie"].map(m=><option key={m}>{m}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Série</label>
                <select className="form-select">
                  <option>Toutes séries</option>
                  <option>Série A</option>
                  <option>Série C</option>
                  <option>Série D</option>
                  <option>Série G</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Prix (crédits)</label>
              <select className="form-select">
                <option>1 crédit (≈ 500 Ar)</option>
                <option>2 crédits (≈ 1 000 Ar)</option>
                <option>3 crédits (≈ 1 500 Ar)</option>
              </select>
            </div>
            <div style={{background:"var(--bg3)",border:"1px solid var(--border-gold)",borderRadius:12,padding:"12px 14px",marginBottom:16,fontSize:12,color:"var(--muted)"}}>
              💰 Commission : <strong style={{color:"var(--gold)"}}>50%</strong> de chaque consultation (niveau Or actuel).<br/>
              Sur 2 crédits = <strong style={{color:"var(--gold)"}}>450 Ar par consultation.</strong>
            </div>
            <button className="btn-submit" onClick={()=>{ setModal(false); showToast("✅ Sujet soumis ! Il sera validé sous 24-48h."); }}>
              Soumettre pour validation →
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      <div className={`toast ${toast.show?"show":""}`}>
        <span style={{fontSize:18}}>✨</span>
        <span>{toast.msg}</span>
      </div>
    </div>
  );
}
