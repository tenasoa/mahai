import { useState, useEffect, useRef } from "react";

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
    --r:16px;
  }
  html{scroll-behavior:smooth}
  body{font-family:var(--font);background:var(--bg);color:var(--text);overflow-x:hidden;-webkit-font-smoothing:antialiased}
  ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:var(--bg)}::-webkit-scrollbar-thumb{background:var(--teal2);border-radius:2px}
  body::before{content:'';position:fixed;inset:0;z-index:0;opacity:.4;pointer-events:none;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")}
  .mesh{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden}
  .mesh span{position:absolute;border-radius:50%;filter:blur(140px);opacity:.055;animation:fm 22s ease-in-out infinite alternate}
  .mesh span:nth-child(1){width:500px;height:500px;top:-120px;left:-80px;background:var(--teal);animation-delay:0s}
  .mesh span:nth-child(2){width:400px;height:400px;bottom:-80px;right:-60px;background:var(--purple);animation-delay:-10s}
  @keyframes fm{0%{transform:translate(0,0)}100%{transform:translate(22px,-18px)}}

  /* ── NAV ── */
  nav{
    position:fixed;top:0;left:0;right:0;z-index:100;height:58px;
    display:flex;align-items:center;justify-content:space-between;
    padding:0 32px;background:rgba(6,9,16,.88);backdrop-filter:blur(24px);
    border-bottom:1px solid var(--border);
  }
  .nav-logo{font-size:20px;font-weight:800;letter-spacing:-1px;background:linear-gradient(135deg,var(--teal),var(--green));-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-decoration:none}
  .nav-right{display:flex;align-items:center;gap:10px}
  .btn-back{background:transparent;border:1px solid var(--border);color:var(--muted);padding:7px 14px;border-radius:9px;font-family:var(--font);font-size:13px;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:6px}
  .btn-back:hover{border-color:var(--border2);color:var(--text)}
  .nav-credits{display:flex;align-items:center;gap:6px;background:rgba(10,255,224,.06);border:1px solid rgba(10,255,224,.15);padding:7px 13px;border-radius:9px;font-size:12px;font-family:var(--mono);color:var(--teal)}

  /* ── LAYOUT ── */
  .page{padding-top:58px;min-height:100vh;max-width:1200px;margin:0 auto;display:grid;grid-template-columns:260px 1fr;gap:0;padding-left:24px;padding-right:24px}

  /* ── SIDEBAR ── */
  .sidebar{padding:28px 0;position:sticky;top:58px;height:calc(100vh - 58px);overflow-y:auto}

  /* Avatar card */
  .avatar-card{
    background:var(--bg2);border:1px solid var(--border);border-radius:var(--r);
    padding:20px;margin-bottom:16px;text-align:center;position:relative;overflow:hidden;
    animation:slideUp .4s ease both;
  }
  .avatar-card::before{content:'';position:absolute;top:0;left:0;right:0;height:40px;background:linear-gradient(180deg,rgba(10,255,224,.06),transparent)}
  .avatar-wrap{position:relative;display:inline-block;margin-bottom:12px}
  .avatar{width:72px;height:72px;border-radius:20px;background:linear-gradient(135deg,#1A3A5C,var(--teal2));display:flex;align-items:center;justify-content:center;font-size:32px;border:2px solid rgba(10,255,224,.2);cursor:pointer;transition:border-color .2s}
  .avatar:hover{border-color:rgba(10,255,224,.5)}
  .avatar-edit{position:absolute;bottom:-4px;right:-4px;width:22px;height:22px;border-radius:7px;background:var(--teal);border:2px solid var(--bg);display:flex;align-items:center;justify-content:center;font-size:10px;color:var(--bg);cursor:pointer}
  .avatar-name{font-size:16px;font-weight:800;letter-spacing:-.3px;margin-bottom:4px}
  .avatar-email{font-size:11px;color:var(--muted);font-family:var(--mono);margin-bottom:10px}
  .roles-wrap{display:flex;flex-wrap:wrap;gap:4px;justify-content:center}
  .role-chip{display:flex;align-items:center;gap:4px;padding:3px 9px;border-radius:100px;font-size:10px;font-weight:700;font-family:var(--mono);border:1px solid}

  /* Sidebar nav */
  .sb-nav{display:flex;flex-direction:column;gap:2px}
  .sb-section{font-size:10px;color:var(--muted2);font-family:var(--mono);letter-spacing:.12em;text-transform:uppercase;padding:12px 12px 6px}
  .sb-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;cursor:pointer;color:var(--muted);font-size:13px;font-weight:500;transition:all .2s;border:1px solid transparent;position:relative}
  .sb-item:hover{background:rgba(255,255,255,.04);color:var(--text)}
  .sb-item.active{background:rgba(10,255,224,.07);border-color:rgba(10,255,224,.15);color:var(--teal)}
  .sb-item .icon{font-size:16px;width:20px;text-align:center;flex-shrink:0}
  .sb-dot{width:6px;height:6px;border-radius:50%;background:var(--rose);margin-left:auto;flex-shrink:0}
  .sb-badge{margin-left:auto;font-size:9px;font-family:var(--mono);background:rgba(255,107,157,.12);border:1px solid rgba(255,107,157,.25);color:var(--rose);padding:1px 6px;border-radius:100px;flex-shrink:0}

  /* ── MAIN CONTENT ── */
  .main-content{padding:28px 0 28px 32px;min-width:0}
  @keyframes slideUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes slideIn{from{opacity:0;transform:translateX(14px)}to{opacity:1;transform:translateX(0)}}

  /* Section wrapper */
  .section{animation:slideIn .4s ease both;display:none}
  .section.visible{display:block}

  /* Section header */
  .section-header{margin-bottom:24px}
  .section-title{font-size:22px;font-weight:800;letter-spacing:-.5px;margin-bottom:4px}
  .section-sub{font-size:13px;color:var(--muted);line-height:1.5}

  /* Card */
  .card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r);padding:22px;margin-bottom:14px;position:relative;overflow:hidden;transition:border-color .25s}
  .card:hover{border-color:rgba(255,255,255,.1)}
  .card-title{font-size:14px;font-weight:700;margin-bottom:4px;display:flex;align-items:center;gap:8px}
  .card-sub{font-size:12px;color:var(--muted);margin-bottom:18px;line-height:1.5}

  /* Form elements */
  .form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  .form-group{display:flex;flex-direction:column;gap:6px}
  .form-group.full{grid-column:span 2}
  .form-label{font-size:11px;color:var(--muted);font-family:var(--mono);letter-spacing:.08em;text-transform:uppercase}
  .form-input{background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:11px 14px;color:var(--text);font-family:var(--font);font-size:14px;outline:none;transition:border-color .2s,box-shadow .2s;width:100%}
  .form-input:focus{border-color:var(--border2);box-shadow:0 0 0 3px rgba(10,255,224,.06)}
  .form-input::placeholder{color:var(--muted)}
  .form-input:disabled{opacity:.5;cursor:not-allowed}
  .form-select{background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:11px 14px;color:var(--text);font-family:var(--font);font-size:14px;outline:none;cursor:pointer;transition:border-color .2s;-webkit-appearance:none;width:100%}
  .form-select:focus{border-color:var(--border2)}
  .form-textarea{background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:11px 14px;color:var(--text);font-family:var(--font);font-size:14px;outline:none;resize:vertical;min-height:90px;transition:border-color .2s;width:100%;line-height:1.6}
  .form-textarea:focus{border-color:var(--border2)}
  .form-hint{font-size:11px;color:var(--muted);font-family:var(--mono);margin-top:3px}

  /* Save button */
  .btn-save{background:linear-gradient(135deg,var(--teal),var(--teal2));color:var(--bg);border:none;padding:11px 24px;border-radius:10px;font-family:var(--font);font-size:14px;font-weight:700;cursor:pointer;transition:transform .2s,box-shadow .25s;display:inline-flex;align-items:center;gap:7px}
  .btn-save:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(10,255,224,.3)}
  .btn-secondary{background:transparent;border:1px solid var(--border);color:var(--muted);padding:10px 20px;border-radius:10px;font-family:var(--font);font-size:13px;cursor:pointer;transition:all .2s}
  .btn-secondary:hover{border-color:rgba(255,255,255,.2);color:var(--text)}
  .btn-danger{background:transparent;border:1px solid rgba(255,107,157,.2);color:var(--rose);padding:10px 20px;border-radius:10px;font-family:var(--font);font-size:13px;cursor:pointer;transition:all .2s}
  .btn-danger:hover{background:rgba(255,107,157,.08)}
  .form-actions{display:flex;align-items:center;gap:10px;margin-top:20px;padding-top:16px;border-top:1px solid var(--border)}

  /* ── ROLES SECTION ── */
  .roles-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px}
  .role-card{
    background:var(--bg2);border:1px solid var(--border);border-radius:var(--r);
    padding:18px;position:relative;overflow:hidden;
    transition:transform .3s cubic-bezier(.34,1.56,.64,1),border-color .25s,box-shadow .3s;
    cursor:default;
  }
  .role-card::before{content:'';position:absolute;inset:0;opacity:0;background:radial-gradient(circle at var(--mx,50%) var(--my,50%),rgba(10,255,224,.05),transparent 60%);transition:opacity .4s;pointer-events:none}
  .role-card:hover{transform:translateY(-3px);box-shadow:0 16px 40px rgba(0,0,0,.3)}
  .role-card:hover::before{opacity:1}
  .role-card.active-role{border-color:rgba(0,255,136,.2)}
  .role-card.inactive-role{border-color:var(--border);opacity:.7}
  .role-card.pending-role{border-color:rgba(255,209,102,.2)}
  .rc-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px}
  .rc-icon{width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;border:1px solid}
  .rc-status{font-size:9px;font-family:var(--mono);font-weight:700;padding:3px 8px;border-radius:100px;border:1px solid}
  .rs-active{background:rgba(0,255,136,.08);border-color:rgba(0,255,136,.25);color:var(--green)}
  .rs-pending{background:rgba(255,209,102,.08);border-color:rgba(255,209,102,.25);color:var(--gold)}
  .rs-locked{background:rgba(255,255,255,.04);border-color:var(--border);color:var(--muted)}
  .rc-name{font-size:14px;font-weight:800;letter-spacing:-.3px;margin-bottom:3px}
  .rc-desc{font-size:11px;color:var(--muted);line-height:1.5;margin-bottom:12px}
  .rc-stats{display:flex;gap:10px}
  .rc-stat{font-size:10px;font-family:var(--mono);color:var(--muted);display:flex;align-items:center;gap:4px}
  .rc-stat span{color:var(--text);font-weight:700}
  .rc-action{width:100%;margin-top:12px;padding:8px;border-radius:9px;font-family:var(--font);font-size:12px;font-weight:700;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:6px;border:1px solid}

  /* Upgrade roles */
  .upgrade-section{background:linear-gradient(135deg,rgba(10,255,224,.04),rgba(10,255,224,.01));border:1px solid rgba(10,255,224,.12);border-radius:var(--r);padding:20px;margin-bottom:14px}
  .us-title{font-size:13px;font-weight:700;margin-bottom:4px;display:flex;align-items:center;gap:8px}
  .us-sub{font-size:12px;color:var(--muted);margin-bottom:16px;line-height:1.5}
  .upgrade-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
  .ug-card{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:14px;cursor:pointer;transition:all .25s;text-align:center}
  .ug-card:hover{border-color:rgba(255,255,255,.15);transform:translateY(-2px)}
  .ug-icon{font-size:22px;margin-bottom:8px}
  .ug-name{font-size:12px;font-weight:700;margin-bottom:4px}
  .ug-req{font-size:10px;color:var(--muted);font-family:var(--mono);line-height:1.4}
  .ug-btn{width:100%;margin-top:10px;padding:7px;border-radius:7px;font-family:var(--font);font-size:11px;font-weight:700;cursor:pointer;transition:all .2s;border:1px solid var(--border);background:transparent;color:var(--muted)}
  .ug-btn:hover{border-color:var(--border2);color:var(--teal);background:rgba(10,255,224,.05)}

  /* ── MVola SECTION ── */
  .mvola-card{
    background:linear-gradient(135deg,rgba(255,107,157,.06),rgba(255,107,157,.02));
    border:1px solid rgba(255,107,157,.18);border-radius:var(--r);padding:20px;margin-bottom:14px;
  }
  .mvola-header{display:flex;align-items:center;gap:12px;margin-bottom:16px}
  .mvola-logo{width:42px;height:42px;border-radius:12px;background:linear-gradient(135deg,#C8102E,#E8001D);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:900;color:#fff;font-family:var(--mono);flex-shrink:0;box-shadow:0 4px 16px rgba(200,16,46,.35)}
  .mvola-info{flex:1}
  .mvola-name{font-size:14px;font-weight:700}
  .mvola-num{font-size:13px;font-family:var(--mono);color:var(--teal);margin-top:2px}
  .mvola-verified{display:flex;align-items:center;gap:5px;font-size:10px;color:var(--green);font-family:var(--mono);margin-top:3px}
  .mvola-verified::before{content:'✓';width:14px;height:14px;border-radius:50%;background:rgba(0,255,136,.15);border:1px solid rgba(0,255,136,.3);display:flex;align-items:center;justify-content:center;font-size:9px}
  .mvola-balance{background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
  .mb-label{font-size:11px;color:var(--muted);font-family:var(--mono)}
  .mb-amount{font-family:var(--mono);font-size:22px;font-weight:800;letter-spacing:-1px;color:var(--teal)}
  .mb-sub{font-size:10px;color:var(--muted);margin-top:2px}
  .mvola-methods{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px}
  .mm-card{background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:10px 12px;cursor:pointer;transition:all .2s;text-align:center}
  .mm-card:hover{border-color:rgba(255,255,255,.15)}
  .mm-card.on{border-color:rgba(10,255,224,.25);background:rgba(10,255,224,.05)}
  .mm-icon{font-size:18px;margin-bottom:5px}
  .mm-name{font-size:11px;font-weight:700;margin-bottom:2px}
  .mm-num{font-size:10px;color:var(--muted);font-family:var(--mono)}

  /* Historique paiements */
  .tx-item{display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid rgba(255,255,255,.04)}
  .tx-item:last-child{border-bottom:none}
  .tx-icon{width:32px;height:32px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;border:1px solid}
  .tx-in{background:rgba(0,255,136,.08);border-color:rgba(0,255,136,.2)}
  .tx-out{background:rgba(255,107,157,.08);border-color:rgba(255,107,157,.2)}
  .tx-info{flex:1;min-width:0}
  .tx-label{font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .tx-date{font-size:10px;color:var(--muted);font-family:var(--mono);margin-top:2px}
  .tx-amount{font-family:var(--mono);font-size:13px;font-weight:700;flex-shrink:0}

  /* ── NOTIFICATIONS ── */
  .notif-group{margin-bottom:20px}
  .ng-title{font-size:12px;color:var(--muted);font-family:var(--mono);letter-spacing:.1em;text-transform:uppercase;margin-bottom:10px;padding:0 2px}
  .notif-row{display:flex;align-items:center;justify-content:space-between;padding:13px 16px;background:var(--bg2);border:1px solid var(--border);border-radius:10px;margin-bottom:6px;transition:border-color .2s}
  .notif-row:hover{border-color:rgba(255,255,255,.1)}
  .nr-left{display:flex;align-items:center;gap:12px}
  .nr-icon{font-size:18px;width:24px;text-align:center;flex-shrink:0}
  .nr-label{font-size:13px;font-weight:600}
  .nr-desc{font-size:11px;color:var(--muted);margin-top:2px}
  /* Toggle */
  .toggle{width:40px;height:22px;border-radius:100px;border:none;cursor:pointer;position:relative;flex-shrink:0;transition:background .25s}
  .toggle.on{background:var(--teal)}
  .toggle.off{background:var(--muted2)}
  .toggle::after{content:'';position:absolute;width:16px;height:16px;border-radius:50%;background:#fff;top:3px;transition:left .25s cubic-bezier(.34,1.56,.64,1)}
  .toggle.on::after{left:21px}
  .toggle.off::after{left:3px}

  /* ── SÉCURITÉ ── */
  .security-item{display:flex;align-items:center;justify-content:space-between;padding:15px 18px;background:var(--bg2);border:1px solid var(--border);border-radius:10px;margin-bottom:8px;cursor:pointer;transition:all .2s}
  .security-item:hover{border-color:rgba(255,255,255,.12)}
  .si-left{display:flex;align-items:center;gap:12px}
  .si-icon{font-size:20px;width:26px;text-align:center;flex-shrink:0}
  .si-title{font-size:13px;font-weight:700}
  .si-desc{font-size:11px;color:var(--muted);margin-top:2px}
  .si-right{display:flex;align-items:center;gap:8px;font-size:11px;font-family:var(--mono);color:var(--muted)}
  .si-status{padding:3px 9px;border-radius:100px;font-size:10px;font-weight:700;font-family:var(--mono);border:1px solid}
  .si-on{background:rgba(0,255,136,.08);border-color:rgba(0,255,136,.25);color:var(--green)}
  .si-off{background:rgba(255,255,255,.04);border-color:var(--border);color:var(--muted)}

  /* Danger zone */
  .danger-zone{background:rgba(255,107,157,.04);border:1px solid rgba(255,107,157,.15);border-radius:var(--r);padding:20px}
  .dz-title{font-size:13px;font-weight:700;color:var(--rose);margin-bottom:4px}
  .dz-desc{font-size:12px;color:var(--muted);margin-bottom:14px;line-height:1.5}
  .dz-actions{display:flex;gap:8px;flex-wrap:wrap}

  /* Upload zone */
  .upload-zone{border:2px dashed var(--border);border-radius:12px;padding:24px;text-align:center;cursor:pointer;transition:all .25s;margin-bottom:10px}
  .upload-zone:hover{border-color:rgba(10,255,224,.3);background:rgba(10,255,224,.03)}
  .uz-icon{font-size:28px;margin-bottom:8px}
  .uz-text{font-size:13px;color:var(--muted)}
  .uz-text strong{color:var(--teal)}
  .uz-formats{font-size:10px;color:var(--muted2);font-family:var(--mono);margin-top:4px}

  /* Progress bar */
  .prog-track{height:4px;background:rgba(255,255,255,.06);border-radius:2px;overflow:hidden;margin:8px 0}
  .prog-fill{height:100%;border-radius:2px;transition:width 1.2s cubic-bezier(.4,0,.2,1)}

  /* Step indicator */
  .steps{display:flex;align-items:center;gap:0;margin-bottom:20px}
  .step{display:flex;flex-direction:column;align-items:center;flex:1;position:relative}
  .step:not(:last-child)::after{content:'';position:absolute;top:14px;left:50%;width:100%;height:2px;background:var(--border);z-index:0}
  .step:not(:last-child).done::after{background:var(--teal)}
  .step-dot{width:28px;height:28px;border-radius:50%;border:2px solid var(--border);background:var(--bg2);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;font-family:var(--mono);z-index:1;transition:all .3s}
  .step.done .step-dot{background:var(--teal);border-color:var(--teal);color:var(--bg)}
  .step.current .step-dot{border-color:var(--teal);color:var(--teal);box-shadow:0 0 0 4px rgba(10,255,224,.12)}
  .step-label{font-size:10px;color:var(--muted);font-family:var(--mono);margin-top:6px;text-align:center}
  .step.done .step-label,.step.current .step-label{color:var(--teal)}

  /* ── MODAL ── */
  .overlay{position:fixed;inset:0;background:rgba(0,0,0,.72);z-index:200;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(10px);animation:fadeIn .2s ease;padding:20px}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  .modal{background:var(--bg2);border:1px solid var(--border);border-radius:22px;padding:32px;width:100%;max-width:500px;position:relative;animation:modalIn .35s cubic-bezier(.34,1.56,.64,1);max-height:90vh;overflow-y:auto}
  @keyframes modalIn{from{opacity:0;transform:scale(.88) translateY(18px)}to{opacity:1;transform:scale(1) translateY(0)}}
  .modal-close{position:absolute;top:14px;right:14px;background:var(--bg3);border:1px solid var(--border);color:var(--muted);width:30px;height:30px;border-radius:8px;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;transition:all .2s}
  .modal-close:hover{border-color:var(--border2);color:var(--text)}
  .modal-icon{font-size:38px;text-align:center;margin-bottom:14px}
  .modal-title{font-size:20px;font-weight:800;letter-spacing:-.5px;text-align:center;margin-bottom:6px}
  .modal-sub{font-size:13px;color:var(--muted);text-align:center;margin-bottom:22px;line-height:1.55}
  .modal-form{display:flex;flex-direction:column;gap:14px}
  .modal-req{background:rgba(10,255,224,.04);border:1px solid rgba(10,255,224,.12);border-radius:10px;padding:12px 14px;margin-bottom:6px}
  .modal-req-title{font-size:11px;font-weight:700;color:var(--teal);font-family:var(--mono);margin-bottom:7px;letter-spacing:.08em}
  .modal-req-item{display:flex;align-items:center;gap:7px;font-size:12px;color:var(--muted);margin-bottom:5px}
  .modal-req-item:last-child{margin-bottom:0}
  .modal-req-item::before{content:'→';color:var(--teal);flex-shrink:0}
  .btn-submit{width:100%;background:linear-gradient(135deg,var(--teal),var(--teal2));color:var(--bg);border:none;padding:13px;border-radius:11px;font-family:var(--font);font-size:15px;font-weight:800;cursor:pointer;margin-top:6px;transition:all .2s}
  .btn-submit:hover{transform:translateY(-1px);box-shadow:0 8px 28px rgba(10,255,224,.3)}

  /* ── TOAST ── */
  .toast{position:fixed;bottom:24px;right:24px;background:var(--bg2);border:1px solid var(--border2);border-radius:14px;padding:13px 20px;display:flex;align-items:center;gap:10px;font-size:14px;box-shadow:0 16px 48px rgba(0,0,0,.5);z-index:400;transition:transform .4s cubic-bezier(.34,1.56,.64,1),opacity .3s;transform:translateY(80px);opacity:0}
  .toast.show{transform:translateY(0);opacity:1}

  /* ── RESPONSIVE ── */
  @media(max-width:860px){.page{grid-template-columns:1fr;padding:0 16px}.sidebar{display:none}.main-content{padding:20px 0}}
  @media(max-width:600px){.roles-grid,.form-grid,.upgrade-grid,.mvola-methods{grid-template-columns:1fr}}
`;

// ── DATA ────────────────────────────────────────────────────
const USER = {
  name: "Rania Berthine",
  email: "rania.berthine@gmail.com",
  phone: "034 56 789 10",
  avatar: "👩‍🎓",
  region: "Antananarivo",
  etablissement: "Lycée Ampefiloha",
  niveau: "Terminale C",
  credits: 12,
  memberSince: "Juin 2024",
};

const ROLES_ACTIFS = [
  {
    id: "etudiant", name: "Étudiante", icon: "🎓", status: "active",
    color: "var(--teal)", bc: "rgba(10,255,224,.15)", bg: "rgba(10,255,224,.07)",
    desc: "Accès au catalogue, examens blancs, corrections IA.",
    stats: [{ label: "Sujets consultés", val: "47" }, { label: "Examens blancs", val: "12" }],
  },
  {
    id: "contributeur", name: "Contributrice", icon: "✍️", status: "active",
    color: "var(--gold)", bc: "rgba(255,209,102,.15)", bg: "rgba(255,209,102,.07)",
    desc: "Soumettre des sujets et recevoir une commission sur chaque accès.",
    stats: [{ label: "Sujets publiés", val: "8" }, { label: "Gains totaux", val: "116 250 Ar" }],
  },
  {
    id: "verificateur", name: "Vérificatrice", icon: "👁", status: "pending",
    color: "var(--gold)", bc: "rgba(255,209,102,.15)", bg: "rgba(255,209,102,.07)",
    desc: "Valider les sujets soumis par les contributeurs.",
    stats: [{ label: "Demande soumise", val: "Il y a 2j" }, { label: "Délai estimé", val: "1-2j" }],
  },
];

const ROLES_DISPONIBLES = [
  {
    id: "professeur", icon: "👨‍🏫", name: "Professeur",
    req: "Diplôme + exemple de correction · Validation admin 3-7j",
    color: "var(--purple)", bc: "rgba(167,139,250,.2)", bg: "rgba(167,139,250,.07)",
  },
  {
    id: "validateur", icon: "✅", name: "Validateur",
    req: "100+ vérifications · Note ≥ 4.5 · Nomination admin",
    color: "var(--green)", bc: "rgba(0,255,136,.2)", bg: "rgba(0,255,136,.07)",
  },
];

const TRANSACTIONS = [
  { icon: "💳", label: "Recharge · Pack Révisions", date: "Aujourd'hui, 10:32", amount: "+20 crédits", type: "in" },
  { icon: "📐", label: "Consultation Maths BAC 2024", date: "Hier, 14:15", amount: "−2 crédits", type: "out" },
  { icon: "💰", label: "Gains Contributeur — Virement", date: "15 nov. 2024", amount: "+45 000 Ar", type: "in" },
  { icon: "📖", label: "Correction IA · Français BAC", date: "14 nov. 2024", amount: "−4 crédits", type: "out" },
  { icon: "📐", label: "Consultation SVT 2023", date: "12 nov. 2024", amount: "−2 crédits", type: "out" },
];

const NOTIFS = [
  {
    section: "Activité & Apprentissage",
    items: [
      { icon: "📚", label: "Nouveaux sujets disponibles", desc: "Sujets dans tes matières préférées", key: "new_subjects" },
      { icon: "🎯", label: "Rappels d'examen blanc", desc: "Selon ton calendrier BAC", key: "exam_reminders" },
      { icon: "🏆", label: "Résultats et badges", desc: "Quand tu débloques un nouveau badge", key: "badges" },
    ]
  },
  {
    section: "Gains & Paiements",
    items: [
      { icon: "💰", label: "Nouvelles consultations", desc: "Quand ton sujet est consulté", key: "consultations" },
      { icon: "💸", label: "Virements MVola", desc: "Confirmation de retrait de gains", key: "virements" },
      { icon: "💳", label: "Achats de crédits", desc: "Confirmation de recharge", key: "recharge" },
    ]
  },
  {
    section: "Compte & Sécurité",
    items: [
      { icon: "🔒", label: "Connexions suspectes", desc: "Alertes de sécurité critiques", key: "security" },
      { icon: "🎓", label: "Mises à jour de rôle", desc: "Approbation / refus de demandes", key: "roles" },
    ]
  },
];

const MODAL_CONFIGS = {
  professeur: {
    icon: "👨‍🏫", title: "Devenir Professeur", color: "var(--purple)",
    sub: "Partage ton expertise et gagne une commission sur chaque correction. Validation admin sous 3-7 jours.",
    reqs: ["Diplôme universitaire (Licence minimum)", "Exemple de correction (PDF ou image)", "Matières enseignées (multi-sélection)", "Expérience pédagogique"],
    fields: [
      { label: "Diplôme le plus élevé", type: "select", opts: ["Licence", "Master", "Doctorat", "Autre"] },
      { label: "Établissement d'origine", type: "input", ph: "Ex : Université d'Antananarivo" },
      { label: "Matières enseignées", type: "input", ph: "Ex : Mathématiques, Physique-Chimie" },
      { label: "Années d'expérience", type: "select", opts: ["1-2 ans", "3-5 ans", "6-10 ans", "10+ ans"] },
      { label: "Motivation (300 caractères max)", type: "textarea", ph: "Pourquoi veux-tu devenir professeur sur Mah.AI ?" },
    ],
  },
  verificateur: {
    icon: "👁", title: "Devenir Vérificateur", color: "var(--blue)",
    sub: "Valide les sujets soumis et gagne 9 000 Ar par sujet approuvé. Test de compétence requis.",
    reqs: ["Niveau BAC+ minimum", "Test en ligne (10 questions · score ≥ 7/10)", "Domaines de vérification à sélectionner"],
    fields: [
      { label: "Niveau de formation", type: "select", opts: ["BAC+", "Licence", "Master", "Doctorat"] },
      { label: "Domaines de vérification", type: "input", ph: "Ex : Maths, Physique, Sciences" },
      { label: "Motivation (300 caractères max)", type: "textarea", ph: "Pourquoi postuler ?" },
    ],
  },
};

export default function MahAIMonCompte() {
  const [activeSection, setActiveSection] = useState("profil");
  const [notifState, setNotifState]       = useState({ new_subjects:true, exam_reminders:true, badges:true, consultations:true, virements:true, recharge:true, security:true, roles:true });
  const [mvola, setMvola]                 = useState(0); // index méthode active
  const [modal, setModal]                 = useState(null); // "professeur"|"verificateur"|"avatar"
  const [toast, setToast]                 = useState({ show:false, msg:"" });
  const [barW, setBarW]                   = useState(0);
  const [saved, setSaved]                 = useState(false);
  const [editPhone, setEditPhone]         = useState(USER.phone);
  const [editBio, setEditBio]             = useState("Terminale C · Lycée Ampefiloha · Passionnée de maths et de sciences. BAC 2025.");
  const [security2fa, setSecurity2fa]     = useState(false);

  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = CSS;
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setBarW(72), 400);
    return () => clearTimeout(t);
  }, []);

  // Mouse glow on role cards
  useEffect(() => {
    const fn = e => {
      document.querySelectorAll(".role-card").forEach(c => {
        const r = c.getBoundingClientRect();
        c.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
        c.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
      });
    };
    window.addEventListener("mousemove", fn);
    return () => window.removeEventListener("mousemove", fn);
  }, []);

  const showToast = msg => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 2800);
  };

  const handleSave = () => {
    setSaved(true);
    showToast("✅ Modifications sauvegardées !");
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleNotif = key => setNotifState(p => ({ ...p, [key]: !p[key] }));

  const NAV_ITEMS = [
    { section: "Compte", items: [
      { id:"profil",        icon:"👤", label:"Informations personnelles" },
      { id:"roles",         icon:"🎭", label:"Mes rôles", badge: ROLES_ACTIFS.filter(r=>r.status==="pending").length > 0 ? "1 en attente" : null },
      { id:"securite",      icon:"🔒", label:"Sécurité" },
    ]},
    { section: "Finances", items: [
      { id:"paiement",      icon:"💳", label:"MVola & Paiements" },
      { id:"credits",       icon:"💎", label:"Mes crédits & abonnement" },
    ]},
    { section: "Préférences", items: [
      { id:"notifications", icon:"🔔", label:"Notifications", dot: true },
      { id:"confidentialite", icon:"🛡", label:"Confidentialité" },
    ]},
  ];

  return (
    <div style={{ minHeight: "100vh" }}>
      <div className="mesh"><span /><span /></div>

      {/* NAV */}
      <nav>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <button className="btn-back">← Dashboard</button>
          <a href="#" className="nav-logo">Mah.AI</a>
        </div>
        <div className="nav-right">
          <div className="nav-credits">💎 {USER.credits} crédits</div>
        </div>
      </nav>

      <div className="page">

        {/* ── SIDEBAR ── */}
        <aside className="sidebar">
          {/* Avatar */}
          <div className="avatar-card">
            <div className="avatar-wrap">
              <div className="avatar" onClick={() => setModal("avatar")}>{USER.avatar}</div>
              <div className="avatar-edit" onClick={() => setModal("avatar")}>✏</div>
            </div>
            <div className="avatar-name">{USER.name}</div>
            <div className="avatar-email">{USER.email}</div>
            <div className="roles-wrap">
              {ROLES_ACTIFS.filter(r => r.status === "active").map(r => (
                <span key={r.id} className="role-chip" style={{ borderColor: r.bc, color: r.color, background: r.bg }}>
                  {r.icon} {r.name}
                </span>
              ))}
              {ROLES_ACTIFS.find(r => r.status === "pending") && (
                <span className="role-chip" style={{ borderColor:"rgba(255,209,102,.25)", color:"var(--gold)", background:"rgba(255,209,102,.08)" }}>
                  ⏳ En attente
                </span>
              )}
            </div>
          </div>

          {/* Nav */}
          <div className="sb-nav">
            {NAV_ITEMS.map(group => (
              <div key={group.section}>
                <div className="sb-section">{group.section}</div>
                {group.items.map(item => (
                  <div key={item.id}
                    className={`sb-item ${activeSection === item.id ? "active" : ""}`}
                    onClick={() => setActiveSection(item.id)}>
                    <span className="icon">{item.icon}</span>
                    {item.label}
                    {item.dot && !item.badge && <div className="sb-dot" />}
                    {item.badge && <span className="sb-badge">{item.badge}</span>}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Member since */}
          <div style={{ margin:"14px 12px 0", padding:"12px 14px", background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:12, fontSize:11, color:"var(--muted)", fontFamily:"var(--mono)" }}>
            Membre depuis {USER.memberSince}<br />
            <span style={{ color:"var(--teal)", fontWeight:700 }}>Niveau Contributeur Or 🏅</span>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <div className="main-content">

          {/* ── PROFIL ── */}
          <div className={`section ${activeSection === "profil" ? "visible" : ""}`}>
            <div className="section-header">
              <div className="section-title">Informations personnelles</div>
              <div className="section-sub">Ces informations sont privées et ne sont pas visibles publiquement, sauf la photo et le prénom.</div>
            </div>

            {/* Photo */}
            <div className="card" style={{ display:"flex", alignItems:"center", gap:20, cursor:"pointer" }} onClick={() => setModal("avatar")}>
              <div style={{ width:64, height:64, borderRadius:18, background:"linear-gradient(135deg,#1A3A5C,var(--teal2))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, border:"2px solid rgba(10,255,224,.2)", flexShrink:0 }}>{USER.avatar}</div>
              <div style={{ flex:1 }}>
                <div className="card-title">Photo de profil</div>
                <div style={{ fontSize:12, color:"var(--muted)", marginTop:3 }}>JPG, PNG ou WebP · max 2 MB · recommandé 400×400px</div>
              </div>
              <button className="btn-secondary" style={{ flexShrink:0 }}>Changer</button>
            </div>

            {/* Infos de base */}
            <div className="card">
              <div className="card-title">🪪 Identité</div>
              <div className="card-sub">Ton nom est affiché sur tes sujets et corrections.</div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Prénom</label>
                  <input className="form-input" defaultValue="Rania" />
                </div>
                <div className="form-group">
                  <label className="form-label">Nom</label>
                  <input className="form-input" defaultValue="Berthine" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" defaultValue={USER.email} disabled />
                  <span className="form-hint">✓ Adresse vérifiée · modifiable via Sécurité</span>
                </div>
                <div className="form-group">
                  <label className="form-label">Téléphone</label>
                  <input className="form-input" value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="+261 34 XX XXX XX" />
                </div>
                <div className="form-group full">
                  <label className="form-label">Bio courte</label>
                  <textarea className="form-textarea" value={editBio} onChange={e => setEditBio(e.target.value)} placeholder="Décris-toi en quelques mots..." />
                  <span className="form-hint">{editBio.length}/300 caractères · visible sur ton profil public contributeur</span>
                </div>
              </div>
              <div className="form-actions">
                <button className="btn-save" onClick={handleSave}>{saved ? "✓ Sauvegardé !" : "💾 Sauvegarder"}</button>
              </div>
            </div>

            {/* Scolarité */}
            <div className="card">
              <div className="card-title">🎓 Scolarité</div>
              <div className="card-sub">Utilisé pour personnaliser le catalogue et les recommandations IA.</div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Niveau scolaire</label>
                  <select className="form-select" defaultValue="Terminale C">
                    {["3e","2nde","1ère","Terminale A","Terminale C","Terminale D","Terminale G","Licence L1","Licence L2","Licence L3","Master"].map(n => <option key={n}>{n}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Région</label>
                  <select className="form-select" defaultValue="Antananarivo">
                    {["Antananarivo","Toamasina","Mahajanga","Fianarantsoa","Toliara","Antsiranana","Antsirabe"].map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div className="form-group full">
                  <label className="form-label">Établissement</label>
                  <input className="form-input" defaultValue={USER.etablissement} placeholder="Ton lycée ou université" />
                </div>
                <div className="form-group full">
                  <label className="form-label">Matières préférées</label>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:4 }}>
                    {["Mathématiques","Physique-Chimie","SVT","Français","Histoire-Géo","Philosophie","Économie"].map(m => {
                      const on = ["Mathématiques","Physique-Chimie","SVT"].includes(m);
                      return (
                        <button key={m} style={{ padding:"5px 12px", borderRadius:8, border:`1px solid ${on?"rgba(10,255,224,.25)":"var(--border)"}`, background: on ? "rgba(10,255,224,.07)":"transparent", color: on ? "var(--teal)":"var(--muted)", fontFamily:"var(--font)", fontSize:12, cursor:"pointer", transition:"all .2s" }}>
                          {m}
                        </button>
                      );
                    })}
                  </div>
                  <span className="form-hint">Sélectionne tes matières pour des recommandations personnalisées</span>
                </div>
              </div>
              <div className="form-actions">
                <button className="btn-save" onClick={handleSave}>💾 Sauvegarder</button>
              </div>
            </div>
          </div>

          {/* ── ROLES ── */}
          <div className={`section ${activeSection === "roles" ? "visible" : ""}`}>
            <div className="section-header">
              <div className="section-title">Mes rôles</div>
              <div className="section-sub">Tu cumules les rôles — chaque rôle est indépendant et te donne des droits et des revenus distincts.</div>
            </div>

            {/* Progression vers le prochain rôle */}
            <div className="card" style={{ background:"linear-gradient(135deg,rgba(10,255,224,.05),var(--bg2))", borderColor:"rgba(10,255,224,.15)", marginBottom:14 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                <div>
                  <div className="card-title">🏅 Niveau Contributeur Or</div>
                  <div style={{ fontSize:12, color:"var(--muted)", marginTop:2 }}>5 104 consultations · Prochain palier : Platine à 7 900</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontFamily:"var(--mono)", fontSize:20, fontWeight:800, color:"var(--teal)", letterSpacing:-1 }}>{barW}%</div>
                  <div style={{ fontSize:10, color:"var(--muted)", fontFamily:"var(--mono)" }}>vers Platine</div>
                </div>
              </div>
              <div className="prog-track">
                <div className="prog-fill" style={{ width:`${barW}%`, background:"linear-gradient(90deg,var(--teal),var(--green))" }} />
              </div>
              <div style={{ fontSize:11, color:"var(--muted)", fontFamily:"var(--mono)", marginTop:6 }}>Encore <strong style={{ color:"var(--teal)" }}>2 796 consultations</strong> pour atteindre le niveau Platine (commission 55%)</div>
            </div>

            {/* Rôles actifs */}
            <div style={{ fontSize:12, color:"var(--muted)", fontFamily:"var(--mono)", letterSpacing:".1em", textTransform:"uppercase", marginBottom:10 }}>Rôles actifs & en cours</div>
            <div className="roles-grid">
              {ROLES_ACTIFS.map(role => (
                <div key={role.id} className={`role-card ${role.status === "active" ? "active-role" : role.status === "pending" ? "pending-role" : "inactive-role"}`}>
                  <div className="rc-top">
                    <div className="rc-icon" style={{ background: role.bg, borderColor: role.bc, color: role.color }}>{role.icon}</div>
                    <span className={`rc-status ${role.status === "active" ? "rs-active" : role.status === "pending" ? "rs-pending" : "rs-locked"}`}>
                      {role.status === "active" ? "✓ Actif" : role.status === "pending" ? "⏳ En attente" : "🔒 Inactif"}
                    </span>
                  </div>
                  <div className="rc-name">{role.name}</div>
                  <div className="rc-desc">{role.desc}</div>
                  <div className="rc-stats">
                    {role.stats.map(s => (
                      <div key={s.label} className="rc-stat">{s.label} : <span>{s.val}</span></div>
                    ))}
                  </div>
                  {role.status === "active" && (
                    <button className="rc-action" style={{ background:"rgba(255,255,255,.03)", borderColor:"var(--border)", color:"var(--muted)" }}
                      onClick={() => showToast(`📊 Accès à l'espace ${role.name}`)}>
                      Accéder →
                    </button>
                  )}
                  {role.status === "pending" && (
                    <button className="rc-action" style={{ background:"rgba(255,209,102,.06)", borderColor:"rgba(255,209,102,.2)", color:"var(--gold)" }}>
                      ⏳ Validation sous 1-2 jours
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Upgrade */}
            <div className="upgrade-section">
              <div className="us-title">🚀 Ajouter un nouveau rôle</div>
              <div className="us-sub">Chaque rôle te donne accès à de nouvelles fonctionnalités et sources de revenus. Tu gardes tous tes rôles existants.</div>
              <div className="upgrade-grid">
                {MODAL_CONFIGS && Object.entries(MODAL_CONFIGS).map(([id, cfg]) => (
                  <div key={id} className="ug-card" onClick={() => setModal(id)}>
                    <div className="ug-icon">{cfg.icon}</div>
                    <div className="ug-name">{cfg.title.replace("Devenir ", "")}</div>
                    <div className="ug-req">{MODAL_CONFIGS[id].reqs[0]}</div>
                    <button className="ug-btn">Postuler →</button>
                  </div>
                ))}
                <div className="ug-card" style={{ opacity:.5, cursor:"default" }}>
                  <div className="ug-icon">⚙️</div>
                  <div className="ug-name">Admin</div>
                  <div className="ug-req">Nomination interne · Fondateur uniquement</div>
                  <button className="ug-btn" disabled style={{ cursor:"not-allowed" }}>🔒 Fermé</button>
                </div>
              </div>
            </div>

            {/* Journal */}
            <div className="card">
              <div className="card-title">📋 Journal des changements de rôle</div>
              <div style={{ marginTop:12 }}>
                {[
                  { date:"18 nov. 2024", action:"Rôle Vérificatrice soumis", status:"En attente", color:"var(--gold)" },
                  { date:"3 oct. 2024", action:"Rôle Contributrice activé", status:"Approuvé", color:"var(--green)" },
                  { date:"15 juin 2024", action:"Rôle Étudiante activé", status:"Automatique", color:"var(--teal)" },
                ].map((e, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom: i < 2 ? "1px solid rgba(255,255,255,.04)" : "none" }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:e.color, flexShrink:0 }} />
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:600 }}>{e.action}</div>
                      <div style={{ fontSize:10, color:"var(--muted)", fontFamily:"var(--mono)", marginTop:2 }}>{e.date}</div>
                    </div>
                    <span style={{ fontSize:10, padding:"2px 9px", borderRadius:100, border:"1px solid", borderColor:e.color, color:e.color, fontFamily:"var(--mono)", fontWeight:700, background:`${e.color}11` }}>{e.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── PAIEMENT ── */}
          <div className={`section ${activeSection === "paiement" ? "visible" : ""}`}>
            <div className="section-header">
              <div className="section-title">MVola & Paiements</div>
              <div className="section-sub">Gère tes méthodes de paiement et consulte l'historique de tes transactions.</div>
            </div>

            {/* MVola principale */}
            <div className="mvola-card">
              <div className="mvola-header">
                <div className="mvola-logo">M</div>
                <div className="mvola-info">
                  <div className="mvola-name">MVola — Méthode principale</div>
                  <div className="mvola-num">034 56 789 10</div>
                  <div className="mvola-verified">Numéro vérifié</div>
                </div>
                <button className="btn-secondary" onClick={() => showToast("✏️ Modification du numéro MVola")}>Modifier</button>
              </div>

              <div className="mvola-balance">
                <div>
                  <div className="mb-label">💰 GAINS EN ATTENTE</div>
                  <div className="mb-amount">45 250 Ar</div>
                  <div className="mb-sub">Retrait minimum : 5 000 Ar</div>
                </div>
                <button className="btn-save" onClick={() => showToast("💸 Demande de retrait MVola envoyée !")}>
                  Retirer →
                </button>
              </div>

              <div style={{ fontSize:11, color:"var(--muted)", fontFamily:"var(--mono)", marginBottom:10 }}>MÉTHODES DISPONIBLES</div>
              <div className="mvola-methods">
                {[
                  { icon:"🟥", name:"MVola", num:"034 XX XXX XX" },
                  { icon:"🟧", name:"Orange Money", num:"Non configuré" },
                  { icon:"🟦", name:"Airtel Money", num:"Non configuré" },
                ].map((m, i) => (
                  <div key={i} className={`mm-card ${mvola === i ? "on" : ""}`} onClick={() => setMvola(i)}>
                    <div className="mm-icon">{m.icon}</div>
                    <div className="mm-name">{m.name}</div>
                    <div className="mm-num">{m.num}</div>
                  </div>
                ))}
              </div>
              {mvola > 0 && (
                <div style={{ marginTop:12 }}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Numéro {["MVola","Orange Money","Airtel Money"][mvola]}</label>
                      <input className="form-input" placeholder="+261 XX XX XXX XX" />
                    </div>
                  </div>
                  <div className="form-actions">
                    <button className="btn-save" onClick={() => showToast("📱 Numéro ajouté et vérifié !")}>💾 Sauvegarder</button>
                  </div>
                </div>
              )}
            </div>

            {/* Historique */}
            <div className="card">
              <div className="card-title" style={{ justifyContent:"space-between" }}>
                📋 Historique des transactions
                <button className="btn-secondary" style={{ fontSize:11, padding:"5px 12px" }} onClick={() => showToast("📄 Export CSV en cours...")}>Export CSV</button>
              </div>
              <div style={{ marginTop:14 }}>
                {TRANSACTIONS.map((tx, i) => (
                  <div key={i} className="tx-item">
                    <div className={`tx-icon ${tx.type === "in" ? "tx-in" : "tx-out"}`}>{tx.icon}</div>
                    <div className="tx-info">
                      <div className="tx-label">{tx.label}</div>
                      <div className="tx-date">{tx.date}</div>
                    </div>
                    <div className="tx-amount" style={{ color: tx.type === "in" ? "var(--green)" : "var(--rose)" }}>{tx.amount}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── CREDITS ── */}
          <div className={`section ${activeSection === "credits" ? "visible" : ""}`}>
            <div className="section-header">
              <div className="section-title">Crédits & Abonnement</div>
              <div className="section-sub">Recharge tes crédits ou souscris à un abonnement mensuel.</div>
            </div>
            <div className="card" style={{ background:"linear-gradient(135deg,rgba(10,255,224,.06),var(--bg2))", borderColor:"rgba(10,255,224,.15)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:20, marginBottom:20 }}>
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontSize:56, fontWeight:800, letterSpacing:-3, color:"var(--teal)", fontFamily:"var(--mono)", lineHeight:1 }}>12</div>
                  <div style={{ fontSize:11, color:"var(--muted)", fontFamily:"var(--mono)", marginTop:4 }}>crédits disponibles</div>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:700, marginBottom:8 }}>💡 Utilise tes crédits pour :</div>
                  {["Consulter un sujet (1-3 crédits)","Obtenir une correction IA (2-4 crédits)","Démarrer un examen blanc (2 crédits)","Demander une correction Professeur (6-10 crédits)"].map((t, i) => (
                    <div key={i} style={{ fontSize:12, color:"var(--muted)", display:"flex", alignItems:"center", gap:7, marginBottom:5 }}>
                      <span style={{ color:"var(--teal)" }}>→</span>{t}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-title">💳 Recharger des crédits</div>
              <div className="card-sub">Paiement sécurisé via MVola, Orange Money ou Airtel Money.</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
                {[
                  { credits:10, ar:"5 000", label:"Starter" },
                  { credits:25, ar:"11 000", label:"Révisions", featured:true },
                  { credits:60, ar:"24 000", label:"Intensif" },
                ].map(pack => (
                  <div key={pack.credits} style={{ background: pack.featured ? "linear-gradient(135deg,rgba(10,255,224,.08),rgba(10,255,224,.03))" : "var(--bg3)", border:`1px solid ${pack.featured ? "rgba(10,255,224,.25)" : "var(--border)"}`, borderRadius:12, padding:16, textAlign:"center", cursor:"pointer", transition:"all .2s", position:"relative" }}
                    onClick={() => showToast(`💳 Achat du pack ${pack.label} en cours...`)}>
                    {pack.featured && <div style={{ position:"absolute", top:-8, left:"50%", transform:"translateX(-50%)", background:"var(--teal)", color:"var(--bg)", fontSize:9, fontWeight:800, padding:"2px 10px", borderRadius:100, fontFamily:"var(--mono)", whiteSpace:"nowrap" }}>POPULAIRE</div>}
                    <div style={{ fontSize:26, fontWeight:800, color: pack.featured ? "var(--teal)" : "var(--text)", letterSpacing:-1, fontFamily:"var(--mono)" }}>{pack.credits}</div>
                    <div style={{ fontSize:11, color:"var(--muted)", fontFamily:"var(--mono)", marginBottom:8 }}>crédits</div>
                    <div style={{ fontSize:16, fontWeight:700, marginBottom:2 }}>{pack.ar} Ar</div>
                    <div style={{ fontSize:10, color:"var(--muted)" }}>{pack.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── NOTIFICATIONS ── */}
          <div className={`section ${activeSection === "notifications" ? "visible" : ""}`}>
            <div className="section-header">
              <div className="section-title">Notifications</div>
              <div className="section-sub">Choisis quand et comment Mah.AI te contacte. Les alertes de sécurité sont toujours activées.</div>
            </div>

            {/* Canaux */}
            <div className="card" style={{ marginBottom:14 }}>
              <div className="card-title">📡 Canaux de notification</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginTop:14 }}>
                {[
                  { icon:"📧", label:"Email", active:true },
                  { icon:"📱", label:"Push mobile", active:true },
                  { icon:"💬", label:"SMS", active:false },
                ].map(c => (
                  <div key={c.label} style={{ background:"var(--bg3)", border:`1px solid ${c.active ? "rgba(10,255,224,.2)" : "var(--border)"}`, borderRadius:10, padding:"12px 14px", display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}
                    onClick={() => showToast(`${c.icon} Canal ${c.label} ${c.active ? "désactivé" : "activé"}`)}>
                    <span style={{ fontSize:18 }}>{c.icon}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:700 }}>{c.label}</div>
                      <div style={{ fontSize:10, color: c.active ? "var(--teal)" : "var(--muted)", fontFamily:"var(--mono)" }}>{c.active ? "Activé" : "Désactivé"}</div>
                    </div>
                    <button className={`toggle ${c.active ? "on" : "off"}`} />
                  </div>
                ))}
              </div>
            </div>

            {NOTIFS.map(group => (
              <div key={group.section} className="card" style={{ marginBottom:14 }}>
                <div className="card-title">{group.section}</div>
                <div style={{ marginTop:12 }}>
                  {group.items.map(item => (
                    <div key={item.key} className="notif-row">
                      <div className="nr-left">
                        <div className="nr-icon">{item.icon}</div>
                        <div>
                          <div className="nr-label">{item.label}</div>
                          <div className="nr-desc">{item.desc}</div>
                        </div>
                      </div>
                      <button className={`toggle ${notifState[item.key] ? "on" : "off"}`} onClick={() => toggleNotif(item.key)} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* ── SÉCURITÉ ── */}
          <div className={`section ${activeSection === "securite" ? "visible" : ""}`}>
            <div className="section-header">
              <div className="section-title">Sécurité</div>
              <div className="section-sub">Protège ton compte et tes gains. Active la double authentification recommandée.</div>
            </div>

            {[
              { icon:"🔑", title:"Mot de passe", desc:"Dernière modification : il y a 3 mois", status:"ok", label:"Modifier" },
              { icon:"📱", title:"Double authentification (2FA)", desc:"Via SMS au +261 34 56 789 10", status: security2fa ? "on" : "off", label: security2fa ? "Désactiver" : "Activer", toggle:true },
              { icon:"📧", title:"Email de récupération", desc:"rania.berthine@gmail.com · Vérifié", status:"ok", label:"Modifier" },
              { icon:"📍", title:"Appareils connectés", desc:"2 appareils actifs · Chrome & Safari", status:"ok", label:"Gérer" },
            ].map(item => (
              <div key={item.title} className="security-item" onClick={() => {
                if(item.toggle) setSecurity2fa(v => !v);
                else showToast(`🔒 ${item.title} — modification ouverte`);
              }}>
                <div className="si-left">
                  <span className="si-icon">{item.icon}</span>
                  <div>
                    <div className="si-title">{item.title}</div>
                    <div className="si-desc">{item.desc}</div>
                  </div>
                </div>
                <div className="si-right">
                  {item.toggle
                    ? <button className={`toggle ${item.status === "on" ? "on" : "off"}`} />
                    : <span className="si-status si-on">{item.label}</span>
                  }
                  {!item.toggle && <span>›</span>}
                </div>
              </div>
            ))}

            <div style={{ height:16 }} />
            <div className="danger-zone">
              <div className="dz-title">⚠️ Zone dangereuse</div>
              <div className="dz-desc">Ces actions sont irréversibles. Ton compte et tous tes gains seront supprimés définitivement si tu supprimes ton compte.</div>
              <div className="dz-actions">
                <button className="btn-danger" onClick={() => showToast("📤 Export de tes données envoyé par email")}>Exporter mes données</button>
                <button className="btn-danger" onClick={() => showToast("⚠️ Confirmation requise — consulte ton email")}>Supprimer mon compte</button>
              </div>
            </div>
          </div>

          {/* ── CONFIDENTIALITÉ ── */}
          <div className={`section ${activeSection === "confidentialite" ? "visible" : ""}`}>
            <div className="section-header">
              <div className="section-title">Confidentialité</div>
              <div className="section-sub">Contrôle ce qui est visible publiquement sur ton profil.</div>
            </div>
            <div className="card">
              <div className="card-title">👁 Visibilité du profil</div>
              <div style={{ marginTop:14 }}>
                {[
                  { label:"Profil public contributeur", desc:"Ton nom et tes sujets sont visibles dans le catalogue", key:"pub_contrib", on:true },
                  { label:"Afficher mes statistiques", desc:"Nombre de consultations et note moyenne visibles", key:"show_stats", on:true },
                  { label:"Apparaître dans les suggestions", desc:"L'IA peut recommander tes sujets aux étudiants", key:"suggestions", on:true },
                  { label:"Partage anonyme des progrès", desc:"Données agrégées pour les comparaisons anonymes", key:"anon_stats", on:false },
                ].map(item => (
                  <div key={item.key} className="notif-row">
                    <div className="nr-left">
                      <div>
                        <div className="nr-label">{item.label}</div>
                        <div className="nr-desc">{item.desc}</div>
                      </div>
                    </div>
                    <button className={`toggle ${item.on ? "on" : "off"}`} onClick={() => showToast(`Préférence "${item.label}" modifiée`)} />
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <div className="card-title">🍪 Cookies & Analytics</div>
              <div className="card-sub">Mah.AI n'affiche aucune publicité. Ces données servent uniquement à améliorer le produit.</div>
              {[
                { label:"Cookies essentiels", desc:"Connexion, sécurité — toujours actifs", on:true, locked:true },
                { label:"Analytics produit (PostHog)", desc:"Pages visitées, fonctionnalités utilisées", on:true, locked:false },
                { label:"Suivi des erreurs (Sentry)", desc:"Rapports d'erreur anonymes", on:true, locked:false },
              ].map(item => (
                <div key={item.label} className="notif-row">
                  <div className="nr-left">
                    <div>
                      <div className="nr-label">{item.label}</div>
                      <div className="nr-desc">{item.desc}</div>
                    </div>
                  </div>
                  <button className={`toggle ${item.on ? "on" : "off"}`} disabled={item.locked} style={{ opacity: item.locked ? .5 : 1 }} />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── MODALS ── */}

      {/* Modal Avatar */}
      {modal === "avatar" && (
        <div className="overlay" onClick={e => { if(e.target === e.currentTarget) setModal(null); }}>
          <div className="modal">
            <button className="modal-close" onClick={() => setModal(null)}>×</button>
            <div className="modal-icon">🖼</div>
            <div className="modal-title">Photo de profil</div>
            <div className="modal-sub">Ta photo apparaît sur tes sujets et ton profil public contributeur.</div>
            <div className="upload-zone" onClick={() => showToast("📁 Sélecteur de fichier ouvert...")}>
              <div className="uz-icon">📸</div>
              <div className="uz-text"><strong>Clique pour choisir</strong> ou glisse ton image ici</div>
              <div className="uz-formats">JPG, PNG, WebP · Max 2 MB · Recommandé 400×400px</div>
            </div>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap", justifyContent:"center", marginBottom:18 }}>
              {["👩‍🎓","👨‍🎓","👩‍🏫","👨‍🏫","🧑‍💻","👩‍💼","👨‍💼","🎓"].map(e => (
                <div key={e} onClick={() => showToast(`Avatar ${e} sélectionné !`)} style={{ width:52, height:52, borderRadius:14, background:"var(--bg3)", border:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, cursor:"pointer", transition:"all .2s" }}>
                  {e}
                </div>
              ))}
            </div>
            <button className="btn-submit" onClick={() => { setModal(null); showToast("✅ Photo de profil mise à jour !"); }}>
              Sauvegarder
            </button>
          </div>
        </div>
      )}

      {/* Modal Rôle (Professeur / Vérificateur) */}
      {(modal === "professeur" || modal === "verificateur") && (() => {
        const cfg = MODAL_CONFIGS[modal];
        return (
          <div className="overlay" onClick={e => { if(e.target === e.currentTarget) setModal(null); }}>
            <div className="modal">
              <button className="modal-close" onClick={() => setModal(null)}>×</button>
              <div className="modal-icon">{cfg.icon}</div>
              <div className="modal-title" style={{ color: cfg.color }}>{cfg.title}</div>
              <div className="modal-sub">{cfg.sub}</div>

              <div className="modal-req">
                <div className="modal-req-title">PRÉREQUIS</div>
                {cfg.reqs.map((r, i) => (
                  <div key={i} className="modal-req-item">{r}</div>
                ))}
              </div>

              <div className="modal-form">
                {cfg.fields.map((f, i) => (
                  <div key={i} className="form-group">
                    <label className="form-label">{f.label}</label>
                    {f.type === "select" ? (
                      <select className="form-select">
                        <option value="">Sélectionner...</option>
                        {f.opts.map(o => <option key={o}>{o}</option>)}
                      </select>
                    ) : f.type === "textarea" ? (
                      <textarea className="form-textarea" placeholder={f.ph} />
                    ) : (
                      <input className="form-input" placeholder={f.ph} />
                    )}
                  </div>
                ))}

                {modal === "professeur" && (
                  <div className="form-group">
                    <label className="form-label">Justificatif (diplôme ou carte enseignant)</label>
                    <div className="upload-zone" onClick={() => showToast("📁 Sélecteur ouvert...")}>
                      <div className="uz-icon">📄</div>
                      <div className="uz-text"><strong>Uploader le document</strong></div>
                      <div className="uz-formats">PDF, JPG, PNG · Max 5 MB</div>
                    </div>
                  </div>
                )}

                <div style={{ background:"rgba(255,209,102,.04)", border:"1px solid rgba(255,209,102,.15)", borderRadius:10, padding:"11px 14px", fontSize:12, color:"var(--muted)" }}>
                  ⏱ Délai de traitement : <strong style={{ color:"var(--gold)" }}>{modal === "professeur" ? "3-7 jours" : "24-48h"}</strong> · Tu seras notifié par email
                </div>

                <button className="btn-submit" onClick={() => {
                  setModal(null);
                  showToast(`✅ Candidature ${cfg.title.toLowerCase()} envoyée — traitement sous ${modal === "professeur" ? "3-7j" : "24-48h"}`);
                }}>
                  Envoyer ma candidature →
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      <div className={`toast ${toast.show ? "show" : ""}`}>
        <span style={{ fontSize: 17 }}>✨</span>
        <span>{toast.msg}</span>
      </div>
    </div>
  );
}
