"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Wallet,
  History,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Smartphone,
  CreditCard,
  Send,
  Loader2,
} from "lucide-react";
import { NumberInput } from "@/components/ui/NumberInput";
import { ToastContainer } from "@/components/ui/ToastContainer";
import { useToast } from "@/lib/hooks/useToast";

const MOBILE_MONEY_OPERATORS = [
  {
    id: "MVOLA",
    name: "MVola",
    color: "#00FF88",
    prefix: "034",
    description: "Yas Madagascar",
  },
  {
    id: "ORANGE",
    name: "Orange Money",
    color: "#FF7900",
    prefix: "032",
    description: "Orange Madagascar",
  },
  {
    id: "AIRTEL",
    name: "Airtel Money",
    color: "#FF0000",
    prefix: "033",
    description: "Airtel Madagascar",
  },
];

interface WithdrawalsClientProps {
  user: { prenom: string; nom: string; role: string };
  withdrawals: any[];
  stats: {
    totalWithdrawn: number;
    pending: number;
    thisMonth: number;
    averageWithdrawal: number;
  };
  balance: { available: number; pending: number };
}

export default function WithdrawalsClient({
  user,
  withdrawals,
  stats,
  balance,
}: WithdrawalsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "all" | "pending" | "completed" | "failed"
  >("all");
  const [showModal, setShowModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedOperator, setSelectedOperator] = useState("MVOLA");
  const [processing, setProcessing] = useState(false);

  const toast = useToast();

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    const limited = numbers.slice(0, 10);
    if (limited.length <= 3) return limited;
    if (limited.length <= 5)
      return `${limited.slice(0, 3)} ${limited.slice(3)}`;
    if (limited.length <= 8)
      return `${limited.slice(0, 3)} ${limited.slice(3, 5)} ${limited.slice(5)}`;
    return `${limited.slice(0, 3)} ${limited.slice(3, 5)} ${limited.slice(5, 8)} ${limited.slice(8, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(formatPhoneNumber(e.target.value));
  };

  const filteredWithdrawals = withdrawals.filter((w) => {
    if (activeTab === "all") return true;
    if (activeTab === "pending")
      return w.status === "PENDING" || w.status === "PROCESSING";
    if (activeTab === "completed") return w.status === "COMPLETED";
    if (activeTab === "failed") return w.status === "FAILED";
    return true;
  });

  const handleWithdraw = async () => {
    const amount = parseInt(withdrawAmount, 10);
    if (!amount || amount < 5000) {
      toast.error("Montant invalide", "Le montant minimum est de 5 000 Ar");
      return;
    }

    if (!phoneNumber || phoneNumber.length !== 10) {
      toast.error(
        "Numéro invalide",
        "Veuillez entrer un numéro valide (10 chiffres)",
      );
      return;
    }

    const operator = MOBILE_MONEY_OPERATORS.find(
      (op) => op.id === selectedOperator,
    );
    if (!phoneNumber.startsWith(operator?.prefix || "")) {
      toast.error(
        "Numéro invalide",
        `Le numéro doit commencer par ${operator?.prefix} pour ${operator?.name}`,
      );
      return;
    }

    setProcessing(true);
    try {
      const { requestWithdrawal } = await import("./actions");
      const result = await requestWithdrawal(
        amount,
        phoneNumber,
        selectedOperator,
      );

      if (result.success) {
        toast.success(
          "Demande envoyée",
          `Votre demande de retrait de ${amount.toLocaleString("fr-FR")} Ar a été enregistrée. Validation sous 24-48h.`,
        );
        setShowModal(false);
        setWithdrawAmount("");
        setPhoneNumber("");
        setTimeout(() => router.refresh(), 2000);
      } else {
        toast.error("Erreur", result.error || "Erreur lors de la demande");
      }
    } catch (error) {
      toast.error(
        "Erreur",
        "Une erreur est survenue lors de la demande de retrait",
      );
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; class: string; icon: any }> =
      {
        PENDING: { label: "En attente", class: "pending", icon: Clock },
        PROCESSING: {
          label: "En traitement",
          class: "processing",
          icon: AlertCircle,
        },
        COMPLETED: { label: "Envoyé", class: "sent", icon: CheckCircle },
        FAILED: { label: "Échoué", class: "failed", icon: AlertCircle },
      };
    return config[status] || { label: status, class: "pending", icon: Clock };
  };

  return (
    <div className="admin-page-content">
      <ToastContainer />

      {/* Header Section */}
      <div className="admin-header">
        <div>
          <div className="admin-header-badge">
            <Wallet size={12} />
            Flux financier
          </div>
          <h1 className="admin-title">Retraits & Gains</h1>
          <p className="admin-subtitle">
            Gérez vos revenus et demandez vos versements Mobile Money.
          </p>
        </div>
        <div className="admin-header-actions">
          <button
            className="admin-btn admin-btn-primary"
            onClick={() => setShowModal(true)}
          >
            <Send size={16} />
            Demander un retrait
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Solde disponible</span>
            <div
              className="kpi-icon"
              style={{ background: "var(--gold-dim)", color: "var(--gold)" }}
            >
              <Wallet size={16} />
            </div>
          </div>
          <div className="kpi-value gold">
            {balance.available.toLocaleString("fr-FR")} <small>Ar</small>
          </div>
          <div className="kpi-trend">Prêt pour retrait</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">En attente</span>
            <div
              className="kpi-icon"
              style={{ background: "var(--amber-dim)", color: "var(--amber)" }}
            >
              <Clock size={16} />
            </div>
          </div>
          <div className="kpi-value">
            {balance.pending.toLocaleString("fr-FR")} <small>Ar</small>
          </div>
          <div className="kpi-trend" style={{ color: "var(--amber)" }}>
            En cours de traitement
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-body">
            <h3
              style={{
                fontSize: "1.1rem",
                fontWeight: 600,
                marginBottom: "1.5rem",
              }}
            >
              Détails de vos gains
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "1.25rem 1.5rem",
                  background: "var(--surface)",
                  borderRadius: "var(--r)",
                  border: "1px solid var(--b2)",
                }}
              >
                <span style={{ color: "var(--text-3)" }}>
                  Revenu Brut Total
                </span>
                <span style={{ fontWeight: 600 }}>
                  {stats.totalWithdrawn.toLocaleString("fr-FR")} Ar
                </span>
              </div>
              <div
                style={{
                  borderTop: "1px dashed var(--b2)",
                  margin: "0.5rem 0",
                }}
              ></div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "1.25rem 1.5rem",
                  background: "var(--gold-dim)",
                  borderRadius: "var(--r)",
                  border: "1px solid var(--gold-line)",
                }}
              >
                <span style={{ color: "var(--gold)", fontWeight: 600 }}>
                  Solde Net Disponible
                </span>
                <span
                  style={{
                    color: "var(--gold)",
                    fontWeight: 700,
                    fontSize: "1.1rem",
                  }}
                >
                  {balance.available.toLocaleString("fr-FR")} Ar
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Revenus ce mois</span>
            <div
              className="kpi-icon"
              style={{ background: "var(--blue-dim)", color: "var(--blue)" }}
            >
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="kpi-value">
            {stats.thisMonth.toLocaleString("fr-FR")} <small>Ar</small>
          </div>
          <div className="kpi-trend" style={{ color: "var(--blue)" }}>
            Moyenne: {stats.averageWithdrawal.toLocaleString("fr-FR")} Ar
          </div>
        </div>
      </div>

      <div
        className="cycle-banner"
        style={{ margin: "2.5rem 0", padding: "1.5rem 2.5rem" }}
      >
        <div className="cb-item">
          <span className="cb-label">Cycles de paiement</span>
          <span className="cb-val" style={{ color: "var(--gold)" }}>
            Tous les Mardis & Vendredis
          </span>
        </div>
        <div className="cb-divider"></div>
        <div className="cb-item">
          <span className="cb-label">Délai de traitement</span>
          <div className="cb-countdown">
            <span className="cb-dot"></span>
            24h à 48h maximum
          </div>
        </div>
        <div
          className="cb-item"
          style={{ marginLeft: "auto", textAlign: "right" }}
        >
          <span className="cb-label">Seuil de retrait</span>
          <span className="cb-val">5 000 Ar</span>
        </div>
      </div>

      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === "all" ? "admin-tab-active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          Historique complet
        </button>
        <button
          className={`admin-tab ${activeTab === "pending" ? "admin-tab-active" : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          En attente
        </button>
        <button
          className={`admin-tab ${activeTab === "completed" ? "admin-tab-active" : ""}`}
          onClick={() => setActiveTab("completed")}
        >
          Versements effectués
        </button>
        <button
          className={`admin-tab ${activeTab === "failed" ? "admin-tab-active" : ""}`}
          onClick={() => setActiveTab("failed")}
        >
          Échecs
        </button>
      </div>

      <div className="admin-card">
        <div className="admin-card-body" style={{ paddingBottom: "0.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 600 }}>
            Historique des paiements
          </h3>
        </div>
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date & Heure</th>
                <th>Montant Brut</th>
                <th>Frais (1%)</th>
                <th>Montant Net</th>
                <th style={{ textAlign: "right" }}>Statut</th>
              </tr>
            </thead>
            <tbody>
              {filteredWithdrawals.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="admin-empty-state">
                      <Wallet size={48} className="admin-empty-state-icon" />
                      <div className="admin-empty-state-text">
                        Aucun retrait trouvé dans cette catégorie
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredWithdrawals.map((w) => {
                  const statusConfig = getStatusBadge(w.status);
                  const fee = w.amount * 0.01;
                  const net = w.amount - fee;

                  let badgeClass = "status-gray";
                  if (w.status === "COMPLETED") badgeClass = "status-green";
                  if (w.status === "PENDING" || w.status === "PROCESSING")
                    badgeClass = "status-amber";
                  if (w.status === "FAILED") badgeClass = "status-ruby";

                  return (
                    <tr key={w.id}>
                      <td>
                        <div
                          style={{ display: "flex", flexDirection: "column" }}
                        >
                          <span
                            style={{ color: "var(--text)", fontWeight: 500 }}
                          >
                            {new Date(w.createdAt).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          <span
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--text-4)",
                              fontFamily: "var(--mono)",
                            }}
                          >
                            {new Date(w.createdAt).toLocaleTimeString("fr-FR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            fontFamily: "var(--mono)",
                            fontSize: "0.9rem",
                            color: "var(--text-2)",
                          }}
                        >
                          {w.amount.toLocaleString("fr-FR")} Ar
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            fontFamily: "var(--mono)",
                            fontSize: "0.85rem",
                            color: "var(--text-4)",
                          }}
                        >
                          -{fee.toLocaleString("fr-FR")} Ar
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            fontFamily: "var(--display)",
                            fontSize: "1.1rem",
                            color: "var(--gold)",
                            fontWeight: 500,
                          }}
                        >
                          {net.toLocaleString("fr-FR")}{" "}
                          <small style={{ fontSize: "0.75rem" }}>Ar</small>
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <span className={`status-badge ${badgeClass}`}>
                          {statusConfig.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="receipt-overlay" onClick={() => setShowModal(false)}>
          <div
            className="receipt-card"
            style={{ maxWidth: "450px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="receipt-header">
              <div className="receipt-title">Demander un retrait</div>
              <CreditCard size={18} style={{ color: "var(--gold)" }} />
            </div>

            <div className="receipt-body">
              <div style={{ marginBottom: "1.5rem" }}>
                <label className="admin-info-label">
                  Choisissez votre opérateur
                </label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "0.75rem",
                    marginTop: "0.5rem",
                  }}
                >
                  {MOBILE_MONEY_OPERATORS.map((op) => (
                    <button
                      key={op.id}
                      type="button"
                      onClick={() => {
                        setSelectedOperator(op.id);
                        setPhoneNumber("");
                      }}
                      className={`admin-btn ${selectedOperator === op.id ? "admin-btn-primary" : "admin-btn-outline"}`}
                      style={{
                        padding: "0.75rem 0.5rem",
                        flexDirection: "column",
                        height: "auto",
                        borderColor:
                          selectedOperator === op.id ? op.color : "var(--b2)",
                        background:
                          selectedOperator === op.id
                            ? op.color + "15"
                            : "transparent",
                        color:
                          selectedOperator === op.id
                            ? op.color
                            : "var(--text-3)",
                      }}
                    >
                      <Smartphone size={16} style={{ marginBottom: "4px" }} />
                      <span style={{ fontSize: "0.65rem", fontWeight: 600 }}>
                        {op.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <NumberInput
                  label="Montant à retirer (Ar)"
                  value={withdrawAmount}
                  onChange={setWithdrawAmount}
                  min={5000}
                  step={5000}
                  placeholder="Min: 5 000 Ar"
                  disabled={processing}
                />
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-4)",
                    marginTop: "0.5rem",
                    fontFamily: "var(--mono)",
                  }}
                >
                  Une commission de 1% sera déduite du versement.
                </p>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label className="admin-info-label">
                  Numéro{" "}
                  {
                    MOBILE_MONEY_OPERATORS.find(
                      (op) => op.id === selectedOperator,
                    )?.name
                  }
                </label>
                <div style={{ position: "relative", marginTop: "0.5rem" }}>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    placeholder={`${MOBILE_MONEY_OPERATORS.find((op) => op.id === selectedOperator)?.prefix} XX XXX XX`}
                    className="admin-input"
                    style={{
                      paddingRight: "3rem",
                      fontSize: "1.1rem",
                      letterSpacing: "0.05em",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      right: "1rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--text-4)",
                    }}
                  >
                    <Smartphone size={20} />
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: "1rem",
                  background: "var(--gold-dim)",
                  border: "1px solid var(--gold-line)",
                  borderRadius: "var(--r)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--text-3)",
                      textTransform: "uppercase",
                    }}
                  >
                    Solde disponible
                  </div>
                  <div
                    style={{
                      fontSize: "1.25rem",
                      color: "var(--gold)",
                      fontWeight: 600,
                    }}
                  >
                    {balance.available.toLocaleString("fr-FR")} Ar
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--text-3)",
                      textTransform: "uppercase",
                    }}
                  >
                    Net reçu
                  </div>
                  <div
                    style={{
                      fontSize: "1.25rem",
                      color: "var(--text)",
                      fontWeight: 600,
                    }}
                  >
                    {(parseInt(withdrawAmount || "0") * 0.99).toLocaleString(
                      "fr-FR",
                    )}{" "}
                    Ar
                  </div>
                </div>
              </div>
            </div>

            <div
              className="receipt-footer"
              style={{ borderTop: "none", paddingTop: 0 }}
            >
              <div style={{ display: "flex", gap: "0.75rem", width: "100%" }}>
                <button
                  onClick={() => setShowModal(false)}
                  className="admin-btn admin-btn-outline"
                  style={{ flex: 1 }}
                >
                  Annuler
                </button>
                <button
                  onClick={handleWithdraw}
                  disabled={processing || !withdrawAmount}
                  className="admin-btn admin-btn-primary"
                  style={{ flex: 2 }}
                >
                  {processing ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    "Confirmer le retrait"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
