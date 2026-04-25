"use client";

import { useEffect, useState } from "react";
import { PrixMode, Visibilite } from "./types";
import { CurrencyConverter } from "@/lib/currency-converter";

interface Stats {
  words: number;
  pages: number;
  questions: number;
  readTime: number;
}

interface Props {
  prix: number;
  prixMode: PrixMode;
  visibilite: Visibilite;
  stats: Stats;
  onPrixChange: (prix: number) => void;
  onPrixModeChange: (mode: PrixMode) => void;
  onVisibiliteChange: (vis: Visibilite) => void;
}

const VIS_OPTIONS: {
  value: Visibilite;
  icon: string;
  label: string;
  desc: string;
}[] = [
  { value: "public", icon: "🌐", label: "Public", desc: "Accessible à tous" },
  {
    value: "abonnes",
    icon: "🔒",
    label: "Abonnés",
    desc: "Abonnés actifs uniquement",
  },
  { value: "premium", icon: "⭐", label: "Premium", desc: "Crédits requis" },
];

export default function PricingSidebar({
  prix,
  prixMode,
  visibilite,
  stats,
  onPrixChange,
  onPrixModeChange,
  onVisibiliteChange,
}: Props) {
  const [currencyRate, setCurrencyRate] = useState(50);
  const [platformFeePercent, setPlatformFeePercent] = useState(30);
  const [loading, setLoading] = useState(true);

  // Charger la configuration de change au montage
  useEffect(() => {
    const fetchCurrencyConfig = async () => {
      try {
        const res = await fetch("/api/admin/currency-config");
        if (res.ok) {
          const data = await res.json();
          setCurrencyRate(data.config?.arPerCredit || 50);
          setPlatformFeePercent(data.config?.platformFeePercent || 30);
          CurrencyConverter.cacheRate(data.config?.arPerCredit || 50);
        }
      } catch (err) {
        console.error("Erreur charge config:", err);
        setCurrencyRate(50);
        setPlatformFeePercent(30);
      } finally {
        setLoading(false);
      }
    };
    fetchCurrencyConfig();
  }, []);

  // Calculer les valeurs avec conversions
  const priceInCredits = CurrencyConverter.arToCredits(prix, currencyRate);
  const commission = CurrencyConverter.calculatePlatformFee(
    prix,
    platformFeePercent,
  );
  const revenu = CurrencyConverter.calculateContributorRevenue(
    prix,
    platformFeePercent,
  );

  return (
    <>
      {/* ── Tarification ── */}
      <div className="ed-pricing-card">
        <div className="ed-pricing-header">Tarification</div>
        <div className="ed-pricing-body">
          <div className="ed-price-toggle">
            <button
              className={`ed-price-toggle-btn${prixMode === "par_page" ? " active" : ""}`}
              onClick={() => onPrixModeChange("par_page")}
            >
              Par page
            </button>
            <button
              className={`ed-price-toggle-btn${prixMode === "forfait" ? " active" : ""}`}
              onClick={() => onPrixModeChange("forfait")}
            >
              Forfait
            </button>
          </div>

          <div className="ed-price-input-wrap">
            <input
              className="ed-price-input"
              type="number"
              min={0}
              step={100}
              value={prix}
              onChange={(e) => onPrixChange(Number(e.target.value))}
            />
            <div
              style={{
                textAlign: "center",
                marginTop: "0.35rem",
                fontSize: "0.68rem",
                color: "var(--text-4)",
                fontFamily: "var(--mono)",
              }}
            >
              Ar {prixMode === "par_page" ? "/ page" : "/ forfait"}
            </div>
          </div>

          {/* Conversion Ar → cr */}
          {!loading && (
            <div
              style={{
                padding: "0.75rem",
                background: "var(--b2)",
                borderRadius: "6px",
                marginBottom: "0.75rem",
                border: "1px solid var(--b3)",
                fontSize: "0.8rem",
              }}
            >
              <div style={{ color: "var(--text-3)", marginBottom: "0.25rem" }}>
                Équivalent en crédits:
              </div>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  color: "var(--sage)",
                }}
              >
                {priceInCredits.toLocaleString()} cr
              </div>
              <div
                style={{
                  fontSize: "0.7rem",
                  color: "var(--text-4)",
                  marginTop: "0.25rem",
                }}
              >
                (1 cr = {currencyRate} Ar)
              </div>
            </div>
          )}

          <div className="ed-ventilation">
            <div className="ed-vent-row">
              <span className="ed-vent-label" title="Prix payé par l'étudiant">
                Prix affiché étudiant
              </span>
              <span className="ed-vent-val">{prix.toLocaleString()} Ar</span>
            </div>
            <div className="ed-vent-sep" />
            <div className="ed-vent-row">
              <span
                className="ed-vent-label"
                title={`${platformFeePercent}% de frais de plateforme`}
              >
                Commission plateforme ({platformFeePercent}%) ⓘ
              </span>
              <span className="ed-vent-val">
                − {commission.toLocaleString()} Ar
              </span>
            </div>
            <div className="ed-vent-row">
              <span className="ed-vent-label" title="Vos revenus nets">
                Vos revenus ({100 - platformFeePercent}%)
              </span>
              <span className="ed-vent-val ed-vent-val--gold">
                {revenu.toLocaleString()} Ar
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="ed-panel">
        <div className="ed-panel-header">Statistiques</div>
        <div className="ed-panel-body" style={{ padding: "0.75rem" }}>
          <div className="ed-stats-grid">
            <div className="ed-stat-box">
              <div className="ed-stat-val">{stats.words}</div>
              <div className="ed-stat-label">Mots</div>
            </div>
            <div className="ed-stat-box">
              <div className="ed-stat-val">{stats.pages}</div>
              <div className="ed-stat-label">Pages</div>
            </div>
            <div className="ed-stat-box">
              <div className="ed-stat-val">{stats.questions}</div>
              <div className="ed-stat-label">Questions</div>
            </div>
            <div className="ed-stat-box">
              <div className="ed-stat-val">{stats.readTime} min</div>
              <div className="ed-stat-label">Temps estim.</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Visibilité ── */}
      <div className="ed-panel">
        <div className="ed-panel-header">Visibilité</div>
        <div className="ed-panel-body">
          <div className="ed-visibility">
            {VIS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`ed-vis-opt${visibilite === opt.value ? " active" : ""}`}
                onClick={() => onVisibiliteChange(opt.value)}
              >
                <span className="ed-vis-opt-icon">{opt.icon}</span>
                <span className="ed-vis-opt-body">
                  <div className="ed-vis-opt-label">{opt.label}</div>
                  <div className="ed-vis-opt-desc">{opt.desc}</div>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
