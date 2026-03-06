import Nav from '@/components/layout/nav'
import Footer from '@/components/layout/footer'

// ============================================
// MAH.AI — Layout Public
// ============================================
// Layout pour les pages publiques (Landing, Pricing, etc.)
// ============================================

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen relative bg-bg">
      {/* Mesh background global */}
      <div className="mesh-bg" aria-hidden="true">
        <span /><span /><span />
      </div>

      <Nav />
      <main className="flex-grow relative z-10">
        {children}
      </main>
      <Footer />
    </div>
  )
}
