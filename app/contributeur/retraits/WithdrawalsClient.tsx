"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Wallet, History, TrendingUp, Clock, CheckCircle, AlertCircle,
  Smartphone, CreditCard, Send, Loader2,
  ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight,
  X
} from "lucide-react";
import { NumberInput } from "@/components/ui/NumberInput";
import { ToastContainer } from "@/components/ui/ToastContainer";
import { useToast } from "@/lib/hooks/useToast";

const MOBILE_MONEY_OPERATORS = [
  { id: "MVOLA", name: "MVola", color: "#00FF88", prefix: "034", description: "Yas Madagascar" },
  { id: "ORANGE", name: "Orange Money", color: "#FF7900", prefix: "032", description: "Orange Madagascar" },
  { id: "AIRTEL", name: "Airtel Money", color: "#FF0000", prefix: "033", description: "Airtel Madagascar" }
];

const PAGE_SIZE = 10;

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

type StatusTab = "all" | "pending" | "completed" | "failed";
type SortKey = "createdAt" | "amount" | "status";
type SortDir = "asc" | "desc";

export default function WithdrawalsClient({ user, withdrawals, stats, balance }: WithdrawalsClientProps) {
  const router = useRouter();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<StatusTab>("all");
  const [showModal, setShowModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedOperator, setSelectedOperator] = useState("MVOLA");
  const [processing, setProcessing] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page quand changement de filtre
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, sortKey, sortDir]);

  // Fermeture modal avec Escape (focus management)
  useEffect(() => {
    if (!showModal) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !processing) setShowModal(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showModal, processing]);

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    const limited = numbers.slice(0, 10);
    if (limited.length <= 3) return limited;
    if (limited.length <= 5) return `${limited.slice(0, 3)} ${limited.slice(3)}`;
    if (limited.length <= 8) return `${limited.slice(0, 3)} ${limited.slice(3, 5)} ${limited.slice(5)}`;
    return `${limited.slice(0, 3)} ${limited.slice(3, 5)} ${limited.slice(5, 8)} ${limited.slice(8, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(formatPhoneNumber(e.target.value));
  };

  // Filtrage + tri
  const processedWithdrawals = useMemo(() => {
    let list = withdrawals.filter((w) => {
      if (activeTab === "all") return true;
      if (activeTab === "pending") return w.status === "PENDING" || w.status === "PROCESSING";
      if (activeTab === "completed") return w.status === "COMPLETED";
      if (activeTab === "failed") return w.status === "FAILED";
      return true;
    });

    list = [...list].sort((a, b) => {
      let aVal: any = a[sortKey];
      let bVal: any = b[sortKey];
      if (sortKey === "createdAt") {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else if (sortKey === "amount") {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
      } else {
        aVal = String(aVal || "").toLowerCase();
        bVal = String(bVal || "").toLowerCase();
      }
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [withdrawals, activeTab, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(processedWithdrawals.length / PAGE_SIZE));
  const pagedWithdrawals = processedWithdrawals.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const SortIndicator = ({ keyName }: { keyName: SortKey }) => {
    if (sortKey !== keyName) return <ChevronsUpDown size={12} className="sort-indicator" />;
    return sortDir === "asc"
      ? <ChevronUp size={12} className="sort-indicator" />
      : <ChevronDown size={12} className="sort-indicator" />;
  };

  const handleWithdraw = async () => {
    const amount = parseInt(withdrawAmount, 10);
    if (!amount || amount < 5000) {
      toast.error("Montant invalide", "Le montant minimum est de 5 000 Ar");
      return;
    }
    if (!phoneNumber || phoneNumber.replace(/\s/g, '').length !== 10) {
      toast.error("Numéro invalide", "Veuillez entrer un numéro valide (10 chiffres)");
      return;
    }
    const operator = MOBILE_MONEY_OPERATORS.find((op) => op.id === selectedOperator);
    const cleanPhone = phoneNumber.replace(/\s/g, '');
    if (!cleanPhone.startsWith(operator?.prefix || "")) {
      toast.error("Numéro invalide", `Le numéro doit commencer par ${operator?.prefix} pour ${operator?.name}`);
      return;
    }
    if (amount > balance.available) {
      toast.error("Solde insuffisant", `Disponible : ${balance.available.toLocaleString('fr-FR')} Ar`);
      return;
    }

    setProcessing(true);
    try {
      const { requestWithdrawal } = await import("./actions");
      const result = await requestWithdrawal(amount, cleanPhone, selectedOperator);
      if (result.success) {
        toast.success(
          "Demande envoyée",
          `Votre demande de retrait de ${amount.toLocaleString("fr-FR")} Ar a été enregistrée. Validation sous 24-48h.`
        );
        setShowModal(false);
        setWithdrawAmount("");
        setPhoneNumber("");
        setTimeout(() => router.refresh(), 1500);
      } else {
        toast.error("Erreur", result.error || "Erreur lors de la demande");
      }
    } catch (error) {
      toast.error("Erreur", "Une erreur est survenue lors de la demande de retrait");
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; class: string; icon: any }> = {
      PENDING: { label: "En attente", class: "status-amber", icon: Clock },
      PROCESSING: { label: "En traitement", class: "status-amber", icon: AlertCircle },
      COMPLETED: { label: "Envoyé", class: "status-green", icon: CheckCircle },
      FAILED: { label: "Échoué", class: "status-ruby", icon: AlertCircle }
    };
    return config[status] || { label: status, class: "status-gray", icon: Clock };
  };

  const tabs: { key: StatusTab; label: string; count: number }[] = [
    { key: "all", label: "Historique complet", count: withdrawals.length },
    { key: "pending", label: "En attente", count: withdrawals.filter(w => ["PENDING", "PROCESSING"].includes(w.status)).length },
    { key: "completed", label: "Versements effectués", count: withdrawals.filter(w => w.status === "COMPLETED").length },
    { key: "failed", label: "Échecs", count: withdrawals.filter(w => w.status === "FAILED").length }
  ];

  const operator = MOBILE_MONEY_OPERATORS.find(op => op.id === selectedOperator);
  const netReceived = parseInt(withdrawAmount || "0") * 0.99;

  return (
    <div className="admin-page-content">
      <ToastContainer />

      {/* Header */}
      <div className="admin-header">
        <div>
          <div className="admin-header-badge">
            <Wallet size={12} />
            Flux financier
          </div>
          <h1 className="admin-title">Retraits &amp; Gains</h1>
          <p className="admin-subtitle">
            Gérez vos revenus et demandez vos versements Mobile Money.
          </p>
        </div>
        <div className="admin-header-actions">
          <button
            className="admin-btn admin-btn-primary"
            onClick={() => setShowModal(true)}
            disabled={balance.available < 5000}
            title={balance.available < 5000 ? "Minimum 5 000 Ar requis" : "Demander un retrait"}
          >
            <Send size={16} />
            Demander un retrait
          </button>
        </div>
      </div>

      {/* KPI Grid (D3 - 4 KPI uniformes) */}
      <div className="kpi-grid contrib-animate-in">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Solde disponible</span>
            <div className="kpi-icon" style={{ background: "var(--gold-dim)", color: "var(--gold)" }}>
              <Wallet size={16} />
            </div>
          </div>
          <div className="kpi-value gold">
            {balance.available.toLocaleString("fr-FR")} <small>Ar</small>
          </div>
          <div className="kpi-trend" style={{ color: balance.available >= 5000 ? 'var(--gold)' : 'var(--text-4)' }}>
            {balance.available >= 5000 ? 'Prêt pour retrait' : 'En attente du seuil minimum'}
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">En attente</span>
            <div className="kpi-icon" style={{ background: "var(--amber-dim)", color: "var(--amber)" }}>
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

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Total retiré</span>
            <div className="kpi-icon" style={{ background: "var(--sage-dim)", color: "var(--sage)" }}>
              <CheckCircle size={16} />
            </div>
          </div>
          <div className="kpi-value">
            {stats.totalWithdrawn.toLocaleString("fr-FR")} <small>Ar</small>
          </div>
          <div className="kpi-trend">Versements effectués</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Revenus ce mois</span>
            <div className="kpi-icon" style={{ background: "var(--blue-dim)", color: "var(--blue)" }}>
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="kpi-value">
            {stats.thisMonth.toLocaleString("fr-FR")} <small>Ar</small>
          </div>
          <div className="kpi-trend" style={{ color: "var(--blue)" }}>
            Moyenne: {Math.round(stats.averageWithdrawal).toLocaleString("fr-FR")} Ar
          </div>
        </div>
      </div>

      {/* Détails gains - card hors grid (D3) */}
      <div className="admin-card contrib-earnings-card">
        <div className="admin-card-body">
          <h3 className="contrib-card-title" style={{ marginBottom: '1.5rem' }}>Détails de vos gains</h3>
          <div className="contrib-earnings-grid">
            <div className="contrib-earnings-row">
              <span className="contrib-earnings-label">Revenu Brut Total</span>
              <span className="contrib-earnings-value">
                {stats.totalWithdrawn.toLocaleString("fr-FR")} Ar
              </span>
            </div>
            <div className="contrib-earnings-divider"></div>
            <div className="contrib-earnings-row contrib-earnings-row-highlight">
              <span className="contrib-earnings-label">Solde Net Disponible</span>
              <span className="contrib-earnings-value">
                {balance.available.toLocaleString("fr-FR")} Ar
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Cycle banner */}
      <div className="cycle-banner" style={{ padding: "1.5rem 2.5rem" }}>
        <div className="cb-item">
          <span className="cb-label">Cycles de paiement</span>
          <span className="cb-val" style={{ color: "var(--gold)" }}>
            Tous les Mardis &amp; Vendredis
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
        <div className="cb-item" style={{ marginLeft: "auto", textAlign: "right" }}>
          <span className="cb-label">Seuil de retrait</span>
          <span className="cb-val">5 000 Ar</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`admin-tab ${activeTab === tab.key ? "admin-tab-active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label} <span className="admin-tab-count">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="admin-card">
        <div className="admin-card-body" style={{ paddingBottom: "0.5rem" }}>
          <h3 className="contrib-card-title">Historique des paiements</h3>
        </div>
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th
                  className={`is-sortable ${sortKey === 'createdAt' ? 'is-sorted' : ''}`}
                  onClick={() => handleSort('createdAt')}
                >
                  Date &amp; Heure
                  <SortIndicator keyName="createdAt" />
                </th>
                <th
                  className={`is-sortable ${sortKey === 'amount' ? 'is-sorted' : ''}`}
                  onClick={() => handleSort('amount')}
                >
                  Montant Brut
                  <SortIndicator keyName="amount" />
                </th>
                <th>Frais (1%)</th>
                <th>Montant Net</th>
                <th
                  className={`is-sortable ${sortKey === 'status' ? 'is-sorted' : ''}`}
                  onClick={() => handleSort('status')}
                  style={{ textAlign: "right" }}
                >
                  Statut
                  <SortIndicator keyName="status" />
                </th>
              </tr>
            </thead>
            <tbody>
              {pagedWithdrawals.length === 0 ? (
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
                pagedWithdrawals.map((w) => {
                  const statusConfig = getStatusBadge(w.status);
                  const fee = w.amount * 0.01;
                  const net = w.amount - fee;

                  return (
                    <tr key={w.id}>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ color: "var(--text)", fontWeight: 500 }}>
                            {new Date(w.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                          <span style={{ fontSize: "0.72rem", color: "var(--text-4)", fontFamily: "var(--mono)" }}>
                            {new Date(w.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontFamily: "var(--mono)", fontSize: "0.9rem", color: "var(--text-2)" }}>
                          {w.amount.toLocaleString("fr-FR")} Ar
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: "var(--mono)", fontSize: "0.85rem", color: "var(--text-4)" }}>
                          -{fee.toLocaleString("fr-FR")} Ar
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: "var(--display)", fontSize: "1.1rem", color: "var(--gold)", fontWeight: 500 }}>
                          {net.toLocaleString("fr-FR")} <small style={{ fontSize: "0.75rem" }}>Ar</small>
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <span className={`status-badge ${statusConfig.class}`}>
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

        {/* Pagination (U1) */}
        {processedWithdrawals.length > PAGE_SIZE && (
          <div className="contrib-pagination">
            <span className="contrib-pagination-info">
              {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, processedWithdrawals.length)} sur {processedWithdrawals.length}
            </span>
            <div className="contrib-pagination-controls">
              <button
                type="button"
                className="contrib-pagination-btn"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="Page précédente"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((p, idx, arr) => (
                  <span key={p} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span style={{ color: 'var(--text-4)', padding: '0 4px' }}>…</span>
                    )}
                    <button
                      type="button"
                      className={`contrib-pagination-btn ${currentPage === p ? 'is-active' : ''}`}
                      onClick={() => setCurrentPage(p)}
                      aria-label={`Page ${p}`}
                      aria-current={currentPage === p ? 'page' : undefined}
                    >
                      {p}
                    </button>
                  </span>
                ))}
              <button
                type="button"
                className="contrib-pagination-btn"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                aria-label="Page suivante"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Demander un retrait — harmonisé admin-modal (D2) */}
      {showModal && (
        <div className="admin-overlay open" onClick={() => !processing && setShowModal(false)}>
          <div
            className="admin-modal"
            style={{ maxWidth: "480px" }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="withdraw-modal-title"
          >
            <div className="modal-header">
              <h3 id="withdraw-modal-title" className="modal-title">
                <CreditCard size={18} style={{ color: "var(--gold)", marginRight: 8, verticalAlign: 'middle' }} />
                Demander un retrait
              </h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => !processing && setShowModal(false)}
                aria-label="Fermer"
                disabled={processing}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ marginBottom: "1.5rem" }}>
                <label className="admin-info-label">Choisissez votre opérateur</label>
                <div className="admin-modal-receipt-grid">
                  {MOBILE_MONEY_OPERATORS.map((op) => {
                    const active = selectedOperator === op.id;
                    return (
                      <button
                        key={op.id}
                        type="button"
                        onClick={() => { setSelectedOperator(op.id); setPhoneNumber(""); }}
                        className={`admin-modal-receipt-op ${active ? 'is-active' : ''}`}
                        style={{
                          borderColor: active ? op.color : 'var(--b2)',
                          background: active ? `${op.color}20` : 'transparent',
                          color: active ? op.color : 'var(--text-3)'
                        }}
                        aria-pressed={active}
                      >
                        <Smartphone size={16} />
                        <span className="admin-modal-receipt-op-label">{op.name}</span>
                      </button>
                    );
                  })}
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
                <p className="admin-modal-receipt-hint">
                  Une commission de 1% sera déduite du versement.
                </p>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label className="admin-info-label">Numéro {operator?.name}</label>
                <div className="admin-modal-receipt-phone">
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    placeholder={`${operator?.prefix} XX XXX XX`}
                    className="admin-input admin-modal-receipt-phone-input"
                    disabled={processing}
                    autoFocus
                  />
                  <div className="admin-modal-receipt-phone-icon">
                    <Smartphone size={20} />
                  </div>
                </div>
              </div>

              <div className="admin-modal-receipt-summary">
                <div className="admin-modal-receipt-summary-block accent">
                  <div className="label">Solde disponible</div>
                  <div className="value">{balance.available.toLocaleString("fr-FR")} Ar</div>
                </div>
                <div className="admin-modal-receipt-summary-block" style={{ textAlign: 'right' }}>
                  <div className="label">Net reçu</div>
                  <div className="value">{netReceived.toLocaleString("fr-FR")} Ar</div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <div className="admin-modal-receipt-footer">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="admin-btn admin-btn-outline"
                  disabled={processing}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleWithdraw}
                  disabled={processing || !withdrawAmount}
                  className="admin-btn admin-btn-primary is-primary-large"
                >
                  {processing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Envoi…
                    </>
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
