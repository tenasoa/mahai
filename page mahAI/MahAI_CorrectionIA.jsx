import { useState, useEffect, useRef, useCallback } from "react";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,700;12..96,800&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --teal:#0AFFE0;--teal2:#00C9A7;--green:#00FF88;--gold:#FFD166;
    --rose:#FF6B9D;--blue:#4F8EF7;--purple:#A78BFA;--orange:#FF9F43;
    --bg:#060910;--bg2:#0C1220;--bg3:#111928;--bg4:#080E1C;
    --border:rgba(255,255,255,.07);--border2:rgba(10,255,224,.2);
    --text:#F0F4FF;--muted:#6B7899;--muted2:#3A4560;
    --font:'Bricolage Grotesque',sans-serif;--mono:'DM Mono',monospace;
    --r:14px;
  }
  html,body{height:100%;overflow:hidden}
  body{font-family:var(--font);background:var(--bg);color:var(--text);-webkit-font-smoothing:antialiased}
  ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:var(--teal2);border-radius:2px}
  body::before{content:'';position:fixed;inset:0;z-index:0;opacity:.35;pointer-events:none;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")}
  .mesh{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden}
  .mesh span{position:absolute;border-radius:50%;filter:blur(130px);opacity:.06;animation:fm 20s ease-in-out infinite alternate}
  .mesh span:nth-child(1){width:500px;height:500px;top:-100px;left:10%;background:var(--teal);animation-delay:0s}
  .mesh span:nth-child(2){width:400px;height:400px;bottom:-80px;right:5%;background:var(--purple);animation-delay:-8s}
  @keyframes fm{0%{transform:translate(0,0)}100%{transform:translate(18px,-14px)}}

  /* ── NAV ── */
  nav{
    position:fixed;top:0;left:0;right:0;z-index:100;height:56px;
    display:flex;align-items:center;justify-content:space-between;
    padding:0 28px;
    background:rgba(6,9,16,.88);backdrop-filter:blur(24px);
    border-bottom:1px solid var(--border);
  }
  .nav-left{display:flex;align-items:center;gap:16px}
  .nav-logo{font-size:18px;font-weight:800;letter-spacing:-1px;background:linear-gradient(135deg,var(--teal),var(--green));-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-decoration:none}
  .nav-sep{width:1px;height:20px;background:var(--border)}
  .nav-subject{display:flex;align-items:center;gap:8px}
  .ns-badge{padding:3px 9px;border-radius:6px;font-size:10px;font-weight:700;font-family:var(--mono);background:rgba(10,255,224,.07);border:1px solid rgba(10,255,224,.2);color:var(--teal)}
  .ns-title{font-size:13px;font-weight:600;color:var(--muted)}
  .nav-right{display:flex;align-items:center;gap:10px}
  .nav-credits{display:flex;align-items:center;gap:6px;background:rgba(10,255,224,.06);border:1px solid rgba(10,255,224,.15);padding:6px 12px;border-radius:8px;font-size:12px;font-family:var(--mono);color:var(--teal)}
  .btn-back{background:transparent;border:1px solid var(--border);color:var(--muted);padding:6px 13px;border-radius:8px;font-family:var(--font);font-size:12px;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:5px}
  .btn-back:hover{border-color:var(--border2);color:var(--text)}
  .btn-dl{background:linear-gradient(135deg,var(--teal),var(--teal2));color:var(--bg);border:none;padding:7px 16px;border-radius:8px;font-family:var(--font);font-size:12px;font-weight:700;cursor:pointer;transition:transform .2s,box-shadow .25s;display:flex;align-items:center;gap:5px}
  .btn-dl:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(10,255,224,.3)}

  /* ── LAYOUT : 3 colonnes fixed ── */
  .app{position:fixed;top:56px;left:0;right:0;bottom:0;display:grid;grid-template-columns:280px 1fr 360px;overflow:hidden;z-index:1}

  /* ── LEFT : Sommaire correction ── */
  .sidebar-left{
    border-right:1px solid var(--border);
    display:flex;flex-direction:column;
    background:rgba(6,9,16,.6);backdrop-filter:blur(12px);
    overflow:hidden;
  }
  .sl-header{padding:18px 18px 14px;border-bottom:1px solid var(--border);flex-shrink:0}
  .sl-title{font-size:13px;font-weight:700;margin-bottom:4px}
  .sl-sub{font-size:11px;color:var(--muted);font-family:var(--mono)}
  .sl-score-row{display:flex;align-items:center;justify-content:space-between;margin-top:10px}
  .sl-score{font-family:var(--mono);font-size:20px;font-weight:800;letter-spacing:-1px;color:var(--teal)}
  .sl-mention{font-size:11px;font-family:var(--mono);padding:3px 9px;border-radius:100px;border:1px solid}

  .sl-progress{padding:12px 18px;border-bottom:1px solid var(--border);flex-shrink:0}
  .sp-bar-track{height:3px;background:rgba(255,255,255,.06);border-radius:2px;overflow:hidden;margin-bottom:6px}
  .sp-bar-fill{height:100%;border-radius:2px;background:linear-gradient(90deg,var(--teal),var(--green));transition:width 1.2s cubic-bezier(.4,0,.2,1)}
  .sp-label{display:flex;justify-content:space-between;font-size:10px;font-family:var(--mono);color:var(--muted)}

  .sl-exercises{flex:1;overflow-y:auto;padding:10px}
  .exo-item{
    border-radius:10px;border:1px solid var(--border);margin-bottom:6px;
    overflow:hidden;cursor:pointer;
    transition:border-color .2s;
  }
  .exo-item:hover{border-color:rgba(255,255,255,.14)}
  .exo-item.active{border-color:rgba(10,255,224,.25)}
  .exo-header{
    display:flex;align-items:center;gap:10px;padding:10px 12px;
    background:var(--bg2);transition:background .2s;
  }
  .exo-item.active .exo-header{background:rgba(10,255,224,.05)}
  .exo-status{width:22px;height:22px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0}
  .es-done{background:rgba(0,255,136,.1);border:1px solid rgba(0,255,136,.25);color:var(--green)}
  .es-partial{background:rgba(255,209,102,.1);border:1px solid rgba(255,209,102,.25);color:var(--gold)}
  .es-todo{background:rgba(255,255,255,.04);border:1px solid var(--border);color:var(--muted)}
  .exo-info{flex:1;min-width:0}
  .exo-name{font-size:12px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .exo-meta{font-size:10px;color:var(--muted);font-family:var(--mono);margin-top:1px}
  .exo-pts{font-family:var(--mono);font-size:11px;font-weight:700;flex-shrink:0}

  .exo-questions{padding:4px 6px 6px;background:var(--bg3)}
  .eq-item{display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:7px;cursor:pointer;transition:background .15s;font-size:11px;color:var(--muted)}
  .eq-item:hover{background:rgba(255,255,255,.04);color:var(--text)}
  .eq-item.active{background:rgba(10,255,224,.06);color:var(--teal)}
  .eq-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}

  .sl-footer{padding:12px;border-top:1px solid var(--border);flex-shrink:0}
  .btn-prof{width:100%;background:linear-gradient(135deg,rgba(255,209,102,.1),rgba(255,209,102,.05));border:1px solid rgba(255,209,102,.2);color:var(--gold);padding:10px;border-radius:10px;font-family:var(--font);font-size:12px;font-weight:700;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:6px}
  .btn-prof:hover{background:linear-gradient(135deg,rgba(255,209,102,.18),rgba(255,209,102,.08));box-shadow:0 6px 20px rgba(255,209,102,.15)}

  /* ── CENTER : Correction content ── */
  .correction-main{
    display:flex;flex-direction:column;overflow:hidden;
    border-right:1px solid var(--border);
  }

  .cm-tabs{display:flex;align-items:center;gap:2px;padding:10px 20px;border-bottom:1px solid var(--border);background:rgba(6,9,16,.5);flex-shrink:0}
  .cm-tab{padding:7px 16px;border-radius:8px;background:transparent;border:none;font-family:var(--font);font-size:12px;font-weight:600;color:var(--muted);cursor:pointer;transition:all .2s}
  .cm-tab:hover{color:var(--text)}
  .cm-tab.on{background:var(--bg2);color:var(--text);box-shadow:0 2px 8px rgba(0,0,0,.3)}
  .cm-tab-sep{width:1px;height:16px;background:var(--border);margin:0 4px}
  .cm-actions{margin-left:auto;display:flex;gap:6px}
  .cm-action{background:transparent;border:1px solid var(--border);color:var(--muted);padding:5px 11px;border-radius:7px;font-family:var(--mono);font-size:11px;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:4px}
  .cm-action:hover{border-color:var(--border2);color:var(--text)}

  .cm-content{flex:1;overflow-y:auto;padding:28px 32px}

  /* Exercise block */
  .exo-block{margin-bottom:40px;animation:blockIn .5s ease both}
  @keyframes blockIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  .exo-block-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:20px;padding-bottom:14px;border-bottom:1px solid var(--border)}
  .ebh-left{}
  .exo-roman{font-size:10px;color:var(--teal);font-family:var(--mono);letter-spacing:.12em;text-transform:uppercase;margin-bottom:4px}
  .exo-block-title{font-size:18px;font-weight:800;letter-spacing:-.5px;line-height:1.2}
  .exo-block-sub{font-size:12px;color:var(--muted);margin-top:4px;font-family:var(--mono)}
  .exo-score-badge{display:flex;align-items:center;gap:6px;padding:6px 14px;border-radius:100px;font-family:var(--mono);font-size:12px;font-weight:700;border:1px solid;flex-shrink:0}

  /* Step card */
  .step-card{
    background:var(--bg2);border:1px solid var(--border);border-radius:var(--r);
    margin-bottom:14px;overflow:hidden;
    transition:border-color .2s;position:relative;
  }
  .step-card:hover{border-color:rgba(255,255,255,.12)}
  .step-card.highlight{border-color:rgba(10,255,224,.25)}
  .step-card::before{content:'';position:absolute;top:0;left:0;bottom:0;width:3px}
  .step-correct::before{background:var(--green)}
  .step-error::before{background:var(--rose)}
  .step-info::before{background:var(--blue)}
  .step-warn::before{background:var(--gold)}

  .step-header{display:flex;align-items:center;gap:10px;padding:12px 16px;cursor:pointer;user-select:none}
  .step-icon{width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0}
  .step-q-num{font-size:10px;font-family:var(--mono);color:var(--muted);letter-spacing:.1em}
  .step-q-text{font-size:13px;font-weight:700;flex:1;line-height:1.3}
  .step-badge{font-size:10px;font-family:var(--mono);padding:2px 8px;border-radius:100px;border:1px solid;flex-shrink:0}
  .step-toggle{font-size:14px;color:var(--muted);flex-shrink:0;transition:transform .25s}
  .step-toggle.open{transform:rotate(180deg)}

  .step-body{padding:0 16px 16px;border-top:1px solid rgba(255,255,255,.04)}

  /* Correction content */
  .corr-section{margin-top:14px}
  .cs-label{font-size:10px;color:var(--muted);font-family:var(--mono);letter-spacing:.1em;text-transform:uppercase;margin-bottom:8px;display:flex;align-items:center;gap:6px}
  .cs-label::before{content:'';flex:0 0 16px;height:1px;background:var(--muted2)}
  .cs-content{font-size:13px;line-height:1.8;color:var(--muted)}
  .cs-content strong{color:var(--text)}
  .cs-content .math-block{
    display:block;background:var(--bg3);border:1px solid var(--border);border-radius:10px;
    padding:12px 16px;margin:10px 0;font-family:var(--mono);font-size:13px;color:var(--teal);
    line-height:1.9;
  }
  .cs-content .math-inline{font-family:var(--mono);color:var(--teal);background:rgba(10,255,224,.07);padding:1px 5px;border-radius:4px;font-size:12px}
  .cs-content .highlight-correct{color:var(--green)}
  .cs-content .highlight-error{color:var(--rose)}

  /* Error callout */
  .error-callout{background:rgba(255,107,157,.05);border:1px solid rgba(255,107,157,.2);border-radius:10px;padding:12px 14px;margin-top:10px}
  .ec-header{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:700;color:var(--rose);font-family:var(--mono);margin-bottom:6px}
  .ec-text{font-size:12px;color:var(--muted);line-height:1.6}
  .tip-callout{background:rgba(10,255,224,.04);border:1px solid rgba(10,255,224,.15);border-radius:10px;padding:12px 14px;margin-top:10px}
  .tc-header{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:700;color:var(--teal);font-family:var(--mono);margin-bottom:6px}

  /* Points row */
  .pts-row{display:flex;align-items:center;justify-content:space-between;margin-top:14px;padding-top:10px;border-top:1px solid rgba(255,255,255,.04)}
  .pts-label{font-size:11px;color:var(--muted);font-family:var(--mono)}
  .pts-val{font-family:var(--mono);font-size:13px;font-weight:700}

  /* Ask AI button inside step */
  .btn-ask-ai{display:flex;align-items:center;gap:6px;background:rgba(10,255,224,.06);border:1px solid rgba(10,255,224,.15);color:var(--teal);padding:7px 14px;border-radius:8px;font-family:var(--font);font-size:11px;font-weight:700;cursor:pointer;transition:all .2s;margin-top:10px}
  .btn-ask-ai:hover{background:rgba(10,255,224,.12)}

  /* Sujet view */
  .sujet-view{padding:0}
  .sv-page{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r);padding:28px;margin-bottom:14px}
  .sv-section{font-size:11px;color:var(--muted);font-family:var(--mono);letter-spacing:.1em;margin-bottom:10px;display:flex;align-items:center;gap:8px}
  .sv-section::after{content:'';flex:1;height:1px;background:var(--border)}
  .sv-text{font-size:14px;line-height:1.9;color:var(--text)}
  .sv-text p{margin-bottom:10px}
  .sv-math{display:block;background:var(--bg3);border-left:3px solid var(--teal);border-radius:0 8px 8px 0;padding:10px 14px;margin:10px 0;font-family:var(--mono);font-size:13px;color:var(--teal);line-height:1.9}

  /* ── RIGHT : Chat IA ── */
  .chat-panel{display:flex;flex-direction:column;background:rgba(6,9,16,.7);backdrop-filter:blur(12px);overflow:hidden}

  .cp-header{
    padding:14px 18px;border-bottom:1px solid var(--border);
    display:flex;align-items:center;gap:12px;flex-shrink:0;
    background:linear-gradient(135deg,rgba(10,255,224,.04),transparent);
  }
  .ai-avatar{
    width:36px;height:36px;border-radius:11px;
    background:linear-gradient(135deg,var(--teal),var(--teal2));
    display:flex;align-items:center;justify-content:center;font-size:16px;
    flex-shrink:0;position:relative;
  }
  .ai-avatar::after{content:'';position:absolute;inset:-3px;border-radius:14px;border:1px solid rgba(10,255,224,.3);animation:orbP 2.5s ease-in-out infinite}
  @keyframes orbP{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.3;transform:scale(1.08)}}
  .cp-info{flex:1}
  .cp-name{font-size:14px;font-weight:700}
  .cp-status{font-size:11px;color:var(--teal);font-family:var(--mono);display:flex;align-items:center;gap:5px;margin-top:2px}
  .cp-status::before{content:'';width:5px;height:5px;border-radius:50%;background:var(--teal);animation:onP 2s ease-in-out infinite}
  @keyframes onP{0%,100%{opacity:1}50%{opacity:.3}}
  .cp-mode{font-size:10px;color:var(--muted);font-family:var(--mono)}

  /* Chat messages */
  .chat-messages{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px}

  .msg-system{
    display:flex;align-items:flex-start;gap:8px;
    animation:msgIn .4s ease both;
  }
  @keyframes msgIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  .msg-user{flex-direction:row-reverse}
  .msg-avatar{width:26px;height:26px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0;margin-top:2px}
  .msg-bubble{
    max-width:82%;padding:10px 14px;border-radius:12px;font-size:13px;line-height:1.65;
    position:relative;
  }
  .msg-system .msg-bubble{
    background:rgba(255,255,255,.04);border:1px solid var(--border);color:var(--text);
    border-radius:4px 12px 12px 12px;
  }
  .msg-user .msg-bubble{
    background:rgba(10,255,224,.1);border:1px solid rgba(10,255,224,.2);color:var(--text);
    border-radius:12px 4px 12px 12px;
  }
  .msg-bubble .math-inline{font-family:var(--mono);color:var(--teal);background:rgba(10,255,224,.08);padding:1px 5px;border-radius:4px;font-size:12px}
  .msg-bubble .step-ref{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-family:var(--mono);color:var(--blue);background:rgba(79,142,247,.08);border:1px solid rgba(79,142,247,.2);padding:1px 7px;border-radius:4px;cursor:pointer;vertical-align:middle}
  .msg-bubble .step-ref:hover{background:rgba(79,142,247,.15)}
  .msg-time{font-size:10px;color:var(--muted2);font-family:var(--mono);margin-top:4px;display:block}
  .msg-actions{display:flex;gap:5px;margin-top:6px;flex-wrap:wrap}
  .msg-action-chip{
    padding:4px 10px;border-radius:100px;border:1px solid var(--border);
    font-size:11px;color:var(--muted);cursor:pointer;transition:all .18s;font-family:var(--mono);
    background:transparent;
  }
  .msg-action-chip:hover{border-color:rgba(10,255,224,.25);color:var(--teal);background:rgba(10,255,224,.04)}

  /* Typing indicator */
  .typing-bubble{
    display:flex;align-items:flex-start;gap:8px;
    animation:msgIn .3s ease both;
  }
  .typing-dots{display:flex;gap:4px;padding:12px 16px;background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:4px 12px 12px 12px}
  .typing-dot{width:7px;height:7px;border-radius:50%;background:var(--teal);opacity:.4;animation:typingD 1.4s ease-in-out infinite}
  .typing-dot:nth-child(2){animation-delay:.2s}
  .typing-dot:nth-child(3){animation-delay:.4s}
  @keyframes typingD{0%,60%,100%{opacity:.3;transform:translateY(0)}30%{opacity:1;transform:translateY(-4px)}}

  /* Quick suggestions */
  .quick-suggestions{padding:8px 16px;display:flex;flex-wrap:wrap;gap:6px;flex-shrink:0;border-top:1px solid var(--border)}
  .qs-chip{padding:6px 12px;border-radius:100px;border:1px solid var(--border);font-size:11px;color:var(--muted);cursor:pointer;transition:all .2s;background:transparent;font-family:var(--font);white-space:nowrap}
  .qs-chip:hover{border-color:rgba(10,255,224,.25);color:var(--teal);background:rgba(10,255,224,.04)}

  /* Chat input */
  .chat-input-wrap{
    padding:12px 16px;border-top:1px solid var(--border);flex-shrink:0;
    background:rgba(6,9,16,.6);
  }
  .chat-input-row{
    display:flex;align-items:flex-end;gap:8px;
    background:var(--bg2);border:1px solid var(--border);border-radius:12px;
    padding:10px 12px;transition:border-color .2s;
  }
  .chat-input-row:focus-within{border-color:var(--border2)}
  .chat-textarea{
    flex:1;background:transparent;border:none;outline:none;resize:none;
    font-family:var(--font);font-size:13px;color:var(--text);line-height:1.5;
    max-height:100px;min-height:20px;
  }
  .chat-textarea::placeholder{color:var(--muted)}
  .chat-send{
    width:32px;height:32px;border-radius:8px;flex-shrink:0;
    background:linear-gradient(135deg,var(--teal),var(--teal2));
    border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;
    font-size:14px;color:var(--bg);
    transition:transform .2s,box-shadow .2s;
  }
  .chat-send:hover{transform:scale(1.08);box-shadow:0 4px 14px rgba(10,255,224,.3)}
  .chat-send:disabled{opacity:.4;cursor:default;transform:none}
  .chat-input-meta{display:flex;align-items:center;justify-content:space-between;margin-top:6px;padding:0 2px}
  .cim-left{font-size:10px;color:var(--muted2);font-family:var(--mono);display:flex;align-items:center;gap:5px}
  .cim-right{font-size:10px;color:var(--muted2);font-family:var(--mono)}
  .mode-badge{display:inline-flex;align-items:center;gap:4px;color:var(--teal);font-size:10px;font-family:var(--mono)}

  /* ── TOAST ── */
  .toast{position:fixed;bottom:20px;right:20px;background:var(--bg2);border:1px solid var(--border2);border-radius:12px;padding:12px 18px;display:flex;align-items:center;gap:10px;font-size:13px;box-shadow:0 16px 48px rgba(0,0,0,.5);z-index:400;transition:transform .4s cubic-bezier(.34,1.56,.64,1),opacity .3s;transform:translateY(70px);opacity:0}
  .toast.show{transform:translateY(0);opacity:1}

  /* ── MOBILE ── */
  @media(max-width:1100px){.app{grid-template-columns:0 1fr 320px}.sidebar-left{display:none}}
  @media(max-width:780px){.app{grid-template-columns:1fr}.chat-panel{display:none}}
`;

// ── DATA ───────────────────────────────────────────────────────
const EXERCISES = [
  {
    id:"I", title:"Analyse — Étude de fonctions", pts:8, earned:6,
    status:"partial",
    sub:"f(x) = x³ − 6x² + 9x + 2",
    questions:[
      { id:"I.1", text:"Calculer f'(x)", pts:2, earned:2, status:"done", open:false },
      { id:"I.2", text:"Tableau de variation", pts:2, earned:2, status:"done", open:false },
      { id:"I.3", text:"Extrema et nature", pts:2, earned:1, status:"partial", open:false },
      { id:"I.4", text:"Équation tangente en x=1", pts:2, earned:1, status:"partial", open:true },
    ]
  },
  {
    id:"II", title:"Géométrie dans l'espace", pts:6, earned:5,
    status:"done",
    sub:"A(1,2,−1), B(3,0,2), C(−1,4,0)",
    questions:[
      { id:"II.1", text:"Vecteurs AB et AC", pts:2, earned:2, status:"done", open:false },
      { id:"II.2", text:"Équation du plan (ABC)", pts:2, earned:2, status:"done", open:false },
      { id:"II.3", text:"Distance point-plan", pts:2, earned:1, status:"partial", open:false },
    ]
  },
  {
    id:"III", title:"Probabilités et statistiques", pts:6, earned:0,
    status:"todo",
    sub:"Urne : 4 rouges, 6 bleues",
    questions:[
      { id:"III.1", text:"P(rouge au 1er tirage)", pts:2, earned:0, status:"todo", open:true },
      { id:"III.2", text:"Tirages successifs sans remise", pts:2, earned:0, status:"todo", open:true },
      { id:"III.3", text:"Espérance mathématique", pts:2, earned:0, status:"todo", open:true },
    ]
  },
];

const INITIAL_MSGS = [
  {
    id:1, role:"ai",
    content:"Bonjour ! J'ai analysé ta copie sur **Mathématiques BAC 2024 Série C**.\n\nTu obtiens **11/20** — c'est bien pour les exercices I et II, mais l'exercice III sur les probabilités n'a pas été traité. On va reprendre ensemble les points perdus.",
    time:"14:32",
    chips:["Montrer mes erreurs","Exercice I d'abord","Commencer par les probas"]
  },
  {
    id:2, role:"user",
    content:"Je n'ai pas compris la question I.3 sur les extrema. J'ai bien le tableau de variation mais je ne sais pas comment déterminer la nature.",
    time:"14:33"
  },
  {
    id:3, role:"ai",
    content:"Bonne question ! Tu as f'(x) = 3(x−1)(x−3), donc f'(x) s'annule en x=1 et x=3.\n\nPour déterminer la **nature** d'un extremum, tu as deux méthodes :\n\n**Méthode 1 — Signe de f' :** Dans ton tableau, f' passe de + à − en x=1, donc c'est un **maximum local**. En x=3, f' passe de − à +, donc c'est un **minimum local**.\n\n**Méthode 2 — Calcul de f'' :** f''(x) = 6x − 12. En x=1, f''(1) = −6 < 0 → maximum. En x=3, f''(3) = 6 > 0 → minimum.\n\nTu vois la différence avec ce que tu avais écrit ?",
    time:"14:33",
    chips:["Oui je comprends","Montre-moi f''","Question I.4 maintenant"]
  },
];

const QUICK_SUGGESTIONS = [
  "Pourquoi j'ai perdu des points ?","Explique étape par étape","Donne-moi un exercice similaire","Méthode pour les probas",
];

// Streaming simulation
function useTypewriter(text, speed=18) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(()=>{
    setDisplayed(""); setDone(false);
    let i=0;
    const interval = setInterval(()=>{
      setDisplayed(text.slice(0,i+1));
      i++;
      if(i>=text.length){ clearInterval(interval); setDone(true); }
    }, speed);
    return ()=>clearInterval(interval);
  },[text]);
  return {displayed, done};
}

function AiMessage({msg, isNew=false}){
  const {displayed, done} = isNew
    ? useTypewriter(msg.content, 12)
    : {displayed:msg.content, done:true};

  const renderContent = (text)=>{
    return text.split("\n").map((line,i)=>{
      if(!line) return <br key={i}/>;
      const parts = line.split(/(\*\*[^*]+\*\*)/g).map((p,j)=>{
        if(p.startsWith("**")&&p.endsWith("**")) return <strong key={j}>{p.slice(2,-2)}</strong>;
        return p;
      });
      return <p key={i} style={{marginBottom:"4px"}}>{parts}</p>;
    });
  };

  return (
    <div className="msg-system">
      <div className="msg-avatar" style={{background:"linear-gradient(135deg,var(--teal),var(--teal2))"}}>🤖</div>
      <div>
        <div className="msg-bubble">{renderContent(displayed)}</div>
        <span className="msg-time">{msg.time}</span>
        {done && msg.chips && (
          <div className="msg-actions">
            {msg.chips.map(c=>(
              <button key={c} className="msg-action-chip">{c}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MahAICorrectionIA() {
  const [activeTab, setActiveTab]     = useState("correction");
  const [activeExo, setActiveExo]     = useState("I");
  const [openSteps, setOpenSteps]     = useState({"I.1":true,"I.3":true});
  const [msgs, setMsgs]               = useState(INITIAL_MSGS);
  const [inputVal, setInputVal]       = useState("");
  const [isTyping, setIsTyping]       = useState(false);
  const [lastMsgId, setLastMsgId]     = useState(null);
  const [barWidths, setBarWidths]     = useState(EXERCISES.map(()=>0));
  const [toast, setToast]             = useState({show:false,msg:""});
  const messagesEndRef = useRef(null);
  const textareaRef    = useRef(null);

  useEffect(()=>{
    const s=document.createElement("style");
    s.textContent=CSS;
    document.head.appendChild(s);
    return ()=>document.head.removeChild(s);
  },[]);

  useEffect(()=>{
    const t=setTimeout(()=>setBarWidths(EXERCISES.map(e=>(e.earned/e.pts)*100)),400);
    return ()=>clearTimeout(t);
  },[]);

  useEffect(()=>{
    messagesEndRef.current?.scrollIntoView({behavior:"smooth"});
  },[msgs, isTyping]);

  const showToast=(msg)=>{
    setToast({show:true,msg});
    setTimeout(()=>setToast({show:false,msg:""}),2600);
  };

  const toggleStep=(id)=>setOpenSteps(p=>({...p,[id]:!p[id]}));

  const AI_RESPONSES = [
    "Excellente question ! Pour l'équation tangente en x=1, rappelle-toi que la tangente a la forme **y = f'(a)(x−a) + f(a)**.\n\nIci a=1 : f'(1) = 3(0)(−2) = 0, et f(1) = 1 − 6 + 9 + 2 = 6.\n\nDonc la tangente est **y = 6** (droite horizontale — logique car x=1 est un maximum local !)",
    "Pour les probabilités, commençons par le plus simple.\n\nL'urne contient 4 rouges + 6 bleues = **10 boules au total**.\n\nP(rouge) = 4/10 = **2/5**.\n\nP(bleue) = 6/10 = **3/5**.\n\nMaintenant pour les tirages successifs sans remise, on utilise les probabilités conditionnelles. Tu veux qu'on continue sur ce point ?",
    "Bien sûr ! La dérivée seconde permet de confirmer la nature des extrema.\n\nf'(x) = 3x² − 12x + 9\nf''(x) = **6x − 12 = 6(x−2)**\n\nEn x=1 : f''(1) = 6(1−2) = **−6 < 0** → maximum local ✓\nEn x=3 : f''(3) = 6(3−2) = **6 > 0** → minimum local ✓\n\nCela confirme ce qu'on avait trouvé avec le tableau de variation.",
  ];

  const sendMessage = useCallback(()=>{
    if(!inputVal.trim()) return;
    const userMsg = {id:Date.now(), role:"user", content:inputVal.trim(), time:new Date().toLocaleTimeString("fr",{hour:"2-digit",minute:"2-digit"})};
    setMsgs(p=>[...p, userMsg]);
    setInputVal("");
    setIsTyping(true);
    setTimeout(()=>{
      setIsTyping(false);
      const aiMsg = {
        id:Date.now()+1, role:"ai",
        content:AI_RESPONSES[Math.floor(Math.random()*AI_RESPONSES.length)],
        time:new Date().toLocaleTimeString("fr",{hour:"2-digit",minute:"2-digit"}),
        chips:["Merci, je comprends","Autre question","Exercice suivant"]
      };
      setMsgs(p=>[...p, aiMsg]);
      setLastMsgId(aiMsg.id);
    }, 1800+Math.random()*800);
  },[inputVal]);

  const handleKey=(e)=>{
    if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); sendMessage(); }
  };

  const scoreTotal   = EXERCISES.reduce((s,e)=>s+e.earned,0);
  const ptsTotal     = EXERCISES.reduce((s,e)=>s+e.pts,0);
  const progressPct  = Math.round((scoreTotal/ptsTotal)*100);
  const mention      = progressPct>=90?"Excellent":progressPct>=75?"Bien":progressPct>=55?"Passable":"À réviser";
  const mentionColor = progressPct>=90?"var(--teal)":progressPct>=75?"var(--green)":progressPct>=55?"var(--gold)":"var(--rose)";

  const statusIcon=(s)=>({done:"✓",partial:"◑",todo:"○"}[s]);
  const statusClass=(s)=>({done:"es-done",partial:"es-partial",todo:"es-todo"}[s]);

  const stepStyle=(s)=>({
    done:{icon:"✓",bg:"rgba(0,255,136,.08)",bc:"rgba(0,255,136,.2)",cls:"step-correct",badge:"Correct",badgeColor:"var(--green)"},
    partial:{icon:"◑",bg:"rgba(255,209,102,.08)",bc:"rgba(255,209,102,.2)",cls:"step-warn",badge:"Partiel",badgeColor:"var(--gold)"},
    todo:{icon:"○",bg:"rgba(255,255,255,.04)",bc:"var(--border)",cls:"step-info",badge:"À traiter",badgeColor:"var(--blue)"},
  }[s]);

  const CORR_CONTENT = {
    "I.1":{
      context:"Calculer f'(x) pour f(x) = x³ − 6x² + 9x + 2",
      steps:[
        {label:"Méthode", text:"On applique la règle de dérivation terme par terme : (xⁿ)' = n·xⁿ⁻¹"},
        {label:"Calcul", math:"f'(x) = 3x² − 2·6x + 9 = 3x² − 12x + 9"},
        {label:"Factorisation", math:"f'(x) = 3(x² − 4x + 3) = 3(x − 1)(x − 3)"},
      ],
      correct:true, pts:2, earned:2,
      tip:"La factorisation n'était pas obligatoire mais facilite l'étude du signe de f' pour la suite."
    },
    "I.3":{
      context:"Déterminer les extrema de f et leur nature",
      steps:[
        {label:"Extrema", text:"f s'annule en x=1 et x=3 (racines de f')"},
        {label:"Nature via f'", math:"x=1 : f' passe de + à − → maximum local\nx=3 : f' passe de − à + → minimum local"},
        {label:"Valeurs", math:"f(1) = 1 − 6 + 9 + 2 = 6  →  maximum : (1 ; 6)\nf(3) = 27 − 54 + 27 + 2 = 2  →  minimum : (3 ; 2)"},
      ],
      correct:false, pts:2, earned:1,
      error:"Tu as bien trouvé les valeurs f(1) et f(3), mais tu n'as pas précisé la nature (maximum/minimum) — ce qui valait 1 point.",
      tip:"Toujours conclure explicitement : 'f admet un maximum local en x=1 de valeur 6'."
    },
    "I.4":{
      context:"Équation de la tangente à la courbe en x=1",
      steps:[
        {label:"Formule", math:"Tangente en x=a : y = f'(a)(x − a) + f(a)"},
        {label:"Calcul", math:"f'(1) = 3(1−1)(1−3) = 0\nf(1) = 6"},
        {label:"Résultat", math:"y = 0·(x − 1) + 6 = 6"},
      ],
      correct:false, pts:2, earned:1,
      error:"Tu as bien calculé f(1)=6, mais tu n'as pas appliqué la formule de la tangente — tu n'as pas calculé f'(1).",
      tip:"La tangente est horizontale (f'(1)=0) car x=1 est un extremum — c'est un résultat élégant à noter !"
    },
  };

  const currentQs = EXERCISES.find(e=>e.id===activeExo)?.questions || [];

  return (
    <div style={{height:"100vh",overflow:"hidden"}}>
      <div className="mesh"><span/><span/></div>

      {/* NAV */}
      <nav>
        <div className="nav-left">
          <button className="btn-back">← Retour</button>
          <a href="#" className="nav-logo">Mah.AI</a>
          <div className="nav-sep"/>
          <div className="nav-subject">
            <span className="ns-badge">🤖 Correction IA</span>
            <span className="ns-title">Mathématiques BAC 2024 — Série C&D</span>
          </div>
        </div>
        <div className="nav-right">
          <div className="nav-credits">💎 8 crédits restants</div>
          <button className="btn-dl" onClick={()=>showToast("📄 Téléchargement PDF en cours...")}>
            ⬇ Télécharger PDF
          </button>
        </div>
      </nav>

      <div className="app">

        {/* ── LEFT SIDEBAR ── */}
        <aside className="sidebar-left">
          <div className="sl-header">
            <div className="sl-title">Correction complète</div>
            <div className="sl-sub">Générée par Mah.AI · Sonar Large</div>
            <div className="sl-score-row">
              <div className="sl-score">{scoreTotal}/{ptsTotal} pts</div>
              <div className="sl-mention" style={{borderColor:mentionColor,color:mentionColor,background:`${mentionColor}11`}}>
                {mention}
              </div>
            </div>
          </div>

          <div className="sl-progress">
            <div className="sp-bar-track">
              <div className="sp-bar-fill" style={{width:`${progressPct}%`}}/>
            </div>
            <div className="sp-label">
              <span>Progression</span>
              <span style={{color:"var(--teal)"}}>{progressPct}%</span>
            </div>
          </div>

          <div className="sl-exercises">
            {EXERCISES.map((exo,ei)=>(
              <div key={exo.id} className={`exo-item ${activeExo===exo.id?"active":""}`}>
                <div className="exo-header" onClick={()=>setActiveExo(exo.id)}>
                  <div className={`exo-status ${statusClass(exo.status)}`}>{statusIcon(exo.status)}</div>
                  <div className="exo-info">
                    <div className="exo-name">Exercice {exo.id} — {exo.title}</div>
                    <div className="exo-meta">{exo.sub}</div>
                  </div>
                  <div className="exo-pts" style={{color:exo.status==="done"?"var(--green)":exo.status==="partial"?"var(--gold)":"var(--muted)"}}>
                    {exo.earned}/{exo.pts}
                  </div>
                </div>
                {activeExo===exo.id && (
                  <div className="exo-questions">
                    {exo.questions.map(q=>(
                      <div key={q.id} className={`eq-item ${openSteps[q.id]?"active":""}`}
                        onClick={()=>{toggleStep(q.id); setActiveExo(exo.id);}}>
                        <div className="eq-dot" style={{
                          background:q.status==="done"?"var(--green)":q.status==="partial"?"var(--gold)":"var(--muted2)",
                          border:`1px solid ${q.status==="done"?"var(--green)":q.status==="partial"?"var(--gold)":"var(--muted2)"}`
                        }}/>
                        {q.id} · {q.text}
                        <span style={{marginLeft:"auto",fontFamily:"var(--mono)",fontSize:10,color:q.status==="done"?"var(--green)":q.status==="partial"?"var(--gold)":"var(--muted2)"}}>
                          {q.earned}/{q.pts}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="sl-footer">
            <button className="btn-prof" onClick={()=>showToast("🎓 Demande de correction professeur envoyée — délai 24h")}>
              🎓 Demander correction Professeur · 6 crédits
            </button>
          </div>
        </aside>

        {/* ── CENTER ── */}
        <main className="correction-main">
          <div className="cm-tabs">
            {["correction","sujet"].map(t=>(
              <button key={t} className={`cm-tab ${activeTab===t?"on":""}`} onClick={()=>setActiveTab(t)}>
                {t==="correction"?"🤖 Correction IA":"📄 Sujet original"}
              </button>
            ))}
            <div className="cm-tab-sep"/>
            <div className="cm-actions">
              <button className="cm-action" onClick={()=>showToast("📋 Copié dans le presse-papier !")}>📋 Copier</button>
              <button className="cm-action" onClick={()=>showToast("🖨 Impression en cours...")}>🖨 Imprimer</button>
              <button className="cm-action" onClick={()=>showToast("⭐ Ajouté à tes favoris")}>⭐ Sauvegarder</button>
            </div>
          </div>

          <div className="cm-content">
            {activeTab==="correction" && EXERCISES.map((exo,ei)=>{
              const ss = stepStyle(exo.status);
              return (
                <div key={exo.id} className="exo-block" style={{animationDelay:`${ei*0.1}s`}}>
                  <div className="exo-block-header">
                    <div className="ebh-left">
                      <div className="exo-roman">Exercice {exo.id}</div>
                      <div className="exo-block-title">{exo.title}</div>
                      <div className="exo-block-sub">{exo.sub}</div>
                    </div>
                    <div className="exo-score-badge" style={{borderColor:ss.bc,color:ss.badgeColor,background:`${ss.bg}`}}>
                      <span>{ss.icon}</span>
                      <span style={{fontFamily:"var(--mono)"}}>{exo.earned}/{exo.pts} pts</span>
                    </div>
                  </div>

                  {exo.questions.map((q,qi)=>{
                    const qs  = stepStyle(q.status);
                    const corr= CORR_CONTENT[q.id];
                    const isOpen = openSteps[q.id];
                    return (
                      <div key={q.id} className={`step-card ${qs.cls} ${isOpen?"highlight":""}`} style={{animationDelay:`${ei*0.1+qi*0.06}s`}}>
                        <div className="step-header" onClick={()=>toggleStep(q.id)}>
                          <div className="step-icon" style={{background:qs.bg,border:`1px solid ${qs.bc}`,color:qs.badgeColor}}>{qs.icon}</div>
                          <div style={{flex:1}}>
                            <div className="step-q-num">{q.id}</div>
                            <div className="step-q-text">{q.text}</div>
                          </div>
                          <div className="step-badge" style={{borderColor:qs.bc,color:qs.badgeColor,background:qs.bg}}>{qs.badge}</div>
                          <div style={{fontFamily:"var(--mono)",fontSize:12,fontWeight:700,color:qs.badgeColor,marginLeft:8}}>{q.earned}/{q.pts}</div>
                          <div className={`step-toggle ${isOpen?"open":""}`}>▾</div>
                        </div>

                        {isOpen && corr && (
                          <div className="step-body">
                            {corr.context && (
                              <div style={{background:"var(--bg3)",borderLeft:"3px solid var(--blue)",borderRadius:"0 8px 8px 0",padding:"10px 14px",marginTop:14,fontSize:13,color:"var(--muted)"}}>
                                📌 {corr.context}
                              </div>
                            )}

                            {corr.steps.map((st,si)=>(
                              <div key={si} className="corr-section">
                                <div className="cs-label">{st.label}</div>
                                {st.math ? (
                                  <div className="cs-content">
                                    <span className="math-block">{st.math}</span>
                                  </div>
                                ) : (
                                  <div className="cs-content">{st.text}</div>
                                )}
                              </div>
                            ))}

                            {corr.error && (
                              <div className="error-callout">
                                <div className="ec-header">✕ Point(s) perdu(s)</div>
                                <div className="ec-text">{corr.error}</div>
                              </div>
                            )}

                            {corr.tip && (
                              <div className="tip-callout">
                                <div className="tc-header">💡 À retenir</div>
                                <div style={{fontSize:12,color:"var(--muted)",lineHeight:1.6}}>{corr.tip}</div>
                              </div>
                            )}

                            <div className="pts-row">
                              <div className="pts-label">Points obtenus pour cette question</div>
                              <div className="pts-val" style={{color:q.status==="done"?"var(--green)":"var(--gold)"}}>
                                {q.earned}/{q.pts} pt{q.pts>1?"s":""}
                              </div>
                            </div>

                            <button className="btn-ask-ai" onClick={()=>{
                              setInputVal(`Explique-moi la question ${q.id} : ${q.text}`);
                              textareaRef.current?.focus();
                            }}>
                              🤖 Poser une question à l'IA sur ce point →
                            </button>
                          </div>
                        )}

                        {isOpen && !corr && (
                          <div className="step-body">
                            <div style={{textAlign:"center",padding:"24px 0",color:"var(--muted)",fontSize:13}}>
                              <div style={{fontSize:32,marginBottom:12}}>🔄</div>
                              Cette partie n'a pas été traitée dans ta copie.<br/>
                              <button className="btn-ask-ai" style={{margin:"12px auto 0",display:"inline-flex"}} onClick={()=>{
                                setInputVal(`Comment résoudre la question ${q.id} : ${q.text} ?`);
                                textareaRef.current?.focus();
                              }}>
                                🤖 Demander l'explication complète à l'IA →
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {activeTab==="sujet" && (
              <div className="sujet-view">
                {[
                  {
                    exo:"EXERCICE I — Analyse (8 points)",
                    content:[
                      {type:"text",val:"Soit f la fonction définie sur ℝ par :"},
                      {type:"math",val:"f(x) = x³ − 6x² + 9x + 2"},
                      {type:"text",val:"1. Calculer f'(x) et factoriser le résultat.\n2. Dresser le tableau de variation de f sur ℝ.\n3. Déterminer les extrema de f. Préciser leur nature (maximum ou minimum local) et les coordonnées des points correspondants sur la courbe.\n4. Écrire l'équation de la tangente à la courbe représentative de f au point d'abscisse x = 1."},
                    ]
                  },
                  {
                    exo:"EXERCICE II — Géométrie dans l'espace (6 points)",
                    content:[
                      {type:"text",val:"Dans l'espace rapporté à un repère orthonormé (O, i, j, k), on donne les points :"},
                      {type:"math",val:"A(1 ; 2 ; −1)   B(3 ; 0 ; 2)   C(−1 ; 4 ; 0)"},
                      {type:"text",val:"1. Calculer les coordonnées des vecteurs AB⃗ et AC⃗.\n2. Déterminer une équation cartésienne du plan (ABC).\n3. Calculer la distance du point D(2 ; 1 ; 0) au plan (ABC)."},
                    ]
                  },
                  {
                    exo:"EXERCICE III — Probabilités (6 points)",
                    content:[
                      {type:"text",val:"Une urne contient 4 boules rouges et 6 boules bleues, indiscernables au toucher."},
                      {type:"text",val:"On tire successivement et sans remise 2 boules de l'urne."},
                      {type:"text",val:"1. Calculer la probabilité d'obtenir une boule rouge au premier tirage.\n2. Calculer la probabilité que les 2 boules tirées soient de la même couleur.\n3. Soit X la variable aléatoire égale au nombre de boules rouges obtenues. Déterminer la loi de probabilité de X et calculer son espérance mathématique E(X)."},
                    ]
                  }
                ].map((s,i)=>(
                  <div key={i} className="sv-page">
                    <div className="sv-section">{s.exo}</div>
                    <div className="sv-text">
                      {s.content.map((c,ci)=>
                        c.type==="math"
                          ? <span key={ci} className="sv-math">{c.val}</span>
                          : <p key={ci}>{c.val}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* ── RIGHT : Chat ── */}
        <aside className="chat-panel">
          <div className="cp-header">
            <div className="ai-avatar">🤖</div>
            <div className="cp-info">
              <div className="cp-name">Mah.AI — Tuteur personnel</div>
              <div className="cp-status">En ligne — prêt à t'aider</div>
            </div>
            <div className="cp-mode">Mode<br/>pédagogique</div>
          </div>

          <div className="chat-messages">
            {msgs.map((msg,i)=>(
              msg.role==="ai" ? (
                <AiMessage key={msg.id} msg={msg} isNew={msg.id===lastMsgId}/>
              ) : (
                <div key={msg.id} className="msg-system msg-user">
                  <div className="msg-avatar" style={{background:"linear-gradient(135deg,#1A3A5C,var(--teal2))"}}>👤</div>
                  <div>
                    <div className="msg-bubble">{msg.content}</div>
                    <span className="msg-time" style={{textAlign:"right",display:"block"}}>{msg.time}</span>
                  </div>
                </div>
              )
            ))}
            {isTyping && (
              <div className="typing-bubble">
                <div className="msg-avatar" style={{background:"linear-gradient(135deg,var(--teal),var(--teal2))"}}>🤖</div>
                <div className="typing-dots">
                  <div className="typing-dot"/><div className="typing-dot"/><div className="typing-dot"/>
                </div>
              </div>
            )}
            <div ref={messagesEndRef}/>
          </div>

          <div className="quick-suggestions">
            {QUICK_SUGGESTIONS.map(s=>(
              <button key={s} className="qs-chip" onClick={()=>{setInputVal(s);textareaRef.current?.focus();}}>
                {s}
              </button>
            ))}
          </div>

          <div className="chat-input-wrap">
            <div className="chat-input-row">
              <textarea
                ref={textareaRef}
                className="chat-textarea"
                placeholder="Pose ta question sur n'importe quel exercice..."
                value={inputVal}
                onChange={e=>setInputVal(e.target.value)}
                onKeyDown={handleKey}
                rows={1}
              />
              <button className="chat-send" onClick={sendMessage} disabled={!inputVal.trim()||isTyping}>
                ➤
              </button>
            </div>
            <div className="chat-input-meta">
              <div className="cim-left">
                <span className="mode-badge">🤖 Mode guidé — répond sans donner la solution directement</span>
              </div>
              <div className="cim-right">Entrée pour envoyer</div>
            </div>
          </div>
        </aside>
      </div>

      <div className={`toast ${toast.show?"show":""}`}>
        <span style={{fontSize:16}}>✨</span><span>{toast.msg}</span>
      </div>
    </div>
  );
}
