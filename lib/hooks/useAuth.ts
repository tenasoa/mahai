'use client'

import { useEffect, useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

// Custom user data from our database
export interface AppUser {
  id: string
  email: string
  prenom: string
  nom?: string
  nomComplet?: string
  pseudo?: string
  role: string
  credits: number
  phone?: string
  phoneVerified: boolean
  schoolLevel?: string
  educationLevel?: string
  gradeLevel?: string
  region?: string
  district?: string
  bio?: string
  createdAt?: string
  emailVerified: boolean
  profilePicture?: string | null
  // Profil étendu
  userType?: string
  customUserType?: string
  birthDate?: string
  etablissement?: string
  filiere?: string
  matieresPreferees?: string[]
  objectifsEtude?: string[]
  profilePublic?: boolean
  showEmail?: boolean
  showPhone?: boolean
  showEtablissement?: boolean
  // Préférences de paiement
  defaultOperator?: string
  // Paramètres sécurité
  securityTwoFactorEnabled?: boolean
  securityLoginAlertEnabled?: boolean
  securityUnknownDeviceBlock?: boolean
  securityRecoveryEmailEnabled?: boolean
  securitySessionTimeoutMinutes?: number
  securitySettingsUpdatedAt?: string
}

export function useAuth() {
  const pathname = usePathname()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [appUser, setAppUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  // Fonction pour récupérer les données utilisateur depuis la DB
  const fetchAppUser = useCallback(async (uid: string) => {
    try {
      const { getCurrentUserData } = await import('@/actions/auth')
      const data = await getCurrentUserData()
      setAppUser(data)
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }, [])

  useEffect(() => {
    const supabase = createClient()
    let isMounted = true

    const syncSession = async () => {
      // getUser() fait un appel réseau qui re-lit les cookies fraîchement
      // définis par une Server Action (login/logout). getSession() renvoie
      // un cache en mémoire qui peut être obsolète après un login server-side.
      const { data: { user: freshUser } } = await supabase.auth.getUser()
      if (!isMounted) return

      const uid = freshUser?.id ?? null

      setUser(freshUser ?? null)
      setUserId(uid)

      if (uid) {
        await fetchAppUser(uid)
      } else {
        setAppUser(null)
      }
      setLoading(false)
    }

    syncSession()

    // Listen for auth changes (côté client uniquement — login/logout client-side)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return

      const currentUser = session?.user ?? null
      setUser(currentUser)
      const uid = session?.user?.id ?? null
      setUserId(uid)

      if (uid) {
        fetchAppUser(uid)
      } else {
        setAppUser(null)
      }
      setLoading(false)
    })

    // Re-synchroniser quand l'onglet reprend le focus (ex: après login
    // server-side, changement de compte dans un autre onglet, etc.)
    const handleFocus = () => {
      if (isMounted) syncSession()
    }
    const handleVisibility = () => {
      if (!document.hidden && isMounted) syncSession()
    }
    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      isMounted = false
      subscription.unsubscribe()
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [fetchAppUser, pathname])

  return { user, appUser, setAppUser, userId, loading, isAuthenticated: !!user }
}
