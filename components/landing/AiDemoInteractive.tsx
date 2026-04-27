"use client";

import { useState, useEffect, useRef } from "react";

const DEMO_STEPS = [
  {
    type: "question" as const,
    text: "Résoudre : x² - 5x + 6 = 0",
    delay: 600,
  },
  {
    type: "thinking" as const,
    text: "Analyse de votre réponse en cours…",
    delay: 1800,
  },
  {
    type: "result" as const,
    label: "Méthode identifiée",
    text: "Factorisation du trinôme",
    icon: "✦",
    color: "var(--gold)",
    delay: 800,
  },
  {
    type: "result" as const,
    label: "Étape 1",
    text: "Calcul du discriminant Δ = 25 - 24 = 1 ✓",
    icon: "✓",
    color: "var(--sage, #4a6b5a)",
    delay: 600,
  },
  {
    type: "result" as const,
    label: "Étape 2",
    text: "Racines : x₁ = 2, x₂ = 3 ✓",
    icon: "✓",
    color: "var(--sage, #4a6b5a)",
    delay: 600,
  },
  {
    type: "result" as const,
    label: "Remarque",
    text: "Justification de l'unicité des solutions manquante",
    icon: "△",
    color: "var(--ruby, #9b2335)",
    delay: 700,
  },
  {
    type: "score" as const,
    score: "17",
    total: "20",
    delay: 900,
  },
];

export function AiDemoInteractive() {
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Auto-play when visible
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasPlayed) {
          startDemo();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPlayed]);

  function startDemo() {
    // Clear previous
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    setIsPlaying(true);
    setHasPlayed(true);
    setCurrentStep(-1);

    let cumulative = 400;
    DEMO_STEPS.forEach((step, idx) => {
      cumulative += step.delay;
      const t = setTimeout(() => setCurrentStep(idx), cumulative);
      timeoutsRef.current.push(t);
    });

    // Mark finished
    const fin = setTimeout(
      () => setIsPlaying(false),
      cumulative + 1200
    );
    timeoutsRef.current.push(fin);
  }

  function replay() {
    setHasPlayed(false);
    setCurrentStep(-1);
    requestAnimationFrame(() => startDemo());
  }

  // Cleanup
  useEffect(() => {
    return () => timeoutsRef.current.forEach(clearTimeout);
  }, []);

  return (
    <div ref={containerRef} className="ai-demo-interactive">
      {/* Header */}
      <div className="ai-demo-header">
        <div className="ai-demo-dot-group">
          <span className="ai-demo-window-dot" />
          <span className="ai-demo-window-dot" />
          <span className="ai-demo-window-dot" />
        </div>
        <span className="ai-demo-title-bar">
          <span className="ai-demo-live-dot" />
          Correction IA — Démo live
        </span>
        {hasPlayed && !isPlaying && (
          <button
            className="ai-demo-replay"
            onClick={replay}
            aria-label="Rejouer la démo"
          >
            ↻ Rejouer
          </button>
        )}
      </div>

      {/* Content */}
      <div className="ai-demo-body">
        {/* Question */}
        {currentStep >= 0 && DEMO_STEPS[0].type === "question" && (
          <div className="ai-demo-question ai-demo-fade-in">
            <span className="ai-demo-q-label">Votre réponse</span>
            <span className="ai-demo-q-text">{DEMO_STEPS[0].text}</span>
          </div>
        )}

        {/* Thinking */}
        {currentStep >= 1 && currentStep < 2 && (
          <div className="ai-demo-thinking ai-demo-fade-in">
            <span className="ai-demo-spinner" />
            <span>{DEMO_STEPS[1].text}</span>
          </div>
        )}

        {/* Results */}
        {DEMO_STEPS.map((step, idx) => {
          if (step.type !== "result") return null;
          if (currentStep < idx) return null;
          return (
            <div key={idx} className="ai-demo-result ai-demo-fade-in">
              <span
                className="ai-demo-result-icon"
                style={{ color: step.color }}
              >
                {step.icon}
              </span>
              <div className="ai-demo-result-content">
                <span className="ai-demo-result-label">{step.label}</span>
                <span className="ai-demo-result-text">{step.text}</span>
              </div>
            </div>
          );
        })}

        {/* Score */}
        {currentStep >= DEMO_STEPS.length - 1 && (
          <div className="ai-demo-score-bar ai-demo-fade-in">
            <div className="ai-demo-score-track">
              <div
                className="ai-demo-score-fill"
                style={{ width: "85%" }}
              />
            </div>
            <div className="ai-demo-score-label">
              <span>Score estimé</span>
              <span className="ai-demo-score-val">
                {DEMO_STEPS[DEMO_STEPS.length - 1].type === "score"
                  ? `${(DEMO_STEPS[DEMO_STEPS.length - 1] as { score: string; total: string }).score}/${(DEMO_STEPS[DEMO_STEPS.length - 1] as { score: string; total: string }).total}`
                  : ""}
              </span>
            </div>
          </div>
        )}

        {/* Empty state */}
        {currentStep < 0 && (
          <div className="ai-demo-empty">
            <span className="ai-demo-empty-icon">✦</span>
            <span>Cliquez ou attendez pour voir la démo…</span>
          </div>
        )}
      </div>
    </div>
  );
}
