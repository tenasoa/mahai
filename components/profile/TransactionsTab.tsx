'use client'

import { useRouter } from 'next/navigation'
import {
  Zap,
  PlusCircle,
  Clock3,
  ArrowUpRight,
  ArrowDownLeft,
  Smartphone,
  CreditCard,
  CheckCircle,
} from 'lucide-react'

interface TransactionsTabProps {
  credits: number
  transactions: any[]
  transactionsLoading: boolean
  mobileMoneySettings: { operator: string; phoneNumber: string }
  setMobileMoneySettings: (val: { operator: string; phoneNumber: string }) => void
  mobileMoneySaving: boolean
  onMobileMoneySave: () => void
}

export function TransactionsTab({
  credits,
  transactions,
  transactionsLoading,
  mobileMoneySettings,
  setMobileMoneySettings,
  mobileMoneySaving,
  onMobileMoneySave,
}: TransactionsTabProps) {
  const router = useRouter()

  return (
    <>
      <div className="section-header">
        <h3 className="section-title-with-icon">
          <Zap size={18} />
          Mon <em>Coffre-fort</em>
        </h3>
      </div>

      <div className="safe-grid">
        <div className="safe-main-content">
          {/* Balance Card Luxury */}
          <div className="luxury-balance-card">
            <div className="lbc-bg"></div>
            <div className="lbc-header">
              <div className="lbc-label">Solde actuel</div>
              <Zap size={20} className="lbc-icon" />
            </div>
            <div className="lbc-amount">
              {credits} <span>crédits</span>
            </div>
            <div className="lbc-footer">
              <button
                className="btn-lbc-action"
                onClick={() => router.push("/recharge")}
              >
                <PlusCircle size={16} />
                Recharger
              </button>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="luxury-card settings-card safe-transactions-card">
            <div className="sc-header">
              <h3 className="sc-title">
                Historique des <em>Transactions</em>
              </h3>
              <Clock3 size={14} className="sc-info-icon" />
            </div>

            {transactionsLoading ? (
              <div className="transactions-loading">
                Chargement de vos transactions...
              </div>
            ) : transactions.length > 0 ? (
              <div className="transactions-list">
                {transactions.map((tx) => (
                  <div key={tx.id} className="transaction-item">
                    <div
                      className={`tx-icon-wrap ${tx.type === "ACHAT" ? "spend" : "receive"}`}
                    >
                      {tx.type === "ACHAT" ? (
                        <ArrowUpRight size={16} />
                      ) : (
                        <ArrowDownLeft size={16} />
                      )}
                    </div>
                    <div className="tx-details">
                      <div className="tx-desc">
                        {tx.description ||
                          (tx.type === "ACHAT"
                            ? "Achat de sujet"
                            : "Recharge de crédits")}
                      </div>
                      <div className="tx-date">
                        {new Date(tx.createdAt).toLocaleDateString(
                          "fr-FR",
                          {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </div>
                      {tx.type === "RECHARGE" && tx.amount && (
                        <div className="tx-payment-amount">
                          {tx.amount} Ar
                        </div>
                      )}
                    </div>
                    <div
                      className={`tx-amount ${tx.type === "ACHAT" ? "minus" : "plus"}`}
                    >
                      {tx.type === "ACHAT"
                        ? `-${tx.amount} cr`
                        : `+${tx.creditsCount || tx.amount} cr`}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="transactions-empty">
                <p>Aucune transaction enregistrée pour le moment.</p>
                <span className="text-xs text-text-4">
                  Vos futurs achats et recharges apparaîtront ici.
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="safe-sidebar-content">
          {/* Mobile Money Settings */}
          <div className="luxury-card settings-card mm-settings-card">
            <div className="sc-header">
              <h3 className="sc-title">
                Mobile <em>Money</em>
              </h3>
              <Smartphone size={14} className="sc-info-icon" />
            </div>
            <div className="mm-settings-form">
              <div className="form-group">
                <label className="form-label">Opérateur par défaut</label>
                <select
                  className="form-input"
                  value={mobileMoneySettings.operator}
                  onChange={(e) =>
                    setMobileMoneySettings({
                      ...mobileMoneySettings,
                      operator: e.target.value,
                    })
                  }
                >
                  <option value="MVOLA">MVola</option>
                  <option value="ORANGE">Orange Money</option>
                  <option value="AIRTEL">Airtel Money</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Numéro de téléphone</label>
                <input
                  type="text"
                  className="form-input"
                  value={mobileMoneySettings.phoneNumber}
                  onChange={(e) =>
                    setMobileMoneySettings({
                      ...mobileMoneySettings,
                      phoneNumber: e.target.value,
                    })
                  }
                  placeholder="034 XX XXX XX"
                />
              </div>
              <button
                className="btn-card-action"
                onClick={onMobileMoneySave}
                disabled={mobileMoneySaving}
              >
                {mobileMoneySaving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>

          {/* Credit Perks Card */}
          <div className="luxury-card settings-card perks-card">
            <div className="sc-header">
              <h3 className="sc-title">
                Avantages <em>Premium</em>
              </h3>
              <CreditCard size={14} className="sc-info-icon" />
            </div>
            <ul className="perks-list">
              <li>
                <CheckCircle size={12} className="perk-icon" />{" "}
                Corrections IA illimitées
              </li>
              <li>
                <CheckCircle size={12} className="perk-icon" />{" "}
                Téléchargement PDF HD
              </li>
              <li>
                <CheckCircle size={12} className="perk-icon" /> Accès
                prioritaire 24/7
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}
