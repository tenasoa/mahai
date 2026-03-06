import { useState, useEffect, useRef, useCallback } from "react";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,700;12..96,800&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --teal:#0AFFE0;--teal2:#00C9A7;--green:#00FF88;--gold:#FFD166;
    --rose:#FF6B9D;--blue:#4F8EF7;--purple:#A78BFA;--orange:#FF9F43;
    --red:#FF4444;
    --bg:#060910;--bg2:#0C1220;--bg3:#111928;--bg4:#080E1C;
    --border:rgba(255,255,255,.07);--border2:rgba(10,255,224,.2);
    --text:#F0F4FF;--muted:#6B7899;--muted2:#3A4560;
    --font:'Bricolage Grotesque',sans-serif;--mono:'DM Mono',monospace;
    --r:14px;
  }
  html,body{height:100%;overflow:hidden}
  body{font-family:var(--font);background:var(--bg);color:var(--text);-webkit-font-smoothing:antialiased}
  ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:var(--teal2);border-radius:2px}
  body::before{content:'';position:fixed;inset:0;z-index:0;opacity:.35;pointer-events:none;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")}
  .mesh{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden}
  .mesh span{position:absolute;border-radius:50%;filter:blur(140px);opacity:.055;animation:fm 22s ease-in-out infinite alternate}
  .mesh span:nth-child(1){width:600px;height:600px;top:-150px;right:-100px;background:var(--purple);animation-delay:0s}
  .mesh span:nth-child(2){width:400px;height:400px;bottom:-80px;left:-80px;background:var(--teal);animation-delay:-9s}
  @keyframes fm{0%{transform:translate(0,0)}100%{transform:translate(22px,-18px)}}

  /* ── NAV ── */
  nav{
    position:fixed;top:0;left:0;right:0;z-index:100;height:56px;
    display:flex;align-items:center;justify-content:space-between;
    padding:0 24px;
    background:rgba(6,9,16,.9);backdrop-filter:blur(24px);
    border-bottom:1px solid var(--border);
  }
  .nav-logo{font-size:18px;font-weight:800;letter-spacing:-1px;background:linear-gradient(135deg,var(--teal),var(--green));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
  .nav-role{display:flex;align-items:center;gap:6px;padding:4px 12px;background:rgba(167,139,250,.08);border:1px solid rgba(167,139,250,.2);border-radius:8px;font-size:11px;font-family:var(--mono);color:var(--purple)}
  .nav-role::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--purple);animation:onP 2s ease-in-out infinite}
  @keyframes onP{0%,100%{opacity:1}50%{opacity:.3}}
  .nav-center{display:flex;align-items:center;gap:6px}
  .nav-tab{background:transparent;border:1px solid transparent;color:var(--muted);padding:6px 16px;border-radius:8px;font-family:var(--font);font-size:13px;font-weight:500;cursor:pointer;transition:all .2s}
  .nav-tab:hover{color:var(--text);border-color:var(--border)}
  .nav-tab.on{background:rgba(10,255,224,.07);border-color:rgba(10,255,224,.18);color:var(--teal)}
  .nav-right{display:flex;align-items:center;gap:10px}
  .nav-earnings{display:flex;align-items:center;gap:6px;background:rgba(0,255,136,.06);border:1px solid rgba(0,255,136,.15);padding:6px 12px;border-radius:8px;font-size:12px;font-family:var(--mono);color:var(--green)}
  .nav-queue{display:flex;align-items:center;gap:6px;background:rgba(255,209,102,.06);border:1px solid rgba(255,209,102,.15);padding:6px 12px;border-radius:8px;font-size:12px;font-family:var(--mono);color:var(--gold);cursor:pointer;transition:background .2s}
  .nav-queue:hover{background:rgba(255,209,102,.12)}
  .nav-avatar{width:32px;height:32px;border-radius:9px;background:linear-gradient(135deg,#2A1A4A,var(--purple));display:flex;align-items:center;justify-content:center;font-size:14px;border:1px solid rgba(167,139,250,.2)}

  /* ── LAYOUT ── */
  .app{position:fixed;top:56px;left:0;right:0;bottom:0;display:grid;grid-template-columns:300px 1fr 280px;overflow:hidden;z-index:1}

  /* ── LEFT: Queue ── */
  .queue-panel{
    border-right:1px solid var(--border);
    display:flex;flex-direction:column;
    background:rgba(6,9,16,.65);backdrop-filter:blur(12px);
    overflow:hidden;
  }
  .qp-header{padding:16px 16px 12px;border-bottom:1px solid var(--border);flex-shrink:0}
  .qp-title{font-size:13px;font-weight:700;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between}
  .qp-count{font-size:10px;font-family:var(--mono);color:var(--gold);background:rgba(255,209,102,.08);border:1px solid rgba(255,209,102,.2);padding:2px 8px;border-radius:100px}
  .qp-filters{display:flex;gap:4px}
  .qf{padding:5px 10px;border-radius:7px;border:1px solid var(--border);font-size:11px;font-family:var(--mono);color:var(--muted);cursor:pointer;background:transparent;transition:all .18s}
  .qf:hover{border-color:rgba(255,255,255,.15);color:var(--text)}
  .qf.on{background:rgba(10,255,224,.07);border-color:rgba(10,255,224,.2);color:var(--teal)}

  .qp-list{flex:1;overflow-y:auto;padding:8px}
  .queue-item{
    border-radius:10px;border:1px solid var(--border);
    margin-bottom:6px;cursor:pointer;
    transition:all .2s;
    background:var(--bg2);
    position:relative;overflow:hidden;
  }
  .queue-item::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;border-radius:3px 0 0 3px}
  .qi-urgent::before{background:var(--rose)}
  .qi-normal::before{background:var(--teal)}
  .qi-low::before{background:var(--muted2)}
  .queue-item:hover{border-color:rgba(255,255,255,.13);transform:translateX(2px)}
  .queue-item.active{border-color:rgba(10,255,224,.25);background:rgba(10,255,224,.04)}
  .qi-inner{padding:12px 12px 12px 16px}
  .qi-top{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:8px}
  .qi-emoji{font-size:18px;flex-shrink:0}
  .qi-info{flex:1;min-width:0}
  .qi-title{font-size:12px;font-weight:700;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .qi-contrib{font-size:10px;color:var(--muted);font-family:var(--mono);margin-top:2px}
  .qi-badge{padding:2px 7px;border-radius:100px;font-size:9px;font-weight:700;font-family:var(--mono);border:1px solid;flex-shrink:0;white-space:nowrap}
  .qb-urgent{background:rgba(255,107,157,.08);border-color:rgba(255,107,157,.25);color:var(--rose)}
  .qb-normal{background:rgba(10,255,224,.07);border-color:rgba(10,255,224,.2);color:var(--teal)}
  .qb-low{background:rgba(255,255,255,.04);border-color:var(--border);color:var(--muted)}
  .qi-bottom{display:flex;align-items:center;gap:8px}
  .qi-tag{font-size:9px;font-family:var(--mono);color:var(--muted);background:var(--bg3);border:1px solid var(--border);padding:2px 7px;border-radius:4px}
  .qi-time{font-size:9px;font-family:var(--mono);color:var(--muted2);margin-left:auto;white-space:nowrap}
  .qi-ai-score{display:flex;align-items:center;gap:4px;margin-top:7px;padding-top:7px;border-top:1px solid rgba(255,255,255,.04)}
  .ai-score-label{font-size:9px;color:var(--muted);font-family:var(--mono)}
  .ai-score-bar-track{flex:1;height:3px;background:rgba(255,255,255,.06);border-radius:2px;overflow:hidden}
  .ai-score-bar-fill{height:100%;border-radius:2px;transition:width 1s ease}
  .ai-score-val{font-size:9px;font-family:var(--mono);font-weight:700}

  .qp-stats{padding:10px 12px;border-top:1px solid var(--border);display:grid;grid-template-columns:repeat(3,1fr);gap:6px;flex-shrink:0}
  .qs-mini{background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:8px 10px;text-align:center}
  .qs-mini-num{font-size:16px;font-weight:800;letter-spacing:-0.5px}
  .qs-mini-label{font-size:9px;color:var(--muted);font-family:var(--mono);margin-top:2px}

  /* ── CENTER: Document viewer ── */
  .doc-viewer{
    display:flex;flex-direction:column;overflow:hidden;
    border-right:1px solid var(--border);
  }

  .dv-topbar{
    padding:10px 20px;border-bottom:1px solid var(--border);
    display:flex;align-items:center;gap:12px;flex-shrink:0;
    background:rgba(6,9,16,.5);
  }
  .dv-title-wrap{flex:1;min-width:0}
  .dv-title{font-size:14px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .dv-meta{font-size:11px;color:var(--muted);font-family:var(--mono);margin-top:2px}
  .dv-actions{display:flex;gap:6px;flex-shrink:0}
  .dv-action{background:transparent;border:1px solid var(--border);color:var(--muted);padding:5px 11px;border-radius:7px;font-family:var(--mono);font-size:11px;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:4px;white-space:nowrap}
  .dv-action:hover{border-color:var(--border2);color:var(--text)}
  .dv-action.on{background:rgba(10,255,224,.07);border-color:rgba(10,255,224,.2);color:var(--teal)}

  .dv-toolbar{
    padding:7px 20px;border-bottom:1px solid var(--border);
    display:flex;align-items:center;gap:8px;flex-shrink:0;
    background:rgba(6,9,16,.3);
  }
  .tool-btn{width:30px;height:30px;border-radius:7px;background:transparent;border:1px solid var(--border);color:var(--muted);font-size:13px;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center}
  .tool-btn:hover,.tool-btn.on{background:rgba(10,255,224,.07);border-color:rgba(10,255,224,.2);color:var(--teal)}
  .tool-sep{width:1px;height:18px;background:var(--border)}
  .tool-label{font-size:11px;color:var(--muted);font-family:var(--mono)}
  .annotation-mode{display:flex;align-items:center;gap:6px;margin-left:auto;padding:5px 12px;background:rgba(255,209,102,.06);border:1px solid rgba(255,209,102,.15);border-radius:8px;font-size:11px;font-family:var(--mono);color:var(--gold)}
  .annotation-mode span{width:6px;height:6px;border-radius:50%;background:var(--gold);animation:onP 1.5s ease-in-out infinite}

  .dv-content{flex:1;overflow-y:auto;padding:24px 28px;position:relative}

  /* Document page */
  .doc-page{
    background:var(--bg2);border:1px solid var(--border);border-radius:var(--r);
    padding:32px;margin-bottom:16px;position:relative;
    animation:pageIn .4s ease both;
  }
  @keyframes pageIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  .doc-page::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(10,255,224,.3),transparent);opacity:.6}
  .page-num{position:absolute;top:12px;right:16px;font-size:10px;font-family:var(--mono);color:var(--muted2)}

  .doc-heading{font-size:15px;font-weight:800;letter-spacing:-.3px;color:var(--text);margin-bottom:6px;line-height:1.3}
  .doc-meta-row{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:18px}
  .doc-badge{padding:3px 9px;border-radius:6px;font-size:10px;font-weight:700;font-family:var(--mono);border:1px solid}
  .doc-text{font-size:14px;line-height:1.9;color:var(--muted)}
  .doc-text p{margin-bottom:10px}
  .doc-math{display:block;background:var(--bg3);border-left:3px solid var(--teal);border-radius:0 8px 8px 0;padding:10px 16px;margin:12px 0;font-family:var(--mono);font-size:13px;color:var(--teal);line-height:1.9}
  .doc-exercise{margin-top:18px;padding-top:14px;border-top:1px solid var(--border)}
  .doc-ex-num{font-size:10px;color:var(--teal);font-family:var(--mono);letter-spacing:.1em;text-transform:uppercase;margin-bottom:6px}
  .doc-ex-title{font-size:14px;font-weight:700;margin-bottom:10px}
  .doc-question{display:flex;gap:10px;margin-bottom:10px;font-size:13px;color:var(--muted);line-height:1.7}
  .doc-q-num{font-family:var(--mono);font-size:12px;color:var(--teal);flex-shrink:0;margin-top:1px}

  /* Annotations */
  .annotation{
    position:absolute;right:-12px;
    display:flex;align-items:flex-start;gap:0;
    cursor:pointer;
    z-index:10;
    animation:annIn .3s cubic-bezier(.34,1.56,.64,1) both;
  }
  @keyframes annIn{from{opacity:0;transform:scale(0) translateX(10px)}to{opacity:1;transform:scale(1) translateX(0)}}
  .ann-pin{width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0;border:2px solid;box-shadow:0 4px 12px rgba(0,0,0,.4);transition:transform .2s}
  .annotation:hover .ann-pin{transform:scale(1.2)}
  .ann-ok{background:rgba(0,255,136,.15);border-color:var(--green);color:var(--green)}
  .ann-warn{background:rgba(255,209,102,.15);border-color:var(--gold);color:var(--gold)}
  .ann-err{background:rgba(255,107,157,.15);border-color:var(--rose);color:var(--rose)}
  .ann-note{background:rgba(79,142,247,.15);border-color:var(--blue);color:var(--blue)}
  .ann-tooltip{
    display:none;position:absolute;right:26px;top:0;
    background:var(--bg2);border:1px solid var(--border);border-radius:10px;
    padding:10px 14px;font-size:12px;color:var(--text);line-height:1.5;
    width:200px;box-shadow:0 10px 30px rgba(0,0,0,.4);pointer-events:none;
    white-space:normal;
  }
  .annotation:hover .ann-tooltip{display:block}
  .ann-tooltip-title{font-weight:700;margin-bottom:4px;font-size:11px}
  .ann-line{position:absolute;right:22px;top:11px;width:20px;height:1px;background:currentColor;opacity:.3}

  /* Highlight on doc */
  .doc-highlight{
    display:inline;padding:2px 0;border-radius:3px;cursor:pointer;transition:background .2s;
    position:relative;
  }
  .hl-green{background:rgba(0,255,136,.12);border-bottom:2px solid var(--green)}
  .hl-gold{background:rgba(255,209,102,.1);border-bottom:2px solid var(--gold)}
  .hl-rose{background:rgba(255,107,157,.1);border-bottom:2px solid var(--rose)}

  /* ── RIGHT: Grille d'évaluation + actions ── */
  .eval-panel{
    display:flex;flex-direction:column;
    background:rgba(6,9,16,.65);backdrop-filter:blur(12px);
    overflow:hidden;
  }

  .ep-header{padding:16px 18px 12px;border-bottom:1px solid var(--border);flex-shrink:0}
  .ep-title{font-size:13px;font-weight:700;margin-bottom:2px}
  .ep-sub{font-size:11px;color:var(--muted);font-family:var(--mono)}

  .ep-scroll{flex:1;overflow-y:auto;padding:12px}

  /* Criteria cards */
  .crit-section{margin-bottom:16px}
  .cs-title{font-size:10px;color:var(--muted);font-family:var(--mono);letter-spacing:.12em;text-transform:uppercase;margin-bottom:8px;padding:0 2px}
  .crit-item{
    background:var(--bg2);border:1px solid var(--border);border-radius:10px;
    padding:12px;margin-bottom:6px;
    transition:border-color .2s;
  }
  .crit-item:hover{border-color:rgba(255,255,255,.12)}
  .ci-top{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:8px}
  .ci-label{font-size:12px;font-weight:700;line-height:1.3}
  .ci-desc{font-size:10px;color:var(--muted);margin-top:2px;line-height:1.4}
  .ci-score-wrap{display:flex;gap:3px;flex-shrink:0}
  .score-dot{width:20px;height:20px;border-radius:6px;border:1px solid var(--border);cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;font-size:10px;background:transparent;color:var(--muted)}
  .score-dot.filled-green{background:rgba(0,255,136,.15);border-color:var(--green);color:var(--green)}
  .score-dot.filled-gold{background:rgba(255,209,102,.15);border-color:var(--gold);color:var(--gold)}
  .score-dot.filled-rose{background:rgba(255,107,157,.15);border-color:var(--rose);color:var(--rose)}
  .score-dot:hover{border-color:rgba(255,255,255,.2);color:var(--text)}
  .ci-bar{height:3px;background:rgba(255,255,255,.06);border-radius:2px;overflow:hidden}
  .ci-bar-fill{height:100%;border-radius:2px;transition:width .6s ease,background .3s}
  .ci-note{font-size:10px;color:var(--muted);font-family:var(--mono);margin-top:5px;display:flex;align-items:center;justify-content:space-between}

  /* AI pre-analysis */
  .ai-pre-card{
    background:linear-gradient(135deg,rgba(10,255,224,.04),var(--bg2));
    border:1px solid rgba(10,255,224,.15);border-radius:10px;
    padding:12px;margin-bottom:12px;
  }
  .apc-header{display:flex;align-items:center;gap:8px;margin-bottom:10px}
  .apc-orb{width:26px;height:26px;border-radius:7px;background:linear-gradient(135deg,var(--teal),var(--teal2));display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0;position:relative}
  .apc-orb::after{content:'';position:absolute;inset:-2px;border-radius:9px;border:1px solid rgba(10,255,224,.3);animation:op 2s ease-in-out infinite}
  @keyframes op{0%,100%{opacity:1}50%{opacity:.3}}
  .apc-title{font-size:12px;font-weight:700}
  .apc-label{font-size:10px;color:var(--teal);font-family:var(--mono);margin-top:1px}
  .apc-finding{display:flex;align-items:flex-start;gap:7px;font-size:11px;color:var(--muted);line-height:1.5;margin-bottom:6px}
  .apc-finding:last-child{margin-bottom:0}
  .apc-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0;margin-top:4px}

  /* Overall score ring */
  .overall-score{
    background:var(--bg2);border:1px solid var(--border);border-radius:10px;
    padding:14px;margin-bottom:12px;
    display:flex;align-items:center;gap:14px;
  }
  .os-ring{position:relative;flex-shrink:0}
  .os-ring svg{transform:rotate(-90deg)}
  .os-ring-bg{fill:none;stroke:rgba(255,255,255,.07);stroke-width:5}
  .os-ring-fill{fill:none;stroke-width:5;stroke-linecap:round;stroke-dasharray:138.2;transition:stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1),stroke .5s}
  .os-val{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:16px;font-weight:800}
  .os-right{flex:1}
  .os-label{font-size:12px;font-weight:700;margin-bottom:3px}
  .os-rec{font-size:11px;font-family:var(--mono);padding:3px 8px;border-radius:6px;border:1px solid;display:inline-block;margin-top:4px}

  /* Checklist */
  .checklist{background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:12px}
  .cl-title{font-size:11px;font-weight:700;margin-bottom:8px}
  .cl-item{display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.03);cursor:pointer}
  .cl-item:last-child{border-bottom:none}
  .cl-check{width:16px;height:16px;border-radius:4px;border:1px solid var(--border);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:10px;transition:all .2s}
  .cl-check.on{background:rgba(0,255,136,.12);border-color:var(--green);color:var(--green)}
  .cl-text{font-size:11px;color:var(--muted);flex:1;line-height:1.4}
  .cl-text.checked{color:var(--text);text-decoration:line-through;opacity:.6}

  /* Comment input */
  .ep-comment{padding:10px 12px;border-top:1px solid var(--border);flex-shrink:0}
  .ec-label{font-size:10px;color:var(--muted);font-family:var(--mono);letter-spacing:.08em;text-transform:uppercase;margin-bottom:6px}
  .ec-textarea{width:100%;background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:9px 12px;color:var(--text);font-family:var(--font);font-size:12px;line-height:1.5;outline:none;resize:none;transition:border-color .2s;min-height:64px}
  .ec-textarea:focus{border-color:var(--border2)}
  .ec-textarea::placeholder{color:var(--muted)}

  /* Decision buttons */
  .ep-decision{padding:10px 12px;border-top:1px solid var(--border);flex-shrink:0;display:flex;flex-direction:column;gap:6px}
  .btn-approve{background:linear-gradient(135deg,var(--green),var(--teal2));color:var(--bg);border:none;padding:12px;border-radius:10px;font-family:var(--font);font-size:14px;font-weight:800;cursor:pointer;transition:transform .2s,box-shadow .25s;display:flex;align-items:center;justify-content:center;gap:8px}
  .btn-approve:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(0,255,136,.3)}
  .btn-revise{background:rgba(255,209,102,.08);border:1px solid rgba(255,209,102,.25);color:var(--gold);padding:10px;border-radius:10px;font-family:var(--font);font-size:13px;font-weight:700;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:7px}
  .btn-revise:hover{background:rgba(255,209,102,.14);box-shadow:0 6px 20px rgba(255,209,102,.15)}
  .btn-reject{background:rgba(255,107,157,.06);border:1px solid rgba(255,107,157,.2);color:var(--rose);padding:10px;border-radius:10px;font-family:var(--font);font-size:13px;font-weight:700;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:7px}
  .btn-reject:hover{background:rgba(255,107,157,.12)}
  .decision-meta{font-size:10px;color:var(--muted);font-family:var(--mono);text-align:center;padding:2px 0}

  /* ── MODAL: Decision confirm ── */
  .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:200;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(10px);animation:fadeIn .2s ease}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  .modal{background:var(--bg2);border:1px solid var(--border);border-radius:20px;padding:32px;width:100%;max-width:440px;position:relative;animation:modalIn .35s cubic-bezier(.34,1.56,.64,1)}
  @keyframes modalIn{from{opacity:0;transform:scale(.88) translateY(16px)}to{opacity:1;transform:scale(1) translateY(0)}}
  .modal-close{position:absolute;top:14px;right:14px;background:var(--bg3);border:1px solid var(--border);color:var(--muted);width:28px;height:28px;border-radius:7px;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;transition:all .2s}
  .modal-close:hover{border-color:var(--border2);color:var(--text)}
  .modal-icon{font-size:40px;text-align:center;margin-bottom:16px}
  .modal-title{font-size:20px;font-weight:800;letter-spacing:-.5px;text-align:center;margin-bottom:6px}
  .modal-sub{font-size:13px;color:var(--muted);text-align:center;margin-bottom:22px;line-height:1.5}
  .modal-summary{background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:14px;margin-bottom:18px}
  .ms-row{display:flex;align-items:center;justify-content:space-between;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.04);font-size:12px}
  .ms-row:last-child{border-bottom:none}
  .ms-label{color:var(--muted)}
  .ms-val{font-family:var(--mono);font-weight:700}
  .modal-gain{background:linear-gradient(135deg,rgba(0,255,136,.08),rgba(0,255,136,.03));border:1px solid rgba(0,255,136,.2);border-radius:10px;padding:14px;text-align:center;margin-bottom:18px}
  .mg-label{font-size:11px;color:var(--green);font-family:var(--mono);margin-bottom:4px}
  .mg-amount{font-size:28px;font-weight:800;letter-spacing:-1.5px;color:var(--green)}
  .mg-sub{font-size:11px;color:var(--muted);margin-top:3px}
  .btn-confirm{width:100%;padding:13px;border-radius:11px;font-family:var(--font);font-size:15px;font-weight:800;cursor:pointer;border:none;margin-bottom:8px;transition:all .2s}
  .btn-cancel{width:100%;background:transparent;border:1px solid var(--border);color:var(--muted);padding:10px;border-radius:10px;font-family:var(--font);font-size:13px;cursor:pointer;transition:all .2s}
  .btn-cancel:hover{border-color:rgba(255,255,255,.2);color:var(--text)}

  /* ── TOAST ── */
  .toast{position:fixed;bottom:20px;right:20px;background:var(--bg2);border:1px solid var(--border2);border-radius:12px;padding:12px 18px;display:flex;align-items:center;gap:10px;font-size:13px;box-shadow:0 16px 48px rgba(0,0,0,.5);z-index:400;transition:transform .4s cubic-bezier(.34,1.56,.64,1),opacity .3s;transform:translateY(70px);opacity:0}
  .toast.show{transform:translateY(0);opacity:1}

  @media(max-width:1100px){.app{grid-template-columns:260px 1fr 0}.eval-panel{display:none}}
  @media(max-width:780px){.app{grid-template-columns:1fr}.queue-panel{display:none}}
`;

// ── DATA ────────────────────────────────────────────────────────
const QUEUE = [
  { id:1, emoji:"📐", title:"Maths BAC 2024 — Série C&D", contrib:"Rakoto Jean-Marie", type:"BAC", matiere:"Maths", year:"2024", priority:"urgent", time:"il y a 2h", aiScore:88 },
  { id:2, emoji:"🌿", title:"SVT Série D 2023", contrib:"Miora Andria", type:"BAC", matiere:"SVT", year:"2023", priority:"normal", time:"il y a 4h", aiScore:72 },
  { id:3, emoji:"📖", title:"Français BEPC 2024", contrib:"Fidy Razaka", type:"BEPC", matiere:"Français", year:"2024", priority:"normal", time:"il y a 6h", aiScore:91 },
  { id:4, emoji:"⚗️", title:"Physique-Chimie 2024 Série C", contrib:"Lalaina Vao", type:"BAC", matiere:"Phys-Chimie", year:"2024", priority:"low", time:"il y a 8h", aiScore:65 },
  { id:5, emoji:"🌍", title:"Histoire-Géo BAC 2022", contrib:"Hery Tiana", type:"BAC", matiere:"Hist-Géo", year:"2022", priority:"low", time:"il y a 12h", aiScore:79 },
  { id:6, emoji:"💭", title:"Philosophie Série A 2024", contrib:"Zo Rabe", type:"BAC", matiere:"Philo", year:"2024", priority:"urgent", time:"il y a 1h", aiScore:55 },
];

const ANNOTATIONS = [
  { id:1, top:"18%", type:"ok", text:"Conforme au programme", detail:"L'exercice I correspond exactement au programme officiel BAC 2024.", number:1 },
  { id:2, top:"36%", type:"warn", text:"Vérifier la formulation", detail:"La question 3 est ambiguë — 'précisez la nature' devrait être reformulé.", number:2 },
  { id:3, top:"58%", type:"err", text:"Erreur dans l'énoncé", detail:"Exercice II : les coordonnées de B semblent incorrectes. À vérifier avec l'original.", number:3 },
  { id:4, top:"78%", type:"note", text:"Note positive", detail:"Exercice III bien structuré, format correct, barème équilibré.", number:4 },
];

const CRITERIA = [
  {
    section:"Conformité au programme",
    items:[
      { id:"c1", label:"Contenu officiel", desc:"Correspond au programme national BAC", max:5, val:5 },
      { id:"c2", label:"Niveau adapté", desc:"Difficulté appropriée à l'examen", max:5, val:4 },
      { id:"c3", label:"Barème cohérent", desc:"Total de points = total de l'examen", max:3, val:3 },
    ]
  },
  {
    section:"Qualité du document",
    items:[
      { id:"c4", label:"Lisibilité", desc:"Texte et formules clairement lisibles", max:5, val:4 },
      { id:"c5", label:"Formules mathématiques", desc:"Notation correcte, symboles lisibles", max:5, val:3 },
      { id:"c6", label:"Mise en page", desc:"Structure logique, sections claires", max:3, val:3 },
    ]
  },
  {
    section:"Authenticité",
    items:[
      { id:"c7", label:"Sujet original", desc:"Pas de doublon dans la base", max:5, val:5 },
      { id:"c8", label:"Droits respectés", desc:"Pas de violation de droits d'auteur", max:3, val:3 },
    ]
  },
];

const CHECKLIST_ITEMS = [
  "Titre complet et précis (matière, type, année, série)",
  "Pages complètes (début et fin du sujet)",
  "Toutes les questions numérotées correctement",
  "Barème total correspond au sujet officiel",
  "Aucune page manquante ou illisible",
  "Fichier PDF haute résolution (>200dpi)",
  "Pas de mentions manuscrites visibles",
  "Instructions générales présentes",
];

const AI_FINDINGS = [
  { dot:"var(--green)", text:"Score de conformité programme : 94% — très bon" },
  { dot:"var(--green)", text:"Aucun doublon détecté dans la base de données" },
  { dot:"var(--gold)", text:"Formule à la page 2, exercice II — vérification recommandée" },
  { dot:"var(--rose)", text:"Résolution image faible détectée sur page 3 (148dpi)" },
  { dot:"var(--blue)", text:"Sujet similaire de 2023 disponible pour comparaison" },
];

export default function MahAIVerificateur() {
  const [activeItem, setActiveItem]     = useState(1);
  const [qFilter, setQFilter]           = useState("all");
  const [scores, setScores]             = useState({ c1:5, c2:4, c3:3, c4:4, c5:3, c6:3, c7:5, c8:3 });
  const [checks, setChecks]             = useState(new Set([0,1,2,3,4,6,7]));
  const [comment, setComment]           = useState("");
  const [annMode, setAnnMode]           = useState(false);
  const [modal, setModal]               = useState(null); // "approve"|"revise"|"reject"
  const [toast, setToast]               = useState({ show:false, msg:"" });
  const [barWidths, setBarWidths]       = useState({});
  const [ringOffset, setRingOffset]     = useState(138.2);
  const [navTab, setNavTab]             = useState("validation");

  useEffect(()=>{
    const s=document.createElement("style"); s.textContent=CSS; document.head.appendChild(s);
    return ()=>document.head.removeChild(s);
  },[]);

  // Animate scores on mount
  useEffect(()=>{
    const t=setTimeout(()=>{
      const newWidths={};
      CRITERIA.forEach(section=>section.items.forEach(item=>{
        newWidths[item.id]=(item.val/item.max)*100;
      }));
      setBarWidths(newWidths);
      // ring
      const total=CRITERIA.flatMap(s=>s.items).reduce((sum,c)=>sum+c.val,0);
      const maxTotal=CRITERIA.flatMap(s=>s.items).reduce((sum,c)=>sum+c.max,0);
      const pct=total/maxTotal;
      setRingOffset(138.2-(138.2*pct));
    },500);
    return ()=>clearTimeout(t);
  },[]);

  const showToast=(msg)=>{ setToast({show:true,msg}); setTimeout(()=>setToast({show:false,msg:""}),2800); };

  const totalScore = CRITERIA.flatMap(s=>s.items).reduce((sum,c)=>sum+(scores[c.id]||0),0);
  const maxScore   = CRITERIA.flatMap(s=>s.items).reduce((sum,c)=>sum+c.max,0);
  const scorePct   = Math.round((totalScore/maxScore)*100);
  const recommendation = scorePct>=80?"Approuver":scorePct>=60?"Demander révisions":"Rejeter";
  const recColor = scorePct>=80?"var(--green)":scorePct>=60?"var(--gold)":"var(--rose)";

  const setScore=(id, val)=>{
    setScores(p=>({...p,[id]:val}));
    // recalc ring
    const newScores={...scores,[id]:val};
    const total=CRITERIA.flatMap(s=>s.items).reduce((sum,c)=>sum+(newScores[c.id]||0),0);
    const pct=total/maxScore;
    setRingOffset(138.2-(138.2*pct));
    // recalc bars
    setBarWidths(p=>({...p,[id]:(val/CRITERIA.flatMap(s=>s.items).find(c=>c.id===id).max)*100}));
  };

  const toggleCheck=(i)=>setChecks(prev=>{const n=new Set(prev); n.has(i)?n.delete(i):n.add(i); return n;});

  const filteredQueue = qFilter==="all" ? QUEUE
    : qFilter==="urgent" ? QUEUE.filter(q=>q.priority==="urgent")
    : QUEUE.filter(q=>q.priority===qFilter);

  const current = QUEUE.find(q=>q.id===activeItem);

  const annStyle=(type)=>({
    ok: { cls:"ann-ok",   icon:"✓" },
    warn:{ cls:"ann-warn", icon:"!" },
    err: { cls:"ann-err",  icon:"✕" },
    note:{ cls:"ann-note", icon:"i" },
  }[type]);

  const getModalConfig=()=>({
    approve:{ icon:"✅", title:"Approuver ce sujet", sub:"Le sujet sera publié immédiatement dans le catalogue. Le contributeur sera notifié.", color:"var(--green)", gain:"+9 000 Ar", btnLabel:"✅ Confirmer l'approbation", btnStyle:"linear-gradient(135deg,var(--green),var(--teal2))", btnColor:"var(--bg)" },
    revise:{ icon:"📝", title:"Demander des révisions", sub:"Le contributeur recevra tes annotations et commentaires pour corriger le sujet.", color:"var(--gold)", gain:"+4 500 Ar", btnLabel:"📝 Envoyer les révisions", btnStyle:"linear-gradient(135deg,var(--gold),var(--orange))", btnColor:"var(--bg)" },
    reject:{ icon:"❌", title:"Rejeter ce sujet", sub:"Le contributeur sera notifié avec la raison du rejet. Il pourra soumettre une nouvelle version.", color:"var(--rose)", gain:"+2 250 Ar", btnLabel:"❌ Confirmer le rejet", btnStyle:"linear-gradient(135deg,var(--rose),#C0304A)", btnColor:"#fff" },
  }[modal]||{});

  return (
    <div style={{height:"100vh",overflow:"hidden"}}>
      <div className="mesh"><span/><span/></div>

      {/* ── NAV ── */}
      <nav>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <div className="nav-logo">Mah.AI</div>
          <div className="nav-role">👁 Vérificateur certifié</div>
        </div>
        <div className="nav-center">
          {["validation","historique","statistiques"].map(t=>(
            <button key={t} className={`nav-tab ${navTab===t?"on":""}`} onClick={()=>setNavTab(t)}>
              {t==="validation"?"✅ Validation":t==="historique"?"📋 Historique":"📊 Statistiques"}
            </button>
          ))}
        </div>
        <div className="nav-right">
          <div className="nav-earnings">💚 38 250 Ar ce mois</div>
          <div className="nav-queue" onClick={()=>showToast("📬 File d'attente mise à jour")}>
            📬 {QUEUE.length} en attente
          </div>
          <div className="nav-avatar">🧑‍💼</div>
        </div>
      </nav>

      <div className="app">

        {/* ── LEFT: QUEUE ── */}
        <aside className="queue-panel">
          <div className="qp-header">
            <div className="qp-title">
              File d'attente
              <span className="qp-count">{QUEUE.filter(q=>q.priority==="urgent").length} urgent{QUEUE.filter(q=>q.priority==="urgent").length>1?"s":""}</span>
            </div>
            <div className="qp-filters">
              {[["all","Tous"],["urgent","Urgents"],["normal","Normal"]].map(([val,label])=>(
                <button key={val} className={`qf ${qFilter===val?"on":""}`} onClick={()=>setQFilter(val)}>{label}</button>
              ))}
            </div>
          </div>

          <div className="qp-list">
            {filteredQueue.map((item,i)=>(
              <div key={item.id}
                className={`queue-item qi-${item.priority} ${activeItem===item.id?"active":""}`}
                style={{animationDelay:`${i*0.04}s`}}
                onClick={()=>setActiveItem(item.id)}>
                <div className="qi-inner">
                  <div className="qi-top">
                    <span className="qi-emoji">{item.emoji}</span>
                    <div className="qi-info">
                      <div className="qi-title">{item.title}</div>
                      <div className="qi-contrib">par {item.contrib}</div>
                    </div>
                    <span className={`qi-badge ${item.priority==="urgent"?"qb-urgent":item.priority==="normal"?"qb-normal":"qb-low"}`}>
                      {item.priority==="urgent"?"🔴 URGENT":item.priority==="normal"?"🟢 Normal":"⚪ Faible"}
                    </span>
                  </div>
                  <div className="qi-bottom">
                    <span className="qi-tag">{item.type}</span>
                    <span className="qi-tag">{item.matiere}</span>
                    <span className="qi-tag">{item.year}</span>
                    <span className="qi-time">{item.time}</span>
                  </div>
                  <div className="qi-ai-score">
                    <span className="ai-score-label">Score IA</span>
                    <div className="ai-score-bar-track">
                      <div className="ai-score-bar-fill" style={{
                        width:`${item.aiScore}%`,
                        background:item.aiScore>=80?"var(--green)":item.aiScore>=60?"var(--gold)":"var(--rose)"
                      }}/>
                    </div>
                    <span className="ai-score-val" style={{color:item.aiScore>=80?"var(--green)":item.aiScore>=60?"var(--gold)":"var(--rose)"}}>
                      {item.aiScore}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="qp-stats">
            {[
              { num:"47", label:"validés ce mois", color:"var(--green)" },
              { num:"3", label:"rejetés", color:"var(--rose)" },
              { num:"4.9★", label:"ta note", color:"var(--gold)" },
            ].map(s=>(
              <div key={s.label} className="qs-mini">
                <div className="qs-mini-num" style={{color:s.color}}>{s.num}</div>
                <div className="qs-mini-label">{s.label}</div>
              </div>
            ))}
          </div>
        </aside>

        {/* ── CENTER: DOCUMENT ── */}
        <main className="doc-viewer">
          <div className="dv-topbar">
            <div className="dv-title-wrap">
              <div className="dv-title">{current?.emoji} {current?.title}</div>
              <div className="dv-meta">Soumis par <strong>{current?.contrib}</strong> · {current?.time} · Score IA : <span style={{color:current?.aiScore>=80?"var(--green)":current?.aiScore>=60?"var(--gold)":"var(--rose)"}}>{current?.aiScore}%</span></div>
            </div>
            <div className="dv-actions">
              <button className="dv-action" onClick={()=>showToast("📄 PDF téléchargé")}>⬇ PDF original</button>
              <button className="dv-action" onClick={()=>showToast("🔍 Comparaison 2023 ouverte")}>⚖ Comparer</button>
              <button className={`dv-action ${annMode?"on":""}`} onClick={()=>setAnnMode(v=>!v)}>
                ✏ {annMode?"Annoter activé":"Annoter"}
              </button>
            </div>
          </div>

          <div className="dv-toolbar">
            <button className="tool-btn" onClick={()=>showToast("Zoom −")}>−</button>
            <span className="tool-label" style={{fontSize:11,fontFamily:"var(--mono)",color:"var(--muted)"}}>100%</span>
            <button className="tool-btn" onClick={()=>showToast("Zoom +")}>+</button>
            <div className="tool-sep"/>
            {["✓","!","✕","i"].map((sym,i)=>(
              <button key={i} className="tool-btn" onClick={()=>setAnnMode(true)} title={["Correct","Avertissement","Erreur","Note"][i]}>{sym}</button>
            ))}
            <div className="tool-sep"/>
            <button className="tool-btn" onClick={()=>showToast("🖨 Impression")}>🖨</button>
            {annMode && (
              <div className="annotation-mode">
                <span/>Mode annotation actif
              </div>
            )}
          </div>

          <div className="dv-content">
            {/* Page 1 */}
            <div className="doc-page" style={{animationDelay:"0s"}}>
              <div className="page-num">Page 1 / 6</div>

              {/* Annotations */}
              {ANNOTATIONS.slice(0,2).map(ann=>{
                const st=annStyle(ann.type);
                return (
                  <div key={ann.id} className="annotation" style={{top:ann.top}}>
                    <div className="ann-line" style={{color:ann.type==="ok"?"var(--green)":ann.type==="warn"?"var(--gold)":ann.type==="err"?"var(--rose)":"var(--blue)"}}/>
                    <div className={`ann-pin ${st.cls}`}>{ann.number}</div>
                    <div className="ann-tooltip">
                      <div className="ann-tooltip-title">{ann.text}</div>
                      {ann.detail}
                    </div>
                  </div>
                );
              })}

              <div className="doc-heading">{current?.title}</div>
              <div className="doc-meta-row">
                {[["BAC","teal"],["Mathématiques","gold"],["Série C & D","rose"],["2024","muted"],["Durée : 4h","muted"]].map(([label,color])=>(
                  <span key={label} className="doc-badge" style={{
                    background:`rgba(${color==="teal"?"10,255,224":color==="gold"?"255,209,102":color==="rose"?"255,107,157":"255,255,255"},.07)`,
                    borderColor:`rgba(${color==="teal"?"10,255,224":color==="gold"?"255,209,102":color==="rose"?"255,107,157":"255,255,255"},.2)`,
                    color:`var(--${color})`
                  }}>{label}</span>
                ))}
              </div>

              <div className="doc-text">
                <p>La calculatrice est autorisée. Le candidat traitera les trois exercices dans l'ordre de son choix. Chaque exercice est indépendant.</p>
                <p>La présentation, la lisibilité, l'orthographe et la qualité de la rédaction sont pris en compte et peuvent faire l'objet d'une pénalisation allant jusqu'à 2 points sur l'ensemble du devoir.</p>
              </div>

              <div className="doc-exercise">
                <div className="doc-ex-num">Exercice I — Analyse (8 points)</div>
                <div className="doc-ex-title">Soit f la fonction définie sur ℝ par :</div>
                <span className="doc-math">f(x) = x³ − 6x² + 9x + 2</span>
                <div className="doc-question">
                  <span className="doc-q-num">1.</span>
                  <span><span className="doc-highlight hl-green">Calculer f'(x) et factoriser le résultat.</span></span>
                </div>
                <div className="doc-question">
                  <span className="doc-q-num">2.</span>
                  <span>Dresser le tableau de variation de f sur ℝ.</span>
                </div>
                <div className="doc-question">
                  <span className="doc-q-num">3.</span>
                  <span><span className="doc-highlight hl-gold">Déterminer les extrema de f. Préciser leur nature et les coordonnées des points.</span></span>
                </div>
                <div className="doc-question">
                  <span className="doc-q-num">4.</span>
                  <span>Écrire l'équation de la tangente à la courbe au point d'abscisse x = 1.</span>
                </div>
              </div>
            </div>

            {/* Page 2 */}
            <div className="doc-page" style={{animationDelay:".06s"}}>
              <div className="page-num">Page 2 / 6</div>

              {ANNOTATIONS.slice(2).map(ann=>{
                const st=annStyle(ann.type);
                return (
                  <div key={ann.id} className="annotation" style={{top:ann.top}}>
                    <div className="ann-line" style={{color:ann.type==="ok"?"var(--green)":ann.type==="warn"?"var(--gold)":ann.type==="err"?"var(--rose)":"var(--blue)"}}/>
                    <div className={`ann-pin ${st.cls}`}>{ann.number}</div>
                    <div className="ann-tooltip">
                      <div className="ann-tooltip-title">{ann.text}</div>
                      {ann.detail}
                    </div>
                  </div>
                );
              })}

              <div className="doc-exercise">
                <div className="doc-ex-num">Exercice II — Géométrie dans l'espace (6 points)</div>
                <div className="doc-text">
                  <p>Dans l'espace rapporté à un repère orthonormé (O, i, j, k), on donne les points :</p>
                </div>
                <span className="doc-math">A(1 ; 2 ; −1) &nbsp;&nbsp; <span className="doc-highlight hl-rose">B(3 ; 0 ; 2)</span> &nbsp;&nbsp; C(−1 ; 4 ; 0)</span>
                <div className="doc-question"><span className="doc-q-num">1.</span><span>Calculer les coordonnées des vecteurs AB⃗ et AC⃗.</span></div>
                <div className="doc-question"><span className="doc-q-num">2.</span><span>Déterminer une équation cartésienne du plan (ABC).</span></div>
                <div className="doc-question"><span className="doc-q-num">3.</span><span>Calculer la distance du point D(2 ; 1 ; 0) au plan (ABC).</span></div>
              </div>

              <div className="doc-exercise">
                <div className="doc-ex-num">Exercice III — Probabilités (6 points)</div>
                <div className="doc-text">
                  <p>Une urne contient 4 boules rouges et 6 boules bleues, indiscernables au toucher. On tire successivement et sans remise 2 boules de l'urne.</p>
                </div>
                <div className="doc-question"><span className="doc-q-num">1.</span><span>Calculer la probabilité d'obtenir une boule rouge au premier tirage.</span></div>
                <div className="doc-question"><span className="doc-q-num">2.</span><span>Calculer la probabilité que les 2 boules tirées soient de la même couleur.</span></div>
                <div className="doc-question"><span className="doc-q-num">3.</span><span>Soit X la variable aléatoire égale au nombre de boules rouges obtenues. Déterminer la loi de probabilité de X et calculer son espérance mathématique E(X).</span></div>
              </div>
            </div>
          </div>
        </main>

        {/* ── RIGHT: EVAL PANEL ── */}
        <aside className="eval-panel">
          <div className="ep-header">
            <div className="ep-title">Grille d'évaluation</div>
            <div className="ep-sub">Cliquer sur les points pour noter chaque critère</div>
          </div>

          <div className="ep-scroll">

            {/* AI pre-analysis */}
            <div className="ai-pre-card">
              <div className="apc-header">
                <div className="apc-orb">🤖</div>
                <div>
                  <div className="apc-title">Analyse IA automatique</div>
                  <div className="apc-label">Score IA : {current?.aiScore}%</div>
                </div>
              </div>
              {AI_FINDINGS.map((f,i)=>(
                <div key={i} className="apc-finding">
                  <div className="apc-dot" style={{background:f.dot}}/>
                  {f.text}
                </div>
              ))}
            </div>

            {/* Overall score ring */}
            <div className="overall-score">
              <div className="os-ring">
                <svg width="56" height="56" viewBox="0 0 44 44">
                  <circle className="os-ring-bg" cx="22" cy="22" r="18"/>
                  <circle className="os-ring-fill" cx="22" cy="22" r="18"
                    stroke={scorePct>=80?"var(--green)":scorePct>=60?"var(--gold)":"var(--rose)"}
                    strokeDashoffset={ringOffset}/>
                </svg>
                <div className="os-val" style={{color:scorePct>=80?"var(--green)":scorePct>=60?"var(--gold)":"var(--rose)",fontSize:13}}>
                  {scorePct}%
                </div>
              </div>
              <div className="os-right">
                <div className="os-label">Score global : {totalScore}/{maxScore}</div>
                <div style={{fontSize:11,color:"var(--muted)",fontFamily:"var(--mono)",marginTop:2}}>Recommandation IA :</div>
                <div className="os-rec" style={{borderColor:recColor,color:recColor,background:`${recColor}11`}}>
                  {recommendation}
                </div>
              </div>
            </div>

            {/* Criteria */}
            {CRITERIA.map((section,si)=>(
              <div key={si} className="crit-section">
                <div className="cs-title">{section.section}</div>
                {section.items.map(crit=>{
                  const val = scores[crit.id]||0;
                  const pct = (val/crit.max)*100;
                  const color = pct>=80?"var(--green)":pct>=50?"var(--gold)":"var(--rose)";
                  return (
                    <div key={crit.id} className="crit-item">
                      <div className="ci-top">
                        <div>
                          <div className="ci-label">{crit.label}</div>
                          <div className="ci-desc">{crit.desc}</div>
                        </div>
                        <div className="ci-score-wrap">
                          {Array.from({length:crit.max}).map((_,i)=>{
                            const filled = i < val;
                            const dotColor = filled ? (pct>=80?"filled-green":pct>=50?"filled-gold":"filled-rose") : "";
                            return (
                              <div key={i} className={`score-dot ${dotColor}`}
                                onClick={()=>setScore(crit.id, i+1===val ? i : i+1)}>
                                {filled ? "●" : "○"}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="ci-bar">
                        <div className="ci-bar-fill" style={{width:`${barWidths[crit.id]||0}%`,background:color}}/>
                      </div>
                      <div className="ci-note">
                        <span>{crit.label}</span>
                        <span style={{color}}>{val}/{crit.max}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Checklist */}
            <div className="checklist">
              <div className="cl-title">✅ Checklist de validation</div>
              {CHECKLIST_ITEMS.map((item,i)=>(
                <div key={i} className="cl-item" onClick={()=>toggleCheck(i)}>
                  <div className={`cl-check ${checks.has(i)?"on":""}`}>{checks.has(i)?"✓":""}</div>
                  <div className={`cl-text ${checks.has(i)?"checked":""}`}>{item}</div>
                </div>
              ))}
            </div>

          </div>

          {/* Comment */}
          <div className="ep-comment">
            <div className="ec-label">Commentaire pour le contributeur</div>
            <textarea className="ec-textarea"
              placeholder="Explique ce qui doit être corrigé ou amélioré..."
              value={comment}
              onChange={e=>setComment(e.target.value)}
            />
          </div>

          {/* Decision */}
          <div className="ep-decision">
            <div className="decision-meta">
              {checks.size}/{CHECKLIST_ITEMS.length} points cochés · Score {scorePct}%
            </div>
            <button className="btn-approve" onClick={()=>setModal("approve")}>
              ✅ Approuver et publier
            </button>
            <button className="btn-revise" onClick={()=>setModal("revise")}>
              📝 Demander des révisions
            </button>
            <button className="btn-reject" onClick={()=>setModal("reject")}>
              ❌ Rejeter le sujet
            </button>
          </div>
        </aside>
      </div>

      {/* ── MODAL ── */}
      {modal && (()=>{
        const cfg = getModalConfig();
        return (
          <div className="modal-overlay" onClick={e=>{if(e.target===e.currentTarget)setModal(null)}}>
            <div className="modal">
              <button className="modal-close" onClick={()=>setModal(null)}>×</button>
              <div className="modal-icon">{cfg.icon}</div>
              <div className="modal-title" style={{color:cfg.color}}>{cfg.title}</div>
              <div className="modal-sub">{cfg.sub}</div>

              <div className="modal-summary">
                {[
                  ["Sujet",`${current?.emoji} ${current?.title}`],
                  ["Contributeur",current?.contrib],
                  ["Score évaluation",`${scorePct}% (${totalScore}/${maxScore} pts)`],
                  ["Éléments cochés",`${checks.size}/${CHECKLIST_ITEMS.length}`],
                  ["Annotations",`${ANNOTATIONS.length} annotation(s)`],
                ].map(([label,val])=>(
                  <div key={label} className="ms-row">
                    <span className="ms-label">{label}</span>
                    <span className="ms-val" style={{fontSize:11}}>{val}</span>
                  </div>
                ))}
              </div>

              <div className="modal-gain">
                <div className="mg-label">💚 TON GAIN POUR CETTE VALIDATION</div>
                <div className="mg-amount">{cfg.gain}</div>
                <div className="mg-sub">Versé via MVola sous 24h</div>
              </div>

              <button className="btn-confirm" style={{background:cfg.btnStyle,color:cfg.btnColor}}
                onClick={()=>{
                  setModal(null);
                  showToast(`${cfg.icon} ${cfg.title} — ${current?.title}`);
                  setTimeout(()=>setActiveItem(QUEUE[(QUEUE.findIndex(q=>q.id===activeItem)+1)%QUEUE.length].id),500);
                }}>
                {cfg.btnLabel}
              </button>
              <button className="btn-cancel" onClick={()=>setModal(null)}>Annuler</button>
            </div>
          </div>
        );
      })()}

      <div className={`toast ${toast.show?"show":""}`}>
        <span style={{fontSize:16}}>✨</span><span>{toast.msg}</span>
      </div>
    </div>
  );
}
