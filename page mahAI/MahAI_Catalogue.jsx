import { useState, useEffect, useRef, useCallback } from "react";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,700;12..96,800&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --teal:#0AFFE0;--teal2:#00C9A7;--green:#00FF88;--gold:#FFD166;
    --rose:#FF6B9D;--blue:#4F8EF7;--purple:#A78BFA;--orange:#FF9F43;
    --bg:#060910;--bg2:#0C1220;--bg3:#111928;--bg4:#080E1C;
    --border:rgba(255,255,255,.07);--border2:rgba(10,255,224,.22);
    --text:#F0F4FF;--muted:#6B7899;--muted2:#3A4560;
    --font:'Bricolage Grotesque',sans-serif;--mono:'DM Mono',monospace;
    --r:16px;
  }
  html{scroll-behavior:smooth}
  body{font-family:var(--font);background:var(--bg);color:var(--text);overflow-x:hidden;-webkit-font-smoothing:antialiased}
  ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:var(--bg)}::-webkit-scrollbar-thumb{background:var(--teal2);border-radius:2px}
  body::before{content:'';position:fixed;inset:0;z-index:0;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");opacity:.4;pointer-events:none}
  .mesh{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden}
  .mesh span{position:absolute;border-radius:50%;filter:blur(150px);opacity:.055;animation:fm 24s ease-in-out infinite alternate}
  .mesh span:nth-child(1){width:700px;height:700px;top:-200px;left:-200px;background:var(--teal);animation-delay:0s}
  .mesh span:nth-child(2){width:500px;height:500px;bottom:-100px;right:-100px;background:var(--purple);animation-delay:-10s}
  @keyframes fm{0%{transform:translate(0,0)}100%{transform:translate(30px,-25px)}}

  /* ── NAV ── */
  nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:14px 36px;background:rgba(6,9,16,.8);backdrop-filter:blur(24px);border-bottom:1px solid var(--border)}
  .nav-logo{font-size:22px;font-weight:800;letter-spacing:-1px;background:linear-gradient(135deg,var(--teal),var(--green));-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-decoration:none}
  .nav-mid{display:flex;gap:6px}
  .nav-tab{background:transparent;border:1px solid transparent;color:var(--muted);padding:8px 18px;border-radius:10px;font-family:var(--font);font-size:13px;font-weight:500;cursor:pointer;transition:all .2s}
  .nav-tab:hover{color:var(--text);border-color:var(--border)}
  .nav-tab.active{background:rgba(10,255,224,.08);border-color:rgba(10,255,224,.2);color:var(--teal)}
  .nav-right{display:flex;align-items:center;gap:10px}
  .nav-credits{display:flex;align-items:center;gap:6px;background:rgba(10,255,224,.07);border:1px solid rgba(10,255,224,.18);padding:7px 14px;border-radius:9px;font-size:13px;font-family:var(--mono);color:var(--teal);cursor:pointer;transition:background .2s}
  .nav-credits:hover{background:rgba(10,255,224,.12)}
  .nav-avatar{width:34px;height:34px;border-radius:10px;background:linear-gradient(135deg,#1A3A5C,var(--teal2));display:flex;align-items:center;justify-content:center;font-size:15px;cursor:pointer;border:1px solid rgba(10,255,224,.2)}

  /* ── LAYOUT ── */
  .page-wrap{padding-top:62px;min-height:100vh;display:flex;flex-direction:column}
  .content-wrap{display:flex;flex:1;max-width:1440px;margin:0 auto;width:100%;padding:0 24px}

  /* ── SIDEBAR FILTERS ── */
  .filter-sidebar{width:256px;flex-shrink:0;padding:24px 0;position:sticky;top:62px;height:calc(100vh - 62px);overflow-y:auto;padding-right:16px;z-index:10}
  .filter-sidebar::-webkit-scrollbar{width:3px}
  .filter-sidebar::-webkit-scrollbar-thumb{background:var(--muted2);border-radius:2px}

  .filter-section{margin-bottom:24px}
  .filter-title{font-size:11px;color:var(--muted);font-family:var(--mono);letter-spacing:.12em;text-transform:uppercase;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between}
  .filter-title button{font-size:10px;color:var(--teal);background:none;border:none;cursor:pointer;font-family:var(--mono);padding:0}
  .filter-title button:hover{text-decoration:underline}

  .filter-chip-grid{display:flex;flex-wrap:wrap;gap:6px}
  .fchip{padding:6px 12px;border-radius:9px;border:1px solid var(--border);color:var(--muted);font-size:12px;font-weight:500;cursor:pointer;transition:all .18s;background:transparent;font-family:var(--font)}
  .fchip:hover{border-color:rgba(255,255,255,.15);color:var(--text)}
  .fchip.on{border-color:var(--teal2);background:rgba(10,255,224,.08);color:var(--teal)}

  .filter-range{margin-top:6px}
  .range-labels{display:flex;justify-content:space-between;font-size:11px;font-family:var(--mono);color:var(--muted);margin-bottom:8px}
  .range-slider{-webkit-appearance:none;width:100%;height:3px;background:linear-gradient(to right,var(--teal) 0%,var(--teal) var(--val,60%),rgba(255,255,255,.1) var(--val,60%));border-radius:2px;outline:none;cursor:pointer}
  .range-slider::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:var(--teal);cursor:pointer;border:2px solid var(--bg)}

  .year-pills{display:flex;flex-wrap:wrap;gap:5px}
  .ypill{padding:5px 10px;border-radius:7px;border:1px solid var(--border);color:var(--muted);font-size:11px;cursor:pointer;transition:all .18s;background:transparent;font-family:var(--mono)}
  .ypill:hover{border-color:rgba(255,255,255,.15);color:var(--text)}
  .ypill.on{border-color:var(--gold);background:rgba(255,209,102,.08);color:var(--gold)}

  .filter-reset{width:100%;padding:10px;border-radius:10px;border:1px solid var(--border);background:transparent;color:var(--muted);font-family:var(--font);font-size:13px;cursor:pointer;margin-top:8px;transition:all .2s}
  .filter-reset:hover{border-color:var(--border2);color:var(--text)}

  /* ── MAIN CATALOG ── */
  .catalog-main{flex:1;padding:24px 0 40px 24px;min-width:0}

  /* ── SEARCH BAR ── */
  .search-wrap{position:relative;margin-bottom:20px;animation:slideDown .5s ease both}
  @keyframes slideDown{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}
  .search-input-wrap{display:flex;align-items:center;gap:12px;background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:12px 20px;transition:border-color .2s,box-shadow .2s;cursor:text}
  .search-input-wrap:focus-within{border-color:var(--border2);box-shadow:0 0 0 3px rgba(10,255,224,.08)}
  .search-icon{font-size:18px;flex-shrink:0;color:var(--muted)}
  .search-input{flex:1;background:transparent;border:none;outline:none;font-family:var(--font);font-size:15px;color:var(--text)}
  .search-input::placeholder{color:var(--muted)}
  .search-kbd{font-family:var(--mono);font-size:11px;color:var(--muted2);background:var(--bg3);border:1px solid var(--muted2);padding:3px 7px;border-radius:5px;white-space:nowrap}
  .search-suggestions{position:absolute;top:calc(100% + 6px);left:0;right:0;background:var(--bg2);border:1px solid var(--border);border-radius:14px;overflow:hidden;z-index:50;box-shadow:0 20px 50px rgba(0,0,0,.4);animation:fadeIn .2s ease}
  @keyframes fadeIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
  .sugg-item{display:flex;align-items:center;gap:12px;padding:12px 20px;cursor:pointer;transition:background .15s}
  .sugg-item:hover{background:rgba(10,255,224,.05)}
  .sugg-icon{font-size:16px;width:20px;text-align:center;flex-shrink:0}
  .sugg-text{font-size:14px;color:var(--text)}
  .sugg-meta{font-size:11px;color:var(--muted);font-family:var(--mono);margin-left:auto}

  /* ── TOOLBAR ── */
  .toolbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;gap:12px;flex-wrap:wrap;animation:slideDown .5s .05s ease both}
  .results-count{font-size:13px;color:var(--muted);font-family:var(--mono)}
  .results-count strong{color:var(--text)}
  .toolbar-right{display:flex;align-items:center;gap:8px}
  .sort-select{background:var(--bg2);border:1px solid var(--border);color:var(--text);padding:8px 14px;border-radius:10px;font-family:var(--mono);font-size:12px;cursor:pointer;outline:none;transition:border-color .2s}
  .sort-select:hover{border-color:var(--border2)}
  .view-toggle{display:flex;gap:2px;background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:3px}
  .view-btn{width:32px;height:32px;border:none;background:transparent;color:var(--muted);border-radius:7px;cursor:pointer;font-size:14px;transition:all .2s;display:flex;align-items:center;justify-content:center}
  .view-btn.on{background:var(--bg3);color:var(--text)}

  /* ── ACTIVE FILTERS ── */
  .active-filters{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px}
  .af-chip{display:flex;align-items:center;gap:6px;background:rgba(10,255,224,.07);border:1px solid rgba(10,255,224,.2);color:var(--teal);padding:5px 12px;border-radius:100px;font-size:12px;font-family:var(--mono)}
  .af-chip button{background:none;border:none;color:var(--teal);cursor:pointer;font-size:14px;line-height:1;padding:0;margin-left:2px;opacity:.7}
  .af-chip button:hover{opacity:1}

  /* ── BENTO SUBJECT GRID ── */
  .subjects-grid{display:grid;gap:14px}
  .grid-3{grid-template-columns:repeat(3,1fr)}
  .grid-2{grid-template-columns:repeat(2,1fr)}
  .grid-list{grid-template-columns:1fr}

  /* ── SUBJECT CARD ── */
  .scard{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r);overflow:hidden;cursor:pointer;position:relative;transition:transform .3s cubic-bezier(.34,1.56,.64,1),border-color .25s,box-shadow .3s;animation:cardIn .45s ease both}
  @keyframes cardIn{from{opacity:0;transform:translateY(16px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}
  .scard::before{content:'';position:absolute;inset:0;opacity:0;background:radial-gradient(circle at var(--mx,50%) var(--my,50%),rgba(10,255,224,.06),transparent 60%);transition:opacity .4s;pointer-events:none;z-index:1}
  .scard:hover{transform:translateY(-5px);border-color:rgba(10,255,224,.22);box-shadow:0 20px 50px rgba(0,0,0,.4)}
  .scard:hover::before{opacity:1}
  .scard.list-mode{display:flex;align-items:center;gap:0}

  /* card accent top border */
  .scard::after{content:'';position:absolute;top:0;left:0;right:0;height:2px;opacity:0;transition:opacity .3s}
  .scard:hover::after{opacity:1}
  .acc-teal::after{background:linear-gradient(90deg,transparent,var(--teal),transparent)}
  .acc-gold::after{background:linear-gradient(90deg,transparent,var(--gold),transparent)}
  .acc-rose::after{background:linear-gradient(90deg,transparent,var(--rose),transparent)}
  .acc-blue::after{background:linear-gradient(90deg,transparent,var(--blue),transparent)}
  .acc-purple::after{background:linear-gradient(90deg,transparent,var(--purple),transparent)}
  .acc-green::after{background:linear-gradient(90deg,transparent,var(--green),transparent)}

  .scard-header{padding:18px 18px 0;position:relative;z-index:2}
  .scard-badges{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:12px}
  .sbadge{padding:3px 9px;border-radius:6px;font-size:10px;font-weight:700;font-family:var(--mono);border:1px solid}
  .sb-teal{background:rgba(10,255,224,.07);border-color:rgba(10,255,224,.2);color:var(--teal)}
  .sb-gold{background:rgba(255,209,102,.07);border-color:rgba(255,209,102,.2);color:var(--gold)}
  .sb-rose{background:rgba(255,107,157,.07);border-color:rgba(255,107,157,.2);color:var(--rose)}
  .sb-blue{background:rgba(79,142,247,.07);border-color:rgba(79,142,247,.2);color:var(--blue)}
  .sb-purple{background:rgba(167,139,250,.07);border-color:rgba(167,139,250,.2);color:var(--purple)}
  .sb-green{background:rgba(0,255,136,.07);border-color:rgba(0,255,136,.2);color:var(--green)}
  .sb-muted{background:rgba(255,255,255,.04);border-color:var(--border);color:var(--muted)}

  .scard-title{font-size:15px;font-weight:700;letter-spacing:-.3px;line-height:1.3;margin-bottom:6px}
  .scard-desc{font-size:12px;color:var(--muted);line-height:1.6;margin-bottom:0}

  .scard-body{padding:12px 18px;position:relative;z-index:2}
  .scard-stats{display:flex;align-items:center;gap:12px;margin-bottom:14px}
  .scard-stat{font-size:11px;color:var(--muted);font-family:var(--mono);display:flex;align-items:center;gap:4px}
  .stars-mini{color:var(--gold);font-size:11px;letter-spacing:.5px}

  .scard-footer{padding:0 18px 18px;display:flex;align-items:center;justify-content:space-between;position:relative;z-index:2}
  .scard-price{display:flex;flex-direction:column}
  .price-main{font-family:var(--mono);font-size:16px;font-weight:700;letter-spacing:-.5px}
  .price-ar{font-size:10px;color:var(--muted);font-family:var(--mono);margin-top:1px}
  .scard-actions{display:flex;gap:6px}
  .btn-wish{width:32px;height:32px;border-radius:8px;background:transparent;border:1px solid var(--border);color:var(--muted);font-size:14px;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center}
  .btn-wish:hover,.btn-wish.on{background:rgba(255,107,157,.1);border-color:rgba(255,107,157,.3);color:var(--rose)}
  .btn-consult{padding:8px 16px;border-radius:9px;background:linear-gradient(135deg,var(--teal),var(--teal2));color:var(--bg);border:none;font-family:var(--font);font-size:12px;font-weight:700;cursor:pointer;transition:transform .2s,box-shadow .25s;white-space:nowrap}
  .btn-consult:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(10,255,224,.3)}

  /* New badge */
  .new-badge{position:absolute;top:12px;right:12px;background:var(--teal);color:var(--bg);font-size:10px;font-weight:800;padding:3px 8px;border-radius:100px;font-family:var(--mono);z-index:3;animation:badgePop .5s cubic-bezier(.34,1.56,.64,1) both}
  @keyframes badgePop{from{opacity:0;transform:scale(0)}to{opacity:1;transform:scale(1)}}

  /* Popular badge */
  .pop-badge{position:absolute;top:12px;right:12px;background:linear-gradient(135deg,var(--gold),var(--orange));color:var(--bg);font-size:10px;font-weight:800;padding:3px 8px;border-radius:100px;font-family:var(--mono);z-index:3}

  /* ── LIST MODE CARD ── */
  .scard.list-mode .scard-header{padding:16px 18px;flex:1;display:flex;align-items:center;gap:16px}
  .scard.list-mode .scard-badges{margin-bottom:0;flex-wrap:nowrap}
  .scard.list-mode .scard-title{font-size:14px;margin-bottom:0}
  .scard.list-mode .scard-desc{display:none}
  .scard.list-mode .scard-body{padding:16px 0;display:flex;align-items:center;gap:16px}
  .scard.list-mode .scard-footer{padding:16px 18px 16px 0;flex-direction:column;align-items:flex-end;gap:6px}
  .scard.list-mode .scard-actions{flex-direction:row}

  /* ── FEATURED CARD (grande) ── */
  .scard-featured{grid-column:span 2;background:linear-gradient(135deg,#091A30,var(--bg2));border-color:rgba(10,255,224,.15)}
  .scard-featured .scard-title{font-size:20px}
  .scard-featured .scard-header{padding:24px 24px 0}
  .scard-featured .scard-body{padding:14px 24px}
  .scard-featured .scard-footer{padding:0 24px 24px}
  .featured-visual{height:5px;background:linear-gradient(90deg,var(--teal),var(--green),var(--gold));border-radius:0 0 4px 4px;margin:0 24px 14px;opacity:.6}

  /* ── EMPTY STATE ── */
  .empty-state{grid-column:1/-1;text-align:center;padding:80px 40px;color:var(--muted)}
  .empty-icon{font-size:48px;margin-bottom:16px}
  .empty-title{font-size:20px;font-weight:700;color:var(--text);margin-bottom:8px}
  .empty-sub{font-size:14px;color:var(--muted);margin-bottom:24px}

  /* ── SKELETON ── */
  .skeleton{background:linear-gradient(90deg,var(--bg3) 25%,rgba(255,255,255,.04) 50%,var(--bg3) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:8px}
  @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}

  /* ── PAGINATION ── */
  .pagination{display:flex;align-items:center;justify-content:center;gap:6px;margin-top:32px;padding-top:24px;border-top:1px solid var(--border)}
  .page-btn{width:36px;height:36px;border-radius:9px;background:var(--bg2);border:1px solid var(--border);color:var(--muted);font-family:var(--mono);font-size:13px;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center}
  .page-btn:hover:not(.active){border-color:var(--border2);color:var(--text)}
  .page-btn.active{background:rgba(10,255,224,.1);border-color:var(--border2);color:var(--teal);font-weight:700}
  .page-btn.prev,.page-btn.next{font-size:16px}

  /* ── TOAST ── */
  .toast{position:fixed;bottom:24px;right:24px;background:var(--bg2);border:1px solid rgba(10,255,224,.25);border-radius:14px;padding:14px 20px;display:flex;align-items:center;gap:10px;font-size:14px;box-shadow:0 20px 50px rgba(0,0,0,.5);z-index:300;transition:transform .4s cubic-bezier(.34,1.56,.64,1),opacity .3s;transform:translateY(80px);opacity:0}
  .toast.show{transform:translateY(0);opacity:1}

  /* ── STATS BANNER ── */
  .stats-banner{display:flex;gap:0;background:var(--bg2);border:1px solid var(--border);border-radius:14px;overflow:hidden;margin-bottom:20px;animation:slideDown .5s .1s ease both}
  .sbanner-item{flex:1;padding:14px 20px;border-right:1px solid var(--border);display:flex;align-items:center;gap:10px}
  .sbanner-item:last-child{border-right:none}
  .sbanner-icon{font-size:20px}
  .sbanner-num{font-size:20px;font-weight:800;letter-spacing:-1px;color:var(--teal)}
  .sbanner-label{font-size:11px;color:var(--muted);font-family:var(--mono)}

  /* ── MOBILE ── */
  @media(max-width:1000px){
    .filter-sidebar{display:none}
    .catalog-main{padding:16px 0}
    .grid-3{grid-template-columns:repeat(2,1fr)}
    .scard-featured{grid-column:span 2}
  }
  @media(max-width:640px){
    nav{padding:12px 16px}
    .nav-mid{display:none}
    .grid-3,.grid-2{grid-template-columns:1fr}
    .scard-featured{grid-column:span 1}
    .stats-banner{flex-direction:column}
    .sbanner-item{border-right:none;border-bottom:1px solid var(--border)}
    .sbanner-item:last-child{border-bottom:none}
  }
`;

// ── Data ────────────────────────────────────────────────────────
const SUBJECTS = [
  { id:1, type:"BAC", matiere:"Mathématiques", serie:"C&D", annee:2024, note:4.8, nb:1832, pages:6, credits:2, ar:"1 000", new:true, pop:false, desc:"Analyse, géométrie dans l'espace, probabilités. Niveau difficile.", acc:"teal", color:"var(--teal)", badges:[["BAC","teal"],["Maths","gold"],["2024","muted"],["Série C&D","rose"]], emoji:"📐" },
  { id:2, type:"BAC", matiere:"Physique-Chimie", serie:"C", annee:2024, note:4.6, nb:1245, pages:5, credits:2, ar:"1 000", new:true, pop:false, desc:"Mécanique, thermodynamique, chimie organique.", acc:"blue", color:"var(--blue)", badges:[["BAC","teal"],["Phys-Chimie","blue"],["2024","muted"],["Série C","blue"]], emoji:"⚗️" },
  { id:3, type:"BAC", matiere:"Français", serie:"Toutes", annee:2024, note:4.9, nb:2450, pages:4, credits:1, ar:"500", new:false, pop:true, desc:"Dissertation littéraire, commentaire composé, étude de texte.", acc:"rose", color:"var(--rose)", badges:[["BAC","teal"],["Français","rose"],["2024","muted"],["Toutes séries","muted"]], emoji:"📖" },
  { id:4, type:"BEPC", matiere:"Mathématiques", serie:null, annee:2024, note:4.7, nb:3210, pages:4, credits:1, ar:"500", new:true, pop:false, desc:"Algèbre, géométrie, probabilités. Conforme au programme national.", acc:"teal", color:"var(--teal)", badges:[["BEPC","teal"],["Maths","gold"],["2024","muted"]], emoji:"📐" },
  { id:5, type:"BAC", matiere:"SVT", serie:"D", annee:2023, note:4.5, nb:987, pages:5, credits:2, ar:"1 000", new:false, pop:false, desc:"Génétique, évolution, écologie, biologie cellulaire.", acc:"green", color:"var(--green)", badges:[["BAC","teal"],["SVT","green"],["2023","muted"],["Série D","green"]], emoji:"🌿" },
  { id:6, type:"Concours FP", matiere:"Culture Générale", serie:null, annee:2024, note:4.4, nb:654, pages:8, credits:3, ar:"1 500", new:false, pop:false, desc:"Histoire de Madagascar, institutions, culture nationale.", acc:"purple", color:"var(--purple)", badges:[["Concours FP","purple"],["Culture G.","purple"],["2024","muted"]], emoji:"🏛️" },
  { id:7, type:"BAC", matiere:"Histoire-Géo", serie:"Toutes", annee:2024, note:4.6, nb:1120, pages:5, credits:2, ar:"1 000", new:true, pop:false, desc:"Madagascar et le monde contemporain, géographie humaine.", acc:"gold", color:"var(--gold)", badges:[["BAC","teal"],["Hist-Géo","gold"],["2024","muted"]], emoji:"🌍" },
  { id:8, type:"CEPE", matiere:"Mathématiques", serie:null, annee:2024, note:4.8, nb:4532, pages:3, credits:1, ar:"500", new:false, pop:true, desc:"Calcul mental, fractions, géométrie. Adapté au niveau CM2.", acc:"teal", color:"var(--teal)", badges:[["CEPE","teal"],["Maths","gold"],["2024","muted"]], emoji:"🔢" },
  { id:9, type:"BAC", matiere:"Philosophie", serie:"A", annee:2023, note:4.3, nb:445, pages:3, credits:1, ar:"500", new:false, pop:false, desc:"Dissertation philosophique, notions au programme littéraire.", acc:"rose", color:"var(--rose)", badges:[["BAC","teal"],["Philo","rose"],["2023","muted"],["Série A","rose"]], emoji:"💭" },
  { id:10, type:"BAC", matiere:"Économie", serie:"G", annee:2024, note:4.5, nb:320, pages:5, credits:2, ar:"1 000", new:true, pop:false, desc:"Microéconomie, macroéconomie, comptabilité nationale.", acc:"gold", color:"var(--gold)", badges:[["BAC","teal"],["Économie","gold"],["2024","muted"],["Série G","gold"]], emoji:"📊" },
  { id:11, type:"BEPC", matiere:"Français", serie:null, annee:2023, note:4.7, nb:2100, pages:3, credits:1, ar:"500", new:false, pop:false, desc:"Production écrite, grammaire, orthographe, lecture.", acc:"rose", color:"var(--rose)", badges:[["BEPC","teal"],["Français","rose"],["2023","muted"]], emoji:"✍️" },
  { id:12, type:"BAC", matiere:"Mathématiques", serie:"C&D", annee:2023, note:4.6, nb:1560, pages:6, credits:2, ar:"1 000", new:false, pop:true, desc:"Fonctions, suites, complexes, probabilités. Annale 2023.", acc:"teal", color:"var(--teal)", badges:[["BAC","teal"],["Maths","gold"],["2023","muted"],["Série C&D","rose"]], emoji:"📐" },
];

const SUGGESTIONS = [
  { icon:"🔥", text:"BAC 2024 Mathématiques Série C", meta:"1 832 consultations" },
  { icon:"📚", text:"BEPC 2024 Français", meta:"Nouveau · 2024" },
  { icon:"⭐", text:"Concours ENS 2024", meta:"156 consultations" },
  { icon:"🕐", text:"BAC 2023 Physique-Chimie", meta:"Récemment consulté" },
];

export default function MahAICatalogue() {
  const [search, setSearch] = useState("");
  const [showSugg, setShowSugg] = useState(false);
  const [viewMode, setViewMode] = useState("grid3");
  const [sort, setSort] = useState("popular");
  const [activeType, setActiveType] = useState([]);
  const [activeMat, setActiveMat] = useState([]);
  const [activeYears, setActiveYears] = useState([]);
  const [maxCredits, setMaxCredits] = useState(3);
  const [wished, setWished] = useState(new Set());
  const [toast, setToast] = useState({ show:false, msg:"" });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Mouse glow
  useEffect(() => {
    const fn = e => {
      document.querySelectorAll(".scard").forEach(c => {
        const r = c.getBoundingClientRect();
        c.style.setProperty("--mx", `${((e.clientX-r.left)/r.width)*100}%`);
        c.style.setProperty("--my", `${((e.clientY-r.top)/r.height)*100}%`);
      });
    };
    window.addEventListener("mousemove", fn);
    return () => window.removeEventListener("mousemove", fn);
  }, []);

  // Simulate loading on filter change
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(t);
  }, [activeType, activeMat, activeYears, maxCredits, sort, search]);

  const showToast = msg => {
    setToast({ show:true, msg });
    setTimeout(() => setToast({ show:false, msg:"" }), 2800);
  };

  const toggleWish = (id, title) => {
    setWished(prev => {
      const n = new Set(prev);
      if (n.has(id)) { n.delete(id); showToast(`💔 Retiré des favoris`); }
      else { n.add(id); showToast(`❤️ Ajouté aux favoris — "${title}"`); }
      return n;
    });
  };

  const toggleFilter = (arr, setArr, val) =>
    setArr(prev => prev.includes(val) ? prev.filter(v=>v!==val) : [...prev, val]);

  const filtered = SUBJECTS.filter(s => {
    if (activeType.length && !activeType.includes(s.type)) return false;
    if (activeMat.length && !activeMat.includes(s.matiere)) return false;
    if (activeYears.length && !activeYears.includes(String(s.annee))) return false;
    if (s.credits > maxCredits) return false;
    if (search && !`${s.matiere} ${s.type} ${s.annee} ${s.serie||""}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const sorted = [...filtered].sort((a,b) => {
    if (sort==="popular") return b.nb - a.nb;
    if (sort==="recent") return b.annee - a.annee;
    if (sort==="note") return b.note - a.note;
    if (sort==="price_asc") return a.credits - b.credits;
    if (sort==="price_desc") return b.credits - a.credits;
    return 0;
  });

  const activeFiltersArr = [
    ...activeType.map(v=>({ label:`Type: ${v}`, clear:()=>toggleFilter(activeType,setActiveType,v) })),
    ...activeMat.map(v=>({ label:`Matière: ${v}`, clear:()=>toggleFilter(activeMat,setActiveMat,v) })),
    ...activeYears.map(v=>({ label:`Année: ${v}`, clear:()=>toggleFilter(activeYears,setActiveYears,v) })),
    ...(maxCredits < 3 ? [{ label:`Max ${maxCredits} crédits`, clear:()=>setMaxCredits(3) }] : []),
  ];

  const gridClass = viewMode==="grid3" ? "grid-3" : viewMode==="grid2" ? "grid-2" : "grid-list";

  const SkeletonCard = () => (
    <div style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:"var(--r)", padding:18, overflow:"hidden" }}>
      <div style={{ display:"flex", gap:6, marginBottom:14 }}>
        {[60,80,50].map((w,i)=>(<div key={i} className="skeleton" style={{ height:20, width:w, borderRadius:6 }} />))}
      </div>
      <div className="skeleton" style={{ height:16, marginBottom:8, borderRadius:6 }} />
      <div className="skeleton" style={{ height:16, width:"70%", marginBottom:16, borderRadius:6 }} />
      <div className="skeleton" style={{ height:12, width:"90%", marginBottom:6, borderRadius:6 }} />
      <div className="skeleton" style={{ height:12, width:"60%", marginBottom:20, borderRadius:6 }} />
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div className="skeleton" style={{ height:20, width:60, borderRadius:6 }} />
        <div className="skeleton" style={{ height:34, width:90, borderRadius:9 }} />
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh" }}>
      <div className="mesh"><span /><span /></div>

      {/* NAV */}
      <nav>
        <a href="#" className="nav-logo">Mah.AI</a>
        <div className="nav-mid">
          {["Catalogue","Examens blancs","Mes sujets","Progrès"].map((t,i) => (
            <button key={t} className={`nav-tab ${i===0?"active":""}`}>{t}</button>
          ))}
        </div>
        <div className="nav-right">
          <div className="nav-credits">💎 12 crédits</div>
          <div className="nav-avatar">👤</div>
        </div>
      </nav>

      <div className="page-wrap">
        <div className="content-wrap">

          {/* ── SIDEBAR FILTERS ── */}
          <aside className="filter-sidebar">

            {/* Type d'examen */}
            <div className="filter-section">
              <div className="filter-title">
                Type d'examen
                {activeType.length > 0 && <button onClick={() => setActiveType([])}>Effacer</button>}
              </div>
              <div className="filter-chip-grid">
                {["BAC","BEPC","CEPE","Concours FP","Université"].map(t => (
                  <button key={t} className={`fchip ${activeType.includes(t)?"on":""}`}
                    onClick={() => toggleFilter(activeType, setActiveType, t)}>{t}</button>
                ))}
              </div>
            </div>

            {/* Matière */}
            <div className="filter-section">
              <div className="filter-title">
                Matière
                {activeMat.length > 0 && <button onClick={() => setActiveMat([])}>Effacer</button>}
              </div>
              <div className="filter-chip-grid">
                {["Mathématiques","Physique-Chimie","SVT","Français","Histoire-Géo","Philosophie","Économie","Culture Générale"].map(m => (
                  <button key={m} className={`fchip ${activeMat.includes(m)?"on":""}`}
                    onClick={() => toggleFilter(activeMat, setActiveMat, m)}>{m}</button>
                ))}
              </div>
            </div>

            {/* Année */}
            <div className="filter-section">
              <div className="filter-title">
                Année
                {activeYears.length > 0 && <button onClick={() => setActiveYears([])}>Effacer</button>}
              </div>
              <div className="year-pills">
                {["2024","2023","2022","2021","2020","2019","2018"].map(y => (
                  <button key={y} className={`ypill ${activeYears.includes(y)?"on":""}`}
                    onClick={() => toggleFilter(activeYears, setActiveYears, y)}>{y}</button>
                ))}
              </div>
            </div>

            {/* Prix */}
            <div className="filter-section">
              <div className="filter-title">
                Crédits max
                <span style={{ color:"var(--teal)", fontFamily:"var(--mono)", fontSize:12 }}>≤ {maxCredits} cr.</span>
              </div>
              <div className="filter-range">
                <div className="range-labels"><span>1</span><span>3</span></div>
                <input type="range" min={1} max={3} step={1} value={maxCredits}
                  className="range-slider"
                  style={{"--val":`${((maxCredits-1)/2)*100}%`}}
                  onChange={e => setMaxCredits(Number(e.target.value))} />
              </div>
            </div>

            {/* Correction disponible */}
            <div className="filter-section">
              <div className="filter-title">Correction disponible</div>
              <div className="filter-chip-grid">
                {["Correction IA","Correction Prof","Examen blanc"].map(c => (
                  <button key={c} className="fchip">{c}</button>
                ))}
              </div>
            </div>

            {activeFiltersArr.length > 0 && (
              <button className="filter-reset" onClick={() => {
                setActiveType([]); setActiveMat([]); setActiveYears([]); setMaxCredits(3);
              }}>Réinitialiser tous les filtres</button>
            )}
          </aside>

          {/* ── CATALOGUE MAIN ── */}
          <div className="catalog-main">

            {/* Stats banner */}
            <div className="stats-banner">
              {[
                { icon:"📚", num:"200+", label:"sujets disponibles" },
                { icon:"🎓", num:"5", label:"types d'examen" },
                { icon:"📅", num:"2014-2024", label:"années couvertes" },
                { icon:"✅", num:"100%", label:"sujets vérifiés" },
              ].map(s => (
                <div key={s.label} className="sbanner-item">
                  <div className="sbanner-icon">{s.icon}</div>
                  <div>
                    <div className="sbanner-num">{s.num}</div>
                    <div className="sbanner-label">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Search */}
            <div className="search-wrap" ref={searchRef}>
              <div className="search-input-wrap" onClick={() => setShowSugg(true)}>
                <div className="search-icon">🔍</div>
                <input className="search-input" placeholder="Rechercher : matière, type d'examen, année..."
                  value={search} onChange={e => { setSearch(e.target.value); setShowSugg(true); }}
                  onFocus={() => setShowSugg(true)} />
                {search ? (
                  <button onClick={() => { setSearch(""); setShowSugg(false); }}
                    style={{ background:"none", border:"none", color:"var(--muted)", cursor:"pointer", fontSize:16 }}>×</button>
                ) : (
                  <span className="search-kbd">⌘K</span>
                )}
              </div>
              {showSugg && !search && (
                <div className="search-suggestions">
                  <div style={{ padding:"10px 20px 6px", fontSize:11, color:"var(--muted)", fontFamily:"var(--mono)", letterSpacing:".1em", textTransform:"uppercase" }}>Suggestions populaires</div>
                  {SUGGESTIONS.map(s => (
                    <div key={s.text} className="sugg-item" onClick={() => { setSearch(s.text); setShowSugg(false); }}>
                      <div className="sugg-icon">{s.icon}</div>
                      <div className="sugg-text">{s.text}</div>
                      <div className="sugg-meta">{s.meta}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Toolbar */}
            <div className="toolbar" onClick={() => setShowSugg(false)}>
              <div className="results-count">
                <strong>{sorted.length}</strong> sujets trouvés
                {activeFiltersArr.length > 0 && <span> · {activeFiltersArr.length} filtre{activeFiltersArr.length>1?"s":""} actif{activeFiltersArr.length>1?"s":""}</span>}
              </div>
              <div className="toolbar-right">
                <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
                  <option value="popular">⭐ Plus populaires</option>
                  <option value="recent">🆕 Plus récents</option>
                  <option value="note">🏆 Mieux notés</option>
                  <option value="price_asc">💚 Prix croissant</option>
                  <option value="price_desc">💛 Prix décroissant</option>
                </select>
                <div className="view-toggle">
                  {[["grid3","⊞"],["grid2","⊟"],["list","☰"]].map(([mode, icon]) => (
                    <button key={mode} className={`view-btn ${viewMode===mode?"on":""}`}
                      onClick={() => setViewMode(mode)}>{icon}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Active filters */}
            {activeFiltersArr.length > 0 && (
              <div className="active-filters">
                {activeFiltersArr.map((f, i) => (
                  <div key={i} className="af-chip">
                    {f.label}
                    <button onClick={f.clear}>×</button>
                  </div>
                ))}
              </div>
            )}

            {/* Grid */}
            <div className={`subjects-grid ${gridClass}`} onClick={() => setShowSugg(false)}>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} style={{ animationDelay: `${i * 0.05}s` }}><SkeletonCard /></div>
                ))
              ) : sorted.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🔍</div>
                  <div className="empty-title">Aucun sujet trouvé</div>
                  <div className="empty-sub">Essaie d'élargir tes filtres ou de changer ta recherche.</div>
                  <button className="btn-consult" onClick={() => {
                    setActiveType([]); setActiveMat([]); setActiveYears([]); setMaxCredits(3); setSearch("");
                  }} style={{ padding:"10px 24px", fontSize:14 }}>Réinitialiser les filtres</button>
                </div>
              ) : (
                sorted.map((s, i) => {
                  const isFirst = i === 0 && viewMode === "grid3";
                  return (
                    <div key={s.id}
                      className={`scard acc-${s.acc} ${isFirst?"scard-featured":""} ${viewMode==="list"?"list-mode":""}`}
                      style={{ animationDelay:`${Math.min(i,8)*0.05}s` }}>

                      {s.new && <div className="new-badge">NOUVEAU</div>}
                      {s.pop && !s.new && <div className="pop-badge">⭐ POPULAIRE</div>}

                      {isFirst && <div className="featured-visual" />}

                      <div className="scard-header">
                        <div className="scard-badges">
                          {s.badges.map(([label, col]) => (
                            <span key={label} className={`sbadge sb-${col}`}>{label}</span>
                          ))}
                        </div>
                        <div className="scard-title">{s.emoji} {s.matiere} — {s.type} {s.annee}</div>
                        {viewMode !== "list" && <div className="scard-desc">{s.desc}</div>}
                      </div>

                      <div className="scard-body">
                        <div className="scard-stats">
                          <div className="scard-stat">
                            <span className="stars-mini">{"★".repeat(Math.floor(s.note))}</span>
                            <span style={{ color:"var(--text)", fontWeight:600 }}>{s.note}</span>
                            <span>({s.nb.toLocaleString()})</span>
                          </div>
                          <div className="scard-stat">📄 {s.pages}p</div>
                          {s.serie && <div className="scard-stat">📋 {s.serie}</div>}
                        </div>
                      </div>

                      <div className="scard-footer">
                        <div className="scard-price">
                          <div className="price-main" style={{ color: s.color }}>{s.credits} crédit{s.credits>1?"s":""}</div>
                          <div className="price-ar">≈ {s.ar} Ar</div>
                        </div>
                        <div className="scard-actions">
                          <button className={`btn-wish ${wished.has(s.id)?"on":""}`}
                            onClick={e => { e.stopPropagation(); toggleWish(s.id, `${s.matiere} ${s.type} ${s.annee}`); }}>
                            {wished.has(s.id) ? "❤️" : "🤍"}
                          </button>
                          <button className="btn-consult"
                            onClick={() => showToast(`📄 Ouverture de "${s.matiere} ${s.type} ${s.annee}"...`)}>
                            Consulter →
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination */}
            {!loading && sorted.length > 0 && (
              <div className="pagination">
                <button className="page-btn prev" onClick={() => setCurrentPage(p => Math.max(1,p-1))}>‹</button>
                {[1,2,3,4,5].map(n => (
                  <button key={n} className={`page-btn ${currentPage===n?"active":""}`}
                    onClick={() => setCurrentPage(n)}>{n}</button>
                ))}
                <button className="page-btn next" onClick={() => setCurrentPage(p => Math.min(5,p+1))}>›</button>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Toast */}
      <div className={`toast ${toast.show?"show":""}`}>
        <span style={{ fontSize:18 }}>✨</span>
        <span>{toast.msg}</span>
      </div>
    </div>
  );
}
