// app/(public)/catalogue/CatalogueClient.tsx - Partie client du catalogue

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SubjectCard } from '@/components/shared/SubjectCard';
import type { SujetDisplay } from '@/types';

interface CatalogueClientProps {
  initialSujets: SujetDisplay[];
  totalPages: number;
  currentPage: number;
  userConnected: boolean;
}

export function CatalogueClient({
  initialSujets,
  totalPages,
  currentPage,
  userConnected,
}: CatalogueClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // États
  const [sujets] = useState(initialSujets);
  const [viewMode, setViewMode] = useState<'grid3' | 'grid2' | 'list'>('grid3');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [showSearch, setShowSearch] = useState(false);
  const [wished, setWished] = useState<Set<string>>(new Set());

  // Filtres actifs
  const activeTypes = searchParams.getAll('type');
  const activeMatieres = searchParams.getAll('matiere');

  // Gestion du wishlist (localStorage)
  useEffect(() => {
    const savedWishlist = localStorage.getItem('mah-wishlist');
    if (savedWishlist) {
      setWished(new Set(JSON.parse(savedWishlist)));
    }
  }, []);

  const toggleWishlist = useCallback((sujetId: string) => {
    setWished((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sujetId)) {
        newSet.delete(sujetId);
      } else {
        newSet.add(sujetId);
      }
      localStorage.setItem('mah-wishlist', JSON.stringify([...newSet]));
      return newSet;
    });
  }, []);

  // Mise à jour des filtres
  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (params.getAll(key).includes(value)) {
      // Retirer le filtre
      const values = params.getAll(key).filter((v) => v !== value);
      params.delete(key);
      values.forEach((v) => params.append(key, v));
    } else {
      // Ajouter le filtre
      params.append(key, value);
    }
    
    params.set('page', '1'); // Reset à la page 1
    router.push(`/catalogue?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push('/catalogue');
  };

  // Classe de grid selon le mode
  const gridClass = viewMode === 'grid3' ? 'grid-cols-3' : viewMode === 'grid2' ? 'grid-cols-2' : 'grid-cols-1';

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex gap-6">
        {/* Sidebar Filtres */}
        <aside className="w-64 flex-shrink-0 sticky top-20 h-fit">
          <div className="space-y-6">
            {/* Type d'examen */}
            <FilterSection title="Type d'examen">
              {['CEPE', 'BEPC', 'BAC', 'UNIVERSITE', 'CONCOURS_FP'].map((type) => (
                <FilterChip
                  key={type}
                  label={type}
                  active={activeTypes.includes(type)}
                  onClick={() => updateFilter('type', type)}
                />
              ))}
            </FilterSection>

            {/* Matière */}
            <FilterSection title="Matière">
              {[
                'MATHEMATIQUES',
                'PHYSIQUE_CHIMIE',
                'SVT',
                'FRANCAIS',
                'ANGLAIS',
                'HISTOIRE_GEO',
              ].map((matiere) => (
                <FilterChip
                  key={matiere}
                  label={matiere.replace('_', '-')}
                  active={activeMatieres.includes(matiere)}
                  onClick={() => updateFilter('matiere', matiere)}
                />
              ))}
            </FilterSection>

            {/* Reset */}
            {(activeTypes.length > 0 || activeMatieres.length > 0) && (
              <button
                onClick={clearAllFilters}
                className="w-full px-4 py-2 text-sm border border-border rounded-lg text-muted hover:text-text hover:border-border2 transition-colors"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        </aside>

        {/* Contenu principal */}
        <main className="flex-1 min-w-0">
          {/* Barre de recherche et toolbar */}
          <div className="mb-6 space-y-4">
            {/* Recherche */}
            <div className="relative">
              <div className="flex items-center gap-3 bg-bg2 border border-border rounded-xl px-5 py-3 focus-within:border-border2 focus-within:shadow-[0_0_0_3px_rgba(10,255,224,0.08)] transition-all">
                <span className="text-lg text-muted">🔍</span>
                <input
                  type="text"
                  placeholder="Rechercher un sujet..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const params = new URLSearchParams(searchParams.toString());
                      if (search) {
                        params.set('search', search);
                      } else {
                        params.delete('search');
                      }
                      params.set('page', '1');
                      router.push(`/catalogue?${params.toString()}`);
                    }
                  }}
                  className="flex-1 bg-transparent border-none outline-none text-[15px] text-text placeholder:text-muted"
                />
                <kbd className="px-2 py-1 text-[11px] font-mono text-muted2 bg-bg3 border border-muted2 rounded">
                  ⏎
                </kbd>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between">
              <div className="text-[13px] font-mono text-muted">
                <strong className="text-text">{sujets.length}</strong> sujets trouvés
              </div>

              {/* View mode */}
              <div className="flex gap-0.5 bg-bg2 border border-border rounded-lg p-0.5">
                {[
                  ['grid3', '⊞'],
                  ['grid2', '⊟'],
                  ['list', '☰'],
                ].map(([mode, icon]) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode as any)}
                    className={`w-8 h-8 flex items-center justify-center rounded text-sm transition-all ${
                      viewMode === mode ? 'bg-bg3 text-text' : 'text-muted hover:text-text'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Grille de sujets */}
          {sujets.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <div className="text-xl font-bold mb-2">Aucun sujet trouvé</div>
              <div className="text-muted mb-6">
                Essaie d'élargir tes filtres ou de changer ta recherche.
              </div>
              <button
                onClick={clearAllFilters}
                className="px-6 py-2 bg-teal/10 border border-teal/20 text-teal rounded-lg hover:bg-teal/15 transition-colors"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className={`grid ${gridClass} gap-3.5`}>
              {sujets.map((sujet) => (
                <SubjectCard
                  key={sujet.id}
                  sujet={sujet}
                  viewMode={viewMode === 'list' ? 'list' : 'grid'}
                  isWished={wished.has(sujet.id)}
                  onWishlistToggle={toggleWishlist}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                disabled={currentPage === 1}
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set('page', String(currentPage - 1));
                  router.push(`/catalogue?${params.toString()}`);
                }}
                className="px-4 py-2 border border-border rounded-lg text-muted disabled:opacity-50 hover:border-border2 hover:text-text transition-colors"
              >
                ‹
              </button>

              {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      params.set('page', String(pageNum));
                      router.push(`/catalogue?${params.toString()}`);
                    }}
                    className={`px-4 py-2 border rounded-lg transition-colors ${
                      currentPage === pageNum
                        ? 'bg-teal/10 border-teal/20 text-teal'
                        : 'border-border text-muted hover:border-border2 hover:text-text'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                disabled={currentPage === totalPages}
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set('page', String(currentPage + 1));
                  router.push(`/catalogue?${params.toString()}`);
                }}
                className="px-4 py-2 border border-border rounded-lg text-muted disabled:opacity-50 hover:border-border2 hover:text-text transition-colors"
              >
                ›
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] font-mono tracking-wider text-muted uppercase mb-2.5">
        {title}
      </div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all ${
        active
          ? 'bg-teal/8 border-teal2 text-teal'
          : 'border-border text-muted hover:border-border2 hover:text-text'
      }`}
    >
      {label}
    </button>
  );
}
