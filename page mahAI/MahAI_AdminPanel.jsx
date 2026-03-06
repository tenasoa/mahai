import { useState, useEffect, useRef } from "react";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,700;12..96,800&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --teal:#0AFFE0;--teal2:#00C9A7;--green:#00FF88;--gold:#FFD166;
    --rose:#FF6B9D;--blue:#4F8EF7;--purple:#A78BFA;--orange:#FF9F43;
    --red:#FF4444;
    --bg:#050709;--bg2:#0A0F1A;--bg3:#0F1520;--bg4:#060C14;
    --border:rgba(255,255,255,.06);--border2:rgba(10,255,224,.18);
    --text:#F0F4FF;--muted:#5A6880;--muted2:#2E3A50;
    --font:'Bricolage Grotesque',sans-serif;--mono:'DM Mono',monospace;
    --r:12px;
    --sidebar:220px;
  }
  html,body{height:100%;overflow:hidden}
  body{font-family:var(--font);background:var(--bg);color:var(--text);-webkit-font-smoothing:antialiased}
  ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:var(--muted2);border-radius:2px}

  /* ── LAYOUT ── */
  .app{display:grid;grid-template-columns:var(--sidebar) 1fr;height:100vh;overflow:hidden;position:relative;z-index:1}

  /* ── SIDEBAR ── */
  .sidebar{
    display:flex;flex-direction:column;
    background:var(--bg2);border-right:1px solid var(--border);
    overflow:hidden;
  }
  .sb-logo{padding:20px 18px 14px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px}
  .sb-logo-text{font-size:17px;font-weight:800;letter-spacing:-1px;background:linear-gradient(135deg,var(--teal),var(--green));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
  .sb-admin-badge{font-size:8px;font-family:var(--mono);font-weight:700;background:rgba(255,68,68,.12);border:1px solid rgba(255,68,68,.25);color:var(--red);padding:2px 7px;border-radius:100px}

  .sb-nav{flex:1;overflow-y:auto;padding:10px 0}
  .sb-section{padding:8px 14px 4px;font-size:9px;font-family:var(--mono);color:var(--muted2);letter-spacing:.12em;text-transform:uppercase}
  .sb-item{
    display:flex;align-items:center;gap:9px;padding:8px 14px;
    font-size:12px;font-weight:600;color:var(--muted);cursor:pointer;
    transition:all .18s;position:relative;border-radius:0;
    margin:1px 0;
  }
  .sb-item:hover{background:rgba(255,255,255,.03);color:var(--text)}
  .sb-item.active{background:rgba(10,255,224,.06);color:var(--teal)}
  .sb-item.active::before{content:'';position:absolute;left:0;top:4px;bottom:4px;width:3px;background:var(--teal);border-radius:0 2px 2px 0}
  .sb-icon{font-size:14px;width:16px;text-align:center;flex-shrink:0}
  .sb-badge{margin-left:auto;font-size:9px;font-family:var(--mono);font-weight:700;padding:1px 6px;border-radius:100px}
  .sb-badge-red{background:rgba(255,68,68,.12);border:1px solid rgba(255,68,68,.2);color:var(--red)}
  .sb-badge-gold{background:rgba(255,209,102,.1);border:1px solid rgba(255,209,102,.2);color:var(--gold)}

  .sb-footer{padding:12px 14px;border-top:1px solid var(--border)}
  .sb-user{display:flex;align-items:center;gap:9px}
  .sb-avatar{width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,#1A0020,var(--red));display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;border:1px solid rgba(255,68,68,.2)}
  .sb-name{font-size:11px;font-weight:700}
  .sb-role{font-size:9px;font-family:var(--mono);color:var(--red)}

  /* ── MAIN ── */
  .main{display:flex;flex-direction:column;overflow:hidden}

  /* Topbar */
  .topbar{
    height:52px;flex-shrink:0;
    display:flex;align-items:center;justify-content:space-between;
    padding:0 24px;
    background:var(--bg2);border-bottom:1px solid var(--border);
  }
  .tb-title{font-size:14px;font-weight:700;display:flex;align-items:center;gap:8px}
  .tb-right{display:flex;align-items:center;gap:8px}
  .tb-btn{background:transparent;border:1px solid var(--border);color:var(--muted);padding:5px 12px;border-radius:7px;font-family:var(--font);font-size:11px;cursor:pointer;transition:all .18s;display:flex;align-items:center;gap:5px;white-space:nowrap}
  .tb-btn:hover{border-color:rgba(255,255,255,.15);color:var(--text)}
  .tb-btn.primary{background:rgba(10,255,224,.08);border-color:rgba(10,255,224,.2);color:var(--teal)}
  .tb-search{background:var(--bg3);border:1px solid var(--border);border-radius:7px;padding:5px 12px;color:var(--text);font-family:var(--mono);font-size:11px;outline:none;width:200px;transition:border-color .2s}
  .tb-search:focus{border-color:var(--border2)}
  .tb-search::placeholder{color:var(--muted)}

  /* Content scroll area */
  .content{flex:1;overflow-y:auto;padding:20px 24px}

  /* ── KPI GRID ── */
  .kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px}
  .kpi-card{
    background:var(--bg2);border:1px solid var(--border);border-radius:var(--r);
    padding:14px 16px;transition:border-color .2s;position:relative;overflow:hidden;cursor:pointer;
  }
  .kpi-card:hover{border-color:rgba(255,255,255,.1)}
  .kpi-card::after{content:'';position:absolute;bottom:0;left:0;right:0;height:2px;opacity:.6}
  .kp-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:8px}
  .kp-icon{font-size:18px}
  .kp-delta{font-size:10px;font-family:var(--mono);font-weight:700;padding:2px 7px;border-radius:100px;display:flex;align-items:center;gap:3px}
  .kp-delta.up{background:rgba(0,255,136,.08);border:1px solid rgba(0,255,136,.2);color:var(--green)}
  .kp-delta.down{background:rgba(255,68,68,.07);border:1px solid rgba(255,68,68,.18);color:var(--red)}
  .kp-num{font-family:var(--mono);font-size:28px;font-weight:800;letter-spacing:-1.5px;line-height:1;margin-bottom:3px}
  .kp-label{font-size:10px;color:var(--muted);font-family:var(--mono)}

  /* ── GRID 2 COL ── */
  .grid2{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px}
  .grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-bottom:14px}

  /* ── PANEL ── */
  .panel{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r);overflow:hidden}
  .panel-header{padding:12px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
  .panel-title{font-size:12px;font-weight:700;display:flex;align-items:center;gap:7px}
  .panel-action{font-size:11px;color:var(--muted);font-family:var(--mono);cursor:pointer;transition:color .18s}
  .panel-action:hover{color:var(--teal)}

  /* ── TABLE ── */
  .table-wrap{overflow-x:auto}
  table{width:100%;border-collapse:collapse}
  th{padding:8px 12px;font-size:9px;font-family:var(--mono);color:var(--muted);font-weight:700;letter-spacing:.1em;text-transform:uppercase;text-align:left;border-bottom:1px solid var(--border);white-space:nowrap}
  td{padding:9px 12px;font-size:11px;border-bottom:1px solid rgba(255,255,255,.03);vertical-align:middle}
  tr:last-child td{border-bottom:none}
  tr:hover td{background:rgba(255,255,255,.015)}
  .td-name{font-weight:700;display:flex;align-items:center;gap:7px}
  .td-avatar{width:24px;height:24px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0;border:1px solid var(--border)}
  .td-email{font-family:var(--mono);color:var(--muted);font-size:10px}
  .td-mono{font-family:var(--mono);font-size:10px}

  /* Role chips */
  .chip{display:inline-flex;align-items:center;gap:3px;padding:2px 7px;border-radius:5px;font-size:9px;font-weight:700;font-family:var(--mono);border:1px solid;margin:1px}
  .chip-teal{background:rgba(10,255,224,.07);border-color:rgba(10,255,224,.2);color:var(--teal)}
  .chip-gold{background:rgba(255,209,102,.07);border-color:rgba(255,209,102,.2);color:var(--gold)}
  .chip-purple{background:rgba(167,139,250,.07);border-color:rgba(167,139,250,.2);color:var(--purple)}
  .chip-blue{background:rgba(79,142,247,.07);border-color:rgba(79,142,247,.2);color:var(--blue)}
  .chip-green{background:rgba(0,255,136,.07);border-color:rgba(0,255,136,.2);color:var(--green)}
  .chip-rose{background:rgba(255,107,157,.07);border-color:rgba(255,107,157,.2);color:var(--rose)}
  .chip-muted{background:rgba(255,255,255,.03);border-color:var(--border);color:var(--muted)}
  .chip-red{background:rgba(255,68,68,.07);border-color:rgba(255,68,68,.2);color:var(--red)}

  /* Status dot */
  .st-dot{display:inline-flex;align-items:center;gap:5px;font-size:10px;font-family:var(--mono)}
  .st-dot::before{content:'';width:6px;height:6px;border-radius:50%;flex-shrink:0}
  .st-active::before{background:var(--green);box-shadow:0 0 5px var(--green)}
  .st-pending::before{background:var(--gold);box-shadow:0 0 5px var(--gold)}
  .st-rejected::before{background:var(--rose)}
  .st-banned::before{background:var(--red)}

  /* Action buttons */
  .act-btn{background:transparent;border:1px solid var(--border);color:var(--muted);padding:3px 8px;border-radius:5px;font-size:10px;font-family:var(--mono);cursor:pointer;transition:all .15s;white-space:nowrap}
  .act-btn:hover{border-color:rgba(255,255,255,.2);color:var(--text)}
  .act-btn.approve{border-color:rgba(0,255,136,.2);color:var(--green)}
  .act-btn.approve:hover{background:rgba(0,255,136,.08)}
  .act-btn.reject{border-color:rgba(255,107,157,.2);color:var(--rose)}
  .act-btn.reject:hover{background:rgba(255,107,157,.07)}
  .act-btn.warn{border-color:rgba(255,209,102,.2);color:var(--gold)}

  /* ── DEMANDES RÔLES ── */
  .demand-item{padding:12px 16px;border-bottom:1px solid rgba(255,255,255,.04);display:flex;align-items:flex-start;gap:12px;transition:background .15s;cursor:pointer}
  .demand-item:last-child{border-bottom:none}
  .demand-item:hover{background:rgba(255,255,255,.015)}
  .di-avatar{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0;border:1px solid}
  .di-info{flex:1;min-width:0}
  .di-name{font-size:12px;font-weight:700;display:flex;align-items:center;gap:6px;margin-bottom:2px}
  .di-meta{font-size:10px;color:var(--muted);font-family:var(--mono);margin-bottom:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .di-docs{font-size:10px;font-family:var(--mono);color:var(--blue);text-decoration:underline;cursor:pointer}
  .di-actions{display:flex;flex-direction:column;gap:4px;align-items:flex-end;flex-shrink:0}
  .di-time{font-size:9px;font-family:var(--mono);color:var(--muted2);margin-bottom:4px;text-align:right}

  /* ── CHART MINI ── */
  .chart-mini{padding:14px 16px}
  .cm-bars{display:flex;align-items:flex-end;gap:4px;height:60px;margin-bottom:8px}
  .cm-bar{flex:1;border-radius:3px 3px 0 0;transition:height 1s cubic-bezier(.4,0,.2,1);cursor:pointer;min-width:0}
  .cm-bar:hover{opacity:.75}
  .cm-labels{display:flex;gap:4px}
  .cm-label{flex:1;font-size:8px;font-family:var(--mono);color:var(--muted2);text-align:center;white-space:nowrap;overflow:hidden;text-overflow:clip}

  /* ── ACTIVITY FEED ── */
  .feed-item{display:flex;align-items:flex-start;gap:10px;padding:9px 16px;border-bottom:1px solid rgba(255,255,255,.03);font-size:11px}
  .feed-item:last-child{border-bottom:none}
  .fi-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:3px}
  .fi-text{flex:1;color:var(--muted);line-height:1.5}
  .fi-text strong{color:var(--text)}
  .fi-time{font-size:9px;font-family:var(--mono);color:var(--muted2);flex-shrink:0;white-space:nowrap}

  /* ── PAYMENT ROW ── */
  .pay-row{display:flex;align-items:center;gap:10px;padding:9px 16px;border-bottom:1px solid rgba(255,255,255,.03);font-size:11px}
  .pay-row:last-child{border-bottom:none}
  .pay-icon{width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;border:1px solid}
  .pay-info{flex:1;min-width:0}
  .pay-name{font-weight:700;font-size:11px}
  .pay-meta{font-size:9px;font-family:var(--mono);color:var(--muted)}
  .pay-amount{font-family:var(--mono);font-size:12px;font-weight:800;flex-shrink:0}

  /* ── MODAL ── */
  .overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:200;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(12px);animation:fadeIn .2s ease;padding:20px}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  .modal{background:var(--bg2);border:1px solid var(--border);border-radius:18px;padding:28px;width:100%;max-width:480px;position:relative;animation:modalIn .35s cubic-bezier(.34,1.56,.64,1)}
  @keyframes modalIn{from{opacity:0;transform:scale(.88) translateY(16px)}to{opacity:1;transform:scale(1) translateY(0)}}
  .modal-close{position:absolute;top:12px;right:12px;background:var(--bg3);border:1px solid var(--border);color:var(--muted);width:26px;height:26px;border-radius:7px;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;transition:all .2s}
  .modal-close:hover{border-color:rgba(255,255,255,.2);color:var(--text)}
  .m-title{font-size:17px;font-weight:800;letter-spacing:-.5px;margin-bottom:4px}
  .m-sub{font-size:12px;color:var(--muted);margin-bottom:18px;line-height:1.5}
  .m-detail{background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:16px}
  .m-row{display:flex;align-items:center;justify-content:space-between;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.04);font-size:11px}
  .m-row:last-child{border-bottom:none}
  .m-label{color:var(--muted)}
  .m-val{font-family:var(--mono);font-weight:700}
  .m-textarea{width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:9px 11px;color:var(--text);font-family:var(--font);font-size:12px;outline:none;resize:none;min-height:70px;margin-bottom:14px;transition:border-color .2s;line-height:1.5}
  .m-textarea:focus{border-color:var(--border2)}
  .m-textarea::placeholder{color:var(--muted)}
  .m-btns{display:flex;gap:8px}
  .m-btn{flex:1;padding:10px;border-radius:9px;font-family:var(--font);font-size:13px;font-weight:700;cursor:pointer;border:none;transition:all .2s}
  .m-btn-approve{background:linear-gradient(135deg,var(--green),var(--teal2));color:var(--bg)}
  .m-btn-approve:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(0,255,136,.25)}
  .m-btn-reject{background:rgba(255,107,157,.08);border:1px solid rgba(255,107,157,.2);color:var(--rose)}
  .m-btn-reject:hover{background:rgba(255,107,157,.14)}
  .m-btn-cancel{background:transparent;border:1px solid var(--border);color:var(--muted)}
  .m-btn-cancel:hover{border-color:rgba(255,255,255,.2);color:var(--text)}

  /* ── TOAST ── */
  .toast{position:fixed;bottom:20px;right:20px;background:var(--bg2);border:1px solid var(--border2);border-radius:10px;padding:10px 16px;display:flex;align-items:center;gap:8px;font-size:12px;box-shadow:0 12px 36px rgba(0,0,0,.5);z-index:400;transition:transform .4s cubic-bezier(.34,1.56,.64,1),opacity .3s;transform:translateY(60px);opacity:0}
  .toast.show{transform:translateY(0);opacity:1}

  @media(max-width:1100px){.kpi-grid{grid-template-columns:repeat(2,1fr)}.grid2{grid-template-columns:1fr}}
  @media(max-width:780px){.app{grid-template-columns:1fr}.sidebar{display:none}}
`;

// ── DATA ──────────────────────────────────────────────────────────────────

const USERS = [
  { id:1, name:"Rania Berthine", email:"rania@email.mg", avatar:"👩‍🎓", roles:["etudiant","contributeur","verificateur"], region:"Tana", joined:"15 jan 2024", status:"active", credits:12 },
  { id:2, name:"Rakoto Jean-Marie", email:"rakoto@email.mg", avatar:"✍️", roles:["contributeur"], region:"Tana", joined:"12 jan 2024", status:"active", credits:0 },
  { id:3, name:"Dr. Andriantsoa", email:"andriantsoa@email.mg", avatar:"👨‍🏫", roles:["etudiant","professeur"], region:"Tana", joined:"5 jan 2024", status:"active", credits:0 },
  { id:4, name:"Miora Andria", email:"miora@email.mg", avatar:"🧑‍🎓", roles:["etudiant"], region:"Mahajanga", joined:"2 fév 2024", status:"active", credits:4 },
  { id:5, name:"Fidy Razaka", email:"fidy@email.mg", avatar:"👨", roles:["etudiant","contributeur"], region:"Toamasina", joined:"8 fév 2024", status:"pending", credits:7 },
  { id:6, name:"Zo Rabe", email:"zo@email.mg", avatar:"🧑", roles:["etudiant"], region:"Fianarantsoa", joined:"20 fév 2024", status:"banned", credits:0 },
];

const ROLE_REQUESTS = [
  { id:1, name:"Hery Tiana", avatar:"👨‍🏫", role:"professeur", emoji:"👨‍🏫", color:"var(--purple)", bc:"rgba(167,139,250,.25)", bg:"rgba(167,139,250,.1)", diplome:"Master Mathématiques - Univ. Tana", matieres:"Maths, Physique-Chimie", time:"il y a 2h", urgency:"high", docs:2 },
  { id:2, name:"Lalaina Vao", avatar:"👁", role:"verificateur", emoji:"👁", color:"var(--blue)", bc:"rgba(79,142,247,.25)", bg:"rgba(79,142,247,.1)", diplome:"Licence Sciences - Univ. Tana", matieres:"SVT, Physique", time:"il y a 5h", urgency:"medium", docs:1 },
  { id:3, name:"Fara Nivo", avatar:"👩‍🏫", role:"professeur", emoji:"👨‍🏫", color:"var(--purple)", bc:"rgba(167,139,250,.25)", bg:"rgba(167,139,250,.1)", diplome:"Doctorat Biologie - ENS", matieres:"SVT, Biologie", time:"il y a 1j", urgency:"medium", docs:3 },
  { id:4, name:"Tiana Ravo", avatar:"✍️", role:"verificateur", emoji:"👁", color:"var(--blue)", bc:"rgba(79,142,247,.25)", bg:"rgba(79,142,247,.1)", diplome:"BAC + Licence partielle", matieres:"Français, Histoire", time:"il y a 2j", urgency:"low", docs:1 },
];

const SUJETS = [
  { id:1, emoji:"📐", title:"Maths BAC 2024 — Série C&D", contrib:"Rakoto Jean-Marie", status:"pending", aiScore:88, submitted:"il y a 2h" },
  { id:2, emoji:"🌿", title:"SVT BAC 2024 — Série D", contrib:"Miora Andria", status:"approved", aiScore:94, submitted:"il y a 5h" },
  { id:3, emoji:"⚗️", title:"Physique-Chimie Série C 2023", contrib:"Fidy Razaka", status:"revision", aiScore:62, submitted:"il y a 1j" },
  { id:4, emoji:"📖", title:"Français BEPC 2024", contrib:"Rania Berthine", status:"pending", aiScore:91, submitted:"il y a 3h" },
  { id:5, emoji:"🌍", title:"Histoire-Géo BAC 2022", contrib:"Hery Tiana", status:"rejected", aiScore:45, submitted:"il y a 2j" },
];

const PAYMENTS = [
  { icon:"💳", name:"Miora Andria", meta:"Achat 25 crédits · MVola 034XXXXXXX", amount:"+11 000 Ar", color:"var(--green)", bc:"rgba(0,255,136,.15)", bg:"rgba(0,255,136,.07)", time:"14:32" },
  { icon:"💰", name:"Rakoto Jean-Marie", meta:"Retrait gains contributeur · MVola", amount:"-27 000 Ar", color:"var(--rose)", bc:"rgba(255,107,157,.15)", bg:"rgba(255,107,157,.07)", time:"13:15" },
  { icon:"💳", name:"Fidy Razaka", meta:"Achat 10 crédits · MVola 033XXXXXXX", amount:"+5 000 Ar", color:"var(--green)", bc:"rgba(0,255,136,.15)", bg:"rgba(0,255,136,.07)", time:"11:48" },
  { icon:"💰", name:"Dr. Andriantsoa", meta:"Retrait gains professeur · MVola", amount:"-45 000 Ar", color:"var(--rose)", bc:"rgba(255,107,157,.15)", bg:"rgba(255,107,157,.07)", time:"10:20" },
  { icon:"💳", name:"Lanto Ravelona", meta:"Achat 60 crédits · Orange Money", amount:"+24 000 Ar", color:"var(--green)", bc:"rgba(0,255,136,.15)", bg:"rgba(0,255,136,.07)", time:"09:05" },
];

const ACTIVITY = [
  { dot:"var(--green)", text:<><strong>Rakoto Jean-Marie</strong> a soumis un nouveau sujet : Maths BAC 2024</>, time:"il y a 2 min" },
  { dot:"var(--teal)", text:<><strong>Miora Andria</strong> a acheté 25 crédits via MVola (+11 000 Ar)</>, time:"il y a 8 min" },
  { dot:"var(--purple)", text:<><strong>Hery Tiana</strong> a candidaté au rôle Professeur</>, time:"il y a 35 min" },
  { dot:"var(--gold)", text:<>Sujet <strong>SVT BAC 2024</strong> approuvé par le vérificateur Rania</>, time:"il y a 1h" },
  { dot:"var(--rose)", text:<><strong>Zo Rabe</strong> a été suspendu pour contenu frauduleux</>, time:"il y a 2h" },
  { dot:"var(--blue)", text:<><strong>Lalaina Vao</strong> a candidaté au rôle Vérificateur</>, time:"il y a 3h" },
];

const CHART_MONTHS = ["Oct","Nov","Déc","Jan","Fév","Mar"];
const CHART_USERS = [24, 38, 52, 71, 94, 118];
const CHART_REVENUS = [8200, 15400, 22800, 31500, 47200, 63800];

const ROLE_MAP = {
  etudiant:    { label:"Étudiant", cls:"chip-teal" },
  contributeur:{ label:"Contrib.", cls:"chip-gold" },
  professeur:  { label:"Prof.", cls:"chip-purple" },
  verificateur:{ label:"Vérif.", cls:"chip-blue" },
  admin:       { label:"Admin", cls:"chip-red" },
};

const STATUS_MAP = {
  active:  { label:"Actif", cls:"st-active" },
  pending: { label:"En attente", cls:"st-pending" },
  banned:  { label:"Suspendu", cls:"st-banned" },
};

const NAV = [
  { key:"dashboard",  icon:"📊", label:"Dashboard" },
  { key:"users",      icon:"👥", label:"Utilisateurs" },
  { key:"roles",      icon:"🔑", label:"Demandes rôles", badge:4, badgeCls:"sb-badge-red" },
  { key:"sujets",     icon:"📋", label:"Sujets", badge:2, badgeCls:"sb-badge-gold" },
  { key:"paiements",  icon:"💳", label:"Paiements" },
  { key:"config",     icon:"⚙️", label:"Configuration" },
];

export default function MahAIAdmin() {
  const [activeNav, setActiveNav]   = useState("dashboard");
  const [modal, setModal]           = useState(null);
  const [modalData, setModalData]   = useState(null);
  const [toast, setToast]           = useState({ show:false, msg:"" });
  const [userFilter, setUserFilter] = useState("all");
  const [sujetFilter, setSujetFilter] = useState("all");
  const [barHeights, setBarHeights] = useState(CHART_MONTHS.map(() => 0));
  const [kpiNums, setKpiNums]       = useState([0, 0, 0, 0]);
  const [search, setSearch]         = useState("");

  useEffect(() => {
    const s = document.createElement("style"); s.textContent = CSS; document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setBarHeights(CHART_USERS.map(v => (v / Math.max(...CHART_USERS)) * 100));
      const targets = [118, 23, 89400, 247];
      const dur = 1400; const start = Date.now();
      const tick = () => {
        const p = Math.min((Date.now() - start) / dur, 1);
        const ease = 1 - Math.pow(1-p, 3);
        setKpiNums(targets.map(t => Math.round(t * ease)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, 300);
    return () => clearTimeout(t);
  }, []);

  const showToast = msg => { setToast({ show:true, msg }); setTimeout(() => setToast({ show:false, msg:"" }), 2600); };

  const openModal = (type, data) => { setModal(type); setModalData(data); };
  const closeModal = () => { setModal(null); setModalData(null); };

  const handleDecision = (type, data, decision) => {
    closeModal();
    showToast(decision === "approve"
      ? `✅ ${data?.name} — ${data?.role === "professeur" ? "Rôle Professeur" : "Rôle Vérificateur"} accordé`
      : `❌ Demande de ${data?.name} rejetée`);
  };

  const filteredUsers = USERS.filter(u => {
    const matchFilter = userFilter === "all" || u.status === userFilter || u.roles.includes(userFilter);
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const filteredSujets = SUJETS.filter(s => sujetFilter === "all" || s.status === sujetFilter);

  const KPIs = [
    { icon:"👥", label:"Utilisateurs actifs", num:kpiNums[0], delta:"+12%", up:true, color:"var(--teal)", bc:"rgba(10,255,224,.07)" },
    { icon:"📋", label:"Sujets publiés", num:kpiNums[1], delta:"+5", up:true, color:"var(--gold)", bc:"rgba(255,209,102,.07)" },
    { icon:"💰", label:"Revenus totaux (Ar)", num:kpiNums[2].toLocaleString(), delta:"+23%", up:true, color:"var(--green)", bc:"rgba(0,255,136,.07)" },
    { icon:"🤖", label:"Corrections IA ce mois", num:kpiNums[3], delta:"+41%", up:true, color:"var(--purple)", bc:"rgba(167,139,250,.07)" },
  ];

  // ── PAGES ──────────────────────────────────────────────────────
  const PAGE = {

    dashboard: (
      <>
        <div className="kpi-grid">
          {KPIs.map((k, i) => (
            <div key={i} className="kpi-card" style={{ background:`linear-gradient(135deg,${k.bc},var(--bg2))`, borderColor: i === 0 ? "rgba(10,255,224,.15)" : "var(--border)" }}>
              <div className="kp-top">
                <span className="kp-icon">{k.icon}</span>
                <span className={`kp-delta ${k.up ? "up" : "down"}`}>{k.up ? "↑" : "↓"} {k.delta}</span>
              </div>
              <div className="kp-num" style={{ color:k.color }}>{k.num}</div>
              <div className="kp-label">{k.label}</div>
            </div>
          ))}
        </div>

        <div className="grid2">
          {/* Chart utilisateurs */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">📈 Croissance utilisateurs</div>
              <span className="panel-action">6 derniers mois</span>
            </div>
            <div className="chart-mini">
              <div className="cm-bars">
                {CHART_MONTHS.map((m, i) => (
                  <div key={m} className="cm-bar"
                    style={{ height:`${barHeights[i]}%`, background:`linear-gradient(180deg,var(--teal),var(--teal2))`, opacity:.7 + .3 * (i / CHART_MONTHS.length) }}
                    title={`${m}: ${CHART_USERS[i]} users`}
                  />
                ))}
              </div>
              <div className="cm-labels">
                {CHART_MONTHS.map(m => <div key={m} className="cm-label">{m}</div>)}
              </div>
            </div>
          </div>

          {/* Activité récente */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">⚡ Activité récente</div>
              <span className="panel-action" onClick={() => showToast("📋 Voir tout l'historique")}>Voir tout →</span>
            </div>
            <div>
              {ACTIVITY.slice(0, 5).map((a, i) => (
                <div key={i} className="feed-item">
                  <div className="fi-dot" style={{ background:a.dot }} />
                  <div className="fi-text">{a.text}</div>
                  <div className="fi-time">{a.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid2">
          {/* Demandes rôles urgentes */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">🔑 Demandes rôles urgentes <span className="sb-badge sb-badge-red">{ROLE_REQUESTS.filter(r=>r.urgency==="high").length}</span></div>
              <span className="panel-action" onClick={() => setActiveNav("roles")}>Voir toutes →</span>
            </div>
            {ROLE_REQUESTS.filter(r => r.urgency === "high").map((r, i) => (
              <div key={i} className="demand-item">
                <div className="di-avatar" style={{ background:r.bg, borderColor:r.bc }}>{r.avatar}</div>
                <div className="di-info">
                  <div className="di-name">{r.name} <span className="chip chip-purple">{r.emoji} {r.role}</span></div>
                  <div className="di-meta">{r.diplome}</div>
                  <div className="di-docs">📎 {r.docs} document(s) joint(s)</div>
                </div>
                <div className="di-actions">
                  <div className="di-time">{r.time}</div>
                  <button className="act-btn approve" onClick={() => openModal("roleDecision", r)}>Examiner</button>
                </div>
              </div>
            ))}
          </div>

          {/* Paiements récents */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">💳 Paiements récents</div>
              <span className="panel-action" onClick={() => setActiveNav("paiements")}>Voir tout →</span>
            </div>
            {PAYMENTS.slice(0, 4).map((p, i) => (
              <div key={i} className="pay-row">
                <div className="pay-icon" style={{ background:p.bg, borderColor:p.bc }}>{p.icon}</div>
                <div className="pay-info">
                  <div className="pay-name">{p.name}</div>
                  <div className="pay-meta">{p.meta}</div>
                </div>
                <div className="pay-amount" style={{ color:p.color }}>{p.amount}</div>
              </div>
            ))}
          </div>
        </div>
      </>
    ),

    users: (
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">👥 Gestion utilisateurs <span style={{ fontFamily:"var(--mono)", fontSize:11, color:"var(--muted)", fontWeight:400 }}>({filteredUsers.length} résultats)</span></div>
          <div style={{ display:"flex", gap:6 }}>
            {["all","active","pending","banned","professeur","contributeur"].map(f => (
              <button key={f} className="act-btn" style={{ background: userFilter===f ? "rgba(10,255,224,.07)" : "transparent", borderColor: userFilter===f ? "rgba(10,255,224,.2)" : "var(--border)", color: userFilter===f ? "var(--teal)" : "var(--muted)" }}
                onClick={() => setUserFilter(f)}>
                {{all:"Tous",active:"Actifs",pending:"Attente",banned:"Bannis",professeur:"Profs",contributeur:"Contribs"}[f]}
              </button>
            ))}
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Rôles</th>
                <th>Région</th>
                <th>Inscrit</th>
                <th>Crédits</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className="td-name">
                      <div className="td-avatar" style={{ background:"var(--bg3)" }}>{u.avatar}</div>
                      <div>
                        <div>{u.name}</div>
                        <div className="td-email">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{u.roles.map(r => <span key={r} className={`chip ${ROLE_MAP[r]?.cls}`}>{ROLE_MAP[r]?.label}</span>)}</td>
                  <td><span className="td-mono">{u.region}</span></td>
                  <td><span className="td-mono">{u.joined}</span></td>
                  <td><span className="td-mono" style={{ color:"var(--teal)" }}>{u.credits}</span></td>
                  <td><span className={`st-dot ${STATUS_MAP[u.status]?.cls}`}>{STATUS_MAP[u.status]?.label}</span></td>
                  <td>
                    <div style={{ display:"flex", gap:4 }}>
                      <button className="act-btn" onClick={() => showToast(`👤 Voir le profil de ${u.name}`)}>Profil</button>
                      {u.status === "active" && <button className="act-btn warn" onClick={() => showToast(`⚠️ ${u.name} suspendu`)}>Suspendre</button>}
                      {u.status === "banned" && <button className="act-btn approve" onClick={() => showToast(`✅ ${u.name} réactivé`)}>Réactiver</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ),

    roles: (
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">🔑 File de demandes de rôle <span className="sb-badge sb-badge-red">{ROLE_REQUESTS.length}</span></div>
          <div style={{ display:"flex", gap:6 }}>
            <button className="act-btn" onClick={() => showToast("📧 Rappel envoyé à tous les candidats")}>📧 Rappel global</button>
          </div>
        </div>
        {ROLE_REQUESTS.map(r => (
          <div key={r.id} className="demand-item">
            <div className="di-avatar" style={{ background:r.bg, borderColor:r.bc, width:40, height:40, fontSize:19 }}>{r.avatar}</div>
            <div className="di-info">
              <div className="di-name">
                {r.name}
                <span className="chip" style={{ background:r.bg, borderColor:r.bc, color:r.color }}>{r.emoji} {r.role}</span>
                {r.urgency === "high" && <span className="chip chip-red">URGENT</span>}
              </div>
              <div className="di-meta">🎓 {r.diplome} · 📚 {r.matieres}</div>
              <div className="di-docs">📎 {r.docs} justificatif(s) · <span style={{ color:"var(--gold)" }}>{r.matieres}</span></div>
            </div>
            <div className="di-actions">
              <div className="di-time">{r.time}</div>
              <button className="act-btn approve" onClick={() => openModal("roleDecision", r)}>Examiner →</button>
            </div>
          </div>
        ))}
      </div>
    ),

    sujets: (
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">📋 Gestion sujets</div>
          <div style={{ display:"flex", gap:5 }}>
            {["all","pending","approved","revision","rejected"].map(f => (
              <button key={f} className="act-btn"
                style={{ background: sujetFilter===f ? "rgba(10,255,224,.07)" : "transparent", borderColor: sujetFilter===f ? "rgba(10,255,224,.2)" : "var(--border)", color: sujetFilter===f ? "var(--teal)" : "var(--muted)" }}
                onClick={() => setSujetFilter(f)}>
                {{all:"Tous",pending:"En attente",approved:"Publiés",revision:"Révision",rejected:"Rejetés"}[f]}
              </button>
            ))}
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Sujet</th><th>Contributeur</th><th>Score IA</th><th>Soumis</th><th>Statut</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filteredSujets.map(s => (
                <tr key={s.id}>
                  <td><div className="td-name">{s.emoji} {s.title}</div></td>
                  <td><span className="td-mono">{s.contrib}</span></td>
                  <td>
                    <span style={{ fontFamily:"var(--mono)", fontSize:11, fontWeight:700, color: s.aiScore >= 80 ? "var(--green)" : s.aiScore >= 60 ? "var(--gold)" : "var(--rose)" }}>
                      {s.aiScore}%
                    </span>
                  </td>
                  <td><span className="td-mono">{s.submitted}</span></td>
                  <td>
                    <span className={`chip ${s.status==="approved"?"chip-green":s.status==="pending"?"chip-gold":s.status==="revision"?"chip-blue":"chip-rose"}`}>
                      {{approved:"✓ Publié",pending:"⏳ Attente",revision:"📝 Révision",rejected:"✗ Rejeté"}[s.status]}
                    </span>
                  </td>
                  <td>
                    <div style={{ display:"flex", gap:4 }}>
                      <button className="act-btn" onClick={() => showToast(`👁 Aperçu : ${s.title}`)}>Voir</button>
                      {s.status === "pending" && <>
                        <button className="act-btn approve" onClick={() => showToast(`✅ "${s.title}" approuvé`)}>Approuver</button>
                        <button className="act-btn reject" onClick={() => showToast(`❌ "${s.title}" rejeté`)}>Rejeter</button>
                      </>}
                      {s.status === "approved" && <button className="act-btn reject" onClick={() => showToast(`⚠️ "${s.title}" dépublié`)}>Dépublier</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ),

    paiements: (
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">💳 Transactions</div>
          <div style={{ display:"flex", gap:6 }}>
            <button className="act-btn" onClick={() => showToast("📊 Export CSV généré")}>📊 Export CSV</button>
            <button className="act-btn primary" onClick={() => showToast("🔄 Virements en cours...")}>🔄 Lancer virements</button>
          </div>
        </div>
        <table>
          <thead>
            <tr><th>Type</th><th>Utilisateur</th><th>Méthode</th><th>Montant</th><th>Heure</th><th>Statut</th></tr>
          </thead>
          <tbody>
            {PAYMENTS.map((p, i) => (
              <tr key={i}>
                <td><div className="pay-icon" style={{ background:p.bg, borderColor:p.bc, display:"inline-flex" }}>{p.icon}</div></td>
                <td><div className="td-name">{p.name}<div className="td-email">{p.meta}</div></div></td>
                <td><span className="chip chip-muted">MVola</span></td>
                <td><span style={{ fontFamily:"var(--mono)", fontWeight:700, color:p.color }}>{p.amount}</span></td>
                <td><span className="td-mono">{p.time}</span></td>
                <td><span className="st-dot st-active">Confirmé</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),

    config: (
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        {[
          { title:"💰 Commissions par rôle", items:[
            ["Contributeur Bronze","40%"],["Contributeur Argent","45%"],["Contributeur Or","50%"],["Contributeur Platine","55%"],
            ["Professeur","60%"],["Vérificateur (par sujet)","9 000 Ar fixe"],
          ]},
          { title:"💎 Prix des crédits", items:[
            ["Pack Starter (10 crédits)","5 000 Ar"],["Pack Révisions (25 crédits)","11 000 Ar"],["Pack Intensif (60 crédits)","24 000 Ar"],
            ["Coût moyen par consultation","2 crédits"],["Coût correction IA","3 crédits"],
          ]},
        ].map(section => (
          <div key={section.title} className="panel">
            <div className="panel-header">
              <div className="panel-title">{section.title}</div>
              <button className="act-btn primary" onClick={() => showToast("💾 Paramètres sauvegardés")}>💾 Sauvegarder</button>
            </div>
            <table>
              <tbody>
                {section.items.map(([label, val]) => (
                  <tr key={label}>
                    <td style={{ color:"var(--muted)", width:"60%" }}>{label}</td>
                    <td>
                      <input defaultValue={val} style={{ background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:7, padding:"4px 10px", color:"var(--text)", fontFamily:"var(--mono)", fontSize:12, outline:"none", width:120 }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    ),
  };

  return (
    <div className="app">
      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="sb-logo">
          <div>
            <div className="sb-logo-text">Mah.AI</div>
          </div>
          <div className="sb-admin-badge">ADMIN</div>
        </div>
        <nav className="sb-nav">
          <div className="sb-section">Navigation</div>
          {NAV.map(n => (
            <div key={n.key} className={`sb-item ${activeNav === n.key ? "active" : ""}`} onClick={() => setActiveNav(n.key)}>
              <span className="sb-icon">{n.icon}</span>
              {n.label}
              {n.badge && <span className={`sb-badge ${n.badgeCls}`}>{n.badge}</span>}
            </div>
          ))}
        </nav>
        <div className="sb-footer">
          <div className="sb-user">
            <div className="sb-avatar">⚙️</div>
            <div>
              <div className="sb-name">Admin Fondateur</div>
              <div className="sb-role">● Administrateur</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="main">
        <div className="topbar">
          <div className="tb-title">
            <span>{{dashboard:"📊 Dashboard",users:"👥 Utilisateurs",roles:"🔑 Demandes de rôles",sujets:"📋 Sujets",paiements:"💳 Paiements",config:"⚙️ Configuration"}[activeNav]}</span>
          </div>
          <div className="tb-right">
            <input className="tb-search" placeholder="🔍 Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
            <button className="tb-btn" onClick={() => showToast("🔔 Notifications — 3 nouvelles")}>🔔 3</button>
            <button className="tb-btn primary" onClick={() => showToast("🚀 Nouvelle action rapide")}>+ Action</button>
          </div>
        </div>

        <div className="content">
          {PAGE[activeNav]}
        </div>
      </div>

      {/* ── MODAL: Décision rôle ── */}
      {modal === "roleDecision" && modalData && (
        <div className="overlay" onClick={e => { if(e.target === e.currentTarget) closeModal(); }}>
          <div className="modal">
            <button className="modal-close" onClick={closeModal}>×</button>
            <div style={{ fontSize:32, marginBottom:12 }}>{modalData.avatar}</div>
            <div className="m-title">Demande de rôle — {modalData.name}</div>
            <div className="m-sub">Examine le dossier et prends une décision. Le candidat sera notifié par email.</div>
            <div className="m-detail">
              {[
                ["Candidat", modalData.name],
                ["Rôle demandé", `${modalData.emoji} ${modalData.role}`],
                ["Diplôme", modalData.diplome],
                ["Matières", modalData.matieres],
                ["Soumis", modalData.time],
                ["Documents joints", `${modalData.docs} fichier(s)`],
              ].map(([l, v]) => (
                <div key={l} className="m-row">
                  <span className="m-label">{l}</span>
                  <span className="m-val">{v}</span>
                </div>
              ))}
            </div>
            <div style={{ marginBottom:8 }}>
              <div style={{ fontSize:10, color:"var(--muted)", fontFamily:"var(--mono)", letterSpacing:".08em", textTransform:"uppercase", marginBottom:5 }}>Message au candidat (optionnel)</div>
              <textarea className="m-textarea" placeholder="Félicitations ! Votre demande a été approuvée..." />
            </div>
            <div className="m-btns">
              <button className="m-btn m-btn-approve" onClick={() => handleDecision("role", modalData, "approve")}>✅ Approuver</button>
              <button className="m-btn m-btn-reject" onClick={() => handleDecision("role", modalData, "reject")}>❌ Rejeter</button>
              <button className="m-btn m-btn-cancel" onClick={closeModal}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      <div className={`toast ${toast.show ? "show" : ""}`}>
        <span>⚙️</span><span>{toast.msg}</span>
      </div>
    </div>
  );
}
