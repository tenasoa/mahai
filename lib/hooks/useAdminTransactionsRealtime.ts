'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface UseAdminTransactionsRealtimeProps {
  enabled: boolean
}

export function useAdminTransactionsRealtime({ enabled }: UseAdminTransactionsRealtimeProps) {
  const [pendingCount, setPendingCount] = useState(0)
  const [lastTransaction, setLastTransaction] = useState<any>(null)

  const handleTransactionChange = useCallback((payload: any) => {
    console.log('🔔 Admin - Changement transaction:', payload)
    
    if (payload.eventType === 'INSERT') {
      setLastTransaction(payload.new)
      // Incrémenter le compteur
      setPendingCount(prev => prev + 1)
    } else if (payload.eventType === 'UPDATE') {
      // Si une transaction est mise à jour, on pourrait décrémenter si elle n'est plus PENDING
      // Mais pour simplifier, on va juste recharger le compteur depuis le backend
    }
  }, [])

  useEffect(() => {
    if (!enabled) return

    const supabase = createClient()
    
    // S'abonner aux changements sur la table CreditTransaction
    const channel = supabase
      .channel('admin-transactions-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'CreditTransaction',
          filter: 'status=eq.PENDING'
        },
        handleTransactionChange
      )
      .subscribe()

    // Charger le compteur initial
    const loadPendingCount = async () => {
      try {
        const { getPendingTransactionsCount } = await import('@/actions/admin/credits')
        const count = await getPendingTransactionsCount()
        setPendingCount(count)
      } catch (error) {
        console.error('Erreur chargement compteur transactions:', error)
      }
    }

    loadPendingCount()

    // Nettoyage à la fin du cycle de vie
    return () => {
      supabase.removeChannel(channel)
    }
  }, [enabled, handleTransactionChange])

  // Réinitialiser le compteur
  const resetCount = useCallback(() => {
    setPendingCount(0)
  }, [])

  return {
    pendingCount,
    lastTransaction,
    resetCount
  }
}
