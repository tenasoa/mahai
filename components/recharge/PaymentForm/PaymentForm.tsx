"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui";
import { Button } from "@/components/ui";
import styles from "./PaymentForm.module.css";

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
  onSubmit,
}: PaymentFormProps) {
  const [localPhone, setLocalPhone] = useState(phoneNumber);
  const [localAmount, setLocalAmount] = useState<PaymentAmount | undefined>(
    selectedAmount,
  );

  const handleAmountSelect = useCallback(
    (amount: PaymentAmount) => {
      setLocalAmount(amount);
      onAmountSelect?.(amount);
    },
    [onAmountSelect],
  );

  const handlePhoneChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setLocalPhone(value);
      onPhoneNumberChange?.(value);
    },
    [onPhoneNumberChange],
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

  const isValid = localAmount && localPhone.length >= 10 && providerId;

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

      {/* Phone Number */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Numéro Mobile Money</h3>
        <Input
          type="tel"
          placeholder="Ex: 03 45 678 90"
          value={localPhone}
          onChange={handlePhoneChange}
          error={error}
          leftIcon={<span>📱</span>}
          maxLength={15}
        />
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
