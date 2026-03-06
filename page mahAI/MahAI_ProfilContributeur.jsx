import { useState, useEffect, useRef } from "react";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,700;12..96,800&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --gold:#FFD166;--gold2:#F5A623;--teal:#0AFFE0;--teal2:#00C9A7;
    --green:#00FF88;--rose:#FF6B9D;--blue:#4F8EF7;--purple:#A78BFA;
    --bg:#060910;--bg2:#0C1220;--bg3:#111928;
    --border:rgba(255,255,255,.07);--border2:rgba(255,209,102,.2);
    --text:#F0F4FF;--muted:#6B7899;--muted2:#3A4560;
    --font:'Bricolage Grotesque',sans-serif;--mono:'DM Mono',monospace;
    --r:16px;
  }
  html{scroll-behavior:smooth}
  body{font-family:var(--font);background:var(--bg);color:var(--text);overflow-x:hidden;-webkit-font-smoothing:antialiased}
  ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:var(--bg)}
  ::-webkit-scrollbar-thumb{background:var(--gold2);border-radius:2px}
  body::before{content:'';position:fixed;inset:0;z-index:0;opacity:.35;pointer-events:none;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")}

  .mesh{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden}
  .mesh span{position:absolute;border-radius:50%;filter:blur(150px);animation:fm 24s ease-in-out infinite alternate}
  .mesh span:nth-child(1){width:700px;height:700px;top:-200px;left:-150px;background:var(--gold);opacity:.04;animation-delay:0s}
  .mesh span:nth-child(2){width:500px;height:500px;bottom:-100px;right:-100px;background:var(--teal);opacity:.04;animation-delay:-11s}
  @keyframes fm{0%{transform:translate(0,0)}100%{transform:translate(28px,-22px)}}

  /* ── NAV ── */
  nav{
    position:fixed;top:0;left:0;right:0;z-index:100;height:58px;
    display:flex;align-items:center;justify-content:space-between;
    padding:0 32px;
    background:rgba(6,9,16,.9);backdrop-filter:blur(24px);
    border-bottom:1px solid var(--border);
  }
  .nav-logo{font-size:19px;font-weight:800;letter-spacing:-1px;background:linear-gradient(135deg,var(--teal),var(--green));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
  .nav-right{display:flex;align-items:center;gap:10px}
  .btn-ghost{background:transparent;border:1px solid var(--border);color:var(--muted);padding:7px 14px;border-radius:9px;font-family:var(--font);font-size:13px;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:6px}
  .btn-ghost:hover{border-color:rgba(255,255,255,.18);color:var(--text)}
  .btn-cta{background:linear-gradient(135deg,var(--teal),var(--teal2));color:var(--bg);border:none;padding:8px 18px;border-radius:9px;font-family:var(--font);font-size:13px;font-weight:700;cursor:pointer;transition:transform .2s,box-shadow .25s}
  .btn-cta:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(10,255,224,.3)}

  /* ── HERO ── */
  .hero{
    position:relative;padding-top:58px;
    background:linear-gradient(180deg,rgba(255,209,102,.04) 0%,transparent 60%);
    border-bottom:1px solid var(--border);
    overflow:hidden;
  }
  .hero::before{content:'';position:absolute;top:58px;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(255,209,102,.4),transparent)}
  .hero-inner{max-width:1100px;margin:0 auto;padding:48px 32px 40px;display:grid;grid-template-columns:auto 1fr auto;gap:32px;align-items:start}

  /* Avatar zone */
  .avatar-zone{position:relative;flex-shrink:0}
  .avatar-ring{
    width:110px;height:110px;border-radius:28px;
    background:linear-gradient(135deg,#2A1A00,#3D2800);
    border:2px solid rgba(255,209,102,.3);
    display:flex;align-items:center;justify-content:center;font-size:52px;
    position:relative;overflow:hidden;
    box-shadow:0 0 0 6px rgba(255,209,102,.06),0 20px 50px rgba(0,0,0,.5);
    animation:avatarIn .5s cubic-bezier(.34,1.56,.64,1) both;
  }
  @keyframes avatarIn{from{opacity:0;transform:scale(.8) rotate(-8deg)}to{opacity:1;transform:scale(1) rotate(0)}}
  .avatar-ring::after{content:'';position:absolute;inset:-1px;border-radius:29px;border:1px solid rgba(255,209,102,.15);pointer-events:none}
  .avatar-level{
    position:absolute;bottom:-8px;left:50%;transform:translateX(-50%);
    background:linear-gradient(135deg,var(--gold),var(--gold2));color:#1A0A00;
    font-size:10px;font-weight:900;font-family:var(--mono);
    padding:3px 10px;border-radius:100px;white-space:nowrap;
    box-shadow:0 4px 16px rgba(255,209,102,.4);
  }

  /* Hero info */
  .hero-info{animation:slideUp .45s ease both}
  @keyframes slideUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  .hero-badges{display:flex;align-items:center;gap:8px;margin-bottom:12px;flex-wrap:wrap}
  .hb{display:flex;align-items:center;gap:5px;padding:4px 11px;border-radius:100px;font-size:11px;font-weight:700;font-family:var(--mono);border:1px solid}
  .hb-gold{background:rgba(255,209,102,.08);border-color:rgba(255,209,102,.25);color:var(--gold)}
  .hb-teal{background:rgba(10,255,224,.07);border-color:rgba(10,255,224,.2);color:var(--teal)}
  .hb-green{background:rgba(0,255,136,.07);border-color:rgba(0,255,136,.2);color:var(--green)}
  .hero-name{font-size:clamp(28px,5vw,42px);font-weight:800;letter-spacing:-2px;line-height:1.1;margin-bottom:8px}
  .hero-title{font-size:15px;color:var(--muted);margin-bottom:14px;line-height:1.6;max-width:480px}
  .hero-tags{display:flex;gap:8px;flex-wrap:wrap}
  .hero-tag{display:flex;align-items:center;gap:5px;font-size:12px;color:var(--muted);background:var(--bg2);border:1px solid var(--border);padding:5px 12px;border-radius:8px;font-family:var(--mono)}

  /* Hero stats */
  .hero-stats{display:flex;flex-direction:column;gap:10px;animation:slideUp .45s .08s ease both;flex-shrink:0}
  .stat-card{background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:14px 18px;text-align:center;min-width:100px;transition:all .3s}
  .stat-card:hover{border-color:rgba(255,209,102,.2);transform:translateY(-2px)}
  .stat-num{font-family:var(--mono);font-size:24px;font-weight:800;letter-spacing:-1.5px;line-height:1}
  .stat-label{font-size:10px;color:var(--muted);font-family:var(--mono);margin-top:4px}

  /* ── MAIN ── */
  .main{max-width:1100px;margin:0 auto;padding:36px 32px 80px;display:grid;grid-template-columns:1fr 320px;gap:24px}

  /* ── LEFT ── */
  .left-col{}

  /* Section */
  .section{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r);padding:24px;margin-bottom:16px;animation:slideUp .5s ease both;transition:border-color .25s}
  .section:hover{border-color:rgba(255,255,255,.1)}
  .sec-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}
  .sec-title{font-size:15px;font-weight:700;display:flex;align-items:center;gap:8px}
  .sec-action{font-size:12px;color:var(--muted);font-family:var(--mono);cursor:pointer;transition:color .2s}
  .sec-action:hover{color:var(--gold)}

  /* Niveau progression */
  .level-bar-track{height:6px;background:rgba(255,255,255,.06);border-radius:3px;overflow:hidden;margin:10px 0}
  .level-bar-fill{height:100%;border-radius:3px;background:linear-gradient(90deg,var(--gold),var(--gold2));transition:width 1.4s cubic-bezier(.4,0,.2,1)}
  .level-milestones{display:flex;justify-content:space-between;margin-top:4px}
  .lm{font-size:9px;font-family:var(--mono);color:var(--muted2)}
  .lm.reached{color:var(--gold)}

  /* Matières chips */
  .matiere-chips{display:flex;flex-wrap:wrap;gap:7px}
  .mc{display:flex;align-items:center;gap:6px;padding:7px 13px;border-radius:10px;background:var(--bg3);border:1px solid var(--border);font-size:12px;font-weight:600;cursor:pointer;transition:all .22s}
  .mc:hover{border-color:rgba(255,209,102,.25);transform:translateY(-1px)}
  .mc .dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
  .mc-count{font-size:10px;font-family:var(--mono);color:var(--muted);margin-left:2px}

  /* Subject cards */
  .sujets-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
  .sujet-card{
    background:var(--bg3);border:1px solid var(--border);border-radius:12px;
    padding:16px;cursor:pointer;transition:all .25s;
    position:relative;overflow:hidden;
  }
  .sujet-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;opacity:0;transition:opacity .25s}
  .sujet-card:hover{border-color:rgba(255,209,102,.2);transform:translateY(-2px)}
  .sujet-card:hover::before{opacity:1}
  .sc-type{font-size:9px;font-family:var(--mono);font-weight:700;color:var(--gold);letter-spacing:.1em;text-transform:uppercase;margin-bottom:6px;display:flex;align-items:center;gap:6px}
  .sc-title{font-size:13px;font-weight:700;line-height:1.3;margin-bottom:8px}
  .sc-meta{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
  .sc-badge{font-size:9px;font-family:var(--mono);padding:2px 7px;border-radius:5px;background:var(--bg2);border:1px solid var(--border);color:var(--muted)}
  .sc-bottom{display:flex;align-items:center;justify-content:space-between;margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,.04)}
  .sc-price{font-family:var(--mono);font-size:12px;font-weight:700;color:var(--teal)}
  .sc-stats{display:flex;align-items:center;gap:8px;font-size:10px;font-family:var(--mono);color:var(--muted)}
  .sc-new{position:absolute;top:8px;right:8px;font-size:8px;font-weight:800;font-family:var(--mono);background:var(--gold);color:#1A0A00;padding:2px 7px;border-radius:100px}

  /* Avis */
  .reviews-list{display:flex;flex-direction:column;gap:12px}
  .review-item{background:var(--bg3);border:1px solid var(--border);border-radius:12px;padding:14px;transition:border-color .2s}
  .review-item:hover{border-color:rgba(255,255,255,.12)}
  .ri-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
  .ri-user{display:flex;align-items:center;gap:8px}
  .ri-avatar{width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,#1A3A5C,var(--teal2));display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0}
  .ri-name{font-size:12px;font-weight:700}
  .ri-date{font-size:10px;color:var(--muted);font-family:var(--mono);margin-top:1px}
  .ri-stars{display:flex;gap:2px;font-size:12px}
  .ri-text{font-size:13px;color:var(--muted);line-height:1.6}
  .ri-sujet{font-size:10px;font-family:var(--mono);color:var(--gold);margin-top:6px}

  /* Stats breakdown */
  .breakdown-row{display:flex;align-items:center;gap:10px;margin-bottom:10px}
  .br-label{font-size:12px;color:var(--muted);width:100px;flex-shrink:0;font-family:var(--mono)}
  .br-track{flex:1;height:5px;background:rgba(255,255,255,.06);border-radius:3px;overflow:hidden}
  .br-fill{height:100%;border-radius:3px;background:linear-gradient(90deg,var(--gold),var(--gold2));transition:width 1.4s cubic-bezier(.4,0,.2,1)}
  .br-val{font-size:11px;font-family:var(--mono);font-weight:700;color:var(--gold);width:32px;text-align:right;flex-shrink:0}

  /* ── RIGHT SIDEBAR ── */
  .right-col{display:flex;flex-direction:column;gap:14px}

  /* Sticky card */
  .sticky-card{position:sticky;top:74px}

  /* Contact card */
  .contact-card{
    background:linear-gradient(135deg,rgba(255,209,102,.07),rgba(255,209,102,.02));
    border:1px solid rgba(255,209,102,.2);border-radius:var(--r);padding:22px;
  }
  .cc-title{font-size:13px;font-weight:700;margin-bottom:4px;color:var(--gold)}
  .cc-sub{font-size:12px;color:var(--muted);margin-bottom:18px;line-height:1.5}
  .btn-follow{
    width:100%;background:linear-gradient(135deg,var(--gold),var(--gold2));
    color:#1A0A00;border:none;padding:12px;border-radius:11px;
    font-family:var(--font);font-size:14px;font-weight:800;cursor:pointer;
    transition:transform .2s,box-shadow .25s;display:flex;align-items:center;justify-content:center;gap:8px;
    margin-bottom:8px;
  }
  .btn-follow:hover{transform:translateY(-2px);box-shadow:0 10px 30px rgba(255,209,102,.35)}
  .btn-follow.following{background:rgba(255,209,102,.1);color:var(--gold);border:1px solid rgba(255,209,102,.25)}
  .btn-share-prof{
    width:100%;background:transparent;border:1px solid var(--border);color:var(--muted);
    padding:10px;border-radius:11px;font-family:var(--font);font-size:13px;cursor:pointer;
    transition:all .2s;display:flex;align-items:center;justify-content:center;gap:7px;
  }
  .btn-share-prof:hover{border-color:rgba(255,255,255,.18);color:var(--text)}

  /* Info mini cards */
  .info-mini{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r);padding:18px}
  .im-row{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.04)}
  .im-row:last-child{border-bottom:none}
  .im-icon{font-size:16px;width:20px;text-align:center;flex-shrink:0}
  .im-label{font-size:12px;color:var(--muted)}
  .im-val{font-size:12px;font-weight:600;margin-left:auto;font-family:var(--mono);text-align:right}

  /* Badges trophy */
  .badges-card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r);padding:18px}
  .badge-item{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.04)}
  .badge-item:last-child{border-bottom:none}
  .badge-icon{width:32px;height:32px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;border:1px solid}
  .badge-info{flex:1}
  .badge-name{font-size:12px;font-weight:700}
  .badge-desc{font-size:10px;color:var(--muted);margin-top:1px;font-family:var(--mono)}
  .badge-date{font-size:9px;color:var(--muted2);font-family:var(--mono)}

  /* Pagination */
  .pagination{display:flex;align-items:center;justify-content:center;gap:6px;margin-top:16px}
  .pg-btn{width:32px;height:32px;border-radius:8px;border:1px solid var(--border);background:transparent;color:var(--muted);font-family:var(--mono);font-size:12px;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center}
  .pg-btn:hover,.pg-btn.active{background:rgba(255,209,102,.08);border-color:rgba(255,209,102,.25);color:var(--gold)}

  /* ── TOAST ── */
  .toast{position:fixed;bottom:24px;right:24px;background:var(--bg2);border:1px solid rgba(255,209,102,.25);border-radius:14px;padding:13px 20px;display:flex;align-items:center;gap:10px;font-size:14px;box-shadow:0 16px 48px rgba(0,0,0,.5);z-index:400;transition:transform .4s cubic-bezier(.34,1.56,.64,1),opacity .3s;transform:translateY(80px);opacity:0}
  .toast.show{transform:translateY(0);opacity:1}

  /* ── FILTER TABS ── */
  .filter-tabs{display:flex;gap:5px;margin-bottom:16px;flex-wrap:wrap}
  .ft{padding:6px 14px;border-radius:8px;border:1px solid var(--border);background:transparent;font-family:var(--font);font-size:12px;font-weight:600;color:var(--muted);cursor:pointer;transition:all .2s}
  .ft:hover{border-color:rgba(255,255,255,.15);color:var(--text)}
  .ft.on{background:rgba(255,209,102,.08);border-color:rgba(255,209,102,.25);color:var(--gold)}

  @media(max-width:960px){.main{grid-template-columns:1fr}.right-col{order:-1}.sticky-card{position:static}}
  @media(max-width:640px){.hero-inner{grid-template-columns:1fr;gap:20px}.hero-stats{flex-direction:row;flex-wrap:wrap}.sujets-grid{grid-template-columns:1fr}}
`;

const SUJETS = [
  { id:1, emoji:"📐", type:"BAC", matiere:"Maths", serie:"Série C&D", annee:"2024", title:"Mathématiques BAC 2024 Série C&D", credits:2, note:4.9, consult:1832, new:true },
  { id:2, emoji:"⚗️", type:"BAC", matiere:"Phys-Chimie", serie:"Série C", annee:"2023", title:"Physique-Chimie BAC 2023", credits:2, note:4.8, consult:1204, new:false },
  { id:3, emoji:"📐", type:"BAC", matiere:"Maths", serie:"Série D", annee:"2022", title:"Mathématiques BAC 2022 Série D", credits:2, note:4.7, consult:987, new:false },
  { id:4, emoji:"🌿", type:"BAC", matiere:"SVT", serie:"Série D", annee:"2024", title:"Sciences de la Vie et de la Terre 2024", credits:2, note:4.6, consult:743, new:true },
  { id:5, emoji:"📐", type:"BEPC", matiere:"Maths", serie:"—", annee:"2023", title:"Mathématiques BEPC 2023", credits:1, note:4.5, consult:612, new:false },
  { id:6, emoji:"⚗️", type:"BAC", matiere:"Phys-Chimie", serie:"Série D", annee:"2022", title:"Physique-Chimie BAC 2022 Série D", credits:2, note:4.8, consult:534, new:false },
];

const REVIEWS = [
  { name:"Miora A.", avatar:"👩‍🎓", stars:5, date:"Il y a 3 jours", text:"Les sujets de Rakoto sont toujours ultra-propres et fidèles aux originaux. J'ai utilisé le BAC 2024 et tout était parfait pour mes révisions !", sujet:"📐 Maths BAC 2024 Série C" },
  { name:"Toky R.", avatar:"👨‍🎓", stars:5, date:"Il y a 1 semaine", text:"Excellente qualité. Les formules sont lisibles et le barème est bien indiqué. Je recommande vraiment ce contributeur.", sujet:"⚗️ Physique BAC 2023" },
  { name:"Fara H.", avatar:"🧑‍💻", stars:4, date:"Il y a 2 semaines", text:"Très bon sujet. Juste un exercice où la formulation était légèrement différente de l'original, mais globalement excellent travail.", sujet:"📐 Maths BAC 2022 Série D" },
];

const MATIERES = [
  { name:"Mathématiques", dot:"var(--teal)", count:4 },
  { name:"Physique-Chimie", dot:"var(--blue)", count:2 },
  { name:"SVT", dot:"var(--green)", count:1 },
  { name:"BEPC", dot:"var(--gold)", count:1 },
];

const BADGES = [
  { icon:"🏅", name:"Contributeur Or", desc:"500+ consultations par mois", date:"Oct. 2024", color:"var(--gold)", bc:"rgba(255,209,102,.2)", bg:"rgba(255,209,102,.08)" },
  { icon:"⭐", name:"Top Contributeur", desc:"Note moyenne ≥ 4.8/5", date:"Sept. 2024", color:"var(--teal)", bc:"rgba(10,255,224,.2)", bg:"rgba(10,255,224,.07)" },
  { icon:"🔥", name:"Streak 30 jours", desc:"30 jours consécutifs de soumission", date:"Août 2024", color:"var(--orange)", bc:"rgba(255,159,67,.2)", bg:"rgba(255,159,67,.07)" },
  { icon:"🌟", name:"Premier 100", desc:"Parmi les 100 premiers contributeurs", date:"Juin 2024", color:"var(--purple)", bc:"rgba(167,139,250,.2)", bg:"rgba(167,139,250,.07)" },
];

function StarRating({ val }) {
  return (
    <div style={{ display:"flex", gap:2 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ fontSize:12, color: i <= Math.round(val) ? "var(--gold)" : "var(--muted2)" }}>★</span>
      ))}
    </div>
  );
}

export default function ProfilContributeur() {
  const [following, setFollowing]     = useState(false);
  const [activeFilter, setActiveFilter] = useState("tous");
  const [barWidths, setBarWidths]     = useState([0,0,0,0,0]);
  const [statNums, setStatNums]       = useState([0,0,0,0]);
  const [toast, setToast]             = useState({ show:false, msg:"" });
  const [page, setPage]               = useState(1);
  const [levelW, setLevelW]           = useState(0);

  useEffect(() => {
    const s = document.createElement("style"); s.textContent = CSS; document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  useEffect(() => {
    // Animate bars and numbers
    const t = setTimeout(() => {
      setBarWidths([92, 6, 2, 0, 0]);
      setLevelW(72);
      // count-up
      const targets = [8, 5104, 116250, 4.9];
      const dur = 1600;
      const start = Date.now();
      const tick = () => {
        const p = Math.min((Date.now() - start) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        setStatNums(targets.map(t => t < 10 ? parseFloat((t * ease).toFixed(1)) : Math.round(t * ease)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, 400);
    return () => clearTimeout(t);
  }, []);

  const showToast = msg => { setToast({ show:true, msg }); setTimeout(() => setToast({ show:false, msg:"" }), 2800); };

  const filteredSujets = activeFilter === "tous" ? SUJETS
    : SUJETS.filter(s => s.matiere.toLowerCase().includes(activeFilter) || s.type.toLowerCase() === activeFilter);

  return (
    <div style={{ minHeight:"100vh" }}>
      <div className="mesh"><span /><span /></div>

      {/* NAV */}
      <nav>
        <div className="nav-logo">Mah.AI</div>
        <div className="nav-right">
          <button className="btn-ghost" onClick={() => showToast("← Retour au catalogue")}>← Retour</button>
          <button className="btn-cta" onClick={() => showToast("🎓 Voir tous les sujets")}>Voir tous les sujets</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div className="hero">
        {/* Glow */}
        <div style={{ position:"absolute", width:400, height:400, borderRadius:"50%", background:"var(--gold)", filter:"blur(120px)", opacity:.05, top:"50%", left:"15%", transform:"translateY(-50%)", pointerEvents:"none" }} />

        <div className="hero-inner">
          {/* Avatar */}
          <div className="avatar-zone">
            <div className="avatar-ring">✍️</div>
            <div className="avatar-level">🏅 Contributeur Or</div>
          </div>

          {/* Info */}
          <div className="hero-info">
            <div className="hero-badges">
              <span className="hb hb-gold">✍️ Contributeur vérifié</span>
              <span className="hb hb-teal">⭐ Top contributeur</span>
              <span className="hb hb-green">🇲🇬 Antananarivo</span>
            </div>
            <div className="hero-name">Rakoto Jean-Marie</div>
            <div className="hero-title">
              Enseignant de Mathématiques et Physique-Chimie · Lycée Ampefiloha.<br />
              Passionné par l'éducation malgache, je contribue pour rendre les sujets accessibles à tous.
            </div>
            <div className="hero-tags">
              <span className="hero-tag">📐 Mathématiques</span>
              <span className="hero-tag">⚗️ Physique-Chimie</span>
              <span className="hero-tag">🌿 SVT</span>
              <span className="hero-tag">📅 Membre depuis juin 2024</span>
            </div>
          </div>

          {/* Stats */}
          <div className="hero-stats">
            {[
              { num: statNums[0], suffix:"", label:"Sujets publiés", color:"var(--gold)" },
              { num: statNums[1] >= 1000 ? (statNums[1]/1000).toFixed(1)+"K" : statNums[1], suffix:"", label:"Consultations", color:"var(--teal)" },
              { num: statNums[2] >= 1000 ? Math.round(statNums[2]/1000)+"K Ar" : statNums[2], suffix:"", label:"Gains totaux", color:"var(--green)" },
              { num: statNums[3], suffix:"/5", label:"Note moyenne", color:"var(--gold)" },
            ].map((s, i) => (
              <div key={i} className="stat-card">
                <div className="stat-num" style={{ color:s.color }}>{s.num}{s.suffix}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div className="main">
        <div className="left-col">

          {/* Niveau */}
          <div className="section" style={{ animationDelay:"0s" }}>
            <div className="sec-header">
              <div className="sec-title">🏅 Progression de niveau</div>
              <span style={{ fontFamily:"var(--mono)", fontSize:12, color:"var(--gold)", fontWeight:700 }}>Or → Platine</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
              <span style={{ fontSize:12, color:"var(--muted)" }}>5 104 / 7 900 consultations</span>
              <span style={{ fontFamily:"var(--mono)", fontSize:12, fontWeight:800, color:"var(--gold)" }}>{levelW}%</span>
            </div>
            <div className="level-bar-track">
              <div className="level-bar-fill" style={{ width:`${levelW}%` }} />
            </div>
            <div className="level-milestones">
              {[["Bronze","0"],["Argent","500"],["Or","2K"],["Platine","7,9K"]].map(([label, val], i) => (
                <div key={i} className={`lm ${i <= 2 ? "reached" : ""}`}>{i <= 2 ? "✓" : "○"} {label}<br />{val}</div>
              ))}
            </div>
            <div style={{ marginTop:14, display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
              {[
                { label:"Commission actuelle", val:"50%", color:"var(--gold)" },
                { label:"Commission Platine", val:"55%", color:"var(--muted)" },
                { label:"Prochaine promo", val:"~2 796", color:"var(--muted)" },
              ].map(c => (
                <div key={c.label} style={{ background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:10, padding:"10px 12px", textAlign:"center" }}>
                  <div style={{ fontFamily:"var(--mono)", fontSize:16, fontWeight:800, color:c.color, letterSpacing:-0.5 }}>{c.val}</div>
                  <div style={{ fontSize:10, color:"var(--muted)", fontFamily:"var(--mono)", marginTop:3 }}>{c.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Matières */}
          <div className="section" style={{ animationDelay:".05s" }}>
            <div className="sec-header">
              <div className="sec-title">📚 Matières couvertes</div>
              <span className="sec-action">{SUJETS.length} sujets au total</span>
            </div>
            <div className="matiere-chips">
              {MATIERES.map(m => (
                <div key={m.name} className="mc" onClick={() => showToast(`📚 Filtrer par ${m.name}`)}>
                  <div className="dot" style={{ background:m.dot, boxShadow:`0 0 6px ${m.dot}` }} />
                  {m.name}
                  <span className="mc-count">{m.count}</span>
                </div>
              ))}
            </div>

            {/* Distribution notes */}
            <div style={{ marginTop:18 }}>
              <div style={{ fontSize:11, color:"var(--muted)", fontFamily:"var(--mono)", letterSpacing:".1em", textTransform:"uppercase", marginBottom:12 }}>Distribution des notes</div>
              {[[5,"★★★★★",92],[4,"★★★★☆",6],[3,"★★★☆☆",2],[2,"★★☆☆☆",0],[1,"★☆☆☆☆",0]].map(([n, stars, pct], i) => (
                <div key={n} className="breakdown-row">
                  <div className="br-label" style={{ fontSize:11 }}>{stars}</div>
                  <div className="br-track">
                    <div className="br-fill" style={{ width:`${barWidths[i]}%` }} />
                  </div>
                  <div className="br-val">{pct}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Sujets */}
          <div className="section" style={{ animationDelay:".1s" }}>
            <div className="sec-header">
              <div className="sec-title">📋 Sujets publiés</div>
              <span className="sec-action" onClick={() => showToast("📋 Voir tous les sujets")}>Voir tout →</span>
            </div>

            <div className="filter-tabs">
              {[["tous","Tous"],["bac","BAC"],["bepc","BEPC"],["maths","Maths"],["phys","Physique"]].map(([val, label]) => (
                <button key={val} className={`ft ${activeFilter === val ? "on" : ""}`} onClick={() => setActiveFilter(val)}>{label}</button>
              ))}
            </div>

            <div className="sujets-grid">
              {filteredSujets.slice(0, 6).map((s, i) => (
                <div key={s.id} className="sujet-card" style={{ animationDelay:`${i * 0.05}s`, "--accent":"var(--gold)" }}
                  onClick={() => showToast(`📐 Ouverture : ${s.title}`)}>
                  {s.new && <div className="sc-new">NOUVEAU</div>}
                  <div className="sujet-card" style={{ all:"unset", display:"contents" }} />
                  <div className="sc-type">
                    <span style={{ width:6, height:6, borderRadius:"50%", background:"var(--gold)", display:"inline-block" }} />
                    {s.type} · {s.matiere}
                  </div>
                  <div className="sc-title">{s.emoji} {s.title}</div>
                  <div className="sc-meta">
                    <span className="sc-badge">{s.annee}</span>
                    {s.serie !== "—" && <span className="sc-badge">{s.serie}</span>}
                  </div>
                  <div className="sc-bottom">
                    <span className="sc-price">{s.credits} crédit{s.credits > 1 ? "s" : ""}</span>
                    <div className="sc-stats">
                      <span>⭐ {s.note}</span>
                      <span>👁 {s.consult >= 1000 ? (s.consult/1000).toFixed(1)+"K" : s.consult}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredSujets.length === 0 && (
              <div style={{ textAlign:"center", padding:"32px 0", color:"var(--muted)" }}>
                <div style={{ fontSize:32, marginBottom:10 }}>🔍</div>
                Aucun sujet dans cette catégorie.
              </div>
            )}

            <div className="pagination">
              <button className="pg-btn" onClick={() => setPage(p => Math.max(1, p-1))}>‹</button>
              {[1,2].map(n => (
                <button key={n} className={`pg-btn ${page === n ? "active" : ""}`} onClick={() => setPage(n)}>{n}</button>
              ))}
              <button className="pg-btn" onClick={() => setPage(p => Math.min(2, p+1))}>›</button>
            </div>
          </div>

          {/* Avis */}
          <div className="section" style={{ animationDelay:".15s" }}>
            <div className="sec-header">
              <div className="sec-title">💬 Avis des étudiants</div>
              <span style={{ fontFamily:"var(--mono)", fontSize:12, color:"var(--gold)" }}>⭐ 4.9 · {REVIEWS.length} avis</span>
            </div>
            <div className="reviews-list">
              {REVIEWS.map((r, i) => (
                <div key={i} className="review-item">
                  <div className="ri-top">
                    <div className="ri-user">
                      <div className="ri-avatar">{r.avatar}</div>
                      <div>
                        <div className="ri-name">{r.name}</div>
                        <div className="ri-date">{r.date}</div>
                      </div>
                    </div>
                    <StarRating val={r.stars} />
                  </div>
                  <div className="ri-text">{r.text}</div>
                  <div className="ri-sujet">{r.sujet}</div>
                </div>
              ))}
            </div>
            <button className="btn-ghost" style={{ width:"100%", justifyContent:"center", marginTop:12 }} onClick={() => showToast("💬 Tous les avis chargés")}>
              Voir tous les avis →
            </button>
          </div>

        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div className="right-col">
          <div className="sticky-card">

            {/* Follow / Share */}
            <div className="contact-card" style={{ marginBottom:14 }}>
              <div className="cc-title">✍️ Rakoto Jean-Marie</div>
              <div className="cc-sub">Suis ce contributeur pour être notifié de ses nouveaux sujets.</div>
              <button
                className={`btn-follow ${following ? "following" : ""}`}
                onClick={() => { setFollowing(v => !v); showToast(following ? "❌ Abonnement annulé" : "✅ Tu suis maintenant Rakoto Jean-Marie !"); }}>
                {following ? "✓ Suivi" : "🔔 Suivre ce contributeur"}
              </button>
              <button className="btn-share-prof" onClick={() => showToast("🔗 Lien du profil copié !")}>
                🔗 Partager ce profil
              </button>
            </div>

            {/* Infos */}
            <div className="info-mini" style={{ marginBottom:14 }}>
              <div style={{ fontSize:12, fontWeight:700, marginBottom:10, color:"var(--muted)", fontFamily:"var(--mono)", letterSpacing:".08em", textTransform:"uppercase" }}>Informations</div>
              {[
                { icon:"📍", label:"Région", val:"Antananarivo" },
                { icon:"🏫", label:"Établissement", val:"Lycée Ampefiloha" },
                { icon:"📅", label:"Membre depuis", val:"Juin 2024" },
                { icon:"⚡", label:"Délai moyen validation", val:"2-3 jours" },
                { icon:"📊", label:"Taux d'approbation", val:"96%", color:"var(--green)" },
                { icon:"🔄", label:"Dernière soumission", val:"Il y a 2 jours" },
              ].map(r => (
                <div key={r.label} className="im-row">
                  <span className="im-icon">{r.icon}</span>
                  <span className="im-label">{r.label}</span>
                  <span className="im-val" style={{ color: r.color || "var(--text)" }}>{r.val}</span>
                </div>
              ))}
            </div>

            {/* Badges */}
            <div className="badges-card">
              <div style={{ fontSize:12, fontWeight:700, marginBottom:10, color:"var(--muted)", fontFamily:"var(--mono)", letterSpacing:".08em", textTransform:"uppercase" }}>Badges & récompenses</div>
              {BADGES.map((b, i) => (
                <div key={i} className="badge-item">
                  <div className="badge-icon" style={{ background:b.bg, borderColor:b.bc, color:b.color }}>{b.icon}</div>
                  <div className="badge-info">
                    <div className="badge-name">{b.name}</div>
                    <div className="badge-desc">{b.desc}</div>
                  </div>
                  <div className="badge-date">{b.date}</div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

      <div className={`toast ${toast.show ? "show" : ""}`}>
        <span style={{ fontSize:17 }}>🏅</span><span>{toast.msg}</span>
      </div>
    </div>
  );
}
