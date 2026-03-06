'use client'

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  Star, 
  Users, 
  FileText, 
  Clock, 
  Eye, 
  Bot, 
  PenTool, 
  ShieldCheck, 
  ArrowRight,
  Lock,
  Sparkles,
  MessageSquare,
  CheckCircle2,
  Share2,
  Heart
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================
// MAH.AI — Page Sujet (Détails)
// ============================================
// Visualisation, Achat et Interaction
// Design Bento immersif
// ============================================

const SUJET_MOCK = {
  id: "bac-2024-maths-serie-c",
  title: "Mathématiques — BAC 2024",
  serie: "Série C & D",
  matiere: "Mathématiques",
  type: "BAC",
  annee: 2024,
  duree: "4h",
  pages: 6,
  note: 4.8,
  nbNotes: 247,
  nbAchats: 1832,
  contributeur: { name: "Rakoto Jean-Marie", role: "Contributeur Certifié ✓", avatar: "👨‍🏫", nbSujets: 38, note: 4.9 },
  description: "Sujet officiel du Baccalauréat 2024, séries C et D. Couvre l'analyse (limites, dérivées, intégrales), la géométrie dans l'espace et les probabilités. Niveau difficile — idéal pour la préparation intensive.",
  questions: [
    { num: "I", titre: "Analyse — Étude de fonctions (8 points)", detail: "Soit f la fonction définie sur ℝ par f(x) = x³ - 6x² + 9x + 2. Calculer f'(x), dresser le tableau de variation de f, puis déterminer les extrema..." },
    { num: "II", titre: "Géométrie dans l'espace (6 points)", detail: "Dans l'espace rapporté à un repère orthonormé (O, i, j, k), on donne les points A(1, 2, -1), B(3, 0, 2), C(-1, 4, 0)..." },
    { num: "III", titre: "Probabilités et statistiques (6 points)", detail: "Une urne contient 4 boules rouges et 6 boules bleues. On tire successivement et sans remise 3 boules..." },
  ],
  reviews: [
    { name: "Miora R.", avatar: "🧑‍🎓", bg: "#1A2F5A", date: "Il y a 3 jours", text: "Correction très détaillée, chaque étape expliquée. J'ai compris des notions que je n'arrivais pas à saisir.", grade: "BAC obtenu mention Bien ✓", stars: 5 },
    { name: "Fidy M.", avatar: "👨‍💻", bg: "#2A1A4A", date: "Il y a 1 semaine", text: "La correction IA est bluffante pour les maths. Elle explique les erreurs sans donner la réponse directement.", grade: "En préparation", stars: 5 },
  ],
};

const ACCESS_OPTIONS = [
  { id: "sujet", icon: FileText, name: "Sujet seul", desc: "Sujet complet + PDF", price: "2 crédits", priceAr: "1 000 Ar", color: "var(--teal)" },
  { id: "correction_ia", icon: Bot, name: "Sujet + IA", desc: "Explications progressives", price: "4 crédits", priceAr: "2 000 Ar", color: "var(--blue)" },
  { id: "correction_prof", icon: Sparkles, name: "Full Pack", desc: "Correction Professeur", price: "8 crédits", priceAr: "4 000 Ar", color: "var(--gold)" },
];

export default function SubjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [selectedAccess, setSelectedAccess] = useState("sujet");
  const [activeTab, setActiveTab] = useState("apercu");
  const [isPurchased, setIsPurchased] = useState(false);

  // Mouse glow
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      document.querySelectorAll(".subject-page-card").forEach(c => {
        const r = (c as HTMLElement).getBoundingClientRect();
        (c as HTMLElement).style.setProperty("--mx", `${((e.clientX-r.left)/r.width)*100}%`);
        (c as HTMLElement).style.setProperty("--my", `${((e.clientY-r.top)/r.height)*100}%`);
      });
    };
    window.addEventListener("mousemove", fn);
    return () => window.removeEventListener("mousemove", fn);
  }, []);

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      
      {/* ── BREADCRUMB ── */}
      <nav className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest font-mono text-muted/60">
        <Link href="/etudiant" className="hover:text-teal transition-colors">Dashboard</Link>
        <span>/</span>
        <Link href="/catalogue" className="hover:text-teal transition-colors">Catalogue</Link>
        <span>/</span>
        <span className="text-muted italic">{SUJET_MOCK.type} {SUJET_MOCK.annee}</span>
      </nav>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* ── LEFT COLUMN (Main Info) ── */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Subject Header */}
          <div className="subject-page-card glass p-8 md:p-10 rounded-[40px] border border-border/40 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-teal to-transparent opacity-50" />
            
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-3 py-1 rounded-lg bg-teal/10 border border-teal/20 text-teal text-[10px] font-black uppercase tracking-widest">{SUJET_MOCK.type}</span>
              <span className="px-3 py-1 rounded-lg bg-gold/10 border border-gold/20 text-gold text-[10px] font-black uppercase tracking-widest">{SUJET_MOCK.matiere}</span>
              <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-muted text-[10px] font-black uppercase tracking-widest">{SUJET_MOCK.serie}</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-6 leading-[0.95]">
              {SUJET_MOCK.title}
            </h1>
            
            <p className="text-muted text-base md:text-lg leading-relaxed mb-10 font-medium">
              {SUJET_MOCK.description}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center text-gold"><Star className="w-4 h-4 fill-gold" /></div>
                <div>
                  <div className="text-[10px] font-bold text-muted uppercase tracking-widest font-mono">Note</div>
                  <div className="text-sm font-black">{SUJET_MOCK.note}/5</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal/10 flex items-center justify-center text-teal"><Users className="w-4 h-4" /></div>
                <div>
                  <div className="text-[10px] font-bold text-muted uppercase tracking-widest font-mono">Vues</div>
                  <div className="text-sm font-black">{SUJET_MOCK.nbAchats.toLocaleString()}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue/10 flex items-center justify-center text-blue"><FileText className="w-4 h-4" /></div>
                <div>
                  <div className="text-[10px] font-bold text-muted uppercase tracking-widest font-mono">Pages</div>
                  <div className="text-sm font-black">{SUJET_MOCK.pages} pages</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose/10 flex items-center justify-center text-rose"><Clock className="w-4 h-4" /></div>
                <div>
                  <div className="text-[10px] font-bold text-muted uppercase tracking-widest font-mono">Durée</div>
                  <div className="text-sm font-black">{SUJET_MOCK.duree}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Content (Tabs) */}
          <div className="space-y-6">
            <div className="flex gap-2 p-1.5 bg-bg2/50 border border-border/40 rounded-[24px] w-fit">
              {[
                { id: "apercu", icon: Eye, label: "Aperçu" },
                { id: "correction", icon: Bot, label: "Correction IA" },
                { id: "examen", icon: PenTool, label: "Examen Blanc" },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all",
                    activeTab === tab.id 
                      ? "bg-teal text-bg shadow-lg shadow-teal/20 scale-105" 
                      : "text-muted hover:text-text hover:bg-white/5"
                  )}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="subject-page-card glass rounded-[40px] border border-border/40 min-h-[400px] relative overflow-hidden">
              
              {activeTab === "apercu" && (
                <div className="p-8 md:p-12">
                  <div className="prose prose-invert max-w-none">
                    <div className="p-6 rounded-[28px] bg-bg3/50 border border-teal/20 mb-8 border-l-4 border-l-teal">
                      <h4 className="text-teal text-[10px] font-black uppercase tracking-[0.2em] mb-2 font-mono">Instructions Générales</h4>
                      <p className="text-sm text-muted/80 leading-relaxed font-medium">
                        La calculatrice est autorisée. Le candidat traitera les trois exercices dans l'ordre de son choix. 
                        La présentation et la lisibilité sont essentielles.
                      </p>
                    </div>

                    <div className="space-y-10 relative">
                      {SUJET_MOCK.questions.map((q, i) => (
                        <div key={i} className={cn("space-y-4 transition-opacity", i > 1 && !isPurchased && "opacity-20 blur-[2px]")}>
                          <div className="text-teal font-black text-xs font-mono uppercase tracking-widest">Exercice {q.num}</div>
                          <h3 className="text-xl font-bold tracking-tight">{q.titre}</h3>
                          <p className="text-sm text-muted/70 leading-relaxed font-medium pl-6 border-l border-border/40 italic">
                            {q.detail}
                          </p>
                        </div>
                      ))}

                      {!isPurchased && (
                        <div className="absolute inset-x-0 bottom-0 h-60 bg-gradient-to-t from-bg2 to-transparent flex items-end justify-center pb-12">
                          <div className="glass px-6 py-3 rounded-2xl border border-teal/20 bg-teal/5 text-teal text-[11px] font-black uppercase tracking-widest flex items-center gap-3">
                            <Lock className="w-3.5 h-3.5" /> Achète le sujet pour voir la suite
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "correction" && (
                <div className="p-8 md:p-12 space-y-6">
                  <div className="flex items-center gap-4 p-6 rounded-[28px] bg-blue/5 border border-blue/20">
                    <Bot className="w-10 h-10 text-blue animate-pulse" />
                    <div>
                      <h4 className="text-blue text-[10px] font-black uppercase tracking-widest font-mono">Mah.AI Assistant</h4>
                      <p className="text-sm text-muted/80 font-medium">L'IA t'accompagne étape par étape sans donner la solution brute.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-5 rounded-[24px] bg-white/5 border border-white/5 text-sm text-muted self-end ml-12">
                      Comment puis-je prouver que f est croissante sur [1,3] ?
                    </div>
                    <div className="p-5 rounded-[24px] bg-blue/5 border border-blue/10 text-sm text-text/90 mr-12 relative overflow-hidden">
                      <div className="text-[10px] font-black text-blue uppercase mb-2 font-mono">Réponse IA</div>
                      <p className="leading-relaxed">
                        Bonne question ! Pour étudier le sens de variation, tu dois d'abord calculer la dérivée f'(x). 
                        Quel est le signe de f'(x) sur cet intervalle ?
                      </p>
                      {!isPurchased && (
                        <div className="absolute inset-0 bg-bg/80 backdrop-blur-md flex items-center justify-center">
                          <div className="text-center px-6">
                            <Lock className="w-6 h-6 text-muted/40 mx-auto mb-2" />
                            <div className="text-[10px] font-black text-muted uppercase tracking-widest">Correction IA verrouillée</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "examen" && (
                <div className="p-12 text-center">
                  <div className="w-20 h-20 rounded-[28px] bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-8 text-gold">
                    <PenTool className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black tracking-tighter mb-4">Mode Examen Blanc</h3>
                  <p className="text-muted text-base max-w-sm mx-auto mb-10 font-medium leading-relaxed">
                    Teste-toi en conditions réelles avec chronomètre et notation automatique.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4 max-w-lg mx-auto mb-10 text-left">
                    {["Timer officiel 4h", "Barème par exercice", "Analyse de performance", "Historique de score"].map(f => (
                      <div key={f} className="flex items-center gap-3 text-xs font-bold text-muted/80 uppercase tracking-tighter">
                        <CheckCircle2 className="w-4 h-4 text-green" /> {f}
                      </div>
                    ))}
                  </div>
                  <button className="px-8 py-4 bg-gold text-bg font-black rounded-2xl hover:scale-105 transition-all shadow-xl shadow-gold/20">
                    Démarrer l'examen · 3 crédits
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Reviews Section */}
          <div className="subject-page-card glass p-8 md:p-10 rounded-[40px] border border-border/40">
            <h3 className="text-xl font-bold tracking-tight mb-8">Avis des étudiants</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {SUJET_MOCK.reviews.map((rev, i) => (
                <div key={i} className="p-6 rounded-[28px] bg-white/5 border border-white/5 hover:border-teal/20 transition-all group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: rev.bg }}>{rev.avatar}</div>
                      <div>
                        <div className="text-sm font-bold">{rev.name}</div>
                        <div className="text-[10px] text-muted font-mono">{rev.date}</div>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: rev.stars }).map((_, s) => <Star key={s} className="w-3 h-3 fill-gold text-gold" />)}
                    </div>
                  </div>
                  <p className="text-xs text-muted/80 leading-relaxed font-medium italic">"{rev.text}"</p>
                  <div className="mt-4 pt-4 border-t border-white/5 text-[9px] font-black text-green uppercase tracking-widest">{rev.grade}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN (Purchase & Contrib) ── */}
        <div className="lg:col-span-4 space-y-8 sticky top-24">
          
          {/* Purchase Card */}
          <div className="subject-page-card glass p-8 rounded-[40px] border border-teal/20 bg-teal/5 relative overflow-hidden group">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-teal/10 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="relative z-10">
              <div className="text-[10px] font-black text-teal uppercase tracking-widest font-mono mb-2">Choisir ton accès</div>
              <div className="space-y-3 mb-8">
                {ACCESS_OPTIONS.map(opt => (
                  <button 
                    key={opt.id}
                    onClick={() => setSelectedAccess(opt.id)}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-3xl border transition-all text-left group/opt",
                      selectedAccess === opt.id 
                        ? "bg-teal border-teal shadow-xl shadow-teal/20 scale-[1.02]" 
                        : "bg-white/5 border-white/5 hover:border-teal/30"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                      selectedAccess === opt.id ? "bg-bg text-teal" : "bg-white/5 text-muted group-hover/opt:text-teal"
                    )}>
                      <opt.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className={cn("text-xs font-black uppercase tracking-widest", selectedAccess === opt.id ? "text-bg" : "text-text")}>{opt.name}</div>
                      <div className={cn("text-[10px] font-medium", selectedAccess === opt.id ? "text-bg/60" : "text-muted")}>{opt.desc}</div>
                    </div>
                    <div className={cn("font-mono font-bold text-sm", selectedAccess === opt.id ? "text-bg" : "text-teal")}>{opt.price}</div>
                  </button>
                ))}
              </div>

              <button className="w-full py-5 bg-text text-bg font-black rounded-3xl hover:scale-[1.02] transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95">
                💳 Payer avec MVola · {ACCESS_OPTIONS.find(o => o.id === selectedAccess)?.priceAr}
              </button>

              <div className="mt-8 space-y-3">
                {[
                  { icon: ShieldCheck, text: "Paiement 100% sécurisé" },
                  { icon: CheckCircle2, text: "Accès immédiat et illimité" },
                  { icon: FileText, text: "PDF avec watermark inclus" },
                ].map((t, i) => (
                  <div key={i} className="flex items-center gap-3 text-[10px] font-bold text-muted uppercase tracking-tighter">
                    <t.icon className="w-3.5 h-3.5 text-teal" /> {t.text}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contributor Card */}
          <div className="subject-page-card glass p-6 rounded-[32px] border border-border/40">
            <div className="text-[9px] font-black text-muted uppercase tracking-[0.2em] font-mono mb-4">Contributeur</div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-bg3 border border-border/40 flex items-center justify-center text-2xl">
                {SUJET_MOCK.contributeur.avatar}
              </div>
              <div>
                <div className="text-sm font-bold">{SUJET_MOCK.contributeur.name}</div>
                <div className="text-[9px] text-teal font-black uppercase tracking-widest">{SUJET_MOCK.contributeur.role}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
                <div className="text-[9px] font-bold text-muted uppercase font-mono">Sujets</div>
                <div className="text-sm font-black text-text">{SUJET_MOCK.contributeur.nbSujets}</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
                <div className="text-[9px] font-bold text-muted uppercase font-mono">Note</div>
                <div className="text-sm font-black text-gold">★ {SUJET_MOCK.contributeur.note}</div>
              </div>
            </div>
          </div>

          {/* Actions Section */}
          <div className="flex gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-rose/10 hover:text-rose hover:border-rose/20 transition-all">
              <Heart className="w-4 h-4" /> Favoris
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-teal/10 hover:text-teal hover:border-teal/20 transition-all">
              <Share2 className="w-4 h-4" /> Partager
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
