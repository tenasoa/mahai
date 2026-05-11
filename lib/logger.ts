/* eslint-disable no-console */
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

const LEVELS: LogLevel[] = ['debug', 'info', 'warn', 'error'];

function shouldLog(level: LogLevel): boolean {
  const minLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';
  return LEVELS.indexOf(level) >= LEVELS.indexOf(minLevel);
}

function formatMessage(level: LogLevel, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString();
  const ctx = context ? ` ${JSON.stringify(context)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${ctx}`;
}

async function captureToSentry(error: Error | unknown, context?: LogContext) {
  try {
    const Sentry = await import('@sentry/nextjs');
    Sentry.withScope((scope) => {
      if (context) scope.setExtras(context as Record<string, unknown>);
      if (error instanceof Error) {
        Sentry.captureException(error);
      } else {
        Sentry.captureMessage(String(error), 'error');
      }
    });
  } catch {
    // Sentry non disponible — on continue sans planter
  }
}

class Logger {
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  debug(message: string, context?: LogContext): void {
    if (!shouldLog('debug') || this.isProduction) return;
    console.log(formatMessage('debug', message, context));
  }

  info(message: string, context?: LogContext): void {
    if (!shouldLog('info')) return;
    if (this.isProduction) {
      console.log(formatMessage('info', message, context));
      return;
    }
    console.log(formatMessage('info', message, context));
  }

  warn(message: string, context?: LogContext): void {
    if (!shouldLog('warn')) return;
    console.warn(formatMessage('warn', message, context));
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (!shouldLog('error')) return;

    const errorContext: LogContext = {
      ...context,
      ...(error instanceof Error
        ? { errorMessage: error.message, errorStack: error.stack }
        : { error }),
    };

    console.error(formatMessage('error', message, errorContext));

    if (this.isProduction) {
      captureToSentry(error, errorContext);
    }
  }

  dbError(operation: string, error: unknown, query?: string): void {
    this.error(`Database error during ${operation}`, error, {
      query: query ? query.substring(0, 200) : undefined,
    });
  }

  apiError(endpoint: string, error: unknown, userId?: string): void {
    this.error(`API error on ${endpoint}`, error, { userId });
  }

  authError(action: string, error: unknown, userId?: string): void {
    this.error(`Auth error during ${action}`, error, { userId });
  }
}

export const logger = new Logger();

export function createActionLogger(actionName: string) {
  return {
    info: (msg: string, ctx?: LogContext) => logger.info(`[${actionName}] ${msg}`, ctx),
    error: (msg: string, err?: unknown, ctx?: LogContext) =>
      logger.error(`[${actionName}] ${msg}`, err, ctx),
  };
}
