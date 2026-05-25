"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/**
 * Action attachée à un toast — affichée comme un bouton inline en bas du toast.
 *  - `label` : texte du bouton (ex: « Voir correction », « Plus tard »)
 *  - `onClick` : callback invoqué quand l'utilisateur clique
 *  - `variant` : 'primary' (gold) ou 'ghost' (transparent), default 'ghost'
 *  - `closeOnClick` : si true (défaut), ferme le toast après le clic
 *
 * Quand au moins une action est fournie, le toast NE se ferme PAS automatiquement
 * après 5s — l'utilisateur doit le fermer ou cliquer sur une action.
 */
export interface ToastAction {
  label: string;
  onClick: () => void;
  variant?: "primary" | "ghost";
  closeOnClick?: boolean;
}

interface ToastProps {
  message: string;
  title?: string;
  type: "success" | "error" | "info" | "warning";
  actions?: ToastAction[];
  onClose: () => void;
}

const TOAST_CONFIG = {
  success: {
    line: "#4A6B5A",
    prog: "#8ECAAC",
    icBg: "rgba(74,107,90,.15)",
    icBd: "rgba(74,107,90,.3)",
    title: "Succès",
    shake: false,
    svg: (
      <path
        d="M4 8L7 11L13 5"
        stroke="#8ECAAC"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  error: {
    line: "#9B2335",
    prog: "#E06070",
    icBg: "rgba(155,35,53,.13)",
    icBd: "rgba(155,35,53,.3)",
    title: "Erreur",
    shake: true,
    svg: (
      <path
        d="M8 4V9M8 11.5V11.4"
        stroke="#E06070"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  info: {
    line: "#C9A84C",
    prog: "#C9A84C",
    icBg: "rgba(201,168,76,.08)",
    icBd: "rgba(201,168,76,.22)",
    title: "Information",
    shake: false,
    svg: (
      <path
        d="M8 5V5.1M8 7V12"
        stroke="#C9A84C"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    ),
  },
  warning: {
    line: "#C9843C",
    prog: "#C9843C",
    icBg: "rgba(201,132,60,.12)",
    icBd: "rgba(201,132,60,.28)",
    title: "Attention",
    shake: false,
    svg: (
      <>
        <path
          d="M8 2.5L14 13.5H2L8 2.5Z"
          stroke="#C9843C"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
        <path
          d="M8 7V9.5M8 11V11.1"
          stroke="#C9843C"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </>
    ),
  },
};

export function Toast({ message, type, actions, onClose }: ToastProps) {
  const [isEntering, setIsEntering] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [shouldShake, setShouldShake] = useState(false);
  const config = TOAST_CONFIG[type];
  const hasActions = !!(actions && actions.length > 0);

  useEffect(() => {
    const entryTimer = setTimeout(() => setIsEntering(true), 50);

    if (config.shake) {
      setTimeout(() => setShouldShake(true), 500);
      setTimeout(() => setShouldShake(false), 1000);
    }

    // Pas d'auto-close quand le toast a des actions : on attend une décision
    // explicite de l'utilisateur (sinon l'action serait inaccessible).
    if (hasActions) {
      return () => clearTimeout(entryTimer);
    }

    const duration = 5000;
    const closeTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(entryTimer);
      clearTimeout(closeTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, config.shake, hasActions]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 400);
  };

  const handleAction = (action: ToastAction) => {
    action.onClick();
    if (action.closeOnClick !== false) handleClose();
  };

  return (
    <div
      role={type === "error" ? "alert" : "status"}
      className={`luxury-toast ${isEntering ? "in" : ""} ${isExiting ? "out" : ""} ${shouldShake ? "shake" : ""}`}
    >
      <div className="toast-line" style={{ background: config.line }}></div>
      <div
        className="toast-ic"
        style={{ background: config.icBg, border: `1px solid ${config.icBd}` }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          {config.svg}
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="toast-title">{config.title}</div>
        <div className="toast-msg">{message}</div>
        {hasActions && (
          <div className="toast-actions">
            {actions!.map((a, i) => (
              <button
                key={i}
                className={`toast-action toast-action-${a.variant || "ghost"}`}
                onClick={() => handleAction(a)}
              >
                {a.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <button
        className="toast-x"
        onClick={handleClose}
        aria-label="Fermer la notification"
      >
        <X size={14} />
      </button>
      {/* Progress bar uniquement quand le toast s'auto-ferme — sinon elle
          finirait à 100% sans rien faire et serait visuellement trompeuse. */}
      {!hasActions && (
        <div className="toast-prog" style={{ background: config.prog }}></div>
      )}

      <style jsx>{`
        .luxury-toast {
          background: #1c1916;
          border: 1px solid rgba(201, 168, 76, 0.16);
          border-radius: 0.5rem;
          padding: 0.8125rem 0.9375rem;
          display: flex;
          align-items: flex-start;
          gap: 0.6875rem;
          position: relative;
          overflow: hidden;
          width: 340px;
          max-width: calc(100vw - 24px);
          transform: translateX(calc(100% + 2rem));
          opacity: 0;
          transition:
            transform 0.42s cubic-bezier(0.22, 0.68, 0, 1.2),
            opacity 0.35s ease;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          pointer-events: auto;
          margin-bottom: 0.5rem;
        }
        .luxury-toast.in {
          transform: translateX(0);
          opacity: 1;
        }
        .luxury-toast.out {
          transform: translateX(calc(100% + 2rem));
          opacity: 0;
          transition:
            transform 0.32s cubic-bezier(0.4, 0, 0.6, 1),
            opacity 0.25s ease;
        }
        .luxury-toast.shake {
          animation: shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97);
        }
        @keyframes shake {
          10%,
          90% {
            transform: translateX(-3px);
          }
          20%,
          80% {
            transform: translateX(4px);
          }
          30%,
          50%,
          70% {
            transform: translateX(-4px);
          }
          40%,
          60% {
            transform: translateX(4px);
          }
        }
        .toast-line {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.55s 0.15s cubic-bezier(0.22, 0.68, 0, 1.1);
        }
        .luxury-toast.in .toast-line {
          transform: scaleX(1);
        }
        .toast-ic {
          width: 1.75rem;
          height: 1.75rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 0.0625rem;
          transform: scale(0) rotate(-90deg);
          transition: transform 0.38s 0.08s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .luxury-toast.in .toast-ic {
          transform: scale(1) rotate(0deg);
        }
        .toast-title {
          font-size: 0.8125rem;
          font-weight: 500;
          color: #f0ebe3;
          margin-bottom: 0.1875rem;
          line-height: 1.3;
          opacity: 0;
          transform: translateY(4px);
          transition:
            opacity 0.3s 0.18s,
            transform 0.3s 0.18s ease;
        }
        .luxury-toast.in .toast-title {
          opacity: 1;
          transform: translateY(0);
        }
        .toast-msg {
          font-size: 0.75rem;
          color: rgba(240, 235, 227, 0.5);
          line-height: 1.5;
          opacity: 0;
          transform: translateY(4px);
          transition:
            opacity 0.3s 0.25s,
            transform 0.3s 0.25s ease;
        }
        .luxury-toast.in .toast-msg {
          opacity: 1;
          transform: translateY(0);
        }
        .toast-x {
          background: none;
          border: none;
          color: rgba(240, 235, 227, 0.2);
          cursor: pointer;
          padding: 0;
          line-height: 1;
          flex-shrink: 0;
          transition:
            color 0.15s,
            transform 0.15s;
          margin-left: auto;
          margin-top: 1px;
          opacity: 0;
          transform: scale(0.7);
          transition:
            opacity 0.25s 0.3s,
            transform 0.25s 0.3s ease,
            color 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .luxury-toast.in .toast-x {
          opacity: 1;
          transform: scale(1);
        }
        .toast-x:hover {
          color: rgba(240, 235, 227, 0.65);
          transform: scale(1.15) !important;
        }
        .toast-prog {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 2px;
          width: 100%;
          border-radius: 0 2px 2px 0;
          transform-origin: left;
          animation: progress 5s linear forwards;
        }
        @keyframes progress {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }

        /* ─── Toast actions row ──────────────────────────────────── */
        .toast-actions {
          display: flex;
          gap: 0.375rem;
          margin-top: 0.5rem;
          opacity: 0;
          transform: translateY(4px);
          transition:
            opacity 0.3s 0.32s,
            transform 0.3s 0.32s ease;
        }
        .luxury-toast.in .toast-actions {
          opacity: 1;
          transform: translateY(0);
        }

        .toast-action {
          font-family: var(--body);
          font-size: 0.6875rem;
          font-weight: 500;
          padding: 0.3125rem 0.625rem;
          border-radius: 0.25rem;
          cursor: pointer;
          transition:
            background 0.15s,
            color 0.15s,
            border-color 0.15s;
          line-height: 1.3;
          letter-spacing: 0.02em;
          white-space: nowrap;
        }

        .toast-action-primary {
          background: #c9a84c;
          color: #1a1714;
          border: 1px solid #c9a84c;
        }
        .toast-action-primary:hover {
          background: #d4b860;
          border-color: #d4b860;
        }

        .toast-action-ghost {
          background: transparent;
          color: rgba(240, 235, 227, 0.7);
          border: 1px solid rgba(240, 235, 227, 0.18);
        }
        .toast-action-ghost:hover {
          color: #f0ebe3;
          border-color: rgba(240, 235, 227, 0.4);
        }
      `}</style>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Array<{
    id: string;
    message: string;
    type: "success" | "error" | "info" | "warning";
    actions?: ToastAction[];
  }>;
  removeToast: (id: string) => void;
}

export function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: "fixed",
        top: "12px",
        right: "12px",
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        pointerEvents: "none",
      }}
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          actions={toast.actions}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>,
    document.body,
  );
}

type ToastEntry = {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  actions?: ToastAction[];
};

export function useToast() {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);

  /**
   * Ajoute un toast.
   * Signatures supportées :
   *   addToast('Message')
   *   addToast('Message', 'success')
   *   addToast('Message', 'info', [{ label: 'Voir', onClick: () => ... }])
   */
  const addToast = (
    message: string,
    type: "success" | "error" | "info" | "warning" = "info",
    actions?: ToastAction[],
  ) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2, 6);
    setToasts((prev) => [...prev, { id, message, type, actions }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return { toasts, addToast, removeToast };
}
