'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

// Custom user data from our database
export interface AppUser {
  id: string
  email: string
  prenom: string
  nom?: string
  role: string
  credits: number
  phone?: string
  phoneVerified: boolean
  schoolLevel?: string
  emailVerified: boolean
}

export function useAuth() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [appUser, setAppUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | undefined>(undefined)

  // Fonction pour récupérer les données utilisateur depuis la DB
  const fetchAppUser = async (uid: string) => {
    try {
      const { getUserData } = await import('@/actions/auth')
      const data = await getUserData(uid)
      setAppUser(data)
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  useEffect(() => {
    const supabase = createClient()

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      const uid = session?.user?.id
      setUserId(uid)
      if (uid) {
        fetchAppUser(uid)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      const uid = session?.user?.id
      setUserId(uid)
      if (uid) {
        fetchAppUser(uid)
      } else {
        setAppUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, appUser, setAppUser, userId, loading, isAuthenticated: !!user }
}
