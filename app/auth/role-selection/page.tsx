import { OnboardingForm } from '@/components/auth/OnboardingForm'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export default async function OnboardingPage() {
  const supabase = await createSupabaseServerClient()

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  // Vérifier si l'utilisateur existe déjà dans Prisma (par ID ou Email)
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { id: session.user.id },
        { email: session.user.email! }
      ]
    }
  })

  // Si l'utilisateur existe et que l'ID correspond, on redirige vers le catalogue
  if (existingUser && existingUser.id === session.user.id) {
    redirect('/catalogue')
  }

  // Get user name from metadata or email
  const userName = session.user.user_metadata?.prenom || 
                   session.user.email?.split('@')[0] || 
                   'utilisateur'

  async function handleComplete() {
    'use server'
    const supabase = await createSupabaseServerClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session?.user) {
      const userEmail = session.user.email!
      
      // Vérifier s'il y a un utilisateur avec cet email mais un ID différent (conflit de seed)
      const userWithSameEmail = await prisma.user.findUnique({
        where: { email: userEmail }
      })

      if (userWithSameEmail && userWithSameEmail.id !== session.user.id) {
        // Supprimer l'ancien utilisateur (probablement issu du seed) pour éviter le conflit d'email
        // On ne le fait que si l'ID ne correspond pas
        await prisma.user.delete({
          where: { id: userWithSameEmail.id }
        })
      }

      // Maintenant on peut créer/mettre à jour l'utilisateur avec le bon ID Supabase
      await prisma.user.upsert({
        where: { id: session.user.id },
        update: {},
        create: {
          id: session.user.id,
          email: userEmail,
          prenom: session.user.user_metadata?.prenom || userEmail.split('@')[0] || 'Utilisateur',
          nom: session.user.user_metadata?.nom || '',
          role: 'ETUDIANT',
          credits: 10,
        }
      })
    }
    redirect('/catalogue')
  }

  async function handleSkip() {
    'use server'
    redirect('/catalogue')
  }

  return (
    <div className="onboarding-page" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: '1.5rem',
      position: 'relative',
      overflowY: 'auto',
      overflowX: 'hidden',
    }}>
      {/* Background noise texture */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
      }} />

      {/* Background Orbs */}
      <div className="bg-orb orb1" style={{
        position: 'fixed',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        filter: 'blur(80px)',
        pointerEvents: 'none',
        zIndex: 0,
        background: 'radial-gradient(circle, rgba(201,168,76,0.07), transparent 70%)',
        top: '-100px',
        right: '-100px',
      }} />
      <div className="bg-orb orb2" style={{
        position: 'fixed',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        filter: 'blur(80px)',
        pointerEvents: 'none',
        zIndex: 0,
        background: 'radial-gradient(circle, rgba(74,107,90,0.06), transparent 70%)',
        bottom: '-80px',
        left: '-80px',
      }} />

      {/* Main Content */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        minHeight: '100vh',
      }}>
        <OnboardingForm 
          userName={userName}
          onComplete={handleComplete}
          onSkip={handleSkip}
        />
      </div>
    </div>
  )
}
