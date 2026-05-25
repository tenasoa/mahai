"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Bell, X } from "lucide-react";

interface ToastNotification {
  id: string;
  title: string;
  body?: string;
  link?: string | null;
}

/**
 * Écoute les événements `new-notification` dispatchés par UserNotifications
 * (canal Supabase real-time) et affiche un toast slide-in en bas à droite.
 *
 * Le toast :
 * - Apparaît avec une animation slide-in depuis la droite
 * - Disparaît automatiquement après 5 secondes
 * - Est cliquable pour naviguer vers la page de notifications (ou le lien de la notif)
 */
export function NotificationToast() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState<ToastNotification | null>(null);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => {
      setToast(null);
      setExiting(false);
    }, 350);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as ToastNotification;
      if (!detail?.id || !detail?.title) return;

      // Remplace le toast courant (un seul à la fois)
      setExiting(false);
      setToast(detail);

      // Auto-dismiss après 5 secondes
      const timer = setTimeout(() => {
        setExiting(true);
        setTimeout(() => {
          setToast(null);
          setExiting(false);
        }, 350);
      }, 5000);

      return () => clearTimeout(timer);
    };

    window.addEventListener("new-notification", handler);
    return () => window.removeEventListener("new-notification", handler);
  }, [mounted]);

  const handleClick = () => {
    dismiss();
    router.push(toast?.link || "/notifications");
  };

  if (!mounted || !toast) return null;

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        zIndex: 99998,
        maxWidth: "360px",
        width: "calc(100% - 2rem)",
        background: "#1c1916",
        border: "1px solid rgba(201, 168, 76, 0.22)",
        borderRadius: "0.625rem",
        padding: "0.875rem 1rem",
        display: "flex",
        alignItems: "flex-start",
        gap: "0.75rem",
        cursor: "pointer",
        boxShadow: "0 12px 36px rgba(0, 0, 0, 0.55)",
        animation: exiting
          ? "notifToastOut 0.35s ease forwards"
          : "notifToastIn 0.4s cubic-bezier(0.22, 0.68, 0, 1.2) both",
        pointerEvents: "all",
        transition: "border-color 0.2s",
      }}
      onClick={handleClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(201, 168, 76, 0.45)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(201, 168, 76, 0.22)";
      }}
    >
      {/* Icône */}
      <div
        style={{
          width: "2rem",
          height: "2rem",
          borderRadius: "50%",
          background: "rgba(201, 168, 76, 0.1)",
          border: "1px solid rgba(201, 168, 76, 0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: "#c9a84c",
        }}
      >
        <Bell size={14} />
      </div>

      {/* Contenu */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "0.8125rem",
            fontWeight: 500,
            color: "#f0ebe3",
            marginBottom: "0.125rem",
            lineHeight: 1.35,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {toast.title}
        </div>
        {toast.body && (
          <div
            style={{
              fontSize: "0.71875rem",
              color: "rgba(240, 235, 227, 0.5)",
              lineHeight: 1.4,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {toast.body}
          </div>
        )}
      </div>

      {/* Bouton fermer */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          dismiss();
        }}
        aria-label="Fermer la notification"
        style={{
          background: "none",
          border: "none",
          color: "rgba(240, 235, 227, 0.25)",
          cursor: "pointer",
          padding: "0.125rem",
          lineHeight: 1,
          flexShrink: 0,
          transition: "color 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "rgba(240, 235, 227, 0.7)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "rgba(240, 235, 227, 0.25)";
        }}
      >
        <X size={14} />
      </button>

      {/* Animations */}
      <style jsx global>{`
        @keyframes notifToastIn {
          from {
            opacity: 0;
            transform: translateX(calc(100% + 2rem));
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes notifToastOut {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(calc(100% + 2rem));
          }
        }
      `}</style>
    </div>,
    document.body,
  );
}
