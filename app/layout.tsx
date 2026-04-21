import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit, DM_Mono } from "next/font/google";
import "./globals.css";
import { LuxuryCursor } from "@/components/layout/LuxuryCursor";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { ConditionalNavbar } from "@/components/layout/ConditionalNavbar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--display",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--body",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--mono",
});

export const metadata: Metadata = {
  title: "Mah.AI — Réussis tes examens avec l'IA",
  description:
    "La plateforme EdTech made in Madagascar. Accède aux sujets BAC, BEPC, CEPE avec des corrections IA et des professeurs certifiés.",
  keywords: [
    "BAC Madagascar",
    "BEPC",
    "CEPE",
    "examens",
    "révisions",
    "IA",
    "EdTech",
  ],
  openGraph: {
    title: "Mah.AI — Réussis tes examens avec l'IA",
    description:
      "La plateforme EdTech made in Madagascar. Corrections IA, professeurs certifiés, examens blancs.",
    type: "website",
    locale: "fr_MG",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mah.AI — Réussis tes examens avec l'IA",
    description: "La plateforme EdTech made in Madagascar.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`${cormorant.variable} ${outfit.variable} ${dmMono.variable} min-h-screen bg-void text-text antialiased font-[family-name:var(--body)]`}
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