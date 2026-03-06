// app/(public)/catalogue/[id]/page.tsx - Page détail d'un sujet

import { notFound } from 'next/navigation';
import { getSujetById, getSimilarSujets } from '@/lib/db/queries/sujets';
import { getCurrentUser } from '@/lib/auth/clerk';
import { userHasAccessToSujet } from '@/lib/db/queries/sujets';
import { Navigation } from '@/components/shared/Navigation';
import { SujetDetailClient } from './SujetDetailClient';

interface SujetPageProps {
  params: {
    id: string;
  };
}

export default async function SujetPage({ params }: SujetPageProps) {
  const { id } = params;

  // Fetch parallèle du sujet et de l'utilisateur
  const [sujet, user] = await Promise.all([
    getSujetById(id),
    getCurrentUser(),
  ]);

  // 404 si sujet introuvable
  if (!sujet) {
    notFound();
  }

  // Vérifier si l'utilisateur a accès
  const hasAccess = user ? await userHasAccessToSujet(user.id, id) : false;

  // Récupérer les sujets similaires
  const similarSujets = await getSimilarSujets(id, 4);

  return (
    <div className="min-h-screen bg-bg text-text">
      {/* Navigation */}
      <Navigation userCredits={user?.credits} />

      {/* Contenu */}
      <div className="pt-20">
        <SujetDetailClient
          sujet={sujet}
          user={user}
          hasAccess={hasAccess}
          similarSujets={similarSujets}
        />
      </div>
    </div>
  );
}

// Métadonnées dynamiques
export async function generateMetadata({ params }: SujetPageProps) {
  const sujet = await getSujetById(params.id);

  if (!sujet) {
    return {
      title: 'Sujet introuvable | Mah.AI',
    };
  }

  return {
    title: `${sujet.titre} | Mah.AI`,
    description: `Consultez le sujet de ${sujet.matiere} ${sujet.typeExamen} ${sujet.annee}. ${sujet.serie ? `Série ${sujet.serie}.` : ''} ${sujet.prixCredits} crédits.`,
  };
}
