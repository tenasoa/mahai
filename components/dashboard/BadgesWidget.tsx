"use client";

import { useEffect, useState } from "react";
import { Award, Trophy } from "lucide-react";
import { BADGES, getBadgeById, type BadgeDefinition } from "@/lib/badges";
import { checkAndAwardBadgesAction } from "@/actions/user";
import { Confetti } from "@/components/ui/Confetti";
import { useConfettiTrigger } from "@/lib/hooks/useConfettiTrigger";
import "./badges-widget.css";

const CATEGORY_LABELS: Record<BadgeDefinition["category"], string> = {
  debut: "Début",
  streak: "Streak",
  performance: "Performance",
  social: "Social",
  elite: "Élite",
};

const CATEGORY_ORDER: BadgeDefinition["category"][] = [
  "debut",
  "streak",
  "performance",
  "social",
  "elite",
];

interface BadgesWidgetProps {
  earnedBadgeIds?: string[];
}

export function BadgesWidget({ earnedBadgeIds }: BadgesWidgetProps) {
  const [badgeIds, setBadgeIds] = useState<string[]>(earnedBadgeIds ?? []);
  const [newBadgeIds, setNewBadgeIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(!earnedBadgeIds);

  // Vérifie et décerne les badges au montage
  useEffect(() => {
    if (earnedBadgeIds) {
      setBadgeIds(earnedBadgeIds);
      setLoading(false);
      return;
    }

    checkAndAwardBadgesAction().then((result) => {
      setBadgeIds(result.allBadgeIds);
      setNewBadgeIds(result.newBadges);
      setLoading(false);
    });
  }, [earnedBadgeIds]);

  const hasNewBadges = newBadgeIds.length > 0;
  const { trigger: showConfetti } = useConfettiTrigger(hasNewBadges, {
    delay: 600,
  });

  // Group badges by category
  const badgesByCategory = new Map<
    BadgeDefinition["category"],
    BadgeDefinition[]
  >();
  for (const category of CATEGORY_ORDER) {
    badgesByCategory.set(category, []);
  }

  for (const badge of BADGES) {
    const cat = badge.category;
    if (!badgesByCategory.has(cat)) {
      badgesByCategory.set(cat, []);
    }
    badgesByCategory.get(cat)!.push(badge);
  }

  const earnedSet = new Set(badgeIds);
  const earnedCount = badgeIds.length;
  const totalCount = BADGES.length;

  if (loading) {
    return <BadgesSkeleton />;
  }

  if (earnedCount === 0) {
    return (
      <div className="badges-card badges-empty-state">
        <div className="badges-empty-icon">
          <Award size={32} />
        </div>
        <p className="badges-empty-title">Aucun badge pour le moment</p>
        <p className="badges-empty-hint">
          Achète des sujets, utilise la correction IA et maintiens ton streak
          pour débloquer des badges !
        </p>
      </div>
    );
  }

  return (
    <>
      {showConfetti && <Confetti trigger={showConfetti} type="achievement" />}
      <div className="badges-card">
        <div className="badges-header">
          <div className="badges-header-left">
            <Trophy size={16} />
            <span className="badges-title">Badges</span>
          </div>
          <span className="badges-count">
            {earnedCount}/{totalCount}
          </span>
        </div>

        <div className="badges-grid">
          {CATEGORY_ORDER.map((category) => {
            const categoryBadges = badgesByCategory.get(category) || [];
            const earnedInCat = categoryBadges.filter((b) =>
              earnedSet.has(b.id),
            );
            if (earnedInCat.length === 0 && categoryBadges.length === 0)
              return null;

            return (
              <div key={category} className="badges-category">
                <div className="badges-category-label">
                  {CATEGORY_LABELS[category]}
                  <span className="badges-category-progress">
                    {earnedInCat.length}/{categoryBadges.length}
                  </span>
                </div>
                <div className="badges-category-icons">
                  {categoryBadges.map((badge) => {
                    const earned = earnedSet.has(badge.id);
                    const isNew = newBadgeIds.includes(badge.id);
                    return (
                      <div
                        key={badge.id}
                        className={`badge-item${earned ? " earned" : " locked"}${isNew ? " new" : ""}`}
                        title={`${badge.icon} ${badge.name}${earned ? "" : " (verrouillé)"}\n${badge.description}`}
                      >
                        <span className="badge-icon">{badge.icon}</span>
                        {isNew && <span className="badge-new-dot" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {newBadgeIds.length > 0 && (
          <div className="badges-toast">
            {newBadgeIds.map((id) => {
              const badge = getBadgeById(id);
              if (!badge) return null;
              return (
                <div key={id} className="badges-toast-item">
                  <span>{badge.icon}</span>
                  <span>{badge.name} débloqué !</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

function BadgesSkeleton() {
  return (
    <div className="badges-card skeleton-pulse" style={{ minHeight: 120 }}>
      <div
        style={{
          width: "40%",
          height: 16,
          background: "var(--b2)",
          borderRadius: 4,
          marginBottom: 14,
        }}
      />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 36,
              height: 36,
              background: "var(--b2)",
              borderRadius: 8,
            }}
          />
        ))}
      </div>
    </div>
  );
}
