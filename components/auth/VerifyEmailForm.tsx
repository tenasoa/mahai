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
        addToast("Votre email n'est pas encore confirmé.", "error");
        return;
      }

      const redirectUrl = result.nextUrl || "/auth/onboarding";
      setNextUrl(redirectUrl);
      setShowSuccess(true);
      addToast("Email vérifié avec succès", "success");

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
      addToast("Impossible de retrouver votre adresse email", "error");
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
    return <div style={{ minHeight: "340px" }} />;
  }

  if (showSuccess) {
    return (
      <div style={{ textAlign: "center", animation: "fadeUp 0.4s ease" }}>
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            background: "rgba(0, 255, 136, 0.1)",
            border: "1px solid rgba(0, 255, 136, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.25rem",
            animation: "popIn 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <CheckCircle2 className="w-8 h-8 text-[#00FF88]" />
        </div>

        <h1
          style={{
            fontFamily: "var(--display)",
            fontSize: "2rem",
            color: "var(--text)",
            letterSpacing: "-0.03em",
            marginBottom: "0.5rem",
          }}
        >
          Email confirmé
        </h1>

        <p
          style={{
            fontSize: "0.85rem",
            color: "var(--text-2)",
            lineHeight: 1.7,
            marginBottom: "1.6rem",
          }}
        >
          Votre compte est prêt. Redirection en cours vers la configuration du
          profil.
        </p>

        <button
          onClick={() => window.location.assign(nextUrl)}
          style={{
            width: "100%",
            fontFamily: "var(--body)",
            fontSize: "0.9rem",
            fontWeight: 500,
            padding: "0.9rem",
            borderRadius: "var(--r)",
            background: "linear-gradient(135deg, var(--gold), var(--gold-hi))",
            color: "var(--void)",
            border: "none",
            cursor: "none",
            letterSpacing: "0.04em",
          }}
        >
          Continuer vers mon profil
        </button>
      </div>
    );
  }

  return (
    <div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div
        style={{
          width: "100%",
          height: "120px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "1.5rem",
        }}
      >
        <div style={{ animation: "envFloat 3s ease-in-out infinite" }}>
          <Mail className="w-16 h-16 text-[#FFD166] opacity-80" strokeWidth={1.5} />
        </div>
      </div>

      <h1
        style={{
          fontFamily: "var(--display)",
          fontSize: "1.95rem",
          fontWeight: 400,
          letterSpacing: "-0.02em",
          color: "var(--text)",
          textAlign: "center",
          marginBottom: "0.4rem",
          lineHeight: 1.1,
        }}
      >
        Confirmez votre email
      </h1>

      <p
        style={{
          fontSize: "0.85rem",
          color: "var(--text-3)",
          textAlign: "center",
          lineHeight: 1.7,
          marginBottom: "1.75rem",
        }}
      >
        Nous avons envoyé un lien de confirmation Supabase. Ouvrez cet email,
        cliquez sur le lien puis revenez ici.
      </p>

      {resolvedEmail ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.45rem",
            background: "var(--gold-dim)",
            border: "1px solid var(--gold-line)",
            borderRadius: "var(--r-lg)",
            padding: "0.55rem 1.1rem",
            fontFamily: "var(--mono)",
            fontSize: "0.72rem",
            color: "var(--gold)",
            marginBottom: "1.75rem",
            wordBreak: "break-all",
          }}
        >
          <Mail className="w-3 h-3" />
          <span>{resolvedEmail}</span>
        </div>
      ) : null}

      <button
        onClick={checkVerificationStatus}
        disabled={isChecking}
        style={{
          width: "100%",
          fontFamily: "var(--body)",
          fontSize: "0.9rem",
          fontWeight: 500,
          padding: "0.9rem",
          borderRadius: "var(--r)",
          background: "linear-gradient(135deg, var(--gold), var(--gold-hi))",
          color: "var(--void)",
          border: "none",
          cursor: isChecking ? "not-allowed" : "none",
          letterSpacing: "0.04em",
          boxShadow: "0 4px 20px rgba(201,168,76,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          marginBottom: "0.75rem",
        }}
      >
        <RefreshCw className={`w-4 h-4 ${isChecking ? "animate-spin" : ""}`} />
        {isChecking ? "Vérification..." : "J'ai déjà confirmé mon email"}
      </button>

      <button
        onClick={resendEmail}
        disabled={timerActive || isResending}
        style={{
          width: "100%",
          fontFamily: "var(--mono)",
          fontSize: "0.72rem",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          padding: "0.75rem",
          borderRadius: "var(--r)",
          background: "var(--surface)",
          color: timerActive ? "var(--text-4)" : "var(--gold)",
          border: "1px solid var(--b2)",
          cursor: timerActive || isResending ? "not-allowed" : "none",
          marginBottom: "1.3rem",
        }}
      >
        {isResending
          ? "Envoi..."
          : timerActive
            ? `Renvoyer dans ${timer}s`
            : "Renvoyer le lien de confirmation"}
      </button>

      <div style={{ textAlign: "center" }}>
        <Link
          href="/auth/register"
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.62rem",
            color: "var(--text-3)",
            textDecoration: "none",
            cursor: "none",
          }}
        >
          Mauvaise adresse email ? Recommencer
        </Link>
      </div>
    </div>
  );
}
