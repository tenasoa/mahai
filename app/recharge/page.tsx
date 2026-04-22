"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useTransactionsRealtime } from "@/lib/hooks/useTransactionsRealtime";
import { LuxuryCursor } from "@/components/layout/LuxuryCursor";
import { LuxuryNavbar } from "@/components/layout/LuxuryNavbar";
import { RechargePageSkeleton } from "@/components/ui/PageSkeletons";
import { Button } from "@/components/ui";
import {
  Zap,
  Smartphone,
  Info,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  Copy,
  AlertCircle,
  X,
} from "lucide-react";
import { rechargeCreditsAction } from "@/actions/profile";
import {
  BalanceCard,
  TransactionHistory,
  PaymentForm,
  RechargeConfirmation,
  type Transaction,
  type PaymentAmount,
} from "@/components/recharge";

import "./recharge.css";

// Type local pour les opérateurs
type Provider = {
  id: 'mvola' | 'orange' | 'airtel'
  name: string
  color: string
  available: boolean
}

// Packs par défaut (fallback si l'API échoue)
const DEFAULT_PACKS: PaymentAmount[] = [
  { credits: 50, price: 2500, bonus: 0 },
  { credits: 150, price: 7500, bonus: 10, popular: true },
  { credits: 300, price: 15000, bonus: 25 },
  { credits: 500, price: 25000, bonus: 75 },
];

// Opérateurs Mobile Money
const OPERATORS: Provider[] = [
  {
    id: "mvola",
    name: "MVola",
    color: "#00A8E8",
    available: true,
  },
  {
    id: "orange",
    name: "Orange Money",
    color: "#FF7900",
    available: true,
  },
  {
    id: "airtel",
    name: "Airtel Money",
    color: "#FF0000",
    available: true,
  },
];

export default function RechargePage() {
  const router = useRouter();
  const { userId, appUser, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"historique" | "recharger">(
    "recharger",
  );

  // États pour le paiement
  const [creditPacks, setCreditPacks] = useState<PaymentAmount[]>(DEFAULT_PACKS);
  const [selectedAmount, setSelectedAmount] = useState<PaymentAmount | undefined>(undefined);
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [processing, setProcessing] = useState(false);

  // États pour les transactions
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalTransactions, setTotalTransactions] = useState(0);

  // Modal de confirmation
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [transferCode, setTransferCode] = useState("");

  // Realtime transactions
  const { newTransactionCount, lastTransaction, resetCount } =
    useTransactionsRealtime({
      userId: userId ?? undefined,
      enabled: true,
    });

  // Charger les transactions
  const loadTransactions = async (page: number = currentPage) => {
    if (transactionsLoading) return;
    setTransactionsLoading(true);
    try {
      const { getUserCreditHistoryAction } = await import("@/actions/profile");
      const result = await getUserCreditHistoryAction(page, pageSize);
      if (result.success && result.data) {
        const mappedTransactions: Transaction[] = result.data.map(
          (tx: any) => ({
            id: tx.id,
            type:
              tx.type === "RECHARGE"
                ? "in"
                : tx.type === "ACHAT"
                  ? "out"
                  : "bonus",
            status:
              tx.status === "PENDING"
                ? "pending"
                : tx.status === "REFUSED" || tx.status === "REJECTED"
                  ? "refused"
                  : "completed",
            title:
              tx.type === "ACHAT"
                ? `Déblocage — ${tx.description || "Sujet"}`
                : tx.type === "RECHARGE"
                  ? "Recharge Mobile Money"
                  : "Bonus",
            amount:
              tx.type === "RECHARGE"
                ? tx.creditsCount || tx.amount
                : Math.abs(tx.amount),
            date: tx.createdAt,
            meta: `${new Date(tx.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })} · Réf. ${tx.id?.slice(0, 8).toUpperCase() || "N/A"}`,
            icon:
              tx.type === "ACHAT" ? "🔓" : tx.type === "RECHARGE" ? "💳" : "🎁",
          }),
        );
        setTransactions(mappedTransactions);
        setTotalTransactions(result.pagination?.total || 0);
        resetCount();
      }
    } catch (error) {
      console.error("Erreur chargement transactions:", error);
    } finally {
      setTransactionsLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Mah.AI — Recharge de crédits";
    if (!authLoading) {
      if (!userId) {
        router.push("/auth/login");
      } else {
        setLoading(false);
        if (activeTab === "historique") {
          loadTransactions(1);
        }
      }
    }
  }, [userId, authLoading, router]);

  useEffect(() => {
    if (
      activeTab === "historique" &&
      transactions.length === 0 &&
      !transactionsLoading
    ) {
      loadTransactions(1);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "historique") {
      loadTransactions(currentPage);
    }
  }, [currentPage]);

  // Notification pour nouvelle transaction
  useEffect(() => {
    if (newTransactionCount > 0 && lastTransaction) {
      loadTransactions(1);
      setCurrentPage(1);

      const txType =
        lastTransaction.type === "RECHARGE"
          ? "Recharge"
          : lastTransaction.type === "ACHAT"
            ? "Achat"
            : "Transaction";
      const status =
        lastTransaction.status === "PENDING"
          ? "en attente"
          : lastTransaction.status === "COMPLETED"
            ? "validée"
            : "refusée";

      setNotification({
        type: lastTransaction.status === "COMPLETED" ? "success" : "error",
        message: `${txType} de ${lastTransaction.creditsCount || Math.abs(lastTransaction.amount)} crédits ${status}.`,
      });

      setTimeout(() => setNotification(null), 5000);
    }
  }, [newTransactionCount]);

  // L'opérateur est détecté automatiquement via le préfixe du numéro

  // Formatage du numéro
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 10);
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 5)
      return `${numbers.slice(0, 3)} ${numbers.slice(3)}`;
    if (numbers.length <= 8)
      return `${numbers.slice(0, 3)} ${numbers.slice(3, 5)} ${numbers.slice(5)}`;
    return `${numbers.slice(0, 3)} ${numbers.slice(3, 5)} ${numbers.slice(5, 8)} ${numbers.slice(8, 10)}`;
  };

  // Charger les packs de crédits dynamiques au montage
  useEffect(() => {
    async function fetchCreditPacks() {
      try {
        const res = await fetch('/api/config/credit-packs')
        if (res.ok) {
          const data = await res.json()
          if (data.packs && data.packs.length > 0) {
            const packs = data.packs.map((p: any) => ({
              credits: p.credits,
              price: p.price,
              bonus: p.bonus,
              popular: p.popular
            }))
            setCreditPacks(packs)
            // Sélectionner le pack populaire par défaut, ou le premier
            const defaultPack = packs.find((p: PaymentAmount) => p.popular) || packs[0]
            setSelectedAmount(defaultPack)
          } else {
            // Fallback aux packs par défaut
            setSelectedAmount(DEFAULT_PACKS.find(p => p.popular) || DEFAULT_PACKS[0])
          }
        } else {
          setSelectedAmount(DEFAULT_PACKS.find(p => p.popular) || DEFAULT_PACKS[0])
        }
      } catch (err) {
        console.error('Erreur chargement packs:', err)
        setSelectedAmount(DEFAULT_PACKS.find(p => p.popular) || DEFAULT_PACKS[0])
      }
    }
    fetchCreditPacks()
  }, []);

  const handleRecharge = () => {
    if (!phoneNumber || !selectedProvider || !selectedAmount) {
      setNotification({ type: "error", message: "Veuillez sélectionner un numéro et un pack" });
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirmPayment = async (senderCode?: string) => {
    const code = senderCode?.trim() || transferCode.trim();
    if (!code) {
      setNotification({
        type: "error",
        message: "Veuillez entrer le code de transfert reçu",
      });
      return;
    }
    // Mettre à jour transferCode si le code vient de la modale
    if (senderCode) {
      setTransferCode(senderCode);
    }

    if (!selectedAmount || selectedAmount.price <= 0 || selectedAmount.credits <= 0) {
      setNotification({ type: "error", message: "Montant invalide" });
      return;
    }

    setProcessing(true);
    try {
      const result = await rechargeCreditsAction({
        packCredits: selectedAmount.credits,
        packPrice: selectedAmount.price,
        operator: selectedProvider.toUpperCase(),
        phoneNumber,
        transferCode: code,
        status: "PENDING",
      });

      if (result.success) {
        setNotification({
          type: "success",
          message: `Votre demande de ${selectedAmount?.credits || 0} crédits a été enregistrée. Validation sous 12h.`,
        });
        setShowConfirmation(false);
        setTransferCode("");
        await loadTransactions();
        setActiveTab("historique");
      } else {
        setNotification({
          type: "error",
          message: result.error || "Erreur lors de la validation",
        });
      }
    } catch {
      setNotification({ type: "error", message: "Erreur serveur" });
    } finally {
      setProcessing(false);
    }
  };

  if (loading || authLoading) {
    return <RechargePageSkeleton />;
  }

  const operatorName =
    selectedProvider === "mvola"
      ? "MVola"
      : selectedProvider === "orange"
        ? "Orange Money"
        : "Airtel Money";

  const pendingCount = transactions.filter(tx => tx.status === "pending").length;

  return (
    <div className="credits-page">
      <LuxuryCursor />
      <LuxuryNavbar />

      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-label">{appUser?.prenom || "Utilisateur"}</div>
          <h1 className="hero-title">
            Mes <em>crédits</em>
          </h1>
          <p className="hero-sub">
            Gérez votre solde, suivez vos mouvements et rechargez votre compte
            simplement via Mobile Money.
          </p>

          {/* Bandeau recharge en attente */}
          {pendingCount > 0 && (
            <div className="info-banner" role="status" aria-live="polite" style={{ marginTop: '1rem' }}>
              <Clock size={16} />
              <span>
                {pendingCount === 1
                  ? "1 recharge en attente de validation admin (délai habituel : quelques heures)"
                  : `${pendingCount} recharges en attente de validation admin`}
              </span>
            </div>
          )}

          <BalanceCard
            balance={appUser?.credits ?? 0}
            ariaryEquivalent={`≈ ${(appUser?.credits ?? 0) * 50} Ariary`}
          />
        </div>
      </section>

      {/* MAIN */}
      <main id="main-content" className="main">
        <div className="content">
          {/* TABS */}
          <div className="tabs">
            <button
              className={`tab ${activeTab === "historique" ? "active" : ""}`}
              onClick={() => setActiveTab("historique")}
            >
              Historique
              {newTransactionCount > 0 && (
                <span className="tab-badge">{newTransactionCount}</span>
              )}
            </button>
            <button
              className={`tab ${activeTab === "recharger" ? "active" : ""}`}
              onClick={() => setActiveTab("recharger")}
            >
              Recharger
            </button>
          </div>

          {/* HISTORIQUE TAB */}
          {activeTab === "historique" && (
            <TransactionHistory
              transactions={transactions}
              isLoading={transactionsLoading}
              onTransactionClick={(tx) => console.log(tx)}
            />
          )}

          {/* RECHARGER TAB */}
          {activeTab === "recharger" && (
            <div className="recharge-section">
              <div className="info-banner">
                <Smartphone size={16} />
                <span>
                  Paiement via Mobile Money · Validation manuelle sous 12h
                </span>
              </div>

              {/* Payment Form — opérateur auto-détecté */}
              <PaymentForm
                amounts={creditPacks}
                selectedAmount={selectedAmount}
                phoneNumber={phoneNumber}
                providerId={selectedProvider}
                isLoading={processing}
                onAmountSelect={setSelectedAmount}
                onPhoneNumberChange={(phone) =>
                  setPhoneNumber(formatPhoneNumber(phone))
                }
                onProviderChange={(id) => setSelectedProvider(id)}
                onSubmit={handleRecharge}
              />

              {/* How it works */}
              <div className="how-it-works">
                <Info size={20} />
                <div>
                  <div className="hiw-title">Processus d&apos;achat</div>
                  <ol className="hiw-steps">
                    <li>Choisissez votre pack et sélectionnez votre numéro</li>
                    <li>Effectuez le transfert vers le numéro Mah.AI indiqué</li>
                    <li>Renseignez le code de transaction reçu par SMS</li>
                    <li>
                      Vos crédits sont ajoutés après vérification (sous 12h)
                    </li>
                  </ol>
                </div>
              </div>

              {/* Trust badges */}
              <div className="trust-badges">
                <div className="trust-item">
                  <Shield size={14} />
                  <span>Paiement 100% sécurisé</span>
                </div>
                <div className="trust-item">
                  <Clock size={14} />
                  <span>Validation sous 12h</span>
                </div>
                <div className="trust-item">
                  <CheckCircle size={14} />
                  <span>Transaction vérifiée</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="panel">
            <div className="panel-header">
              <span className="panel-label">Vue d&apos;ensemble</span>
            </div>
            <div className="panel-body">
              <div className="info-row">
                <span className="info-key">Solde actuel</span>
                <span className="info-val gold">
                  {appUser?.credits ?? 0} cr
                </span>
              </div>
              <div className="info-row">
                <span className="info-key">Total rechargé</span>
                <span className="info-val">
                  {transactions
                    .filter((tx) => tx.type === "in")
                    .reduce((sum, tx) => sum + tx.amount, 0)}{" "}
                  cr
                </span>
              </div>
              <div className="info-row">
                <span className="info-key">Total dépensé</span>
                <span className="info-val">
                  {transactions
                    .filter((tx) => tx.type === "out")
                    .reduce((sum, tx) => sum + tx.amount, 0)}{" "}
                  cr
                </span>
              </div>
              <div className="info-row">
                <span className="info-key">Bonus obtenus</span>
                <span className="info-val gold">
                  +
                  {transactions
                    .filter((tx) => tx.type === "bonus")
                    .reduce((sum, tx) => sum + tx.amount, 0)}{" "}
                  cr
                </span>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <span className="panel-label">Mobile Money lié</span>
            </div>
            <div className="panel-body">
              <div className="mm-info">
                <Smartphone size={18} />
                <div className="mm-details">
                  <div className="mm-number">
                    {appUser?.phone || "Non renseigné"}
                  </div>
                  <div className="mm-status">
                    {appUser?.defaultOperator || "MVOLA"} · Actif
                  </div>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                onClick={() => router.push("/profil")}
              >
                Modifier
              </Button>
            </div>
          </div>
        </aside>
      </main>

      {/* CONFIRMATION MODAL */}
      <RechargeConfirmation
        isOpen={showConfirmation}
        onClose={() => {
          setShowConfirmation(false);
          setTransferCode("");
        }}
        amount={selectedAmount?.credits || 0}
        price={selectedAmount?.price || 0}
        bonus={selectedAmount?.bonus || 0}
        providerName={operatorName}
        phoneNumber={phoneNumber}
        isLoading={processing}
        onConfirm={handleConfirmPayment}
      />

      {/* NOTIFICATION */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <AlertCircle size={16} />
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)}>
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
