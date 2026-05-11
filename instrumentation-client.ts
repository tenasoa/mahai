import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://4440c787540b56e6352508cf89fa84ba@o4511373304332288.ingest.de.sentry.io/4511373308461136",
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  enableLogs: true,
  // Note: sendDefaultPii envoie l'IP et l'user agent — désactiver si contraintes RGPD strictes
  sendDefaultPii: false,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
