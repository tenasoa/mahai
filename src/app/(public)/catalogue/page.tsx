'use client'

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, Filter, Grid3X3, LayoutList, Star, FileText, Heart, ArrowRight, X, SlidersHorizontal, BookOpen } from "lucide-react";

// ============================================
// MAH.AI — Catalogue
// ============================================
// Page d'exploration des sujets
// Design dynamique avec filtres et recherche
// ============================================

const SUBJECTS = [
  { id:1, type:"BAC", matiere:"Mathématiques", serie:"C&D", annee:2024, note:4.8, nb:1832, pages:6, credits:2, ar:"1 000", new:true, pop:false, desc:"Analyse, géométrie dans l'espace, probabilités. Niveau difficile.", color:"var(--teal)", badges:[["BAC","teal"],["Maths","gold"],["2024","muted"]], emoji:"📐" },
  { id:2, type:"BAC", matiere:"Physique-Chimie", serie:"C", annee:2024, note:4.6, nb:1245, pages:5, credits:2, ar:"1 000", new:true, pop:false, desc:"Mécanique, thermodynamique, chimie organique.", color:"var(--blue)", badges:[["BAC","teal"],["Phys-Chimie","blue"],["2024","muted"]], emoji:"⚗️" },
  { id:3, type:"BAC", matiere:"Français", serie:"Toutes", annee:2024, note:4.9, nb:2450, pages:4, credits:1, ar:"500", new:false, pop:true, desc:"Dissertation littéraire, commentaire composé, étude de texte.", color:"var(--rose)", badges:[["BAC","teal"],["Français","rose"],["2024","muted"]], emoji:"📖" },
  { id:4, type:"BEPC", matiere:"Mathématiques", serie:null, annee:2024, note:4.7, nb:3210, pages:4, credits:1, ar:"500", new:true, pop:false, desc:"Algèbre, géométrie, probabilités. Conforme au programme national.", color:"var(--teal)", badges:[["BEPC","teal"],["Maths","gold"],["2024","muted"]], emoji:"📐" },
  { id:5, type:"BAC", matiere:"SVT", serie:"D", annee:2023, note:4.5, nb:987, pages:5, credits:2, ar:"1 000", new:false, pop:false, desc:"Génétique, évolution, écologie, biologie cellulaire.", color:"var(--green)", badges:[["BAC","teal"],["SVT","green"],["2023","muted"]], emoji:"🌿" },
  { id:6, type:"Concours FP", matiere:"Culture Générale", serie:null, annee:2024, note:4.4, nb:654, pages:8, credits:3, ar:"1 500", new:false, pop:false, desc:"Histoire de Madagascar, institutions, culture nationale.", color:"var(--purple)", badges:[["Concours FP","purple"],["Culture G.","purple"],["2024","muted"]], emoji:"🏛️" },
];

export default function CataloguePage() {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeType, setActiveType] = useState<string[]>([]);
  const [wished, setWished] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);

  // Mouse glow
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      document.querySelectorAll(".subject-card-glass").forEach(c => {
        const r = (c as HTMLElement).getBoundingClientRect();
        (c as HTMLElement).style.setProperty("--mx", `${((e.clientX-r.left)/r.width)*100}%`);
        (c as HTMLElement).style.setProperty("--my", `${((e.clientY-r.top)/r.height)*100}%`);
      });
    };
    window.addEventListener("mousemove", fn);
    return () => window.removeEventListener("mousemove", fn);
  }, []);

  const toggleFilter = (type: string) => {
    setActiveType(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const filtered = SUBJECTS.filter(s => {
    if (activeType.length && !activeType.includes(s.type)) return false;
    if (search && !`${s.matiere} ${s.type} ${s.annee}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-bg relative overflow-hidden">
      {/* Mesh background */}
      <div className="mesh-bg" aria-hidden="true">
        <span /><span />
      </div>

      <div className="relative z-10 pt-24 pb-20 px-6 max-w-7xl mx-auto">
        
        {/* ── HEADER ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal/5 border border-teal/20 text-teal text-[10px] font-bold uppercase tracking-widest mb-4">
              📚 {filtered.length} Sujets disponibles
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter">
              Catalogue <span className="text-gradient">National.</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-bg2/50 border border-border/40 rounded-xl p-1">
              <button 
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-teal/10 text-teal border border-teal/20" : "text-muted hover:text-text"}`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-teal/10 text-teal border border-teal/20" : "text-muted hover:text-text"}`}
              >
                <LayoutList className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* ── FILTERS SIDEBAR ── */}
          <aside className="lg:col-span-3 space-y-8">
            <div className="glass p-6 rounded-[24px] border border-border/40">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold uppercase tracking-widest font-mono text-text/80">Filtres</h3>
                <SlidersHorizontal className="w-4 h-4 text-muted" />
              </div>

              <div className="space-y-6">
                <div>
                  <div className="text-[10px] font-bold text-muted uppercase tracking-widest mb-4">Type d'examen</div>
                  <div className="flex flex-wrap gap-2">
                    {["BAC", "BEPC", "CEPE", "Concours FP"].map(t => (
                      <button 
                        key={t}
                        onClick={() => toggleFilter(t)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border
                          ${activeType.includes(t) ? "bg-teal/10 border-teal/40 text-teal" : "bg-white/5 border-white/5 text-muted hover:border-white/20"}
                        `}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-muted uppercase tracking-widest mb-4">Matières populaires</div>
                  <div className="space-y-2">
                    {["Mathématiques", "Physique-Chimie", "Français", "SVT"].map(m => (
                      <label key={m} className="flex items-center gap-3 cursor-pointer group">
                        <div className="w-4 h-4 rounded border border-border/60 group-hover:border-teal/50 transition-colors" />
                        <span className="text-xs font-medium text-muted group-hover:text-text transition-colors">{m}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {activeType.length > 0 && (
                <button 
                  onClick={() => setActiveType([])}
                  className="w-full mt-8 py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-muted hover:text-text hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <X className="w-3 h-3" /> Effacer tout
                </button>
              )}
            </div>

            <div className="glass p-6 rounded-[24px] border border-border/40 bg-teal/5 border-teal/10">
              <h4 className="text-xs font-bold text-teal uppercase tracking-widest mb-2">Besoin d'aide ?</h4>
              <p className="text-[11px] text-teal/70 leading-relaxed font-medium mb-4">
                Tu ne trouves pas un sujet spécifique ? Notre équipe en ajoute de nouveaux chaque semaine.
              </p>
              <Link href="/contact" className="text-[10px] font-black text-teal flex items-center gap-2 group uppercase">
                Suggérer un sujet <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </aside>

          {/* ── MAIN CONTENT ── */}
          <main className="lg:col-span-9 space-y-6">
            
            {/* Search Bar */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-muted group-focus-within:text-teal transition-colors" />
              </div>
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un sujet (ex: BAC 2024 Maths)..."
                className="w-full h-16 pl-16 pr-6 rounded-[20px] bg-bg2/50 border border-border/40 text-text placeholder:text-muted/60 focus:border-teal/50 focus:bg-bg2/80 transition-all outline-none shadow-xl"
              />
            </div>

            {/* Results Grid */}
            <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
              {filtered.map((s, i) => (
                <div 
                  key={s.id}
                  className={`subject-card-glass glass rounded-[32px] border border-border/40 relative overflow-hidden transition-all duration-500 group
                    ${viewMode === "list" ? "flex items-center p-4 gap-6" : "p-6 flex flex-col"}
                    hover:border-teal/30 hover:shadow-2xl hover:shadow-teal/5 hover:-translate-y-1
                  `}
                >
                  {/* Mouse Glow */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at var(--mx, 50%) var(--my, 50%), ${s.color}10, transparent 70%)`
                    }}
                  />

                  {s.new && (
                    <div className="absolute top-4 right-4 px-2 py-0.5 bg-teal text-bg text-[9px] font-black uppercase rounded-lg shadow-lg z-10">
                      Nouveau
                    </div>
                  )}

                  <div className={`${viewMode === "list" ? "w-16 h-16" : "w-12 h-12 mb-6"} rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                    {s.emoji}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {s.badges.map(([l, c], idx) => (
                        <span key={idx} className="text-[9px] font-black uppercase tracking-tighter text-muted/60">{l}</span>
                      ))}
                    </div>
                    <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-teal transition-colors">{s.matiere} {s.annee}</h3>
                    {viewMode === "grid" && <p className="text-xs text-muted/70 leading-relaxed mb-6 font-medium">{s.desc}</p>}
                  </div>

                  <div className={`${viewMode === "list" ? "flex items-center gap-8" : "mt-auto pt-6 border-t border-border/20"}`}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-gold">
                        <Star className="w-3 h-3 fill-gold" /> {s.note}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-muted">
                        <FileText className="w-3 h-3" /> {s.pages}p
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <div className="text-sm font-mono font-bold text-teal">{s.credits} cr.</div>
                      <Link 
                        href={`/etudiant/sujets/${s.id}`}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-teal hover:text-bg hover:border-teal transition-all flex items-center gap-2"
                      >
                        Consulter <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="py-20 text-center glass rounded-[40px] border border-dashed border-border/60">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6 text-muted">
                  <Search className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold mb-2">Aucun sujet trouvé</h3>
                <p className="text-muted text-sm max-w-xs mx-auto font-medium mb-8">
                  Essaie d'ajuster tes filtres ou ta recherche pour trouver ce que tu souhaites.
                </p>
                <button 
                  onClick={() => {setSearch(""); setActiveType([]);}}
                  className="px-6 py-3 bg-teal text-bg font-bold rounded-xl text-sm hover:scale-105 transition-all"
                >
                  Réinitialiser tout
                </button>
              </div>
            )}

          </main>
        </div>
      </div>

      <footer className="relative z-10 py-12 text-center text-muted/40 text-xs font-mono border-t border-border/20">
        Mah.AI Catalogue — Explore l'excellence éducative malgache. 🇲🇬
      </footer>
    </div>
  );
}
