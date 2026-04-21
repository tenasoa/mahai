"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  refreshEmailVerificationStatus,
  resendVerificationEmail,
} from "@/actions/auth";
import { useToast, ToastContainer } from "@/components/ui/Toast";
import { useAuth } from "@/lib/hooks/useAuth";
import { CheckCircle2, Mail, RefreshCw } from "lucide-react";
import "./auth-forms.css";

interface VerifyEmailFormProps {
  email?: string;
  onComplete: (nextUrl: string) => void;
}

export function VerifyEmailForm({ email = "", onComplete }: VerifyEmailFormProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [timer, setTimer] = useState(60);
  const [timerActive, setTimerActive] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [nextUrl, setNextUrl] = useState("/auth/onboarding");
  const { toasts, addToast, removeToast } = useToast();
  const { user, appUser } = useAuth();
  const resolvedEmail = email || appUser?.email || user?.email || "";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (timerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((previous) => {
          if (previous <= 1) {
            setTimerActive(false);
            return 0;
          }

          return previous - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timerActive, timer]);

  const checkVerificationStatus = async () => {
    setIsChecking(true);

    try {
      const result = await refreshEmailVerificationStatus();

      if (result.error) {
        addToast(result.error, "error");
        return;
      }

      if (!result.verified) {
        addToast("Votre e-mail n'est pas encore confirmé.", "error");
        return;
      }

      const redirectUrl = result.nextUrl || "/auth/onboarding";
      setNextUrl(redirectUrl);
      setShowSuccess(true);
      addToast("Adresse vérifiée avec succès", "success");

      setTimeout(() => {
        onComplete(redirectUrl);
      }, 1500);
    } catch {
      addToast("Impossible de vérifier votre compte pour le moment.", "error");
    } finally {
      setIsChecking(false);
    }
  };

  const resendEmail = async () => {
    if (!resolvedEmail) {
      addToast("Impossible de retrouver votre adresse e-mail", "error");
      return;
    }

    setIsResending(true);

    try {
      const result = await resendVerificationEmail(resolvedEmail);

      if (result.error) {
        addToast(result.error, "error");
        return;
      }

      setTimer(60);
      setTimerActive(true);
      addToast(result.success || "Lien de confirmation renvoyé", "success");
    } finally {
      setIsResending(false);
    }
  };

  if (!mounted) {
    return <div className="auth-skeleton" />;
  }

  if (showSuccess) {
    return (
      <div className="auth-success-wrap">
        <div className="auth-success-icon">
          <CheckCircle2 size={32} />
        </div>
        <h1 className="auth-success-heading">
          E-mail confirmé
        </h1>
        <p className="auth-success-text">
          Votre compte est prêt. Redirection en cours vers la configuration du profil.
        </p>
        <button onClick={() => window.location.assign(nextUrl)} className="auth-submit-btn">
          Continuer vers mon profil
        </button>
      </div>
    );
  }

  return (
    <div className="auth-form-wrapper">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="auth-float-icon">
        <Mail size={64} strokeWidth={1.5} />
      </div>

      <h1 className="auth-heading-centered-lg">
        Confirmez votre e-mail
      </h1>

      <p className="auth-subtitle-centered">
        Nous avons envoyé un lien de confirmation à votre adresse. Ouvrez cet e-mail,
        cliquez sur le lien puis revenez ici.
      </p>

      {resolvedEmail && (
        <div className="auth-email-badge-lg">
          <Mail size={12} />
          <span>{resolvedEmail}</span>
        </div>
      )}

      <button
        onClick={checkVerificationStatus}
        disabled={isChecking}
        className="auth-submit-btn auth-submit-btn-mb-sm"
      >
        <RefreshCw size={16} className={isChecking ? "animate-spin" : ""} />
        {isChecking ? "Vérification..." : "J'ai déjà confirmé mon e-mail"}
      </button>

      <button
        onClick={resendEmail}
        disabled={timerActive || isResending}
        className="auth-mono-btn"
      >
        {isResending
          ? "Envoi..."
          : timerActive
            ? `Renvoyer dans ${timer}s`
            : "Renvoyer le lien de confirmation"}
      </button>

      <div className="auth-center-text">
        <Link href="/auth/register" className="auth-link-plain">
          Mauvaise adresse e-mail ? Recommencer
        </Link>
      </div>
    </div>
  );
}
