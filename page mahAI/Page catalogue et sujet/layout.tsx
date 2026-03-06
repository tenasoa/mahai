// app/layout.tsx - Layout racine de l'application

import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mah.AI - Plateforme EdTech Madagascar',
  description: 'Préparez vos examens avec des sujets officiels et des corrections IA',
  keywords: ['Madagascar', 'éducation', 'examens', 'BAC', 'BEPC', 'CEPE', 'IA'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="fr">
        <body>
          {/* Mesh gradient background */}
          <div className="mesh">
            <span />
            <span />
          </div>

          {/* Contenu principal */}
          <div className="relative z-10">
            {children}
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
