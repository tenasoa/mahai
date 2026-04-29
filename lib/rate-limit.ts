/**
 * Rate limiting simple en mémoire pour les routes API
 * En production, utiliser Redis pour un rate limiting distribué
 */

type RateLimitEntry = {
  count: number;
  resetTime: number;
};

// Stockage en mémoire (à remplacer par Redis en production)
const rateLimitStore = new Map<string, RateLimitEntry>();

interface RateLimitOptions {
  windowMs: number; // Fenêtre de temps en ms
  maxRequests: number; // Nombre max de requêtes par fenêtre
}

const DEFAULT_OPTIONS: RateLimitOptions = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requêtes par minute
};

/**
 * Vérifie si une requête dépasse la limite de rate
 */
export function checkRateLimit(
  identifier: string,
  options: Partial<RateLimitOptions> = {}
): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
} {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const now = Date.now();
  const key = identifier;

  const entry = rateLimitStore.get(key);

  // Si pas d'entrée ou fenêtre expirée, créer nouvelle entrée
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + opts.windowMs,
    });
    return {
      allowed: true,
      remaining: opts.maxRequests - 1,
      resetTime: now + opts.windowMs,
    };
  }

  // Si limite atteinte
  if (entry.count >= opts.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter: Math.ceil((entry.resetTime - now) / 1000),
    };
  }

  // Incrémenter le compteur
  entry.count++;
  rateLimitStore.set(key, entry);

  return {
    allowed: true,
    remaining: opts.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Rate limiter spécifique pour auth (plus restrictif)
 */
export function checkAuthRateLimit(identifier: string): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
} {
  return checkRateLimit(`auth:${identifier}`, {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 tentatives
  });
}

/**
 * Rate limiter pour paiement (très restrictif)
 */
export function checkPaymentRateLimit(identifier: string): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
} {
  return checkRateLimit(`payment:${identifier}`, {
    windowMs: 60 * 60 * 1000, // 1 heure
    maxRequests: 10, // 10 tentatives
  });
}

/**
 * Nettoyer les entrées expirées (à appeler périodiquement)
 */
export function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Nettoyage automatique toutes les 5 minutes
setInterval(cleanupExpiredEntries, 5 * 60 * 1000);
