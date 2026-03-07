'use client'

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Search, Grid3X3, LayoutList, Star, FileText, ArrowRight, X, SlidersHorizontal } from "lucide-react";

// ============================================
// MAH.AI — Catalogue
// ============================================

export default function CataloguePage() {
  const router = useRouter();
  const { userId, isLoaded: isAuthLoaded } = useAuth();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeType, setActiveType] = useState<string[]>([]);

  useEffect(() => {
    if (isAuthLoaded && userId) {
      router.replace("/etudiant/sujets");
    }
  }, [isAuthLoaded, userId, router]);

  useEffect(() => {
    async function fetchSujets() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        // Pour l'instant on ne gère qu'un type à la fois dans l'API simple
        if (activeType.length === 1) params.append('typeExamen', activeType[0]);
        
        const res = await fetch(`/api/sujets?${params.toString()}`);
        const data = await res.json();
        setSubjects(data);
      } catch (err) {
        console.error("Failed to fetch sujets:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSujets();
  }, [activeType]);

  // Mouse glow effect
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

  const filtered = subjects.filter(s => {
    if (search && !`${s.matiere} ${s.typeExamen} ${s.annee}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getEmoji = (matiere: string) => {
    const m = matiere.toLowerCase();
    if (m.includes("math")) return "📐";
    if (m.includes("physique") || m.includes("chimie")) return "⚗️";
    if (m.includes("français") || m.includes("malagasy") || m.includes("anglais") || m.includes("lettres")) return "📖";
    if (m.includes("svt") || m.includes("bio")) return "🌿";
    if (m.includes("histoire") || m.includes("géo")) return "🌍";
    if (m.includes("philo")) return "🧠";
    if (m.includes("éco")) return "💹";
    return "📝";
  };

  const getColor = (matiere: string) => {
    const m = matiere.toLowerCase();
    if (m.includes("math")) return "var(--teal)";
    if (m.includes("physique")) return "var(--blue)";
    if (m.includes("français")) return "var(--rose)";
    if (m.includes("svt")) return "var(--green)";
    if (m.includes("histoire")) return "var(--gold)";
    return "var(--purple)";
  };

  if (isAuthLoaded && userId) return null;

  return (
    <div className="min-h-screen relative">
      <div className="relative z-10 py-24 px-6 max-w-7xl mx-auto">
        
        {/* ── HEADER ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal/5 border border-teal/20 text-teal text-[10px] font-bold uppercase tracking-widest mb-4">
              📚 {loading ? "..." : subjects.length} Sujets disponibles
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
                    {["BAC", "BEPC", "CEPE", "Concours"].map(t => (
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
                placeholder="Rechercher un sujet..."
                className="w-full h-16 pl-16 pr-6 rounded-[20px] bg-bg2 border border-white/10 text-white/90 placeholder:text-white/30 focus:border-teal/50 focus:bg-bg3 transition-all duration-300 outline-none shadow-xl"
              />
            </div>

            {/* Results Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="h-[320px] rounded-[32px] bg-white/5 animate-pulse border border-white/5" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="glass p-12 rounded-[32px] border border-border/40 text-center space-y-4">
                <div className="text-4xl text-muted/30">🔎</div>
                <h3 className="text-xl font-bold">Aucun sujet trouvé</h3>
                <p className="text-muted text-sm px-12 max-w-md mx-auto">Essaye de modifier tes filtres ou ta recherche pour trouver ce que tu cherches.</p>
              </div>
            ) : (
              <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
                {filtered.map((s) => (
                  <div 
                    key={s.id}
                    className={`subject-card-glass glass rounded-[32px] border border-border/40 relative overflow-hidden transition-all duration-500 group
                      ${viewMode === "list" ? "flex items-center p-4 gap-6" : "p-6 flex flex-col"}
                      hover:border-teal/30 hover:shadow-2xl hover:shadow-teal/5 hover:-translate-y-1
                    `}
                  >
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{
                        background: `radial-gradient(circle at var(--mx, 50%) var(--my, 50%), ${getColor(s.matiere)}10, transparent 70%)`
                      }}
                    />

                    {s.statut === 'PUBLIE' && s.createdAt && (new Date().getTime() - new Date(s.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000) && (
                      <div className="absolute top-4 right-4 px-2 py-0.5 bg-teal text-bg text-[9px] font-black uppercase rounded-lg shadow-lg z-10">
                        Nouveau
                      </div>
                    )}

                    <div className={`${viewMode === "list" ? "w-16 h-16" : "w-12 h-12 mb-6"} rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                      {getEmoji(s.matiere)}
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="text-[9px] font-black uppercase tracking-tighter text-muted/60">{s.typeExamen}</span>
                        {s.serie && <span className="text-[9px] font-black uppercase tracking-tighter text-muted/60">{s.serie}</span>}
                        <span className="text-[9px] font-black uppercase tracking-tighter text-muted/60">{s.annee}</span>
                      </div>
                      <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-teal transition-colors">{s.matiere} {s.annee}</h3>
                      {viewMode === "grid" && <p className="text-xs text-muted/70 leading-relaxed mb-6 font-medium line-clamp-2">{s.titre}</p>}
                    </div>

                    <div className={`${viewMode === "list" ? "flex items-center gap-8" : "mt-auto pt-6 border-t border-border/20"}`}>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-gold">
                          <Star className="w-3 h-3 fill-gold" /> {s.notemoyenne || "N/A"}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-muted">
                          <FileText className="w-3 h-3" /> {s.pages || 0}p
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <div className="text-sm font-mono font-bold text-teal">{s.prixCredits} cr.</div>
                        <Link 
                          href={`/catalogue/${s.id}`}
                          className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-teal hover:text-bg hover:border-teal transition-all flex items-center gap-2"
                        >
                          Consulter <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
