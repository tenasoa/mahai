import type { Metadata } from 'next'
import { Bricolage_Grotesque, DM_Mono } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { clerkAppearance } from '@/lib/auth/clerk-theme'
import './globals.css'

// ── POLICES ─────────────────────────────────────────────────
const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  weight: ['300', '400', '500', '700', '800'],
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-dm-mono',
  weight: ['300', '400', '500'],
})

// ── METADATA ────────────────────────────────────────────────
export const metadata: Metadata = {
  title: 'Mah.AI — Plateforme d\'examens pour Madagascar',
  description: 'Sujets d\'examens nationaux (BAC, BEPC, CEPE) + Corrections IA + Examens blancs. La référence pour réussir à Madagascar 🇲🇬',
  keywords: ['BAC', 'BEPC', 'CEPE', 'Madagascar', 'Examens', 'Corrections', 'IA', 'Révisions'],
  authors: [{ name: 'Mah.AI Team' }],
  creator: 'Mah.AI',
  openGraph: {
    type: 'website',
    locale: 'fr_MG',
    url: 'https://mah-ai.mg',
    title: 'Mah.AI — Réussis tes examens avec l\'IA',
    description: 'Sujets d\'examens nationaux + Corrections IA + Examens blancs',
    siteName: 'Mah.AI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Mah.AI — Plateforme d\'examens pour Madagascar',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mah.AI — Réussis tes examens avec l\'IA',
    description: 'Sujets d\'examens nationaux + Corrections IA + Examens blancs',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

// ── ROOT LAYOUT ─────────────────────────────────────────────
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider appearance={clerkAppearance}>
      <html lang="fr" className={`${bricolage.variable} ${dmMono.variable}`}>
        <body className="min-h-screen bg-bg text-text antialiased">
          {/* Mesh background */}
          <div className="mesh-bg" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          
          {/* Contenu principal */}
          <main className="relative z-10 font-sans">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  )
}
