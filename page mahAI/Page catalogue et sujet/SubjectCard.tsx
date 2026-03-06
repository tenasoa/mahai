// components/shared/SubjectCard.tsx - Carte d'un sujet dans le catalogue

'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { SujetDisplay } from '@/types';

interface SubjectCardProps {
  sujet: SujetDisplay;
  viewMode?: 'grid' | 'list';
  onWishlistToggle?: (sujetId: string) => void;
  isWished?: boolean;
}

export function SubjectCard({ 
  sujet, 
  viewMode = 'grid',
  onWishlistToggle,
  isWished = false 
}: SubjectCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <Link
      href={`/catalogue/${sujet.id}`}
      className={`scard acc-${sujet.statut} ${viewMode === 'list' ? 'list-mode' : ''}`}
    >
      {/* Badges nouveauté/populaire */}
      {sujet.isNew && <div className="new-badge">NOUVEAU</div>}
      {sujet.isPopular && !sujet.isNew && <div className="pop-badge">⭐ POPULAIRE</div>}

      {/* Header */}
      <div className="scard-header">
        <div className="scard-badges">
          {sujet.badges.map((badge) => (
            <span key={badge.label} className={`sbadge sb-${badge.color}`}>
              {badge.label}
            </span>
          ))}
        </div>
        
        <div className="scard-title">
          {sujet.emoji} {sujet.matiere} — {sujet.typeExamen} {sujet.annee}
        </div>
        
        {viewMode !== 'list' && (
          <div className="scard-desc">
            {sujet.serie && `Série ${sujet.serie} · `}
            Barème {sujet.bareme || 20} points · {sujet.duree || 240} min
          </div>
        )}
      </div>

      {/* Body - Stats */}
      <div className="scard-body">
        <div className="scard-stats">
          {/* Note moyenne */}
          <div className="scard-stat">
            <span className="stars-mini">
              {'★'.repeat(Math.floor(sujet.notemoyenne || 4))}
            </span>
            <span style={{ color: 'var(--text)', fontWeight: 600 }}>
              {(sujet.notemoyenne || 4).toFixed(1)}
            </span>
            <span>({sujet.nbNotes || 0})</span>
          </div>

          {/* Pages */}
          <div className="scard-stat">
            📄 {sujet.nbPages || 4}p
          </div>

          {/* Série */}
          {sujet.serie && (
            <div className="scard-stat">
              📋 {sujet.serie}
            </div>
          )}
        </div>
      </div>

      {/* Footer - Prix et actions */}
      <div className="scard-footer">
        <div className="scard-price">
          <div className="price-main" style={{ color: sujet.color }}>
            {sujet.prixCredits} crédit{sujet.prixCredits > 1 ? 's' : ''}
          </div>
          <div className="price-ar">
            ≈ {sujet.arPrice} Ar
          </div>
        </div>

        <div className="scard-actions">
          {/* Bouton wishlist */}
          <button
            className={`btn-wish ${isWished ? 'on' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onWishlistToggle?.(sujet.id);
            }}
            aria-label={isWished ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            {isWished ? '❤️' : '🤍'}
          </button>

          {/* Bouton consulter */}
          <button className="btn-consult">
            Consulter →
          </button>
        </div>
      </div>
    </Link>
  );
}
