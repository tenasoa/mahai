import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Légal | Mah.AI",
  description: "Documents légaux et politiques de Mah.AI",
}

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-bg relative selection:bg-teal/30 selection:text-white">
      {/* Mesh Background */}
      <div className="mesh-bg pointer-events-none fixed inset-0 z-0 opacity-40">
        <span />
        <span />
        <span />
      </div>

      {/* Contenu principal */}
      <main className="relative z-10 container max-w-4xl mx-auto px-6 py-24 min-h-[calc(100vh-80px)]">
        <div className="card glass p-8 md:p-12 animate-fade-in text-text">
          {children}
        </div>
      </main>
    </div>
  )
}
