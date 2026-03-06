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
    <div className="flex flex-col min-h-screen">
      <Nav />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  )
}
