"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui";
import { Phone, ChevronDown } from "lucide-react";
import styles from "./PaymentForm.module.css";

type OperatorId = 'mvola' | 'orange' | 'airtel'

function detectOperator(phone: string): OperatorId | '' {
  const p = phone.replace(/\s/g, '')
  const prefix3 = p.substring(0, 3)
  if (['034', '038'].includes(prefix3)) return 'mvola'
  if (['032', '037'].includes(prefix3)) return 'orange'
  if (prefix3 === '033') return 'airtel'
  return ''
}

const OPERATOR_NAMES: Record<string, string> = {
  mvola: 'MVola',
  orange: 'Orange Money',
  airtel: 'Airtel Money',
}

export interface PaymentAmount {
  credits: number;
  price: number;
  popular?: boolean;
  bonus?: number;
}

export interface PaymentFormProps {
  amounts: PaymentAmount[];
  selectedAmount?: PaymentAmount;
  phoneNumber?: string;
  providerId?: string;
  isLoading?: boolean;
  error?: string;
  onAmountSelect?: (amount: PaymentAmount) => void;
  onPhoneNumberChange?: (phoneNumber: string) => void;
  onProviderChange?: (providerId: string) => void;
  onSubmit?: (data: {
    amount: PaymentAmount;
    phoneNumber: string;
    providerId: string;
  }) => void;
}

const AMOUNT_PRESETS: PaymentAmount[] = [
  { credits: 50, price: 5000, bonus: 10, popular: true },
  { credits: 100, price: 10000 },
  { credits: 200, price: 20000, bonus: 25 },
  { credits: 500, price: 50000, bonus: 75 },
];

export function PaymentForm({
  amounts = AMOUNT_PRESETS,
  selectedAmount,
  phoneNumber = "",
  providerId,
  isLoading = false,
  error,
  onAmountSelect,
  onPhoneNumberChange,
  onProviderChange,
  onSubmit,
}: PaymentFormProps) {
  const [localPhone, setLocalPhone] = useState(phoneNumber);
  const [localAmount, setLocalAmount] = useState<PaymentAmount | undefined>(
    selectedAmount,
  );
  const [userPhones, setUserPhones] = useState<{id: string, phone: string, provider: string}[]>([]);
  const [detectedOperator, setDetectedOperator] = useState('');

  useEffect(() => {
    async function fetchPhones() {
      try {
        const res = await fetch('/api/user/phones')
        if (res.ok) {
          const data = await res.json()
          setUserPhones(data)
          if (data.length > 0 && !localPhone) {
            const first = data[0]
            setLocalPhone(first.phone)
            onPhoneNumberChange?.(first.phone)
            const det = detectOperator(first.phone)
            if (det) {
              setDetectedOperator(det)
              onProviderChange?.(det)
            }
          }
        }
      } catch (err) {
        console.error('Erreur chargement numéros', err)
      }
    }
    fetchPhones()
  }, []);

  const handlePhoneSelect = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value
      setLocalPhone(value)
      onPhoneNumberChange?.(value)
      const det = detectOperator(value)
      if (det) {
        setDetectedOperator(det)
        onProviderChange?.(det)
      }
    },
    [onPhoneNumberChange, onProviderChange],
  );

  const handleAmountSelect = useCallback(
    (amount: PaymentAmount) => {
      setLocalAmount(amount);
      onAmountSelect?.(amount);
    },
    [onAmountSelect],
  );


  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (localAmount && localPhone && providerId) {
        onSubmit?.({
          amount: localAmount,
          phoneNumber: localPhone,
          providerId,
        });
      }
    },
    [localAmount, localPhone, providerId, onSubmit],
  );

  const isValid = localAmount && localPhone && (providerId || detectedOperator);

  return (
    <form className={styles.paymentForm} onSubmit={handleSubmit}>
      {/* Amount Selection */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Montant des crédits</h3>
        <div className={styles.amountsGrid}>
          {amounts.map((amount) => (
            <button
              key={amount.credits}
              type="button"
              className={`${styles.amountCard} ${localAmount?.credits === amount.credits ? styles.selected : ""} ${amount.popular ? styles.popular : ""}`}
              onClick={() => handleAmountSelect(amount)}
              aria-pressed={localAmount?.credits === amount.credits}
            >
              {amount.popular && (
                <span className={styles.popularBadge}>Populaire</span>
              )}
              <div className={styles.amountCredits}>{amount.credits} cr</div>
              <div className={styles.amountPrice}>
                {amount.price.toLocaleString()} Ar
              </div>
              {amount.bonus && (
                <div className={styles.amountBonus}>
                  +{amount.bonus} cr offerts
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Phone Number — Dropdown */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Numéro Mobile Money</h3>
        <div className={styles.phoneSelectWrapper}>
          <div className={styles.phoneIcon}>
            <Phone size={16} />
          </div>
          <select
            value={localPhone}
            onChange={handlePhoneSelect}
            className={styles.phoneSelect}
            aria-label="Numéro Mobile Money"
          >
            <option value="">— Choisir un numéro —</option>
            {userPhones.map((up) => (
              <option key={up.id || up.phone} value={up.phone}>
                {up.phone}
              </option>
            ))}
          </select>
          <div className={styles.phoneChevron}>
            <ChevronDown size={16} />
          </div>
        </div>
        {userPhones.length === 0 && (
          <p className={styles.noPhoneMsg}>Aucun numéro enregistré. Ajoutez-en depuis votre profil.</p>
        )}
        {(detectedOperator || providerId) && (
          <div className={styles.operatorBadge}>
            <span className={styles.operatorName}>{OPERATOR_NAMES[detectedOperator || providerId || '']}</span>
            <span className={styles.operatorAuto}>détecté auto</span>
          </div>
        )}
        {error && <p className={styles.errorMsg}>{error}</p>}
      </div>

      {/* Summary */}
      {localAmount && (
        <div className={styles.summary}>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Crédits</span>
            <span className={styles.summaryValue}>
              {localAmount.credits} cr
            </span>
          </div>
          {localAmount.bonus && (
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Bonus</span>
              <span className={styles.summaryValueBonus}>
                +{localAmount.bonus} cr
              </span>
            </div>
          )}
          <div className={styles.summaryDivider} />
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Total à payer</span>
            <span className={styles.summaryTotal}>
              {localAmount.price.toLocaleString()} Ar
            </span>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        disabled={!isValid || isLoading}
        isLoading={isLoading}
      >
        {isLoading
          ? "Traitement en cours..."
          : `Payer ${localAmount?.price.toLocaleString() || "0"} Ar`}
      </Button>

      {/* Security Notice */}
      <p className={styles.securityNotice}>
        🔒 Paiement sécurisé via Mobile Money. Aucun frais supplémentaire.
      </p>
    </form>
  );
}

export default PaymentForm;
