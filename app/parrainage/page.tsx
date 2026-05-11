"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Copy,
  Link as LinkIcon,
  Share2,
  Users,
  UserCheck,
  Gift,
  Clock3,
  CheckCircle2,
} from "lucide-react";
import { LuxuryCursor } from "@/components/layout/LuxuryCursor";
import { LuxuryFooter } from "@/components/layout/LuxuryFooter";
import { useAuth } from "@/lib/hooks/useAuth";
import { getReferralDashboardAction, type ReferralDashboardData } from "@/actions/referral";
import "./parrainage.css";

type CopyTarget = "code" | "link" | null;

export default function ParrainagePage() {
  const router = useRouter();
  const { userId, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [copyState, setCopyState] = useState<CopyTarget>(null);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ReferralDashboardData | null>(null);

  useEffect(() => {
    document.title = "Mah.AI — Parrainage";
  }, []);

  useEffect(() => {
    if (!authLoading && !userId) {
      router.push("/auth/login");
    }
  }, [authLoading, userId, router]);

  useEffect(() => {
    async function loadReferralData() {
      if (!userId) {
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const result = await getReferralDashboardAction();
        if (!result.success || !result.data) {
          setError(result.error || "Erreur de chargement");
          return;
        }

        setData(result.data);
      } catch (err) {
        setError("Erreur de chargement");
      } finally {
        setLoading(false);
      }
    }

    loadReferralData();
  }, [userId]);

  const emptyData = useMemo<ReferralDashboardData>(
    () => ({
      referralCode: "",
      referralLink: "",
      invitedCount: 0,
      activeCount: 0,
      totalGainedAr: 0,
      referrals: [],
      settings: {
        welcomeBonusAr: 500,
        referrerBonusAr: 1000,
        referredBonusAr: 500,
        welcomeBonus: 0,
        referrerBonus: 0,
        referredBonus: 0,
      },
    }),
    [],
  );

  const viewData = data || emptyData;

  const copyText = async (value: string, target: CopyTarget) => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopyState(target);
      setTimeout(() => setCopyState(null), 2000);
    } catch {
      setError("Impossible de copier dans le presse-papiers");
    }
  };

  const shareReferral = async () => {
    if (!viewData.referralLink) return;

    const message = `Rejoins-moi sur Mah.AI avec mon code ${viewData.referralCode} : ${viewData.referralLink}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Parrainage Mah.AI",
          text: message,
          url: viewData.referralLink,
        });
        return;
      } catch {
      }
    }

    await copyText(message, "link");
  };

  if (authLoading || !userId || loading) {
    return (
      <>
        <LuxuryCursor />
        <main className="referral-main">
          <div className="referral-container">
            <div className="referral-skeleton" />
            <div className="referral-skeleton" />
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <LuxuryCursor />

      <main className="referral-main">
        <div className="referral-container">
          <section className="referral-hero">
            <p className="referral-kicker">Programme de parrainage</p>
            <h1>Invitez vos amis et gagnez des Ariary</h1>
            <p>
              Votre filleul reçoit <strong>{viewData.settings.referredBonusAr} Ar</strong> à l&apos;inscription et vous
              gagnez <strong>{viewData.settings.referrerBonusAr} Ar</strong> dès son premier déblocage de sujet.
            </p>
          </section>

          <section className="referral-code-card">
            <div className="referral-code-header">
              <h2>Votre code</h2>
              <button onClick={shareReferral} className="referral-action-btn" type="button">
                <Share2 size={16} /> Partager
              </button>
            </div>

            <div className="referral-code-row">
              <span>{viewData.referralCode || "Code indisponible"}</span>
              <button
                onClick={() => copyText(viewData.referralCode, "code")}
                className="referral-copy-btn"
                type="button"
              >
                <Copy size={14} />
                {copyState === "code" ? "Copié" : "Copier"}
              </button>
            </div>

            <div className="referral-link-row">
              <LinkIcon size={14} />
              <span>{viewData.referralLink || "Lien indisponible"}</span>
              <button
                onClick={() => copyText(viewData.referralLink, "link")}
                className="referral-copy-btn"
                type="button"
              >
                <Copy size={14} />
                {copyState === "link" ? "Copié" : "Copier"}
              </button>
            </div>
          </section>

          <section className="referral-stats-grid">
            <article className="referral-stat-card">
              <Users size={18} />
              <div>
                <p>Filleuls invités</p>
                <strong>{viewData.invitedCount}</strong>
              </div>
            </article>
            <article className="referral-stat-card">
              <UserCheck size={18} />
              <div>
                <p>Filleuls actifs</p>
                <strong>{viewData.activeCount}</strong>
              </div>
            </article>
            <article className="referral-stat-card">
              <Gift size={18} />
              <div>
                <p>Ariary gagnés</p>
                <strong>{(viewData.totalGainedAr || 0).toLocaleString('fr-FR')} Ar</strong>
              </div>
            </article>
          </section>

          <section className="referral-table-wrap">
            <div className="referral-table-head">
              <h2>Mes filleuls</h2>
            </div>

            {error ? <p className="referral-error">{error}</p> : null}

            {viewData.referrals.length === 0 ? (
              <p className="referral-empty">Aucun filleul pour le moment.</p>
            ) : (
              <div className="referral-table">
                <div className="referral-table-row referral-table-row-head">
                  <span>Nom</span>
                  <span>Inscription</span>
                  <span>Statut</span>
                  <span>Bonus</span>
                </div>
                {viewData.referrals.map((item) => (
                  <div key={item.id} className="referral-table-row">
                    <span className="referral-name">{item.referredName}</span>
                    <span>
                      {new Date(item.createdAt).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span className="referral-status">
                      {item.status === "COMPLETED" ? (
                        <>
                          <CheckCircle2 size={14} /> Actif
                        </>
                      ) : (
                        <>
                          <Clock3 size={14} /> En attente
                        </>
                      )}
                    </span>
                    <span>{item.status === "COMPLETED" ? `+${item.bonusAr} Ar` : "—"}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="referral-steps-section">
            <h2 className="referral-steps-title">Comment ça marche</h2>
            <div className="referral-steps-grid">
              <article className="referral-step-card">
                <div className="referral-step-num">01</div>
                <h3>Partagez votre code</h3>
                <p>Envoyez votre code ou lien personnel à vos amis via le canal de votre choix.</p>
              </article>
              <article className="referral-step-card">
                <div className="referral-step-num">02</div>
                <h3>Votre ami s'inscrit</h3>
                <p>
                  Il crée un compte avec votre code et reçoit automatiquement{" "}
                  <strong>{viewData.settings?.referredBonusAr || 500} Ar</strong> de bienvenue.
                </p>
              </article>
              <article className="referral-step-card">
                <div className="referral-step-num">03</div>
                <h3>Il débloque un sujet</h3>
                <p>
                  Dès son premier déblocage, vous recevez{" "}
                  <strong>{viewData.settings?.referrerBonusAr || 1000} Ar</strong> sur votre compte. Automatiquement.
                </p>
              </article>
            </div>
          </section>
        </div>
      </main>

      <LuxuryFooter />
    </>
  );
}
