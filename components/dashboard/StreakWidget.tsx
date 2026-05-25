"use client";

import { useEffect, useState, useRef } from "react";
import { Flame, TrendingUp } from "lucide-react";
import {
  getStreakDataAction,
  notifyStreakMilestoneAction,
  type StreakData,
  type WeeklyProgress,
} from "@/actions/user";
import { Confetti } from "@/components/ui/Confetti";
import { useConfettiTrigger } from "@/lib/hooks/useConfettiTrigger";
import "./streak-widget.css";

const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100];
const DAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"];

interface ProgressionWidgetProps {
  weeklyProgress?: WeeklyProgress[];
  totalSolved?: number;
}

export function StreakWidget({
  weeklyProgress = [],
  totalSolved = 0,
}: ProgressionWidgetProps) {
  const [data, setData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const notifiedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    getStreakDataAction().then((d) => {
      setData(d);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!data) return;
    const streak = data.currentStreak;
    if (
      STREAK_MILESTONES.includes(streak) &&
      !notifiedRef.current.has(streak)
    ) {
      notifiedRef.current.add(streak);
      notifyStreakMilestoneAction(streak);
    }
  }, [data]);

  const reachedMilestone =
    data && STREAK_MILESTONES.includes(data.currentStreak);
  const { trigger: showConfetti } = useConfettiTrigger(!!reachedMilestone, {
    delay: 800,
  });

  if (loading) return <ProgressionSkeleton />;
  if (!data) return null;

  // Trouve le max de sessions pour normaliser les barres
  const maxSolved = Math.max(
    1,
    ...weeklyProgress.map((w) => w.solved),
    ...data.weekDays.map((d) => d.count),
  );

  return (
    <>
      {showConfetti && <Confetti trigger={showConfetti} type="streak" />}
      <div className="progression-widget">
        {/* En-tête : compteur streak + total */}
        <div className="prog-header">
          <div className="prog-streak">
            <span className="prog-label">
              <Flame size={16} />
              Streak
            </span>
            <span className="prog-streak-num">{data.currentStreak}</span>
            <span className="prog-streak-unit">jours</span>
            {data.longestStreak > 0 && (
              <span className="prog-record">Record : {data.longestStreak}</span>
            )}
          </div>
          <div className="prog-total">
            <span className="prog-label">
              <TrendingUp size={16} />
              Cette semaine
            </span>
            <span className="prog-total-num">{totalSolved}</span>
            <span className="prog-streak-unit">sessions</span>
          </div>
        </div>

        {/* Grille 7 jours fusionnée */}
        <div className="prog-week">
          {data.weekDays.map((day, i) => {
            const progressDay = weeklyProgress[i];
            const sessionCount = progressDay?.solved ?? 0;
            const isActive = day.count > 0;
            const isToday = day.isToday;
            const barHeight = Math.max(4, (sessionCount / maxSolved) * 100);

            return (
              <div key={i} className="prog-day-col">
                {/* Barre de sessions */}
                <div className="prog-bar-track">
                  <div
                    className={`prog-bar-fill ${isActive ? "active" : ""} ${isToday ? "today" : ""}`}
                    style={{ height: `${barHeight}%` }}
                  />
                </div>
                {/* Pastille streak */}
                <div
                  className={`prog-day-dot ${isActive ? "done" : ""} ${isToday && isActive ? "today" : ""}`}
                >
                  {sessionCount > 0 && (
                    <span className="prog-day-count">{sessionCount}</span>
                  )}
                </div>
                <span className={`prog-day-label ${isToday ? "today" : ""}`}>
                  {DAY_LABELS[i]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Message contextuel */}
        {data.currentStreak === 0 && !data.todayDone && (
          <p className="prog-hint">
            Commence ton streak aujourd'hui — explore le catalogue !
          </p>
        )}
        {data.currentStreak > 0 && data.todayDone && (
          <p className="prog-hint prog-hint-done">
            🔥 Journée validée ! Reviens demain.
          </p>
        )}
        {data.currentStreak > 0 && !data.todayDone && (
          <p className="prog-hint prog-hint-pending">
            ⚡ Ta série de {data.currentStreak} jours est en jeu — fais une
            session maintenant !
          </p>
        )}
      </div>
    </>
  );
}

function ProgressionSkeleton() {
  return (
    <div
      className="progression-widget skeleton-pulse"
      style={{ minHeight: 160 }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            width: 80,
            height: 40,
            background: "var(--b2)",
            borderRadius: 8,
          }}
        />
        <div
          style={{
            width: 80,
            height: 40,
            background: "var(--b2)",
            borderRadius: 8,
          }}
        />
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}
          >
            <div
              style={{
                width: 20,
                height: 60,
                background: "var(--b2)",
                borderRadius: 4,
              }}
            />
            <div
              style={{
                width: 28,
                height: 28,
                background: "var(--b2)",
                borderRadius: 14,
              }}
            />
            <div
              style={{
                width: 12,
                height: 10,
                background: "var(--b2)",
                borderRadius: 2,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
