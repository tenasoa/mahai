// app/(public)/catalogue/page.tsx - Page catalogue des sujets

import { Suspense } from 'react';
import { getSujets } from '@/lib/db/queries/sujets';
import { getCurrentUser } from '@/lib/auth/clerk';
import { CatalogueClient } from './CatalogueClient';
import { Navigation } from '@/components/shared/Navigation';
import type { SujetDisplay } from '@/types';

/**
 * Transformer un Sujet en SujetDisplay pour l'UI
 */
function transformSujetForDisplay(sujet: any): SujetDisplay {
  // Mapping des emojis par matière
  const emojiMap: Record<string, string> = {
    MATHEMATIQUES: '📐',
    PHYSIQUE_CHIMIE: '⚗️',
    SVT: '🧬',
    FRANCAIS: '📚',
    ANGLAIS: '🇬🇧',
    MALAGASY: '🇲🇬',
    HISTOIRE_GEO: '🌍',
    PHILOSOPHIE: '💭',
    INFORMATIQUE: '💻',
    AUTRE: '📖',
  };

  // Mapping des couleurs par type d'examen
  const colorMap: Record<string, string> = {
    CEPE: 'var(--green)',
    BEPC: 'var(--blue)',
    BAC: 'var(--gold)',
    UNIVERSITE: 'var(--purple)',
    CONCOURS_FP: 'var(--rose)',
  };

  // Génération des badges
  const badges: any[] = [
    { label: sujet.typeExamen, color: 'teal' },
  ];

  if (sujet.matiere) {
    const matiereMap: Record<string, string> = {
      MATHEMATIQUES: 'Maths',
      PHYSIQUE_CHIMIE: 'Physique',
      SVT: 'SVT',
      FRANCAIS: 'Français',
      ANGLAIS: 'Anglais',
      MALAGASY: 'Malagasy',
      HISTOIRE_GEO: 'Histoire-Géo',
      PHILOSOPHIE: 'Philo',
      INFORMATIQUE: 'Info',
    };
    badges.push({ label: matiereMap[sujet.matiere] || sujet.matiere, color: 'gold' });
  }

  if (sujet.serie) {
    badges.push({ label: `Série ${sujet.serie}`, color: 'rose' });
  }

  badges.push({ label: sujet.annee.toString(), color: 'blue' });

  // Calculer si nouveau (moins de 30 jours)
  const isNew = sujet.createdAt && 
    (new Date().getTime() - new Date(sujet.createdAt).getTime()) < 30 * 24 * 60 * 60 * 1000;

  // Populaire si plus de 50 achats
  const isPopular = (sujet.nbAchats || 0) > 50;

  return {
    ...sujet,
    emoji: emojiMap[sujet.matiere] || '📖',
    badges,
    color: colorMap[sujet.typeExamen] || 'var(--text)',
    arPrice: `${sujet.prixCredits * 500} Ar`,
    isNew,
    isPopular,
  };
}

export default async function CataloguePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Récupérer l'utilisateur si connecté
  const user = await getCurrentUser();

  // Paramètres de filtrage et pagination
  const page = Number(searchParams.page) || 1;
  const pageSize = 12;
  
  const typeExamen = searchParams.type 
    ? (Array.isArray(searchParams.type) ? searchParams.type : [searchParams.type])
    : undefined;
  
  const matiere = searchParams.matiere
    ? (Array.isArray(searchParams.matiere) ? searchParams.matiere : [searchParams.matiere])
    : undefined;

  const search = typeof searchParams.search === 'string' ? searchParams.search : undefined;
  const sort = (searchParams.sort as any) || 'recents';

  // Fetch des sujets
  const { items, total, totalPages } = await getSujets(
    {
      typeExamen: typeExamen as any,
      matiere: matiere as any,
      search,
    },
    page,
    pageSize,
    sort
  );

  // Transformation pour l'affichage
  const sujetsDisplay = items.map(transformSujetForDisplay);

  return (
    <div className="min-h-screen bg-bg text-text">
      {/* Navigation */}
      <Navigation userCredits={user?.credits} />

      {/* Contenu principal */}
      <div className="pt-16">
        <Suspense fallback={<CatalogueLoading />}>
          <CatalogueClient
            initialSujets={sujetsDisplay}
            totalPages={totalPages}
            currentPage={page}
            userConnected={!!user}
          />
        </Suspense>
      </div>
    </div>
  );
}

function CatalogueLoading() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="animate-pulse">
        <div className="h-12 bg-bg2 rounded-lg mb-6 w-1/3" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-bg2 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

// Métadonnées SEO
export const metadata = {
  title: 'Catalogue des sujets | Mah.AI',
  description: 'Parcourez notre catalogue complet de sujets d\'examens nationaux malgaches : CEPE, BEPC, BAC et plus.',
};
