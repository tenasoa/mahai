/**
 * Logger centralisé pour l'application
 * En production, envoie vers un service de monitoring (Sentry, etc.)
 * En développement, affiche dans la console
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const minLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';
    return levels.indexOf(level) >= levels.indexOf(minLevel);
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    context?: LogContext
  ): string {
    const timestamp = new Date().toISOString();
    const ctx = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${ctx}`;
  }

  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog('debug')) return;
    
    if (this.isProduction) {
      // En prod, on ignore les debugs sauf si explicitement activé
      return;
    }
    console.log(this.formatMessage('debug', message, context));
  }

  info(message: string, context?: LogContext): void {
    if (!this.shouldLog('info')) return;
    
    if (this.isProduction) {
      // TODO: Envoyer vers service de monitoring
      return;
    }
    console.log(this.formatMessage('info', message, context));
  }

  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog('warn')) return;
    
    if (this.isProduction) {
      // TODO: Envoyer vers service de monitoring
      return;
    }
    console.warn(this.formatMessage('warn', message, context));
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (!this.shouldLog('error')) return;

    const errorContext: LogContext = {
      ...context,
      ...(error instanceof Error ? {
        errorMessage: error.message,
        errorStack: error.stack,
      } : { error }),
    };

    if (this.isProduction) {
      // TODO: Envoyer vers Sentry ou équivalent
      // captureException(error);
      return;
    }
    console.error(this.formatMessage('error', message, errorContext));
  }

  // Méthode spécifique pour les erreurs de base de données
  dbError(operation: string, error: unknown, query?: string): void {
    this.error(`Database error during ${operation}`, error, {
      query: query ? query.substring(0, 200) : undefined,
    });
  }

  // Méthode spécifique pour les erreurs d'API
  apiError(endpoint: string, error: unknown, userId?: string): void {
    this.error(`API error on ${endpoint}`, error, { userId });
  }

  // Méthode spécifique pour les erreurs d'authentification
  authError(action: string, error: unknown, userId?: string): void {
    this.error(`Auth error during ${action}`, error, { userId });
  }
}

// Export singleton
export const logger = new Logger();

// Export pour les Server Actions
export function createActionLogger(actionName: string) {
  return {
    info: (msg: string, ctx?: LogContext) => logger.info(`[${actionName}] ${msg}`, ctx),
    error: (msg: string, err?: unknown, ctx?: LogContext) => logger.error(`[${actionName}] ${msg}`, err, ctx),
  };
}
