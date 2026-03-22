'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface UseTransactionsRealtimeProps {
  userId?: string
  enabled: boolean
}

export function useTransactionsRealtime({ userId, enabled }: UseTransactionsRealtimeProps) {
  const [newTransactionCount, setNewTransactionCount] = useState(0)
  const [lastTransaction, setLastTransaction] = useState<any>(null)

  const handleNewTransaction = useCallback((payload: any) => {
    console.log('🔔 Nouvelle transaction en temps réel:', payload)
    
    // Vérifier que la transaction appartient à l'utilisateur actuel
    if (payload.new?.userId === userId) {
      setNewTransactionCount(prev => prev + 1)
      setLastTransaction(payload.new)
      
      // Notification sonore (optionnel, à activer si besoin)
      // const audio = new Audio('/notification.mp3')
      // audio.play().catch(() => {})
    }
  }, [userId])

  useEffect(() => {
    if (!enabled || !userId) return

    const supabase = createClient()
    
    // S'abonner aux changements sur la table CreditTransaction
    const channel = supabase
      .channel('transactions-realtime')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'CreditTransaction',
          filter: `userId=eq.${userId}`
        },
        handleNewTransaction
      )
      .subscribe()

    // Nettoyage à la fin du cycle de vie
    return () => {
      supabase.removeChannel(channel)
    }
  }, [enabled, userId, handleNewTransaction])

  // Réinitialiser le compteur quand on charge de nouvelles transactions
  const resetCount = useCallback(() => {
    setNewTransactionCount(0)
  }, [])

  return {
    newTransactionCount,
    lastTransaction,
    resetCount
  }
}
