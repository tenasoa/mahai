import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "@fontsource-variable/lexend";
import "./app.css";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ffffff" />
        <Meta />
        <Links />
      </head>
      <body className="font-sans antialiased">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let titre = "Quelque chose s'est mal passé";
  let details = "Réessaie dans un instant. Si ça continue, préviens-nous.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      titre = "Page introuvable";
      details = "Cette page n'existe pas ou a été déplacée.";
    } else {
      details = error.statusText || details;
    }
  } else if (import.meta.env.DEV && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="mx-auto flex max-w-xl flex-col items-start gap-4 px-5 pt-16">
      <h1 className="text-[2rem] leading-tight font-extrabold tracking-tight">
        {titre}
      </h1>
      <p className="text-base text-ink-2">{details}</p>
      <Link
        to="/"
        className="inline-flex min-h-12 items-center rounded-full bg-ink px-6 font-bold text-white"
      >
        Retour à l'accueil
      </Link>
      {stack ? (
        <pre className="w-full overflow-x-auto rounded-card bg-soft p-4 text-xs">
          <code>{stack}</code>
        </pre>
      ) : null}
    </main>
  );
}
