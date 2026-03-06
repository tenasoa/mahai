// app/(public)/catalogue/[id]/SujetDetailClient.tsx - Partie client de la page sujet

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Sujet, User } from '@/types';

interface SujetDetailClientProps {
  sujet: Sujet;
  user: User | null;
  hasAccess: boolean;
  similarSujets: Sujet[];
}

const ACCESS_OPTIONS = [
  {
    id: 'sujet',
    name: 'Sujet seul',
    desc: 'Aperçu + téléchargement PDF',
    icon: '📄',
    price: 2,
    color: 'var(--teal)',
  },
  {
    id: 'correction_ia',
    name: 'Sujet + Correction IA',
    desc: 'Tout + correction détaillée',
    icon: '🤖',
    price: 3,
    color: 'var(--blue)',
  },
  {
    id: 'examen_blanc',
    name: 'Pack Examen Blanc',
    desc: 'Sujet + timer + correction auto',
    icon: '📝',
    price: 4,
    color: 'var(--purple)',
  },
];

export function SujetDetailClient({
  sujet,
  user,
  hasAccess,
  similarSujets,
}: SujetDetailClientProps) {
  const router = useRouter();
  const [selectedAccess, setSelectedAccess] = useState('correction_ia');
  const [activeTab, setActiveTab] = useState('apercu');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });

  const showToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const handlePurchase = async () => {
    if (!user) {
      router.push('/sign-in?redirect=/catalogue/' + sujet.id);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/achats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sujetId: sujet.id,
          typeAcces: selectedAccess.toUpperCase(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        showToast('✅ Achat réussi ! Accès débloqué.');
        setTimeout(() => router.refresh(), 1500);
      } else {
        showToast('❌ ' + data.message);
      }
    } catch (error) {
      showToast('❌ Erreur lors de l\'achat');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedOption = ACCESS_OPTIONS.find((o) => o.id === selectedAccess);

  return (
    <div className="max-w-[1200px] mx-auto px-6 pb-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[12px] font-mono text-muted mb-6">
        <Link href="/catalogue" className="hover:text-teal transition-colors">
          Catalogue
        </Link>
        <span>/</span>
        <span className="text-text">{sujet.titre}</span>
      </nav>

      {/* Layout Bento */}
      <div className="grid grid-cols-[1fr_380px] gap-5 items-start">
        {/* Colonne gauche */}
        <div className="space-y-5">
          {/* Header Card */}
          <div className="bg-bg2 border border-border rounded-[20px] p-9 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-teal to-transparent" />

            {/* Métadonnées */}
            <div className="flex flex-wrap gap-2 mb-5">
              <Badge color="teal">{sujet.typeExamen}</Badge>
              <Badge color="gold">{sujet.matiere}</Badge>
              {sujet.serie && <Badge color="rose">Série {sujet.serie}</Badge>}
              <Badge color="blue">{sujet.annee}</Badge>
              {sujet.duree && <Badge color="muted">⏱ {sujet.duree} min</Badge>}
            </div>

            {/* Titre */}
            <h1 className="text-[clamp(22px,3vw,32px)] font-extrabold tracking-tight leading-tight mb-4">
              {sujet.titre}
            </h1>

            {/* Description */}
            <p className="text-[15px] text-muted leading-relaxed mb-6">
              Sujet officiel {sujet.typeExamen} {sujet.annee}
              {sujet.serie && ` - Série ${sujet.serie}`}. 
              Durée : {sujet.duree || 240} minutes. Barème : {sujet.bareme || 20} points.
            </p>

            {/* Stats */}
            <div className="flex gap-6 flex-wrap">
              <Stat label="Note moyenne" value={`★ ${(sujet.notemoyenne || 4).toFixed(1)}`} />
              <Stat label="Consultations" value={`${sujet.nbAchats || 0}`} />
              <Stat label="Pages" value={`${sujet.nbPages || 4}`} />
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-bg2 border border-border rounded-[20px] overflow-hidden">
            {/* Tab Headers */}
            <div className="flex gap-1 p-2 border-b border-border">
              {[
                { id: 'apercu', label: '👁 Aperçu' },
                { id: 'correction', label: '🤖 Correction IA', locked: !hasAccess },
                { id: 'examen', label: '📝 Examen blanc', locked: !hasAccess },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  disabled={tab.locked}
                  className={`flex-1 px-4 py-2.5 text-[13px] font-medium rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-bg3 text-text'
                      : tab.locked
                      ? 'text-muted/50 cursor-not-allowed'
                      : 'text-muted hover:text-text'
                  }`}
                >
                  {tab.label} {tab.locked && '🔒'}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-7">
              {activeTab === 'apercu' && (
                <div className="space-y-4">
                  <div className="bg-bg3 border-l-[3px] border-teal rounded-lg p-4">
                    <div className="text-[11px] font-mono text-teal mb-2">
                      INSTRUCTIONS GÉNÉRALES
                    </div>
                    <div className="text-[13px] text-muted leading-relaxed">
                      La calculatrice est autorisée. Le candidat traitera les exercices dans
                      l'ordre de son choix. La présentation, la lisibilité et la qualité de
                      la rédaction sont pris en compte.
                    </div>
                  </div>

                  <div className="space-y-3 text-[14px] leading-relaxed">
                    <div>
                      <span className="text-teal font-mono text-[13px] font-semibold">
                        EXERCICE 1
                      </span>
                      <div className="text-text mt-1">
                        Soit f la fonction définie sur ℝ par f(x) = 2x² - 3x + 1.
                      </div>
                      <div className="text-muted text-[13px] mt-1 pl-4 border-l-2 border-border">
                        1. Déterminer les racines de f.<br />
                        2. Tracer la courbe représentative de f.<br />
                        3. Étudier les variations de f.
                      </div>
                    </div>

                    {/* Blur overlay si pas d'accès */}
                    {!hasAccess && (
                      <div className="relative h-40 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-bg2 flex items-end justify-center pb-6">
                          <div className="flex items-center gap-3 bg-teal/6 border border-dashed border-teal/25 rounded-xl px-5 py-3">
                            <span>🔒</span>
                            <span className="text-[13px] font-mono text-teal">
                              Débloquez le sujet complet pour {sujet.prixCredits} crédits
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'correction' && (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">🤖</div>
                  <div className="text-lg font-bold mb-2">Correction IA disponible</div>
                  <div className="text-muted text-sm">
                    Achetez l'accès pour voir la correction détaillée
                  </div>
                </div>
              )}

              {activeTab === 'examen' && (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">📝</div>
                  <div className="text-lg font-bold mb-2">Mode Examen Blanc</div>
                  <div className="text-muted text-sm">
                    Entraînez-vous en conditions réelles d'examen
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Colonne droite (sticky) */}
        <div className="sticky top-20 space-y-4">
          {/* Purchase Card */}
          <div className="bg-bg2 border border-border rounded-[20px] p-6">
            <div className="text-center mb-6">
              <div className="text-[12px] font-mono text-muted mb-1">À PARTIR DE</div>
              <div className="text-[48px] font-bold text-teal leading-none mb-1">
                {selectedOption?.price}
              </div>
              <div className="text-[13px] text-muted">
                crédits · ≈ {(selectedOption?.price || 0) * 500} Ar
              </div>
            </div>

            {/* Options d'accès */}
            <div className="space-y-2 mb-6">
              <div className="text-[12px] font-mono text-muted uppercase mb-3">
                Choisir ton accès
              </div>
              {ACCESS_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedAccess(opt.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    selectedAccess === opt.id
                      ? 'border-teal/25 bg-teal/5'
                      : 'border-border hover:border-border2'
                  }`}
                >
                  <div className="text-2xl">{opt.icon}</div>
                  <div className="flex-1 text-left">
                    <div
                      className={`text-[14px] font-semibold ${
                        selectedAccess === opt.id ? 'text-teal' : 'text-text'
                      }`}
                    >
                      {opt.name}
                    </div>
                    <div className="text-[12px] text-muted">{opt.desc}</div>
                  </div>
                  <div className="text-[14px] font-mono font-semibold text-muted">
                    {opt.price}c
                  </div>
                </button>
              ))}
            </div>

            {/* Bouton d'achat */}
            <button
              onClick={handlePurchase}
              disabled={isLoading || hasAccess}
              className="w-full bg-gradient-to-r from-teal to-teal2 text-bg font-semibold py-3.5 rounded-lg hover:shadow-[0_0_20px_rgba(10,255,224,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '⏳ Traitement...' : hasAccess ? '✅ Déjà acheté' : '💳 Acheter maintenant'}
            </button>

            {/* Trust badges */}
            <div className="mt-4 space-y-2 text-[12px] text-muted">
              <div className="flex items-center gap-2">
                <span>✓</span>
                <span>Accès immédiat après paiement</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✓</span>
                <span>PDF téléchargeable avec watermark</span>
              </div>
            </div>
          </div>

          {/* Contributeur */}
          {sujet.contributeur && (
            <div className="bg-bg2 border border-border rounded-[20px] p-5">
              <div className="text-[11px] font-mono text-muted uppercase mb-3">
                Contributeur
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal to-teal2 flex items-center justify-center text-lg font-bold">
                  {sujet.contributeur.prenom[0]}
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-text">
                    {sujet.contributeur.prenom} {sujet.contributeur.nom?.[0]}.
                  </div>
                  <div className="text-[12px] text-muted">Contributeur vérifié</div>
                </div>
              </div>
            </div>
          )}

          {/* Sujets similaires */}
          {similarSujets.length > 0 && (
            <div>
              <div className="text-[12px] font-mono text-muted uppercase mb-3">
                Sujets similaires
              </div>
              <div className="space-y-2">
                {similarSujets.map((s) => (
                  <Link
                    key={s.id}
                    href={`/catalogue/${s.id}`}
                    className="block bg-bg2 border border-border rounded-lg p-3 hover:border-border2 transition-colors"
                  >
                    <div className="text-[13px] font-semibold text-text mb-1">
                      {s.matiere} {s.annee}
                    </div>
                    <div className="text-[11px] text-muted">{s.prixCredits} crédits</div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 bg-bg2 border border-border rounded-lg px-5 py-3 shadow-lg animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="text-lg">✨</span>
            <span className="text-[14px]">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Badge({ color, children }: { color: string; children: React.ReactNode }) {
  const colorClasses: Record<string, string> = {
    teal: 'bg-teal/8 border-teal/25 text-teal',
    gold: 'bg-gold/8 border-gold/25 text-gold',
    rose: 'bg-rose/8 border-rose/25 text-rose',
    blue: 'bg-blue/8 border-blue/25 text-blue',
    muted: 'bg-white/5 border-border text-muted',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[12px] font-mono font-semibold border ${colorClasses[color]}`}
    >
      {children}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-[13px]">
      <span className="text-muted">{label}:</span>
      <span className="text-text font-semibold">{value}</span>
    </div>
  );
}
