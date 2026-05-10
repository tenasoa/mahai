import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";
import { LuxuryCursor } from "@/components/layout/LuxuryCursor";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { ConditionalNavbar } from "@/components/layout/ConditionalNavbar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

// Police d'affichage : Cormorant Garamond (titres, canvas éditeur, hero).
// Police de corps : DM Sans (paragraphes, UI, body). Remplace l'ancienne
// référence "Outfit" qui n'était jamais chargée — fallback système.
// Police mono : DM Mono (labels uppercase, codes, badges techniques).
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-body",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Mah.AI — Réussis tes examens avec l'IA",
    template: "%s | Mah.AI",
  },
  description:
    "La plateforme EdTech made in Madagascar. Accède aux sujets BAC, BEPC, CEPE avec des corrections IA instantanées. Paiement Mobile Money (MVola, Orange Money, Airtel Money). 500 Ar offerts à l'inscription.",
  keywords: [
    "BAC Madagascar",
    "BEPC Madagascar",
    "CEPE Madagascar",
    "examens Madagascar",
    "révisions BAC",
    "correction IA",
    "sujets d'examen",
    "annales BAC",
    "EdTech Madagascar",
    "Mah.AI",
    "Mobile Money",
    "MVola",
    "Orange Money",
    "Airtel Money",
    "éducation Madagascar",
  ],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://mahai.mg"
  ),
  openGraph: {
    title: "Mah.AI — Réussis tes examens avec l'IA",
    description:
      "Accède à des milliers de sujets BAC, BEPC, CEPE avec correction IA instantanée. Paiement Mobile Money, 500 Ar offerts à l'inscription.",
    type: "website",
    locale: "fr_MG",
    siteName: "Mah.AI",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Mah.AI — Plateforme éducative IA pour Madagascar",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mah.AI — Réussis tes examens avec l'IA",
    description:
      "Sujets BAC, BEPC, CEPE + correction IA instantanée. 500 Ar offerts.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${cormorant.variable} ${dmSans.variable} ${dmMono.variable}`}
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body
        className="min-h-screen bg-void text-text antialiased font-[family-name:var(--body)]"
        suppressHydrationWarning
      >
        <a href="#main-content" className="skip-link">
          Aller au contenu principal
        </a>
        <ThemeInitializer />
        <LuxuryCursor />
        <ScrollToTop />
        <ConditionalNavbar />
        <div
          id="main-content"
          tabIndex={-1}
          className="shell-main-anchor"
          suppressHydrationWarning
        >
          {children}
        </div>
        <MobileBottomNav />
      </body>
    </html>
  );
}

function ThemeInitializer() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              var theme = localStorage.getItem('theme');
              var supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches === true;
              if (!theme && supportDarkMode) theme = 'dark';
              if (!theme) theme = 'light';
              document.documentElement.setAttribute('data-theme', theme);
              document.documentElement.classList.add(theme);
            } catch (e) {}
          })();
        `,
      }}
    />
  );
}
