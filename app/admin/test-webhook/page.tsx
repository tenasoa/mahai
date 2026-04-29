'use client'

import { useState } from 'react'

export default function TestWebhookPage() {
  const [transactionId, setTransactionId] = useState('')
  const [amount, setAmount] = useState('5000')
  const [credits, setCredits] = useState('100')
  const [status, setStatus] = useState<'SUCCESS' | 'FAILED'>('SUCCESS')
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function createTestTransaction() {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const createRes = await fetch('/api/payment/mobile-money', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packId: 'test-pack',
          phone: '+261340000000',
          operator: 'TEST',
          amount: parseInt(amount),
          credits: parseInt(credits),
        }),
      })

      if (!createRes.ok) {
        const err = await createRes.json()
        throw new Error(err.error || 'Erreur création transaction')
      }

      const { transactionId: newTxId } = await createRes.json()
      setTransactionId(newTxId)
      setResult(`Transaction créée: ${newTxId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  async function simulateWebhook() {
    if (!transactionId) {
      setError('Créez d\'abord une transaction de test')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const webhookRes = await fetch('/api/payment/webhook', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-simulation-mode': 'true',
        },
        body: JSON.stringify({
          transactionId,
          status,
          operatorTransactionId: `TEST-${Date.now()}`,
          paidAt: new Date().toISOString(),
          phoneNumber: '+261340000000',
          failureReason: status === 'FAILED' ? 'Solde insuffisant' : undefined,
        }),
      })

      const data = await webhookRes.json()
      
      if (!webhookRes.ok) {
        throw new Error(data.error || 'Erreur webhook')
      }

      setResult(`Webhook simulé avec succès! Statut: ${data.status}${data.creditsAdded ? `, Crédits ajoutés: ${data.creditsAdded}` : ''}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Test Webhook Paiement</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Étape 1: Créer une transaction de test</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Montant (Ar)</label>
            <input 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Crédits</label>
            <input 
              type="number" 
              value={credits} 
              onChange={(e) => setCredits(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>
        
        <button 
          onClick={createTestTransaction} 
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Création...' : '1. Créer Transaction Test'}
        </button>

        {transactionId && (
          <div className="mt-4 p-3 bg-blue-50 rounded">
            Transaction ID: <code className="bg-gray-100 px-1 rounded">{transactionId}</code>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Étape 2: Simuler le webhook du provider</h2>
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setStatus('SUCCESS')}
            className={`flex-1 py-2 rounded border ${status === 'SUCCESS' ? 'bg-green-600 text-white' : 'bg-white'}`}
          >
            Paiement Réussi
          </button>
          <button
            onClick={() => setStatus('FAILED')}
            className={`flex-1 py-2 rounded border ${status === 'FAILED' ? 'bg-red-600 text-white' : 'bg-white'}`}
          >
            Paiement Échoué
          </button>
        </div>

        <button 
          onClick={simulateWebhook} 
          disabled={loading || !transactionId}
          className={`w-full py-2 rounded text-white disabled:opacity-50 ${status === 'FAILED' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
        >
          {loading ? 'Simulation...' : `2. Simuler Webhook (${status})`}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded text-green-700">
          {result}
        </div>
      )}

      <div className="bg-gray-50 rounded-lg p-6 text-sm text-gray-600">
        <h3 className="font-semibold mb-2">Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1">
          <li>Connectez-vous avec un compte utilisateur</li>
          <li>Cliquez sur &quot;Créer Transaction Test&quot; pour générer une transaction PENDING</li>
          <li>Choisissez le statut (SUCCESS ou FAILED)</li>
          <li>Cliquez sur &quot;Simuler Webhook&quot; pour tester le traitement</li>
          <li>Vérifiez dans le profil que les crédits ont été ajoutés (si SUCCESS)</li>
        </ol>
      </div>
    </div>
  )
}
