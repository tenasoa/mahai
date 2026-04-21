import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export default async function RoleSelectionPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  // La sélection de rôle se fait maintenant directement lors de l'inscription
  // Redirection vers le dashboard utilisateur
  redirect('/dashboard')
}
