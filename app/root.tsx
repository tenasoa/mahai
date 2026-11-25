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
import { Logo } from "~/components/ui/Logo";
import { Pictogramme } from "~/components/ui/Pictogramme";
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

  const introuvable = isRouteErrorResponse(error) && error.status === 404;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-5xl px-5 pt-5 lg:px-10 lg:pt-8">
        <Link to="/" aria-label="Mah.ai, accueil">
          <Logo />
        </Link>
      </header>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-5 pt-12 pb-16 lg:flex-row lg:items-center lg:gap-16 lg:px-10 lg:pt-0">
        <div className="flex flex-col items-start gap-4 lg:flex-1">
          {introuvable ? (
            <p className="text-sm font-bold tracking-wide text-muted uppercase">Erreur 404</p>
          ) : null}
          <h1 className="text-[2rem] leading-tight font-extrabold tracking-tight lg:text-5xl">{titre}</h1>
          <p className="text-base text-ink-2 lg:text-lg">{details}</p>
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Link
              to="/"
              className="inline-flex min-h-12 items-center rounded-full bg-ink px-6 font-bold text-white hover:bg-ink-2"
            >
              Retour à l'accueil
            </Link>
            <Link
              to="/sujets"
              className="inline-flex min-h-12 items-center rounded-full bg-soft px-6 font-medium hover:bg-line"
            >
              Voir les sujets
            </Link>
          </div>
          {stack ? (
            <pre className="w-full overflow-x-auto rounded-card bg-soft p-4 text-xs">
              <code>{stack}</code>
            </pre>
          ) : null}
        </div>
        {/* Ordinateur : la mosaïque de la marque, décorative */}
        <div aria-hidden="true" className="hidden w-80 shrink-0 grid-cols-3 grid-rows-3 gap-3 lg:grid">
          <span className="col-span-2 row-span-2 flex items-start rounded-tile bg-maths p-5">
            <Pictogramme id="pi" taille={36} />
          </span>
          <span className="flex aspect-square items-center justify-center rounded-tile bg-histoire">
            <Pictogramme id="globe" taille={26} />
          </span>
          <span className="flex aspect-square items-center justify-center rounded-tile bg-svt">
            <Pictogramme id="feuille" taille={26} />
          </span>
          <span className="flex aspect-square items-center justify-center rounded-tile bg-francais">
            <Pictogramme id="lettres" taille={26} />
          </span>
          <span className="col-span-2 flex items-center rounded-tile bg-physique p-5">
            <Pictogramme id="atome" taille={28} />
          </span>
        </div>
      </main>
    </div>
  );
}
