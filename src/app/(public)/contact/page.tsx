'use client'

import { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, MessageSquare, Send, Phone, MapPin, ArrowRight, CheckCircle2 } from "lucide-react";

// ============================================
// MAH.AI — Contact
// ============================================
// Formulaire de contact et infos support
// Design interactif et premium
// ============================================

export default function ContactPage() {
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success'>('idle');

  // Reveal on scroll
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); });
    }, { threshold: 0.1 });
    document.querySelectorAll(".reveal").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('submitting');
    // Simulate API call
    setTimeout(() => setFormState('success'), 1500);
  };

  return (
    <div className="min-h-screen bg-bg relative overflow-hidden">
      {/* Mesh background */}
      <div className="mesh-bg" aria-hidden="true">
        <span /><span /><span />
      </div>

      {/* ── HEADER ── */}
      <section className="relative z-10 pt-32 pb-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal/5 border border-teal/20 text-teal text-[10px] font-bold uppercase tracking-widest mb-8 reveal">
            👋 On t'écoute
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 reveal reveal-delay-1">
            Parlons de <br /><span className="text-gradient">ton projet.</span>
          </h1>
          <p className="text-muted text-lg max-w-xl mx-auto font-medium reveal reveal-delay-2">
            Une question, un partenariat ou besoin d'assistance ? Notre équipe est prête à t'aider.
          </p>
        </div>
      </section>

      {/* ── CONTENT ── */}
      <section className="relative z-10 pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-12">
            
            {/* Info Column */}
            <div className="lg:col-span-2 space-y-8 reveal reveal-delay-3">
              <div className="glass p-8 rounded-[32px] border border-border/40 relative overflow-hidden group">
                <div className="absolute -top-12 -left-12 w-32 h-32 bg-teal/10 rounded-full blur-[60px] group-hover:bg-teal/20 transition-all" />
                <h2 className="text-2xl font-bold mb-8 tracking-tight">Coordonnées</h2>
                
                <div className="space-y-6">
                  <a href="mailto:support@mah-ai.mg" className="flex items-center gap-4 group/item">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-teal group-hover/item:scale-110 transition-transform border border-white/5">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-muted uppercase tracking-widest font-mono">Email Support</div>
                      <div className="text-text font-medium">support@mah-ai.mg</div>
                    </div>
                  </a>

                  <a href="https://wa.me/261" target="_blank" className="flex items-center gap-4 group/item">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-green group-hover/item:scale-110 transition-transform border border-white/5">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-muted uppercase tracking-widest font-mono">WhatsApp</div>
                      <div className="text-text font-medium">+261 34 00 000 00</div>
                    </div>
                  </a>

                  <div className="flex items-center gap-4 group/item">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gold group-hover/item:scale-110 transition-transform border border-white/5">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-muted uppercase tracking-widest font-mono">Bureau</div>
                      <div className="text-text font-medium">Antananarivo, Madagascar</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass p-8 rounded-[32px] border border-border/40">
                <h3 className="text-sm font-bold text-teal uppercase tracking-widest font-mono mb-4">Établissements</h3>
                <p className="text-sm text-muted/80 leading-relaxed mb-6">
                  Vous gérez un lycée ou une école ? Demandez une démo de notre offre groupée et nos tarifs préférentiels.
                </p>
                <Link href="/pricing" className="text-xs font-black text-text flex items-center gap-2 group">
                  Voir l'offre établissement <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Form Column */}
            <div className="lg:col-span-3 reveal reveal-delay-4">
              <div className="glass p-10 md:p-12 rounded-[40px] border border-border/50 relative overflow-hidden">
                {formState === 'success' ? (
                  <div className="text-center py-12 animate-fade-in">
                    <div className="w-20 h-20 rounded-full bg-teal/10 border border-teal/20 flex items-center justify-center mx-auto mb-8 text-teal">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-black mb-4 tracking-tighter text-text">Message Envoyé !</h2>
                    <p className="text-muted max-w-sm mx-auto mb-10 font-medium">
                      Merci de nous avoir contacté. Notre équipe te répondra par email dans les plus brefs délais (généralement en moins de 24h).
                    </p>
                    <button 
                      onClick={() => setFormState('idle')}
                      className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold hover:bg-white/10 transition-all"
                    >
                      Envoyer un autre message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted uppercase tracking-widest font-mono ml-4">Ton Nom</label>
                        <input 
                          required
                          type="text" 
                          placeholder="Ex: Miora Rakoto"
                          className="w-full h-14 rounded-2xl bg-bg4 border border-border/40 px-6 text-text placeholder:text-muted/40 focus:border-teal/40 focus:bg-bg3 transition-all outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted uppercase tracking-widest font-mono ml-4">Ton Email</label>
                        <input 
                          required
                          type="email" 
                          placeholder="miora@gmail.com"
                          className="w-full h-14 rounded-2xl bg-bg4 border border-border/40 px-6 text-text placeholder:text-muted/40 focus:border-teal/40 focus:bg-bg3 transition-all outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted uppercase tracking-widest font-mono ml-4">Sujet de ta demande</label>
                      <div className="relative group/select">
                        <select className="w-full h-14 rounded-2xl bg-bg4 border border-border/40 px-6 text-text/90 focus:border-teal/40 focus:bg-bg3 transition-all outline-none appearance-none cursor-pointer">
                          <option className="bg-bg2">Aide sur l'achat de crédits</option>
                          <option className="bg-bg2">Problème technique sur un sujet</option>
                          <option className="bg-bg2">Devenir contributeur ou professeur</option>
                          <option className="bg-bg2">Partenariat établissement</option>
                          <option className="bg-bg2">Autre question</option>
                        </select>
                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none group-hover/select:text-teal transition-colors" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted uppercase tracking-widest font-mono ml-4">Ton Message</label>
                      <textarea 
                        required
                        rows={5}
                        placeholder="Comment pouvons-nous t'aider ?"
                        className="w-full p-6 rounded-3xl bg-bg4 border border-border/40 text-text placeholder:text-muted/40 focus:border-teal/40 focus:bg-bg3 transition-all outline-none resize-none"
                      />
                    </div>

                    <button 
                      disabled={formState === 'submitting'}
                      type="submit"
                      className="w-full py-5 bg-teal text-bg font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-[0_20px_50px_rgba(10,255,224,0.3)] disabled:opacity-50 disabled:grayscale"
                    >
                      {formState === 'submitting' ? (
                        <div className="w-5 h-5 border-2 border-bg border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          Envoyer le message
                          <Send className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      <footer className="relative z-10 py-12 text-center text-muted/40 text-xs font-mono border-t border-border/20">
        Mah.AI Support Team — 🇲🇬 Antananarivo
      </footer>
    </div>
  );
}
