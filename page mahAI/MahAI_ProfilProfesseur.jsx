import { useState, useEffect, useRef } from "react";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,700;12..96,800&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --purple:#A78BFA;--purple2:#7C3AED;--purple3:#4C1D95;
    --teal:#0AFFE0;--teal2:#00C9A7;--green:#00FF88;
    --gold:#FFD166;--rose:#FF6B9D;--blue:#4F8EF7;
    --bg:#070810;--bg2:#0E0C1A;--bg3:#141025;
    --border:rgba(255,255,255,.07);--border-p:rgba(167,139,250,.2);
    --text:#F0F4FF;--muted:#6B7899;--muted2:#3A4560;
    --font:'Bricolage Grotesque',sans-serif;--mono:'DM Mono',monospace;
    --r:16px;
  }
  html{scroll-behavior:smooth}
  body{font-family:var(--font);background:var(--bg);color:var(--text);overflow-x:hidden;-webkit-font-smoothing:antialiased}
  ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:var(--bg)}
  ::-webkit-scrollbar-thumb{background:var(--purple2);border-radius:2px}
  body::before{content:'';position:fixed;inset:0;z-index:0;opacity:.35;pointer-events:none;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")}

  .mesh{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden}
  .mesh span{position:absolute;border-radius:50%;filter:blur(150px);animation:fm 24s ease-in-out infinite alternate}
  .mesh span:nth-child(1){width:600px;height:600px;top:-150px;right:-100px;background:var(--purple);opacity:.06;animation-delay:0s}
  .mesh span:nth-child(2){width:500px;height:500px;bottom:-100px;left:-100px;background:var(--blue);opacity:.04;animation-delay:-10s}
  .mesh span:nth-child(3){width:300px;height:300px;top:40%;left:40%;background:var(--teal);opacity:.03;animation-delay:-17s}
  @keyframes fm{0%{transform:translate(0,0)}100%{transform:translate(25px,-18px)}}

  /* ── NAV ── */
  nav{position:fixed;top:0;left:0;right:0;z-index:100;height:58px;display:flex;align-items:center;justify-content:space-between;padding:0 32px;background:rgba(7,8,16,.9);backdrop-filter:blur(24px);border-bottom:1px solid var(--border)}
  .nav-logo{font-size:19px;font-weight:800;letter-spacing:-1px;background:linear-gradient(135deg,var(--teal),var(--green));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
  .btn-ghost{background:transparent;border:1px solid var(--border);color:var(--muted);padding:7px 14px;border-radius:9px;font-family:var(--font);font-size:13px;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:6px}
  .btn-ghost:hover{border-color:rgba(255,255,255,.18);color:var(--text)}
  .btn-cta{background:linear-gradient(135deg,var(--purple),var(--purple2));color:#fff;border:none;padding:8px 18px;border-radius:9px;font-family:var(--font);font-size:13px;font-weight:700;cursor:pointer;transition:transform .2s,box-shadow .25s}
  .btn-cta:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(124,58,237,.4)}

  /* ── HERO ── */
  .hero{position:relative;padding-top:58px;background:linear-gradient(180deg,rgba(167,139,250,.05) 0%,transparent 70%);border-bottom:1px solid var(--border);overflow:hidden}
  .hero::before{content:'';position:absolute;top:58px;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(167,139,250,.5),transparent)}
  .hero-inner{max-width:1100px;margin:0 auto;padding:48px 32px 40px;display:grid;grid-template-columns:auto 1fr;gap:36px;align-items:start}

  /* Avatar */
  .avatar-zone{flex-shrink:0;position:relative}
  .avatar-outer{
    width:120px;height:120px;border-radius:32px;
    background:linear-gradient(135deg,#1A0A3A,#2D1B6E);
    border:2px solid rgba(167,139,250,.3);
    display:flex;align-items:center;justify-content:center;font-size:56px;
    box-shadow:0 0 0 7px rgba(167,139,250,.07),0 24px 60px rgba(0,0,0,.6);
    animation:avatarIn .5s cubic-bezier(.34,1.56,.64,1) both;position:relative;overflow:hidden;
  }
  @keyframes avatarIn{from{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}}
  .avatar-outer::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 30% 30%,rgba(167,139,250,.15),transparent 60%)}
  .verified-badge{
    position:absolute;bottom:-10px;left:50%;transform:translateX(-50%);
    background:linear-gradient(135deg,var(--purple),var(--purple2));color:#fff;
    font-size:9px;font-weight:900;font-family:var(--mono);
    padding:3px 11px;border-radius:100px;white-space:nowrap;
    box-shadow:0 4px 18px rgba(124,58,237,.5);display:flex;align-items:center;gap:4px;
  }

  /* Hero info */
  .hero-info{animation:slideUp .45s ease both;min-width:0}
  @keyframes slideUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  .hero-badges{display:flex;align-items:center;gap:8px;margin-bottom:14px;flex-wrap:wrap}
  .hb{display:flex;align-items:center;gap:5px;padding:4px 12px;border-radius:100px;font-size:11px;font-weight:700;font-family:var(--mono);border:1px solid}
  .hb-purple{background:rgba(167,139,250,.08);border-color:rgba(167,139,250,.25);color:var(--purple)}
  .hb-green{background:rgba(0,255,136,.07);border-color:rgba(0,255,136,.2);color:var(--green)}
  .hb-gold{background:rgba(255,209,102,.07);border-color:rgba(255,209,102,.2);color:var(--gold)}
  .hero-name{font-size:clamp(28px,5vw,44px);font-weight:800;letter-spacing:-2px;line-height:1.1;margin-bottom:8px}
  .hero-title{font-size:15px;color:var(--muted);margin-bottom:16px;line-height:1.65;max-width:560px}
  .hero-tags{display:flex;gap:8px;flex-wrap:wrap}
  .hero-tag{display:flex;align-items:center;gap:5px;font-size:12px;color:var(--muted);background:var(--bg2);border:1px solid var(--border);padding:5px 12px;border-radius:8px;font-family:var(--mono)}

  /* Stat row under hero */
  .hero-stats-row{max-width:1100px;margin:0 auto;padding:0 32px 36px;display:grid;grid-template-columns:repeat(5,1fr);gap:12px}
  .stat-pill{background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:14px 16px;text-align:center;transition:all .3s}
  .stat-pill:hover{border-color:rgba(167,139,250,.2);transform:translateY(-2px)}
  .sp-num{font-family:var(--mono);font-size:22px;font-weight:800;letter-spacing:-1.5px;line-height:1}
  .sp-label{font-size:10px;color:var(--muted);font-family:var(--mono);margin-top:4px}

  /* ── MAIN ── */
  .main{max-width:1100px;margin:0 auto;padding:32px 32px 80px;display:grid;grid-template-columns:1fr 340px;gap:24px}

  /* Cards */
  .card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r);padding:22px;margin-bottom:14px;animation:slideUp .5s ease both;transition:border-color .25s;position:relative;overflow:hidden}
  .card:hover{border-color:rgba(255,255,255,.1)}
  .card-title{font-size:15px;font-weight:700;display:flex;align-items:center;gap:8px;margin-bottom:4px}
  .card-sub{font-size:12px;color:var(--muted);margin-bottom:18px;line-height:1.5}

  /* Matières grid */
  .matiere-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
  .mg-card{background:var(--bg3);border:1px solid var(--border);border-radius:12px;padding:14px 16px;display:flex;align-items:center;gap:12px;transition:all .25s;cursor:pointer}
  .mg-card:hover{border-color:rgba(167,139,250,.2);transform:translateX(3px)}
  .mg-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0;border:1px solid}
  .mg-name{font-size:13px;font-weight:700}
  .mg-meta{font-size:10px;color:var(--muted);font-family:var(--mono);margin-top:2px}

  /* Timeline expérience */
  .timeline{position:relative;padding-left:24px}
  .timeline::before{content:'';position:absolute;left:7px;top:6px;bottom:6px;width:2px;background:linear-gradient(180deg,var(--purple),rgba(167,139,250,.1))}
  .tl-item{position:relative;margin-bottom:20px}
  .tl-item:last-child{margin-bottom:0}
  .tl-dot{position:absolute;left:-21px;top:5px;width:12px;height:12px;border-radius:50%;border:2px solid var(--purple);background:var(--bg2);flex-shrink:0}
  .tl-dot.current{background:var(--purple);box-shadow:0 0 0 4px rgba(167,139,250,.15)}
  .tl-year{font-size:10px;color:var(--purple);font-family:var(--mono);font-weight:700;margin-bottom:3px}
  .tl-title{font-size:13px;font-weight:700;margin-bottom:2px}
  .tl-place{font-size:12px;color:var(--muted)}

  /* Reviews */
  .reviews-grid{display:flex;flex-direction:column;gap:12px}
  .review-card{background:var(--bg3);border:1px solid var(--border);border-radius:12px;padding:16px;transition:border-color .2s}
  .review-card:hover{border-color:rgba(167,139,250,.15)}
  .rc-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px}
  .rc-user{display:flex;align-items:center;gap:10px}
  .rc-avatar{width:32px;height:32px;border-radius:9px;background:linear-gradient(135deg,#1A0A3A,var(--purple2));display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0}
  .rc-name{font-size:13px;font-weight:700}
  .rc-meta{font-size:10px;color:var(--muted);font-family:var(--mono);margin-top:2px}
  .rc-stars{display:flex;gap:2px}
  .rc-text{font-size:13px;color:var(--muted);line-height:1.65;margin-bottom:8px}
  .rc-tag{display:inline-flex;align-items:center;gap:5px;font-size:10px;font-family:var(--mono);color:var(--purple);background:rgba(167,139,250,.07);border:1px solid rgba(167,139,250,.15);padding:2px 8px;border-radius:5px}

  /* FAQ */
  .faq-item{border-bottom:1px solid var(--border);padding:14px 0;cursor:pointer}
  .faq-item:last-child{border-bottom:none}
  .faq-q{display:flex;align-items:center;justify-content:space-between;font-size:13px;font-weight:700;gap:12px}
  .faq-toggle{font-size:16px;color:var(--muted);transition:transform .25s;flex-shrink:0}
  .faq-toggle.open{transform:rotate(180deg)}
  .faq-a{font-size:12px;color:var(--muted);line-height:1.7;margin-top:10px;display:none}
  .faq-a.open{display:block;animation:slideUp .3s ease}

  /* ── RIGHT SIDEBAR ── */
  .right-col{}
  .sticky-wrap{position:sticky;top:74px;display:flex;flex-direction:column;gap:14px}

  /* Booking card */
  .booking-card{
    background:linear-gradient(135deg,rgba(124,58,237,.12),rgba(167,139,250,.04));
    border:1px solid rgba(167,139,250,.25);border-radius:var(--r);padding:22px;
  }
  .bc-title{font-size:14px;font-weight:700;color:var(--purple);margin-bottom:4px;display:flex;align-items:center;gap:7px}
  .bc-sub{font-size:12px;color:var(--muted);margin-bottom:18px;line-height:1.5}

  /* Tarifs */
  .tarif-options{display:flex;flex-direction:column;gap:8px;margin-bottom:16px}
  .tarif-card{
    background:var(--bg2);border:1px solid var(--border);border-radius:12px;
    padding:12px 14px;cursor:pointer;transition:all .22s;display:flex;align-items:center;gap:12px;
    position:relative;
  }
  .tarif-card:hover{border-color:rgba(167,139,250,.2)}
  .tarif-card.selected{background:rgba(167,139,250,.07);border-color:rgba(167,139,250,.3)}
  .tarif-card.selected::before{content:'✓';position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:13px;color:var(--purple);font-weight:700}
  .tc-icon{font-size:20px;flex-shrink:0}
  .tc-info{flex:1;min-width:0}
  .tc-name{font-size:12px;font-weight:700}
  .tc-desc{font-size:10px;color:var(--muted);font-family:var(--mono);margin-top:2px}
  .tc-price{font-family:var(--mono);font-size:13px;font-weight:800;color:var(--purple);flex-shrink:0;text-align:right}
  .tc-delay{font-size:9px;color:var(--muted);font-family:var(--mono)}

  /* Dispo */
  .dispo-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:10px 14px}
  .dr-left{display:flex;align-items:center;gap:7px;font-size:12px}
  .dr-dot{width:7px;height:7px;border-radius:50%;background:var(--green);animation:pulse 2s ease-in-out infinite}
  @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.8)}}
  .dr-slots{font-size:11px;color:var(--muted);font-family:var(--mono)}
  .dr-val{font-size:11px;font-family:var(--mono);font-weight:700;color:var(--green)}

  /* CTA button */
  .btn-book{
    width:100%;background:linear-gradient(135deg,var(--purple),var(--purple2));
    color:#fff;border:none;padding:14px;border-radius:12px;
    font-family:var(--font);font-size:15px;font-weight:800;cursor:pointer;
    transition:transform .2s,box-shadow .25s;display:flex;align-items:center;justify-content:center;gap:8px;
    margin-bottom:8px;
  }
  .btn-book:hover{transform:translateY(-2px);box-shadow:0 12px 36px rgba(124,58,237,.4)}
  .bc-guarantee{font-size:10px;color:var(--muted);font-family:var(--mono);text-align:center;line-height:1.5;margin-top:8px}

  /* Info card */
  .info-card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r);padding:18px}
  .ic-row{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.04)}
  .ic-row:last-child{border-bottom:none}
  .ic-icon{font-size:16px;width:20px;text-align:center;flex-shrink:0}
  .ic-label{font-size:12px;color:var(--muted);flex:1}
  .ic-val{font-size:12px;font-weight:600;font-family:var(--mono);text-align:right;color:var(--text)}

  /* Score card */
  .score-card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r);padding:18px}
  .score-big{font-family:var(--mono);font-size:48px;font-weight:800;letter-spacing:-3px;color:var(--purple);line-height:1;text-align:center}
  .score-stars{display:flex;gap:4px;justify-content:center;margin:6px 0}
  .score-label{font-size:11px;color:var(--muted);font-family:var(--mono);text-align:center;margin-bottom:14px}
  .score-bar-row{display:flex;align-items:center;gap:8px;margin-bottom:7px}
  .sbr-num{font-size:10px;font-family:var(--mono);color:var(--muted);width:8px}
  .sbr-track{flex:1;height:4px;background:rgba(255,255,255,.06);border-radius:2px;overflow:hidden}
  .sbr-fill{height:100%;border-radius:2px;background:linear-gradient(90deg,var(--purple),var(--blue));transition:width 1.4s cubic-bezier(.4,0,.2,1)}
  .sbr-count{font-size:10px;font-family:var(--mono);color:var(--muted);width:16px;text-align:right}

  /* ── MODAL BOOKING ── */
  .overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:200;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(12px);animation:fadeIn .2s ease;padding:20px}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  .modal{background:var(--bg2);border:1px solid var(--border);border-radius:22px;padding:32px;width:100%;max-width:520px;position:relative;animation:modalIn .4s cubic-bezier(.34,1.56,.64,1);max-height:90vh;overflow-y:auto}
  @keyframes modalIn{from{opacity:0;transform:scale(.88) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}}
  .modal-close{position:absolute;top:14px;right:14px;background:var(--bg3);border:1px solid var(--border);color:var(--muted);width:30px;height:30px;border-radius:8px;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;transition:all .2s}
  .modal-close:hover{border-color:rgba(167,139,250,.3);color:var(--text)}

  /* Steps */
  .steps-row{display:flex;align-items:center;margin-bottom:28px;gap:0}
  .step-wrap{flex:1;display:flex;flex-direction:column;align-items:center;position:relative}
  .step-wrap:not(:last-child)::after{content:'';position:absolute;top:14px;left:50%;width:100%;height:2px;background:var(--border);z-index:0}
  .step-wrap.done:not(:last-child)::after,.step-wrap.active:not(:last-child)::after{background:var(--purple)}
  .step-circle{width:28px;height:28px;border-radius:50%;border:2px solid var(--border);background:var(--bg2);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;font-family:var(--mono);z-index:1;transition:all .3s}
  .step-wrap.done .step-circle{background:var(--purple);border-color:var(--purple);color:#fff}
  .step-wrap.active .step-circle{border-color:var(--purple);color:var(--purple);box-shadow:0 0 0 4px rgba(167,139,250,.15)}
  .step-lbl{font-size:9px;color:var(--muted);font-family:var(--mono);margin-top:5px;text-align:center}
  .step-wrap.active .step-lbl,.step-wrap.done .step-lbl{color:var(--purple)}

  .modal-step-title{font-size:18px;font-weight:800;letter-spacing:-.5px;margin-bottom:4px}
  .modal-step-sub{font-size:13px;color:var(--muted);margin-bottom:20px;line-height:1.5}

  /* Form */
  .mf-group{display:flex;flex-direction:column;gap:6px;margin-bottom:14px}
  .mf-label{font-size:11px;color:var(--muted);font-family:var(--mono);letter-spacing:.08em;text-transform:uppercase}
  .mf-input{background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:11px 14px;color:var(--text);font-family:var(--font);font-size:14px;outline:none;transition:border-color .2s;width:100%}
  .mf-input:focus{border-color:rgba(167,139,250,.35)}
  .mf-textarea{background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:11px 14px;color:var(--text);font-family:var(--font);font-size:14px;outline:none;resize:vertical;min-height:90px;width:100%;transition:border-color .2s;line-height:1.6}
  .mf-textarea:focus{border-color:rgba(167,139,250,.35)}

  /* Tarif selected summary */
  .tarif-summary{background:rgba(167,139,250,.07);border:1px solid rgba(167,139,250,.2);border-radius:10px;padding:12px 14px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between}
  .ts-label{font-size:13px;font-weight:700;color:var(--purple)}
  .ts-price{font-family:var(--mono);font-size:16px;font-weight:800;color:var(--purple)}

  .btn-modal-next{width:100%;background:linear-gradient(135deg,var(--purple),var(--purple2));color:#fff;border:none;padding:13px;border-radius:11px;font-family:var(--font);font-size:15px;font-weight:800;cursor:pointer;transition:all .2s;margin-top:4px}
  .btn-modal-next:hover{transform:translateY(-1px);box-shadow:0 8px 28px rgba(124,58,237,.4)}
  .btn-modal-back{width:100%;background:transparent;border:1px solid var(--border);color:var(--muted);padding:10px;border-radius:10px;font-family:var(--font);font-size:13px;cursor:pointer;transition:all .2s;margin-top:6px}
  .btn-modal-back:hover{border-color:rgba(255,255,255,.2);color:var(--text)}

  /* Success */
  .success-anim{text-align:center;padding:16px 0}
  .success-ring{width:80px;height:80px;border-radius:50%;background:rgba(0,255,136,.1);border:2px solid rgba(0,255,136,.3);display:flex;align-items:center;justify-content:center;font-size:36px;margin:0 auto 16px;animation:popIn .5s cubic-bezier(.34,1.56,.64,1)}
  @keyframes popIn{from{opacity:0;transform:scale(0)}to{opacity:1;transform:scale(1)}}
  .success-title{font-size:22px;font-weight:800;letter-spacing:-.5px;margin-bottom:8px;color:var(--green)}
  .success-sub{font-size:13px;color:var(--muted);line-height:1.6;max-width:360px;margin:0 auto 20px}
  .success-detail{background:var(--bg3);border:1px solid var(--border);border-radius:12px;padding:14px;text-align:left}
  .sd-row{display:flex;align-items:center;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.04);font-size:12px}
  .sd-row:last-child{border-bottom:none}
  .sd-label{color:var(--muted)}
  .sd-val{font-family:var(--mono);font-weight:700}

  /* ── TOAST ── */
  .toast{position:fixed;bottom:24px;right:24px;background:var(--bg2);border:1px solid rgba(167,139,250,.25);border-radius:14px;padding:13px 20px;display:flex;align-items:center;gap:10px;font-size:14px;box-shadow:0 16px 48px rgba(0,0,0,.5);z-index:400;transition:transform .4s cubic-bezier(.34,1.56,.64,1),opacity .3s;transform:translateY(80px);opacity:0}
  .toast.show{transform:translateY(0);opacity:1}

  @media(max-width:960px){.main{grid-template-columns:1fr}.right-col{order:-1}.sticky-wrap{position:static}}
  @media(max-width:700px){.hero-inner{grid-template-columns:1fr;gap:20px}.hero-stats-row{grid-template-columns:repeat(3,1fr)}.matiere-grid{grid-template-columns:1fr}}
`;

// ── DATA ──────────────────────────────────────────────────────
const TARIFS = [
  { id:"standard", icon:"✏️", name:"Correction standard", desc:"Correction complète avec explications détaillées", price:"6 crédits", priceAr:"27 000 Ar", delay:"sous 48h" },
  { id:"express", icon:"⚡", name:"Correction express", desc:"Priorité absolue — livrée en quelques heures", price:"10 crédits", priceAr:"45 000 Ar", delay:"sous 6h" },
  { id:"session", icon:"💬", name:"Session vidéo 30 min", desc:"Échange individuel en direct + correction", price:"15 crédits", priceAr:"67 500 Ar", delay:"sur rendez-vous" },
];

const REVIEWS = [
  { name:"Miora A.", avatar:"👩‍🎓", niveau:"Terminale C", stars:5, date:"Il y a 2 jours", text:"Dr. Randria est exceptionnel. Sa correction du BAC 2024 était ultra-détaillée, avec des explications pour chaque point perdu. J'ai progressé de 8 points en 2 mois !", matiere:"📐 Mathématiques" },
  { name:"Toky R.", avatar:"👨‍🎓", niveau:"Terminale D", stars:5, date:"Il y a 5 jours", text:"La session vidéo valait vraiment les crédits. Il a pris le temps de répondre à toutes mes questions, jamais pressé. Méthodes claires et pédagogiques.", matiere:"⚗️ Physique-Chimie" },
  { name:"Lanto H.", avatar:"🧑‍🎓", niveau:"Licence L1", stars:4, date:"Il y a 1 semaine", text:"Très bonne correction, livraison rapide en moins de 24h. Parfois un peu concis dans les explications mais les méthodes sont excellentes.", matiere:"📐 Mathématiques" },
  { name:"Vola R.", avatar:"👩‍💻", niveau:"Terminale A", stars:5, date:"Il y a 2 semaines", text:"J'avais peur de dépenser mes crédits mais c'était le meilleur investissement pour mon BAC. Dr. Randria explique comme si tu étais en cours particulier.", matiere:"📐 Maths + Physique combo" },
];

const MATIERES = [
  { icon:"📐", name:"Mathématiques", meta:"BAC Série C, D · BEPC", color:"var(--teal)", bc:"rgba(10,255,224,.2)", bg:"rgba(10,255,224,.07)" },
  { icon:"⚗️", name:"Physique-Chimie", meta:"BAC Série C · Terminale", color:"var(--blue)", bc:"rgba(79,142,247,.2)", bg:"rgba(79,142,247,.07)" },
  { icon:"📊", name:"Statistiques L1", meta:"Université · Licence 1", color:"var(--purple)", bc:"rgba(167,139,250,.2)", bg:"rgba(167,139,250,.07)" },
  { icon:"🔢", name:"Algèbre", meta:"BAC + Université", color:"var(--gold)", bc:"rgba(255,209,102,.2)", bg:"rgba(255,209,102,.07)" },
];

const FAQS = [
  { q:"Comment se passe la correction ?", a:"Tu envoies ta copie (photo ou PDF) via la plateforme. Je la corrige avec des annotations détaillées, méthode par méthode, et je renvoie un PDF annoté avec tes points perdus et comment les récupérer." },
  { q:"Puis-je poser des questions après la correction ?", a:"Oui ! Chaque correction inclut une session de questions par message (5 échanges). Pour des questions supplémentaires, tu peux réserver une session vidéo." },
  { q:"Comment choisir entre Standard et Express ?", a:"Standard convient pour les révisions non urgentes. Express est recommandé la veille d'un examen ou pour une correction rapide en période de contrôles." },
  { q:"Acceptes-tu toutes les matières ?", a:"Je me spécialise en Mathématiques et Physique-Chimie pour les niveaux BAC et L1. Pour d'autres matières, d'autres professeurs sont disponibles sur la plateforme." },
];

const STEP_LABELS = ["Prestation", "Copie", "Paiement", "Confirmé"];

function Stars({ val, size = 13 }) {
  return (
    <div className="rc-stars">
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ fontSize:size, color: i <= Math.round(val) ? "var(--gold)" : "var(--muted2)" }}>★</span>
      ))}
    </div>
  );
}

export default function ProfilProfesseur() {
  const [selectedTarif, setSelectedTarif] = useState("standard");
  const [modal, setModal]                 = useState(false);
  const [step, setStep]                   = useState(0); // 0,1,2,3
  const [openFaq, setOpenFaq]             = useState(null);
  const [scoreBars, setScoreBars]         = useState([0,0,0,0,0]);
  const [statNums, setStatNums]           = useState([0,0,0,0,0]);
  const [toast, setToast]                 = useState({ show:false, msg:"" });
  const [uploadedFile, setUploadedFile]   = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    const s = document.createElement("style"); s.textContent = CSS; document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setScoreBars([80, 15, 4, 1, 0]);
      // count-up
      const targets = [4.9, 48, 96, 12, 100];
      const dur = 1600;
      const start = Date.now();
      const tick = () => {
        const p = Math.min((Date.now() - start) / dur, 1);
        const ease = 1 - Math.pow(1-p, 3);
        setStatNums(targets.map(t => t < 10 ? parseFloat((t * ease).toFixed(1)) : Math.round(t * ease)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, 400);
    return () => clearTimeout(t);
  }, []);

  const showToast = msg => { setToast({ show:true, msg }); setTimeout(() => setToast({ show:false, msg:"" }), 2800); };

  const openModal = () => { setModal(true); setStep(0); };
  const closeModal = () => { setModal(false); setStep(0); setUploadedFile(null); };

  const currentTarif = TARIFS.find(t => t.id === selectedTarif);

  const STEP_CONTENTS = [
    // Step 0 — Choix tarif
    () => (
      <>
        <div className="modal-step-title">Choisir une prestation</div>
        <div className="modal-step-sub">Sélectionne le type de correction qui correspond à tes besoins.</div>
        <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:20 }}>
          {TARIFS.map(t => (
            <div key={t.id} className={`tarif-card ${selectedTarif === t.id ? "selected" : ""}`} onClick={() => setSelectedTarif(t.id)}>
              <div style={{ fontSize:24, flexShrink:0 }}>{t.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:700 }}>{t.name}</div>
                <div style={{ fontSize:11, color:"var(--muted)", fontFamily:"var(--mono)", marginTop:2 }}>{t.desc}</div>
                <div style={{ fontSize:10, color:"var(--purple)", fontFamily:"var(--mono)", marginTop:3 }}>⏱ {t.delay}</div>
              </div>
              <div style={{ textAlign:"right", flexShrink:0 }}>
                <div style={{ fontFamily:"var(--mono)", fontSize:13, fontWeight:800, color:"var(--purple)" }}>{t.price}</div>
                <div style={{ fontSize:10, color:"var(--muted)", fontFamily:"var(--mono)" }}>{t.priceAr}</div>
              </div>
            </div>
          ))}
        </div>
        <button className="btn-modal-next" onClick={() => setStep(1)}>Continuer →</button>
      </>
    ),

    // Step 1 — Upload copie
    () => (
      <>
        <div className="modal-step-title">Envoyer ta copie</div>
        <div className="modal-step-sub">Prends une photo de ta copie ou uploade le PDF. Assure-toi que toutes les pages sont lisibles.</div>

        <div className="tarif-summary">
          <span className="ts-label">{currentTarif?.icon} {currentTarif?.name}</span>
          <span className="ts-price">{currentTarif?.price}</span>
        </div>

        {/* Upload */}
        <div style={{ border:"2px dashed var(--border)", borderRadius:12, padding:24, textAlign:"center", cursor:"pointer", transition:"all .25s", marginBottom:14, background: uploadedFile ? "rgba(0,255,136,.04)" : "transparent", borderColor: uploadedFile ? "rgba(0,255,136,.3)" : "rgba(167,139,250,.2)" }}
          onClick={() => fileRef.current?.click()}>
          <input ref={fileRef} type="file" style={{ display:"none" }} onChange={e => { if(e.target.files[0]) setUploadedFile(e.target.files[0].name); }} />
          <div style={{ fontSize:32, marginBottom:10 }}>{uploadedFile ? "✅" : "📄"}</div>
          <div style={{ fontSize:13, color: uploadedFile ? "var(--green)" : "var(--muted)" }}>
            {uploadedFile ? <><strong style={{ color:"var(--green)" }}>{uploadedFile}</strong><br /><span style={{ fontSize:11 }}>Cliquer pour changer</span></> : <><strong style={{ color:"var(--purple)" }}>Cliquer pour uploader</strong> ou glisser ici</>}
          </div>
          <div style={{ fontSize:10, color:"var(--muted2)", fontFamily:"var(--mono)", marginTop:6 }}>PDF, JPG, PNG · Max 10 MB · Jusqu'à 20 pages</div>
        </div>

        <div className="mf-group">
          <div className="mf-label">Sujet corrigé (optionnel)</div>
          <input className="mf-input" placeholder="Ex : Mathématiques BAC 2024 Série C" />
        </div>
        <div className="mf-group">
          <div className="mf-label">Message pour le professeur</div>
          <textarea className="mf-textarea" placeholder="Décris tes difficultés, les points que tu veux approfondir, ou toute information utile..." />
        </div>

        <button className="btn-modal-next" onClick={() => setStep(2)}>Continuer →</button>
        <button className="btn-modal-back" onClick={() => setStep(0)}>← Retour</button>
      </>
    ),

    // Step 2 — Paiement
    () => (
      <>
        <div className="modal-step-title">Paiement</div>
        <div className="modal-step-sub">Confirme ton paiement pour que le professeur reçoive ta demande immédiatement.</div>

        <div className="tarif-summary" style={{ marginBottom:16 }}>
          <div>
            <div className="ts-label">{currentTarif?.icon} {currentTarif?.name}</div>
            <div style={{ fontSize:10, color:"var(--muted)", fontFamily:"var(--mono)", marginTop:3 }}>⏱ {currentTarif?.delay}</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div className="ts-price">{currentTarif?.price}</div>
            <div style={{ fontSize:10, color:"var(--muted)", fontFamily:"var(--mono)" }}>{currentTarif?.priceAr}</div>
          </div>
        </div>

        {/* Compte crédits */}
        <div style={{ background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:10, padding:"14px 16px", marginBottom:16 }}>
          {[
            ["Crédits disponibles", "12 crédits"],
            ["Coût de la prestation", currentTarif?.price],
            ["Crédits restants", `${12 - parseInt(currentTarif?.price || "0")} crédits`],
          ].map(([label, val], i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom: i < 2 ? "1px solid rgba(255,255,255,.04)" : "none", fontSize:12 }}>
              <span style={{ color:"var(--muted)" }}>{label}</span>
              <span style={{ fontFamily:"var(--mono)", fontWeight:700, color: i === 2 ? (12 - parseInt(currentTarif?.price || "0") < 0 ? "var(--rose)" : "var(--green)") : "var(--text)" }}>{val}</span>
            </div>
          ))}
        </div>

        {12 - parseInt(currentTarif?.price || "0") < 0 && (
          <div style={{ background:"rgba(255,107,157,.06)", border:"1px solid rgba(255,107,157,.2)", borderRadius:10, padding:"11px 14px", marginBottom:14, fontSize:12, color:"var(--rose)", display:"flex", alignItems:"center", gap:8 }}>
            ⚠️ Crédits insuffisants — <strong style={{ cursor:"pointer", textDecoration:"underline" }} onClick={() => { closeModal(); showToast("💎 Recharge crédits..."); }}>Recharger maintenant</strong>
          </div>
        )}

        <div style={{ fontSize:11, color:"var(--muted)", fontFamily:"var(--mono)", background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:10, padding:"10px 14px", marginBottom:16, lineHeight:1.6 }}>
          🔒 Paiement sécurisé via crédits Mah.AI · Tes crédits sont débités uniquement quand le professeur accepte la demande.
        </div>

        <button className="btn-modal-next" onClick={() => setStep(3)}>
          ✅ Confirmer et payer {currentTarif?.price}
        </button>
        <button className="btn-modal-back" onClick={() => setStep(1)}>← Retour</button>
      </>
    ),

    // Step 3 — Succès
    () => (
      <div className="success-anim">
        <div className="success-ring">✅</div>
        <div className="success-title">Demande envoyée !</div>
        <div className="success-sub">
          Dr. Andriantsoa a reçu ta demande. Tu recevras sa correction par email et notification dans les délais indiqués.
        </div>
        <div className="success-detail">
          {[
            ["Professeur", "Dr. Andriantsoa"],
            ["Prestation", currentTarif?.name],
            ["Délai prévu", currentTarif?.delay],
            ["Crédits débités", currentTarif?.price],
            ["Référence", "#CORR-2024-11847"],
          ].map(([label, val]) => (
            <div key={label} className="sd-row">
              <span className="sd-label">{label}</span>
              <span className="sd-val">{val}</span>
            </div>
          ))}
        </div>
        <button className="btn-modal-next" style={{ marginTop:20 }} onClick={closeModal}>Retour au profil</button>
      </div>
    ),
  ];

  const stepsStatus = (i) => i < step ? "done" : i === step ? "active" : "";

  return (
    <div style={{ minHeight:"100vh" }}>
      <div className="mesh"><span /><span /><span /></div>

      {/* NAV */}
      <nav>
        <div className="nav-logo">Mah.AI</div>
        <div style={{ display:"flex", gap:10 }}>
          <button className="btn-ghost" onClick={() => showToast("← Retour")}>← Retour</button>
          <button className="btn-cta" onClick={openModal}>Demander une correction</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div className="hero">
        <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%", background:"var(--purple)", filter:"blur(120px)", opacity:.06, top:"30%", right:"10%", transform:"translateY(-50%)", pointerEvents:"none" }} />

        <div className="hero-inner">
          <div className="avatar-zone">
            <div className="avatar-outer">👨‍🏫</div>
            <div className="verified-badge">✓ Professeur Vérifié Mah.AI</div>
          </div>

          <div className="hero-info">
            <div className="hero-badges">
              <span className="hb hb-purple">👨‍🏫 Professeur vérifié</span>
              <span className="hb hb-green">⭐ {statNums[0]}/5</span>
              <span className="hb hb-gold">🏆 Top Professeur</span>
            </div>
            <div className="hero-name">Dr. Andriantsoa Hery</div>
            <div className="hero-title">
              Docteur en Mathématiques — Université d'Antananarivo.<br />
              10 ans d'expérience en préparation BAC, BEPC et concours d'entrée. Spécialisé en Maths et Physique-Chimie.
            </div>
            <div className="hero-tags">
              <span className="hero-tag">📐 Mathématiques</span>
              <span className="hero-tag">⚗️ Physique-Chimie</span>
              <span className="hero-tag">🎓 Doctorat</span>
              <span className="hero-tag">📍 Antananarivo</span>
              <span className="hero-tag">⚡ Répond en moins de 2h</span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="hero-stats-row">
          {[
            { num: statNums[0], suffix:"/5", label:"Note moyenne", color:"var(--gold)" },
            { num: statNums[1], suffix:"", label:"Corrections réalisées", color:"var(--purple)" },
            { num: statNums[2]+"%", suffix:"", label:"Taux de satisfaction", color:"var(--green)" },
            { num: statNums[3], suffix:"h", label:"Délai moyen livraison", color:"var(--teal)" },
            { num: statNums[4]+"%", suffix:"", label:"Taux d'acceptation", color:"var(--blue)" },
          ].map((s, i) => (
            <div key={i} className="stat-pill">
              <div className="sp-num" style={{ color:s.color }}>{s.num}{s.suffix}</div>
              <div className="sp-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MAIN ── */}
      <div className="main">
        <div>

          {/* Matières */}
          <div className="card" style={{ animationDelay:"0s" }}>
            <div className="card-title">📚 Matières enseignées</div>
            <div className="card-sub">Toutes les matières pour BAC Série A, C, D et Licence L1.</div>
            <div className="matiere-grid">
              {MATIERES.map(m => (
                <div key={m.name} className="mg-card" onClick={() => showToast(`📚 Voir les sujets de ${m.name}`)}>
                  <div className="mg-icon" style={{ background:m.bg, borderColor:m.bc, color:m.color }}>{m.icon}</div>
                  <div>
                    <div className="mg-name">{m.name}</div>
                    <div className="mg-meta">{m.meta}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Expérience */}
          <div className="card" style={{ animationDelay:".05s" }}>
            <div className="card-title">🎓 Parcours & expérience</div>
            <div style={{ marginTop:14 }}>
              <div className="timeline">
                {[
                  { year:"2024 — Présent", title:"Professeur & Correcteur · Mah.AI", place:"Plateforme EdTech · Madagascar", current:true },
                  { year:"2018 — 2024", title:"Enseignant Maths-Physique", place:"Lycée Andohalo · Antananarivo", current:false },
                  { year:"2015 — 2018", title:"Doctorat en Mathématiques", place:"Université d'Antananarivo", current:false },
                  { year:"2012 — 2015", title:"Master Mathématiques Appliquées", place:"Université d'Antananarivo", current:false },
                ].map((item, i) => (
                  <div key={i} className="tl-item">
                    <div className={`tl-dot ${item.current ? "current" : ""}`} />
                    <div className="tl-year">{item.year}</div>
                    <div className="tl-title">{item.title}</div>
                    <div className="tl-place">{item.place}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Avis */}
          <div className="card" style={{ animationDelay:".1s" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
              <div className="card-title">💬 Avis des étudiants</div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <Stars val={4.9} size={14} />
                <span style={{ fontFamily:"var(--mono)", fontSize:13, fontWeight:800, color:"var(--purple)" }}>4.9</span>
                <span style={{ fontSize:12, color:"var(--muted)" }}>· {REVIEWS.length} avis récents</span>
              </div>
            </div>
            <div className="reviews-grid">
              {REVIEWS.map((r, i) => (
                <div key={i} className="review-card">
                  <div className="rc-top">
                    <div className="rc-user">
                      <div className="rc-avatar">{r.avatar}</div>
                      <div>
                        <div className="rc-name">{r.name}</div>
                        <div className="rc-meta">{r.niveau} · {r.date}</div>
                      </div>
                    </div>
                    <Stars val={r.stars} />
                  </div>
                  <div className="rc-text">{r.text}</div>
                  <span className="rc-tag">{r.matiere}</span>
                </div>
              ))}
            </div>
            <button style={{ width:"100%", background:"transparent", border:"1px solid var(--border)", color:"var(--muted)", padding:"10px", borderRadius:10, fontFamily:"var(--font)", fontSize:13, cursor:"pointer", marginTop:12, transition:"all .2s" }}
              onClick={() => showToast("💬 Tous les avis chargés")}>
              Voir tous les avis →
            </button>
          </div>

          {/* FAQ */}
          <div className="card" style={{ animationDelay:".15s" }}>
            <div className="card-title">❓ Questions fréquentes</div>
            <div style={{ marginTop:6 }}>
              {FAQS.map((faq, i) => (
                <div key={i} className="faq-item" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <div className="faq-q">
                    {faq.q}
                    <span className={`faq-toggle ${openFaq === i ? "open" : ""}`}>▾</span>
                  </div>
                  <div className={`faq-a ${openFaq === i ? "open" : ""}`}>{faq.a}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── RIGHT ── */}
        <div className="right-col">
          <div className="sticky-wrap">

            {/* Booking */}
            <div className="booking-card">
              <div className="bc-title">👨‍🏫 Demander une correction</div>
              <div className="bc-sub">Envoie ta copie et reçois une correction personnalisée, exercice par exercice.</div>

              <div className="tarif-options">
                {TARIFS.map(t => (
                  <div key={t.id} className={`tarif-card ${selectedTarif === t.id ? "selected" : ""}`} onClick={() => setSelectedTarif(t.id)}>
                    <div className="tc-icon">{t.icon}</div>
                    <div className="tc-info">
                      <div className="tc-name">{t.name}</div>
                      <div className="tc-desc">{t.desc}</div>
                      <div className="tc-delay" style={{ color:"var(--purple)" }}>⏱ {t.delay}</div>
                    </div>
                    <div>
                      <div className="tc-price">{t.price}</div>
                      <div className="tc-delay">{t.priceAr}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="dispo-row">
                <div className="dr-left">
                  <div className="dr-dot" />
                  <span style={{ fontFamily:"var(--mono)", fontSize:12 }}>Disponible maintenant</span>
                </div>
                <span className="dr-val">3 créneaux libres</span>
              </div>

              <button className="btn-book" onClick={openModal}>
                ✏️ Demander une correction
              </button>
              <button style={{ width:"100%", background:"transparent", border:"1px solid var(--border)", color:"var(--muted)", padding:"10px", borderRadius:11, fontFamily:"var(--font)", fontSize:13, cursor:"pointer", transition:"all .2s", display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}
                onClick={() => showToast("💬 Message envoyé à Dr. Andriantsoa")}>
                💬 Envoyer un message
              </button>
              <div className="bc-guarantee">
                🔒 Crédits débités uniquement à l'acceptation · Remboursement si refus
              </div>
            </div>

            {/* Info */}
            <div className="info-card">
              <div style={{ fontSize:11, color:"var(--muted)", fontFamily:"var(--mono)", letterSpacing:".1em", textTransform:"uppercase", marginBottom:10 }}>Informations</div>
              {[
                { icon:"🎓", label:"Diplôme", val:"Doctorat · Maths" },
                { icon:"📍", label:"Localisation", val:"Antananarivo" },
                { icon:"🗣️", label:"Langues", val:"Français · Malagasy" },
                { icon:"⏰", label:"Temps de réponse", val:"< 2h" },
                { icon:"📅", label:"Sur Mah.AI depuis", val:"Janv. 2024" },
                { icon:"✅", label:"Corrections livrées", val:"48 au total" },
              ].map(r => (
                <div key={r.label} className="ic-row">
                  <span className="ic-icon">{r.icon}</span>
                  <span className="ic-label">{r.label}</span>
                  <span className="ic-val">{r.val}</span>
                </div>
              ))}
            </div>

            {/* Score distribution */}
            <div className="score-card">
              <div className="score-big">4.9</div>
              <div className="score-stars"><Stars val={4.9} size={16} /></div>
              <div className="score-label">Basé sur {REVIEWS.length} avis vérifiés</div>
              {[5,4,3,2,1].map((n, i) => (
                <div key={n} className="score-bar-row">
                  <div className="sbr-num">{n}</div>
                  <div className="sbr-track">
                    <div className="sbr-fill" style={{ width:`${scoreBars[i]}%` }} />
                  </div>
                  <div className="sbr-count">{scoreBars[i]}%</div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* ── MODAL BOOKING ── */}
      {modal && (
        <div className="overlay" onClick={e => { if(e.target === e.currentTarget) closeModal(); }}>
          <div className="modal">
            <button className="modal-close" onClick={closeModal}>×</button>

            {/* Steps indicator (masqué sur success) */}
            {step < 3 && (
              <div className="steps-row">
                {STEP_LABELS.map((label, i) => (
                  <div key={i} className={`step-wrap ${stepsStatus(i)}`}>
                    <div className="step-circle">{i < step ? "✓" : i+1}</div>
                    <div className="step-lbl">{label}</div>
                  </div>
                ))}
              </div>
            )}

            {STEP_CONTENTS[step]?.()}
          </div>
        </div>
      )}

      <div className={`toast ${toast.show ? "show" : ""}`}>
        <span style={{ fontSize:17 }}>👨‍🏫</span><span>{toast.msg}</span>
      </div>
    </div>
  );
}
