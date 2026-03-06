import { useState, useEffect, useRef, useCallback } from "react";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,700;12..96,800&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --teal:#0AFFE0;--teal2:#00C9A7;--green:#00FF88;--gold:#FFD166;
    --rose:#FF6B9D;--blue:#4F8EF7;--purple:#A78BFA;--orange:#FF9F43;
    --red:#FF4444;
    --bg:#060910;--bg2:#0C1220;--bg3:#111928;--bg4:#080E1C;
    --border:rgba(255,255,255,.07);--border2:rgba(10,255,224,.22);
    --text:#F0F4FF;--muted:#6B7899;--muted2:#3A4560;
    --font:'Bricolage Grotesque',sans-serif;--mono:'DM Mono',monospace;
    --r:16px;
  }
  html{scroll-behavior:smooth}
  body{font-family:var(--font);background:var(--bg);color:var(--text);overflow-x:hidden;-webkit-font-smoothing:antialiased}
  ::-webkit-scrollbar{width:4px}
  ::-webkit-scrollbar-track{background:var(--bg)}
  ::-webkit-scrollbar-thumb{background:var(--teal2);border-radius:2px}
  body::before{content:'';position:fixed;inset:0;z-index:0;opacity:.4;pointer-events:none;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")}

  .mesh{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden}
  .mesh span{position:absolute;border-radius:50%;filter:blur(140px);opacity:.07;animation:fm 22s ease-in-out infinite alternate}
  .mesh span:nth-child(1){width:500px;height:500px;top:-100px;left:-100px;background:var(--blue);animation-delay:0s}
  .mesh span:nth-child(2){width:400px;height:400px;bottom:-50px;right:-50px;background:var(--teal);animation-delay:-9s}
  .mesh span:nth-child(3){width:300px;height:300px;top:40%;right:20%;background:var(--purple);animation-delay:-16s}
  @keyframes fm{0%{transform:translate(0,0)}100%{transform:translate(20px,-15px)}}

  /* ── TOPBAR EXAM ── */
  .exam-topbar{
    position:fixed;top:0;left:0;right:0;z-index:100;
    background:rgba(6,9,16,.9);backdrop-filter:blur(24px);
    border-bottom:1px solid var(--border);
    padding:0 32px;height:60px;
    display:flex;align-items:center;justify-content:space-between;gap:20px;
  }
  .et-left{display:flex;align-items:center;gap:16px}
  .et-logo{font-size:18px;font-weight:800;letter-spacing:-1px;background:linear-gradient(135deg,var(--teal),var(--green));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
  .et-title{font-size:13px;font-weight:600;color:var(--muted);max-width:280px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .et-sep{width:1px;height:24px;background:var(--border)}

  /* ── TIMER ── */
  .timer-wrap{display:flex;align-items:center;gap:12px}
  .timer-ring{position:relative;flex-shrink:0}
  .timer-ring svg{transform:rotate(-90deg)}
  .ring-bg{fill:none;stroke:rgba(255,255,255,.07);stroke-width:4}
  .ring-fill{fill:none;stroke-width:4;stroke-linecap:round;stroke-dasharray:138.2;transition:stroke-dashoffset 1s linear,stroke .5s}
  .timer-num{
    position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
    font-family:var(--mono);font-size:13px;font-weight:700;
  }
  .timer-label{font-size:11px;color:var(--muted);font-family:var(--mono)}
  .timer-digits{font-size:22px;font-weight:800;letter-spacing:-1px;font-family:var(--mono)}
  .timer-danger{color:var(--red);animation:dangerPulse 1s ease-in-out infinite}
  @keyframes dangerPulse{0%,100%{opacity:1}50%{opacity:.5}}

  .et-center{flex:1;display:flex;justify-content:center}
  .progress-track{height:4px;background:rgba(255,255,255,.07);border-radius:2px;width:100%;max-width:300px;overflow:hidden}
  .progress-fill{height:100%;border-radius:2px;background:linear-gradient(90deg,var(--teal),var(--green));transition:width .5s ease}

  .et-right{display:flex;align-items:center;gap:10px}
  .btn-pause{background:var(--bg2);border:1px solid var(--border);color:var(--muted);padding:7px 14px;border-radius:9px;font-family:var(--font);font-size:13px;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:6px}
  .btn-pause:hover{border-color:var(--border2);color:var(--text)}
  .btn-submit-exam{background:linear-gradient(135deg,var(--teal),var(--teal2));color:var(--bg);border:none;padding:8px 18px;border-radius:9px;font-family:var(--font);font-size:13px;font-weight:700;cursor:pointer;transition:transform .2s,box-shadow .25s;display:flex;align-items:center;gap:6px}
  .btn-submit-exam:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(10,255,224,.3)}

  /* ── PAUSE OVERLAY ── */
  .pause-overlay{
    position:fixed;inset:0;z-index:200;
    background:rgba(6,9,16,.92);backdrop-filter:blur(16px);
    display:flex;align-items:center;justify-content:center;
    animation:fadeIn .3s ease;
  }
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  .pause-card{background:var(--bg2);border:1px solid var(--border2);border-radius:24px;padding:48px 56px;text-align:center;animation:popIn .4s cubic-bezier(.34,1.56,.64,1)}
  @keyframes popIn{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:scale(1)}}
  .pause-icon{font-size:56px;margin-bottom:20px}
  .pause-title{font-size:28px;font-weight:800;letter-spacing:-1px;margin-bottom:8px}
  .pause-sub{font-size:14px;color:var(--muted);margin-bottom:32px}
  .btn-resume{background:linear-gradient(135deg,var(--teal),var(--teal2));color:var(--bg);border:none;padding:14px 40px;border-radius:12px;font-family:var(--font);font-size:16px;font-weight:800;cursor:pointer;margin-bottom:12px;transition:transform .2s,box-shadow .25s;display:block;width:100%}
  .btn-resume:hover{transform:translateY(-2px);box-shadow:0 12px 36px rgba(10,255,224,.35)}
  .btn-abandon{background:transparent;border:1px solid var(--border);color:var(--muted);padding:12px 40px;border-radius:12px;font-family:var(--font);font-size:14px;cursor:pointer;width:100%;transition:all .2s}
  .btn-abandon:hover{border-color:rgba(255,68,68,.3);color:var(--red)}

  /* ── MAIN LAYOUT ── */
  .exam-wrap{padding-top:60px;min-height:100vh;display:grid;grid-template-columns:260px 1fr 240px;gap:0}

  /* ── LEFT: Question nav ── */
  .q-nav{
    border-right:1px solid var(--border);
    padding:24px 16px;
    position:sticky;top:60px;height:calc(100vh - 60px);
    overflow-y:auto;
    background:rgba(6,9,16,.6);
    backdrop-filter:blur(10px);
  }
  .q-nav-title{font-size:11px;color:var(--muted);font-family:var(--mono);letter-spacing:.12em;text-transform:uppercase;margin-bottom:14px;padding:0 4px}
  .q-nav-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:20px}
  .q-dot{
    aspect-ratio:1;border-radius:9px;display:flex;align-items:center;justify-content:center;
    font-size:12px;font-weight:700;font-family:var(--mono);cursor:pointer;
    border:1px solid var(--border);background:var(--bg2);color:var(--muted);
    transition:all .2s;
  }
  .q-dot:hover{border-color:rgba(255,255,255,.2);color:var(--text)}
  .q-dot.current{background:rgba(10,255,224,.1);border-color:var(--teal2);color:var(--teal)}
  .q-dot.answered{background:rgba(0,255,136,.08);border-color:rgba(0,255,136,.25);color:var(--green)}
  .q-dot.flagged{background:rgba(255,209,102,.08);border-color:rgba(255,209,102,.25);color:var(--gold)}
  .q-dot.answered.flagged{background:rgba(255,209,102,.08);border-color:rgba(255,209,102,.25);color:var(--gold)}

  .q-legend{display:flex;flex-direction:column;gap:7px;padding:14px;background:var(--bg2);border:1px solid var(--border);border-radius:12px;margin-bottom:16px}
  .q-leg-item{display:flex;align-items:center;gap:8px;font-size:11px;color:var(--muted);font-family:var(--mono)}
  .q-leg-dot{width:10px;height:10px;border-radius:4px;flex-shrink:0}

  .q-stats{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  .qs-card{background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:10px 12px;text-align:center}
  .qs-num{font-size:20px;font-weight:800;letter-spacing:-1px}
  .qs-label{font-size:10px;color:var(--muted);font-family:var(--mono);margin-top:2px}

  /* ── CENTER: Question content ── */
  .q-main{padding:32px 36px;position:relative;z-index:1;overflow-y:auto;max-height:calc(100vh - 60px)}

  .q-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:28px;animation:slideDown .4s ease both}
  @keyframes slideDown{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}
  .q-label{font-size:11px;color:var(--teal);font-family:var(--mono);letter-spacing:.1em;text-transform:uppercase;margin-bottom:8px}
  .q-number{font-size:32px;font-weight:800;letter-spacing:-1.5px;line-height:1}
  .q-pts{font-size:12px;color:var(--muted);font-family:var(--mono);margin-top:4px}
  .q-flag-btn{
    display:flex;align-items:center;gap:6px;padding:7px 14px;border-radius:9px;
    background:transparent;border:1px solid var(--border);color:var(--muted);
    font-family:var(--font);font-size:12px;cursor:pointer;transition:all .2s;flex-shrink:0;
  }
  .q-flag-btn:hover,.q-flag-btn.on{background:rgba(255,209,102,.08);border-color:rgba(255,209,102,.25);color:var(--gold)}

  /* Question box */
  .q-box{
    background:var(--bg2);border:1px solid var(--border);border-radius:var(--r);
    padding:28px;margin-bottom:24px;position:relative;overflow:hidden;
    animation:slideUp .45s ease both;
  }
  @keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  .q-box::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--blue),transparent)}
  .q-context{font-size:13px;color:var(--muted);font-family:var(--mono);background:var(--bg3);border-left:3px solid var(--blue);border-radius:0 8px 8px 0;padding:12px 16px;margin-bottom:18px;line-height:1.6}
  .q-text{font-size:17px;font-weight:600;line-height:1.7;color:var(--text);letter-spacing:-.1px}
  .q-text .math{font-family:var(--mono);color:var(--teal);background:rgba(10,255,224,.07);padding:2px 6px;border-radius:5px;font-size:15px}
  .q-sub{font-size:13px;color:var(--muted);margin-top:10px;line-height:1.6}

  /* Choices (MCQ) */
  .choices{display:flex;flex-direction:column;gap:10px;margin-bottom:24px;animation:slideUp .45s .08s ease both}
  .choice{
    display:flex;align-items:flex-start;gap:14px;padding:16px 18px;
    background:var(--bg2);border:1px solid var(--border);border-radius:12px;
    cursor:pointer;transition:all .22s;position:relative;overflow:hidden;
  }
  .choice::before{content:'';position:absolute;inset:0;opacity:0;background:radial-gradient(circle at var(--mx,50%) var(--my,50%),rgba(10,255,224,.05),transparent 60%);transition:opacity .3s;pointer-events:none}
  .choice:hover{border-color:rgba(255,255,255,.15);transform:translateX(3px)}
  .choice:hover::before{opacity:1}
  .choice.selected{background:rgba(10,255,224,.06);border-color:var(--teal2)}
  .choice.selected .choice-letter{background:var(--teal);color:var(--bg);border-color:var(--teal)}
  .choice-letter{
    width:32px;height:32px;border-radius:9px;border:1px solid var(--border);
    background:var(--bg3);display:flex;align-items:center;justify-content:center;
    font-size:13px;font-weight:700;font-family:var(--mono);flex-shrink:0;
    transition:all .2s;color:var(--muted);margin-top:1px;
  }
  .choice-text{font-size:14px;line-height:1.6;color:var(--text)}
  .choice-text .math{font-family:var(--mono);color:var(--teal);background:rgba(10,255,224,.07);padding:1px 5px;border-radius:4px;font-size:13px}

  /* Open answer */
  .answer-area{margin-bottom:24px;animation:slideUp .45s .08s ease both}
  .answer-label{font-size:11px;color:var(--muted);font-family:var(--mono);letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px}
  .answer-textarea{
    width:100%;min-height:140px;background:var(--bg2);border:1px solid var(--border);border-radius:12px;
    padding:16px 18px;color:var(--text);font-family:var(--font);font-size:14px;line-height:1.7;
    outline:none;resize:vertical;transition:border-color .2s;
  }
  .answer-textarea:focus{border-color:var(--border2)}
  .answer-textarea::placeholder{color:var(--muted)}
  .answer-toolbar{display:flex;gap:6px;margin-top:8px}
  .atool{background:var(--bg2);border:1px solid var(--border);color:var(--muted);padding:6px 12px;border-radius:8px;font-family:var(--mono);font-size:12px;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:5px}
  .atool:hover{border-color:var(--border2);color:var(--text)}

  /* Nav buttons */
  .q-nav-btns{display:flex;align-items:center;justify-content:space-between;animation:slideUp .45s .16s ease both}
  .btn-prev,.btn-next{display:flex;align-items:center;gap:8px;padding:12px 22px;border-radius:11px;font-family:var(--font);font-size:14px;font-weight:700;cursor:pointer;transition:all .22s}
  .btn-prev{background:transparent;border:1px solid var(--border);color:var(--muted)}
  .btn-prev:hover{border-color:rgba(255,255,255,.2);color:var(--text)}
  .btn-next{background:linear-gradient(135deg,var(--teal),var(--teal2));color:var(--bg);border:none}
  .btn-next:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(10,255,224,.3)}
  .q-counter{font-family:var(--mono);font-size:12px;color:var(--muted)}

  /* ── RIGHT: Info panel ── */
  .info-panel{border-left:1px solid var(--border);padding:24px 18px;position:sticky;top:60px;height:calc(100vh - 60px);overflow-y:auto;background:rgba(6,9,16,.6);backdrop-filter:blur(10px)}
  .ip-section{margin-bottom:20px}
  .ip-title{font-size:11px;color:var(--muted);font-family:var(--mono);letter-spacing:.12em;text-transform:uppercase;margin-bottom:12px}

  /* Scoring card */
  .score-preview{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:14px}
  .sp-row{display:flex;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.04)}
  .sp-row:last-child{border-bottom:none}
  .sp-label{font-size:12px;color:var(--muted)}
  .sp-val{font-family:var(--mono);font-size:13px;font-weight:700}

  /* Chrono mini */
  .chrono-mini{background:linear-gradient(135deg,rgba(10,255,224,.06),var(--bg2));border:1px solid rgba(10,255,224,.15);border-radius:12px;padding:14px;text-align:center}
  .cm-time{font-family:var(--mono);font-size:28px;font-weight:800;letter-spacing:-2px;color:var(--teal)}
  .cm-label{font-size:11px;color:var(--muted);font-family:var(--mono);margin-top:3px}
  .cm-bar-track{height:3px;background:rgba(255,255,255,.06);border-radius:2px;margin-top:10px;overflow:hidden}
  .cm-bar-fill{height:100%;border-radius:2px;transition:width 1s linear,background .5s}

  /* AI hint */
  .ai-hint{background:linear-gradient(135deg,rgba(10,255,224,.04),var(--bg2));border:1px solid rgba(10,255,224,.15);border-radius:12px;padding:14px}
  .ah-header{display:flex;align-items:center;gap:8px;margin-bottom:10px}
  .ah-orb{width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,var(--teal),var(--teal2));display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;position:relative}
  .ah-orb::after{content:'';position:absolute;inset:-2px;border-radius:10px;border:1px solid rgba(10,255,224,.3);animation:op 2s ease-in-out infinite}
  @keyframes op{0%,100%{opacity:1}50%{opacity:.3}}
  .ah-title{font-size:13px;font-weight:700}
  .ah-cost{font-size:10px;color:var(--muted);font-family:var(--mono)}
  .ah-text{font-size:12px;color:var(--muted);line-height:1.6;margin-bottom:10px}
  .btn-hint{width:100%;background:rgba(10,255,224,.08);border:1px solid rgba(10,255,224,.2);color:var(--teal);padding:9px;border-radius:9px;font-family:var(--font);font-size:12px;font-weight:700;cursor:pointer;transition:all .2s}
  .btn-hint:hover{background:rgba(10,255,224,.14)}

  /* ── RESULTS SCREEN ── */
  .results-screen{
    position:fixed;inset:0;z-index:150;
    background:var(--bg);
    overflow-y:auto;
    animation:resultsIn .6s cubic-bezier(.34,1.56,.64,1) both;
  }
  @keyframes resultsIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}

  .results-hero{
    background:linear-gradient(180deg,rgba(10,255,224,.06) 0%,transparent 100%);
    border-bottom:1px solid var(--border);
    padding:60px 40px 48px;text-align:center;position:relative;overflow:hidden;
  }
  .results-hero::before{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:600px;height:1px;background:linear-gradient(90deg,transparent,var(--teal),transparent)}
  .results-glow{position:absolute;width:400px;height:400px;border-radius:50%;background:var(--teal);filter:blur(120px);opacity:.06;top:50%;left:50%;transform:translate(-50%,-50%);animation:glowPulse 3s ease-in-out infinite alternate}
  @keyframes glowPulse{0%{opacity:.04;transform:translate(-50%,-50%) scale(1)}100%{opacity:.1;transform:translate(-50%,-50%) scale(1.1)}}

  .results-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(10,255,224,.08);border:1px solid rgba(10,255,224,.2);color:var(--teal);padding:8px 20px;border-radius:100px;font-family:var(--mono);font-size:12px;margin-bottom:24px}
  .results-score-big{font-size:clamp(72px,12vw,120px);font-weight:800;letter-spacing:-5px;line-height:1;position:relative}
  .results-score-big .score-num{background:linear-gradient(135deg,var(--teal),var(--green));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
  .results-score-big .score-denom{color:var(--muted);font-size:.5em;font-weight:300;vertical-align:super;margin-left:4px}
  .results-mention{font-size:24px;font-weight:700;margin:12px 0 8px;letter-spacing:-.5px}
  .results-sub{font-size:15px;color:var(--muted);max-width:500px;margin:0 auto 32px}

  .results-ctas{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
  .btn-retry{background:linear-gradient(135deg,var(--teal),var(--teal2));color:var(--bg);border:none;padding:14px 32px;border-radius:12px;font-family:var(--font);font-size:15px;font-weight:800;cursor:pointer;transition:transform .2s,box-shadow .25s;display:flex;align-items:center;gap:8px}
  .btn-retry:hover{transform:translateY(-2px);box-shadow:0 12px 36px rgba(10,255,224,.35)}
  .btn-correction{background:transparent;border:1px solid var(--border2);color:var(--text);padding:14px 28px;border-radius:12px;font-family:var(--font);font-size:15px;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:8px}
  .btn-correction:hover{background:rgba(10,255,224,.06)}
  .btn-share{background:transparent;border:1px solid var(--border);color:var(--muted);padding:14px 24px;border-radius:12px;font-family:var(--font);font-size:15px;cursor:pointer;transition:all .2s}
  .btn-share:hover{border-color:rgba(255,255,255,.2);color:var(--text)}

  /* Results grid */
  .results-content{max-width:960px;margin:0 auto;padding:40px 24px 80px}

  .results-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:28px}
  .rg-card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r);padding:18px;text-align:center;animation:cardUp .5s ease both}
  @keyframes cardUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  .rg-icon{font-size:22px;margin-bottom:8px}
  .rg-val{font-size:24px;font-weight:800;letter-spacing:-1px;margin-bottom:4px}
  .rg-label{font-size:11px;color:var(--muted);font-family:var(--mono)}

  /* Per-question results */
  .results-questions{margin-bottom:28px}
  .rq-title{font-size:18px;font-weight:700;letter-spacing:-.5px;margin-bottom:16px}
  .rq-item{display:flex;align-items:flex-start;gap:14px;padding:16px;background:var(--bg2);border:1px solid var(--border);border-radius:12px;margin-bottom:10px;animation:cardUp .5s ease both;cursor:pointer;transition:border-color .2s}
  .rq-item:hover{border-color:rgba(255,255,255,.12)}
  .rq-status{width:32px;height:32px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;margin-top:1px}
  .rq-correct{background:rgba(0,255,136,.1);border:1px solid rgba(0,255,136,.25)}
  .rq-wrong{background:rgba(255,68,68,.08);border:1px solid rgba(255,68,68,.2)}
  .rq-skip{background:rgba(255,255,255,.04);border:1px solid var(--border)}
  .rq-body{flex:1;min-width:0}
  .rq-num{font-size:11px;color:var(--muted);font-family:var(--mono);margin-bottom:4px}
  .rq-text{font-size:13px;font-weight:600;color:var(--text);margin-bottom:6px;line-height:1.4}
  .rq-answer{font-size:12px;font-family:var(--mono)}
  .rq-right{flex-shrink:0;text-align:right}
  .rq-pts{font-family:var(--mono);font-size:14px;font-weight:700}

  /* Radar / matiere breakdown */
  .breakdown-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  .bk-card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r);padding:20px}
  .bk-title{font-size:15px;font-weight:700;margin-bottom:16px}
  .bk-row{display:flex;align-items:center;gap:10px;margin-bottom:10px}
  .bk-label{font-size:12px;color:var(--muted);width:100px;flex-shrink:0;font-family:var(--mono)}
  .bk-bar-track{flex:1;height:6px;background:rgba(255,255,255,.06);border-radius:3px;overflow:hidden}
  .bk-bar-fill{height:100%;border-radius:3px;transition:width 1.4s cubic-bezier(.4,0,.2,1)}
  .bk-pct{font-family:var(--mono);font-size:12px;font-weight:700;width:36px;text-align:right;flex-shrink:0}

  /* Comparison card */
  .cmp-card{background:linear-gradient(135deg,rgba(10,255,224,.05),var(--bg2));border:1px solid rgba(10,255,224,.15);border-radius:var(--r);padding:20px;text-align:center}
  .cmp-vs{display:flex;align-items:center;justify-content:center;gap:24px;margin:16px 0}
  .cmp-you{text-align:center}
  .cmp-score{font-size:40px;font-weight:800;letter-spacing:-2px}
  .cmp-label{font-size:11px;color:var(--muted);font-family:var(--mono);margin-top:4px}
  .cmp-divider{font-size:20px;color:var(--muted)}
  .cmp-avg{text-align:center;opacity:.7}
  .cmp-bar{height:4px;background:rgba(255,255,255,.07);border-radius:2px;overflow:hidden;margin:12px 0 8px}
  .cmp-bar-you{height:100%;border-radius:2px;background:linear-gradient(90deg,var(--teal),var(--green));transition:width 1.5s ease}

  /* Social share */
  .share-card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r);padding:20px}
  .share-preview{background:linear-gradient(135deg,#091A30,var(--bg3));border:1px solid rgba(10,255,224,.15);border-radius:12px;padding:20px;text-align:center;margin:14px 0}
  .share-btns{display:flex;gap:8px;justify-content:center}
  .share-btn{padding:9px 18px;border-radius:9px;border:1px solid var(--border);color:var(--muted);background:transparent;font-family:var(--font);font-size:13px;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:6px}
  .share-btn:hover{border-color:rgba(255,255,255,.2);color:var(--text)}

  /* Confetti particle */
  .confetti-wrap{position:fixed;inset:0;pointer-events:none;z-index:160;overflow:hidden}
  .confetti-p{position:absolute;width:8px;height:8px;border-radius:2px;animation:confettiFall linear both}
  @keyframes confettiFall{
    0%{transform:translateY(-20px) rotate(0deg);opacity:1}
    100%{transform:translateY(100vh) rotate(720deg);opacity:0}
  }

  /* ── TOAST ── */
  .toast{position:fixed;bottom:24px;right:24px;background:var(--bg2);border:1px solid var(--border2);border-radius:14px;padding:13px 20px;display:flex;align-items:center;gap:10px;font-size:14px;box-shadow:0 20px 50px rgba(0,0,0,.5);z-index:300;transition:transform .4s cubic-bezier(.34,1.56,.64,1),opacity .3s;transform:translateY(80px);opacity:0}
  .toast.show{transform:translateY(0);opacity:1}

  @media(max-width:900px){
    .exam-wrap{grid-template-columns:1fr}
    .q-nav,.info-panel{display:none}
    .results-grid{grid-template-columns:repeat(2,1fr)}
    .breakdown-grid{grid-template-columns:1fr}
    nav{padding:12px 16px}
  }
`;

// ── Data ────────────────────────────────────────────────────────
const QUESTIONS = [
  {
    id:1, pts:3, type:"mcq",
    context:"Soit f une fonction définie sur ℝ par f(x) = x³ - 6x² + 9x + 2",
    text:"Quelle est la dérivée f'(x) de cette fonction ?",
    sub:null,
    choices:[
      { letter:"A", text:"f'(x) = 3x² - 12x + 9" },
      { letter:"B", text:"f'(x) = 3x² - 12x" },
      { letter:"C", text:"f'(x) = x² - 12x + 9" },
      { letter:"D", text:"f'(x) = 3x³ - 12x + 9" },
    ],
    correct:"A"
  },
  {
    id:2, pts:3, type:"mcq",
    context:"En utilisant f'(x) = 3x² - 12x + 9 = 3(x-1)(x-3)",
    text:"La fonction f est décroissante sur l'intervalle :",
    sub:null,
    choices:[
      { letter:"A", text:"]-∞ ; 1[" },
      { letter:"B", text:"]1 ; 3[" },
      { letter:"C", text:"]3 ; +∞[" },
      { letter:"D", text:"]0 ; 2[" },
    ],
    correct:"B"
  },
  {
    id:3, pts:4, type:"open",
    context:null,
    text:"Calculez les coordonnées des extrema de f et précisez leur nature (maximum ou minimum local).",
    sub:"Justifiez votre réponse en utilisant le tableau de variations de f'.",
    choices:null,
    correct:null
  },
  {
    id:4, pts:2, type:"mcq",
    context:"On considère les points A(1,2,-1), B(3,0,2) et C(-1,4,0) dans ℝ³",
    text:"Le vecteur AB→ a pour coordonnées :",
    sub:null,
    choices:[
      { letter:"A", text:"(2 ; -2 ; 3)" },
      { letter:"B", text:"(-2 ; 2 ; -3)" },
      { letter:"C", text:"(4 ; 2 ; 1)" },
      { letter:"D", text:"(2 ; 2 ; 3)" },
    ],
    correct:"A"
  },
  {
    id:5, pts:2, type:"mcq",
    context:"Une urne contient 4 boules rouges et 6 boules bleues",
    text:"On tire 1 boule au hasard. Quelle est la probabilité de tirer une boule rouge ?",
    sub:null,
    choices:[
      { letter:"A", text:"4/10 = 2/5" },
      { letter:"B", text:"6/10 = 3/5" },
      { letter:"C", text:"4/6 = 2/3" },
      { letter:"D", text:"1/4" },
    ],
    correct:"A"
  },
  { id:6, pts:3, type:"open", context:null, text:"Calculez la probabilité que les 2 premières boules tirées (sans remise) soient de la même couleur.", sub:"Détaillez le calcul pour chaque cas (rouge-rouge et bleu-bleu).", choices:null, correct:null },
  { id:7, pts:2, type:"mcq", context:"f(x) = x³ - 6x² + 9x + 2", text:"La limite de f(x) quand x → +∞ est :", sub:null, choices:[{letter:"A",text:"+∞"},{letter:"B",text:"-∞"},{letter:"C",text:"2"},{letter:"D",text:"0"}], correct:"A" },
  { id:8, pts:1, type:"mcq", context:null, text:"Le nombre de solutions de l'équation f'(x) = 0 est :", sub:null, choices:[{letter:"A",text:"0"},{letter:"B",text:"1"},{letter:"C",text:"2"},{letter:"D",text:"3"}], correct:"C" },
];

const TOTAL_SECS = 4 * 60 * 60; // 4h
const DEMO_SECS = 240; // 4 min pour la démo

const CONFETTI_COLORS = ["#0AFFE0","#00FF88","#FFD166","#FF6B9D","#A78BFA","#4F8EF7"];

function formatTime(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
  return `${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
}

function Confetti() {
  const particles = Array.from({length:60},(_,i)=>({
    id:i,
    color:CONFETTI_COLORS[i%CONFETTI_COLORS.length],
    left:`${Math.random()*100}%`,
    delay:`${Math.random()*2}s`,
    dur:`${2+Math.random()*2}s`,
    size:`${6+Math.random()*8}px`,
  }));
  return (
    <div className="confetti-wrap">
      {particles.map(p=>(
        <div key={p.id} className="confetti-p" style={{
          background:p.color, left:p.left, width:p.size, height:p.size,
          animationDuration:p.dur, animationDelay:p.delay,
          borderRadius: Math.random()>0.5?"50%":"2px",
        }}/>
      ))}
    </div>
  );
}

export default function MahAIExamenBlanc() {
  const [phase, setPhase] = useState("exam"); // exam | results
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({}); // { qid: answer }
  const [openAnswers, setOpenAnswers] = useState({}); // { qid: text }
  const [flagged, setFlagged] = useState(new Set());
  const [paused, setPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(DEMO_SECS);
  const [toast, setToast] = useState({show:false,msg:""});
  const [resultBars, setResultBars] = useState({});
  const [showConfetti, setShowConfetti] = useState(false);
  const timerRef = useRef(null);

  // Inject CSS
  useEffect(()=>{
    const s = document.createElement("style");
    s.textContent = CSS;
    document.head.appendChild(s);
    return ()=>document.head.removeChild(s);
  },[]);

  // Timer
  useEffect(()=>{
    if(phase!=="exam"||paused) return;
    timerRef.current = setInterval(()=>{
      setTimeLeft(t=>{
        if(t<=1){ clearInterval(timerRef.current); handleSubmit(); return 0; }
        return t-1;
      });
    },1000);
    return ()=>clearInterval(timerRef.current);
  },[phase,paused]);

  // Mouse glow on choices
  useEffect(()=>{
    const fn = e=>{
      document.querySelectorAll(".choice").forEach(c=>{
        const r=c.getBoundingClientRect();
        c.style.setProperty("--mx",`${((e.clientX-r.left)/r.width)*100}%`);
        c.style.setProperty("--my",`${((e.clientY-r.top)/r.height)*100}%`);
      });
    };
    window.addEventListener("mousemove",fn);
    return ()=>window.removeEventListener("mousemove",fn);
  },[]);

  const showToast = msg=>{
    setToast({show:true,msg});
    setTimeout(()=>setToast({show:false,msg:""}),2500);
  };

  const q = QUESTIONS[currentQ];
  const answeredCount = Object.keys(answers).length + Object.keys(openAnswers).filter(k=>openAnswers[k]?.trim()).length;
  const progressPct = (answeredCount/QUESTIONS.length)*100;
  const timePct = (timeLeft/DEMO_SECS)*100;
  const isDanger = timeLeft < 60;
  const ringOffset = 138.2 - (138.2*(timePct/100));

  const handleAnswer = useCallback((letter)=>{
    setAnswers(prev=>({...prev,[q.id]:letter}));
  },[q]);

  const handleFlag = ()=>{
    setFlagged(prev=>{
      const n=new Set(prev);
      n.has(q.id)?n.delete(q.id):n.add(q.id);
      return n;
    });
  };

  const handleSubmit = ()=>{
    clearInterval(timerRef.current);
    setPhase("results");
    setShowConfetti(true);
    setTimeout(()=>setShowConfetti(false),4000);
    // Animate result bars
    setTimeout(()=>{
      setResultBars({
        analyse:75, geo:60, proba:50,
      });
    },600);
  };

  // Score calculation
  const score = QUESTIONS.filter(q=>q.type==="mcq" && answers[q.id]===q.correct)
    .reduce((sum,q)=>sum+q.pts,0);
  const totalPts = QUESTIONS.reduce((sum,q)=>sum+q.pts,0);
  const scorePct = Math.round((score/totalPts)*100);
  const mention = scorePct>=90?"Excellent":scorePct>=75?"Bien":scorePct>=60?"Passable":"À réviser";
  const mentionColor = scorePct>=90?"var(--teal)":scorePct>=75?"var(--green)":scorePct>=60?"var(--gold)":"var(--rose)";

  if(phase==="results") return (
    <div style={{background:"var(--bg)",minHeight:"100vh"}}>
      <div className="mesh"><span/><span/><span/></div>
      {showConfetti && <Confetti/>}

      <div className="results-screen">
        {/* Hero */}
        <div className="results-hero">
          <div className="results-glow"/>
          <div className="results-badge">
            <span style={{width:6,height:6,borderRadius:"50%",background:"var(--teal)",display:"inline-block",animation:"onP 2s ease infinite"}}/>
            Examen terminé — Maths BAC 2024 Série C
          </div>
          <div className="results-score-big">
            <span className="score-num" style={{background:`linear-gradient(135deg,${mentionColor},var(--green))`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{score}</span>
            <span className="score-denom">/{totalPts}</span>
          </div>
          <div className="results-mention" style={{color:mentionColor}}>{mention}</div>
          <div className="results-sub">
            Tu as répondu à <strong style={{color:"var(--text)"}}>{answeredCount}/{QUESTIONS.length}</strong> questions en <strong style={{color:"var(--text)"}}>{formatTime(DEMO_SECS-timeLeft)}</strong>.
            Score : <strong style={{color:mentionColor}}>{scorePct}%</strong>
          </div>
          <div className="results-ctas">
            <button className="btn-retry" onClick={()=>{ setPhase("exam"); setAnswers({}); setOpenAnswers({}); setFlagged(new Set()); setTimeLeft(DEMO_SECS); setCurrentQ(0); }}>
              🔄 Recommencer
            </button>
            <button className="btn-correction" onClick={()=>showToast("🤖 Correction IA en cours de génération...")}>
              🤖 Voir la correction IA
            </button>
            <button className="btn-share" onClick={()=>showToast("📤 Lien de partage copié !")}>
              📤 Partager
            </button>
          </div>
        </div>

        <div className="results-content">
          {/* Stats grid */}
          <div className="results-grid" style={{marginBottom:28}}>
            {[
              {icon:"🏆",val:`${score}/${totalPts}`,label:"Score final",color:"var(--teal)"},
              {icon:"✅",val:`${Object.values(answers).filter((a,i)=>QUESTIONS.filter(q=>q.type==="mcq")[i]?.correct===a).length}/${QUESTIONS.filter(q=>q.type==="mcq").length}`,label:"Bonnes réponses",color:"var(--green)"},
              {icon:"⏱",val:formatTime(DEMO_SECS-timeLeft),label:"Temps utilisé",color:"var(--gold)"},
              {icon:"🚩",val:flagged.size,label:"Questions marquées",color:"var(--gold)"},
            ].map((c,i)=>(
              <div key={c.label} className="rg-card" style={{animationDelay:`${i*0.08}s`}}>
                <div className="rg-icon">{c.icon}</div>
                <div className="rg-val" style={{color:c.color}}>{c.val}</div>
                <div className="rg-label">{c.label}</div>
              </div>
            ))}
          </div>

          {/* Per-question */}
          <div className="results-questions">
            <div className="rq-title">📋 Détail par question</div>
            {QUESTIONS.map((q,i)=>{
              const ans = q.type==="mcq" ? answers[q.id] : openAnswers[q.id];
              const isCorrect = q.type==="mcq" && ans===q.correct;
              const isWrong = q.type==="mcq" && ans && ans!==q.correct;
              const isSkip = !ans || (q.type==="open" && !openAnswers[q.id]?.trim());
              return (
                <div key={q.id} className="rq-item" style={{animationDelay:`${i*0.05}s`}} onClick={()=>showToast(`📖 Question ${i+1} : correction IA disponible`)}>
                  <div className={`rq-status ${isCorrect?"rq-correct":isWrong?"rq-wrong":"rq-skip"}`}>
                    {isCorrect?"✓":isWrong?"✕":q.type==="open"?"✎":"—"}
                  </div>
                  <div className="rq-body">
                    <div className="rq-num">Question {i+1} · {q.pts} point{q.pts>1?"s":""}</div>
                    <div className="rq-text">{q.text}</div>
                    {q.type==="mcq" && (
                      <div className="rq-answer" style={{color:isCorrect?"var(--green)":isWrong?"var(--rose)":"var(--muted)"}}>
                        {ans ? `Ta réponse : ${ans} ${isCorrect?"✓":isWrong?`✕ (correct : ${q.correct})`:""}`  : "Non répondu"}
                      </div>
                    )}
                    {q.type==="open" && (
                      <div className="rq-answer" style={{color:"var(--muted)"}}>Question ouverte — voir correction IA →</div>
                    )}
                  </div>
                  <div className="rq-right">
                    <div className="rq-pts" style={{color:isCorrect?"var(--green)":isWrong?"var(--rose)":"var(--muted)"}}>
                      {isCorrect?`+${q.pts}`:isWrong?"0":q.type==="open"?"?":"0"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Breakdown + comparison */}
          <div className="breakdown-grid" style={{marginBottom:20}}>
            <div className="bk-card">
              <div className="bk-title">📊 Par thème</div>
              {[
                {label:"Analyse",pct:resultBars.analyse||0,color:"var(--teal)"},
                {label:"Géométrie",pct:resultBars.geo||0,color:"var(--blue)"},
                {label:"Probabilités",pct:resultBars.proba||0,color:"var(--purple)"},
              ].map(b=>(
                <div key={b.label} className="bk-row">
                  <div className="bk-label">{b.label}</div>
                  <div className="bk-bar-track"><div className="bk-bar-fill" style={{width:`${b.pct}%`,background:b.color}}/></div>
                  <div className="bk-pct" style={{color:b.color}}>{b.pct}%</div>
                </div>
              ))}
            </div>

            <div className="cmp-card">
              <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>📈 Comparaison anonyme</div>
              <div style={{fontSize:12,color:"var(--muted)",marginBottom:16}}>vs. les autres étudiants sur ce sujet</div>
              <div className="cmp-vs">
                <div className="cmp-you">
                  <div className="cmp-score" style={{color:"var(--teal)"}}>{score}</div>
                  <div className="cmp-label">ton score</div>
                </div>
                <div className="cmp-divider">vs</div>
                <div className="cmp-avg">
                  <div className="cmp-score" style={{color:"var(--muted)"}}>9.4</div>
                  <div className="cmp-label">moyenne</div>
                </div>
              </div>
              <div className="cmp-bar">
                <div className="cmp-bar-you" style={{width:`${scorePct}%`}}/>
              </div>
              <div style={{fontSize:11,color:"var(--teal)",fontFamily:"var(--mono)"}}>
                Tu es dans le top {scorePct>60?"20%":"40%"} des candidats 🏆
              </div>
            </div>
          </div>

          {/* Share */}
          <div className="share-card">
            <div style={{fontSize:15,fontWeight:700,marginBottom:4}}>📤 Partage tes résultats</div>
            <div style={{fontSize:12,color:"var(--muted)",marginBottom:0}}>Montre ta progression à tes amis</div>
            <div className="share-preview">
              <div style={{fontSize:11,color:"var(--teal)",fontFamily:"var(--mono)",marginBottom:8}}>✨ Mah.AI — Examen Blanc</div>
              <div style={{fontSize:22,fontWeight:800,letterSpacing:-1,marginBottom:4}}>
                <span style={{color:"var(--teal)"}}>{score}/{totalPts}</span> · {mention}
              </div>
              <div style={{fontSize:12,color:"var(--muted)"}}>Maths BAC 2024 Série C · préparé sur Mah.AI 🇲🇬</div>
            </div>
            <div className="share-btns">
              {["Facebook","WhatsApp","Copier le lien"].map(s=>(
                <button key={s} className="share-btn" onClick={()=>showToast(`📤 Partagé sur ${s} !`)}>
                  {s==="Facebook"?"📘":s==="WhatsApp"?"💬":"🔗"} {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={`toast ${toast.show?"show":""}`}>
        <span style={{fontSize:18}}>✨</span><span>{toast.msg}</span>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh"}}>
      <div className="mesh"><span/><span/><span/></div>

      {/* ── PAUSE OVERLAY ── */}
      {paused && (
        <div className="pause-overlay">
          <div className="pause-card">
            <div className="pause-icon">⏸</div>
            <div className="pause-title">Examen en pause</div>
            <div className="pause-sub">Le chronomètre est arrêté. Reprends quand tu es prêt.</div>
            <button className="btn-resume" onClick={()=>setPaused(false)}>▶ Reprendre l'examen</button>
            <button className="btn-abandon" onClick={()=>showToast("Utilise 'Terminer' pour soumettre")}>Abandonner</button>
          </div>
        </div>
      )}

      {/* ── TOPBAR ── */}
      <div className="exam-topbar">
        <div className="et-left">
          <div className="et-logo">Mah.AI</div>
          <div className="et-sep"/>
          <div className="et-title">📐 Mathématiques BAC 2024 — Série C&D</div>
        </div>

        <div className="et-center">
          <div style={{width:"100%",maxWidth:300}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:10,fontFamily:"var(--mono)",color:"var(--muted)",marginBottom:5}}>
              <span>{answeredCount}/{QUESTIONS.length} répondues</span>
              <span style={{color:"var(--teal)"}}>{Math.round(progressPct)}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{width:`${progressPct}%`}}/>
            </div>
          </div>
        </div>

        <div className="et-right">
          {/* Timer ring */}
          <div className="timer-wrap">
            <div className="timer-ring">
              <svg width="44" height="44" viewBox="0 0 44 44">
                <circle className="ring-bg" cx="22" cy="22" r="18"/>
                <circle className="ring-fill" cx="22" cy="22" r="18"
                  stroke={isDanger?"var(--red)":timePct>50?"var(--teal)":"var(--gold)"}
                  strokeDashoffset={ringOffset}/>
              </svg>
              <div className="timer-num" style={{color:isDanger?"var(--red)":"var(--teal)",fontSize:10}}>
                {Math.floor(timeLeft/60)}m
              </div>
            </div>
            <div>
              <div className={`timer-digits ${isDanger?"timer-danger":""}`} style={{color:isDanger?"var(--red)":timePct>50?"var(--teal)":"var(--gold)"}}>
                {formatTime(timeLeft)}
              </div>
              <div className="timer-label">restantes</div>
            </div>
          </div>
          <button className="btn-pause" onClick={()=>setPaused(true)}>⏸ Pause</button>
          <button className="btn-submit-exam" onClick={handleSubmit}>Terminer ✓</button>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div className="exam-wrap">

        {/* LEFT NAV */}
        <aside className="q-nav">
          <div className="q-nav-title">Questions</div>
          <div className="q-nav-grid">
            {QUESTIONS.map((qu,i)=>{
              const ans = qu.type==="mcq" ? answers[qu.id] : openAnswers[qu.id]?.trim();
              return (
                <div key={qu.id}
                  className={`q-dot ${i===currentQ?"current":""} ${ans&&!flagged.has(qu.id)?"answered":""} ${flagged.has(qu.id)?"flagged":""}`}
                  onClick={()=>setCurrentQ(i)}>
                  {i+1}
                </div>
              );
            })}
          </div>

          <div className="q-legend">
            {[
              {dot:"var(--teal)",bg:"rgba(10,255,224,.1)",label:"En cours"},
              {dot:"var(--green)",bg:"rgba(0,255,136,.1)",label:"Répondue"},
              {dot:"var(--gold)",bg:"rgba(255,209,102,.1)",label:"Marquée"},
              {dot:"var(--muted2)",bg:"rgba(255,255,255,.04)",label:"Non vue"},
            ].map(l=>(
              <div key={l.label} className="q-leg-item">
                <div className="q-leg-dot" style={{background:l.bg,border:`1px solid ${l.dot}`}}/>
                {l.label}
              </div>
            ))}
          </div>

          <div className="q-stats">
            <div className="qs-card">
              <div className="qs-num" style={{color:"var(--green)"}}>{answeredCount}</div>
              <div className="qs-label">répondues</div>
            </div>
            <div className="qs-card">
              <div className="qs-num" style={{color:"var(--muted)"}}>{QUESTIONS.length-answeredCount}</div>
              <div className="qs-label">restantes</div>
            </div>
            <div className="qs-card">
              <div className="qs-num" style={{color:"var(--gold)"}}>{flagged.size}</div>
              <div className="qs-label">marquées</div>
            </div>
            <div className="qs-card">
              <div className="qs-num" style={{color:"var(--blue)"}}>{QUESTIONS.reduce((s,q)=>s+q.pts,0)}</div>
              <div className="qs-label">pts total</div>
            </div>
          </div>
        </aside>

        {/* CENTER — Question */}
        <main className="q-main">
          {/* Header */}
          <div className="q-header">
            <div>
              <div className="q-label">Exercice {currentQ<3?"I":currentQ<6?"II":"III"} · Question {currentQ+1}</div>
              <div className="q-number">Q{String(currentQ+1).padStart(2,"0")}</div>
              <div className="q-pts">{q.pts} point{q.pts>1?"s":""} · {q.type==="mcq"?"QCM":"Réponse ouverte"}</div>
            </div>
            <button className={`q-flag-btn ${flagged.has(q.id)?"on":""}`} onClick={handleFlag}>
              {flagged.has(q.id)?"🚩 Marquée":"🏳 Marquer"}
            </button>
          </div>

          {/* Question box */}
          <div className="q-box" key={currentQ}>
            {q.context && (
              <div className="q-context">
                📌 {q.context}
              </div>
            )}
            <div className="q-text">{q.text}</div>
            {q.sub && <div className="q-sub">{q.sub}</div>}
          </div>

          {/* MCQ choices */}
          {q.type==="mcq" && (
            <div className="choices">
              {q.choices.map(c=>(
                <div key={c.letter}
                  className={`choice ${answers[q.id]===c.letter?"selected":""}`}
                  onClick={()=>handleAnswer(c.letter)}>
                  <div className="choice-letter">{c.letter}</div>
                  <div className="choice-text">{c.text}</div>
                </div>
              ))}
            </div>
          )}

          {/* Open answer */}
          {q.type==="open" && (
            <div className="answer-area">
              <div className="answer-label">Ta réponse</div>
              <textarea className="answer-textarea"
                placeholder="Écris ta réponse ici — développe le calcul étape par étape..."
                value={openAnswers[q.id]||""}
                onChange={e=>setOpenAnswers(prev=>({...prev,[q.id]:e.target.value}))}
              />
              <div className="answer-toolbar">
                {["∫","∑","√","π","∞","→","≤","≥","×","÷"].map(sym=>(
                  <button key={sym} className="atool"
                    onClick={()=>setOpenAnswers(prev=>({...prev,[q.id]:(prev[q.id]||"")+sym}))}>
                    {sym}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Nav buttons */}
          <div className="q-nav-btns">
            <button className="btn-prev" onClick={()=>setCurrentQ(q=>Math.max(0,q-1))} disabled={currentQ===0}
              style={{opacity:currentQ===0?.4:1}}>
              ← Précédente
            </button>
            <div className="q-counter">{currentQ+1} / {QUESTIONS.length}</div>
            {currentQ===QUESTIONS.length-1 ? (
              <button className="btn-next" onClick={handleSubmit}>Terminer l'examen ✓</button>
            ) : (
              <button className="btn-next" onClick={()=>setCurrentQ(q=>Math.min(QUESTIONS.length-1,q+1))}>
                Suivante →
              </button>
            )}
          </div>
        </main>

        {/* RIGHT INFO */}
        <aside className="info-panel">

          {/* Chrono */}
          <div className="ip-section">
            <div className="ip-title">Temps restant</div>
            <div className="chrono-mini">
              <div className={`cm-time ${isDanger?"timer-danger":""}`}
                style={{color:isDanger?"var(--red)":timePct>50?"var(--teal)":"var(--gold)"}}>
                {formatTime(timeLeft)}
              </div>
              <div className="cm-label">sur {formatTime(DEMO_SECS)} au total</div>
              <div className="cm-bar-track">
                <div className="cm-bar-fill" style={{
                  width:`${timePct}%`,
                  background:isDanger?"var(--red)":timePct>50?"linear-gradient(90deg,var(--teal),var(--green))":"linear-gradient(90deg,var(--gold),var(--orange))"
                }}/>
              </div>
            </div>
          </div>

          {/* Score preview */}
          <div className="ip-section">
            <div className="ip-title">Score en cours</div>
            <div className="score-preview">
              {[
                {label:"Répondues",val:`${answeredCount}/${QUESTIONS.length}`,color:"var(--text)"},
                {label:"Marquées",val:flagged.size,color:"var(--gold)"},
                {label:"Points max",val:QUESTIONS.reduce((s,q)=>s+q.pts,0),color:"var(--muted)"},
                {label:"Q. actuelle",val:`${q.pts} pts`,color:"var(--teal)"},
              ].map(r=>(
                <div key={r.label} className="sp-row">
                  <span className="sp-label">{r.label}</span>
                  <span className="sp-val" style={{color:r.color}}>{r.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI hint */}
          <div className="ip-section">
            <div className="ip-title">Aide IA</div>
            <div className="ai-hint">
              <div className="ah-header">
                <div className="ah-orb">🤖</div>
                <div>
                  <div className="ah-title">Indice pédagogique</div>
                  <div className="ah-cost">1 crédit / question</div>
                </div>
              </div>
              <div className="ah-text">
                Bloqué sur cette question ? L'IA te guide sans donner la réponse — elle pose des questions pour t'aider à réfléchir.
              </div>
              <button className="btn-hint" onClick={()=>showToast("🤖 Indice IA : Rappelle-toi la règle de dérivation des polynômes !")}>
                💡 Demander un indice
              </button>
            </div>
          </div>

          {/* Quick tips */}
          <div className="ip-section">
            <div className="ip-title">Stratégie</div>
            <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:12,padding:14}}>
              {[
                "Réponds d'abord aux questions que tu maîtrises",
                "Marque les questions difficiles — reviens-y après",
                "Vérifie tes calculs sur les questions à fort coefficient",
              ].map((tip,i)=>(
                <div key={i} style={{display:"flex",gap:8,fontSize:12,color:"var(--muted)",marginBottom:i<2?10:0,lineHeight:1.5}}>
                  <span style={{color:"var(--teal)",flexShrink:0}}>→</span>
                  {tip}
                </div>
              ))}
            </div>
          </div>
        </aside>

      </div>

      <div className={`toast ${toast.show?"show":""}`}>
        <span style={{fontSize:18}}>✨</span><span>{toast.msg}</span>
      </div>
    </div>
  );
}
